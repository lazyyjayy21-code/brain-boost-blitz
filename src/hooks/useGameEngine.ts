import { useState, useCallback, useRef } from 'react';

export interface GameState {
  score: number;
  combo: number;
  bestCombo: number;
  correct: number;
  wrong: number;
  startTime: number;
  isActive: boolean;
  isComplete: boolean;
}

export function useGameEngine() {
  const [state, setState] = useState<GameState>({
    score: 0,
    combo: 0,
    bestCombo: 0,
    correct: 0,
    wrong: 0,
    startTime: 0,
    isActive: false,
    isComplete: false,
  });

  const lastAnswerTime = useRef(Date.now());

  const startGame = useCallback(() => {
    const now = Date.now();
    lastAnswerTime.current = now;
    setState({
      score: 0, combo: 0, bestCombo: 0,
      correct: 0, wrong: 0,
      startTime: now, isActive: true, isComplete: false,
    });
  }, []);

  const submitAnswer = useCallback((isCorrect: boolean) => {
    const now = Date.now();
    const timeTaken = now - lastAnswerTime.current;
    lastAnswerTime.current = now;

    setState(prev => {
      if (!prev.isActive) return prev;

      if (!isCorrect) {
        return {
          ...prev,
          score: Math.max(0, prev.score - 5),
          combo: 0,
          wrong: prev.wrong + 1,
        };
      }

      const base = 10;
      const speedBonus = timeTaken < 1000 ? 20 : timeTaken < 2000 ? 10 : 0;
      const multiplier = prev.combo >= 10 ? 3 : prev.combo >= 5 ? 2 : prev.combo >= 3 ? 1.5 : 1;
      const points = Math.round((base + speedBonus) * multiplier);
      const newCombo = prev.combo + 1;

      return {
        ...prev,
        score: prev.score + points,
        combo: newCombo,
        bestCombo: Math.max(prev.bestCombo, newCombo),
        correct: prev.correct + 1,
      };
    });
  }, []);

  const endGame = useCallback(() => {
    setState(prev => ({ ...prev, isActive: false, isComplete: true }));
  }, []);

  const accuracy = state.correct + state.wrong > 0
    ? Math.round((state.correct / (state.correct + state.wrong)) * 100)
    : 0;

  const timeTaken = state.startTime ? Date.now() - state.startTime : 0;

  return { state, startGame, submitAnswer, endGame, accuracy, timeTaken };
}
