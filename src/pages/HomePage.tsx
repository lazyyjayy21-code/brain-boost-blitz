import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useMood } from '@/hooks/useMood';
import { CATEGORIES, GAMES, MOODS, BRAIN_TYPES, XP_PER_LEVEL, Category } from '@/lib/types';
import { Flame, Trophy, BarChart3, Shield, Swords, Zap } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const CATEGORY_BG: Record<string, string> = {
  memory: 'bg-memory/10', logic: 'bg-logic/10', speed: 'bg-speed/10',
  language: 'bg-language/10', spatial: 'bg-spatial/10', emotional: 'bg-emotional/10',
};
const CATEGORY_TEXT: Record<string, string> = {
  memory: 'text-memory', logic: 'text-logic', speed: 'text-speed',
  language: 'text-language', spatial: 'text-spatial', emotional: 'text-emotional',
};

export default function HomePage() {
  const navigate = useNavigate();
  const { profile, xpForNextLevel, xpProgress, addMoodEntry } = useUserProfile();
  const { currentMood, moodChecked, selectMood, getRecommendedGame, getMoodInsight } = useMood();
  const [showMoodCheck, setShowMoodCheck] = useState(false);

  const dayIndex = new Date().getDate() % GAMES.length;
  const dailyGame = GAMES[dayIndex];
  const brainType = BRAIN_TYPES[profile.brainType] || BRAIN_TYPES.strategist;

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
    const moodObj = MOODS.find(m => m.value === moodValue)!;
    addMoodEntry({
      date: new Date().toISOString(),
      mood: moodValue,
      emoji: moodObj.emoji,
      energy: 3,
    });
    setShowMoodCheck(false);
    // Navigate to recommended game
    const game = getRecommendedGame();
    navigate(`/game/${game.id}`);
  };

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="max-w-md mx-auto px-4 pb-28">
      {/* Top Bar */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
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
          <ThemeToggle />
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

      {/* XP Bar */}
      <div className="mb-5">
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
      <div className="flex gap-2 mb-6 justify-center">
        {weekDays.map(d => (
          <div key={d.date} className="flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground font-display">{d.label}</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
              d.active ? 'bg-language/20 text-language glow-language' : 'bg-muted text-muted-foreground'
            }`}>
              {d.active ? '✓' : '·'}
            </div>
          </div>
        ))}
      </div>

      {/* Mood Check-in Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowMoodCheck(true)}
        className="w-full rounded-3xl p-4 mb-4 glass text-center"
        style={{ boxShadow: '0 0 25px hsl(340 80% 60% / 0.15)' }}
      >
        <div className="flex items-center justify-center gap-2">
          <Zap className="w-4 h-4 text-emotional" />
          <span className="font-display font-bold text-sm text-emotional">
            {moodChecked ? `Feeling ${currentMood} — ${getMoodInsight()}` : 'How are you feeling? Start a mood session →'}
          </span>
        </div>
      </motion.button>

      {/* Mood Check Modal */}
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
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card rounded-3xl p-6 shadow-elevated w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-display font-bold text-lg mb-1">How do you feel right now?</h3>
              <p className="text-sm text-muted-foreground mb-4">AI will pick the perfect game for your mood</p>
              <div className="grid grid-cols-3 gap-3">
                {MOODS.map(m => (
                  <motion.button
                    key={m.value}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleMoodSelect(m.value)}
                    className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-muted hover:bg-emotional/10 transition-colors"
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-xs font-display font-medium">{m.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Challenge */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate(`/game/${dailyGame.id}`)}
        className={`w-full rounded-3xl p-6 shadow-elevated mb-4 text-left ${CATEGORY_BG[dailyGame.category]}`}
        style={{ boxShadow: `0 0 30px hsl(var(--${dailyGame.category}) / 0.15)` }}
      >
        <div className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wider mb-1">⚡ Daily Challenge</div>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{dailyGame.icon}</span>
          <div>
            <div className={`text-xl font-display font-bold ${CATEGORY_TEXT[dailyGame.category]}`}>{dailyGame.name}</div>
            <div className="text-sm text-muted-foreground">{dailyGame.description}</div>
          </div>
        </div>
      </motion.button>

      {/* Quick Duel Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          const randomGame = GAMES[Math.floor(Math.random() * GAMES.length)];
          navigate(`/game/${randomGame.id}`);
        }}
        className="w-full rounded-3xl p-4 mb-6 text-left flex items-center gap-3"
        style={{
          background: 'linear-gradient(135deg, hsl(25 95% 55% / 0.15), hsl(340 80% 60% / 0.15))',
          boxShadow: '0 0 25px hsl(25 95% 55% / 0.1)',
        }}
      >
        <Swords className="w-8 h-8 text-speed" />
        <div>
          <div className="font-display font-bold text-speed">Quick Duel</div>
          <div className="text-xs text-muted-foreground">Challenge a random opponent</div>
        </div>
      </motion.button>

      {/* Category Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
        {CATEGORIES.map(cat => {
          const games = GAMES.filter(g => g.category === cat.id);
          return (
            <motion.button
              key={cat.id}
              variants={item}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/category/${cat.id}`)}
              className={`rounded-3xl p-4 shadow-card text-left ${CATEGORY_BG[cat.id]}`}
              style={{ boxShadow: `0 0 15px hsl(var(--${cat.id}) / 0.1)` }}
            >
              <div className="text-2xl mb-2">{games[0]?.icon}</div>
              <div className={`font-display font-bold ${CATEGORY_TEXT[cat.id]}`}>{cat.label}</div>
              <div className="text-xs text-muted-foreground">{games.length} games</div>
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
