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

function AppContent() {
  const { session, clearSession } = usePlayerSession();
  const { isInitializing } = useInternetIdentity();
  const [page, setPage] = useState<Page>("dashboard");

  const handleAdminClick = () => {
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
