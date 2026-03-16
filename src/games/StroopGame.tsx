import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import GameHUD from '@/components/GameHUD';

const COLORS = [
  { name: 'Red', hsl: 'hsl(350, 80%, 60%)' },
  { name: 'Blue', hsl: 'hsl(225, 80%, 60%)' },
  { name: 'Green', hsl: 'hsl(150, 80%, 40%)' },
  { name: 'Yellow', hsl: 'hsl(45, 90%, 50%)' },
];

interface Props {
  onAnswer: (correct: boolean) => void;
  onEnd: () => void;
  score: number;
  combo: number;
  correct: number;
  wrong: number;
}

export default function StroopGame({ onAnswer, onEnd, score, combo, correct, wrong }: Props) {
  const [round, setRound] = useState(0);
  const [wordColor, setWordColor] = useState(COLORS[0]);
  const [displayColor, setDisplayColor] = useState(COLORS[1]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);

  const maxRounds = 20;

  const generateRound = useCallback(() => {
    const word = COLORS[Math.floor(Math.random() * COLORS.length)];
    let color: typeof COLORS[0];
    do {
      color = COLORS[Math.floor(Math.random() * COLORS.length)];
    } while (Math.random() > 0.3 && color.name === word.name); // Sometimes match
    setWordColor(word);
    setDisplayColor(color);
  }, []);

  useEffect(() => { generateRound(); }, [generateRound]);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { onEnd(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [onEnd]);

  const handleAnswer = (selectedColor: typeof COLORS[0]) => {
    const isCorrect = selectedColor.name === displayColor.name;
    setFlash(isCorrect ? 'correct' : 'wrong');
    onAnswer(isCorrect);
    setTimeout(() => setFlash(null), 200);

    if (round + 1 >= maxRounds) {
      onEnd();
    } else {
      setRound(r => r + 1);
      generateRound();
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <GameHUD score={score} combo={combo} timeLeft={timeLeft} correct={correct} wrong={wrong} categoryColor="speed" />
      
      <motion.div
        className={`relative flex items-center justify-center w-full aspect-square max-w-[280px] rounded-3xl shadow-card bg-card ${
          flash === 'correct' ? 'ring-4 ring-language' : flash === 'wrong' ? 'animate-shake ring-4 ring-destructive' : ''
        }`}
      >
        <motion.span
          key={round}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl font-black select-none"
          style={{ color: displayColor.hsl }}
        >
          {wordColor.name.toUpperCase()}
        </motion.span>
      </motion.div>

      <p className="text-sm text-muted-foreground font-medium">Tap the color of the text</p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
        {COLORS.map(c => (
          <Button
            key={c.name}
            variant="outline"
            size="lg"
            onClick={() => handleAnswer(c)}
            className="h-14 rounded-2xl font-bold text-base border-2"
            style={{ borderColor: c.hsl, color: c.hsl }}
          >
            {c.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
