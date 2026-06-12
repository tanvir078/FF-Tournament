import { useState,  } from 'react';
import { useRouter } from 'next/router';
import { Bell, Gamepad2, Home, LogOut, LucideGamepad, Menu, Search, Trophy, UserCircle, Wallet } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { userNavItems } from '@/views/user/Mobile/_layout/navItems';
import { usePlatform } from '@/contexts/PlatformContext';

const bottomNavItems = [
  { label: 'Home', icon: Home, path: '/user/dashboard', match: ['/user/dashboard'] },
  { label: 'Tournaments', icon: Trophy, path: '/user/tournaments', match: ['/user/tournaments'] },
  { label: 'Matches', icon: Gamepad2, path: '/user/matches', match: ['/user/matches'] },
  { label: 'Games', icon: LucideGamepad, path: '/user/games', match: ['/user/games'] },
  { label: 'Profile', icon: UserCircle, path: '/user/profile', match: ['/user/profile'] },
];

export default function MobileUserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const platform = usePlatform();
  const currentPath = router.asPath.split('?')[0];

  const handleLogout = () => {
    logout();
    router.push('/user/login');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          bg-gray-900 border-r border-gray-800
          transition-all duration-300 ease-in-out
          flex flex-col bg-bg2 text-white
        `}
      >
        <div className="h-[110px] flex flex-col justify-center items-center gap-3 px-4 border-b border-gray-800">
          <div className="flex flex-col justify-center items-center gap-3">
            {platform.logoUrl ? <img src={platform.logoUrl} alt="" className="h-14 w-14 rounded-lg object-cover" /> : <div className="w-14 h-14 mt-2 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center"><Trophy className="h-5 w-5 text-white" /></div>}
            <span className="font-bold text-lg bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              {platform.brandName}
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {userNavItems.map((item) => {
            const isActive = router.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  router.push(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-primary-500/10 text-primary-400'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/50'
                  }
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full" />
                )}
                <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-primary-400' : ''}`} />
                <span className="text-sm font-medium truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-800 space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-800/50 transition-colors">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.ign || user?.name}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header style={{ backgroundColor: platform.primaryColor }} className="h-12 md:h-14 backdrop-blur-lg flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400"
            >
              <Menu className="h-5 w-5 text-white" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-1.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 w-56"
              />
            </div>
          </div>

          <h1 className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-lg font-bold text-white sm:text-xl">
            {platform.brandName}
          </h1>

          <div className="flex items-center gap-2">
            <button
              aria-label="Notifications"
              onClick={() => router.push('/user/notifications')}
              className="relative p-2 rounded-xl hover:bg-gray-800 text-white hover:text-white transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-800">
              <div className="text-right">
                <div className="text-sm font-medium">{user?.ign || user?.name}</div>
                <div className="text-xs text-gray-500">Player</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xs">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 pb-[calc(5.25rem+env(safe-area-inset-bottom))]">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-gray-950/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_30px_rgba(0,0,0,0.35)] backdrop-blur md:hidden">
        <div className="mx-auto flex h-16 max-w-md items-center justify-between gap-1">
          {bottomNavItems.map((item) => {
            const isActive = item.match.some((path) => currentPath === path || currentPath.startsWith(`${path}/`));
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-bold transition ${
                  isActive
                    ? 'bg-primary-500/15 text-primary-300'
                    : 'text-gray-500 hover:bg-white hover:text-gray-900'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-primary-300' : 'text-gray-400'}`} />
                <span className="max-w-full truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
