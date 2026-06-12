import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DesktopUserLayout from '@/views/user/Desktop/_layout/UserLayout';
import MobileUserLayout from '@/views/user/Mobile/_layout/UserLayout';
import { useAuthStore } from '@/store/auth';

const desktopMediaQuery = '(min-width: 1024px)';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, hydrated } = useAuthStore();
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === 'undefined' ? true : window.matchMedia(desktopMediaQuery).matches
  );

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.push('/user/login');
    }
  }, [hydrated, router, user]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(desktopMediaQuery);
    const updateLayout = () => setIsDesktop(mediaQuery.matches);

    updateLayout();
    mediaQuery.addEventListener('change', updateLayout);

    return () => mediaQuery.removeEventListener('change', updateLayout);
  }, []);

  if (!hydrated || !user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  return isDesktop
    ? <DesktopUserLayout>{children}</DesktopUserLayout>
    : <MobileUserLayout>{children}</MobileUserLayout>;
}
