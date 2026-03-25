import { Toaster } from "@/components/ui/sonner";
import { useEffect, useRef, useState } from "react";
import Navbar from "./components/Navbar";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useRegister } from "./hooks/useQueries";
import AdminPage from "./pages/AdminPage";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";

export type Page = "dashboard" | "admin";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const register = useRegister();
  const [page, setPage] = useState<Page>("dashboard");
  const [registered, setRegistered] = useState(false);
  const mutateFn = useRef(register.mutate);
  mutateFn.current = register.mutate;

  useEffect(() => {
    if (identity && !registered) {
      setRegistered(true);
      mutateFn.current();
    }
  }, [identity, registered]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full border-2 animate-pulse"
            style={{ borderColor: "oklch(0.85 0.18 85)" }}
          />
          <p className="text-muted-foreground text-sm tracking-widest uppercase">
            Initializing...
          </p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <>
        <LoginPage />
        <Toaster theme="dark" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar currentPage={page} onNavigate={setPage} />
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
