import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import GameHUD from '@/components/GameHUD';

interface Props {
  onAnswer: (correct: boolean) => void;
  onEnd: () => void;
  score: number; combo: number; correct: number; wrong: number;
}

export default function ChaosConductorGame({ onAnswer, onEnd, score, combo, correct, wrong }: Props) {
  // Ball bouncing state
  const [ballY, setBallY] = useState(50);
  const [ballVel, setBallVel] = useState(0);
  const [zoneY] = useState(40); // Target zone center (40-60%)
  const [ballInZone, setBallInZone] = useState(true);

  // Math state
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(0);
  const [options, setOptions] = useState<number[]>([]);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);
  const [lives, setLives] = useState(3);

  const gameLoop = useRef<ReturnType<typeof setInterval>>();

  const generateMath = useCallback(() => {
    const a = Math.floor(Math.random() * 15) + 3;
    const b = Math.floor(Math.random() * 15) + 3;
    const ops = ['+', '-'];
    const op = ops[Math.floor(Math.random() * 2)];
    const ans = op === '+' ? a + b : a - b;
    setQuestion(`${a} ${op} ${b}`);
    setAnswer(ans);
    const opts = new Set([ans]);
    while (opts.size < 3) opts.add(ans + Math.floor(Math.random() * 10) - 5 || ans + 1);
    setOptions([...opts].sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => { generateMath(); }, [generateMath]);

  // Ball physics
  useEffect(() => {
    gameLoop.current = setInterval(() => {
      setBallY(prev => {
        const newY = prev + ballVel;
        setBallVel(v => v + 0.3); // gravity

        // Check zone
        const inZone = newY >= 30 && newY <= 70;
        setBallInZone(inZone);

        if (!inZone && (newY <= 5 || newY >= 95)) {
          setLives(l => {
            const newL = l - 1;
            if (newL <= 0) setTimeout(() => onEnd(), 100);
            return newL;
          });
          setBallVel(0);
          return 50;
        }

        return Math.max(5, Math.min(95, newY));
      });
    }, 30);

    return () => clearInterval(gameLoop.current);
  }, [ballVel, onEnd]);

  const bounceBall = () => {
    setBallVel(-4);
  };

  const handleMathAnswer = (val: number) => {
    const isCorrect = val === answer;
    setFlash(isCorrect ? 'correct' : 'wrong');
    onAnswer(isCorrect);

    if (!isCorrect) {
      setLives(l => {
        const newL = l - 1;
        if (newL <= 0) setTimeout(() => onEnd(), 100);
        return newL;
      });
    }

    setTimeout(() => { setFlash(null); generateMath(); }, 200);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <GameHUD score={score} combo={combo} correct={correct} wrong={wrong} categoryColor="memory" />

      <div className="flex items-center gap-2">
        <span className="text-sm font-display font-bold text-memory">Dual Task</span>
        <span className="text-sm">{'❤️'.repeat(lives)}</span>
      </div>

      <div className="flex gap-3 w-full max-w-[360px]">
        {/* Ball zone - left side */}
        <div
          className="relative w-1/3 h-[300px] rounded-2xl bg-card shadow-card overflow-hidden cursor-pointer"
          onClick={bounceBall}
          style={{ background: 'linear-gradient(180deg, hsl(225,25%,14%), hsl(225,30%,8%))' }}
        >
          {/* Target zone */}
          <div
            className="absolute left-0 right-0 border-y border-dashed border-language/30"
            style={{ top: '30%', height: '40%', background: 'hsl(150 80% 45% / 0.05)' }}
          >
            <span className="absolute top-1 left-1 text-[10px] text-language/50 font-display">ZONE</span>
          </div>

          {/* Ball */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full"
            style={{
              top: `${ballY}%`,
              backgroundColor: ballInZone ? 'hsl(150,80%,45%)' : 'hsl(0,84%,60%)',
              boxShadow: ballInZone ? '0 0 15px hsl(150 80% 45% / 0.5)' : '0 0 15px hsl(0 84% 60% / 0.5)',
            }}
          />

          <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-muted-foreground font-display">
            TAP to bounce
          </div>
        </div>

        {/* Math zone - right side */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <motion.div
            key={question}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-3xl font-display font-bold tabular-nums p-4 rounded-2xl bg-card shadow-card w-full text-center ${
              flash === 'correct' ? 'ring-2 ring-language' : flash === 'wrong' ? 'ring-2 ring-destructive' : ''
            }`}
          >
            {question}
          </motion.div>

          <div className="flex flex-col gap-2 w-full">
            {options.map((opt, i) => (
              <Button
                key={`${opt}-${i}`}
                variant="outline"
                onClick={() => handleMathAnswer(opt)}
                className="h-11 rounded-xl font-bold tabular-nums font-display text-lg"
              >
                {opt}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
