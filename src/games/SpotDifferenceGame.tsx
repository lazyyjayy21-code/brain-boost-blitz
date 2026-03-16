import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import GameHUD from '@/components/GameHUD';

interface Props {
  onAnswer: (correct: boolean) => void;
  onEnd: () => void;
  score: number; combo: number; correct: number; wrong: number;
}

const GRID_SIZE = 5;
const SYMBOLS = ['●', '■', '▲', '◆', '★'];
const COLORS = ['hsl(225,80%,60%)', 'hsl(350,80%,60%)', 'hsl(150,80%,40%)', 'hsl(45,90%,50%)', 'hsl(270,70%,60%)'];

interface Cell { symbol: number; color: number; }

export default function SpotDifferenceGame({ onAnswer, onEnd, score, combo, correct, wrong }: Props) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [grid1, setGrid1] = useState<Cell[]>([]);
  const [grid2, setGrid2] = useState<Cell[]>([]);
  const [diffIndices, setDiffIndices] = useState<Set<number>>(new Set());
  const [found, setFound] = useState<Set<number>>(new Set());
  const [round, setRound] = useState(0);
  const maxRounds = 5;

  const generate = useCallback(() => {
    const g1: Cell[] = Array.from({ length: GRID_SIZE * GRID_SIZE }, () => ({
      symbol: Math.floor(Math.random() * SYMBOLS.length),
      color: Math.floor(Math.random() * COLORS.length),
    }));
    const g2 = g1.map(c => ({ ...c }));
    const diffs = new Set<number>();
    while (diffs.size < 3) {
      const idx = Math.floor(Math.random() * g2.length);
      if (!diffs.has(idx)) {
        g2[idx] = { symbol: (g2[idx].symbol + 1) % SYMBOLS.length, color: (g2[idx].color + 1) % COLORS.length };
        diffs.add(idx);
      }
    }
    setGrid1(g1);
    setGrid2(g2);
    setDiffIndices(diffs);
    setFound(new Set());
  }, []);

  useEffect(() => { generate(); }, [generate]);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => { if (prev <= 1) { onEnd(); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [onEnd]);

  const handleTap = (idx: number) => {
    if (found.has(idx)) return;
    if (diffIndices.has(idx)) {
      onAnswer(true);
      const newFound = new Set(found);
      newFound.add(idx);
      setFound(newFound);
      if (newFound.size === diffIndices.size) {
        if (round + 1 >= maxRounds) { onEnd(); return; }
        setRound(r => r + 1);
        setTimeout(generate, 500);
      }
    } else {
      onAnswer(false);
    }
  };

  const renderGrid = (cells: Cell[], clickable: boolean) => (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
      {cells.map((cell, i) => (
        <motion.button key={i} whileTap={clickable ? { scale: 0.9 } : undefined}
          onClick={() => clickable && handleTap(i)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
            found.has(i) ? 'ring-2 ring-language bg-language/20' : 'bg-card'
          }`}
          style={{ color: COLORS[cell.color] }}
        >
          {SYMBOLS[cell.symbol]}
        </motion.button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <GameHUD score={score} combo={combo} timeLeft={timeLeft} correct={correct} wrong={wrong} categoryColor="spatial" />
      <div className="text-sm text-muted-foreground font-medium">Find 3 differences (tap right grid)</div>
      <div className="flex gap-4">
        {renderGrid(grid1, false)}
        {renderGrid(grid2, true)}
      </div>
    </div>
  );
}
