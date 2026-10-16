import { useState, useCallback, useMemo } from 'react';
import {
  DailyRecordsMap,
  getLocalDateKey,
  calculateStreaks,
  getLast7DaysSeries,
  getRecentDaysSeries,
  DaySeriesItem
} from '../lib/stats';
import { FxLevel, SessionSettings, PRESET_CONFIGS } from '../types';

const STATS_STORAGE_KEY = 'focus_rhythm_daily_stats_v1';
const SETTINGS_STORAGE_KEY = 'focus_rhythm_settings_v1';
const FX_STORAGE_KEY = 'focus_rhythm_fx_level_v1';

const DEFAULT_SETTINGS: SessionSettings = {
  preset: '2hours',
  totalMinutes: PRESET_CONFIGS['2hours'].totalMinutes,
  workMinutes: PRESET_CONFIGS['2hours'].workMinutes,
  breakMinutes: PRESET_CONFIGS['2hours'].breakMinutes,
  soundCues: true
};

export function useStats() {
  const [dailyRecords, setDailyRecords] = useState<DailyRecordsMap>(() => {
    try {
      const raw = localStorage.getItem(STATS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return parsed as DailyRecordsMap;
        }
      }
    } catch (err) {
      console.warn('Failed to parse stats from localStorage:', err);
    }
    return {};
  });

  const [settings, setSettingsState] = useState<SessionSettings>(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            preset: parsed.preset || '2hours',
            totalMinutes: Number(parsed.totalMinutes) || 120,
            workMinutes: Number(parsed.workMinutes) || 40,
            breakMinutes: Number(parsed.breakMinutes) || 10,
            soundCues: parsed.soundCues !== false
          };
        }
      }
    } catch (err) {
      console.warn('Failed to parse settings from localStorage:', err);
    }
    return DEFAULT_SETTINGS;
  });

  const [fxLevel, setFxLevelState] = useState<FxLevel>(() => {
    try {
      const raw = localStorage.getItem(FX_STORAGE_KEY);
      if (raw === 'FULL' || raw === 'LOW' || raw === 'OFF') {
        return raw;
      }
    } catch (err) {
      console.warn('Failed to parse fx level from localStorage:', err);
    }
    return 'LOW'; // default to LOW as requested in guardrails
  });

  // Save daily records to localStorage safely
  const persistRecords = useCallback((records: DailyRecordsMap) => {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(records));
    } catch (err) {
      console.warn('Failed to persist daily records:', err);
    }
  }, []);

  const setSettings = useCallback((newSettings: SessionSettings) => {
    setSettingsState(newSettings);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (err) {
      console.warn('Failed to persist settings:', err);
    }
  }, []);

  const setFxLevel = useCallback((level: FxLevel) => {
    setFxLevelState(level);
    try {
      localStorage.setItem(FX_STORAGE_KEY, level);
    } catch (err) {
      console.warn('Failed to persist fx level:', err);
    }
  }, []);

  // Record focused time and rounds for a session
  const recordSession = useCallback(
    (accruedFocusedSeconds: number, completedRounds: number) => {
      if (accruedFocusedSeconds <= 0 && completedRounds <= 0) return;

      setDailyRecords((prev) => {
        const todayKey = getLocalDateKey();
        const existing = prev[todayKey] || { focusedSeconds: 0, rounds: 0 };
        const updated = {
          ...prev,
          [todayKey]: {
            focusedSeconds: existing.focusedSeconds + Math.max(0, Math.round(accruedFocusedSeconds)),
            rounds: existing.rounds + Math.max(0, completedRounds)
          }
        };
        persistRecords(updated);
        return updated;
      });
    },
    [persistRecords]
  );

  // Derived statistics (self-correcting from daily map)
  const todayKey = getLocalDateKey();
  const todayRecord = dailyRecords[todayKey] || { focusedSeconds: 0, rounds: 0 };
  const todayFocusedMinutes = Math.round(todayRecord.focusedSeconds / 60);
  const todayRounds = todayRecord.rounds;

  const streaks = useMemo(() => {
    return calculateStreaks(dailyRecords);
  }, [dailyRecords]);

  const series7Days = useMemo<DaySeriesItem[]>(() => {
    return getLast7DaysSeries(dailyRecords);
  }, [dailyRecords]);

  const series30Days = useMemo<DaySeriesItem[]>(() => {
    return getRecentDaysSeries(dailyRecords, 30);
  }, [dailyRecords]);

  const hasAnyData = useMemo(() => {
    return Object.values(dailyRecords).some((record) => record.focusedSeconds > 0 || record.rounds > 0);
  }, [dailyRecords]);

  return {
    dailyRecords,
    settings,
    setSettings,
    fxLevel,
    setFxLevel,
    recordSession,
    todayFocusedMinutes,
    todayRounds,
    currentStreak: streaks.currentStreak,
    longestStreak: streaks.longestStreak,
    series7Days,
    series30Days,
    hasAnyData
  };
}
