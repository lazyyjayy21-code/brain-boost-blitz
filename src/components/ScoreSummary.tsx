import { motion } from 'framer-motion';
import { GameResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

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

export default function ScoreSummary({ result, highScore, duelResult, duelOpponent, onPlayAgain, onBrainCard, onExit }: Props) {
  const isNewHigh = result.score > highScore;

  useEffect(() => {
    if (isNewHigh || duelResult === 'win') {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#FF6B35', '#FFB800', '#22C55E'] });
    }
  }, [isNewHigh, duelResult]);

  const timeStr = `${Math.floor(result.timeTaken / 1000)}s`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-5 p-6 w-full max-w-sm"
    >
      {duelResult && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 10 }}
          className="text-center mb-2"
        >
          <div className={`text-3xl font-extrabold ${
            duelResult === 'win' ? 'text-success' : duelResult === 'loss' ? 'text-destructive' : 'text-muted-foreground'
          }`}>
            {duelResult === 'win' ? '🏆 Victory!' : duelResult === 'loss' ? 'Defeated' : '🤝 Draw'}
          </div>
          {duelOpponent && (
            <div className="text-sm text-muted-foreground mt-1">
              You: {result.score} vs {duelOpponent.name}: {duelOpponent.score}
            </div>
          )}
        </motion.div>
      )}

      <h2 className="text-2xl font-extrabold text-foreground">Session Complete</h2>

      {isNewHigh && !duelResult && (
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5 }}
          className="text-lg font-extrabold text-primary"
        >
          🏆 New High Score!
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-3 w-full">
        <StatCard label="Score" value={result.score.toString()} highlight />
        <StatCard label="Accuracy" value={`${result.accuracy}%`} />
        <StatCard label="Best Combo" value={`x${result.bestCombo}`} />
        <StatCard label="Time" value={timeStr} />
      </div>

      <div className="flex flex-col gap-2 w-full">
        <Button
          size="xl"
          onClick={onBrainCard}
          className="w-full font-bold rounded-full"
          style={{ background: 'linear-gradient(135deg, hsl(18,100%,60%), hsl(18,100%,50%))' }}
        >
          🧠 View Brain Card
        </Button>
        <div className="flex gap-2 w-full">
          <Button variant="game" size="xl" onClick={onPlayAgain} className="flex-1 font-bold">
            Play Again
          </Button>
          <Button variant="outline" size="xl" onClick={onExit} className="flex-1 font-bold">
            Home
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-card text-center">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={`text-2xl font-extrabold tabular-nums mt-1 ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</div>
    </div>
  );
}
