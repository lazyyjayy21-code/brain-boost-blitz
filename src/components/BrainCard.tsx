import { motion } from 'framer-motion';
import { GameResult, GAMES, CATEGORIES, BRAIN_TYPES } from '@/lib/types';
import { useUserProfile } from '@/hooks/useUserProfile';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2 } from 'lucide-react';

interface Props {
  result: GameResult;
  brainType: string;
  onBack: () => void;
}

export default function BrainCard({ result, brainType, onBack }: Props) {
  const { profile } = useUserProfile();
  const game = GAMES.find(g => g.id === result.gameId);
  const bt = BRAIN_TYPES[brainType] || BRAIN_TYPES.strategist;

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
    // Boost current game's category
    const boost = game && game.category === cat.id ? result.score * 0.3 : 0;
    return { subject: cat.label, score: Math.round(avg + boost), fullMark: 300 };
  });

  const latestMood = profile.moodHistory[profile.moodHistory.length - 1];

  const handleShare = () => {
    const text = `🧠 NeuroBattle Brain Card\n${bt.label} | Score: ${result.score} | Accuracy: ${result.accuracy}%\nPlay at neurobattle.app`;
    if (navigator.share) {
      navigator.share({ title: 'My NeuroBattle Brain Card', text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
      <button onClick={onBack} className="self-start flex items-center gap-2 text-muted-foreground text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to summary
      </button>

      {/* Brain Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="w-full rounded-3xl p-6 glass overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg, hsl(225,30%,10%) 0%, hsl(270,20%,8%) 50%, hsl(225,25%,6%) 100%)',
          boxShadow: '0 0 60px hsl(270 80% 65% / 0.2), 0 0 30px hsl(220 90% 60% / 0.1)',
        }}
      >
        {/* Decorative glow circles */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, hsl(270,80%,65%), transparent)' }}
        />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, hsl(220,90%,60%), transparent)' }}
        />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-display text-muted-foreground uppercase tracking-widest">NeuroBattle</div>
              <div className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</div>
            </div>
            {latestMood && <span className="text-2xl">{latestMood.emoji}</span>}
          </div>

          {/* Brain Type */}
          <div className="text-center mb-4">
            <div className="text-3xl mb-1">🧠</div>
            <div className="font-display font-bold text-xl text-memory">{bt.label}</div>
            <div className="text-xs text-muted-foreground">{bt.description}</div>
          </div>

          {/* Radar Chart */}
          <div className="mx-auto" style={{ width: '100%', maxWidth: 250 }}>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(225,20%,25%)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: 'hsl(215,20%,55%)' }} />
                <Radar
                  dataKey="score"
                  stroke="hsl(270,80%,65%)"
                  fill="hsl(270,80%,65%)"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="text-center">
              <div className="text-xl font-display font-bold text-speed tabular-nums">{result.score}</div>
              <div className="text-[10px] text-muted-foreground font-display uppercase">Score</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-display font-bold text-language tabular-nums">{result.accuracy}%</div>
              <div className="text-[10px] text-muted-foreground font-display uppercase">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-display font-bold text-emotional tabular-nums">x{result.bestCombo}</div>
              <div className="text-[10px] text-muted-foreground font-display uppercase">Best Combo</div>
            </div>
          </div>

          {/* AI Insight */}
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground italic">
              "Your {game?.category || 'cognitive'} skills are in the top {Math.floor(Math.random() * 20 + 5)}% today"
            </p>
          </div>
        </div>
      </motion.div>

      {/* Share Button */}
      <Button
        variant="game"
        size="xl"
        onClick={handleShare}
        className="w-full"
        style={{
          background: 'linear-gradient(135deg, hsl(270,80%,50%), hsl(220,90%,50%))',
        }}
      >
        <Share2 className="w-5 h-5 mr-2" /> Share Brain Card
      </Button>
    </div>
  );
}
