import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSerial } from '@/hooks/useSerial';
import { LandingHero } from '@/components/LandingHero';
import { HeaderBar } from '@/components/HeaderBar';
import { DashboardBuds } from '@/components/DashboardBuds';
import { NoiseControlCard } from '@/components/NoiseControlCard';
import { EQPresetCard } from '@/components/EQPresetCard';
import { SystemFeaturesCard } from '@/components/SystemFeaturesCard';
import { DynamicBassCard } from '@/components/DynamicBassCard';
import { CustomEQCard } from '@/components/CustomEQCard';
import { TouchControlsCard } from '@/components/TouchControlsCard';
import { SerialLog } from '@/components/SerialLog';
import { ConnectionOverlay } from '@/components/ConnectionOverlay';
import { InteractiveBackground } from '@/components/InteractiveBackground';

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.08,
      type: 'spring',
      stiffness: 220,
      damping: 22,
    },
  }),
};

const Index = () => {
  const {
    state,
    logs,
    connect,
    setANC,
    setEQ,
    setVolEnhancer,
    setSys,
    setDynamicBassIntensity,
    setCustomEQ,
    applyTouch,
  } = useSerial();

  const [showFlyOut, setShowFlyOut] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const handleConnect = useCallback(async () => {
    // Start actual connection
    const success = await connect();

    if (success) {
      setShowFlyOut(true);
      
      // After fly-out animation, show dashboard
      setTimeout(() => {
        setShowDashboard(true);
      }, 1300);
    }
  }, [connect]);

  return (
    <div className={`min-h-screen transition-all duration-[600ms] ${state.connected ? 'theme-connected' : ''}`}>
      <InteractiveBackground />


      <AnimatePresence mode="wait">
        {!showDashboard ? (
          <motion.div
            key="landing"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LandingHero
              onConnect={handleConnect}
              isConnecting={state.loading && !showFlyOut}
              showFlyOut={showFlyOut}
            />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            className="relative z-10 pb-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <HeaderBar connected={state.connected} reconnecting={state.reconnecting} onConnect={() => {}} battery={state.battery} />

            {/* Reactive floating earbuds */}
            <DashboardBuds state={state} />

            <div className="w-full max-w-[960px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-5">
              <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
                <NoiseControlCard ancMode={state.ancMode} onSetANC={setANC} />
              </motion.div>

              <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
                <EQPresetCard eqPreset={state.eqPreset} onSetEQ={setEQ} />
              </motion.div>

              <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
                <SystemFeaturesCard
                  features={state.features}
                  volEnhancerOn={state.volEnhancer}
                  onSetSys={setSys}
                  onSetVolEnhancer={setVolEnhancer}
                />
              </motion.div>

              <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
                <DynamicBassCard
                  features={state.features}
                  bassIntensity={state.bassIntensity}
                  onSetSys={setSys}
                  onSetBassIntensity={setDynamicBassIntensity}
                />
              </motion.div>

              <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible" className="md:col-span-2">
                <CustomEQCard bands={state.customEQ} onSetCustomEQ={setCustomEQ} />
              </motion.div>

              <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible" className="md:col-span-2">
                <TouchControlsCard touch={state.touch} onApplyTouch={applyTouch} />
              </motion.div>
            </div>

            <SerialLog logs={logs} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
