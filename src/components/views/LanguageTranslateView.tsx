import React, { useState, useEffect, useRef } from 'react';
import { 
  Languages, 
  ArrowLeftRight, 
  Copy, 
  Check, 
  Volume2, 
  Send, 
  FileText, 
  Trash2, 
  Sparkles, 
  RotateCcw, 
  Clock, 
  MessageSquare, 
  Mail, 
  Mic, 
  MicOff, 
  CornerDownLeft,
  ChevronDown,
  Info,
  Shield,
  Layers,
  FileCheck
} from 'lucide-react';
import { User, Channel, TranslationRecord } from '../../types';
import { translateText, TranslateResponseData } from '../../lib/pluginsData';

export interface LanguageTranslateViewProps {
  currentUser: User;
  channels?: Channel[];
  members?: User[];
  onSendToChannel?: (channelId: string, content: string) => void;
  onSendToDM?: (recipientId: string, content: string) => void;
  onSaveFileToVault?: (title: string, content: string) => void;
  onOpenComposeEmail?: (subject: string, body: string) => void;
}

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  dir?: 'ltr' | 'rtl';
}

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'ha', name: 'Hausa', nativeName: 'Harshen Hausa' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Èdè Yorùbá' },
  { code: 'ig', name: 'Igbo', nativeName: 'Asụsụ Igbo' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', dir: 'rtl' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' }
];

const PRESET_TEMPLATES = [
  {
    title: 'Diplomatic Note',
    text: 'The Permanent Mission presents its compliments and has the honour to confirm the official bilateral consultation scheduled for next week.'
  },
  {
    title: 'Executive Briefing',
    text: 'The executive briefing is scheduled for tomorrow at 10:00 am in the conference suite. Please review the attached docket beforehand.'
  },
  {
    title: 'Immediate Clearance',
    text: 'Approved for immediate implementation. Please circulate the finalized statutory circular to all department heads without delay.'
  },
  {
    title: 'Bilateral Agreement',
    text: 'The undersigned parties hereby certify mutual agreement on the institutional cooperation terms as set forth in the protocol.'
  }
];

const HISTORY_STORAGE_KEY = 'worknest_translation_records';

export const LanguageTranslateView: React.FC<LanguageTranslateViewProps> = ({
  currentUser,
  channels = [],
  members = [],
  onSendToChannel,
  onSendToDM,
  onSaveFileToVault,
  onOpenComposeEmail
}) => {
  const [inputText, setInputText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('fr');
  const [formality, setFormality] = useState<'diplomatic' | 'executive' | 'casual'>('diplomatic');
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedResult, setTranslatedResult] = useState<TranslateResponseData | null>(null);
  const [history, setHistory] = useState<TranslationRecord[]>([]);
  
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [dispatchMenuOpen, setDispatchMenuOpen] = useState(false);
  const [dispatchSuccessMessage, setDispatchSuccessMessage] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Error reading translation history:', e);
    }
  }, []);

  // Save history
  const saveToHistory = (record: TranslationRecord) => {
    const updated = [record, ...history.filter(h => h.id !== record.id)].slice(0, 20);
    setHistory(updated);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving history:', e);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (e) {
      console.warn('Error clearing history:', e);
    }
  };

  // Execute translation
  const handleTranslate = async () => {
    const textToTranslate = inputText.trim();
    if (!textToTranslate) return;

    setIsTranslating(true);
    try {
      const response = await translateText({
        text: textToTranslate,
        sourceLang,
        targetLang,
        formality
      });

      setTranslatedResult(response);

      if (response.status === 'success' && response.translatedText) {
        const sourceOpt = SUPPORTED_LANGUAGES.find(l => l.code === sourceLang);
        const targetOpt = SUPPORTED_LANGUAGES.find(l => l.code === targetLang);

        const newRecord: TranslationRecord = {
          id: `tr_${Date.now()}`,
          originalText: textToTranslate,
          translatedText: response.translatedText,
          sourceLang,
          sourceLangName: response.detectedSourceLanguage || sourceOpt?.name || 'Auto',
          targetLang,
          targetLangName: response.targetLanguage || targetOpt?.name || targetLang,
          formality,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          phoneticGuide: response.phoneticGuide,
          nuanceNote: response.nuanceNote
        };
        saveToHistory(newRecord);
      }
    } catch (err) {
      console.error('Translation failed:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Keyboard shortcut: Cmd/Ctrl + Enter to translate
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleTranslate();
    }
  };

  // Swap source and target languages
  const handleSwapLanguages = () => {
    if (sourceLang === 'auto') {
      const detected = translatedResult?.detectedSourceCode || 'en';
      setSourceLang(targetLang);
      setTargetLang(detected);
    } else {
      const temp = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(temp);
    }

    if (translatedResult?.translatedText) {
      setInputText(translatedResult.translatedText);
      setTranslatedResult(null);
    }
  };

  // Copy translated text
  const handleCopy = () => {
    if (!translatedResult?.translatedText) return;
    navigator.clipboard.writeText(translatedResult.translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Speech synthesis
  const handleSpeak = () => {
    if (!translatedResult?.translatedText || typeof window === 'undefined') return;
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(translatedResult.translatedText);
      utterance.lang = targetLang;
      utterance.rate = 0.95;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Speech Recognition (Voice Input)
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice dictation is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = sourceLang === 'auto' ? 'en-US' : sourceLang;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(prev => (prev ? prev + ' ' + transcript : transcript));
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Voice input error:', e);
      setIsListening(false);
    }
  };

  // Dispatch actions
  const triggerSendToChannel = (channelId: string) => {
    if (!translatedResult?.translatedText) return;
    const ch = channels.find(c => c.id === channelId);
    const text = `🌐 **[Official Translation — ${translatedResult.targetLanguage || targetLang.toUpperCase()}]**\n\n${translatedResult.translatedText}`;
    onSendToChannel?.(channelId, text);
    setDispatchMenuOpen(false);
    setDispatchSuccessMessage(`Dispatched translation directly to #${ch?.name || 'channel'}`);
    setTimeout(() => setDispatchSuccessMessage(null), 3500);
  };

  const triggerSendToDM = (recipientId: string) => {
    if (!translatedResult?.translatedText) return;
    const member = members.find(m => m.id === recipientId);
    const text = `🌐 **[Translated Dispatch — ${translatedResult.targetLanguage || targetLang.toUpperCase()}]**\n\n${translatedResult.translatedText}`;
    onSendToDM?.(recipientId, text);
    setDispatchMenuOpen(false);
    setDispatchSuccessMessage(`Dispatched translation directly to ${member?.name || 'colleague'}`);
    setTimeout(() => setDispatchSuccessMessage(null), 3500);
  };

  const triggerSaveToVault = () => {
    if (!translatedResult?.translatedText) return;
    const title = `Translation_${targetLang.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.md`;
    const content = `# Institutional Translation Record\n\n**Date:** ${new Date().toLocaleString()}\n**Source:** ${translatedResult.detectedSourceLanguage || sourceLang} → **Target:** ${translatedResult.targetLanguage || targetLang}\n**Register:** ${formality.toUpperCase()}\n\n---\n\n### Original Text\n${inputText}\n\n---\n\n### Translated Text\n${translatedResult.translatedText}\n\n${translatedResult.nuanceNote ? `\n*Note: ${translatedResult.nuanceNote}*` : ''}\n`;
    onSaveFileToVault?.(title, content);
    setDispatchSuccessMessage(`Saved official translation to Statutory Files Vault as "${title}"`);
    setTimeout(() => setDispatchSuccessMessage(null), 3500);
  };

  const triggerOpenComposeEmail = () => {
    if (!translatedResult?.translatedText) return;
    const subject = `Translation: [${translatedResult.targetLanguage || targetLang.toUpperCase()}] Official Dispatch`;
    const body = `Official Translated Text:\n\n${translatedResult.translatedText}\n\n---\nOriginal Context:\n${inputText}`;
    onOpenComposeEmail?.(subject, body);
    setDispatchSuccessMessage('Opened email draft with translated text');
    setTimeout(() => setDispatchSuccessMessage(null), 3500);
  };

  const isRtl = targetLang === 'ar' || targetLang === 'he';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-stone-50 dark:bg-[#0A0E1A]">
      {/* Top Header */}
      <header className="px-5 py-3.5 bg-white dark:bg-[#0E1524] border-b border-stone-200 dark:border-stone-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/50 flex items-center justify-center text-[#0062FF] dark:text-blue-400">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-stone-900 dark:text-stone-100 flex items-center space-x-2">
              <span>Universal Language Translate</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Neural Engine Active
              </span>
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Official multilateral translation with diplomatic register adjustment and audio readout
            </p>
          </div>
        </div>

        {/* Formality Selector Pill */}
        <div className="hidden sm:flex items-center space-x-1.5 p-1 rounded-xl bg-stone-100 dark:bg-[#161F33] border border-stone-200/80 dark:border-stone-800 text-xs">
          {(['diplomatic', 'executive', 'casual'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFormality(mode)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer capitalize ${
                formality === mode
                  ? 'bg-white dark:bg-[#0062FF] text-[#0062FF] dark:text-white shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </header>

      {/* Main Translation Workspace */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {/* Notification Toast */}
        {dispatchSuccessMessage && (
          <div className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{dispatchSuccessMessage}</span>
            </div>
            <button 
              onClick={() => setDispatchSuccessMessage(null)}
              className="text-emerald-600 hover:text-emerald-900 cursor-pointer font-bold text-sm"
            >
              ×
            </button>
          </div>
        )}

        {/* Translation Card Container */}
        <div className="bg-white dark:bg-[#111726] rounded-2xl border border-stone-200 dark:border-stone-800/90 shadow-sm overflow-hidden flex flex-col">
          {/* Language Selector Controls Bar */}
          <div className="px-4 py-3 bg-stone-50/70 dark:bg-[#141C2E] border-b border-stone-200 dark:border-stone-800/80 flex flex-wrap items-center justify-between gap-3">
            {/* Source and Target Selectors */}
            <div className="flex items-center space-x-2 flex-1 min-w-[280px]">
              {/* Source Dropdown */}
              <div className="relative flex-1">
                <select
                  id="source-language-select"
                  aria-label="Source Language"
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#1A243B] border border-stone-200 dark:border-stone-700/80 text-stone-800 dark:text-stone-200 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0062FF]"
                >
                  <option value="auto">Auto-Detect Language</option>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={`src-${lang.code}`} value={lang.code}>
                      {lang.name} ({lang.nativeName})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Swap Button */}
              <button
                id="swap-languages-btn"
                onClick={handleSwapLanguages}
                className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700/60 transition-colors cursor-pointer shrink-0"
                title="Swap languages"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>

              {/* Target Dropdown */}
              <div className="relative flex-1">
                <select
                  id="target-language-select"
                  aria-label="Target Language"
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#1A243B] border border-stone-200 dark:border-stone-700/80 text-stone-800 dark:text-stone-200 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0062FF]"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={`tgt-${lang.code}`} value={lang.code}>
                      {lang.name} ({lang.nativeName})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Quick Presets Dropdown */}
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-stone-400 font-medium hidden md:inline">Presets:</span>
              <div className="flex items-center space-x-1">
                {PRESET_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.title}
                    onClick={() => {
                      setInputText(tmpl.text);
                      setTranslatedResult(null);
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-blue-50 hover:text-[#0062FF] dark:hover:bg-blue-950/50 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    {tmpl.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dual Column Editor / Output Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-stone-200 dark:divide-stone-800 min-h-[300px]">
            {/* Left Pane: Input Text */}
            <div className="p-4 md:p-5 flex flex-col justify-between space-y-3">
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    Source Text ({sourceLang === 'auto' ? 'Auto-Detect' : sourceLang.toUpperCase()})
                  </span>
                  {inputText && (
                    <button
                      onClick={() => {
                        setInputText('');
                        setTranslatedResult(null);
                      }}
                      className="text-xs text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <textarea
                  id="translate-input-textarea"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter or paste circular, ministerial order, diplomatic dispatch, or message here... (⌘ + Enter to translate)"
                  className="w-full flex-1 min-h-[160px] md:min-h-[220px] p-2 text-sm leading-relaxed text-stone-900 dark:text-stone-100 bg-transparent border-0 resize-none focus:outline-none placeholder:text-stone-400"
                />
              </div>

              {/* Input Footer: Voice Dictation & Translate Trigger */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800/60 flex items-center justify-between text-xs text-stone-500">
                <div className="flex items-center space-x-2">
                  <button
                    id="voice-dictation-btn"
                    onClick={toggleSpeechRecognition}
                    className={`p-2 rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5 ${
                      isListening
                        ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-600 animate-pulse'
                        : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                    title={isListening ? 'Stop Voice Input' : 'Start Voice Input (Dictate)'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span className="text-[11px] font-medium hidden sm:inline">
                      {isListening ? 'Listening...' : 'Voice'}
                    </span>
                  </button>

                  <span className="text-[11px] text-stone-400">
                    {inputText.length} chars · {inputText.trim() ? inputText.trim().split(/\s+/).length : 0} words
                  </span>
                </div>

                <button
                  id="translate-submit-btn"
                  onClick={handleTranslate}
                  disabled={isTranslating || !inputText.trim()}
                  className="px-4 py-2 rounded-xl bg-[#0062FF] hover:bg-blue-700 disabled:opacity-50 text-white font-semibold flex items-center space-x-2 transition-all shadow-xs cursor-pointer"
                >
                  {isTranslating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Translating...</span>
                    </>
                  ) : (
                    <>
                      <Languages className="w-4 h-4" />
                      <span>Translate</span>
                      <CornerDownLeft className="w-3.5 h-3.5 opacity-70" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Pane: Translation Output */}
            <div className="p-4 md:p-5 flex flex-col justify-between space-y-3 bg-stone-50/40 dark:bg-[#131A2C]">
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      Translated Output ({targetLang.toUpperCase()})
                    </span>
                    {translatedResult?.detectedSourceLanguage && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0062FF] dark:text-blue-400 border border-blue-200/60 font-medium">
                        Detected: {translatedResult.detectedSourceLanguage}
                      </span>
                    )}
                  </div>

                  {translatedResult?.translatedText && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={handleSpeak}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/70 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                        title="Listen to pronunciation"
                      >
                        <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-[#0062FF] animate-pulse' : ''}`} />
                      </button>
                      <button
                        id="copy-translation-btn"
                        onClick={handleCopy}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/70 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                        title="Copy to clipboard"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>

                {translatedResult?.translatedText ? (
                  <div className="space-y-3 flex-1">
                    <div
                      dir={isRtl ? 'rtl' : 'ltr'}
                      className={`text-sm md:text-base leading-relaxed text-stone-900 dark:text-stone-100 select-text font-normal whitespace-pre-wrap ${
                        isRtl ? 'font-serif' : ''
                      }`}
                    >
                      {translatedResult.translatedText}
                    </div>

                    {translatedResult.phoneticGuide && (
                      <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-300">
                        <span className="font-semibold block text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          Phonetic Reading:
                        </span>
                        {translatedResult.phoneticGuide}
                      </div>
                    )}

                    {translatedResult.nuanceNote && (
                      <div className="p-2 rounded-lg bg-stone-200/50 dark:bg-stone-800/50 text-[11px] text-stone-600 dark:text-stone-400 flex items-start space-x-1.5">
                        <Info className="w-3.5 h-3.5 shrink-0 text-[#0062FF] mt-0.5" />
                        <span>{translatedResult.nuanceNote}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-stone-400 space-y-2 min-h-[160px]">
                    <Languages className="w-8 h-8 opacity-40 text-[#0062FF]" />
                    <p className="text-xs">
                      Type or paste content on the left, choose your target language and click <span className="font-semibold text-stone-600 dark:text-stone-300">Translate</span>.
                    </p>
                  </div>
                )}
              </div>

              {/* Right Footer: Dispatch Actions (Send to Channel, Send to DM, Save to Vault) */}
              {translatedResult?.translatedText && (
                <div className="pt-3 border-t border-stone-200/80 dark:border-stone-800/60 flex flex-wrap items-center justify-between gap-2">
                  <div className="relative">
                    <button
                      id="dispatch-translation-btn"
                      onClick={() => setDispatchMenuOpen(!dispatchMenuOpen)}
                      className="px-3 py-1.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-semibold hover:bg-stone-800 dark:hover:bg-stone-100 flex items-center space-x-1.5 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send / Export</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                    </button>

                    {/* Dispatch Dropdown Menu */}
                    {dispatchMenuOpen && (
                      <div className="absolute left-0 bottom-full mb-1.5 w-60 rounded-xl bg-white dark:bg-[#1A243B] border border-stone-200 dark:border-stone-700 shadow-lg p-1.5 z-30 space-y-1 text-xs">
                        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          Workspace Channels
                        </div>
                        {channels.slice(0, 4).map((ch) => (
                          <button
                            key={ch.id}
                            onClick={() => triggerSendToChannel(ch.id)}
                            className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-left cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span className="truncate">Post to #{ch.name}</span>
                          </button>
                        ))}

                        <div className="pt-1 border-t border-stone-100 dark:border-stone-800">
                          <button
                            onClick={triggerSaveToVault}
                            className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-left cursor-pointer"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Save to Statutory Vault</span>
                          </button>
                          <button
                            onClick={triggerOpenComposeEmail}
                            className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-left cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>Draft Official Dispatch Email</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5 text-[11px] text-stone-500">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>State Registry Authenticated</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Translation History Section */}
        {history.length > 0 && (
          <div className="bg-white dark:bg-[#111726] rounded-2xl border border-stone-200 dark:border-stone-800/90 p-4 md:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-stone-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Recent Institutional Translations ({history.length})
                </h2>
              </div>
              <button
                onClick={clearHistory}
                className="text-xs text-stone-400 hover:text-rose-600 transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            </div>

            <div className="divide-y divide-stone-100 dark:divide-stone-800/60 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
              {history.map((rec) => (
                <div
                  key={rec.id}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-stone-50/50 dark:hover:bg-stone-800/30 px-2 rounded-xl transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-stone-800 dark:text-stone-200">
                        {rec.sourceLangName} → {rec.targetLangName}
                      </span>
                      <span className="text-[10px] text-stone-400">· {rec.timestamp}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500">
                        {rec.formality}
                      </span>
                    </div>
                    <p className="text-stone-500 truncate text-[11px] mb-0.5">
                      {rec.originalText}
                    </p>
                    <p className="text-stone-800 dark:text-stone-300 font-medium truncate">
                      {rec.translatedText}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => {
                        setInputText(rec.originalText);
                        setTargetLang(rec.targetLang);
                        setTranslatedResult({
                          status: 'success',
                          translatedText: rec.translatedText,
                          detectedSourceLanguage: rec.sourceLangName,
                          detectedSourceCode: rec.sourceLang,
                          targetLanguage: rec.targetLangName,
                          targetCode: rec.targetLang,
                          phoneticGuide: rec.phoneticGuide,
                          nuanceNote: rec.nuanceNote
                        });
                      }}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-[#0062FF] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                      title="Restore to editor"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(rec.translatedText);
                      }}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                      title="Copy translation"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default LanguageTranslateView;
