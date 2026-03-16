import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { CATEGORIES, Category } from '@/lib/types';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

const CATEGORY_COLORS: Record<string, string> = {
  memory: 'hsl(225,80%,60%)', logic: 'hsl(35,90%,50%)', speed: 'hsl(350,80%,60%)',
  language: 'hsl(150,80%,40%)', spatial: 'hsl(270,70%,60%)', focus: 'hsl(190,90%,45%)',
};

export default function ProgressPage() {
  const navigate = useNavigate();
  const { profile } = useUserProfile();

  // Radar data
  const radarData = CATEGORIES.map(cat => {
    const catGames = profile.gameHistory.filter(h => {
      const catMap: Record<string, string[]> = {
        memory: ['simon-says', 'card-flip'],
        logic: ['number-matrix', 'pattern-puzzle'],
        speed: ['stroop', 'speed-math'],
        language: ['word-unscramble', 'word-chain'],
        spatial: ['mental-rotation', 'spot-difference'],
        focus: ['dual-n-back', 'focus-filter'],
      };
      return catMap[cat.id]?.includes(h.gameId);
    });
    const avg = catGames.length > 0 ? catGames.reduce((s, g) => s + g.score, 0) / catGames.length : 0;
    return { subject: cat.label, score: Math.round(avg), fullMark: 300 };
  });

  // Score over time (last 20 games)
  const recentGames = profile.gameHistory.slice(-20).map((g, i) => ({
    game: i + 1,
    score: g.score,
  }));

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-24">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground mb-4">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <h1 className="text-2xl font-extrabold mb-6">Progress</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-card rounded-2xl p-3 shadow-card text-center">
          <div className="text-xs text-muted-foreground">Games</div>
          <div className="text-xl font-extrabold tabular-nums">{profile.gameHistory.length}</div>
        </div>
        <div className="bg-card rounded-2xl p-3 shadow-card text-center">
          <div className="text-xs text-muted-foreground">Total XP</div>
          <div className="text-xl font-extrabold tabular-nums">{profile.xp}</div>
        </div>
        <div className="bg-card rounded-2xl p-3 shadow-card text-center">
          <div className="text-xs text-muted-foreground">Badges</div>
          <div className="text-xl font-extrabold tabular-nums">{profile.badges.length}</div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="bg-card rounded-3xl shadow-card p-4 mb-6">
        <h2 className="font-bold text-sm mb-2">Performance by Category</h2>
        {profile.gameHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
            Play some games to see your stats!
          </div>
        )}
      </div>

      {/* Score Trend */}
      <div className="bg-card rounded-3xl shadow-card p-4">
        <h2 className="font-bold text-sm mb-2">Recent Scores</h2>
        {recentGames.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={recentGames}>
              <XAxis dataKey="game" tick={{ fontSize: 10 }} stroke="hsl(var(--border))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--border))" />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            No games played yet
          </div>
        )}
      </div>
    </div>
  );
}
