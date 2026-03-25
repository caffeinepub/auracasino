# AuraCasino

## Current State
Admin dashboard at `/admin` with stat cards, per-game stats, and player list. Backend uses Internet Identity auth. No username/password creation exists.

## Requested Changes (Diff)

### Add
- `adminCreateUser(username, password)` backend function storing credentials, returning error if taken
- Create User section in AdminPage.tsx with Username/Password inputs and Save button
- Success/error feedback

### Modify
- `AdminPage.tsx` — add Create User section above All Players table
- `main.mo` — add createdUsers map and adminCreateUser function

### Remove
- Nothing

## Implementation Plan
1. Add CreatedUser type and createdUsers stable map to main.mo
2. Add adminCreateUser(username, password) with admin-only guard
3. Add Create User form UI to AdminPage.tsx matching gold/black luxury theme
