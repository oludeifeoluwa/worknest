import React from 'react';
import { 
  Search, 
  Plus, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Share2, 
  Globe, 
  Terminal,
  Send
} from 'lucide-react';

interface MarketplaceHeroProps {
  totalCount: number;
  connectedCount: number;
  onBrowseClick: () => void;
  onRequestClick: () => void;
  onCreateCustomClick: () => void;
}

export const MarketplaceHero: React.FC<MarketplaceHeroProps> = ({
  totalCount,
  connectedCount,
  onBrowseClick,
  onRequestClick,
  onCreateCustomClick,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#0F172A] text-white p-6 sm:p-8 lg:p-10 border border-slate-800 shadow-xl">
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Headline & Action */}
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Enterprise Integration & Extensions Marketplace</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Plugins & Integrations
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl font-normal leading-relaxed">
              Connect WorkNest to the tools and services your team uses every day. Automate workflows, bridge enterprise files, and streamline organizational collaboration.
            </p>
          </div>

          {/* Workflow Sequence Indicator */}
          <div className="flex items-center flex-wrap gap-2 text-xs font-medium text-slate-300 py-1">
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200">1. Discover</span>
            <span className="text-slate-500">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200">2. Install</span>
            <span className="text-slate-500">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200">3. Configure</span>
            <span className="text-slate-500">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold">4. Use Anywhere</span>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onBrowseClick}
              className="px-5 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#004ECC] active:bg-[#003EA0] text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center space-x-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Search className="w-4 h-4" />
              <span>Browse Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>

            <button
              onClick={onRequestClick}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/20 text-white text-xs font-bold border border-white/15 backdrop-blur-md flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-blue-300" />
              <span>Request an Integration</span>
            </button>

            <button
              onClick={onCreateCustomClick}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-slate-400" />
              <span>Create Extension</span>
            </button>
          </div>
        </div>

        {/* Right Column: Connected Services Network Graphic */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900/80 border border-slate-700/80 p-5 backdrop-blur-xl shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-200">Workspace Integration Mesh</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">{connectedCount} of {totalCount} active</span>
            </div>

            {/* Visual Connected Nodes */}
            <div className="grid grid-cols-3 gap-2.5 py-4">
              <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center">
                <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  G
                </div>
                <span className="text-[10px] font-bold text-slate-200 mt-1.5">Google</span>
                <span className="text-[9px] text-emerald-400 font-mono">Connected</span>
              </div>

              <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-center">
                <div className="w-8 h-8 rounded-lg bg-[#0078D4] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  M
                </div>
                <span className="text-[10px] font-bold text-slate-200 mt-1.5">Microsoft</span>
                <span className="text-[9px] text-blue-300 font-mono">Available</span>
              </div>

              <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center">
                <div className="w-8 h-8 rounded-lg bg-[#2A52BE] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  DS
                </div>
                <span className="text-[10px] font-bold text-slate-200 mt-1.5">DocuSign</span>
                <span className="text-[9px] text-blue-300 font-mono">Available</span>
              </div>

              <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                <div className="w-8 h-8 rounded-lg bg-[#24292F] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  GH
                </div>
                <span className="text-[10px] font-bold text-slate-200 mt-1.5">GitHub</span>
                <span className="text-[9px] text-slate-400 font-mono">Available</span>
              </div>

              <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                <div className="w-8 h-8 rounded-lg bg-[#5E6AD2] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  LN
                </div>
                <span className="text-[10px] font-bold text-slate-200 mt-1.5">Linear</span>
                <span className="text-[9px] text-slate-400 font-mono">Available</span>
              </div>

              <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                <div className="w-8 h-8 rounded-lg bg-[#4A154B] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  SL
                </div>
                <span className="text-[10px] font-bold text-slate-200 mt-1.5">Slack</span>
                <span className="text-[9px] text-slate-400 font-mono">Available</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-Trust Encryption</span>
              </div>
              <span className="text-[10px] text-slate-500">OAuth 2.0 & Webhooks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
