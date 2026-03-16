import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import GameHUD from '@/components/GameHUD';

const WORDS = [
  'BRAIN','FOCUS','LOGIC','SPEED','SHARP','THINK','SMART','QUICK',
  'PUZZLE','NERVE','POWER','LEARN','SOLVE','MATCH','CHAIN','FLARE',
  'BONUS','LEVEL','SCORE','COMBO','BLAZE','ORBIT','SPARK','QUEST',
];

interface Props {
  onAnswer: (correct: boolean) => void;
  onEnd: () => void;
  score: number; combo: number; correct: number; wrong: number;
}

function shuffle(str: string): string {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const result = arr.join('');
  return result === str ? shuffle(str) : result;
}

export default function WordUnscrambleGame({ onAnswer, onEnd, score, combo, correct, wrong }: Props) {
  const [timeLeft, setTimeLeft] = useState(45);
  const [word, setWord] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [input, setInput] = useState('');
  const [round, setRound] = useState(0);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);
  const maxRounds = 10;

  const generate = useCallback(() => {
    const w = WORDS[Math.floor(Math.random() * WORDS.length)];
    setWord(w);
    setScrambled(shuffle(w));
    setInput('');
  }, []);

  useEffect(() => { generate(); }, [generate]);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => { if (prev <= 1) { onEnd(); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [onEnd]);

  const handleSubmit = () => {
    const isCorrect = input.toUpperCase() === word;
    setFlash(isCorrect ? 'correct' : 'wrong');
    onAnswer(isCorrect);
    setTimeout(() => { setFlash(null); }, 200);
    if (round + 1 >= maxRounds) { onEnd(); return; }
    setRound(r => r + 1);
    generate();
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <GameHUD score={score} combo={combo} timeLeft={timeLeft} correct={correct} wrong={wrong} categoryColor="language" />
      
      <motion.div key={scrambled} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className={`text-4xl font-black tracking-widest p-6 rounded-3xl bg-card shadow-card ${
          flash === 'correct' ? 'ring-4 ring-language' : flash === 'wrong' ? 'animate-shake ring-4 ring-destructive' : ''
        }`}
      >
        {scrambled}
      </motion.div>

      <div className="flex gap-2 w-full max-w-[280px]">
        <input
          value={input}
          onChange={e => setInput(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Type the word..."
          className="flex-1 h-12 rounded-2xl bg-card shadow-card px-4 font-bold text-lg tracking-wider border-0 outline-none focus:ring-2 focus:ring-primary"
          autoFocus
        />
        <Button variant="game" size="lg" onClick={handleSubmit}>Go</Button>
      </div>
    </div>
  );
}
