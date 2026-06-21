import React from "react";
import { motion } from "motion/react";
import AyuVibeeLogo from "./AyuVibeeLogo";

interface TermsViewProps {
  onNavigate: (view: string) => void;
}

export default function TermsView({ onNavigate }: TermsViewProps) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-12">
      {/* Editorial Header */}
      <div className="border-b border-[#e5e1d8] pb-8 text-center space-y-4">
        <span className="font-mono text-[9px] tracking-[0.3em] text-[#8b8780] uppercase block">
          LEGAL MANIFESTO & SYSTEM ARCHIVAL PROTECTION
        </span>
        <h1 className="font-serif text-3xl md:text-5xl font-medium tracking-tight text-black mt-2">
          Terms & Conditions
        </h1>
        <p className="font-mono text-[10px] text-[#5f5e59] uppercase tracking-wider block">
          Effective Date: Summer Solstice, June 2026
        </p>
      </div>

      {/* Sanskrit protection sutra of purity and clarity */}
      <div className="p-6 bg-black/[0.02] border border-black/10 text-center space-y-3">
        <span className="font-mono text-[8px] text-[#8b8780] tracking-widest uppercase block">SANSKRIT LAW OF INTELLECTUAL SANCTITY</span>
        <p className="font-serif italic text-lg text-black/80">
          "सत्यमुद्भावयेद् रूपं मा हरतु कदाचन — Truth establishes pure form; let no one steal its essence."
        </p>
        <span className="font-mono text-[8px] text-black/40 block">Vedic Archival Inscription of original creators</span>
      </div>

      {/* Structured core clauses defending copyright & anti-plagiarism */}
      <div className="space-y-10 text-[#1a1a1a] font-serif leading-relaxed text-sm md:text-base">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h3 className="font-sans font-bold text-xs tracking-wider uppercase text-black flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
            1. SACRED INTELLECTUAL PROPERTY & ORIGINAL ARTISTRY
          </h3>
          <p className="text-[#333] indent-6 text-justify">
            All files, custom scripts, geometric templates, raw-frame image buffers, metadata, stories, and Sanskrit commentaries presented within the <span className="font-mono text-xs font-semibold bg-black/[0.04] px-1 py-0.5">ayu.vibee</span> domain are the exclusive personal and intellectual property of creator <strong className="font-normal font-sans tracking-wide text-xs bg-black text-[#f7f4ed] px-1.5 py-0.5">AYUSH BHATTACHARYA</strong>. We strictly defend original aesthetic choices, shutter blade formulations, and responsive user layouts from uncredited exploitation.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h3 className="font-sans font-bold text-xs tracking-wider uppercase text-black flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
            2. PLAGIARISM PENALTIES & LITERAL EXTRACTION PROHIBITIONS
          </h3>
          <p className="text-[#333] indent-6 text-justify">
            Users may view current photographic exhibits purely for deep artistic study and aesthetic appreciation inside our standard frame container. The literal extraction, scraping, hotlinking, embedding within commercial print queues, or mirroring of these exhibits on external servers without prior explicit digitized certification constitutes full acts of <span className="font-sans text-xs tracking-wider text-red-700 font-bold uppercase underline decoration-dashed">Plagiarism & Infringement</span>.
          </p>
          <p className="text-[#5f5e59] text-xs">
            Any discovered infringement will trigger automatic server telemetry logging, cease-and-desist notices sent via designated cloud systems, and potential escalation within civil jurisdictions defending the rights of regional independent creators.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h3 className="font-sans font-bold text-xs tracking-wider uppercase text-black flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
            3. WATERMARK PRESERVATION MANDATES
          </h3>
          <p className="text-[#333] indent-6 text-justify">
            Photographs created, processed, or compressed inside our live editor workspaces are injected with a permanent, cryptographic signature aperture watermark. Removing, cloaking, cropping around, or modifying this digital fingerprint with any generative painting brushes or neural network layer models violates these Terms. The signature logo must remain completely visible, serving as a permanent badge of authenticity.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h3 className="font-sans font-bold text-xs tracking-wider uppercase text-black flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
            4. DEFENSIVE LITIGATION AND USER LIABILITY EXCLUSION
          </h3>
          <div className="border border-[#e5e1d8] bg-white p-4 font-sans text-xs space-y-2 mt-2 leading-relaxed">
            <div className="flex justify-between items-center border-b border-[#e5e1d8] pb-2 mb-2 font-mono text-[9px] uppercase tracking-wider text-[#8b8780]">
              <span>Archival Defence Agreement</span>
              <span className="text-emerald-700 font-bold">● ACTIVE PROTECTION DECREE</span>
            </div>
            <p>
              By accessing the active showcase, user acknowledges that AYU.VIBEE operates under high-fidelity self-authoritative copyright regimes. No derivative works or digital collages may be published, sold, licensing-proxied, or compiled into neural training sets.
            </p>
            <p className="text-red-700 font-bold">
              UNAUTHORIZED MACHINE LEARNING INGESTION IS STRICTLY PROHIBITED AND SHALL BE SUBJECT TO RETROACTIVE LICENSING FEES CHARGED AT A STANDARD RATE OF $8,500 USD PER CAPTURED FRAME.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h3 className="font-sans font-bold text-xs tracking-wider uppercase text-black flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
            5. CONTACT & CERTIFICATION ENQUIRIES
          </h3>
          <p className="text-[#333] indent-6 text-justify">
            For academic queries, mathematical feedback regarding visual matrices, or print licensing approvals, please reach out directly through the Gatekeeper console admin email or contact us at <span className="font-mono text-xs font-semibold bg-yellow-50 px-1.5 py-0.5 border border-yellow-200">info.cometlabs@gmail.com</span>. We respond with clarity to clean, genuine visual purists.
          </p>
        </section>

      </div>

      {/* Back button to return to gallery */}
      <div className="pt-8 border-t border-[#e5e1d8] flex justify-center">
        <button
          onClick={() => onNavigate("portfolio")}
          className="px-6 py-3 bg-black hover:bg-neutral-900 text-[#f7f4ed] font-sans text-xs tracking-widest uppercase font-semibold transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">home</span>
          RETURN TO MAIN ATELIER EXHIBITS
        </button>
      </div>
    </div>
  );
}
