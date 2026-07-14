import { MoveDB } from "./types";
import { motion, AnimatePresence } from "framer-motion";

export function ReasoningPanel({ currentMove }: { currentMove: MoveDB | undefined }) {
  return (
    <div className="w-full h-24 mt-4 flex items-center justify-center p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 shadow-inner relative overflow-hidden">
      <AnimatePresence mode="wait">
        {currentMove && currentMove.reasoning_text ? (
          <motion.div
            key={currentMove.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-center"
          >
            <span className="text-[0.65rem] font-mono uppercase tracking-widest text-charcoal-500 block mb-2">
              {currentMove.player} Move {currentMove.ply_number} Reasoning
            </span>
            <p className="text-lg font-display text-amber-500/90 italic">
              &quot;{currentMove.reasoning_text}&quot;
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-charcoal-600 text-sm italic"
          >
            Awaiting reasoning...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
