import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AdminStats,
  MultiPlayResult,
  RouletteBet,
  UserProfile,
  UserStatProfile,
} from "../backend.d";
import { useActor } from "./useActor";

const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

function calcBetPayout(bet: RouletteBet, rolled: number): number {
  const w = Number(bet.wager);
  const t = bet.betType;
  const v = Number(bet.betValue);
  if (t === "number") return v === rolled ? w * 36 : 0;
  if (t === "color_red") return RED_NUMBERS.has(rolled) ? w * 2 : 0;
  if (t === "color_black")
    return !RED_NUMBERS.has(rolled) && rolled !== 0 ? w * 2 : 0;
  if (t === "dozen_1") return rolled >= 1 && rolled <= 12 ? w * 3 : 0;
  if (t === "dozen_2") return rolled >= 13 && rolled <= 24 ? w * 3 : 0;
  if (t === "dozen_3") return rolled >= 25 && rolled <= 36 ? w * 3 : 0;
  if (t === "odd") return rolled !== 0 && rolled % 2 !== 0 ? w * 2 : 0;
  if (t === "even") return rolled !== 0 && rolled % 2 === 0 ? w * 2 : 0;
  return 0;
}

export function useBalance() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["balance"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getBalance();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useUserInfo() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile>({
    queryKey: ["userInfo"],
    queryFn: async () => {
      if (!actor)
        return {
          balance: BigInt(0),
          totalWagered: BigInt(0),
          totalWon: BigInt(0),
        };
      return actor.getUserInfo();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminStats() {
  const { actor, isFetching } = useActor();
  return useQuery<AdminStats>({
    queryKey: ["adminStats"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.adminGetStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<UserStatProfile[]>({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.adminGetAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTopUp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (amount: number) => {
      if (!actor) throw new Error("Not connected");
      await actor.topUp(BigInt(amount));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["userInfo"] });
    },
  });
}

export function useRegister() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      try {
        await actor.register();
      } catch (_e) {
        // Ignore if already registered
      }
    },
  });
}

export function usePlayRoulette() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      wager,
      betType,
      betValue,
    }: {
      wager: number;
      betType: string;
      betValue: number;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.playRoulette(BigInt(wager), betType, BigInt(betValue));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["userInfo"] });
    },
  });
}

/**
 * Multi-bet roulette: uses playRoulette for the first bet to get a canonical
 * rolled number, then calculates client-side payouts for all remaining bets.
 */
export function usePlayRouletteMulti() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bets: RouletteBet[]): Promise<MultiPlayResult> => {
      if (!actor) throw new Error("Not connected");
      if (bets.length === 0) throw new Error("No bets placed");

      // Use the first bet to get the rolled number from backend
      const first = bets[0];
      const firstResult = await actor.playRoulette(
        first.wager,
        first.betType,
        first.betValue,
      );
      const rolled = Number(firstResult.result);

      // Calculate total payout for all bets based on the same rolled number
      let totalPayout = 0;
      for (const bet of bets) {
        totalPayout += calcBetPayout(bet, rolled);
      }

      const win = totalPayout > 0;
      return {
        win,
        result: BigInt(rolled),
        totalPayout: BigInt(totalPayout),
        message: win
          ? `Rolled ${rolled} — won ${totalPayout} coins!`
          : `Rolled ${rolled}. Better luck next time!`,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["userInfo"] });
    },
  });
}

export function usePlaySlots() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (wager: number) => {
      if (!actor) throw new Error("Not connected");
      return actor.playSlots(BigInt(wager));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["userInfo"] });
    },
  });
}

export function useDrawCard() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.drawCard();
    },
  });
}

export function usePlayHiLo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      wager,
      guess,
      currentCard,
    }: {
      wager: number;
      guess: string;
      currentCard: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.playHiLo(BigInt(wager), guess, currentCard);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["userInfo"] });
    },
  });
}
