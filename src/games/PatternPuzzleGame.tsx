import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import GameHUD from '@/components/GameHUD';

interface Props {
  onAnswer: (correct: boolean) => void;
  onEnd: () => void;
  score: number; combo: number; correct: number; wrong: number;
}

const SHAPES = ['◼', '●', '▲', '◆'];
const SHAPE_COLORS = ['hsl(225,80%,60%)', 'hsl(350,80%,60%)', 'hsl(150,80%,40%)', 'hsl(45,90%,50%)'];

export default function PatternPuzzleGame({ onAnswer, onEnd, score, combo, correct, wrong }: Props) {
  const [pattern, setPattern] = useState<number[]>([]);
  const [missingIdx, setMissingIdx] = useState(8);
  const [options, setOptions] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const maxRounds = 10;

  const generate = useCallback(() => {
    // Simple repeating pattern
    const base = Math.floor(Math.random() * 4);
    const step = Math.floor(Math.random() * 3) + 1;
    const pat = Array.from({ length: 9 }, (_, i) => (base + i * step) % 4);
    const idx = Math.floor(Math.random() * 9);
    setPattern(pat);
    setMissingIdx(idx);
    const correct = pat[idx];
    const opts = new Set([correct]);
    while (opts.size < 4) opts.add(Math.floor(Math.random() * 4));
    setOptions([...opts].sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => { generate(); }, [generate]);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => { if (prev <= 1) { onEnd(); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [onEnd]);

  const handleAnswer = (val: number) => {
    onAnswer(val === pattern[missingIdx]);
    if (round + 1 >= maxRounds) { onEnd(); return; }
    setRound(r => r + 1);
    generate();
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <GameHUD score={score} combo={combo} timeLeft={timeLeft} correct={correct} wrong={wrong} categoryColor="logic" />
      <div className="text-sm text-muted-foreground font-medium">Complete the pattern</div>
      <div className="grid grid-cols-3 gap-2 w-full max-w-[240px]">
        {pattern.map((s, i) => (
          <div key={i} className="aspect-square rounded-2xl bg-card shadow-card flex items-center justify-center text-3xl"
            style={{ color: i === missingIdx ? 'transparent' : SHAPE_COLORS[s] }}
          >
            {i === missingIdx ? '?' : SHAPES[s]}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2 w-full max-w-[280px]">
        {options.map(opt => (
          <motion.button key={opt} whileTap={{ scale: 0.95 }}
            onClick={() => handleAnswer(opt)}
            className="h-14 rounded-2xl bg-card shadow-card flex items-center justify-center text-2xl"
            style={{ color: SHAPE_COLORS[opt] }}
          >
            {SHAPES[opt]}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
