import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { useEffect, useState, useMemo, useRef } from 'react';
import budLeftImg from '@/assets/bud-left.png';
import budRightImg from '@/assets/bud-right.png';
import type { DeviceState } from '@/hooks/useSerial';

interface DashboardBudsProps {
  state: DeviceState;
}

// Shared floating + reaction bud — composable for both center and side layouts
function EarbudVisual({
  src,
  alt,
  controls,
  glowColor,
  glowIntensity,
  bassActive,
  bassIntensity,
  floatDelay = 0,
  sizeClass = 'w-[90px] md:w-[110px]',
  sizePx,
}: {
  src: string;
  alt: string;
  controls: ReturnType<typeof useAnimationControls>;
  glowColor: string;
  glowIntensity: number;
  bassActive: boolean;
  bassIntensity: number;
  floatDelay?: number;
  sizeClass?: string;
  sizePx?: number; // explicit pixel size — overrides sizeClass when provided
}) {
  // Glow radius scales with the bud's physical size
  const glowRadius = sizePx
    ? Math.round(sizePx * 0.1 + glowIntensity * sizePx * 0.18)
    : 8 + glowIntensity * 16;

  return (
    // Outer div receives imperative reaction animations (pulse, shake, bob)
    <motion.div 
      animate={controls} 
      className="flex items-center justify-center"
      style={{ 
        willChange: 'transform',
        width: sizePx || undefined,
        height: sizePx ? 'auto' : undefined 
      }}
    >
      {/* Inner img has continuous floating animation */}
      <motion.img
        src={src}
        alt={alt}
        className={sizePx ? 'drop-shadow-2xl' : `${sizeClass} drop-shadow-2xl aspect-square object-contain`}
        animate={
          bassActive
            ? { y: [0, -(3 + bassIntensity * 0.4), 0] }
            : { y: [0, -7, 0] }
        }
        transition={
          bassActive
            ? { duration: 0.38, repeat: Infinity, ease: 'easeInOut', delay: floatDelay }
            : { duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: floatDelay }
        }
        style={{
          filter: `drop-shadow(0 0 ${glowRadius}px ${glowColor})`,
          willChange: 'transform',
          ...(sizePx ? { width: sizePx, height: sizePx, objectFit: 'contain' } : {}),
        }}
      />
    </motion.div>
  );
}

const CONTENT_MAX_W = 960; // matches max-w-[960px] in the layout

export function DashboardBuds({ state }: DashboardBudsProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1400
  );
  const leftControls = useAnimationControls();
  const rightControls = useAnimationControls();
  const prevFeaturesRef = useRef(JSON.stringify(state.features));
  const prevVolRef = useRef(state.volEnhancer);

  // ── Window resize tracking ─────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── Dynamic side-bud sizing ────────────────────────────────────────────
  // sideWidth = empty gutter width on one side of the content column
  const sideWidth = Math.max(0, (windowWidth - CONTENT_MAX_W) / 2);
  // budSize fills ~80 % of the gutter, clamped so it never gets tiny or huge
  const budSize = Math.round(Math.min(320, Math.max(72, sideWidth * 0.82)));
  // center the bud image within the gutter
  const budOffset = Math.max(8, (sideWidth - budSize) / 2);
  // only show side buds when there is meaningful space
  const hasSideSpace = sideWidth >= 90;

  // ── Scroll detection ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // ── Derived glow ─────────────────────────────────────────────────────
  const glowColor = useMemo(() => {
    switch (state.ancMode) {
      case 8: return 'hsl(var(--primary))';
      case 2: return 'hsl(var(--info))';
      default: return 'hsl(var(--muted-foreground))';
    }
  }, [state.ancMode]);
  const glowIntensity = state.ancMode === 1 ? 0.1 : 0.45;
  const bassActive = state.features[0x1D] === 1;
  const bassIntensity = state.bassIntensity;

  // ── ANC change → pulse + slight rotation ─────────────────────────────
  useEffect(() => {
    leftControls.start({
      scale: [1, 1.13, 0.94, 1.06, 1],
      rotate: [0, -4, 4, -2, 0],
      transition: { duration: 0.55, ease: 'easeOut' },
    });
    rightControls.start({
      scale: [1, 1.13, 0.94, 1.06, 1],
      rotate: [0, 4, -4, 2, 0],
      transition: { duration: 0.55, ease: 'easeOut', delay: 0.06 },
    });
  }, [state.ancMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── EQ change → shake left-right ─────────────────────────────────────
  useEffect(() => {
    leftControls.start({
      x: [0, -9, 9, -6, 6, -3, 3, 0],
      rotate: [0, -6, 6, -3, 3, 0],
      transition: { duration: 0.5 },
    });
    rightControls.start({
      x: [0, 9, -9, 6, -6, 3, -3, 0],
      rotate: [0, 6, -6, 3, -3, 0],
      transition: { duration: 0.5, delay: 0.06 },
    });
  }, [state.eqPreset]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Custom EQ / bass intensity → gentle sway ─────────────────────────
  useEffect(() => {
    leftControls.start({
      y: [0, -10, 3, -5, 1, 0],
      rotate: [0, -3, 3, -1, 0],
      transition: { duration: 0.5 },
    });
    rightControls.start({
      y: [0, -10, 3, -5, 1, 0],
      rotate: [0, 3, -3, 1, 0],
      transition: { duration: 0.5, delay: 0.08 },
    });
  }, [state.bassIntensity]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Any system feature / vol enhancer toggle → bob up ────────────────
  useEffect(() => {
    const featStr = JSON.stringify(state.features);
    const volChanged = state.volEnhancer !== prevVolRef.current;

    if (featStr !== prevFeaturesRef.current || volChanged) {
      prevFeaturesRef.current = featStr;
      prevVolRef.current = state.volEnhancer;
      leftControls.start({
        y: [0, -14, 5, -7, 2, 0],
        rotate: [0, 2.5, -2.5, 1, 0],
        transition: { duration: 0.55 },
      });
      rightControls.start({
        y: [0, -14, 5, -7, 2, 0],
        rotate: [0, -2.5, 2.5, -1, 0],
        transition: { duration: 0.55, delay: 0.09 },
      });
    }
  }, [state.features, state.volEnhancer]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Labels ────────────────────────────────────────────────────────────
  const eqLabel = ['Original', 'Deep Bass', 'Serenade', 'Clear Bass'][state.eqPreset] ?? 'Custom';
  const ancLabel = state.ancMode === 8 ? 'ANC' : state.ancMode === 2 ? 'Transparency' : 'Normal';

  return (
    <>
      {/* ── Status pills ── */}
      <motion.div
        className="flex items-center justify-center gap-2 mb-2 flex-wrap px-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.span
          key={ancLabel}
          className="px-3 py-1 rounded-full text-[0.65rem] font-mono font-bold tracking-widest uppercase"
          style={{
            border: `1px solid ${glowColor}`,
            color: glowColor,
            backgroundColor: `color-mix(in srgb, ${glowColor} 10%, transparent)`,
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {ancLabel}
        </motion.span>

        <motion.span
          key={eqLabel}
          className="px-3 py-1 rounded-full text-[0.65rem] font-mono font-bold tracking-widest uppercase"
          style={{
            border: '1px solid hsl(var(--primary) / 0.35)',
            color: 'hsl(var(--primary))',
            backgroundColor: 'hsl(var(--primary) / 0.08)',
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.05 }}
        >
          {eqLabel}
        </motion.span>

        {bassActive && (
          <motion.span
            className="px-3 py-1 rounded-full text-[0.65rem] font-mono font-bold tracking-widest uppercase"
            style={{
              border: '1px solid hsl(var(--warning) / 0.35)',
              color: 'hsl(var(--warning))',
              backgroundColor: 'hsl(var(--warning) / 0.08)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            Bass {bassIntensity >= 0 ? `+${bassIntensity}` : bassIntensity}
          </motion.span>
        )}
      </motion.div>

      {/* ── CENTER layout (visible when at top) ── */}
      <motion.div
        className="w-full max-w-[960px] mx-auto flex items-center justify-center gap-16 md:gap-24 py-4 relative"
        animate={{
          opacity: isScrolled ? 0 : 1,
          y: isScrolled ? -24 : 0,
          pointerEvents: isScrolled ? 'none' : 'auto',
        }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
      >
        {/* Ambient glow between buds */}
        <motion.div
          className="absolute w-[240px] h-[240px] rounded-full pointer-events-none"
          animate={{ opacity: glowIntensity, scale: [1, 1.06, 1] }}
          transition={{
            opacity: { duration: 0.4 },
            scale: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
            filter: 'blur(28px)',
          }}
        />

        {/* Bass rings */}
        {bassActive && [0, 1, 2].map((i) => (
          <motion.div
            key={`ring-${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 90 + i * 44,
              height: 90 + i * 44,
              border: '1px solid hsl(var(--warning) / 0.2)',
            }}
            animate={{ scale: [1, 1.35 + bassIntensity * 0.025], opacity: [0.35, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.28, ease: 'easeOut' }}
          />
        ))}

        {/* Left bud — center */}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, x: -100, scale: 0.5 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.2 }}
        >
          <EarbudVisual
            src={budLeftImg}
            alt="Left earbud"
            controls={leftControls}
            glowColor={glowColor}
            glowIntensity={glowIntensity}
            bassActive={bassActive}
            bassIntensity={bassIntensity}
            floatDelay={0}
          />
        </motion.div>

        {/* Right bud — center */}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, x: 100, scale: 0.5 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.3 }}
        >
          <EarbudVisual
            src={budRightImg}
            alt="Right earbud"
            controls={rightControls}
            glowColor={glowColor}
            glowIntensity={glowIntensity}
            bassActive={bassActive}
            bassIntensity={bassIntensity}
            floatDelay={0.45}
          />
        </motion.div>
      </motion.div>

      {/* ── FIXED SIDE buds (appear when scrolled, dynamically sized) ── */}
      <AnimatePresence>
        {isScrolled && hasSideSpace && (
          <>
            {/* Left side — fixed, centered in the left gutter */}
            <motion.div
              className="fixed z-30 top-1/2"
              style={{
                left: budOffset,
                translateY: '-50%',
                willChange: 'transform, opacity',
              }}
              initial={{ opacity: 0, x: -budSize * 0.6, rotate: -20 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, x: -budSize * 0.6, rotate: -14 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            >
              <EarbudVisual
                src={budLeftImg}
                alt="Left earbud (side)"
                controls={leftControls}
                glowColor={glowColor}
                glowIntensity={glowIntensity}
                bassActive={bassActive}
                bassIntensity={bassIntensity}
                floatDelay={0}
                sizeClass=""
                sizePx={budSize}
              />
            </motion.div>

            {/* Right side — fixed, centered in the right gutter */}
            <motion.div
              className="fixed z-30 top-1/2"
              style={{
                right: budOffset,
                translateY: '-50%',
                willChange: 'transform, opacity',
              }}
              initial={{ opacity: 0, x: budSize * 0.6, rotate: 20 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, x: budSize * 0.6, rotate: 14 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.06 }}
            >
              <EarbudVisual
                src={budRightImg}
                alt="Right earbud (side)"
                controls={rightControls}
                glowColor={glowColor}
                glowIntensity={glowIntensity}
                bassActive={bassActive}
                bassIntensity={bassIntensity}
                floatDelay={0.45}
                sizeClass=""
                sizePx={budSize}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
