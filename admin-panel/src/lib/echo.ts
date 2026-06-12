import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export const createEcho = () => {
  if (typeof window === 'undefined') return null;
  (window as any).Pusher = Pusher;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
  return new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || '39xxypk2ru0hi8kok8lb',
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || '127.0.0.1',
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT || 8080),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT || 8080),
    forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${apiUrl.replace(/\/api$/, '')}/broadcasting/auth`,
    auth: { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } },
  });
};
