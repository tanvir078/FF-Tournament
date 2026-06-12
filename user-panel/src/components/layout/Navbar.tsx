import Link from 'next/link';
import { Trophy, Users, User, Gamepad2, LogOut, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/ui/Button';
import { usePlatform } from '@/contexts/PlatformContext';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const platform = usePlatform();

  return (
    <nav style={{ borderColor: platform.primaryColor }} className="bg-gray-800 border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              {platform.logoUrl ? <img src={platform.logoUrl} alt="" className="h-8 w-8 rounded object-cover" /> : <Gamepad2 className="h-8 w-8 text-blue-400" />}
              <span className="text-xl font-bold text-white">{platform.brandName}</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/user/tournaments" className="flex items-center space-x-1 text-gray-300 hover:text-white transition">
              <Trophy className="h-5 w-5 text-blue-400" />
            </Link>
            <Link href="/user/teams" className="flex items-center space-x-1 text-gray-300 hover:text-white transition">
              <Users className="h-5 w-5 text-blue-400" />
            </Link>
            <Link href="/user/leaderboard" className="flex items-center space-x-1 text-gray-300 hover:text-white transition">
              <Trophy className="h-5 w-5" />
            </Link>
            
            <Button variant="outline" size="sm" onClick={() => toggleTheme()}>
              {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-400" />}
              <span className="ml-1">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </Button>
            
            {user ? (
              <>
                <Link href="/user/dashboard" className="flex items-center space-x-1 text-gray-300 hover:text-white transition">
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Link href="/user/profile" className="flex items-center space-x-1 text-gray-300 hover:text-white transition">
                  <User className="h-5 w-5" />
                  </Link>

                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/user/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link href="/user/register">
                  <Button variant="outline" size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {user ? (
              <Link href="/user/dashboard">
                <Button variant="outline" size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/user/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link href="/user/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
