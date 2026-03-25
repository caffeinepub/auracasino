import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface GameStats {
    totalWagered: bigint;
    totalPaidOut: bigint;
    playCount: bigint;
}
export interface SlotsResult {
    win: boolean;
    message: string;
    reels: Array<bigint>;
    payout: bigint;
}
export interface RouletteBet {
    betType: string;
    betValue: bigint;
    wager: bigint;
}
export interface AdminStats {
    rouletteStats: GameStats;
    slotsStats: GameStats;
    houseProfit: bigint;
    hiloStats: GameStats;
    aviatorStats: GameStats;
    teenPattiStats: GameStats;
    totalWagered: bigint;
    totalPaidOut: bigint;
    totalUsers: bigint;
}
export interface UserStatProfile {
    principal: string;
    balance: bigint;
    totalWagered: bigint;
    totalWon: bigint;
}
export interface PlayResult {
    win: boolean;
    result: bigint;
    message: string;
    payout: bigint;
}
export interface HiLoResult {
    win: boolean;
    message: string;
    newCard: bigint;
    payout: bigint;
}
export interface MultiPlayResult {
    win: boolean;
    result: bigint;
    message: string;
    totalPayout: bigint;
}
export interface AviatorResult {
    win: boolean;
    payout: bigint;
    crashPoint: bigint;
    message: string;
}
export interface TeenPattiResult {
    win: boolean;
    payout: bigint;
    playerCards: Array<bigint>;
    dealerCards: Array<bigint>;
    playerRank: bigint;
    dealerRank: bigint;
    message: string;
}
export interface UserProfile {
    balance: bigint;
    totalWagered: bigint;
    totalWon: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminCreateUser(username: string, password: string): Promise<string>;
    adminGetAllUsers(): Promise<Array<UserStatProfile>>;
    adminGetCreatedUsers(): Promise<Array<string>>;
    adminGetStats(): Promise<AdminStats>;
    adminTopUpUser(user: Principal, amount: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    drawCard(): Promise<bigint>;
    forceClaimAdmin(secret: string): Promise<string>;
    getBalance(): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserInfo(): Promise<UserProfile>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    playAviator(wager: bigint, targetMultiplierX100: bigint): Promise<AviatorResult>;
    playHiLo(wager: bigint, guess: string, currentCard: bigint): Promise<HiLoResult>;
    playRoulette(wager: bigint, betType: string, betValue: bigint): Promise<PlayResult>;
    playRouletteMulti(bets: Array<RouletteBet>): Promise<MultiPlayResult>;
    playSlots(wager: bigint): Promise<SlotsResult>;
    playTeenPatti(wager: bigint): Promise<TeenPattiResult>;
    register(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    topUp(amount: bigint): Promise<void>;
}
