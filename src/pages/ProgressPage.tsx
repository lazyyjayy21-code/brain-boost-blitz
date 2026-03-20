import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Trophy, BarChart3 } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { CATEGORIES, BRAIN_TYPES } from '@/lib/types';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';

export default function ProgressPage() {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
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

  const recentGames = profile.gameHistory.slice(-20).map((g, i) => ({
    game: i + 1,
    score: g.score,
  }));

  // Mood vs Performance (Brain Weather)
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

  const moodColors: Record<string, string> = {
    tired: 'hsl(215,20%,55%)',
    anxious: 'hsl(25,95%,55%)',
    calm: 'hsl(220,90%,60%)',
    happy: 'hsl(150,80%,45%)',
    'fired-up': 'hsl(340,80%,60%)',
    competitive: 'hsl(25,95%,55%)',
  };

  const moodBarData = Object.entries(moodPerformance).map(([mood, data]) => ({
    mood: mood.charAt(0).toUpperCase() + mood.slice(1),
    avg: Math.round(data.total / data.count),
    fill: moodColors[mood] || 'hsl(270,80%,65%)',
  }));

  // Day-of-week insights
  const dayScores: Record<string, { total: number; count: number }> = {};
  profile.gameHistory.forEach(g => {
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(g.date).getDay()];
    if (!dayScores[day]) dayScores[day] = { total: 0, count: 0 };
    dayScores[day].total += g.score;
    dayScores[day].count += 1;
  });

  const bestDay = Object.entries(dayScores).sort((a, b) => (b[1].total / b[1].count) - (a[1].total / a[1].count))[0];

  const item = {
    hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-24">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground mb-4">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <h1 className="text-2xl font-display font-bold mb-6">Progress</h1>

      {/* Brain Type Card */}
      <motion.div
        variants={item} initial="hidden" animate="show"
        className="bg-card rounded-3xl shadow-card p-5 mb-6 text-center"
        style={{ boxShadow: '0 0 30px hsl(270 80% 65% / 0.15)' }}
      >
        <div className="text-4xl mb-2">🧠</div>
        <div className="font-display font-bold text-lg text-memory">{brainType.label}</div>
        <div className="text-sm text-muted-foreground">{brainType.description}</div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-card rounded-2xl p-3 shadow-card text-center">
          <div className="text-xs text-muted-foreground font-display">Games</div>
          <div className="text-xl font-display font-bold tabular-nums">{profile.gameHistory.length}</div>
        </div>
        <div className="bg-card rounded-2xl p-3 shadow-card text-center">
          <div className="text-xs text-muted-foreground font-display">Total XP</div>
          <div className="text-xl font-display font-bold tabular-nums">{profile.xp}</div>
        </div>
        <div className="bg-card rounded-2xl p-3 shadow-card text-center">
          <div className="text-xs text-muted-foreground font-display">Duels Won</div>
          <div className="text-xl font-display font-bold tabular-nums text-language">{profile.duelRecord.wins}</div>
        </div>
      </div>

      {/* Radar Chart */}
      <motion.div variants={item} initial="hidden" animate="show"
        className="bg-card rounded-3xl shadow-card p-4 mb-6"
        style={{ boxShadow: '0 0 20px hsl(220 90% 60% / 0.1)' }}
      >
        <h2 className="font-display font-bold text-sm mb-2">Brain Radar</h2>
        {profile.gameHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(225,20%,25%)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'hsl(215,20%,55%)' }} />
              <Radar dataKey="score" stroke="hsl(270,80%,65%)" fill="hsl(270,80%,65%)" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm font-display">
            Play some games to see your brain radar!
          </div>
        )}
      </motion.div>

      {/* Score Trend */}
      <motion.div variants={item} initial="hidden" animate="show"
        className="bg-card rounded-3xl shadow-card p-4 mb-6"
      >
        <h2 className="font-display font-bold text-sm mb-2">Recent Scores</h2>
        {recentGames.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={recentGames}>
              <XAxis dataKey="game" tick={{ fontSize: 10 }} stroke="hsl(225,20%,25%)" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(225,20%,25%)" />
              <Tooltip
                contentStyle={{
                  background: 'hsl(225,25%,12%)',
                  border: '1px solid hsl(225,20%,20%)',
                  borderRadius: '12px',
                  color: 'hsl(210,40%,92%)',
                }}
              />
              <Line type="monotone" dataKey="score" stroke="hsl(220,90%,60%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm font-display">
            No games played yet
          </div>
        )}
      </motion.div>

      {/* Brain Weather — Mood vs Performance */}
      {profile.moodHistory.length >= 7 && moodBarData.length > 0 && (
        <motion.div variants={item} initial="hidden" animate="show"
          className="bg-card rounded-3xl shadow-card p-4 mb-6"
          style={{ boxShadow: '0 0 20px hsl(340 80% 60% / 0.1)' }}
        >
          <h2 className="font-display font-bold text-sm mb-1">🌤️ Brain Weather</h2>
          <p className="text-xs text-muted-foreground mb-3">How your mood affects your performance</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={moodBarData}>
              <XAxis dataKey="mood" tick={{ fontSize: 10, fill: 'hsl(215,20%,55%)' }} stroke="hsl(225,20%,25%)" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(225,20%,25%)" />
              <Tooltip
                contentStyle={{
                  background: 'hsl(225,25%,12%)',
                  border: '1px solid hsl(225,20%,20%)',
                  borderRadius: '12px',
                  color: 'hsl(210,40%,92%)',
                }}
              />
              <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                {moodBarData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
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

      {/* Mood vs Performance (basic bars for < 7 days) */}
      {profile.moodHistory.length < 7 && Object.keys(moodPerformance).length > 0 && (
        <motion.div variants={item} initial="hidden" animate="show"
          className="bg-card rounded-3xl shadow-card p-4"
        >
          <h2 className="font-display font-bold text-sm mb-3">Mood vs Performance</h2>
          <div className="flex flex-col gap-2">
            {Object.entries(moodPerformance).map(([mood, data]) => (
              <div key={mood} className="flex items-center gap-3">
                <span className="text-sm font-display font-medium w-24 capitalize">{mood}</span>
                <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emotional"
                    style={{ width: `${Math.min((data.total / data.count) / 3, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-display tabular-nums text-muted-foreground">
                  {Math.round(data.total / data.count)} avg
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center italic">
            Check in {7 - profile.moodHistory.length} more times to unlock Brain Weather insights
          </p>
        </motion.div>
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-border/50">
        <div className="max-w-md mx-auto flex justify-around py-3">
          <button onClick={() => navigate('/')} className="flex flex-col items-center gap-0.5 text-muted-foreground">
            <Zap className="w-5 h-5" />
            <span className="text-xs font-display font-semibold">Home</span>
          </button>
          <button onClick={() => navigate('/leaderboard')} className="flex flex-col items-center gap-0.5 text-muted-foreground">
            <Trophy className="w-5 h-5" />
            <span className="text-xs font-display font-semibold">Rank</span>
          </button>
          <button onClick={() => navigate('/progress')} className="flex flex-col items-center gap-0.5 text-primary">
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs font-display font-semibold">Stats</span>
          </button>
        </div>
      </div>
    </div>
  );
}
