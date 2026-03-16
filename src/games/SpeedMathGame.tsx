import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import GameHUD from '@/components/GameHUD';

interface Props {
  onAnswer: (correct: boolean) => void;
  onEnd: () => void;
  score: number; combo: number; correct: number; wrong: number;
}

export default function SpeedMathGame({ onAnswer, onEnd, score, combo, correct, wrong }: Props) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(0);
  const [options, setOptions] = useState<number[]>([]);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);

  const generate = useCallback(() => {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a: number, b: number, ans: number;
    if (op === '+') { a = Math.floor(Math.random() * 50) + 1; b = Math.floor(Math.random() * 50) + 1; ans = a + b; }
    else if (op === '-') { a = Math.floor(Math.random() * 50) + 20; b = Math.floor(Math.random() * a); ans = a - b; }
    else { a = Math.floor(Math.random() * 12) + 1; b = Math.floor(Math.random() * 12) + 1; ans = a * b; }
    setQuestion(`${a} ${op} ${b}`);
    setAnswer(ans);
    const opts = new Set([ans]);
    while (opts.size < 4) opts.add(ans + Math.floor(Math.random() * 20) - 10 || ans + 1);
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
    const isCorrect = val === answer;
    setFlash(isCorrect ? 'correct' : 'wrong');
    onAnswer(isCorrect);
    setTimeout(() => { setFlash(null); generate(); }, 200);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <GameHUD score={score} combo={combo} timeLeft={timeLeft} correct={correct} wrong={wrong} categoryColor="speed" />
      
      <motion.div
        key={question}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`text-5xl font-black tabular-nums p-8 rounded-3xl shadow-card bg-card ${
          flash === 'correct' ? 'ring-4 ring-language' : flash === 'wrong' ? 'animate-shake ring-4 ring-destructive' : ''
        }`}
      >
        {question}
      </motion.div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
        {options.map(opt => (
          <Button key={opt} variant="outline" size="lg" onClick={() => handleAnswer(opt)}
            className="h-14 rounded-2xl font-bold text-xl tabular-nums">
            {opt}
          </Button>
        ))}
      </div>
    </div>
  );
}
