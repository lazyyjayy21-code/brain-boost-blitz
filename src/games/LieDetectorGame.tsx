import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import GameHUD from '@/components/GameHUD';

interface Props {
  onAnswer: (correct: boolean) => void;
  onEnd: () => void;
  score: number; combo: number; correct: number; wrong: number;
}

const FACTS = [
  { statement: 'The Great Wall of China is visible from space', answer: false },
  { statement: 'Honey never spoils', answer: true },
  { statement: 'Lightning never strikes the same place twice', answer: false },
  { statement: 'Octopuses have three hearts', answer: true },
  { statement: 'Goldfish have a 3-second memory', answer: false },
  { statement: 'Bananas are berries', answer: true },
  { statement: 'Humans use only 10% of their brain', answer: false },
  { statement: 'Venus is the hottest planet in our solar system', answer: true },
  { statement: 'The tongue is the strongest muscle in the body', answer: false },
  { statement: 'A group of flamingos is called a flamboyance', answer: true },
  { statement: 'Glass is a liquid that flows very slowly', answer: false },
  { statement: 'Sharks are older than trees', answer: true },
  { statement: 'Sugar makes children hyperactive', answer: false },
  { statement: 'An ostrich\'s eye is bigger than its brain', answer: true },
  { statement: 'Bats are blind', answer: false },
  { statement: 'The Eiffel Tower can grow taller in summer', answer: true },
  { statement: 'Cracking knuckles causes arthritis', answer: false },
  { statement: 'Sloths can hold their breath for 40 minutes', answer: true },
  { statement: 'Chameleons change color to camouflage', answer: false },
  { statement: 'A day on Venus is longer than its year', answer: true },
];

export default function LieDetectorGame({ onAnswer, onEnd, score, combo, correct, wrong }: Props) {
  const [timeLeft, setTimeLeft] = useState(45);
  const [factIdx, setFactIdx] = useState(0);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);
  const [fakePercent, setFakePercent] = useState(65);

  const shuffled = useState(() => [...FACTS].sort(() => Math.random() - 0.5))[0];

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => { if (prev <= 1) { onEnd(); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [onEnd]);

  const nextFact = useCallback(() => {
    if (factIdx + 1 >= shuffled.length) { onEnd(); return; }
    setFactIdx(i => i + 1);
    // Generate manipulative fake percentage
    const fact = shuffled[factIdx + 1];
    // Fake meter pushes toward wrong answer
    setFakePercent(fact.answer ? Math.floor(Math.random() * 25 + 15) : Math.floor(Math.random() * 25 + 60));
  }, [factIdx, shuffled, onEnd]);

  const handleAnswer = (answer: boolean) => {
    const isCorrect = answer === shuffled[factIdx].answer;
    setFlash(isCorrect ? 'correct' : 'wrong');
    onAnswer(isCorrect);
    setTimeout(() => { setFlash(null); nextFact(); }, 300);
  };

  const fact = shuffled[factIdx];

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <GameHUD score={score} combo={combo} timeLeft={timeLeft} correct={correct} wrong={wrong} categoryColor="logic" />

      <motion.div
        key={factIdx}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full rounded-3xl p-6 shadow-card bg-card text-center ${
          flash === 'correct' ? 'ring-2 ring-language glow-language' :
          flash === 'wrong' ? 'animate-shake ring-2 ring-destructive' : ''
        }`}
      >
        <p className="text-lg font-bold font-display leading-relaxed">{fact.statement}</p>
      </motion.div>

      {/* Fake social pressure meter */}
      <div className="w-full rounded-2xl bg-muted p-3">
        <div className="text-xs text-muted-foreground mb-2 text-center font-medium">
          🤖 {fakePercent}% of players said TRUE
        </div>
        <div className="h-2 rounded-full bg-background overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-speed"
            initial={{ width: 0 }}
            animate={{ width: `${fakePercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="flex gap-3 w-full">
        <Button
          variant="outline"
          size="xl"
          onClick={() => handleAnswer(true)}
          className="flex-1 border-language text-language hover:bg-language/20 font-display"
        >
          TRUE ✓
        </Button>
        <Button
          variant="outline"
          size="xl"
          onClick={() => handleAnswer(false)}
          className="flex-1 border-destructive text-destructive hover:bg-destructive/20 font-display"
        >
          FALSE ✗
        </Button>
      </div>
    </div>
  );
}
