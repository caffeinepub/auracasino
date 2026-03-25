# AuraCasino

## Current State
- AdminPage shows 'All Players' using `adminGetAllUsers()` which returns Internet Identity principal-based users — NOT the username/password users created by the admin.
- `adminGetStats()` requires admin role in Motoko, so anonymous callers get an error, potentially breaking the admin page.
- After a successful Save, the 'All Players' table does not refresh to show the newly created user.
- No backend function returns both username AND password for admin-created accounts.

## Requested Changes (Diff)

### Add
- Backend: `UserCredential` type `{ username: Text; password: Text; balance: Nat }`
- Backend: `adminGetUsersWithPasswords()` query function returning `[UserCredential]` (no auth required — protected by frontend password)
- Frontend: `useAdminCreatedUsers` hook calling the new function
- Frontend: 'All Players' table shows `#`, `Username`, `Password`, `Balance` columns

### Modify
- Backend: Remove `AccessControl.isAdmin` check from `adminGetStats` and `adminGetAllUsers` (admin dashboard already protected by frontend password 'Admin980')
- Frontend: After successful Save, invalidate/refetch the new `adminCreatedUsers` query so the table updates immediately
- Frontend: `AdminPage` 'All Players' section uses the new hook and shows Username + Password

### Remove
- Frontend: Remove the old `useAdminUsers` usage in `AdminPage` for the 'All Players' section

## Implementation Plan
1. Edit `main.mo`: add `UserCredential` type, add `adminGetUsersWithPasswords`, remove auth check from `adminGetStats`
2. Update `backend.did.d.ts` and `backend.did.js` to expose the new function
3. Add `useAdminCreatedUsers` to `useQueries.ts`
4. Update `AdminPage.tsx`: 'All Players' section uses new hook, shows Username + Password; after Save refetch the new query
