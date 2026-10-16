export type TimerPhase = 'idle' | 'work' | 'break' | 'complete';

export type FxLevel = 'FULL' | 'LOW' | 'OFF';

export type PresetKey = '2hours' | '4hours' | 'deepwork' | 'custom';

export interface SessionSettings {
  preset: PresetKey;
  totalMinutes: number;
  workMinutes: number;
  breakMinutes: number;
  soundCues: boolean;
}

export interface PresetConfig {
  key: PresetKey;
  label: string;
  totalMinutes: number;
  workMinutes: number;
  breakMinutes: number;
  description: string;
}

export const PRESET_CONFIGS: Record<Exclude<PresetKey, 'custom'>, PresetConfig> = {
  '2hours': {
    key: '2hours',
    label: '2 HOURS',
    totalMinutes: 120,
    workMinutes: 40,
    breakMinutes: 10,
    description: '120m total / 40m work / 10m rest'
  },
  '4hours': {
    key: '4hours',
    label: '4 HOURS',
    totalMinutes: 240,
    workMinutes: 40,
    breakMinutes: 10,
    description: '240m total / 40m work / 10m rest'
  },
  'deepwork': {
    key: 'deepwork',
    label: 'DEEP WORK',
    totalMinutes: 120,
    workMinutes: 30,
    breakMinutes: 5,
    description: '120m total / 30m work / 5m rest'
  }
};
