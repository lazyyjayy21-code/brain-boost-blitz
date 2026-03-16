import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import GameHUD from '@/components/GameHUD';

const EMOJIS = ['🍎', '🍊', '🍋', '🍇', '🍓', '🫐', '🥝', '🍑'];

interface Props {
  onAnswer: (correct: boolean) => void;
  onEnd: () => void;
  score: number;
  combo: number;
  correct: number;
  wrong: number;
}

export default function CardFlipGame({ onAnswer, onEnd, score, combo, correct, wrong }: Props) {
  const [cards, setCards] = useState<{ emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [pairs, setPairs] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const totalPairs = 6;

  const initCards = useCallback(() => {
    const chosen = EMOJIS.slice(0, totalPairs);
    const deck = [...chosen, ...chosen]
      .sort(() => Math.random() - 0.5)
      .map(emoji => ({ emoji, flipped: false, matched: false }));
    setCards(deck);
    setPairs(0);
    setSelected([]);
  }, []);

  useEffect(() => { initCards(); }, [initCards]);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { onEnd(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [onEnd]);

  const handleFlip = (idx: number) => {
    if (cards[idx].flipped || cards[idx].matched || selected.length >= 2) return;

    const newCards = [...cards];
    newCards[idx].flipped = true;
    setCards(newCards);

    const newSel = [...selected, idx];
    setSelected(newSel);

    if (newSel.length === 2) {
      const [a, b] = newSel;
      if (cards[a].emoji === cards[b].emoji) {
        setTimeout(() => {
          const matched = [...cards];
          matched[a].matched = true;
          matched[b].matched = true;
          setCards(matched);
          setSelected([]);
          onAnswer(true);
          const newPairs = pairs + 1;
          setPairs(newPairs);
          if (newPairs >= totalPairs) onEnd();
        }, 300);
      } else {
        setTimeout(() => {
          const reset = [...cards];
          reset[a].flipped = false;
          reset[b].flipped = false;
          setCards(reset);
          setSelected([]);
          onAnswer(false);
        }, 600);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <GameHUD score={score} combo={combo} timeLeft={timeLeft} correct={correct} wrong={wrong} categoryColor="memory" />
      
      <div className="grid grid-cols-4 gap-2 w-full max-w-[320px]">
        {cards.map((card, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleFlip(i)}
            className={`aspect-square rounded-2xl text-2xl flex items-center justify-center shadow-card transition-all duration-200 ${
              card.matched ? 'bg-language/20 scale-90' : card.flipped ? 'bg-card' : 'bg-primary/10'
            }`}
          >
            {card.flipped || card.matched ? card.emoji : '?'}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
