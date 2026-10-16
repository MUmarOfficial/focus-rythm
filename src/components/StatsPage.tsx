import React, { useState } from 'react';
import { ArrowLeft, Clock3, Flame, Zap } from 'lucide-react';
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
}

export const StatsPage: React.FC<StatsPageProps> = ({
  todayMinutes, todayRounds, currentStreak, series7Days, series30Days, hasData, onBack
}) => {
  const [range, setRange] = useState<'7D' | '1M'>('7D');
  const series = range === '7D' ? series7Days : series30Days;

  return (
    <section className="w-full xl:w-[80vw] max-w-[1600px] mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6">
      <header className="flex items-center justify-between border-b border-border pb-5">
        <div>
          <div className="font-heading text-xl sm:text-2xl font-black tracking-widest text-[#00ff88]">FOCUS STATISTICS</div>
          <p className="font-mono text-xs text-muted-foreground mt-2">// LONG-RANGE CADENCE TELEMETRY</p>
        </div>
        <button type="button" onClick={onBack} className="flex items-center gap-2 border border-border px-3 py-2 font-mono text-xs text-muted-foreground hover:text-[#00ff88] hover:border-[#00ff88]/60 cursor-pointer cyber-chamfer-sm">
          <ArrowLeft className="h-4 w-4" /> BACK TO SETUP
        </button>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <Metric icon={<Clock3 className="h-4 w-4" />} value={`${todayMinutes}m`} label="TODAY FOCUSED" tone="text-[#00ff88]" />
        <Metric icon={<Zap className="h-4 w-4" />} value={String(todayRounds)} label="TODAY ROUNDS" tone="text-[#00d4ff]" />
        <Metric icon={<Flame className="h-4 w-4" />} value={`${currentStreak}d`} label="ACTIVE STREAK" tone="text-[#ff00ff]" />
      </div>

      <CyberCard variant="holographic" cornerAccent="accent">
        <div className="space-y-5 min-h-[min(72vh,760px)] flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">// FOCUS_MINUTES_BY_DAY</div>
            <div className="flex items-center gap-2">
              <div className="flex border border-border p-1 cyber-chamfer-sm" role="group" aria-label="Statistics range">
                {(['7D', '1M'] as const).map((option) => (
                  <button key={option} type="button" onClick={() => setRange(option)} className={`px-3 py-1.5 font-mono text-xs cursor-pointer ${range === option ? 'bg-[#00ff88] text-background font-bold' : 'text-muted-foreground hover:text-foreground'}`}>
                    {option === '7D' ? '7 DAYS' : '1 MONTH'}
                  </button>
                ))}
              </div>
              <NeonBadge variant={hasData ? 'accent' : 'muted'} size="sm">{hasData ? 'TELEMETRY LIVE' : 'AWAITING LOG'}</NeonBadge>
            </div>
          </div>
          <TrendChart series={series} hasData={hasData} rangeLabel={range === '7D' ? '7-day' : '1-month'} className="flex-1 min-h-[420px]" />
        </div>
      </CyberCard>
    </section>
  );
};

const Metric: React.FC<{ icon: React.ReactNode; value: string; label: string; tone: string }> = ({ icon, value, label, tone }) => (
  <CyberCard variant="default">
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <span className={tone}>{icon}</span>
      <div><div className={`font-heading text-xl font-bold ${tone}`}>{value}</div><div className="font-mono text-[10px] text-muted-foreground tracking-wide">{label}</div></div>
    </div>
  </CyberCard>
);
