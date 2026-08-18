import React, { useState } from "react";
import SpiralLoader from "./SpiralLoader";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import AyuVibeeLogo from "./AyuVibeeLogo";

interface GateKeeperProps {
  onUnlock: () => void;
  onDenied: (email: string) => void;
  onClose: () => void;
}

const ALLOWED_EMAIL = "info.cometlabs@gmail.com";

export default function GateKeeper({ onUnlock, onDenied, onClose }: GateKeeperProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [step, setStep] = useState<"idle" | "verifying">("idle");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg("");
    setStep("verifying");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (user.email?.toLowerCase() !== ALLOWED_EMAIL.toLowerCase()) {
        await signOut(auth);
        onDenied(user.email ?? "unknown");
        return;
      }

      onUnlock();
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
        setErrorMsg("Sign-in cancelled. Please try again.");
      } else if (err.code === "auth/popup-blocked") {
        setErrorMsg("Popup blocked by browser. Please allow popups for this site and try again.");
      } else {
        setErrorMsg(err.message || "Google authentication failed. Please try again.");
      }
      setStep("idle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="state-screen fixed inset-0 z-50 bg-[var(--background)] text-[var(--foreground)] overflow-y-auto flex flex-col justify-between">

      <header className="state-header px-4 sm:px-6 lg:px-10 py-5 flex justify-between items-center border-b border-[var(--border)]">
        <div className="flex items-center space-x-3 text-[#8b8780]">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-none animate-pulse"></span>
          <span className="font-mono text-[9px] tracking-widest uppercase">
            {step === "verifying" ? "GATE_STATUS: VERIFYING IDENTITY" : "GATE_STATUS: AWAITING AUTHENTICATION"}
          </span>
        </div>
        <button
          onClick={onClose}
          disabled={loading}
          className="font-mono text-[9px] tracking-widest text-[#8b5e20] uppercase hover:text-black transition-colors cursor-pointer disabled:opacity-40"
        >
          CLOSE ×
        </button>
      </header>

      <main className="state-card max-w-sm w-full mx-auto px-6 py-10 flex flex-col items-center">

        <div className="mb-8">
          <AyuVibeeLogo size="lg" theme="dark" />
        </div>

        <div className="text-center mb-8">
          <span className="font-mono text-[9px] tracking-[0.4em] text-[#8b8780] uppercase block">ADMINISTRATOR ACCESS</span>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-black mt-2">SECURE PORTAL</h1>
          <p className="font-mono text-[9px] text-[#8b8780] mt-2 leading-relaxed uppercase tracking-wider">
            Restricted to the site curator. Sign in with your authorised Google account.
          </p>
        </div>

        <div className="relative w-60 h-36 flex items-center justify-center my-4">
          <div className="absolute inset-0">
            <svg viewBox="0 0 100 50" fill="none" className="w-full h-full">
              <path d="M 5,25 Q 50,2 95,25 Q 50,48 5,25 Z" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-black/10" />
              <path d="M 12,25 Q 50,7 88,25 Q 50,43 12,25 Z" stroke="currentColor" strokeWidth="0.25" strokeDasharray="2 3" fill="none" className="text-black/10" />
            </svg>
          </div>
          <div className="z-10 flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <SpiralLoader size={100} showText={false} />
                <span className="font-mono text-[8px] tracking-widest text-black/50 uppercase animate-pulse">
                  {step === "verifying" ? "VERIFYING..." : "AUTHENTICATING..."}
                </span>
              </div>
            ) : (
              <SpiralLoader size={110} showText={false} />
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="w-full p-3 border border-amber-200 bg-amber-50 text-center mb-4">
            <p className="font-mono text-[9px] tracking-wider uppercase leading-relaxed text-amber-800">{errorMsg}</p>
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="button-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4 flex-shrink-0 group-hover:brightness-0 group-hover:invert transition-all" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.47 15 0 12 0 7.37 0 3.39 2.67 1.45 6.57l3.82 2.96c.9-2.7 3.42-4.49 6.73-4.49z" />
            <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.45h6.46c-.28 1.47-1.11 2.72-2.36 3.56l3.66 2.84c2.14-1.97 3.37-4.88 3.37-8.25z" />
            <path fill="#FBBC05" d="M5.27 14.53c-.23-.69-.36-1.43-.36-2.2s.13-1.51.36-2.2L1.45 7.17C.52 9.03 0 11.08 0 13.2s.52 4.17 1.45 6.03L5.27 14.53z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-4.3 1.09-3.31 0-5.83-1.79-6.83-4.49L1.45 17.81C3.39 21.33 7.37 24 12 24z" />
          </svg>
          <span>{loading ? "CONNECTING TO GOOGLE..." : "SIGN IN WITH GOOGLE"}</span>
        </button>

        <p className="font-mono text-[8px] text-[#8b8780] text-center mt-5 uppercase tracking-wider leading-relaxed">
          Authentication is handled securely via Google OAuth 2.0. No passwords are stored.
        </p>
      </main>

      <footer className="state-footer px-4 sm:px-6 lg:px-10 py-5 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center text-[var(--muted-foreground)] gap-3">
        <div className="flex flex-wrap gap-5 items-center justify-center">
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
            <span className="font-mono text-[8px] uppercase tracking-widest">Google OAuth 2.0</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
            <span className="font-mono text-[8px] uppercase tracking-widest">Firebase Auth</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
            <span className="font-mono text-[8px] uppercase tracking-widest">Zero Password Storage</span>
          </div>
        </div>
        <div className="font-mono text-[8px] uppercase tracking-widest text-[#8b8780]">
          AYU.VIBEE © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
