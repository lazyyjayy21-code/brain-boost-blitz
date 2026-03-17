import { useState, useCallback, useRef, useEffect } from 'react';
import { DuelState, DUEL_OPPONENTS } from '@/lib/types';

export function useDuel() {
  const [duel, setDuel] = useState<DuelState | null>(null);
  const botInterval = useRef<ReturnType<typeof setInterval>>();

  const startDuel = useCallback((gameId: string) => {
    const opponent = DUEL_OPPONENTS[Math.floor(Math.random() * DUEL_OPPONENTS.length)];
    setDuel({
      isActive: true,
      opponentName: opponent.name,
      opponentAvatar: opponent.avatar,
      opponentScore: 0,
      playerScore: 0,
      gameId,
    });
  }, []);

  // Simulate bot scoring with human-like timing
  useEffect(() => {
    if (!duel?.isActive) return;

    botInterval.current = setInterval(() => {
      if (Math.random() > 0.35) { // 65% accuracy
        const points = Math.round(10 + Math.random() * 15);
        setDuel(prev => prev ? { ...prev, opponentScore: prev.opponentScore + points } : null);
      }
    }, 1500 + Math.random() * 2000); // 1.5-3.5s between answers

    return () => clearInterval(botInterval.current);
  }, [duel?.isActive]);

  const updatePlayerScore = useCallback((score: number) => {
    setDuel(prev => prev ? { ...prev, playerScore: score } : null);
  }, []);

  const endDuel = useCallback((playerScore: number): 'win' | 'loss' | 'draw' => {
    clearInterval(botInterval.current);
    const result = !duel ? 'draw' :
      playerScore > duel.opponentScore ? 'win' :
      playerScore < duel.opponentScore ? 'loss' : 'draw';
    
    setDuel(prev => prev ? { ...prev, isActive: false, playerScore, result } : null);
    return result;
  }, [duel]);

  const clearDuel = useCallback(() => {
    clearInterval(botInterval.current);
    setDuel(null);
  }, []);

  return { duel, startDuel, updatePlayerScore, endDuel, clearDuel };
}
