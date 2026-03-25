import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useActor } from "../../hooks/useActor";
import { useBalance } from "../../hooks/useQueries";

const RANKS = [
  "A",
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
];
const SUITS = ["♠", "♥", "♦", "♣"];
const SUIT_COLORS = ["#1a1a1a", "#c41e3a", "#c41e3a", "#1a1a1a"];
const HAND_NAMES = [
  "High Card",
  "Pair",
  "Color",
  "Sequence",
  "Pure Sequence",
  "Trail",
];

function parseCard(cardNum: number) {
  const rank = RANKS[cardNum % 13];
  const suitIdx = Math.floor(cardNum / 13);
  const suit = SUITS[suitIdx];
  const color = SUIT_COLORS[suitIdx];
  return { rank, suit, color };
}

function PlayingCard({
  cardNum,
  faceDown = false,
  delay = 0,
  revealed = false,
  slotKey,
}: {
  cardNum?: number;
  faceDown?: boolean;
  delay?: number;
  revealed?: boolean;
  slotKey: string;
}) {
  const card = cardNum !== undefined ? parseCard(cardNum) : null;

  return (
    <motion.div
      key={slotKey}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="relative rounded-lg overflow-hidden flex-shrink-0"
      style={{
        width: "60px",
        height: "90px",
        background:
          faceDown && !revealed
            ? "oklch(0.15 0.04 240)"
            : "oklch(0.97 0.01 85)",
        border:
          faceDown && !revealed
            ? "1px solid oklch(0.62 0.13 78 / 0.5)"
            : "1.5px solid oklch(0.62 0.13 78 / 0.8)",
        boxShadow: "0 4px 12px oklch(0 0 0 / 0.4)",
      }}
    >
      {faceDown && !revealed ? (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            background:
              "repeating-linear-gradient(45deg, oklch(0.18 0.04 240) 0px, oklch(0.18 0.04 240) 4px, oklch(0.12 0.03 240) 4px, oklch(0.12 0.03 240) 8px)",
          }}
        >
          <span style={{ fontSize: "24px" }}>🂠</span>
        </div>
      ) : card ? (
        <div className="p-1 w-full h-full flex flex-col justify-between">
          <div
            className="text-left"
            style={{
              color: card.color,
              fontSize: "13px",
              fontWeight: "bold",
              lineHeight: 1,
            }}
          >
            <div>{card.rank}</div>
            <div style={{ fontSize: "11px" }}>{card.suit}</div>
          </div>
          <div
            className="text-center"
            style={{ color: card.color, fontSize: "22px", lineHeight: 1 }}
          >
            {card.suit}
          </div>
          <div
            className="text-right"
            style={{
              color: card.color,
              fontSize: "13px",
              fontWeight: "bold",
              lineHeight: 1,
              transform: "rotate(180deg)",
            }}
          >
            <div>{card.rank}</div>
            <div style={{ fontSize: "11px" }}>{card.suit}</div>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}

function CardHand({
  cards,
  label,
  handRank,
  faceDown = false,
  revealed = false,
  win,
  handKey,
}: {
  cards: number[];
  label: string;
  handRank?: number;
  faceDown?: boolean;
  revealed?: boolean;
  win?: boolean;
  handKey: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span
        className="text-xs uppercase tracking-widest font-semibold"
        style={{ color: "oklch(0.85 0.18 85)" }}
      >
        {label}
      </span>
      <div
        className="flex gap-2 p-3 rounded-xl"
        style={{
          background: "oklch(0.09 0 0)",
          border:
            win === true
              ? "2px solid oklch(0.85 0.18 85 / 0.8)"
              : win === false
                ? "1px solid oklch(0.62 0.25 25 / 0.4)"
                : "1px solid oklch(0.62 0.13 78 / 0.2)",
          boxShadow:
            win === true ? "0 0 20px oklch(0.85 0.18 85 / 0.2)" : "none",
        }}
      >
        {cards.map((c, i) => (
          <PlayingCard
            key={`${handKey}-card-${c}`}
            slotKey={`${handKey}-card-${c}`}
            cardNum={c}
            faceDown={faceDown}
            revealed={revealed}
            delay={i * 0.1}
          />
        ))}
      </div>
      {handRank !== undefined && !faceDown && (
        <span
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: win ? "oklch(0.85 0.18 85)" : "oklch(0.65 0 0)" }}
        >
          {HAND_NAMES[handRank] ?? "Unknown"}
        </span>
      )}
    </div>
  );
}

interface TeenPattiResult {
  win: boolean;
  payout: bigint;
  playerCards: bigint[];
  dealerCards: bigint[];
  playerRank: bigint;
  dealerRank: bigint;
  message: string;
}

type GameState = "idle" | "dealing" | "result";

export default function TeenPattiGame() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { data: balance } = useBalance();

  const [wager, setWager] = useState(100);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [result, setResult] = useState<TeenPattiResult | null>(null);

  const placeholderCards = [0, 1, 2];

  async function handleDeal() {
    if (!actor || gameState !== "idle") return;
    setResult(null);
    setGameState("dealing");
    try {
      const res = await (actor as any).playTeenPatti(BigInt(wager));
      setResult(res as TeenPattiResult);
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["userInfo"] });
    } catch (_e) {
      setResult(null);
    }
    setGameState("result");
  }

  function handleAgain() {
    setGameState("idle");
    setResult(null);
  }

  const isDealing = gameState === "dealing";
  const isResult = gameState === "result" && result !== null;

  return (
    <div
      className="rounded-2xl overflow-hidden max-w-2xl mx-auto"
      style={{
        background: "oklch(0.08 0.02 150)",
        border: "1px solid oklch(0.62 0.13 78 / 0.3)",
        boxShadow: "0 0 60px oklch(0 0 0 / 0.5)",
      }}
    >
      <div
        className="relative px-6 py-8"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(0.18 0.06 150) 0%, oklch(0.10 0.03 150) 100%)",
          borderBottom: "1px solid oklch(0.62 0.13 78 / 0.2)",
          minHeight: "260px",
        }}
      >
        <div className="mb-6">
          {isResult ? (
            <CardHand
              cards={result.dealerCards.map(Number)}
              label="Dealer"
              handRank={Number(result.dealerRank)}
              revealed={true}
              win={!result.win}
              handKey="dealer-result"
            />
          ) : (
            <CardHand
              cards={placeholderCards}
              label="Dealer"
              faceDown={true}
              handKey="dealer-idle"
            />
          )}
        </div>

        <div className="flex items-center gap-3 my-4">
          <div
            className="flex-1 h-px"
            style={{ background: "oklch(0.62 0.13 78 / 0.2)" }}
          />
          <span
            className="text-xs uppercase tracking-widest font-bold px-3"
            style={{ color: "oklch(0.62 0.13 78)" }}
          >
            VS
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: "oklch(0.62 0.13 78 / 0.2)" }}
          />
        </div>

        <div className="mt-6">
          {isResult ? (
            <CardHand
              cards={result.playerCards.map(Number)}
              label="Your Hand"
              handRank={Number(result.playerRank)}
              revealed={true}
              win={result.win}
              handKey="player-result"
            />
          ) : (
            <CardHand
              cards={placeholderCards}
              label="Your Hand"
              faceDown={!isDealing}
              handKey="player-idle"
            />
          )}
        </div>

        <AnimatePresence>
          {isDealing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "oklch(0.05 0 0 / 0.6)" }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 1,
                  ease: "linear",
                }}
                className="w-10 h-10 rounded-full border-2 border-t-transparent"
                style={{ borderColor: "oklch(0.85 0.18 85)" }}
                data-ocid="teen_patti.loading_state"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 py-4 text-center"
            style={{
              background: result.win
                ? "oklch(0.83 0.19 155 / 0.08)"
                : "oklch(0.62 0.25 25 / 0.08)",
              borderBottom: `1px solid ${result.win ? "oklch(0.83 0.19 155 / 0.3)" : "oklch(0.62 0.25 25 / 0.3)"}`,
            }}
          >
            <p
              className="font-bold text-base"
              style={{
                color: result.win
                  ? "oklch(0.83 0.19 155)"
                  : "oklch(0.72 0.25 25)",
              }}
              data-ocid={
                result.win
                  ? "teen_patti.success_state"
                  : "teen_patti.error_state"
              }
            >
              {result.win
                ? `🏆 You Win! ${result.message}`
                : `😔 ${result.message}`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <label
              htmlFor="teen-patti-wager"
              className="block text-xs uppercase tracking-wider mb-2"
              style={{ color: "oklch(0.85 0.18 85)" }}
            >
              Wager
            </label>
            <input
              id="teen-patti-wager"
              data-ocid="teen_patti.wager.input"
              type="number"
              min={10}
              value={wager}
              onChange={(e) => setWager(Math.max(10, Number(e.target.value)))}
              disabled={gameState !== "idle"}
              className="w-full px-4 py-2 rounded-lg text-white outline-none"
              style={{
                border: "1px solid oklch(0.62 0.13 78 / 0.4)",
                background: "oklch(0.08 0 0)",
              }}
            />
          </div>
          <div className="pt-6 text-right">
            <span className="text-xs text-muted-foreground">
              Balance:{" "}
              <span style={{ color: "oklch(0.85 0.18 85)" }}>
                {balance !== undefined ? Number(balance).toLocaleString() : "—"}
              </span>
            </span>
          </div>
        </div>

        {gameState === "result" ? (
          <button
            type="button"
            data-ocid="teen_patti.deal_again.button"
            onClick={handleAgain}
            className="w-full py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-opacity hover:opacity-90"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.87 0.19 85), oklch(0.62 0.13 78))",
              color: "oklch(0.07 0 0)",
            }}
          >
            🃏 Deal Again
          </button>
        ) : (
          <button
            type="button"
            data-ocid="teen_patti.deal.primary_button"
            onClick={handleDeal}
            disabled={gameState !== "idle" || !actor || wager < 10}
            className="w-full py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-all disabled:opacity-50"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.87 0.19 85), oklch(0.62 0.13 78))",
              color: "oklch(0.07 0 0)",
            }}
          >
            {isDealing ? "Dealing Cards…" : "🃏 Deal Cards"}
          </button>
        )}
      </div>
    </div>
  );
}
