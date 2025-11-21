import React, { useState, useEffect } from 'react';
import { Hero } from './components/Hero';
import { ArtGallery } from './components/ArtGallery';
import { MusicVisualizer } from './components/MusicVisualizer';
import { MuseAI } from './components/MuseAI';
import { StoryTelling } from './components/StoryTelling';
import { Confession } from './components/Confession';
import { FlowerCursor } from './components/FlowerCursor';
import { Strength } from './components/Strength';
import { SelectionVine } from './components/SelectionVine';
import { VerticalDialNav } from './components/VerticalDialNav';
import { Section } from './types';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { playHoverSound, playClickSound } from './utils/audio';
import { Play, Sparkles, Monitor } from 'lucide-react';
import { ConicGradientButton } from './components/ConicGradientButton';
import { SexyScroll, SexyScrollRef } from './components/SexyScroll';
import { TypewriterLoader } from './components/TypewriterLoader';

const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<Section>(Section.HERO);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const { scrollYProgress } = useScroll();
  const sexyScrollRef = React.useRef<SexyScrollRef>(null);
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const scrollToSection = (section: Section) => {
    const element = document.getElementById(section);
    if (element) {
      // Calculate target position
      const top = element.getBoundingClientRect().top + window.scrollY;

      // Use SexyScroll if available for consistent physics
      if (sexyScrollRef.current) {
        sexyScrollRef.current.scrollTo(top);
      } else {
        // Fallback
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Prevent scrolling while on the start screen and ensure scroll is at top when starting
  useEffect(() => {
    if (!started) {
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0); // Ensure we're at the top
    } else {
      document.body.style.overflow = 'unset';
      // Force scroll to top when starting to prevent progress bar flash
      window.scrollTo(0, 0);

      let accumulatedDelta = 0;
      let isLocked = false;
      // Increased threshold to trigger on approx 3 scroll wheel ticks (3 * 100 = 300)
      const SCROLL_THRESHOLD = 200;

      const handleWheel = (e: WheelEvent) => {
        // Only trigger if we are effectively in the Hero section (top of page)
        // and not currently animating/locked
        if (window.scrollY < window.innerHeight * 0.8 && !isLocked && started) {
          if (e.deltaY > 0) {
            // Accumulate downward scroll
            accumulatedDelta += e.deltaY;

            if (accumulatedDelta > SCROLL_THRESHOLD) {
              isLocked = true;
              scrollToSection(Section.GALLERY);

              // Reset lock after animation buffer
              setTimeout(() => {
                isLocked = false;
                accumulatedDelta = 0;
              }, 1200);
            }
          } else {
            // Reset if scrolling up
            accumulatedDelta = 0;
          }
        } else {
          // Reset if out of Hero
          accumulatedDelta = 0;
        }
      };

      window.addEventListener('wheel', handleWheel, { passive: true });
      return () => window.removeEventListener('wheel', handleWheel);
    }
  }, [started]);

  // Robust Scroll Spy Logic using Bounding Client Rects
  useEffect(() => {
    if (!started) return;

    const handleScroll = () => {
      const sections = Object.values(Section);
      const viewportMiddle = window.innerHeight / 2;

      // Find the section that currently crosses the middle of the viewport
      const activeSection = sections.find(section => {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Active if the top is above the middle AND the bottom is below the middle
          return rect.top <= viewportMiddle && rect.bottom >= viewportMiddle;
        }
        return false;
      });

      if (activeSection) {
        setCurrentSection(activeSection);
      }
    };

    // Throttle scroll event slightly for performance if needed, 
    // but direct calculation is usually fine for this number of elements.
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Check on mount
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [started]);

  const handleStart = () => {
    // Mobile Detection
    if (window.innerWidth < 768) {
      setShowMobileWarning(true);
      playClickSound(); // Optional sound feedback
      return;
    }

    // Attempt to enter fullscreen
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.warn("Fullscreen denied:", err);
        });
      }
    } catch (e) {
      console.warn("Fullscreen not supported");
    }

    window.scrollTo(0, 0); // Reset scroll position to top
    playClickSound(); // This unlocks AudioContext
    setLoading(true); // Start loading sequence
  };

  const handleLoadingComplete = () => {
    setLoading(false);
    setStarted(true);
  };

  return (
    <SexyScroll ref={sexyScrollRef}>
      <div className="bg-black min-h-screen text-white selection:bg-purple-900/30 selection:text-purple-100 cursor-none relative">
        {/* Persistent Black Curtain to prevent content flash */}
        <AnimatePresence>
          {!started && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
              className="fixed inset-0 z-[900] bg-black pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Preloader / Start Screen */}
        <AnimatePresence>
          {!started && !loading && (
            <motion.div
              key="start-screen"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
              className="fixed inset-0 z-[999] bg-black/0 flex flex-col items-center justify-center overflow-hidden"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="text-center"
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="font-serif-custom text-lg text-gray-500 italic mb-4"
                >
                  For Drashti
                </motion.p>
                <h1 className="font-serif-custom text-6xl md:text-8xl text-white mb-12 tracking-tighter">
                  The Vision
                </h1>
                <ConicGradientButton onClick={handleStart} onMouseEnter={playHoverSound}>
                  Enter <Sparkles size={12} />
                </ConicGradientButton>
              </motion.div>
            </motion.div>
          )}
          {loading && (
            <TypewriterLoader key="loader" onComplete={handleLoadingComplete} />
          )}
        </AnimatePresence>

        {/* Mobile Warning Modal */}
        <AnimatePresence>
          {showMobileWarning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass-panel p-10 rounded-2xl max-w-md text-center border border-white/10 shadow-2xl"
              >
                <div className="mb-6 flex justify-center">
                  <div className="p-4 bg-white/5 rounded-full border border-white/10">
                    <Monitor className="text-purple-300 w-8 h-8" />
                  </div>
                </div>
                <h3 className="font-serif-custom text-3xl text-white mb-4">Experience Not Supported</h3>
                <p className="font-montserrat text-gray-300 leading-loose text-sm mb-8">
                  "I know you want to see and end it quickly but for the potential use please use desktop or big screen then this device."
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setShowMobileWarning(false)}
                    className="px-8 py-3 bg-white/10 text-white font-montserrat text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-colors rounded-sm border border-white/20"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={() => {
                      setShowMobileWarning(false);
                      window.scrollTo(0, 0);
                      playClickSound();
                      setLoading(true);
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-montserrat text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity rounded-sm shadow-lg shadow-purple-500/30"
                  >
                    Proceed Anyway
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Film Grain Texture for Depth */}
        <div
          className="fixed inset-0 pointer-events-none z-[90] opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Scroll Progress Bar - Only show after experience starts */}
        <AnimatePresence>
          {started && (
            <motion.div
              initial={{ scaleX: 0 }}
              className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 transform origin-left z-[100]"
              style={{ scaleX }}
            />
          )}
        </AnimatePresence>

        {/* Custom Cursor Overlay */}
        <FlowerCursor />

        {/* Selection Text Vine Effect */}
        <SelectionVine />

        {/* Navigation Dial */}
        <VerticalDialNav currentSection={currentSection} onNavigate={scrollToSection} />

        <main className="relative z-10">
          <div id={Section.HERO}>
            <Hero onNavigate={scrollToSection} />
          </div>

          <div id={Section.GALLERY}>
            <ArtGallery />
          </div>

          <div id={Section.STORY}>
            <StoryTelling />
          </div>

          <div id={Section.MUSIC}>
            <MusicVisualizer />
          </div>

          <div id={Section.POETRY}>
            <MuseAI />
          </div>

          <div id={Section.STRENGTH}>
            <Strength />
          </div>

          <div id={Section.CONFESSION}>
            <Confession />
          </div>
        </main>

        <footer className="py-12 text-center text-gray-600 text-sm font-montserrat border-t border-white/5 bg-[#050505] relative z-10">
          <p className="tracking-widest uppercase text-xs mb-2">The Vision</p>
          <p className="opacity-50">Created with love, code, and ink. For Drashti.</p>
        </footer>
      </div>
    </SexyScroll>
  );
};

export default App;
