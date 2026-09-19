import { motion } from 'framer-motion';
import { Zap, Gamepad2, Sparkles, Box, Ear, Volume2 } from 'lucide-react';

interface SystemFeaturesCardProps {
  features: Record<number, number>;
  volEnhancerOn: boolean;
  onSetSys: (id: number, val: number) => void;
  onSetVolEnhancer: (val: number) => void;
}

const featureRows = [
  { id: 0x18, label: 'HD Sound Mode', icon: Zap, accent: true },
  { id: 0x06, label: 'Game Mode', icon: Gamepad2 },
  { id: 0x0B, label: 'Golden Sound', icon: Sparkles },
  { id: 0x1B, label: 'Spatial Audio', icon: Box },
  { id: 0x04, label: 'In-Ear Detection', icon: Ear },
];

function NmToggle({ on, onToggle, id }: { on: boolean; onToggle: (val: boolean) => void; id?: string }) {
  return (
    <motion.button
      id={id}
      onClick={() => onToggle(!on)}
      className="relative w-[52px] h-[28px] rounded-full"
      style={{
        background: on ? 'hsl(var(--primary))' : 'hsl(var(--nm-base))',
        boxShadow: on
          ? 'inset 2px 2px 5px hsl(var(--nm-accent-hsl) / 0.3), 0 0 14px var(--nm-glow)'
          : 'inset 3px 3px 8px var(--nm-shadow-dark), inset -3px -3px 8px var(--nm-shadow-light)',
        transition: 'background 300ms, box-shadow 300ms',
      }}
      whileTap={{ scale: 0.94 }}
    >
      <motion.div
        className="absolute top-[4px] left-[4px] w-5 h-5 rounded-full"
        animate={{ x: on ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 520, damping: 36 }}
        style={{
          background: on ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
          boxShadow: '2px 2px 6px var(--nm-shadow-dark), -1px -1px 4px var(--nm-shadow-light)',
        }}
      />
    </motion.button>
  );
}

export function SystemFeaturesCard({ features, volEnhancerOn, onSetSys, onSetVolEnhancer }: SystemFeaturesCardProps) {
  const allRows = [
    ...featureRows,
    { id: -1, label: 'Volume Enhancer', icon: Volume2, accent: false },
  ];

  return (
    <motion.div
      className="nm-raised rounded-[1.5rem] p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.1 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="nm-inset w-7 h-7 rounded-xl flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-primary" style={{ boxShadow: '0 0 6px hsl(var(--primary))' }} />
        </div>
        <h2 className="font-mono text-[0.65rem] font-bold tracking-[2px] uppercase text-muted-foreground">
          System Features
        </h2>
      </div>

      <div className="flex flex-col">
        {allRows.map((f, i) => {
          const Icon = f.icon;
          const isOn = f.id === -1 ? volEnhancerOn : !!features[f.id];
          return (
            <motion.div
              key={f.id}
              className={`flex items-center justify-between py-3.5 ${
                i < allRows.length - 1 ? 'border-b border-[hsl(var(--border))]' : ''
              }`}
              whileHover={{ x: 2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="flex items-center gap-3">
                <div className="nm-inset w-8 h-8 rounded-xl flex items-center justify-center">
                  <Icon className={`w-3.5 h-3.5 ${f.accent ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <span className={`text-sm ${f.accent ? 'text-primary font-medium' : 'text-secondary-foreground'}`}>
                  {f.label}
                </span>
              </div>
              <NmToggle
                id={`toggle-${f.id}`}
                on={isOn}
                onToggle={(val) =>
                  f.id === -1 ? onSetVolEnhancer(val ? 1 : 0) : onSetSys(f.id, val ? 1 : 0)
                }
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
