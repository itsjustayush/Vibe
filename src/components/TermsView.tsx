import { ArrowLeft, CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import Reveal from "./Reveal";

interface TermsViewProps {
  onNavigate: (view: string) => void;
}

const clauses = [
  {
    title: "Sacred intellectual property & original artistry",
    body: <>All files, custom scripts, geometric templates, raw-frame image buffers, metadata, stories, and Sanskrit commentaries presented within the <code>ayu.vibee</code> domain are the exclusive personal and intellectual property of creator <strong>AYUSH BHATTACHARYA</strong>. We strictly defend original aesthetic choices, shutter blade formulations, and responsive user layouts from uncredited exploitation.</>,
  },
  {
    title: "Plagiarism penalties & literal extraction prohibitions",
    body: <>Users may view current photographic exhibits purely for deep artistic study and aesthetic appreciation inside our standard frame container. The literal extraction, scraping, hotlinking, embedding within commercial print queues, or mirroring of these exhibits on external servers without prior explicit digitized certification constitutes full acts of <strong>Plagiarism &amp; Infringement</strong>.</>,
    note: "Any discovered infringement will trigger automatic server telemetry logging, cease-and-desist notices sent via designated cloud systems, and potential escalation within civil jurisdictions defending the rights of regional independent creators.",
  },
  {
    title: "Watermark preservation mandates",
    body: <>Photographs created, processed, or compressed inside our live editor workspaces are injected with a permanent, cryptographic signature aperture watermark. Removing, cloaking, cropping around, or modifying this digital fingerprint with any generative painting brushes or neural network layer models violates these Terms. The signature logo must remain completely visible, serving as a permanent badge of authenticity.</>,
  },
  {
    title: "Defensive litigation and user liability exclusion",
    body: <>By accessing the active showcase, user acknowledges that AYU.VIBEE operates under high-fidelity self-authoritative copyright regimes. No derivative works or digital collages may be published, sold, licensing-proxied, or compiled into neural training sets.</>,
    note: "UNAUTHORIZED MACHINE LEARNING INGESTION IS STRICTLY PROHIBITED AND SHALL BE SUBJECT TO RETROACTIVE LICENSING FEES CHARGED AT A STANDARD RATE OF $8,500 USD PER CAPTURED FRAME.",
  },
  {
    title: "Contact & certification enquiries",
    body: <>For academic queries, mathematical feedback regarding visual matrices, or print licensing approvals, please reach out directly through the Gatekeeper console admin email or contact us at <code>info.cometlabs@gmail.com</code>. We respond with clarity to clean, genuine visual purists.</>,
  },
];

export default function TermsView({ onNavigate }: TermsViewProps) {
  return (
    <main className="page-shell terms-page max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-10 md:py-16">
      <Reveal>
        <header className="page-hero page-hero--terms">
          <div>
            <div className="eyebrow-row"><span>Legal manifesto</span><span className="eyebrow-dot" aria-hidden="true" /><span>Archival protection</span></div>
            <h1 className="display-title mt-4">Terms &amp; conditions.</h1>
          </div>
          <div className="terms-meta"><FileText size={22} aria-hidden="true" /><span>Effective date<br />Summer Solstice, June 2026</span></div>
        </header>
      </Reveal>

      <Reveal delay={80}>
        <section className="terms-sutra mt-10 md:mt-16">
          <ShieldCheck size={22} aria-hidden="true" className="text-[var(--accent)]" />
          <p className="eyebrow mt-4">Sanskrit law of intellectual sanctity</p>
          <p className="terms-sutra-quote">“सत्यमुद्भावयेद् रूपं मा हरतु कदाचन”</p>
          <p className="body-copy mx-auto mt-3">Truth establishes pure form; let no one steal its essence.</p>
        </section>
      </Reveal>

      <section className="terms-list mt-12 md:mt-20">
        {clauses.map((clause, index) => (
          <Reveal key={clause.title} delay={Math.min(index * 55, 220)}>
            <article className="terms-clause">
              <div className="terms-clause-number">0{index + 1}</div>
              <div>
                <h2>{clause.title}</h2>
                <p>{clause.body}</p>
                {clause.note && <p className={index === 3 ? "terms-clause-note terms-clause-note--danger" : "terms-clause-note"}>{clause.note}</p>}
              </div>
            </article>
          </Reveal>
        ))}
      </section>

      <Reveal delay={160}>
        <div className="terms-return mt-12 md:mt-16">
          <button type="button" onClick={() => onNavigate("portfolio")} className="button-primary">
            <ArrowLeft size={16} aria-hidden="true" />
            Return to main atelier
          </button>
        </div>
      </Reveal>
    </main>
  );
}
