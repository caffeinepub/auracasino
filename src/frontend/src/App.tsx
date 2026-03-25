import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Loader2, LogOut, ShieldOff } from "lucide-react";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import {
  PlayerSessionProvider,
  usePlayerSession,
} from "./contexts/PlayerSessionContext";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useIsAdmin } from "./hooks/useQueries";
import AdminPage from "./pages/AdminPage";
import Dashboard from "./pages/Dashboard";

export type Page = "dashboard" | "admin";

function AppContent() {
  const { session, clearSession } = usePlayerSession();
  const {
    identity,
    clear: clearIdentity,
    isInitializing,
    login,
  } = useInternetIdentity();
  const [page, setPage] = useState<Page>("dashboard");
  const [pendingAdmin, setPendingAdmin] = useState(false);

  const isAdminMode = !!identity && !session;
  const { data: isAdmin, isLoading: adminChecking } = useIsAdmin();

  // After II login completes with pending admin intent, navigate
  useEffect(() => {
    if (pendingAdmin && identity && !adminChecking) {
      setPendingAdmin(false);
      if (isAdmin) {
        setPage("admin");
      }
      // If not admin, the admin page will show access denied
    }
  }, [pendingAdmin, identity, isAdmin, adminChecking]);

  const handleAdminClick = () => {
    if (identity) {
      setPage("admin");
    } else {
      setPendingAdmin(true);
      login();
    }
  };

  const handleLogout = () => {
    if (session) clearSession();
    else {
      clearIdentity();
      setPage("dashboard");
    }
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

  // Render admin page content
  const renderAdminContent = () => {
    if (adminChecking) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2
              className="w-8 h-8 animate-spin mx-auto mb-4"
              style={{ color: "oklch(0.85 0.18 85)" }}
            />
            <p className="text-muted-foreground text-sm tracking-widest uppercase">
              Verifying admin access...
            </p>
          </div>
        </div>
      );
    }

    if (!isAdmin) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
          <div
            className="rounded-2xl p-10 text-center max-w-sm"
            style={{
              background: "oklch(0.11 0 0)",
              border: "1px solid oklch(0.62 0.25 25 / 0.4)",
            }}
          >
            <ShieldOff
              className="w-12 h-12 mx-auto mb-4"
              style={{ color: "oklch(0.72 0.25 25)" }}
            />
            <h2
              className="font-display text-2xl font-bold mb-2 uppercase tracking-widest"
              style={{ color: "oklch(0.72 0.25 25)" }}
            >
              Access Denied
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              This account does not have admin privileges.
            </p>
            <Button
              onClick={() => {
                clearIdentity();
                setPage("dashboard");
              }}
              variant="outline"
              className="w-full"
              style={{
                borderColor: "oklch(0.62 0.13 78 / 0.4)",
                color: "oklch(0.85 0.18 85)",
              }}
            >
              <LogOut className="w-4 h-4 mr-2" /> Go Back
            </Button>
          </div>
        </div>
      );
    }

    return <AdminPage />;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar
        currentPage={page}
        onNavigate={setPage}
        isAdminMode={isAdminMode && !!isAdmin}
        onLogout={handleLogout}
        onAdminClick={handleAdminClick}
      />
      <main className="flex-1">
        {page === "dashboard" && <Dashboard />}
        {page === "admin" && renderAdminContent()}
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
