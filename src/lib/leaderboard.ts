import { LeaderboardEntry, BRAIN_TYPES } from './types';

const MOCK_NAMES = [
  'NeuralNinja', 'BrainWave', 'CogMaster', 'SynapsFire', 'MindFlux',
  'ThinkTank', 'QuickWit', 'LogicLion', 'MemoryMage', 'FocusPhoenix',
  'SpeedStar', 'PuzzlePro', 'WordWizard', 'PatternKing', 'ZenZone',
  'BrainBolt', 'SharpMind', 'ClearThinker', 'FastTrack', 'DeepFocus',
];

const AVATARS = ['🦊', '🐺', '🦁', '🐲', '🦅', '🐬', '🦉', '🐙', '🦋', '🔥', '⚡', '🌟', '💎', '🎯', '🧬', '🌈', '🎭', '🏆', '🎪', '🚀'];
const BRAIN_TYPE_KEYS = Object.keys(BRAIN_TYPES);

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateLeaderboard(
  period: 'today' | 'week' | 'alltime',
  userPoints: number,
  userStreak: number,
  gameFilter?: string,
  userBrainType?: string
): LeaderboardEntry[] {
  const seed = period === 'today' ? new Date().getDate() : period === 'week' ? Math.floor(Date.now() / 604800000) : 42;
  const multiplier = period === 'today' ? 1 : period === 'week' ? 5 : 50;

  const entries: LeaderboardEntry[] = MOCK_NAMES.map((name, i) => ({
    rank: 0,
    name,
    avatar: AVATARS[i],
    points: Math.round(seededRandom(seed + i + (gameFilter ? gameFilter.length : 0)) * 500 * multiplier + 100 * multiplier),
    streak: Math.round(seededRandom(seed + i + 99) * 30),
    brainType: BRAIN_TYPE_KEYS[Math.floor(seededRandom(seed + i + 50) * BRAIN_TYPE_KEYS.length)],
  }));

  entries.push({
    rank: 0,
    name: 'You',
    avatar: '🧠',
    points: userPoints,
    streak: userStreak,
    brainType: userBrainType || 'strategist',
    isCurrentUser: true,
  });

  entries.sort((a, b) => b.points - a.points);
  entries.forEach((e, i) => e.rank = i + 1);

  return entries;
}

export function generateDuelLeaderboard(userWins: number, userLosses: number): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = MOCK_NAMES.slice(0, 15).map((name, i) => ({
    rank: 0,
    name,
    avatar: AVATARS[i],
    points: Math.round(seededRandom(77 + i) * 50 + 5),
    streak: Math.round(seededRandom(88 + i) * 20),
  }));

  entries.push({
    rank: 0,
    name: 'You',
    avatar: '🧠',
    points: userWins,
    streak: userLosses,
    isCurrentUser: true,
  });

  entries.sort((a, b) => b.points - a.points);
  entries.forEach((e, i) => e.rank = i + 1);

  return entries;
}
