import { LogOut, Wallet } from "lucide-react";
import type { PlayerSession } from "../contexts/PlayerSessionContext";

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onAdminClick: () => void;
  onLoginClick: () => void;
  onLogout: () => void;
  session: PlayerSession | null;
}

export default function Navbar({
  onNavigate,
  onAdminClick,
  onLoginClick,
  onLogout,
  session,
}: NavbarProps) {
  return (
    <header
      className="sticky top-0 z-30 w-full border-b"
      style={{
        background: "oklch(0.09 0.025 264 / 0.95)",
        borderColor: "oklch(0.22 0.04 264)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => onNavigate("lobby")}
          className="flex items-center gap-2 font-extrabold text-lg tracking-tight neon-cyan hover:opacity-90 transition-opacity"
          data-ocid="nav.link"
        >
          <span className="text-xl">🎰</span>
          AuraCasino
        </button>
        <nav className="hidden md:flex items-center gap-1">
          {["Casino", "Live", "Popular", "New"].map((tab) => (
            <button
              key={tab}
              type="button"
              className="px-4 py-1.5 rounded-md text-sm font-medium transition-all"
              style={{
                color:
                  tab === "Casino"
                    ? "oklch(0.87 0.15 195)"
                    : "oklch(0.6 0.03 264)",
                background:
                  tab === "Casino"
                    ? "oklch(0.87 0.15 195 / 0.1)"
                    : "transparent",
              }}
            >
              {tab}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {session ? (
            <>
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
                style={{
                  background: "oklch(0.87 0.15 195 / 0.12)",
                  color: "oklch(0.87 0.15 195)",
                  border: "1px solid oklch(0.87 0.15 195 / 0.3)",
                }}
              >
                <Wallet size={14} />
                <span>{session.balance.toLocaleString()}</span>
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: "oklch(0.75 0.03 264)" }}
              >
                {session.username}
              </span>
              <button
                type="button"
                onClick={onLogout}
                data-ocid="nav.logout_button"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: "oklch(0.62 0.25 25 / 0.15)",
                  color: "oklch(0.75 0.2 25)",
                  border: "1px solid oklch(0.62 0.25 25 / 0.3)",
                }}
              >
                <LogOut size={14} />
                Logout
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onLoginClick}
              data-ocid="nav.login_button"
              className="px-4 py-1.5 rounded-lg text-sm font-bold transition-all btn-neon-cyan"
            >
              Login
            </button>
          )}
          <button
            type="button"
            onClick={onAdminClick}
            data-ocid="nav.admin_button"
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{
              background: "oklch(0.72 0.22 295 / 0.15)",
              color: "oklch(0.72 0.22 295)",
              border: "1px solid oklch(0.72 0.22 295 / 0.4)",
            }}
          >
            ADMIN
          </button>
        </div>
      </div>
    </header>
  );
}
