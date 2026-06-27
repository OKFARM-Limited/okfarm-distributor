# 48-Hour Account Activation Expiry

When an admin creates a new user, the activation credentials (temporary password) should expire after 48 hours. If the user doesn't log in and change their password within that window, they are locked out and must contact the admin to resend the activation email. The activation email itself must clearly communicate this deadline.

## Proposed Changes

### Edge Function: `admin-create-user`

#### [MODIFY] [index.ts](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm distributor app/okfarm-distributor/supabase/functions/admin-create-user/index.ts)

**1. Store activation deadline in user metadata**

When creating the user, add an `activation_expires_at` timestamp (current time + 48 hours) alongside the existing `must_change_password` flag:

```diff
 user_metadata: { 
   display_name: display_name || email.split("@")[0],
-  must_change_password: true
+  must_change_password: true,
+  activation_expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
 },
```

**2. Update the email body to mention the 48-hour window**

Add a prominent notice in the email telling the user they have 48 hours to activate, and that they must contact their admin to resend the activation if they miss the window. The email will also display the exact expiry date/time for clarity.

**3. Add resend activation support**

Support a `resend` mode in the same edge function. When called with `{ resend: true, user_id: "..." }`, it will:
- Reset the user's password to a new temporary password
- Update `activation_expires_at` to a fresh 48-hour window
- Re-send the activation email with the new credentials

---

### Auth Context

#### [MODIFY] [AuthContext.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm distributor app/okfarm-distributor/src/contexts/AuthContext.tsx)

Add an `activationExpired` flag to the `User` model. The `buildUser` function will check if:
- `must_change_password === true` **AND**
- `activation_expires_at` is in the past

If so, the user's activation has expired. This allows the app to distinguish between "must change password (still valid)" and "activation expired (locked out)."

---

### Login Page

#### [MODIFY] [Login.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm distributor app/okfarm-distributor/src/pages/Login.tsx)

After a successful login, if the user has `activationExpired === true`:
- Sign the user out immediately
- Show a clear error message: *"Your activation link has expired. Please contact your administrator to resend the activation email."*

This prevents expired users from accessing the change password screen at all.

---

### App Router

#### [MODIFY] [App.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm distributor app/okfarm-distributor/src/App.tsx)

The `ProtectedRoute` and `ChangePasswordRoute` will also check `activationExpired`. If the flag is true, the user is signed out and redirected to login (as a safety net in case the login page check is bypassed).

---

### Admin: Role Management (Resend Button)

#### [MODIFY] [RoleManagement.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm distributor app/okfarm-distributor/src/pages/admin/RoleManagement.tsx)

Add a "Resend Activation" action button for users whose activation has expired or is still pending. This calls the `admin-create-user` edge function with `{ resend: true, user_id: "..." }` to reset the 48-hour window and re-send the email.

---

## Summary of Changes

| File | Change |
|------|--------|
| `supabase/functions/admin-create-user/index.ts` | Store `activation_expires_at`, update email content, add resend mode |
| `src/contexts/AuthContext.tsx` | Add `activationExpired` flag derived from metadata |
| `src/pages/Login.tsx` | Block login + show error for expired activations |
| `src/App.tsx` | Guard routes against expired activation |
| `src/pages/admin/RoleManagement.tsx` | Add "Resend Activation" button for admins |

## Verification Plan

### Manual Verification
- Create a user via admin panel → verify the activation email contains the 48-hour notice
- Log in as the new user within 48 hours → verify the change password flow works normally
- Manually set `activation_expires_at` to a past date in Supabase → verify login is blocked with correct error message
- Use the "Resend Activation" button → verify new email is sent and the user can log in again
