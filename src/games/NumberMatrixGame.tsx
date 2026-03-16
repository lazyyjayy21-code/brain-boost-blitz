import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import GameHUD from '@/components/GameHUD';

interface Props {
  onAnswer: (correct: boolean) => void;
  onEnd: () => void;
  score: number; combo: number; correct: number; wrong: number;
}

export default function NumberMatrixGame({ onAnswer, onEnd, score, combo, correct, wrong }: Props) {
  const [phase, setPhase] = useState<'memorize' | 'recall'>('memorize');
  const [grid, setGrid] = useState<number[]>([]);
  const [hiddenIdx, setHiddenIdx] = useState(-1);
  const [options, setOptions] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const maxRounds = 8;

  const generate = useCallback(() => {
    const nums = Array.from({ length: 9 }, () => Math.floor(Math.random() * 9) + 1);
    setGrid(nums);
    setPhase('memorize');
    setTimeout(() => {
      const idx = Math.floor(Math.random() * 9);
      setHiddenIdx(idx);
      const correct = nums[idx];
      const opts = new Set([correct]);
      while (opts.size < 4) opts.add(Math.floor(Math.random() * 9) + 1);
      setOptions([...opts].sort(() => Math.random() - 0.5));
      setPhase('recall');
    }, 3000);
  }, []);

  useEffect(() => { generate(); }, [generate]);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => { if (prev <= 1) { onEnd(); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [onEnd]);

  const handleAnswer = (val: number) => {
    onAnswer(val === grid[hiddenIdx]);
    if (round + 1 >= maxRounds) { onEnd(); return; }
    setRound(r => r + 1);
    generate();
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <GameHUD score={score} combo={combo} timeLeft={timeLeft} correct={correct} wrong={wrong} categoryColor="logic" />
      
      <div className="text-sm text-muted-foreground font-medium">
        {phase === 'memorize' ? 'Memorize the numbers...' : 'Which number is missing?'}
      </div>

      <div className="grid grid-cols-3 gap-2 w-full max-w-[240px]">
        {grid.map((n, i) => (
          <motion.div key={i}
            className="aspect-square rounded-2xl bg-card shadow-card flex items-center justify-center text-2xl font-black tabular-nums"
          >
            {phase === 'recall' && i === hiddenIdx ? '?' : n}
          </motion.div>
        ))}
      </div>

      {phase === 'recall' && (
        <div className="grid grid-cols-4 gap-2 w-full max-w-[280px]">
          {options.map(opt => (
            <motion.button key={opt} whileTap={{ scale: 0.95 }}
              onClick={() => handleAnswer(opt)}
              className="h-12 rounded-2xl bg-card shadow-card font-bold text-lg tabular-nums"
            >
              {opt}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
