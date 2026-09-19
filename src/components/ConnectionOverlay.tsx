import { motion, AnimatePresence } from 'framer-motion';

interface ConnectionOverlayProps {
  visible: boolean;
}

export function ConnectionOverlay({ visible }: ConnectionOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{
            background: 'hsl(var(--nm-base) / 0.88)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Audio Waveform Animation */}
          <div className="flex gap-2 items-center justify-center mb-8 h-12">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                className="w-2.5 rounded-full"
                style={{
                  background: 'hsl(var(--primary))',
                  boxShadow: '0 0 12px hsl(var(--primary) / 0.6), inset 1px 1px 2px rgba(255,255,255,0.5)',
                }}
                animate={{ height: ['20%', '100%', '20%'] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-mono text-sm tracking-[3px] text-muted-foreground uppercase"
          >
            Reading device state…
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
