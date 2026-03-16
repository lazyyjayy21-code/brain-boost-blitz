import { motion } from 'framer-motion';

interface Props {
  score: number;
  combo: number;
  timeLeft?: number;
  correct: number;
  wrong: number;
  categoryColor: string;
}

export default function GameHUD({ score, combo, timeLeft, correct, wrong, categoryColor }: Props) {
  const multiplier = combo >= 10 ? 3 : combo >= 5 ? 2 : combo >= 3 ? 1.5 : 1;

  return (
    <div className="flex items-center justify-between w-full px-2 py-3">
      <div className="flex items-center gap-3">
        <motion.div
          key={score}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.2 }}
          className="text-xl font-extrabold tabular-nums"
        >
          {score}
        </motion.div>
        {combo >= 3 && (
          <motion.div
            key={combo}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.3 }}
            className="text-sm font-bold px-2 py-0.5 rounded-xl bg-logic/20 text-logic"
          >
            x{multiplier}
          </motion.div>
        )}
      </div>

      <div className="flex items-center gap-3 text-sm">
        {timeLeft !== undefined && (
          <div className="font-bold tabular-nums text-muted-foreground">
            {timeLeft}s
          </div>
        )}
        <div className="flex items-center gap-1">
          <span className="text-language font-semibold">{correct}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-destructive font-semibold">{wrong}</span>
        </div>
      </div>
    </div>
  );
}
