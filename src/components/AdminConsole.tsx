import React, { useState, useEffect, useRef, useCallback } from "react";
import { Photo, Post, AdminStats } from "../types";
import {
  addPhotoToDB, addPostToDB, deletePhotoFromDB, deletePostFromDB,
  updatePhotoInDB, updatePostInDB, AppInsights, savePhotoOrderInDB,
  getPhotoViewCounts, uploadImagesToImgBB
} from "../dbHelper";
import SpiralLoader from "./SpiralLoader";
import { compressImage, formatBytes } from "../utils/compressor";
import ImageEditor from "./ImageEditor";
import AyuVibeeLogo from "./AyuVibeeLogo";
import { auth } from "../firebase";

interface AdminConsoleProps {
  photos: Photo[];
  posts: Post[];
  insights?: AppInsights | null;
  onRefreshData: () => void;
  onLogout: () => void;
}

type Tab = "overview" | "photos" | "blogs" | "video" | "settings";
type Toast = { id: number; type: "success" | "error" | "info"; message: string };

export default function AdminConsole({ photos, posts, insights, onRefreshData, onLogout }: AdminConsoleProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  // ── Clock ──────────────────────────────────────────────────────────────────
  const [currentTime, setCurrentTime] = useState("");
  useEffect(() => {
    const update = () => setCurrentTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " IST");
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Photo view counts ───────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === "photos") {
      getPhotoViewCounts().then(setViewCounts);
    }
  }, [activeTab]);

  // ── Toasts ─────────────────────────────────────────────────────────────────
  const toast = useCallback((type: Toast["type"], message: string) => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // ── Image Editor ───────────────────────────────────────────────────────────
  const [editorImage, setEditorImage] = useState<string | null>(null);
  const [editorSource, setEditorSource] = useState<"new" | "edit" | null>(null);

  // ── Photo Upload Form ──────────────────────────────────────────────────────
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoCategory, setPhotoCategory] = useState("Architecture");
  const [photoLocation, setPhotoLocation] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoTags, setPhotoTags] = useState("");
  const [photoUrlsList, setPhotoUrlsList] = useState<string[]>([]);
  const [newUrlInput, setNewUrlInput] = useState("");
  const [compressing, setCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<{ orig: number; comp: number; ratio: number } | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [imageAnalyzing, setImageAnalyzing] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // ── Library ────────────────────────────────────────────────────────────────
  const [libraryView, setLibraryView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Edit Photo form
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("Architecture");
  const [editLocation, setEditLocation] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editUrlsList, setEditUrlsList] = useState<string[]>([]);
  const [editNewUrl, setEditNewUrl] = useState("");
  const [editImageSource, setEditImageSource] = useState<"url" | "file">("url");
  const [editBase64, setEditBase64] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editAnalyzing, setEditAnalyzing] = useState(false);

  // ── Blogs ──────────────────────────────────────────────────────────────────
  const [postTitle, setPostTitle] = useState("");
  const [postCategory, setPostCategory] = useState("");
  const [postCover, setPostCover] = useState("");
  const [postContent, setPostContent] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [publishingPost, setPublishingPost] = useState(false);
  const [storyAnalyzing, setStoryAnalyzing] = useState(false);
  const [blogTab, setBlogTab] = useState<"list" | "editor">("list");

  // ── Video AI ───────────────────────────────────────────────────────────────
  const [videoBase64, setVideoBase64] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoMime, setVideoMime] = useState("video/mp4");
  const [videoAnalyzing, setVideoAnalyzing] = useState(false);
  const [videoResult, setVideoResult] = useState("");

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalBytes = photos.reduce((acc, p) => {
    if (p.imageUrl?.startsWith("data:")) return acc + (p.imageUrl.length * 0.75);
    return acc + 124000;
  }, 0) + posts.reduce((acc, p) => acc + (p.content?.length || 0), 0);
  const storagePct = Math.max(1, Math.min(100, Math.round((totalBytes / (10 * 1024 * 1024)) * 100)));
  const userEmail = auth.currentUser?.email || "";
  const userName = auth.currentUser?.displayName || "Admin";
  const userPhoto = auth.currentUser?.photoURL || "";

  // ─────────────────────────────────────────────────────────────────────────
  // IMAGE COMPRESSION HELPERS
  // ─────────────────────────────────────────────────────────────────────────
  const compressFiles = async (files: File[]): Promise<string[]> => {
    setCompressing(true);
    try {
      const results = await Promise.all(files.map(f => compressImage(f, 1000, 1000, 0.75)));
      const totalOrig = results.reduce((a, r) => a + r.originalSize, 0);
      const totalComp = results.reduce((a, r) => a + r.compressedSize, 0);
      const ratio = Math.max(0, Math.round(((totalOrig - totalComp) / totalOrig) * 100));
      setCompressionStats({ orig: totalOrig, comp: totalComp, ratio });
      toast("info", `Compressed ${files.length} file${files.length > 1 ? "s" : ""}. Saved ${ratio}% (${formatBytes(totalOrig)} → ${formatBytes(totalComp)})`);
      return results.map(r => r.base64);
    } finally {
      setCompressing(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // DRAG & DROP
  // ─────────────────────────────────────────────────────────────────────────
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (!files.length) return;
    const base64s = await compressFiles(files);
    setPhotoUrlsList(prev => [...prev, ...base64s]);
  }, []);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDraggingOver(true); };
  const handleDragLeave = () => setIsDraggingOver(false);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const base64s = await compressFiles(files);
    setPhotoUrlsList(prev => [...prev, ...base64s]);
    e.target.value = "";
  };

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLISH PHOTO
  // ─────────────────────────────────────────────────────────────────────────
  const handlePublishPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    const list = photoUrlsList.filter(Boolean);
    if (!list.length || !photoTitle.trim()) {
      toast("error", "Provide at least one image and a title.");
      return;
    }
    setPublishing(true);
    try {
      const uploadedUrls = await uploadImagesToImgBB(list);
      if (uploadedUrls.some((url) => !url || url.startsWith("data:image"))) {
        throw new Error("Image upload failed: invalid image URL returned from ImgBB.");
      }
      await addPhotoToDB({
        title: photoTitle.trim(),
        category: photoCategory,
        location: photoLocation || "Kolkata, India",
        caption: photoCaption || "A curated perspective.",
        imageUrl: uploadedUrls[0],
        imageUrls: uploadedUrls,
        createdAt: Date.now(),
        analyzedDescription: photoCaption.slice(0, 200),
        tags: photoTags ? photoTags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean) : [],
        position: photos.length,
      });
      toast("success", `"${photoTitle}" published to gallery!`);
      setPhotoTitle(""); setPhotoCategory("Architecture"); setPhotoLocation("");
      setPhotoCaption(""); setPhotoTags(""); setPhotoUrlsList([]); setCompressionStats(null);
      onRefreshData();
    } catch (err: any) {
      toast("error", "Publish failed: " + err.message);
    } finally {
      setPublishing(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // GEMINI ANALYZE
  // ─────────────────────────────────────────────────────────────────────────
  const handleAnalyzeImage = async (imageData: string, mime: string, onResult: (text: string) => void, setLoading: (b: boolean) => void) => {
    if (!imageData) { toast("error", "Load an image first."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData, mimeType: mime }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      onResult(data.analysis);
      toast("success", "Gemini analyzed the image.");
    } catch (err: any) {
      toast("error", "Analysis failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // LIBRARY – SELECTION & BULK DELETE
  // ─────────────────────────────────────────────────────────────────────────
  const filteredPhotos = photos.filter(p =>
    !searchQuery || p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const ids = filteredPhotos.filter(p => p.id).map(p => p.id!);
    setSelectedIds(new Set(ids));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = async () => {
    if (!selectedIds.size) return;
    if (!confirm(`Delete ${selectedIds.size} photo${selectedIds.size > 1 ? "s" : ""}? This cannot be undone.`)) return;
    setBulkDeleting(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => deletePhotoFromDB(id)));
      toast("success", `Deleted ${selectedIds.size} photo${selectedIds.size > 1 ? "s" : ""}.`);
      clearSelection();
      onRefreshData();
    } catch (err: any) {
      toast("error", "Bulk delete failed: " + err.message);
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!confirm("Delete this photo? This cannot be undone.")) return;
    try {
      await deletePhotoFromDB(id);
      toast("success", "Photo deleted.");
      onRefreshData();
    } catch (err: any) {
      toast("error", "Delete failed: " + err.message);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // EDIT PHOTO
  // ─────────────────────────────────────────────────────────────────────────
  const openEditPhoto = (photo: Photo) => {
    setEditingPhoto(photo);
    setEditTitle(photo.title || "");
    setEditCategory(photo.category || "Architecture");
    setEditLocation(photo.location || "");
    setEditCaption(photo.caption || "");
    setEditTags(photo.tags?.join(", ") || "");
    const isBase64 = photo.imageUrl?.startsWith("data:");
    setEditImageSource(isBase64 ? "file" : "url");
    setEditBase64(isBase64 ? photo.imageUrl || "" : "");
    setEditUrlsList(photo.imageUrls?.length ? photo.imageUrls : [photo.imageUrl].filter(Boolean) as string[]);
    setEditNewUrl("");
  };

  const handleEditFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const results = await compressFiles([file]);
    if (results[0]) {
      setEditBase64(results[0]);
      setEditImageSource("file");
      setEditUrlsList(prev => {
        const next = [...prev];
        if (!next.includes(results[0])) next.unshift(results[0]);
        return next;
      });
    }
    e.target.value = "";
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;
    const list = editUrlsList.filter(Boolean);
    if (!list.length || !editTitle.trim()) {
      toast("error", "Title and at least one image are required.");
      return;
    }
    setSavingEdit(true);
    try {
      const uploadedUrls = await uploadImagesToImgBB(list);
      if (uploadedUrls.some((url) => !url || url.startsWith("data:image"))) {
        throw new Error("Image upload failed: invalid image URL returned from ImgBB.");
      }
      await updatePhotoInDB(editingPhoto.id!, {
        title: editTitle.trim(),
        category: editCategory,
        location: editLocation || "Kolkata, India",
        caption: editCaption || "A curated perspective.",
        imageUrl: uploadedUrls[0],
        imageUrls: uploadedUrls,
        analyzedDescription: editCaption.slice(0, 200),
        tags: editTags ? editTags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean) : [],
      });
      toast("success", `"${editTitle}" updated.`);
      setEditingPhoto(null);
      onRefreshData();
    } catch (err: any) {
      toast("error", "Save failed: " + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  // ── Drag reorder in list view ──────────────────────────────────────────────
  const handleRowDragStart = (e: React.DragEvent, i: number) => {
    setDraggedIndex(i);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleRowDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === i) return;
  };
  const handleRowDrop = async (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIdx) return;
    const reordered = [...photos];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIdx, 0, moved);
    const orders = reordered.filter(p => p.id).map((p, i) => ({ id: p.id!, position: i }));
    setDraggedIndex(null);
    try {
      await savePhotoOrderInDB(orders);
      toast("success", "Order saved.");
      onRefreshData();
    } catch (err: any) {
      toast("error", "Failed to save order.");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // BLOG CRUD
  // ─────────────────────────────────────────────────────────────────────────
  const resetBlogForm = () => {
    setPostTitle(""); setPostCategory(""); setPostCover(""); setPostContent("");
    setEditingPostId(null);
  };

  const startEditPost = (post: Post) => {
    setEditingPostId(post.id || null);
    setPostTitle(post.title || "");
    setPostCategory(post.category || "");
    setPostCover(post.coverImage || "");
    setPostContent(post.content || "");
    setBlogTab("editor");
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    try {
      await deletePostFromDB(id);
      toast("success", "Blog post deleted.");
      onRefreshData();
    } catch (err: any) {
      toast("error", "Delete failed: " + err.message);
    }
  };

  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      toast("error", "Title and content are required.");
      return;
    }
    setPublishingPost(true);
    try {
      if (editingPostId) {
        await updatePostInDB(editingPostId, {
          title: postTitle.trim(), content: postContent,
          category: postCategory || "Urban Monographs",
          coverImage: postCover || "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=800"
        });
        toast("success", `"${postTitle}" updated.`);
        setEditingPostId(null);
      } else {
        await addPostToDB({
          title: postTitle.trim(), content: postContent,
          category: postCategory || "Urban Monographs",
          coverImage: postCover || "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=800",
          createdAt: Date.now(),
          analyzedThemes: ["Editorial", "Geometry", "Structural Analysis"],
        });
        toast("success", `"${postTitle}" published!`);
      }
      resetBlogForm();
      setBlogTab("list");
      onRefreshData();
    } catch (err: any) {
      toast("error", "Publish failed: " + err.message);
    } finally {
      setPublishingPost(false);
    }
  };

  const handleStoryAnalysis = async () => {
    if (!postContent.trim()) { toast("error", "Write some content first."); return; }
    setStoryAnalyzing(true);
    try {
      const res = await fetch("/api/analyze-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video: "N/A", mimeType: "text/plain",
          prompt: `Analyze this story and suggest 3 key theme tags and a 2-sentence curator summary:\n\n${postContent}`
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPostContent(prev => prev + `\n\n---\n**Gemini Themes Audit:**\n${data.analysis}`);
      toast("success", "Themes analyzed and appended.");
    } catch (err: any) {
      toast("error", "Analysis failed: " + err.message);
    } finally {
      setStoryAnalyzing(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // VIDEO AI
  // ─────────────────────────────────────────────────────────────────────────
  const handleVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoMime(file.type);
    const reader = new FileReader();
    reader.onloadend = () => setVideoBase64(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleVideoAnalyze = async () => {
    if (!videoBase64 && !videoUrl) { toast("error", "Load a video first."); return; }
    setVideoAnalyzing(true); setVideoResult("");
    try {
      const res = await fetch("/api/analyze-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video: videoBase64 || videoUrl, mimeType: videoMime,
          prompt: "Audit this video cinematically: 1) Frame timing & camera tracking, 2) Color grading & temperature, 3) Symbolic depth. Museum-level precision."
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setVideoResult(data.analysis);
      toast("success", "Video analyzed.");
    } catch (err: any) {
      toast("error", "Analysis failed: " + err.message);
    } finally {
      setVideoAnalyzing(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER HELPERS
  // ─────────────────────────────────────────────────────────────────────────
  const previewImage = photoUrlsList[0] || "";

  const tabConfig: { id: Tab; label: string; icon: string; badge?: number }[] = [
    { id: "overview", label: "Dashboard", icon: "dashboard" },
    { id: "photos", label: "Photos", icon: "photo_library", badge: photos.length },
    { id: "blogs", label: "Blogs", icon: "article", badge: posts.length },
    { id: "video", label: "Video AI", icon: "movie_filter" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // IMAGE EDITOR CALLBACK
  // ─────────────────────────────────────────────────────────────────────────
  if (editorImage) {
    return (
      <ImageEditor
        imageUrl={editorImage}
        onSave={(newBase64: string) => {
          if (editorSource === "new") {
            setPhotoUrlsList(prev => {
              if (prev.length === 0) return [newBase64];
              const next = [...prev];
              next[0] = newBase64;
              return next;
            });
          } else if (editorSource === "edit") {
            setEditBase64(newBase64);
            setEditImageSource("file");
            setEditUrlsList(prev => {
              const next = [...prev];
              if (next.length > 0) next[0] = newBase64;
              else next.push(newBase64);
              return next;
            });
          }
          setEditorImage(null);
          setEditorSource(null);
        }}
        onClose={() => { setEditorImage(null); setEditorSource(null); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ed] flex flex-col">

      {/* ── Toast Stack ───────────────────────────────────────────────────── */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto px-4 py-3 border font-mono text-[10px] uppercase tracking-widest max-w-xs shadow-lg transition-all duration-300 ${
              t.type === "success" ? "bg-emerald-50 border-emerald-300 text-emerald-800"
              : t.type === "error" ? "bg-red-50 border-red-300 text-red-800"
              : "bg-amber-50 border-amber-300 text-amber-800"
            }`}
          >
            <span className="mr-2">{t.type === "success" ? "✓" : t.type === "error" ? "✗" : "●"}</span>
            {t.message}
          </div>
        ))}
      </div>

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-[#e5e1d8] px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <AyuVibeeLogo size="sm" theme="dark" />
          <div className="hidden md:block h-5 w-px bg-[#e5e1d8]"></div>
          <span className="hidden md:block font-mono text-[9px] tracking-widest text-[#8b8780] uppercase">Admin Console</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:block font-mono text-[9px] text-[#8b8780]">{currentTime}</span>
          {userPhoto && (
            <img src={userPhoto} alt={userName} className="w-7 h-7 rounded-full border border-[#e5e1d8]" />
          )}
          <div className="hidden md:block text-right">
            <p className="font-sans text-xs font-medium text-[#1a1a1a]">{userName}</p>
            <p className="font-mono text-[8px] text-[#8b8780]">{userEmail}</p>
          </div>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 border border-[#e5e1d8] hover:border-red-400 hover:text-red-600 font-mono text-[9px] uppercase tracking-wider text-[#8b8780] transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside className="hidden md:flex flex-col w-52 bg-white border-r border-[#e5e1d8] py-6 gap-1 flex-shrink-0">
          {tabConfig.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-5 py-3 text-left transition-colors cursor-pointer group ${
                activeTab === tab.id
                  ? "bg-[#1a1a1a] text-white"
                  : "text-[#5f5e59] hover:bg-[#f7f4ed] hover:text-[#1a1a1a]"
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${activeTab === tab.id ? "text-white" : "text-[#8b8780] group-hover:text-black"}`}>
                {tab.icon}
              </span>
              <span className="font-mono text-[10px] tracking-wider uppercase flex-1">{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`font-mono text-[8px] px-1.5 py-0.5 ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-[#e5e1d8] text-[#5f5e59]"}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </aside>

        {/* ── Mobile tab bar ──────────────────────────────────────────────── */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e5e1d8] flex">
          {tabConfig.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 cursor-pointer transition-colors ${
                activeTab === tab.id ? "text-black" : "text-[#8b8780]"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span className="font-mono text-[7px] uppercase tracking-wide">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Main ────────────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 pb-20 md:pb-8">

          {/* ═══════════════════════════════════════════════════════════════
              TAB: DASHBOARD
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div className="space-y-8 max-w-4xl">
              <div>
                <h1 className="font-serif text-2xl font-bold text-black">Good to see you, {userName.split(" ")[0]}.</h1>
                <p className="font-mono text-[9px] text-[#8b8780] uppercase tracking-wider mt-1">Your curator dashboard — live as of {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Photos", value: photos.length, icon: "photo_library", color: "text-amber-600" },
                  { label: "Blog Posts", value: posts.length, icon: "article", color: "text-blue-600" },
                  { label: "Page Views", value: (insights?.retinalEncounters || 0).toLocaleString(), icon: "visibility", color: "text-emerald-600" },
                  { label: "Storage", value: `${storagePct}%`, icon: "storage", color: storagePct > 80 ? "text-red-500" : "text-purple-600" },
                ].map(s => (
                  <div key={s.label} className="bg-white border border-[#e5e1d8] p-5">
                    <div className="flex items-start justify-between">
                      <span className={`material-symbols-outlined text-2xl ${s.color}`}>{s.icon}</span>
                    </div>
                    <div className="mt-3">
                      <p className="font-serif text-2xl font-bold text-black">{s.value}</p>
                      <p className="font-mono text-[9px] text-[#8b8780] uppercase tracking-wider mt-0.5">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Storage bar */}
              <div className="bg-white border border-[#e5e1d8] p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#5f5e59]">Firestore Storage Usage</span>
                  <span className="font-mono text-[10px] font-bold text-black">{formatBytes(totalBytes)} / 10 MB</span>
                </div>
                <div className="w-full bg-[#e5e1d8] h-2">
                  <div
                    className={`h-full transition-all duration-700 ${storagePct > 80 ? "bg-red-500" : storagePct > 60 ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${storagePct}%` }}
                  />
                </div>
                <p className="font-mono text-[8px] text-[#8b8780] uppercase">
                  Images are compressed with canvas-based JPEG optimization + automatic watermarking before storage.
                </p>
              </div>

              {/* Analytics */}
              {insights && (
                <div className="bg-white border border-[#e5e1d8] p-5 space-y-4">
                  <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#5f5e59] border-b border-[#e5e1d8] pb-3">Analytics Breakdown</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Portfolio views", value: insights.portfolioViews },
                      { label: "Story views", value: insights.storyViews },
                      { label: "About views", value: insights.aboutViews },
                      { label: "Admin views", value: insights.adminViews },
                    ].map(m => (
                      <div key={m.label}>
                        <p className="font-serif text-lg font-bold text-black">{m.value.toLocaleString()}</p>
                        <p className="font-mono text-[8px] text-[#8b8780] uppercase tracking-wider">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Upload Photos", desc: "Add new images to gallery", icon: "add_a_photo", tab: "photos" as Tab },
                  { label: "Write a Blog", desc: "Create a new editorial post", icon: "edit_note", tab: "blogs" as Tab },
                  { label: "Video Analysis", desc: "Analyze a video with Gemini", icon: "movie_filter", tab: "video" as Tab },
                ].map(a => (
                  <button
                    key={a.label}
                    onClick={() => { setActiveTab(a.tab); if (a.tab === "blogs") setBlogTab("editor"); }}
                    className="bg-white border border-[#e5e1d8] p-5 text-left hover:border-black transition-all duration-150 group cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-2xl text-[#8b8780] group-hover:text-black transition-colors">{a.icon}</span>
                    <p className="font-mono text-[11px] uppercase tracking-wider font-bold text-black mt-3">{a.label}</p>
                    <p className="font-sans text-xs text-[#8b8780] mt-0.5">{a.desc}</p>
                  </button>
                ))}
              </div>

              {/* Recent photos */}
              {photos.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#5f5e59]">Recent Photos</h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {photos.slice(0, 6).map((p, i) => (
                      <div key={p.id || i} className="relative group aspect-square overflow-hidden border border-[#e5e1d8]">
                        <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button onClick={() => openEditPhoto(p)} className="text-white cursor-pointer">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB: PHOTOS
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "photos" && (
            <div className="space-y-8 max-w-5xl">
              {/* Sub-nav */}
              <div className="flex items-center gap-1 border-b border-[#e5e1d8]">
                {(["upload", "library"] as const).map(sub => (
                  <button
                    key={sub}
                    onClick={() => { /* handled by internal state below */ }}
                    className={`px-4 py-2.5 font-mono text-[9px] uppercase tracking-widest border-b-2 -mb-px transition-colors cursor-default`}
                  >
                    {sub === "upload" ? "Upload" : `Library (${photos.length})`}
                  </button>
                ))}
              </div>

              {/* ── Upload Section ── */}
              <section className="space-y-6">
                <h2 className="font-serif text-xl font-bold text-black">Upload Photos</h2>

                {/* Drag & drop zone */}
                <div
                  ref={dropRef}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-none transition-all duration-150 p-10 text-center cursor-pointer ${
                    isDraggingOver
                      ? "border-black bg-neutral-100 scale-[1.01]"
                      : "border-[#d5d0c8] hover:border-black bg-white"
                  }`}
                  onClick={() => document.getElementById("bulkFileInput")?.click()}
                >
                  {compressing ? (
                    <div className="flex flex-col items-center gap-3">
                      <SpiralLoader size={60} showText={false} />
                      <p className="font-mono text-[10px] uppercase tracking-widest text-[#8b8780] animate-pulse">Compressing & Watermarking...</p>
                    </div>
                  ) : photoUrlsList.length > 0 ? (
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-3xl text-emerald-500">check_circle</span>
                      <p className="font-mono text-[11px] uppercase tracking-widest text-black font-bold">{photoUrlsList.length} image{photoUrlsList.length > 1 ? "s" : ""} ready</p>
                      <p className="font-mono text-[9px] text-[#8b8780] uppercase">Drop more or click to add</p>
                      {compressionStats && (
                        <div className="mt-2 bg-emerald-50 border border-emerald-200 px-4 py-2 font-mono text-[9px] text-emerald-700 uppercase tracking-wider">
                          ⚡ Saved {compressionStats.ratio}% — {formatBytes(compressionStats.orig)} → {formatBytes(compressionStats.comp)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-4xl text-[#c5c0b8]">cloud_upload</span>
                      <p className="font-mono text-[11px] uppercase tracking-widest text-[#5f5e59] font-bold">
                        {isDraggingOver ? "Release to upload" : "Drag & drop images here"}
                      </p>
                      <p className="font-mono text-[9px] text-[#8b8780] uppercase">or click to browse — supports single or bulk selection</p>
                      <p className="font-mono text-[8px] text-[#8b8780] uppercase mt-1">Auto-compressed · Watermarked · Stored in Firestore</p>
                    </div>
                  )}
                  <input id="bulkFileInput" type="file" multiple accept="image/*" className="hidden" onChange={handleFileInput} />
                </div>

                {/* Image previews strip */}
                {photoUrlsList.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] text-[#5f5e59] uppercase tracking-wider">Preview ({photoUrlsList.length} images) — first = cover</span>
                      <button onClick={() => { setPhotoUrlsList([]); setCompressionStats(null); }} className="font-mono text-[8px] text-red-500 hover:text-red-700 uppercase tracking-wider cursor-pointer">
                        Clear all
                      </button>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {photoUrlsList.map((url, i) => (
                        <div key={i} className="relative w-24 h-20 flex-shrink-0 border border-[#e5e1d8] group overflow-hidden bg-white">
                          <img src={url} alt={`img-${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute top-1 left-1 bg-black text-white text-[7px] font-mono px-1 leading-tight">
                            {i === 0 ? "COVER" : `#${i + 1}`}
                          </div>
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => { setEditorImage(url); setEditorSource("new"); }}
                              className="text-white cursor-pointer hover:text-amber-400"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-sm">tune</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPhotoUrlsList(prev => prev.filter((_, j) => j !== i))}
                              className="text-white cursor-pointer hover:text-red-400"
                              title="Remove"
                            >
                              <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                          </div>
                          {/* Move left/right */}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/80 flex justify-between px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button disabled={i === 0} onClick={() => setPhotoUrlsList(p => { const n=[...p]; [n[i-1],n[i]]=[n[i],n[i-1]]; return n; })} className="text-white text-[9px] disabled:opacity-30 cursor-pointer">←</button>
                            <button disabled={i === photoUrlsList.length-1} onClick={() => setPhotoUrlsList(p => { const n=[...p]; [n[i],n[i+1]]=[n[i+1],n[i]]; return n; })} className="text-white text-[9px] disabled:opacity-30 cursor-pointer">→</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Or paste URL */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newUrlInput}
                        onChange={e => setNewUrlInput(e.target.value)}
                        placeholder="Paste an image URL and press Add..."
                        className="flex-1 px-3 py-2 border border-[#e5e1d8] bg-white focus:outline-none focus:border-black font-sans text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => { if (newUrlInput.trim()) { setPhotoUrlsList(p => [...p, newUrlInput.trim()]); setNewUrlInput(""); } }}
                        className="px-4 bg-black text-white font-mono text-[9px] uppercase tracking-wider hover:opacity-90 cursor-pointer"
                      >
                        Add URL
                      </button>
                    </div>
                  </div>
                )}

                {/* Gemini analyze */}
                {photoUrlsList.length > 0 && (
                  <button
                    type="button"
                    disabled={imageAnalyzing}
                    onClick={() => handleAnalyzeImage(photoUrlsList[0], "image/jpeg", setPhotoCaption, setImageAnalyzing)}
                    className="flex items-center gap-2 px-4 py-2 border border-[#e5e1d8] hover:border-amber-400 bg-white font-mono text-[9px] uppercase tracking-widest text-[#5f5e59] hover:text-amber-700 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {imageAnalyzing ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-sm">auto_awesome</span>}
                    {imageAnalyzing ? "Analyzing with Gemini..." : "Auto-generate caption with Gemini AI"}
                  </button>
                )}

                {/* Metadata form */}
                <form onSubmit={handlePublishPhoto} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="label-sm">Title *</label>
                    <input type="text" value={photoTitle} onChange={e => setPhotoTitle(e.target.value)} placeholder="e.g. Geometry in Banaras" required className="field" />
                  </div>
                  <div className="space-y-1">
                    <label className="label-sm">Category *</label>
                    <select value={photoCategory} onChange={e => setPhotoCategory(e.target.value)} className="field">
                      {["Architecture","Landscape","Portrait","Conceptual","Minimalist","Street","Abstract"].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="label-sm">Location</label>
                    <input type="text" value={photoLocation} onChange={e => setPhotoLocation(e.target.value)} placeholder="e.g. Kolkata, India" className="field" />
                  </div>
                  <div className="space-y-1">
                    <label className="label-sm">Tags (comma-separated)</label>
                    <input type="text" value={photoTags} onChange={e => setPhotoTags(e.target.value)} placeholder="film, architecture, banaras" className="field font-mono" />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="label-sm">Caption / Curator Note</label>
                    <textarea rows={3} value={photoCaption} onChange={e => setPhotoCaption(e.target.value)} placeholder="Write a description or use Gemini AI above to auto-generate..." className="field resize-none" />
                  </div>
                  <div className="md:col-span-2">
                    <button type="submit" disabled={publishing || compressing} className="w-full py-3.5 bg-black text-white font-mono text-[10px] tracking-widest uppercase hover:opacity-90 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2">
                      {publishing ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Publishing...</> : <><span className="material-symbols-outlined text-sm">publish</span> Publish to Gallery</>}
                    </button>
                  </div>
                </form>
              </section>

              {/* ── Library Section ── */}
              <section className="space-y-5 border-t border-[#e5e1d8] pt-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-serif text-xl font-bold text-black">Photo Library</h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Search */}
                    <div className="relative">
                      <span className="material-symbols-outlined text-sm absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8b8780]">search</span>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="pl-8 pr-3 py-1.5 border border-[#e5e1d8] bg-white focus:outline-none focus:border-black font-sans text-xs w-40"
                      />
                    </div>
                    {/* View toggle */}
                    <div className="flex border border-[#e5e1d8] overflow-hidden">
                      <button onClick={() => setLibraryView("grid")} className={`px-2.5 py-1.5 cursor-pointer transition-colors ${libraryView === "grid" ? "bg-black text-white" : "bg-white text-[#8b8780] hover:bg-[#f7f4ed]"}`}>
                        <span className="material-symbols-outlined text-sm">grid_view</span>
                      </button>
                      <button onClick={() => setLibraryView("list")} className={`px-2.5 py-1.5 cursor-pointer transition-colors ${libraryView === "list" ? "bg-black text-white" : "bg-white text-[#8b8780] hover:bg-[#f7f4ed]"}`}>
                        <span className="material-symbols-outlined text-sm">list</span>
                      </button>
                    </div>
                    {/* Bulk actions */}
                    {selectedIds.size > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] text-[#5f5e59] uppercase">{selectedIds.size} selected</span>
                        <button onClick={handleBulkDelete} disabled={bulkDeleting} className="px-3 py-1.5 bg-red-600 text-white font-mono text-[9px] uppercase tracking-wider cursor-pointer hover:bg-red-700 disabled:opacity-50 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">delete</span>
                          {bulkDeleting ? "Deleting..." : "Delete Selected"}
                        </button>
                        <button onClick={clearSelection} className="px-3 py-1.5 border border-[#e5e1d8] font-mono text-[9px] uppercase cursor-pointer hover:border-black text-[#5f5e59]">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={selectAll} className="px-3 py-1.5 border border-[#e5e1d8] font-mono text-[9px] uppercase cursor-pointer hover:border-black text-[#5f5e59]">
                        Select All
                      </button>
                    )}
                  </div>
                </div>

                {filteredPhotos.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-[#e5e1d8]">
                    <span className="material-symbols-outlined text-4xl text-[#c5c0b8]">photo_library</span>
                    <p className="font-mono text-[10px] text-[#8b8780] uppercase mt-3">{searchQuery ? "No results found" : "No photos yet — upload above"}</p>
                  </div>
                ) : libraryView === "grid" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {filteredPhotos.map((photo, i) => (
                      <div
                        key={photo.id || i}
                        className={`relative group border-2 overflow-hidden bg-white cursor-pointer transition-all duration-150 ${
                          photo.id && selectedIds.has(photo.id) ? "border-black" : "border-[#e5e1d8] hover:border-black/40"
                        }`}
                        onClick={() => photo.id && toggleSelect(photo.id)}
                      >
                        <div className="aspect-square overflow-hidden">
                          <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                        </div>
                        {/* Checkbox */}
                        <div className={`absolute top-2 left-2 w-5 h-5 border-2 flex items-center justify-center transition-all duration-150 ${
                          photo.id && selectedIds.has(photo.id) ? "border-black bg-black" : "border-white bg-white/80 opacity-0 group-hover:opacity-100"
                        }`}>
                          {photo.id && selectedIds.has(photo.id) && <span className="text-white text-xs font-bold">✓</span>}
                        </div>
                        {/* View count badge */}
                        {photo.id && (viewCounts[photo.id] ?? 0) > 0 && (
                          <div className="absolute top-2 right-2 bg-black/70 text-white font-mono text-[8px] tracking-widest px-1.5 py-0.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px] leading-none">visibility</span>
                            {viewCounts[photo.id]}
                          </div>
                        )}
                        {/* Hover actions */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                          <p className="font-sans text-white text-[10px] font-medium truncate">{photo.title}</p>
                          <p className="font-mono text-white/60 text-[8px] uppercase">{photo.category}</p>
                          <div className="flex gap-2 mt-1.5" onClick={e => e.stopPropagation()}>
                            <button onClick={() => openEditPhoto(photo)} className="text-white hover:text-amber-400 cursor-pointer transition-colors">
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                            {photo.id && (
                              <button onClick={() => handleDeletePhoto(photo.id!)} className="text-white hover:text-red-400 cursor-pointer transition-colors">
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-[#e5e1d8] bg-white overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#faf9f6] border-b border-[#e5e1d8]">
                        <tr>
                          <th className="p-3 w-8"><input type="checkbox" checked={selectedIds.size === filteredPhotos.filter(p => p.id).length && filteredPhotos.length > 0} onChange={e => e.target.checked ? selectAll() : clearSelection()} className="cursor-pointer" /></th>
                          <th className="p-3 font-mono text-[8px] uppercase tracking-wider text-[#8b8780]">Image</th>
                          <th className="p-3 font-mono text-[8px] uppercase tracking-wider text-[#8b8780]">Title</th>
                          <th className="p-3 font-mono text-[8px] uppercase tracking-wider text-[#8b8780] hidden md:table-cell">Category</th>
                          <th className="p-3 font-mono text-[8px] uppercase tracking-wider text-[#8b8780] hidden md:table-cell">Date</th>
                          <th className="p-3 font-mono text-[8px] uppercase tracking-wider text-[#8b8780] hidden md:table-cell text-center">Views</th>
                          <th className="p-3 font-mono text-[8px] uppercase tracking-wider text-[#8b8780] text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e5e1d8]">
                        {filteredPhotos.map((photo, i) => (
                          <tr
                            key={photo.id || i}
                            draggable
                            onDragStart={e => handleRowDragStart(e, i)}
                            onDragOver={e => handleRowDragOver(e, i)}
                            onDrop={e => handleRowDrop(e, i)}
                            className={`transition-colors ${draggedIndex === i ? "bg-amber-50 opacity-70" : "hover:bg-[#faf9f6]"}`}
                          >
                            <td className="p-3">
                              {photo.id && (
                                <input type="checkbox" checked={selectedIds.has(photo.id)} onChange={() => toggleSelect(photo.id!)} className="cursor-pointer" onClick={e => e.stopPropagation()} />
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#c5c0b8] text-sm cursor-grab">drag_indicator</span>
                                <img src={photo.imageUrl} alt={photo.title} className="w-12 h-9 object-cover border border-[#e5e1d8]" referrerPolicy="no-referrer" />
                              </div>
                            </td>
                            <td className="p-3">
                              <p className="font-serif font-bold text-[#1a1a1a] text-xs">{photo.title}</p>
                              <p className="font-mono text-[8px] text-[#8b8780]">{photo.location}</p>
                            </td>
                            <td className="p-3 hidden md:table-cell font-mono text-[9px] uppercase text-[#5f5e59]">{photo.category}</td>
                            <td className="p-3 hidden md:table-cell font-mono text-[8px] text-[#8b8780]">
                              {new Date(photo.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                            <td className="p-3 hidden md:table-cell text-center">
                              <span className="inline-flex items-center gap-1 font-mono text-[9px] text-[#5f5e59]">
                                <span className="material-symbols-outlined text-[11px] leading-none text-[#8b8780]">visibility</span>
                                {photo.id ? (viewCounts[photo.id] ?? 0) : 0}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex justify-center items-center gap-1">
                                <button onClick={() => openEditPhoto(photo)} className="text-[#8b8780] hover:text-black p-1.5 cursor-pointer transition-colors" title="Edit">
                                  <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                                {photo.id && (
                                  <button onClick={() => handleDeletePhoto(photo.id!)} className="text-[#8b8780] hover:text-red-600 p-1.5 cursor-pointer transition-colors" title="Delete">
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB: BLOGS
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "blogs" && (
            <div className="space-y-6 max-w-4xl">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-black">Blog Posts</h1>
                  <p className="font-mono text-[9px] text-[#8b8780] uppercase tracking-wider mt-1">{posts.length} published narrative{posts.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setBlogTab("list")} className={`px-3 py-1.5 font-mono text-[9px] uppercase tracking-wider cursor-pointer border transition-colors ${blogTab === "list" ? "bg-black text-white border-black" : "border-[#e5e1d8] text-[#5f5e59] hover:border-black"}`}>
                    List
                  </button>
                  <button onClick={() => { setBlogTab("editor"); if (!editingPostId) resetBlogForm(); }} className={`px-3 py-1.5 font-mono text-[9px] uppercase tracking-wider cursor-pointer border transition-colors ${blogTab === "editor" ? "bg-black text-white border-black" : "border-[#e5e1d8] text-[#5f5e59] hover:border-black"}`}>
                    {editingPostId ? "Edit Post" : "New Post"}
                  </button>
                </div>
              </div>

              {/* Blog list */}
              {blogTab === "list" && (
                <div className="space-y-3">
                  {posts.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-[#e5e1d8]">
                      <span className="material-symbols-outlined text-4xl text-[#c5c0b8]">article</span>
                      <p className="font-mono text-[10px] text-[#8b8780] uppercase mt-3">No posts yet — write your first one</p>
                      <button onClick={() => setBlogTab("editor")} className="mt-4 px-4 py-2 bg-black text-white font-mono text-[9px] uppercase tracking-wider cursor-pointer hover:opacity-90">
                        Write a Post
                      </button>
                    </div>
                  ) : posts.map((post, i) => (
                    <div key={post.id || i} className="bg-white border border-[#e5e1d8] p-5 flex gap-4 hover:border-black/30 transition-colors group">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-24 h-16 object-cover border border-[#e5e1d8] flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-serif font-bold text-[#1a1a1a] truncate">{post.title}</p>
                        <p className="font-mono text-[8px] text-amber-700 uppercase tracking-wider mt-0.5">{post.category}</p>
                        <p className="font-sans text-xs text-[#8b8780] mt-1.5 line-clamp-2">{post.content?.slice(0, 120)}...</p>
                        {post.analyzedThemes && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {post.analyzedThemes.map(t => (
                              <span key={t} className="font-mono text-[7px] uppercase tracking-widest text-[#8b8780] border border-[#e5e1d8] px-1.5 py-0.5">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-end justify-between">
                        <span className="font-mono text-[8px] text-[#8b8780]">
                          {new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEditPost(post)} className="text-[#8b8780] hover:text-black p-1 cursor-pointer transition-colors">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          {post.id && (
                            <button onClick={() => handleDeletePost(post.id!)} className="text-[#8b8780] hover:text-red-600 p-1 cursor-pointer transition-colors">
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Blog editor */}
              {blogTab === "editor" && (
                <form onSubmit={handlePublishPost} className="space-y-5">
                  {editingPostId && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200">
                      <span className="material-symbols-outlined text-sm text-amber-600">edit</span>
                      <span className="font-mono text-[9px] text-amber-700 uppercase tracking-wider">Editing existing post</span>
                      <button type="button" onClick={() => { resetBlogForm(); setBlogTab("list"); }} className="ml-auto font-mono text-[8px] text-amber-600 hover:text-amber-900 uppercase tracking-wider cursor-pointer">
                        Cancel edit
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="label-sm">Title *</label>
                      <input type="text" value={postTitle} onChange={e => setPostTitle(e.target.value)} placeholder="e.g. The Silence of Concrete" required className="field" />
                    </div>
                    <div className="space-y-1">
                      <label className="label-sm">Series / Category</label>
                      <input type="text" value={postCategory} onChange={e => setPostCategory(e.target.value)} placeholder="e.g. Urban Monographs Vol. 5" className="field" />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="label-sm">Cover Image URL</label>
                      <div className="flex gap-2">
                        <input type="text" value={postCover} onChange={e => setPostCover(e.target.value)} placeholder="https://images.unsplash.com/..." className="field flex-1" />
                        {postCover && (
                          <img src={postCover} alt="Cover" className="w-16 h-10 object-cover border border-[#e5e1d8]" referrerPolicy="no-referrer" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="label-sm">Content * (Markdown supported)</label>
                      <button
                        type="button"
                        disabled={storyAnalyzing}
                        onClick={handleStoryAnalysis}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e5e1d8] hover:border-amber-400 font-mono text-[8px] uppercase tracking-wider text-[#5f5e59] hover:text-amber-700 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {storyAnalyzing ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-sm">auto_awesome</span>}
                        {storyAnalyzing ? "Analyzing..." : "Gemini Theme Audit"}
                      </button>
                    </div>
                    <textarea
                      rows={16}
                      value={postContent}
                      onChange={e => setPostContent(e.target.value)}
                      placeholder={`Write your editorial post here. Markdown is fully supported.\n\n# Heading\n\n**Bold text**, *italic text*, and more.\n\n> Blockquotes for emphasis.\n\n- Bullet points\n- Are supported`}
                      required
                      className="field resize-y font-mono text-xs leading-relaxed"
                    />
                    <div className="flex justify-between font-mono text-[8px] text-[#8b8780]">
                      <span>{postContent.length} characters</span>
                      <span>{postContent.split(/\s+/).filter(Boolean).length} words</span>
                    </div>
                  </div>

                  <button type="submit" disabled={publishingPost} className="w-full py-3.5 bg-black text-white font-mono text-[10px] tracking-widest uppercase hover:opacity-90 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2">
                    {publishingPost ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Saving...</> : <><span className="material-symbols-outlined text-sm">publish</span> {editingPostId ? "Update Post" : "Publish Post"}</>}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB: VIDEO AI
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "video" && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="font-serif text-2xl font-bold text-black">Video Analysis</h1>
                <p className="font-mono text-[9px] text-[#8b8780] uppercase tracking-wider mt-1">Museum-grade cinematic critique powered by Gemini AI</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="label-sm">Video URL</label>
                    <input type="text" value={videoUrl} onChange={e => { setVideoUrl(e.target.value); setVideoBase64(""); }} placeholder="https://example.com/video.mp4" className="field" />
                  </div>
                  <div className="text-center font-mono text-[9px] text-[#8b8780] uppercase">— or —</div>
                  <div className="space-y-1">
                    <label className="label-sm">Upload Local Video</label>
                    <input type="file" accept="video/*" onChange={handleVideoFile} className="w-full text-xs font-mono file:mr-3 file:py-1.5 file:px-3 file:border file:border-black file:bg-black file:text-white file:text-[9px] file:tracking-widest file:uppercase hover:file:opacity-90 file:cursor-pointer p-1.5 border border-[#e5e1d8] bg-white" />
                  </div>
                  {(videoUrl || videoBase64) && (
                    <div className="border border-[#e5e1d8] bg-black overflow-hidden">
                      <video src={videoUrl || videoBase64} controls className="w-full max-h-52 object-contain" />
                    </div>
                  )}
                  <button
                    onClick={handleVideoAnalyze}
                    disabled={videoAnalyzing}
                    className="w-full py-3.5 bg-black text-white font-mono text-[10px] tracking-widest uppercase hover:opacity-90 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {videoAnalyzing ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Analyzing...</> : <><span className="material-symbols-outlined text-sm">movie_filter</span> Analyze with Gemini</>}
                  </button>
                </div>

                <div className="border border-[#e5e1d8] bg-white p-5 min-h-64 flex flex-col">
                  <div className="flex items-center gap-2 pb-3 border-b border-[#e5e1d8]">
                    <span className="material-symbols-outlined text-sm text-[#8b8780]">analytics</span>
                    <h3 className="font-mono text-[9px] uppercase tracking-widest text-[#5f5e59]">Gemini Analysis Output</h3>
                  </div>
                  <div className="flex-1 mt-4 overflow-y-auto">
                    {videoAnalyzing ? (
                      <div className="flex flex-col items-center justify-center h-full gap-4">
                        <SpiralLoader size={60} showText={false} />
                        <p className="font-mono text-[8px] uppercase tracking-widest text-[#8b8780] animate-pulse">Processing film frames...</p>
                      </div>
                    ) : videoResult ? (
                      <div className="font-sans text-xs leading-relaxed text-[#1a1a1a] whitespace-pre-wrap">{videoResult}</div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center text-[#8b8780]">
                        <span className="material-symbols-outlined text-3xl opacity-30">movie</span>
                        <p className="font-sans italic text-xs mt-3">Load a video and click Analyze to begin the cinematic audit.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB: SETTINGS
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "settings" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h1 className="font-serif text-2xl font-bold text-black">Settings</h1>
                <p className="font-mono text-[9px] text-[#8b8780] uppercase tracking-wider mt-1">System configuration and account management</p>
              </div>

              {/* Account card */}
              <div className="bg-white border border-[#e5e1d8] p-6 space-y-4">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#5f5e59] border-b border-[#e5e1d8] pb-3">Admin Account</h3>
                <div className="flex items-center gap-4">
                  {userPhoto && <img src={userPhoto} alt={userName} className="w-12 h-12 rounded-full border border-[#e5e1d8]" />}
                  <div>
                    <p className="font-serif font-bold text-[#1a1a1a]">{userName}</p>
                    <p className="font-mono text-[9px] text-[#8b8780]">{userEmail}</p>
                    <p className="font-mono text-[8px] text-emerald-600 uppercase tracking-wider mt-0.5">● Authenticated via Google OAuth 2.0</p>
                  </div>
                </div>
                <button onClick={onLogout} className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-mono text-[9px] uppercase tracking-wider cursor-pointer transition-colors">
                  Sign Out
                </button>
              </div>

              {/* Firebase status */}
              <div className="bg-white border border-[#e5e1d8] p-6 space-y-3">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#5f5e59] border-b border-[#e5e1d8] pb-3">Firebase Status</h3>
                {[
                  { k: "Project ID", v: "comet-db-c8090" },
                  { k: "Database ID", v: "ai-studio-97045bd3..." },
                  { k: "Auth Provider", v: "Google OAuth 2.0" },
                  { k: "Storage Method", v: "Firestore base64 (compressed)" },
                  { k: "Connection", v: "Active ✓", highlight: true },
                ].map(row => (
                  <div key={row.k} className="flex justify-between items-center font-mono text-[9px]">
                    <span className="text-[#8b8780] uppercase tracking-wider">{row.k}</span>
                    <span className={row.highlight ? "text-emerald-600 font-bold" : "text-[#1a1a1a]"}>{row.v}</span>
                  </div>
                ))}
              </div>

              {/* Admin email config hint */}
              <div className="bg-amber-50 border border-amber-200 p-5 space-y-2">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-amber-800">Admin Email Restriction</h3>
                <p className="font-sans text-xs text-amber-700 leading-relaxed">
                  {import.meta.env.VITE_ADMIN_EMAIL
                    ? <>Restricted to: <strong>{import.meta.env.VITE_ADMIN_EMAIL}</strong>. Only this Google account can access the admin portal.</>
                    : <>No <code className="bg-amber-100 px-1">VITE_ADMIN_EMAIL</code> environment variable set. Any Google account can currently log in. Set this variable in Replit Secrets to restrict access to your email only.</>
                  }
                </p>
              </div>

              {/* Storage */}
              <div className="bg-white border border-[#e5e1d8] p-6 space-y-3">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#5f5e59] border-b border-[#e5e1d8] pb-3">Storage Overview</h3>
                <div className="flex justify-between font-mono text-[9px]">
                  <span className="text-[#8b8780] uppercase">Total Photos</span>
                  <span className="text-black">{photos.length}</span>
                </div>
                <div className="flex justify-between font-mono text-[9px]">
                  <span className="text-[#8b8780] uppercase">Estimated DB size</span>
                  <span className="text-black">{formatBytes(totalBytes)}</span>
                </div>
                <div className="flex justify-between font-mono text-[9px]">
                  <span className="text-[#8b8780] uppercase">Capacity used</span>
                  <span className={storagePct > 80 ? "text-red-600 font-bold" : "text-black"}>{storagePct}%</span>
                </div>
                <div className="w-full bg-[#e5e1d8] h-1.5">
                  <div className={`h-full transition-all ${storagePct > 80 ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${storagePct}%` }} />
                </div>
                <p className="font-mono text-[8px] text-[#8b8780]">Images are auto-compressed to JPEG 75% quality, max 1000px, with watermark injection.</p>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── EDIT PHOTO MODAL ─────────────────────────────────────────────────── */}
      {editingPhoto && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setEditingPhoto(null); }}>
          <div className="bg-[#fcfbfa] border border-[#e5e1d8] w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#e5e1d8] sticky top-0 bg-[#fcfbfa] z-10">
              <div>
                <p className="font-mono text-[8px] text-[#8b8780] uppercase tracking-widest">Editing Photo</p>
                <h3 className="font-serif text-lg font-bold text-black mt-0.5">{editingPhoto.title}</h3>
              </div>
              <button onClick={() => setEditingPhoto(null)} className="text-[#8b8780] hover:text-black cursor-pointer p-1 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-5">
              {/* Image source toggle */}
              <div className="grid grid-cols-2 gap-3">
                {(["url", "file"] as const).map(src => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setEditImageSource(src)}
                    className={`py-2 font-mono text-[9px] uppercase tracking-widest border cursor-pointer transition-colors ${editImageSource === src ? "border-black bg-black text-white" : "border-[#e5e1d8] text-[#5f5e59] hover:border-black"}`}
                  >
                    {src === "url" ? "External URL" : "Upload File"}
                  </button>
                ))}
              </div>

              {/* Current images */}
              <div className="space-y-2">
                <label className="label-sm">Images ({editUrlsList.length}) — first is cover</label>
                {editUrlsList.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {editUrlsList.map((url, i) => (
                      <div key={i} className="relative w-20 h-16 flex-shrink-0 border border-[#e5e1d8] group overflow-hidden bg-white">
                        <img src={url} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                        <div className="absolute top-0.5 left-0.5 bg-black text-white text-[6px] font-mono px-1">{i === 0 ? "COVER" : `#${i+1}`}</div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          <button type="button" onClick={() => { setEditorImage(url); setEditorSource("edit"); }} className="text-white cursor-pointer hover:text-amber-400">
                            <span className="material-symbols-outlined text-xs">tune</span>
                          </button>
                          <button type="button" onClick={() => setEditUrlsList(p => p.filter((_, j) => j !== i))} className="text-white cursor-pointer hover:text-red-400">
                            <span className="material-symbols-outlined text-xs">close</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {editImageSource === "file" ? (
                  <input type="file" accept="image/*" onChange={handleEditFileChange} className="w-full text-xs font-mono file:mr-3 file:py-1 file:px-3 file:border file:border-black file:bg-black file:text-white file:text-[8px] file:tracking-widest file:uppercase hover:file:opacity-90 file:cursor-pointer p-1 border border-[#e5e1d8] bg-white" />
                ) : (
                  <div className="flex gap-2">
                    <input type="text" value={editNewUrl} onChange={e => setEditNewUrl(e.target.value)} placeholder="https://images.unsplash.com/..." className="field flex-1" />
                    <button type="button" onClick={() => { if (editNewUrl.trim()) { setEditUrlsList(p => [...p, editNewUrl.trim()]); setEditNewUrl(""); } }} className="px-3 bg-black text-white font-mono text-[9px] uppercase cursor-pointer hover:opacity-90">
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* Gemini analyze for edit */}
              {editUrlsList.length > 0 && (
                <button
                  type="button"
                  disabled={editAnalyzing}
                  onClick={() => handleAnalyzeImage(editUrlsList[0], "image/jpeg", setEditCaption, setEditAnalyzing)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e5e1d8] hover:border-amber-400 font-mono text-[8px] uppercase tracking-wider text-[#5f5e59] hover:text-amber-700 transition-all cursor-pointer disabled:opacity-50"
                >
                  {editAnalyzing ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-sm">auto_awesome</span>}
                  {editAnalyzing ? "Analyzing..." : "Re-analyze with Gemini"}
                </button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="label-sm">Title *</label>
                  <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} required className="field" />
                </div>
                <div className="space-y-1">
                  <label className="label-sm">Category</label>
                  <select value={editCategory} onChange={e => setEditCategory(e.target.value)} className="field">
                    {["Architecture","Landscape","Portrait","Conceptual","Minimalist","Street","Abstract"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="label-sm">Location</label>
                  <input type="text" value={editLocation} onChange={e => setEditLocation(e.target.value)} className="field" />
                </div>
                <div className="space-y-1">
                  <label className="label-sm">Tags</label>
                  <input type="text" value={editTags} onChange={e => setEditTags(e.target.value)} placeholder="film, architecture..." className="field font-mono" />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="label-sm">Caption</label>
                  <textarea rows={3} value={editCaption} onChange={e => setEditCaption(e.target.value)} className="field resize-none" />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={savingEdit} className="flex-1 py-3 bg-black text-white font-mono text-[9px] uppercase tracking-widest cursor-pointer hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {savingEdit ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Saving...</> : <><span className="material-symbols-outlined text-sm">save</span> Save Changes</>}
                </button>
                <button type="button" onClick={() => setEditingPhoto(null)} className="px-5 py-3 border border-[#e5e1d8] font-mono text-[9px] uppercase tracking-widest text-[#5f5e59] hover:border-black cursor-pointer">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
