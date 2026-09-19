import { motion, AnimatePresence } from 'framer-motion';
import budsCaseImg from '@/assets/buds-case.png';
import budLeftImg from '@/assets/bud-left.png';
import budRightImg from '@/assets/bud-right.png';

interface LandingHeroProps {
  onConnect: () => void;
  isConnecting: boolean;
  showFlyOut: boolean;
}

export function LandingHero({ onConnect, isConnecting, showFlyOut }: LandingHeroProps) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden px-4">
      {/* Title */}
      <motion.div
        className="relative z-10 text-center mb-10"
        initial={{ opacity: 0, y: -30 }}
        animate={showFlyOut ? { opacity: 0, y: -60 } : { opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25, delay: showFlyOut ? 0 : 0.2 }}
      >
        <motion.span
          className="font-mono text-[0.65rem] font-bold tracking-[4px] uppercase text-primary block mb-3"
          initial={{ opacity: 0, letterSpacing: '10px' }}
          animate={{ opacity: 1, letterSpacing: '4px' }}
          transition={{ duration: 0.9, delay: 0.3 }}
        >
          Realme · BT Protocol
        </motion.span>
        <motion.h1
          className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.4 }}
        >
          Buds Air 5 Pro
        </motion.h1>
        <motion.p
          className="text-muted-foreground mt-3 text-sm md:text-base max-w-xs mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
        >
          Connect your earbuds to customize every detail
        </motion.p>
      </motion.div>

      {/* Neumorphic card housing the case image */}
      <motion.div
        className="relative z-10 nm-raised rounded-[2.5rem] p-6 md:p-8 mb-10"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={showFlyOut
          ? { opacity: 0, scale: 0.7, y: 60 }
          : { opacity: 1, scale: 1, y: 0 }
        }
        transition={{ type: 'spring', stiffness: 180, damping: 22, delay: showFlyOut ? 0 : 0.5 }}
      >
        {/* Floating ambient glow behind case */}
        <motion.div
          className="absolute inset-0 rounded-[2.5rem] pointer-events-none"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ boxShadow: '0 0 60px 10px var(--nm-glow)' }}
        />

        {/* Inner inset well */}
        <div className="nm-inset rounded-[2rem] p-4 flex items-center justify-center w-[200px] h-[200px] md:w-[260px] md:h-[260px]">
          <motion.img
            src={budsCaseImg}
            alt="Earbuds case"
            className="w-full h-auto drop-shadow-2xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>

      {/* Flying buds */}
      <AnimatePresence>
        {showFlyOut && (
          <>
            <motion.img
              src={budLeftImg}
              alt="Left earbud"
              className="fixed w-[100px] h-auto drop-shadow-2xl pointer-events-none z-50"
              style={{
                left: '50%', top: '50%',
                willChange: 'transform, opacity',
                transform: 'translateZ(0)',
              }}
              initial={{ opacity: 1, x: -70, y: -50, scale: 0.45, rotate: 0 }}
              animate={{ opacity: 0, x: -380, y: -380, scale: 0.65, rotate: -42 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.img
              src={budRightImg}
              alt="Right earbud"
              className="fixed w-[100px] h-auto drop-shadow-2xl pointer-events-none z-50"
              style={{
                left: '50%', top: '50%',
                willChange: 'transform, opacity',
                transform: 'translateZ(0)',
              }}
              initial={{ opacity: 1, x: 20, y: -50, scale: 0.45, rotate: 0 }}
              animate={{ opacity: 0, x: 330, y: -380, scale: 0.65, rotate: 42 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            />
            {[...Array(6)].map((_, i) => {
              const angle = (i / 6) * Math.PI * 2;
              return (
                <motion.div
                  key={`p-${i}`}
                  className="fixed rounded-full pointer-events-none z-40"
                  style={{
                    width: 6 + i * 2,
                    height: 6 + i * 2,
                    background: 'hsl(var(--primary))',
                    left: '50%', top: '50%',
                    willChange: 'transform, opacity',
                  }}
                  initial={{ opacity: 0.9, x: 0, y: 0, scale: 1 }}
                  animate={{ opacity: 0, x: Math.cos(angle) * 160, y: Math.sin(angle) * 160, scale: 0 }}
                  transition={{ duration: 0.75, delay: 0.08, ease: 'easeOut' }}
                />
              );
            })}
          </>
        )}
      </AnimatePresence>

      {/* Connect Button */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={showFlyOut ? { opacity: 0, y: 40 } : { opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25, delay: showFlyOut ? 0 : 0.85 }}
      >
        <motion.button
          id="connect-btn-landing"
          onClick={onConnect}
          disabled={isConnecting || showFlyOut}
          className="nm-btn-primary relative overflow-hidden px-12 py-4 rounded-[2rem] text-primary-foreground font-bold text-lg tracking-wide disabled:opacity-50 disabled:cursor-wait"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          {/* Ripple on tap */}
          <motion.span
            className="absolute inset-0 rounded-[2rem] bg-white/10"
            initial={{ scale: 0, opacity: 0.5 }}
            whileTap={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 0.45 }}
          />

          <AnimatePresence mode="wait">
            {isConnecting ? (
              <motion.div
                key="connecting"
                className="flex items-center justify-center gap-3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                {/* Morphing Shape Animation */}
                <div className="relative w-6 h-6 flex items-center justify-center">
                  {/* Outer morphing filled shape */}
                  <motion.div
                    className="absolute w-5 h-5 bg-white/40"
                    animate={{
                      scale: [1, 1.15, 1.15, 1, 1],
                      rotate: [0, 90, 180, 270, 360],
                      borderRadius: ["15%", "50%", "15%", "50%", "15%"],
                    }}
                    transition={{
                      duration: 2.4,
                      ease: "easeInOut",
                      times: [0, 0.25, 0.5, 0.75, 1],
                      repeat: Infinity,
                    }}
                  />
                  {/* Inner morphing filled shape (solid) */}
                  <motion.div
                    className="absolute w-2.5 h-2.5 bg-white"
                    animate={{
                      scale: [1, 0.6, 1, 0.6, 1],
                      rotate: [360, 270, 180, 90, 0],
                      borderRadius: ["50%", "15%", "50%", "15%", "50%"]
                    }}
                    transition={{
                      duration: 2.4,
                      ease: "easeInOut",
                      times: [0, 0.25, 0.5, 0.75, 1],
                      repeat: Infinity,
                    }}
                  />
                </div>
                <motion.span
                  className="font-bold tracking-wider text-sm pointer-events-none"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  Pairing...
                </motion.span>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                className="flex items-center gap-2.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M2 12h20" />
                </svg>
                Connect
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Bottom hint */}
      <motion.p
        className="absolute bottom-6 font-mono text-[0.65rem] text-muted-foreground/40 tracking-widest uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: showFlyOut ? 0 : 1 }}
        transition={{ delay: showFlyOut ? 0 : 1.3 }}
      >
        Web Serial API · Chrome / Edge
      </motion.p>
    </div>
  );
}
