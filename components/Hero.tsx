import React, { useEffect } from 'react';
import { Section } from '../types';
import { ChevronDown, Sparkles } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, Variants } from 'framer-motion';

interface HeroProps {
  onNavigate: (section: Section) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  // Mouse position state for Framer Motion
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the mouse movement using spring physics
  const springConfig = { damping: 50, stiffness: 100 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Normalize coordinates from -1 to 1
      const x = (e.clientX / innerWidth) * 2 - 1;
      const y = (e.clientY / innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Define independent parallax layers with SUBTLE ranges
  const bgX = useTransform(smoothX, [-1, 1], [-10, 10]);
  const bgY = useTransform(smoothY, [-1, 1], [-10, 10]);

  const titleX = useTransform(smoothX, [-1, 1], [-25, 25]);
  const titleY = useTransform(smoothY, [-1, 1], [-25, 25]);

  const subX = useTransform(smoothX, [-1, 1], [-15, 15]);
  const subY = useTransform(smoothY, [-1, 1], [-15, 15]);

  const textX = useTransform(smoothX, [-1, 1], [-12, 12]);
  const textY = useTransform(smoothY, [-1, 1], [-12, 12]);

  // Animation variants
  const titleVariant: Variants = {
    hidden: { y: 100, opacity: 0, filter: 'blur(20px)' },
    visible: {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 1.2,
        ease: "easeOut",
        delay: 0.5
      },
    },
  };

  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-black">
      {/* Background Ambient Effects */}
      <motion.div 
        style={{ x: bgX, y: bgY }}
        className="absolute inset-0 opacity-30 pointer-events-none"
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/40 rounded-full blur-[128px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900/30 rounded-full blur-[128px] animate-float" style={{ animationDelay: '2s' }} />
      </motion.div>

      {/* Parallax Content Container */}
      <div className="z-10 text-center px-6 relative perspective-[1000px]">
        
        {/* Layer 1: The Muse Tag */}
        <motion.div 
          style={{ x: subX, y: subY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="text-sm uppercase tracking-[0.3em] text-purple-300/80 font-montserrat">The Muse</span>
        </motion.div>
        
        {/* Layer 2: Main Title (Single Text Node for Better Selection) */}
        <motion.div style={{ x: titleX, y: titleY }} className="relative inline-block">
          <motion.h1 
            variants={titleVariant}
            initial="hidden"
            animate="visible"
            className="font-serif-custom text-7xl md:text-9xl text-white leading-tight mb-4 relative z-10 select-text"
          >
            Drashti
          </motion.h1>
        </motion.div>
        
        {/* Layer 3: Subtitle */}
        <motion.div style={{ x: subX, y: subY }}>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 1.2, ease: "easeOut" }}
            className="font-montserrat text-sm md:text-lg text-gray-400 tracking-widest uppercase"
          >
            The Meaning of Sight • The Vision
          </motion.p>
        </motion.div>

        {/* Layer 4: Quote - Aligned with other layers */}
        <motion.div 
          style={{ x: textX, y: textY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1.5 }}
          className="mt-12 max-w-xl mx-auto"
        >
          <p className="text-gray-500 font-light italic">
            "I paint because words fail. I write because silence is too loud. <br/>
            I built this because my heart needed a canvas large enough for you."
          </p>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.button 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        onClick={() => onNavigate(Section.GALLERY)}
        className="absolute bottom-12 animate-bounce text-gray-500 hover:text-white transition-colors duration-300 z-20"
      >
        <ChevronDown size={32} />
      </motion.button>
    </section>
  );
};