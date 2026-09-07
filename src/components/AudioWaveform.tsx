import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Mic, Volume2 } from 'lucide-react';
import { VoiceNote } from '../types';

interface AudioWaveformPlayerProps {
  voiceNote: VoiceNote;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  className?: string;
}

export const AudioWaveformPlayer: React.FC<AudioWaveformPlayerProps> = ({
  voiceNote,
  isPlaying: controlledIsPlaying,
  onTogglePlay,
  className = ''
}) => {
  const [internalIsPlaying, setInternalIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0); // 0 to 1
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const isPlaying = controlledIsPlaying !== undefined ? controlledIsPlaying : internalIsPlaying;

  // Parse duration string (e.g. "0:12" or "1:05") to seconds
  const totalSeconds = React.useMemo(() => {
    if (!voiceNote.duration) return 10;
    const parts = voiceNote.duration.split(':').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return Math.max(1, parts[0] * 60 + parts[1]);
    }
    return 10;
  }, [voiceNote.duration]);

  // Waveform bars data
  const waveformBars = React.useMemo(() => {
    if (voiceNote.waveform && voiceNote.waveform.length > 0) {
      return voiceNote.waveform;
    }
    // Default pleasant natural speech waveform pattern
    return [
      25, 40, 65, 80, 50, 35, 70, 95, 85, 60, 45, 75, 
      90, 65, 40, 55, 80, 70, 45, 30, 60, 85, 50, 30
    ];
  }, [voiceNote.waveform]);

  // Current playback time display
  const currentSeconds = Math.floor(playbackProgress * totalSeconds);
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  // Playback timer & progress animation
  useEffect(() => {
    if (isPlaying) {
      const totalDurationMs = (totalSeconds * 1000) / playbackSpeed;
      const initialProgress = playbackProgress >= 1 ? 0 : playbackProgress;
      const startTimestamp = performance.now() - initialProgress * totalDurationMs;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTimestamp;
        const newProgress = Math.min(elapsed / totalDurationMs, 1);
        setPlaybackProgress(newProgress);

        if (newProgress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Finished playback
          if (onTogglePlay) {
            onTogglePlay();
          } else {
            setInternalIsPlaying(false);
          }
          setPlaybackProgress(0);
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);

      // Play soft simulated tone pulses if AudioContext is supported
      try {
        if (!audioContextRef.current) {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            audioContextRef.current = new AudioCtx();
          }
        }
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch(() => {});
        }
      } catch {
        // Safe fallback
      }
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, totalSeconds, playbackSpeed]);

  const handlePlayToggle = () => {
    if (onTogglePlay) {
      onTogglePlay();
    } else {
      setInternalIsPlaying(!internalIsPlaying);
    }
  };

  const handleBarClick = (index: number) => {
    const newProgress = (index + 0.5) / waveformBars.length;
    setPlaybackProgress(newProgress);
  };

  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playbackSpeed === 1) setPlaybackSpeed(1.5);
    else if (playbackSpeed === 1.5) setPlaybackSpeed(2);
    else setPlaybackSpeed(1);
  };

  return (
    <div 
      className={`flex items-center space-x-3 p-2.5 rounded-2xl bg-white dark:bg-stone-900/90 border border-blue-200/80 dark:border-blue-900/80 shadow-2xs transition-all ${className}`}
    >
      {/* Play / Pause Toggle Button */}
      <button
        type="button"
        onClick={handlePlayToggle}
        className="w-8 h-8 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] active:scale-95 text-white flex items-center justify-center shrink-0 shadow-xs transition-transform cursor-pointer"
        title={isPlaying ? 'Pause Voice Note' : 'Play Voice Note'}
      >
        {isPlaying ? (
          <Pause className="w-3.5 h-3.5 fill-current" />
        ) : (
          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
        )}
      </button>

      {/* Interactive Waveform Visualizer */}
      <div className="flex-1 min-w-[120px] max-w-[200px] flex flex-col justify-center space-y-1">
        <div 
          className="flex items-center space-x-[2px] h-6 cursor-pointer group/wave select-none"
          title="Click to seek"
        >
          {waveformBars.map((heightPct, idx) => {
            const barProgress = idx / waveformBars.length;
            const isPassed = barProgress <= playbackProgress;
            const isCurrent = Math.abs(barProgress - playbackProgress) < 1 / waveformBars.length;
            
            // Dynamic bar height with subtle wave pulse when playing
            const dynamicScale = isPlaying && isCurrent ? 1.2 : 1;
            const computedHeight = Math.max(16, Math.min(100, heightPct * dynamicScale));

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleBarClick(idx)}
                style={{ height: `${computedHeight}%` }}
                className={`flex-1 rounded-full transition-all duration-150 cursor-pointer ${
                  isPassed
                    ? isPlaying && isCurrent
                      ? 'bg-cyan-500 scale-y-110 shadow-[0_0_6px_rgba(6,182,212,0.6)]'
                      : 'bg-[#0062FF] dark:bg-blue-500'
                    : 'bg-stone-200 dark:bg-stone-700 hover:bg-blue-300 dark:hover:bg-blue-800'
                }`}
              />
            );
          })}
        </div>

        {/* Timers & Playback info */}
        <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 font-mono select-none">
          <span>{isPlaying ? formatTime(currentSeconds) : voiceNote.duration}</span>
          {isPlaying && (
            <span className="text-stone-400 dark:text-stone-500 text-[9px]">
              / {voiceNote.duration}
            </span>
          )}
        </div>
      </div>

      {/* Playback Speed Controller */}
      <button
        type="button"
        onClick={cycleSpeed}
        className="px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-[10px] font-mono font-bold text-stone-600 dark:text-stone-300 transition-colors cursor-pointer shrink-0"
        title="Playback Speed"
      >
        {playbackSpeed}x
      </button>
    </div>
  );
};

interface AudioRecordingWaveformProps {
  recordingSeconds: number;
  onCancel: () => void;
  onFinish: (waveform: number[]) => void;
}

export const AudioRecordingWaveform: React.FC<AudioRecordingWaveformProps> = ({
  recordingSeconds,
  onCancel,
  onFinish
}) => {
  const [liveAmplitudes, setLiveAmplitudes] = useState<number[]>([
    20, 35, 50, 75, 45, 60, 90, 70, 40, 55, 80, 45, 65, 85, 50, 30
  ]);
  const recordedWaveformRef = useRef<number[]>([]);

  // Format recording timestamp (e.g. 00:08)
  const mins = Math.floor(recordingSeconds / 60);
  const secs = recordingSeconds % 60;
  const timeFormatted = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

  // Live dynamic waveform animation simulation (mimicking live voice input)
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveAmplitudes(() => {
        const next = Array.from({ length: 20 }, (_, i) => {
          // Organic speech frequency curve with sinusoidal oscillation
          const base = 25 + Math.sin((Date.now() / 120) + i * 0.5) * 35;
          const noise = (Math.random() * 30);
          return Math.max(15, Math.min(100, Math.round(base + noise)));
        });
        
        // Accumulate average waveform profile for sending
        const avg = Math.round(next.reduce((a, b) => a + b, 0) / next.length);
        if (recordedWaveformRef.current.length < 24) {
          recordedWaveformRef.current.push(avg);
        }

        return next;
      });
    }, 90);

    return () => clearInterval(interval);
  }, []);

  const handleSend = () => {
    // Return accumulated or normalized waveform
    const resultWaveform = recordedWaveformRef.current.length >= 8 
      ? recordedWaveformRef.current 
      : liveAmplitudes;
    onFinish(resultWaveform);
  };

  return (
    <div 
      id="audio-recording-waveform-panel"
      className="p-3 rounded-2xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fade-in"
    >
      {/* Left indicator & timer */}
      <div className="flex items-center space-x-3 shrink-0">
        <div className="relative flex items-center justify-center">
          <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping absolute opacity-75" />
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 relative shrink-0" />
        </div>
        
        <div className="flex items-center space-x-1.5">
          <Mic className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          <span className="font-mono text-xs font-bold text-rose-900 dark:text-rose-200">
            {timeFormatted}
          </span>
        </div>
      </div>

      {/* Center: Live Oscillating Waveform Visualization */}
      <div className="flex-1 flex items-center justify-center space-x-1 h-8 px-2 bg-white/60 dark:bg-black/30 rounded-xl border border-rose-200/50 dark:border-rose-900/40 overflow-hidden">
        {liveAmplitudes.map((amp, idx) => (
          <span
            key={idx}
            style={{ height: `${amp}%` }}
            className="w-1.5 rounded-full bg-rose-500 dark:bg-rose-400 transition-all duration-75 ease-out"
          />
        ))}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center justify-end space-x-2 shrink-0">
        <button
          type="button"
          onClick={onCancel}
          className="px-2.5 py-1 text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSend}
          className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
        >
          <Square className="w-3 h-3 fill-current" />
          <span>Finish & Send</span>
        </button>
      </div>
    </div>
  );
};
