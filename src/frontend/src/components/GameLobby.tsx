import { ChevronLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import RouletteGame from "./games/RouletteGame";

type Game = "roulette";

const WHEEL_SEGMENTS = [
  {
    num: 0,
    d: "M100,80 L163.0,80.0 A63,63 0 0,1 162.0938,90.6471 Z",
    color: "#166534",
  },
  {
    num: 1,
    d: "M100,80 L162.0938,90.6471 A63,63 0 0,1 159.4013,100.9878 Z",
    color: "#b91c1c",
  },
  {
    num: 2,
    d: "M100,80 L159.4013,100.9878 A63,63 0 0,1 154.9999,110.7248 Z",
    color: "#111111",
  },
  {
    num: 3,
    d: "M100,80 L154.9999,110.7248 A63,63 0 0,1 149.0163,119.5779 Z",
    color: "#b91c1c",
  },
  {
    num: 4,
    d: "M100,80 L149.0163,119.5779 A63,63 0 0,1 141.6225,127.2924 Z",
    color: "#111111",
  },
  {
    num: 5,
    d: "M100,80 L141.6225,127.2924 A63,63 0 0,1 133.0314,133.6463 Z",
    color: "#b91c1c",
  },
  {
    num: 6,
    d: "M100,80 L133.0314,133.6463 A63,63 0 0,1 123.49,138.457 Z",
    color: "#111111",
  },
  {
    num: 7,
    d: "M100,80 L123.49,138.457 A63,63 0 0,1 113.2728,141.586 Z",
    color: "#b91c1c",
  },
  {
    num: 8,
    d: "M100,80 L113.2728,141.586 A63,63 0 0,1 102.6738,142.9432 Z",
    color: "#111111",
  },
  {
    num: 9,
    d: "M100,80 L102.6738,142.9432 A63,63 0 0,1 91.9979,142.4897 Z",
    color: "#b91c1c",
  },
  {
    num: 10,
    d: "M100,80 L91.9979,142.4897 A63,63 0 0,1 81.5522,140.2385 Z",
    color: "#111111",
  },
  {
    num: 11,
    d: "M100,80 L81.5522,140.2385 A63,63 0 0,1 71.6372,136.2543 Z",
    color: "#111111",
  },
  {
    num: 12,
    d: "M100,80 L71.6372,136.2543 A63,63 0 0,1 62.5381,130.6518 Z",
    color: "#b91c1c",
  },
  {
    num: 13,
    d: "M100,80 L62.5381,130.6518 A63,63 0 0,1 54.5168,123.5921 Z",
    color: "#111111",
  },
  {
    num: 14,
    d: "M100,80 L54.5168,123.5921 A63,63 0 0,1 47.8039,115.2784 Z",
    color: "#b91c1c",
  },
  {
    num: 15,
    d: "M100,80 L47.8039,115.2784 A63,63 0 0,1 42.5926,105.9498 Z",
    color: "#111111",
  },
  {
    num: 16,
    d: "M100,80 L42.5926,105.9498 A63,63 0 0,1 39.0328,95.8746 Z",
    color: "#b91c1c",
  },
  {
    num: 17,
    d: "M100,80 L39.0328,95.8746 A63,63 0 0,1 37.227,85.3428 Z",
    color: "#111111",
  },
  {
    num: 18,
    d: "M100,80 L37.227,85.3428 A63,63 0 0,1 37.227,74.6572 Z",
    color: "#b91c1c",
  },
  {
    num: 19,
    d: "M100,80 L37.227,74.6572 A63,63 0 0,1 39.0328,64.1254 Z",
    color: "#b91c1c",
  },
  {
    num: 20,
    d: "M100,80 L39.0328,64.1254 A63,63 0 0,1 42.5926,54.0502 Z",
    color: "#111111",
  },
  {
    num: 21,
    d: "M100,80 L42.5926,54.0502 A63,63 0 0,1 47.8039,44.7216 Z",
    color: "#b91c1c",
  },
  {
    num: 22,
    d: "M100,80 L47.8039,44.7216 A63,63 0 0,1 54.5168,36.4079 Z",
    color: "#111111",
  },
  {
    num: 23,
    d: "M100,80 L54.5168,36.4079 A63,63 0 0,1 62.5381,29.3482 Z",
    color: "#b91c1c",
  },
  {
    num: 24,
    d: "M100,80 L62.5381,29.3482 A63,63 0 0,1 71.6372,23.7457 Z",
    color: "#111111",
  },
  {
    num: 25,
    d: "M100,80 L71.6372,23.7457 A63,63 0 0,1 81.5522,19.7615 Z",
    color: "#b91c1c",
  },
  {
    num: 26,
    d: "M100,80 L81.5522,19.7615 A63,63 0 0,1 91.9979,17.5103 Z",
    color: "#111111",
  },
  {
    num: 27,
    d: "M100,80 L91.9979,17.5103 A63,63 0 0,1 102.6738,17.0568 Z",
    color: "#b91c1c",
  },
  {
    num: 28,
    d: "M100,80 L102.6738,17.0568 A63,63 0 0,1 113.2728,18.414 Z",
    color: "#111111",
  },
  {
    num: 29,
    d: "M100,80 L113.2728,18.414 A63,63 0 0,1 123.49,21.543 Z",
    color: "#111111",
  },
  {
    num: 30,
    d: "M100,80 L123.49,21.543 A63,63 0 0,1 133.0314,26.3537 Z",
    color: "#b91c1c",
  },
  {
    num: 31,
    d: "M100,80 L133.0314,26.3537 A63,63 0 0,1 141.6225,32.7076 Z",
    color: "#111111",
  },
  {
    num: 32,
    d: "M100,80 L141.6225,32.7076 A63,63 0 0,1 149.0163,40.4221 Z",
    color: "#b91c1c",
  },
  {
    num: 33,
    d: "M100,80 L149.0163,40.4221 A63,63 0 0,1 154.9999,49.2752 Z",
    color: "#111111",
  },
  {
    num: 34,
    d: "M100,80 L154.9999,49.2752 A63,63 0 0,1 159.4013,59.0122 Z",
    color: "#b91c1c",
  },
  {
    num: 35,
    d: "M100,80 L159.4013,59.0122 A63,63 0 0,1 162.0938,69.3529 Z",
    color: "#111111",
  },
  {
    num: 36,
    d: "M100,80 L162.0938,69.3529 A63,63 0 0,1 163.0,80.0 Z",
    color: "#b91c1c",
  },
] as const;

const ROULETTE_CARD = {
  id: "roulette" as Game,
  title: "ROULETTE",
  subtitle: "Bet on your number",
  svg: (
    <svg
      viewBox="0 0 200 160"
      className="w-full h-full"
      aria-label="Roulette wheel"
    >
      <title>Roulette</title>
      <defs>
        <radialGradient id="rl-bg" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="oklch(0.16 0.04 78)" />
          <stop offset="100%" stopColor="oklch(0.08 0 0)" />
        </radialGradient>
        <radialGradient id="rl-rim" cx="50%" cy="50%" r="50%">
          <stop offset="80%" stopColor="oklch(0.62 0.13 78)" />
          <stop offset="100%" stopColor="oklch(0.85 0.18 85)" />
        </radialGradient>
      </defs>
      <rect width="200" height="160" fill="url(#rl-bg)" />
      <circle
        cx="100"
        cy="80"
        r="72"
        fill="none"
        stroke="oklch(0.85 0.18 85 / 0.3)"
        strokeWidth="4"
      />
      <circle cx="100" cy="80" r="68" fill="url(#rl-rim)" />
      {WHEEL_SEGMENTS.map((seg) => (
        <path
          key={`seg-${seg.num}`}
          d={seg.d}
          fill={seg.color}
          stroke="oklch(0.85 0.18 85 / 0.4)"
          strokeWidth="0.5"
        />
      ))}
      <circle
        cx="100"
        cy="80"
        r="18"
        fill="oklch(0.10 0 0)"
        stroke="oklch(0.85 0.18 85)"
        strokeWidth="2"
      />
      <circle
        cx="100"
        cy="80"
        r="10"
        fill="oklch(0.85 0.18 85)"
        opacity="0.9"
      />
      <circle cx="100" cy="80" r="4" fill="oklch(0.07 0 0)" />
      <circle cx="138" cy="50" r="5" fill="white" />
      <circle cx="138" cy="50" r="3" fill="oklch(0.95 0.05 85)" />
    </svg>
  ),
};

export default function GameLobby() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {selectedGame === null ? (
          <motion.div
            key="lobby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-[calc(100vh-64px)] flex flex-col justify-center px-4 py-8"
          >
            <div className="max-w-sm mx-auto w-full">
              <motion.button
                type="button"
                data-ocid="lobby.roulette.button"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedGame(ROULETTE_CARD.id)}
                className="group relative flex flex-col items-center rounded-2xl overflow-hidden cursor-pointer text-left w-full transition-all duration-300"
                style={{
                  background: "oklch(0.10 0 0)",
                  border: "1px solid oklch(0.62 0.13 78 / 0.3)",
                  boxShadow: "0 4px 24px oklch(0 0 0 / 0.4)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.border =
                    "1px solid oklch(0.85 0.18 85 / 0.7)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 0 40px oklch(0.85 0.18 85 / 0.25), 0 8px 32px oklch(0 0 0 / 0.5)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.border =
                    "1px solid oklch(0.62 0.13 78 / 0.3)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 4px 24px oklch(0 0 0 / 0.4)";
                }}
              >
                <div
                  className="w-full"
                  style={{ height: "260px", background: "oklch(0.08 0 0)" }}
                >
                  {ROULETTE_CARD.svg}
                </div>
                <div
                  className="w-full px-6 py-5 flex flex-col items-center"
                  style={{ borderTop: "1px solid oklch(0.62 0.13 78 / 0.2)" }}
                >
                  <h3 className="font-display text-2xl font-bold uppercase tracking-widest mb-1 gold-gradient-text">
                    {ROULETTE_CARD.title}
                  </h3>
                  <p className="text-sm text-muted-foreground tracking-wider">
                    {ROULETTE_CARD.subtitle}
                  </p>
                  <div
                    className="mt-4 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 group-hover:opacity-100 opacity-70"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.87 0.19 85), oklch(0.62 0.13 78))",
                      color: "oklch(0.07 0 0)",
                    }}
                  >
                    Play Now
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={selectedGame}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="px-4 py-6"
          >
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
                  Roulette
                </span>
              </button>
            </div>
            <RouletteGame />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
