import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import GameHUD from '@/components/GameHUD';

interface Props {
  onAnswer: (correct: boolean) => void;
  onEnd: () => void;
  score: number; combo: number; correct: number; wrong: number;
}

export default function PhantomMathGame({ onAnswer, onEnd, score, combo, correct, wrong }: Props) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(0);
  const [options, setOptions] = useState<number[]>([]);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);

  const generate = useCallback(() => {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a: number, b: number, ans: number;
    if (op === '+') { a = Math.floor(Math.random() * 50) + 10; b = Math.floor(Math.random() * 50) + 10; ans = a + b; }
    else if (op === '-') { a = Math.floor(Math.random() * 50) + 25; b = Math.floor(Math.random() * a); ans = a - b; }
    else { a = Math.floor(Math.random() * 12) + 2; b = Math.floor(Math.random() * 12) + 2; ans = a * b; }
    
    setQuestion(`${a} ${op} ${b}`);
    setAnswer(ans);
    
    // Psychologically engineered wrong answers — close to correct
    const tricks = new Set([ans]);
    // Common cognitive errors
    tricks.add(ans + 1);
    tricks.add(ans - 1);
    if (op === '×') tricks.add(a + b); // Addition instead of multiplication
    if (op === '+') tricks.add(a * b > 200 ? ans + 10 : a * b); // Multiplication instead of addition
    tricks.add(ans + 10);
    tricks.add(ans - 10);
    
    const trickArr = [...tricks].filter(t => t !== ans && t > 0);
    while (trickArr.length < 3) trickArr.push(ans + Math.floor(Math.random() * 5) + 2);
    
    const opts = [ans, ...trickArr.slice(0, 3)].sort(() => Math.random() - 0.5);
    setOptions(opts);
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
        className={`text-5xl font-display font-bold tabular-nums p-8 rounded-3xl shadow-card bg-card ${
          flash === 'correct' ? 'ring-2 ring-language glow-language' : flash === 'wrong' ? 'animate-shake ring-2 ring-destructive' : ''
        }`}
      >
        {question}
      </motion.div>

      <p className="text-xs text-speed font-display font-medium animate-pulse-neon">⚠️ Careful — the wrong answers are designed to trick you</p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
        {options.map((opt, i) => (
          <Button key={`${opt}-${i}`} variant="outline" size="lg" onClick={() => handleAnswer(opt)}
            className="h-14 rounded-2xl font-bold text-xl tabular-nums font-display border-speed/30 hover:border-speed hover:bg-speed/10">
            {opt}
          </Button>
        ))}
      </div>
    </div>
  );
}
