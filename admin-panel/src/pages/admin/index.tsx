import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Users,
  Trophy,
  DollarSign,
  Activity,
  TrendingUp,
  Clock,
  Zap,
  Shield,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  UserPlus,
  Wallet,
  FileText,
  Settings,
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalTeams: number;
  totalTournaments: number;
  activeTournaments: number;
  registrationOpenTournaments: number;
  completedTournaments: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  revenueGrowth: number;
  pendingWithdrawals: number;
  pendingDeposits: number;
  totalDeposited: number;
  totalWithdrawn: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
  newTournamentsLast30Days: number;
  revenueBreakdown: {
    bkash: number;
    nagad: number;
    stripe: number;
  };
  tournamentCompletionRate: number;
  userGrowth: {
    last7Days: number;
    last30Days: number;
  };
  tournamentParticipation: {
    totalRegistrations: number;
    averagePerTournament: number;
  };
  topOrganizers: Array<{
    organizerId: string;
    organizerName: string;
    totalPrizePool: number;
    tournamentCount: number;
  }>;
}

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  icon: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, hydrated } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [revenueChart, setRevenueChart] = useState<{ date: string; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!user || !['ADMIN', 'ORGANIZER'].includes(user.role)) {
      router.push('/admin/login');
      return;
    }
    fetchAllData();
  }, [hydrated, router, user]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes, revenueRes] = await Promise.allSettled([
        api.get('/management/dashboard'),
        api.get('/admin/analytics/activity'),
        api.get('/admin/dashboard/revenue-chart?days=7'),
      ]);

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data);
      }
      if (activityRes.status === 'fulfilled') {
        setActivities(activityRes.value.data);
      }
      if (revenueRes.status === 'fulfilled') {
        setRevenueChart(revenueRes.value.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getActivityIcon = (icon: string) => {
    switch (icon) {
      case 'UserPlus': return UserPlus;
      case 'Wallet': return Wallet;
      case 'CreditCard': return CreditCard;
      case 'Trophy': return Trophy;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'USER_REGISTERED': return 'text-green-400 bg-green-400/10';
      case 'WITHDRAW': return 'text-orange-400 bg-orange-400/10';
      case 'DEPOSIT': return 'text-emerald-400 bg-emerald-400/10';
      case 'TOURNAMENT_CREATED': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
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

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">Failed to load dashboard</div>
          <Button onClick={fetchAllData}>Retry</Button>
        </div>
      </div>
    );
  }

  const mainStatCards = [
    { title: 'Total Users', value: formatNumber(stats.totalUsers), icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10', change: `+${stats.newUsersLast7Days} this week` },
    { title: 'Total Teams', value: formatNumber(stats.totalTeams), icon: Shield, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'Total Tournaments', value: formatNumber(stats.totalTournaments), icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10', subtitle: `${stats.activeTournaments} active` },
    { title: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10', change: `${stats.revenueGrowth >= 0 ? '+' : ''}${stats.revenueGrowth}%` },
    { title: 'Pending Withdrawals', value: formatNumber(stats.pendingWithdrawals), icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10', urgent: stats.pendingWithdrawals > 0 },
    { title: 'Pending Deposits', value: formatNumber(stats.pendingDeposits), icon: CreditCard, color: 'text-cyan-400', bg: 'bg-cyan-400/10', urgent: stats.pendingDeposits > 0 },
  ];

  const quickActions = [
    { title: 'Manage Users', description: 'View and manage user accounts', icon: Users, route: '/admin/users', color: 'bg-blue-600' },
    { title: 'Manage Teams', description: 'View and manage teams', icon: Shield, route: '/admin/teams', color: 'bg-indigo-600' },
    { title: 'Manage Tournaments', description: 'Create and manage tournaments', icon: Trophy, route: '/admin/tournaments', color: 'bg-purple-600' },
    { title: 'Manage Matches', description: 'Schedule and manage matches', icon: Activity, route: '/admin/matches', color: 'bg-pink-600' },
    { title: 'Manage Rooms', description: 'Tournament room management', icon: Settings, route: '/admin/rooms', color: 'bg-gray-600' },
    { title: 'Deposit Management', description: 'View and reconcile deposits', icon: DollarSign, route: '/admin/deposits', color: 'bg-emerald-600' },
    { title: 'Manage Withdrawals', description: 'Process withdrawal requests', icon: Wallet, route: '/admin/withdrawals', color: 'bg-yellow-600' },
    { title: 'Financial Reports', description: 'View revenue and analytics', icon: FileText, route: '/admin/financial-reports', color: 'bg-green-600' },
    { title: 'Manage Sponsors', description: 'Handle sponsor partnerships', icon: Zap, route: '/admin/sponsors', color: 'bg-pink-600' },
    { title: 'Manage Banners', description: 'Homepage banner management', icon: Trophy, route: '/admin/banners', color: 'bg-orange-600' },
    { title: 'Manage Notices', description: 'System announcements', icon: Activity, route: '/admin/notices', color: 'bg-red-600' },
    { title: 'View Leaderboard', description: 'Tournament rankings', icon: TrendingUp, route: '/admin/results', color: 'bg-teal-600' },
  ];
  const visibleQuickActions = user?.role === 'ADMIN'
    ? quickActions
    : quickActions.filter((action) => ['/admin/tournaments', '/admin/matches', '/admin/rooms', '/admin/results'].includes(action.route));

  const maxRevenue = Math.max(...revenueChart.map(d => d.revenue), 1);

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {user?.role === 'ORGANIZER' ? 'Organizer Dashboard' : 'Admin Dashboard'}
            </h1>
            <p className="text-gray-400">Welcome back! Here&apos;s what&apos;s happening with your platform.</p>
          </div>
          <div className="flex gap-3 mt-4 lg:mt-0">
            <Button variant="outline" size="sm" onClick={() => router.push('/admin/financial-reports')}>
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </Button>
            <Button size="sm" onClick={() => router.push('/admin/tournaments/create')}>
              <Trophy className="h-4 w-4 mr-2" />
              Create Tournament
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {mainStatCards.map((stat, index) => (
            <Card key={index} className={`p-6 hover:scale-105 transition-all duration-200 ${stat.urgent ? 'border-orange-500/50' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-sm mb-1">{stat.title}</div>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  {stat.change && (
                    <div className={`text-xs mt-1 flex items-center gap-1 ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.change.startsWith('+') ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {stat.change}
                    </div>
                  )}
                  {stat.subtitle && <div className="text-xs text-gray-500 mt-1">{stat.subtitle}</div>}
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-7 w-7 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary-400" />
              Revenue (Last 7 Days)
            </h2>
            {revenueChart.length > 0 ? (
              <div className="space-y-3">
                {revenueChart.map((day, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="text-xs text-gray-500 w-16">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                    <div className="flex-1 h-5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500"
                        style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 w-20 text-right">{formatCurrency(day.revenue)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">No revenue data available</div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-400" />
              Recent Activity
            </h2>
            {activities.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activities.slice(0, 8).map((activity) => {
                  const Icon = getActivityIcon(activity.icon);
                  return (
                    <div key={activity.id} className="flex items-center gap-3 p-2 bg-gray-800 rounded-lg">
                      <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">{activity.message}</div>
                        <div className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">No recent activity</div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {visibleQuickActions.slice(0, 8).map((action, index) => (
                <button
                  key={index}
                  onClick={() => router.push(action.route)}
                  className={`${action.color} hover:opacity-90 text-white p-3 rounded-lg transition-all duration-200 hover:scale-105 text-left`}
                >
                  <action.icon className="h-5 w-5 mb-1" />
                  <div className="text-xs font-semibold">{action.title}</div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Platform Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-2">User Growth</div>
                <div className="text-2xl font-bold text-green-400">+{stats.userGrowth.last7Days}</div>
                <div className="text-sm text-gray-500">last 7 days</div>
                <div className="text-xs text-gray-500 mt-1">+{stats.userGrowth.last30Days} last 30d</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-2">Tournament Completion</div>
                <div className="text-2xl font-bold text-blue-400">{stats.tournamentCompletionRate}%</div>
                <div className="text-sm text-gray-500">completion rate</div>
                <div className="text-xs text-gray-500 mt-1">{stats.completedTournaments} of {stats.totalTournaments}</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-2">Revenue Growth</div>
                <div className={`text-2xl font-bold ${stats.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth}%
                </div>
                <div className="text-sm text-gray-500">vs last month</div>
                <div className="text-xs text-gray-500 mt-1">This month: {formatCurrency(stats.thisMonthRevenue)}</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Top Organizers
            </h2>
            {stats.topOrganizers && stats.topOrganizers.length > 0 ? (
              <div className="space-y-3">
                {stats.topOrganizers.map((organizer, i) => (
                  <div key={organizer.organizerId} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-gray-300 text-black' : i === 2 ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                        #{i + 1}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{organizer.organizerName}</div>
                        <div className="text-xs text-gray-500">{organizer.tournamentCount} tournaments</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">{formatCurrency(organizer.totalPrizePool)}</div>
                      <div className="text-xs text-gray-500">prize pool</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">No organizers yet</div>
            )}
          </Card>
        </div>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary-400" />
            Tournament Statistics
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.registrationOpenTournaments}</div>
              <div className="text-xs text-gray-400 mt-1">Registration Open</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-400">{stats.activeTournaments}</div>
              <div className="text-xs text-gray-400 mt-1">Active Now</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.completedTournaments}</div>
              <div className="text-xs text-gray-400 mt-1">Completed</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.tournamentParticipation.totalRegistrations}</div>
              <div className="text-xs text-gray-400 mt-1">Total Registrations</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            Revenue Breakdown
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-gray-400 text-sm mb-2">bKash</div>
              <div className="text-2xl font-bold text-pink-400">{formatCurrency(stats.revenueBreakdown?.bkash || 0)}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-gray-400 text-sm mb-2">Nagad</div>
              <div className="text-2xl font-bold text-orange-400">{formatCurrency(stats.revenueBreakdown?.nagad || 0)}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-gray-400 text-sm mb-2">Stripe</div>
              <div className="text-2xl font-bold text-indigo-400">{formatCurrency(stats.revenueBreakdown?.stripe || 0)}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
