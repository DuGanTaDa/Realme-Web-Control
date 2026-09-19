import { motion } from 'framer-motion';
import { useCallback } from 'react';

interface CustomEQCardProps {
  bands: number[];
  onSetCustomEQ: (bands: number[]) => void;
}

const bandLabels = [
  { name: 'Bass', freq: '170Hz' },
  { name: 'Low', freq: '400Hz' },
  { name: 'Mid', freq: '4.3k' },
  { name: 'Hi-Mid', freq: '9.5k' },
  { name: 'Treble', freq: '12k' },
  { name: 'Ultra', freq: 'ext' },
];

export function CustomEQCard({ bands, onSetCustomEQ }: CustomEQCardProps) {
  const updateBand = useCallback((index: number, value: number) => {
    const newBands = [...bands];
    newBands[index] = value;
    onSetCustomEQ(newBands);
  }, [bands, onSetCustomEQ]);

  return (
    <motion.div
      className="nm-raised rounded-[1.5rem] p-5 col-span-1 md:col-span-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-6">
        <div className="nm-inset w-7 h-7 rounded-xl flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-primary" style={{ boxShadow: '0 0 6px hsl(var(--primary))' }} />
        </div>
        <h2 className="font-mono text-[0.65rem] font-bold tracking-[2px] uppercase text-muted-foreground">
          Custom EQ — 6 Band
        </h2>
      </div>

      <div className="grid grid-cols-6 gap-3 md:gap-5">
        {bands.map((val, i) => {
          const pct = ((val + 6) / 12) * 100;
          const colorClass = val > 0 ? 'text-[hsl(var(--success))]' : val < 0 ? 'text-[hsl(var(--destructive))]' : 'text-primary';

          return (
            <div key={i} className="flex flex-col items-center gap-3">
              {/* Value badge */}
              <motion.span
                key={val}
                initial={{ scale: 1.25, y: -3 }}
                animate={{ scale: 1, y: 0 }}
                className={`font-mono text-[0.65rem] font-semibold px-1.5 py-0.5 rounded-lg ${colorClass}`}
                style={{
                  background: 'hsl(var(--nm-base))',
                  boxShadow: 'inset 2px 2px 5px var(--nm-shadow-dark), inset -2px -2px 5px var(--nm-shadow-light)',
                }}
              >
                {val >= 0 ? '+' : ''}{val}
              </motion.span>

              {/* Vertical slider track */}
              <div className="relative h-32 w-9 flex items-center justify-center">
                {/* Inset track */}
                <div
                  className="absolute h-full w-2 rounded-full overflow-hidden"
                  style={{
                    background: 'hsl(var(--nm-base))',
                    boxShadow: 'inset 2px 2px 6px var(--nm-shadow-dark), inset -2px -2px 6px var(--nm-shadow-light)',
                  }}
                >
                  {/* Fill bar */}
                  <motion.div
                    className="absolute bottom-0 w-full rounded-full"
                    animate={{ height: `${pct}%` }}
                    transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                    style={{
                      background: 'hsl(var(--primary))',
                      boxShadow: '0 0 8px var(--nm-glow)',
                    }}
                  />
                </div>

                {/* Invisible input on top */}
                <input
                  id={`eq-band-${i}`}
                  type="range"
                  min={-6}
                  max={6}
                  value={val}
                  onChange={(e) => updateBand(i, parseInt(e.target.value))}
                  className="absolute h-full w-full opacity-0 cursor-pointer"
                  style={{ writingMode: 'vertical-lr', direction: 'rtl' } as any}
                />

                {/* Raised thumb */}
                <motion.div
                  className="absolute w-4 h-4 rounded-full pointer-events-none"
                  animate={{ bottom: `calc(${pct}% - 8px)` }}
                  transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                  style={{
                    background: 'hsl(var(--primary))',
                    boxShadow: '2px 2px 6px var(--nm-shadow-dark), 0 0 10px var(--nm-glow)',
                    position: 'absolute',
                  }}
                />
              </div>

              {/* Band label */}
              <div className="text-center">
                <div className="font-mono text-[0.58rem] text-foreground/70 leading-tight font-medium">
                  {bandLabels[i].name}
                </div>
                <div className="font-mono text-[0.5rem] text-muted-foreground/50">
                  {bandLabels[i].freq}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
