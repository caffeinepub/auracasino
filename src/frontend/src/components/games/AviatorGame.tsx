import { ArrowLeft, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { usePlayerSession } from "../../contexts/PlayerSessionContext";
import { getAnonActor } from "../../utils/anonActor";

interface AviatorGameProps {
  onBack: () => void;
  requireLogin: (onSuccess?: () => void) => void;
}

type GamePhase = "waiting" | "flying" | "cashed" | "crashed";
type BetTab = "all" | "my" | "top";

const QUICK_BETS = [10, 100, 500, 1000];

const mockBets = [
  { user: "Raj***", bet: 200, mult: "3.45x", win: 690 },
  { user: "Pri***", bet: 500, mult: "2.10x", win: 1050 },
  { user: "Vik***", bet: 100, mult: "5.00x", win: 500 },
  { user: "Ani***", bet: 1000, mult: "1.52x", win: 1520 },
  { user: "Sun***", bet: 50, mult: "8.32x", win: 416 },
  { user: "Kav***", bet: 300, mult: "2.00x", win: 600 },
];

const STARS = [
  { top: 3, left: 11, size: 2, opacity: 0.4 },
  { top: 40, left: 64, size: 1, opacity: 0.5 },
  { top: 77, left: 17, size: 1, opacity: 0.3 },
  { top: 14, left: 90, size: 2, opacity: 0.6 },
  { top: 55, left: 43, size: 1, opacity: 0.4 },
  { top: 88, left: 72, size: 1, opacity: 0.3 },
  { top: 22, left: 35, size: 2, opacity: 0.5 },
  { top: 67, left: 58, size: 1, opacity: 0.4 },
  { top: 33, left: 82, size: 1, opacity: 0.6 },
  { top: 91, left: 29, size: 2, opacity: 0.3 },
  { top: 48, left: 6, size: 1, opacity: 0.5 },
  { top: 7, left: 55, size: 1, opacity: 0.4 },
  { top: 72, left: 96, size: 2, opacity: 0.3 },
  { top: 19, left: 48, size: 1, opacity: 0.6 },
  { top: 84, left: 15, size: 1, opacity: 0.4 },
  { top: 61, left: 77, size: 2, opacity: 0.5 },
  { top: 44, left: 22, size: 1, opacity: 0.3 },
  { top: 29, left: 69, size: 1, opacity: 0.6 },
  { top: 96, left: 50, size: 2, opacity: 0.4 },
  { top: 11, left: 33, size: 1, opacity: 0.5 },
  { top: 58, left: 88, size: 1, opacity: 0.3 },
  { top: 37, left: 4, size: 2, opacity: 0.6 },
  { top: 79, left: 61, size: 1, opacity: 0.4 },
  { top: 52, left: 39, size: 1, opacity: 0.5 },
  { top: 16, left: 75, size: 2, opacity: 0.3 },
  { top: 93, left: 87, size: 1, opacity: 0.6 },
  { top: 26, left: 14, size: 1, opacity: 0.4 },
  { top: 70, left: 44, size: 2, opacity: 0.5 },
  { top: 45, left: 97, size: 1, opacity: 0.3 },
  { top: 8, left: 21, size: 1, opacity: 0.6 },
];

export default function AviatorGame({
  onBack,
  requireLogin,
}: AviatorGameProps) {
  const { session, updateBalance } = usePlayerSession();
  const [wager, setWager] = useState(100);
  const [targetMultiplier, setTargetMultiplier] = useState("2.00");
  const [phase, setPhase] = useState<GamePhase>("waiting");
  const [multiplier, setMultiplier] = useState(1.0);
  const [result, setResult] = useState<{
    win: boolean;
    message: string;
    payout: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<BetTab>("all");
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoCashout, setAutoCashout] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const planeProgress = useRef(0);
  const [planePct, setPlanePct] = useState(0);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleBet = () => requireLogin(() => doFly());

  const doFly = async () => {
    if (loading || !session) return;
    if (wager <= 0 || wager > session.balance) return;
    const targetNum = Math.round(Number(targetMultiplier) * 100);
    setLoading(true);
    setResult(null);
    setPhase("flying");
    setMultiplier(1.0);
    planeProgress.current = 0;
    setPlanePct(0);
    let current = 1.0;
    intervalRef.current = setInterval(() => {
      current += 0.03 + current * 0.005;
      const capped = Math.min(current, 20);
      setMultiplier(Number.parseFloat(capped.toFixed(2)));
      planeProgress.current = Math.min(planeProgress.current + 1.2, 100);
      setPlanePct(planeProgress.current);
    }, 80);
    try {
      const actor = await getAnonActor();
      const res = await (actor as any).playerPlayAviator(
        session.username,
        session.password,
        BigInt(wager),
        BigInt(targetNum),
      );
      if (intervalRef.current) clearInterval(intervalRef.current);
      const crashPoint = Number(res.crashPoint) / 100;
      setMultiplier(crashPoint);
      setPlanePct(100);
      if (res.win) {
        setPhase("cashed");
        const payout = Number(res.payout);
        updateBalance(session.balance - wager + payout);
        setResult({ win: true, message: res.message, payout });
      } else {
        setPhase("crashed");
        updateBalance(session.balance - wager);
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
    setPlanePct(0);
  };

  const adjustWager = (delta: number) => {
    setWager((prev) => Math.max(1, prev + delta));
  };

  const multColor =
    phase === "cashed"
      ? "#22c55e"
      : phase === "crashed"
        ? "#ef4444"
        : "#ffffff";

  const svgW = 400;
  const svgH = 280;
  const curvePoints = `M 0 ${svgH} Q ${svgW * 0.4} ${svgH * 0.6} ${svgW * (planePct / 100)} ${svgH - (planePct / 100) * svgH * 0.92}`;
  const fillPath = `M 0 ${svgH} Q ${svgW * 0.4} ${svgH * 0.6} ${svgW * (planePct / 100)} ${svgH - (planePct / 100) * svgH * 0.92} L ${svgW * (planePct / 100)} ${svgH} Z`;

  const planePct2 = Math.max(planePct, 5);
  const planeX = (svgW * planePct2) / 100;
  const t = planePct2 / 100;
  const p0y = svgH;
  const p1y = svgH * 0.6;
  const p2y = svgH - t * svgH * 0.92;
  const planeY = (1 - t) * (1 - t) * p0y + 2 * (1 - t) * t * p1y + t * t * p2y;

  const getBtnLines = (): string[] => {
    if (phase === "waiting") return ["BET", `${wager.toLocaleString()} INR`];
    if (phase === "flying")
      return ["CASH OUT", `${(wager * multiplier).toFixed(0)} INR`];
    return ["BET AGAIN"];
  };

  const btnLines = getBtnLines();

  const handleGreenBtn = () => {
    if (phase === "waiting") handleBet();
    else if (phase === "flying") {
      // mid-game cashout not supported by backend
    } else {
      reset();
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0a1628" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ background: "#0d1e35", borderBottom: "1px solid #1a2e4a" }}
      >
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-lg transition-colors hover:bg-white/10"
          data-ocid="aviator.back_button"
          aria-label="Back"
        >
          <ArrowLeft size={18} className="text-white/70" />
        </button>
        <span className="text-white font-bold text-lg tracking-wide">
          ✈️ AVIATOR
        </span>
        {session && (
          <span
            className="ml-auto text-sm font-bold"
            style={{ color: "#22c55e" }}
          >
            💰 {session.balance.toLocaleString()} INR
          </span>
        )}
      </div>

      {/* Game Canvas */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #0a1628 0%, #0f1f3d 100%)",
          height: "300px",
          borderBottom: "1px solid #1a2e4a",
        }}
      >
        {/* Stars */}
        {STARS.map((star) => (
          <div
            key={`star-${star.top}-${star.left}`}
            className="absolute rounded-full bg-white"
            style={{
              width: star.size,
              height: star.size,
              top: `${star.top}%`,
              left: `${star.left}%`,
              opacity: star.opacity,
            }}
          />
        ))}

        {/* SVG Curve + Plane */}
        <svg
          role="img"
          aria-label="Aviator flight path"
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          {phase !== "waiting" && (
            <path d={fillPath} fill="rgba(239, 68, 68, 0.18)" />
          )}
          {phase !== "waiting" && (
            <path
              d={curvePoints}
              fill="none"
              stroke="#ef4444"
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}
          <line
            x1="0"
            y1={svgH - 2}
            x2={svgW}
            y2={svgH - 2}
            stroke="rgba(239,68,68,0.25)"
            strokeWidth="1"
            strokeDasharray="6,4"
          />
        </svg>

        {/* Plane emoji at tip */}
        {phase !== "waiting" && (
          <div
            className="absolute text-2xl pointer-events-none"
            style={{
              left: `${(planeX / svgW) * 100}%`,
              top: `${(planeY / svgH) * 100}%`,
              transform: "translate(-50%, -50%) rotate(-20deg)",
              filter:
                phase === "crashed"
                  ? "hue-rotate(0deg) drop-shadow(0 0 8px #ef4444)"
                  : "drop-shadow(0 0 6px rgba(255,100,100,0.8))",
            }}
          >
            ✈️
          </div>
        )}

        {/* Central Multiplier */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {phase === "waiting" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="text-5xl font-black text-white/20 mb-1">
                1.00x
              </div>
              <div className="text-xs text-white/30 uppercase tracking-widest">
                Waiting for next round
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={phase}
              initial={{ scale: 0.9, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div
                className="font-black leading-none"
                style={{
                  fontSize: "clamp(3rem, 10vw, 5rem)",
                  color: multColor,
                  textShadow:
                    phase === "cashed"
                      ? "0 0 30px #22c55e, 0 0 60px #22c55e66"
                      : phase === "crashed"
                        ? "0 0 30px #ef4444, 0 0 60px #ef444466"
                        : "0 0 30px #fff6, 0 0 60px #fff3",
                  ...(phase === "crashed"
                    ? { animation: "crash-shake 0.4s ease" }
                    : {}),
                }}
              >
                {multiplier.toFixed(2)}x
              </div>
              <div
                className="text-xs font-semibold tracking-widest mt-1 uppercase"
                style={{
                  color:
                    phase === "flying"
                      ? "#ffffff80"
                      : phase === "cashed"
                        ? "#22c55e"
                        : "#ef4444",
                }}
              >
                {phase === "flying" && "Flying..."}
                {phase === "cashed" && "✓ Cashed Out!"}
                {phase === "crashed" && "✕ Crashed!"}
              </div>
            </motion.div>
          )}
        </div>

        {/* Multiplier history pills */}
        <div className="absolute top-2 left-0 right-0 flex gap-1 px-3 overflow-hidden">
          {["1.23x", "8.50x", "2.10x", "1.01x", "4.33x", "12.5x", "1.55x"].map(
            (m) => (
              <span
                key={m}
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background:
                    Number.parseFloat(m) > 2
                      ? "rgba(34,197,94,0.2)"
                      : "rgba(239,68,68,0.2)",
                  color: Number.parseFloat(m) > 2 ? "#22c55e" : "#ef4444",
                  border: `1px solid ${Number.parseFloat(m) > 2 ? "#22c55e40" : "#ef444440"}`,
                }}
              >
                {m}
              </span>
            ),
          )}
        </div>
      </div>

      {/* Result banner */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2"
            style={{ background: result.win ? "#14532d" : "#450a0a" }}
            data-ocid={
              result.win ? "aviator.success_state" : "aviator.error_state"
            }
          >
            <p
              className="text-center text-sm font-bold"
              style={{ color: result.win ? "#22c55e" : "#ef4444" }}
            >
              {result.win
                ? `🎉 You won ${result.payout.toLocaleString()} INR — ${result.message}`
                : `💥 Crashed! — ${result.message}`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Panel */}
      <div className="px-3 py-3" style={{ background: "#0d1e35" }}>
        <div
          className="rounded-2xl p-3"
          style={{ background: "#0f2040", border: "1px solid #1e3a5f" }}
        >
          {/* Amount row */}
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => adjustWager(-10)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg transition-colors"
              style={{ background: "#1a2e4a", border: "1px solid #2a4a6a" }}
              data-ocid="aviator.secondary_button"
            >
              −
            </button>

            <div
              className="flex-1 rounded-full flex items-center px-4"
              style={{ background: "#0a1628", border: "1px solid #1a3050" }}
            >
              <input
                type="number"
                value={wager}
                onChange={(e) =>
                  setWager(Math.max(1, Number(e.target.value) || 1))
                }
                className="flex-1 bg-transparent text-white font-bold text-center outline-none py-2.5 text-base"
                min="1"
                data-ocid="aviator.input"
              />
              <span className="text-white/40 text-xs ml-1">INR</span>
            </div>

            <button
              type="button"
              onClick={() => adjustWager(10)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg transition-colors"
              style={{ background: "#1a2e4a", border: "1px solid #2a4a6a" }}
              data-ocid="aviator.secondary_button"
            >
              +
            </button>

            {/* BET / CASH OUT button */}
            <button
              type="button"
              onClick={handleGreenBtn}
              disabled={phase === "flying" || loading}
              className="rounded-xl font-black text-white transition-all active:scale-95 disabled:opacity-70"
              style={{
                background:
                  phase === "flying"
                    ? "#15803d"
                    : phase === "crashed"
                      ? "#1d4ed8"
                      : "linear-gradient(135deg, #16a34a, #15803d)",
                boxShadow:
                  phase !== "flying"
                    ? "0 0 20px rgba(34,197,94,0.5), 0 4px 12px rgba(0,0,0,0.4)"
                    : "none",
                minWidth: "110px",
                height: "56px",
                padding: "4px 12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1.2,
              }}
              data-ocid="aviator.primary_button"
            >
              {btnLines.map((line, i) => (
                <span
                  key={line}
                  className={
                    i === 0
                      ? "text-sm font-black"
                      : "text-xs font-semibold opacity-90"
                  }
                >
                  {line}
                </span>
              ))}
            </button>
          </div>

          {/* Quick bet pills */}
          <div className="flex gap-2 mb-2">
            {QUICK_BETS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setWager(amount)}
                className="flex-1 py-1.5 rounded-full text-xs font-bold transition-all"
                style={{
                  background: wager === amount ? "#1e3a5f" : "#0a1628",
                  border:
                    wager === amount
                      ? "1px solid #3b82f6"
                      : "1px solid #1a3050",
                  color: wager === amount ? "#60a5fa" : "#94a3b8",
                }}
                data-ocid="aviator.toggle"
              >
                {amount >= 1000 ? `${amount / 1000}K` : amount}
              </button>
            ))}
          </div>

          {/* Target multiplier + Autoplay buttons */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 rounded-full px-3 py-1.5 flex-1"
              style={{ background: "#0a1628", border: "1px solid #1a3050" }}
            >
              <span className="text-white/40 text-xs">Target:</span>
              <input
                type="number"
                value={targetMultiplier}
                onChange={(e) => setTargetMultiplier(e.target.value)}
                step="0.1"
                min="1.1"
                className="flex-1 bg-transparent text-white text-xs font-bold outline-none text-center"
                data-ocid="aviator.input"
              />
              <span className="text-white/40 text-xs">x</span>
            </div>
            <button
              type="button"
              onClick={() => setAutoPlay((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: autoPlay ? "#1e3a5f" : "#0a1628",
                border: autoPlay ? "1px solid #3b82f6" : "1px solid #1a3050",
                color: autoPlay ? "#60a5fa" : "#94a3b8",
              }}
              data-ocid="aviator.toggle"
            >
              <RefreshCw size={10} />
              Autoplay
            </button>
            <button
              type="button"
              onClick={() => setAutoCashout((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: autoCashout ? "#14532d" : "#0a1628",
                border: autoCashout ? "1px solid #22c55e" : "1px solid #1a3050",
                color: autoCashout ? "#22c55e" : "#94a3b8",
              }}
              data-ocid="aviator.toggle"
            >
              Auto cashout
            </button>
          </div>
        </div>
      </div>

      {/* Bet Tabs */}
      <div className="flex-1" style={{ background: "#0a1628" }}>
        <div className="flex border-b" style={{ borderColor: "#1a2e4a" }}>
          {(["all", "my", "top"] as BetTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 text-sm font-semibold transition-colors"
              style={{
                color: activeTab === tab ? "#22c55e" : "#94a3b8",
                borderBottom:
                  activeTab === tab
                    ? "2px solid #22c55e"
                    : "2px solid transparent",
                background: "transparent",
              }}
              data-ocid="aviator.tab"
            >
              {tab === "all"
                ? "All Bets"
                : tab === "my"
                  ? "My Bets"
                  : "Top Wins"}
            </button>
          ))}
        </div>

        <div
          className="flex justify-between px-4 py-2 text-xs"
          style={{ color: "#64748b", borderBottom: "1px solid #1a2e4a" }}
        >
          <span>
            Bets: <strong className="text-white/60">468/770</strong>
          </span>
          <span>
            Total win INR:{" "}
            <strong style={{ color: "#22c55e" }}>1,44,438.81</strong>
          </span>
        </div>

        <div className="px-3 py-2">
          <div
            className="grid grid-cols-4 text-xs px-2 py-1 mb-1"
            style={{ color: "#64748b" }}
          >
            <span>Player</span>
            <span className="text-center">Bet</span>
            <span className="text-center">Mult</span>
            <span className="text-right">Win</span>
          </div>
          {mockBets.map((bet, i) => (
            <div
              key={bet.user}
              className="grid grid-cols-4 text-xs px-2 py-2 rounded-lg mb-1"
              style={{ background: i % 2 === 0 ? "#0d1e35" : "transparent" }}
              data-ocid={`aviator.item.${i + 1}`}
            >
              <span className="text-white/70 font-medium">{bet.user}</span>
              <span className="text-center text-white/60">{bet.bet}</span>
              <span
                className="text-center font-bold"
                style={{
                  color:
                    Number.parseFloat(bet.mult) > 2 ? "#22c55e" : "#f59e0b",
                }}
              >
                {bet.mult}
              </span>
              <span
                className="text-right font-bold"
                style={{ color: "#22c55e" }}
              >
                {bet.win}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className="text-center py-2 text-xs"
        style={{ color: "#374151", background: "#0a1628" }}
      >
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white/40 transition-colors"
        >
          caffeine.ai
        </a>
      </div>
    </div>
  );
}
