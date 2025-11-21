import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// --- Configuration ---
const FLOWER_EMOJIS = ['🌸', '🌺', '🌻', '🌹', '🌷', '💮', '🪷', '🏵️', '🌼', '🌿', '🌾'];
const SPAWN_THRESHOLD = 25;
const MAX_BLOOMS = 40; // Increased slightly for density

interface BloomData {
    id: number;
    x: number;
    y: number;
    emoji: string;
    initialRotation: number;
    targetRotation: number;
    scale: number;
    vx: number;
    vy: number;
    // Unique behaviors
    lifeTime: number;
    driftX: number;
    driftY: number;
    scaleKeyframes: number[];
    opacityKeyframes: number[];
}

const Flower: React.FC<{ data: BloomData; onComplete: (id: number) => void }> = React.memo(({ data, onComplete }) => {
    return (
        <motion.div
            initial={{
                x: data.x,
                y: data.y,
                scale: 0,
                opacity: 0,
                rotate: data.initialRotation,
            }}
            animate={{
                x: data.x + data.driftX,
                y: data.y + data.driftY,
                scale: data.scaleKeyframes,
                opacity: data.opacityKeyframes,
                rotate: data.targetRotation,
            }}
            transition={{
                duration: data.lifeTime,
                ease: "easeOut",
                times: [0, 0.15, 0.8, 1], // General timing structure
            }}
            onAnimationComplete={() => onComplete(data.id)}
            style={{
                position: 'fixed',
                left: 0,
                top: 0,
                pointerEvents: 'none',
                zIndex: 9998,
                transformOrigin: 'center center',
            }}
            className="text-2xl filter drop-shadow-md will-change-transform"
        >
            {data.emoji}
        </motion.div>
    );
});

export const FlowerCursor: React.FC = () => {
    const [blooms, setBlooms] = useState<BloomData[]>([]);
    const mousePos = useRef({ x: 0, y: 0 });
    const lastSpawnPos = useRef({ x: 0, y: 0 });
    const lastTime = useRef(0);
    const velocity = useRef({ x: 0, y: 0 });

    // Cursor Dot Physics
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
    const smoothX = useSpring(cursorX, springConfig);
    const smoothY = useSpring(cursorY, springConfig);

    const [isPointer, setIsPointer] = useState(false);

    const spawnBloom = useCallback((x: number, y: number, vx: number, vy: number) => {
        const id = Date.now() + Math.random();
        const emoji = FLOWER_EMOJIS[Math.floor(Math.random() * FLOWER_EMOJIS.length)];

        // Randomize EVERYTHING
        const scaleBase = 0.4 + Math.random() * 0.6; // Size variance
        const lifeTime = 1 + Math.random() * 1.5; // Duration 1s to 2.5s
        const initialRotation = Math.random() * 360;
        const rotationSpeed = (Math.random() * 180 - 90) * (Math.random() > 0.5 ? 1 : -1);
        const targetRotation = initialRotation + rotationSpeed;

        // Drift Physics: Wake effect + Random chaos
        // Stronger random drift for more "floating" feel
        const driftX = (vx * -0.3) + (Math.random() * 200 - 100);
        const driftY = (vy * -0.3) + (Math.random() * 200 - 100);

        // Scale Dynamics: 3 types of growth
        const growthType = Math.random();
        let scaleKeyframes;
        if (growthType < 0.33) {
            // Pop and settle
            scaleKeyframes = [0, scaleBase * 1.3, scaleBase];
        } else if (growthType < 0.66) {
            // Slow bloom
            scaleKeyframes = [0, scaleBase * 0.8, scaleBase];
        } else {
            // Pulse
            scaleKeyframes = [0, scaleBase, scaleBase * 1.1, scaleBase];
        }

        // Opacity Dynamics
        const opacityKeyframes = [0, 1, 1, 0];

        setBlooms(prev => {
            const next = [...prev, {
                id, x, y, emoji,
                initialRotation, targetRotation,
                scale: scaleBase,
                vx, vy,
                lifeTime,
                driftX, driftY,
                scaleKeyframes,
                opacityKeyframes
            }];
            if (next.length > MAX_BLOOMS) return next.slice(next.length - MAX_BLOOMS);
            return next;
        });
    }, []);

    const removeBloom = useCallback((id: number) => {
        setBlooms(prev => prev.filter(b => b.id !== id));
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const now = Date.now();
            const dt = now - lastTime.current;

            cursorX.set(clientX);
            cursorY.set(clientY);

            if (dt > 0) {
                const dx = clientX - mousePos.current.x;
                const dy = clientY - mousePos.current.y;
                velocity.current = { x: dx, y: dy };
            }

            mousePos.current = { x: clientX, y: clientY };
            lastTime.current = now;

            const dist = Math.hypot(
                clientX - lastSpawnPos.current.x,
                clientY - lastSpawnPos.current.y
            );

            if (dist > SPAWN_THRESHOLD) {
                spawnBloom(clientX, clientY, velocity.current.x, velocity.current.y);
                lastSpawnPos.current = { x: clientX, y: clientY };
            }
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const isClickable =
                target.matches('button, a, input, select, textarea, [role="button"], .cursor-pointer') ||
                target.closest('button, a, [role="button"], .cursor-pointer') !== null;
            setIsPointer(!!isClickable);
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('mouseover', handleMouseOver, { passive: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, [cursorX, cursorY, spawnBloom]);

    return (
        <>
            <motion.div
                style={{
                    x: smoothX,
                    y: smoothY,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
                className={`fixed top-0 left-0 z-[9999] pointer-events-none flex items-center justify-center transition-[width,height] duration-300 ease-out ${isPointer ? 'w-10 h-10' : 'w-4 h-4'
                    }`}
            >
                <div
                    className={`w-full h-full rounded-full transition-all duration-300 ease-out ${isPointer
                        ? 'bg-transparent backdrop-invert'
                        // ? 'bg-white mix-blend-difference'
                        : 'bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.5)]'
                        }`}
                />
            </motion.div>

            {blooms.map(bloom => (
                <Flower key={bloom.id} data={bloom} onComplete={removeBloom} />
            ))}
        </>
    );
};
