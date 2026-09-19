import { motion } from 'framer-motion';
import { Shield, Headphones, Wind } from 'lucide-react';

interface NoiseControlCardProps {
  ancMode: number;
  onSetANC: (val: number) => void;
}

const modes = [
  { label: 'Normal', value: 1, icon: Wind },
  { label: 'ANC', value: 8, icon: Shield },
  { label: 'Transparency', value: 2, icon: Headphones },
];

export function NoiseControlCard({ ancMode, onSetANC }: NoiseControlCardProps) {
  return (
    <motion.div
      className="nm-raised rounded-[1.5rem] p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="nm-inset w-7 h-7 rounded-xl flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-primary" style={{ boxShadow: '0 0 6px hsl(var(--primary))' }} />
        </div>
        <h2 className="font-mono text-[0.65rem] font-bold tracking-[2px] uppercase text-muted-foreground">
          Noise Control
        </h2>
      </div>

      {/* Segment track */}
      <div className="nm-inset rounded-2xl p-1.5 flex gap-1">
        {modes.map((mode) => {
          const isActive = ancMode === mode.value;
          const Icon = mode.icon;
          return (
            <motion.button
              key={mode.value}
              id={`anc-mode-${mode.value}`}
              onClick={() => onSetANC(mode.value)}
              className={`relative flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-medium z-10 transition-colors duration-200 ${
                isActive ? 'text-primary-foreground' : 'text-muted-foreground'
              }`}
              whileTap={{ scale: 0.96 }}
            >
              {isActive && (
                <motion.div
                  layoutId="anc-indicator"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'hsl(var(--primary))',
                    boxShadow: '0 0 18px var(--nm-glow-strong), inset 2px 2px 6px hsl(var(--nm-accent-hsl) / 0.3)',
                  }}
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Icon className="w-4 h-4" />
                {mode.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
