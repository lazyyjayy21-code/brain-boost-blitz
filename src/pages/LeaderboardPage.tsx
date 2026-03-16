import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { generateLeaderboard } from '@/lib/leaderboard';
import { GAMES } from '@/lib/types';

const TABS = ['Today', 'This Week', 'All Time'] as const;
const TAB_KEYS = ['today', 'week', 'alltime'] as const;

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { profile, getTotalPoints } = useUserProfile();
  const [activeTab, setActiveTab] = useState(0);
  const [gameFilter, setGameFilter] = useState<string>('');

  const entries = generateLeaderboard(
    TAB_KEYS[activeTab],
    getTotalPoints(),
    profile.streak,
    gameFilter || undefined
  );

  const top10 = entries.slice(0, 10);
  const userEntry = entries.find(e => e.isCurrentUser);
  const userInTop = top10.some(e => e.isCurrentUser);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-24">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground mb-4">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <h1 className="text-2xl font-extrabold mb-4">Leaderboard</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-2xl p-1 mb-4">
        {TABS.map((tab, i) => (
          <button key={tab}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === i ? 'bg-card shadow-card text-foreground' : 'text-muted-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Game filter */}
      <select
        value={gameFilter}
        onChange={e => setGameFilter(e.target.value)}
        className="w-full h-10 rounded-2xl bg-card shadow-card px-4 text-sm font-medium mb-4 border-0 outline-none"
      >
        <option value="">All Games</option>
        {GAMES.map(g => <option key={g.id} value={g.id}>{g.icon} {g.name}</option>)}
      </select>

      {/* Entries */}
      <div className="flex flex-col gap-2">
        {top10.map(entry => (
          <motion.div key={entry.rank}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-3 p-3 rounded-2xl ${
              entry.isCurrentUser ? 'bg-primary/10 ring-2 ring-primary' : 'bg-card shadow-card'
            }`}
          >
            <div className="w-8 text-center font-extrabold tabular-nums text-sm">
              {entry.rank <= 3 ? medals[entry.rank - 1] : `#${entry.rank}`}
            </div>
            <div className="text-xl">{entry.avatar}</div>
            <div className="flex-1">
              <div className="font-bold text-sm">{entry.name}</div>
              <div className="text-xs text-muted-foreground">🔥 {entry.streak} day streak</div>
            </div>
            <div className="text-right">
              <div className="font-extrabold tabular-nums">{entry.points.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">pts</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pinned user row */}
      {userEntry && !userInTop && (
        <div className="fixed bottom-16 left-0 right-0 px-4">
          <div className="max-w-md mx-auto bg-background/80 backdrop-blur-lg rounded-2xl p-3 shadow-elevated border border-primary/10 flex items-center gap-3">
            <div className="w-8 text-center font-extrabold tabular-nums text-sm">#{userEntry.rank}</div>
            <div className="text-xl">{userEntry.avatar}</div>
            <div className="flex-1">
              <div className="font-bold text-sm">{userEntry.name}</div>
              <div className="text-xs text-muted-foreground">🔥 {userEntry.streak}</div>
            </div>
            <div className="font-extrabold tabular-nums">{userEntry.points.toLocaleString()}</div>
          </div>
        </div>
      )}
    </div>
  );
}
