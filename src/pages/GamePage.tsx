import { useParams, useNavigate } from 'react-router-dom';
import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Swords } from 'lucide-react';
import { GAMES } from '@/lib/types';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useDuel } from '@/hooks/useDuel';
import { useAnswerFeedback } from '@/components/AnswerFeedback';
import { Button } from '@/components/ui/button';
import ScoreSummary from '@/components/ScoreSummary';
import BrainCard from '@/components/BrainCard';
import DuelBar from '@/components/DuelBar';

import MindMirrorGame from '@/games/MindMirrorGame';
import ChaosConductorGame from '@/games/ChaosConductorGame';
import LieDetectorGame from '@/games/LieDetectorGame';
import ImpostorPatternGame from '@/games/ImpostorPatternGame';
import PhantomMathGame from '@/games/PhantomMathGame';
import TimeWarpGame from '@/games/TimeWarpGame';
import WordAvalancheGame from '@/games/WordAvalancheGame';
import VanishingCityGame from '@/games/VanishingCityGame';
import FrequencyGame from '@/games/FrequencyGame';
import EmotionCodebreakerGame from '@/games/EmotionCodebreakerGame';

const GAME_COMPONENTS: Record<string, React.ComponentType<any>> = {
  'mind-mirror': MindMirrorGame,
  'chaos-conductor': ChaosConductorGame,
  'lie-detector': LieDetectorGame,
  'impostor-pattern': ImpostorPatternGame,
  'phantom-math': PhantomMathGame,
  'time-warp': TimeWarpGame,
  'word-avalanche': WordAvalancheGame,
  'vanishing-city': VanishingCityGame,
  'frequency': FrequencyGame,
  'emotion-codebreaker': EmotionCodebreakerGame,
};

const CATEGORY_TEXT: Record<string, string> = {
  memory: 'text-memory', logic: 'text-logic', speed: 'text-speed',
  language: 'text-language', spatial: 'text-spatial', emotional: 'text-emotional',
};

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { state, startGame, submitAnswer, endGame, accuracy, timeTaken } = useGameEngine();
  const { profile, addGameResult, recordDuel } = useUserProfile();
  const { duel, startDuel, updatePlayerScore, endDuel, clearDuel } = useDuel();
  const { triggerFeedback, RedFlashOverlay } = useAnswerFeedback();
  const [phase, setPhase] = useState<'intro' | 'playing' | 'summary' | 'braincard'>('intro');
  const [isDuelMode, setIsDuelMode] = useState(false);

  const gameDef = useMemo(() => GAMES.find(g => g.id === gameId), [gameId]);
  const highScore = gameDef ? (profile.gameHighScores[gameDef.id] || 0) : 0;
  const GameComp = gameId ? GAME_COMPONENTS[gameId] : null;

  const handleStart = useCallback((duelMode = false) => {
    startGame();
    setIsDuelMode(duelMode);
    if (duelMode && gameId) startDuel(gameId);
    setPhase('playing');
  }, [startGame, startDuel, gameId]);

  const handleEnd = useCallback(() => {
    endGame();
    const elapsed = Date.now() - state.startTime;

    let duelResult: 'win' | 'loss' | 'draw' | undefined;
    if (isDuelMode) {
      duelResult = endDuel(state.score);
      recordDuel(duelResult === 'win');
    }

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
  }, [endGame, state, accuracy, gameDef, addGameResult, isDuelMode, endDuel, recordDuel]);

  const handleAnswer = useCallback((isCorrect: boolean) => {
    submitAnswer(isCorrect);
    triggerFeedback(isCorrect);
    if (isDuelMode) {
      setTimeout(() => updatePlayerScore(state.score), 0);
    }
  }, [submitAnswer, triggerFeedback, isDuelMode, updatePlayerScore, state.score]);

  if (!gameDef || !GameComp) {
    return <div className="p-8 text-center font-display">Game not found</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="max-w-md mx-auto px-4 py-4 min-h-screen flex flex-col"
    >
      <RedFlashOverlay />

      {phase === 'intro' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col items-center justify-center gap-6"
        >
          <button onClick={() => navigate(-1)} className="self-start flex items-center gap-2 text-muted-foreground">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <motion.span
            className="text-7xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {gameDef.icon}
          </motion.span>
          <h1 className={`text-2xl font-display font-bold ${CATEGORY_TEXT[gameDef.category]}`}>{gameDef.name}</h1>
          <p className="text-muted-foreground text-center max-w-[280px]">{gameDef.description}</p>
          {highScore > 0 && (
            <div className="bg-card rounded-2xl px-6 py-3 shadow-card text-center">
              <div className="text-xs text-muted-foreground font-display">Personal Best</div>
              <div className="text-2xl font-display font-bold tabular-nums">{highScore}</div>
            </div>
          )}
          <div className="flex gap-3 w-full max-w-[280px]">
            <Button variant="game" size="xl" onClick={() => handleStart(false)} className="flex-1">
              Play Solo
            </Button>
            <Button
              variant="outline"
              size="xl"
              onClick={() => handleStart(true)}
              className="flex-1 border-speed text-speed hover:bg-speed/10"
            >
              <Swords className="w-5 h-5 mr-1" /> Duel
            </Button>
          </div>
        </motion.div>
      )}

      {phase === 'playing' && (
        <div className="flex-1 flex flex-col items-center pt-2">
          {isDuelMode && duel && <DuelBar duel={duel} />}
          <GameComp
            onAnswer={handleAnswer}
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
            duelResult={isDuelMode && duel ? duel.result : undefined}
            duelOpponent={isDuelMode && duel ? { name: duel.opponentName, score: duel.opponentScore } : undefined}
            onPlayAgain={() => { clearDuel(); handleStart(false); }}
            onBrainCard={() => setPhase('braincard')}
            onExit={() => { clearDuel(); navigate('/'); }}
            categoryColor={gameDef.category}
          />
        </div>
      )}

      {phase === 'braincard' && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <BrainCard
            result={{
              gameId: gameDef.id,
              score: state.score,
              accuracy,
              bestCombo: state.bestCombo,
              timeTaken: Date.now() - state.startTime,
              date: new Date().toISOString(),
            }}
            brainType={profile.brainType}
            onBack={() => setPhase('summary')}
          />
        </div>
      )}
    </motion.div>
  );
}
