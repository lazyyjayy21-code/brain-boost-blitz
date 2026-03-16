import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameHUD from '@/components/GameHUD';

interface Props {
  onAnswer: (correct: boolean) => void;
  onEnd: () => void;
  score: number; combo: number; correct: number; wrong: number;
}

interface Target {
  id: number;
  x: number;
  y: number;
  isTarget: boolean;
  symbol: string;
}

export default function FocusFilterGame({ onAnswer, onEnd, score, combo, correct, wrong }: Props) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [targets, setTargets] = useState<Target[]>([]);
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const idRef = useRef(0);

  const spawnTargets = useCallback(() => {
    const items: Target[] = [];
    const count = 8 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      items.push({
        id: idRef.current++,
        x: 10 + Math.random() * 75,
        y: 10 + Math.random() * 75,
        isTarget: Math.random() > 0.4,
        symbol: Math.random() > 0.4 ? '●' : ['■', '▲', '◆'][Math.floor(Math.random() * 3)],
      });
    }
    // Targets are circles (●), distractors are other shapes
    setTargets(items);
    setTapped(new Set());
  }, []);

  useEffect(() => { spawnTargets(); }, [spawnTargets]);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => { if (prev <= 1) { onEnd(); return 0; } return prev - 1; });
    }, 1000);
    const s = setInterval(spawnTargets, 4000);
    return () => { clearInterval(t); clearInterval(s); };
  }, [onEnd, spawnTargets]);

  const handleTap = (target: Target) => {
    if (tapped.has(target.id)) return;
    setTapped(prev => new Set(prev).add(target.id));
    onAnswer(target.isTarget);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <GameHUD score={score} combo={combo} timeLeft={timeLeft} correct={correct} wrong={wrong} categoryColor="focus" />
      <div className="text-sm text-muted-foreground font-medium">Tap only the <span className="text-focus font-bold">circles ●</span></div>

      <div className="relative w-full aspect-square max-w-[320px] rounded-3xl bg-card shadow-card overflow-hidden">
        <AnimatePresence>
          {targets.map(t => (
            <motion.button
              key={t.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: tapped.has(t.id) ? 0.3 : 1 }}
              exit={{ scale: 0 }}
              whileTap={{ scale: 0.8 }}
              onClick={() => handleTap(t)}
              className="absolute text-2xl"
              style={{
                left: `${t.x}%`,
                top: `${t.y}%`,
                color: t.isTarget ? 'hsl(190, 90%, 45%)' : 'hsl(var(--muted-foreground))',
              }}
            >
              {t.symbol}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
