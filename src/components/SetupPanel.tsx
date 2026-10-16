import React, { useState, useEffect } from 'react';
import {
  Sliders,
  CheckCircle2,
  Terminal,
  Activity,
  ChartNoAxesCombined
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

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6">
      {/* Top Header */}
      <header className="border-b border-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <span className="p-1.5 border border-[#00ff88]/50 bg-[#00ff88]/10 text-[#00ff88] cyber-chamfer-sm">
              <Terminal className="h-5 w-5" />
            </span>
            <GlitchText
              text="FOCUS RHYTHM"
              as="h1"
              animate
              fxLevel={fxLevel}
              className="text-2xl sm:text-3xl font-heading font-black tracking-widest text-[#00ff88] glow-accent"
            />
            <NeonBadge variant="accent" size="sm">
              v1.0.0_STABLE
            </NeonBadge>
          </div>
          <TerminalLine
            prompt=">"
            text="initialize deep_work.session_"
            typing
            typingSpeed={30}
            showCursor
            fxLevel={fxLevel}
            className="mt-2 text-muted-foreground"
          />
        </div>

        {/* FX Guardrail Switch */}
        <div className="flex items-center space-x-2 bg-[#12121a] p-1.5 border border-border cyber-chamfer-sm text-xs font-mono">
          <span className="text-muted-foreground px-2 uppercase tracking-wider flex items-center space-x-1">
            <Sliders className="h-3.5 w-3.5 inline mr-1" />
            FX:
          </span>
          {(['FULL', 'LOW', 'OFF'] as FxLevel[]).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => onChangeFxLevel(level)}
              className={`px-2.5 py-1 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
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

      {/* Landscape cadence strip stays above the working area. */}
      <CyberCard variant="holographic" cornerAccent="accent">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 min-w-52">
            <span className="flex h-10 w-10 items-center justify-center border border-[#00ff88]/40 bg-[#00ff88]/10 text-[#00ff88] cyber-chamfer-sm">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#00ff88] font-bold">BIOMETRIC_CADENCE</div>
              <div className="font-mono text-[11px] text-muted-foreground mt-1">TODAY_SUMMARY // LIVE LOCAL TELEMETRY</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 w-full md:w-md text-center">
            <div className="bg-background/60 p-2.5 border border-border cyber-chamfer-sm">
              <div className="font-heading text-xl font-bold text-foreground tabular-digits">{todayMinutes}m</div>
              <div className="font-mono text-[10px] uppercase text-muted-foreground tracking-wider mt-0.5">Focused</div>
            </div>
            <div className="bg-background/60 p-2.5 border border-border cyber-chamfer-sm">
              <div className="font-heading text-xl font-bold text-accent-tertiary tabular-digits">{todayRounds}</div>
              <div className="font-mono text-[10px] uppercase text-muted-foreground tracking-wider mt-0.5">Rounds</div>
            </div>
            <div className="bg-background/60 p-2.5 border border-border cyber-chamfer-sm">
              <div className="font-heading text-xl font-bold text-accent-secondary tabular-digits">{currentStreak}d</div>
              <div className="font-mono text-[10px] uppercase text-muted-foreground tracking-wider mt-0.5">Streak</div>
            </div>
          </div>
          {longestStreak > 0 && <div className="font-mono text-[11px] text-[#ffbd2e] whitespace-nowrap">RECORD: {longestStreak} DAYS</div>}
        </div>
      </CyberCard>

      {/* The setup console intentionally owns the open workspace. */}
      <div>
        <CyberCard variant="terminal" title="protocol_config.sh">
          <div className="min-h-[540px] sm:min-h-[590px] flex flex-col gap-5">
              <div>
                <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center justify-between">
                  <span>// Select Protocol Preset</span>
                  <span className="text-[#00ff88]/60">[3 standard | 1 custom]</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(Object.keys(PRESET_CONFIGS) as Array<Exclude<PresetKey, 'custom'>>).map((key) => {
                    const preset = PRESET_CONFIGS[key];
                    const isSelected = settings.preset === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectPreset(key)}
                        className={`text-left p-3.5 border transition-all duration-150 cyber-chamfer-sm cursor-pointer relative ${
                          isSelected
                            ? 'border-[#00ff88] bg-[#00ff88]/10 shadow-[0_0_12px_rgba(0,255,136,0.25)]'
                            : 'border-border bg-[#12121a]/80 hover:border-muted-foreground hover:bg-[#12121a]'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-2 right-2 text-[#00ff88]">
                            <CheckCircle2 className="h-4 w-4" />
                          </span>
                        )}
                        <div className="font-heading font-bold text-sm tracking-widest text-[#00ff88]">
                          {preset.label}
                        </div>
                        <div className="font-mono text-[11px] text-muted-foreground mt-1">
                          {preset.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Settings Form */}
              <div className="border-t border-border pt-4 space-y-4">
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

              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">// Session options</div>
                    <p className="mt-1 font-mono text-[10px] font-light text-muted-foreground/70">Choose the alerts used when focus and rest intervals begin.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ ...settings, soundCues: !settings.soundCues })}
                    className={`min-w-44 px-3 py-2 border font-mono text-xs tracking-wider cursor-pointer cyber-chamfer-sm ${settings.soundCues ? 'border-[#00d4ff]/70 bg-[#00d4ff]/10 text-[#00d4ff]' : 'border-border text-muted-foreground'}`}
                    aria-pressed={settings.soundCues}
                  >
                    START BEEPS: {settings.soundCues ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

              <div className="mt-auto grid gap-3 border-t border-border pt-4 sm:grid-cols-[1fr_15rem] sm:items-start">
                <CyberButton
                  variant="glitch"
                  fullWidth
                  disabled={!isValid}
                  onClick={handleStart}
                  className="py-3 text-base font-bold shadow-[0_0_20px_rgba(0,255,136,0.4)]"
                >
                  START FOCUS SESSION &gt;&gt;
                </CyberButton>
                <div>
                  <button type="button" onClick={onOpenStats} className="w-full flex items-center justify-center gap-2 py-3 border border-[#00d4ff]/60 bg-[#00d4ff]/10 text-[#00d4ff] font-mono text-xs font-bold tracking-wider cursor-pointer cyber-chamfer-sm hover:bg-[#00d4ff]/20">
              <ChartNoAxesCombined className="h-4 w-4" /> OPEN STATS
                  </button>
                  <p className="mt-2 text-center font-mono text-[10px] font-light leading-relaxed text-muted-foreground/70">View your 7-day and one-month focus history.</p>
                </div>
              </div>
          </div>
        </CyberCard>
      </div>
    </div>
  );
};
