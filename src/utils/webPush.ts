// DASI Web Push & Service Worker Helper (Sprint 5)

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    return reg;
  } catch (err) {
    console.warn('Service Worker registration failed:', err);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Notification permission error:', err);
    return 'denied';
  }
}

export function checkNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

export async function sendLocalNotification(
  title: string,
  body: string,
  url: string = '/'
): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    const perm = await requestNotificationPermission();
    if (perm !== 'granted') return false;
  }

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification(title, {
        body,
        icon: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=192&auto=format&fit=crop&q=80',
        data: { url },
      });
      return true;
    } else {
      new Notification(title, { body });
      return true;
    }
  } catch (e) {
    console.error('Failed to show notification:', e);
    return false;
  }
}

export const PUSH_SCENARIOS = [
  {
    id: 'golden_hour',
    label: '🌅 골든아워 알림',
    title: '서울 일몰 1시간 전! 🌅',
    body: '을지로 골목길 출사 황금 타임입니다. 지금 카메라를 챙겨보세요!',
    url: '/explore',
  },
  {
    id: 'friday_drop',
    label: '👑 Friday DROP 알림',
    title: 'Fujifilm X100VI 주말 대여 오픈!',
    body: '이번 주 금요일 DROP이 오픈되었습니다. 우선 예약권을 사용하세요.',
    url: '/rent',
  },
  {
    id: 'lab_complete',
    label: '🎞️ 현상 완료 알림',
    title: '스캔본이 도착했습니다! 🎞️',
    body: '망우삼림에서 접수한 필름 스캔본 웹 갤러리가 완성되었습니다.',
    url: '/cabinet',
  },
];