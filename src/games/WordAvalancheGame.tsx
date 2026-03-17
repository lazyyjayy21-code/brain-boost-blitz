import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameHUD from '@/components/GameHUD';

interface Props {
  onAnswer: (correct: boolean) => void;
  onEnd: () => void;
  score: number; combo: number; correct: number; wrong: number;
}

const CATEGORIES_MAP: Record<string, string[]> = {
  'Animal': ['Dog', 'Cat', 'Eagle', 'Shark', 'Bear', 'Tiger', 'Whale', 'Fox', 'Owl', 'Wolf'],
  'Food': ['Pizza', 'Sushi', 'Bread', 'Apple', 'Pasta', 'Rice', 'Taco', 'Cake', 'Soup', 'Mango'],
  'Color': ['Red', 'Blue', 'Green', 'Gold', 'Pink', 'Teal', 'Navy', 'Lime', 'Rose', 'Cyan'],
  'Country': ['Japan', 'Spain', 'Kenya', 'Chile', 'India', 'Egypt', 'Cuba', 'Peru', 'Laos', 'Fiji'],
};

interface FallingWord {
  id: number;
  word: string;
  category: string;
  x: number;
  y: number;
  speed: number;
}

export default function WordAvalancheGame({ onAnswer, onEnd, score, combo, correct, wrong }: Props) {
  const [words, setWords] = useState<FallingWord[]>([]);
  const [targetCategory, setTargetCategory] = useState('');
  const [lives, setLives] = useState(3);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);
  const nextId = useRef(0);
  const gameRef = useRef<ReturnType<typeof setInterval>>();
  const spawnRef = useRef<ReturnType<typeof setInterval>>();

  const categories = Object.keys(CATEGORIES_MAP);

  useEffect(() => {
    setTargetCategory(categories[Math.floor(Math.random() * categories.length)]);
  }, []);

  // Spawn words
  useEffect(() => {
    if (!targetCategory) return;
    spawnRef.current = setInterval(() => {
      const cat = categories[Math.floor(Math.random() * categories.length)];
      const wordList = CATEGORIES_MAP[cat];
      const word = wordList[Math.floor(Math.random() * wordList.length)];
      const newWord: FallingWord = {
        id: nextId.current++,
        word,
        category: cat,
        x: 10 + Math.random() * 70,
        y: -5,
        speed: 0.4 + Math.random() * 0.3,
      };
      setWords(prev => [...prev, newWord]);
    }, 1200);

    return () => clearInterval(spawnRef.current);
  }, [targetCategory]);

  // Move words down
  useEffect(() => {
    gameRef.current = setInterval(() => {
      setWords(prev => {
        const updated = prev.map(w => ({ ...w, y: w.y + w.speed }));
        const fallen = updated.filter(w => w.y >= 95);
        
        // Words that hit bottom and were target = missed = lose life
        for (const f of fallen) {
          if (f.category === targetCategory) {
            setLives(l => {
              const newL = l - 1;
              if (newL <= 0) setTimeout(() => onEnd(), 100);
              return newL;
            });
          }
        }
        
        return updated.filter(w => w.y < 95);
      });
    }, 50);

    return () => clearInterval(gameRef.current);
  }, [targetCategory, onEnd]);

  const handleTap = (word: FallingWord) => {
    const isCorrect = word.category === targetCategory;
    setFlash(isCorrect ? 'correct' : 'wrong');
    onAnswer(isCorrect);
    setWords(prev => prev.filter(w => w.id !== word.id));

    if (!isCorrect) {
      setLives(l => {
        const newL = l - 1;
        if (newL <= 0) setTimeout(() => onEnd(), 100);
        return newL;
      });
    }

    setTimeout(() => setFlash(null), 200);
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <GameHUD score={score} combo={combo} correct={correct} wrong={wrong} categoryColor="language" />

      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-display font-bold text-language">Tap only: {targetCategory}</span>
        <span className="text-sm">{'❤️'.repeat(lives)}</span>
      </div>

      <div
        className={`relative w-full h-[400px] max-w-[340px] rounded-3xl bg-card shadow-card overflow-hidden ${
          flash === 'wrong' ? 'animate-shake' : ''
        }`}
        style={{
          background: 'linear-gradient(180deg, hsl(225,25%,14%) 0%, hsl(225,30%,8%) 100%)',
        }}
      >
        {/* Bottom zone */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-destructive/50" />

        <AnimatePresence>
          {words.map(w => (
            <motion.button
              key={w.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={() => handleTap(w)}
              className="absolute px-3 py-1.5 rounded-xl text-sm font-bold font-display cursor-pointer whitespace-nowrap"
              style={{
                left: `${w.x}%`,
                top: `${w.y}%`,
                backgroundColor: w.category === targetCategory ? 'hsl(150 80% 45% / 0.15)' : 'hsl(225 20% 20%)',
                color: 'hsl(210 40% 92%)',
                border: '1px solid hsl(225 20% 25%)',
              }}
            >
              {w.word}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
