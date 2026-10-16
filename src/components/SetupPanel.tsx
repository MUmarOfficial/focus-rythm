import React, { useState, useEffect } from 'react';
import {
  Sliders,
  CheckCircle2,
  Terminal,
  Activity,
  ChartNoAxesCombined,
  Volume2,
  VolumeX
} from 'lucide-react';
import { SessionSettings, PresetKey, PRESET_CONFIGS, FxLevel } from '../types';
import { CyberButton } from './ui/CyberButton';
import { CyberCard } from './ui/CyberCard';
import { CyberInput } from './ui/CyberInput';
import { GlitchText } from './ui/GlitchText';
import { TerminalLine } from './ui/TerminalLine';
import { NeonBadge } from './ui/NeonBadge';

export interface SetupPanelProps {
  settings: SessionSettings;
  onUpdateSettings: (settings: SessionSettings) => void;
  onStartSession: (settings: SessionSettings) => void;
  todayMinutes: number;
  todayRounds: number;
  currentStreak: number;
  longestStreak: number;
  fxLevel: FxLevel;
  onChangeFxLevel: (level: FxLevel) => void;
  onOpenStats: () => void;
}

export const SetupPanel: React.FC<SetupPanelProps> = ({
  settings,
  onUpdateSettings,
  onStartSession,
  todayMinutes,
  todayRounds,
  currentStreak,
  longestStreak,
  fxLevel,
  onChangeFxLevel,
  onOpenStats
}) => {
  // Local input state for validation
  const [totalMinInput, setTotalMinInput] = useState<string>(String(settings.totalMinutes));
  const [workMinInput, setWorkMinInput] = useState<string>(String(settings.workMinutes));
  const [breakMinInput, setBreakMinInput] = useState<string>(String(settings.breakMinutes));

  // Sync inputs if settings change externally
  useEffect(() => {
    setTotalMinInput(String(settings.totalMinutes));
    setWorkMinInput(String(settings.workMinutes));
    setBreakMinInput(String(settings.breakMinutes));
  }, [settings.totalMinutes, settings.workMinutes, settings.breakMinutes]);

  // Validation
  const totalVal = Number(totalMinInput);
  const workVal = Number(workMinInput);
  const breakVal = Number(breakMinInput);

  let totalError: string | null = null;
  if (!totalMinInput || isNaN(totalVal) || !Number.isInteger(totalVal)) {
    totalError = 'Must be a whole number';
  } else if (totalVal < 1) {
    totalError = 'Minimum session is 1 min';
  } else if (totalVal > 720) {
    totalError = 'Maximum session is 720 min (12 hours)';
  }

  let workError: string | null = null;
  if (!workMinInput || isNaN(workVal) || !Number.isInteger(workVal)) {
    workError = 'Must be a whole number';
  } else if (workVal < 1) {
    workError = 'Work interval must be at least 1 min';
  } else if (workVal > 180) {
    workError = 'Work interval cannot exceed 180 min';
  }

  let breakError: string | null = null;
  if (!breakMinInput || isNaN(breakVal) || !Number.isInteger(breakVal)) {
    breakError = 'Must be a whole number';
  } else if (breakVal < 1) {
    breakError = 'Break interval must be at least 1 min';
  } else if (breakVal > 60) {
    breakError = 'Break interval cannot exceed 60 min';
  }

  const isValid = !totalError && !workError && !breakError;

  const handleSelectPreset = (key: PresetKey) => {
    if (key === 'custom') {
      onUpdateSettings({
        preset: 'custom',
        totalMinutes: totalVal || 120,
        workMinutes: workVal || 40,
        breakMinutes: breakVal || 10,
        soundCues: settings.soundCues
      });
      return;
    }
    const preset = PRESET_CONFIGS[key];
    onUpdateSettings({
      preset: key,
      totalMinutes: preset.totalMinutes,
      workMinutes: preset.workMinutes,
      breakMinutes: preset.breakMinutes,
      soundCues: settings.soundCues
    });
    setTotalMinInput(String(preset.totalMinutes));
    setWorkMinInput(String(preset.workMinutes));
    setBreakMinInput(String(preset.breakMinutes));
  };

  const handleCustomChange = (
    field: 'total' | 'work' | 'break',
    valStr: string
  ) => {
    if (field === 'total') setTotalMinInput(valStr);
    if (field === 'work') setWorkMinInput(valStr);
    if (field === 'break') setBreakMinInput(valStr);

    const t = field === 'total' ? Number(valStr) : totalVal;
    const w = field === 'work' ? Number(valStr) : workVal;
    const b = field === 'break' ? Number(valStr) : breakVal;

    if (Number.isInteger(t) && t >= 1 && Number.isInteger(w) && w >= 1 && Number.isInteger(b) && b >= 1) {
      onUpdateSettings({
        preset: 'custom',
        totalMinutes: t,
        workMinutes: w,
        breakMinutes: b,
        soundCues: settings.soundCues
      });
    }
  };

  const handleStart = () => {
    if (!isValid) return;
    onStartSession({
      preset: settings.preset,
      totalMinutes: totalVal,
      workMinutes: workVal,
      breakMinutes: breakVal,
      soundCues: settings.soundCues
    });
  };

  const presetKeys = Object.keys(PRESET_CONFIGS) as Array<Exclude<PresetKey, 'custom'>>;

  return (
    <div className="w-full max-w-[1600px] mx-auto flex-1 min-h-0 h-full flex flex-col gap-3 px-4 py-3 sm:px-6 sm:py-4 overflow-hidden">
      {/* Top Header */}
      <header className="shrink-0 w-full lg:w-[80%] mx-auto border-b border-border pb-2.5 flex flex-col md:flex-row md:items-end justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="p-1.5 border border-[#00ff88]/50 bg-[#00ff88]/10 text-[#00ff88] cyber-chamfer-sm">
              <Terminal className="h-4 w-4" />
            </span>
            <GlitchText
              text="FOCUS RHYTHM"
              as="h1"
              animate
              fxLevel={fxLevel}
              className="text-xl sm:text-2xl font-heading font-black tracking-widest text-[#00ff88] glow-accent"
            />
            <NeonBadge variant="accent" size="sm">
              v0.1.0_BETA
            </NeonBadge>
          </div>
          <TerminalLine
            prompt=">"
            text="initialize deep_work.session_"
            typing
            typingSpeed={30}
            showCursor
            fxLevel={fxLevel}
            className="mt-1 text-xs text-muted-foreground"
          />
        </div>

        {/* FX Guardrail Switch */}
        <div className="flex items-center space-x-1.5 bg-[#12121a] p-1 border border-border cyber-chamfer-sm text-xs font-mono">
          <span className="text-muted-foreground px-2 uppercase tracking-wider flex items-center space-x-1">
            <Sliders className="h-3.5 w-3.5 inline mr-1" />
            FX:
          </span>
          {(['FULL', 'LOW', 'OFF'] as FxLevel[]).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => onChangeFxLevel(level)}
              className={`px-2 py-0.5 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                fxLevel === level
                  ? 'bg-[#00ff88] text-background font-bold shadow-[0_0_8px_rgba(0,255,136,0.5)]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </header>

      {/* Landscape cadence strip stays above the working area */}
      <div className="shrink-0 w-full lg:w-[80%] mx-auto">
        <CyberCard variant="holographic" cornerAccent="accent" className="py-2.5 px-3.5 sm:py-3 sm:px-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 min-w-48">
              <span className="flex h-8 w-8 items-center justify-center border border-[#00ff88]/40 bg-[#00ff88]/10 text-[#00ff88] cyber-chamfer-sm">
                <Activity className="h-4 w-4" />
              </span>
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#00ff88] font-bold">
                  BIOMETRIC_CADENCE
                </div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  TODAY_SUMMARY // LIVE LOCAL TELEMETRY
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full md:w-96 text-center">
              <div className="bg-background/60 py-1.5 px-2 border border-border cyber-chamfer-sm">
                <div className="font-heading text-base sm:text-lg font-bold text-foreground tabular-digits">
                  {todayMinutes}m
                </div>
                <div className="font-mono text-[10px] uppercase text-muted-foreground tracking-wider">
                  Focused
                </div>
              </div>
              <div className="bg-background/60 py-1.5 px-2 border border-border cyber-chamfer-sm">
                <div className="font-heading text-base sm:text-lg font-bold text-accent-tertiary tabular-digits">
                  {todayRounds}
                </div>
                <div className="font-mono text-[10px] uppercase text-muted-foreground tracking-wider">
                  Rounds
                </div>
              </div>
              <div className="bg-background/60 py-1.5 px-2 border border-border cyber-chamfer-sm">
                <div className="font-heading text-base sm:text-lg font-bold text-accent-secondary tabular-digits">
                  {currentStreak}d
                </div>
                <div className="font-mono text-[10px] uppercase text-muted-foreground tracking-wider">
                  Streak
                </div>
              </div>
            </div>
            {longestStreak > 0 && (
              <div className="font-mono text-[11px] text-[#ffbd2e] whitespace-nowrap">
                RECORD: {longestStreak} DAYS
              </div>
            )}
          </div>
        </CyberCard>
      </div>

      {/* The setup console covers 80% width and dynamically expands to fill the screen */}
      <div className="w-full lg:w-[80%] mx-auto flex-1 min-h-0 flex flex-col">
        <CyberCard
          variant="terminal"
          title="protocol_config.sh"
          className="flex-1 min-h-0"
          bodyClassName="justify-between gap-3 overflow-y-auto"
        >
          {/* Presets section expands dynamically to fill vertical and horizontal space */}
          <div className="flex-1 min-h-0 flex flex-col">
            <h2 className="shrink-0 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 flex items-center justify-between">
              <span>// Select Protocol Preset</span>
              <span className="text-[#00ff88]/60">[7 protocols | custom tuner]</span>
            </h2>

            <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-6 lg:grid-cols-12 auto-rows-fr gap-2.5">
              {presetKeys.map((key, idx) => {
                const preset = PRESET_CONFIGS[key];
                const isSelected = settings.preset === key;
                // First 4 cards take 3 cols each on lg (4x3=12), last 3 cards take 4 cols each on lg (3x4=12) so every row fills 100% width
                const spanClasses =
                  idx < 4
                    ? 'sm:col-span-3 lg:col-span-3'
                    : 'sm:col-span-2 lg:col-span-4';

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectPreset(key)}
                    className={`${spanClasses} h-full text-left p-3 sm:p-3.5 border transition-all duration-150 cyber-chamfer-sm cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#00ff88] bg-[#00ff88]/10 shadow-[0_0_12px_rgba(0,255,136,0.25)] ring-1 ring-[#00ff88]/50'
                        : 'border-border bg-[#12121a]/80 hover:border-muted-foreground hover:bg-[#12121a]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="font-heading font-bold text-xs sm:text-sm tracking-wider text-[#00ff88] flex items-center gap-1.5">
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-[#00ff88] shrink-0" />}
                        <span>{preset.label}</span>
                      </div>
                      {preset.tag && (
                        <span className="px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider bg-background border border-border text-muted-foreground shrink-0">
                          {preset.tag}
                        </span>
                      )}
                    </div>
                    <div className="my-1 font-mono text-xs text-foreground font-semibold">
                      {preset.workMinutes}m work / {preset.breakMinutes}m rest
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground/80">
                      {preset.totalMinutes}m total session
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Settings Form */}
          <div className="shrink-0 border-t border-border pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                // Manual Parameter Tuning
              </h3>
              {settings.preset === 'custom' && (
                <NeonBadge variant="cyan" size="sm">
                  Custom Active
                </NeonBadge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <CyberInput
                label="Total Session"
                unit="mins"
                type="number"
                min="1"
                max="720"
                step="1"
                value={totalMinInput}
                onChange={(e) => handleCustomChange('total', e.target.value)}
                error={totalError}
              />
              <CyberInput
                label="Work Interval"
                unit="mins"
                type="number"
                min="1"
                max="180"
                step="1"
                value={workMinInput}
                onChange={(e) => handleCustomChange('work', e.target.value)}
                error={workError}
              />
              <CyberInput
                label="Rest Interval"
                unit="mins"
                type="number"
                min="1"
                max="60"
                step="1"
                value={breakMinInput}
                onChange={(e) => handleCustomChange('break', e.target.value)}
                error={breakError}
              />
            </div>
          </div>

          {/* Session Options — structured full-width bar so it never looks empty on large screens */}
          <div className="shrink-0 border-t border-border pt-3">
            <div className="bg-[#12121a]/70 border border-border p-3 cyber-chamfer-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-0.5">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
                  <span>// Session Options</span>
                  <span className="text-[10px] text-[#00ff88]/80 font-normal">
                    [{Math.max(1, Math.ceil(totalVal / Math.max(1, workVal + breakVal)))} rounds planned // {workVal}m work : {breakVal}m rest]
                  </span>
                </div>
                <p className="font-mono text-[11px] font-light text-muted-foreground">
                  Audio cues play distinct dual-tone beeps when focus and recharge intervals begin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateSettings({ ...settings, soundCues: !settings.soundCues })}
                className={`min-w-48 px-4 py-2 border font-mono text-xs font-semibold tracking-wider cursor-pointer cyber-chamfer-sm flex items-center justify-center gap-2 transition-colors ${
                  settings.soundCues
                    ? 'border-accent-tertiary/70 bg-accent-tertiary/10 text-accent-tertiary'
                    : 'border-border bg-background/60 text-muted-foreground hover:text-foreground'
                }`}
                aria-pressed={settings.soundCues}
              >
                {settings.soundCues ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span>START BEEPS: {settings.soundCues ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          {/* Bottom Action Row with Open Stats button + thin small description below */}
          <div className="shrink-0 grid gap-3 border-t border-border pt-3 sm:grid-cols-[1fr_15rem] sm:items-start">
            <CyberButton
              variant="glitch"
              fullWidth
              disabled={!isValid}
              onClick={handleStart}
              className="py-2.5 text-base font-bold shadow-[0_0_20px_rgba(0,255,136,0.4)]"
            >
              START FOCUS SESSION &gt;&gt;
            </CyberButton>
            <div>
              <button
                type="button"
                onClick={onOpenStats}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 border border-accent-tertiary/60 bg-accent-tertiary/10 text-accent-tertiary font-mono text-xs font-bold tracking-wider cursor-pointer cyber-chamfer-sm hover:bg-accent-tertiary/20"
              >
                <ChartNoAxesCombined className="h-4 w-4" /> OPEN STATS
              </button>
              <p className="mt-1 text-center font-mono text-[10px] font-light leading-snug text-muted-foreground/70">
                View your 7-day and one-month focus history.
              </p>
            </div>
          </div>
        </CyberCard>
      </div>
    </div>
  );
};
