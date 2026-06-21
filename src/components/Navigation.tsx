import React from "react";
import AyuVibeeLogo from "./AyuVibeeLogo";

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenGate: () => void;
  isAdmin: boolean;
  onLogout?: () => void;
}

export default function Navigation({ currentView, onNavigate, onOpenGate, isAdmin, onLogout }: NavigationProps) {
  return (
    <>
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 w-full border-b border-[#e5e1d8] bg-[#f7f4ed]/90 backdrop-blur-md px-6 md:px-20 py-4 flex items-center justify-between">
        {/* Brand Logo replacing flat text */}
        <div 
          onClick={() => onNavigate("portfolio")} 
          className="cursor-pointer hover:opacity-85 transition-opacity py-1"
        >
          <AyuVibeeLogo size="sm" theme="dark" className="!items-start" />
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center space-x-12">
          <button 
            onClick={() => onNavigate("portfolio")}
            className={`font-sans text-xs tracking-[0.2em] uppercase cursor-pointer transition-colors ${
              currentView === "portfolio" ? "font-bold text-black border-b border-black pb-1" : "text-[#5f5e59] hover:text-black"
            }`}
          >
            Portfolio
          </button>
          <button 
            onClick={() => onNavigate("stories")}
            className={`font-sans text-xs tracking-[0.2em] uppercase cursor-pointer transition-colors ${
              currentView === "stories" ? "font-bold text-black border-b border-black pb-1" : "text-[#5f5e59] hover:text-black"
            }`}
          >
            Stories
          </button>
          <button 
            onClick={() => onNavigate("about")}
            className={`font-sans text-xs tracking-[0.2em] uppercase cursor-pointer transition-colors ${
              currentView === "about" ? "font-bold text-black border-b border-black pb-1" : "text-[#5f5e59] hover:text-black"
            }`}
          >
            About
          </button>
        </div>

        {/* Quick Interactions */}
        <div className="flex items-center space-x-4">
          {isAdmin ? (
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => onNavigate("admin")}
                className="px-4 py-2 bg-black text-[#f7f4ed] font-sans text-xs tracking-widest uppercase hover:bg-opacity-80 transition-colors"
              >
                Dashboard
              </button>
              <button 
                onClick={onLogout}
                className="px-3 py-2 border border-black font-sans text-xs tracking-widest uppercase hover:bg-black hover:text-[#f7f4ed] transition-colors"
                title="Logout"
              >
                <span className="material-symbols-outlined text-[16px] block">logout</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenGate}
              className="px-6 py-2.5 border border-black font-sans text-[11px] tracking-[0.2em] uppercase hover:bg-black hover:text-[#f7f4ed] cubic-transition"
            >
              Contact
            </button>
          )}
        </div>
      </nav>
    </>
  );
}

export function Footer({ onNavigate, onOpenGate }: { onNavigate: (view: string) => void, onOpenGate: () => void }) {
  return (
    <footer className="w-full border-t border-[#e5e1d8] bg-[#f7f4ed] px-8 py-10 mt-20 flex flex-col md:flex-row justify-between items-center text-[#5f5e59]">
      <div className="mb-6 md:mb-0 text-center md:text-left flex flex-col md:flex-row items-center md:items-start gap-5">
        <AyuVibeeLogo size="sm" theme="dark" className="!items-center md:!items-start" />
        <div className="flex flex-col justify-center">
          <p className="font-sans text-[10px] tracking-widest uppercase">© 2026 AYU.VIBEE PHOTOGRAPHY & EDITORIAL. ALL RIGHTS RESERVED.</p>
          <p className="font-mono text-[9px] uppercase tracking-wider text-[#a09e99] mt-1">Sanskrit-Infused Archival Standards | Kolkata, India</p>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-6">
        <button onClick={() => onNavigate("stories")} className="font-sans text-[11px] tracking-widest uppercase hover:text-black transition-colors">Journal</button>
        <button onClick={onOpenGate} className="font-sans text-[11px] tracking-widest uppercase hover:text-black transition-colors">Curator Gate</button>
        <button onClick={() => onNavigate("portfolio")} className="font-sans text-[11px] tracking-widest uppercase hover:text-black transition-colors">Portfolio</button>
        <button onClick={() => alert(" Ayu.vibee Terms: High Art, Sharp Geometry. Non-commercial copyright reserved.")} className="font-sans text-[11px] tracking-widest uppercase hover:text-black transition-colors">Terms</button>
      </div>
    </footer>
  );
}
