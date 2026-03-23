import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useMood } from '@/hooks/useMood';
import { GAMES, Category } from '@/lib/types';
import { Flame, Crown, Compass, Trophy, Gamepad2, User, Lock } from 'lucide-react';

const MOOD_SCALE = [
  { emoji: '😴', label: 'Tired', value: 'tired' },
  { emoji: '😐', label: 'Meh', value: 'anxious' },
  { emoji: '🙂', label: 'Good', value: 'calm' },
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '🔥', label: 'On Fire', value: 'fired-up' },
];

const CARD_GRADIENTS: Record<Category, string> = {
  memory: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
  logic: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
  speed: 'linear-gradient(135deg, #F97316, #EAB308)',
  language: 'linear-gradient(135deg, #22C55E, #14B8A6)',
  spatial: 'linear-gradient(135deg, #6366F1, #3B82F6)',
  emotional: 'linear-gradient(135deg, #F43F5E, #F97316)',
};

const FLOATING_SHAPES = [
  { top: '12%', left: '10%', size: 12, opacity: 0.25 },
  { top: '18%', right: '14%', size: 8, opacity: 0.2 },
  { top: '60%', left: '16%', size: 10, opacity: 0.18 },
  { top: '70%', right: '10%', size: 14, opacity: 0.22 },
  { top: '30%', left: '80%', size: 6, opacity: 0.15 },
  { top: '50%', right: '80%', size: 9, opacity: 0.2 },
];

const DAILY_PUZZLES = [
  { name: 'Quick Math', icon: '➕', locked: false },
  { name: 'Word Match', icon: '📝', locked: false },
  { name: 'Pattern', icon: '🔷', locked: true },
  { name: 'Memory', icon: '🧩', locked: true },
  { name: 'Focus', icon: '🎯', locked: true },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { profile, addMoodEntry } = useUserProfile();
  const { currentMood, moodChecked, selectMood, getMoodInsight } = useMood();
  const [showMoodCheck, setShowMoodCheck] = useState(false);
  const [selectedMoodEmoji, setSelectedMoodEmoji] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-24">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-white text-sm font-bold tabular-nums">{profile.streak}</span>
          </button>
          <button className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full">
            <span className="text-yellow-400 text-sm">🪙</span>
            <span className="text-white text-sm font-bold tabular-nums">{profile.xp}</span>
          </button>
        </div>
        <button className="flex items-center gap-1.5 bg-purple-600/80 px-3 py-1.5 rounded-full">
          <Crown className="w-3.5 h-3.5 text-yellow-300" />
          <span className="text-white text-xs font-bold">Premium</span>
        </button>
      </div>
      <div className="h-px bg-white/8 mx-4" />

      {/* Mood Check-in (subtle) */}
      {!moodChecked && (
        <motion.button
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowMoodCheck(true)}
          className="mx-4 mt-3 w-[calc(100%-2rem)] bg-white/5 rounded-2xl px-4 py-3 text-center"
        >
          <span className="text-white/60 text-sm">How are you feeling? Tap to check in 🧠</span>
        </motion.button>
      )}

      {/* Mood Modal */}
      <AnimatePresence>
        {showMoodCheck && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
            onClick={() => setShowMoodCheck(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-[#1A1A2E] rounded-3xl p-7 shadow-elevated w-full max-w-sm border border-white/10"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-extrabold text-xl mb-1 text-center text-white">How do you feel?</h3>
              <p className="text-sm text-white/50 mb-6 text-center">We'll pick the perfect game for you</p>
              <div className="flex justify-between px-2">
                {MOOD_SCALE.map(m => (
                  <motion.button
                    key={m.value}
                    whileTap={{ scale: 0.85 }}
                    whileHover={{ y: -3 }}
                    onClick={() => handleMoodSelect(m.value)}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-white/5 transition-colors"
                  >
                    <span className="text-4xl">{m.emoji}</span>
                    <span className="text-[11px] font-medium text-white/50">{m.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TODAY'S WORKOUTS */}
      <div className="px-4 pt-5 pb-3">
        <h2 className="text-[12px] font-bold text-white/70 uppercase tracking-[2px]">
          Today's Workouts
        </h2>
      </div>

      {/* Game Cards — Horizontal Snap Scroll */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 pb-2 scrollbar-hide"
      >
        {GAMES.map((game, i) => {
          const gradient = CARD_GRADIENTS[game.category];
          const highScore = profile.gameHighScores[game.id] || 0;
          return (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="snap-center shrink-0 w-[calc(100vw-48px)] max-w-[340px]"
            >
              <div
                className="relative rounded-[24px] overflow-hidden h-[320px] flex flex-col items-center justify-between py-6 px-5"
                style={{ background: gradient }}
              >
                {/* Floating decorative shapes */}
                {FLOATING_SHAPES.map((shape, si) => (
                  <div
                    key={si}
                    className="absolute rounded-full bg-white animate-float"
                    style={{
                      top: shape.top,
                      left: shape.left,
                      right: shape.right,
                      width: shape.size,
                      height: shape.size,
                      opacity: shape.opacity,
                      animationDelay: `${si * 0.5}s`,
                    }}
                  />
                ))}

                {/* Category label */}
                <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">
                  {game.category === 'emotional' ? 'Emotional IQ' : game.category}
                </span>

                {/* Big emoji */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[80px] leading-none drop-shadow-lg">{game.icon}</span>
                </div>

                {/* Text + Button */}
                <div className="w-full text-center space-y-2">
                  <h3 className="text-white font-extrabold text-2xl">{game.name}</h3>
                  <p className="text-white/70 text-sm leading-snug">{game.description}</p>
                  {highScore > 0 && (
                    <p className="text-white/50 text-xs font-semibold">Best: {highScore}</p>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/game/${game.id}`)}
                    className="w-full bg-white text-[#0D0D0D] font-bold text-[15px] py-3 rounded-full mt-2 shadow-lg active:bg-white/90 transition-colors"
                  >
                    Start
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* DAILY PUZZLES */}
      <div className="px-4 pt-6 pb-3">
        <h2 className="text-[12px] font-bold text-white/70 uppercase tracking-[2px]">
          Daily Puzzles
        </h2>
      </div>

      <div className="flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide">
        {DAILY_PUZZLES.map((puzzle, i) => (
          <motion.button
            key={puzzle.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!puzzle.locked) {
                const randomGame = GAMES[Math.floor(Math.random() * GAMES.length)];
                navigate(`/game/${randomGame.id}`);
              }
            }}
            className={`shrink-0 w-[100px] rounded-2xl p-4 flex flex-col items-center gap-2 ${
              puzzle.locked ? 'bg-white/5' : 'bg-white/10'
            }`}
          >
            <div className="relative">
              <span className="text-3xl">{puzzle.icon}</span>
              {puzzle.locked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                  <Lock className="w-4 h-4 text-white/60" />
                </div>
              )}
            </div>
            <span className={`text-xs font-semibold ${puzzle.locked ? 'text-white/30' : 'text-white/70'}`}>
              {puzzle.name}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Duel Record */}
      {(profile.duelRecord.wins > 0 || profile.duelRecord.losses > 0) && (
        <div className="mx-4 bg-white/5 rounded-2xl p-3 flex items-center justify-center gap-4">
          <span className="text-sm text-white/50 font-medium">Duel Record:</span>
          <span className="font-bold text-green-400">{profile.duelRecord.wins}W</span>
          <span className="text-white/30">—</span>
          <span className="font-bold text-red-400">{profile.duelRecord.losses}L</span>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0D0D0D] border-t border-white/8">
        <div className="max-w-md mx-auto flex justify-around py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
          {[
            { icon: Compass, label: 'Today', route: '/', active: true },
            { icon: Trophy, label: 'Quests', route: '/leaderboard', active: false },
            { icon: Crown, label: 'Leagues', route: '/leaderboard', active: false },
            { icon: Gamepad2, label: 'Games', route: '/', active: false },
            { icon: User, label: 'Me', route: '/progress', active: false },
          ].map(tab => (
            <button
              key={tab.label}
              onClick={() => navigate(tab.route)}
              className="flex flex-col items-center gap-0.5 min-w-[48px]"
            >
              <tab.icon className={`w-5 h-5 ${tab.active ? 'text-teal-400' : 'text-white/30'}`} />
              <span className={`text-[10px] font-semibold ${tab.active ? 'text-teal-400' : 'text-white/30'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
