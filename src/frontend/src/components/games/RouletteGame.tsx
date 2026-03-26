import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { usePlayerSession } from "../../contexts/PlayerSessionContext";
import { getAnonActor } from "../../utils/anonActor";

interface RouletteGameProps {
  onBack: () => void;
  requireLogin: (onSuccess?: () => void) => void;
}

const RED_NUMBERS = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];

function getNumberColor(n: number) {
  if (n === 0) return "green";
  return RED_NUMBERS.includes(n) ? "red" : "black";
}

function getOutsideBetBg(key: string, isActive: boolean): string {
  if (key === "color:red")
    return isActive ? "oklch(0.65 0.25 25 / 0.5)" : "oklch(0.45 0.18 25)";
  if (key === "color:black") return "oklch(0.15 0 0)";
  return isActive ? "oklch(0.72 0.22 295 / 0.3)" : "oklch(0.16 0.03 264)";
}

export default function RouletteGame({
  onBack,
  requireLogin,
}: RouletteGameProps) {
  const { session, updateBalance } = usePlayerSession();
  const [bets, setBets] = useState<Record<string, number>>({});
  const [wager, setWager] = useState(50);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{
    win: boolean;
    number: number;
    message: string;
    payout: number;
  } | null>(null);

  const placeBet = (key: string) =>
    setBets((prev) => ({ ...prev, [key]: (prev[key] || 0) + wager }));
  const clearBets = () => setBets({});
  const handleSpin = () => requireLogin(() => doSpin());

  const doSpin = async () => {
    if (spinning || !session || Object.keys(bets).length === 0) return;
    const totalWager = Object.values(bets).reduce((a, b) => a + b, 0);
    if (totalWager > session.balance) return;
    setSpinning(true);
    setResult(null);
    try {
      const actor = await getAnonActor();
      const rouletteBets = Object.entries(bets).map(([key, w]) => {
        const [betType, betValue] = key.split(":");
        return { betType, betValue: BigInt(betValue || 0), wager: BigInt(w) };
      });
      const res = await (actor as any).playerPlayRouletteMulti(
        session.username,
        session.password,
        rouletteBets,
      );
      const winNum = Number(res.result);
      const payout = Number(res.totalPayout);
      updateBalance(session.balance - totalWager + payout);
      setResult({ win: res.win, number: winNum, message: res.message, payout });
    } catch {
      setResult({
        win: false,
        number: 0,
        message: "Connection error. Try again.",
        payout: 0,
      });
    } finally {
      setSpinning(false);
      setBets({});
    }
  };

  const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.08 0.025 264) 0%, oklch(0.06 0.02 264) 100%)",
      }}
    >
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-lg transition-colors hover:bg-muted"
            data-ocid="roulette.back_button"
          >
            <ArrowLeft size={20} />
          </button>
          <h1
            className="text-2xl font-extrabold"
            style={{ color: "oklch(0.75 0.25 25)" }}
          >
            🎡 Roulette
          </h1>
          {session && (
            <span
              className="ml-auto text-sm font-semibold"
              style={{ color: "oklch(0.87 0.15 195)" }}
            >
              💰 {session.balance.toLocaleString()}
            </span>
          )}
        </div>
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl p-4 mb-4 text-center font-bold"
              style={{
                background: result.win
                  ? "oklch(0.82 0.19 155 / 0.15)"
                  : "oklch(0.62 0.25 25 / 0.15)",
                border: `1px solid ${result.win ? "oklch(0.82 0.19 155 / 0.4)" : "oklch(0.62 0.25 25 / 0.4)"}`,
              }}
              data-ocid={
                result.win ? "roulette.success_state" : "roulette.error_state"
              }
            >
              <span
                className="text-2xl font-black mr-3"
                style={{
                  color:
                    getNumberColor(result.number) === "red"
                      ? "oklch(0.65 0.25 25)"
                      : getNumberColor(result.number) === "green"
                        ? "oklch(0.65 0.2 155)"
                        : "white",
                }}
              >
                {result.number}
              </span>
              <span className={result.win ? "win-text" : "loss-text"}>
                {result.win ? `WIN +${result.payout}` : "LOSE"} —{" "}
                {result.message}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <div
          className="rounded-2xl p-4 mb-4"
          style={{
            background: "oklch(0.11 0.03 264)",
            border: "1px solid oklch(0.22 0.04 264)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-muted-foreground">
              Chip:{" "}
              <span style={{ color: "oklch(0.87 0.15 195)" }}>{wager}</span>
            </span>
            <div className="flex gap-2">
              {[10, 50, 100, 500].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setWager(v)}
                  className="px-2.5 py-1 rounded text-xs font-bold transition-all"
                  style={{
                    background:
                      wager === v
                        ? "oklch(0.87 0.15 195 / 0.2)"
                        : "oklch(0.16 0.03 264)",
                    color:
                      wager === v
                        ? "oklch(0.87 0.15 195)"
                        : "oklch(0.6 0.03 264)",
                    border: `1px solid ${wager === v ? "oklch(0.87 0.15 195 / 0.4)" : "oklch(0.22 0.04 264)"}`,
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div
            className="grid gap-0.5 mb-3"
            style={{ gridTemplateColumns: "repeat(13, minmax(0, 1fr))" }}
          >
            <button
              type="button"
              className="rounded text-xs font-bold py-3 transition-all hover:brightness-125"
              style={{
                background: bets["number:0"]
                  ? "oklch(0.65 0.2 155 / 0.6)"
                  : "oklch(0.4 0.15 155)",
                color: "white",
                border: "1px solid oklch(0.5 0.15 155 / 0.5)",
                gridColumn: "1 / span 1",
              }}
              onClick={() => placeBet("number:0")}
              data-ocid="roulette.canvas_target"
            >
              0{bets["number:0"] ? ` (${bets["number:0"]})` : ""}
            </button>
            {[...Array(36)].map((_, i) => {
              const n = i + 1;
              const color = getNumberColor(n);
              const betKey = `number:${n}`;
              return (
                <button
                  type="button"
                  key={n}
                  onClick={() => placeBet(betKey)}
                  className="rounded text-xs font-bold py-2 transition-all hover:brightness-125"
                  style={{
                    background: bets[betKey]
                      ? color === "red"
                        ? "oklch(0.65 0.25 25)"
                        : "oklch(0.3 0 0)"
                      : color === "red"
                        ? "oklch(0.45 0.18 25)"
                        : "oklch(0.2 0 0)",
                    color: "white",
                    border: `1px solid ${bets[betKey] ? "oklch(0.87 0.15 195 / 0.6)" : "oklch(0.28 0.05 264 / 0.5)"}`,
                  }}
                  data-ocid="roulette.canvas_target"
                >
                  {n}
                  {bets[betKey] ? (
                    <span
                      className="block text-xs"
                      style={{ color: "oklch(0.87 0.15 195)" }}
                    >
                      ★
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-6 gap-1">
            {[
              { label: "1-18", key: "range:1" },
              { label: "EVEN", key: "parity:even" },
              { label: "RED", key: "color:red" },
              { label: "BLACK", key: "color:black" },
              { label: "ODD", key: "parity:odd" },
              { label: "19-36", key: "range:2" },
            ].map(({ label, key }) => (
              <button
                key={key}
                type="button"
                onClick={() => placeBet(key)}
                className="py-2 rounded text-xs font-bold transition-all hover:brightness-125"
                style={{
                  background: getOutsideBetBg(key, !!bets[key]),
                  color: bets[key]
                    ? "oklch(0.72 0.22 295)"
                    : "oklch(0.7 0.03 264)",
                  border: `1px solid ${bets[key] ? "oklch(0.72 0.22 295 / 0.5)" : "oklch(0.22 0.04 264)"}`,
                }}
                data-ocid="roulette.canvas_target"
              >
                {label}
                {bets[key] ? ` (${bets[key]})` : ""}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={clearBets}
            className="flex-1 py-3 rounded-xl font-bold text-sm transition-all"
            style={{
              background: "oklch(0.62 0.25 25 / 0.15)",
              color: "oklch(0.75 0.2 25)",
              border: "1px solid oklch(0.62 0.25 25 / 0.3)",
            }}
            data-ocid="roulette.secondary_button"
          >
            Clear ({totalBet})
          </button>
          <button
            type="button"
            onClick={handleSpin}
            disabled={spinning || Object.keys(bets).length === 0}
            className="flex-[2] py-3 rounded-xl font-extrabold text-lg btn-neon-cyan transition-all disabled:opacity-50"
            data-ocid="roulette.primary_button"
          >
            {spinning ? "Spinning..." : "🎡 SPIN"}
          </button>
        </div>
      </div>
    </div>
  );
}
