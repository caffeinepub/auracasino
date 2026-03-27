import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { usePlayerSession } from "../../contexts/PlayerSessionContext";
import { getAnonActor } from "../../utils/anonActor";

interface AndarBaharGameProps {
  onBack: () => void;
  requireLogin: (onSuccess?: () => void) => void;
}

const SUITS = ["♠", "♥", "♦", "♣"];
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

function cardToDisplay(cardNum: number) {
  const rank = RANKS[cardNum % 13];
  const suit = SUITS[Math.floor(cardNum / 13) % 4];
  const isRed = suit === "♥" || suit === "♦";
  return { rank, suit, isRed };
}

function PlayingCard({
  cardNum,
  faceDown,
}: { cardNum: number; faceDown?: boolean }) {
  if (faceDown) {
    return (
      <div
        className="w-12 h-18 rounded-lg flex items-center justify-center font-bold text-2xl"
        style={{
          width: 48,
          height: 72,
          background:
            "linear-gradient(135deg, oklch(0.25 0.08 264), oklch(0.35 0.1 195))",
          border: "1px solid oklch(0.4 0.1 195)",
        }}
      >
        🂠
      </div>
    );
  }
  const { rank, suit, isRed } = cardToDisplay(cardNum);
  return (
    <div
      className="rounded-lg flex flex-col items-center justify-center font-bold"
      style={{
        width: 48,
        height: 72,
        background: "white",
        border: "1px solid oklch(0.8 0 0)",
        color: isRed ? "oklch(0.5 0.25 25)" : "oklch(0.15 0 0)",
      }}
    >
      <span className="text-base leading-none">{rank}</span>
      <span className="text-lg leading-none">{suit}</span>
    </div>
  );
}

export default function AndarBaharGame({
  onBack,
  requireLogin,
}: AndarBaharGameProps) {
  const { session, updateBalance } = usePlayerSession();
  const [wager, setWager] = useState(100);
  const [_bet, setBet] = useState<"andar" | "bahar" | null>(null);
  const [phase, setPhase] = useState<"betting" | "playing" | "result">(
    "betting",
  );
  const [jokerCard, setJokerCard] = useState<number | null>(null);
  const [andarCards, setAndarCards] = useState<number[]>([]);
  const [baharCards, setBaharCards] = useState<number[]>([]);
  const [result, setResult] = useState<{
    win: boolean;
    message: string;
    payout: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBet = (side: "andar" | "bahar") => {
    setBet(side);
    requireLogin(() => doPlay(side));
  };

  const doPlay = async (side: "andar" | "bahar") => {
    if (loading || !session) return;
    if (wager > session.balance) return;
    setLoading(true);
    setPhase("playing");
    try {
      // Simulate Andar Bahar game locally since backend may not have this method
      await new Promise((r) => setTimeout(r, 900));
      const joker = Math.floor(Math.random() * 52);
      const jokerRank = joker % 13;
      // Deal cards alternately to Andar and Bahar until one matches joker rank
      const andar: number[] = [];
      const bahar: number[] = [];
      let winner: "andar" | "bahar" | null = null;
      let deck = Array.from({ length: 52 }, (_, i) => i).filter(
        (c) => c !== joker,
      );
      // Shuffle
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      let idx = 0;
      let turn = 0; // 0 = andar, 1 = bahar
      while (winner === null && idx < deck.length) {
        const card = deck[idx++];
        if (turn === 0) {
          andar.push(card);
          if (card % 13 === jokerRank) winner = "andar";
        } else {
          bahar.push(card);
          if (card % 13 === jokerRank) winner = "bahar";
        }
        turn = 1 - turn;
        if (andar.length + bahar.length > 12) break; // cap for display
      }
      if (!winner) winner = Math.random() < 0.5 ? "andar" : "bahar";
      const win = side === winner;
      const payout = win ? wager * 2 : 0;
      updateBalance(session.balance - wager + payout);
      setJokerCard(joker);
      setAndarCards(andar.slice(0, 6));
      setBaharCards(bahar.slice(0, 6));
      setResult({
        win,
        message: `${winner.toUpperCase()} wins! You bet ${side.toUpperCase()}.`,
        payout,
      });
      setPhase("result");
    } catch {
      setResult({
        win: false,
        message: "Connection error. Try again.",
        payout: 0,
      });
      setPhase("result");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPhase("betting");
    setBet(null);
    setJokerCard(null);
    setAndarCards([]);
    setBaharCards([]);
    setResult(null);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.14 0.06 195) 0%, oklch(0.09 0.03 264) 100%)",
      }}
    >
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-lg transition-colors hover:bg-muted"
            data-ocid="andarbahr.back_button"
          >
            <ArrowLeft size={20} />
          </button>
          <h1
            className="text-2xl font-extrabold"
            style={{ color: "oklch(0.87 0.15 195)" }}
          >
            🃏 Andar Bahar
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

        {/* Joker Card */}
        <div
          className="rounded-2xl p-5 mb-4 text-center"
          style={{
            background: "oklch(0.13 0.04 264)",
            border: "1px solid oklch(0.25 0.06 195 / 0.6)",
          }}
        >
          <p className="text-xs text-white/50 uppercase tracking-widest mb-3">
            Joker Card
          </p>
          <div className="flex justify-center">
            {jokerCard !== null ? (
              <PlayingCard cardNum={jokerCard} />
            ) : (
              <PlayingCard cardNum={0} faceDown />
            )}
          </div>
        </div>

        {/* Andar / Bahar Table */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div
            className="rounded-2xl p-3"
            style={{
              background: "oklch(0.16 0.06 220 / 0.5)",
              border: "2px solid oklch(0.65 0.18 220 / 0.5)",
            }}
          >
            <p
              className="text-xs font-extrabold uppercase tracking-widest mb-2 text-center"
              style={{ color: "oklch(0.75 0.18 220)" }}
            >
              ANDAR
            </p>
            <div className="flex flex-wrap gap-1 justify-center min-h-[72px] items-center">
              {andarCards.length > 0 ? (
                andarCards.map((c, i) => (
                  <PlayingCard key={c + i * 100} cardNum={c} />
                ))
              ) : (
                <PlayingCard cardNum={0} faceDown />
              )}
            </div>
          </div>
          <div
            className="rounded-2xl p-3"
            style={{
              background: "oklch(0.16 0.08 25 / 0.4)",
              border: "2px solid oklch(0.65 0.22 25 / 0.5)",
            }}
          >
            <p
              className="text-xs font-extrabold uppercase tracking-widest mb-2 text-center"
              style={{ color: "oklch(0.75 0.22 10)" }}
            >
              BAHAR
            </p>
            <div className="flex flex-wrap gap-1 justify-center min-h-[72px] items-center">
              {baharCards.length > 0 ? (
                baharCards.map((c, i) => (
                  <PlayingCard key={c + i * 100 + 1} cardNum={c} />
                ))
              ) : (
                <PlayingCard cardNum={0} faceDown />
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl p-4 mb-4 text-center font-bold"
              style={{
                background: result.win
                  ? "oklch(0.82 0.19 155 / 0.15)"
                  : "oklch(0.62 0.25 25 / 0.15)",
                border: `1px solid ${result.win ? "oklch(0.82 0.19 155 / 0.4)" : "oklch(0.62 0.25 25 / 0.4)"}`,
              }}
            >
              <p
                className={
                  result.win ? "win-text text-lg" : "loss-text text-lg"
                }
              >
                {result.win ? `🎉 WIN +${result.payout}` : "❌ LOSE"}
              </p>
              <p className="text-sm text-muted-foreground">{result.message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {phase !== "result" && (
          <div
            className="rounded-xl p-5"
            style={{
              background: "oklch(0.11 0.03 264)",
              border: "1px solid oklch(0.22 0.04 264)",
            }}
          >
            <div className="mb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Bet Amount
              </p>
              <div className="flex gap-2">
                {[50, 100, 200, 500].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setWager(v)}
                    className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                    style={{
                      background:
                        wager === v
                          ? "oklch(0.65 0.18 220 / 0.3)"
                          : "oklch(0.16 0.03 264)",
                      color:
                        wager === v
                          ? "oklch(0.75 0.18 220)"
                          : "oklch(0.6 0.03 264)",
                      border: `1px solid ${wager === v ? "oklch(0.65 0.18 220 / 0.5)" : "oklch(0.22 0.04 264)"}`,
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 text-center">
              Pick Your Side
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleBet("andar")}
                disabled={loading}
                className="py-4 rounded-xl font-extrabold text-lg transition-all disabled:opacity-50"
                style={{
                  background: "oklch(0.65 0.18 220 / 0.2)",
                  color: "oklch(0.75 0.18 220)",
                  border: "2px solid oklch(0.65 0.18 220 / 0.5)",
                }}
                data-ocid="andarbahr.andar_button"
              >
                ANDAR
              </button>
              <button
                type="button"
                onClick={() => handleBet("bahar")}
                disabled={loading}
                className="py-4 rounded-xl font-extrabold text-lg transition-all disabled:opacity-50"
                style={{
                  background: "oklch(0.62 0.22 25 / 0.2)",
                  color: "oklch(0.75 0.22 10)",
                  border: "2px solid oklch(0.62 0.22 25 / 0.5)",
                }}
                data-ocid="andarbahr.bahar_button"
              >
                BAHAR
              </button>
            </div>
          </div>
        )}

        {phase === "result" && (
          <button
            type="button"
            onClick={reset}
            className="w-full py-4 rounded-xl font-extrabold text-lg btn-neon-cyan transition-all"
            data-ocid="andarbahr.play_again_button"
          >
            Play Again
          </button>
        )}
      </div>
    </div>
  );
}
