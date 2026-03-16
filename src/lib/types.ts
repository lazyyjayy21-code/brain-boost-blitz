export type Category = 'memory' | 'logic' | 'speed' | 'language' | 'spatial' | 'focus';

export interface GameDef {
  id: string;
  name: string;
  category: Category;
  description: string;
  icon: string;
}

export interface GameResult {
  gameId: string;
  score: number;
  accuracy: number;
  bestCombo: number;
  timeTaken: number; // ms
  date: string; // ISO
}

export interface UserProfile {
  name: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  lastPlayedDate: string;
  streakShields: number;
  badges: string[];
  gameHighScores: Record<string, number>;
  gameHistory: GameResult[];
  weeklyActivity: Record<string, boolean>; // "2026-03-16" => true
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  points: number;
  streak: number;
  isCurrentUser?: boolean;
}

export const CATEGORIES: { id: Category; label: string; color: string }[] = [
  { id: 'memory', label: 'Memory', color: 'memory' },
  { id: 'logic', label: 'Logic', color: 'logic' },
  { id: 'speed', label: 'Speed', color: 'speed' },
  { id: 'language', label: 'Language', color: 'language' },
  { id: 'spatial', label: 'Spatial', color: 'spatial' },
  { id: 'focus', label: 'Focus', color: 'focus' },
];

export const GAMES: GameDef[] = [
  // Memory
  { id: 'simon-says', name: 'Simon Says', category: 'memory', description: 'Repeat the growing sequence', icon: '🎵' },
  { id: 'card-flip', name: 'Card Flip Match', category: 'memory', description: 'Find matching card pairs', icon: '🃏' },
  // Logic
  { id: 'number-matrix', name: 'Number Matrix', category: 'logic', description: 'Recall the missing numbers', icon: '🔢' },
  { id: 'pattern-puzzle', name: 'Pattern Puzzle', category: 'logic', description: 'Complete the visual pattern', icon: '🧩' },
  // Speed
  { id: 'stroop', name: 'Stroop Challenge', category: 'speed', description: 'Tap the color, not the word', icon: '🎨' },
  { id: 'speed-math', name: 'Speed Math', category: 'speed', description: 'Solve equations fast', icon: '⚡' },
  // Language
  { id: 'word-unscramble', name: 'Word Unscramble', category: 'language', description: 'Unscramble the word', icon: '🔤' },
  { id: 'word-chain', name: 'Word Chain', category: 'language', description: 'Chain words by last letter', icon: '🔗' },
  // Spatial
  { id: 'mental-rotation', name: 'Mental Rotation', category: 'spatial', description: 'Match the rotated shape', icon: '🔄' },
  { id: 'spot-difference', name: 'Spot the Difference', category: 'spatial', description: 'Find the differences', icon: '🔍' },
  // Focus
  { id: 'dual-n-back', name: 'Dual N-Back', category: 'focus', description: 'Remember N steps ago', icon: '🧠' },
  { id: 'focus-filter', name: 'Focus Filter', category: 'focus', description: 'Tap only the targets', icon: '🎯' },
];

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

export const XP_PER_LEVEL = 500;
