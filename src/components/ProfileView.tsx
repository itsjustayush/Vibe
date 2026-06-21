import React, { useState } from "react";
import { Photo } from "../types";

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

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide(prev => (prev + 1) % images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide(prev => (prev - 1 + images.length) % images.length);
  };

  return (
    <div 
      onClick={() => onClick(photo, currentSlide)}
      className="group cursor-pointer border border-[#e5e1d8] p-3 bg-white hover:border-black transition-all duration-300 hover:-translate-y-1 block"
    >
      <div className="relative overflow-hidden aspect-[16/10] bg-[#f7f4ed]">
        <img 
          src={images[currentSlide]} 
          alt={photo.title}
          className={`w-full h-full object-cover transition-all duration-700 ${
            isNaturalColor 
              ? "grayscale-0 contrast-100 hover:scale-[1.01]" 
              : "grayscale contrast-110 group-hover:grayscale-0"
          }`}
          referrerPolicy="no-referrer"
        />
        
        {/* Category Port Badge */}
        <div className="absolute top-2 left-2 px-2.5 py-1 bg-black text-[#f7f4ed] font-mono text-[9px] tracking-widest uppercase z-10">
          {photo.category}
        </div>

        {/* Carousel indicator badge overlay */}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/75 backdrop-blur-sm text-white font-mono text-[8px] tracking-[0.2em] uppercase z-10 flex items-center gap-1.5 leading-none">
            <span className="material-symbols-outlined text-[10px] leading-none">burst_mode</span>
            <span>{currentSlide + 1} / {images.length} PHOTOS</span>
          </div>
        )}

        {/* Arrow Overlays if multiple images */}
        {images.length > 1 && (
          <div className="absolute inset-0 flex justify-between items-center px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button
              onClick={handlePrev}
              type="button"
              className="w-7 h-7 bg-white/90 hover:bg-white text-black hover:scale-105 flex items-center justify-center transition-all shadow-md cursor-pointer border border-[#e5e1d8] rounded-none"
              title="Previous image"
            >
              <span className="material-symbols-outlined text-[11px] leading-none">arrow_back</span>
            </button>
            <button
              onClick={handleNext}
              type="button"
              className="w-7 h-7 bg-white/90 hover:bg-white text-black hover:scale-105 flex items-center justify-center transition-all shadow-md cursor-pointer border border-[#e5e1d8] rounded-none"
              title="Next image"
            >
              <span className="material-symbols-outlined text-[11px] leading-none">arrow_forward</span>
            </button>
          </div>
        )}
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
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [activeImgIdx, setActiveImgIdx] = useState<number>(0);
  const [isNaturalColor, setIsNaturalColor] = useState<boolean>(true);

  const categories = ["All", "Landscape", "Architecture", "Portrait", "Conceptual"];

  const filteredPhotos = selectedCategory === "All"
    ? photos
    : photos.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      
      {/* Editorial Profile Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center border-b border-[#e5e1d8] pb-16">
        
        {/* Left Side: Editorial Photograph */}
        <div className="md:col-span-5 flex flex-col space-y-4">
          <div className="relative border border-[#e5e1d8] p-2 bg-[#fdfcf9]">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800" 
              alt="Ayush Bhattacharya"
              className="w-full grayscale contrast-125 object-cover aspect-[4/5]"
              referrerPolicy="no-referrer"
            />
            {/* Elegant thin caption */}
            <div className="mt-3.5 flex justify-between items-center font-mono text-[10px] tracking-widest text-[#5f5e59] uppercase px-1">
              <span>Ayush Bhattacharya</span>
              <span>Kolkata, 2024</span>
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
                <span className="font-mono text-[10px] tracking-widest uppercase text-[#8b8780] block mb-2">EXPLORING / LATERAL INTERESTS</span>
                <div className="flex flex-wrap gap-2">
                  {["Python Architecture", "Gemini Integrations", "Minimalist Design Theory", "Cinematic Arts"].map((interest) => (
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
              "Symmetry is the natural grammar of visual balance. Finding the matching equation in an elegant lens capture provides an unparalleled intellectual clarity."
            </p>
            <span className="font-mono text-[9px] tracking-widest text-black/40 block mt-2">— AYUSH BHATTACHARYA</span>
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
          <button 
            onClick={onOpenGate}
            className="mt-6 md:mt-0 px-4 py-2 bg-black text-white font-mono text-[10px] tracking-widest uppercase flex items-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">photo_camera</span>
            <span>FOLLOW @AYU.VIBEE</span>
          </button>
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
                  try {
                    import("../dbHelper").then(({ trackInsightEncounter }) => {
                      trackInsightEncounter("portfolioViews");
                    }).catch(() => {});
                  } catch (e) {}
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
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#f7f4ed] w-full max-w-4xl p-6 md:p-8 relative border-0 rounded-none shadow-2xl">
              
              {/* Close button with high aesthetic focus styling */}
              <button 
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 text-black hover:opacity-75 transition-opacity z-10 p-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
 
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-4">
                
                {/* Left Column: Huge photographic frame with full carousel support */}
                <div className="md:col-span-7 flex flex-col space-y-3 justify-center">
                  <div className="bg-black/5 p-2 border border-[#e5e1d8] relative group overflow-hidden">
                    <img 
                      src={photoImages[activeImgIdx] || selectedPhoto.imageUrl} 
                      alt={selectedPhoto.title}
                      className="w-full h-auto max-h-[60vh] object-contain transition-all duration-300"
                      referrerPolicy="no-referrer"
                    />

                    {/* Modal Carousel Arrow Overlays */}
                    {photoImages.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImgIdx(prev => (prev - 1 + photoImages.length) % photoImages.length);
                          }}
                          type="button"
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/80 hover:bg-black text-[#f7f4ed] hover:scale-105 flex items-center justify-center transition-all shadow-lg cursor-pointer border border-[#faf9f6]/30 rounded-none z-20 opacity-0 group-hover:opacity-100 duration-300"
                          title="Previous image"
                        >
                          <span className="material-symbols-outlined text-sm">arrow_back</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImgIdx(prev => (prev + 1) % photoImages.length);
                          }}
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/80 hover:bg-black text-[#f7f4ed] hover:scale-105 flex items-center justify-center transition-all shadow-lg cursor-pointer border border-[#faf9f6]/30 rounded-none z-20 opacity-0 group-hover:opacity-100 duration-300"
                          title="Next image"
                        >
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex justify-between items-center font-mono text-[10px] text-[#5f5e59] uppercase px-1">
                    <span>SYSTEM_REF: IMG_{Math.floor(1001 + (selectedPhoto.id?.charCodeAt(0) || 0) * 123) % 10000}.ARW</span>
                    <div className="flex items-center gap-2">
                      {photoImages.length > 1 && (
                        <span className="bg-black text-[#f7f4ed] px-2 py-0.5 text-[8px] font-semibold tracking-wider">
                          SLIDE {activeImgIdx + 1} OF {photoImages.length}
                        </span>
                      )}
                      <span>{selectedPhoto.category}</span>
                    </div>
                  </div>

                  {/* Dot/bar indicators */}
                  {photoImages.length > 1 && (
                    <div className="flex justify-center gap-1.5 pt-1">
                      {photoImages.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          onClick={() => setActiveImgIdx(dotIdx)}
                          className={`w-1.5 h-1.5 rounded-none transition-all duration-300 cursor-pointer ${
                            activeImgIdx === dotIdx ? "bg-black w-4" : "bg-neutral-350 hover:bg-neutral-500"
                          }`}
                          title={`Select photo ${dotIdx + 1}`}
                        />
                      ))}
                    </div>
                  )}
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
                      <h5 className="font-mono text-[10px] tracking-widest text-black uppercase mb-2 font-semibold">CURATOR DIRECTIVE</h5>
                      <p className="font-sans text-[12px] leading-relaxed text-[#5f5e59]">{selectedPhoto.caption}</p>
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

    </div>
  );
}
