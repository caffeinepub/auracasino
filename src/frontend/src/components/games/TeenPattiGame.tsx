import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { usePlayHiLo, useUserInfo } from "../../hooks/useQueries";

const RANKS = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];
const SUITS = ["♠", "♥", "♦", "♣"];
const SUIT_COLORS: Record<string, string> = {
  "♠": "#111",
  "♥": "#dc2626",
  "♦": "#dc2626",
  "♣": "#111",
};

interface Card {
  rank: string;
  suit: string;
  rankIdx: number;
}

function drawCards(n: number): Card[] {
  const used = new Set<number>();
  const cards: Card[] = [];
  while (cards.length < n) {
    const idx = Math.floor(Math.random() * 52);
    if (used.has(idx)) continue;
    used.add(idx);
    cards.push({
      rank: RANKS[idx % 13],
      suit: SUITS[Math.floor(idx / 13)],
      rankIdx: idx % 13,
    });
  }
  return cards;
}

function handRank(cards: Card[]): number {
  const ranks = cards.map((c) => c.rankIdx).sort((a, b) => a - b);
  const suits = cards.map((c) => c.suit);
  const isFlush = suits.every((s) => s === suits[0]);
  const isSeq = ranks[2] - ranks[1] === 1 && ranks[1] - ranks[0] === 1;
  const isAceSeq =
    JSON.stringify(ranks) === JSON.stringify([0, 1, 12]) ||
    JSON.stringify(ranks) === JSON.stringify([0, 11, 12]);
  const counts = Object.values(
    ranks.reduce((acc: Record<number, number>, r) => {
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b - a);
  if (counts[0] === 3) return 6;
  if (isFlush && (isSeq || isAceSeq)) return 5;
  if (isSeq || isAceSeq) return 4;
  if (isFlush) return 3;
  if (counts[0] === 2) return 2;
  return 1;
}

const HAND_NAMES = [
  "",
  "High Card",
  "Pair",
  "Flush",
  "Straight",
  "Straight Flush",
  "Trail",
];

function PlayingCard({
  card,
  faceDown,
  delay = 0,
}: { card: Card; faceDown?: boolean; delay?: number }) {
  return (
    <motion.div
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="relative rounded-lg flex flex-col justify-between p-2 select-none"
      style={{
        width: "54px",
        height: "78px",
        background: faceDown
          ? "linear-gradient(135deg, oklch(0.18 0.04 250), oklch(0.12 0 0))"
          : "oklch(0.97 0 0)",
        border: faceDown
          ? "1px solid oklch(0.62 0.13 78 / 0.4)"
          : "1px solid oklch(0.85 0 0)",
        boxShadow: "0 4px 12px oklch(0 0 0 / 0.5)",
        transformStyle: "preserve-3d",
      }}
    >
      {faceDown ? (
        <div
          className="absolute inset-1 rounded"
          style={{
            background:
              "repeating-linear-gradient(45deg, oklch(0.62 0.13 78 / 0.2) 0px, oklch(0.62 0.13 78 / 0.2) 2px, transparent 2px, transparent 8px)",
            border: "1px solid oklch(0.62 0.13 78 / 0.3)",
          }}
        />
      ) : (
        <>
          <div
            className="text-xs font-black leading-none"
            style={{ color: SUIT_COLORS[card.suit] }}
          >
            {card.rank}
          </div>
          <div
            className="text-center text-2xl leading-none"
            style={{ color: SUIT_COLORS[card.suit] }}
          >
            {card.suit}
          </div>
          <div
            className="text-xs font-black leading-none self-end rotate-180"
            style={{ color: SUIT_COLORS[card.suit] }}
          >
            {card.rank}
          </div>
        </>
      )}
    </motion.div>
  );
}

type GameState = "idle" | "dealt" | "revealed";

export default function TeenPattiGame() {
  const [wager, setWager] = useState("50");
  const [state, setState] = useState<GameState>("idle");
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [playerWins, setPlayerWins] = useState<boolean | null>(null);

  const { data: userInfo } = useUserInfo();
  const playHiLo = usePlayHiLo();

  function deal() {
    const bet = Number.parseInt(wager, 10);
    if (!bet || bet < 1) {
      toast.error("Enter a valid wager!");
      return;
    }
    const all = drawCards(6);
    setPlayerCards(all.slice(0, 3));
    setDealerCards(all.slice(3, 6));
    setPlayerWins(null);
    setState("dealt");
  }

  function reveal() {
    const bet = Number.parseInt(wager, 10);
    const pRank = handRank(playerCards);
    const dRank = handRank(dealerCards);
    const pWins = pRank >= dRank;
    setPlayerWins(pWins);
    setState("revealed");
    playHiLo.mutate(
      { wager: bet, guess: pWins ? "higher" : "lower", currentCard: BigInt(7) },
      {
        onSettled: () => {
          if (pWins)
            toast.success(
              `🃏 You win! ${HAND_NAMES[pRank]} beats ${HAND_NAMES[dRank]}! +${bet * 2} coins`,
            );
          else
            toast.error(
              `💸 Dealer wins with ${HAND_NAMES[dRank]}. Lost ${bet} coins.`,
            );
        },
      },
    );
  }

  function reset() {
    setState("idle");
    setPlayerCards([]);
    setDealerCards([]);
    setPlayerWins(null);
  }

  const EMPTY_SLOTS = [0, 1, 2];

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
            Teen Patti
          </h3>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            3-Card Showdown
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-5 py-5 gap-5">
        <div
          className="rounded-xl relative flex flex-col items-center justify-around gap-4 py-5 px-4"
          style={{
            background:
              "radial-gradient(ellipse at center, oklch(0.16 0.06 155) 0%, oklch(0.09 0.02 155) 100%)",
            border: "2px solid oklch(0.62 0.13 78 / 0.3)",
            minHeight: "240px",
          }}
        >
          {/* Dealer row */}
          <div className="w-full">
            <p
              className="text-xs uppercase tracking-widest text-center mb-3"
              style={{ color: "oklch(0.62 0.13 78)" }}
            >
              Dealer
            </p>
            <div className="flex justify-center gap-2">
              <AnimatePresence mode="wait">
                {state === "idle"
                  ? EMPTY_SLOTS.map((i) => (
                      <div
                        key={`dealer-empty-${i}`}
                        className="rounded-lg"
                        style={{
                          width: 54,
                          height: 78,
                          background: "oklch(0.14 0 0)",
                          border: "1px dashed oklch(0.62 0.13 78 / 0.2)",
                        }}
                      />
                    ))
                  : dealerCards.map((c, i) => (
                      <PlayingCard
                        key={`dealer-${c.rank}-${c.suit}`}
                        card={c}
                        faceDown={state === "dealt"}
                        delay={0.1 + i * 0.1}
                      />
                    ))}
              </AnimatePresence>
            </div>
            {state === "revealed" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mt-2 text-xs uppercase tracking-wider"
                style={{ color: "oklch(0.62 0.13 78)" }}
              >
                {HAND_NAMES[handRank(dealerCards)]}
              </motion.p>
            )}
          </div>

          <div className="w-full flex items-center gap-2">
            <div
              className="flex-1 h-px"
              style={{ background: "oklch(0.62 0.13 78 / 0.2)" }}
            />
            <span className="text-xs" style={{ color: "oklch(0.62 0.13 78)" }}>
              VS
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: "oklch(0.62 0.13 78 / 0.2)" }}
            />
          </div>

          {/* Player row */}
          <div className="w-full">
            <div className="flex justify-center gap-2">
              <AnimatePresence mode="wait">
                {state === "idle"
                  ? EMPTY_SLOTS.map((i) => (
                      <div
                        key={`player-empty-${i}`}
                        className="rounded-lg"
                        style={{
                          width: 54,
                          height: 78,
                          background: "oklch(0.14 0 0)",
                          border: "1px dashed oklch(0.62 0.13 78 / 0.2)",
                        }}
                      />
                    ))
                  : playerCards.map((c, i) => (
                      <PlayingCard
                        key={`player-${c.rank}-${c.suit}`}
                        card={c}
                        faceDown={false}
                        delay={0.3 + i * 0.1}
                      />
                    ))}
              </AnimatePresence>
            </div>
            {state === "revealed" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mt-2 text-xs uppercase tracking-wider"
                style={{ color: "oklch(0.85 0.18 85)" }}
              >
                {HAND_NAMES[handRank(playerCards)]}
              </motion.p>
            )}
            <p
              className="text-center mt-3 text-xs uppercase tracking-widest"
              style={{ color: "oklch(0.62 0.13 78)" }}
            >
              You
            </p>
          </div>

          <AnimatePresence>
            {state === "revealed" && playerWins !== null && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div
                  className="px-8 py-3 rounded-xl font-display text-2xl font-bold uppercase tracking-widest"
                  style={{
                    background: playerWins
                      ? "linear-gradient(135deg, oklch(0.83 0.19 155 / 0.9), oklch(0.65 0.15 155 / 0.9))"
                      : "linear-gradient(135deg, oklch(0.62 0.25 25 / 0.9), oklch(0.45 0.2 25 / 0.9))",
                    color: "white",
                    boxShadow: playerWins
                      ? "0 0 30px oklch(0.83 0.19 155 / 0.5)"
                      : "0 0 30px oklch(0.62 0.25 25 / 0.5)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {playerWins ? "🏆 YOU WIN!" : "💸 DEALER WINS"}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label
              htmlFor="teenpatti-wager"
              className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block"
            >
              Wager (coins)
            </label>
            <Input
              id="teenpatti-wager"
              data-ocid="teenpatti.input"
              type="number"
              min={1}
              value={wager}
              onChange={(e) => setWager(e.target.value)}
              disabled={state === "dealt"}
              style={{
                background: "oklch(0.14 0 0)",
                border: "1px solid oklch(0.62 0.13 78 / 0.3)",
                color: "oklch(0.97 0 0)",
              }}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-auto">
          {state === "idle" && (
            <Button
              data-ocid="teenpatti.primary_button"
              onClick={deal}
              className="flex-1 font-bold uppercase tracking-wider py-6 text-base"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.87 0.19 85), oklch(0.62 0.13 78))",
                color: "oklch(0.07 0 0)",
                border: "none",
              }}
            >
              🃏 DEAL CARDS
            </Button>
          )}
          {state === "dealt" && (
            <Button
              data-ocid="teenpatti.secondary_button"
              onClick={reveal}
              className="flex-1 font-bold uppercase tracking-wider py-6 text-base"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.87 0.19 85), oklch(0.62 0.13 78))",
                color: "oklch(0.07 0 0)",
                border: "none",
              }}
            >
              👁 REVEAL DEALER
            </Button>
          )}
          {state === "revealed" && (
            <Button
              data-ocid="teenpatti.primary_button"
              onClick={reset}
              className="flex-1 font-bold uppercase tracking-wider py-6 text-base"
              style={{
                background: "oklch(0.17 0 0)",
                border: "1px solid oklch(0.62 0.13 78 / 0.4)",
                color: "oklch(0.85 0.18 85)",
              }}
            >
              🔄 PLAY AGAIN
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
