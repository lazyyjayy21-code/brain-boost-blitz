import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GameResult, GAMES, CATEGORIES, BRAIN_TYPES } from '@/lib/types';
import { useUserProfile } from '@/hooks/useUserProfile';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface Props {
  result: GameResult;
  brainType: string;
  onBack: () => void;
}

export default function BrainCard({ result, brainType, onBack }: Props) {
  const { profile } = useUserProfile();
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
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
    const boost = game && game.category === cat.id ? result.score * 0.3 : 0;
    return { subject: cat.label, score: Math.round(avg + boost), fullMark: 300 };
  });

  const latestMood = profile.moodHistory[profile.moodHistory.length - 1];
  const catLabel = game?.category || 'cognitive';
  const percentile = Math.floor(Math.random() * 20 + 5);
  const insight = `Your ${catLabel} skills are in the top ${percentile}% today`;

  const handleExport = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#FFFFFF',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const dataUrl = canvas.toDataURL('image/png');
      if (navigator.share && navigator.canShare) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'neurobattle-braincard.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'My NeuroBattle Brain Card' });
        } else {
          downloadImage(dataUrl);
        }
      } else {
        downloadImage(dataUrl);
      }
    } catch {
      const text = `🧠 NeuroBattle Brain Card\n${bt.label} | Score: ${result.score} | Accuracy: ${result.accuracy}%`;
      if (navigator.share) {
        navigator.share({ title: 'My NeuroBattle Brain Card', text });
      } else {
        navigator.clipboard.writeText(text);
      }
    }
    setExporting(false);
  };

  const downloadImage = (dataUrl: string) => {
    const link = document.createElement('a');
    link.download = 'neurobattle-braincard.png';
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
      <button onClick={onBack} className="self-start flex items-center gap-2 text-muted-foreground text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to summary
      </button>

      <motion.div
        ref={cardRef}
        initial={{ scale: 0.9, opacity: 0, rotateY: 90 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full rounded-3xl p-6 overflow-hidden relative bg-card shadow-elevated"
        style={{
          background: 'linear-gradient(160deg, hsl(40, 30%, 99%) 0%, hsl(18, 60%, 97%) 50%, hsl(40, 30%, 99%) 100%)',
        }}
      >
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.15em] text-primary">Neuro<span className="text-foreground">Battle</span></div>
              <div className="text-[10px] text-muted-foreground">{new Date().toLocaleDateString()}</div>
            </div>
            {latestMood && <span className="text-2xl">{latestMood.emoji}</span>}
          </div>

          {/* Brain Type */}
          <div className="text-center mb-4">
            <div className="text-3xl mb-1">🧠</div>
            <div className="font-extrabold text-xl text-foreground">{bt.label}</div>
            <div className="text-xs text-muted-foreground">{bt.description}</div>
          </div>

          {/* Radar Chart */}
          <div className="mx-auto" style={{ width: '100%', maxWidth: 250 }}>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(40, 10%, 88%)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: 'hsl(220, 10%, 46%)' }} />
                <Radar
                  dataKey="score"
                  stroke="hsl(18, 100%, 60%)"
                  fill="hsl(18, 100%, 60%)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center">
              <div className="text-xl font-extrabold tabular-nums text-primary">{result.score}</div>
              <div className="text-[10px] font-medium uppercase text-muted-foreground">Score</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-extrabold tabular-nums text-success">{result.accuracy}%</div>
              <div className="text-[10px] font-medium uppercase text-muted-foreground">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-extrabold tabular-nums text-gold">x{result.bestCombo}</div>
              <div className="text-[10px] font-medium uppercase text-muted-foreground">Best Combo</div>
            </div>
          </div>

          {/* Insight */}
          <div className="mt-4 text-center">
            <p className="text-xs italic text-muted-foreground">"{insight}"</p>
          </div>
        </div>
      </motion.div>

      <Button
        size="xl"
        onClick={handleExport}
        disabled={exporting}
        className="w-full font-bold rounded-full"
        style={{ background: 'linear-gradient(135deg, hsl(18,100%,60%), hsl(18,100%,50%))' }}
      >
        {exporting ? (
          <span className="animate-pulse">Exporting...</span>
        ) : (
          <>
            <Share2 className="w-5 h-5 mr-2" /> Share Brain Card
          </>
        )}
      </Button>
    </div>
  );
}
