import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import GameHUD from '@/components/GameHUD';

const PAD_COLORS = [
  'hsl(225, 80%, 60%)',
  'hsl(350, 80%, 60%)',
  'hsl(150, 80%, 40%)',
  'hsl(45, 90%, 50%)',
];

interface Props {
  onAnswer: (correct: boolean) => void;
  onEnd: () => void;
  score: number;
  combo: number;
  correct: number;
  wrong: number;
}

export default function SimonSaysGame({ onAnswer, onEnd, score, combo, correct, wrong }: Props) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);

  const showSequence = useCallback(async (seq: number[]) => {
    setIsShowingSequence(true);
    for (let i = 0; i < seq.length; i++) {
      await new Promise(r => setTimeout(r, 400));
      setActiveIdx(seq[i]);
      await new Promise(r => setTimeout(r, 500));
      setActiveIdx(null);
    }
    await new Promise(r => setTimeout(r, 200));
    setIsShowingSequence(false);
  }, []);

  const startRound = useCallback((lvl: number) => {
    const seq: number[] = [];
    for (let i = 0; i < lvl + 2; i++) {
      seq.push(Math.floor(Math.random() * 4));
    }
    setSequence(seq);
    setUserInput([]);
    showSequence(seq);
  }, [showSequence]);

  useEffect(() => { startRound(1); }, [startRound]);

  const handlePad = (idx: number) => {
    if (isShowingSequence) return;

    const newInput = [...userInput, idx];
    setUserInput(newInput);
    setActiveIdx(idx);
    setTimeout(() => setActiveIdx(null), 150);

    const step = newInput.length - 1;
    if (newInput[step] !== sequence[step]) {
      onAnswer(false);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) { onEnd(); return; }
      setUserInput([]);
      showSequence(sequence);
      return;
    }

    if (newInput.length === sequence.length) {
      onAnswer(true);
      const nextLevel = level + 1;
      setLevel(nextLevel);
      setTimeout(() => startRound(nextLevel), 800);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <GameHUD score={score} combo={combo} correct={correct} wrong={wrong} categoryColor="memory" />
      
      <div className="text-sm font-semibold text-muted-foreground">
        Level {level} • {'❤️'.repeat(lives)}
      </div>

      {isShowingSequence && (
        <div className="text-sm text-muted-foreground font-medium animate-pulse">Watch the sequence...</div>
      )}

      <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
        {PAD_COLORS.map((color, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePad(i)}
            disabled={isShowingSequence}
            className="aspect-square rounded-3xl transition-all duration-150 shadow-card"
            style={{
              backgroundColor: color,
              opacity: activeIdx === i ? 1 : 0.5,
              transform: activeIdx === i ? 'scale(1.05)' : 'scale(1)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
