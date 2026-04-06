import { useState, useEffect, useCallback } from 'react';

const VAPID_PUBLIC_KEY_STORAGE = 'okfarm_push_enabled';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function useWebPush() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
      setIsSubscribed(localStorage.getItem(VAPID_PUBLIC_KEY_STORAGE) === 'true');
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      localStorage.setItem(VAPID_PUBLIC_KEY_STORAGE, 'true');
      setIsSubscribed(true);
    }
    return result === 'granted';
  }, [isSupported]);

  const sendLocalNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission !== 'granted') return;
    try {
      new Notification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        ...options,
      });
    } catch {
      // Fallback for mobile
      navigator.serviceWorker?.ready.then(reg => {
        reg.showNotification(title, {
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          ...options,
        });
      });
    }
  }, [permission]);

  const unsubscribe = useCallback(() => {
    localStorage.removeItem(VAPID_PUBLIC_KEY_STORAGE);
    setIsSubscribed(false);
  }, []);

  return {
    isSupported,
    isSubscribed,
    permission,
    requestPermission,
    sendLocalNotification,
    unsubscribe,
  };
}
