# AuraCasino — Complete UI Rebuild (1jackbit.com Style)

## Current State
AuraCasino has a gold/black luxury theme with three game cards (Aviator, Roulette, Teen Patti). Backend is fully functional with adminCreateUser, playerLogin, playerPlayAviator, playerPlayRoulette, playerPlayRouletteMulti, playerPlayTeenPatti, adminGetUsersWithPasswords, adminAdjustBalance, adminGetGameHistory, adminGetPlayerWallets. The admin dashboard uses password 'Admin980'. Slots game existed in backend (playSlots) but was removed from frontend.

## Requested Changes (Diff)

### Add
- Complete visual overhaul to match 1jackbit.com: dark navy/charcoal (#0d0d1a, #12121f) background, neon cyan/green accent colors (#00e5ff, #00ff88), bright neon highlights
- Left sidebar navigation (like 1jackbit) with category links: Casino, Live Casino, Popular, New Games
- Top navigation bar with logo, search, wallet balance chip, Login/Register buttons (or player name + logout)
- Game grid layout: 4 game cards in a responsive grid (2 cols mobile, 4 cols desktop)
- Each game card: premium thumbnail image, game name, provider badge, neon PLAY NOW button on hover
- Slots game card and full Slots game (3-reel slot machine with symbols: 7, cherry, bar, diamond, bell)
- Slots uses existing backend playerPlaySlots... actually use a frontend-only RNG for slots (display only, not stored)
  - Actually: use backend playSlots function via the username/password pattern
- Game category badges/tags on cards (HOT, NEW, etc.)
- Login popup that appears ONLY when user clicks BET/PLAY (not on page load)
- Login popup has Username + Password fields + Sign Up for ID WhatsApp button
- Logout button for logged-in players
- Floating WhatsApp button 'Contact for ID' linking to https://wa.me/919105959654
- Admin dashboard complete rebuild with dark neon theme matching the casino

### Modify
- Replace gold theme entirely with dark navy + neon cyan/green theme
- GameLobby: from 3 large cards to 4-card grid with 1jackbit-style layout
- AdminPage: dark theme, better table layout, all features preserved
- Navbar: redesign to look like 1jackbit top bar
- All game UIs (Aviator, Roulette, Teen Patti): update to dark neon theme

### Remove
- Gold/amber color scheme
- Old Playfair Display luxury font approach
- Any 'Coming Soon' states

## Implementation Plan
1. Rebuild index.css with dark navy + neon cyan/green design tokens
2. Rebuild App.tsx: routing between Lobby, games, admin; PlayerSession context
3. Rebuild Navbar: top bar with logo, wallet, login/logout
4. Rebuild GameLobby: 4-card grid with image thumbnails, hover PLAY NOW, category tabs
5. Add SlotsGame component using backend playerPlaySlots (via username/password)
6. Update AviatorGame, RouletteGame, TeenPattiGame: dark neon theme
7. Rebuild AdminPage: dark neon theme, working Save button, All Players table (username+password+balance visible), wallet adjust, game history
8. LoginModal: shown only on BET click, WhatsApp Sign Up button
9. PlayerSessionContext: manages logged-in state, balance
10. Build and validate
