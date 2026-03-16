import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserProfile } from '@/hooks/useUserProfile';
import { CATEGORIES, GAMES, XP_PER_LEVEL, Category } from '@/lib/types';
import { Flame, Trophy, BarChart3, Shield } from 'lucide-react';

const CATEGORY_BG: Record<string, string> = {
  memory: 'bg-memory/10',
  logic: 'bg-logic/10',
  speed: 'bg-speed/10',
  language: 'bg-language/10',
  spatial: 'bg-spatial/10',
  focus: 'bg-focus/10',
};

const CATEGORY_TEXT: Record<string, string> = {
  memory: 'text-memory',
  logic: 'text-logic',
  speed: 'text-speed',
  language: 'text-language',
  spatial: 'text-spatial',
  focus: 'text-focus',
};

export default function HomePage() {
  const navigate = useNavigate();
  const { profile, xpForNextLevel, xpProgress } = useUserProfile();

  // Daily challenge - deterministic game of the day
  const dayIndex = new Date().getDate() % GAMES.length;
  const dailyGame = GAMES[dayIndex];

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

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="max-w-md mx-auto px-4 pb-24">
      {/* Top Bar */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-xl">
            {profile.avatar}
          </div>
          <div>
            <div className="font-bold text-sm">{profile.name}</div>
            <div className="text-xs text-muted-foreground">Level {profile.level}</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Flame className="w-5 h-5 text-speed" />
            <span className="font-extrabold tabular-nums">{profile.streak}</span>
          </div>
          {profile.streakShields > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <Shield className="w-4 h-4 text-focus" />
              <span className="font-bold">{profile.streakShields}</span>
            </div>
          )}
        </div>
      </div>

      {/* XP Bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{xpProgress} / {xpForNextLevel} XP</span>
          <span>Lv {profile.level}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(xpProgress / xpForNextLevel) * 100}%` }}
          />
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="flex gap-2 mb-6 justify-center">
        {weekDays.map(d => (
          <div key={d.date} className="flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground">{d.label}</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
              d.active ? 'bg-language/20 text-language' : 'bg-muted text-muted-foreground'
            }`}>
              {d.active ? '✓' : '·'}
            </div>
          </div>
        ))}
      </div>

      {/* Daily Challenge */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate(`/game/${dailyGame.id}`)}
        className={`w-full rounded-3xl p-6 shadow-elevated mb-6 text-left ${CATEGORY_BG[dailyGame.category]}`}
      >
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Daily Challenge</div>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{dailyGame.icon}</span>
          <div>
            <div className={`text-xl font-extrabold ${CATEGORY_TEXT[dailyGame.category]}`}>{dailyGame.name}</div>
            <div className="text-sm text-muted-foreground">{dailyGame.description}</div>
          </div>
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
            >
              <div className={`text-2xl mb-2`}>{games[0]?.icon}</div>
              <div className={`font-extrabold ${CATEGORY_TEXT[cat.id]}`}>{cat.label}</div>
              <div className="text-xs text-muted-foreground">{games.length} games</div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border">
        <div className="max-w-md mx-auto flex justify-around py-3">
          <button onClick={() => navigate('/')} className="flex flex-col items-center gap-0.5 text-primary">
            <span className="text-lg">🏠</span>
            <span className="text-xs font-semibold">Home</span>
          </button>
          <button onClick={() => navigate('/leaderboard')} className="flex flex-col items-center gap-0.5 text-muted-foreground">
            <Trophy className="w-5 h-5" />
            <span className="text-xs font-semibold">Rank</span>
          </button>
          <button onClick={() => navigate('/progress')} className="flex flex-col items-center gap-0.5 text-muted-foreground">
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs font-semibold">Stats</span>
          </button>
        </div>
      </div>
    </div>
  );
}
