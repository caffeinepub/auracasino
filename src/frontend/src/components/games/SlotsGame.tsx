import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { SlotsResult } from "../../backend.d";
import { usePlaySlots } from "../../hooks/useQueries";

const SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "🎰", "⭐", "💎"];
const PAYOUTS: Record<string, string> = {
  "💎": "50x",
  "⭐": "20x",
  "🎰": "10x",
  "🍒": "5x",
  "🍇": "4x",
  "🍊": "3x",
  "🍋": "2x",
};

interface ReelProps {
  finalSymbol: string;
  spinning: boolean;
  delay: number;
}

function Reel({ finalSymbol, spinning, delay }: ReelProps) {
  const [displaySymbol, setDisplaySymbol] = useState("🎰");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (spinning) {
      setDisplaySymbol(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
      intervalRef.current = setInterval(() => {
        setDisplaySymbol(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
      }, 80);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const timeout = setTimeout(() => setDisplaySymbol(finalSymbol), delay);
      return () => clearTimeout(timeout);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [spinning, finalSymbol, delay]);

  return (
    <div
      className="flex items-center justify-center text-4xl select-none rounded-xl"
      style={{
        width: "80px",
        height: "90px",
        background: spinning ? "oklch(0.10 0 0)" : "oklch(0.14 0 0)",
        border: "2px solid oklch(0.62 0.13 78 / 0.4)",
        boxShadow: spinning
          ? "0 0 20px oklch(0.85 0.18 85 / 0.15)"
          : "inset 0 2px 4px oklch(0 0 0 / 0.5)",
        transition: "all 0.3s",
      }}
    >
      <span
        style={{
          filter: spinning ? "blur(1px)" : "none",
          transition: "filter 0.3s",
        }}
      >
        {displaySymbol}
      </span>
    </div>
  );
}

export default function SlotsGame() {
  const [wager, setWager] = useState("10");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SlotsResult | null>(null);
  const [reel0, setReel0] = useState("🎰");
  const [reel1, setReel1] = useState("🎰");
  const [reel2, setReel2] = useState("🎰");
  const playSlots = usePlaySlots();

  async function handleSpin() {
    const wagerNum = Number.parseInt(wager);
    if (!wagerNum || wagerNum < 1) {
      toast.error("Enter a valid wager");
      return;
    }
    setSpinning(true);
    setResult(null);
    try {
      const res = await playSlots.mutateAsync(wagerNum);
      const s0 = SYMBOLS[Number(res.reels[0])] ?? "🎰";
      const s1 = SYMBOLS[Number(res.reels[1])] ?? "🎰";
      const s2 = SYMBOLS[Number(res.reels[2])] ?? "🎰";
      setTimeout(() => {
        setSpinning(false);
        setReel0(s0);
        setReel1(s1);
        setReel2(s2);
        setTimeout(() => {
          setResult(res);
          if (res.win) {
            toast.success(`🎰 JACKPOT! +${Number(res.payout)} coins!`);
          } else {
            toast.error("No match. Spin again!");
          }
        }, 400);
      }, 2000);
    } catch (e: any) {
      setSpinning(false);
      toast.error(e?.message ?? "Spin failed");
    }
  }

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col card-glow card-glow-hover transition-all duration-300"
      style={{
        background: "oklch(0.12 0 0)",
        border: "1px solid oklch(0.62 0.13 78 / 0.4)",
        minHeight: "520px",
      }}
    >
      <div
        className="px-5 py-4"
        style={{ borderBottom: "1px solid oklch(0.62 0.13 78 / 0.2)" }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-bold uppercase tracking-widest gold-gradient-text">
            Slots
          </h3>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Up to 50x
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-5 py-6 gap-5">
        <div
          className="rounded-2xl p-4 w-full"
          style={{
            background: "oklch(0.09 0 0)",
            border: "2px solid oklch(0.62 0.13 78 / 0.3)",
            boxShadow: "inset 0 4px 12px oklch(0 0 0 / 0.4)",
          }}
        >
          <div className="flex justify-center mb-3">
            <div
              className="h-0.5 w-full rounded"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(0.85 0.18 85 / 0.5), transparent)",
              }}
            />
          </div>
          <div className="flex justify-center gap-2">
            <Reel finalSymbol={reel0} spinning={spinning} delay={0} />
            <Reel finalSymbol={reel1} spinning={spinning} delay={250} />
            <Reel finalSymbol={reel2} spinning={spinning} delay={500} />
          </div>
          <div className="flex justify-center mt-3">
            <div
              className="h-0.5 w-full rounded"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(0.85 0.18 85 / 0.5), transparent)",
              }}
            />
          </div>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <p
                className={`text-lg font-bold ${result.win ? "win-glow" : "loss-glow"}`}
              >
                {result.win
                  ? `🎉 +${Number(result.payout)} coins!`
                  : "💸 No match"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {result.message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full grid grid-cols-4 gap-1">
          {Object.entries(PAYOUTS).map(([sym, payout]) => (
            <div
              key={sym}
              className="text-center py-1 px-2 rounded-lg"
              style={{
                background: "oklch(0.10 0 0)",
                border: "1px solid oklch(0.62 0.13 78 / 0.15)",
              }}
            >
              <div className="text-lg">{sym}</div>
              <div
                className="text-[10px] font-bold"
                style={{ color: "oklch(0.85 0.18 85)" }}
              >
                {payout}
              </div>
            </div>
          ))}
        </div>

        <div className="w-full">
          <div className="flex gap-2">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Wager
              </p>
              <Input
                data-ocid="slots.wager.input"
                type="number"
                min={1}
                value={wager}
                onChange={(e) => setWager(e.target.value)}
                placeholder="Coins..."
                style={{
                  background: "oklch(0.17 0 0)",
                  border: "1px solid oklch(0.62 0.13 78 / 0.3)",
                  color: "oklch(0.97 0 0)",
                }}
              />
            </div>
            <div className="flex items-end">
              <Button
                data-ocid="slots.spin.primary_button"
                onClick={handleSpin}
                disabled={spinning || playSlots.isPending}
                className="font-bold uppercase tracking-wider transition-all hover:scale-105"
                style={{
                  background: spinning
                    ? "oklch(0.17 0 0)"
                    : "linear-gradient(135deg, oklch(0.87 0.19 85), oklch(0.62 0.13 78))",
                  color: spinning ? "oklch(0.55 0 0)" : "oklch(0.07 0 0)",
                  border: "none",
                  minWidth: "80px",
                }}
              >
                {spinning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "SPIN"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
