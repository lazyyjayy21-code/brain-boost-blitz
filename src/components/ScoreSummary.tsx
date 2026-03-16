import { motion } from 'framer-motion';
import { GameResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface Props {
  result: GameResult;
  highScore: number;
  onPlayAgain: () => void;
  onExit: () => void;
  categoryColor: string;
}

export default function ScoreSummary({ result, highScore, onPlayAgain, onExit, categoryColor }: Props) {
  const isNewHigh = result.score > highScore;

  useEffect(() => {
    if (isNewHigh) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }, [isNewHigh]);

  const timeStr = `${Math.floor(result.timeTaken / 1000)}s`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6 p-6"
    >
      <h2 className="text-2xl font-extrabold tracking-tight">Session Complete</h2>
      
      {isNewHigh && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5 }}
          className="text-lg font-bold text-logic"
        >
          🏆 New High Score!
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-4 w-full">
        <StatCard label="Score" value={result.score.toString()} />
        <StatCard label="Accuracy" value={`${result.accuracy}%`} />
        <StatCard label="Best Combo" value={`x${result.bestCombo}`} />
        <StatCard label="Time" value={timeStr} />
      </div>

      <div className="flex gap-3 w-full">
        <Button variant="game" size="xl" onClick={onPlayAgain} className="flex-1">
          Play Again
        </Button>
        <Button variant="outline" size="xl" onClick={onExit} className="flex-1">
          Home
        </Button>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-card text-center">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-extrabold tabular-nums mt-1">{value}</div>
    </div>
  );
}
