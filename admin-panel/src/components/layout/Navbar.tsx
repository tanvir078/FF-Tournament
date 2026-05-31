import Link from 'next/link';
import { Trophy, Users, User, Gamepad2, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const { user, logout } = useAuthStore();

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
            <Link href="/admin/tournaments" className="flex items-center space-x-1 text-gray-300 hover:text-white transition">
              <Trophy className="h-5 w-5" />
              <span className="hidden sm:inline">Tournaments</span>
            </Link>
            <Link href="/admin/users" className="flex items-center space-x-1 text-gray-300 hover:text-white transition">
              <Users className="h-5 w-5" />
              <span className="hidden sm:inline">Users</span>
            </Link>
            <Link href="/admin/financial-reports" className="flex items-center space-x-1 text-gray-300 hover:text-white transition">
              <Trophy className="h-5 w-5" />
              <span className="hidden sm:inline">Reports</span>
            </Link>
            
            {user ? (
              <>
                <Link href="/admin" className="flex items-center space-x-1 text-gray-300 hover:text-white transition">
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
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
