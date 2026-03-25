import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type UserProfile = {
    balance : Nat;
    totalWagered : Nat;
    totalWon : Nat;
  };

  type GameStats = {
    totalWagered : Nat;
    totalPaidOut : Nat;
    playCount : Nat;
  };

  type OldActor = {
    users : Map.Map<Principal, UserProfile>;
    totalWagered : Nat;
    totalPaidOut : Nat;
    rouletteStats : GameStats;
    slotsStats : GameStats;
    hiloStats : GameStats;
  };

  type NewActor = {
    createdUsers : Map.Map<Text, Text>;
    users : Map.Map<Principal, UserProfile>;
    totalWagered : Nat;
    totalPaidOut : Nat;
    rouletteStats : GameStats;
    slotsStats : GameStats;
    hiloStats : GameStats;
  };

  public func run(old : OldActor) : NewActor {
    {
      createdUsers = Map.empty<Text, Text>();
      users = old.users;
      totalWagered = old.totalWagered;
      totalPaidOut = old.totalPaidOut;
      rouletteStats = old.rouletteStats;
      slotsStats = old.slotsStats;
      hiloStats = old.hiloStats;
    };
  };
};
