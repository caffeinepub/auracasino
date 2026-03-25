# AuraCasino

## Current State
- Admin dashboard is password-protected (frontend: 'Admin980')
- Save button calls adminCreateUser which requires AccessControl.isAdmin but actor is anonymous
- No game history tracking
- No WhatsApp floating button on home screen

## Requested Changes (Diff)

### Add
- GameRecord type in backend
- adminGetGameHistory public query
- Game History section in AdminPage
- Floating WhatsApp button on home screen

### Modify
- Remove AccessControl checks from admin functions
- Record game history in playerPlay functions

### Remove
- Nothing

## Implementation Plan
1. Update main.mo: GameRecord type, history storage, remove admin principal checks, add history
2. Update AdminPage.tsx: GameHistorySection
3. Update GameLobby.tsx: floating WhatsApp button
4. Update useQueries.ts: useAdminGameHistory hook
