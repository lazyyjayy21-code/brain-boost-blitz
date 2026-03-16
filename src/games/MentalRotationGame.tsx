import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import GameHUD from '@/components/GameHUD';

interface Props {
  onAnswer: (correct: boolean) => void;
  onEnd: () => void;
  score: number; combo: number; correct: number; wrong: number;
}

// SVG shapes at different rotations
const SHAPES = [
  // L shape
  'M0,0 L40,0 L40,15 L15,15 L15,40 L0,40 Z',
  // T shape
  'M0,0 L40,0 L40,15 L25,15 L25,40 L15,40 L15,15 L0,15 Z',
  // Z shape
  'M0,0 L25,0 L25,15 L40,15 L40,40 L15,40 L15,25 L0,25 Z',
];

export default function MentalRotationGame({ onAnswer, onEnd, score, combo, correct, wrong }: Props) {
  const [timeLeft, setTimeLeft] = useState(45);
  const [round, setRound] = useState(0);
  const [targetShape, setTargetShape] = useState(0);
  const [targetRotation, setTargetRotation] = useState(0);
  const [options, setOptions] = useState<{ shape: number; rotation: number }[]>([]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const maxRounds = 10;

  const generate = useCallback(() => {
    const shape = Math.floor(Math.random() * SHAPES.length);
    const rot = Math.floor(Math.random() * 4) * 90;
    setTargetShape(shape);
    setTargetRotation(0);

    const answerRot = (Math.floor(Math.random() * 3) + 1) * 90;
    const opts: { shape: number; rotation: number }[] = [];
    
    // Add correct answer (same shape, different rotation)
    const ci = Math.floor(Math.random() * 4);
    for (let i = 0; i < 4; i++) {
      if (i === ci) {
        opts.push({ shape, rotation: answerRot });
      } else {
        const wrongShape = (shape + Math.floor(Math.random() * (SHAPES.length - 1)) + 1) % SHAPES.length;
        opts.push({ shape: wrongShape, rotation: Math.floor(Math.random() * 4) * 90 });
      }
    }
    setOptions(opts);
    setCorrectIdx(ci);
  }, []);

  useEffect(() => { generate(); }, [generate]);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => { if (prev <= 1) { onEnd(); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [onEnd]);

  const handleAnswer = (idx: number) => {
    onAnswer(idx === correctIdx);
    if (round + 1 >= maxRounds) { onEnd(); return; }
    setRound(r => r + 1);
    generate();
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <GameHUD score={score} combo={combo} timeLeft={timeLeft} correct={correct} wrong={wrong} categoryColor="spatial" />
      <div className="text-sm text-muted-foreground font-medium">Which shape matches when rotated?</div>

      <div className="p-6 rounded-3xl bg-card shadow-card">
        <svg width="80" height="80" viewBox="0 0 40 40">
          <path d={SHAPES[targetShape]} fill="hsl(270, 70%, 60%)" transform={`rotate(${targetRotation}, 20, 20)`} />
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-[240px]">
        {options.map((opt, i) => (
          <motion.button key={i} whileTap={{ scale: 0.95 }}
            onClick={() => handleAnswer(i)}
            className="aspect-square rounded-2xl bg-card shadow-card flex items-center justify-center"
          >
            <svg width="60" height="60" viewBox="0 0 40 40">
              <path d={SHAPES[opt.shape]} fill="hsl(270, 70%, 60%)" transform={`rotate(${opt.rotation}, 20, 20)`} />
            </svg>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
