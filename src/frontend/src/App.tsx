import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Navbar from "./components/Navbar";
import {
  PlayerSessionProvider,
  usePlayerSession,
} from "./contexts/PlayerSessionContext";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import AdminPage from "./pages/AdminPage";
import Dashboard from "./pages/Dashboard";

export type Page = "dashboard" | "admin";

const ADMIN_PASSWORD = "Admin980";

function AdminPasswordModal({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setInput("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)" }}
    >
      <div
        className="rounded-2xl p-8 w-full max-w-sm shadow-2xl border"
        style={{
          background: "oklch(0.13 0.02 85)",
          borderColor: "oklch(0.62 0.13 78 / 0.4)",
        }}
      >
        <h2
          className="text-xl font-bold mb-1 text-center"
          style={{
            color: "oklch(0.85 0.18 85)",
            fontFamily: "Playfair Display, serif",
          }}
        >
          Admin Access
        </h2>
        <p
          className="text-center text-sm mb-6"
          style={{ color: "oklch(0.65 0.05 85)" }}
        >
          Enter the admin password to continue
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
              background: "oklch(0.18 0.03 85)",
              borderColor: error
                ? "oklch(0.65 0.22 25)"
                : "oklch(0.62 0.13 78 / 0.35)",
            }}
          />
          {error && (
            <p
              className="text-xs text-center"
              style={{ color: "oklch(0.65 0.22 25)" }}
            >
              Incorrect password. Please try again.
            </p>
          )}
          <button
            type="submit"
            className="rounded-lg py-3 font-semibold text-sm transition-opacity hover:opacity-90"
            style={{
              background: "oklch(0.75 0.18 85)",
              color: "oklch(0.1 0.02 85)",
            }}
          >
            Enter Dashboard
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-center transition-opacity hover:opacity-70"
            style={{ color: "oklch(0.55 0.05 85)" }}
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
  const { isInitializing } = useInternetIdentity();
  const [page, setPage] = useState<Page>("dashboard");
  const [showAdminModal, setShowAdminModal] = useState(false);

  const handleAdminClick = () => {
    setShowAdminModal(true);
  };

  const handleAdminSuccess = () => {
    setShowAdminModal(false);
    setPage("admin");
  };

  const handleLogout = () => {
    if (session) clearSession();
    else setPage("dashboard");
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div
          className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "oklch(0.85 0.18 85)" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showAdminModal && (
        <AdminPasswordModal
          onSuccess={handleAdminSuccess}
          onCancel={() => setShowAdminModal(false)}
        />
      )}
      <Navbar
        currentPage={page}
        onNavigate={setPage}
        isAdminMode={page === "admin"}
        onLogout={handleLogout}
        onAdminClick={handleAdminClick}
      />
      <main className="flex-1">
        {page === "dashboard" && <Dashboard />}
        {page === "admin" && <AdminPage />}
      </main>
      <footer
        className="py-6 text-center text-muted-foreground text-xs border-t"
        style={{ borderColor: "oklch(0.62 0.13 78 / 0.2)" }}
      >
        © {new Date().getFullYear()}. Built with ♥ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
          style={{ color: "oklch(0.85 0.18 85)" }}
        >
          caffeine.ai
        </a>
      </footer>
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
