import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import GameHUD from '@/components/GameHUD';

interface Props {
  onAnswer: (correct: boolean) => void;
  onEnd: () => void;
  score: number; combo: number; correct: number; wrong: number;
}

const EMOTIONS = [
  { face: '😊', precise: 'Content', confusers: ['Happy', 'Relieved', 'Amused', 'Grateful', 'Proud'] },
  { face: '😏', precise: 'Smug', confusers: ['Happy', 'Confident', 'Amused', 'Sarcastic', 'Pleased'] },
  { face: '😬', precise: 'Nervous', confusers: ['Scared', 'Anxious', 'Awkward', 'Worried', 'Tense'] },
  { face: '🥺', precise: 'Pleading', confusers: ['Sad', 'Hopeful', 'Desperate', 'Needy', 'Longing'] },
  { face: '😤', precise: 'Frustrated', confusers: ['Angry', 'Annoyed', 'Furious', 'Irritated', 'Mad'] },
  { face: '😌', precise: 'Relieved', confusers: ['Calm', 'Content', 'Peaceful', 'Relaxed', 'Serene'] },
  { face: '🤨', precise: 'Skeptical', confusers: ['Confused', 'Curious', 'Doubtful', 'Suspicious', 'Puzzled'] },
  { face: '😮', precise: 'Astonished', confusers: ['Shocked', 'Surprised', 'Amazed', 'Startled', 'Stunned'] },
  { face: '🫣', precise: 'Embarrassed', confusers: ['Shy', 'Ashamed', 'Nervous', 'Guilty', 'Humiliated'] },
  { face: '😒', precise: 'Unimpressed', confusers: ['Bored', 'Annoyed', 'Dismissive', 'Apathetic', 'Jaded'] },
  { face: '🥲', precise: 'Bittersweet', confusers: ['Happy', 'Sad', 'Nostalgic', 'Melancholy', 'Wistful'] },
  { face: '😶', precise: 'Speechless', confusers: ['Blank', 'Neutral', 'Stunned', 'Confused', 'Stoic'] },
];

export default function EmotionCodebreakerGame({ onAnswer, onEnd, score, combo, correct, wrong }: Props) {
  const [current, setCurrent] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);
  const [showFace, setShowFace] = useState(true);

  const shuffled = useState(() => [...EMOTIONS].sort(() => Math.random() - 0.5))[0];

  const setupRound = useCallback((idx: number) => {
    const emotion = shuffled[idx];
    const allOptions = [emotion.precise, ...emotion.confusers.sort(() => Math.random() - 0.5).slice(0, 5)];
    setOptions(allOptions.sort(() => Math.random() - 0.5));
    setShowFace(true);
    // Face disappears after 1.5 seconds
    setTimeout(() => setShowFace(false), 1500);
  }, [shuffled]);

  useEffect(() => { setupRound(0); }, [setupRound]);

  const handleAnswer = (option: string) => {
    const isCorrect = option === shuffled[current].precise;
    setFlash(isCorrect ? 'correct' : 'wrong');
    onAnswer(isCorrect);

    setTimeout(() => {
      setFlash(null);
      if (current + 1 >= shuffled.length) { onEnd(); return; }
      setCurrent(c => c + 1);
      setupRound(current + 1);
    }, 400);
  };

  const emotion = shuffled[current];

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <GameHUD score={score} combo={combo} correct={correct} wrong={wrong} categoryColor="emotional" />

      <div className="text-sm font-display font-bold text-emotional">
        What precise emotion is this?
      </div>

      <motion.div
        key={current}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`w-40 h-40 rounded-3xl bg-card shadow-card flex items-center justify-center ${
          flash === 'correct' ? 'ring-2 ring-language glow-language' :
          flash === 'wrong' ? 'animate-shake ring-2 ring-destructive' : ''
        }`}
        style={{ boxShadow: showFace ? '0 0 30px hsl(340 80% 60% / 0.3)' : 'none' }}
      >
        {showFace ? (
          <span className="text-7xl">{emotion.face}</span>
        ) : (
          <span className="text-4xl">❓</span>
        )}
      </motion.div>

      <div className="grid grid-cols-2 gap-2 w-full max-w-[320px]">
        {options.map(opt => (
          <Button
            key={opt}
            variant="outline"
            onClick={() => handleAnswer(opt)}
            className="h-12 rounded-2xl text-sm font-display font-medium border-emotional/30 hover:border-emotional hover:bg-emotional/10"
          >
            {opt}
          </Button>
        ))}
      </div>

      <div className="text-xs text-muted-foreground font-display">
        {current + 1}/{shuffled.length}
      </div>
    </div>
  );
}
