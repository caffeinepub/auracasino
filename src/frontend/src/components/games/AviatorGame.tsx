import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useActor } from "../../hooks/useActor";
import { useBalance } from "../../hooks/useQueries";

type GameState = "idle" | "flying" | "result";

interface AviatorResult {
  win: boolean;
  payout: bigint;
  crashPoint: bigint;
  message: string;
}

const STAR_POSITIONS = [
  { x: 40, y: 18 },
  { x: 80, y: 33 },
  { x: 130, y: 10 },
  { x: 200, y: 56 },
  { x: 270, y: 10 },
  { x: 320, y: 33 },
  { x: 370, y: 18 },
  { x: 60, y: 56 },
  { x: 180, y: 33 },
  { x: 290, y: 56 },
];

export default function AviatorGame() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { data: balance } = useBalance();

  const [wager, setWager] = useState(100);
  const [targetMultiplier, setTargetMultiplier] = useState(2.0);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [displayMultiplier, setDisplayMultiplier] = useState(1.0);
  const [result, setResult] = useState<AviatorResult | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (gameState !== "flying") {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }
    startTimeRef.current = performance.now();
    const animate = (now: number) => {
      const elapsed = (now - startTimeRef.current) / 1000;
      const newVal = 1.0 + elapsed * elapsed * 0.8;
      setDisplayMultiplier(Math.min(newVal, targetMultiplier + 1));
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, targetMultiplier]);

  async function handleFly() {
    if (!actor || gameState !== "idle") return;
    setResult(null);
    setDisplayMultiplier(1.0);
    setGameState("flying");
    await new Promise((r) => setTimeout(r, 2200));
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    try {
      const res = await (actor as any).playAviator(
        BigInt(wager),
        BigInt(Math.round(targetMultiplier * 100)),
      );
      setResult(res as AviatorResult);
      setDisplayMultiplier(Number(res.crashPoint) / 100);
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["userInfo"] });
    } catch (_e) {
      setResult(null);
    }
    setGameState("result");
  }

  function handlePlayAgain() {
    setGameState("idle");
    setResult(null);
    setDisplayMultiplier(1.0);
  }

  const planeX = gameState === "flying" ? 78 : gameState === "result" ? 82 : 15;
  const planeY = gameState === "flying" ? 18 : gameState === "result" ? 22 : 75;

  return (
    <div
      className="rounded-2xl overflow-hidden max-w-2xl mx-auto"
      style={{
        background: "oklch(0.08 0.02 240)",
        border: "1px solid oklch(0.62 0.13 78 / 0.3)",
        boxShadow: "0 0 60px oklch(0 0 0 / 0.5)",
      }}
    >
      <div
        className="relative w-full"
        style={{ height: "260px", background: "oklch(0.06 0.03 240)" }}
      >
        <svg
          viewBox="0 0 400 260"
          className="w-full h-full"
          aria-label="Aviator game canvas"
        >
          <title>Aviator</title>
          <defs>
            <radialGradient id="sky" cx="50%" cy="100%" r="80%">
              <stop offset="0%" stopColor="oklch(0.12 0.05 240)" />
              <stop offset="100%" stopColor="oklch(0.05 0.02 240)" />
            </radialGradient>
            <linearGradient id="curve-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="oklch(0.85 0.18 85 / 0.2)" />
              <stop offset="100%" stopColor="oklch(0.85 0.18 85)" />
            </linearGradient>
            <linearGradient id="plane-gold" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="oklch(0.62 0.13 78)" />
              <stop offset="100%" stopColor="oklch(0.90 0.19 85)" />
            </linearGradient>
            <filter id="glow-filter">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect width="400" height="260" fill="url(#sky)" />
          {STAR_POSITIONS.map((s) => (
            <circle
              key={`star-${s.x}-${s.y}`}
              cx={s.x}
              cy={s.y}
              r="1"
              fill="white"
              opacity="0.5"
            />
          ))}
          <line
            x1="20"
            y1="240"
            x2="380"
            y2="240"
            stroke="oklch(0.85 0.18 85 / 0.12)"
            strokeWidth="1"
          />
          <line
            x1="20"
            y1="240"
            x2="20"
            y2="10"
            stroke="oklch(0.85 0.18 85 / 0.12)"
            strokeWidth="1"
          />
          <line
            x1="20"
            y1="185"
            x2="380"
            y2="185"
            stroke="oklch(0.85 0.18 85 / 0.06)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1="20"
            y1="130"
            x2="380"
            y2="130"
            stroke="oklch(0.85 0.18 85 / 0.06)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1="20"
            y1="75"
            x2="380"
            y2="75"
            stroke="oklch(0.85 0.18 85 / 0.06)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <path
            d="M20,230 Q100,220 180,180 Q260,130 360,30 L380,240 L20,240 Z"
            fill="oklch(0.85 0.18 85 / 0.05)"
          />
          <path
            d="M20,230 Q100,220 180,180 Q260,130 360,30"
            fill="none"
            stroke="url(#curve-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M20,230 Q100,220 180,180 Q260,130 360,30"
            fill="none"
            stroke="oklch(0.85 0.18 85 / 0.25)"
            strokeWidth="6"
            filter="url(#glow-filter)"
          />
          <motion.g
            animate={{ x: planeX * 4, y: planeY * 2.6 }}
            transition={{
              duration: gameState === "flying" ? 2.2 : 0.3,
              ease: "easeInOut",
            }}
          >
            <g transform="rotate(-30, 0, 0)">
              <ellipse cx="0" cy="0" rx="18" ry="6" fill="url(#plane-gold)" />
              <ellipse
                cx="12"
                cy="-2"
                rx="7"
                ry="4"
                fill="oklch(0.92 0.15 85)"
              />
              <polygon
                points="-4,-7 -14,-20 -20,-7"
                fill="oklch(0.78 0.16 82)"
              />
              <polygon points="-4,7 -14,20 -20,7" fill="oklch(0.78 0.16 82)" />
              <polygon
                points="-16,-3 -24,-12 -18,-3"
                fill="oklch(0.62 0.13 78)"
              />
            </g>
          </motion.g>
          <text
            x="30"
            y="50"
            fontFamily="monospace"
            fontSize="36"
            fontWeight="bold"
            fill={
              result?.win
                ? "oklch(0.83 0.19 155)"
                : result
                  ? "oklch(0.72 0.25 25)"
                  : "oklch(0.87 0.19 85)"
            }
            opacity="0.95"
          >
            {displayMultiplier.toFixed(2)}x
          </text>
        </svg>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {gameState === "result" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-5 p-4 rounded-xl text-center"
              style={{
                background: result.win
                  ? "oklch(0.83 0.19 155 / 0.1)"
                  : "oklch(0.62 0.25 25 / 0.1)",
                border: `1px solid ${result.win ? "oklch(0.83 0.19 155 / 0.4)" : "oklch(0.62 0.25 25 / 0.4)"}`,
              }}
            >
              <p
                className="font-bold text-lg"
                style={{
                  color: result.win
                    ? "oklch(0.83 0.19 155)"
                    : "oklch(0.72 0.25 25)",
                }}
                data-ocid={
                  result.win ? "aviator.success_state" : "aviator.error_state"
                }
              >
                {result.win
                  ? `✈️ You cashed out at ${targetMultiplier}x! Won ${Number(result.payout).toLocaleString()} coins!`
                  : `💥 Crashed at ${(Number(result.crashPoint) / 100).toFixed(2)}x before your ${targetMultiplier}x cashout!`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col sm:flex-row gap-4 mb-5">
          <div className="flex-1">
            <label
              htmlFor="aviator-wager"
              className="block text-xs uppercase tracking-wider mb-2"
              style={{ color: "oklch(0.85 0.18 85)" }}
            >
              Wager
            </label>
            <input
              id="aviator-wager"
              data-ocid="aviator.wager.input"
              type="number"
              min={10}
              value={wager}
              onChange={(e) => setWager(Math.max(10, Number(e.target.value)))}
              disabled={gameState === "flying"}
              className="w-full px-4 py-2 rounded-lg text-white bg-transparent outline-none"
              style={{
                border: "1px solid oklch(0.62 0.13 78 / 0.4)",
                background: "oklch(0.08 0 0)",
              }}
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="aviator-target"
              className="block text-xs uppercase tracking-wider mb-2"
              style={{ color: "oklch(0.85 0.18 85)" }}
            >
              Target Cashout:{" "}
              <span style={{ color: "oklch(0.90 0.19 85)" }}>
                {targetMultiplier.toFixed(1)}x
              </span>
            </label>
            <input
              id="aviator-target"
              data-ocid="aviator.target.input"
              type="range"
              min={1.1}
              max={10.0}
              step={0.1}
              value={targetMultiplier}
              onChange={(e) => setTargetMultiplier(Number(e.target.value))}
              disabled={gameState === "flying"}
              className="w-full accent-yellow-400"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-muted-foreground">
            Balance:{" "}
            <span style={{ color: "oklch(0.85 0.18 85)" }}>
              {balance !== undefined ? Number(balance).toLocaleString() : "—"}{" "}
              coins
            </span>
          </span>
        </div>

        {gameState === "result" ? (
          <button
            type="button"
            data-ocid="aviator.play_again.button"
            onClick={handlePlayAgain}
            className="w-full py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-opacity hover:opacity-90"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.87 0.19 85), oklch(0.62 0.13 78))",
              color: "oklch(0.07 0 0)",
            }}
          >
            Fly Again
          </button>
        ) : (
          <button
            type="button"
            data-ocid="aviator.fly.primary_button"
            onClick={handleFly}
            disabled={gameState === "flying" || !actor || wager < 10}
            className="w-full py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-all disabled:opacity-50"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.87 0.19 85), oklch(0.62 0.13 78))",
              color: "oklch(0.07 0 0)",
            }}
          >
            {gameState === "flying" ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 0.8,
                  }}
                >
                  ✈️
                </motion.span>
                Flying…
              </span>
            ) : (
              `✈️ Fly & Cash Out at ${targetMultiplier.toFixed(1)}x`
            )}
          </button>
        )}
      </div>
    </div>
  );
}
