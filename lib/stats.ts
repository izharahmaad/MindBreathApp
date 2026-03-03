// lib/stats.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ModeName = "Calm" | "Focus" | "Sleep";

export type AppStats = {
  totalSessions: number;
  totalMinutes: number;
  streak: number;        // current streak in days
  bestStreak: number;    // longest streak
  favoriteMode: ModeName | null;
  last7Days: number[];   // sessions per day (length 7), oldest -> newest
  perModeCounts: Record<ModeName, number>;
  lastSessionISO: string | null; // last session date (YYYY-MM-DD)
};

export const STATS_KEY = "mindbreath_stats_v1";

const todayISO = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

const DEFAULT_STATS: AppStats = {
  totalSessions: 0,
  totalMinutes: 0,
  streak: 0,
  bestStreak: 0,
  favoriteMode: null,
  last7Days: [0, 0, 0, 0, 0, 0, 0],
  perModeCounts: { Calm: 0, Focus: 0, Sleep: 0 },
  lastSessionISO: null,
};

export async function readStats(): Promise<AppStats> {
  try {
    const raw = await AsyncStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    const s = JSON.parse(raw);
    return {
      ...DEFAULT_STATS,
      ...s,
      last7Days: Array.isArray(s.last7Days) && s.last7Days.length === 7 ? s.last7Days : DEFAULT_STATS.last7Days,
      perModeCounts: { ...DEFAULT_STATS.perModeCounts, ...(s.perModeCounts ?? {}) },
    } as AppStats;
  } catch {
    return DEFAULT_STATS;
  }
}

function rollSevenDays(last7: number[], daysDiff: number): number[] {
  // Shift in zeros for the missing days to keep length 7
  const result = last7.slice();
  for (let i = 0; i < daysDiff; i++) {
    result.shift();
    result.push(0);
  }
  return result;
}

function daysBetween(aISO: string, bISO: string): number {
  const a = new Date(aISO + "T00:00:00Z").getTime();
  const b = new Date(bISO + "T00:00:00Z").getTime();
  const ms = 24 * 60 * 60 * 1000;
  return Math.round((b - a) / ms);
}

/**
 * Call this after a session completes.
 * @param mode     Mode name
 * @param minutes  Duration in minutes (integer)
 * @param sessionDateISO Optional date (YYYY-MM-DD). Defaults to today.
 */
export async function saveSession(mode: ModeName, minutes: number, sessionDateISO?: string) {
  const dateISO = sessionDateISO ?? todayISO();
  const prev = await readStats();

  // Roll 7-day array if day has advanced
  const baseISO = prev.lastSessionISO ?? dateISO;
  const diff = daysBetween(prev.lastSessionISO ?? dateISO, dateISO);
  let last7 = prev.last7Days;
  let streak = prev.streak;
  let bestStreak = prev.bestStreak;

  if (prev.lastSessionISO) {
    if (diff === 0) {
      // same day, nothing to roll
    } else if (diff > 0) {
      last7 = rollSevenDays(last7, Math.min(diff, 7));
      // streak: if yesterday -> +1; if >1 day gap -> reset to 1
      if (diff === 1) streak = prev.streak + 1;
      else streak = 1;
      if (streak > bestStreak) bestStreak = streak;
    } else {
      // session in the past or out-of-order, ignore streak changes
    }
  } else {
    // first ever session
    streak = 1;
    bestStreak = 1;
  }

  // Add today's session to the last slot
  const updatedLast7 = last7.slice();
  updatedLast7[6] = (updatedLast7[6] ?? 0) + 1;

  // Update counts
  const perModeCounts = { ...prev.perModeCounts };
  perModeCounts[mode] = (perModeCounts[mode] ?? 0) + 1;

  // Favorite mode
  const entries = Object.entries(perModeCounts) as [ModeName, number][];
  let favoriteMode: ModeName | null = prev.favoriteMode;
  const top = entries.sort((a, b) => b[1] - a[1])[0];
  if (top && top[1] > 0) favoriteMode = top[0];

  const next: AppStats = {
    totalSessions: prev.totalSessions + 1,
    totalMinutes: prev.totalMinutes + (Number.isFinite(minutes) ? minutes : 0),
    streak,
    bestStreak,
    favoriteMode,
    last7Days: updatedLast7,
    perModeCounts,
    lastSessionISO: dateISO,
  };

  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(next));
  return next;
}

/** Convenience: clear stats (useful in dev) */
export async function resetStats() {
  await AsyncStorage.removeItem(STATS_KEY);
}
