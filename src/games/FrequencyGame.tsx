import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import GameHUD from '@/components/GameHUD';

interface Props {
  onAnswer: (correct: boolean) => void;
  onEnd: () => void;
  score: number; combo: number; correct: number; wrong: number;
}

interface Dot {
  id: number;
  isOffBeat: boolean;
  phase: number;
}

export default function FrequencyGame({ onAnswer, onEnd, score, combo, correct, wrong }: Props) {
  const [dots, setDots] = useState<Dot[]>([]);
  const [round, setRound] = useState(1);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);
  const [pulsePhase, setPulsePhase] = useState(0);
  const animRef = useRef<ReturnType<typeof setInterval>>();

  const generateRound = useCallback(() => {
    const count = Math.min(round + 3, 9);
    const offBeatIdx = Math.floor(Math.random() * count);
    const newDots: Dot[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      isOffBeat: i === offBeatIdx,
      phase: i === offBeatIdx ? Math.random() * Math.PI : 0,
    }));
    setDots(newDots);
  }, [round]);

  useEffect(() => { generateRound(); }, []);

  // Animate pulse
  useEffect(() => {
    animRef.current = setInterval(() => {
      setPulsePhase(p => p + 0.1);
    }, 50);
    return () => clearInterval(animRef.current);
  }, []);

  const handleTap = (dot: Dot) => {
    const isCorrect = dot.isOffBeat;
    setFlash(isCorrect ? 'correct' : 'wrong');
    onAnswer(isCorrect);

    setTimeout(() => {
      setFlash(null);
      if (round >= 10) { onEnd(); return; }
      setRound(r => r + 1);
      generateRound();
    }, 400);
  };

  const getScale = (dot: Dot) => {
    const freq = dot.isOffBeat ? 1.7 : 2; // Off-beat has slightly different frequency
    const phase = dot.isOffBeat ? dot.phase : 0;
    return 0.7 + 0.3 * Math.sin(pulsePhase * freq + phase);
  };

  const cols = dots.length <= 4 ? 2 : 3;

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <GameHUD score={score} combo={combo} correct={correct} wrong={wrong} categoryColor="spatial" />

      <div className="text-sm font-display font-bold text-spatial">
        Tap the dot with the different rhythm
      </div>

      <div className={`grid gap-4 w-full max-w-[300px] ${flash === 'wrong' ? 'animate-shake' : ''}`}
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {dots.map(dot => (
          <motion.button
            key={dot.id}
            onClick={() => handleTap(dot)}
            className="aspect-square rounded-full flex items-center justify-center"
            style={{
              transform: `scale(${getScale(dot)})`,
              backgroundColor: 'hsl(175,80%,45%)',
              boxShadow: `0 0 ${20 * getScale(dot)}px hsl(175 80% 45% / ${0.4 * getScale(dot)})`,
            }}
          />
        ))}
      </div>

      <div className="text-xs text-muted-foreground font-display">Round {round}/10</div>
    </div>
  );
}
