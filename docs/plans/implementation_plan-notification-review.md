# Syncing Notification Preferences across the App

Currently, the toggles for In-app notifications, Push notifications, and Notification Categories only affect the backend email trigger. They do not accurately filter what you see inside the app's notification center, nor do they properly hook into the browser's push API. 

I propose the following changes to ensure all toggles act precisely on what you save:

## User Review Required
> [!IMPORTANT]
> **Daily Digest vs Instant Emails**
> Currently, the backend is designed so that if you turn ON the "Email me a daily digest", you are explicitly MUTED from receiving all instant email alerts (Stock, Payments, etc.) to prevent inbox spam. Is this the behavior you want, or do you want to receive BOTH the instant alerts AND the morning summary?

## Proposed Changes

### Frontend (Filtering In-App Notifications)
We will fetch the current user's preferences locally and use them to filter out muted categories and disabled channels so the bell icon and notification center respect your settings.

#### [MODIFY] src/hooks/data/useSystemData.ts
- Update the `useNotifications` hook to also fetch the current user's `notification_preferences`.
- Filter out notifications if `channel_in_app` is false.
- Filter out notifications whose `type` maps to a muted category (e.g., hiding `low_stock` notifications if `cat_stock` is false).

### Frontend (Syncing Push Notifications)
The Push toggle in the UI currently saves to the database but doesn't actually trigger the browser's prompt to allow push notifications.

#### [MODIFY] src/pages/settings/NotificationPreferences.tsx
- Hook the "Push" toggle up to `useWebPush().requestPermission()`.
- If you toggle it ON, we will prompt the browser for permission and save the preference. If you toggle it OFF, we will unsubscribe the device locally as well as in the database.

#### [MODIFY] src/pages/notifications/NotificationCenter.tsx
- Update the visual switches in the "Notification Settings" panel to reflect your actual saved database preferences instead of hardcoded defaults.

### Backend (SQL Trigger)
If you confirm that the Daily Digest should NOT mute instant emails, I will remove the `np.daily_digest = false` exclusion logic from the `dispatch_notification_emails` trigger.

## Verification Plan

### Manual Verification
1. I will ask you to visit the Notification Preferences page and toggle Push on/off to verify the browser prompt appears.
2. I will ask you to mute a category (e.g., Stock alerts), then we will trigger a stock alert and verify it does NOT appear in your Notification Center or increment the Bell counter.
