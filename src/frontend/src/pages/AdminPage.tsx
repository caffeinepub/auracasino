import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { callWithRetry } from "../utils/anonActor";

interface User {
  username: string;
  password: string;
  balance: number;
}

interface GameHistoryEntry {
  username: string;
  game: string;
  wager: number;
  payout: number;
  win: boolean;
  timestamp: number;
}

interface AdminPageProps {
  onBack: () => void;
}

const withTimeout = (promise: Promise<any>, ms: number) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Request timed out. Check your connection.")),
        ms,
      ),
    ),
  ]);

export default function AdminPage({ onBack }: AdminPageProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [walletUser, setWalletUser] = useState("");
  const [walletAmount, setWalletAmount] = useState("");
  const [walletLoading, setWalletLoading] = useState(false);
  const historyInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const usersInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset stale saving state on mount
  useEffect(() => {
    setSaving(false);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const result = await callWithRetry((actor) =>
        actor.adminGetUsersWithPasswords(),
      );
      setUsers(
        result.map((u: any) => ({
          username: u.username,
          password: u.password,
          balance: Number(u.balance),
        })),
      );
    } catch (e) {
      console.error("fetchUsers", e);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const result = await callWithRetry((actor) =>
        actor.adminGetGameHistory(),
      );
      const allowed = ["Aviator", "Teen Patti", "Roulette"];
      setHistory(
        result
          .filter((h: any) => allowed.includes(h.game))
          .map((h: any) => ({
            username: h.username,
            game: h.game,
            wager: Number(h.wager),
            payout: Number(h.payout),
            win: h.win,
            timestamp: Number(h.timestamp),
          })),
      );
    } catch (e) {
      console.error("fetchHistory", e);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchHistory();
    usersInterval.current = setInterval(fetchUsers, 10000);
    historyInterval.current = setInterval(fetchHistory, 15000);
    return () => {
      if (usersInterval.current) clearInterval(usersInterval.current);
      if (historyInterval.current) clearInterval(historyInterval.current);
    };
  }, [fetchUsers, fetchHistory]);

  const handleSave = async () => {
    if (!newUsername.trim() || !newPassword.trim()) {
      toast.error("Username and password are required.");
      return;
    }
    setSaving(true);
    try {
      const result = await withTimeout(
        callWithRetry((actor) =>
          actor.adminCreateUser(newUsername.trim(), newPassword.trim()),
        ),
        20000,
      );
      if (result?.toLowerCase().includes("already")) {
        toast.error(result);
      } else {
        toast.success(result || "User created successfully!");
        setNewUsername("");
        setNewPassword("");
        await fetchUsers();
      }
    } catch (e: any) {
      toast.error(`Save failed: ${e?.message || String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleWalletAdjust = async (isAdd: boolean) => {
    if (!walletUser || !walletAmount) {
      toast.error("Select a user and enter amount.");
      return;
    }
    setWalletLoading(true);
    try {
      const result = await withTimeout(
        callWithRetry((actor) =>
          actor.adminAdjustBalance(
            walletUser,
            BigInt(Number(walletAmount)),
            isAdd,
          ),
        ),
        20000,
      );
      toast.success(result || `Balance ${isAdd ? "added" : "deducted"}.`);
      setWalletAmount("");
      await fetchUsers();
    } catch (e: any) {
      toast.error(`Error: ${e?.message || String(e)}`);
    } finally {
      setWalletLoading(false);
    }
  };

  const inp = {
    background: "oklch(0.15 0.03 264)",
    borderColor: "oklch(0.28 0.05 264)",
    color: "white",
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.08 0.025 264)" }}
    >
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-8">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            data-ocid="admin.back_button"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-extrabold neon-cyan">Admin Dashboard</h1>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-6"
            style={{
              background: "oklch(0.11 0.03 264)",
              border: "1px solid oklch(0.87 0.15 195 / 0.3)",
            }}
          >
            <h2 className="text-lg font-extrabold mb-4 neon-cyan">
              ➕ Create User
            </h2>
            <div className="flex flex-col gap-3">
              <div>
                <label
                  htmlFor="admin-new-username"
                  className="text-xs text-muted-foreground uppercase tracking-wider block mb-1"
                >
                  Username
                </label>
                <input
                  id="admin-new-username"
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border"
                  style={inp}
                  data-ocid="admin.input"
                />
              </div>
              <div>
                <label
                  htmlFor="admin-new-password"
                  className="text-xs text-muted-foreground uppercase tracking-wider block mb-1"
                >
                  Password
                </label>
                <input
                  id="admin-new-password"
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border"
                  style={inp}
                  data-ocid="admin.input"
                />
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 rounded-lg font-extrabold text-sm btn-neon-cyan transition-all disabled:opacity-60"
                data-ocid="admin.save_button"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Saving...
                  </span>
                ) : (
                  "💾 SAVE"
                )}
              </button>
            </div>
          </motion.section>
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl p-6"
            style={{
              background: "oklch(0.11 0.03 264)",
              border: "1px solid oklch(0.82 0.19 155 / 0.3)",
            }}
          >
            <h2 className="text-lg font-extrabold mb-4 neon-green">
              💰 Wallet Control
            </h2>
            <div className="flex flex-col gap-3">
              <div>
                <label
                  htmlFor="admin-wallet-user"
                  className="text-xs text-muted-foreground uppercase tracking-wider block mb-1"
                >
                  Select Player
                </label>
                <select
                  id="admin-wallet-user"
                  value={walletUser}
                  onChange={(e) => setWalletUser(e.target.value)}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border"
                  style={inp}
                  data-ocid="admin.select"
                >
                  <option value="">— Choose Player —</option>
                  {users.map((u) => (
                    <option key={u.username} value={u.username}>
                      {u.username} ({u.balance} coins)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="admin-wallet-amount"
                  className="text-xs text-muted-foreground uppercase tracking-wider block mb-1"
                >
                  Amount
                </label>
                <input
                  id="admin-wallet-amount"
                  type="number"
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(e.target.value)}
                  placeholder="Coins amount"
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border"
                  style={inp}
                  data-ocid="admin.input"
                  min="1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleWalletAdjust(true)}
                  disabled={walletLoading}
                  className="py-2.5 rounded-lg font-bold text-sm btn-neon-green transition-all disabled:opacity-60"
                  data-ocid="admin.primary_button"
                >
                  {walletLoading ? (
                    <Loader2 size={14} className="animate-spin mx-auto" />
                  ) : (
                    "➕ Add"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleWalletAdjust(false)}
                  disabled={walletLoading}
                  className="py-2.5 rounded-lg font-bold text-sm transition-all disabled:opacity-60"
                  style={{
                    background: "oklch(0.62 0.25 25 / 0.2)",
                    color: "oklch(0.75 0.2 25)",
                    border: "1px solid oklch(0.62 0.25 25 / 0.4)",
                  }}
                  data-ocid="admin.delete_button"
                >
                  {walletLoading ? (
                    <Loader2 size={14} className="animate-spin mx-auto" />
                  ) : (
                    "➖ Deduct"
                  )}
                </button>
              </div>
            </div>
          </motion.section>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl p-6 mt-6"
          style={{
            background: "oklch(0.11 0.03 264)",
            border: "1px solid oklch(0.22 0.04 264)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold">👥 All Players</h2>
            <button
              type="button"
              onClick={fetchUsers}
              disabled={loadingUsers}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              data-ocid="admin.secondary_button"
            >
              <RefreshCw
                size={16}
                className={loadingUsers ? "animate-spin" : ""}
              />
            </button>
          </div>
          {users.length === 0 ? (
            <p
              className="text-sm text-muted-foreground text-center py-6"
              data-ocid="admin.empty_state"
            >
              {loadingUsers ? "Loading..." : "No users created yet."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-ocid="admin.table">
                <thead>
                  <tr
                    style={{ borderBottom: "1px solid oklch(0.22 0.04 264)" }}
                  >
                    <th className="py-2 px-3 text-left text-xs text-muted-foreground uppercase tracking-wider">
                      #
                    </th>
                    <th className="py-2 px-3 text-left text-xs text-muted-foreground uppercase tracking-wider">
                      Username
                    </th>
                    <th className="py-2 px-3 text-left text-xs text-muted-foreground uppercase tracking-wider">
                      Password
                    </th>
                    <th className="py-2 px-3 text-left text-xs text-muted-foreground uppercase tracking-wider">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr
                      key={u.username}
                      style={{ borderBottom: "1px solid oklch(0.16 0.03 264)" }}
                      data-ocid={`admin.item.${i + 1}`}
                    >
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {i + 1}
                      </td>
                      <td
                        className="py-2.5 px-3 font-semibold"
                        style={{ color: "oklch(0.87 0.15 195)" }}
                      >
                        {u.username}
                      </td>
                      <td
                        className="py-2.5 px-3 font-mono text-sm"
                        style={{ color: "oklch(0.92 0.05 264)" }}
                      >
                        {u.password}
                      </td>
                      <td
                        className="py-2.5 px-3 font-bold"
                        style={{ color: "oklch(0.82 0.19 155)" }}
                      >
                        {u.balance.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl p-6 mt-6"
          style={{
            background: "oklch(0.11 0.03 264)",
            border: "1px solid oklch(0.22 0.04 264)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold">📜 Game History</h2>
            <button
              type="button"
              onClick={fetchHistory}
              disabled={loadingHistory}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              data-ocid="admin.secondary_button"
            >
              <RefreshCw
                size={16}
                className={loadingHistory ? "animate-spin" : ""}
              />
            </button>
          </div>
          {history.length === 0 ? (
            <p
              className="text-sm text-muted-foreground text-center py-6"
              data-ocid="admin.empty_state"
            >
              No game history yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-ocid="admin.table">
                <thead>
                  <tr
                    style={{ borderBottom: "1px solid oklch(0.22 0.04 264)" }}
                  >
                    <th className="py-2 px-3 text-left text-xs text-muted-foreground uppercase tracking-wider">
                      Player
                    </th>
                    <th className="py-2 px-3 text-left text-xs text-muted-foreground uppercase tracking-wider">
                      Game
                    </th>
                    <th className="py-2 px-3 text-left text-xs text-muted-foreground uppercase tracking-wider">
                      Wager
                    </th>
                    <th className="py-2 px-3 text-left text-xs text-muted-foreground uppercase tracking-wider">
                      Payout
                    </th>
                    <th className="py-2 px-3 text-left text-xs text-muted-foreground uppercase tracking-wider">
                      Result
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 50).map((h, i) => (
                    <tr
                      key={`hist-${h.username}-${h.timestamp}-${i}`}
                      style={{ borderBottom: "1px solid oklch(0.14 0.02 264)" }}
                      data-ocid={`admin.item.${i + 1}`}
                    >
                      <td
                        className="py-2.5 px-3 font-medium"
                        style={{ color: "oklch(0.87 0.15 195)" }}
                      >
                        {h.username}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {h.game}
                      </td>
                      <td className="py-2.5 px-3">{h.wager}</td>
                      <td className="py-2.5 px-3">{h.payout}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded"
                          style={{
                            background: h.win
                              ? "oklch(0.82 0.19 155 / 0.2)"
                              : "oklch(0.62 0.25 25 / 0.2)",
                            color: h.win
                              ? "oklch(0.82 0.19 155)"
                              : "oklch(0.65 0.25 25)",
                          }}
                        >
                          {h.win ? "WIN" : "LOSS"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
