import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import '@/styles/globals.css';
import Navbar from '@/components/layout/Navbar';
import AdminLayout from '@/components/layout/AdminLayout';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const hydrate = useAuthStore((state) => state.hydrate);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const isAdminPage = router.pathname === '/admin' || router.pathname.startsWith('/admin/');
  const isLoginPage = router.pathname === '/admin/login';

  if (isAdminPage && !isLoginPage && (user?.role === 'ADMIN' || user?.role === 'ORGANIZER')) {
    return (
      <AdminLayout>
        <Component {...pageProps} />
      </AdminLayout>
    );
  }

  if (isLoginPage) {
    return (
      <Component {...pageProps} />
    );
  }

  return (
    <>
      <Navbar />
      <Component {...pageProps} />
    </>
  );
}
