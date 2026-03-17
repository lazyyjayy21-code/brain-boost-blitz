import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { CATEGORIES, BRAIN_TYPES } from '@/lib/types';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

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

  // Mood insights
  const moodPerformance: Record<string, { total: number; count: number }> = {};
  profile.moodHistory.forEach((m, i) => {
    const nearbyGames = profile.gameHistory.filter(g => {
      const gDate = new Date(g.date).getTime();
      const mDate = new Date(m.date).getTime();
      return Math.abs(gDate - mDate) < 3600000; // within 1 hour
    });
    if (nearbyGames.length > 0) {
      if (!moodPerformance[m.mood]) moodPerformance[m.mood] = { total: 0, count: 0 };
      nearbyGames.forEach(g => {
        moodPerformance[m.mood].total += g.score;
        moodPerformance[m.mood].count += 1;
      });
    }
  });

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-24">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground mb-4">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <h1 className="text-2xl font-display font-bold mb-6">Progress</h1>

      {/* Brain Type Card */}
      <div className="bg-card rounded-3xl shadow-card p-5 mb-6 text-center"
        style={{ boxShadow: '0 0 30px hsl(270 80% 65% / 0.15)' }}
      >
        <div className="text-4xl mb-2">🧠</div>
        <div className="font-display font-bold text-lg text-memory">{brainType.label}</div>
        <div className="text-sm text-muted-foreground">{brainType.description}</div>
      </div>

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

      {/* Radar Chart - Brain Card Style */}
      <div className="bg-card rounded-3xl shadow-card p-4 mb-6"
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
      </div>

      {/* Score Trend */}
      <div className="bg-card rounded-3xl shadow-card p-4 mb-6">
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
      </div>

      {/* Mood vs Performance */}
      {Object.keys(moodPerformance).length > 0 && (
        <div className="bg-card rounded-3xl shadow-card p-4">
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
        </div>
      )}
    </div>
  );
}
