const DEFAULT_API_URL = 'http://127.0.0.1:8000/api';

export function getApiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;

  if (typeof window === 'undefined') return configured;

  try {
    const url = new URL(configured);
    const isLoopback = ['127.0.0.1', 'localhost', '0.0.0.0'].includes(url.hostname);
    const isLanBrowser = !['127.0.0.1', 'localhost'].includes(window.location.hostname);

    if (isLoopback && isLanBrowser) {
      url.hostname = window.location.hostname;
      return url.toString().replace(/\/$/, '');
    }
  } catch {
    return configured;
  }

  return configured;
}
