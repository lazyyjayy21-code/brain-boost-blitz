import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Swords, Home, Trophy, BarChart3, User } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { generateLeaderboard, generateDuelLeaderboard } from '@/lib/leaderboard';
import { GAMES, BRAIN_TYPES } from '@/lib/types';

const TABS = ['Today', 'This Week', 'All Time', 'Duels'] as const;
const TAB_KEYS = ['today', 'week', 'alltime', 'duels'] as const;

const MEDAL_BORDER_COLORS = ['hsl(42, 100%, 50%)', 'hsl(0, 0%, 75%)', 'hsl(30, 60%, 50%)'];

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
    <div className="max-w-md mx-auto px-5 py-6 pb-28 bg-background min-h-screen">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground mb-6 text-sm font-medium">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <h1 className="text-[28px] font-extrabold text-foreground mb-5">Leaderboard</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-2xl p-1 mb-5">
        {TABS.map((tab, i) => (
          <button key={tab}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === i ? 'bg-card shadow-card text-foreground' : 'text-muted-foreground'
            }`}
          >
            {i === 3 && <Swords className="w-3 h-3 inline mr-1" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Game filter */}
      {!isDuelTab && (
        <select
          value={gameFilter}
          onChange={e => setGameFilter(e.target.value)}
          className="w-full h-11 rounded-2xl bg-card shadow-card px-4 text-sm font-medium mb-5 border-0 outline-none text-foreground appearance-none"
        >
          <option value="">All Games</option>
          {GAMES.map(g => <option key={g.id} value={g.id}>{g.icon} {g.name}</option>)}
        </select>
      )}

      {/* Entries */}
      <div className="flex flex-col gap-2">
        {top10.map((entry, i) => (
          <motion.div key={entry.rank}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`flex items-center gap-3 p-3.5 rounded-2xl transition-colors ${
              entry.isCurrentUser ? 'bg-primary/8' : 'bg-card shadow-card'
            }`}
            style={entry.rank <= 3 ? { borderLeft: `3px solid ${MEDAL_BORDER_COLORS[entry.rank - 1]}` } : undefined}
          >
            <div className="w-8 text-center font-extrabold tabular-nums text-sm">
              {entry.rank <= 3 ? medals[entry.rank - 1] : `#${entry.rank}`}
            </div>
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-lg">
              {entry.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-foreground truncate">{entry.name}</div>
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
              <div className="font-extrabold tabular-nums text-foreground">
                {isDuelTab ? `${entry.points}W` : entry.points.toLocaleString()}
              </div>
              {!isDuelTab && <div className="text-xs text-muted-foreground">pts</div>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pinned user */}
      {userEntry && !userInTop && (
        <div className="fixed bottom-20 left-0 right-0 px-5">
          <div className="max-w-md mx-auto bg-card rounded-2xl p-3.5 shadow-elevated flex items-center gap-3">
            <div className="w-8 text-center font-extrabold tabular-nums text-sm">#{userEntry.rank}</div>
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-lg">{userEntry.avatar}</div>
            <div className="flex-1">
              <div className="font-bold text-sm text-foreground">{userEntry.name}</div>
              <div className="text-xs text-muted-foreground">🔥 {userEntry.streak}</div>
            </div>
            <div className="font-extrabold tabular-nums text-foreground">{userEntry.points.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 shadow-elevated">
        <div className="max-w-md mx-auto flex justify-around py-3">
          <button onClick={() => navigate('/')} className="flex flex-col items-center gap-0.5 text-muted-foreground">
            <Home className="w-5 h-5" />
            <span className="text-[11px] font-semibold">Home</span>
          </button>
          <button onClick={() => navigate('/leaderboard')} className="flex flex-col items-center gap-0.5 text-primary">
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
