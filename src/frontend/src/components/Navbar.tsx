import { Button } from "@/components/ui/button";
import { Coins, LogOut, Menu, Shield, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Page } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useBalance, useIsAdmin } from "../hooks/useQueries";
import TopUpModal from "./TopUpModal";

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { clear, identity } = useInternetIdentity();
  const { data: balance } = useBalance();
  const { data: isAdmin } = useIsAdmin();
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const principal = identity?.getPrincipal().toString() ?? "";
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}...${principal.slice(-3)}`
    : "";

  return (
    <>
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
            {isAdmin && (
              <button
                type="button"
                data-ocid="nav.admin.link"
                onClick={() => onNavigate("admin")}
                className={`flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded transition-all ${
                  currentPage === "admin" ? "" : "hover:opacity-80"
                }`}
                style={{
                  color:
                    currentPage === "admin"
                      ? "oklch(0.07 0 0)"
                      : "oklch(0.85 0.18 85)",
                  background:
                    currentPage === "admin"
                      ? "linear-gradient(135deg, oklch(0.87 0.19 85), oklch(0.62 0.13 78))"
                      : "transparent",
                  border: "1px solid oklch(0.62 0.13 78 / 0.5)",
                }}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </button>
            )}

            {/* Balance */}
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
                {balance !== undefined ? Number(balance).toLocaleString() : "—"}
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                coins
              </span>
            </div>

            <Button
              data-ocid="nav.topup.primary_button"
              onClick={() => setTopUpOpen(true)}
              size="sm"
              className="font-bold text-xs tracking-widest uppercase transition-all hover:scale-105"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.87 0.19 85), oklch(0.62 0.13 78))",
                color: "oklch(0.07 0 0)",
                border: "none",
                boxShadow: "0 2px 12px oklch(0.85 0.18 85 / 0.25)",
              }}
            >
              + Top Up
            </Button>

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
                {shortPrincipal.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {shortPrincipal}
              </span>
              <button
                type="button"
                data-ocid="nav.logout.button"
                onClick={clear}
                className="text-muted-foreground hover:text-foreground transition-colors ml-1"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mobile: balance + menu */}
          <div className="flex md:hidden items-center gap-2">
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
                {balance !== undefined ? Number(balance).toLocaleString() : "—"}
              </span>
            </div>
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
              data-ocid="nav.mobile.topup.primary_button"
              onClick={() => {
                setTopUpOpen(true);
                setMenuOpen(false);
              }}
              className="w-full font-bold text-sm tracking-widest uppercase"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.87 0.19 85), oklch(0.62 0.13 78))",
                color: "oklch(0.07 0 0)",
                border: "none",
              }}
            >
              + Top Up Coins
            </Button>
            {isAdmin && (
              <Button
                data-ocid="nav.mobile.admin.button"
                variant="outline"
                onClick={() => {
                  onNavigate("admin");
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
            )}
            <button
              type="button"
              data-ocid="nav.mobile.logout.button"
              onClick={clear}
              className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out ({shortPrincipal})
            </button>
          </motion.div>
        )}
      </header>

      <TopUpModal open={topUpOpen} onOpenChange={setTopUpOpen} />
    </>
  );
}
