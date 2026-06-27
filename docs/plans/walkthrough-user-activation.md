# Walkthrough: 48-Hour Account Activation Expiry

## Summary

Implemented a 48-hour activation window for admin-created user accounts. New users must log in and change their password within 48 hours of account creation — otherwise they're locked out and must ask the admin to resend the activation email.

---

## Changes Made

### 1. Edge Function — [index.ts](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm distributor app/okfarm-distributor/supabase/functions/admin-create-user/index.ts)

The largest change. Three key additions:

- **`activation_expires_at` in user metadata** — a timestamp set to `now + 48 hours` whenever a user is created or reactivated.
- **Updated activation email** — includes a prominent red alert box warning the user they have 48 hours, shows the exact expiry date/time, and tells them to contact their admin if they miss it.
- **Resend mode** — when called with `{ resend: true, user_id: "..." }`, the function:
  - Generates a new cryptographically random temporary password
  - Resets `activation_expires_at` to a fresh 48-hour window
  - Re-sends the activation email with the new credentials

---

### 2. Auth Context — [AuthContext.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm distributor app/okfarm-distributor/src/contexts/AuthContext.tsx)

- Added `activationExpired: boolean` to the `User` interface
- The `buildUser` function now checks if `must_change_password === true` **AND** `activation_expires_at` is in the past → sets `activationExpired = true`

---

### 3. Login Page — [Login.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm distributor app/okfarm-distributor/src/pages/Login.tsx)

- After a successful `signInWithPassword`, checks user metadata for expiry **before** the normal login flow
- If activation is expired: signs out immediately, shows a toast:
  > *"Your 48-hour activation window has expired. Please contact your administrator to resend the activation email."*

---

### 4. Route Guards — [App.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm distributor app/okfarm-distributor/src/App.tsx)

- Both `ProtectedRoute` and `ChangePasswordRoute` now check `user.activationExpired`
- If true → signs out and redirects to `/login` (safety net in case Login page check is bypassed)

---

### 5. Admin UI — [RoleManagement.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm distributor app/okfarm-distributor/src/pages/admin/RoleManagement.tsx)

- Added a **"Resend Activation"** button (with `RefreshCcw` icon) in each user row's new "Actions" column
- Calls the `admin-create-user` edge function with `{ resend: true, user_id }` 
- Shows success/error toasts

---

## Validation

- ✅ `tsc --noEmit` passes with no type errors
- No database migration needed — activation state is stored in Supabase Auth user metadata

## How to Test

1. **Create a user** via Role Management → verify the email mentions the 48-hour deadline
2. **Log in within 48 hours** → verify normal password change flow works
3. **Simulate expiry**: In Supabase Dashboard → Auth → find the user → edit `user_metadata` → set `activation_expires_at` to a past date → attempt login → should see the "Activation Expired" toast
4. **Resend**: As admin, go to Role Management → click "Resend Activation" → verify new email arrives with fresh credentials
