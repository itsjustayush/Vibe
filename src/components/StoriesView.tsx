import React, { useState } from "react";
import Markdown from "react-markdown";
import { Post } from "../types";

interface StoriesViewProps {
  posts: Post[];
  onNavigate: (view: string) => void;
}

export default function StoriesView({ posts, onNavigate }: StoriesViewProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  if (selectedPost) {
    const coverImageBroken = brokenImages.has(selectedPost.coverImage);
    
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        
        {/* Navigation Indicator */}
        <button 
          onClick={() => setSelectedPost(null)}
          className="mb-8 font-mono text-[10px] tracking-[0.2em] text-[#8b8780] uppercase flex items-center gap-2 hover:text-black transition-colors"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>RETURN TO MAGAZINE ARCHIVE</span>
        </button>

        {/* Narrative Cover Frame */}
        <div className="relative border border-[#e5e1d8] p-2 bg-white mb-10">
          {coverImageBroken ? (
            <div className="w-full aspect-[21/9] bg-[#faf9f6] flex flex-col items-center justify-center border border-dashed border-[#e5e1d8] gap-3">
              <span className="material-symbols-outlined text-[#8b8780] text-4xl">broken_image</span>
              <span className="font-mono text-[10px] tracking-widest text-[#8b8780] uppercase text-center px-4">Cover Image Link Expired</span>
            </div>
          ) : (
            <img 
              src={selectedPost.coverImage} 
              alt={selectedPost.title}
              className="w-full grayscale contrast-110 object-cover aspect-[21/9]"
              referrerPolicy="no-referrer"
              onError={() => setBrokenImages(prev => new Set([...prev, selectedPost.coverImage]))}
            />
          )}
          <div className="absolute top-4 left-4 px-3 py-1 bg-black text-[#f7f4ed] font-mono text-[9px] tracking-widest uppercase">
            {selectedPost.category}
          </div>
        </div>

        {/* Story Metadata */}
        <div className="text-center md:text-left mb-10 pb-8 border-b border-[#e5e1d8]">
          <span className="font-mono text-[10px] tracking-widest text-[#8b8780] uppercase">
            SERIES MONOGRAPH // {selectedPost.category}
          </span>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1a1a1a] tracking-tight leading-[1.1] mt-3 mb-4">
            {selectedPost.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-[#8b8780] font-mono text-[10px] uppercase justify-center md:justify-start">
            <span>By Ayush Bhattacharya</span>
            <span>•</span>
            <span>{new Date(selectedPost.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
        </div>

        {/* The Story Contents, rendered in clean editorial typography */}
        <article className="prose prose-stone max-w-none text-normal text-[#1a1a1a] font-serif leading-relaxed text-[16px] space-y-6">
          <div className="markdown-body">
            <Markdown>{selectedPost.content}</Markdown>
          </div>
        </article>

        {/* Gemini AI Summary sidebar (if thematic metadata generated) */}
        {selectedPost.analyzedThemes && selectedPost.analyzedThemes.length > 0 && (
          <div className="mt-16 p-5 bg-[#faf8f4] border border-[#e5e1d8] text-left">
            <div className="flex items-center gap-2.5 text-black mb-3.5">
              <span className="material-symbols-outlined text-xl">insights</span>
              <h5 className="font-mono text-[10px] tracking-widest uppercase font-semibold">Curation Cognitive Themes (Gemini AI Assisted)</h5>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedPost.analyzedThemes.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-black text-white font-sans text-[9px] tracking-widest uppercase">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Back navigation footer */}
        <div className="mt-16 pt-8 border-t border-[#e5e1d8] text-center">
          <button 
            onClick={() => setSelectedPost(null)}
            className="px-8 py-3.5 bg-black text-white font-mono text-[10px] tracking-widest uppercase hover:opacity-90 transition-all cursor-pointer"
          >
            BACK TO SERIES COLLECTION
          </button>
        </div>

      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      
      {/* Intro Header */}
      <div className="mb-16 border-b border-[#e5e1d8] pb-10">
        <span className="font-mono text-[10px] tracking-[0.3em] text-[#8b8780] uppercase block mb-2">THE CHRONICLES OF VIBE</span>
        <h1 className="font-serif text-3xl md:text-5xl font-medium tracking-tight text-black">Editorial Journal</h1>
        <p className="font-sans text-[13px] text-[#5f5e59] mt-3 max-w-xl leading-relaxed">
          Detailed thoughts, structural mechanics, design reviews, and architectural stories. Written as a slow curation diary accompanying high focal plane imagery.
        </p>
      </div>

      {/* Stories Archive List */}
      {posts.length === 0 ? (
        <div className="border border-dashed border-[#e5e1d8] py-20 text-center">
          <span className="material-symbols-outlined text-[#8b8780] text-3xl">menu_book</span>
          <p className="font-serif text-lg text-[#1a1a1a] mt-4">No narratives published yet</p>
          <p className="font-mono text-[10px] tracking-widest text-[#8b8780] uppercase mt-2">
            The magazine is raw material pending curation.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {posts.map((post, idx) => {
            // Pick a paragraph snippet as excerpt
            const firstLine = post.content.split("\n\n")[0] || post.content;
            const excerpt = firstLine.length > 200 ? firstLine.slice(0, 200) + "..." : firstLine;

            return (
              <div 
                key={post.id || idx}
                onClick={() => {
                  setSelectedPost(post);
                  try {
                    import("../dbHelper").then(({ trackInsightEncounter }) => {
                      trackInsightEncounter("storyViews");
                    }).catch(() => {});
                  } catch (e) {}
                }}
                className="group cursor-pointer grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-[#e5e1d8]/60 pb-12 last:border-0 last:pb-0"
              >
                {/* Visual Thumbnail */}
                <div className="md:col-span-5 relative border border-[#e5e1d8] p-2 bg-white flex flex-col justify-center">
                  <div className="aspect-[16/10] bg-[#fdfcf9] overflow-hidden">
                    {brokenImages.has(post.coverImage) ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#faf9f6] border border-dashed border-[#e5e1d8]">
                        <span className="material-symbols-outlined text-[#8b8780] text-2xl">image_not_supported</span>
                      </div>
                    ) : (
                      <img 
                        src={post.coverImage} 
                        alt={post.title} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 cubic-transition duration-700"
                        referrerPolicy="no-referrer"
                        onError={() => setBrokenImages(prev => new Set([...prev, post.coverImage]))}
                      />
                    )}
                  </div>
                </div>

                {/* Narrative Details */}
                <div className="md:col-span-7 flex flex-col space-y-4">
                  <div className="flex items-center space-x-3 text-[#8b8780] font-mono text-[9px] uppercase tracking-wider">
                    <span>{post.category}</span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                  </div>

                  <div>
                    <h3 className="font-serif text-2xl lg:text-3xl font-medium tracking-tight text-black group-hover:opacity-80 pb-1">
                      {post.title}
                    </h3>
                    <p className="font-sans text-[12.5px] leading-relaxed text-[#5f5e59] mt-2 line-clamp-3">
                      {excerpt}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-black">
                    <span className="font-mono text-[10px] tracking-widest uppercase font-bold border-b border-black pb-0.5 group-hover:tracking-[0.15em] transition-all duration-300">
                      READ STORIES
                    </span>
                    <span className="material-symbols-outlined text-sm block group-hover:translate-x-1 duration-300">arrow_forward</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
