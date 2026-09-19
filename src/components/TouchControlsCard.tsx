import { motion } from 'framer-motion';
import { useState } from 'react';
import type { TouchState } from '@/hooks/useSerial';

interface TouchControlsCardProps {
  touch: TouchState;
  onApplyTouch: (side: 1 | 2, doubleVal: number, tripleVal: number) => void;
}

const touchActions = [
  { value: 0x00, label: 'None' },
  { value: 0x01, label: 'Play / Pause' },
  { value: 0x03, label: 'Voice Assistant' },
  { value: 0x04, label: 'ANC Toggle' },
  { value: 0x05, label: 'Previous Track' },
  { value: 0x06, label: 'Next Track' },
  { value: 0x08, label: 'Volume Up' },
  { value: 0x0b, label: 'Volume Down' },
  { value: 0x0c, label: 'Answer / End Call' },
  { value: 0x0d, label: 'Reject Call' },
  { value: 0x11, label: 'ANC + Awareness' },
  { value: 0x1a, label: 'Transparency Mode' },
  { value: 0x1b, label: 'Noise Cancel Mode' },
  { value: 0x1f, label: 'ANC Cycle' },
];

function NmSelect({ value, onChange, id }: { value: number; onChange: (v: number) => void; id?: string }) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="nm-select w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none cursor-pointer appearance-none"
    >
      {touchActions.map((a) => (
        <option key={a.value} value={a.value} style={{ background: 'hsl(var(--nm-base))' }}>
          {a.label}
        </option>
      ))}
    </select>
  );
}

function EarbudPanel({ title, side, initialDouble, initialTriple, onApply }: {
  title: string;
  side: 1 | 2;
  initialDouble: number;
  initialTriple: number;
  onApply: (side: 1 | 2, d: number, t: number) => void;
}) {
  const [dbl, setDbl] = useState(initialDouble);
  const [trp, setTrp] = useState(initialTriple);
  const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    setApplying(true);
    await onApply(side, dbl, trp);
    setTimeout(() => setApplying(false), 700);
  };

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: 'hsl(var(--nm-base))',
        boxShadow: 'inset 4px 4px 10px var(--nm-shadow-dark), inset -4px -4px 10px var(--nm-shadow-light)',
      }}
    >
      <h3 className="font-mono text-[0.62rem] font-bold tracking-[2px] uppercase text-primary mb-4">
        {title}
      </h3>

      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Double Tap</label>
          <NmSelect id={`touch-${side}-double`} value={dbl} onChange={setDbl} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Triple Tap</label>
          <NmSelect id={`touch-${side}-triple`} value={trp} onChange={setTrp} />
        </div>

        <motion.button
          id={`apply-touch-${side}`}
          onClick={handleApply}
          disabled={applying}
          className="w-full py-2.5 rounded-xl text-primary text-sm font-semibold relative overflow-hidden disabled:opacity-50"
          style={{
            background: 'hsl(var(--nm-base))',
            boxShadow: '4px 4px 10px var(--nm-shadow-dark), -4px -4px 10px var(--nm-shadow-light)',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <motion.span
            className="absolute inset-0 rounded-xl"
            style={{ background: 'hsl(var(--primary) / 0.08)' }}
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          />
          <span className="relative z-10">
            {applying ? (
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                Applying…
              </motion.span>
            ) : (
              `Apply ${side === 1 ? 'Left' : 'Right'}`
            )}
          </span>
        </motion.button>
      </div>
    </div>
  );
}

export function TouchControlsCard({ touch, onApplyTouch }: TouchControlsCardProps) {
  return (
    <motion.div
      className="nm-raised rounded-[1.5rem] p-5 col-span-1 md:col-span-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.25 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="nm-inset w-7 h-7 rounded-xl flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-primary" style={{ boxShadow: '0 0 6px hsl(var(--primary))' }} />
        </div>
        <h2 className="font-mono text-[0.65rem] font-bold tracking-[2px] uppercase text-muted-foreground">
          Touch Controls
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <EarbudPanel
          title="Left Earbud"
          side={1}
          initialDouble={touch.leftDouble}
          initialTriple={touch.leftTriple}
          onApply={onApplyTouch}
        />
        <EarbudPanel
          title="Right Earbud"
          side={2}
          initialDouble={touch.rightDouble}
          initialTriple={touch.rightTriple}
          onApply={onApplyTouch}
        />
      </div>
    </motion.div>
  );
}
