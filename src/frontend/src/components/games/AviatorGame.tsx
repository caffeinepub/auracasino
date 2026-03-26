import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { usePlayerSession } from "../../contexts/PlayerSessionContext";
import { getAnonActor } from "../../utils/anonActor";

interface AviatorGameProps {
  onBack: () => void;
  requireLogin: (onSuccess?: () => void) => void;
}

type GamePhase = "waiting" | "flying" | "cashed" | "crashed";

export default function AviatorGame({
  onBack,
  requireLogin,
}: AviatorGameProps) {
  const { session, updateBalance } = usePlayerSession();
  const [wager, setWager] = useState("100");
  const [targetMultiplier, setTargetMultiplier] = useState("2.00");
  const [phase, setPhase] = useState<GamePhase>("waiting");
  const [multiplier, setMultiplier] = useState(1.0);
  const [result, setResult] = useState<{
    win: boolean;
    message: string;
    payout: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleBet = () => requireLogin(() => doFly());

  const doFly = async () => {
    if (loading || !session) return;
    const wagerNum = Number(wager);
    if (wagerNum <= 0 || wagerNum > session.balance) return;
    const targetNum = Math.round(Number(targetMultiplier) * 100);
    setLoading(true);
    setResult(null);
    setPhase("flying");
    setMultiplier(1.0);
    let current = 1.0;
    intervalRef.current = setInterval(() => {
      current += 0.05;
      setMultiplier(Number.parseFloat(current.toFixed(2)));
    }, 80);
    try {
      const actor = await getAnonActor();
      const res = await (actor as any).playerPlayAviator(
        session.username,
        session.password,
        BigInt(wagerNum),
        BigInt(targetNum),
      );
      if (intervalRef.current) clearInterval(intervalRef.current);
      const crashPoint = Number(res.crashPoint) / 100;
      setMultiplier(crashPoint);
      if (res.win) {
        setPhase("cashed");
        const payout = Number(res.payout);
        updateBalance(session.balance - wagerNum + payout);
        setResult({ win: true, message: res.message, payout });
      } else {
        setPhase("crashed");
        updateBalance(session.balance - wagerNum);
        setResult({ win: false, message: res.message, payout: 0 });
      }
    } catch {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setPhase("crashed");
      setResult({
        win: false,
        message: "Connection error. Try again.",
        payout: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPhase("waiting");
    setMultiplier(1.0);
    setResult(null);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.08 0.025 264) 0%, oklch(0.06 0.02 264) 100%)",
      }}
    >
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-lg transition-colors hover:bg-muted"
            data-ocid="aviator.back_button"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-extrabold neon-cyan">✈️ Aviator</h1>
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
          className="rounded-2xl p-8 mb-6 text-center relative overflow-hidden"
          style={{
            background: "oklch(0.11 0.03 264)",
            border: "1px solid oklch(0.25 0.05 264)",
            minHeight: "200px",
          }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background:
                "radial-gradient(ellipse at center, oklch(0.87 0.15 195) 0%, transparent 70%)",
            }}
          />
          <div className="relative">
            {phase === "flying" && (
              <div className="text-7xl font-black mb-2 neon-green animate-multiplier-rise">
                {multiplier.toFixed(2)}x
              </div>
            )}
            {phase === "cashed" && (
              <div className="text-7xl font-black mb-2 win-text animate-multiplier-rise">
                {multiplier.toFixed(2)}x
              </div>
            )}
            {phase === "crashed" && (
              <div
                className="text-7xl font-black mb-2 animate-crash-shake"
                style={{ color: "oklch(0.65 0.25 25)" }}
              >
                {multiplier.toFixed(2)}x
              </div>
            )}
            {phase === "waiting" && (
              <div
                className="text-5xl font-black mb-2"
                style={{ color: "oklch(0.5 0.03 264)" }}
              >
                —
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              {phase === "waiting" && "Place your bet and fly!"}
              {phase === "flying" && "🛫 Flying..."}
              {phase === "cashed" && "🎉 Cashed out!"}
              {phase === "crashed" && "💥 Crashed!"}
            </p>
          </div>
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
                result.win ? "aviator.success_state" : "aviator.error_state"
              }
            >
              <p className={result.win ? "win-text" : "loss-text"}>
                {result.win ? `+${result.payout} coins` : "Lost"} —{" "}
                {result.message}
              </p>
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
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="aviator-wager"
                className="text-xs text-muted-foreground uppercase tracking-wider block mb-1"
              >
                Wager (coins)
              </label>
              <input
                id="aviator-wager"
                type="number"
                value={wager}
                onChange={(e) => setWager(e.target.value)}
                min="1"
                className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none border"
                style={{
                  background: "oklch(0.15 0.03 264)",
                  borderColor: "oklch(0.28 0.05 264)",
                }}
                data-ocid="aviator.input"
              />
            </div>
            <div>
              <label
                htmlFor="aviator-multiplier"
                className="text-xs text-muted-foreground uppercase tracking-wider block mb-1"
              >
                Target Multiplier
              </label>
              <input
                id="aviator-multiplier"
                type="number"
                value={targetMultiplier}
                onChange={(e) => setTargetMultiplier(e.target.value)}
                step="0.1"
                min="1.1"
                className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none border"
                style={{
                  background: "oklch(0.15 0.03 264)",
                  borderColor: "oklch(0.28 0.05 264)",
                }}
                data-ocid="aviator.input"
              />
            </div>
          </div>
          {phase === "waiting" && (
            <button
              type="button"
              onClick={handleBet}
              disabled={loading}
              className="w-full py-4 rounded-xl font-extrabold text-lg btn-neon-green transition-all disabled:opacity-50"
              data-ocid="aviator.primary_button"
            >
              ✈️ FLY / BET
            </button>
          )}
          {(phase === "cashed" || phase === "crashed") && (
            <button
              type="button"
              onClick={reset}
              className="w-full py-4 rounded-xl font-extrabold text-lg btn-neon-cyan transition-all"
              data-ocid="aviator.secondary_button"
            >
              Play Again
            </button>
          )}
          {phase === "flying" && (
            <button
              type="button"
              disabled
              className="w-full py-4 rounded-xl font-extrabold text-lg opacity-50 cursor-not-allowed"
              style={{
                background: "oklch(0.2 0.04 264)",
                color: "oklch(0.6 0.03 264)",
              }}
            >
              Flying...
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
