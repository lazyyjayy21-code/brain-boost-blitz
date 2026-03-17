import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import GameHUD from '@/components/GameHUD';

interface Props {
  onAnswer: (correct: boolean) => void;
  onEnd: () => void;
  score: number; combo: number; correct: number; wrong: number;
}

// Generate pattern cells using simple shapes
const SHAPES = ['●', '■', '▲', '◆', '★', '✦'];
const SHAPE_COLORS = [
  'hsl(270,80%,65%)', 'hsl(220,90%,60%)', 'hsl(25,95%,55%)',
  'hsl(150,80%,45%)', 'hsl(175,80%,45%)', 'hsl(340,80%,60%)',
];

export default function ImpostorPatternGame({ onAnswer, onEnd, score, combo, correct, wrong }: Props) {
  const [grid, setGrid] = useState<{ shape: string; color: string; isImpostor: boolean }[]>([]);
  const [gridSize, setGridSize] = useState(4); // starts 2x2
  const [round, setRound] = useState(1);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);

  const generateGrid = useCallback(() => {
    const size = Math.min(Math.floor(round / 2) + 4, 16); // 4 to 16 cells
    const shapeIdx = Math.floor(Math.random() * SHAPES.length);
    const colorIdx = Math.floor(Math.random() * SHAPE_COLORS.length);
    const shape = SHAPES[shapeIdx];
    const color = SHAPE_COLORS[colorIdx];

    const impostorIdx = Math.floor(Math.random() * size);
    
    // Impostor differs slightly
    let impostorShape = shape;
    let impostorColor = color;
    
    if (Math.random() > 0.5) {
      // Different shape
      let newIdx;
      do { newIdx = Math.floor(Math.random() * SHAPES.length); } while (newIdx === shapeIdx);
      impostorShape = SHAPES[newIdx];
    } else {
      // Different color (subtle)
      let newIdx;
      do { newIdx = Math.floor(Math.random() * SHAPE_COLORS.length); } while (newIdx === colorIdx);
      impostorColor = SHAPE_COLORS[newIdx];
    }

    const cells = Array.from({ length: size }, (_, i) => ({
      shape: i === impostorIdx ? impostorShape : shape,
      color: i === impostorIdx ? impostorColor : color,
      isImpostor: i === impostorIdx,
    }));

    setGrid(cells);
    setGridSize(Math.ceil(Math.sqrt(size)));
  }, [round]);

  useEffect(() => { generateGrid(); }, []);

  const handleTap = (idx: number) => {
    const isCorrect = grid[idx].isImpostor;
    setFlash(isCorrect ? 'correct' : 'wrong');
    onAnswer(isCorrect);

    setTimeout(() => {
      setFlash(null);
      if (round >= 12) { onEnd(); return; }
      setRound(r => r + 1);
      generateGrid();
    }, 400);
  };

  const cols = gridSize;

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <GameHUD score={score} combo={combo} correct={correct} wrong={wrong} categoryColor="logic" />

      <div className="text-sm font-display font-bold text-logic">
        Find the impostor 👁️
      </div>

      <div
        className={`grid gap-2 w-full max-w-[300px] ${flash === 'wrong' ? 'animate-shake' : ''}`}
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {grid.map((cell, i) => (
          <motion.button
            key={`${round}-${i}`}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: i * 0.03 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => handleTap(i)}
            className="aspect-square rounded-2xl bg-card shadow-card flex items-center justify-center text-2xl cursor-pointer hover:ring-1 hover:ring-logic/50 transition-all"
            style={{ color: cell.color }}
          >
            {cell.shape}
          </motion.button>
        ))}
      </div>

      <div className="text-xs text-muted-foreground font-display">Round {round}/12</div>
    </div>
  );
}
