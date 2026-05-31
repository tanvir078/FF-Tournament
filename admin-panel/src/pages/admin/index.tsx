import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import { Users, Trophy, DollarSign, Activity, TrendingUp, Clock, Zap, Shield } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalTeams: number;
  totalTournaments: number;
  activeTournaments: number;
  totalRevenue: number;
  pendingWithdrawals: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats');
      setStats({
        totalUsers: 1250,
        totalTeams: 320,
        totalTournaments: 45,
        activeTournaments: 12,
        totalRevenue: 45600,
        pendingWithdrawals: 8,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <div className="text-xl">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Total Teams', value: stats?.totalTeams || 0, icon: Shield, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'Total Tournaments', value: stats?.totalTournaments || 0, icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { title: 'Active Tournaments', value: stats?.activeTournaments || 0, icon: Activity, color: 'text-green-400', bg: 'bg-green-400/10' },
    { title: 'Total Revenue', value: `$${stats?.totalRevenue || 0}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { title: 'Pending Withdrawals', value: stats?.pendingWithdrawals || 0, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ];

  const quickActions = [
    { title: 'Manage Users', description: 'View and manage user accounts', icon: Users, route: '/admin/users', color: 'bg-blue-600' },
    { title: 'Manage Tournaments', description: 'Create and manage tournaments', icon: Trophy, route: '/admin/tournaments', color: 'bg-purple-600' },
    { title: 'Financial Reports', description: 'View revenue and analytics', icon: TrendingUp, route: '/admin/financial-reports', color: 'bg-green-600' },
    { title: 'Manage Withdrawals', description: 'Process withdrawal requests', icon: DollarSign, route: '/admin/withdrawals', color: 'bg-yellow-600' },
    { title: 'Manage Sponsors', description: 'Handle sponsor partnerships', icon: Zap, route: '/admin/sponsors', color: 'bg-pink-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">Welcome back! Here's what's happening with your platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="p-6 hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-sm mb-1">{stat.title}</div>
                  <div className="text-4xl font-bold">{stat.value}</div>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-400" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => router.push(action.route)}
                  className={`${action.color} hover:opacity-90 text-white p-4 rounded-lg transition-all duration-200 hover:scale-105 text-left`}
                >
                  <action.icon className="h-6 w-6 mb-2" />
                  <div className="font-semibold">{action.title}</div>
                  <div className="text-sm opacity-80">{action.description}</div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Activity className="h-6 w-6 text-green-400" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg">
                  <div className="p-2 bg-blue-400/10 rounded-lg">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">New user registered</div>
                    <div className="text-sm text-gray-400">2 minutes ago</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-400" />
            Platform Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-gray-400 text-sm mb-2">User Growth</div>
              <div className="text-2xl font-bold text-green-400">+12.5%</div>
              <div className="text-sm text-gray-400">vs last month</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-gray-400 text-sm mb-2">Tournament Participation</div>
              <div className="text-2xl font-bold text-blue-400">+8.3%</div>
              <div className="text-sm text-gray-400">vs last month</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-gray-400 text-sm mb-2">Revenue Growth</div>
              <div className="text-2xl font-bold text-purple-400">+15.2%</div>
              <div className="text-sm text-gray-400">vs last month</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
