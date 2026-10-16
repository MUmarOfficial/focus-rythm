export interface DayRecord {
  focusedSeconds: number;
  rounds: number;
}

export type DailyRecordsMap = Record<string, DayRecord>;

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

export interface DaySeriesItem {
  dateKey: string;
  dayLabel: string;
  shortDate: string;
  minutes: number;
  focusedSeconds: number;
  rounds: number;
  isToday: boolean;
}

export type SegmentType = 'work' | 'break';

export interface SessionSegment {
  id: string;
  type: SegmentType;
  durationMs: number;
}

/**
 * Converts accrued focused seconds into whole display minutes.
 * Any positive focus time (< 60s) rounds up to at least 1 minute so short
 * or partial sessions immediately appear in telemetry and charts.
 */
export function focusedSecondsToMinutes(focusedSeconds: number): number {
  const safeSeconds = Math.max(0, Math.round(Number(focusedSeconds) || 0));
  if (safeSeconds === 0) return 0;
  return Math.max(1, Math.round(safeSeconds / 60));
}

/**
 * Returns YYYY-MM-DD formatted date in LOCAL timezone (never UTC)
 */
export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Helper to step a date by offset days
 */
export function offsetDate(baseDate: Date, dayOffset: number): Date {
  const d = new Date(baseDate.getTime());
  d.setDate(d.getDate() + dayOffset);
  return d;
}

/**
 * Calculates current streak and longest streak from the daily records map.
 * Rules:
 * - Consecutive local days with focusedSeconds > 0.
 * - If today has focusedSeconds > 0, streak ends today.
 * - If today has no focus yet, but yesterday does, streak is still alive!
 * - If neither today nor yesterday has focus, current streak is 0.
 */
export function calculateStreaks(
  dailyRecords: DailyRecordsMap,
  today: Date = new Date()
): { currentStreak: number; longestStreak: number; lastActiveDate: string | null } {
  const todayKey = getLocalDateKey(today);
  const yesterday = offsetDate(today, -1);
  const yesterdayKey = getLocalDateKey(yesterday);

  const isDayActive = (key: string) => {
    const rec = dailyRecords[key];
    return Boolean(rec && ((rec.focusedSeconds ?? 0) > 0 || (rec.rounds ?? 0) > 0));
  };

  const todayHasFocus = isDayActive(todayKey);
  const yesterdayHasFocus = isDayActive(yesterdayKey);

  let currentStreak = 0;
  let lastActiveDate: string | null = null;

  if (todayHasFocus) {
    lastActiveDate = todayKey;
    currentStreak = 1;
    let checkDate = offsetDate(today, -1);
    while (isDayActive(getLocalDateKey(checkDate))) {
      currentStreak++;
      checkDate = offsetDate(checkDate, -1);
    }
  } else if (yesterdayHasFocus) {
    lastActiveDate = yesterdayKey;
    currentStreak = 1;
    let checkDate = offsetDate(yesterday, -1);
    while (isDayActive(getLocalDateKey(checkDate))) {
      currentStreak++;
      checkDate = offsetDate(checkDate, -1);
    }
  }

  // Calculate longest streak across all recorded days in history
  const allActiveDateKeys = Object.keys(dailyRecords)
    .filter((key) => isDayActive(key))
    .sort();

  if (allActiveDateKeys.length > 0 && !lastActiveDate) {
    lastActiveDate = allActiveDateKeys[allActiveDateKeys.length - 1];
  }

  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dateKey of allActiveDateKeys) {
    const parts = dateKey.split('-').map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);

    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffMs = date.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    prevDate = date;
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return {
    currentStreak,
    longestStreak,
    lastActiveDate
  };
}

/**
 * Generates last 7 days series ending today, zero-filled for missing days.
 */
export function getLast7DaysSeries(
  dailyRecords: DailyRecordsMap,
  today: Date = new Date()
): DaySeriesItem[] {
  return getRecentDaysSeries(dailyRecords, 7, today);
}

/**
 * Generates a zero-filled daily series for the requested window, ending today.
 */
export function getRecentDaysSeries(
  dailyRecords: DailyRecordsMap,
  days: number,
  today: Date = new Date()
): DaySeriesItem[] {
  const safeDays = Math.max(1, Math.floor(days));
  const series: DaySeriesItem[] = [];
  const todayKey = getLocalDateKey(today);
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  for (let i = safeDays - 1; i >= 0; i--) {
    const targetDate = offsetDate(today, -i);
    const dateKey = getLocalDateKey(targetDate);
    const record = dailyRecords[dateKey];
    const focusedSec = Math.max(0, Math.round(record?.focusedSeconds ?? 0));
    const rounds = Math.max(0, Math.round(record?.rounds ?? 0));
    const minutes = focusedSecondsToMinutes(focusedSec);

    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');

    series.push({
      dateKey,
      dayLabel:
        safeDays > 14
          ? `${targetDate.getMonth() + 1}/${targetDate.getDate()}`
          : dayNames[targetDate.getDay()],
      shortDate: `${month}/${day}`,
      minutes,
      focusedSeconds: focusedSec,
      rounds,
      isToday: dateKey === todayKey
    });
  }

  return series;
}

/**
 * Precomputes the segment plan from total, work, and break minutes.
 * Rules:
 * - work, break, work, break...
 * - Truncate the last work segment if remaining total is less than a full interval.
 * - If total is shorter than one work interval, plan is a single shortened work segment.
 * - Never schedule a trailing break after the final work segment.
 */
export function computeSegmentPlan(
  totalMinutes: number,
  workMinutes: number,
  breakMinutes: number
): SessionSegment[] {
  const safeTotal = Math.max(1, Math.floor(totalMinutes));
  const safeWork = Math.max(1, Math.floor(workMinutes));
  const safeBreak = Math.max(1, Math.floor(breakMinutes));

  const segments: SessionSegment[] = [];

  // If total is shorter than or equal to one work interval
  if (safeTotal <= safeWork) {
    segments.push({
      id: 'seg-1',
      type: 'work',
      durationMs: safeTotal * 60 * 1000
    });
    return segments;
  }

  let remainingMin = safeTotal;
  let counter = 1;

  while (remainingMin > 0) {
    // Work segment
    if (remainingMin <= safeWork) {
      segments.push({
        id: `seg-${counter++}`,
        type: 'work',
        durationMs: remainingMin * 60 * 1000
      });
      break;
    }

    segments.push({
      id: `seg-${counter++}`,
      type: 'work',
      durationMs: safeWork * 60 * 1000
    });
    remainingMin -= safeWork;

    // Only add a break if there will be at least 1 minute of work remaining afterwards
    // (Never schedule a trailing break or a break with no subsequent work)
    if (remainingMin > safeBreak) {
      segments.push({
        id: `seg-${counter++}`,
        type: 'break',
        durationMs: safeBreak * 60 * 1000
      });
      remainingMin -= safeBreak;
    } else {
      // Remaining minutes are not enough for break + next work,
      // so remainder is absorbed into final work segment
      segments.push({
        id: `seg-${counter++}`,
        type: 'work',
        durationMs: remainingMin * 60 * 1000
      });
      break;
    }
  }

  return segments;
}

/**
 * Extends a break segment by 5 minutes (in milliseconds)
 */
export function addFiveMinutesToBreak(endsAtMs: number, additionalMinutes: number = 5): number {
  return endsAtMs + additionalMinutes * 60 * 1000;
}
