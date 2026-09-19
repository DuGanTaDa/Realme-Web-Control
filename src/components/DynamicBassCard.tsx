import { motion } from 'framer-motion';
import { Activity, Mic, Wind } from 'lucide-react';

interface DynamicBassCardProps {
  features: Record<number, number>;
  bassIntensity: number;
  onSetSys: (id: number, val: number) => void;
  onSetBassIntensity: (val: number) => void;
}

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

export function DynamicBassCard({ features, bassIntensity, onSetSys, onSetBassIntensity }: DynamicBassCardProps) {
  const bassOn = !!features[0x1D];
  const enhancedVoices = !!features[0x09];
  const windNoise = !!features[0x1A];

  const rows = [
    { label: 'Bass Toggle', icon: Activity, on: bassOn, id: 0x1D, accent: true },
    { label: 'Enhanced Voices', icon: Mic, on: enhancedVoices, id: 0x09, accent: true },
    { label: 'Wind Noise Reduction', icon: Wind, on: windNoise, id: 0x1A, accent: true },
  ];

  return (
    <motion.div
      className="nm-raised rounded-[1.5rem] p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.15 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="nm-inset w-7 h-7 rounded-xl flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-primary" style={{ boxShadow: '0 0 6px hsl(var(--primary))' }} />
        </div>
        <h2 className="font-mono text-[0.65rem] font-bold tracking-[2px] uppercase text-muted-foreground">
          Dynamic Bass
        </h2>
      </div>

      {/* Toggle rows */}
      {rows.map((r, i) => {
        const Icon = r.icon;
        return (
          <motion.div
            key={r.id}
            className={`flex items-center justify-between py-3.5 ${
              i < rows.length - 1 || true ? 'border-b border-[hsl(var(--border))]' : ''
            }`}
            whileHover={{ x: 2 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="flex items-center gap-3">
              <div className="nm-inset w-8 h-8 rounded-xl flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-sm text-primary font-medium">{r.label}</span>
            </div>
            <NmToggle id={`bass-toggle-${r.id}`} on={r.on} onToggle={(val) => onSetSys(r.id, val ? 1 : 0)} />
          </motion.div>
        );
      })}

      {/* Intensity slider */}
      <div className="pt-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-secondary-foreground">Intensity</span>
          <motion.span
            key={bassIntensity}
            initial={{ scale: 1.3, y: -4 }}
            animate={{ scale: 1, y: 0 }}
            className="font-mono text-xs px-2.5 py-1 rounded-lg text-primary font-semibold"
            style={{
              background: 'hsl(var(--nm-base))',
              boxShadow: 'inset 2px 2px 5px var(--nm-shadow-dark), inset -2px -2px 5px var(--nm-shadow-light)',
            }}
          >
            {bassIntensity >= 0 ? '+' : ''}{bassIntensity}
          </motion.span>
        </div>
        <div className="flex justify-between text-[0.6rem] font-mono text-muted-foreground mb-2">
          <span>-5</span>
          <span>+5</span>
        </div>
        <input
          id="bass-intensity-slider"
          type="range"
          min={-5}
          max={5}
          value={bassIntensity}
          onChange={(e) => onSetBassIntensity(parseInt(e.target.value))}
          className="nm-range w-full"
        />
      </div>
    </motion.div>
  );
}
