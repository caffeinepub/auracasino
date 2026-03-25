import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { usePlayHiLo, useUserInfo } from "../../hooks/useQueries";

type GameState = "idle" | "flying" | "crashed" | "cashedout";

const GRID_FRACTIONS = [0.25, 0.5, 0.75];

function generateCrashPoint(): number {
  const raw = (1 / (1 - Math.random())) * 0.97;
  return Math.min(20, Math.max(1.1, raw));
}

export default function AviatorGame() {
  const [wager, setWager] = useState("50");
  const [state, setState] = useState<GameState>("idle");
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(1.5);
  const [cashoutMultiplier, setCashoutMultiplier] = useState<number | null>(
    null,
  );

  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const crashPointRef = useRef<number>(1.5);

  const { data: userInfo } = useUserInfo();
  const playHiLo = usePlayHiLo();

  const cleanup = useCallback(() => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  function startFlight() {
    const bet = Number.parseInt(wager, 10);
    if (!bet || bet < 1) {
      toast.error("Enter a valid wager!");
      return;
    }
    const cp = generateCrashPoint();
    setCrashPoint(cp);
    crashPointRef.current = cp;
    setMultiplier(1.0);
    setCashoutMultiplier(null);
    setState("flying");
    startTimeRef.current = performance.now();

    function tick(now: number) {
      const elapsed = (now - startTimeRef.current) / 1000;
      const current = Math.max(1.0, Math.E ** (elapsed * 0.4));
      setMultiplier(current);
      if (current >= crashPointRef.current) {
        setMultiplier(crashPointRef.current);
        setState("crashed");
        playHiLo.mutate(
          { wager: bet, guess: "lower", currentCard: BigInt(13) },
          {
            onSettled: () => {
              toast.error(
                `💥 Crashed at ${crashPointRef.current.toFixed(2)}x! Lost ${bet} coins.`,
              );
            },
          },
        );
        return;
      }
      animRef.current = requestAnimationFrame(tick);
    }
    animRef.current = requestAnimationFrame(tick);
  }

  function cashOut() {
    if (state !== "flying") return;
    cleanup();
    const bet = Number.parseInt(wager, 10);
    const payout = Math.floor(bet * multiplier);
    setCashoutMultiplier(multiplier);
    setState("cashedout");
    playHiLo.mutate(
      { wager: bet, guess: "higher", currentCard: BigInt(1) },
      {
        onSettled: () => {
          toast.success(
            `🚀 Cashed out at ${multiplier.toFixed(2)}x! Won ${payout} coins!`,
          );
        },
      },
    );
  }

  const bet = Number.parseInt(wager, 10) || 0;
  const potentialWin = Math.floor(bet * multiplier);
  const isFlying = state === "flying";
  const planeY = isFlying ? Math.min(60, (multiplier - 1) * 12) : 0;
  const planeX = isFlying ? Math.min(40, (multiplier - 1) * 8) : 0;

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "oklch(0.10 0 0)",
        border: "1px solid oklch(0.62 0.13 78 / 0.4)",
        minHeight: "480px",
      }}
    >
      <div
        className="px-5 py-4"
        style={{ borderBottom: "1px solid oklch(0.62 0.13 78 / 0.2)" }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-bold uppercase tracking-widest gold-gradient-text">
            Aviator
          </h3>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Multiplier Crash
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-5 py-5 gap-5">
        {/* Flight display */}
        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            height: "220px",
            background: "oklch(0.07 0.02 250)",
            border: "1px solid oklch(0.62 0.13 78 / 0.2)",
          }}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="none"
          >
            <title>Aviator flight display</title>
            {GRID_FRACTIONS.map((f) => (
              <line
                key={`h-${f}`}
                x1="0"
                y1={`${f * 100}%`}
                x2="100%"
                y2={`${f * 100}%`}
                stroke="oklch(0.62 0.13 78 / 0.1)"
                strokeWidth="1"
                strokeDasharray="6,6"
              />
            ))}
            {GRID_FRACTIONS.map((f) => (
              <line
                key={`v-${f}`}
                x1={`${f * 100}%`}
                y1="0"
                x2={`${f * 100}%`}
                y2="100%"
                stroke="oklch(0.62 0.13 78 / 0.1)"
                strokeWidth="1"
                strokeDasharray="6,6"
              />
            ))}
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {state === "crashed" ? (
                <motion.div
                  key="crashed"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <p
                    className="text-6xl font-black"
                    style={{ color: "oklch(0.62 0.25 25)" }}
                  >
                    {crashPoint.toFixed(2)}x
                  </p>
                  <p
                    className="text-sm uppercase tracking-widest mt-2"
                    style={{ color: "oklch(0.62 0.25 25)" }}
                  >
                    CRASHED
                  </p>
                </motion.div>
              ) : state === "cashedout" ? (
                <motion.div
                  key="cashedout"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <p className="text-6xl font-black gold-gradient-text">
                    {cashoutMultiplier?.toFixed(2)}x
                  </p>
                  <p className="text-sm uppercase tracking-widest mt-2 win-glow">
                    CASHED OUT!
                  </p>
                </motion.div>
              ) : (
                <motion.div key="flying" className="text-center">
                  <motion.p
                    className="font-black gold-gradient-text tabular-nums"
                    style={{
                      fontSize: isFlying ? "clamp(3rem, 8vw, 5rem)" : "3rem",
                    }}
                    animate={{ scale: isFlying ? [1, 1.02, 1] : 1 }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 0.5,
                    }}
                  >
                    {multiplier.toFixed(2)}x
                  </motion.p>
                  {!isFlying && (
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mt-2">
                      Waiting for takeoff…
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {isFlying && (
              <motion.div
                initial={{ x: 40, y: 180, opacity: 0 }}
                animate={{
                  x: 40 + planeX * 2,
                  y: 180 - planeY * 2.2,
                  opacity: 1,
                }}
                className="absolute text-3xl pointer-events-none"
                style={{
                  filter: "drop-shadow(0 0 8px oklch(0.85 0.18 85 / 0.8))",
                }}
              >
                ✈
              </motion.div>
            )}
          </AnimatePresence>

          {isFlying && (
            <svg
              className="absolute inset-0 w-full h-full"
              style={{ pointerEvents: "none" }}
            >
              <title>Multiplier trail</title>
              <path
                d={`M40,${220 - 20} Q${40 + planeX * 2},${180 - planeY} ${40 + planeX * 2 + 10},${220 - planeY * 2.2}`}
                stroke="oklch(0.85 0.18 85 / 0.5)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>

        {userInfo && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground uppercase tracking-wider text-xs">
              Balance
            </span>
            <span
              className="font-bold tabular-nums"
              style={{ color: "oklch(0.85 0.18 85)" }}
            >
              {Number(userInfo.balance).toLocaleString()} coins
            </span>
          </div>
        )}

        <div className="flex gap-3 items-center">
          <div className="flex-1">
            <label
              htmlFor="aviator-wager"
              className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block"
            >
              Wager (coins)
            </label>
            <Input
              id="aviator-wager"
              data-ocid="aviator.input"
              type="number"
              min={1}
              value={wager}
              onChange={(e) => setWager(e.target.value)}
              disabled={isFlying}
              style={{
                background: "oklch(0.14 0 0)",
                border: "1px solid oklch(0.62 0.13 78 / 0.3)",
                color: "oklch(0.97 0 0)",
              }}
            />
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Potential
            </p>
            <p className="font-bold" style={{ color: "oklch(0.85 0.18 85)" }}>
              {potentialWin.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {[10, 25, 50, 100, 250].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setWager(String(v))}
              disabled={isFlying}
              className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background:
                  wager === String(v)
                    ? "linear-gradient(135deg, oklch(0.87 0.19 85), oklch(0.62 0.13 78))"
                    : "oklch(0.17 0 0)",
                color:
                  wager === String(v) ? "oklch(0.07 0 0)" : "oklch(0.65 0 0)",
                border: `1px solid ${wager === String(v) ? "oklch(0.85 0.18 85 / 0.6)" : "oklch(0.62 0.13 78 / 0.2)"}`,
              }}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="flex gap-3 mt-auto">
          {(state === "idle" ||
            state === "crashed" ||
            state === "cashedout") && (
            <Button
              data-ocid="aviator.primary_button"
              onClick={startFlight}
              className="flex-1 font-bold uppercase tracking-wider text-base py-6"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.87 0.19 85), oklch(0.62 0.13 78))",
                color: "oklch(0.07 0 0)",
                border: "none",
              }}
            >
              {state === "idle" ? "🛫 TAKE OFF" : "🔄 PLAY AGAIN"}
            </Button>
          )}
          {isFlying && (
            <Button
              data-ocid="aviator.secondary_button"
              onClick={cashOut}
              className="flex-1 font-bold uppercase tracking-wider text-base py-6 animate-pulse-gold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.83 0.19 155), oklch(0.65 0.15 155))",
                color: "white",
                border: "none",
              }}
            >
              💰 CASH OUT ({multiplier.toFixed(2)}x)
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
