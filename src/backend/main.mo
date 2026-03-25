import Map "mo:core/Map";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Random "mo:core/Random";
import Prim "mo:prim";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
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

  public type AviatorResult = {
    win : Bool;
    payout : Nat;
    crashPoint : Nat;  // crash multiplier * 100 (e.g. 250 = 2.50x)
    message : Text;
  };

  public type TeenPattiResult = {
    win : Bool;
    payout : Nat;
    playerCards : [Nat];  // 3 cards, 0-51
    dealerCards : [Nat];  // 3 cards, 0-51
    playerRank : Nat;     // 0=high card, 1=pair, 2=color, 3=seq, 4=pure seq, 5=trail
    dealerRank : Nat;
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
    aviatorStats : GameStats;
    teenPattiStats : GameStats;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let createdUsers = Map.empty<Text, Text>();

  let initialBalance = 1000;
  let users = Map.empty<Principal, UserProfile>();
  var totalWagered : Nat = 0;
  var totalPaidOut : Nat = 0;

  var rouletteStats : GameStats = { totalWagered = 0; totalPaidOut = 0; playCount = 0 };
  var slotsStats : GameStats = { totalWagered = 0; totalPaidOut = 0; playCount = 0 };
  var hiloStats : GameStats = { totalWagered = 0; totalPaidOut = 0; playCount = 0 };
  var aviatorStats : GameStats = { totalWagered = 0; totalPaidOut = 0; playCount = 0 };
  var teenPattiStats : GameStats = { totalWagered = 0; totalPaidOut = 0; playCount = 0 };

  func getUserOrRegister(caller : Principal) : UserProfile {
    switch (users.get(caller)) {
      case (?user) { user };
      case (null) {
        let newUser : UserProfile = { balance = initialBalance; totalWagered = 0; totalWon = 0 };
        users.add(caller, newUser);
        newUser;
      };
    };
  };

  func updateUserProfile(caller : Principal, profile : UserProfile) {
    users.add(caller, profile);
  };

  func updateGameStats(stats : GameStats, wager : Nat, payout : Nat) : GameStats {
    { totalWagered = stats.totalWagered + wager; totalPaidOut = stats.totalPaidOut + payout; playCount = stats.playCount + 1 };
  };

  // Force claim admin using the admin token (overrides existing admin)
  public shared ({ caller }) func forceClaimAdmin(secret : Text) : async Text {
    switch (Prim.envVar<system>("CAFFEINE_ADMIN_TOKEN")) {
      case (null) { Runtime.trap("Admin token not configured") };
      case (?adminToken) {
        if (secret != adminToken) { Runtime.trap("Invalid admin token") };
        accessControlState.userRoles.add(caller, #admin);
        accessControlState.adminAssigned := true;
        "Admin role granted successfully";
      };
    };
  };

  // Created user functions
  public shared ({ caller }) func adminCreateUser(username : Text, password : Text) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create users");
    };
    if (createdUsers.containsKey(username)) { return "Username already exists" };
    createdUsers.add(username, password);
    "User created successfully";
  };

  public query ({ caller }) func adminGetCreatedUsers() : async [Text] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can get created users");
    };
    let usersArray = createdUsers.toArray();
    let sortedUsers = usersArray.sort(func(a, b) { Text.compare(a.0, b.0) });
    sortedUsers.map(func((username, _)) { username });
  };

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

  public shared ({ caller }) func register() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register");
    };
    switch (users.get(caller)) {
      case (?_) { Runtime.trap("User already registered") };
      case (null) {
        let newUser : UserProfile = { balance = initialBalance; totalWagered = 0; totalWon = 0 };
        users.add(caller, newUser);
      };
    };
  };

  public shared ({ caller }) func topUp(amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can top up");
    };
    if (amount > 500) { Runtime.trap("Top up failed. Amount must not exceed 500") };
    let user = getUserOrRegister(caller);
    updateUserProfile(caller, { balance = user.balance + amount; totalWagered = user.totalWagered; totalWon = user.totalWon });
  };

  public query ({ caller }) func getBalance() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view balance");
    };
    switch (users.get(caller)) { case (?user) { user.balance }; case (null) { initialBalance } };
  };

  public query ({ caller }) func getUserInfo() : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view user info");
    };
    getUserOrRegister(caller);
  };

  func getRouletteColor(n : Nat) : Text {
    if (n == 0) { return "green" };
    let redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
    for (r in redNumbers.vals()) { if (r == n) { return "red" } };
    "black";
  };

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

  public shared ({ caller }) func playRoulette(wager : Nat, betType : Text, betValue : Nat) : async PlayResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can play roulette");
    };
    let user = getUserOrRegister(caller);
    if (user.balance < wager) { return { win = false; payout = 0; result = 0; message = "Insufficient balance" } };
    let rng = await Random.natRange(0, 37);
    let payout = calcSingleBetPayout(wager, betType, betValue, rng);
    updateUserProfile(caller, { balance = user.balance - wager + payout; totalWagered = user.totalWagered + wager; totalWon = user.totalWon + payout });
    totalWagered += wager;
    totalPaidOut += payout;
    rouletteStats := updateGameStats(rouletteStats, wager, payout);
    { win = payout > 0; payout; result = rng; message = "Roulette result: " # rng.toText() };
  };

  public shared ({ caller }) func playRouletteMulti(bets : [RouletteBet]) : async MultiPlayResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can play roulette");
    };
    if (bets.size() == 0) { Runtime.trap("No bets placed") };
    var totalBetWager : Nat = 0;
    for (bet in bets.vals()) { totalBetWager += bet.wager };
    let user = getUserOrRegister(caller);
    if (user.balance < totalBetWager) { return { win = false; totalPayout = 0; result = 0; message = "Insufficient balance" } };
    let rng = await Random.natRange(0, 37);
    var totalPayout : Nat = 0;
    for (bet in bets.vals()) { totalPayout += calcSingleBetPayout(bet.wager, bet.betType, bet.betValue, rng) };
    updateUserProfile(caller, { balance = user.balance - totalBetWager + totalPayout; totalWagered = user.totalWagered + totalBetWager; totalWon = user.totalWon + totalPayout });
    totalWagered += totalBetWager;
    totalPaidOut += totalPayout;
    rouletteStats := updateGameStats(rouletteStats, totalBetWager, totalPayout);
    { win = totalPayout > 0; totalPayout; result = rng; message = "Roulette result: " # rng.toText() };
  };

  // Aviator game: player sets target cashout multiplier (x100 integer)
  // Backend generates crash point; if target <= crash point, player wins
  public shared ({ caller }) func playAviator(wager : Nat, targetMultiplierX100 : Nat) : async AviatorResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can play Aviator");
    };
    if (targetMultiplierX100 < 110) { Runtime.trap("Minimum cashout is 1.10x") };
    let user = getUserOrRegister(caller);
    if (user.balance < wager) {
      return { win = false; payout = 0; crashPoint = 100; message = "Insufficient balance" };
    };
    // Generate crash point: 100 (1.00x) to 1000 (10.00x), house edge via distribution
    let rng = await Random.natRange(100, 1001);
    let win = targetMultiplierX100 <= rng;
    let payout = if (win) { wager * targetMultiplierX100 / 100 } else { 0 };
    updateUserProfile(caller, { balance = user.balance - wager + payout; totalWagered = user.totalWagered + wager; totalWon = user.totalWon + payout });
    totalWagered += wager;
    totalPaidOut += payout;
    aviatorStats := updateGameStats(aviatorStats, wager, payout);
    let msg = if (win) { "Cashed out at " # (targetMultiplierX100 / 100).toText() # "." # (targetMultiplierX100 % 100).toText() # "x! Crash was " # (rng / 100).toText() # "." # (rng % 100).toText() # "x" }
              else { "Crashed at " # (rng / 100).toText() # "." # (rng % 100).toText() # "x before your " # (targetMultiplierX100 / 100).toText() # "." # (targetMultiplierX100 % 100).toText() # "x cashout" };
    { win; payout; crashPoint = rng; message = msg };
  };

  // Teen Patti: deal 3 cards each, compare hand ranks
  func cardRank(c : Nat) : Nat { c % 13 };  // 0=Ace,1=2,...,12=King
  func cardSuit(c : Nat) : Nat { c / 13 };

  func minNat(a : Nat, b : Nat) : Nat { if (a < b) a else b };
  func maxNat(a : Nat, b : Nat) : Nat { if (a > b) a else b };

  func sortThreeNat(a : Nat, b : Nat, c : Nat) : (Nat, Nat, Nat) {
    let lo = minNat(a, minNat(b, c));
    let hi = maxNat(a, maxNat(b, c));
    let mid = a + b + c - lo - hi;
    (lo, mid, hi);
  };

  func teenPattiHandRank(c1 : Nat, c2 : Nat, c3 : Nat) : Nat {
    let r1 = cardRank(c1);
    let r2 = cardRank(c2);
    let r3 = cardRank(c3);
    let s1 = cardSuit(c1);
    let s2 = cardSuit(c2);
    let s3 = cardSuit(c3);
    let isFlush = s1 == s2 and s2 == s3;
    let isTrail = r1 == r2 and r2 == r3;
    let isPair = r1 == r2 or r2 == r3 or r1 == r3;
    let (lo, mid, hi) = sortThreeNat(r1, r2, r3);
    // Sequence: consecutive ranks (including A-K-Q wrap: 0,11,12)
    let isSeq = (hi - lo == 2 and mid - lo == 1) or (lo == 0 and mid == 11 and hi == 12);
    if (isTrail) { 5 }
    else if (isFlush and isSeq) { 4 }
    else if (isSeq) { 3 }
    else if (isFlush) { 2 }
    else if (isPair) { 1 }
    else { 0 };
  };

  func teenPattiHighCard(c1 : Nat, c2 : Nat, c3 : Nat) : Nat {
    maxNat(cardRank(c1), maxNat(cardRank(c2), cardRank(c3)));
  };

  public shared ({ caller }) func playTeenPatti(wager : Nat) : async TeenPattiResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can play Teen Patti");
    };
    let user = getUserOrRegister(caller);
    if (user.balance < wager) {
      return { win = false; payout = 0; playerCards = [0, 0, 0]; dealerCards = [0, 0, 0]; playerRank = 0; dealerRank = 0; message = "Insufficient balance" };
    };
    // Deal cards (0-51)
    let p1 = await Random.natRange(0, 52);
    let p2 = await Random.natRange(0, 52);
    let p3 = await Random.natRange(0, 52);
    let d1 = await Random.natRange(0, 52);
    let d2 = await Random.natRange(0, 52);
    let d3 = await Random.natRange(0, 52);
    let playerRank = teenPattiHandRank(p1, p2, p3);
    let dealerRank = teenPattiHandRank(d1, d2, d3);
    let win = playerRank > dealerRank or (playerRank == dealerRank and teenPattiHighCard(p1, p2, p3) > teenPattiHighCard(d1, d2, d3));
    let payout = if (win) { wager * 2 } else { 0 };
    updateUserProfile(caller, { balance = user.balance - wager + payout; totalWagered = user.totalWagered + wager; totalWon = user.totalWon + payout });
    totalWagered += wager;
    totalPaidOut += payout;
    teenPattiStats := updateGameStats(teenPattiStats, wager, payout);
    let handName = func(r : Nat) : Text {
      if (r == 5) { "Trail" }
      else if (r == 4) { "Pure Sequence" }
      else if (r == 3) { "Sequence" }
      else if (r == 2) { "Color" }
      else if (r == 1) { "Pair" }
      else { "High Card" };
    };
    let msg = if (win) { "You win! Your " # handName(playerRank) # " beats dealer's " # handName(dealerRank) }
              else { "Dealer wins. Dealer's " # handName(dealerRank) # " beats your " # handName(playerRank) };
    { win; payout; playerCards = [p1, p2, p3]; dealerCards = [d1, d2, d3]; playerRank; dealerRank; message = msg };
  };

  // Legacy slots/hilo kept for backward compat
  public shared ({ caller }) func playSlots(wager : Nat) : async SlotsResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    let user = getUserOrRegister(caller);
    if (user.balance < wager) { return { win = false; payout = 0; reels = [0, 0, 0]; message = "Insufficient balance" } };
    let rng1 = await Random.natRange(0, 7);
    let rng2 = await Random.natRange(0, 7);
    let rng3 = await Random.natRange(0, 7);
    let payout = if (rng1 == rng2 and rng2 == rng3) { wager * 50 } else if (rng1 == rng2 or rng2 == rng3 or rng1 == rng3) { wager * 2 } else { 0 };
    updateUserProfile(caller, { balance = user.balance - wager + payout; totalWagered = user.totalWagered + wager; totalWon = user.totalWon + payout });
    totalWagered += wager; totalPaidOut += payout;
    slotsStats := updateGameStats(slotsStats, wager, payout);
    { win = payout > 0; payout; reels = [rng1, rng2, rng3]; message = "Slots" };
  };

  public shared ({ caller }) func drawCard() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    await Random.natRange(1, 14);
  };

  public shared ({ caller }) func playHiLo(wager : Nat, guess : Text, currentCard : Nat) : async HiLoResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    if (currentCard < 1 or currentCard > 13) { return { win = false; payout = 0; newCard = 0; message = "Invalid card" } };
    let user = getUserOrRegister(caller);
    if (user.balance < wager) { return { win = false; payout = 0; newCard = 0; message = "Insufficient balance" } };
    let newCard = await Random.natRange(1, 14);
    let payout = if (currentCard == newCard) { wager } else if ((guess == "higher" and newCard > currentCard) or (guess == "lower" and newCard < currentCard)) { wager * 2 } else { 0 };
    updateUserProfile(caller, { balance = user.balance - wager + payout; totalWagered = user.totalWagered + wager; totalWon = user.totalWon + payout });
    totalWagered += wager; totalPaidOut += payout;
    hiloStats := updateGameStats(hiloStats, wager, payout);
    { win = payout > 0; payout; newCard; message = "Hi-Lo" };
  };

  public query ({ caller }) func adminGetAllUsers() : async [UserStatProfile] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) { Runtime.trap("Unauthorized") };
    users.entries().toArray().map(func((principal, profile)) : UserStatProfile {
      { principal = principal.toText(); balance = profile.balance; totalWagered = profile.totalWagered; totalWon = profile.totalWon };
    });
  };

  public query ({ caller }) func adminGetStats() : async AdminStats {
    if (not (AccessControl.isAdmin(accessControlState, caller))) { Runtime.trap("Unauthorized") };
    { totalUsers = users.size(); totalWagered; totalPaidOut; houseProfit = totalWagered - totalPaidOut;
      rouletteStats; slotsStats; hiloStats; aviatorStats; teenPattiStats };
  };

  public shared ({ caller }) func adminTopUpUser(user : Principal, amount : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) { Runtime.trap("Unauthorized") };
    let userProfile = getUserOrRegister(user);
    updateUserProfile(user, { balance = userProfile.balance + amount; totalWagered = userProfile.totalWagered; totalWon = userProfile.totalWon });
  };
};
