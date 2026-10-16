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
  AlertTriangle
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
  onEndSession
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
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
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
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 select-none">
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
      <div className="flex flex-col items-center justify-center py-6 sm:py-10 bg-[#12121a]/60 border border-border cyber-chamfer relative overflow-hidden">
        {/* Subtle background glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${accentColor} 0%, transparent 70%)`
          }}
        />

        {isBreak ? (
          <div className="text-center mb-2 z-10">
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

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 z-10">
          {isWork ? (
            <>
              {isPaused ? (
                <CyberButton
                  variant="default"
                  onClick={onTogglePause}
                  className="flex items-center space-x-2"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>RESUME FOCUS</span>
                </CyberButton>
              ) : (
                <CyberButton
                  variant="secondary"
                  onClick={onTogglePause}
                  className="flex items-center space-x-2"
                >
                  <Pause className="h-4 w-4 fill-current" />
                  <span>PAUSE</span>
                </CyberButton>
              )}

              <CyberButton
                variant="outline"
                onClick={() => setShowConfirmEnd(true)}
                className="flex items-center space-x-2 hover:border-destructive hover:text-destructive"
              >
                <XSquare className="h-4 w-4" />
                <span>END SESSION</span>
              </CyberButton>
            </>
          ) : (
            <>
              <CyberButton
                variant="default"
                onClick={onAddFiveMinutes}
                className="border-accent-tertiary text-accent-tertiary hover:bg-accent-tertiary hover:text-background hover:shadow-[0_0_15px_rgba(0,212,255,0.6)] focus-visible:ring-accent-tertiary flex items-center space-x-2"
              >
                <PlusCircle className="h-4 w-4" />
                <span>ADD 5 MINUTES</span>
              </CyberButton>

              <CyberButton
                variant="ghost"
                onClick={onMinimize}
                className="flex items-center space-x-2 text-accent-tertiary"
              >
                <Minimize2 className="h-4 w-4" />
                <span>MINIMIZE TO DOCK</span>
              </CyberButton>

              <CyberButton
                variant="glitch"
                onClick={onSkipBreak}
                className="flex items-center space-x-2"
              >
                <FastForward className="h-4 w-4" />
                <span>START WORK NOW</span>
              </CyberButton>
            </>
          )}
        </div>
      </div>

      {/* Quote / Rest Prompt Display Card */}
      {isWork ? (
        <CyberCard variant="terminal" title="focus_buffer.txt">
          <div className="py-1">
            <TerminalLine
              prompt=">"
              text={currentWorkQuote.text}
              typing
              typingSpeed={20}
              showCursor
              cursorColor="accent"
              fxLevel={fxLevel}
              className="text-sm sm:text-base text-foreground"
            />
          </div>
        </CyberCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CyberCard variant="terminal" title="rest_action.sh">
            <div className="space-y-1.5 py-1">
              <span className="font-mono text-xs text-accent-tertiary font-bold uppercase tracking-wider block">
                &gt; RECOMMENDED_ACTION:
              </span>
              <p className="font-mono text-sm text-foreground leading-relaxed">
                {currentRestPrompt.text}
              </p>
            </div>
          </CyberCard>

          <CyberCard variant="holographic" cornerAccent="cyan">
            <div className="space-y-1.5">
              <span className="font-mono text-xs text-accent-tertiary font-bold uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>RESTORATION_TELEMETRY:</span>
              </span>
              <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                {currentRestBenefit.text}
              </p>
            </div>
          </CyberCard>
        </div>
      )}
    </div>
  );
};
