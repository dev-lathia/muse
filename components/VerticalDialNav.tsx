
import React from 'react';
import { Section } from '../types';
import { motion } from 'framer-motion';

interface VerticalDialNavProps {
  currentSection: Section;
  onNavigate: (section: Section) => void;
}

export const VerticalDialNav: React.FC<VerticalDialNavProps> = ({ currentSection, onNavigate }) => {
  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-[60] hidden md:flex flex-col items-end gap-4 pointer-events-none">
       <div className="pointer-events-auto flex flex-col gap-5 items-end">
          {Object.values(Section).map((section) => {
            const isActive = currentSection === section;
            return (
              <button
                key={section}
                onClick={() => onNavigate(section)}
                className="group relative flex items-center justify-end outline-none p-2 -mr-2"
              >
                {/* Label */}
                <span 
                  className={`mr-6 text-[10px] font-montserrat uppercase tracking-[0.2em] text-white transition-all duration-500 absolute right-4 whitespace-nowrap ${
                    isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'
                  }`}
                >
                  {section}
                </span>

                {/* Indicator Container */}
                <div className="relative w-3 h-3 flex items-center justify-center">
                   {/* The Moving Ring (Dial Effect) - Filled White */}
                   {isActive && (
                     <motion.div
                       layoutId="nav-dial-ring"
                       className="absolute inset-0 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                       transition={{ type: "spring", stiffness: 400, damping: 30 }}
                     />
                   )}
                   
                   {/* The Passive Dot - hidden when active, visible otherwise */}
                   {!isActive && (
                     <div className="w-1 h-1 rounded-full bg-white/30 group-hover:bg-white/80 transition-colors duration-300" />
                   )}
                </div>
              </button>
            );
          })}
       </div>
    </div>
  );
};
