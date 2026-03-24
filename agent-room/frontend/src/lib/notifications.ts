// Browser push notification helpers

export async function requestPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function sendNotification(
  title: string,
  body: string,
  options?: NotificationOptions
): void {
  if (Notification.permission === 'granted' && !document.hasFocus()) {
    new Notification(title, { body, ...options })
  }
}

export function isTabFocused(): boolean {
  return document.hasFocus()
}

export function shouldNotify(): boolean {
  return Notification.permission === 'granted' && !document.hasFocus()
}
