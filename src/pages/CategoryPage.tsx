import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GAMES, Category } from '@/lib/types';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ArrowLeft } from 'lucide-react';

const CATEGORY_BG: Record<string, string> = {
  memory: 'bg-memory/10', logic: 'bg-logic/10', speed: 'bg-speed/10',
  language: 'bg-language/10', spatial: 'bg-spatial/10', emotional: 'bg-emotional/10',
};
const CATEGORY_TEXT: Record<string, string> = {
  memory: 'text-memory', logic: 'text-logic', speed: 'text-speed',
  language: 'text-language', spatial: 'text-spatial', emotional: 'text-emotional',
};

export default function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const games = GAMES.filter(g => g.category === categoryId);
  const label = categoryId ? categoryId.charAt(0).toUpperCase() + categoryId.slice(1) : '';

  return (
    <div className="max-w-md mx-auto px-4 py-4">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground mb-4">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <h1 className={`text-2xl font-display font-bold mb-6 ${CATEGORY_TEXT[categoryId || '']}`}>
        {categoryId === 'emotional' ? 'Emotional IQ' : label}
      </h1>

      <div className="flex flex-col gap-3">
        {games.map(game => {
          const highScore = profile.gameHighScores[game.id] || 0;
          return (
            <motion.button
              key={game.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/game/${game.id}`)}
              className={`rounded-3xl p-5 shadow-card text-left flex items-center gap-4 ${CATEGORY_BG[game.category]}`}
              style={{ boxShadow: `0 0 15px hsl(var(--${game.category}) / 0.1)` }}
            >
              <span className="text-3xl">{game.icon}</span>
              <div className="flex-1">
                <div className="font-display font-bold">{game.name}</div>
                <div className="text-sm text-muted-foreground">{game.description}</div>
              </div>
              {highScore > 0 && (
                <div className="text-right">
                  <div className="text-xs text-muted-foreground font-display">Best</div>
                  <div className="font-display font-bold tabular-nums">{highScore}</div>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
