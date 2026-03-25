import { Award, ChevronLeft, Target, TrendingUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import GameLobby from "../components/GameLobby";
import AviatorGame from "../components/games/AviatorGame";
import RouletteGame from "../components/games/RouletteGame";
import TeenPattiGame from "../components/games/TeenPattiGame";
import { useUserInfo } from "../hooks/useQueries";

type SelectedGame = "aviator" | "roulette" | "teenpatti" | null;

const GAME_LABELS: Record<NonNullable<SelectedGame>, string> = {
  aviator: "Aviator",
  roulette: "Roulette",
  teenpatti: "Teen Patti",
};

export default function Dashboard() {
  const { data: userInfo } = useUserInfo();
  const [selectedGame, setSelectedGame] = useState<SelectedGame>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stats row */}
      {userInfo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10"
        >
          {[
            {
              icon: Award,
              label: "Balance",
              value: Number(userInfo.balance).toLocaleString(),
              unit: "coins",
            },
            {
              icon: Target,
              label: "Total Wagered",
              value: Number(userInfo.totalWagered).toLocaleString(),
              unit: "coins",
            },
            {
              icon: TrendingUp,
              label: "Total Won",
              value: Number(userInfo.totalWon).toLocaleString(),
              unit: "coins",
              className: "col-span-2 md:col-span-1",
            },
          ].map(({ icon: Icon, label, value, unit, className }) => (
            <div
              key={label}
              className={`rounded-xl p-4 ${className ?? ""}`}
              style={{
                background: "oklch(0.12 0 0)",
                border: "1px solid oklch(0.62 0.13 78 / 0.3)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon
                  className="w-3.5 h-3.5"
                  style={{ color: "oklch(0.85 0.18 85)" }}
                />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {label}
                </span>
              </div>
              <p
                className="text-xl font-bold tabular-nums"
                style={{ color: "oklch(0.85 0.18 85)" }}
              >
                {value}
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  {unit}
                </span>
              </p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Content area */}
      <AnimatePresence mode="wait">
        {selectedGame === null ? (
          <motion.div
            key="lobby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GameLobby onSelect={setSelectedGame} />
          </motion.div>
        ) : (
          <motion.div
            key={selectedGame}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            {/* Back button */}
            <div className="mb-6">
              <button
                type="button"
                data-ocid="lobby.back_button"
                onClick={() => setSelectedGame(null)}
                className="flex items-center gap-2 text-sm uppercase tracking-widest transition-all hover:opacity-100 opacity-75"
                style={{ color: "oklch(0.85 0.18 85)" }}
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Lobby
                <span className="text-muted-foreground normal-case tracking-normal mx-2">
                  |
                </span>
                <span className="font-display font-bold text-base">
                  {GAME_LABELS[selectedGame]}
                </span>
              </button>
            </div>

            {/* Game component */}
            {selectedGame === "aviator" && <AviatorGame />}
            {selectedGame === "roulette" && <RouletteGame />}
            {selectedGame === "teenpatti" && <TeenPattiGame />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
