import { useState, useEffect, useCallback } from 'react';
import { UserProfile, GameResult, MoodEntry, STREAK_MILESTONES, XP_PER_LEVEL, CATEGORIES } from '@/lib/types';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Player',
  avatar: '🧠',
  xp: 0,
  level: 1,
  streak: 0,
  lastPlayedDate: '',
  streakShields: 0,
  badges: [],
  gameHighScores: {},
  gameHistory: [],
  weeklyActivity: {},
  brainType: 'strategist',
  moodHistory: [],
  duelRecord: { wins: 0, losses: 0 },
};

const STORAGE_KEY = 'neurobattle-profile';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return { ...DEFAULT_PROFILE, ...JSON.parse(saved) }; } catch { return DEFAULT_PROFILE; }
    }
    return DEFAULT_PROFILE;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const today = new Date().toISOString().split('T')[0];

  const updateStreak = useCallback(() => {
    setProfile(prev => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (prev.lastPlayedDate === today) return prev;

      let newStreak = prev.streak;
      let shields = prev.streakShields;
      let newBadges = [...prev.badges];

      if (prev.lastPlayedDate === yesterdayStr) {
        newStreak += 1;
      } else if (prev.lastPlayedDate && prev.lastPlayedDate !== today) {
        if (shields > 0) { shields -= 1; } else { newStreak = 1; }
      } else {
        newStreak = 1;
      }

      if (newStreak > 0 && newStreak % 3 === 0) {
        shields = Math.min(shields + 1, 3);
      }

      for (const milestone of STREAK_MILESTONES) {
        const badge = `streak-${milestone}`;
        if (newStreak >= milestone && !newBadges.includes(badge)) {
          newBadges.push(badge);
        }
      }

      return {
        ...prev,
        streak: newStreak,
        lastPlayedDate: today,
        streakShields: shields,
        badges: newBadges,
        weeklyActivity: { ...prev.weeklyActivity, [today]: true },
      };
    });
  }, [today]);

  const addGameResult = useCallback((result: GameResult) => {
    setProfile(prev => {
      const xpGain = Math.round(result.score * 0.5);
      const newXp = prev.xp + xpGain;
      const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
      const currentHigh = prev.gameHighScores[result.gameId] || 0;

      // Calculate brain type based on category performance
      const history = [...prev.gameHistory, result];
      const brainType = calculateBrainType(history);

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        brainType,
        gameHighScores: {
          ...prev.gameHighScores,
          [result.gameId]: Math.max(currentHigh, result.score),
        },
        gameHistory: history,
      };
    });
    updateStreak();
  }, [updateStreak]);

  const addMoodEntry = useCallback((entry: MoodEntry) => {
    setProfile(prev => ({
      ...prev,
      moodHistory: [...prev.moodHistory, entry],
    }));
  }, []);

  const recordDuel = useCallback((won: boolean) => {
    setProfile(prev => ({
      ...prev,
      duelRecord: {
        wins: prev.duelRecord.wins + (won ? 1 : 0),
        losses: prev.duelRecord.losses + (won ? 0 : 1),
      },
    }));
  }, []);

  const getTotalPoints = useCallback(() => {
    return profile.gameHistory.reduce((sum, r) => sum + r.score, 0);
  }, [profile.gameHistory]);

  const xpForNextLevel = profile.level * XP_PER_LEVEL;
  const xpProgress = profile.xp % XP_PER_LEVEL;

  return { profile, addGameResult, addMoodEntry, recordDuel, updateStreak, getTotalPoints, xpForNextLevel, xpProgress };
}

function calculateBrainType(history: GameResult[]): string {
  const catMap: Record<string, string[]> = {
    memory: ['mind-mirror', 'chaos-conductor'],
    logic: ['lie-detector', 'impostor-pattern'],
    speed: ['phantom-math', 'time-warp'],
    language: ['word-avalanche'],
    spatial: ['vanishing-city', 'frequency'],
    emotional: ['emotion-codebreaker'],
  };

  const catScores: Record<string, number> = {};
  for (const [cat, gameIds] of Object.entries(catMap)) {
    const games = history.filter(h => gameIds.includes(h.gameId));
    catScores[cat] = games.length > 0 ? games.reduce((s, g) => s + g.score, 0) / games.length : 0;
  }

  const best = Object.entries(catScores).sort((a, b) => b[1] - a[1])[0];
  if (!best || best[1] === 0) return 'strategist';

  const typeMap: Record<string, string> = {
    memory: 'mnemonist', logic: 'strategist', speed: 'speedDemon',
    language: 'polyglot', spatial: 'architect', emotional: 'empath',
  };
  return typeMap[best[0]] || 'strategist';
}
