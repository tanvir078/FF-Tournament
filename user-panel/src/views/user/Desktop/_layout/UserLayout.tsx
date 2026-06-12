import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Search,
  Trophy,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { userNavItems } from '@/views/user/Desktop/_layout/navItems';
import { usePlatform } from '@/contexts/PlatformContext';

export default function DesktopUserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const platform = usePlatform();

  const handleLogout = () => {
    logout();
    router.push('/user/login');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      <aside
        className={`
          relative inset-y-0 left-0 z-50
          ${sidebarOpen ? 'w-64' : 'w-20'}
          translate-x-0 bg-gray-900 border-r border-gray-800
          transition-all duration-300 ease-in-out
          flex flex-col bg-bg2 text-white
        `}
      >
        <div className="h-14 flex items-center gap-3 px-4 border-b border-gray-800">
          {sidebarOpen ? (
            <div className="flex items-center justify-between gap-3">
              {platform.logoUrl ? <img src={platform.logoUrl} alt="" className="h-7 w-7 rounded-lg object-cover" /> : <div className="w-7 h-7 mt-1 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center"><Trophy className="h-5 w-5 text-white" /></div>}
              <span className="font-bold text-lg bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                {platform.brandName}
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center mx-auto">
              <Trophy className="h-5 w-5 text-white" />
            </div>
          )}
        </div>

        <button
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-5 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-700 bg-gray-900 text-gray-400 shadow-md transition-colors hover:bg-gray-800 hover:text-white"
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {userNavItems.map((item) => {
            const isActive = router.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
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
                {sidebarOpen && <span className="text-sm font-medium truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-800 space-y-2">
          <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-gray-800/50 transition-colors ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user?.ign || user?.name}</div>
                <div className="text-xs text-gray-500 truncate">{user?.email}</div>
              </div>
            )}
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
        <header style={{ backgroundColor: platform.primaryColor }} className="h-14 backdrop-blur-lg flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-1.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 w-56"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label="Notifications"
              onClick={() => router.push('/user/notifications')}
              className="relative p-2 rounded-xl hover:bg-gray-800 text-white hover:text-white transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3 pl-3 border-l border-gray-800">
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

        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </main>
    </div>
  );
}
