import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const defaultApiUrl = Platform.select({
  android: 'http://10.0.2.2:8000/api',
  default: 'http://127.0.0.1:8000/api',
});

export async function createEcho() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || defaultApiUrl;
  const token = await SecureStore.getItemAsync('access_token');
  const scheme = process.env.EXPO_PUBLIC_REVERB_SCHEME || 'http';
  const port = Number(process.env.EXPO_PUBLIC_REVERB_PORT || 8080);

  global.Pusher = Pusher;

  return new Echo({
    broadcaster: 'reverb',
    key: process.env.EXPO_PUBLIC_REVERB_APP_KEY || '39xxypk2ru0hi8kok8lb',
    wsHost: process.env.EXPO_PUBLIC_REVERB_HOST || Platform.select({ android: '10.0.2.2', default: '127.0.0.1' }),
    wsPort: port,
    wssPort: port,
    forceTLS: scheme === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${apiUrl.replace(/\/api$/, '')}/broadcasting/auth`,
    auth: { headers: { Authorization: `Bearer ${token || ''}` } },
  });
}
