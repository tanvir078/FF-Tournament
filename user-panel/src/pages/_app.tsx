import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import '@/styles/globals.css';
import Navbar from '@/components/layout/Navbar';
import UserLayout from '@/components/layout/UserLayout';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { PlatformProvider } from '@/contexts/PlatformContext';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const hydrate = useAuthStore((state) => state.hydrate);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const isPublicPage = router.pathname === '/' || router.pathname === '/user/login' || router.pathname === '/user/register';
  const isUserPage = router.pathname.startsWith('/user/') && !isPublicPage;

  if (isUserPage) {
    return (
      <ThemeProvider>
        <PlatformProvider><UserLayout><Component {...pageProps} /></UserLayout></PlatformProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <PlatformProvider><Navbar /><Component {...pageProps} /></PlatformProvider>
    </ThemeProvider>
  );
}
