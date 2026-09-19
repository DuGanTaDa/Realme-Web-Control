import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronUp, Terminal } from 'lucide-react';
import type { LogEntry } from '@/hooks/useSerial';

interface SerialLogProps {
  logs: LogEntry[];
}

const typeColor: Record<string, string> = {
  rx: 'text-[hsl(var(--success))]',
  tx: 'text-[hsl(var(--warning))]',
  err: 'text-[hsl(var(--destructive))]',
  info: 'text-[hsl(var(--info))]',
};

export function SerialLog({ logs }: SerialLogProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div className="fixed bottom-0 left-0 right-0 z-50" initial={false}>
      {/* Handle */}
      <div className="flex justify-center">
        <motion.button
          id="serial-log-toggle"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 px-5 py-2 rounded-t-2xl cursor-pointer"
          style={{
            background: 'hsl(var(--nm-base))',
            boxShadow: '-3px -3px 12px var(--nm-shadow-light), 3px -3px 12px var(--nm-shadow-dark)',
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Terminal className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono text-[0.65rem] tracking-[2px] uppercase text-muted-foreground">
            Serial Log
          </span>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
          </motion.div>
        </motion.button>
      </div>

      {/* Log panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 240 }}
            exit={{ height: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="overflow-hidden"
            style={{
              background: 'hsl(var(--nm-base))',
              boxShadow: 'inset 0 4px 20px var(--nm-shadow-dark)',
            }}
          >
            <div className="h-full overflow-y-auto p-4 font-mono text-xs leading-relaxed">
              {logs.length === 0 && (
                <span className="text-muted-foreground">Waiting for serial connection…</span>
              )}
              <AnimatePresence>
                {logs.map((entry, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`${typeColor[entry.type] || 'text-foreground'} break-all`}
                  >
                    <span className="text-muted-foreground">[{entry.time}]</span> {entry.message}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
