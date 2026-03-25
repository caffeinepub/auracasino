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
  Loader2,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";
import { useAdminStats, useAdminUsers } from "../hooks/useQueries";

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

function CreateUserSection() {
  const { actor } = useActor();
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

export default function AdminPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: users, isLoading: usersLoading } = useAdminUsers();

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
                    { name: "🎲 Roulette", s: stats.rouletteStats },
                    { name: "🎰 Slots", s: stats.slotsStats },
                    { name: "🃏 Hi-Lo", s: stats.hiloStats },
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

      {/* Users table */}
      <div
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
            All Players
          </h3>
        </div>
        <div style={{ background: "oklch(0.10 0 0)" }}>
          {usersLoading ? (
            <div
              data-ocid="admin.users.loading_state"
              className="flex items-center justify-center py-12"
            >
              <Loader2
                className="w-5 h-5 animate-spin"
                style={{ color: "oklch(0.85 0.18 85)" }}
              />
            </div>
          ) : users && users.length > 0 ? (
            <Table data-ocid="admin.users.table">
              <TableHeader>
                <TableRow style={{ borderColor: "oklch(0.62 0.13 78 / 0.2)" }}>
                  {[
                    "#",
                    "Principal",
                    "Balance",
                    "Total Wagered",
                    "Total Won",
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
                {users.map((user, i) => (
                  <TableRow
                    key={user.principal}
                    data-ocid={`admin.users.item.${i + 1}`}
                    style={{ borderColor: "oklch(0.62 0.13 78 / 0.1)" }}
                  >
                    <TableCell className="text-muted-foreground text-sm">
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {user.principal.slice(0, 10)}...{user.principal.slice(-4)}
                    </TableCell>
                    <TableCell
                      className="font-bold tabular-nums"
                      style={{ color: "oklch(0.85 0.18 85)" }}
                    >
                      {Number(user.balance).toLocaleString()}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {Number(user.totalWagered).toLocaleString()}
                    </TableCell>
                    <TableCell
                      className="tabular-nums"
                      style={{ color: "oklch(0.83 0.19 155)" }}
                    >
                      {Number(user.totalWon).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div
              data-ocid="admin.users.empty_state"
              className="py-12 text-center text-muted-foreground"
            >
              No registered players yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
