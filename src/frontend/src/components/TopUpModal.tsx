import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Coins, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTopUp } from "../hooks/useQueries";

const PRESETS = [100, 250, 500];

interface TopUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TopUpModal({ open, onOpenChange }: TopUpModalProps) {
  const [amount, setAmount] = useState("100");
  const topUp = useTopUp();

  const numAmount = Number.parseInt(amount) || 0;
  const isValid = numAmount > 0 && numAmount <= 500;

  async function handleClaim() {
    if (!isValid) {
      toast.error("Amount must be 1–500 coins per claim");
      return;
    }
    try {
      await topUp.mutateAsync(numAmount);
      toast.success(`🪙 ${numAmount} coins added to your wallet!`);
      onOpenChange(false);
    } catch {
      toast.error("Failed to add coins. Try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="topup.dialog"
        className="sm:max-w-md"
        style={{
          background: "oklch(0.12 0 0)",
          border: "1px solid oklch(0.62 0.13 78 / 0.5)",
          boxShadow: "0 0 40px oklch(0.85 0.18 85 / 0.15)",
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-2xl gold-gradient-text tracking-widest uppercase">
            Top Up Wallet
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add Game Coins to your wallet. Max 500 per claim.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Preset amounts */}
          <div className="grid grid-cols-3 gap-3">
            {PRESETS.map((preset) => (
              <button
                type="button"
                key={preset}
                data-ocid="topup.preset.button"
                onClick={() => setAmount(String(preset))}
                className="py-3 rounded-lg font-bold text-sm transition-all duration-200 hover:scale-105"
                style={{
                  background:
                    amount === String(preset)
                      ? "linear-gradient(135deg, oklch(0.87 0.19 85), oklch(0.62 0.13 78))"
                      : "oklch(0.17 0 0)",
                  color:
                    amount === String(preset)
                      ? "oklch(0.07 0 0)"
                      : "oklch(0.85 0.18 85)",
                  border: `1px solid ${
                    amount === String(preset)
                      ? "transparent"
                      : "oklch(0.62 0.13 78 / 0.3)"
                  }`,
                  boxShadow:
                    amount === String(preset)
                      ? "0 0 16px oklch(0.85 0.18 85 / 0.3)"
                      : "none",
                }}
              >
                <Coins className="w-4 h-4 mx-auto mb-1" />
                {preset}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Custom Amount (1–500)
            </p>
            <Input
              id="topup-amount-input"
              data-ocid="topup.input"
              type="number"
              min={1}
              max={500}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount..."
              className="text-center font-bold text-lg"
              style={{
                background: "oklch(0.17 0 0)",
                border: "1px solid oklch(0.62 0.13 78 / 0.3)",
                color: "oklch(0.97 0 0)",
              }}
            />
          </div>

          {/* Claim button */}
          <Button
            data-ocid="topup.submit_button"
            onClick={handleClaim}
            disabled={topUp.isPending || !isValid}
            className="w-full h-12 font-bold text-sm tracking-widest uppercase transition-all hover:scale-[1.02]"
            style={{
              background: isValid
                ? "linear-gradient(135deg, oklch(0.87 0.19 85), oklch(0.62 0.13 78))"
                : "oklch(0.17 0 0)",
              color: isValid ? "oklch(0.07 0 0)" : "oklch(0.55 0 0)",
              border: "none",
              boxShadow: isValid
                ? "0 4px 20px oklch(0.85 0.18 85 / 0.25)"
                : "none",
            }}
          >
            {topUp.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Claiming...
              </>
            ) : (
              `Claim ${numAmount > 0 ? numAmount : ""} Coins`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
