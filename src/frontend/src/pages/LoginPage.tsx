import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "oklch(0.07 0 0)" }}
    >
      {/* Background decorations */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, oklch(0.85 0.18 85 / 0.07) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full pointer-events-none opacity-5"
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
            className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 animate-pulse-gold"
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

        {/* Games preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex justify-center gap-6 mb-10 text-3xl"
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

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          {[
            { label: "Roulette", sub: "35x payout" },
            { label: "Slots", sub: "Jackpot wins" },
            { label: "Hi-Lo", sub: "Card games" },
          ].map(({ label, sub }) => (
            <div
              key={label}
              className="rounded-lg p-3"
              style={{
                background: "oklch(0.12 0 0)",
                border: "1px solid oklch(0.62 0.13 78 / 0.3)",
              }}
            >
              <p
                className="text-xs font-semibold tracking-wider uppercase"
                style={{ color: "oklch(0.85 0.18 85)" }}
              >
                {label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </div>
          ))}
        </motion.div>

        {/* Login button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Button
            data-ocid="login.primary_button"
            onClick={login}
            disabled={isLoggingIn}
            size="lg"
            className="w-full h-14 text-base font-bold tracking-widest uppercase transition-all duration-300 hover:scale-[1.02]"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.87 0.19 85), oklch(0.62 0.13 78))",
              color: "oklch(0.07 0 0)",
              boxShadow: "0 4px 24px oklch(0.85 0.18 85 / 0.3)",
              border: "none",
            }}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Connecting...
              </>
            ) : (
              "Enter the Casino"
            )}
          </Button>
          <p className="text-muted-foreground text-xs mt-3">
            Powered by Internet Identity — secure & anonymous
          </p>
        </motion.div>
      </motion.div>

      {/* Bottom dividers */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.85 0.18 85 / 0.4), transparent)",
        }}
      />
    </div>
  );
}
