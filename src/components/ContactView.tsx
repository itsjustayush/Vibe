import React, { useState } from "react";

interface ContactViewProps {
  onNavigate: (view: string) => void;
}

const SOCIALS = [
  {
    id: "instagram",
    label: "Instagram",
    handle: "@ayu.vibee",
    url: "https://instagram.com/ayu.vibee",
    desc: "Visual diaries, frame breakdowns & curated captures",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
    accent: "hover:border-pink-400 hover:text-pink-600",
    dot: "bg-pink-400",
  },
  {
    id: "twitter",
    label: "X / Twitter",
    handle: "@ayushbhattacharya",
    url: "https://x.com/ayushbhattacharya",
    desc: "Thoughts on geometry, light & architectural theory",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    accent: "hover:border-neutral-800 hover:text-neutral-900",
    dot: "bg-neutral-700",
  },
  {
    id: "email",
    label: "Email",
    handle: "ayush@ayu.vibee",
    url: "mailto:ayush@ayu.vibee",
    desc: "Editorial collaborations, licensing & inquiries",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 7l10 7 10-7" />
      </svg>
    ),
    accent: "hover:border-amber-400 hover:text-amber-700",
    dot: "bg-amber-400",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    handle: "Ayush Bhattacharya",
    url: "https://linkedin.com/in/ayushbhattacharya",
    desc: "Professional network & academic background",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    accent: "hover:border-blue-400 hover:text-blue-600",
    dot: "bg-blue-500",
  },
  {
    id: "github",
    label: "GitHub",
    handle: "ayushbhattacharya",
    url: "https://github.com/ayushbhattacharya",
    desc: "Open-source projects & engineering repositories",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
    accent: "hover:border-neutral-600 hover:text-neutral-800",
    dot: "bg-neutral-600",
  },
];

export default function ContactView({ onNavigate }: ContactViewProps) {
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailto = `mailto:ayush@ayu.vibee?subject=${encodeURIComponent(formSubject || "Contact from ayu.vibee")}&body=${encodeURIComponent(`Name: ${formName}\nEmail: ${formEmail}\n\n${formMessage}`)}`;
    window.open(mailto, "_blank");
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[#f7f4ed] text-[#1a1a1a]">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="border-b border-[#e5e1d8] px-6 md:px-20 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <span className="font-mono text-[9px] tracking-[0.4em] text-[#8b8780] uppercase block mb-4">Correspondence</span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-black leading-none">
            Let's<br />
            <em className="font-normal not-italic" style={{ fontVariantLigatures: "none" }}>connect.</em>
          </h1>
          <p className="font-serif text-base md:text-lg text-[#5f5e59] mt-6 max-w-md leading-relaxed">
            Open to editorial collaborations, print licensing, creative partnerships, and genuine conversations about light, form &amp; architecture.
          </p>

          {/* Availability badge */}
          <div className="mt-8 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#5f5e59]">
              Available for collaborations &nbsp;·&nbsp; Response within 48 hrs &nbsp;·&nbsp; Kolkata, India (IST)
            </span>
          </div>
        </div>
      </section>

      {/* ── Socials Grid ─────────────────────────────────────────────────── */}
      <section className="px-6 md:px-20 py-14 md:py-20 border-b border-[#e5e1d8]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-[#8b8780]">Platforms</span>
            <div className="flex-1 border-b border-[#e5e1d8] mx-6"></div>
            <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-[#8b8780]">{SOCIALS.length} channels</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SOCIALS.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group bg-white border border-[#e5e1d8] p-6 flex flex-col gap-4 transition-all duration-200 ${s.accent} hover:shadow-sm`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 bg-[#f7f4ed] border border-[#e5e1d8] text-[#1a1a1a] group-hover:border-current transition-colors`}>
                    {s.icon}
                  </div>
                  <span className="material-symbols-outlined text-[#d5d0c8] text-lg group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                    open_in_new
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot} flex-shrink-0`}></span>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[#8b8780]">{s.label}</span>
                  </div>
                  <p className="font-sans font-semibold text-sm text-[#1a1a1a] group-hover:text-inherit transition-colors">
                    {s.handle}
                  </p>
                  <p className="font-sans text-xs text-[#8b8780] mt-1.5 leading-relaxed">{s.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact Form ─────────────────────────────────────────────────── */}
      <section className="px-6 md:px-20 py-14 md:py-20 border-b border-[#e5e1d8]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">

          {/* Left — info */}
          <div className="space-y-8">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-[#8b8780] block mb-4">Direct Message</span>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-black">Send an enquiry</h2>
              <p className="font-sans text-sm text-[#5f5e59] mt-3 leading-relaxed">
                Fill the form and it will open your default email client, pre-populated with your message. No data is collected by this site.
              </p>
            </div>

            {/* Contact details */}
            <div className="space-y-4 border-t border-[#e5e1d8] pt-6">
              {[
                { label: "Primary Email", value: "ayush@ayu.vibee", href: "mailto:ayush@ayu.vibee" },
                { label: "Location", value: "Kolkata, West Bengal, India" },
                { label: "Timezone", value: "IST — UTC+5:30" },
                { label: "Response window", value: "24–48 hours" },
              ].map(row => (
                <div key={row.label} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 font-mono text-[10px]">
                  <span className="text-[#8b8780] uppercase tracking-wider">{row.label}</span>
                  {row.href ? (
                    <a href={row.href} className="text-[#1a1a1a] hover:underline">{row.value}</a>
                  ) : (
                    <span className="text-[#1a1a1a]">{row.value}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Quote */}
            <blockquote className="border-l-2 border-black pl-5 font-serif italic text-sm text-[#5f5e59] leading-relaxed">
              "Every great photograph begins as a conversation between the eye and the subject — let's start ours."
            </blockquote>
          </div>

          {/* Right — form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {sent && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
                <p className="font-mono text-[10px] uppercase tracking-wider text-emerald-700">
                  Email client opened! Message drafted &amp; ready to send.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="label-sm">Your Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  required
                  placeholder="Arjun Mehta"
                  className="field"
                />
              </div>
              <div className="space-y-1.5">
                <label className="label-sm">Your Email *</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  required
                  placeholder="arjun@example.com"
                  className="field"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="label-sm">Subject</label>
              <select value={formSubject} onChange={e => setFormSubject(e.target.value)} className="field">
                <option value="">Select a topic...</option>
                <option>Editorial Collaboration</option>
                <option>Print Licensing</option>
                <option>Creative Partnership</option>
                <option>Exhibition Inquiry</option>
                <option>General Inquiry</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="label-sm">Message *</label>
              <textarea
                rows={6}
                value={formMessage}
                onChange={e => setFormMessage(e.target.value)}
                required
                placeholder="Tell me about your project, idea, or just say hello..."
                className="field resize-none"
              />
              <div className="flex justify-end font-mono text-[8px] text-[#8b8780]">
                {formMessage.length} characters
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-black text-white font-mono text-[10px] tracking-[0.25em] uppercase hover:opacity-90 transition-opacity flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">send</span>
              Open Email &amp; Send
            </button>

            <p className="font-mono text-[8px] text-center text-[#8b8780] uppercase tracking-wider">
              This opens your default email app — no form data is stored here.
            </p>
          </form>
        </div>
      </section>

      {/* ── Bottom CTA strip ─────────────────────────────────────────────── */}
      <section className="px-6 md:px-20 py-12">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-[#8b8780]">Based in Kolkata, India</p>
            <p className="font-serif text-xl font-bold text-black mt-1">ayu.vibee Photography &amp; Editorial</p>
          </div>
          <div className="flex gap-3 flex-wrap justify-center sm:justify-end">
            <button
              onClick={() => onNavigate("portfolio")}
              className="px-5 py-2.5 border border-[#e5e1d8] hover:border-black font-mono text-[9px] uppercase tracking-widest text-[#5f5e59] hover:text-black transition-colors cursor-pointer"
            >
              View Portfolio
            </button>
            <button
              onClick={() => onNavigate("stories")}
              className="px-5 py-2.5 bg-black text-white font-mono text-[9px] uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer"
            >
              Read Stories
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
