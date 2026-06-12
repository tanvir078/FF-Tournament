import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuthStore } from '@/store/auth';
import { completeSocialAuth, SocialProvider } from '@/lib/socialAuth';

const providers: SocialProvider[] = ['google', 'facebook', 'linkedin'];

export default function SocialCallbackPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!router.isReady) return;

    const provider = String(router.query.provider || '');
    const code = String(router.query.code || '');
    const state = String(router.query.state || '');
    const providerFromState = readProviderFromState(state);
    const resolvedProvider = providers.includes(provider as SocialProvider)
      ? provider
      : providerFromState;

    if (!providers.includes(resolvedProvider as SocialProvider) || !code || !state) {
      setError('Social login callback is missing required information.');
      return;
    }

    completeSocialAuth(resolvedProvider as SocialProvider, code, state)
      .then((data) => {
        setAuth(data.user, data.access_token);
        router.replace('/user/dashboard');
      })
      .catch((requestError) => {
        setError(requestError.response?.data?.message || 'Social login failed.');
      });
  }, [router, setAuth]);

  return (
    <>
      <Head>
        <title>Social Login - FF Tournament</title>
      </Head>
      <div className="grid min-h-screen place-items-center bg-gray-950 px-4 text-white">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-black">{error ? 'Login failed' : 'Signing you in...'}</h1>
          <p className="mt-2 text-sm text-gray-400">
            {error || 'Please wait while we verify your social account.'}
          </p>
          {error && (
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => router.push('/user/login')}>Login</Button>
              <Button onClick={() => router.push('/user/register')}>Register</Button>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

function readProviderFromState(state: string) {
  try {
    const payload = state.split('.')[0];
    const json = JSON.parse(atob(payload));
    return String(json.provider || '');
  } catch {
    return '';
  }
}
