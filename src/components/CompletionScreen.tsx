import React, { useEffect } from 'react';
import { Award, Zap, Clock, RotateCcw } from 'lucide-react';
import { CyberButton } from './ui/CyberButton';
import { CyberCard } from './ui/CyberCard';
import { GlitchText } from './ui/GlitchText';
import { TerminalLine } from './ui/TerminalLine';
import { FxLevel } from '../types';
import { desktop } from '../lib/desktop';

export interface CompletionScreenProps {
  completedRounds: number;
  focusedMinutes: number;
  fxLevel: FxLevel;
  onPlanAnotherSession: () => void;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  completedRounds,
  focusedMinutes,
  fxLevel,
  onPlanAnotherSession
}) => {
  // Ensure fullscreen is exited upon reaching completion screen
  useEffect(() => {
    desktop.setFullscreen(false);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto flex-1 min-h-0 h-full flex flex-col justify-center px-4 py-4 space-y-5 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Header — explicit flex-col with gap-3.5 so the badge and SESSION COMPLETE heading have clear spacing */}
      <div className="flex flex-col items-center justify-center text-center gap-3.5">
        <div className="inline-flex items-center justify-center p-3 border border-[#00ff88]/60 bg-[#00ff88]/10 text-[#00ff88] cyber-chamfer-sm glow-accent mb-1">
          <Award className="h-7 w-7" />
        </div>

        <GlitchText
          text="SESSION COMPLETE"
          as="h1"
          animate
          fxLevel={fxLevel}
          className="text-2xl sm:text-3xl font-heading font-black tracking-widest text-[#00ff88] glow-accent"
        />

        <div className="space-y-1">
          <p className="font-mono text-sm text-foreground font-semibold">
            You did great today.
          </p>

          <p className="font-mono text-xs text-muted-foreground max-w-md mx-auto">
            Consistency grows through small, honest sessions.
          </p>
        </div>
      </div>

      {/* Terminal Log Reveal */}
      <CyberCard variant="terminal" title="session_receipt.log">
        <div className="space-y-1.5 py-0.5">
          <TerminalLine
            prompt=">"
            text="session.status: COMPLETE"
            typing
            typingSpeed={20}
            showCursor={false}
            fxLevel={fxLevel}
            textClassName="text-[#00ff88] font-bold"
          />
          <TerminalLine
            prompt=">"
            text={`rounds_completed: ${completedRounds}`}
            typing
            typingSpeed={20}
            showCursor={false}
            fxLevel={fxLevel}
            textClassName="text-[#e0e0e0]"
          />
          <TerminalLine
            prompt=">"
            text={`focused_minutes: ${focusedMinutes}`}
            typing
            typingSpeed={20}
            showCursor={false}
            fxLevel={fxLevel}
            textClassName="text-[#e0e0e0]"
          />
          <TerminalLine
            prompt=">"
            text="telemetry_saved: localStorage.synced"
            typing
            typingSpeed={20}
            showCursor
            fxLevel={fxLevel}
            textClassName="text-[#6b7280]"
          />
        </div>
      </CyberCard>

      {/* Metric Readout Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#12121a] border border-[#00ff88]/40 p-3.5 cyber-chamfer text-center shadow-[0_0_12px_rgba(0,255,136,0.15)]">
          <div className="flex items-center justify-center text-[#00ff88] mb-1">
            <Clock className="h-5 w-5" />
          </div>
          <div className="font-heading text-2xl sm:text-3xl font-black text-foreground tabular-digits">
            {focusedMinutes}m
          </div>
          <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider mt-0.5">
            Total Focus Time
          </div>
        </div>

        <div className="bg-[#12121a] border border-accent-secondary/40 p-3.5 cyber-chamfer text-center shadow-[0_0_12px_rgba(255,0,255,0.15)]">
          <div className="flex items-center justify-center text-accent-secondary mb-1">
            <Zap className="h-5 w-5" />
          </div>
          <div className="font-heading text-2xl sm:text-3xl font-black text-foreground tabular-digits">
            {completedRounds}
          </div>
          <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider mt-0.5">
            Rounds Completed
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-1">
        <CyberButton
          variant="glitch"
          fullWidth
          onClick={onPlanAnotherSession}
          className="py-3 text-base font-bold flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(0,255,136,0.5)]"
        >
          <RotateCcw className="h-4 w-4" />
          <span>PLAN ANOTHER SESSION</span>
        </CyberButton>
      </div>
    </div>
  );
};
