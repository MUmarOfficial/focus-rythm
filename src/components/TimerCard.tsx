import React, { useState } from 'react';
import {
  Play,
  Pause,
  XSquare,
  PlusCircle,
  Minimize2,
  FastForward,
  Clock,
  Zap,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { TimerPhase, FxLevel } from '../types';
import { CountdownVaporDigits } from './ui/countdown-vapor-digits';
import { CyberButton } from './ui/CyberButton';
import { CyberCard } from './ui/CyberCard';
import { NeonBadge } from './ui/NeonBadge';
import { TerminalLine } from './ui/TerminalLine';
import { GlitchText } from './ui/GlitchText';
import { QuoteItem } from '../lib/quotes';

export interface TimerCardProps {
  phase: TimerPhase;
  isPaused: boolean;
  currentSegmentIndex: number;
  totalSegments: number;
  endsAt: number;
  currentSegmentRemainingMs: number;
  totalRemainingSessionMs: number;
  completedRounds: number;
  currentWorkQuote: QuoteItem;
  currentRestPrompt: QuoteItem;
  currentRestBenefit: QuoteItem;
  fxLevel: FxLevel;
  onTogglePause: () => void;
  onAddFiveMinutes: () => void;
  onSkipBreak: () => void;
  onMinimize: () => void;
  onEndSession: (saveProgress?: boolean) => void;
  onCycleWorkQuote?: () => void;
  onCycleRestPrompt?: () => void;
  onCycleRestBenefit?: () => void;
}

export const TimerCard: React.FC<TimerCardProps> = ({
  phase,
  isPaused,
  currentSegmentIndex,
  totalSegments,
  endsAt,
  currentSegmentRemainingMs,
  totalRemainingSessionMs,
  completedRounds,
  currentWorkQuote,
  currentRestPrompt,
  currentRestBenefit,
  fxLevel,
  onTogglePause,
  onAddFiveMinutes,
  onSkipBreak,
  onMinimize,
  onEndSession,
  onCycleWorkQuote,
  onCycleRestPrompt,
  onCycleRestBenefit
}) => {
  const [showConfirmEnd, setShowConfirmEnd] = useState<boolean>(false);

  const isWork = phase === 'work';
  const isBreak = phase === 'break';

  const accentColor = isWork ? '#00ff88' : '#00d4ff';

  // Format total remaining session time
  const totalSessionSec = Math.ceil(totalRemainingSessionMs / 1000);
  const totalSessionMin = Math.floor(totalSessionSec / 60);
  const totalSessionSecRem = totalSessionSec % 60;
  const formattedSessionTime = `${totalSessionMin}m ${String(totalSessionSecRem).padStart(2, '0')}s`;

  return (
    <div className="w-full lg:w-[80%] max-w-5xl mx-auto flex-1 min-h-0 h-full flex flex-col justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 overflow-hidden">
      {/* Screen Reader Polite Live Region for phase changes */}
      <div className="sr-only" aria-live="polite">
        {isWork
          ? `Work interval active. ${isPaused ? 'Timer is paused.' : 'Focus on your task.'}`
          : 'Break interval active. Time to step away and rest your eyes.'}
      </div>

      {/* Confirmation Modal */}
      {showConfirmEnd && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-md bg-[#12121a] border border-destructive p-6 cyber-chamfer shadow-[0_0_25px_rgba(255,51,102,0.35)] space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-destructive">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 id="confirm-dialog-title" className="font-heading font-bold text-lg tracking-wider text-foreground">
                TERMINATE SESSION?
              </h3>
            </div>

            <p className="font-mono text-xs leading-relaxed text-muted-foreground">
              Focused time and completed rounds accrued up to this moment will be fully credited and saved to your local stats.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <CyberButton
                variant="outline"
                onClick={() => setShowConfirmEnd(false)}
                className="text-xs"
              >
                RESUME
              </CyberButton>
              <CyberButton
                variant="secondary"
                onClick={() => {
                  setShowConfirmEnd(false);
                  onEndSession(true);
                }}
                className="text-xs border-destructive text-destructive hover:bg-destructive hover:text-background"
              >
                CONFIRM END
              </CyberButton>
            </div>
          </div>
        </div>
      )}

      {/* HUD Header Bar */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 select-none">
        <div className="flex items-center space-x-3">
          <NeonBadge variant={isWork ? 'accent' : 'cyan'}>
            {isWork ? 'PHASE: WORK / FOCUS' : 'PHASE: RECHARGE BREAK'}
          </NeonBadge>

          {isPaused && (
            <NeonBadge variant="magenta" className="animate-pulse">
              PAUSED
            </NeonBadge>
          )}

          <span className="font-mono text-xs text-muted-foreground">
            SEGMENT {currentSegmentIndex + 1}/{totalSegments}
          </span>
        </div>

        {/* HUD Readouts */}
        <div className="flex items-center space-x-4 font-mono text-xs text-muted-foreground">
          <div className="flex items-center space-x-1.5">
            <Clock className="h-3.5 w-3.5 text-[#00ff88]" />
            <span>SESSION REMAINING:</span>
            <span className="text-foreground font-bold tabular-digits">{formattedSessionTime}</span>
          </div>

          <div className="flex items-center space-x-1.5 border-l border-border pl-4">
            <Zap className="h-3.5 w-3.5 text-accent-secondary" />
            <span>ROUNDS:</span>
            <span className="text-[#00ff88] font-bold tabular-digits">{completedRounds}</span>
          </div>
        </div>
      </div>

      {/* Main Countdown Centerpiece */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-4 px-4 bg-[#12121a]/60 border border-border cyber-chamfer relative overflow-hidden">
        {/* Subtle background glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${accentColor} 0%, transparent 70%)`
          }}
        />

        {isBreak ? (
          <div className="text-center mb-1 z-10">
            <GlitchText
              text="YOUR BREAK HAS STARTED"
              as="h2"
              fxLevel={fxLevel}
              className="text-xl sm:text-2xl font-heading font-bold tracking-widest text-accent-tertiary glow-cyan"
            />
            <p className="font-mono text-xs text-muted-foreground mt-1 tracking-wider">
              [SYSTEM COOLDOWN ACTIVE — PROTECT RECOVERY]
            </p>
          </div>
        ) : (
          <div className="text-center mb-1 z-10">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#00ff88]">
              // FOCUS PROTOCOL ENGAGED
            </span>
          </div>
        )}

        <CountdownVaporDigits
          targetTime={endsAt}
          label={isWork ? 'FOCUS TIME' : 'RECOVERY TIME'}
          accentColor={accentColor}
          isPaused={isPaused}
          remainingMs={currentSegmentRemainingMs}
          fxLevel={isBreak ? 'OFF' : fxLevel}
        />

        {/* Action Controls — uniform button widths across both Work and Break phases */}
        {isWork ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md mt-4 z-10">
            {isPaused ? (
              <CyberButton
                variant="default"
                fullWidth
                onClick={onTogglePause}
                className="flex items-center justify-center space-x-2"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>RESUME FOCUS</span>
              </CyberButton>
            ) : (
              <CyberButton
                variant="secondary"
                fullWidth
                onClick={onTogglePause}
                className="flex items-center justify-center space-x-2"
              >
                <Pause className="h-4 w-4 fill-current" />
                <span>PAUSE</span>
              </CyberButton>
            )}

            <CyberButton
              variant="outline"
              fullWidth
              onClick={() => setShowConfirmEnd(true)}
              className="flex items-center justify-center space-x-2"
            >
              <XSquare className="h-4 w-4" />
              <span>END SESSION</span>
            </CyberButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mt-4 z-10">
            <CyberButton
              variant="outline"
              fullWidth
              onClick={onAddFiveMinutes}
              className="border-accent-tertiary/60 text-accent-tertiary hover:border-[#00ff88] hover:text-[#00ff88] hover:bg-[#00ff88]/10 hover:shadow-[0_0_12px_rgba(0,255,136,0.3)] flex items-center justify-center space-x-2"
            >
              <PlusCircle className="h-4 w-4 shrink-0" />
              <span>ADD 5 MINUTES</span>
            </CyberButton>

            <CyberButton
              variant="outline"
              fullWidth
              onClick={onMinimize}
              className="border-accent-tertiary/60 text-accent-tertiary hover:border-[#00ff88] hover:text-[#00ff88] hover:bg-[#00ff88]/10 hover:shadow-[0_0_12px_rgba(0,255,136,0.3)] flex items-center justify-center space-x-2"
            >
              <Minimize2 className="h-4 w-4 shrink-0" />
              <span>MINIMIZE TO DOCK</span>
            </CyberButton>

            <CyberButton
              variant="outline"
              fullWidth
              onClick={onSkipBreak}
              className="border-accent-tertiary/60 text-accent-tertiary hover:border-[#00ff88] hover:text-[#00ff88] hover:bg-[#00ff88]/10 hover:shadow-[0_0_12px_rgba(0,255,136,0.3)] flex items-center justify-center space-x-2"
            >
              <FastForward className="h-4 w-4 shrink-0" />
              <span>START WORK NOW</span>
            </CyberButton>

            {/* END SESSION placed directly beneath MINIMIZE TO DOCK (middle column) with identical width */}
            <div className="sm:col-start-2">
              <CyberButton
                variant="outline"
                fullWidth
                onClick={() => setShowConfirmEnd(true)}
                className="flex items-center justify-center space-x-2 hover:bg-[#00ff88]/10"
              >
                <XSquare className="h-4 w-4 shrink-0" />
                <span>END SESSION</span>
              </CyberButton>
            </div>
          </div>
        )}
      </div>

      {/* Quote / Rest Prompt Display Card — all boxes use TerminalLine typing effect */}
      <div className="shrink-0">
        {isWork ? (
          <CyberCard variant="terminal" title="focus_buffer.txt">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2 mb-2">
              <span className="font-mono text-[11px] uppercase tracking-widest text-[#00ff88] flex items-center gap-1.5 font-bold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>// {currentWorkQuote.category || 'FOCUS PROTOCOL'}</span>
              </span>
              {onCycleWorkQuote && (
                <button
                  type="button"
                  onClick={onCycleWorkQuote}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[11px] text-muted-foreground hover:text-[#00ff88] border border-border hover:border-[#00ff88]/60 cyber-chamfer-sm transition-colors cursor-pointer bg-[#12121a]/80"
                  title="Get another focus strategy suggestion"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>NEXT SUGGESTION</span>
                </button>
              )}
            </div>
            <div className="py-0.5">
              <TerminalLine
                key={currentWorkQuote.id}
                prompt=">"
                text={currentWorkQuote.text}
                typing
                typingSpeed={20}
                showCursor
                cursorColor="accent"
                fxLevel={fxLevel}
                className="text-xs sm:text-sm text-foreground font-medium"
              />
            </div>
          </CyberCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CyberCard variant="terminal" title="rest_action.sh">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-1.5 mb-1.5">
                <span className="font-mono text-xs text-accent-tertiary font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>// {currentRestPrompt.category || 'RECOMMENDED ACTION'}</span>
                </span>
                {onCycleRestPrompt && (
                  <button
                    type="button"
                    onClick={onCycleRestPrompt}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[10px] text-muted-foreground hover:text-accent-tertiary border border-border hover:border-accent-tertiary/60 cyber-chamfer-sm transition-colors cursor-pointer bg-[#12121a]/80"
                    title="Next rest suggestion"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>NEXT ACTION</span>
                  </button>
                )}
              </div>
              <TerminalLine
                key={currentRestPrompt.id}
                prompt=">"
                text={currentRestPrompt.text}
                typing
                typingSpeed={20}
                showCursor
                cursorColor="cyan"
                fxLevel={fxLevel}
                className="text-xs sm:text-sm text-foreground font-medium"
              />
            </CyberCard>

            <CyberCard variant="holographic" cornerAccent="cyan">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#00d4ff]/20 pb-1.5 mb-1.5">
                <span className="font-mono text-xs text-accent-tertiary font-bold uppercase tracking-wider flex items-center space-x-1.5">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>RESTORATION_TELEMETRY:</span>
                </span>
                {onCycleRestBenefit && (
                  <button
                    type="button"
                    onClick={onCycleRestBenefit}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[10px] text-muted-foreground hover:text-accent-tertiary border border-border hover:border-accent-tertiary/60 cyber-chamfer-sm transition-colors cursor-pointer bg-[#12121a]/80"
                    title="Next science rationale"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>NEXT</span>
                  </button>
                )}
              </div>
              <TerminalLine
                key={currentRestBenefit.id}
                prompt=">"
                text={currentRestBenefit.text}
                typing
                typingSpeed={20}
                showCursor
                cursorColor="cyan"
                fxLevel={fxLevel}
                className="text-xs text-muted-foreground"
              />
            </CyberCard>
          </div>
        )}
      </div>
    </div>
  );
};
