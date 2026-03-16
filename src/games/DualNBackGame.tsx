import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import GameHUD from '@/components/GameHUD';

interface Props {
  onAnswer: (correct: boolean) => void;
  onEnd: () => void;
  score: number; combo: number; correct: number; wrong: number;
}

const GRID_POSITIONS = Array.from({ length: 9 }, (_, i) => i); // 3x3
const LETTERS = 'ABCDEFGHJ'.split('');

export default function DualNBackGame({ onAnswer, onEnd, score, combo, correct, wrong }: Props) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentPos, setCurrentPos] = useState(-1);
  const [currentLetter, setCurrentLetter] = useState('');
  const [history, setHistory] = useState<{ pos: number; letter: string }[]>([]);
  const [showStimulus, setShowStimulus] = useState(false);
  const [step, setStep] = useState(0);
  const [responded, setResponded] = useState(false);
  const n = 2;
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => { if (prev <= 1) { onEnd(); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [onEnd]);

  const nextStimulus = useCallback(() => {
    const pos = Math.floor(Math.random() * 9);
    const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    
    setHistory(prev => [...prev, { pos, letter }]);
    setCurrentPos(pos);
    setCurrentLetter(letter);
    setShowStimulus(true);
    setResponded(false);
    setStep(s => s + 1);

    setTimeout(() => setShowStimulus(false), 1500);
  }, []);

  useEffect(() => {
    nextStimulus();
    timerRef.current = setInterval(nextStimulus, 2500);
    return () => clearInterval(timerRef.current);
  }, [nextStimulus]);

  const checkMatch = (type: 'position' | 'letter') => {
    if (responded || step <= n) return;
    setResponded(true);
    const nBack = history[history.length - 1 - n];
    const current = history[history.length - 1];
    if (!nBack || !current) return;
    
    const isMatch = type === 'position' ? current.pos === nBack.pos : current.letter === nBack.letter;
    onAnswer(isMatch);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <GameHUD score={score} combo={combo} timeLeft={timeLeft} correct={correct} wrong={wrong} categoryColor="focus" />
      <div className="text-sm text-muted-foreground font-medium">N={n}: Match position or letter from {n} steps ago</div>

      <div className="text-3xl font-black">{showStimulus ? currentLetter : ''}</div>

      <div className="grid grid-cols-3 gap-2 w-full max-w-[200px]">
        {GRID_POSITIONS.map(i => (
          <div key={i} className={`aspect-square rounded-2xl transition-all duration-200 ${
            showStimulus && i === currentPos ? 'bg-focus shadow-elevated' : 'bg-card shadow-card'
          }`} />
        ))}
      </div>

      <div className="flex gap-3 w-full max-w-[280px]">
        <Button variant="game" size="lg" className="flex-1" onClick={() => checkMatch('position')}>
          Position Match
        </Button>
        <Button variant="game" size="lg" className="flex-1" onClick={() => checkMatch('letter')}>
          Letter Match
        </Button>
      </div>
    </div>
  );
}
