import { Button } from "@/components/ui/button";
import { Coins, LogOut, Menu, Shield, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Page } from "../App";
import { usePlayerSession } from "../contexts/PlayerSessionContext";

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isAdminMode: boolean;
  onLogout: () => void;
  onAdminClick: () => void;
}

export default function Navbar({
  currentPage,
  onNavigate,
  isAdminMode,
  onLogout,
  onAdminClick,
}: NavbarProps) {
  const { session } = usePlayerSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const balance = session ? session.balance : null;
  const displayName = isAdminMode ? "Admin" : (session?.username ?? "");
  const shortName =
    displayName.length > 12 ? `${displayName.slice(0, 10)}...` : displayName;

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: "oklch(0.07 0 0 / 0.95)",
        borderBottom: "1px solid oklch(0.62 0.13 78 / 0.4)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          type="button"
          data-ocid="nav.link"
          onClick={() => onNavigate("dashboard")}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-display font-bold"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.87 0.19 85), oklch(0.62 0.13 78))",
              color: "oklch(0.07 0 0)",
              boxShadow: "0 0 12px oklch(0.85 0.18 85 / 0.4)",
            }}
          >
            A
          </div>
          <span
            className="font-display font-bold text-lg tracking-[0.2em] uppercase hidden sm:block"
            style={{ color: "oklch(0.85 0.18 85)" }}
          >
            AuraCasino
          </span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          {/* ADMIN button — always visible */}
          <button
            type="button"
            data-ocid="nav.admin.link"
            onClick={onAdminClick}
            className={`flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded transition-all ${
              currentPage === "admin" && isAdminMode ? "" : "hover:opacity-80"
            }`}
            style={{
              color:
                currentPage === "admin" && isAdminMode
                  ? "oklch(0.07 0 0)"
                  : "oklch(0.85 0.18 85)",
              background:
                currentPage === "admin" && isAdminMode
                  ? "linear-gradient(135deg, oklch(0.87 0.19 85), oklch(0.62 0.13 78))"
                  : "transparent",
              border: "1px solid oklch(0.62 0.13 78 / 0.5)",
            }}
          >
            <Shield className="w-3.5 h-3.5" />
            Admin
          </button>

          {/* Balance (player mode only) */}
          {balance !== null && (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{
                background: "oklch(0.12 0 0)",
                border: "1px solid oklch(0.62 0.13 78 / 0.3)",
              }}
            >
              <Coins
                className="w-4 h-4"
                style={{ color: "oklch(0.85 0.18 85)" }}
              />
              <span
                className="font-bold tabular-nums"
                style={{ color: "oklch(0.85 0.18 85)" }}
              >
                {balance.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                coins
              </span>
            </div>
          )}

          {/* User info + logout (only when logged in) */}
          {(session || isAdminMode) && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{
                background: "oklch(0.12 0 0)",
                border: "1px solid oklch(0.62 0.13 78 / 0.2)",
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: "oklch(0.62 0.13 78 / 0.3)",
                  color: "oklch(0.85 0.18 85)",
                }}
              >
                {shortName.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {shortName}
              </span>
              <button
                type="button"
                data-ocid="nav.logout.button"
                onClick={onLogout}
                className="flex items-center gap-1 ml-1 px-2 py-1 rounded transition-colors text-red-400 hover:text-red-300 hover:bg-red-950/40"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile: balance + menu */}
        <div className="flex md:hidden items-center gap-2">
          {balance !== null && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{
                background: "oklch(0.12 0 0)",
                border: "1px solid oklch(0.62 0.13 78 / 0.3)",
              }}
            >
              <Coins
                className="w-3.5 h-3.5"
                style={{ color: "oklch(0.85 0.18 85)" }}
              />
              <span
                className="font-bold text-sm tabular-nums"
                style={{ color: "oklch(0.85 0.18 85)" }}
              >
                {balance.toLocaleString()}
              </span>
            </div>
          )}
          <button
            type="button"
            data-ocid="nav.menu.button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t px-4 py-4 space-y-3"
          style={{
            background: "oklch(0.09 0 0)",
            borderColor: "oklch(0.62 0.13 78 / 0.3)",
          }}
        >
          <Button
            data-ocid="nav.mobile.admin.button"
            variant="outline"
            onClick={() => {
              onAdminClick();
              setMenuOpen(false);
            }}
            className="w-full text-sm"
            style={{
              borderColor: "oklch(0.62 0.13 78 / 0.5)",
              color: "oklch(0.85 0.18 85)",
            }}
          >
            <Shield className="w-4 h-4 mr-2" /> Admin Dashboard
          </Button>
          {(session || isAdminMode) && (
            <button
              type="button"
              data-ocid="nav.mobile.logout.button"
              onClick={() => {
                onLogout();
                setMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors py-2.5 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              Sign Out{shortName ? ` (${shortName})` : ""}
            </button>
          )}
        </motion.div>
      )}
    </header>
  );
}
