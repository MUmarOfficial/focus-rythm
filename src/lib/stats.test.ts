import { describe, it, expect } from 'vitest';
import {
  getLocalDateKey,
  offsetDate,
  calculateStreaks,
  getLast7DaysSeries,
  getRecentDaysSeries,
  focusedSecondsToMinutes,
  computeSegmentPlan,
  addFiveMinutesToBreak
} from './stats';

describe('stats logic & pure functions', () => {
  it('correctly formats local date key YYYY-MM-DD', () => {
    const testDate = new Date(2026, 9, 16); // Oct 16, 2026
    expect(getLocalDateKey(testDate)).toBe('2026-10-16');
  });

  it('converts sub-minute positive focus seconds to at least 1 minute', () => {
    expect(focusedSecondsToMinutes(0)).toBe(0);
    expect(focusedSecondsToMinutes(12)).toBe(1);
    expect(focusedSecondsToMinutes(59)).toBe(1);
    expect(focusedSecondsToMinutes(120)).toBe(2);
    expect(focusedSecondsToMinutes(3000)).toBe(50);
  });

  it('keeps streak alive when only yesterday has data (today has no focus yet)', () => {
    const today = new Date(2026, 9, 16);
    const yesterday = offsetDate(today, -1);
    const twoDaysAgo = offsetDate(today, -2);

    const dailyRecords = {
      [getLocalDateKey(twoDaysAgo)]: { focusedSeconds: 1800, rounds: 1 },
      [getLocalDateKey(yesterday)]: { focusedSeconds: 2400, rounds: 1 }
      // Today has 0
    };

    const result = calculateStreaks(dailyRecords, today);
    expect(result.currentStreak).toBe(2);
    expect(result.lastActiveDate).toBe(getLocalDateKey(yesterday));
  });

  it('resets streak to 0 across a gap where yesterday and today have no data', () => {
    const today = new Date(2026, 9, 16);
    const threeDaysAgo = offsetDate(today, -3);

    const dailyRecords = {
      [getLocalDateKey(threeDaysAgo)]: { focusedSeconds: 3600, rounds: 2 }
    };

    const result = calculateStreaks(dailyRecords, today);
    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(1);
  });

  it('accurately increments streak when today also has focus', () => {
    const today = new Date(2026, 9, 16);
    const yesterday = offsetDate(today, -1);

    const dailyRecords = {
      [getLocalDateKey(yesterday)]: { focusedSeconds: 2400, rounds: 1 },
      [getLocalDateKey(today)]: { focusedSeconds: 1200, rounds: 1 }
    };

    const result = calculateStreaks(dailyRecords, today);
    expect(result.currentStreak).toBe(2);
    expect(result.lastActiveDate).toBe(getLocalDateKey(today));
  });

  it('generates 7-day and 30-day series with zero-fill for days without activity', () => {
    const today = new Date(2026, 9, 16);
    const twoDaysAgo = offsetDate(today, -2);

    const dailyRecords = {
      [getLocalDateKey(twoDaysAgo)]: { focusedSeconds: 3000, rounds: 2 }, // 50 mins
      [getLocalDateKey(today)]: { focusedSeconds: 20, rounds: 1 } // short 20s session -> 1m
    };

    const series = getLast7DaysSeries(dailyRecords, today);
    expect(series).toHaveLength(7);
    expect(series[6].isToday).toBe(true);
    expect(series[6].minutes).toBe(1);
    expect(series[4].minutes).toBe(50); // 2 days ago is 50
    expect(series[0].minutes).toBe(0); // 6 days ago is 0

    const monthSeries = getRecentDaysSeries(dailyRecords, 30, today);
    expect(monthSeries).toHaveLength(30);
    expect(monthSeries[29].isToday).toBe(true);
    expect(monthSeries[29].minutes).toBe(1);
  });

  it('computes segment plan when session is shorter than one work interval', () => {
    // 25 mins total, 40 min work, 10 min break
    const plan = computeSegmentPlan(25, 40, 10);
    expect(plan).toHaveLength(1);
    expect(plan[0].type).toBe('work');
    expect(plan[0].durationMs).toBe(25 * 60 * 1000);
  });

  it('computes segment plan correctly without trailing break for standard session', () => {
    // 120 total, 40 work, 10 break
    const plan = computeSegmentPlan(120, 40, 10);
    // Work (40) -> Break (10) -> Work (40) -> Break (10) -> Work (20)
    expect(plan).toHaveLength(5);
    expect(plan.map((s) => s.type)).toEqual(['work', 'break', 'work', 'break', 'work']);
    const totalMs = plan.reduce((acc, s) => acc + s.durationMs, 0);
    expect(totalMs).toBe(120 * 60 * 1000);
    expect(plan[plan.length - 1].type).toBe('work');
  });

  it('handles add-5-minutes extension to break', () => {
    const baseEndsAt = 1000000;
    const newEndsAt = addFiveMinutesToBreak(baseEndsAt, 5);
    expect(newEndsAt).toBe(baseEndsAt + 5 * 60 * 1000);
  });
});
