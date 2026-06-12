import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Shield,
  Trophy,
  Users,
  DollarSign,
  Activity,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Home,
  FileText,
  Wallet,
  CreditCard,
  BarChart3,
  UserPlus,
  Gamepad2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import Card from '@/components/ui/Card';
import api from '@/lib/api';

type NavItem = {
  label: string;
  icon: any;
  path: string;
  activePaths?: string[];
};

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: Home, path: '/admin', activePaths: ['/admin'] },
  { label: 'Users', icon: UserPlus, path: '/admin/users' },
  { label: 'Teams', icon: Users, path: '/admin/teams' },
  { label: 'Tournaments', icon: Trophy, path: '/admin/tournaments' },
  { label: 'Matches', icon: Activity, path: '/admin/matches' },
  { label: 'Rooms', icon: Shield, path: '/admin/rooms' },
  { label: 'Deposits', icon: CreditCard, path: '/admin/deposits' },
  { label: 'Withdrawals', icon: Wallet, path: '/admin/withdrawals' },
  { label: 'Reports', icon: FileText, path: '/admin/financial-reports' },
  { label: 'Sponsors', icon: DollarSign, path: '/admin/sponsors' },
  { label: 'Banners', icon: BarChart3, path: '/admin/banners' },
  { label: 'Notices', icon: Bell, path: '/admin/notices' },
  { label: 'Results', icon: Trophy, path: '/admin/results' },
  { label: 'Claims', icon: Trophy, path: '/admin/claims' },
  { label: 'Support', icon: Bell, path: '/admin/support' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
  { label: 'Games', icon: Gamepad2, path: '/admin/games' },
  { label: 'Game Profiles', icon: UserPlus, path: '/admin/game-profiles' },
];

const navGroups = [
  { label: 'Main', items: navItems.slice(0, 4) },
  { label: 'Manage', items: navItems.slice(4, 8) },
  { label: 'Content', items: navItems.slice(8, 13) },
  { label: 'System', items: navItems.slice(13) },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout, hydrated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [brand, setBrand] = useState({ brandName: 'ArenaHub', logoUrl: '' });
  const [adminGroupsOpen, setAdminGroupsOpen] = useState<Record<string, boolean>>({
    Main: true,
    Manage: true,
    Content: true,
    System: true,
  });

  useEffect(() => {
    if (!hydrated) return;
    if (!user || !['ADMIN', 'ORGANIZER'].includes(user.role)) {
      router.push('/admin/login');
    }
  }, [hydrated, router, user]);

  useEffect(() => {
    api.get('/platform/settings').then(({ data }) => setBrand({
      brandName: data.brandName || 'ArenaHub',
      logoUrl: data.logoUrl || '',
    })).catch(() => undefined);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  if (!hydrated || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const isActive = (path: string, activePaths?: string[]) => {
    if (activePaths) return activePaths.includes(router.pathname);
    return router.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          ${sidebarOpen ? 'w-64' : 'lg:w-20'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-gray-900 border-r border-gray-800
          transition-all duration-300 ease-in-out
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              {brand.logoUrl ? <img src={brand.logoUrl} alt="" className="h-8 w-8 rounded-lg object-cover" /> : <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"><Shield className="h-5 w-5 text-white" /></div>}
              <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {brand.brandName}
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
              <Shield className="h-5 w-5 text-white" />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {navGroups.map((group) => {
            const isOpen = adminGroupsOpen[group.label];
            return (
              <div key={group.label}>
                {sidebarOpen && (
                  <button
                    onClick={() => setAdminGroupsOpen({ ...adminGroupsOpen, [group.label]: !isOpen })}
                    className="flex items-center justify-between w-full px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-300"
                  >
                    <span>{group.label}</span>
                    <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                )}
                {isOpen && (
                  <div className="space-y-1">
                    {group.items.filter((item) => user.role === 'ADMIN' || ['Dashboard', 'Tournaments', 'Matches', 'Rooms', 'Results', 'Claims'].includes(item.label)).map((item) => {
                      const active = isActive(item.path, item.activePaths);
                      return (
                        <button
                          key={item.path}
                          onClick={() => {
                            router.push(item.path);
                            setMobileMenuOpen(false);
                          }}
                          className={`
                            w-full flex items-center gap-3 px-3 py-2 rounded-xl
                            transition-all duration-200 group relative
                            ${active
                              ? 'bg-blue-500/10 text-blue-400'
                              : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/50'
                            }
                          `}
                        >
                          {active && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full" />
                          )}
                          <item.icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-blue-400' : ''}`} />
                          {sidebarOpen && (
                            <span className="text-sm font-medium truncate">{item.label}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-gray-800">
          <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-gray-800/50 transition-colors ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user.name}</div>
                <div className="text-xs text-gray-500 truncate">{user.email}</div>
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

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-14 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-800 text-gray-400"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-1.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-56"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-gray-100 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-800">
              <div className="text-right">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-gray-500">{user.role}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                {user.name?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
