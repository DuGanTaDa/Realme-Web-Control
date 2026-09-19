import { motion } from 'framer-motion';
import { Music, Music2, Drum, Waves } from 'lucide-react';

interface EQPresetCardProps {
  eqPreset: number;
  onSetEQ: (val: number) => void;
}

const presets = [
  { label: 'Serenade', value: 2, icon: Music },
  { label: 'Original', value: 0, icon: Music2 },
  { label: 'Deep Bass', value: 1, icon: Drum },
  { label: 'Clear Bass', value: 3, icon: Waves },
];

export function EQPresetCard({ eqPreset, onSetEQ }: EQPresetCardProps) {
  return (
    <motion.div
      className="nm-raised rounded-[1.5rem] p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.05 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="nm-inset w-7 h-7 rounded-xl flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-primary" style={{ boxShadow: '0 0 6px hsl(var(--primary))' }} />
        </div>
        <h2 className="font-mono text-[0.65rem] font-bold tracking-[2px] uppercase text-muted-foreground">
          EQ Preset
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {presets.map((p) => {
          const isActive = eqPreset === p.value;
          const Icon = p.icon;
          return (
            <motion.button
              key={p.value}
              id={`eq-preset-${p.value}`}
              onClick={() => onSetEQ(p.value)}
              className={`relative flex items-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 ${
                isActive ? 'text-primary-foreground' : 'text-muted-foreground'
              }`}
              style={
                isActive
                  ? {
                      background: 'hsl(var(--primary))',
                      boxShadow:
                        'inset 2px 2px 6px hsl(var(--nm-accent-hsl) / 0.25), 0 0 22px var(--nm-glow-strong)',
                    }
                  : {
                      background: 'hsl(var(--nm-base))',
                      boxShadow:
                        '4px 4px 10px var(--nm-shadow-dark), -4px -4px 10px var(--nm-shadow-light)',
                    }
              }
              whileHover={isActive ? {} : { scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
            >
              <Icon className="w-4 h-4" />
              {p.label}
              {isActive && (
                <motion.div
                  layoutId="eq-check"
                  className="absolute right-3 w-2 h-2 rounded-full bg-primary-foreground"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
