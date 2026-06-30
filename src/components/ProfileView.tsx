import React, { useState } from "react";
import { Photo } from "../types";
import Carousel from "./Carousel";
import ayushPortrait from "../assets/images/ayush-portrait.png";

interface GalleryCardProps {
  photo: Photo;
  onClick: (photo: Photo, initialImgIdx: number) => void;
  isNaturalColor?: boolean;
}

function GalleryCard({ photo, onClick, isNaturalColor = true }: GalleryCardProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const allImages = photo.imageUrls && photo.imageUrls.length > 0
    ? photo.imageUrls
    : [photo.imageUrl].filter(Boolean);
  const images = allImages.filter(img => !brokenImages.has(img));

  const handleImageError = (url: string) => {
    setBrokenImages(prev => new Set([...prev, url]));
  };

  return (
    <div 
      onClick={() => onClick(photo, currentSlide)}
      className="group cursor-pointer border border-[#e5e1d8] p-3 bg-white hover:border-black transition-all duration-300 hover:-translate-y-1 block"
    >
      <div className="relative overflow-hidden aspect-[16/10] bg-[#f7f4ed]">
        <Carousel 
          images={images}
          isNaturalColor={isNaturalColor}
          currentIndex={currentSlide}
          onSelectImage={setCurrentSlide}
          className="w-full h-full"
        />
        
        {/* Category Port Badge */}
        <div className="absolute top-2 left-2 px-2.5 py-1 bg-black text-[#f7f4ed] font-mono text-[9px] tracking-widest uppercase z-10">
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

      {photo.analyzedDescription && (
        <div className="mt-4 pt-3 border-t border-[#e5e1d8]/60 bg-neutral-50 p-2.5 flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[15px] text-black/40 mt-0.5">insights</span>
          <p className="font-sans italic text-[10px] text-[#5f5e59] leading-relaxed line-clamp-1">
            Gemini Curation: {photo.analyzedDescription}
          </p>
        </div>
      )}
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
  const [fullscreenPhoto, setFullscreenPhoto] = useState<Photo | null>(null);
  const [fullscreenImgIdx, setFullscreenImgIdx] = useState<number>(0);

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
    <div className="max-w-6xl mx-auto px-6 py-10">
      
      {/* Editorial Profile Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center border-b border-[#e5e1d8] pb-16">
        
        {/* Left Side: Editorial Photograph */}
        <div className="md:col-span-5 flex flex-col space-y-4">
          <div className="relative border border-[#e5e1d8] p-2 bg-[#fdfcf9]">
            <img 
              src={ayushPortrait}
              alt="Ayush Bhattacharya"
              className="w-full object-cover aspect-[4/5] opacity-[1] grayscale"
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
            <h4 className="font-mono text-[10px] tracking-[0.3em] text-[#5f5e59] uppercase mb-2">FOUNDER & SCHOLAR</h4>
            <h1 className="font-serif text-3xl md:text-4xl text-[#1a1a1a] tracking-tight leading-[1.125] font-medium">
              Ayush Bhattacharya is a<br />seeker of elegant solutions.
            </h1>
            <p className="font-sans text-[13px] leading-relaxed text-[#5f5e59] mt-4 max-w-xl">
              Currently a Class 12 student and JEE aspirant, balancing the rigors of engineering preparation with a profound curiosity for computer science and creative visual expression.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-[#e5e1d8]">
            <div className="space-y-3">
              <h5 className="font-serif text-[15px] font-bold tracking-tight text-black">THE FOCUS</h5>
              <p className="font-sans text-[12px] leading-loose text-[#5f5e59]">
                My approach to engineering is rooted in the fundamentals. I believe that true problem-solving lies at the intersection of mathematical precision and creative lateral thinking. From decomposing complex JEE physics problems to architecting clean UI flows, the objective remains the same: clarity.
              </p>
            </div>
            <div className="space-y-3">
              <h5 className="font-serif text-[15px] font-bold tracking-tight text-black">PHILOSOPHY</h5>
              <p className="font-sans text-[12px] leading-loose text-[#5f5e59]">
                A museum-grade mind in a high-speed world. I value the slow process of mastery—building deep foundations in computer science while navigating the competitive landscape of engineering entrance examinations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Timeline & Attributes Grid */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 py-16 border-b border-[#e5e1d8]">
        
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

          <div className="p-4 bg-black/5 border border-black/10 mt-6 md:mt-0">
            <p className="font-serif italic text-xs leading-relaxed text-[#5f5e59]">
              There is a geometry and symmetry in the world. Photography is a way of finding that order, a way of looking at the chaos and finding a moment of perfect balance.
            </p>
            <span className="font-mono text-[9px] tracking-widest text-black/40 block mt-2">— TRENT PARKE</span>
          </div>
        </div>
      </section>

      {/* Photography Section */}
      <section className="py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div className="max-w-xl">
            <h4 className="font-mono text-[10px] tracking-[0.3em] text-[#5f5e59] uppercase mb-3">CURATED PORTFOLIO</h4>
            <h2 className="font-serif text-3xl font-medium tracking-tight text-black">Capturing the silence between moments</h2>
            <p className="font-sans text-[13px] text-[#5f5e59] mt-3 leading-relaxed">
              Beyond the equations, I find balance through the lens. Visual storytelling is my meditative retreat from the binary world.
            </p>
          </div>
          <a
            href="https://instagram.com/ayu.vibee"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 md:mt-0 px-4 py-2 bg-black text-white font-mono text-[10px] tracking-widest uppercase flex items-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">photo_camera</span>
            <span>FOLLOW @AYU.VIBEE</span>
          </a>
        </div>

        {/* Categories Tab Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#e5e1d8] mb-10 gap-4 pb-1 md:pb-0">
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-3 font-sans text-[10px] tracking-widest uppercase transition-all duration-300 border-b-2 mr-2 cursor-pointer ${
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
            className="flex items-center gap-2 px-3 py-1.5 mb-2 md:mb-0 font-mono text-[9px] tracking-widest uppercase border border-[#e5e1d8] hover:border-black bg-white select-none transition-all cursor-pointer rounded-none"
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
          <div className="flex flex-wrap gap-2 mb-10 items-center justify-start bg-[#fdfcf9] border border-[#e5e1d8] p-4">
            <span className="font-mono text-[9px] tracking-widest text-[#8b8780] uppercase mr-3 flex items-center gap-1.5 font-bold">
              <span className="material-symbols-outlined text-[13px] leading-none">sell</span>
              FILTER EXHIBIT BY TAG:
            </span>
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1 font-mono text-[9px] uppercase tracking-widest transition-all duration-200 border rounded-none cursor-pointer ${
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
                className={`px-3 py-1 font-mono text-[9px] uppercase tracking-widest transition-all duration-200 border rounded-none cursor-pointer ${
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
          <div className="border border-dashed border-[#e5e1d8] py-20 text-center">
            <span className="material-symbols-outlined text-[#8b8780] text-3xl">photo_album</span>
            <p className="font-serif text-lg text-[#1a1a1a] mt-4">Empty Exhibition Corridor</p>
            <p className="font-mono text-[10px] tracking-widest text-[#8b8780] uppercase mt-2">
              "The gallery is waiting for its first capture."
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredPhotos.map((photo, idx) => (
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
            ))}
          </div>
        )}
      </section>
 
      {/* Exquisite Lightbox Detail Modal */}
      {(() => {
        if (!selectedPhoto) return null;
        const photoImages = selectedPhoto.imageUrls && selectedPhoto.imageUrls.length > 0
          ? selectedPhoto.imageUrls
          : [selectedPhoto.imageUrl].filter(Boolean);

        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 md:p-4">
            <div className="bg-[#f7f4ed] w-full max-w-6xl p-3 md:p-8 relative border-0 rounded-none shadow-2xl max-h-[95vh] overflow-y-auto">
              
              {/* Fullscreen and Close buttons */}
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button 
                  onClick={() => {
                    setFullscreenPhoto(selectedPhoto);
                    setFullscreenImgIdx(activeImgIdx);
                  }}
                  className="text-black hover:opacity-75 transition-opacity p-2 cursor-pointer"
                  title="View in fullscreen"
                >
                  <span className="material-symbols-outlined text-2xl">fullscreen</span>
                </button>
                <button 
                  onClick={() => setSelectedPhoto(null)}
                  className="text-black hover:opacity-75 transition-opacity p-2 cursor-pointer"
                  title="Close"
                >
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>
              </div>
 
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 mt-2 md:mt-4">
                
                {/* Left Column: Huge photographic frame with full carousel support */}
                <div className="md:col-span-7 flex flex-col space-y-2 md:space-y-3 justify-center">
                  <div className="bg-black p-2 border border-[#e5e1d8] relative flex items-center justify-center" style={{ minHeight: "350px", maxHeight: "75vh" }}>
                    <Carousel 
                      images={photoImages}
                      isNaturalColor={true}
                      currentIndex={activeImgIdx}
                      onSelectImage={setActiveImgIdx}
                      className="w-full h-full"
                    />
                  </div>

                  <div className="flex justify-between items-center font-mono text-[10px] text-[#5f5e59] uppercase px-1">
                    <span>SYSTEM_REF: IMG_{Math.floor(1001 + (selectedPhoto.id?.charCodeAt(0) || 0) * 123) % 10000}.ARW</span>
                    <div className="flex items-center gap-2 font-semibold">
                      <span>{selectedPhoto.category}</span>
                    </div>
                  </div>
                </div>
 
                {/* Right Column: Curator description and analytical panels */}
                <div className="md:col-span-5 flex flex-col justify-between text-sm md:text-base">
                  <div className="space-y-6">
                    <div>
                      <span className="font-mono text-[9px] tracking-widest text-[#8b8780] uppercase">{selectedPhoto.location}</span>
                      <h3 className="font-serif text-2xl font-medium text-black mt-1">{selectedPhoto.title}</h3>
                      <p className="font-mono text-[10px] text-[#8b8780] mt-1">
                        Captured: {new Date(selectedPhoto.createdAt).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
 
                    <div className="py-4 border-y border-[#e5e1d8]">
                      <h5 className="font-mono text-[10px] tracking-widest text-black uppercase mb-2 font-semibold">CURATOR DIRECTIVE</h5>
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
 
                    {selectedPhoto.analyzedDescription && (
                      <div className="p-3 bg-black/5 border border-black/10">
                        <div className="flex items-center gap-2 mb-2 text-[#1a1a1a]">
                          <span className="material-symbols-outlined text-lg">insights</span>
                          <span className="font-mono text-[10px] tracking-widest uppercase font-semibold">GEMINI PRO ANALYSIS</span>
                        </div>
                        <p className="font-sans text-[11px] leading-relaxed text-[#5f5e59]">
                          {selectedPhoto.analyzedDescription}
                        </p>
                      </div>
                    )}
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

      {/* Fullscreen Carousel Modal */}
      {(() => {
        if (!fullscreenPhoto) return null;
        const fullscreenImages = fullscreenPhoto.imageUrls && fullscreenPhoto.imageUrls.length > 0
          ? fullscreenPhoto.imageUrls
          : [fullscreenPhoto.imageUrl].filter(Boolean);

        return (
          <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center p-4">
            {/* Fullscreen Close Button */}
            <button 
              onClick={() => setFullscreenPhoto(null)}
              className="absolute top-6 right-6 text-white hover:opacity-75 transition-opacity z-10 p-2 cursor-pointer"
              title="Exit fullscreen"
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>

            {/* Fullscreen Carousel */}
            <div className="w-full h-full flex items-center justify-center">
              <Carousel 
                images={fullscreenImages}
                isNaturalColor={true}
                currentIndex={fullscreenImgIdx}
                onSelectImage={setFullscreenImgIdx}
                className="w-full h-full"
              />
            </div>

            {/* Bottom Info Bar */}
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center text-white font-mono text-sm">
              <div className="flex gap-4">
                <span>{fullscreenPhoto.title}</span>
                <span className="opacity-60">•</span>
                <span className="opacity-60">{fullscreenPhoto.location}</span>
              </div>
              <span className="opacity-60">{fullscreenImgIdx + 1} / {fullscreenImages.length}</span>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
