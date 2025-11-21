import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { playTypeSound } from '../utils/audio';

interface TypewriterLoaderProps {
    onComplete: () => void;
}

export const TypewriterLoader: React.FC<TypewriterLoaderProps> = ({ onComplete }) => {
    const [text, setText] = useState('');
    const [phase, setPhase] = useState<'typing1' | 'pausing1' | 'erasing' | 'pausing2' | 'typing2' | 'done'>('typing1');

    const phrase1 = "Every beautiful thing takes time...";
    const phrase2 = "So just give time.";

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const typeChar = (targetPhrase: string, nextPhase: typeof phase) => {
            if (text.length < targetPhrase.length) {
                timeout = setTimeout(() => {
                    setText(targetPhrase.slice(0, text.length + 1));
                    playTypeSound();
                }, 30 + Math.random() * 30); // Random typing speed
            } else {
                timeout = setTimeout(() => setPhase(nextPhase), 500); // Pause after typing
            }
        };

        const eraseChar = (nextPhase: typeof phase) => {
            if (text.length > 0) {
                timeout = setTimeout(() => {
                    setText(text.slice(0, -1));
                    playTypeSound();
                }, 50); // Faster erasing
            } else {
                timeout = setTimeout(() => setPhase(nextPhase), 50); // Pause before next phrase
            }
        };

        switch (phase) {
            case 'typing1':
                typeChar(phrase1, 'pausing1');
                break;
            case 'pausing1':
                timeout = setTimeout(() => setPhase('erasing'), 1000);
                break;
            case 'erasing':
                eraseChar('pausing2');
                break;
            case 'pausing2':
                timeout = setTimeout(() => setPhase('typing2'), 500);
                break;
            case 'typing2':
                typeChar(phrase2, 'done');
                break;
            case 'done':
                timeout = setTimeout(onComplete, 2000); // Linger on final message
                break;
        }

        return () => clearTimeout(timeout);
    }, [text, phase, onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-[1000] bg-black flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
        >
            <div className="font-serif-custom text-2xl md:text-4xl text-white/90 tracking-wide min-h-[3rem] flex items-center">
                {text}
                <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-[2px] h-[1.2em] bg-purple-400 ml-1 align-middle"
                />
            </div>
        </motion.div>
    );
};
