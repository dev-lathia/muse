import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ConicGradientButton } from './ConicGradientButton';
import { Sparkles } from 'lucide-react';
import { playHoverSound } from '../utils/audio';

interface StartScreenProps {
    onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
    // Mouse/Gyro position state
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth out movement
    const springConfig = { damping: 50, stiffness: 100 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX / innerWidth) * 2 - 1;
            const y = (e.clientY / innerHeight) * 2 - 1;
            mouseX.set(x);
            mouseY.set(y);
        };

        const handleOrientation = (e: DeviceOrientationEvent) => {
            const { beta, gamma } = e;
            if (beta === null || gamma === null) return;

            // X axis: Gamma (left/right). Center at 0. Range +/- 25 degrees
            const x = Math.min(Math.max(gamma / 25, -1), 1);

            // Y axis: Beta (front/back). Center at 45 degrees. Range +/- 25 degrees
            const y = Math.min(Math.max((beta - 45) / 25, -1), 1);

            mouseX.set(x);
            mouseY.set(y);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('deviceorientation', handleOrientation);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, [mouseX, mouseY]);

    // Parallax transforms
    const titleX = useTransform(smoothX, [-1, 1], [-20, 20]);
    const titleY = useTransform(smoothY, [-1, 1], [-20, 20]);

    const subX = useTransform(smoothX, [-1, 1], [-10, 10]);
    const subY = useTransform(smoothY, [-1, 1], [-10, 10]);

    const btnX = useTransform(smoothX, [-1, 1], [-5, 5]);
    const btnY = useTransform(smoothY, [-1, 1], [-5, 5]);

    return (
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
                className="text-center relative perspective-[1000px]"
            >
                <motion.div style={{ x: subX, y: subY }}>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="font-serif-custom text-lg text-gray-500 italic mb-4"
                    >
                        For Drashti
                    </motion.p>
                </motion.div>

                <motion.div style={{ x: titleX, y: titleY }}>
                    <h1 className="font-serif-custom text-6xl md:text-8xl text-white mb-12 tracking-tighter">
                        The Vision
                    </h1>
                </motion.div>

                <motion.div style={{ x: btnX, y: btnY }}>
                    <ConicGradientButton onClick={onStart} onMouseEnter={playHoverSound}>
                        Enter <Sparkles size={12} />
                    </ConicGradientButton>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};
