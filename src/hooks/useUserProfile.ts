import { useState, useEffect, useCallback } from 'react';
import { UserProfile, GameResult, STREAK_MILESTONES, XP_PER_LEVEL } from '@/lib/types';

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
};

const STORAGE_KEY = 'synapse-profile';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch { return DEFAULT_PROFILE; }
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
        if (shields > 0) {
          shields -= 1;
        } else {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      // Earn shield every 3 days
      if (newStreak > 0 && newStreak % 3 === 0) {
        shields = Math.min(shields + 1, 3);
      }

      // Check milestones
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

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        gameHighScores: {
          ...prev.gameHighScores,
          [result.gameId]: Math.max(currentHigh, result.score),
        },
        gameHistory: [...prev.gameHistory, result],
      };
    });
    updateStreak();
  }, [updateStreak]);

  const getTotalPoints = useCallback(() => {
    return profile.gameHistory.reduce((sum, r) => sum + r.score, 0);
  }, [profile.gameHistory]);

  const xpForNextLevel = profile.level * XP_PER_LEVEL;
  const xpProgress = profile.xp % XP_PER_LEVEL;

  return { profile, addGameResult, updateStreak, getTotalPoints, xpForNextLevel, xpProgress };
}
