import Map "mo:core/Map";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Random "mo:core/Random";
import Migration "migration";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

// Use migration to add createdUsers to persistent state
(with migration = Migration.run)
actor {
  // Type definitions
  public type UserProfile = {
    balance : Nat;
    totalWagered : Nat;
    totalWon : Nat;
  };

  public type UserStatProfile = {
    principal : Text;
    balance : Nat;
    totalWagered : Nat;
    totalWon : Nat;
  };

  public type GameStats = {
    totalWagered : Nat;
    totalPaidOut : Nat;
    playCount : Nat;
  };

  public type PlayResult = {
    win : Bool;
    payout : Nat;
    result : Nat;
    message : Text;
  };

  public type RouletteBet = {
    betType : Text;
    betValue : Nat;
    wager : Nat;
  };

  public type MultiPlayResult = {
    win : Bool;
    totalPayout : Nat;
    result : Nat;
    message : Text;
  };

  public type SlotsResult = {
    win : Bool;
    payout : Nat;
    reels : [Nat];
    message : Text;
  };

  public type HiLoResult = {
    win : Bool;
    payout : Nat;
    newCard : Nat;
    message : Text;
  };

  public type AdminStats = {
    totalUsers : Nat;
    totalWagered : Nat;
    totalPaidOut : Nat;
    houseProfit : Int;
    rouletteStats : GameStats;
    slotsStats : GameStats;
    hiloStats : GameStats;
  };

  // Initialize access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // New state variable
  let createdUsers = Map.empty<Text, Text>();

  // Legacy state variables
  let initialBalance = 1000;
  let users = Map.empty<Principal, UserProfile>();
  var totalWagered : Nat = 0;
  var totalPaidOut : Nat = 0;

  var rouletteStats : GameStats = {
    totalWagered = 0;
    totalPaidOut = 0;
    playCount = 0;
  };

  var slotsStats : GameStats = {
    totalWagered = 0;
    totalPaidOut = 0;
    playCount = 0;
  };

  var hiloStats : GameStats = {
    totalWagered = 0;
    totalPaidOut = 0;
    playCount = 0;
  };

  // Helper functions
  func getUserOrRegister(caller : Principal) : UserProfile {
    switch (users.get(caller)) {
      case (?user) { user };
      case (null) {
        let newUser : UserProfile = {
          balance = initialBalance;
          totalWagered = 0;
          totalWon = 0;
        };
        users.add(caller, newUser);
        newUser;
      };
    };
  };

  func updateUserProfile(caller : Principal, profile : UserProfile) {
    users.add(caller, profile);
  };

  func updateGameStats(stats : GameStats, wager : Nat, payout : Nat) : GameStats {
    {
      totalWagered = stats.totalWagered + wager;
      totalPaidOut = stats.totalPaidOut + payout;
      playCount = stats.playCount + 1;
    };
  };

  // Created user functions
  public shared ({ caller }) func adminCreateUser(username : Text, password : Text) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create users");
    };

    if (createdUsers.containsKey(username)) {
      return "Username already exists";
    };

    createdUsers.add(username, password);
    "User created successfully";
  };

  public query ({ caller }) func adminGetCreatedUsers() : async [Text] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can get created users");
    };

    let usersArray = createdUsers.toArray();
    let sortedUsers = usersArray.sort(
      func(a, b) {
        Text.compare(a.0, b.0);
      }
    );
    let mappedUsers = sortedUsers.map(func((username, _)) { username });
    mappedUsers;
  };

  // Required profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    users.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    users.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    users.add(caller, profile);
  };

  // User wallet functions
  public shared ({ caller }) func register() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register");
    };
    
    switch (users.get(caller)) {
      case (?_) { Runtime.trap("User already registered") };
      case (null) {
        let newUser : UserProfile = {
          balance = initialBalance;
          totalWagered = 0;
          totalWon = 0;
        };
        users.add(caller, newUser);
      };
    };
  };

  public shared ({ caller }) func topUp(amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can top up");
    };
    
    if (amount > 500) {
      Runtime.trap("Top up failed. Amount must not exceed 500");
    };
    
    let user = getUserOrRegister(caller);
    let updatedUser = {
      balance = user.balance + amount;
      totalWagered = user.totalWagered;
      totalWon = user.totalWon;
    };
    updateUserProfile(caller, updatedUser);
  };

  public query ({ caller }) func getBalance() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view balance");
    };
    
    switch (users.get(caller)) {
      case (?user) { user.balance };
      case (null) { initialBalance };
    };
  };

  public query ({ caller }) func getUserInfo() : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view user info");
    };
    
    getUserOrRegister(caller);
  };

  // Roulette number color helper
  func getRouletteColor(n : Nat) : Text {
    if (n == 0) { return "green" };
    let redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
    for (r in redNumbers.vals()) {
      if (r == n) { return "red" };
    };
    "black";
  };

  // Single roulette bet payout calculator
  func calcSingleBetPayout(wager : Nat, betType : Text, betValue : Nat, result : Nat) : Nat {
    if (betType == "number" and betValue == result) { return wager * 36 };
    if (betType == "color_red" and getRouletteColor(result) == "red") { return wager * 2 };
    if (betType == "color_black" and getRouletteColor(result) == "black") { return wager * 2 };
    if (betType == "color_green" and result == 0) { return wager * 14 };
    if (betType == "dozen_1" and result >= 1 and result <= 12) { return wager * 3 };
    if (betType == "dozen_2" and result >= 13 and result <= 24) { return wager * 3 };
    if (betType == "dozen_3" and result >= 25 and result <= 36) { return wager * 3 };
    if (betType == "odd" and result != 0 and result % 2 == 1) { return wager * 2 };
    if (betType == "even" and result != 0 and result % 2 == 0) { return wager * 2 };
    0;
  };

  // Legacy single-bet roulette
  public shared ({ caller }) func playRoulette(wager : Nat, betType : Text, betValue : Nat) : async PlayResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can play roulette");
    };

    let user = getUserOrRegister(caller);
    if (user.balance < wager) {
      return { win = false; payout = 0; result = 0; message = "Insufficient balance" };
    };

    let rng = await Random.natRange(0, 37);
    let payout = calcSingleBetPayout(wager, betType, betValue, rng);

    let updatedUser = {
      balance = user.balance - wager + payout;
      totalWagered = user.totalWagered + wager;
      totalWon = user.totalWon + payout;
    };
    updateUserProfile(caller, updatedUser);

    totalWagered += wager;
    totalPaidOut += payout;
    rouletteStats := updateGameStats(rouletteStats, wager, payout);

    { win = payout > 0; payout; result = rng; message = "Roulette result: " # rng.toText() };
  };

  // Multi-bet roulette: all bets resolved against ONE spin
  public shared ({ caller }) func playRouletteMulti(bets : [RouletteBet]) : async MultiPlayResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can play roulette");
    };

    if (bets.size() == 0) {
      Runtime.trap("No bets placed");
    };

    // Calculate total wager
    var totalBetWager : Nat = 0;
    for (bet in bets.vals()) {
      totalBetWager += bet.wager;
    };

    let user = getUserOrRegister(caller);
    if (user.balance < totalBetWager) {
      return { win = false; totalPayout = 0; result = 0; message = "Insufficient balance" };
    };

    // Single spin for all bets
    let rng = await Random.natRange(0, 37);

    // Calculate total payout across all bets
    var totalPayout : Nat = 0;
    for (bet in bets.vals()) {
      totalPayout += calcSingleBetPayout(bet.wager, bet.betType, bet.betValue, rng);
    };

    let updatedUser = {
      balance = user.balance - totalBetWager + totalPayout;
      totalWagered = user.totalWagered + totalBetWager;
      totalWon = user.totalWon + totalPayout;
    };
    updateUserProfile(caller, updatedUser);

    totalWagered += totalBetWager;
    totalPaidOut += totalPayout;
    rouletteStats := updateGameStats(rouletteStats, totalBetWager, totalPayout);

    { win = totalPayout > 0; totalPayout; result = rng; message = "Roulette result: " # rng.toText() };
  };

  // Slots game
  public shared ({ caller }) func playSlots(wager : Nat) : async SlotsResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can play slots");
    };

    let user = getUserOrRegister(caller);
    if (user.balance < wager) {
      return { win = false; payout = 0; reels = [0, 0, 0]; message = "Insufficient balance" };
    };

    let rng1 = await Random.natRange(0, 7);
    let rng2 = await Random.natRange(0, 7);
    let rng3 = await Random.natRange(0, 7);

    let payout = calculateSlotPayout(wager, rng1, rng2, rng3);

    let updatedUser = {
      balance = user.balance - wager + payout;
      totalWagered = user.totalWagered + wager;
      totalWon = user.totalWon + payout;
    };
    updateUserProfile(caller, updatedUser);

    totalWagered += wager;
    totalPaidOut += payout;
    slotsStats := updateGameStats(slotsStats, wager, payout);

    { win = payout > 0; payout; reels = [rng1, rng2, rng3]; message = "Slots result: " # rng1.toText() # ", " # rng2.toText() # ", " # rng3.toText() };
  };

  func calculateSlotPayout(wager : Nat, symbol1 : Nat, symbol2 : Nat, symbol3 : Nat) : Nat {
    if (symbol1 == symbol2 and symbol2 == symbol3) { return wager * 50 };
    if (symbol1 == symbol2 or symbol2 == symbol3 or symbol1 == symbol3) { return wager * 2 };
    return 0;
  };

  // Hi-Lo game
  public shared ({ caller }) func drawCard() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can draw cards");
    };
    
    await Random.natRange(1, 14);
  };

  public shared ({ caller }) func playHiLo(wager : Nat, guess : Text, currentCard : Nat) : async HiLoResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can play Hi-Lo");
    };

    if (currentCard < 1 or currentCard > 13) {
      return { win = false; payout = 0; newCard = 0; message = "Invalid current card value" };
    };

    let user = getUserOrRegister(caller);
    if (user.balance < wager) {
      return { win = false; payout = 0; newCard = 0; message = "Insufficient balance" };
    };

    let newCard = await Random.natRange(1, 14);
    let payout = calculateHiLoPayout(wager, guess, currentCard, newCard);

    let updatedUser = {
      balance = user.balance - wager + payout;
      totalWagered = user.totalWagered + wager;
      totalWon = user.totalWon + payout;
    };
    updateUserProfile(caller, updatedUser);

    totalWagered += wager;
    totalPaidOut += payout;
    hiloStats := updateGameStats(hiloStats, wager, payout);

    { win = payout > 0; payout; newCard; message = "Hi-Lo result: " # newCard.toText() };
  };

  func calculateHiLoPayout(wager : Nat, guess : Text, currentCard : Nat, newCard : Nat) : Nat {
    if (currentCard == newCard) { return wager };
    if ((guess == "higher" and newCard > currentCard) or (guess == "lower" and newCard < currentCard)) { return wager * 2 };
    return 0;
  };

  // Admin functions
  public query ({ caller }) func adminGetAllUsers() : async [UserStatProfile] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };

    let userArray = users.entries().toArray().map(
      func((principal, profile)) : UserStatProfile {
        {
          principal = principal.toText();
          balance = profile.balance;
          totalWagered = profile.totalWagered;
          totalWon = profile.totalWon;
        };
      },
    );
    userArray;
  };

  public query ({ caller }) func adminGetStats() : async AdminStats {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view stats");
    };

    {
      totalUsers = users.size();
      totalWagered = totalWagered;
      totalPaidOut = totalPaidOut;
      houseProfit = totalWagered - totalPaidOut;
      rouletteStats = rouletteStats;
      slotsStats = slotsStats;
      hiloStats = hiloStats;
    };
  };

  public shared ({ caller }) func adminTopUpUser(user : Principal, amount : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can top up users");
    };

    let userProfile = getUserOrRegister(user);
    let updatedUser = {
      balance = userProfile.balance + amount;
      totalWagered = userProfile.totalWagered;
      totalWon = userProfile.totalWon;
    };
    updateUserProfile(user, updatedUser);
  };
};
