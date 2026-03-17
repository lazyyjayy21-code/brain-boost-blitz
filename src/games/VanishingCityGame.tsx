import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameHUD from '@/components/GameHUD';

interface Props {
  onAnswer: (correct: boolean) => void;
  onEnd: () => void;
  score: number; combo: number; correct: number; wrong: number;
}

const OBJECTS = ['🏠', '🌳', '🚗', '🐕', '🏪', '🌺', '💡', '🎪', '🚲', '🔔', '🎨', '🗝️', '📮', '🎀', '⭐'];

interface PlacedObject {
  emoji: string;
  x: number;
  y: number;
}

export default function VanishingCityGame({ onAnswer, onEnd, score, combo, correct, wrong }: Props) {
  const [phase, setPhase] = useState<'memorize' | 'recall'>('memorize');
  const [objects, setObjects] = useState<PlacedObject[]>([]);
  const [targetObj, setTargetObj] = useState<PlacedObject | null>(null);
  const [round, setRound] = useState(1);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);

  const generateRound = useCallback(() => {
    const count = Math.min(round + 2, 8);
    const placed: PlacedObject[] = [];
    const used = new Set<string>();
    for (let i = 0; i < count; i++) {
      let emoji: string;
      do { emoji = OBJECTS[Math.floor(Math.random() * OBJECTS.length)]; } while (used.has(emoji));
      used.add(emoji);
      placed.push({
        emoji,
        x: 10 + Math.random() * 75,
        y: 10 + Math.random() * 75,
      });
    }
    setObjects(placed);
    setTargetObj(placed[Math.floor(Math.random() * placed.length)]);
    setPhase('memorize');
    setTimeout(() => setPhase('recall'), Math.max(5000 - round * 300, 2000));
  }, [round]);

  useEffect(() => { generateRound(); }, []);

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase !== 'recall' || !targetObj) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const tapX = ((e.clientX - rect.left) / rect.width) * 100;
    const tapY = ((e.clientY - rect.top) / rect.height) * 100;

    const dist = Math.sqrt((tapX - targetObj.x) ** 2 + (tapY - targetObj.y) ** 2);
    const isCorrect = dist < 15;

    setFlash(isCorrect ? 'correct' : 'wrong');
    onAnswer(isCorrect);

    setTimeout(() => {
      setFlash(null);
      if (round >= 8) { onEnd(); return; }
      setRound(r => r + 1);
      generateRound();
    }, 500);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <GameHUD score={score} combo={combo} correct={correct} wrong={wrong} categoryColor="spatial" />

      {phase === 'recall' && targetObj && (
        <div className="text-sm font-display font-bold text-spatial">
          Where was {targetObj.emoji}?
        </div>
      )}
      {phase === 'memorize' && (
        <div className="text-sm font-display font-bold text-muted-foreground animate-pulse-neon">
          Memorize the positions...
        </div>
      )}

      <div
        onClick={handleTap}
        className={`relative w-full aspect-square max-w-[320px] rounded-3xl bg-card shadow-card overflow-hidden cursor-crosshair ${
          flash === 'correct' ? 'ring-2 ring-language glow-language' :
          flash === 'wrong' ? 'animate-shake ring-2 ring-destructive' : ''
        }`}
        style={{
          background: phase === 'memorize'
            ? 'linear-gradient(135deg, hsl(225,25%,14%), hsl(225,30%,10%))'
            : 'linear-gradient(135deg, hsl(225,25%,10%), hsl(225,30%,6%))',
        }}
      >
        <AnimatePresence>
          {phase === 'memorize' && objects.map((obj, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: i * 0.1 }}
              className="absolute text-2xl"
              style={{ left: `${obj.x}%`, top: `${obj.y}%`, transform: 'translate(-50%,-50%)' }}
            >
              {obj.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Grid overlay for recall */}
        {phase === 'recall' && (
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'linear-gradient(hsl(175,80%,45%) 1px, transparent 1px), linear-gradient(90deg, hsl(175,80%,45%) 1px, transparent 1px)',
              backgroundSize: '20% 20%',
            }}
          />
        )}
      </div>

      <div className="text-xs text-muted-foreground font-display">Round {round}/8</div>
    </div>
  );
}
