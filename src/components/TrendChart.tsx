import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { DaySeriesItem } from '../lib/stats';

export interface TrendChartProps {
  series: DaySeriesItem[];
  hasData: boolean;
  rangeLabel?: string;
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: DaySeriesItem }>;
}

const CyberTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const item = payload[0].payload;
    return (
      <div className="bg-background border border-[#00ff88]/60 p-2.5 cyber-chamfer-sm shadow-[0_0_12px_rgba(0,255,136,0.3)] font-mono text-xs z-50">
        <div className="flex items-center justify-between space-x-3 text-muted-foreground border-b border-border pb-1 mb-1.5">
          <span className="font-bold text-[#00ff88]">{item.dayLabel}</span>
          <span>{item.dateKey}</span>
        </div>
        <div className="space-x-1 text-foreground">
          <span className="text-[#00ff88] font-bold">{item.minutes}</span>
          <span>min focused</span>
        </div>
        <div className="text-[11px] text-muted-foreground">
          {item.rounds} {item.rounds === 1 ? 'round' : 'rounds'} completed
        </div>
      </div>
    );
  }
  return null;
};

export const TrendChart: React.FC<TrendChartProps> = ({ series, hasData, rangeLabel = '7-day', className = '' }) => {
  if (!hasData) {
    return (
      <div
        className={`w-full h-44 flex flex-col items-center justify-center border border-dashed border-border bg-[#12121a]/40 cyber-chamfer p-4 ${className}`}
      >
        <div className="font-mono text-xs text-muted-foreground text-center space-y-1">
          <p className="text-[#00ff88]/70">&gt; no data yet. start your first session</p>
          <p className="text-[11px] text-muted-foreground/60">Your {rangeLabel} focus cadence will be plotted here</p>
        </div>
      </div>
    );
  }

  // Find max minutes for responsive Y scale
  const maxMin = Math.max(...series.map((s) => s.minutes), 60);
  const yDomain = [0, Math.ceil(maxMin / 30) * 30];

  return (
    <div className={`w-full h-48 select-none ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <filter id="neonLineGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#00ff88" floodOpacity="0.8" />
            </filter>
          </defs>

          <CartesianGrid stroke="#2a2a3a" strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="dayLabel"
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }}
            axisLine={{ stroke: '#2a2a3a' }}
            tickLine={{ stroke: '#2a2a3a' }}
            interval={series.length > 14 ? 4 : 0}
          />

          <YAxis
            domain={yDomain}
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }}
            axisLine={{ stroke: '#2a2a3a' }}
            tickLine={{ stroke: '#2a2a3a' }}
            unit="m"
          />

          <Tooltip content={<CyberTooltip />} />

          <Line
            type="monotone"
            dataKey="minutes"
            stroke="#00ff88"
            strokeWidth={2.5}
            filter="url(#neonLineGlow)"
            dot={(props) => {
              const { cx, cy, payload } = props;
              const isToday = payload.isToday;
              if (isToday) {
                return (
                  <circle
                    key={`dot-${payload.dateKey}`}
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill="#00ff88"
                    stroke="#0a0a0f"
                    strokeWidth={2}
                    className="animate-pulse"
                    style={{ filter: 'drop-shadow(0 0 6px #00ff88)' }}
                  />
                );
              }
              return (
                <circle
                  key={`dot-${payload.dateKey}`}
                  cx={cx}
                  cy={cy}
                  r={3.5}
                  fill="#12121a"
                  stroke="#00ff88"
                  strokeWidth={1.5}
                />
              );
            }}
            activeDot={{
              r: 6,
              fill: '#00ff88',
              stroke: '#0a0a0f',
              strokeWidth: 2,
              style: { filter: 'drop-shadow(0 0 8px #00ff88)' }
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
