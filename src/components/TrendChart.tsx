import React, { useEffect, useRef, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
    const exactSec = item.focusedSeconds ?? item.minutes * 60;
    const subMinNote = exactSec > 0 && exactSec < 60 ? ` (${exactSec}s)` : '';
    return (
      <div className="bg-background border border-[#00ff88]/60 p-2.5 cyber-chamfer-sm shadow-[0_0_12px_rgba(0,255,136,0.3)] font-mono text-xs z-50">
        <div className="flex items-center justify-between space-x-3 text-muted-foreground border-b border-border pb-1 mb-1.5">
          <span className="font-bold text-[#00ff88]">{item.dayLabel}</span>
          <span>{item.dateKey}</span>
        </div>
        <div className="space-x-1 text-foreground">
          <span className="text-[#00ff88] font-bold">{item.minutes}</span>
          <span>min focused{subMinNote}</span>
        </div>
        <div className="text-[11px] text-muted-foreground">
          {item.rounds} {item.rounds === 1 ? 'round' : 'rounds'} completed
        </div>
      </div>
    );
  }
  return null;
};

export const TrendChart: React.FC<TrendChartProps> = ({
  series,
  hasData,
  rangeLabel = '7-day',
  className = ''
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [chartHeight, setChartHeight] = useState<number>(260);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const updateHeight = () => {
      const rect = el.getBoundingClientRect();
      if (rect.height > 80) {
        setChartHeight(Math.floor(rect.height));
      }
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);
    window.addEventListener('resize', updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  // Find max minutes for responsive Y scale
  const maxMin = Math.max(...series.map((s) => s.minutes), 60);
  const yDomain = [0, Math.ceil(maxMin / 30) * 30];

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full flex-1 min-h-[180px] select-none overflow-hidden ${className}`}
    >
      {!hasData && (
        <div className="pointer-events-none absolute top-2 right-3 z-20 border border-[#00ff88]/30 bg-[#0a0a0f]/85 px-2.5 py-1 font-mono text-[10px] text-[#00ff88]/80 cyber-chamfer-sm">
          &gt; baseline ready — start a focus session to log {rangeLabel} telemetry
        </div>
      )}

      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <AreaChart data={series} margin={{ top: 12, right: 14, left: -16, bottom: 4 }}>
            <defs>
              <linearGradient id="neonAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff88" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#00ff88" stopOpacity={0.0} />
              </linearGradient>
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

            <Area
              type="monotone"
              dataKey="minutes"
              stroke="#00ff88"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#neonAreaFill)"
              filter="url(#neonLineGlow)"
              isAnimationActive={false}
              dot={(props) => {
                const { cx, cy, payload } = props;
                if (typeof cx !== 'number' || typeof cy !== 'number') return <g key={`empty-${payload?.dateKey}`} />;
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
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
