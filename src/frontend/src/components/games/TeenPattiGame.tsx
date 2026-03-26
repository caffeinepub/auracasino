import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { usePlayerSession } from "../../contexts/PlayerSessionContext";
import { getAnonActor } from "../../utils/anonActor";

interface TeenPattiGameProps {
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
const RANK_NAMES = [
  "High Card",
  "Pair",
  "Color",
  "Sequence",
  "Pure Sequence",
  "Trail",
];
const DUMMY_CARDS = ["d0", "d1", "d2"];

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
        className="w-14 h-20 rounded-lg flex items-center justify-center font-bold text-2xl"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.25 0.08 264), oklch(0.35 0.1 295))",
          border: "1px solid oklch(0.4 0.08 295)",
        }}
      >
        🂠
      </div>
    );
  }
  const { rank, suit, isRed } = cardToDisplay(cardNum);
  return (
    <div
      className="w-14 h-20 rounded-lg flex flex-col items-center justify-center font-bold"
      style={{
        background: "white",
        border: "1px solid oklch(0.8 0 0)",
        color: isRed ? "oklch(0.5 0.25 25)" : "oklch(0.15 0 0)",
      }}
    >
      <span className="text-lg leading-none">{rank}</span>
      <span className="text-xl leading-none">{suit}</span>
    </div>
  );
}

export default function TeenPattiGame({
  onBack,
  requireLogin,
}: TeenPattiGameProps) {
  const { session, updateBalance } = usePlayerSession();
  const [wager, setWager] = useState(100);
  const [phase, setPhase] = useState<"betting" | "playing" | "result">(
    "betting",
  );
  const [playerCards, setPlayerCards] = useState<number[]>([]);
  const [dealerCards, setDealerCards] = useState<number[]>([]);
  const [showDealer, setShowDealer] = useState(false);
  const [result, setResult] = useState<{
    win: boolean;
    message: string;
    payout: number;
    playerRank: number;
    dealerRank: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBlind = () => requireLogin(() => doPlay(false));
  const handleSee = () => requireLogin(() => doPlay(true));
  const handlePack = () =>
    requireLogin(() => {
      setResult({
        win: false,
        message: "You packed. Dealer wins.",
        payout: 0,
        playerRank: 0,
        dealerRank: 0,
      });
      setPhase("result");
    });

  const doPlay = async (isSee: boolean) => {
    if (loading || !session) return;
    const actualWager = isSee ? wager * 2 : wager;
    if (actualWager > session.balance) return;
    setLoading(true);
    setPhase("playing");
    try {
      const actor = await getAnonActor();
      const res = await (actor as any).playerPlayTeenPatti(
        session.username,
        session.password,
        BigInt(actualWager),
      );
      const pCards = (res.playerCards as bigint[]).map(Number);
      const dCards = (res.dealerCards as bigint[]).map(Number);
      setPlayerCards(pCards);
      setDealerCards(dCards);
      setShowDealer(true);
      const payout = Number(res.payout);
      updateBalance(session.balance - actualWager + payout);
      setResult({
        win: res.win,
        message: res.message,
        payout,
        playerRank: Number(res.playerRank),
        dealerRank: Number(res.dealerRank),
      });
      setPhase("result");
    } catch {
      setResult({
        win: false,
        message: "Connection error. Try again.",
        payout: 0,
        playerRank: 0,
        dealerRank: 0,
      });
      setPhase("result");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPhase("betting");
    setPlayerCards([]);
    setDealerCards([]);
    setShowDealer(false);
    setResult(null);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.18 0.06 295) 0%, oklch(0.1 0.03 295) 100%)",
      }}
    >
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-lg transition-colors hover:bg-muted"
            data-ocid="teenpatti.back_button"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-extrabold neon-purple">🃏 Teen Patti</h1>
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
          className="rounded-3xl p-6 mb-6 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.22 0.08 155), oklch(0.28 0.1 155))",
            border: "4px solid oklch(0.3 0.08 155)",
            minHeight: 240,
          }}
        >
          <div
            className="absolute inset-4 rounded-3xl opacity-20"
            style={{ border: "2px solid white" }}
          />
          <div className="relative">
            <div className="text-center mb-6">
              <p className="text-xs text-white/60 mb-2 font-semibold uppercase tracking-wider">
                Dealer
              </p>
              <div className="flex gap-2 justify-center">
                {dealerCards.length > 0
                  ? dealerCards.map((c, i) => (
                      <PlayingCard
                        key={c + i * 100}
                        cardNum={c}
                        faceDown={!showDealer}
                      />
                    ))
                  : DUMMY_CARDS.map((k) => (
                      <PlayingCard key={k} cardNum={0} faceDown={true} />
                    ))}
              </div>
              {result && (
                <p className="text-xs text-white/70 mt-1">
                  {RANK_NAMES[result.dealerRank] || ""}
                </p>
              )}
            </div>
            <div className="text-center">
              <p className="text-xs text-white/60 mb-2 font-semibold uppercase tracking-wider">
                You
              </p>
              <div className="flex gap-2 justify-center">
                {playerCards.length > 0
                  ? playerCards.map((c, i) => (
                      <PlayingCard key={c + i * 100 + 1} cardNum={c} />
                    ))
                  : DUMMY_CARDS.map((k) => (
                      <PlayingCard key={k} cardNum={0} faceDown={true} />
                    ))}
              </div>
              {result && (
                <p className="text-xs text-white/70 mt-1">
                  {RANK_NAMES[result.playerRank] || ""}
                </p>
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
              data-ocid={
                result.win ? "teenpatti.success_state" : "teenpatti.error_state"
              }
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
                Blind Bet
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
                          ? "oklch(0.72 0.22 295 / 0.3)"
                          : "oklch(0.16 0.03 264)",
                      color:
                        wager === v
                          ? "oklch(0.72 0.22 295)"
                          : "oklch(0.6 0.03 264)",
                      border: `1px solid ${wager === v ? "oklch(0.72 0.22 295 / 0.5)" : "oklch(0.22 0.04 264)"}`,
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={handlePack}
                disabled={loading}
                className="py-3 rounded-xl font-extrabold text-sm transition-all"
                style={{
                  background: "oklch(0.62 0.25 25 / 0.2)",
                  color: "oklch(0.75 0.2 25)",
                  border: "1px solid oklch(0.62 0.25 25 / 0.4)",
                }}
                data-ocid="teenpatti.secondary_button"
              >
                PACK
              </button>
              <button
                type="button"
                onClick={handleBlind}
                disabled={loading}
                className="py-3 rounded-xl font-extrabold text-sm btn-neon-cyan transition-all disabled:opacity-50"
                data-ocid="teenpatti.primary_button"
              >
                BLIND ({wager})
              </button>
              <button
                type="button"
                onClick={handleSee}
                disabled={loading}
                className="py-3 rounded-xl font-extrabold text-sm transition-all"
                style={{
                  background: "oklch(0.72 0.22 295 / 0.2)",
                  color: "oklch(0.72 0.22 295)",
                  border: "1px solid oklch(0.72 0.22 295 / 0.4)",
                }}
                data-ocid="teenpatti.secondary_button"
              >
                SEE ({wager * 2})
              </button>
            </div>
          </div>
        )}
        {phase === "result" && (
          <button
            type="button"
            onClick={reset}
            className="w-full py-4 rounded-xl font-extrabold text-lg btn-neon-cyan transition-all"
            data-ocid="teenpatti.secondary_button"
          >
            Play Again
          </button>
        )}
      </div>
    </div>
  );
}
