import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import GameHUD from '@/components/GameHUD';

const COMMON_WORDS: Record<string, string[]> = {
  A: ['APPLE','ANT','ARCH','ARM'],
  B: ['BEAR','BONE','BALL','BAT'],
  C: ['CAT','CONE','CAVE','CUP'],
  D: ['DOG','DRUM','DUSK','DIG'],
  E: ['EEL','EGG','ELM','ERA'],
  F: ['FOX','FISH','FROG','FAN'],
  G: ['GOAT','GOLD','GAME','GUM'],
  H: ['HEN','HARP','HILL','HAT'],
  I: ['ICE','INK','IVY','IRE'],
  K: ['KING','KITE','KNOB'],
  L: ['LION','LAMP','LACE','LOG'],
  M: ['MOON','MIST','MAZE','MUG'],
  N: ['NEST','NAIL','NOTE','NET'],
  O: ['OWL','OAK','ORB','OAT'],
  P: ['PIG','PINE','POND','PEN'],
  R: ['RAIN','ROCK','ROSE','RUG'],
  S: ['SUN','STAR','SEAL','SKY'],
  T: ['TREE','TOAD','TIDE','TIN'],
  W: ['WIND','WAVE','WOLF','WEB'],
  Y: ['YAK','YARN','YEW'],
};

interface Props {
  onAnswer: (correct: boolean) => void;
  onEnd: () => void;
  score: number; combo: number; correct: number; wrong: number;
}

export default function WordChainGame({ onAnswer, onEnd, score, combo, correct, wrong }: Props) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentWord, setCurrentWord] = useState('STAR');
  const [input, setInput] = useState('');
  const [chain, setChain] = useState<string[]>(['STAR']);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);
  const usedWords = useRef(new Set(['STAR']));

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => { if (prev <= 1) { onEnd(); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [onEnd]);

  const handleSubmit = () => {
    const word = input.toUpperCase().trim();
    const lastLetter = currentWord[currentWord.length - 1];
    
    if (word.length < 2 || word[0] !== lastLetter || usedWords.current.has(word)) {
      setFlash('wrong');
      onAnswer(false);
      setTimeout(() => setFlash(null), 300);
      setInput('');
      return;
    }

    setFlash('correct');
    onAnswer(true);
    usedWords.current.add(word);
    setCurrentWord(word);
    setChain(prev => [...prev.slice(-4), word]);
    setInput('');
    setTimeout(() => setFlash(null), 200);
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <GameHUD score={score} combo={combo} timeLeft={timeLeft} correct={correct} wrong={wrong} categoryColor="language" />

      <div className="flex gap-2 flex-wrap justify-center">
        {chain.map((w, i) => (
          <span key={i} className="px-3 py-1 rounded-xl bg-card shadow-card text-sm font-semibold">
            {w}
          </span>
        ))}
      </div>

      <motion.div className={`text-4xl font-black p-6 rounded-3xl bg-card shadow-card ${
        flash === 'correct' ? 'ring-4 ring-language' : flash === 'wrong' ? 'animate-shake ring-4 ring-destructive' : ''
      }`}>
        {currentWord}
      </motion.div>

      <p className="text-sm text-muted-foreground">
        Type a word starting with <span className="font-bold text-foreground">{currentWord[currentWord.length - 1]}</span>
      </p>

      <div className="flex gap-2 w-full max-w-[300px]">
        <input value={input} onChange={e => setInput(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder={`Word starting with ${currentWord[currentWord.length - 1]}...`}
          className="flex-1 h-12 rounded-2xl bg-card shadow-card px-4 font-bold tracking-wider border-0 outline-none focus:ring-2 focus:ring-primary"
          autoFocus
        />
        <Button variant="game" size="lg" onClick={handleSubmit}>Go</Button>
      </div>
    </div>
  );
}
