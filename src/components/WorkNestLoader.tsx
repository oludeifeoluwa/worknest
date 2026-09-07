import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { WorkNestLogo } from './WorkNestLogo';

interface WorkNestLoaderProps {
  message?: string;
  subMessage?: string;
  onSkip?: () => void;
}

const WORKSPACE_PHASES = [
  { label: 'Connecting to Secure Workspace', note: 'Verifying credentials & session tokens' },
  { label: 'Synchronizing Channels & Direct Messages', note: 'Retrieving latest dispatches and team threads' },
  { label: 'Hydrating Institutional Vault & Directives', note: 'Loading gazettes, deliverables and tasks' },
  { label: 'Workspace Ready', note: 'Preparing your executive dashboard' }
];

export const WorkNestLoader: React.FC<WorkNestLoaderProps> = ({
  message,
  subMessage,
  onSkip
}) => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    // Smooth progress tick
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 96) return prev;
        const increment = Math.random() * 12 + 6;
        return Math.min(Math.round(prev + increment), 96);
      });
    }, 240);

    // Phase transition timer
    const phaseTimer = setInterval(() => {
      setPhaseIndex((prev) => (prev < WORKSPACE_PHASES.length - 1 ? prev + 1 : prev));
    }, 900);

    return () => {
      clearInterval(progressTimer);
      clearInterval(phaseTimer);
    };
  }, []);

  const currentPhase = WORKSPACE_PHASES[phaseIndex];

  return (
    <div 
      id="worknest-fullscreen-loader"
      className="fixed inset-0 z-[9999] min-h-screen w-screen bg-[#F8FAFC] dark:bg-[#090D16] text-stone-900 dark:text-stone-100 flex flex-col items-center justify-between p-6 sm:p-10 select-none transition-colors duration-500 overflow-hidden"
    >
      {/* Top Header Bar */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            WorkNest Sovereign Gateway
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-medium text-stone-500 dark:text-stone-400 bg-white dark:bg-stone-900 px-3 py-1 rounded-full border border-stone-200 dark:border-stone-800 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>256-Bit Encrypted</span>
        </div>
      </div>

      {/* Central Content Stage */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center my-auto">
        
        {/* Brand Mark Container */}
        <div className="relative mb-7 flex items-center justify-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-center p-3">
            <WorkNestLogo 
              size="md" 
            />
          </div>
        </div>

        {/* Workspace Tagline & Title */}
        <div className="space-y-1 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
            WorkNest
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-medium">
            Work Better. Achieve More.
          </p>
        </div>

        {/* Phase Announcement */}
        <div className="w-full min-h-[56px] flex flex-col items-center justify-center mb-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={message ? 'custom' : phaseIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="flex flex-col items-center space-y-1"
            >
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0062FF] shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200">
                  {message || currentPhase.label}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 dark:text-stone-500">
                {subMessage || currentPhase.note}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Modern Progress Bar */}
        <div className="w-full max-w-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-medium text-stone-500 dark:text-stone-400">
            <span className="flex items-center space-x-1.5">
              <Loader2 className="w-3 h-3 text-[#0062FF] animate-spin shrink-0" />
              <span>Loading workspace</span>
            </span>
            <span className="font-semibold text-stone-700 dark:text-stone-300">{progress}%</span>
          </div>

          <div className="h-2 w-full bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden p-[2px] border border-stone-300/50 dark:border-stone-700/50">
            <motion.div 
              className="h-full rounded-full bg-[#0062FF]"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.25 }}
            />
          </div>
        </div>

      </div>

      {/* Bottom Footer Info & Badges */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200/60 dark:border-stone-800/60 text-[11px] text-stone-400 dark:text-stone-500">
        <div className="flex items-center space-x-2">
          <span>Enterprise Collaboration Platform</span>
          <span>•</span>
          <span>Version 3.0</span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <Lock className="w-3 h-3 text-stone-400" />
            <span>End-to-End Secure</span>
          </span>
          <span className="flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Cloud Mesh Active</span>
          </span>
        </div>
      </div>
    </div>
  );
};

