import React, { useCallback, useState } from 'react';
import { useStats } from './hooks/use-stats';
import { usePomodoro } from './hooks/use-pomodoro';
import { SetupPanel } from './components/SetupPanel';
import { TimerCard } from './components/TimerCard';
import { CompletionScreen } from './components/CompletionScreen';
import { ScanlineOverlay } from './components/ui/ScanlineOverlay';
import { StatsPage } from './components/StatsPage';

export const App: React.FC = () => {
  const [showStats, setShowStats] = useState(false);
  const {
    settings,
    setSettings,
    fxLevel,
    setFxLevel,
    recordSession,
    todayFocusedMinutes,
    todayRounds,
    currentStreak,
    longestStreak,
    series7Days,
    series30Days,
    hasAnyData
  } = useStats();

  const handleSessionFinish = useCallback(
    (focusedSeconds: number, rounds: number) => {
      recordSession(focusedSeconds, rounds);
    },
    [recordSession]
  );

  const pomodoro = usePomodoro({
    onSessionFinish: handleSessionFinish
  });

  return (
    <div className="relative min-h-screen bg-background text-foreground cyber-grid cyber-noise overflow-x-hidden flex flex-col justify-between selection:bg-[#00ff88]/30 selection:text-[#00ff88]">
      {/* Scanline overlay according to FX Level */}
      <ScanlineOverlay fxLevel={fxLevel} />

      {/* Decorative ambient gradient meshes in corners */}
      <div
        className="pointer-events-none fixed -top-40 -left-40 w-96 h-96 rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, #00ff88 0%, transparent 70%)' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed -bottom-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* Background Decorative SVG PCB Trace Paths at low opacity */}
      <svg
        className="pointer-events-none fixed top-0 right-0 w-64 h-64 opacity-[0.03] text-[#00ff88]"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        aria-hidden="true"
      >
        <path d="M 0,20 L 40,20 L 60,40 L 90,40 L 90,80" />
        <circle cx="40" cy="20" r="2" fill="currentColor" />
        <circle cx="60" cy="40" r="2" fill="currentColor" />
        <circle cx="90" cy="80" r="2" fill="currentColor" />
      </svg>
      <svg
        className="pointer-events-none fixed bottom-0 left-0 w-64 h-64 opacity-[0.03] text-accent-tertiary"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        aria-hidden="true"
      >
        <path d="M 100,80 L 60,80 L 40,60 L 10,60 L 10,20" />
        <circle cx="60" cy="80" r="2" fill="currentColor" />
        <circle cx="40" cy="60" r="2" fill="currentColor" />
        <circle cx="10" cy="20" r="2" fill="currentColor" />
      </svg>

      {/* Thin Screen Router */}
      <main className="relative z-10 flex-1 flex flex-col min-h-0">
        {pomodoro.phase === 'idle' && !showStats && (
          <SetupPanel
            settings={settings}
            onUpdateSettings={setSettings}
            onStartSession={pomodoro.startSession}
            todayMinutes={todayFocusedMinutes}
            todayRounds={todayRounds}
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            fxLevel={fxLevel}
            onChangeFxLevel={setFxLevel}
            onOpenStats={() => setShowStats(true)}
          />
        )}

        {pomodoro.phase === 'idle' && showStats && (
          <StatsPage
            todayMinutes={todayFocusedMinutes}
            todayRounds={todayRounds}
            currentStreak={currentStreak}
            series7Days={series7Days}
            series30Days={series30Days}
            hasData={hasAnyData}
            onBack={() => setShowStats(false)}
          />
        )}

        {(pomodoro.phase === 'work' || pomodoro.phase === 'break') && (
          <TimerCard
            phase={pomodoro.phase}
            isPaused={pomodoro.isPaused}
            currentSegmentIndex={pomodoro.currentSegmentIndex}
            totalSegments={pomodoro.totalSegments}
            endsAt={pomodoro.endsAt}
            currentSegmentRemainingMs={pomodoro.currentSegmentRemainingMs}
            totalRemainingSessionMs={pomodoro.totalRemainingSessionMs}
            completedRounds={pomodoro.completedRounds}
            currentWorkQuote={pomodoro.currentWorkQuote}
            currentRestPrompt={pomodoro.currentRestPrompt}
            currentRestBenefit={pomodoro.currentRestBenefit}
            fxLevel={fxLevel}
            onTogglePause={pomodoro.togglePause}
            onAddFiveMinutes={pomodoro.addFiveMinutes}
            onSkipBreak={pomodoro.skipBreakToWork}
            onMinimize={pomodoro.minimizeToDock}
            onEndSession={pomodoro.endSession}
          />
        )}

        {pomodoro.phase === 'complete' && (
          <CompletionScreen
            completedRounds={pomodoro.completedRounds}
            focusedMinutes={Math.round(pomodoro.accruedWorkSeconds / 60)}
            fxLevel={fxLevel}
            onPlanAnotherSession={pomodoro.resetToSetup}
          />
        )}
      </main>

      {/* Desktop App Status Footer */}
      <footer className="relative z-10 border-t border-border/60 py-2.5 px-4 text-center font-mono text-[11px] text-muted-foreground select-none flex items-center justify-between">
        <span className="flex items-center space-x-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_5px_#00ff88]" />
          <span>LOCAL_CONTAINER: NATIVE_DESKTOP</span>
        </span>
        <span className="text-muted-foreground/80">ZERO CLOUD // FULL PRIVACY // OFFLINE READY</span>
      </footer>
    </div>
  );
};

export default App;
