import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConicGradientButtonProps {
    onClick: () => void;
    onMouseEnter?: () => void;
    children: React.ReactNode;
}

export const ConicGradientButton: React.FC<ConicGradientButtonProps> = ({
    onClick,
    onMouseEnter,
    children
}) => {
    const [isAnimating, setIsAnimating] = useState(true);

    useEffect(() => {
        // Stop animation after 10 seconds
        const timer = setTimeout(() => {
            setIsAnimating(false);
        }, 10000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.button
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
                borderColor: isAnimating ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,0.2)'
            }}
            transition={{ duration: 0.8 }}
            className="relative px-8 py-4 rounded-full overflow-hidden border border-transparent"
            style={{
                minWidth: '160px',
                minHeight: '56px'
            }}
        >
            {/* Rotating conic gradient background - fades out after 10s */}
            <AnimatePresence>
                {isAnimating && (
                    <motion.div
                        className="absolute top-[-450%] left-0 right-0 bottom-0 h-[1000%] rounded-full z-0"
                        style={{
                            background: 'conic-gradient(transparent 200deg, #a855f7, #ec4899, #a855f7)'
                        }}
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            rotate: {
                                duration: 4, // Fast rotation
                                ease: 'linear',
                                repeat: Infinity
                            },
                            opacity: {
                                duration: 1.5, // Slow fade out
                                ease: "easeInOut"
                            }
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Inner overlay with blur - fades out after 10s */}
            <AnimatePresence>
                {isAnimating && (
                    <motion.div
                        className="absolute top-[2px] left-[2px] right-[2px] bottom-[2px] rounded-full z-10"
                        style={{
                            backdropFilter: 'blur(4px)',
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            border: '1px solid rgba(168, 85, 247, 0.3)'
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                )}
            </AnimatePresence>

            {/* Hover effect for normal state */}
            {!isAnimating && (
                <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            )}

            {/* Button content */}
            <div className="relative z-20 font-montserrat text-xs uppercase tracking-[0.2em] text-white flex items-center justify-center gap-2">
                {children}
            </div>
        </motion.button>
    );
};
