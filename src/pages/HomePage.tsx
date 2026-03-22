import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useMood } from '@/hooks/useMood';
import { CATEGORIES, GAMES, BRAIN_TYPES, Category } from '@/lib/types';
import { Flame, Trophy, BarChart3, Swords, Home, Gamepad2, User } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const MOOD_SCALE = [
  { emoji: '😴', label: 'Tired', value: 'tired' },
  { emoji: '😐', label: 'Meh', value: 'anxious' },
  { emoji: '🙂', label: 'Good', value: 'calm' },
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '🔥', label: 'On Fire', value: 'fired-up' },
];

const CATEGORY_COLORS: Record<string, string> = {
  memory: 'hsl(280, 60%, 55%)',
  logic: 'hsl(220, 70%, 55%)',
  speed: 'hsl(18, 100%, 60%)',
  language: 'hsl(142, 60%, 42%)',
  spatial: 'hsl(175, 60%, 42%)',
  emotional: 'hsl(340, 75%, 55%)',
};

export default function HomePage() {
  const navigate = useNavigate();
  const { profile, xpForNextLevel, xpProgress, addMoodEntry } = useUserProfile();
  const { currentMood, moodChecked, selectMood, getMoodInsight } = useMood();
  const [showMoodCheck, setShowMoodCheck] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedMoodEmoji, setSelectedMoodEmoji] = useState<string | null>(null);

  const brainType = BRAIN_TYPES[profile.brainType] || BRAIN_TYPES.strategist;
  const filteredGames = selectedCategory ? GAMES.filter(g => g.category === selectedCategory) : GAMES;

  const weekDays: { date: string; label: string; active: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    weekDays.push({
      date: dateStr,
      label: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getDay()],
      active: !!profile.weeklyActivity[dateStr],
    });
  }

  const handleMoodSelect = (moodValue: string) => {
    selectMood(moodValue);
    const moodObj = MOOD_SCALE.find(m => m.value === moodValue)!;
    setSelectedMoodEmoji(moodObj.emoji);
    addMoodEntry({
      date: new Date().toISOString(),
      mood: moodValue,
      emoji: moodObj.emoji,
      energy: MOOD_SCALE.indexOf(moodObj) + 1,
    });
    setShowMoodCheck(false);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const xpPercent = (xpProgress / xpForNextLevel) * 100;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (xpPercent / 100) * circumference;

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
  };

  return (
    <div className="max-w-md mx-auto px-5 pb-28 bg-background min-h-screen">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-12 pb-2 flex items-start justify-between"
      >
        <div>
          <h1 className="text-[28px] font-extrabold text-foreground leading-tight">
            {greeting()}, {profile.name} 👋
          </h1>
          <p className="text-muted-foreground text-[15px] mt-1">{brainType.label} · Level {profile.level}</p>
        </div>
        <ThemeToggle />
      </motion.div>

      {/* XP Progress Ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center py-6"
      >
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" className="stroke-muted" strokeWidth="8" />
            <motion.circle
              cx="60" cy="60" r="54" fill="none"
              stroke="hsl(18, 100%, 60%)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold tabular-nums text-foreground">{xpProgress}</span>
            <span className="text-xs text-muted-foreground font-medium">/ {xpForNextLevel} XP</span>
          </div>
        </div>
      </motion.div>

      {/* Streak Badge */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex items-center gap-1.5 bg-primary/8 px-4 py-2 rounded-full">
          <Flame className="w-4 h-4 text-primary" />
          <span className="font-bold text-sm text-primary tabular-nums">{profile.streak} day streak</span>
        </div>
      </div>

      {/* Mood Check-in */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowMoodCheck(true)}
        className="w-full bg-card rounded-2xl p-4 mb-4 shadow-card text-center"
      >
        <span className="text-[15px] font-semibold text-muted-foreground">
          {moodChecked
            ? `${selectedMoodEmoji || '🙂'} Feeling ${currentMood} — ${getMoodInsight()}`
            : 'How are you feeling today? Tap to check in'}
        </span>
      </motion.button>

      {/* Mood Modal */}
      <AnimatePresence>
        {showMoodCheck && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm px-6"
            onClick={() => setShowMoodCheck(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-card rounded-3xl p-7 shadow-elevated w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-extrabold text-xl mb-1 text-center text-foreground">How do you feel?</h3>
              <p className="text-sm text-muted-foreground mb-6 text-center">We'll recommend the perfect game for you</p>
              <div className="flex justify-between px-2">
                {MOOD_SCALE.map(m => (
                  <motion.button
                    key={m.value}
                    whileTap={{ scale: 0.85 }}
                    whileHover={{ y: -3 }}
                    onClick={() => handleMoodSelect(m.value)}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-primary/5 transition-colors"
                  >
                    <span className="text-4xl">{m.emoji}</span>
                    <span className="text-[11px] font-medium text-muted-foreground">{m.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Play Now / Duel Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          const randomGame = GAMES[Math.floor(Math.random() * GAMES.length)];
          navigate(`/game/${randomGame.id}`);
        }}
        className="w-full rounded-full p-4 mb-6 flex items-center justify-center gap-2 text-primary-foreground font-bold text-lg"
        style={{ background: 'linear-gradient(135deg, hsl(18, 100%, 60%), hsl(18, 100%, 50%))' }}
      >
        <Swords className="w-5 h-5" /> Play Now
      </motion.button>

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            !selectedCategory ? 'bg-foreground text-background' : 'bg-card shadow-soft text-muted-foreground'
          }`}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              selectedCategory === cat.id
                ? 'text-primary-foreground'
                : 'bg-card shadow-soft text-muted-foreground'
            }`}
            style={selectedCategory === cat.id ? { backgroundColor: CATEGORY_COLORS[cat.id] } : undefined}
          >
            {cat.id === 'emotional' ? 'Emotional IQ' : cat.label}
          </button>
        ))}
      </div>

      {/* Game Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
        {filteredGames.map(game => {
          const highScore = profile.gameHighScores[game.id] || 0;
          return (
            <motion.button
              key={game.id}
              variants={item}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/game/${game.id}`)}
              className="bg-card rounded-[20px] p-4 text-left shadow-card hover:shadow-elevated transition-shadow"
            >
              <span className="text-3xl block mb-3">{game.icon}</span>
              <div className="font-bold text-[15px] text-foreground leading-tight mb-1">{game.name}</div>
              <span
                className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mb-2 text-primary-foreground"
                style={{ backgroundColor: CATEGORY_COLORS[game.category] }}
              >
                {game.category === 'emotional' ? 'Emotional IQ' : game.category.charAt(0).toUpperCase() + game.category.slice(1)}
              </span>
              <div className="text-[12px] text-muted-foreground leading-snug">{game.description}</div>
              {highScore > 0 && (
                <div className="mt-2 text-[11px] font-bold tabular-nums text-muted-foreground">
                  Best: {highScore}
                </div>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Duel Record */}
      {(profile.duelRecord.wins > 0 || profile.duelRecord.losses > 0) && (
        <div className="mt-4 bg-card rounded-2xl p-3 shadow-card flex items-center justify-center gap-4">
          <span className="text-sm text-muted-foreground font-medium">Duel Record:</span>
          <span className="font-bold text-success">{profile.duelRecord.wins}W</span>
          <span className="text-muted-foreground">—</span>
          <span className="font-bold text-destructive">{profile.duelRecord.losses}L</span>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 shadow-elevated">
        <div className="max-w-md mx-auto flex justify-around py-3">
          <button onClick={() => navigate('/')} className="flex flex-col items-center gap-0.5 text-primary">
            <Home className="w-5 h-5" />
            <span className="text-[11px] font-semibold">Home</span>
          </button>
          <button onClick={() => navigate('/leaderboard')} className="flex flex-col items-center gap-0.5 text-muted-foreground">
            <Trophy className="w-5 h-5" />
            <span className="text-[11px] font-semibold">Rank</span>
          </button>
          <button onClick={() => navigate('/progress')} className="flex flex-col items-center gap-0.5 text-muted-foreground">
            <BarChart3 className="w-5 h-5" />
            <span className="text-[11px] font-semibold">Progress</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 text-muted-foreground">
            <User className="w-5 h-5" />
            <span className="text-[11px] font-semibold">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
