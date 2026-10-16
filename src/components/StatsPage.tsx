import React, { useState } from 'react';
import { ArrowLeft, Clock3, Flame, Zap, Trash2 } from 'lucide-react';
import { DaySeriesItem } from '../lib/stats';
import { CyberCard } from './ui/CyberCard';
import { NeonBadge } from './ui/NeonBadge';
import { TrendChart } from './TrendChart';

interface StatsPageProps {
  todayMinutes: number;
  todayRounds: number;
  currentStreak: number;
  series7Days: DaySeriesItem[];
  series30Days: DaySeriesItem[];
  hasData: boolean;
  onBack: () => void;
  onClearStats?: () => void;
}

export const StatsPage: React.FC<StatsPageProps> = ({
  todayMinutes,
  todayRounds,
  currentStreak,
  series7Days,
  series30Days,
  hasData,
  onBack,
  onClearStats
}) => {
  const [range, setRange] = useState<'7D' | '1M'>('7D');
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const series = range === '7D' ? series7Days : series30Days;

  // Calculate summary metrics for the selected range
  const totalRangeMinutes = series.reduce((acc, item) => acc + item.minutes, 0);
  const totalRangeRounds = series.reduce((acc, item) => acc + item.rounds, 0);
  const activeDays = series.filter((item) => item.minutes > 0).length;
  const avgMinutesPerActiveDay = activeDays > 0 ? Math.round(totalRangeMinutes / activeDays) : 0;

  return (
    <section className="w-full lg:w-[80%] max-w-[1600px] mx-auto px-4 py-3 sm:px-6 sm:py-4 h-full flex-1 flex flex-col justify-between min-h-0 gap-3 overflow-hidden select-none">
      {/* Compact Top Header */}
      <header className="flex flex-wrap items-center justify-between border-b border-border/80 pb-2.5 shrink-0 gap-2">
        <div>
          <div className="font-heading text-lg sm:text-xl font-black tracking-widest text-[#00ff88]">
            FOCUS STATISTICS
          </div>
          <p className="font-mono text-[11px] text-muted-foreground">
            // TELEMETRY_CADENCE // LIVE DESKTOP TELEMETRY
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onClearStats && hasData && !confirmReset && (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-1.5 border border-destructive/40 bg-destructive/10 px-2.5 py-1.5 font-mono text-[11px] text-destructive hover:bg-destructive/20 cursor-pointer cyber-chamfer-sm transition-colors"
              title="Reset all recorded focus history"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">RESET</span>
            </button>
          )}

          {onClearStats && hasData && confirmReset && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onClearStats();
                  setConfirmReset(false);
                }}
                className="border border-destructive bg-destructive text-background px-2.5 py-1.5 font-mono text-[11px] font-bold cursor-pointer cyber-chamfer-sm"
              >
                CONFIRM RESET
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="border border-border px-2 py-1.5 font-mono text-[11px] text-muted-foreground hover:text-foreground cursor-pointer cyber-chamfer-sm"
              >
                CANCEL
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-[#00ff88] hover:border-[#00ff88]/60 cursor-pointer cyber-chamfer-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> BACK TO SETUP
          </button>
        </div>
      </header>

      {/* 3 Metric Readout Cards */}
      <div className="grid grid-cols-3 gap-2.5 shrink-0">
        <Metric
          icon={<Clock3 className="h-4 w-4" />}
          value={`${todayMinutes}m`}
          label="TODAY FOCUSED"
          tone="text-[#00ff88]"
        />
        <Metric
          icon={<Zap className="h-4 w-4" />}
          value={String(todayRounds)}
          label="TODAY ROUNDS"
          tone="text-[#00d4ff]"
        />
        <Metric
          icon={<Flame className="h-4 w-4" />}
          value={`${currentStreak}d`}
          label="ACTIVE STREAK"
          tone="text-[#ff00ff]"
        />
      </div>

      {/* Responsive Holographic Chart Card - fills remaining screen height without scrolling */}
      <CyberCard
        variant="holographic"
        cornerAccent="accent"
        className="flex-1 min-h-0 flex flex-col p-3 sm:p-4 justify-between overflow-hidden"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#00ff88] font-bold">
              // FOCUS_CADENCE_GRAPH
            </span>
            <span className="hidden md:inline font-mono text-[11px] text-muted-foreground">
              TOTAL: <span className="text-foreground font-bold">{totalRangeMinutes}m</span> ({totalRangeRounds} rounds)
              {activeDays > 0 && (
                <span>
                  {' '}
                  // AVG: <span className="text-foreground font-bold">{avgMinutesPerActiveDay}m</span>/active day
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex border border-border p-0.5 cyber-chamfer-sm" role="group" aria-label="Statistics range">
              {(['7D', '1M'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRange(option)}
                  className={`px-2.5 py-1 font-mono text-[11px] cursor-pointer transition-colors ${
                    range === option
                      ? 'bg-[#00ff88] text-background font-bold shadow-[0_0_8px_rgba(0,255,136,0.4)]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {option === '7D' ? '7 DAYS' : '1 MONTH'}
                </button>
              ))}
            </div>
            <NeonBadge variant={hasData ? 'accent' : 'muted'} size="sm">
              {hasData ? 'TELEMETRY LIVE' : 'BASELINE READY'}
            </NeonBadge>
          </div>
        </div>

        {/* Our Recharts AreaChart takes the full available flex height */}
        <TrendChart
          series={series}
          hasData={hasData}
          rangeLabel={range === '7D' ? '7-day' : '1-month'}
          className="flex-1 min-h-0 pt-1"
        />
      </CyberCard>
    </section>
  );
};

const Metric: React.FC<{ icon: React.ReactNode; value: string; label: string; tone: string }> = ({
  icon,
  value,
  label,
  tone
}) => (
  <CyberCard variant="default" className="p-2 sm:p-2.5">
    <div className="flex items-center gap-2.5">
      <span className={`${tone} shrink-0 p-1.5 bg-[#12121a] border border-border cyber-chamfer-sm`}>
        {icon}
      </span>
      <div className="min-w-0">
        <div className={`font-heading text-lg sm:text-xl font-bold ${tone} tabular-digits leading-tight`}>
          {value}
        </div>
        <div className="font-mono text-[10px] text-muted-foreground tracking-wide truncate">
          {label}
        </div>
      </div>
    </div>
  </CyberCard>
);
