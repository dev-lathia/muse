import React, { useEffect, useRef, useMemo, useCallback } from 'react';

/** Critically damped spring (Unity-like SmoothDamp). */
function smoothDamp(
    current: number,
    target: number,
    currentVelocity: number,
    smoothTime: number,
    maxSpeed: number,
    deltaTime: number
): [number, number] {
    const EPS = 1e-4;
    smoothTime = Math.max(EPS, smoothTime);
    const maxChange = maxSpeed * smoothTime;
    let delta = target - current;
    const originalTarget = target;
    if (Math.abs(delta) > maxChange) {
        target = current + Math.sign(delta) * maxChange;
    }
    const omega = 2 / smoothTime;
    const x = omega * deltaTime;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    const change = current - target;
    const temp = (currentVelocity + omega * change) * deltaTime;
    let newVelocity = (currentVelocity - omega * temp) * exp;
    let newValue = target + (change + temp) * exp;
    const origToCurrent = originalTarget - current;
    const newToOrig = newValue - originalTarget;
    if (origToCurrent > 0 === newToOrig > 0) {
        newValue = originalTarget;
        newVelocity = 0;
    }
    return [newValue, newVelocity];
}

const PRESETS = {
    // Sutileza premium, arranque e parada aveludados
    Portfolio: {
        smoothTime: 0.6,
        maxSpeed: 4500,
        keyboardLines: 1,
        pageJumpRatio: 0.9,
        clamp: true,
    },
};

interface SexyScrollProps {
    enabled?: boolean;
    preset?: 'Portfolio' | 'Custom';
    smoothTime?: number;
    maxSpeed?: number;
    keyboardStepLines?: number;
    pageJumpRatio?: number;
    touchEnabled?: boolean;
    clampToDocument?: boolean;
    respectReduceMotion?: boolean;
    showBadge?: boolean;
    children?: React.ReactNode;
}

export interface SexyScrollRef {
    scrollTo: (y: number) => void;
}

export const SexyScroll = React.forwardRef<SexyScrollRef, SexyScrollProps>(({
    enabled = true,
    preset = 'Portfolio',
    smoothTime = 0.6,
    maxSpeed = 4500,
    keyboardStepLines = 1,
    pageJumpRatio = 0.9,
    touchEnabled = false,
    clampToDocument = true,
    respectReduceMotion = true,
    showBadge = false,
    children,
}, ref) => {
    // A11y: prefers-reduced-motion
    const prefersReduced = useMemo(() => {
        if (typeof window === 'undefined' || typeof matchMedia === 'undefined') return false;
        try {
            return matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch {
            return false;
        }
    }, []);

    const cfg = useMemo(() => {
        if (preset !== 'Custom') {
            const p = PRESETS[preset as keyof typeof PRESETS] || PRESETS.Portfolio;
            return {
                smoothTime: p.smoothTime,
                maxSpeed: p.maxSpeed,
                keyboardLines: p.keyboardLines,
                pageJumpRatio: p.pageJumpRatio,
                touch: touchEnabled,
                clamp: p.clamp,
            };
        }
        return {
            smoothTime,
            maxSpeed,
            keyboardLines: keyboardStepLines,
            pageJumpRatio,
            touch: touchEnabled,
            clamp: clampToDocument,
        };
    }, [
        preset,
        smoothTime,
        maxSpeed,
        keyboardStepLines,
        pageJumpRatio,
        touchEnabled,
        clampToDocument,
    ]);

    const active = enabled && !(respectReduceMotion && prefersReduced);

    // Physics state
    const yRef = useRef(0);
    const vRef = useRef(0);
    const targetRef = useRef(0);
    const rafRef = useRef<number | null>(null);
    const lastTsRef = useRef<number | null>(null);

    const clampDoc = useCallback(
        (y: number) => {
            if (!cfg.clamp) return y;
            const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            return Math.min(Math.max(0, y), max);
        },
        [cfg.clamp]
    );

    const cancel = useCallback(() => {
        if (rafRef.current != null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        lastTsRef.current = null;
    }, []);

    const loop = useCallback(
        (ts: number) => {
            if (lastTsRef.current == null) lastTsRef.current = ts;
            const dt = Math.max(0.001, Math.min(0.033, (ts - lastTsRef.current) / 1e3));
            lastTsRef.current = ts;

            const current = yRef.current;
            const target = clampDoc(targetRef.current);
            const [ny, nv] = smoothDamp(
                current,
                target,
                vRef.current,
                cfg.smoothTime,
                cfg.maxSpeed,
                dt
            );

            yRef.current = ny;
            vRef.current = nv;
            window.scrollTo(0, ny);

            // Keep loop light; ready for new inputs
            if (Math.abs(ny - target) < 0.2 && Math.abs(nv) < 2) {
                yRef.current = target;
                vRef.current = 0;
                window.scrollTo(0, target);
                rafRef.current = requestAnimationFrame(loop);
                return;
            }
            rafRef.current = requestAnimationFrame(loop);
        },
        [cfg.maxSpeed, cfg.smoothTime, clampDoc]
    );

    const ensureLoop = useCallback(() => {
        if (rafRef.current == null) {
            yRef.current = window.scrollY;
            targetRef.current = window.scrollY;
            rafRef.current = requestAnimationFrame(loop);
        }
    }, [loop]);

    const nudge = useCallback(
        (deltaY: number) => {
            targetRef.current = clampDoc(targetRef.current + deltaY);
            ensureLoop();
        },
        [clampDoc, ensureLoop]
    );

    // Expose scrollTo method
    React.useImperativeHandle(ref, () => ({
        scrollTo: (y: number) => {
            targetRef.current = clampDoc(y);
            ensureLoop();
        }
    }));

    // Wheel / trackpad
    useEffect(() => {
        if (!active) return;
        const onWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            const factor = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
            const dy = e.deltaY * factor;
            nudge(dy);
        };
        window.addEventListener('wheel', onWheel, { passive: false });
        return () => {
            window.removeEventListener('wheel', onWheel);
            cancel();
        };
    }, [active, nudge, cancel]);

    // Keyboard
    useEffect(() => {
        if (!active) return;
        const onKey = (e: KeyboardEvent) => {
            const el = e.target as HTMLElement;
            if (
                el &&
                (el.tagName === 'INPUT' ||
                    el.tagName === 'TEXTAREA' ||
                    el.isContentEditable)
            )
                return;

            const line = 48 * cfg.keyboardLines;
            const h = window.innerHeight * cfg.pageJumpRatio;

            switch (e.code) {
                case 'ArrowDown':
                    e.preventDefault();
                    nudge(line);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    nudge(-line);
                    break;
                case 'PageDown':
                    e.preventDefault();
                    nudge(h);
                    break;
                case 'PageUp':
                    e.preventDefault();
                    nudge(-h);
                    break;
                case 'Space':
                    e.preventDefault();
                    nudge(h);
                    break;
            }
        };
        window.addEventListener('keydown', onKey, { passive: false });
        return () => window.removeEventListener('keydown', onKey);
    }, [active, cfg.keyboardLines, cfg.pageJumpRatio, nudge]);

    // Touch (if enabled)
    useEffect(() => {
        if (!active || !cfg.touch) return;
        let lastY = 0;
        const onTouchMove = (e: TouchEvent) => {
            if (e.touches.length !== 1) return;
            const y = e.touches[0].clientY;
            const dy = lastY ? lastY - y : 0;
            lastY = y;
            if (Math.abs(dy) > 0) {
                e.preventDefault();
                nudge(dy);
            }
        };
        const onTouchEnd = () => {
            lastY = 0;
        };
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd, { passive: true });
        return () => {
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
    }, [active, cfg.touch, nudge]);

    // Sync with external scroll changes (e.g. hash jump)
    useEffect(() => {
        const onScroll = () => {
            if (!active) return;
            if (rafRef.current == null) {
                yRef.current = window.scrollY;
                targetRef.current = window.scrollY;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [active]);

    return (
        <>
            {children}
            {showBadge && (
                <div
                    style={{
                        position: 'fixed',
                        top: 12,
                        left: 12,
                        zIndex: 99999,
                        pointerEvents: 'none',
                        userSelect: 'none',
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontSize: 12,
                        padding: '6px 8px',
                        borderRadius: 8,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                        background: 'rgba(20,20,20,0.85)',
                        color: '#fff',
                    }}
                >
                    Sexy Scroll (by Baco): {preset}
                    {cfg.touch ? ' · Touch' : ''}
                </div>
            )}
        </>
    );
});
