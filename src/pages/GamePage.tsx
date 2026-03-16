import { useParams, useNavigate } from 'react-router-dom';
import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { GAMES } from '@/lib/types';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import ScoreSummary from '@/components/ScoreSummary';

// Games
import StroopGame from '@/games/StroopGame';
import SimonSaysGame from '@/games/SimonSaysGame';
import CardFlipGame from '@/games/CardFlipGame';
import SpeedMathGame from '@/games/SpeedMathGame';
import NumberMatrixGame from '@/games/NumberMatrixGame';
import PatternPuzzleGame from '@/games/PatternPuzzleGame';
import WordUnscrambleGame from '@/games/WordUnscrambleGame';
import WordChainGame from '@/games/WordChainGame';
import MentalRotationGame from '@/games/MentalRotationGame';
import SpotDifferenceGame from '@/games/SpotDifferenceGame';
import DualNBackGame from '@/games/DualNBackGame';
import FocusFilterGame from '@/games/FocusFilterGame';

const GAME_COMPONENTS: Record<string, React.ComponentType<any>> = {
  'stroop': StroopGame,
  'simon-says': SimonSaysGame,
  'card-flip': CardFlipGame,
  'speed-math': SpeedMathGame,
  'number-matrix': NumberMatrixGame,
  'pattern-puzzle': PatternPuzzleGame,
  'word-unscramble': WordUnscrambleGame,
  'word-chain': WordChainGame,
  'mental-rotation': MentalRotationGame,
  'spot-difference': SpotDifferenceGame,
  'dual-n-back': DualNBackGame,
  'focus-filter': FocusFilterGame,
};

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { state, startGame, submitAnswer, endGame, accuracy, timeTaken } = useGameEngine();
  const { profile, addGameResult } = useUserProfile();
  const [phase, setPhase] = useState<'intro' | 'playing' | 'summary'>('intro');

  const gameDef = useMemo(() => GAMES.find(g => g.id === gameId), [gameId]);
  const highScore = gameDef ? (profile.gameHighScores[gameDef.id] || 0) : 0;
  const GameComp = gameId ? GAME_COMPONENTS[gameId] : null;

  const handleStart = useCallback(() => {
    startGame();
    setPhase('playing');
  }, [startGame]);

  const handleEnd = useCallback(() => {
    endGame();
    const elapsed = Date.now() - state.startTime;
    if (gameDef) {
      addGameResult({
        gameId: gameDef.id,
        score: state.score,
        accuracy,
        bestCombo: state.bestCombo,
        timeTaken: elapsed,
        date: new Date().toISOString(),
      });
    }
    setPhase('summary');
  }, [endGame, state, accuracy, gameDef, addGameResult]);

  if (!gameDef || !GameComp) {
    return <div className="p-8 text-center">Game not found</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="max-w-md mx-auto px-4 py-4 min-h-screen flex flex-col"
    >
      {phase === 'intro' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <button onClick={() => navigate(-1)} className="self-start flex items-center gap-2 text-muted-foreground">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <span className="text-6xl">{gameDef.icon}</span>
          <h1 className="text-2xl font-extrabold">{gameDef.name}</h1>
          <p className="text-muted-foreground text-center">{gameDef.description}</p>
          {highScore > 0 && (
            <div className="bg-card rounded-2xl px-6 py-3 shadow-card text-center">
              <div className="text-xs text-muted-foreground">High Score</div>
              <div className="text-2xl font-extrabold tabular-nums">{highScore}</div>
            </div>
          )}
          <Button variant="game" size="xl" onClick={handleStart}>Start Game</Button>
        </div>
      )}

      {phase === 'playing' && (
        <div className="flex-1 flex flex-col items-center pt-2">
          <GameComp
            onAnswer={submitAnswer}
            onEnd={handleEnd}
            score={state.score}
            combo={state.combo}
            correct={state.correct}
            wrong={state.wrong}
          />
        </div>
      )}

      {phase === 'summary' && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <ScoreSummary
            result={{
              gameId: gameDef.id,
              score: state.score,
              accuracy,
              bestCombo: state.bestCombo,
              timeTaken: Date.now() - state.startTime,
              date: new Date().toISOString(),
            }}
            highScore={highScore}
            onPlayAgain={() => { handleStart(); }}
            onExit={() => navigate('/')}
            categoryColor={gameDef.category}
          />
        </div>
      )}
    </motion.div>
  );
}
