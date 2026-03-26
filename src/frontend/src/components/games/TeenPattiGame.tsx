import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { usePlayerSession } from "../../contexts/PlayerSessionContext";
import { usePlayerPlayTeenPatti } from "../../hooks/useQueries";

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
    <div className="flex flex-col items-center gap-2">
      <span
        className="text-xs uppercase tracking-widest font-semibold"
        style={{ color: "rgba(255,215,0,0.85)" }}
      >
        {label}
      </span>
      <div
        className="flex gap-2 p-3 rounded-xl"
        style={{
          background: "rgba(0,0,0,0.25)",
          border:
            win === true
              ? "2px solid rgba(255,215,0,0.8)"
              : win === false
                ? "1px solid rgba(220,50,50,0.4)"
                : "1px solid rgba(255,215,0,0.15)",
          boxShadow: win === true ? "0 0 20px rgba(255,215,0,0.2)" : "none",
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
          style={{ color: win ? "rgba(255,215,0,1)" : "rgba(180,180,180,0.8)" }}
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

export default function TeenPattiGame({
  onRequireLogin,
}: { onRequireLogin?: () => void }) {
  const { session } = usePlayerSession();
  const playTeenPatti = usePlayerPlayTeenPatti();

  const [wager, setWager] = useState(100);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [result, setResult] = useState<TeenPattiResult | null>(null);

  const placeholderCards = [0, 1, 2];

  async function handleDeal() {
    if (gameState !== "idle") return;
    if (!session) {
      onRequireLogin?.();
      return;
    }
    setResult(null);
    setGameState("dealing");
    try {
      const res = await playTeenPatti.mutateAsync(wager);
      setResult(res as TeenPattiResult);
    } catch (_e) {
      setResult(null);
    }
    setGameState("result");
  }

  function handlePack() {
    if (gameState !== "idle") return;
    if (!session) {
      onRequireLogin?.();
      return;
    }
    setResult({
      win: false,
      payout: 0n,
      playerCards: [0n, 1n, 2n],
      dealerCards: [3n, 4n, 5n],
      playerRank: 0n,
      dealerRank: 0n,
      message: "You packed. Better luck next time!",
    });
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
        background:
          "linear-gradient(135deg, #1a0a2e 0%, #2d0f4e 50%, #1a0a2e 100%)",
        border: "1px solid rgba(160,100,220,0.4)",
        boxShadow:
          "0 0 60px rgba(100,0,180,0.4), 0 0 120px rgba(100,0,180,0.2)",
      }}
    >
      {/* Table area */}
      <div className="relative px-4 py-6" style={{ minHeight: "320px" }}>
        {/* Green oval table */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            transform: "translate(-50%, -50%)",
            width: "88%",
            height: "200px",
            background:
              "radial-gradient(ellipse at center, #1a7a1a 0%, #0d5c0d 60%, #094009 100%)",
            borderRadius: "50%",
            border: "4px solid rgba(255,215,0,0.6)",
            boxShadow:
              "0 0 30px rgba(0,180,0,0.15), inset 0 0 40px rgba(0,0,0,0.4)",
          }}
        />

        {/* Dealer hand — top of table */}
        <div className="relative z-10 mb-4">
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

        {/* VS divider */}
        <div className="relative z-10 flex items-center gap-3 my-2">
          <div
            className="flex-1 h-px"
            style={{ background: "rgba(255,215,0,0.2)" }}
          />
          <span
            className="text-xs uppercase tracking-widest font-bold px-3"
            style={{ color: "rgba(255,215,0,0.7)" }}
          >
            VS
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: "rgba(255,215,0,0.2)" }}
          />
        </div>

        {/* Player hand — bottom of table */}
        <div className="relative z-10 mt-4">
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

        {/* Dealing overlay */}
        <AnimatePresence>
          {isDealing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-20"
              style={{ background: "rgba(10,2,20,0.6)" }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 1,
                  ease: "linear",
                }}
                className="w-10 h-10 rounded-full border-2 border-t-transparent"
                style={{ borderColor: "rgba(255,215,0,0.9)" }}
                data-ocid="teen_patti.loading_state"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Result banner */}
      <AnimatePresence>
        {isResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 py-3 text-center"
            style={{
              background: result.win
                ? "rgba(20,100,20,0.25)"
                : "rgba(120,20,20,0.2)",
              borderTop: `1px solid ${result.win ? "rgba(50,200,50,0.3)" : "rgba(200,50,50,0.3)"}`,
              borderBottom: `1px solid ${result.win ? "rgba(50,200,50,0.3)" : "rgba(200,50,50,0.3)"}`,
            }}
          >
            <p
              className="font-bold text-base"
              style={{ color: result.win ? "#4ade80" : "#f87171" }}
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

      {/* Controls */}
      <div className="p-5">
        {/* Wager + balance row */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex-1">
            <label
              htmlFor="teen-patti-wager"
              className="block text-xs uppercase tracking-wider mb-2"
              style={{ color: "rgba(255,215,0,0.85)" }}
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
                border: "1px solid rgba(160,100,220,0.5)",
                background: "rgba(255,255,255,0.07)",
              }}
            />
          </div>
          <div className="pt-6 text-right">
            <span
              className="text-xs"
              style={{ color: "rgba(200,180,220,0.7)" }}
            >
              Balance:{" "}
              <span style={{ color: "rgba(255,215,0,1)", fontWeight: "bold" }}>
                {session ? session.balance.toLocaleString() : "—"}
              </span>
            </span>
          </div>
        </div>

        {/* Action buttons */}
        {gameState === "result" ? (
          <button
            type="button"
            data-ocid="teen_patti.deal_again.button"
            onClick={handleAgain}
            className="w-full py-3 rounded-full font-bold uppercase tracking-widest text-sm transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #d4a017, #f0c040, #d4a017)",
              color: "#1a0a2e",
              boxShadow: "0 4px 20px rgba(212,160,23,0.4)",
            }}
          >
            🃏 PLAY AGAIN
          </button>
        ) : (
          <div className="flex gap-3">
            {/* PACK */}
            <button
              type="button"
              data-ocid="teen_patti.pack.button"
              onClick={handlePack}
              disabled={isDealing}
              className="flex-1 py-3 rounded-full font-bold uppercase tracking-wider text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isDealing
                  ? "rgba(180,40,40,0.4)"
                  : "linear-gradient(135deg, #c0392b, #e74c3c, #c0392b)",
                color: "#fff",
                boxShadow: isDealing
                  ? "none"
                  : "0 4px 16px rgba(220,50,50,0.4)",
                border: "1px solid rgba(255,100,100,0.3)",
              }}
            >
              PACK
            </button>

            {/* BLIND */}
            <button
              type="button"
              data-ocid="teen_patti.blind.button"
              onClick={handleDeal}
              disabled={isDealing || wager < 10}
              className="flex-1 py-3 rounded-full font-bold uppercase tracking-wider text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isDealing
                  ? "rgba(180,130,0,0.4)"
                  : "linear-gradient(135deg, #d4a017, #f0c040, #d4a017)",
                color: "#1a0a2e",
                boxShadow: isDealing
                  ? "none"
                  : "0 4px 16px rgba(212,160,23,0.5)",
                border: "1px solid rgba(255,215,0,0.4)",
              }}
            >
              {isDealing ? (
                <span className="flex items-center justify-center gap-1">
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 0.8,
                    }}
                  >
                    ⟳
                  </motion.span>
                  Dealing…
                </span>
              ) : (
                "BLIND"
              )}
            </button>

            {/* SEE */}
            <button
              type="button"
              data-ocid="teen_patti.see.button"
              onClick={handleDeal}
              disabled={isDealing || wager < 10}
              className="flex-1 py-3 rounded-full font-bold uppercase tracking-wider text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isDealing
                  ? "rgba(20,100,20,0.4)"
                  : "linear-gradient(135deg, #1a7a1a, #2ecc71, #1a7a1a)",
                color: "#fff",
                boxShadow: isDealing
                  ? "none"
                  : "0 4px 16px rgba(30,180,80,0.4)",
                border: "1px solid rgba(50,220,100,0.4)",
              }}
            >
              SEE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
