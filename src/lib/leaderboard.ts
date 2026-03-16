import { LeaderboardEntry } from './types';

const MOCK_NAMES = [
  'NeuralNinja', 'BrainWave', 'CogMaster', 'SynapsFire', 'MindFlux',
  'ThinkTank', 'QuickWit', 'LogicLion', 'MemoryMage', 'FocusPhoenix',
  'SpeedStar', 'PuzzlePro', 'WordWizard', 'PatternKing', 'ZenZone',
  'BrainBolt', 'SharpMind', 'ClearThinker', 'FastTrack', 'DeepFocus',
];

const AVATARS = ['🦊', '🐺', '🦁', '🐲', '🦅', '🐬', '🦉', '🐙', '🦋', '🔥', '⚡', '🌟', '💎', '🎯', '🧬', '🌈', '🎭', '🏆', '🎪', '🚀'];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateLeaderboard(period: 'today' | 'week' | 'alltime', userPoints: number, userStreak: number, gameFilter?: string): LeaderboardEntry[] {
  const seed = period === 'today' ? new Date().getDate() : period === 'week' ? Math.floor(Date.now() / 604800000) : 42;
  const multiplier = period === 'today' ? 1 : period === 'week' ? 5 : 50;

  const entries: LeaderboardEntry[] = MOCK_NAMES.map((name, i) => ({
    rank: 0,
    name,
    avatar: AVATARS[i],
    points: Math.round(seededRandom(seed + i + (gameFilter ? gameFilter.length : 0)) * 500 * multiplier + 100 * multiplier),
    streak: Math.round(seededRandom(seed + i + 99) * 30),
  }));

  // Add user
  entries.push({
    rank: 0,
    name: 'You',
    avatar: '🧠',
    points: userPoints,
    streak: userStreak,
    isCurrentUser: true,
  });

  entries.sort((a, b) => b.points - a.points);
  entries.forEach((e, i) => e.rank = i + 1);

  return entries;
}
