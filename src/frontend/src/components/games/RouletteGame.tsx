import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { RouletteBet } from "../../backend.d";
import { usePlayerSession } from "../../contexts/PlayerSessionContext";
import { usePlayerPlayRouletteMulti } from "../../hooks/useQueries";

// ─── Constants ───────────────────────────────────────────────────────────────

const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

function getNumberColor(n: number): "red" | "black" | "green" {
  if (n === 0) return "green";
  return RED_NUMBERS.has(n) ? "red" : "black";
}

// Standard roulette wheel number order
const ROULETTE_NUMBERS = Array.from({ length: 37 }, (_, i) => i);
const WHEEL_COLORS: Record<number, string> = {};
for (const n of ROULETTE_NUMBERS) {
  const c = getNumberColor(n);
  WHEEL_COLORS[n] =
    c === "green" ? "#22543d" : c === "red" ? "#c53030" : "#1a1a1a";
}

// Grid layout: 3 rows × 12 columns
// Row 0 (top): 3,6,9,...,36
// Row 1 (mid): 2,5,8,...,35
// Row 2 (bot): 1,4,7,...,34
const GRID_ROWS = [
  [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
  [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
  [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
];

const CHIP_PRESETS = [5, 10, 25, 50, 100];

// ─── Types ───────────────────────────────────────────────────────────────────

type BetKey =
  | `num_${number}`
  | "color_red"
  | "color_black"
  | "dozen_1"
  | "dozen_2"
  | "dozen_3"
  | "odd"
  | "even";

function betKeyToRouletteBet(key: BetKey, wager: number): RouletteBet {
  if (key.startsWith("num_")) {
    const num = Number(key.slice(4));
    return { betType: "number", betValue: BigInt(num), wager: BigInt(wager) };
  }
  return { betType: key, betValue: BigInt(0), wager: BigInt(wager) };
}

// ─── Cell background helpers ─────────────────────────────────────────────────

function numCellBg(n: number, selected: boolean, winning: boolean): string {
  const base = getNumberColor(n);
  const bgMap = { green: "#1a4a2e", red: "#7f1d1d", black: "#111111" };
  const selMap = { green: "#166534", red: "#991b1b", black: "#1c1c1c" };
  if (winning)
    return base === "green"
      ? "#166534"
      : base === "red"
        ? "#b91c1c"
        : "#262626";
  return selected ? selMap[base] : bgMap[base];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function RouletteGame() {
  const [chipValue, setChipValue] = useState(10);
  const [bets, setBets] = useState<Map<BetKey, number>>(new Map());
  const [spinning, setSpinning] = useState(false);
  const [wheelAngle, setWheelAngle] = useState(0);
  const [rolledNumber, setRolledNumber] = useState<number | null>(null);
  const [totalPayout, setTotalPayout] = useState<number | null>(null);
  const [didWin, setDidWin] = useState<boolean | null>(null);

  const playRouletteMulti = usePlayerPlayRouletteMulti();

  const totalBet = Array.from(bets.values()).reduce((a, b) => a + b, 0);

  function toggleBet(key: BetKey) {
    setBets((prev) => {
      const next = new Map(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.set(key, chipValue);
      }
      return next;
    });
  }

  function clearBets() {
    setBets(new Map());
    setRolledNumber(null);
    setTotalPayout(null);
    setDidWin(null);
  }

  async function handleSpin() {
    if (bets.size === 0) {
      toast.error("Place at least one bet before spinning!");
      return;
    }
    setSpinning(true);
    setRolledNumber(null);
    setTotalPayout(null);
    setDidWin(null);

    const spinDeg = 1440 + Math.random() * 360;
    setWheelAngle((prev) => prev + spinDeg);

    const rouletteBets: RouletteBet[] = Array.from(bets.entries()).map(
      ([key, wager]) => betKeyToRouletteBet(key, wager),
    );

    try {
      const res = await playRouletteMulti.mutateAsync(rouletteBets);
      setTimeout(() => {
        const rolled = Number(res.result);
        const payout = Number(res.totalPayout);
        setRolledNumber(rolled);
        setTotalPayout(payout);
        setDidWin(res.win);
        setSpinning(false);
        if (res.win) {
          toast.success(`🎉 WIN! Rolled ${rolled} — +${payout} coins!`);
        } else {
          toast.error(`💸 Rolled ${rolled}. Better luck next time!`);
        }
      }, 2800);
    } catch (e: any) {
      setSpinning(false);
      toast.error(e?.message ?? "Spin failed");
    }
  }

  // Determine winning cells given rolled number
  function isWinningCell(key: BetKey): boolean {
    if (rolledNumber === null) return false;
    if (key.startsWith("num_")) return Number(key.slice(4)) === rolledNumber;
    if (key === "color_red") return getNumberColor(rolledNumber) === "red";
    if (key === "color_black") return getNumberColor(rolledNumber) === "black";
    if (key === "dozen_1") return rolledNumber >= 1 && rolledNumber <= 12;
    if (key === "dozen_2") return rolledNumber >= 13 && rolledNumber <= 24;
    if (key === "dozen_3") return rolledNumber >= 25 && rolledNumber <= 36;
    if (key === "odd") return rolledNumber !== 0 && rolledNumber % 2 !== 0;
    if (key === "even") return rolledNumber !== 0 && rolledNumber % 2 === 0;
    return false;
  }

  const rolledColor =
    rolledNumber !== null ? getNumberColor(rolledNumber) : null;

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col card-glow card-glow-hover transition-all duration-300"
      style={{
        background: "oklch(0.12 0 0)",
        border: "1px solid oklch(0.62 0.13 78 / 0.4)",
        minHeight: "520px",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4"
        style={{ borderBottom: "1px solid oklch(0.62 0.13 78 / 0.2)" }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-bold uppercase tracking-widest gold-gradient-text">
            Roulette
          </h3>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Up to 36x
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 py-5 gap-4">
        {/* Wheel */}
        <div className="relative">
          <div
            className="w-32 h-32 rounded-full relative"
            style={{
              transition: spinning
                ? "transform 3s cubic-bezier(0.17,0.67,0.12,0.99)"
                : "none",
              transform: `rotate(${wheelAngle}deg)`,
              boxShadow:
                "0 0 30px oklch(0.85 0.18 85 / 0.2), inset 0 0 20px oklch(0 0 0 / 0.5)",
            }}
          >
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              aria-label="Roulette wheel"
            >
              <title>Roulette Wheel</title>
              {ROULETTE_NUMBERS.map((n, i) => {
                const angle = (360 / 37) * i;
                const rad = (angle * Math.PI) / 180;
                const nextRad = ((angle + 360 / 37) * Math.PI) / 180;
                const x1 = 50 + 48 * Math.cos(rad);
                const y1 = 50 + 48 * Math.sin(rad);
                const x2 = 50 + 48 * Math.cos(nextRad);
                const y2 = 50 + 48 * Math.sin(nextRad);
                const midRad = ((angle + 180 / 37) * Math.PI) / 180;
                const tx = 50 + 36 * Math.cos(midRad);
                const ty = 50 + 36 * Math.sin(midRad);
                return (
                  <g key={n}>
                    <path
                      d={`M50,50 L${x1},${y1} A48,48 0 0,1 ${x2},${y2} Z`}
                      fill={WHEEL_COLORS[n]}
                      stroke="oklch(0.85 0.18 85 / 0.3)"
                      strokeWidth="0.3"
                    />
                    <text
                      x={tx}
                      y={ty}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="4"
                      transform={`rotate(${angle + 180 / 37}, ${tx}, ${ty})`}
                      style={{ userSelect: "none" }}
                    >
                      {n}
                    </text>
                  </g>
                );
              })}
              <circle
                cx="50"
                cy="50"
                r="10"
                fill="oklch(0.07 0 0)"
                stroke="oklch(0.85 0.18 85)"
                strokeWidth="1"
              />
              <text
                x="50"
                y="50"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="oklch(0.85 0.18 85)"
                fontSize="6"
                fontWeight="bold"
              >
                ●
              </text>
            </svg>
          </div>
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-0 h-0"
            style={{
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "12px solid oklch(0.85 0.18 85)",
              filter: "drop-shadow(0 0 4px oklch(0.85 0.18 85 / 0.8))",
            }}
          />
        </div>

        {/* Result badge */}
        <AnimatePresence>
          {rolledNumber !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                style={{
                  background:
                    rolledColor === "green"
                      ? "#166534"
                      : rolledColor === "red"
                        ? "#b91c1c"
                        : "#1c1c1c",
                  border: "2px solid oklch(0.85 0.18 85)",
                  boxShadow: "0 0 16px oklch(0.85 0.18 85 / 0.5)",
                  color: "white",
                }}
              >
                {rolledNumber}
              </div>
              <p
                className={`text-sm font-bold ${didWin ? "win-glow" : "loss-glow"}`}
              >
                {didWin ? `+${totalPayout} coins` : "Better luck next time"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chip selector */}
        <div className="w-full">
          <p
            className="text-xs uppercase tracking-widest mb-2"
            style={{ color: "oklch(0.62 0.13 78)" }}
          >
            Chip Value
          </p>
          <div className="flex gap-2 flex-wrap">
            {CHIP_PRESETS.map((v) => (
              <button
                key={v}
                type="button"
                data-ocid="roulette.toggle"
                onClick={() => setChipValue(v)}
                className="flex-1 min-w-[48px] py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
                style={{
                  background:
                    chipValue === v
                      ? "linear-gradient(135deg, oklch(0.87 0.19 85), oklch(0.62 0.13 78))"
                      : "oklch(0.17 0 0)",
                  color:
                    chipValue === v ? "oklch(0.07 0 0)" : "oklch(0.70 0 0)",
                  border: `1px solid ${chipValue === v ? "oklch(0.85 0.18 85 / 0.6)" : "oklch(0.62 0.13 78 / 0.2)"}`,
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Betting Grid */}
        <div className="w-full overflow-x-auto">
          <div style={{ minWidth: "340px" }}>
            {/* Number grid */}
            <div
              className="grid"
              style={{
                gridTemplateColumns: "36px repeat(12, 1fr)",
                gridTemplateRows: "repeat(3, minmax(36px, auto))",
                gap: "2px",
              }}
            >
              {/* Zero — spans 3 rows */}
              <button
                type="button"
                data-ocid="roulette.canvas_target"
                onClick={() => toggleBet("num_0")}
                className="relative rounded transition-all duration-150 flex items-center justify-center font-bold text-sm"
                style={{
                  gridRow: "1 / 4",
                  gridColumn: "1",
                  background: numCellBg(
                    0,
                    bets.has("num_0"),
                    rolledNumber === 0,
                  ),
                  border: bets.has("num_0")
                    ? "2px solid oklch(0.85 0.18 85)"
                    : rolledNumber === 0
                      ? "2px solid oklch(0.87 0.19 85)"
                      : "1px solid oklch(0.62 0.13 78 / 0.3)",
                  boxShadow:
                    rolledNumber === 0
                      ? "0 0 12px oklch(0.87 0.19 85 / 0.7)"
                      : bets.has("num_0")
                        ? "0 0 8px oklch(0.85 0.18 85 / 0.4)"
                        : "none",
                  color: "white",
                  minHeight: "36px",
                  touchAction: "manipulation",
                }}
              >
                0
                {bets.has("num_0") && (
                  <CoinBadge amount={bets.get("num_0") as number} />
                )}
              </button>

              {/* Number cells: rows then columns */}
              {GRID_ROWS.map((row, rowIdx) =>
                row.map((num, colIdx) => {
                  const key: BetKey = `num_${num}`;
                  const selected = bets.has(key);
                  const winning = rolledNumber === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      data-ocid="roulette.canvas_target"
                      onClick={() => toggleBet(key)}
                      className="relative rounded transition-all duration-150 flex items-center justify-center font-bold text-xs"
                      style={{
                        gridRow: rowIdx + 1,
                        gridColumn: colIdx + 2,
                        background: numCellBg(num, selected, winning),
                        border: winning
                          ? "2px solid oklch(0.87 0.19 85)"
                          : selected
                            ? "2px solid oklch(0.85 0.18 85 / 0.8)"
                            : "1px solid oklch(0.62 0.13 78 / 0.2)",
                        boxShadow: winning
                          ? "0 0 12px oklch(0.87 0.19 85 / 0.7)"
                          : selected
                            ? "0 0 6px oklch(0.85 0.18 85 / 0.3)"
                            : "none",
                        color: "white",
                        minHeight: "36px",
                        touchAction: "manipulation",
                      }}
                    >
                      {num}
                      {selected && (
                        <CoinBadge amount={bets.get(key) as number} />
                      )}
                    </button>
                  );
                }),
              )}
            </div>

            {/* Dozen bets */}
            <div
              className="grid grid-cols-3 gap-0.5 mt-0.5"
              style={{ marginLeft: "38px" }}
            >
              {(
                [
                  ["dozen_1", "1st 12"],
                  ["dozen_2", "2nd 12"],
                  ["dozen_3", "3rd 12"],
                ] as [BetKey, string][]
              ).map(([key, label]) => {
                const selected = bets.has(key);
                const winning = isWinningCell(key);
                return (
                  <button
                    key={key}
                    type="button"
                    data-ocid="roulette.canvas_target"
                    onClick={() => toggleBet(key)}
                    className="relative py-2 rounded text-xs font-bold uppercase tracking-wider transition-all duration-150"
                    style={{
                      background: winning
                        ? "oklch(0.55 0.15 78 / 0.6)"
                        : selected
                          ? "oklch(0.45 0.13 78 / 0.5)"
                          : "oklch(0.22 0.05 78 / 0.4)",
                      border: winning
                        ? "2px solid oklch(0.87 0.19 85)"
                        : selected
                          ? "2px solid oklch(0.85 0.18 85 / 0.7)"
                          : "1px solid oklch(0.62 0.13 78 / 0.3)",
                      boxShadow: winning
                        ? "0 0 10px oklch(0.87 0.19 85 / 0.6)"
                        : "none",
                      color:
                        selected || winning
                          ? "oklch(0.95 0.15 85)"
                          : "oklch(0.70 0.08 78)",
                      touchAction: "manipulation",
                    }}
                  >
                    {label}
                    {selected && <CoinBadge amount={bets.get(key) as number} />}
                  </button>
                );
              })}
            </div>

            {/* Outside bets row */}
            <div
              className="grid grid-cols-6 gap-0.5 mt-0.5"
              style={{ marginLeft: "38px" }}
            >
              {(
                [
                  ["even", "Even"],
                  ["color_red", "Red"],
                  ["color_black", "Black"],
                  ["odd", "Odd"],
                ] as [BetKey, string][]
              ).map(([key, label]) => {
                const selected = bets.has(key);
                const winning = isWinningCell(key);
                const isRed = key === "color_red";
                const isBlack = key === "color_black";
                return (
                  <button
                    key={key}
                    type="button"
                    data-ocid="roulette.canvas_target"
                    onClick={() => toggleBet(key)}
                    className="relative col-span-2 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-1"
                    style={{
                      background: isRed
                        ? winning
                          ? "#b91c1c"
                          : selected
                            ? "#991b1b"
                            : "#7f1d1d"
                        : isBlack
                          ? winning
                            ? "#262626"
                            : selected
                              ? "#1c1c1c"
                              : "#111111"
                          : winning
                            ? "oklch(0.55 0.15 78 / 0.6)"
                            : selected
                              ? "oklch(0.45 0.13 78 / 0.5)"
                              : "oklch(0.22 0.05 78 / 0.4)",
                      border: winning
                        ? "2px solid oklch(0.87 0.19 85)"
                        : selected
                          ? "2px solid oklch(0.85 0.18 85 / 0.7)"
                          : "1px solid oklch(0.62 0.13 78 / 0.3)",
                      boxShadow: winning
                        ? "0 0 10px oklch(0.87 0.19 85 / 0.6)"
                        : "none",
                      color:
                        isRed || isBlack
                          ? "white"
                          : selected || winning
                            ? "oklch(0.95 0.15 85)"
                            : "oklch(0.70 0.08 78)",
                      touchAction: "manipulation",
                    }}
                  >
                    {isRed && (
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
                    )}
                    {isBlack && (
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-600 inline-block" />
                    )}
                    {label}
                    {selected && <CoinBadge amount={bets.get(key) as number} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action row */}
        <div className="w-full flex items-center gap-3 mt-1">
          <div className="flex-1">
            <p className="text-xs" style={{ color: "oklch(0.62 0.13 78)" }}>
              Total Bet:{" "}
              <span
                style={{ color: "oklch(0.85 0.18 85)" }}
                className="font-bold"
              >
                {totalBet} coins
              </span>
            </p>
          </div>
          <Button
            data-ocid="roulette.secondary_button"
            variant="outline"
            size="sm"
            onClick={clearBets}
            disabled={spinning}
            className="text-xs uppercase tracking-wider"
            style={{
              background: "oklch(0.17 0 0)",
              border: "1px solid oklch(0.62 0.13 78 / 0.3)",
              color: "oklch(0.65 0 0)",
            }}
          >
            Clear
          </Button>
          <Button
            data-ocid="roulette.primary_button"
            onClick={handleSpin}
            disabled={
              spinning || playRouletteMulti.isPending || bets.size === 0
            }
            className="font-bold uppercase tracking-wider transition-all hover:scale-105 min-w-[80px]"
            style={{
              background:
                spinning || bets.size === 0
                  ? "oklch(0.17 0 0)"
                  : "linear-gradient(135deg, oklch(0.87 0.19 85), oklch(0.62 0.13 78))",
              color:
                spinning || bets.size === 0
                  ? "oklch(0.55 0 0)"
                  : "oklch(0.07 0 0)",
              border: "none",
            }}
          >
            {spinning ? <Loader2 className="w-4 h-4 animate-spin" /> : "SPIN"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Coin badge overlay ───────────────────────────────────────────────────────

function CoinBadge({ amount }: { amount: number }) {
  return (
    <span
      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black z-10 pointer-events-none"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.87 0.19 85), oklch(0.62 0.13 78))",
        color: "oklch(0.07 0 0)",
        boxShadow: "0 0 6px oklch(0.85 0.18 85 / 0.6)",
        border: "1px solid oklch(0.95 0.1 85)",
      }}
    >
      {amount >= 100 ? "💰" : "🪙"}
    </span>
  );
}
