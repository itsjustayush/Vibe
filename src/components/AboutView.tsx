import { Compass, GraduationCap, Orbit, Sparkles } from "lucide-react";
import BlurText from "./BlurText";
import Reveal from "./Reveal";

export default function AboutView() {
  return (
    <main className="page-shell max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 md:py-16">
      <Reveal>
        <header className="page-hero page-hero--about">
          <div>
            <div className="eyebrow-row"><span>Academic philosophy</span><span className="eyebrow-dot" aria-hidden="true" /><span>Field notes / 2026</span></div>
            <h1 className="display-title mt-4"><BlurText text="A mind between systems and stillness." delay={60} animateBy="words" /></h1>
          </div>
          <p className="page-hero-copy">A closer look at the person behind the frames: a student, systems thinker, and photographer learning to hold precision and wonder in the same composition.</p>
        </header>
      </Reveal>

      <section className="about-grid mt-12 md:mt-20">
        <Reveal className="about-lead">
          <p className="eyebrow">01 / The atelier</p>
          <h2 className="section-title mt-4">The work begins with attention.</h2>
          <p className="body-copy mt-5">Welcome to the digital atelier. This space belongs to <strong className="text-[var(--foreground)]">Ayush Bhattacharya</strong>, a student pursuing rigorous higher-secondary education alongside deep foundational studies in systems, visual design, and film-based capture.</p>
          <p className="body-copy mt-5">As an aspiring engineer preparing for competitive admissions, mathematics and physics form the analytical core. Photography remains the quieter counterweight: a way to observe structure before attempting to explain it.</p>
        </Reveal>

        <Reveal className="about-signal" delay={100}>
          <div className="about-signal-mark"><Orbit size={26} aria-hidden="true" /></div>
          <p className="eyebrow">Working principle</p>
          <p className="about-quote">“There is no true conflict between binary mechanics and artistic capture. Both seek the underlying structures that make a model feel balanced, stable, and true.”</p>
          <div className="about-signal-footer"><span>AYU.VIBEE / 001</span><span>CLARITY OVER NOISE</span></div>
        </Reveal>
      </section>

      <section className="about-panels mt-16 md:mt-24">
        <Reveal>
          <div className="about-panel">
            <div className="about-panel-icon"><GraduationCap size={19} aria-hidden="true" /></div>
            <p className="eyebrow">02 / Formation</p>
            <h2 className="section-title mt-3">Rigorous theory, patiently built.</h2>
            <p className="body-copy mt-4">The current path is a deliberate practice in foundations: deconstructing geometry, analyzing limits, exploring mechanics, and learning how disciplined systems create room for original thought.</p>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="about-panel about-panel--accent">
            <div className="about-panel-icon"><Compass size={19} aria-hidden="true" /></div>
            <p className="eyebrow">03 / Observation</p>
            <h2 className="section-title mt-3">Finding order inside the chaos.</h2>
            <p className="body-copy mt-4">Visual storytelling is a meditative retreat from the binary world. Each frame is an exercise in patience, proportion, and the search for a moment of perfect balance.</p>
          </div>
        </Reveal>
      </section>

      <Reveal delay={120}>
        <section className="about-manifesto mt-16 md:mt-24">
          <Sparkles size={18} aria-hidden="true" className="text-[var(--accent)]" />
          <p className="eyebrow mt-4">Meditation of clarity</p>
          <p className="about-manifesto-text">चित्तवृत्तिनिरोधः</p>
          <p className="body-copy max-w-xl mx-auto mt-3">Yoga is the quietude of fluctuating patterns — a reminder to let the frame become still before deciding what it means.</p>
        </section>
      </Reveal>
    </main>
  );
}
