import { motion } from "motion/react";
import { useState } from "react";

const GAMES = [
  {
    id: "aviator",
    name: "Aviator",
    badge: "HOT",
    badgeColor: "oklch(0.82 0.19 155)",
    img: "/assets/generated/aviator-card.dim_400x300.jpg",
  },
  {
    id: "andarbahr",
    name: "Andar Bahar",
    badge: "HOT",
    badgeColor: "oklch(0.82 0.19 155)",
    img: "/assets/generated/andar-bahar-thumb.dim_400x300.jpg",
  },
  {
    id: "roulette",
    name: "Roulette",
    badge: "HOT",
    badgeColor: "oklch(0.82 0.19 155)",
    img: "/assets/generated/roulette-card.dim_400x300.jpg",
  },
  {
    id: "slots",
    name: "Slots",
    badge: "NEW",
    badgeColor: "oklch(0.72 0.22 295)",
    img: "/assets/generated/slots-card.dim_400x300.jpg",
  },
];

interface GameLobbyProps {
  onSelectGame: (gameId: string) => void;
}

function GameCard({
  game,
  onSelect,
  index,
}: { game: (typeof GAMES)[0]; onSelect: () => void; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="relative rounded-xl overflow-hidden cursor-pointer group card-neon-hover"
      style={{
        border: "1px solid oklch(0.22 0.04 264)",
        background: "oklch(0.12 0.03 264)",
      }}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-ocid={`game.${game.id}.card`}
    >
      {/* Game Image */}
      <div className="relative w-full" style={{ paddingBottom: "75%" }}>
        <img
          src={game.img}
          alt={game.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Badge */}
        <div
          className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-extrabold"
          style={{ background: game.badgeColor, color: "oklch(0.05 0.02 264)" }}
        >
          {game.badge}
        </div>
        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-all duration-300"
          style={{
            background: hovered ? "oklch(0.05 0.02 264 / 0.75)" : "transparent",
          }}
        >
          {hovered && (
            <motion.button
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-6 py-2.5 rounded-lg font-extrabold text-sm btn-neon-cyan"
              data-ocid={`game.${game.id}.primary_button`}
            >
              PLAY NOW
            </motion.button>
          )}
        </div>
      </div>
      {/* Name bar */}
      <div className="px-3 py-2.5">
        <p className="font-bold text-sm text-foreground">{game.name}</p>
      </div>
    </motion.div>
  );
}

export default function GameLobby({ onSelectGame }: GameLobbyProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="mb-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-extrabold mb-2 neon-cyan"
        >
          🎰 AuraCasino
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-sm"
        >
          Premium Games • Real Winnings • Play Now
        </motion.p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {GAMES.map((game, i) => (
          <GameCard
            key={game.id}
            game={game}
            onSelect={() => onSelectGame(game.id)}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
