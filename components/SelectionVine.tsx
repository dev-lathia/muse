import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// --- Types & Helpers ---
interface SelectionRect {
  id: string;
  top: number;
  left: number;
  width: number;
  height: number;
  isTitle: boolean;
}

const LEAF_COLORS = [
  ['#4ade80', '#166534'],
  ['#86efac', '#15803d'],
  ['#22c55e', '#14532d'],
  ['#bef264', '#3f6212'],
  ['#a3e635', '#4d7c0f'],
];

const VINE_STROKE_COLORS = ['#4ade80', '#22c55e', '#65a30d', '#84cc16'];

const FLOWER_PALETTES = [
  { main: '#f472b6', center: '#fce7f3', accent: '#db2777' },
  { main: '#a78bfa', center: '#ede9fe', accent: '#7c3aed' },
  { main: '#fb7185', center: '#ffe4e6', accent: '#e11d48' },
  { main: '#fef08a', center: '#fef9c3', accent: '#ca8a04' },
  { main: '#e2e8f0', center: '#ffffff', accent: '#94a3b8' },
];

const LEAF_SHAPES = [
  (scale: number) => `M0,0 Q${8 * scale},${-8 * scale} ${16 * scale},${-3 * scale} Q${8 * scale},${8 * scale} 0,0`,
  (scale: number) => `M0,0 Q${12 * scale},${-4 * scale} ${22 * scale},0 Q${12 * scale},${4 * scale} 0,0`,
  (scale: number) => `M0,0 Q${6 * scale},${-10 * scale} ${12 * scale},${-5 * scale} Q${14 * scale},0 ${12 * scale},${5 * scale} Q${6 * scale},${10 * scale} 0,0`,
  (scale: number) => `M0,0 Q${5 * scale},${-8 * scale} ${10 * scale},${-4 * scale} Q${12 * scale},0 ${10 * scale},${4 * scale} Q${5 * scale},${8 * scale} 0,0`,
];

const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;
const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// --- Leaf Component ---
interface LeafProps {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  colors: string[];
  side: 'left' | 'right';
  shapeIndex: number;
}

const leafContainerVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 150, damping: 12 } },
  exit: { scale: 0, opacity: 0, transition: { duration: 0.4, ease: 'backIn' } },
};

const Leaf: React.FC<LeafProps> = ({ id, x, y, rotation, scale, colors, side, shapeIndex }) => {
  const gradientId = `leaf-grad-${id}`;
  const shapePath = LEAF_SHAPES[shapeIndex % LEAF_SHAPES.length];
  const swayDuration = useMemo(() => randomRange(3, 6), []);
  const swayDelay = useMemo(() => randomRange(0, 2), []);
  const dir = side === 'right' ? 1 : -1;
  return (
    <motion.g variants={leafContainerVariants} style={{ transformOrigin: `${x}px ${y}px` }}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="100%" stopColor={colors[1]} />
        </linearGradient>
      </defs>
      <g transform={`translate(${x}, ${y}) rotate(${rotation}) ${side === 'left' ? 'scale(1, -1)' : ''}`}>
        <motion.g animate={{ rotate: [0, 3 * dir, 0, -2 * dir, 0] }} transition={{ duration: swayDuration, delay: swayDelay, repeat: Infinity, ease: 'easeInOut' }}>
          <path d={shapePath(scale)} fill={`url(#${gradientId})`} stroke={colors[1]} strokeWidth="0.5" />
          <path d={`M0,0 Q${8 * scale},${side === 'right' ? -1 : 1} ${14 * scale},${side === 'right' ? -2 : 2}`} fill="none" stroke={colors[1]} strokeWidth="0.5" opacity="0.7" />
          <path d={`
                M${4 * scale},${side === 'right' ? -0.5 : 0.5} L${6 * scale},${side === 'right' ? -3 : 3}
                M${8 * scale},${side === 'right' ? -1 : 1} L${10 * scale},${side === 'right' ? -3.5 : 3.5}
                M${5 * scale},0 L${7 * scale},${side === 'right' ? 2 : -2}
              `} fill="none" stroke={colors[1]} strokeWidth="0.3" opacity="0.5" />
        </motion.g>
      </g>
    </motion.g>
  );
};

// --- Flower Component ---
interface FlowerProps {
  id: string;
  x: number;
  y: number;
  palette: typeof FLOWER_PALETTES[0];
  size: number;
}

const flowerContainerVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  exit: { scale: 0, opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1, duration: 0.5 } },
};

const petalVariants: Variants = {
  hidden: { cy: 0, ry: 0, opacity: 0 },
  visible: (custom) => ({
    cy: -custom.radius,
    ry: custom.size,
    opacity: 0.95,
    transition: { type: 'spring', damping: 15, stiffness: 80 },
  }),
  exit: { cy: 0, ry: 0, opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } },
};

const Flower: React.FC<FlowerProps> = ({ id, x, y, palette, size }) => {
  const gradId = `flower-grad-${id}`;
  const angles = [0, 72, 144, 216, 288];
  return (
    <motion.g variants={flowerContainerVariants} style={{ transformOrigin: '0px 0px', x, y }}>
      <defs>
        <radialGradient id={gradId} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="10%" stopColor={palette.center} />
          <stop offset="50%" stopColor={palette.main} />
          <stop offset="100%" stopColor={palette.accent} />
        </radialGradient>
      </defs>
      {angles.map((angle, i) => (
        <motion.ellipse
          key={i}
          variants={petalVariants}
          custom={{ radius: size * 0.8, size }}
          cx={0}
          rx={size * 0.5}
          fill={`url(#${gradId})`}
          stroke={palette.accent}
          strokeWidth={0.2}
          transform={`rotate(${angle})`}
        />
      ))}
      <motion.circle cx={0} cy={0} r={size * 0.25} fill="#fcd34d" variants={{ hidden: { scale: 0 }, visible: { scale: 1 }, exit: { scale: 0 } }} />
      <motion.circle cx={0} cy={0} r={size * 0.1} fill="#fff" opacity="0.6" variants={{ hidden: { scale: 0 }, visible: { scale: 1 }, exit: { scale: 0 } }} />
    </motion.g>
  );
};

// --- UltraHighFidelityRose Components ---

interface RosePetalProps {
  d: string;
  fill: string;
  delay: number;
  scale?: number;
  rotate?: number;
  zIndex?: number;
  opacity?: number;
  filter?: string;
}

const RosePetal: React.FC<RosePetalProps> = ({ d, fill, delay, scale = 1, rotate = 0, opacity = 1, filter }) => (
  <motion.path
    d={d}
    fill={fill}
    filter={filter}
    initial={{ scale: 0, opacity: 0, rotate: rotate - 25 }}
    animate={{ scale, opacity, rotate }}
    exit={{ scale: 0, opacity: 0, rotate: rotate + 25 }}
    transition={{
      duration: 2.0,
      delay,
      type: "spring",
      stiffness: 35,
      damping: 12,
      mass: 1.5
    }}
    style={{ transformOrigin: "50% 50%" }}
  />
);

const UltraHighFidelityRose: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  return (
    <motion.div
      // Initial state: small, centered on corner
      initial={{ x: "-50%", y: "-50%", scale: 0, rotate: 0, opacity: 0 }}
      // Animate to: full size, rotated 45deg, positioned right on the edge
      animate={{ x: "-30%", y: "-70%", scale: 1, rotate: 45, opacity: 1 }}
      exit={{ scale: 0, rotate: 90, opacity: 0 }}
      transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 60,
        height: 60,
        pointerEvents: 'none',
        zIndex: 30,
        filter: 'drop-shadow(3px 6px 12px rgba(0,0,0,0.4))',
      }}
    >



      <svg width="100%" height="100%" viewBox="0 0 200 200" overflow="visible">
        <defs>
          {/* --- Filters --- */}

          {/* 1. Soft Ambient Occlusion Shadow */}
          <filter id="ultraShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
            <feOffset in="blur" dx="2" dy="4" result="offsetBlur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="offsetBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* 2. Velvet Texture (Subtle Noise) */}
          <filter id="velvetTexture" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0" in="noise" result="coloredNoise" />
            <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="compositeNoise" />
            <feBlend mode="multiply" in="compositeNoise" in2="SourceGraphic" />
          </filter>

          {/* 3. Dew Drop Refraction & Specular */}
          <filter id="dewDrop" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
            <feSpecularLighting in="blur" surfaceScale="5" specularConstant="1" specularExponent="20" lightingColor="#ffffff" result="specular">
              <fePointLight x="-5000" y="-10000" z="20000" />
            </feSpecularLighting>
            <feComposite in="specular" in2="SourceAlpha" operator="in" result="specular" />
            <feComposite in="SourceGraphic" in2="specular" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
            <feDropShadow dx="1" dy="2" stdDeviation="1" floodColor="#000000" floodOpacity="0.3" />
          </filter>

          {/* --- Gradients (Subsurface Scattering Simulation) --- */}

          {/* Leaf: Deep, waxy green */}
          <linearGradient id="ultraLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6ee7b7" />   {/* Translucent edge */}
            <stop offset="40%" stopColor="#10b981" />  {/* Body */}
            <stop offset="100%" stopColor="#022c22" /> {/* Deep shadow */}
          </linearGradient>

          {/* Rose Outer: Pale pink fading to deep magenta */}
          <radialGradient id="ultraRoseOuter" cx="50%" cy="30%" r="90%">
            <stop offset="0%" stopColor="#fce7f3" />   {/* Highlight */}
            <stop offset="30%" stopColor="#f472b6" />   {/* Subsurface glow */}
            <stop offset="70%" stopColor="#db2777" />   {/* Body */}
            <stop offset="100%" stopColor="#831843" />  {/* Shadow */}
          </radialGradient>

          {/* Rose Mid: Rich, saturated pink/red */}
          <radialGradient id="ultraRoseMid" cx="50%" cy="20%" r="80%">
            <stop offset="0%" stopColor="#fbcfe8" />
            <stop offset="40%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#881337" />
          </radialGradient>

          {/* Rose Inner: Deep velvety red/purple */}
          <radialGradient id="ultraRoseInner" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="50%" stopColor="#be123c" />
            <stop offset="100%" stopColor="#4c0519" />
          </radialGradient>

        </defs>

        <g transform="translate(100, 100)">

          {/* --- Layer 1: Leaves (Base) --- */}
          <g transform="scale(1.3)">
            <RosePetal d="M0,0 Q-40,-70 -80,-30 Q-50,40 0,0" fill="url(#ultraLeaf)" delay={0} shadow />
            <RosePetal d="M0,0 Q60,-80 100,-30 Q70,30 0,0" fill="url(#ultraLeaf)" delay={0.1} shadow />
            <RosePetal d="M0,0 Q-10,70 -40,100 Q-90,40 0,0" fill="url(#ultraLeaf)" delay={0.15} shadow />
            <RosePetal d="M0,0 Q30,60 60,90 Q20,40 0,0" fill="url(#ultraLeaf)" delay={0.2} shadow scale={0.8} />
          </g>

          {/* --- Layer 2: Outer Petals (The "Skirt") --- */}
          {/* Large, sweeping petals that frame the flower */}
          <g filter="url(#ultraShadow)">
            <g transform="rotate(0)">
              <RosePetal d="M0,-20 C-80,-80 -110,40 -50,80 C10,110 60,80 110,40 C80,-80 10,-20 0,-20" fill="url(#ultraRoseOuter)" delay={0.2} scale={1} />
            </g>
            <g transform="rotate(120)">
              <RosePetal d="M0,-20 C-80,-80 -110,40 -50,80 C10,110 60,80 110,40 C80,-80 10,-20 0,-20" fill="url(#ultraRoseOuter)" delay={0.25} scale={0.98} />
            </g>
            <g transform="rotate(240)">
              <RosePetal d="M0,-20 C-80,-80 -110,40 -50,80 C10,110 60,80 110,40 C80,-80 10,-20 0,-20" fill="url(#ultraRoseOuter)" delay={0.3} scale={0.98} />
            </g>
          </g>

          {/* --- Layer 3: Mid Petals (The "Body") --- */}
          {/* More cupped, richer color */}
          <g filter="url(#ultraShadow)">
            <g transform="rotate(60)">
              <RosePetal d="M0,0 C-60,-70 -90,20 -40,70 C10,90 50,70 90,20 C70,-70 10,0 0,0" fill="url(#ultraRoseMid)" delay={0.35} scale={0.85} />
            </g>
            <g transform="rotate(180)">
              <RosePetal d="M0,0 C-60,-70 -90,20 -40,70 C10,90 50,70 90,20 C70,-70 10,0 0,0" fill="url(#ultraRoseMid)" delay={0.4} scale={0.85} />
            </g>
            <g transform="rotate(300)">
              <RosePetal d="M0,0 C-60,-70 -90,20 -40,70 C10,90 50,70 90,20 C70,-70 10,0 0,0" fill="url(#ultraRoseMid)" delay={0.45} scale={0.85} />
            </g>
          </g>

          {/* --- Layer 4: Inner Petals (The "Core") --- */}
          {/* Tightly packed, dark, velvety */}
          <g filter="url(#ultraShadow)">
            <g transform="rotate(30)">
              <RosePetal d="M0,5 C-40,-40 -60,10 -25,50 C0,70 25,50 60,10 C40,-40 0,5 0,5" fill="url(#ultraRoseInner)" delay={0.5} scale={0.65} />
            </g>
            <g transform="rotate(150)">
              <RosePetal d="M0,5 C-40,-40 -60,10 -25,50 C0,70 25,50 60,10 C40,-40 0,5 0,5" fill="url(#ultraRoseInner)" delay={0.55} scale={0.65} />
            </g>
            <g transform="rotate(270)">
              <RosePetal d="M0,5 C-40,-40 -60,10 -25,50 C0,70 25,50 60,10 C40,-40 0,5 0,5" fill="url(#ultraRoseInner)" delay={0.6} scale={0.65} />
            </g>
          </g>

          {/* --- Layer 5: The Heart (Spiral) --- */}
          <motion.path
            d="M-3,-3 C20,-20 25,15 0,20 C-25,15 -20,-20 5,-5"
            fill="none"
            stroke="#fbcfe8"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.4))"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.8, duration: 1.5, ease: "easeInOut" }}
          />

          {/* --- Layer 6: Dew Drops (The "Jewels") --- */}
          <motion.circle cx="-30" cy="-40" r="5" fill="#fff" opacity="0.8" filter="url(#dewDrop)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.0, type: 'spring' }} />
          <motion.circle cx="40" cy="20" r="3" fill="#fff" opacity="0.6" filter="url(#dewDrop)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1, type: 'spring' }} />
          <motion.circle cx="10" cy="50" r="4" fill="#fff" opacity="0.7" filter="url(#dewDrop)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2, type: 'spring' }} />

        </g>
      </svg>
    </motion.div>
  );
};

// --- Vine Decoration ---
const VineDecoration: React.FC<{ rect: SelectionRect }> = ({ rect }) => {
  const vineStroke = useMemo(() => getRandomItem(VINE_STROKE_COLORS), []);
  const data = useMemo(() => {
    const width = rect.width;
    const centerX = width / 2;
    const generateVineSegment = (startX: number, endX: number, isRightSide: boolean) => {
      const direction = isRightSide ? -1 : 1;
      const length = Math.abs(endX - startX);
      const segments = Math.max(2, Math.ceil(length / 35));
      const segmentW = length / segments;
      let path = `M ${startX} 20`;
      let currX = startX;
      let currY = 20;
      const items: any[] = [];
      for (let i = 0; i < segments; i++) {
        const delay = i * 0.1;
        const nextX = startX + direction * (i + 1) * segmentW;
        const nextY = 20 + Math.sin(i * 2) * 6;
        const cp1x = currX + direction * segmentW * 0.5;
        const cp1y = currY + randomRange(-6, 6);
        const cp2x = nextX - direction * segmentW * 0.5;
        const cp2y = nextY + randomRange(-6, 6);
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${nextX} ${nextY}`;
        currX = nextX;
        currY = nextY;
        if (Math.random() > 0.25) {
          items.push({
            type: 'leaf',
            id: `${rect.id}-${isRightSide ? 'r' : 'l'}-leaf-${i}`,
            x: currX - direction * segmentW * 0.5,
            y: currY + randomRange(-3, 3),
            rotation: randomRange(-40, 40),
            scale: randomRange(0.7, 1.3),
            colors: getRandomItem(LEAF_COLORS),
            side: Math.random() > 0.5 ? 'left' : 'right',
            shapeIndex: Math.floor(Math.random() * LEAF_SHAPES.length),
            delay,
          });
        }
        if (Math.random() > 0.5) {
          items.push({
            type: 'flower',
            id: `${rect.id}-${isRightSide ? 'r' : 'l'}-flower-${i}`,
            x: currX,
            y: currY,
            palette: getRandomItem(FLOWER_PALETTES),
            size: randomRange(3, 6),
            delay: delay + 0.15,
          });
        }
      }
      return { path, items };
    };
    const leftVine = generateVineSegment(0, centerX, false);
    const rightVine = generateVineSegment(width, centerX, true);
    return { leftVine, rightVine };
  }, [rect.width, rect.id]);

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{ position: 'absolute', left: rect.left, top: rect.top + rect.height - 15, width: rect.width, height: 50, pointerEvents: 'none', zIndex: 10 }}
      >
        <svg width="100%" height="100%" overflow="visible">
          <g>
            <motion.path d={data.leftVine.path} fill="none" stroke={vineStroke} strokeWidth="1.5" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} exit={{ pathLength: 0, opacity: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }} />
            {data.leftVine.items.map((item: any) => (
              <motion.g key={item.id} custom={item.delay} variants={{ visible: (d) => ({ transition: { delay: d, staggerChildren: 0.05 } }), exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } } }}>
                {item.type === 'leaf' ? <Leaf {...item} /> : <Flower {...item} />}
              </motion.g>
            ))}
          </g>
          <g>
            <motion.path d={data.rightVine.path} fill="none" stroke={vineStroke} strokeWidth="1.5" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} exit={{ pathLength: 0, opacity: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }} />
            {data.rightVine.items.map((item: any) => (
              <motion.g key={item.id} custom={item.delay} variants={{ visible: (d) => ({ transition: { delay: d, staggerChildren: 0.05 } }), exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } } }}>
                {item.type === 'leaf' ? <Leaf {...item} /> : <Flower {...item} />}
              </motion.g>
            ))}
          </g>
        </svg>
      </motion.div>
      {rect.isTitle && <UltraHighFidelityRose x={rect.left + rect.width} y={rect.top} />}
    </>
  );
};

// --- Main Component ---
export const SelectionVine: React.FC = () => {
  const [rects, setRects] = useState<SelectionRect[]>([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      setRects([]);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => setIsScrolling(false), 150);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  // Selection handling
  useEffect(() => {
    const handleSelection = () => {
      if (isScrolling) return;
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        setRects([]);
        return;
      }
      const range = selection.getRangeAt(0);
      if (range.toString().length > 3000) { setRects([]); return; }
      const newRects: SelectionRect[] = [];
      const processTextNode = (textNode: Text) => {
        if (newRects.length > 3) return;
        let start = 0;
        let end = textNode.length;
        if (textNode === range.startContainer) start = range.startOffset;
        if (textNode === range.endContainer) end = range.endOffset;
        if (end <= start) return;
        const textContent = textNode.textContent?.substring(start, end) || '';
        if (textContent.trim().length === 0) return;
        const spanRange = document.createRange();
        spanRange.setStart(textNode, start);
        spanRange.setEnd(textNode, end);
        const clientRects = Array.from(spanRange.getClientRects());
        let isTitle = false;
        const parent = textNode.parentElement;
        if (parent) {
          const styles = window.getComputedStyle(parent);
          const fontSize = parseInt(styles.fontSize);
          const tag = parent.tagName;
          if (['H1', 'H2', 'H3', 'H4'].includes(tag) || fontSize > 28) isTitle = true;
        }
        clientRects.forEach(r => {
          if (r.width > 4 && r.height > 0) {
            newRects.push({
              id: `rect-${newRects.length}-${Math.floor(r.top)}-${Math.floor(r.left)}`,
              top: r.top,
              left: r.left,
              width: r.width,
              height: r.height,
              isTitle,
            });
          }
        });
      };
      if (range.commonAncestorContainer.nodeType === Node.TEXT_NODE) {
        processTextNode(range.commonAncestorContainer as Text);
      } else {
        const treeWalker = document.createTreeWalker(
          range.commonAncestorContainer,
          NodeFilter.SHOW_TEXT,
          { acceptNode: (node) => (range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) },
        );
        let node = treeWalker.nextNode();
        while (node && newRects.length <= 3) {
          processTextNode(node as Text);
          node = treeWalker.nextNode();
        }
      }
      if (newRects.length > 2) setRects([]); else setRects(newRects);
    };
    document.addEventListener('selectionchange', handleSelection);
    window.addEventListener('resize', handleSelection);
    if (!isScrolling) handleSelection();
    return () => {
      document.removeEventListener('selectionchange', handleSelection);
      window.removeEventListener('resize', handleSelection);
    };
  }, [isScrolling]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden font-sans">
      <AnimatePresence>
        {!isScrolling && rects.map(rect => <VineDecoration key={rect.id} rect={rect} />)}
      </AnimatePresence>
    </div>
  );
};
