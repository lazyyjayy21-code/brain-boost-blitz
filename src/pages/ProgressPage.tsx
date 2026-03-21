import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Trophy, BarChart3, User } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { CATEGORIES, BRAIN_TYPES } from '@/lib/types';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';

export default function ProgressPage() {
  const navigate = useNavigate();
  const { profile, xpForNextLevel, xpProgress } = useUserProfile();
  const brainType = BRAIN_TYPES[profile.brainType] || BRAIN_TYPES.strategist;

  const catGameMap: Record<string, string[]> = {
    memory: ['mind-mirror', 'chaos-conductor'],
    logic: ['lie-detector', 'impostor-pattern'],
    speed: ['phantom-math', 'time-warp'],
    language: ['word-avalanche'],
    spatial: ['vanishing-city', 'frequency'],
    emotional: ['emotion-codebreaker'],
  };

  const radarData = CATEGORIES.map(cat => {
    const catGames = profile.gameHistory.filter(h => catGameMap[cat.id]?.includes(h.gameId));
    const avg = catGames.length > 0 ? catGames.reduce((s, g) => s + g.score, 0) / catGames.length : 0;
    return { subject: cat.label, score: Math.round(avg), fullMark: 300 };
  });

  const recentGames = profile.gameHistory.slice(-20).map((g, i) => ({ game: i + 1, score: g.score }));

  const moodPerformance: Record<string, { total: number; count: number }> = {};
  profile.moodHistory.forEach(m => {
    const nearbyGames = profile.gameHistory.filter(g => {
      const gDate = new Date(g.date).getTime();
      const mDate = new Date(m.date).getTime();
      return Math.abs(gDate - mDate) < 3600000;
    });
    if (nearbyGames.length > 0) {
      if (!moodPerformance[m.mood]) moodPerformance[m.mood] = { total: 0, count: 0 };
      nearbyGames.forEach(g => {
        moodPerformance[m.mood].total += g.score;
        moodPerformance[m.mood].count += 1;
      });
    }
  });

  const moodBarData = Object.entries(moodPerformance).map(([mood, data]) => ({
    mood: mood.charAt(0).toUpperCase() + mood.slice(1),
    avg: Math.round(data.total / data.count),
    fill: 'hsl(18, 100%, 60%)',
  }));

  const dayScores: Record<string, { total: number; count: number }> = {};
  profile.gameHistory.forEach(g => {
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(g.date).getDay()];
    if (!dayScores[day]) dayScores[day] = { total: 0, count: 0 };
    dayScores[day].total += g.score;
    dayScores[day].count += 1;
  });

  const bestDay = Object.entries(dayScores).sort((a, b) => (b[1].total / b[1].count) - (a[1].total / a[1].count))[0];

  const xpPercent = (xpProgress / xpForNextLevel) * 100;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (xpPercent / 100) * circumference;

  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
  };

  return (
    <div className="max-w-md mx-auto px-5 py-6 pb-28 bg-background min-h-screen">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground mb-6 text-sm font-medium">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <h1 className="text-[28px] font-extrabold text-foreground mb-6">Progress</h1>

      {/* XP Ring */}
      <motion.div variants={item} initial="hidden" animate="show" className="flex flex-col items-center mb-6">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(40, 20%, 93%)" strokeWidth="8" />
            <motion.circle
              cx="60" cy="60" r="54" fill="none"
              stroke="hsl(18, 100%, 60%)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold tabular-nums text-foreground">{profile.xp}</span>
            <span className="text-xs text-muted-foreground font-medium">Total XP</span>
          </div>
        </div>
      </motion.div>

      {/* Brain Type */}
      <motion.div variants={item} initial="hidden" animate="show"
        className="bg-card rounded-3xl shadow-card p-5 mb-5 text-center"
      >
        <div className="text-4xl mb-2">🧠</div>
        <div className="font-extrabold text-lg text-foreground">{brainType.label}</div>
        <div className="text-sm text-muted-foreground">{brainType.description}</div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-card rounded-2xl p-4 shadow-card text-center">
          <div className="text-xs text-muted-foreground font-medium">Games Played</div>
          <div className="text-2xl font-extrabold tabular-nums text-foreground mt-1">{profile.gameHistory.length}</div>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-card text-center">
          <div className="text-xs text-muted-foreground font-medium">Duels Won</div>
          <div className="text-2xl font-extrabold tabular-nums text-success mt-1">{profile.duelRecord.wins}</div>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-card text-center">
          <div className="text-xs text-muted-foreground font-medium">Streak</div>
          <div className="text-2xl font-extrabold tabular-nums text-primary mt-1">🔥 {profile.streak}</div>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-card text-center">
          <div className="text-xs text-muted-foreground font-medium">Level</div>
          <div className="text-2xl font-extrabold tabular-nums text-foreground mt-1">{profile.level}</div>
        </div>
      </div>

      {/* Radar Chart */}
      <motion.div variants={item} initial="hidden" animate="show"
        className="bg-card rounded-3xl shadow-card p-5 mb-5"
      >
        <h2 className="font-bold text-sm mb-3 text-foreground">Skill Radar</h2>
        {profile.gameHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(40, 10%, 90%)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'hsl(220, 10%, 46%)' }} />
              <Radar dataKey="score" stroke="hsl(18, 100%, 60%)" fill="hsl(18, 100%, 60%)" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
            Play some games to see your skill radar!
          </div>
        )}
      </motion.div>

      {/* Score Trend */}
      <motion.div variants={item} initial="hidden" animate="show"
        className="bg-card rounded-3xl shadow-card p-5 mb-5"
      >
        <h2 className="font-bold text-sm mb-3 text-foreground">Recent Scores</h2>
        {recentGames.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={recentGames}>
              <XAxis dataKey="game" tick={{ fontSize: 10, fill: 'hsl(220, 10%, 46%)' }} stroke="hsl(40, 10%, 90%)" />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(220, 10%, 46%)' }} stroke="hsl(40, 10%, 90%)" />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid hsl(40, 10%, 92%)',
                  borderRadius: '12px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  color: 'hsl(235, 30%, 15%)',
                }}
              />
              <Line type="monotone" dataKey="score" stroke="hsl(18, 100%, 60%)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">No games yet</div>
        )}
      </motion.div>

      {/* Brain Weather */}
      {profile.moodHistory.length >= 7 && moodBarData.length > 0 && (
        <motion.div variants={item} initial="hidden" animate="show"
          className="bg-card rounded-3xl shadow-card p-5 mb-5"
        >
          <h2 className="font-bold text-sm mb-1 text-foreground">🌤️ Brain Weather</h2>
          <p className="text-xs text-muted-foreground mb-3">How mood affects your performance</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={moodBarData}>
              <XAxis dataKey="mood" tick={{ fontSize: 10, fill: 'hsl(220, 10%, 46%)' }} stroke="hsl(40, 10%, 90%)" />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(220, 10%, 46%)' }} stroke="hsl(40, 10%, 90%)" />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid hsl(40, 10%, 92%)',
                  borderRadius: '12px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  color: 'hsl(235, 30%, 15%)',
                }}
              />
              <Bar dataKey="avg" radius={[8, 8, 0, 0]}>
                {moodBarData.map((_, i) => (
                  <Cell key={i} fill="hsl(18, 100%, 60%)" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {bestDay && (
            <p className="text-xs text-muted-foreground mt-2 text-center italic">
              "You score {Math.round(((bestDay[1].total / bestDay[1].count) / (profile.gameHistory.reduce((s, g) => s + g.score, 0) / profile.gameHistory.length) - 1) * 100)}% higher on {bestDay[0]}s"
            </p>
          )}
        </motion.div>
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 shadow-elevated">
        <div className="max-w-md mx-auto flex justify-around py-3">
          <button onClick={() => navigate('/')} className="flex flex-col items-center gap-0.5 text-muted-foreground">
            <Home className="w-5 h-5" />
            <span className="text-[11px] font-semibold">Home</span>
          </button>
          <button onClick={() => navigate('/leaderboard')} className="flex flex-col items-center gap-0.5 text-muted-foreground">
            <Trophy className="w-5 h-5" />
            <span className="text-[11px] font-semibold">Rank</span>
          </button>
          <button onClick={() => navigate('/progress')} className="flex flex-col items-center gap-0.5 text-primary">
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
