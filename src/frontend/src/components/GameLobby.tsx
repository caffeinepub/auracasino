import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Loader2, Lock } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { usePlayerSession } from "../contexts/PlayerSessionContext";
import { getAnonActor } from "../utils/anonActor";
import AviatorGame from "./games/AviatorGame";
import RouletteGame from "./games/RouletteGame";
import TeenPattiGame from "./games/TeenPattiGame";

type Game = "aviator" | "roulette" | "teenPatti";

const WHEEL_SEGMENTS = [
  {
    num: 0,
    d: "M100,80 L163.0,80.0 A63,63 0 0,1 162.0938,90.6471 Z",
    color: "#166534",
  },
  {
    num: 1,
    d: "M100,80 L162.0938,90.6471 A63,63 0 0,1 159.4013,100.9878 Z",
    color: "#b91c1c",
  },
  {
    num: 2,
    d: "M100,80 L159.4013,100.9878 A63,63 0 0,1 154.9999,110.7248 Z",
    color: "#111111",
  },
  {
    num: 3,
    d: "M100,80 L154.9999,110.7248 A63,63 0 0,1 149.0163,119.5779 Z",
    color: "#b91c1c",
  },
  {
    num: 4,
    d: "M100,80 L149.0163,119.5779 A63,63 0 0,1 141.6225,127.2924 Z",
    color: "#111111",
  },
  {
    num: 5,
    d: "M100,80 L141.6225,127.2924 A63,63 0 0,1 133.0314,133.6463 Z",
    color: "#b91c1c",
  },
  {
    num: 6,
    d: "M100,80 L133.0314,133.6463 A63,63 0 0,1 123.49,138.457 Z",
    color: "#111111",
  },
  {
    num: 7,
    d: "M100,80 L123.49,138.457 A63,63 0 0,1 113.2728,141.586 Z",
    color: "#b91c1c",
  },
  {
    num: 8,
    d: "M100,80 L113.2728,141.586 A63,63 0 0,1 102.6738,142.9432 Z",
    color: "#111111",
  },
  {
    num: 9,
    d: "M100,80 L102.6738,142.9432 A63,63 0 0,1 91.9979,142.4897 Z",
    color: "#b91c1c",
  },
  {
    num: 10,
    d: "M100,80 L91.9979,142.4897 A63,63 0 0,1 81.5522,140.2385 Z",
    color: "#111111",
  },
  {
    num: 11,
    d: "M100,80 L81.5522,140.2385 A63,63 0 0,1 71.6372,136.2543 Z",
    color: "#111111",
  },
  {
    num: 12,
    d: "M100,80 L71.6372,136.2543 A63,63 0 0,1 62.5381,130.6518 Z",
    color: "#b91c1c",
  },
  {
    num: 13,
    d: "M100,80 L62.5381,130.6518 A63,63 0 0,1 54.5168,123.5921 Z",
    color: "#111111",
  },
  {
    num: 14,
    d: "M100,80 L54.5168,123.5921 A63,63 0 0,1 47.8039,115.2784 Z",
    color: "#b91c1c",
  },
  {
    num: 15,
    d: "M100,80 L47.8039,115.2784 A63,63 0 0,1 42.5926,105.9498 Z",
    color: "#111111",
  },
  {
    num: 16,
    d: "M100,80 L42.5926,105.9498 A63,63 0 0,1 39.0328,95.8746 Z",
    color: "#b91c1c",
  },
  {
    num: 17,
    d: "M100,80 L39.0328,95.8746 A63,63 0 0,1 37.227,85.3428 Z",
    color: "#111111",
  },
  {
    num: 18,
    d: "M100,80 L37.227,85.3428 A63,63 0 0,1 37.227,74.6572 Z",
    color: "#b91c1c",
  },
  {
    num: 19,
    d: "M100,80 L37.227,74.6572 A63,63 0 0,1 39.0328,64.1254 Z",
    color: "#b91c1c",
  },
  {
    num: 20,
    d: "M100,80 L39.0328,64.1254 A63,63 0 0,1 42.5926,54.0502 Z",
    color: "#111111",
  },
  {
    num: 21,
    d: "M100,80 L42.5926,54.0502 A63,63 0 0,1 47.8039,44.7216 Z",
    color: "#b91c1c",
  },
  {
    num: 22,
    d: "M100,80 L47.8039,44.7216 A63,63 0 0,1 54.5168,36.4079 Z",
    color: "#111111",
  },
  {
    num: 23,
    d: "M100,80 L54.5168,36.4079 A63,63 0 0,1 62.5381,29.3482 Z",
    color: "#b91c1c",
  },
  {
    num: 24,
    d: "M100,80 L62.5381,29.3482 A63,63 0 0,1 71.6372,23.7457 Z",
    color: "#111111",
  },
  {
    num: 25,
    d: "M100,80 L71.6372,23.7457 A63,63 0 0,1 81.5522,19.7615 Z",
    color: "#b91c1c",
  },
  {
    num: 26,
    d: "M100,80 L81.5522,19.7615 A63,63 0 0,1 91.9979,17.5103 Z",
    color: "#111111",
  },
  {
    num: 27,
    d: "M100,80 L91.9979,17.5103 A63,63 0 0,1 102.6738,17.0568 Z",
    color: "#b91c1c",
  },
  {
    num: 28,
    d: "M100,80 L102.6738,17.0568 A63,63 0 0,1 113.2728,18.414 Z",
    color: "#111111",
  },
  {
    num: 29,
    d: "M100,80 L113.2728,18.414 A63,63 0 0,1 123.49,21.543 Z",
    color: "#111111",
  },
  {
    num: 30,
    d: "M100,80 L123.49,21.543 A63,63 0 0,1 133.0314,26.3537 Z",
    color: "#b91c1c",
  },
  {
    num: 31,
    d: "M100,80 L133.0314,26.3537 A63,63 0 0,1 141.6225,32.7076 Z",
    color: "#111111",
  },
  {
    num: 32,
    d: "M100,80 L141.6225,32.7076 A63,63 0 0,1 149.0163,40.4221 Z",
    color: "#b91c1c",
  },
  {
    num: 33,
    d: "M100,80 L149.0163,40.4221 A63,63 0 0,1 154.9999,49.2752 Z",
    color: "#111111",
  },
  {
    num: 34,
    d: "M100,80 L154.9999,49.2752 A63,63 0 0,1 159.4013,59.0122 Z",
    color: "#b91c1c",
  },
  {
    num: 35,
    d: "M100,80 L159.4013,59.0122 A63,63 0 0,1 162.0938,69.3529 Z",
    color: "#111111",
  },
  {
    num: 36,
    d: "M100,80 L162.0938,69.3529 A63,63 0 0,1 163.0,80.0 Z",
    color: "#b91c1c",
  },
] as const;

const AviatorSVG = (
  <svg
    viewBox="0 0 200 160"
    className="w-full h-full"
    aria-label="Aviator game"
  >
    <title>Aviator</title>
    <defs>
      <radialGradient id="av-bg" cx="50%" cy="80%" r="70%">
        <stop offset="0%" stopColor="oklch(0.10 0.04 240)" />
        <stop offset="100%" stopColor="oklch(0.06 0 0)" />
      </radialGradient>
      <linearGradient id="av-curve" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="oklch(0.85 0.18 85)" stopOpacity="0.1" />
        <stop offset="100%" stopColor="oklch(0.85 0.18 85)" stopOpacity="0.8" />
      </linearGradient>
      <linearGradient id="av-gold" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="oklch(0.62 0.13 78)" />
        <stop offset="100%" stopColor="oklch(0.87 0.19 85)" />
      </linearGradient>
      <filter id="av-glow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <rect width="200" height="160" fill="url(#av-bg)" />
    <circle cx="20" cy="20" r="1" fill="white" opacity="0.4" />
    <circle cx="50" cy="10" r="1" fill="white" opacity="0.6" />
    <circle cx="80" cy="30" r="1" fill="white" opacity="0.8" />
    <circle cx="120" cy="15" r="1" fill="white" opacity="0.4" />
    <circle cx="160" cy="25" r="1" fill="white" opacity="0.6" />
    <circle cx="185" cy="10" r="1" fill="white" opacity="0.8" />
    <circle cx="170" cy="50" r="1" fill="white" opacity="0.4" />
    <circle cx="30" cy="50" r="1" fill="white" opacity="0.6" />
    <circle cx="140" cy="40" r="1" fill="white" opacity="0.8" />
    <path
      d="M10,145 Q60,140 100,110 Q140,80 185,25 L185,155 L10,155 Z"
      fill="oklch(0.85 0.18 85 / 0.06)"
    />
    <path
      d="M10,145 Q60,140 100,110 Q140,80 185,25"
      fill="none"
      stroke="url(#av-curve)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M10,145 Q60,140 100,110 Q140,80 185,25"
      fill="none"
      stroke="oklch(0.85 0.18 85 / 0.3)"
      strokeWidth="5"
      filter="url(#av-glow)"
    />
    <g transform="translate(175, 28) rotate(-35)">
      <ellipse cx="0" cy="0" rx="10" ry="4" fill="url(#av-gold)" />
      <ellipse cx="7" cy="-1" rx="4" ry="2.5" fill="oklch(0.90 0.15 85)" />
      <polygon points="-2,-4 -8,-12 -12,-4" fill="oklch(0.75 0.16 82)" />
      <polygon points="-2,4 -8,12 -12,4" fill="oklch(0.75 0.16 82)" />
      <polygon points="-9,-2 -14,-7 -10,-2" fill="oklch(0.62 0.13 78)" />
    </g>
    <text
      x="18"
      y="75"
      fontFamily="monospace"
      fontSize="22"
      fontWeight="bold"
      fill="oklch(0.87 0.19 85)"
      opacity="0.9"
    >
      2.47x
    </text>
    <line
      x1="10"
      y1="155"
      x2="190"
      y2="155"
      stroke="oklch(0.85 0.18 85 / 0.15)"
      strokeWidth="1"
    />
    <line
      x1="10"
      y1="155"
      x2="10"
      y2="10"
      stroke="oklch(0.85 0.18 85 / 0.15)"
      strokeWidth="1"
    />
  </svg>
);

const RouletteSVG = (
  <svg
    viewBox="0 0 200 160"
    className="w-full h-full"
    aria-label="Roulette wheel"
  >
    <title>Roulette</title>
    <defs>
      <radialGradient id="rl-bg" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="oklch(0.16 0.04 78)" />
        <stop offset="100%" stopColor="oklch(0.08 0 0)" />
      </radialGradient>
      <radialGradient id="rl-rim" cx="50%" cy="50%" r="50%">
        <stop offset="80%" stopColor="oklch(0.62 0.13 78)" />
        <stop offset="100%" stopColor="oklch(0.85 0.18 85)" />
      </radialGradient>
    </defs>
    <rect width="200" height="160" fill="url(#rl-bg)" />
    <circle
      cx="100"
      cy="80"
      r="72"
      fill="none"
      stroke="oklch(0.85 0.18 85 / 0.3)"
      strokeWidth="4"
    />
    <circle cx="100" cy="80" r="68" fill="url(#rl-rim)" />
    {WHEEL_SEGMENTS.map((seg) => (
      <path
        key={`seg-${seg.num}`}
        d={seg.d}
        fill={seg.color}
        stroke="oklch(0.85 0.18 85 / 0.4)"
        strokeWidth="0.5"
      />
    ))}
    <circle
      cx="100"
      cy="80"
      r="18"
      fill="oklch(0.10 0 0)"
      stroke="oklch(0.85 0.18 85)"
      strokeWidth="2"
    />
    <circle cx="100" cy="80" r="10" fill="oklch(0.85 0.18 85)" opacity="0.9" />
    <circle cx="100" cy="80" r="4" fill="oklch(0.07 0 0)" />
    <circle cx="138" cy="50" r="5" fill="white" />
    <circle cx="138" cy="50" r="3" fill="oklch(0.95 0.05 85)" />
  </svg>
);

const TeenPattiSVG = (
  <svg
    viewBox="0 0 200 160"
    className="w-full h-full"
    aria-label="Teen Patti cards"
  >
    <title>Teen Patti</title>
    <defs>
      <radialGradient id="tp-bg" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="oklch(0.14 0.04 30)" />
        <stop offset="100%" stopColor="oklch(0.07 0 0)" />
      </radialGradient>
      <linearGradient id="tp-card1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="oklch(0.96 0.01 85)" />
        <stop offset="100%" stopColor="oklch(0.88 0.03 80)" />
      </linearGradient>
      <linearGradient id="tp-card2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="oklch(0.94 0.01 85)" />
        <stop offset="100%" stopColor="oklch(0.86 0.03 80)" />
      </linearGradient>
      <linearGradient id="tp-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="oklch(0.87 0.19 85)" />
        <stop offset="100%" stopColor="oklch(0.62 0.13 78)" />
      </linearGradient>
    </defs>
    <rect width="200" height="160" fill="url(#tp-bg)" />
    <circle cx="100" cy="80" r="90" fill="oklch(0.10 0.03 145 / 0.25)" />
    <circle
      cx="100"
      cy="80"
      r="70"
      fill="none"
      stroke="oklch(0.85 0.18 85 / 0.08)"
      strokeWidth="1"
    />
    <g transform="translate(68, 80) rotate(-18)">
      <rect
        x="-22"
        y="-34"
        width="44"
        height="60"
        rx="4"
        ry="4"
        fill="url(#tp-card1)"
        stroke="oklch(0.62 0.13 78 / 0.5)"
        strokeWidth="1"
      />
      <text
        x="-16"
        y="-20"
        fontSize="12"
        fontWeight="bold"
        fill="#c41e3a"
        fontFamily="Georgia, serif"
      >
        A
      </text>
      <text
        x="-8"
        y="-8"
        fontSize="16"
        fill="#c41e3a"
        fontFamily="Georgia, serif"
      >
        {"\u2665"}
      </text>
      <text
        x="4"
        y="22"
        fontSize="12"
        fontWeight="bold"
        fill="#c41e3a"
        fontFamily="Georgia, serif"
        transform="rotate(180, 4, 14)"
      >
        A
      </text>
    </g>
    <g transform="translate(132, 80) rotate(18)">
      <rect
        x="-22"
        y="-34"
        width="44"
        height="60"
        rx="4"
        ry="4"
        fill="url(#tp-card2)"
        stroke="oklch(0.62 0.13 78 / 0.5)"
        strokeWidth="1"
      />
      <text
        x="-16"
        y="-20"
        fontSize="12"
        fontWeight="bold"
        fill="#1a1a2e"
        fontFamily="Georgia, serif"
      >
        K
      </text>
      <text
        x="-8"
        y="-8"
        fontSize="16"
        fill="#1a1a2e"
        fontFamily="Georgia, serif"
      >
        {"\u2660"}
      </text>
      <text
        x="4"
        y="22"
        fontSize="12"
        fontWeight="bold"
        fill="#1a1a2e"
        fontFamily="Georgia, serif"
        transform="rotate(180, 4, 14)"
      >
        K
      </text>
    </g>
    <g transform="translate(100, 78)">
      <rect
        x="-24"
        y="-36"
        width="48"
        height="66"
        rx="5"
        ry="5"
        fill="oklch(0.97 0.01 85)"
        stroke="oklch(0.85 0.18 85)"
        strokeWidth="1.5"
      />
      <rect
        x="-20"
        y="-32"
        width="40"
        height="58"
        rx="3"
        ry="3"
        fill="none"
        stroke="oklch(0.85 0.18 85 / 0.3)"
        strokeWidth="0.5"
      />
      <text
        x="-17"
        y="-18"
        fontSize="13"
        fontWeight="bold"
        fill="#c41e3a"
        fontFamily="Georgia, serif"
      >
        Q
      </text>
      <text
        x="-9"
        y="-4"
        fontSize="18"
        fill="#c41e3a"
        fontFamily="Georgia, serif"
      >
        {"\u2666"}
      </text>
      <text
        x="5"
        y="26"
        fontSize="13"
        fontWeight="bold"
        fill="#c41e3a"
        fontFamily="Georgia, serif"
        transform="rotate(180, 5, 18)"
      >
        Q
      </text>
    </g>
    <circle
      cx="100"
      cy="135"
      r="12"
      fill="url(#tp-gold)"
      stroke="oklch(0.97 0.03 85)"
      strokeWidth="1.5"
    />
    <text
      x="100"
      y="139"
      textAnchor="middle"
      fontSize="8"
      fontWeight="bold"
      fill="oklch(0.10 0 0)"
      fontFamily="sans-serif"
    >
      500
    </text>
  </svg>
);

const GAME_CARDS = [
  {
    id: "aviator" as Game,
    title: "AVIATOR",
    subtitle: "Cash out before it flies away",
    svg: AviatorSVG,
  },
  {
    id: "roulette" as Game,
    title: "ROULETTE",
    subtitle: "Bet on your number",
    svg: RouletteSVG,
  },
  {
    id: "teenPatti" as Game,
    title: "TEEN PATTI",
    subtitle: "Three cards, infinite glory",
    svg: TeenPattiSVG,
  },
];

function LoginModal({
  open,
  onClose,
  onSuccess,
  gameName,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  gameName: string;
}) {
  const { setSession } = usePlayerSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      setError("Please enter your username and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const actor = await getAnonActor();
      const res = await (actor as any).playerLogin(username.trim(), password);
      if (res.success) {
        setSession({
          username: username.trim(),
          password,
          balance: Number(res.balance),
        });
        onSuccess();
      } else {
        setError(res.message || "Invalid credentials. Please try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleLogin();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent
        style={{
          background: "oklch(0.10 0 0)",
          border: "1px solid oklch(0.62 0.13 78 / 0.4)",
          boxShadow: "0 0 60px oklch(0.85 0.18 85 / 0.1)",
        }}
      >
        <DialogHeader>
          <div className="flex flex-col items-center gap-3 mb-2">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.87 0.19 85), oklch(0.62 0.13 78))",
                boxShadow: "0 0 24px oklch(0.85 0.18 85 / 0.3)",
              }}
            >
              <Lock className="w-6 h-6" style={{ color: "oklch(0.07 0 0)" }} />
            </div>
            <DialogTitle
              className="font-display uppercase tracking-widest text-lg text-center"
              style={{ color: "oklch(0.85 0.18 85)" }}
            >
              Login to Play
            </DialogTitle>
            <p className="text-sm text-muted-foreground text-center">
              Enter your credentials to access{" "}
              <span style={{ color: "oklch(0.85 0.18 85)" }}>{gameName}</span>
            </p>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="modal-username"
              className="text-xs uppercase tracking-wider"
              style={{ color: "oklch(0.85 0.18 85)" }}
            >
              Username
            </Label>
            <Input
              id="modal-username"
              data-ocid="login.input"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="username"
              className="bg-transparent border-[oklch(0.62_0.13_78_/_0.3)] focus:border-[oklch(0.85_0.18_85)] text-white placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="modal-password"
              className="text-xs uppercase tracking-wider"
              style={{ color: "oklch(0.85 0.18 85)" }}
            >
              Password
            </Label>
            <Input
              id="modal-password"
              data-ocid="login.textarea"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="current-password"
              className="bg-transparent border-[oklch(0.62_0.13_78_/_0.3)] focus:border-[oklch(0.85_0.18_85)] text-white placeholder:text-muted-foreground"
            />
          </div>

          {error && (
            <p
              data-ocid="login.error_state"
              className="text-sm"
              style={{ color: "oklch(0.72 0.25 25)" }}
            >
              {error}
            </p>
          )}

          <button
            type="button"
            data-ocid="login.primary_button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 text-base font-bold tracking-widest uppercase rounded-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.87 0.19 85), oklch(0.62 0.13 78))",
              color: "oklch(0.07 0 0)",
              boxShadow: "0 4px 24px oklch(0.85 0.18 85 / 0.3)",
              border: "none",
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
              </>
            ) : (
              "Login & Play"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function GameLobby() {
  const { session } = usePlayerSession();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [pendingGame, setPendingGame] = useState<Game | null>(null);
  const selectedCard = GAME_CARDS.find((c) => c.id === selectedGame);

  function handleCardClick(gameId: Game) {
    if (session) {
      setSelectedGame(gameId);
    } else {
      setPendingGame(gameId);
    }
  }

  function handleLoginSuccess() {
    if (pendingGame) {
      setSelectedGame(pendingGame);
      setPendingGame(null);
    }
  }

  const pendingCard = GAME_CARDS.find((c) => c.id === pendingGame);

  return (
    <div className="w-full">
      <LoginModal
        open={!!pendingGame}
        onClose={() => setPendingGame(null)}
        onSuccess={handleLoginSuccess}
        gameName={pendingCard?.title ?? ""}
      />

      <AnimatePresence mode="wait">
        {selectedGame === null ? (
          <motion.div
            key="lobby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-[calc(100vh-64px)] flex flex-col justify-center px-4 py-8"
          >
            <div className="max-w-5xl mx-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {GAME_CARDS.map((card, index) => (
                  <motion.button
                    key={card.id}
                    type="button"
                    data-ocid={`lobby.${card.id}.button`}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.1 + index * 0.12,
                      duration: 0.5,
                      ease: "easeOut",
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCardClick(card.id)}
                    className="group relative flex flex-col items-center rounded-2xl overflow-hidden cursor-pointer text-left w-full transition-all duration-300"
                    style={{
                      background: "oklch(0.10 0 0)",
                      border: "1px solid oklch(0.62 0.13 78 / 0.3)",
                      boxShadow: "0 4px 24px oklch(0 0 0 / 0.4)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.border =
                        "1px solid oklch(0.85 0.18 85 / 0.7)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 0 40px oklch(0.85 0.18 85 / 0.25), 0 8px 32px oklch(0 0 0 / 0.5)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.border =
                        "1px solid oklch(0.62 0.13 78 / 0.3)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 4px 24px oklch(0 0 0 / 0.4)";
                    }}
                  >
                    <div
                      className="w-full"
                      style={{ height: "220px", background: "oklch(0.08 0 0)" }}
                    >
                      {card.svg}
                    </div>
                    <div
                      className="w-full px-6 py-5 flex flex-col items-center"
                      style={{
                        borderTop: "1px solid oklch(0.62 0.13 78 / 0.2)",
                      }}
                    >
                      <h3 className="font-display text-2xl font-bold uppercase tracking-widest mb-1 gold-gradient-text">
                        {card.title}
                      </h3>
                      <p className="text-sm text-muted-foreground tracking-wider">
                        {card.subtitle}
                      </p>
                      <div
                        className="mt-4 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 group-hover:opacity-100 opacity-70 flex items-center gap-2"
                        style={{
                          background:
                            "linear-gradient(135deg, oklch(0.87 0.19 85), oklch(0.62 0.13 78))",
                          color: "oklch(0.07 0 0)",
                        }}
                      >
                        {!session && <Lock className="w-3 h-3" />}
                        {session ? "Play Now" : "Login to Play"}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={selectedGame}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="px-4 py-6"
          >
            <div className="mb-6">
              <button
                type="button"
                data-ocid="lobby.back_button"
                onClick={() => setSelectedGame(null)}
                className="flex items-center gap-2 text-sm uppercase tracking-widest transition-all hover:opacity-100 opacity-75"
                style={{ color: "oklch(0.85 0.18 85)" }}
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Lobby
                <span className="text-muted-foreground normal-case tracking-normal mx-2">
                  |
                </span>
                <span className="font-display font-bold text-base">
                  {selectedCard?.title}
                </span>
              </button>
            </div>
            {selectedGame === "roulette" && <RouletteGame />}
            {selectedGame === "aviator" && <AviatorGame />}
            {selectedGame === "teenPatti" && <TeenPattiGame />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/919105959654"
        target="_blank"
        rel="noopener noreferrer"
        data-ocid="home.whatsapp_button"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(37,211,102,0.4)]"
        style={{ background: "#25D366", color: "white" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-label="WhatsApp"
          role="img"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        <span className="text-sm font-semibold whitespace-nowrap">
          Contact for ID
        </span>
      </a>
    </div>
  );
}
