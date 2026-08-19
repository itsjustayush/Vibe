import React, { useState } from "react";
import { Photo } from "../types";
import Carousel from "./Carousel";
import AsciiHoverImage from "./AsciiHoverImage";
import BlurText from "./BlurText";
import Reveal from "./Reveal";
import RotatingText from "./RotatingText";
import TextGenerateEffect from "./TextGenerateEffect";
import { HeroHighlight, Highlight } from "./HeroHighlight";
import TooltipCard from "./TooltipCard";
import WobbleCard from "./WobbleCard";
import ayushPortrait from "../assets/images/ayush-portrait.webp";

interface GalleryCardProps {
  photo: Photo;
  onClick: (photo: Photo, initialImgIdx: number) => void;
  isNaturalColor?: boolean;
}

function GalleryCard({ photo, onClick, isNaturalColor = true }: GalleryCardProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const images = photo.imageUrls && photo.imageUrls.length > 0
    ? photo.imageUrls
    : [photo.imageUrl].filter(Boolean);

  return (
    <div 
      onClick={() => onClick(photo, currentSlide)}
      className="gallery-card group cursor-pointer border border-[var(--border)] p-3 bg-[var(--surface-subtle)] hover:border-[var(--accent)] transition-all duration-300 hover:-translate-y-1 block"
    >
      <div className="gallery-card-media relative overflow-hidden aspect-[16/10] bg-[var(--surface-muted)]">
        <Carousel 
          images={images}
          isNaturalColor={isNaturalColor}
          currentIndex={currentSlide}
          onSelectImage={setCurrentSlide}
          className="w-full h-full"
        />
        
        {/* Category Port Badge */}
        <div className="gallery-card-badge absolute top-2 left-2 px-2.5 py-1 bg-black text-[#f7f4ed] font-mono text-[9px] tracking-widest uppercase z-10">
          {photo.category}
        </div>
      </div>

      <div className="pt-4 flex justify-between items-start">
        <div className="flex-grow pr-3">
          <h4 className="font-serif text-lg font-medium text-black group-hover:text-black/80 transition-colors">
            {photo.title}
          </h4>
          <p className="font-mono text-[10px] text-[#8b8780] tracking-wider uppercase mt-1">
            {photo.location}
          </p>
          <p className="font-sans text-[11px] text-[#5f5e59] mt-2 leading-relaxed line-clamp-2">
            {photo.caption}
          </p>

          {/* Tag Badges row */}
          {photo.tags && photo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {photo.tags.map((t, tid) => (
                <span 
                  key={tid} 
                  className="px-2 py-0.5 bg-neutral-100 border border-neutral-200/60 text-[#5f5e59] font-mono text-[8px] uppercase tracking-wider"
                >
                  #{t.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="font-mono text-[9px] text-[#8b8780] whitespace-nowrap pt-1">
          {new Date(photo.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
        </div>
      </div>


    </div>
  );
}

interface ProfileViewProps {
  photos: Photo[];
  onOpenGate: () => void;
}

export default function ProfileView({ photos, onOpenGate }: ProfileViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [activeImgIdx, setActiveImgIdx] = useState<number>(0);
  const [isNaturalColor, setIsNaturalColor] = useState<boolean>(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  // Handle keyboard events: Escape to close, Arrow keys to navigate
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen || !selectedPhoto) return;
      
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const photoImages = selectedPhoto.imageUrls && selectedPhoto.imageUrls.length > 0
          ? selectedPhoto.imageUrls
          : [selectedPhoto.imageUrl].filter(Boolean);
        setActiveImgIdx((prev) => (prev - 1 + photoImages.length) % photoImages.length);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const photoImages = selectedPhoto.imageUrls && selectedPhoto.imageUrls.length > 0
          ? selectedPhoto.imageUrls
          : [selectedPhoto.imageUrl].filter(Boolean);
        setActiveImgIdx((prev) => (prev + 1) % photoImages.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, selectedPhoto]);

  const categories = ["All", "Landscape", "Architecture", "Portrait", "Conceptual"];

  // Extract all unique tags across all photos
  const allTags = Array.from(
    new Set(
      photos
        .flatMap((p) => p.tags || [])
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    )
  );

  const filteredPhotos = photos.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesTag = !selectedTag || (p.tags && p.tags.some(t => t.trim().toLowerCase() === selectedTag.toLowerCase()));
    return matchesCategory && matchesTag;
  });

  return (
    <main className="page-shell profile-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-14">
      
      {/* Editorial Profile Section */}
      <Reveal>
      <section className="profile-hero grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center border-b border-[var(--border)] pb-16">
        
        {/* Left Side: Editorial Photograph */}
        <div className="md:col-span-5 flex flex-col space-y-4">
          <div className="hero-portrait-frame group relative overflow-hidden border border-[#e5e1d8] p-2 bg-[#fdfcf9] shadow-[12px_12px_0_rgba(24,24,27,0.08)]">
            <AsciiHoverImage
              src={ayushPortrait}
              alt="Ayush Bhattacharya in a misty rural landscape near Kolkata"
              className="block w-full object-cover aspect-[16/10] md:aspect-[4/5] opacity-[1] grayscale transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              decoding="async"
              label="Hero portrait ASCII reveal"
            />
            {/* Elegant thin caption */}
            <div className="mt-3.5 flex justify-between items-center font-mono text-[10px] tracking-widest text-[#5f5e59] uppercase px-1">
              <span>Ayush Bhattacharya</span>
              <span>Kolkata</span>
            </div>
          </div>
          
          <div className="px-1 border-l border-black py-1.5 pl-4">
            <p className="font-mono text-[9px] tracking-widest text-black/50 uppercase leading-4">
              FOCUS CORE: FUNDAMENTALS<br />
              COGNITIVE FREQUENCY: HIGH<br />
              STUDENT INQUIRY ENGINE: ACTIVE
            </p>
          </div>
        </div>

        {/* Right Side: Biographic Text */}
        <div className="md:col-span-7 flex flex-col justify-center space-y-8">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] tracking-[0.28em] text-[var(--muted-foreground)] uppercase">
              <span>FOUNDER & SCHOLAR</span>
              <span className="text-[var(--accent)]">/</span>
              <RotatingText texts={["ENGINEERING MIND", "VISUAL STORYTELLER", "SYSTEMS THINKER"]} />
            </div>
            <HeroHighlight>
              <h1 className="font-serif text-4xl md:text-5xl text-[var(--foreground)] tracking-[-0.035em] leading-[0.98] font-medium">
                <BlurText text="Ayush Bhattacharya is a seeker of elegant solutions." delay={70} animateBy="words" className="max-w-2xl" />
              </h1>
            </HeroHighlight>
            <p className="font-sans text-[13px] leading-relaxed text-[var(--muted-foreground)] mt-4 max-w-xl">
              Currently a Class 12 student and JEE aspirant, balancing the rigors of engineering preparation with a profound curiosity for <Highlight>computer science</Highlight> and creative visual expression.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-[#e5e1d8]">
            <div className="space-y-3">
              <h5 className="font-serif text-[15px] font-bold tracking-tight text-black">THE FOCUS</h5>
              <p className="font-sans text-[12px] leading-loose text-[var(--muted-foreground)]">
                My approach to engineering is rooted in the <TooltipCard content="The essential principles beneath every strong system: clarity, structure, and repeatable practice."><span className="editorial-term">fundamentals</span></TooltipCard>. I believe that true problem-solving lies at the intersection of mathematical precision and creative lateral thinking. From decomposing complex JEE physics problems to architecting clean UI flows, the objective remains the same: <TooltipCard content="A clear result is usually the consequence of a clear question."><span className="editorial-term">clarity</span></TooltipCard>.
              </p>
            </div>
            <div className="space-y-3">
              <h5 className="font-serif text-[15px] font-bold tracking-tight text-black">PHILOSOPHY</h5>
              <p className="font-sans text-[12px] leading-loose text-[var(--muted-foreground)]">
                A museum-grade mind in a high-speed world. I value the slow process of mastery—building deep foundations in computer science while navigating the competitive landscape of engineering entrance examinations.
              </p>
            </div>
          </div>
        </div>
      </section>
      </Reveal>

      {/* Academic Timeline & Attributes Grid */}
      <Reveal delay={80}>
      <section className="profile-context grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 py-16 border-b border-[var(--border)]">
        
        {/* Left column: Academic Journey */}
        <div className="md:col-span-7 space-y-8">
          <div>
            <h4 className="font-mono text-[10px] tracking-[0.3em] text-[#5f5e59] uppercase mb-4">ACADEMIC JOURNEY</h4>
            <h2 className="font-serif text-2xl font-medium tracking-tight text-black">The Path of Rigorous Theory</h2>
          </div>

          <div className="space-y-6 relative pl-6 border-l border-[#e5e1d8]">
            {/* Timeline item 1 */}
            <div className="relative">
              {/* Dot */}
              <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 bg-black rounded-none border border-[#f7f4ed]"></div>
              <p className="font-mono text-xs tracking-widest text-[#5f5e59]">2012 — 2027</p>
              <h4 className="font-serif text-lg font-medium text-[#1a1a1a] mt-1">Central Model School</h4>
              <p className="font-sans text-[12px] leading-relaxed text-[#5f5e59] mt-2 max-w-lg">
                Primary to Higher Secondary Education. A foundational period of academic excellence and early technological exploration, nurturing analytical instincts.
              </p>
            </div>

            {/* Timeline item 2 */}
            <div className="relative pt-4">
              {/* Dot */}
              <div className="absolute -left-[31px] top-5 w-2.5 h-2.5 bg-[#8b8780] rounded-none border border-[#f7f4ed]"></div>
              <p className="font-mono text-xs tracking-widest text-[#5f5e59]">PRESENT</p>
              <h4 className="font-serif text-lg font-medium text-[#1a1a1a] mt-1">JEE Aspiration</h4>
              <p className="font-sans text-[12px] leading-relaxed text-[#5f5e59] mt-2 max-w-lg">
                Intensive focus on Mathematics, Physics, and Chemistry, refining the analytical mindset and systematic problem-solving methods required for premier engineering institutes.
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Attributes */}
        <div className="md:col-span-5 space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            <h4 className="font-mono text-[10px] tracking-[0.3em] text-[#5f5e59] uppercase">CURRICULUM SPECTRA</h4>
            
            <div className="space-y-5">
              <div>
                <span className="font-mono text-[10px] tracking-widest uppercase text-[#8b8780] block mb-2">STRENGTHENING / HIGH FOCUS</span>
                <div className="flex flex-wrap gap-2">
                  {["Advanced Calculus", "General Physics", "Analytical Mechanics", "Physical Chemistry"].map((strength) => (
                    <span key={strength} className="px-3 py-1 bg-black text-[#f7f4ed] font-sans text-[10px] tracking-widest uppercase">
                      {strength}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-mono text-[10px] tracking-widest uppercase text-[#8b8780] block mb-2">EXPLORING / INTERESTS</span>
                <div className="flex flex-wrap gap-2">
                  {["Coding", "Ai", "Minimalist Design Theory", "Photography"].map((interest) => (
                    <span key={interest} className="px-3 py-1 border border-black/20 text-black font-sans text-[10px] tracking-widest uppercase">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <WobbleCard containerClassName="mt-6 md:mt-0" className="p-4">
            <p className="font-serif italic text-xs leading-relaxed text-[var(--muted-foreground)]">
              There is a geometry and symmetry in the world. Photography is a way of finding that order, a way of looking at the chaos and finding a moment of perfect balance.
            </p>
            <span className="font-mono text-[9px] tracking-widest text-[var(--muted-foreground)] block mt-2">— TRENT PARKE</span>
          </WobbleCard>
        </div>
      </section>
      </Reveal>

      {/* Photography Section */}
      <Reveal delay={140}>
      <section className="portfolio-exhibit py-16">
        <div className="portfolio-intro flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div className="max-w-xl">
            <h4 className="font-mono text-[10px] tracking-[0.3em] text-[#5f5e59] uppercase mb-3">CURATED PORTFOLIO</h4>
            <h2 className="font-serif text-3xl font-medium tracking-tight text-black">Capturing the silence between moments</h2>
            <p className="font-sans text-[13px] text-[var(--muted-foreground)] mt-3 leading-relaxed">
              <TextGenerateEffect words="Beyond the equations, I find balance through the lens. Visual storytelling is my meditative retreat from the binary world." />
            </p>
          </div>
          <a
            href="https://instagram.com/ayu.vibee"
            target="_blank"
            rel="noopener noreferrer"
            className="button-primary mt-6 md:mt-0"
          >
            <span className="material-symbols-outlined text-sm">photo_camera</span>
            <span>FOLLOW @AYU.VIBEE</span>
          </a>
        </div>

        {/* Categories Tab Selector */}
        <div className="portfolio-toolbar flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[var(--border)] mb-10 gap-4 pb-1 md:pb-0">
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={selectedCategory === cat}
                className={`filter-pill px-5 py-3 font-sans text-[10px] tracking-widest uppercase transition-all duration-300 border-b-2 mr-2 cursor-pointer ${
                  selectedCategory === cat 
                    ? "border-black text-black font-bold" 
                    : "border-transparent text-[#8b8780] hover:text-black hover:border-black/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Elegant Color Preset Toggle Switch */}
          <button
            onClick={() => setIsNaturalColor(prev => !prev)}
            className="control-pill flex items-center gap-2 px-3 py-1.5 mb-2 md:mb-0 font-mono text-[9px] tracking-widest uppercase border border-[var(--border)] hover:border-[var(--accent)] bg-[var(--surface-subtle)] select-none transition-all cursor-pointer rounded-full"
            title="Toggle monochromatic or vibrant color feed"
          >
            <span className="material-symbols-outlined text-[13px] text-[#8b8780]">
              {isNaturalColor ? "palette" : "hdr_enhanced_select"}
            </span>
            <span>PRESET: {isNaturalColor ? "VIBRANT COLOR" : "MUSEUM MONOCHROME"}</span>
          </button>
        </div>

        {/* Dynamic Tag Filter Section */}
        {allTags.length > 0 && (
          <div className="tag-filter flex flex-wrap gap-2 mb-10 items-center justify-start bg-[var(--surface-subtle)] border border-[var(--border)] p-4 rounded-xl">
            <span className="font-mono text-[9px] tracking-widest text-[#8b8780] uppercase mr-3 flex items-center gap-1.5 font-bold">
              <span className="material-symbols-outlined text-[13px] leading-none">sell</span>
              FILTER EXHIBIT BY TAG:
            </span>
            <button
              onClick={() => setSelectedTag(null)}
              aria-pressed={selectedTag === null}
              className={`tag-filter-button tag-chip px-3 py-1 font-mono text-[9px] uppercase tracking-widest transition-all duration-200 border rounded-full cursor-pointer ${
                selectedTag === null
                  ? "bg-black text-[#faf9f6] border-black font-semibold shadow-sm"
                  : "bg-white text-[#5f5e59] border-[#e5e1d8] hover:border-black/50"
              }`}
            >
              All Tags
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                  aria-pressed={selectedTag === tag}
                  className={`tag-filter-button tag-chip px-3 py-1 font-mono text-[9px] uppercase tracking-widest transition-all duration-200 border rounded-full cursor-pointer ${
                    selectedTag === tag
                    ? "bg-black text-[#faf9f6] border-black font-semibold shadow-sm"
                    : "bg-white text-[#5f5e59] border-[#e5e1d8] hover:border-[#8b8780]"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Gallery Grid */}
        {filteredPhotos.length === 0 ? (
          <div className="empty-state py-20 text-center">
            <span className="material-symbols-outlined text-[#8b8780] text-3xl">photo_album</span>
            <p className="font-serif text-lg text-[#1a1a1a] mt-4">Empty Exhibition Corridor</p>
            <p className="font-mono text-[10px] tracking-widest text-[#8b8780] uppercase mt-2">
              "The gallery is waiting for its first capture."
            </p>
          </div>
        ) : (
          <div className="gallery-grid grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredPhotos.map((photo, idx) => (
              <Reveal key={photo.id || idx} delay={Math.min(idx * 60, 240)} className="h-full">
              <GalleryCard 
                key={photo.id || idx}
                photo={photo}
                isNaturalColor={isNaturalColor}
                onClick={(p, slideIdx) => {
                  setSelectedPhoto(p);
                  setActiveImgIdx(slideIdx);
                  import("../dbHelper").then(({ trackInsightEncounter, incrementPhotoViews }) => {
                    trackInsightEncounter("portfolioViews");
                    if (p.id) incrementPhotoViews(p.id);
                  }).catch(() => {});
                }}
              />
              </Reveal>
            ))}
          </div>
        )}
      </section>
      </Reveal>
 
      {/* Exquisite Lightbox Detail Modal */}
      {(() => {
        if (!selectedPhoto) return null;
        const photoImages = selectedPhoto.imageUrls && selectedPhoto.imageUrls.length > 0
          ? selectedPhoto.imageUrls
          : [selectedPhoto.imageUrl].filter(Boolean);

        return (
          <div className="lightbox-backdrop fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`${selectedPhoto.title} details`}>
            <div className="lightbox-panel bg-[var(--background)] text-[var(--foreground)] w-full max-w-5xl p-6 md:p-8 relative border border-[var(--border)] rounded-2xl shadow-2xl">
              
              {/* Close button with high aesthetic focus styling */}
              <button 
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 min-h-11 min-w-11 text-black hover:opacity-75 transition-opacity z-10 p-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-black"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
 
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-4">
                
                {/* Left Column: Huge photographic frame with full carousel support */}
                <div className="md:col-span-7 flex flex-col space-y-3 justify-center">
                  <div className="bg-black/5 p-2 border border-[#e5e1d8] relative cursor-pointer group/modal-carousel hover:opacity-90 transition-opacity duration-200" onClick={() => setIsLightboxOpen(true)}>
                    <Carousel 
                      images={photoImages}
                      isNaturalColor={true}
                      currentIndex={activeImgIdx}
                      onSelectImage={setActiveImgIdx}
                      className="w-full aspect-[16/10]"
                    />
                    {/* Subtle click indicator overlay */}
                    <div className="absolute inset-2 border border-white/20 pointer-events-none opacity-0 group-hover/modal-carousel:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white/40 text-2xl">fullscreen</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center font-mono text-[10px] text-[#5f5e59] uppercase px-1">
                    <span>SYSTEM_REF: IMG_{Math.floor(1001 + (selectedPhoto.id?.charCodeAt(0) || 0) * 123) % 10000}.ARW</span>
                    <div className="flex items-center gap-2 font-semibold">
                      <span>{selectedPhoto.category}</span>
                    </div>
                  </div>
                </div>
 
                {/* Right Column: Curator description and analytical panels */}
                <div className="md:col-span-5 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div>
                      <span className="font-mono text-[9px] tracking-widest text-[#8b8780] uppercase">{selectedPhoto.location}</span>
                      <h3 className="font-serif text-2xl font-medium text-black mt-1">{selectedPhoto.title}</h3>
                      <p className="font-mono text-[10px] text-[#8b8780] mt-1">
                        Captured: {new Date(selectedPhoto.createdAt).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
 
                    <div className="py-4 border-y border-[#e5e1d8]">
                          <h5 className="font-mono text-[10px] tracking-widest text-[var(--foreground)] uppercase mb-2 font-semibold">PHOTO NOTE</h5>
                      <p className="font-sans text-[12px] leading-relaxed text-[#5f5e59]">{selectedPhoto.caption}</p>

                      {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-dashed border-[#e5e1d8]">
                          {selectedPhoto.tags.map((t, index) => (
                            <span 
                              key={index} 
                              className="px-2 py-0.5 bg-neutral-100 border border-neutral-200/50 text-[#5f5e59] font-mono text-[8px] uppercase tracking-wider"
                            >
                              #{t.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
 

                  </div>
 
                  <div className="pt-6">
                    <button 
                      onClick={() => setSelectedPhoto(null)}
                      className="w-full py-2.5 bg-black text-[#f7f4ed] font-mono text-[10px] tracking-widest uppercase hover:opacity-90 duration-200 cursor-pointer"
                    >
                      RETURN TO EXHIBITION CORRIDOR
                    </button>
                  </div>
 
                </div>
 
              </div>
 
            </div>
          </div>
        );
      })()}

      {/* Full-screen Lightbox Overlay */}
      {isLightboxOpen && selectedPhoto && (() => {
        const photoImages = selectedPhoto.imageUrls && selectedPhoto.imageUrls.length > 0
          ? selectedPhoto.imageUrls
          : [selectedPhoto.imageUrl].filter(Boolean);
        
        return (
          <div 
            className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-xl flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(false);
              }}
              className="absolute top-6 right-6 text-white hover:opacity-70 transition-opacity z-[10000] p-2 cursor-pointer animate-in fade-in slide-in-from-top-2 duration-200"
              title="Close (Esc)"
              aria-label="Close fullscreen view"
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>

            {/* Image Container with object-fit contain */}
            <div className="w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <img
                key={activeImgIdx}
                src={photoImages[activeImgIdx]}
                alt={`${selectedPhoto.title} - Full resolution`}
                className="w-full h-full object-contain select-none animate-in fade-in duration-300"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>

            {/* Multi-image Navigation (if more than 1 image) */}
            {photoImages.length > 1 && (
              <>
                {/* Arrow Navigation */}
                <div className="absolute inset-0 flex justify-between items-center px-6 pointer-events-none">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImgIdx((prev) => (prev - 1 + photoImages.length) % photoImages.length);
                    }}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all pointer-events-auto cursor-pointer border border-white/30 rounded-none animate-in fade-in slide-in-from-left-2 duration-200 hover:scale-110"
                    title="Previous image (← Arrow)"
                    aria-label="Previous image"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImgIdx((prev) => (prev + 1) % photoImages.length);
                    }}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all pointer-events-auto cursor-pointer border border-white/30 rounded-none animate-in fade-in slide-in-from-right-2 duration-200 hover:scale-110"
                    title="Next image (→ Arrow)"
                    aria-label="Next image"
                  >
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>

                {/* Image Counter and Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="flex gap-1.5">
                    {photoImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImgIdx(idx);
                        }}
                        className={`transition-all cursor-pointer ${
                          activeImgIdx === idx
                            ? "w-2 h-2 bg-white scale-110"
                            : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70 hover:scale-125"
                        }`}
                        title={`Go to image ${idx + 1}`}
                        aria-label={`Go to image ${idx + 1}`}
                      />
                    ))}
                  </div>
                  <span className="text-white/60 font-mono text-xs tracking-wider">
                    {activeImgIdx + 1} / {photoImages.length}
                  </span>
                </div>
              </>
            )}

            {/* Exit and Navigation hint */}
            <div className="absolute bottom-6 right-6 text-white/40 text-xs font-mono tracking-widest uppercase pointer-events-none text-right animate-in fade-in slide-in-from-right-2 duration-200">
              <div>Press ESC or click to exit</div>
              <div>Use ← → arrows to navigate</div>
            </div>
          </div>
        );
      })()}

    </main>
  );
}
