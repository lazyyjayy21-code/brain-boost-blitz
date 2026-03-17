import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import GameHUD from '@/components/GameHUD';

interface Props {
  onAnswer: (correct: boolean) => void;
  onEnd: () => void;
  score: number; combo: number; correct: number; wrong: number;
}

const COLORS = ['hsl(270,80%,65%)', 'hsl(220,90%,60%)', 'hsl(25,95%,55%)', 'hsl(150,80%,45%)', 'hsl(175,80%,45%)', 'hsl(340,80%,60%)'];

export default function MindMirrorGame({ onAnswer, onEnd, score, combo, correct, wrong }: Props) {
  const [phase, setPhase] = useState<'show' | 'recall'>('show');
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSeq, setPlayerSeq] = useState<number[]>([]);
  const [round, setRound] = useState(1);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);
  const [gridSize] = useState(9); // 3x3

  const generateSequence = useCallback((len: number) => {
    const seq: number[] = [];
    for (let i = 0; i < len; i++) {
      seq.push(Math.floor(Math.random() * gridSize));
    }
    return seq;
  }, [gridSize]);

  const startRound = useCallback(() => {
    const len = Math.min(round + 2, 8);
    const seq = generateSequence(len);
    setSequence(seq);
    setPlayerSeq([]);
    setPhase('show');

    setTimeout(() => setPhase('recall'), 3000);
  }, [round, generateSequence]);

  useEffect(() => { startRound(); }, []);

  const handleTap = (idx: number) => {
    if (phase !== 'recall') return;
    const nextIdx = playerSeq.length;
    const isCorrect = sequence[nextIdx] === idx;

    if (!isCorrect) {
      setFlash('wrong');
      onAnswer(false);
      setTimeout(() => { setFlash(null); }, 300);
      if (round >= 5) { onEnd(); return; }
      setRound(r => r + 1);
      setTimeout(() => startRound(), 500);
      return;
    }

    const newSeq = [...playerSeq, idx];
    setPlayerSeq(newSeq);
    setFlash('correct');
    onAnswer(true);
    setTimeout(() => setFlash(null), 200);

    if (newSeq.length === sequence.length) {
      if (round >= 10) { onEnd(); return; }
      setRound(r => r + 1);
      setTimeout(() => startRound(), 800);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <GameHUD score={score} combo={combo} correct={correct} wrong={wrong} categoryColor="memory" />

      <div className="text-sm font-display font-bold text-muted-foreground">
        {phase === 'show' ? 'Memorize the sequence...' : `Tap ${sequence.length - playerSeq.length} more tiles`}
      </div>

      <div className={`grid grid-cols-3 gap-2 w-full max-w-[280px] ${flash === 'wrong' ? 'animate-shake' : ''}`}>
        {Array.from({ length: gridSize }).map((_, i) => {
          const isInSequence = phase === 'show' && sequence.includes(i);
          const isSelected = playerSeq.includes(i);
          const seqColor = COLORS[i % COLORS.length];

          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleTap(i)}
              className={`aspect-square rounded-2xl transition-all duration-300 ${
                isInSequence ? 'ring-2 ring-memory' : ''
              } ${isSelected ? 'ring-2 ring-language' : ''}`}
              style={{
                backgroundColor: isInSequence ? seqColor : isSelected ? 'hsl(150,80%,45%)' : 'hsl(225,25%,16%)',
                boxShadow: isInSequence ? `0 0 20px ${seqColor}` : 'none',
              }}
            />
          );
        })}
      </div>

      <div className="text-xs text-muted-foreground font-display">Round {round}/10</div>
    </div>
  );
}
