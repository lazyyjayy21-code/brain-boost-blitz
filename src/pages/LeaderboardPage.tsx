import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Swords } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { generateLeaderboard, generateDuelLeaderboard } from '@/lib/leaderboard';
import { GAMES, BRAIN_TYPES } from '@/lib/types';

const TABS = ['Today', 'This Week', 'All Time', 'Duels'] as const;
const TAB_KEYS = ['today', 'week', 'alltime', 'duels'] as const;

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { profile, getTotalPoints } = useUserProfile();
  const [activeTab, setActiveTab] = useState(0);
  const [gameFilter, setGameFilter] = useState<string>('');

  const isDuelTab = activeTab === 3;

  const entries = isDuelTab
    ? generateDuelLeaderboard(profile.duelRecord.wins, profile.duelRecord.losses)
    : generateLeaderboard(
        TAB_KEYS[activeTab] as 'today' | 'week' | 'alltime',
        getTotalPoints(),
        profile.streak,
        gameFilter || undefined,
        profile.brainType
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

      <h1 className="text-2xl font-display font-bold mb-4">Leaderboard</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-2xl p-1 mb-4">
        {TABS.map((tab, i) => (
          <button key={tab}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-2 rounded-xl text-xs font-display font-semibold transition-all ${
              activeTab === i ? 'bg-card shadow-card text-foreground' : 'text-muted-foreground'
            }`}
          >
            {i === 3 && <Swords className="w-3 h-3 inline mr-1" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Game filter (not for duels) */}
      {!isDuelTab && (
        <select
          value={gameFilter}
          onChange={e => setGameFilter(e.target.value)}
          className="w-full h-10 rounded-2xl bg-card shadow-card px-4 text-sm font-display font-medium mb-4 border-0 outline-none text-foreground"
        >
          <option value="">All Games</option>
          {GAMES.map(g => <option key={g.id} value={g.id}>{g.icon} {g.name}</option>)}
        </select>
      )}

      {/* Column headers for duels */}
      {isDuelTab && (
        <div className="flex items-center gap-3 px-3 mb-2 text-xs text-muted-foreground font-display">
          <div className="w-8">#</div>
          <div className="flex-1">Player</div>
          <div className="text-right">W / L</div>
        </div>
      )}

      {/* Entries */}
      <div className="flex flex-col gap-2">
        {top10.map(entry => (
          <motion.div key={entry.rank}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-3 p-3 rounded-2xl ${
              entry.isCurrentUser ? 'bg-primary/10 ring-2 ring-primary glow-logic' : 'bg-card shadow-card'
            }`}
          >
            <div className="w-8 text-center font-display font-bold tabular-nums text-sm">
              {entry.rank <= 3 ? medals[entry.rank - 1] : `#${entry.rank}`}
            </div>
            <div className="text-xl">{entry.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-sm truncate">{entry.name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                {isDuelTab ? (
                  <span>{entry.streak}L</span>
                ) : (
                  <>
                    🔥 {entry.streak} · {entry.brainType && BRAIN_TYPES[entry.brainType]?.label}
                  </>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display font-bold tabular-nums">
                {isDuelTab ? `${entry.points}W` : entry.points.toLocaleString()}
              </div>
              {!isDuelTab && <div className="text-xs text-muted-foreground">pts</div>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pinned user row */}
      {userEntry && !userInTop && (
        <div className="fixed bottom-16 left-0 right-0 px-4">
          <div className="max-w-md mx-auto glass rounded-2xl p-3 shadow-elevated flex items-center gap-3">
            <div className="w-8 text-center font-display font-bold tabular-nums text-sm">#{userEntry.rank}</div>
            <div className="text-xl">{userEntry.avatar}</div>
            <div className="flex-1">
              <div className="font-display font-bold text-sm">{userEntry.name}</div>
              <div className="text-xs text-muted-foreground">🔥 {userEntry.streak}</div>
            </div>
            <div className="font-display font-bold tabular-nums">{userEntry.points.toLocaleString()}</div>
          </div>
        </div>
      )}
    </div>
  );
}
