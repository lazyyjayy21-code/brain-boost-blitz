import { motion } from 'framer-motion';
import { GameResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { Swords } from 'lucide-react';

interface Props {
  result: GameResult;
  highScore: number;
  duelResult?: 'win' | 'loss' | 'draw';
  duelOpponent?: { name: string; score: number };
  onPlayAgain: () => void;
  onBrainCard: () => void;
  onExit: () => void;
  categoryColor: string;
}

export default function ScoreSummary({ result, highScore, duelResult, duelOpponent, onPlayAgain, onBrainCard, onExit, categoryColor }: Props) {
  const isNewHigh = result.score > highScore;

  useEffect(() => {
    if (isNewHigh || duelResult === 'win') {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  }, [isNewHigh, duelResult]);

  const timeStr = `${Math.floor(result.timeTaken / 1000)}s`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-5 p-6 w-full max-w-sm"
    >
      {/* Duel Result */}
      {duelResult && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 10 }}
          className={`text-center mb-2 ${
            duelResult === 'win' ? 'text-language' : duelResult === 'loss' ? 'text-destructive' : 'text-muted-foreground'
          }`}
        >
          <div className="text-4xl font-display font-bold">
            {duelResult === 'win' ? '🏆 VICTORY!' : duelResult === 'loss' ? '💀 DEFEATED' : '🤝 DRAW'}
          </div>
          {duelOpponent && (
            <div className="text-sm mt-1">
              You: {result.score} vs {duelOpponent.name}: {duelOpponent.score}
            </div>
          )}
        </motion.div>
      )}

      <h2 className="text-2xl font-display font-bold tracking-tight">Session Complete</h2>

      {isNewHigh && !duelResult && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5 }}
          className="text-lg font-display font-bold text-speed"
        >
          🏆 New High Score!
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-3 w-full">
        <StatCard label="Score" value={result.score.toString()} />
        <StatCard label="Accuracy" value={`${result.accuracy}%`} />
        <StatCard label="Best Combo" value={`x${result.bestCombo}`} />
        <StatCard label="Time" value={timeStr} />
      </div>

      <div className="flex flex-col gap-2 w-full">
        {/* Brain Card button */}
        <Button
          size="xl"
          onClick={onBrainCard}
          className="w-full font-display"
          style={{
            background: 'linear-gradient(135deg, hsl(270,80%,50%), hsl(220,90%,50%))',
          }}
        >
          🧠 View Brain Card
        </Button>

        <div className="flex gap-2 w-full">
          <Button variant="game" size="xl" onClick={onPlayAgain} className="flex-1 font-display">
            Play Again
          </Button>
          <Button variant="outline" size="xl" onClick={onExit} className="flex-1 font-display">
            Home
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-card text-center">
      <div className="text-xs font-display font-medium text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-display font-bold tabular-nums mt-1">{value}</div>
    </div>
  );
}
