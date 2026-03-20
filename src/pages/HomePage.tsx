import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useMood } from '@/hooks/useMood';
import { CATEGORIES, GAMES, BRAIN_TYPES, Category } from '@/lib/types';
import { Flame, Trophy, BarChart3, Shield, Swords, Zap } from 'lucide-react';

const MOOD_SCALE = [
  { emoji: '😴', label: 'Tired', value: 'tired' },
  { emoji: '😐', label: 'Meh', value: 'anxious' },
  { emoji: '🙂', label: 'Good', value: 'calm' },
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '🔥', label: 'On Fire', value: 'fired-up' },
];

const CATEGORY_BG: Record<string, string> = {
  memory: 'bg-memory/10', logic: 'bg-logic/10', speed: 'bg-speed/10',
  language: 'bg-language/10', spatial: 'bg-spatial/10', emotional: 'bg-emotional/10',
};
const CATEGORY_TEXT: Record<string, string> = {
  memory: 'text-memory', logic: 'text-logic', speed: 'text-speed',
  language: 'text-language', spatial: 'text-spatial', emotional: 'text-emotional',
};
const CATEGORY_BORDER: Record<string, string> = {
  memory: 'border-memory/40', logic: 'border-logic/40', speed: 'border-speed/40',
  language: 'border-language/40', spatial: 'border-spatial/40', emotional: 'border-emotional/40',
};

export default function HomePage() {
  const navigate = useNavigate();
  const { profile, xpForNextLevel, xpProgress, addMoodEntry } = useUserProfile();
  const { currentMood, moodChecked, selectMood, getRecommendedGame, getMoodInsight } = useMood();
  const [showMoodCheck, setShowMoodCheck] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const brainType = BRAIN_TYPES[profile.brainType] || BRAIN_TYPES.strategist;
  const filteredGames = selectedCategory ? GAMES.filter(g => g.category === selectedCategory) : GAMES;

  // Weekly calendar
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
    addMoodEntry({
      date: new Date().toISOString(),
      mood: moodValue,
      emoji: moodObj.emoji,
      energy: MOOD_SCALE.indexOf(moodObj) + 1,
    });
    setShowMoodCheck(false);
  };

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
  const item = {
    hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div className="max-w-md mx-auto px-4 pb-28">
      {/* Top Bar */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-11 h-11 rounded-2xl bg-primary/20 flex items-center justify-center text-xl"
            style={{ boxShadow: '0 0 20px hsl(220 90% 60% / 0.2)' }}
          >
            {profile.avatar}
          </motion.div>
          <div>
            <div className="font-display font-bold text-sm">{profile.name}</div>
            <div className="text-xs text-muted-foreground">{brainType.label} · Lv {profile.level}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/leaderboard')} className="w-9 h-9 rounded-xl bg-card shadow-card flex items-center justify-center">
            <Trophy className="w-4 h-4 text-speed" />
          </button>
          <div className="flex items-center gap-1 bg-speed/10 px-2.5 py-1 rounded-xl">
            <Flame className="w-4 h-4 text-speed" />
            <span className="font-display font-bold tabular-nums text-speed text-sm">{profile.streak}</span>
          </div>
          {profile.streakShields > 0 && (
            <div className="flex items-center gap-1 bg-spatial/10 px-2 py-1 rounded-xl">
              <Shield className="w-3.5 h-3.5 text-spatial" />
              <span className="font-display font-bold text-xs text-spatial">{profile.streakShields}</span>
            </div>
          )}
        </div>
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <h1 className="text-3xl font-display font-bold tracking-tight" style={{ lineHeight: 1.1 }}>
          <span className="text-primary">Neuro</span><span className="text-foreground">Battle</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5 font-display">Train your brain. Battle your limits.</p>
      </motion.div>

      {/* XP Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1 font-display">
          <span>{xpProgress} / {xpForNextLevel} XP</span>
          <span>Lv {profile.level}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, hsl(220,90%,60%), hsl(270,80%,65%))' }}
            initial={{ width: 0 }}
            animate={{ width: `${(xpProgress / xpForNextLevel) * 100}%` }}
          />
        </div>
      </div>

      {/* Weekly Heatmap */}
      <div className="flex gap-2 mb-5 justify-center">
        {weekDays.map(d => (
          <div key={d.date} className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground font-display">{d.label}</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
              d.active ? 'bg-language/20 text-language' : 'bg-muted text-muted-foreground'
            }`}
              style={d.active ? { boxShadow: '0 0 8px hsl(150 80% 45% / 0.3)' } : undefined}
            >
              {d.active ? '✓' : '·'}
            </div>
          </div>
        ))}
      </div>

      {/* Mood Check-in */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowMoodCheck(true)}
        className="w-full rounded-2xl p-3.5 mb-4 glass text-center"
        style={{ boxShadow: '0 0 20px hsl(340 80% 60% / 0.12)' }}
      >
        <div className="flex items-center justify-center gap-2">
          <Zap className="w-4 h-4 text-emotional" />
          <span className="font-display font-semibold text-sm text-emotional">
            {moodChecked ? `Feeling ${currentMood} — ${getMoodInsight()}` : 'How are you feeling? Tap to check in →'}
          </span>
        </div>
      </motion.button>

      {/* Mood Check Modal - 5 emoji scale */}
      <AnimatePresence>
        {showMoodCheck && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-lg px-4"
            onClick={() => setShowMoodCheck(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="bg-card rounded-3xl p-6 shadow-elevated w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-display font-bold text-lg mb-1 text-center">How do you feel?</h3>
              <p className="text-sm text-muted-foreground mb-5 text-center">AI will pick the perfect game for your mood</p>
              <div className="flex justify-between px-2">
                {MOOD_SCALE.map((m, i) => (
                  <motion.button
                    key={m.value}
                    whileTap={{ scale: 0.85 }}
                    whileHover={{ y: -4 }}
                    onClick={() => handleMoodSelect(m.value)}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-emotional/10 transition-colors"
                  >
                    <span className="text-3xl">{m.emoji}</span>
                    <span className="text-[10px] font-display font-medium text-muted-foreground">{m.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Duel Banner */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          const randomGame = GAMES[Math.floor(Math.random() * GAMES.length)];
          navigate(`/game/${randomGame.id}`);
        }}
        className="w-full rounded-2xl p-4 mb-5 text-left flex items-center gap-3 overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg, hsl(270 60% 30%), hsl(260 70% 20%))',
          boxShadow: '0 0 30px hsl(270 80% 65% / 0.2)',
        }}
      >
        <div className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(circle at 80% 20%, hsl(270,80%,65%), transparent 50%)' }}
        />
        <Swords className="w-8 h-8 text-memory relative z-10" />
        <div className="relative z-10 flex-1">
          <div className="font-display font-bold text-white">Duel! ⚡</div>
          <div className="text-xs text-white/60">Challenge a random opponent in real-time</div>
        </div>
        <motion.div
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white/80 font-display font-bold text-sm relative z-10"
        >
          GO →
        </motion.div>
      </motion.button>

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-display font-semibold transition-all ${
            !selectedCategory ? 'bg-primary text-primary-foreground shadow-card' : 'bg-muted text-muted-foreground'
          }`}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-display font-semibold transition-all ${
              selectedCategory === cat.id
                ? `${CATEGORY_BG[cat.id]} ${CATEGORY_TEXT[cat.id]} border ${CATEGORY_BORDER[cat.id]}`
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {cat.id === 'emotional' ? 'Emotional IQ' : cat.label}
          </button>
        ))}
      </div>

      {/* Game Grid — 2 columns, all 10 games */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
        {filteredGames.map(game => {
          const highScore = profile.gameHighScores[game.id] || 0;
          return (
            <motion.button
              key={game.id}
              variants={item}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(`/game/${game.id}`)}
              className={`rounded-2xl p-4 text-left relative overflow-hidden ${CATEGORY_BG[game.category]}`}
              style={{ boxShadow: `0 0 12px hsl(var(--${game.category}) / 0.1)` }}
            >
              <span className="text-3xl block mb-2">{game.icon}</span>
              <div className="font-display font-bold text-sm leading-tight mb-0.5">{game.name}</div>
              <span className={`inline-block text-[10px] font-display font-semibold px-1.5 py-0.5 rounded-md ${CATEGORY_BG[game.category]} ${CATEGORY_TEXT[game.category]} mb-1`}>
                {game.category === 'emotional' ? 'Emotional IQ' : game.category.charAt(0).toUpperCase() + game.category.slice(1)}
              </span>
              <div className="text-[11px] text-muted-foreground leading-snug">{game.description}</div>
              {highScore > 0 && (
                <div className="mt-2 text-[10px] font-display font-bold tabular-nums text-muted-foreground">
                  🏆 {highScore}
                </div>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Duel Record */}
      {(profile.duelRecord.wins > 0 || profile.duelRecord.losses > 0) && (
        <div className="mt-4 bg-card rounded-2xl p-3 shadow-card flex items-center justify-center gap-4">
          <span className="text-xs text-muted-foreground font-display">Duel Record:</span>
          <span className="font-display font-bold text-language">{profile.duelRecord.wins}W</span>
          <span className="text-muted-foreground">-</span>
          <span className="font-display font-bold text-destructive">{profile.duelRecord.losses}L</span>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-border/50">
        <div className="max-w-md mx-auto flex justify-around py-3">
          <button onClick={() => navigate('/')} className="flex flex-col items-center gap-0.5 text-primary">
            <Zap className="w-5 h-5" />
            <span className="text-xs font-display font-semibold">Home</span>
          </button>
          <button onClick={() => navigate('/leaderboard')} className="flex flex-col items-center gap-0.5 text-muted-foreground">
            <Trophy className="w-5 h-5" />
            <span className="text-xs font-display font-semibold">Rank</span>
          </button>
          <button onClick={() => navigate('/progress')} className="flex flex-col items-center gap-0.5 text-muted-foreground">
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs font-display font-semibold">Stats</span>
          </button>
        </div>
      </div>
    </div>
  );
}
