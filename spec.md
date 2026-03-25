# AuraCasino

## Current State
Dashboard.tsx renders all three game components (RouletteGame, SlotsGame, HiLoGame) simultaneously in a 3-column grid. No navigation between games exists.

Game files:
- `src/frontend/src/components/games/RouletteGame.tsx` — full betting grid
- `src/frontend/src/components/games/SlotsGame.tsx` — slot machine
- `src/frontend/src/components/games/HiLoGame.tsx` — hi-lo card game

## Requested Changes (Diff)

### Add
- `GameLobby.tsx` component: three large clickable cards centered on screen — AVIATOR, ROULETTE, TEEN PATTI. Each card contains an SVG illustration (airplane, roulette wheel, three playing cards) and title. Gold/black luxury styling, hover glow effects.
- `AviatorGame.tsx` — basic Aviator multiplier game (a plane flies, multiplier increases, player cashes out before it crashes). Uses the existing `usePlayHiLo` or a simple client-side RNG if no backend method exists for Aviator — wire it up to existing backend wagering.
- `TeenPattiGame.tsx` — Teen Patti (3-card poker) game component. Deal 3 cards each to player and dealer, compare hands, player wins/loses bet.
- Active game state in Dashboard: `selectedGame: 'aviator' | 'roulette' | 'teenpatti' | null`
- Back button in each game view to return to lobby.

### Modify
- `Dashboard.tsx`: Replace the three-column game grid with the lobby/game router. Show `GameLobby` when no game selected, show only the selected game (full width) when one is chosen. Keep stats row at top.
- Roulette card in lobby maps to `RouletteGame.tsx`. Aviator and Teen Patti map to new components.

### Remove
- SlotsGame rendering from Dashboard (SlotsGame.tsx file stays but is no longer shown).
- HiLoGame rendering from Dashboard (HiLoGame.tsx file stays but is no longer shown).
- Direct rendering of all three games on the home screen.

## Implementation Plan
1. Create `GameLobby.tsx` with three SVG-illustrated cards (inline SVGs for airplane, roulette wheel, playing cards) in luxury gold/black style.
2. Create `AviatorGame.tsx` — animated multiplier curve, cash-out button, bet input. Use client-side RNG for crash point. Deduct/credit via `usePlayHiLo` backend hook or a compatible hook.
3. Create `TeenPattiGame.tsx` — deal 3 cards to player and dealer using `useDrawCard`, compare hands with standard Teen Patti ranking, resolve bet.
4. Update `Dashboard.tsx` to have `selectedGame` state and render lobby or selected game.
