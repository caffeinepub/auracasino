import { ChevronLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import AviatorGame from "./games/AviatorGame";
import RouletteGame from "./games/RouletteGame";
import TeenPattiGame from "./games/TeenPattiGame";

type Game = "aviator" | "roulette" | "teenPatti";

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

const AviatorSVG = (
  <svg
    viewBox="0 0 200 160"
    className="w-full h-full"
    aria-label="Aviator game"
  >
    <title>Aviator</title>
    <defs>
      <radialGradient id="av-bg" cx="50%" cy="80%" r="70%">
        <stop offset="0%" stopColor="oklch(0.10 0.04 240)" />
        <stop offset="100%" stopColor="oklch(0.06 0 0)" />
      </radialGradient>
      <linearGradient id="av-curve" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="oklch(0.85 0.18 85)" stopOpacity="0.1" />
        <stop offset="100%" stopColor="oklch(0.85 0.18 85)" stopOpacity="0.8" />
      </linearGradient>
      <linearGradient id="av-gold" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="oklch(0.62 0.13 78)" />
        <stop offset="100%" stopColor="oklch(0.87 0.19 85)" />
      </linearGradient>
      <filter id="av-glow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <rect width="200" height="160" fill="url(#av-bg)" />
    <circle cx="20" cy="20" r="1" fill="white" opacity="0.4" />
    <circle cx="50" cy="10" r="1" fill="white" opacity="0.6" />
    <circle cx="80" cy="30" r="1" fill="white" opacity="0.8" />
    <circle cx="120" cy="15" r="1" fill="white" opacity="0.4" />
    <circle cx="160" cy="25" r="1" fill="white" opacity="0.6" />
    <circle cx="185" cy="10" r="1" fill="white" opacity="0.8" />
    <circle cx="170" cy="50" r="1" fill="white" opacity="0.4" />
    <circle cx="30" cy="50" r="1" fill="white" opacity="0.6" />
    <circle cx="140" cy="40" r="1" fill="white" opacity="0.8" />
    <path
      d="M10,145 Q60,140 100,110 Q140,80 185,25 L185,155 L10,155 Z"
      fill="oklch(0.85 0.18 85 / 0.06)"
    />
    <path
      d="M10,145 Q60,140 100,110 Q140,80 185,25"
      fill="none"
      stroke="url(#av-curve)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M10,145 Q60,140 100,110 Q140,80 185,25"
      fill="none"
      stroke="oklch(0.85 0.18 85 / 0.3)"
      strokeWidth="5"
      filter="url(#av-glow)"
    />
    <g transform="translate(175, 28) rotate(-35)">
      <ellipse cx="0" cy="0" rx="10" ry="4" fill="url(#av-gold)" />
      <ellipse cx="7" cy="-1" rx="4" ry="2.5" fill="oklch(0.90 0.15 85)" />
      <polygon points="-2,-4 -8,-12 -12,-4" fill="oklch(0.75 0.16 82)" />
      <polygon points="-2,4 -8,12 -12,4" fill="oklch(0.75 0.16 82)" />
      <polygon points="-9,-2 -14,-7 -10,-2" fill="oklch(0.62 0.13 78)" />
    </g>
    <text
      x="18"
      y="75"
      fontFamily="monospace"
      fontSize="22"
      fontWeight="bold"
      fill="oklch(0.87 0.19 85)"
      opacity="0.9"
    >
      2.47x
    </text>
    <line
      x1="10"
      y1="155"
      x2="190"
      y2="155"
      stroke="oklch(0.85 0.18 85 / 0.15)"
      strokeWidth="1"
    />
    <line
      x1="10"
      y1="155"
      x2="10"
      y2="10"
      stroke="oklch(0.85 0.18 85 / 0.15)"
      strokeWidth="1"
    />
  </svg>
);

const RouletteSVG = (
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
    <circle cx="100" cy="80" r="10" fill="oklch(0.85 0.18 85)" opacity="0.9" />
    <circle cx="100" cy="80" r="4" fill="oklch(0.07 0 0)" />
    <circle cx="138" cy="50" r="5" fill="white" />
    <circle cx="138" cy="50" r="3" fill="oklch(0.95 0.05 85)" />
  </svg>
);

const TeenPattiSVG = (
  <svg
    viewBox="0 0 200 160"
    className="w-full h-full"
    aria-label="Teen Patti cards"
  >
    <title>Teen Patti</title>
    <defs>
      <radialGradient id="tp-bg" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="oklch(0.14 0.04 30)" />
        <stop offset="100%" stopColor="oklch(0.07 0 0)" />
      </radialGradient>
      <linearGradient id="tp-card1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="oklch(0.96 0.01 85)" />
        <stop offset="100%" stopColor="oklch(0.88 0.03 80)" />
      </linearGradient>
      <linearGradient id="tp-card2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="oklch(0.94 0.01 85)" />
        <stop offset="100%" stopColor="oklch(0.86 0.03 80)" />
      </linearGradient>
      <linearGradient id="tp-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="oklch(0.87 0.19 85)" />
        <stop offset="100%" stopColor="oklch(0.62 0.13 78)" />
      </linearGradient>
    </defs>
    <rect width="200" height="160" fill="url(#tp-bg)" />
    <circle cx="100" cy="80" r="90" fill="oklch(0.10 0.03 145 / 0.25)" />
    <circle
      cx="100"
      cy="80"
      r="70"
      fill="none"
      stroke="oklch(0.85 0.18 85 / 0.08)"
      strokeWidth="1"
    />
    <g transform="translate(68, 80) rotate(-18)">
      <rect
        x="-22"
        y="-34"
        width="44"
        height="60"
        rx="4"
        ry="4"
        fill="url(#tp-card1)"
        stroke="oklch(0.62 0.13 78 / 0.5)"
        strokeWidth="1"
      />
      <text
        x="-16"
        y="-20"
        fontSize="12"
        fontWeight="bold"
        fill="#c41e3a"
        fontFamily="Georgia, serif"
      >
        A
      </text>
      <text
        x="-8"
        y="-8"
        fontSize="16"
        fill="#c41e3a"
        fontFamily="Georgia, serif"
      >
        {"\u2665"}
      </text>
      <text
        x="4"
        y="22"
        fontSize="12"
        fontWeight="bold"
        fill="#c41e3a"
        fontFamily="Georgia, serif"
        transform="rotate(180, 4, 14)"
      >
        A
      </text>
    </g>
    <g transform="translate(132, 80) rotate(18)">
      <rect
        x="-22"
        y="-34"
        width="44"
        height="60"
        rx="4"
        ry="4"
        fill="url(#tp-card2)"
        stroke="oklch(0.62 0.13 78 / 0.5)"
        strokeWidth="1"
      />
      <text
        x="-16"
        y="-20"
        fontSize="12"
        fontWeight="bold"
        fill="#1a1a2e"
        fontFamily="Georgia, serif"
      >
        K
      </text>
      <text
        x="-8"
        y="-8"
        fontSize="16"
        fill="#1a1a2e"
        fontFamily="Georgia, serif"
      >
        {"\u2660"}
      </text>
      <text
        x="4"
        y="22"
        fontSize="12"
        fontWeight="bold"
        fill="#1a1a2e"
        fontFamily="Georgia, serif"
        transform="rotate(180, 4, 14)"
      >
        K
      </text>
    </g>
    <g transform="translate(100, 78)">
      <rect
        x="-24"
        y="-36"
        width="48"
        height="66"
        rx="5"
        ry="5"
        fill="oklch(0.97 0.01 85)"
        stroke="oklch(0.85 0.18 85)"
        strokeWidth="1.5"
      />
      <rect
        x="-20"
        y="-32"
        width="40"
        height="58"
        rx="3"
        ry="3"
        fill="none"
        stroke="oklch(0.85 0.18 85 / 0.3)"
        strokeWidth="0.5"
      />
      <text
        x="-17"
        y="-18"
        fontSize="13"
        fontWeight="bold"
        fill="#c41e3a"
        fontFamily="Georgia, serif"
      >
        Q
      </text>
      <text
        x="-9"
        y="-4"
        fontSize="18"
        fill="#c41e3a"
        fontFamily="Georgia, serif"
      >
        {"\u2666"}
      </text>
      <text
        x="5"
        y="26"
        fontSize="13"
        fontWeight="bold"
        fill="#c41e3a"
        fontFamily="Georgia, serif"
        transform="rotate(180, 5, 18)"
      >
        Q
      </text>
    </g>
    <circle
      cx="100"
      cy="135"
      r="12"
      fill="url(#tp-gold)"
      stroke="oklch(0.97 0.03 85)"
      strokeWidth="1.5"
    />
    <text
      x="100"
      y="139"
      textAnchor="middle"
      fontSize="8"
      fontWeight="bold"
      fill="oklch(0.10 0 0)"
      fontFamily="sans-serif"
    >
      500
    </text>
  </svg>
);

const GAME_CARDS = [
  {
    id: "aviator" as Game,
    title: "AVIATOR",
    subtitle: "Cash out before it flies away",
    svg: AviatorSVG,
  },
  {
    id: "roulette" as Game,
    title: "ROULETTE",
    subtitle: "Bet on your number",
    svg: RouletteSVG,
  },
  {
    id: "teenPatti" as Game,
    title: "TEEN PATTI",
    subtitle: "Three cards, infinite glory",
    svg: TeenPattiSVG,
  },
];

export default function GameLobby() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const selectedCard = GAME_CARDS.find((c) => c.id === selectedGame);

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
            <div className="max-w-5xl mx-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {GAME_CARDS.map((card, index) => (
                  <motion.button
                    key={card.id}
                    type="button"
                    data-ocid={`lobby.${card.id}.button`}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.1 + index * 0.12,
                      duration: 0.5,
                      ease: "easeOut",
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedGame(card.id)}
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
                      style={{ height: "220px", background: "oklch(0.08 0 0)" }}
                    >
                      {card.svg}
                    </div>
                    <div
                      className="w-full px-6 py-5 flex flex-col items-center"
                      style={{
                        borderTop: "1px solid oklch(0.62 0.13 78 / 0.2)",
                      }}
                    >
                      <h3 className="font-display text-2xl font-bold uppercase tracking-widest mb-1 gold-gradient-text">
                        {card.title}
                      </h3>
                      <p className="text-sm text-muted-foreground tracking-wider">
                        {card.subtitle}
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
                ))}
              </div>
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
                  {selectedCard?.title}
                </span>
              </button>
            </div>
            {selectedGame === "roulette" && <RouletteGame />}
            {selectedGame === "aviator" && <AviatorGame />}
            {selectedGame === "teenPatti" && <TeenPattiGame />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
