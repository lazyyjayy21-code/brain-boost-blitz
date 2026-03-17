import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import GameHUD from '@/components/GameHUD';

interface Props {
  onAnswer: (correct: boolean) => void;
  onEnd: () => void;
  score: number; combo: number; correct: number; wrong: number;
}

export default function TimeWarpGame({ onAnswer, onEnd, score, combo, correct, wrong }: Props) {
  const [phase, setPhase] = useState<'waiting' | 'timing' | 'result'>('waiting');
  const [result, setResult] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [dotVisible, setDotVisible] = useState(false);
  const startRef = useRef(0);

  const startTiming = useCallback(() => {
    startRef.current = Date.now();
    setPhase('timing');
    setDotVisible(true);
    setResult(null);
  }, []);

  const stopTiming = useCallback(() => {
    if (phase !== 'timing') return;
    const elapsed = (Date.now() - startRef.current) / 1000;
    const diff = Math.abs(elapsed - 3);
    const isCorrect = diff < 0.5; // Within 500ms of 3 seconds

    setResult(elapsed);
    setPhase('result');
    setDotVisible(false);
    onAnswer(isCorrect);

    setTimeout(() => {
      if (round >= 8) { onEnd(); return; }
      setRound(r => r + 1);
      setPhase('waiting');
    }, 1500);
  }, [phase, round, onAnswer, onEnd]);

  // Pulsing dot animation
  const [dotScale, setDotScale] = useState(1);
  useEffect(() => {
    if (!dotVisible) return;
    const interval = setInterval(() => {
      setDotScale(s => s === 1 ? 1.2 : 1);
    }, 500);
    return () => clearInterval(interval);
  }, [dotVisible]);

  const getAccuracyLabel = (time: number) => {
    const diff = Math.abs(time - 3);
    if (diff < 0.1) return { text: 'PERFECT! 🎯', color: 'text-language' };
    if (diff < 0.3) return { text: 'Close!', color: 'text-speed' };
    if (diff < 0.5) return { text: 'Not bad', color: 'text-memory' };
    return { text: time < 3 ? 'Too early!' : 'Too late!', color: 'text-destructive' };
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <GameHUD score={score} combo={combo} correct={correct} wrong={wrong} categoryColor="speed" />

      <div className="text-center font-display">
        <h3 className="text-lg font-bold text-foreground mb-1">Tap at exactly 3 seconds</h3>
        <p className="text-sm text-muted-foreground">No timer. Trust your brain.</p>
      </div>

      <div className="relative w-64 h-64 flex items-center justify-center">
        {phase === 'waiting' && (
          <Button variant="game" size="xl" onClick={startTiming} className="rounded-full w-32 h-32 text-lg font-display">
            START
          </Button>
        )}

        {phase === 'timing' && (
          <motion.button
            onClick={stopTiming}
            animate={{ scale: dotScale }}
            transition={{ duration: 0.3 }}
            className="w-32 h-32 rounded-full bg-speed flex items-center justify-center text-2xl font-display font-bold text-white cursor-pointer"
            style={{ boxShadow: '0 0 40px hsl(25 95% 55% / 0.5)' }}
          >
            TAP
          </motion.button>
        )}

        {phase === 'result' && result !== null && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <div className="text-4xl font-display font-bold tabular-nums mb-2">
              {result.toFixed(2)}s
            </div>
            <div className={`text-lg font-display font-bold ${getAccuracyLabel(result).color}`}>
              {getAccuracyLabel(result).text}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {(Math.abs(result - 3) * 1000).toFixed(0)}ms off
            </div>
          </motion.div>
        )}
      </div>

      <div className="text-xs text-muted-foreground font-display">Round {round}/8</div>
    </div>
  );
}
