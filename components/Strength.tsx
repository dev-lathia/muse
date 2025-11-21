
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Flame, Shield } from 'lucide-react';

export const Strength: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <section ref={containerRef} className="min-h-screen w-full bg-[#050505] relative overflow-hidden flex items-center justify-center py-24">
      
      {/* Parallax Typography Background */}
      <div className="absolute inset-0 pointer-events-none z-0 flex flex-col justify-center opacity-10 select-none overflow-hidden">
        <motion.h1 style={{ x: y1 }} className="text-[15vw] font-black text-white/20 whitespace-nowrap font-serif-custom leading-none">
          UNBROKEN
        </motion.h1>
        <motion.h1 style={{ x: y2 }} className="text-[15vw] font-black text-transparent stroke-white stroke-2 whitespace-nowrap font-montserrat leading-none ml-32">
          FIERCE
        </motion.h1>
        <motion.h1 style={{ x: y3 }} className="text-[15vw] font-black text-white/20 whitespace-nowrap font-serif-custom leading-none -ml-20">
          INDEPENDENT
        </motion.h1>
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-orange-500/10 rounded-full">
              <Flame className="text-orange-500" size={24} />
            </div>
            <span className="text-orange-400 font-montserrat tracking-widest text-sm uppercase">The Fire Within</span>
          </div>
          
          <h2 className="font-serif-custom text-5xl md:text-6xl text-white mb-8 leading-tight">
            She who walks through fire <br/>
            <span className="italic text-gray-500">does not burn.</span>
          </h2>
          
          <div className="space-y-6 text-gray-300 font-light text-lg leading-relaxed font-montserrat">
            <p>
              I see the battles you fight in silence. The way you stand firm against the waves of expectation, refusing to drown in tradition that doesn't serve you.
            </p>
            <p>
              Your independence isn't rebellion; it's survival. It's the armor you forged yourself. And it is the most beautiful thing I have ever seen.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
           <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl blur-2xl opacity-20 animate-pulse" />
           <div className="glass-panel p-10 rounded-2xl border border-orange-500/20 relative">
              <Shield className="w-16 h-16 text-white/80 mb-6" strokeWidth={1} />
              <p className="font-serif-custom text-3xl text-white italic mb-6">
                "A strong woman stands up for herself. A stronger woman stands up for everyone else."
              </p>
              <div className="h-1 w-20 bg-orange-500 rounded-full" />
           </div>
        </motion.div>
      </div>
    </section>
  );
};
