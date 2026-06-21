import React, { useState } from "react";
import SpiralLoader from "./SpiralLoader";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";

interface GateKeeperProps {
  onUnlock: () => void;
  onClose: () => void;
}

export default function GateKeeper({ onUnlock, onClose }: GateKeeperProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    setTimeout(() => {
      if (password === "ayush_2026") {
        onUnlock();
      } else {
        setErrorMsg("CREDENTIAL REJECTED. ENTRY ACCESS DENIED.");
        setPassword("");
      }
      setLoading(false);
    }, 1200);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      await signInWithPopup(auth, googleProvider);
      onUnlock();
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      setErrorMsg(err.message || "Google authentication failed. Please enter admin bypass code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f7f4ed] overflow-y-auto flex flex-col justify-between">
      
      {/* Header telemetry / coordinates (Minimal & Clean) */}
      <header className="px-6 md:px-12 py-6 flex justify-between items-center border-b border-[#e5e1d8]">
        <div className="flex items-center space-x-3 text-[#8b8780]">
          <span className="w-1.5 h-1.5 bg-[#d97706] rounded-none animate-pulse"></span>
          <span className="font-mono text-[9px] tracking-widest uppercase">GATE_STATUS: INTERRUPTED</span>
        </div>
        <div className="font-mono text-[9px] tracking-widest text-[#8b5e20] uppercase">
          SECURE_NODE: 77.24.0.1
        </div>
      </header>

      {/* Main Lock Centerpiece */}
      <main className="max-w-md w-full mx-auto px-6 py-10 flex flex-col items-center">
        
        {/* Track Title */}
        <div className="text-center mb-6">
          <span className="font-mono text-[10px] tracking-[0.4em] text-[#8b8780] uppercase block">AESTHETE SECURITY GATE</span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-black mt-2 uppercase">PRIVATE ACCESS</h1>
        </div>

        {/* Eye shaped centerpiece enclosing Spiral Loader */}
        <div className="relative w-72 h-44 flex items-center justify-center my-6">
          {/* Eye Outer Contour (using gorgeous absolute SVGs) */}
          <div className="absolute inset-0">
            <svg viewBox="0 0 100 50" fill="none" className="w-full h-full text-[#8b8780]/20 text-black/10">
              <path 
                d="M 5,25 Q 50,2 95,25 Q 50,48 5,25 Z" 
                stroke="currentColor" 
                strokeWidth="0.5"
                fill="none"
              />
              <path 
                d="M 12,25 Q 50,7 88,25 Q 50,43 12,25 Z" 
                stroke="currentColor" 
                strokeWidth="0.25"
                strokeDasharray="2 3"
                fill="none"
              />
            </svg>
          </div>

          {/* Internal Iris containing Spiral */}
          <div className="z-10 flex items-center justify-center scale-95">
            {loading ? (
              <div className="flex flex-col items-center">
                <SpiralLoader size={120} showText={false} />
                <span className="font-mono text-[8px] tracking-widest text-black/60 uppercase animate-pulse mt-2">DECRYPTING...</span>
              </div>
            ) : (
              <SpiralLoader size={130} showText={false} />
            )}
          </div>
        </div>

        {/* Input Interface */}
        <div className="w-full transition-all duration-300">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            
            {/* Password Dot indicators simulated */}
            <div className="space-y-1.5">
              <label className="font-mono text-[9px] tracking-widest uppercase text-[#5f5e59] block">
                ADMIN ACCESS BYPASS CODE
              </label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-white border border-[#e5e1d8] rounded-none focus:outline-none focus:border-black font-mono text-center tracking-widest text-sm"
              />
              <p className="font-mono text-[8px] text-[#8b8780] text-center uppercase tracking-wider">
                Hint: Use <span className="font-bold text-black border-b border-black">ayush_2026</span> or sign-in with your Google account.
              </p>
            </div>

            {errorMsg && (
              <div className="p-2.5 border border-red-200 bg-red-50 text-red-700 font-mono text-[9px] text-center tracking-wider uppercase">
                {errorMsg}
              </div>
            )}

            {/* Buttons UI */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="py-3 bg-black text-white font-mono text-[10.5px] uppercase tracking-widest hover:opacity-90 disabled:opacity-50 cursor-pointer text-center"
              >
                UNLOCK KEY
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="py-3 border border-black text-black font-mono text-[10.5px] uppercase tracking-widest hover:bg-neutral-100 disabled:opacity-50 cursor-pointer"
              >
                CLOSE PORTAL
              </button>
            </div>

          </form>

          {/* OR Divider */}
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-[#e5e1d8]"></div>
            <span className="flex-shrink mx-4 font-mono text-[8px] text-[#8b8780] tracking-wider uppercase">OR GOOGLE AUTH IDENTIFICATION</span>
            <div className="flex-grow border-t border-[#e5e1d8]"></div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3.5 bg-white border border-[#e5e1d8] hover:border-black text-black font-sans font-medium text-[11px] tracking-widest uppercase flex items-center justify-center gap-2.5 cursor-pointer cubic-transition"
          >
            {/* Google Vector Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.47 15 0 12 0 7.37 0 3.39 2.67 1.45 6.57l3.82 2.96c.9-2.7 3.42-4.49 6.73-4.49z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.45h6.46c-.28 1.47-1.11 2.72-2.36 3.56l3.66 2.84c2.14-1.97 3.37-4.88 3.37-8.25z"
              />
              <path
                fill="#FBBC05"
                d="M5.27 14.53c-.23-.69-.36-1.43-.36-2.2s.13-1.51.36-2.2L1.45 7.17C.52 9.03 0 11.08 0 13.2s.52 4.17 1.45 6.03L5.27 14.53z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-4.3 1.09-3.31 0-5.83-1.79-6.83-4.49L1.45 17.81C3.39 21.33 7.37 24 12 24z"
              />
            </svg>
            <span>SIGN IN WITH GOOGLE</span>
          </button>
        </div>
      </main>

      {/* Telemetry Footer */}
      <footer className="px-6 md:px-12 py-6 border-t border-[#e5e1d8] flex flex-col md:flex-row justify-between items-center text-[#8b8780] gap-4 md:gap-0">
        <div className="flex flex-wrap gap-6 items-center justify-center">
          <div className="flex items-center space-x-1.5">
            <span className="material-symbols-outlined text-[15px]">verified_user</span>
            <span className="font-mono text-[9px] uppercase tracking-widest">Encrypted Pipeline</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="material-symbols-outlined text-[15px]">vpn_lock</span>
            <span className="font-mono text-[9px] uppercase tracking-widest">Isolated Sandbox</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="material-symbols-outlined text-[15px]">sensors</span>
            <span className="font-mono text-[9px] uppercase tracking-widest">Telemetry Active</span>
          </div>
        </div>
        <div className="font-mono text-[8.5px] uppercase tracking-[0.1em]">
          EXHIBIT SYSTEM REPLICATOR VER: 24.11.23
        </div>
      </footer>

    </div>
  );
}
