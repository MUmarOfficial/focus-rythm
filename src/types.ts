export type TimerPhase = 'idle' | 'work' | 'break' | 'complete';

export type FxLevel = 'FULL' | 'LOW' | 'OFF';

export type PresetKey =
  | 'pomodoro'
  | 'powerhour'
  | 'deepwork'
  | 'ultradian'
  | 'quicksprint'
  | '2hours'
  | '4hours'
  | 'custom';

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
  tag?: string;
}

export const PRESET_CONFIGS: Record<Exclude<PresetKey, 'custom'>, PresetConfig> = {
  'pomodoro': {
    key: 'pomodoro',
    label: 'CLASSIC 25/5',
    totalMinutes: 100,
    workMinutes: 25,
    breakMinutes: 5,
    description: '100m total / 4 sets of 25m focus & 5m recharge',
    tag: 'POPULAR'
  },
  'powerhour': {
    key: 'powerhour',
    label: 'POWER HOUR',
    totalMinutes: 60,
    workMinutes: 50,
    breakMinutes: 10,
    description: '60m total / 50m intense sprint & 10m cooldown',
    tag: 'SPRINT'
  },
  'deepwork': {
    key: 'deepwork',
    label: 'DEEP WORK',
    totalMinutes: 120,
    workMinutes: 30,
    breakMinutes: 5,
    description: '120m total / 30m flow blocks & 5m rest',
    tag: 'FLOW'
  },
  'ultradian': {
    key: 'ultradian',
    label: 'ULTRADIAN 90/20',
    totalMinutes: 180,
    workMinutes: 90,
    breakMinutes: 20,
    description: '180m total / 90m circadian peak & 20m restorative rest',
    tag: 'BIO-RHYTHM'
  },
  'quicksprint': {
    key: 'quicksprint',
    label: 'QUICK BURST',
    totalMinutes: 45,
    workMinutes: 15,
    breakMinutes: 3,
    description: '45m total / 15m rapid momentum & 3m pause',
    tag: 'BURST'
  },
  '2hours': {
    key: '2hours',
    label: '2 HOURS STANDARD',
    totalMinutes: 120,
    workMinutes: 40,
    breakMinutes: 10,
    description: '120m total / 40m work / 10m rest',
    tag: 'BALANCED'
  },
  '4hours': {
    key: '4hours',
    label: '4 HOURS MARATHON',
    totalMinutes: 240,
    workMinutes: 40,
    breakMinutes: 10,
    description: '240m total / 40m work / 10m rest',
    tag: 'EXTENDED'
  }
};
