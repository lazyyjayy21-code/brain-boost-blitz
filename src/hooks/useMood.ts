import { useState, useCallback } from 'react';
import { MOODS, GAMES, Category } from '@/lib/types';

export function useMood() {
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [moodChecked, setMoodChecked] = useState(false);

  const selectMood = useCallback((mood: string) => {
    setCurrentMood(mood);
    setMoodChecked(true);
  }, []);

  // AI maps mood to recommended game category
  const getRecommendedCategory = useCallback((): Category | null => {
    if (!currentMood) return null;
    const moodMap: Record<string, Category> = {
      'happy': 'memory',
      'competitive': 'speed',
      'anxious': 'spatial',
      'tired': 'emotional',
      'calm': 'logic',
      'fired-up': 'speed',
    };
    return moodMap[currentMood] || 'logic';
  }, [currentMood]);

  const getRecommendedGame = useCallback(() => {
    const cat = getRecommendedCategory();
    if (!cat) return GAMES[0];
    const catGames = GAMES.filter(g => g.category === cat);
    return catGames[Math.floor(Math.random() * catGames.length)] || GAMES[0];
  }, [getRecommendedCategory]);

  const getMoodInsight = useCallback((): string => {
    if (!currentMood) return '';
    const insights: Record<string, string> = {
      'happy': 'Great mood! Memory games work best when you\'re positive.',
      'competitive': 'Channel that energy into speed challenges!',
      'anxious': 'Spatial games help calm the mind through focus.',
      'tired': 'Try emotional awareness games — they\'re gentle but engaging.',
      'calm': 'Perfect state for logic puzzles. Your accuracy peaks when calm.',
      'fired-up': 'Let\'s go! Speed games will match your energy.',
    };
    return insights[currentMood] || '';
  }, [currentMood]);

  return { currentMood, moodChecked, selectMood, getRecommendedCategory, getRecommendedGame, getMoodInsight };
}
