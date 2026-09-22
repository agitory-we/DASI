export function showToast(message: string, type: 'info' | 'success' | 'warning' = 'info') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dasi-toast', { detail: { message, type } }));
  }
}