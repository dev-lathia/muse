import React, { useRef, useEffect, useState } from 'react';
import { Heart, Flower2 } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
  petalCount: number;
}

export const Confession: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const triggerFlowerShower = () => {
    setAccepted(true);
    setShowConfetti(true);
    // Add a GSAP punch effect to the button area when clicked
    gsap.to(".confession-btn", {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1
    });
  };

  // Text Reveal Animation
  useEffect(() => {
    if (!textContainerRef.current) return;

    const ctx = gsap.context(() => {
        const paragraphs = gsap.utils.toArray<HTMLElement>(".confession-text p");
        
        gsap.fromTo(paragraphs, 
            { opacity: 0, y: 20, filter: "blur(10px)" },
            {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                stagger: 1.5, // Slow stagger for emotional reading pacing
                duration: 2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: textContainerRef.current,
                    start: "top 70%",
                    end: "bottom 80%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }, textContainerRef);

    return () => ctx.revert();
  }, []);

  // Confetti Logic
  useEffect(() => {
    if (!showConfetti || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const colors = ['#F472B6', '#A78BFA', '#FCD34D', '#FB7185', '#E879F9', '#ffffff'];

    // Create initial burst
    for (let i = 0; i < 200; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height + 50,
        vx: (Math.random() - 0.5) * 20,
        vy: -(Math.random() * 15 + 10),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 15 + 5,
        petalCount: 5 + Math.floor(Math.random() * 3)
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // Gravity
        p.rotation += p.rotationSpeed;

        // Draw Flower
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        
        ctx.fillStyle = p.color;
        for (let j = 0; j < p.petalCount; j++) {
          ctx.beginPath();
          ctx.rotate((Math.PI * 2) / p.petalCount);
          ctx.ellipse(0, p.size, p.size / 2, p.size, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Center
        ctx.beginPath();
        ctx.fillStyle = '#FFFBEB';
        ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();

        // Respawn logic (Looping celebration)
        if (p.y > canvas.height + 100) {
          if (Math.random() > 0.95) { 
             p.y = -50;
             p.x = Math.random() * canvas.width;
             p.vy = Math.random() * 5 + 2;
             p.vx = (Math.random() - 0.5) * 2;
             // Add easing bloom effect
             let eased = 0;
             const bloomSpeed = 0.05;
             // Just simple property reset, animation is frame-based
          } else {
             // Recycle as if coming from bottom for continuous fountain or top for rain
             // Let's make it rain now
             p.y = -50;
             p.x = Math.random() * canvas.width;
             p.vy = Math.random() * 5 + 2;
          }
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [showConfetti]);

  return (
    <section className="min-h-screen w-full bg-[#050505] flex items-center justify-center py-32 px-6 relative overflow-hidden">
       <canvas 
         ref={canvasRef} 
         className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-1000 ${showConfetti ? 'opacity-100' : 'opacity-0'}`}
       />

       <div className="max-w-3xl w-full text-center z-20">
          <div className="mb-12 flex justify-center relative">
            <Heart className={`text-red-600 w-20 h-20 ${accepted ? 'animate-[ping_1s_ease-in-out_infinite]' : 'animate-pulse'}`} fill="currentColor" />
            {accepted && <Flower2 className="absolute -top-8 -right-8 text-pink-400 w-12 h-12 animate-bounce" />}
            {accepted && <Flower2 className="absolute -bottom-4 -left-8 text-purple-400 w-10 h-10 animate-bounce" style={{ animationDelay: '0.5s' }} />}
          </div>
          
          <h2 className="font-serif-custom text-5xl md:text-8xl text-white mb-16 tracking-tighter">For You, Drashti</h2>
          
          <div ref={textContainerRef} className="confession-text space-y-12 text-xl md:text-2xl text-gray-300 font-montserrat font-light leading-relaxed text-left md:text-center">
             <p>
               I know you cherish your independence. I know you fight battles every day just to be yourself.
               I admire that fire more than anything.
             </p>
             <p>
               I am an artist, a writer, a creator. But you... you are the art itself.
               Every poem I wrote, every song I composed, every line I sketched—it was all finding its way to you.
             </p>
             <p>
                And I know life can be heavy. So I built this place to be your garden.
                Where flowers never fade, and the music never stops.
             </p>
             <p className="font-serif-custom text-3xl md:text-4xl italic text-white pt-8">
               "I don't want to cage the bird. I just want to be the wind beneath her wings."
             </p>
          </div>

          <div className="mt-24 confession-btn">
            {!accepted ? (
              <button 
                onClick={triggerFlowerShower}
                className="group relative px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full text-white transition-all duration-500 backdrop-blur-md overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3 font-montserrat tracking-widest uppercase text-sm">
                  Accept My Art & My Heart <Flower2 size={18} className="group-hover:rotate-180 transition-transform duration-700" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
              </button>
            ) : (
              <div className="animate-[fadeIn_1s_ease-out]">
                <p className="font-serif-custom text-4xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 animate-gradient-xy">
                  Thank you for being my Muse.
                </p>
              </div>
            )}
          </div>
       </div>
    </section>
  );
};