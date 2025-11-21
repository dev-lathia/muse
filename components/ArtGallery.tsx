import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, ChevronLeft, ChevronRight } from 'lucide-react';

// --- Types ---
interface ArtPiece {
    id: string;
    src: string;
    title: string;
    description: string;
    lines: string[]; // "lines as it is right now" - assuming poetry or text lines
}

// --- Data (Placeholders as original file is missing) ---
const ART_PIECES: ArtPiece[] = [
    {
        id: '1',
        src: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1000&auto=format&fit=crop',
        title: 'Ethereal Bloom',
        description: 'A delicate dance of light and shadow, capturing the essence of fleeting beauty.',
        lines: [
            "In the garden of silence,",
            "A whisper takes root,",
            "Blooming into colors,",
            "That time cannot mute."
        ]
    },
    {
        id: '2',
        src: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1000&auto=format&fit=crop',
        title: 'Nature\'s Whisper',
        description: 'The quiet strength of the natural world, revealed in the intricate patterns of life.',
        lines: [
            "Green veins pulsing,",
            "With the earth's deep song,",
            "Where the wild heart beats,",
            "And the roots grow strong."
        ]
    },
    {
        id: '3',
        src: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?q=80&w=1000&auto=format&fit=crop',
        title: 'Abstract Thoughts',
        description: 'A visual journey into the mind, where forms dissolve into pure emotion.',
        lines: [
            "Colors clash and blend,",
            "In a chaotic embrace,",
            "Finding order in chaos,",
            "And beauty in space."
        ]
    },
    {
        id: '4',
        src: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=1000&auto=format&fit=crop',
        title: 'Urban Solitude',
        description: 'The stark beauty of the city, finding moments of peace amidst the noise.',
        lines: [
            "Concrete canyons rise,",
            "Under a steel grey sky,",
            "Yet a flower breaks through,",
            "Reaching for the high."
        ]
    },
    {
        id: '5',
        src: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?q=80&w=1000&auto=format&fit=crop',
        title: 'Oceanic Dreams',
        description: 'The vast, mysterious depths of the ocean, reflecting the soul\'s infinite potential.',
        lines: [
            "Waves crash and whisper,",
            "Secrets of the deep,",
            "Where the moonlight dances,",
            "And the mermaids sleep."
        ]
    }
];

// --- Components ---

const CardModal: React.FC<{ piece: ArtPiece; onClose: () => void }> = ({ piece, onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="relative bg-[#111] border border-white/10 rounded-xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Image Section */}
                <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-black">
                    <img
                        src={piece.src}
                        alt={piece.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                </div>

                {/* Details Section */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center text-left">
                    <h2 className="font-serif-custom text-3xl md:text-4xl text-white mb-2">{piece.title}</h2>
                    <div className="w-12 h-1 bg-purple-500 mb-6" />

                    <p className="font-montserrat text-gray-300 text-sm leading-relaxed mb-8">
                        {piece.description}
                    </p>

                    <div className="space-y-2 border-l-2 border-white/10 pl-6 italic text-gray-400 font-serif-custom">
                        {piece.lines.map((line, i) => (
                            <p key={i}>{line}</p>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export const ArtGallery: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedPiece, setSelectedPiece] = useState<ArtPiece | null>(null);

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % ART_PIECES.length);
    };

    const handlePrev = () => {
        setActiveIndex((prev) => (prev - 1 + ART_PIECES.length) % ART_PIECES.length);
    };

    // Calculate positions for the "Revolving" effect
    // We want to show: Previous (Left/Back), Current (Center/Front), Next (Right/Back)
    // But the Framer component seemed to stack them. Let's do a nice 3D carousel or stack.
    // Let's go with a "Deck" style where they stack and cycle.

    const getCardStyle = (index: number) => {
        // Calculate relative index based on activeIndex
        // We want a circular buffer logic for display
        const total = ART_PIECES.length;
        const relativeIndex = (index - activeIndex + total) % total;

        // We'll show 3 cards: 0 (Active), 1 (Next), 2 (Next Next), others hidden
        // Actually, let's do a stack: Active on top, Next behind, NextNext behind that.

        if (relativeIndex === 0) {
            // Active
            return {
                zIndex: 10,
                scale: 1,
                x: 0,
                opacity: 1,
                blur: 0,
                rotate: 0
            };
        } else if (relativeIndex === 1) {
            // Next
            return {
                zIndex: 9,
                scale: 0.9,
                x: 40, // Offset to right
                opacity: 0.8,
                blur: 2,
                rotate: 5
            };
        } else if (relativeIndex === 2) {
            // Next Next
            return {
                zIndex: 8,
                scale: 0.8,
                x: 80,
                opacity: 0.6,
                blur: 4,
                rotate: 10
            };
        } else if (relativeIndex === total - 1) {
            // Previous (for smooth transition from left or just hidden behind)
            // Let's make it slide in from left or just be hidden
            return {
                zIndex: 0,
                scale: 0.8,
                x: -80,
                opacity: 0,
                blur: 10,
                rotate: -10
            };
        } else {
            // Hidden
            return {
                zIndex: 0,
                scale: 0.5,
                x: 0,
                opacity: 0,
                blur: 10,
                rotate: 0
            };
        }
    };

    return (
        <section className="min-h-screen flex flex-col items-center justify-center py-20 relative overflow-hidden pb-24">
            {/* Background Elements */}
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0a] to-[#0a0a0a]" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-900/20 rounded-full blur-[120px]" />

            {/* Bottom Fade for Smooth Transition */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

            <div className="relative z-10 text-center mb-16">
                <h2 className="font-serif-custom text-4xl md:text-5xl text-white mb-4 tracking-tight">
                    The Gallery
                </h2>
                <p className="font-montserrat text-gray-400 text-sm tracking-widest uppercase">
                    Fragments of Vision
                </p>
            </div>

            {/* Revolving Gallery Container */}
            <div className="relative w-full max-w-4xl h-[500px] flex items-center justify-center perspective-1000">
                <div className="relative w-[300px] h-[400px] md:w-[350px] md:h-[500px]">
                    <AnimatePresence mode="popLayout">
                        {ART_PIECES.map((piece, i) => {
                            const style = getCardStyle(i);
                            // Only render if visible or close to visible to save resources
                            // But for smooth animation we might need them all.
                            // Let's render all but control opacity.

                            return (
                                <motion.div
                                    key={piece.id}
                                    layoutId={`card-${piece.id}`}
                                    initial={false}
                                    animate={{
                                        zIndex: style.zIndex,
                                        scale: style.scale,
                                        x: style.x,
                                        opacity: style.opacity,
                                        filter: `blur(${style.blur}px)`,
                                        rotate: style.rotate
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 20
                                    }}
                                    className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl cursor-pointer border border-white/5"
                                    style={{
                                        transformOrigin: 'center center'
                                    }}
                                    onClick={() => {
                                        if (i === activeIndex) {
                                            setSelectedPiece(piece);
                                        } else {
                                            // If clicking a side card, cycle to it?
                                            // Or just next?
                                            // Let's just make any click on non-active cycle next
                                            handleNext();
                                        }
                                    }}
                                >
                                    <img
                                        src={piece.src}
                                        alt={piece.title}
                                        className="w-full h-full object-cover"
                                        draggable={false}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                                    {/* Minimal Label on Card */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                        <p className="font-serif-custom text-xl text-white">{piece.title}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Controls - TVA Style */}
            <div className="absolute top-1/2 left-0 right-0 w-full max-w-6xl mx-auto px-4 md:px-12 -translate-y-1/2 flex justify-between pointer-events-none z-20">
                <button
                    onClick={handlePrev}
                    className="pointer-events-auto p-4 rounded-full bg-black/40 border border-[#dcb158]/30 text-[#dcb158]/80 backdrop-blur-md hover:bg-[#dcb158]/10 hover:border-[#dcb158]/80 hover:text-[#dcb158] hover:shadow-[0_0_25px_rgba(220,177,88,0.2)] transition-all duration-300 group"
                    aria-label="Previous"
                >
                    <ChevronLeft size={32} className="group-hover:-translate-x-1 transition-transform duration-300" />
                </button>
                <button
                    onClick={handleNext}
                    className="pointer-events-auto p-4 rounded-full bg-black/40 border border-[#dcb158]/30 text-[#dcb158]/80 backdrop-blur-md hover:bg-[#dcb158]/10 hover:border-[#dcb158]/80 hover:text-[#dcb158] hover:shadow-[0_0_25px_rgba(220,177,88,0.2)] transition-all duration-300 group"
                    aria-label="Next"
                >
                    <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform duration-300" />
                </button>
            </div>

            {/* Details Modal */}
            <AnimatePresence>
                {selectedPiece && (
                    <CardModal piece={selectedPiece} onClose={() => setSelectedPiece(null)} />
                )}
            </AnimatePresence>
        </section>
    );
};
