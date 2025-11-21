
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Play, Pause, Disc, Mic2, Sparkles, Music2, SkipForward, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playClickSound, playHoverSound, playVibeSound } from '../utils/audio';

type VibeType = 'classic' | 'dark' | 'pop';

interface VibeConfig {
  id: VibeType;
  artist: string;
  track: string;
  color: string;
  gradient: string;
  description: string;
  icon: React.ElementType;
  quote: string;
}

const VIBES: Record<VibeType, VibeConfig> = {
  classic: {
    id: 'classic',
    artist: "Golden Era",
    track: "Ehsaan Tera Hoga Mujh Par",
    color: "#d4b996", // Warm Gold
    gradient: "from-[#1a150e] via-[#2c2216] to-[#0a0a0a]",
    description: "The timeless soul of Mohammad Rafi. Pure, unfiltered emotion in Black & White.",
    icon: Disc,
    quote: "Old soul, warm heart."
  },
  dark: {
    id: 'dark',
    artist: "Billie Eilish",
    track: "Happier Than Ever",
    color: "#4ade80", // Neon Green
    gradient: "from-[#051a0d] via-[#0a2615] to-[#000000]",
    description: "Modern rebellion. Deep bass, whispers, and the courage to be broken.",
    icon: Mic2,
    quote: "I'm not your party favor."
  },
  pop: {
    id: 'pop',
    artist: "Harry Styles",
    track: "As It Was",
    color: "#f472b6", // Pink
    gradient: "from-[#1e1b4b] via-[#312e81] to-[#0f0f0f]",
    description: "Technicolor euphoria. Freedom, sunshine, and dancing in the rain.",
    icon: Sparkles,
    quote: "You know it's not the same as it was."
  }
};

export const MusicVisualizer: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVibe, setCurrentVibe] = useState<VibeType>('classic');

  const activeConfig = VIBES[currentVibe];

  const handleVibeChange = (vibe: VibeType) => {
    if (vibe !== currentVibe) {
      setCurrentVibe(vibe);
      playVibeSound(vibe);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 300;
    const height = 300;

    svg.selectAll("*").remove();

    // Create simulated data
    const data = Array.from({ length: 64 }, () => Math.random() * 50 + 20);

    const center = { x: width / 2, y: height / 2 };
    const angleStep = (Math.PI * 2) / data.length;

    const bars = svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", center.x)
      .attr("y", center.y)
      .attr("width", 3)
      .attr("fill", activeConfig.color)
      .attr("opacity", 0.7)
      .attr("rx", 1.5);

    let animationFrame: number;
    let time = 0;

    const animate = () => {
      time += 0.05;

      if (!isPlaying) {
        bars.transition().duration(500).attr("height", 10).attr("transform", (d, i) => {
          const angle = i * angleStep;
          return `rotate(${(angle * 180) / Math.PI}, ${center.x}, ${center.y}) translate(0, 40)`;
        })
          .attr("fill", activeConfig.color); // Ensure color updates even when paused
        return;
      }

      // Update data based on Vibe logic
      let modifier = 1;
      if (currentVibe === 'dark') modifier = 1.5; // More bass/movement
      if (currentVibe === 'classic') modifier = 0.8; // Smoother

      // Generate pseudo-waveform
      const newData = data.map((_, i) => {
        const noise = Math.sin(time * 2 + i * 0.2) * 20 + Math.cos(time * 5 + i * 0.5) * 10;
        const beat = Math.sin(time * modifier) > 0.8 ? 40 : 0; // Fake beat
        return 30 + Math.abs(noise) + beat;
      });

      bars.data(newData)
        .attr("height", d => d)
        .attr("transform", (d, i) => {
          const angle = i * angleStep;
          return `rotate(${(angle * 180) / Math.PI}, ${center.x}, ${center.y}) translate(0, 40)`;
        })
        .attr("fill", (d, i) => {
          // Dynamic Coloring
          if (currentVibe === 'pop') return d3.interpolateCool(i / data.length);
          if (currentVibe === 'dark') return i % 2 === 0 ? '#4ade80' : '#14532d';
          return activeConfig.color;
        });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, currentVibe, activeConfig.color]);

  return (
    <section className={`w-full min-h-screen py-24 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-1000 bg-gradient-to-b ${activeConfig.gradient}`}>

      {/* Floating Particles/Effects based on Vibe */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        {currentVibe === 'classic' && (
          <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-50" />
        )}
        {currentVibe === 'dark' && (
          <div className="absolute top-0 w-full h-1 bg-green-500 shadow-[0_0_20px_#4ade80] animate-pulse" />
        )}
        {currentVibe === 'pop' && (
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-blue-500/20 mix-blend-overlay" />
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-12 max-w-6xl w-full mx-auto px-6 items-center z-10">

        {/* Interactive Playlist Control */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-2"
          >
            <h2 className="font-serif-custom text-5xl text-white">Her Sonic World</h2>
            <p className="font-montserrat text-white/60 text-lg">
              Select a vibe to tune into her frequency.
            </p>
          </motion.div>

          <div className="flex flex-col gap-4">
            {(Object.values(VIBES) as VibeConfig[]).map((vibe) => (
              <button
                key={vibe.id}
                onMouseEnter={playHoverSound}
                onClick={() => handleVibeChange(vibe.id)}
                className={`relative group overflow-hidden p-4 rounded-xl border transition-all duration-300 text-left
                  ${currentVibe === vibe.id
                    ? `bg-white/10 border-${activeConfig.color} scale-105 shadow-2xl`
                    : 'bg-black/20 border-white/5 hover:bg-white/5'
                  }`}
                style={{ borderColor: currentVibe === vibe.id ? vibe.color : '' }}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300"
                    style={{ backgroundColor: currentVibe === vibe.id ? vibe.color : '#333', color: currentVibe === vibe.id ? '#000' : '#fff' }}
                  >
                    <vibe.icon size={20} />
                  </div>
                  <div>
                    <h3 className={`font-serif-custom text-xl transition-colors ${currentVibe === vibe.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                      {vibe.artist}
                    </h3>
                    <p className="text-xs text-white/50 font-montserrat uppercase tracking-wider">{vibe.track}</p>
                  </div>

                  {currentVibe === vibe.id && (
                    <div className="ml-auto animate-pulse">
                      <Radio size={18} style={{ color: vibe.color }} />
                    </div>
                  )}
                </div>

                {/* Hover Glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                  style={{ backgroundColor: vibe.color }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Visualizer & Player */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-[350px] h-[350px] group cursor-pointer" onClick={() => { playClickSound(); setIsPlaying(!isPlaying); }}>
            {/* D3 SVG */}
            <svg ref={svgRef} width="300" height="300" className="overflow-visible absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 transition-transform duration-500 group-hover:scale-110" />

            {/* Central Vinyl/Artwork */}
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border-8 shadow-2xl flex items-center justify-center z-10 overflow-hidden bg-black"
              style={{ borderColor: '#1a1a1a' }}
            >
              {/* Simulated Album Art Gradient */}
              <div className="absolute inset-0 opacity-60" style={{ background: `radial-gradient(circle, ${activeConfig.color}, transparent)` }} />
              <div className="relative z-10 w-12 h-12 bg-black/80 rounded-full border-2 border-white/20" />
            </motion.div>

            {/* Play Overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center text-black shadow-lg backdrop-blur-sm">
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
              </div>
            </div>
          </div>

          {/* Track Info */}
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentVibe}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center mt-8 space-y-2"
            >
              <h4 className="text-2xl font-bold text-white font-serif-custom">{activeConfig.track}</h4>
              <p className="text-sm text-white/60 font-montserrat max-w-xs mx-auto leading-relaxed">
                {activeConfig.description}
              </p>
              <p
                className="text-xs font-bold uppercase tracking-[0.2em] mt-4 pt-4 border-t border-white/10 inline-block px-4"
                style={{ color: activeConfig.color }}
              >
                {activeConfig.quote}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
