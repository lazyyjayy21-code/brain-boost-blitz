export type Category = 'memory' | 'logic' | 'speed' | 'language' | 'spatial' | 'emotional';

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
  timeTaken: number;
  date: string;
  mood?: string;
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
  weeklyActivity: Record<string, boolean>;
  brainType: string;
  moodHistory: MoodEntry[];
  duelRecord: { wins: number; losses: number };
}

export interface MoodEntry {
  date: string;
  mood: string;
  emoji: string;
  energy: number; // 1-5
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  points: number;
  streak: number;
  brainType?: string;
  isCurrentUser?: boolean;
}

export interface DuelState {
  isActive: boolean;
  opponentName: string;
  opponentAvatar: string;
  opponentScore: number;
  playerScore: number;
  gameId: string;
  result?: 'win' | 'loss' | 'draw';
}

export const MOODS = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😤', label: 'Competitive', value: 'competitive' },
  { emoji: '😰', label: 'Anxious', value: 'anxious' },
  { emoji: '😴', label: 'Tired', value: 'tired' },
  { emoji: '🧘', label: 'Calm', value: 'calm' },
  { emoji: '🔥', label: 'Fired Up', value: 'fired-up' },
];

export const BRAIN_TYPES: Record<string, { label: string; description: string }> = {
  strategist: { label: 'The Strategist', description: 'Excels in logic and pattern recognition' },
  empath: { label: 'The Empath', description: 'Strong emotional intelligence and perception' },
  speedDemon: { label: 'The Speed Demon', description: 'Lightning-fast reflexes and processing' },
  polyglot: { label: 'The Polyglot', description: 'Master of language and word games' },
  architect: { label: 'The Architect', description: 'Exceptional spatial awareness' },
  mnemonist: { label: 'The Mnemonist', description: 'Incredible memory and recall' },
};

export const CATEGORIES: { id: Category; label: string; color: string }[] = [
  { id: 'memory', label: 'Memory', color: 'memory' },
  { id: 'logic', label: 'Logic', color: 'logic' },
  { id: 'speed', label: 'Speed', color: 'speed' },
  { id: 'language', label: 'Language', color: 'language' },
  { id: 'spatial', label: 'Spatial', color: 'spatial' },
  { id: 'emotional', label: 'Emotional IQ', color: 'emotional' },
];

export const GAMES: GameDef[] = [
  { id: 'mind-mirror', name: 'Mind Mirror', category: 'memory', description: 'Reconstruct the sequence from memory', icon: '🪞' },
  { id: 'chaos-conductor', name: 'Chaos Conductor', category: 'memory', description: 'Dual-task: bounce ball + solve math', icon: '🎼' },
  { id: 'lie-detector', name: 'Lie Detector', category: 'logic', description: 'Resist fake social pressure on facts', icon: '🕵️' },
  { id: 'impostor-pattern', name: 'Impostor Pattern', category: 'logic', description: 'Find the one that\'s different', icon: '👁️' },
  { id: 'phantom-math', name: 'Phantom Math', category: 'speed', description: 'Trick equations that feel correct', icon: '👻' },
  { id: 'time-warp', name: 'Time Warp', category: 'speed', description: 'Tap at exactly 3 seconds — no timer', icon: '⏳' },
  { id: 'word-avalanche', name: 'Word Avalanche', category: 'language', description: 'Categorize falling words before they land', icon: '🏔️' },
  { id: 'vanishing-city', name: 'Vanishing City', category: 'spatial', description: 'Remember where objects were placed', icon: '🌆' },
  { id: 'frequency', name: 'Frequency', category: 'spatial', description: 'Spot the off-beat rhythm change', icon: '🎵' },
  { id: 'emotion-codebreaker', name: 'Emotion Codebreaker', category: 'emotional', description: 'Identify precise emotions from faces', icon: '🎭' },
];

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];
export const XP_PER_LEVEL = 500;

export const DUEL_OPPONENTS = [
  { name: 'NeuralNinja', avatar: '🥷' },
  { name: 'BrainWave', avatar: '🌊' },
  { name: 'CogMaster', avatar: '⚙️' },
  { name: 'MindFlux', avatar: '💫' },
  { name: 'QuickWit', avatar: '⚡' },
  { name: 'LogicLion', avatar: '🦁' },
  { name: 'MemoryMage', avatar: '🧙' },
  { name: 'FocusPhoenix', avatar: '🔥' },
];
