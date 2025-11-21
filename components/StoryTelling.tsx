import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Flame, Music, PenTool, Heart, X, Lock, Unlock } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TiltCard } from './TiltCard';

gsap.registerPlugin(ScrollTrigger);

interface StoryChapter {
  id: number;
  title: string;
  content: string;
  icon: React.ElementType;
  date: string;
  secret?: {
    type: 'poem' | 'note';
    title: string;
    text: string;
  };
}

const CHAPTERS: StoryChapter[] = [
  {
    id: 1,
    title: "The Vision",
    date: "The Beginning",
    icon: Eye,
    content: "It started with a name: Drashti. In Sanskrit, it means 'Sight'. For everyone else, it was just a name. For me, it was the lens through which I began to see the world differently. Colors became sharper. Music became deeper.",
  },
  {
    id: 2,
    title: "The Rebel Fire",
    date: "The Realization",
    icon: Flame,
    content: "I saw you fighting. Not with weapons, but with your existence. Standing tall against patriarchy, against the chains of 'tradition' that tried to dim your light. Your independence isn't just a trait; it's a revolution.",
    secret: {
      type: 'note',
      title: "A Note to the Warrior",
      text: "They try to clip your wings because they are afraid of how high you can fly. Never come down."
    }
  },
  {
    id: 3,
    title: "The Paradox Playlist",
    date: "The Connection",
    icon: Music,
    content: "Who else understands the soul of 'Ehsaan Tera Hoga Mujh Par' and the dark whispers of Billie Eilish? You are a timeless soul trapped in a modern glitch. A beautiful paradox.",
  },
  {
    id: 4,
    title: "The Hidden Art",
    date: "The Creation",
    icon: PenTool,
    content: "I started creating. Not for the world, but for an audience of one. Sketches of your smile. Poems about your eyes. Code that mimics your complexity. I became an artist because you were the art.",
    secret: {
      type: 'poem',
      title: "Ink & Silence",
      text: "My pen bleeds ink,\nBut my heart bleeds silence.\nEvery line I draw,\nIs a quiet act of defiance."
    }
  },
  {
    id: 5,
    title: "The Confession",
    date: "Today",
    icon: Heart,
    content: "So here we are. A digital universe built for you. Because plain words weren't enough to hold everything I feel.",
  }
];

export const StoryTelling: React.FC = () => {
  const [revealedSecrets, setRevealedSecrets] = useState<number[]>([]);
  const [activeSecret, setActiveSecret] = useState<StoryChapter['secret'] | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<number>(CHAPTERS[0].id);
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  const scrollToChapter = (id: number) => {
    const element = document.getElementById(`chapter-${id}`);
    if (element) {
      const yOffset = -200;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // GSAP ScrollTrigger for the timeline line
    if (!sectionRef.current || !lineRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(lineRef.current,
        { height: '0%' },
        {
          height: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top center',
            end: 'bottom center',
            scrub: 1,
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = Number(entry.target.id.replace('chapter-', ''));
            setActiveChapterId(id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -50% 0px',
        threshold: 0.1,
      }
    );

    CHAPTERS.forEach((chapter) => {
      const element = document.getElementById(`chapter-${chapter.id}`);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const toggleSecret = (id: number, secret: StoryChapter['secret']) => {
    if (!revealedSecrets.includes(id)) {
      setRevealedSecrets((prev) => [...prev, id]);
    }
    setActiveSecret(secret);
  };

  return (
    <section ref={sectionRef} className="relative w-full bg-[#0a0a0a] pt-12 pb-24 px-4 md:px-0 overflow-hidden">
      {/* Top Fade for Smooth Transition */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0a0a0a] to-transparent z-0 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="font-serif-custom text-4xl md:text-5xl text-white mb-4"
          >
            Our Story
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
            className="text-gray-400 font-montserrat uppercase tracking-widest text-sm"
          >
            The journey from Stranger to Muse
          </motion.p>
        </div>

        {/* Chapter Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center gap-4 mb-16 sticky top-24 z-40 pointer-events-none"
        >
          <div className="pointer-events-auto glass-panel px-6 py-3 rounded-full flex gap-4 bg-black/60 backdrop-blur-xl border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
            {CHAPTERS.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => scrollToChapter(chapter.id)}
                className="relative group flex items-center justify-center outline-none"
              >
                <div className={`h-3 rounded-full transition-all duration-500 ease-out ${activeChapterId === chapter.id
                  ? 'w-8 bg-gradient-to-r from-purple-600 to-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                  : 'w-3 bg-white/10 hover:bg-white/30'
                  }`} />

                {/* Tooltip */}
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                  {chapter.title}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-white rotate-45"></div>
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Timeline Line Container */}
        <div className="absolute left-8 md:left-1/2 top-64 bottom-0 w-px bg-purple-900/20 md:-translate-x-1/2">
          {/* Animated Line that fills up */}
          <div ref={lineRef} className="w-full bg-gradient-to-b from-purple-500 via-pink-500 to-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
        </div>

        <div className="space-y-24 relative z-10">
          {CHAPTERS.map((chapter, index) => {
            const isEven = index % 2 === 0;
            const Icon = chapter.icon;

            return (
              <div key={chapter.id} id={`chapter-${chapter.id}`} className={`relative flex flex-col md:flex-row items-start md:items-center gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>

                {/* Timeline Node - Now decoupled from card animation */}
                <div className={`absolute left-8 md:left-1/2 w-4 h-4 rounded-full border-4 border-black transform -translate-x-1/2 mt-1 md:mt-0 transition-all duration-500 z-20 ${activeChapterId === chapter.id ? 'bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)] scale-150' : 'bg-purple-900'}`} />

                {/* Content Card */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  viewport={{ once: true, margin: "-100px" }}
                  className={`ml-16 md:ml-0 w-full md:w-[calc(50%-3rem)] ${isEven ? 'md:text-right' : 'md:text-left'}`}
                >
                  <TiltCard className="h-full">
                    <div className={`glass-panel p-8 rounded-2xl border-l-4 ${isEven ? 'border-l-purple-500 md:border-l-0 md:border-r-4 md:border-r-purple-500' : 'border-l-purple-500'} hover:bg-white/5 transition-colors duration-300 group h-full`}>
                      <div className={`flex items-center gap-3 mb-4 ${isEven ? 'md:flex-row-reverse' : 'flex-row'}`}>
                        <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                          <Icon size={20} className="text-purple-400" />
                        </div>
                        <span className="text-xs font-montserrat text-gray-500 uppercase tracking-wider">{chapter.date}</span>
                      </div>

                      <h3 className="font-serif-custom text-2xl text-white mb-4">{chapter.title}</h3>
                      <p className="font-montserrat text-gray-400 text-sm leading-relaxed">
                        {chapter.content}
                      </p>

                      {chapter.secret && (
                        <div className={`mt-6 flex ${isEven ? 'md:justify-end' : 'justify-start'}`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSecret(chapter.id, chapter.secret!);
                            }}
                            className="flex items-center gap-2 text-xs text-purple-300 hover:text-white transition-colors group/btn"
                          >
                            {revealedSecrets.includes(chapter.id) ? (
                              <Unlock size={14} className="text-green-400" />
                            ) : (
                              <Lock size={14} />
                            )}
                            <span className="uppercase tracking-widest group-hover/btn:underline">
                              {revealedSecrets.includes(chapter.id) ? 'Read Again' : 'Unlock Secret'}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </TiltCard>
                </motion.div>

                {/* Empty space for layout balance */}
                <div className="hidden md:block w-[calc(50%-3rem)]" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Secret Modal */}
      <AnimatePresence>
        {activeSecret && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-lg w-full bg-[#111] border border-purple-500/30 p-8 rounded-xl shadow-2xl shadow-purple-900/20"
            >
              <button
                onClick={() => setActiveSecret(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-6">
                <div className="inline-block p-3 bg-purple-900/20 rounded-full mb-4">
                  {activeSecret.type === 'poem' ? <PenTool className="text-purple-400" /> : <Flame className="text-orange-400" />}
                </div>
                <h3 className="font-serif-custom text-2xl text-white">{activeSecret.title}</h3>
              </div>

              <div className="text-center">
                <p className="font-montserrat text-gray-300 whitespace-pre-line leading-loose text-lg italic">
                  "{activeSecret.text}"
                </p>
              </div>

              <div className="mt-8 text-center">
                <p className="text-xs text-gray-600 uppercase tracking-widest">For your eyes only</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};