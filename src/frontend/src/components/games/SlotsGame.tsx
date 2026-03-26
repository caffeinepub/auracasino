import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { usePlayerSession } from "../../contexts/PlayerSessionContext";

interface SlotsGameProps {
  onBack: () => void;
  requireLogin: (onSuccess?: () => void) => void;
}

const SYMBOLS = ["🍒", "🔔", "💎", "7️⃣", "⭐", "🍋"];
const SYMBOL_PAYOUTS: Record<string, number> = {
  "🍒": 10,
  "🔔": 15,
  "💎": 30,
  "7️⃣": 50,
  "⭐": 20,
  "🍋": 8,
};

function getRandomSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function calcPayout(reels: string[], wager: number): number {
  if (reels[0] === reels[1] && reels[1] === reels[2])
    return wager * SYMBOL_PAYOUTS[reels[0]];
  if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2])
    return Math.floor(wager * 1.5);
  return 0;
}

const SPIN_DURATION = 1400;

export default function SlotsGame({ onBack, requireLogin }: SlotsGameProps) {
  const { session, updateBalance } = usePlayerSession();
  const [wager, setWager] = useState(50);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState(["🍒", "💎", "⭐"]);
  const [result, setResult] = useState<{
    win: boolean;
    payout: number;
    message: string;
  } | null>(null);
  const [spinningReels, setSpinningReels] = useState([false, false, false]);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const handleSpin = () => requireLogin(() => doSpin());

  const doSpin = () => {
    if (spinning || !session || wager > session.balance) return;
    for (const t of timeouts.current) clearTimeout(t);
    timeouts.current = [];
    setSpinning(true);
    setResult(null);
    setSpinningReels([true, true, true]);
    const finalReels = [
      getRandomSymbol(),
      getRandomSymbol(),
      getRandomSymbol(),
    ];
    for (const i of [0, 1, 2]) {
      const t = setTimeout(
        () => {
          setReels((prev) => {
            const next = [...prev];
            next[i] = finalReels[i];
            return next;
          });
          setSpinningReels((prev) => {
            const next = [...prev];
            next[i] = false;
            return next;
          });
          if (i === 2) {
            const payout = calcPayout(finalReels, wager);
            const win = payout > 0;
            updateBalance(session.balance - wager + payout);
            setResult({
              win,
              payout,
              message: win
                ? payout >= wager * 10
                  ? "JACKPOT! 🎉"
                  : "Winner!"
                : "Try again!",
            });
            setSpinning(false);
          }
        },
        SPIN_DURATION + i * 300,
      );
      timeouts.current.push(t);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.08 0.025 264) 0%, oklch(0.06 0.02 264) 100%)",
      }}
    >
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-lg transition-colors hover:bg-muted"
            data-ocid="slots.back_button"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-extrabold neon-purple">🎰 Slots</h1>
          {session && (
            <span
              className="ml-auto text-sm font-semibold"
              style={{ color: "oklch(0.87 0.15 195)" }}
            >
              💰 {session.balance.toLocaleString()}
            </span>
          )}
        </div>
        <div
          className="rounded-2xl p-6 mb-4 text-center"
          style={{
            background: "oklch(0.11 0.03 264)",
            border: "1px solid oklch(0.72 0.22 295 / 0.4)",
            boxShadow: "0 0 40px oklch(0.72 0.22 295 / 0.15)",
          }}
        >
          <div className="flex gap-3 justify-center mb-6">
            {(["reel-0", "reel-1", "reel-2"] as const).map((rid, i) => (
              <div
                key={rid}
                className="w-24 h-24 rounded-xl flex items-center justify-center text-5xl"
                style={{
                  background: "oklch(0.15 0.04 264)",
                  border: "2px solid oklch(0.72 0.22 295 / 0.4)",
                  boxShadow: spinningReels[i]
                    ? "0 0 20px oklch(0.72 0.22 295 / 0.5)"
                    : "none",
                }}
                data-ocid="slots.canvas_target"
              >
                {spinningReels[i]
                  ? SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
                  : reels[i]}
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            3 Match:{" "}
            {Object.entries(SYMBOL_PAYOUTS)
              .map(([s, p]) => `${s}=${p}x`)
              .join(" ")}
          </div>
          <p className="text-xs text-muted-foreground">2 Match = 1.5x wager</p>
        </div>
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl p-4 mb-4 text-center font-bold"
              style={{
                background: result.win
                  ? "oklch(0.82 0.19 155 / 0.15)"
                  : "oklch(0.62 0.25 25 / 0.15)",
                border: `1px solid ${result.win ? "oklch(0.82 0.19 155 / 0.4)" : "oklch(0.62 0.25 25 / 0.4)"}`,
              }}
              data-ocid={
                result.win ? "slots.success_state" : "slots.error_state"
              }
            >
              <p
                className={
                  result.win ? "win-text text-xl" : "loss-text text-xl"
                }
              >
                {result.message}
              </p>
              {result.win && (
                <p
                  className="text-sm"
                  style={{ color: "oklch(0.87 0.15 195)" }}
                >
                  +{result.payout} coins
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <div
          className="rounded-xl p-5"
          style={{
            background: "oklch(0.11 0.03 264)",
            border: "1px solid oklch(0.22 0.04 264)",
          }}
        >
          <div className="mb-4">
            <label
              htmlFor="slots-wager"
              className="text-xs text-muted-foreground uppercase tracking-wider block mb-2"
            >
              Bet Amount
            </label>
            <div className="flex gap-2">
              {[25, 50, 100, 250].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setWager(v)}
                  className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                  style={{
                    background:
                      wager === v
                        ? "oklch(0.72 0.22 295 / 0.3)"
                        : "oklch(0.16 0.03 264)",
                    color:
                      wager === v
                        ? "oklch(0.72 0.22 295)"
                        : "oklch(0.6 0.03 264)",
                    border: `1px solid ${wager === v ? "oklch(0.72 0.22 295 / 0.5)" : "oklch(0.22 0.04 264)"}`,
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
            <input id="slots-wager" type="hidden" value={wager} readOnly />
          </div>
          <button
            type="button"
            onClick={handleSpin}
            disabled={spinning}
            className="w-full py-4 rounded-xl font-extrabold text-xl transition-all disabled:opacity-50"
            style={{
              background: spinning
                ? "oklch(0.2 0.04 264)"
                : "linear-gradient(135deg, oklch(0.72 0.22 295), oklch(0.6 0.2 295))",
              color: "white",
              boxShadow: spinning
                ? "none"
                : "0 0 25px oklch(0.72 0.22 295 / 0.5)",
            }}
            data-ocid="slots.primary_button"
          >
            {spinning ? "Spinning..." : "🎰 SPIN"}
          </button>
        </div>
      </div>
    </div>
  );
}
