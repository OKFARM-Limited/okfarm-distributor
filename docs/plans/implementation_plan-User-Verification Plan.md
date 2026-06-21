# Force Password Change & Credentials Email Setup

This plan details the implementation of a workflow that emails credentials to newly created users and forces them to change their password on their first login.

## User Review Required

> [!IMPORTANT]
> The email notification system requires the `ZEPTOMAIL_API_TOKEN` and `ZEPTOMAIL_FROM_EMAIL` environment secrets to be correctly configured in the Supabase project to send transactional emails successfully.

## Open Questions

None at this time.

## Proposed Changes

### Supabase Edge Functions

---

### [Component Name] Supabase Backend

#### [MODIFY] [index.ts](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/supabase/functions/admin-create-user/index.ts)
* Update the User Admin API creation call to include `must_change_password: true` in `user_metadata`.
* Import the shared `ZeptoMail` helper and use it to send an email to the newly created user with their login email, generated password, and instructions to change it on their first login.

---

### [Component Name] Frontend Client

#### [MODIFY] [AuthContext.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/contexts/AuthContext.tsx)
* Extend the `User` interface to include `mustChangePassword: boolean`.
* Extract `must_change_password` from `supabaseUser.user_metadata` in the `buildUser` helper.

#### [MODIFY] [App.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/App.tsx)
* Register a new `/change-password` route.
* Update `ProtectedRoute` to detect if the logged-in user has `mustChangePassword` set to `true`. If so, redirect them to `/change-password`.

#### [NEW] [ChangePassword.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/ChangePassword.tsx)
* Create a premium full-screen password change interface, matching the visual styles of the Login screen.
* Implement form validations (matching password confirmation, minimum length).
* Upon form submission, invoke `supabase.auth.updateUser` to update the password and clear the `must_change_password` user metadata flag (`must_change_password: false`).
* Redirect the user to `/` once the password has been successfully updated.

---

## Verification Plan

### Automated Tests
* We can run `npm run lint` and `npm run test` to verify formatting and build integrity.

### Manual Verification
1. Log in as an administrator.
2. Create a new user with a specified role (e.g., manager, assistant, viewer).
3. Verify that the user record contains `must_change_password: true` in `raw_user_meta_data`.
4. Check the Edge Function logs to verify that the credentials email was composed and sent.
5. Log in with the newly created credentials.
6. Verify that the user is immediately redirected to the `/change-password` route, and is unable to navigate away or view sidebar navigation links.
7. Attempt to set a new password and confirm that it updates successfully.
8. Verify that the user is then redirected to the dashboard, and `must_change_password` is now set to `false`.
