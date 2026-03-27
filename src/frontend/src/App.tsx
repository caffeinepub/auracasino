import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import GameLobby from "./components/GameLobby";
import LoginModal from "./components/LoginModal";
import Navbar from "./components/Navbar";
import AndarBaharGame from "./components/games/AndarBaharGame";
import AviatorGame from "./components/games/AviatorGame";
import RouletteGame from "./components/games/RouletteGame";
import SlotsGame from "./components/games/SlotsGame";
import {
  PlayerSessionProvider,
  usePlayerSession,
} from "./contexts/PlayerSessionContext";
import AdminPage from "./pages/AdminPage";

export type GameView =
  | "lobby"
  | "aviator"
  | "roulette"
  | "andarbahr"
  | "slots"
  | "admin";

const ADMIN_PASSWORD = "Admin980";

function AdminPasswordGate({
  onSuccess,
  onCancel,
}: { onSuccess: () => void; onCancel: () => void }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      onSuccess();
    } else {
      setError(true);
      setInput("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <div
        className="rounded-xl p-8 w-full max-w-sm border"
        style={{
          background: "oklch(0.11 0.03 264)",
          borderColor: "oklch(0.87 0.15 195 / 0.4)",
        }}
      >
        <h2
          className="text-xl font-bold mb-1 text-center"
          style={{ color: "oklch(0.87 0.15 195)" }}
        >
          Admin Access
        </h2>
        <p className="text-center text-sm mb-6 text-muted-foreground">
          Enter password to access dashboard
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            placeholder="Password"
            className="rounded-lg px-4 py-3 text-white outline-none border text-sm"
            style={{
              background: "oklch(0.16 0.03 264)",
              borderColor: error
                ? "oklch(0.65 0.25 25)"
                : "oklch(0.3 0.05 264)",
            }}
          />
          {error && (
            <p
              className="text-xs text-center"
              style={{ color: "oklch(0.65 0.25 25)" }}
            >
              Incorrect password. Try again.
            </p>
          )}
          <button
            type="submit"
            className="rounded-lg py-3 font-bold text-sm transition-all btn-neon-cyan"
          >
            Enter Dashboard
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-center text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

function AppContent() {
  const { session, clearSession } = usePlayerSession();
  const [view, setView] = useState<GameView>("lobby");
  const [showAdminGate, setShowAdminGate] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginCallback, setLoginCallback] = useState<(() => void) | null>(null);

  const requireLogin = (onSuccess?: () => void) => {
    if (session) {
      onSuccess?.();
      return;
    }
    setLoginCallback(() => onSuccess ?? null);
    setShowLoginModal(true);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    loginCallback?.();
    setLoginCallback(null);
  };

  const renderGame = () => {
    switch (view) {
      case "aviator":
        return (
          <AviatorGame
            onBack={() => setView("lobby")}
            requireLogin={requireLogin}
          />
        );
      case "roulette":
        return (
          <RouletteGame
            onBack={() => setView("lobby")}
            requireLogin={requireLogin}
          />
        );
      case "andarbahr":
        return (
          <AndarBaharGame
            onBack={() => setView("lobby")}
            requireLogin={requireLogin}
          />
        );
      case "slots":
        return (
          <SlotsGame
            onBack={() => setView("lobby")}
            requireLogin={requireLogin}
          />
        );
      case "admin":
        return <AdminPage onBack={() => setView("lobby")} />;
      default:
        return <GameLobby onSelectGame={(g) => setView(g as GameView)} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showAdminGate && (
        <AdminPasswordGate
          onSuccess={() => {
            setShowAdminGate(false);
            setView("admin");
          }}
          onCancel={() => setShowAdminGate(false)}
        />
      )}
      {showLoginModal && (
        <LoginModal
          onClose={() => {
            setShowLoginModal(false);
            setLoginCallback(null);
          }}
          onSuccess={handleLoginSuccess}
        />
      )}
      <Navbar
        currentView={view}
        onNavigate={(v) => setView(v as GameView)}
        onAdminClick={() => setShowAdminGate(true)}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={() => {
          clearSession();
          setView("lobby");
        }}
        session={session}
      />
      <main className="flex-1">{renderGame()}</main>
      {view === "lobby" && (
        <footer
          className="py-6 text-center text-xs"
          style={{ color: "oklch(0.45 0.03 264)" }}
        >
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
            style={{ color: "oklch(0.87 0.15 195)" }}
          >
            caffeine.ai
          </a>
        </footer>
      )}
      <a
        href="https://wa.me/919105959654"
        target="_blank"
        rel="noopener noreferrer"
        data-ocid="whatsapp.button"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full font-semibold text-sm shadow-lg transition-all hover:scale-105"
        style={{
          background: "#25D366",
          color: "#fff",
          boxShadow: "0 4px 20px rgba(37,211,102,0.4)",
        }}
        aria-label="Contact for ID on WhatsApp"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <title>WhatsApp</title>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        Contact for ID
      </a>
      <Toaster theme="dark" />
    </div>
  );
}

export default function App() {
  return (
    <PlayerSessionProvider>
      <AppContent />
    </PlayerSessionProvider>
  );
}
