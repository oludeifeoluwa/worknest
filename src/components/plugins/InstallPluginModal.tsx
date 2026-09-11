import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  CheckCircle2, 
  ShieldCheck, 
  RefreshCw, 
  ArrowRight, 
  ArrowLeft, 
  Play, 
  Settings, 
  Download, 
  Layers, 
  Zap, 
  Lock, 
  ExternalLink
} from 'lucide-react';
import { WorkNestPlugin, Member } from '../../types';

interface InstallPluginModalProps {
  plugin: WorkNestPlugin | null;
  currentUser: Member | null;
  onClose: () => void;
  onSuccess: (plugin: WorkNestPlugin) => void;
  onOpenPlayground: (plugin: WorkNestPlugin) => void;
  onOpenConfigure: (plugin: WorkNestPlugin) => void;
}

export const InstallPluginModal: React.FC<InstallPluginModalProps> = ({
  plugin,
  currentUser,
  onClose,
  onSuccess,
  onOpenPlayground,
  onOpenConfigure,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [installProgress, setInstallProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('Initiating cryptographic handshake...');

  useEffect(() => {
    if (step === 3 && plugin) {
      setInstallProgress(15);
      setCurrentTask('Validating institutional workspace credentials...');

      const timer1 = setTimeout(() => {
        setInstallProgress(45);
        setCurrentTask('Establishing secure OAuth 2.0 token exchange...');
      }, 700);

      const timer2 = setTimeout(() => {
        setInstallProgress(80);
        setCurrentTask('Registering real-time event webhooks & slash triggers...');
      }, 1400);

      const timer3 = setTimeout(() => {
        setInstallProgress(100);
        setCurrentTask('Installation and verification complete!');
        setStep(4);
        onSuccess(plugin);
      }, 2100);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [step, plugin]);

  if (!plugin) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-xs select-none overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-[#111726] rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col my-6 animate-scale-in">
        
        {/* Modal Header */}
        <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/70 dark:bg-stone-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5">
            <div 
              className="w-11 h-11 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
              style={{ backgroundColor: plugin.color || '#0062FF' }}
            >
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white leading-tight">
                Install {plugin.shortName || plugin.name}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Step {step} of 4: {step === 1 ? 'Review Integration' : step === 2 ? 'Review Permissions' : step === 3 ? 'Installing...' : 'Installation Complete'}
              </p>
            </div>
          </div>

          {step !== 3 && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 shrink-0">
          <div 
            className="h-full bg-[#0062FF] transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="px-6 sm:px-8 py-6 sm:py-8 space-y-6 overflow-y-auto">

        {/* STEP 1: REVIEW INTEGRATION */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-5 rounded-2xl bg-stone-50/80 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-stone-900 dark:text-white">{plugin.name}</span>
                <span className="text-xs font-mono text-stone-400">v{plugin.version}</span>
              </div>
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                {plugin.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-stone-50/60 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Publisher</span>
                <span className="font-semibold text-sm text-stone-800 dark:text-stone-200">{plugin.provider || plugin.author}</span>
              </div>
              <div className="p-4 rounded-2xl bg-stone-50/60 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Scope</span>
                <span className="font-semibold text-sm text-stone-800 dark:text-stone-200 capitalize">{plugin.scope || 'Organization'}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs sm:text-sm text-blue-900 dark:text-blue-200 flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-[#0062FF] shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                This integration is verified by WorkNest Security. No credentials or tokens are shared with unauthorized parties.
              </span>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-100 dark:border-stone-800/80">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#004ECC] text-white text-sm font-bold shadow-xs flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: REVIEW PERMISSIONS */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">
                WorkNest will grant the following permissions:
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Review what data and actions {plugin.shortName || plugin.name} will have access to.
              </p>
            </div>

            <div className="space-y-3 bg-stone-50/80 dark:bg-stone-900/60 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 max-h-60 overflow-y-auto">
              {(plugin.permissions && plugin.permissions.length > 0 ? plugin.permissions : [
                'Read and synchronize upcoming calendar agendas',
                'Access authorized gazette documents and cloud files',
                'Execute authenticated webhooks across organizational channels'
              ]).map((perm, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{perm}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-stone-100/70 dark:bg-stone-800/60 text-xs text-stone-600 dark:text-stone-400 font-mono">
              Authorizing Account: <span className="text-stone-900 dark:text-stone-100 font-bold">{currentUser?.email || 'officer@digital.gov.ng'}</span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800/80">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#004ECC] text-white text-sm font-bold shadow-xs flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Authorize & Install</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: INSTALLING PROGRESS */}
        {step === 3 && (
          <div className="py-10 space-y-6 text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] flex items-center justify-center mx-auto shadow-sm">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-bold text-stone-900 dark:text-white">
                Installing {plugin.shortName || plugin.name}...
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                {currentTask}
              </p>
            </div>

            <div className="w-full bg-stone-100 dark:bg-stone-800 h-2.5 rounded-full overflow-hidden max-w-sm mx-auto">
              <div 
                className="h-full bg-[#0062FF] transition-all duration-500 rounded-full"
                style={{ width: `${installProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 4 && (
          <div className="py-6 space-y-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-bold text-stone-900 dark:text-white">
                Plugin Installed Successfully!
              </h4>
              <p className="text-sm text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
                <strong>{plugin.name}</strong> is now connected and ready for your organization. You can configure custom settings or test it immediately in the playground.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenConfigure(plugin);
                }}
                className="py-3 px-4 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-sm font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                <span>Configure Plugin</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPlayground(plugin);
                }}
                className="py-3 px-4 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-[#0062FF] dark:text-blue-400 text-sm font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>Open in Playground</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl sm:rounded-2xl bg-[#0062FF] hover:bg-[#004ECC] text-white text-sm font-bold shadow-md transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        )}

        </div>

      </div>
    </div>
  );
};
