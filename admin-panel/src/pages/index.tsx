import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/admin/login');
      }
    } else {
      router.push('/admin/login');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-xl">Loading...</div>
    </div>
  );
}
