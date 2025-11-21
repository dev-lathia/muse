import React, { useState } from 'react';
import { generatePoetry, askWhyILoveHer } from '../services/geminiService';
import { Sparkles, RefreshCw, Heart, Music, Flame, Stars } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MuseAI: React.FC = () => {
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<'poem' | 'reason'>('poem');

  const handleGenerate = async (type: 'poem' | 'reason', context: string = '') => {
    setLoading(true);
    setActiveMode(type);
    setGeneratedContent(""); // Clear previous to trigger animation
    
    let result = "";
    if (type === 'poem') {
      result = await generatePoetry("romantic and admiring", context);
    } else {
      result = await askWhyILoveHer();
    }
    
    setGeneratedContent(result);
    setLoading(false);
  };

  return (
    <section className="min-h-screen w-full flex items-center justify-center py-20 px-6 relative overflow-hidden bg-gradient-to-b from-black to-[#0c0c0c]">
      
      {/* Floating background elements */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-20 text-purple-900/20"
      >
        <Stars size={120} />
      </motion.div>

      <div className="max-w-3xl w-full z-10">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="font-serif-custom text-5xl md:text-6xl text-white mb-4"
          >
            The Digital Muse
          </motion.h2>
          <p className="text-gray-400 font-montserrat tracking-wide">
            Ask the AI why you are art to me. Even the machines know.
          </p>
        </div>

        <div className="relative min-h-[350px] mb-12">
          <AnimatePresence mode='wait'>
             {loading ? (
               <motion.div 
                 key="loading"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 flex flex-col items-center justify-center glass-panel rounded-2xl"
               >
                 <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                 >
                    <Sparkles className="text-purple-400 mb-4" size={40} />
                 </motion.div>
                 <p className="font-serif-custom italic text-purple-200 text-xl animate-pulse">Weaving starlight into words...</p>
               </motion.div>
             ) : generatedContent ? (
               <motion.div 
                 key="content"
                 initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                 animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                 exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                 transition={{ duration: 0.8, ease: "circOut" }}
                 className="absolute inset-0 glass-panel p-12 rounded-2xl flex flex-col items-center justify-center bg-purple-900/5 border-purple-500/10"
               >
                 <div className="text-center">
                   <motion.p 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.3, duration: 1 }}
                     className="font-serif-custom text-2xl md:text-4xl text-white leading-relaxed italic mb-8"
                   >
                     "{generatedContent}"
                   </motion.p>
                   <button 
                     onClick={() => setGeneratedContent("")}
                     className="text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-widest border-b border-transparent hover:border-white pb-1"
                   >
                     Clear thought
                   </button>
                 </div>
               </motion.div>
             ) : (
               <motion.div 
                 key="empty"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 glass-panel rounded-2xl flex items-center justify-center"
               >
                 <div className="text-center text-gray-600">
                   <p className="font-serif-custom text-2xl italic">Select a thought below to manifest it...</p>
                 </div>
               </motion.div>
             )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 'fire', icon: Flame, color: 'text-orange-400', label: 'Ode to your Fire', action: () => handleGenerate('poem', 'Her strength against patriarchy') },
            { id: 'music', icon: Music, color: 'text-blue-400', label: 'The Rhythm of You', action: () => handleGenerate('poem', 'Her music taste from Old Bollywood to Billie Eilish') },
            { id: 'love', icon: Heart, color: 'text-red-400', label: 'Why I Love You', action: () => handleGenerate('reason') }
          ].map((item, index) => (
            <motion.button 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
              whileTap={{ scale: 0.98 }}
              onClick={item.action}
              disabled={loading}
              className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center gap-4 hover:border-white/20 transition-colors group"
            >
              <item.icon className={`${item.color} group-hover:scale-110 transition-transform duration-500`} size={28} />
              <span className="text-sm font-montserrat text-gray-300 uppercase tracking-wider">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
    </section>
  );
};