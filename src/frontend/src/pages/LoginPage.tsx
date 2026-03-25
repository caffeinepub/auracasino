import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { usePlayerSession } from "../contexts/PlayerSessionContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { getAnonActor } from "../utils/anonActor";

export default function LoginPage() {
  const { setSession } = usePlayerSession();
  const { login, isLoggingIn } = useInternetIdentity();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

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
      } else {
        setError(res.message || "Login failed. Check your credentials.");
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
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "oklch(0.07 0 0)" }}
    >
      {/* Background glows */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, oklch(0.85 0.18 85 / 0.07) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full pointer-events-none opacity-5"
        style={{
          background:
            "radial-gradient(circle, oklch(0.85 0.18 85) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full pointer-events-none opacity-5"
        style={{
          background:
            "radial-gradient(circle, oklch(0.85 0.18 85) 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center px-6 max-w-md w-full"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <div
            className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.87 0.19 85), oklch(0.62 0.13 78))",
              boxShadow: "0 0 40px oklch(0.85 0.18 85 / 0.3)",
            }}
          >
            <span
              className="text-4xl font-display font-bold"
              style={{ color: "oklch(0.07 0 0)" }}
            >
              A
            </span>
          </div>
          <h1 className="font-display text-5xl font-bold mb-2 gold-gradient-text tracking-widest uppercase">
            AuraCasino
          </h1>
          <p className="text-muted-foreground text-sm tracking-widest uppercase">
            Premium Gaming Platform
          </p>
        </motion.div>

        {/* Animated game icons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex justify-center gap-6 mb-8 text-3xl"
        >
          {["🎰", "🎲", "🃏"].map((emoji, i) => (
            <motion.span
              key={emoji}
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="opacity-70"
            >
              {emoji}
            </motion.span>
          ))}
        </motion.div>

        {/* Login form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="rounded-2xl p-6 mb-4"
          style={{
            background: "oklch(0.11 0 0)",
            border: "1px solid oklch(0.62 0.13 78 / 0.3)",
          }}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 text-left">
              <Label
                htmlFor="player-username"
                className="text-xs uppercase tracking-wider"
                style={{ color: "oklch(0.85 0.18 85)" }}
              >
                Username
              </Label>
              <Input
                id="player-username"
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
            <div className="flex flex-col gap-2 text-left">
              <Label
                htmlFor="player-password"
                className="text-xs uppercase tracking-wider"
                style={{ color: "oklch(0.85 0.18 85)" }}
              >
                Password
              </Label>
              <Input
                id="player-password"
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

            <Button
              data-ocid="login.primary_button"
              onClick={handleLogin}
              disabled={loading}
              size="lg"
              className="w-full h-12 text-base font-bold tracking-widest uppercase transition-all duration-300 hover:scale-[1.02] mt-1"
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </div>
        </motion.div>

        {/* Admin Access */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.4 }}
        >
          <button
            type="button"
            data-ocid="login.admin_access.button"
            onClick={() => setAdminModalOpen(true)}
            className="text-xs tracking-wider transition-colors"
            style={{ color: "oklch(0.45 0 0)" }}
          >
            Admin Access
          </button>
        </motion.div>
      </motion.div>

      {/* Bottom line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.85 0.18 85 / 0.4), transparent)",
        }}
      />

      {/* Admin modal */}
      <Dialog open={adminModalOpen} onOpenChange={setAdminModalOpen}>
        <DialogContent
          data-ocid="login.admin.dialog"
          style={{
            background: "oklch(0.10 0 0)",
            border: "1px solid oklch(0.62 0.13 78 / 0.4)",
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="font-display uppercase tracking-widest text-base"
              style={{ color: "oklch(0.85 0.18 85)" }}
            >
              Admin Access
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground mb-6">
              Admin login is restricted. Authenticate with Internet Identity to
              continue.
            </p>
            <Button
              data-ocid="login.admin.primary_button"
              onClick={() => {
                setAdminModalOpen(false);
                login();
              }}
              disabled={isLoggingIn}
              className="w-full font-bold tracking-widest uppercase"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.87 0.19 85), oklch(0.62 0.13 78))",
                color: "oklch(0.07 0 0)",
                border: "none",
              }}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Connecting...
                </>
              ) : (
                "Login with Internet Identity"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
