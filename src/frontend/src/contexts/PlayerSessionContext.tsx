import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getAnonActor } from "../utils/anonActor";

export interface PlayerSession {
  username: string;
  password: string;
  balance: number;
}

interface PlayerSessionContextType {
  session: PlayerSession | null;
  setSession: (s: PlayerSession) => void;
  clearSession: () => void;
  updateBalance: (newBalance: number) => void;
}

const PlayerSessionContext = createContext<PlayerSessionContextType | null>(
  null,
);

const STORAGE_KEY = "aura_player_session_v2";

export function PlayerSessionProvider({
  children,
}: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<PlayerSession | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function init() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const saved = JSON.parse(raw) as PlayerSession;
          const actor = await getAnonActor();
          const res = await (actor as any).playerLogin(
            saved.username,
            saved.password,
          );
          if (res.success) {
            setSessionState({ ...saved, balance: Number(res.balance) });
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      setInitialized(true);
    }
    init();
  }, []);

  const setSession = useCallback((s: PlayerSession) => {
    setSessionState(s);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }, []);

  const clearSession = useCallback(() => {
    setSessionState(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateBalance = useCallback((newBalance: number) => {
    setSessionState((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, balance: newBalance };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "oklch(0.87 0.15 195)" }}
        />
      </div>
    );
  }

  return (
    <PlayerSessionContext.Provider
      value={{ session, setSession, clearSession, updateBalance }}
    >
      {children}
    </PlayerSessionContext.Provider>
  );
}

export function usePlayerSession() {
  const ctx = useContext(PlayerSessionContext);
  if (!ctx)
    throw new Error(
      "usePlayerSession must be used within PlayerSessionProvider",
    );
  return ctx;
}
