import { motion } from 'framer-motion';
import { DuelState } from '@/lib/types';

interface Props {
  duel: DuelState;
}

export default function DuelBar({ duel }: Props) {
  const total = duel.playerScore + duel.opponentScore || 1;
  const playerPct = (duel.playerScore / total) * 100;

  return (
    <div className="w-full mb-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🧠</span>
          <span className="font-display font-bold text-xs text-language tabular-nums">{duel.playerScore}</span>
        </div>
        <span className="text-xs font-display text-muted-foreground">⚔️ LIVE DUEL</span>
        <div className="flex items-center gap-1.5">
          <span className="font-display font-bold text-xs text-speed tabular-nums">{duel.opponentScore}</span>
          <span className="text-sm">{duel.opponentAvatar}</span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden flex">
        <motion.div
          className="h-full bg-language"
          animate={{ width: `${playerPct}%` }}
          transition={{ duration: 0.3 }}
        />
        <motion.div
          className="h-full bg-speed"
          animate={{ width: `${100 - playerPct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="text-center mt-0.5">
        <span className="text-[10px] text-muted-foreground font-display">vs {duel.opponentName}</span>
      </div>
    </div>
  );
}
