import { useState } from "react";
import { usePlayerSession } from "../contexts/PlayerSessionContext";
import { getAnonActor } from "../utils/anonActor";

interface LoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function LoginModal({ onClose, onSuccess }: LoginModalProps) {
  const { setSession } = usePlayerSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const actor = await getAnonActor();
      const res = await (actor as any).playerLogin(
        username.trim(),
        password.trim(),
      );
      if (res.success) {
        setSession({
          username: username.trim(),
          password: password.trim(),
          balance: Number(res.balance),
        });
        onSuccess();
      } else {
        setError(res.message || "Invalid credentials.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)" }}
      data-ocid="login.modal"
    >
      <div
        className="rounded-xl p-8 w-full max-w-sm"
        style={{
          background: "oklch(0.11 0.03 264)",
          border: "1px solid oklch(0.87 0.15 195 / 0.35)",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold neon-cyan">Login to Play</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-xl leading-none"
            data-ocid="login.close_button"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="login-username"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              Username
            </label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              placeholder="Enter username"
              className="rounded-lg px-4 py-3 text-sm text-white outline-none border"
              style={{
                background: "oklch(0.15 0.03 264)",
                borderColor: "oklch(0.28 0.05 264)",
              }}
              data-ocid="login.input"
              autoComplete="username"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="login-password"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter password"
              className="rounded-lg px-4 py-3 text-sm text-white outline-none border"
              style={{
                background: "oklch(0.15 0.03 264)",
                borderColor: "oklch(0.28 0.05 264)",
              }}
              data-ocid="login.input"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p
              className="text-xs text-center"
              style={{ color: "oklch(0.65 0.25 25)" }}
              data-ocid="login.error_state"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg py-3 font-extrabold text-sm transition-all btn-neon-cyan disabled:opacity-60"
            data-ocid="login.submit_button"
          >
            {loading ? "Logging in..." : "LOGIN"}
          </button>
          <a
            href="https://wa.me/919105959654?text=I%20want%20a%20new%20ID%20for%20AuraCasino"
            target="_blank"
            rel="noopener noreferrer"
            className="text-center text-sm py-2.5 rounded-lg font-semibold transition-all"
            style={{ background: "#25D366", color: "#fff" }}
            data-ocid="login.signup_button"
          >
            Sign Up for ID
          </a>
        </form>
      </div>
    </div>
  );
}
