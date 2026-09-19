import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

declare global {
  interface Window {
    VANTA: any;
  }
}

export function InteractiveBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 45, stiffness: 140 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // ── Mouse tracking ──
  useEffect(() => {
    mouseX.set(window.innerWidth / 2);
    mouseY.set(window.innerHeight / 2);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // ── Vanta Initialization ──
  useEffect(() => {
    const initVanta = () => {
      if (!vantaEffect.current && window.VANTA && window.VANTA.DOTS && vantaRef.current) {
        vantaEffect.current = window.VANTA.DOTS({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          backgroundColor: 0xeff1f3, // Match --nm-base (Light mode off-white)
          color: 0xfcb431,          // Blended Orange (80% opacity simulate)
          color2: 0xfcb431,
          size: 2.50,               // Slightly smaller for more elegance
          spacing: 25.00,
          showLines: false
        });
      }
    };

    // Small delay to ensure scripts are fully evaluated if they were just added
    const timeoutId = setTimeout(initVanta, 100);

    return () => {
      clearTimeout(timeoutId);
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={vantaRef} 
      className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]"
    >
      {/* Layering: The Vanta canvas will render inside vantaRef. 
          We keep the soft motion spotlight on top for extra depth. */}

      {/* Cursor spotlight — soft primary glow */}
      <motion.div
        className="absolute rounded-full blur-[120px]"
        style={{
          width: 700,
          height: 700,
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.10) 0%, transparent 70%)',
          left: smoothX,
          top: smoothY,
          x: '-50%',
          y: '-50%',
          willChange: 'left, top',
        }}
      />
    </div>
  );
}
