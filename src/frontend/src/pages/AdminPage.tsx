import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  DollarSign,
  History,
  Loader2,
  Minus,
  Plus,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";
import {
  useAdminCreatedUsers,
  useAdminGameHistory,
  useAdminPlayerWallets,
  useAdminStats,
  useAdminUsers,
} from "../hooks/useQueries";
import type { GameRecord } from "../hooks/useQueries";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  highlight?: "win" | "loss" | "gold";
}) {
  const color =
    highlight === "win"
      ? "oklch(0.83 0.19 155)"
      : highlight === "loss"
        ? "oklch(0.62 0.25 25)"
        : "oklch(0.85 0.18 85)";

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "oklch(0.12 0 0)",
        border: `1px solid ${color}40`,
        boxShadow: `0 0 20px ${color}15`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold tabular-nums" style={{ color }}>
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function WalletControlSection() {
  const { actor } = useActor();
  const { data: wallets, isLoading, refetch } = useAdminPlayerWallets();
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<
    Record<string, { msg: string; ok: boolean }>
  >({});
  const [pending, setPending] = useState<Record<string, boolean>>({});

  async function handleAdjust(username: string, isAdd: boolean) {
    const raw = amounts[username];
    const amt = Number(raw);
    if (!amt || amt < 1) {
      setFeedback((p) => ({
        ...p,
        [username]: { msg: "Enter a valid amount (min 1)", ok: false },
      }));
      return;
    }
    setPending((p) => ({ ...p, [username]: true }));
    setFeedback((p) => ({ ...p, [username]: { msg: "", ok: true } }));
    try {
      const result = await (actor as any).adminAdjustBalance(
        username,
        BigInt(amt),
        isAdd,
      );
      setFeedback((p) => ({
        ...p,
        [username]: {
          msg: result,
          ok: result.toLowerCase().includes("success"),
        },
      }));
      setAmounts((p) => ({ ...p, [username]: "" }));
      refetch();
    } catch (_e) {
      setFeedback((p) => ({
        ...p,
        [username]: { msg: "Error adjusting balance", ok: false },
      }));
    } finally {
      setPending((p) => ({ ...p, [username]: false }));
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-xl mb-8 overflow-hidden"
      style={{ border: "1px solid oklch(0.62 0.13 78 / 0.3)" }}
    >
      <div
        className="px-5 py-4 flex items-center gap-2"
        style={{
          background: "oklch(0.12 0 0)",
          borderBottom: "1px solid oklch(0.62 0.13 78 / 0.2)",
        }}
      >
        <Wallet className="w-4 h-4" style={{ color: "oklch(0.85 0.18 85)" }} />
        <h3
          className="font-semibold uppercase tracking-wider text-sm"
          style={{ color: "oklch(0.85 0.18 85)" }}
        >
          Wallet Control
        </h3>
      </div>
      <div style={{ background: "oklch(0.10 0 0)" }}>
        {isLoading ? (
          <div
            data-ocid="admin.wallets.loading_state"
            className="flex items-center justify-center py-10"
          >
            <Loader2
              className="w-5 h-5 animate-spin"
              style={{ color: "oklch(0.85 0.18 85)" }}
            />
          </div>
        ) : wallets && wallets.length > 0 ? (
          <Table data-ocid="admin.wallets.table">
            <TableHeader>
              <TableRow style={{ borderColor: "oklch(0.62 0.13 78 / 0.2)" }}>
                {[
                  "Username",
                  "Balance",
                  "Add Coins",
                  "Deduct Coins",
                  "Status",
                ].map((h) => (
                  <TableHead
                    key={h}
                    className="text-xs uppercase tracking-wider"
                    style={{ color: "oklch(0.85 0.18 85)" }}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {wallets.map((w, i) => (
                <TableRow
                  key={w.username}
                  data-ocid={`admin.wallets.item.${i + 1}`}
                  style={{ borderColor: "oklch(0.62 0.13 78 / 0.1)" }}
                >
                  <TableCell className="font-semibold text-sm">
                    {w.username}
                  </TableCell>
                  <TableCell
                    className="font-bold tabular-nums"
                    style={{ color: "oklch(0.85 0.18 85)" }}
                  >
                    {Number(w.balance).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <input
                        data-ocid={`admin.wallets.add.input.${i + 1}`}
                        type="number"
                        min={1}
                        placeholder="Amount"
                        value={amounts[w.username] ?? ""}
                        onChange={(e) =>
                          setAmounts((p) => ({
                            ...p,
                            [w.username]: e.target.value,
                          }))
                        }
                        className="w-24 px-2 py-1.5 rounded text-sm text-white outline-none"
                        style={{
                          background: "oklch(0.08 0 0)",
                          border: "1px solid oklch(0.62 0.13 78 / 0.3)",
                        }}
                      />
                      <button
                        type="button"
                        data-ocid={`admin.wallets.add.button.${i + 1}`}
                        onClick={() => handleAdjust(w.username, true)}
                        disabled={pending[w.username]}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-opacity hover:opacity-80 disabled:opacity-50"
                        style={{
                          background: "oklch(0.45 0.18 155)",
                          color: "oklch(0.97 0.01 85)",
                        }}
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <input
                        data-ocid={`admin.wallets.deduct.input.${i + 1}`}
                        type="number"
                        min={1}
                        placeholder="Amount"
                        value={amounts[`${w.username}_deduct`] ?? ""}
                        onChange={(e) =>
                          setAmounts((p) => ({
                            ...p,
                            [`${w.username}_deduct`]: e.target.value,
                          }))
                        }
                        className="w-24 px-2 py-1.5 rounded text-sm text-white outline-none"
                        style={{
                          background: "oklch(0.08 0 0)",
                          border: "1px solid oklch(0.62 0.13 78 / 0.3)",
                        }}
                      />
                      <button
                        type="button"
                        data-ocid={`admin.wallets.deduct.button.${i + 1}`}
                        onClick={() => handleAdjust(w.username, false)}
                        disabled={pending[w.username]}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-opacity hover:opacity-80 disabled:opacity-50"
                        style={{
                          background: "oklch(0.45 0.22 25)",
                          color: "oklch(0.97 0.01 85)",
                        }}
                      >
                        <Minus className="w-3 h-3" /> Deduct
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {feedback[w.username]?.msg ? (
                      <span
                        className="text-xs font-medium"
                        style={{
                          color: feedback[w.username].ok
                            ? "oklch(0.83 0.19 155)"
                            : "oklch(0.72 0.25 25)",
                        }}
                      >
                        {feedback[w.username].msg}
                      </span>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div
            data-ocid="admin.wallets.empty_state"
            className="py-10 text-center text-muted-foreground text-sm"
          >
            No player accounts created yet
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CreateUserSection() {
  const { actor } = useActor();
  const { refetch: refetchWallets } = useAdminPlayerWallets();
  const { refetch: refetchCreatedUsers } = useAdminCreatedUsers();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<{
    message: string;
    success: boolean;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setFeedback(null);
    if (!username.trim() || !password.trim()) {
      setError("Both username and password are required.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const result = await actor!.adminCreateUser(username.trim(), password);
      const success = result.toLowerCase().includes("success");
      setFeedback({ message: result, success });
      if (success) {
        setUsername("");
        setPassword("");
        refetchWallets();
        refetchCreatedUsers();
      }
    } catch (_e) {
      setFeedback({
        message: "An error occurred. Please try again.",
        success: false,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-xl mb-8 overflow-hidden"
      style={{ border: "1px solid oklch(0.62 0.13 78 / 0.3)" }}
    >
      <div
        className="px-5 py-4 flex items-center gap-2"
        style={{
          background: "oklch(0.12 0 0)",
          borderBottom: "1px solid oklch(0.62 0.13 78 / 0.2)",
        }}
      >
        <UserPlus
          className="w-4 h-4"
          style={{ color: "oklch(0.85 0.18 85)" }}
        />
        <h3
          className="font-semibold uppercase tracking-wider text-sm"
          style={{ color: "oklch(0.85 0.18 85)" }}
        >
          Create User
        </h3>
      </div>
      <div className="p-6" style={{ background: "oklch(0.10 0 0)" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-lg">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="create-user-username"
              className="text-xs uppercase tracking-wider"
              style={{ color: "oklch(0.85 0.18 85)" }}
            >
              Username
            </Label>
            <Input
              id="create-user-username"
              data-ocid="admin.create_user.input"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-transparent border-[oklch(0.62_0.13_78_/_0.3)] focus:border-[oklch(0.85_0.18_85)] focus:ring-[oklch(0.85_0.18_85_/_0.2)] text-white placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="create-user-password"
              className="text-xs uppercase tracking-wider"
              style={{ color: "oklch(0.85 0.18 85)" }}
            >
              Password
            </Label>
            <Input
              id="create-user-password"
              data-ocid="admin.create_user.textarea"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent border-[oklch(0.62_0.13_78_/_0.3)] focus:border-[oklch(0.85_0.18_85)] focus:ring-[oklch(0.85_0.18_85_/_0.2)] text-white placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {error && (
          <p
            data-ocid="admin.create_user.error_state"
            className="mt-3 text-sm"
            style={{ color: "oklch(0.72 0.25 25)" }}
          >
            {error}
          </p>
        )}

        <Button
          data-ocid="admin.create_user.submit_button"
          onClick={handleSave}
          disabled={saving || !actor}
          className="mt-5 font-semibold uppercase tracking-wider text-sm px-8"
          style={{
            background: "oklch(0.85 0.18 85)",
            color: "oklch(0.10 0 0)",
            border: "none",
          }}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving…
            </>
          ) : (
            "Save"
          )}
        </Button>

        {feedback && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            data-ocid={
              feedback.success
                ? "admin.create_user.success_state"
                : "admin.create_user.error_state"
            }
            className="mt-4 text-sm font-medium"
            style={{
              color: feedback.success
                ? "oklch(0.83 0.19 155)"
                : "oklch(0.72 0.25 25)",
            }}
          >
            {feedback.message}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

function GameHistorySection() {
  const { data: history, isLoading } = useAdminGameHistory();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl mb-8 overflow-hidden"
      style={{ border: "1px solid oklch(0.62 0.13 78 / 0.3)" }}
    >
      <div
        className="px-5 py-4 flex items-center gap-2"
        style={{
          background: "oklch(0.12 0 0)",
          borderBottom: "1px solid oklch(0.62 0.13 78 / 0.2)",
        }}
      >
        <History className="w-4 h-4" style={{ color: "oklch(0.85 0.18 85)" }} />
        <h3
          className="font-semibold uppercase tracking-wider text-sm"
          style={{ color: "oklch(0.85 0.18 85)" }}
        >
          Game History
        </h3>
      </div>
      <div style={{ background: "oklch(0.10 0 0)" }}>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2
              className="w-6 h-6 animate-spin"
              style={{ color: "oklch(0.85 0.18 85)" }}
            />
          </div>
        ) : !history || history.length === 0 ? (
          <div
            data-ocid="admin.game_history.empty_state"
            className="py-12 text-center text-muted-foreground"
          >
            No game history yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow
                  style={{
                    borderBottom: "1px solid oklch(0.62 0.13 78 / 0.2)",
                  }}
                >
                  {[
                    "#",
                    "Player",
                    "Game",
                    "Wager",
                    "Payout",
                    "Result",
                    "Time",
                  ].map((h) => (
                    <TableHead
                      key={h}
                      className="text-xs uppercase tracking-wider"
                      style={{ color: "oklch(0.85 0.18 85)" }}
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((record: GameRecord, idx: number) => {
                  const rowKey = `${record.username}-${record.game}-${String(record.timestamp)}`;
                  const ms = Number(record.timestamp) / 1_000_000;
                  const timeStr = new Date(ms).toLocaleString();
                  return (
                    <TableRow
                      key={rowKey}
                      data-ocid={`admin.game_history.item.${idx + 1}`}
                      style={{
                        borderBottom: "1px solid oklch(0.62 0.13 78 / 0.1)",
                      }}
                    >
                      <TableCell className="text-muted-foreground text-sm">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        {record.username}
                      </TableCell>
                      <TableCell className="text-white capitalize">
                        {record.game}
                      </TableCell>
                      <TableCell className="text-white">
                        {Number(record.wager).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-white">
                        {Number(record.payout).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className="text-sm font-semibold"
                          style={{
                            color: record.win
                              ? "oklch(0.83 0.19 155)"
                              : "oklch(0.72 0.25 25)",
                          }}
                        >
                          {record.win ? "Win" : "Loss"}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {timeStr}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AllPlayersSection() {
  const { data: createdUsers, isLoading } = useAdminCreatedUsers();
  const [showPasswords, setShowPasswords] = React.useState<
    Record<number, boolean>
  >({});

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid oklch(0.62 0.13 78 / 0.3)" }}
    >
      <div
        className="px-5 py-4 flex items-center gap-2"
        style={{
          background: "oklch(0.12 0 0)",
          borderBottom: "1px solid oklch(0.62 0.13 78 / 0.2)",
        }}
      >
        <Users className="w-4 h-4" style={{ color: "oklch(0.85 0.18 85)" }} />
        <h3
          className="font-semibold uppercase tracking-wider text-sm"
          style={{ color: "oklch(0.85 0.18 85)" }}
        >
          All Players ({createdUsers ? createdUsers.length : 0})
        </h3>
      </div>
      <div style={{ background: "oklch(0.10 0 0)" }}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2
              className="w-5 h-5 animate-spin"
              style={{ color: "oklch(0.85 0.18 85)" }}
            />
          </div>
        ) : createdUsers && createdUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <Table data-ocid="admin.users.table">
              <TableHeader>
                <TableRow style={{ borderColor: "oklch(0.62 0.13 78 / 0.2)" }}>
                  {["#", "Username", "Password", "Balance (Coins)"].map((h) => (
                    <TableHead
                      key={h}
                      className="text-xs uppercase tracking-wider"
                      style={{ color: "oklch(0.85 0.18 85)" }}
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {createdUsers.map((user, i) => (
                  <TableRow
                    key={user.username}
                    data-ocid={`admin.users.item.${i + 1}`}
                    style={{ borderColor: "oklch(0.62 0.13 78 / 0.1)" }}
                  >
                    <TableCell className="text-muted-foreground text-sm">
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-semibold text-white">
                      {user.username}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className="font-mono text-sm"
                          style={{ color: "oklch(0.75 0.13 78)" }}
                        >
                          {showPasswords[i] ? user.password : "••••••••"}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((p) => ({ ...p, [i]: !p[i] }))
                          }
                          className="text-xs px-2 py-0.5 rounded transition-opacity hover:opacity-70"
                          style={{
                            background: "oklch(0.18 0.03 85)",
                            color: "oklch(0.65 0.05 85)",
                            border: "1px solid oklch(0.62 0.13 78 / 0.3)",
                          }}
                        >
                          {showPasswords[i] ? "Hide" : "Show"}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell
                      className="font-bold tabular-nums"
                      style={{ color: "oklch(0.85 0.18 85)" }}
                    >
                      {Number(user.balance).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div
            data-ocid="admin.users.empty_state"
            className="py-12 text-center text-muted-foreground"
          >
            No player accounts created yet. Use 'Create User' above to add your
            first player.
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function AdminPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();

  const houseProfit = stats ? Number(stats.houseProfit) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="font-display text-3xl font-bold gold-gradient-text uppercase tracking-widest mb-1">
          Admin Dashboard
        </h2>
        <p className="text-muted-foreground text-sm">
          House statistics and player management
        </p>
      </motion.div>

      {statsLoading ? (
        <div
          data-ocid="admin.loading_state"
          className="flex items-center justify-center py-16"
        >
          <Loader2
            className="w-6 h-6 animate-spin"
            style={{ color: "oklch(0.85 0.18 85)" }}
          />
        </div>
      ) : stats ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Users}
              label="Total Users"
              value={Number(stats.totalUsers).toLocaleString()}
              highlight="gold"
            />
            <StatCard
              icon={DollarSign}
              label="Total Wagered"
              value={Number(stats.totalWagered).toLocaleString()}
              sub="coins"
              highlight="gold"
            />
            <StatCard
              icon={TrendingUp}
              label="Total Paid Out"
              value={Number(stats.totalPaidOut).toLocaleString()}
              sub="coins"
              highlight="win"
            />
            <StatCard
              icon={houseProfit >= 0 ? TrendingDown : TrendingUp}
              label="House Profit"
              value={houseProfit.toLocaleString()}
              sub="coins"
              highlight={houseProfit >= 0 ? "gold" : "loss"}
            />
          </div>

          {/* Per-game stats */}
          <div
            className="rounded-xl mb-8 overflow-hidden"
            style={{ border: "1px solid oklch(0.62 0.13 78 / 0.3)" }}
          >
            <div
              className="px-5 py-4 flex items-center gap-2"
              style={{
                background: "oklch(0.12 0 0)",
                borderBottom: "1px solid oklch(0.62 0.13 78 / 0.2)",
              }}
            >
              <BarChart3
                className="w-4 h-4"
                style={{ color: "oklch(0.85 0.18 85)" }}
              />
              <h3
                className="font-semibold uppercase tracking-wider text-sm"
                style={{ color: "oklch(0.85 0.18 85)" }}
              >
                Per-Game Statistics
              </h3>
            </div>
            <div style={{ background: "oklch(0.10 0 0)" }}>
              <Table data-ocid="admin.games.table">
                <TableHeader>
                  <TableRow
                    style={{ borderColor: "oklch(0.62 0.13 78 / 0.2)" }}
                  >
                    {[
                      "Game",
                      "Play Count",
                      "Total Wagered",
                      "Total Paid Out",
                      "House Edge",
                    ].map((h) => (
                      <TableHead
                        key={h}
                        className="text-xs uppercase tracking-wider"
                        style={{ color: "oklch(0.85 0.18 85)" }}
                      >
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      name: "✈️ Aviator",
                      s: (stats as any)
                        .aviatorStats as typeof stats.rouletteStats,
                    },
                    {
                      name: "🃏 Teen Patti",
                      s: (stats as any)
                        .teenPattiStats as typeof stats.rouletteStats,
                    },
                    { name: "🎲 Roulette", s: stats.rouletteStats },
                  ].map(({ name, s }) => {
                    const edge =
                      s.totalWagered > 0
                        ? (
                            ((Number(s.totalWagered) - Number(s.totalPaidOut)) /
                              Number(s.totalWagered)) *
                            100
                          ).toFixed(1)
                        : "N/A";
                    return (
                      <TableRow
                        key={name}
                        style={{ borderColor: "oklch(0.62 0.13 78 / 0.1)" }}
                      >
                        <TableCell className="font-semibold">{name}</TableCell>
                        <TableCell className="tabular-nums">
                          {Number(s.playCount).toLocaleString()}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {Number(s.totalWagered).toLocaleString()}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {Number(s.totalPaidOut).toLocaleString()}
                        </TableCell>
                        <TableCell
                          className="font-bold tabular-nums"
                          style={{
                            color:
                              edge !== "N/A" && Number.parseFloat(edge) > 0
                                ? "oklch(0.83 0.19 155)"
                                : "oklch(0.62 0.25 25)",
                          }}
                        >
                          {edge !== "N/A" ? `${edge}%` : "N/A"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      ) : null}

      {/* Create User */}
      <CreateUserSection />

      {/* Wallet Control */}
      <WalletControlSection />

      {/* Game History */}
      <GameHistorySection />

      {/* All Players - admin-created accounts */}
      <AllPlayersSection />
    </div>
  );
}
