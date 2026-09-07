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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs select-none animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#111726] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 sm:p-7 space-y-5 overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
              style={{ backgroundColor: plugin.color || '#0062FF' }}
            >
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white leading-tight">
                Install {plugin.shortName || plugin.name}
              </h3>
              <p className="text-[11px] text-stone-400">
                Step {step} of 4: {step === 1 ? 'Review Integration' : step === 2 ? 'Review Permissions' : step === 3 ? 'Installing...' : 'Installation Complete'}
              </p>
            </div>
          </div>

          {step !== 3 && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#0062FF] transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* STEP 1: REVIEW INTEGRATION */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 dark:text-white">{plugin.name}</span>
                <span className="text-[11px] font-mono text-stone-400">v{plugin.version}</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {plugin.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Publisher</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">{plugin.provider || plugin.author}</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Scope</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200 capitalize">{plugin.scope || 'Organization'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#0062FF] shrink-0 mt-0.5" />
              <span>
                This integration is verified by WorkNest Security. No credentials or tokens are shared with unauthorized parties.
              </span>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2 rounded-xl bg-[#0062FF] hover:bg-[#004ECC] text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: REVIEW PERMISSIONS */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300">
                WorkNest will grant the following permissions:
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Review what data and actions {plugin.shortName || plugin.name} will have access to.
              </p>
            </div>

            <div className="space-y-2 bg-stone-50 dark:bg-stone-900/60 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 max-h-56 overflow-y-auto">
              {(plugin.permissions && plugin.permissions.length > 0 ? plugin.permissions : [
                'Read and synchronize upcoming calendar agendas',
                'Access authorized gazette documents and cloud files',
                'Execute authenticated webhooks across organizational channels'
              ]).map((perm, idx) => (
                <div key={idx} className="flex items-start space-x-2.5 text-xs text-stone-700 dark:text-stone-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{perm}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800/80 text-[11px] text-stone-500 dark:text-stone-400 font-mono">
              Authorizing Account: <span className="text-stone-800 dark:text-stone-200 font-bold">{currentUser?.email || 'officer@digital.gov.ng'}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center space-x-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2 rounded-xl bg-[#0062FF] hover:bg-[#004ECC] text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Authorize & Install</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: INSTALLING PROGRESS */}
        {step === 3 && (
          <div className="py-8 space-y-6 text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] flex items-center justify-center mx-auto shadow-inner">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-stone-900 dark:text-white">
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
          <div className="py-4 space-y-5 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base font-extrabold text-stone-900 dark:text-white">
                Plugin Installed Successfully!
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
                <strong>{plugin.name}</strong> is now connected and ready for your organization. You can configure custom settings or test it immediately in the playground.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenConfigure(plugin);
                }}
                className="py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Configure Plugin</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPlayground(plugin);
                }}
                className="py-2.5 px-4 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-[#0062FF] dark:text-blue-400 text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Open in Playground</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#004ECC] text-white text-xs font-bold shadow-md cursor-pointer"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
