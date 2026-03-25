import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { HiLoResult } from "../../backend.d";
import { useDrawCard, usePlayHiLo } from "../../hooks/useQueries";

const CARD_NAMES: Record<number, string> = {
  1: "A",
  11: "J",
  12: "Q",
  13: "K",
};
const SUIT_SYMBOLS = ["♠", "♥", "♦", "♣"];

function getCardLabel(n: number): string {
  return CARD_NAMES[n] ?? String(n);
}

function PlayingCard({
  value,
  flipping = false,
}: { value: bigint | null; flipping?: boolean }) {
  const num = value !== null ? Number(value) : null;
  const label = num !== null ? getCardLabel(num) : "?";
  const suit = num !== null ? SUIT_SYMBOLS[(num - 1) % 4] : "";
  const isRed = suit === "♥" || suit === "♦";

  return (
    <motion.div
      animate={flipping ? { rotateY: [0, 90, 0] } : {}}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="w-24 h-36 rounded-xl flex flex-col items-center justify-center font-display font-bold relative select-none"
      style={{
        background: value !== null ? "oklch(0.97 0 0)" : "oklch(0.17 0 0)",
        border: "2px solid oklch(0.62 0.13 78 / 0.5)",
        boxShadow:
          value !== null
            ? "0 4px 20px oklch(0 0 0 / 0.4), 0 0 20px oklch(0.85 0.18 85 / 0.15)"
            : "none",
        color:
          value !== null
            ? isRed
              ? "#c53030"
              : "oklch(0.10 0 0)"
            : "oklch(0.35 0 0)",
      }}
    >
      {value !== null ? (
        <>
          <span className="absolute top-2 left-3 text-lg leading-none">
            {label}
          </span>
          <span className="text-4xl">{suit}</span>
          <span className="absolute bottom-2 right-3 text-lg leading-none rotate-180">
            {label}
          </span>
        </>
      ) : (
        <span className="text-3xl opacity-40">🃏</span>
      )}
    </motion.div>
  );
}

export default function HiLoGame() {
  const [currentCard, setCurrentCard] = useState<bigint | null>(null);
  const [wager, setWager] = useState("10");
  const [guess, setGuess] = useState<"higher" | "lower" | null>(null);
  const [result, setResult] = useState<HiLoResult | null>(null);
  const [flipping, setFlipping] = useState(false);
  const drawCard = useDrawCard();
  const playHiLo = usePlayHiLo();

  async function handleDraw() {
    setResult(null);
    setGuess(null);
    try {
      const card = await drawCard.mutateAsync();
      setCurrentCard(card);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to draw card");
    }
  }

  async function handlePlay() {
    if (!currentCard || !guess) {
      toast.error("Select Higher or Lower");
      return;
    }
    const wagerNum = Number.parseInt(wager);
    if (!wagerNum || wagerNum < 1) {
      toast.error("Enter a valid wager");
      return;
    }
    setFlipping(true);
    setResult(null);
    try {
      const res = await playHiLo.mutateAsync({
        wager: wagerNum,
        guess,
        currentCard,
      });
      setTimeout(() => {
        setFlipping(false);
        setCurrentCard(res.newCard);
        setResult(res);
        setGuess(null);
        if (res.win) {
          toast.success(
            `🃏 Correct! New card: ${getCardLabel(Number(res.newCard))} — +${Number(res.payout)} coins!`,
          );
        } else {
          toast.error(
            `Wrong! New card: ${getCardLabel(Number(res.newCard))}. Lost ${wager} coins.`,
          );
        }
      }, 600);
    } catch (e: any) {
      setFlipping(false);
      toast.error(e?.message ?? "Play failed");
    }
  }

  const isPlaying = drawCard.isPending || playHiLo.isPending || flipping;

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
            Hi-Lo
          </h3>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            2x payout
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-5 py-6 gap-5">
        <div className="flex flex-col items-center gap-4">
          <div className="text-xs text-muted-foreground uppercase tracking-widest">
            {currentCard === null ? "Draw a card to begin" : "Current Card"}
          </div>
          <PlayingCard value={currentCard} flipping={flipping} />
          {currentCard !== null && (
            <p className="text-xs text-muted-foreground text-center">
              Will the next card be higher or lower?
            </p>
          )}
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <p
                className={`text-lg font-bold ${result.win ? "win-glow" : "loss-glow"}`}
              >
                {result.win
                  ? `🎉 +${Number(result.payout)} coins!`
                  : "💸 Lost!"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {result.message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full space-y-3">
          <Button
            data-ocid="hilo.draw.button"
            onClick={handleDraw}
            disabled={isPlaying}
            variant="outline"
            className="w-full text-sm font-semibold uppercase tracking-wider"
            style={{
              borderColor: "oklch(0.62 0.13 78 / 0.4)",
              color: "oklch(0.85 0.18 85)",
              background: "transparent",
            }}
          >
            {drawCard.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {currentCard === null ? "Draw Card" : "New Card"}
          </Button>

          {currentCard !== null && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                data-ocid="hilo.higher.button"
                onClick={() => setGuess("higher")}
                disabled={isPlaying}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all"
                style={{
                  background:
                    guess === "higher"
                      ? "linear-gradient(135deg, oklch(0.83 0.19 155 / 0.3), oklch(0.83 0.19 155 / 0.1))"
                      : "oklch(0.17 0 0)",
                  border: `2px solid ${guess === "higher" ? "oklch(0.83 0.19 155)" : "oklch(0.62 0.13 78 / 0.2)"}`,
                  color:
                    guess === "higher"
                      ? "oklch(0.83 0.19 155)"
                      : "oklch(0.70 0 0)",
                  boxShadow:
                    guess === "higher"
                      ? "0 0 16px oklch(0.83 0.19 155 / 0.3)"
                      : "none",
                }}
              >
                <TrendingUp className="w-4 h-4" /> Higher
              </button>
              <button
                type="button"
                data-ocid="hilo.lower.button"
                onClick={() => setGuess("lower")}
                disabled={isPlaying}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all"
                style={{
                  background:
                    guess === "lower"
                      ? "linear-gradient(135deg, oklch(0.62 0.25 25 / 0.3), oklch(0.62 0.25 25 / 0.1))"
                      : "oklch(0.17 0 0)",
                  border: `2px solid ${guess === "lower" ? "oklch(0.62 0.25 25)" : "oklch(0.62 0.13 78 / 0.2)"}`,
                  color:
                    guess === "lower"
                      ? "oklch(0.62 0.25 25)"
                      : "oklch(0.70 0 0)",
                  boxShadow:
                    guess === "lower"
                      ? "0 0 16px oklch(0.62 0.25 25 / 0.3)"
                      : "none",
                }}
              >
                <TrendingDown className="w-4 h-4" /> Lower
              </button>
            </div>
          )}

          {currentCard !== null && (
            <div className="flex gap-2">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Wager
                </p>
                <Input
                  data-ocid="hilo.wager.input"
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
                  data-ocid="hilo.play.primary_button"
                  onClick={handlePlay}
                  disabled={isPlaying || !guess}
                  className="font-bold uppercase tracking-wider transition-all hover:scale-105"
                  style={{
                    background: guess
                      ? "linear-gradient(135deg, oklch(0.87 0.19 85), oklch(0.62 0.13 78))"
                      : "oklch(0.17 0 0)",
                    color: guess ? "oklch(0.07 0 0)" : "oklch(0.55 0 0)",
                    border: "none",
                    minWidth: "80px",
                  }}
                >
                  {isPlaying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "PLAY"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
