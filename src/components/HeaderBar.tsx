import { motion } from 'framer-motion';

interface HeaderBarProps {
  connected: boolean;
  reconnecting?: boolean;
  onConnect: () => void;
  battery?: { left: number; right: number; case: number };
}

export function HeaderBar({ connected, reconnecting, onConnect, battery }: HeaderBarProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-full max-w-[960px] mx-auto flex justify-between items-center px-4 py-5 md:py-6"
    >
      {/* Logo */}
      <div className="nm-raised rounded-2xl px-4 py-2.5 flex flex-col gap-0.5">
        <span className="font-mono text-[0.6rem] font-bold tracking-[3px] uppercase text-primary">
          Realme · BT
        </span>
        <span className="text-base md:text-lg font-bold text-foreground tracking-tight">
          Buds Air 5 Pro
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Status pill */}
        <motion.div
          layout
          className={`nm-inset flex items-center gap-2.5 px-4 py-2 rounded-full`}
        >
          <motion.div
            className={`w-2 h-2 rounded-full ${
              reconnecting
                ? 'bg-[hsl(var(--warning))]'
                : connected
                ? 'bg-[hsl(var(--success))]'
                : 'bg-[hsl(var(--destructive))]'
            }`}
            animate={
              reconnecting
                ? { scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }
                : connected
                ? { scale: 1 }
                : { scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }
            }
            transition={{ duration: reconnecting ? 0.8 : 1.8, repeat: Infinity }}
            style={
              reconnecting
                ? { boxShadow: '0 0 8px hsl(var(--warning))' }
                : connected
                ? { boxShadow: '0 0 8px hsl(var(--success))' }
                : { boxShadow: '0 0 8px hsl(var(--destructive))' }
            }
          />
          <span className="font-mono text-[0.68rem] tracking-wider text-muted-foreground">
            {reconnecting ? 'RECONNECTING…' : connected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </motion.div>
      </div>
    </motion.header>
  );
}
