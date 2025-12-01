/**
 * Time conversion utilities and constants
 */
export const Time = {
  seconds: {
    toMilliseconds: 1000,
  },
  minutes: {
    toMilliseconds: 60 * 1000,
    toSeconds: 60,
  },
  hours: {
    toMilliseconds: 60 * 60 * 1000,
    toMinutes: 60,
    toSeconds: 60 * 60,
  },
  days: {
    toMilliseconds: 24 * 60 * 60 * 1000,
    toHours: 24,
    toMinutes: 24 * 60,
    toSeconds: 24 * 60 * 60,
  },
  weeks: {
    toDays: 7,
    toHours: 7 * 24,
    toMilliseconds: 7 * 24 * 60 * 60 * 1000,
  },
} as const;

export type TimeUnit = keyof typeof Time;
