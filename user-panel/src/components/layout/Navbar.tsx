import Link from 'next/link';
import { Trophy, Users, User, Gamepad2, LogOut, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Gamepad2 className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold text-white">FF Tournament</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/user/tournaments" className="flex items-center space-x-1 text-gray-300 hover:text-white transition">
              <Trophy className="h-5 w-5" />
              <span className="hidden sm:inline">Tournaments</span>
            </Link>
            <Link href="/user/teams" className="flex items-center space-x-1 text-gray-300 hover:text-white transition">
              <Users className="h-5 w-5" />
              <span className="hidden sm:inline">Teams</span>
            </Link>
            <Link href="/user/leaderboard" className="flex items-center space-x-1 text-gray-300 hover:text-white transition">
              <Trophy className="h-5 w-5" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Link>
            
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            {user ? (
              <>
                <Link href="/user/dashboard" className="flex items-center space-x-1 text-gray-300 hover:text-white transition">
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/user/login">
                  <Button variant="secondary" size="sm">Login</Button>
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
