import { Award, Target, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import GameLobby from "../components/GameLobby";
import { useUserInfo } from "../hooks/useQueries";

export default function Dashboard() {
  const { data: userInfo } = useUserInfo();

  return (
    <div className="container mx-auto px-4 py-8">
      {userInfo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10"
        >
          {[
            {
              icon: Award,
              label: "Balance",
              value: Number(userInfo.balance).toLocaleString(),
              unit: "coins",
            },
            {
              icon: Target,
              label: "Total Wagered",
              value: Number(userInfo.totalWagered).toLocaleString(),
              unit: "coins",
            },
            {
              icon: TrendingUp,
              label: "Total Won",
              value: Number(userInfo.totalWon).toLocaleString(),
              unit: "coins",
              className: "col-span-2 md:col-span-1",
            },
          ].map(({ icon: Icon, label, value, unit, className }) => (
            <div
              key={label}
              className={`rounded-xl p-4 ${className ?? ""}`}
              style={{
                background: "oklch(0.12 0 0)",
                border: "1px solid oklch(0.62 0.13 78 / 0.3)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon
                  className="w-3.5 h-3.5"
                  style={{ color: "oklch(0.85 0.18 85)" }}
                />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {label}
                </span>
              </div>
              <p
                className="text-xl font-bold tabular-nums"
                style={{ color: "oklch(0.85 0.18 85)" }}
              >
                {value}
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  {unit}
                </span>
              </p>
            </div>
          ))}
        </motion.div>
      )}

      <GameLobby />
    </div>
  );
}
