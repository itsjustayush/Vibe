import React, { useState, useEffect } from "react";
import Navigation, { Footer } from "./components/Navigation";
import ProfileView from "./components/ProfileView";
import StoriesView from "./components/StoriesView";
import TermsView from "./components/TermsView";
import ContactView from "./components/ContactView";
import GateKeeper from "./components/GateKeeper";
import AdminConsole from "./components/AdminConsole";
import AccessDeniedView from "./components/AccessDeniedView";
import NotFoundView from "./components/NotFoundView";
import SpiralLoader from "./components/SpiralLoader";
import AyuVibeeLogo from "./components/AyuVibeeLogo";
import SEOHead from "./components/SEOHead";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { getPhotosFromDB, getPostsFromDB, getRealInsights, trackInsightEncounter, AppInsights } from "./dbHelper";
import { Photo, Post } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { generateWebsiteSchema, generatePhotographerSchema } from "./seo/metadata";
import { observeWebVitals, setupLazyLoading, preconnect } from "./utils/performance";
import { trackPageView } from "./hooks/useAnalytics";
import { ThemeProvider } from "./contexts/ThemeContext";

export default function App() {
  const [currentView, setCurrentView] = useState<string>("portfolio");
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [showGate, setShowGate] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [deniedEmail, setDeniedEmail] = useState<string | undefined>(undefined);

  // Live database records
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [insights, setInsights] = useState<AppInsights | null>(null);

  // Monitor Auth state via Firebase SDK
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setAdminUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch collections from Firestore with dynamic seed automatic offsets
  const loadDatabaseData = async () => {
    try {
      const dbPhotos = await getPhotosFromDB();
      const dbPosts = await getPostsFromDB();
      setPhotos(dbPhotos);
      setPosts(dbPosts);
      
      const realInsights = await getRealInsights();
      setInsights(realInsights);
    } catch (err) {
      console.error("Failed to load real firestore assets", err);
    }
  };

  useEffect(() => {
    if (initialLoading) return;
    
    // Track page view for analytics
    trackPageView(currentView);
    
    if (currentView === "portfolio") {
      trackInsightEncounter("portfolioViews").then(() => {
        getRealInsights().then(setInsights);
      });
    } else if (currentView === "stories") {
      trackInsightEncounter("storyViews").then(() => {
        getRealInsights().then(setInsights);
      });
    } else if (currentView === "about") {
      trackInsightEncounter("aboutViews").then(() => {
        getRealInsights().then(setInsights);
      });
    } else if (currentView === "admin") {
      trackInsightEncounter("adminViews").then(() => {
        getRealInsights().then(setInsights);
      });
    }
  }, [currentView, initialLoading]);

  // Initialize performance monitoring and optimizations
  useEffect(() => {
    // Setup lazy loading for images
    setupLazyLoading();

    // Monitor Web Vitals
    observeWebVitals((metric) => {
      console.log(`[Web Vital] ${metric.name}: ${metric.value.toFixed(2)}`);
    });

    // Preconnect to external domains for better performance
    preconnect('fonts.googleapis.com');
    preconnect('fonts.gstatic.com');
    preconnect('static.cloudflareinsights.com');
  }, []);

  useEffect(() => {
    loadDatabaseData();

    // Initial gorgeous simulation of the six-petal mathematical curve loader
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAdminUser(null);
      setCurrentView("portfolio");
    } catch (err) {
      console.error("Signout error", err);
    }
  };

  const handleUnlockGate = () => {
    setShowGate(false);
    setCurrentView("admin");
  };

  const handleDenied = (email: string) => {
    setShowGate(false);
    setDeniedEmail(email);
    setCurrentView("access-denied");
  };

  if (initialLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#f7f4ed] flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="mb-8">
            <AyuVibeeLogo size="xl" theme="dark" />
          </div>
          <SpiralLoader size={85} showText={false} />
          <p className="font-mono text-[8px] tracking-[0.22em] text-[#8b8780] uppercase mt-8 animate-pulse text-center">
            SYSTEM CONSOLE ONLINE — RESOLVING COGNITIVE CORE
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background overflow-x-hidden text-foreground flex flex-col justify-between selection:bg-neutral-900 selection:text-white">
      {/* SEO Head Component - manages meta tags and schema markup */}
      <SEOHead 
        page={currentView} 
        schemaMarkup={[generateWebsiteSchema(), generatePhotographerSchema()]}
      />
      
      {/* Global Brand Header */}
      <Navigation 
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenGate={() => setShowGate(true)}
        isAdmin={!!adminUser}
        onLogout={handleLogout}
      />

      {/* Main Switchboard Canvas containing fluid page frames */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          
          {/* Portfolio Grid Stream */}
          {currentView === "portfolio" && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProfileView 
                photos={photos} 
                onOpenGate={() => setShowGate(true)} 
              />
            </motion.div>
          )}

          {/* Editorial Magazine STORIES */}
          {currentView === "stories" && (
            <motion.div
              key="stories"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <StoriesView 
                posts={posts} 
                onNavigate={setCurrentView} 
              />
            </motion.div>
          )}

          {/* About / Curriculum detailed view */}
          {currentView === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl mx-auto px-6 py-16 space-y-12"
            >
              <div className="border-b border-[#e5e1d8] pb-8 text-center">
                <span className="font-mono text-[9px] tracking-[0.3em] text-[#8b8780] uppercase">ACADEMIC PHILOSOPHY</span>
                <h1 className="font-serif text-3xl md:text-5xl font-medium tracking-tight text-black mt-2">Editorial About</h1>
              </div>

              <section className="space-y-6 text-base font-serif text-[#1a1a1a] leading-relaxed">
                <p className="indent-8">
                  Welcome to the digital atelier. This space belongs to <strong className="font-bold">Ayush Bhattacharya</strong>, a student pursuing rigorous higher-secondary education integrated with deep foundational studies in system engineering and low-key film-based capture curation.
                </p>
                <p>
                  As an aspiring engineer preparing for competitive admissions corridors, I spend major periods within standard mathematics blocks—deconstructing geometry, analyzing limits, and exploring kinematic trajectories of bodies in space. Visual design and photography remain a serene sanctuary for this analytical logic.
                </p>
                <blockquote className="border-l border-black pl-5 italic my-6 text-[15px] text-[#5f5e59]">
                  "There is no true conflict between binary mechanics and artistic capture. Both seek underlying structures—the pure coordinates that make a physical or digital model feel balanced, stable, and true."
                </blockquote>
                <p>
                  Built during early summer 2026, <span className="font-mono text-xs">ayu.vibee</span> leverages high-density modern Firebase servers for immediate archival sync, coupled with deep Gemini modeling frameworks to proxy real visual asset understanding on-the-fly.
                </p>
              </section>

              {/* Sanskrit Accent Block */}
              <div className="p-6 bg-black/[0.02] border border-black/10 text-center space-y-3">
                <h5 className="font-mono text-[9px] tracking-widest text-[#8b8780] uppercase">MEDITATION OF CLARITY</h5>
                <p className="font-serif italic text-lg text-black/80">
                  "चित्तवृत्तिनिरोधः — Yoga is the quietude of visual fluctuating patterns."
                </p>
                <span className="font-mono text-[8px] text-black/40 block">Patanjali Sanskrit Sutra (1.2)</span>
              </div>
            </motion.div>
          )}

          {/* Contact Page */}
          {currentView === "contact" && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <ContactView onNavigate={setCurrentView} />
            </motion.div>
          )}

          {/* Terms & Conditions Dedicated View defending copyright and avoiding plagiarism */}
          {currentView === "terms" && (
            <motion.div
              key="terms"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <TermsView onNavigate={setCurrentView} />
            </motion.div>
          )}

          {/* Secure Admin Control Board */}
          {currentView === "admin" && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <AdminConsole 
                photos={photos} 
                posts={posts} 
                insights={insights}
                onRefreshData={loadDatabaseData}
                onLogout={handleLogout}
              />
            </motion.div>
          )}

          {/* Access Denied — wrong Google account */}
          {currentView === "access-denied" && (
            <motion.div
              key="access-denied"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <AccessDeniedView
                attemptedEmail={deniedEmail}
                onReturn={() => { setDeniedEmail(undefined); setCurrentView("portfolio"); }}
              />
            </motion.div>
          )}

          {/* 404 — unknown view */}
          {!["portfolio","stories","about","contact","terms","admin","access-denied"].includes(currentView) && (
            <motion.div
              key="not-found"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <NotFoundView onReturn={() => setCurrentView("portfolio")} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* General editorial footer */}
      {currentView !== "admin" && (
        <Footer 
          onNavigate={setCurrentView} 
          onOpenGate={() => setShowGate(true)} 
        />
      )}

      {/* Hidden security gatekeeper lock overlay */}
      {showGate && (
        <GateKeeper 
          onUnlock={handleUnlockGate}
          onDenied={handleDenied}
          onClose={() => setShowGate(false)} 
        />
      )}

      </div>
    </ThemeProvider>
  );
}
