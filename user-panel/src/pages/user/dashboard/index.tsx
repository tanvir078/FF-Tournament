import Head from 'next/head';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Users, Trophy, Wallet, Target, Zap, Calendar, TrendingUp, ArrowRight, Gamepad2, Plus, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function Dashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState({
    teams: 2,
    tournaments: 5,
    walletBalance: 250,
    totalKills: 45,
    wins: 3,
    matchesPlayed: 12
  });
  const [recentTournaments, setRecentTournaments] = useState([
    { id: '1', title: 'Weekly Tournament #12', status: 'ONGOING', date: '2024-05-28', position: 5 },
    { id: '2', title: 'Solo Showdown', status: 'COMPLETED', date: '2024-05-20', position: 12 },
    { id: '3', title: 'Squad Championship', status: 'COMPLETED', date: '2024-05-15', position: 8 },
  ]);

  useEffect(() => {
    if (!user) {
      router.push('/user/login');
    }
  }, [user, router]);

  if (!user) return null;

  const statCards = [
    { title: 'My Teams', value: stats.teams, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10', route: '/user/teams' },
    { title: 'Tournaments', value: stats.tournaments, icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10', route: '/user/tournaments' },
    { title: 'Wallet Balance', value: `৳${stats.walletBalance}`, icon: Wallet, color: 'text-green-400', bg: 'bg-green-400/10', route: '/user/wallet' },
    { title: 'Total Kills', value: stats.totalKills, icon: Target, color: 'text-red-400', bg: 'bg-red-400/10', route: '/user/profile' },
  ];

  const quickActions = [
    { title: 'Create Team', description: 'Start your team', icon: Users, route: '/user/teams/manage', color: 'bg-blue-600' },
    { title: 'Join Tournament', description: 'Find competitions', icon: Trophy, route: '/user/tournaments', color: 'bg-purple-600' },
    { title: 'Deposit Money', description: 'Add funds', icon: Wallet, route: '/user/wallet', color: 'bg-green-600' },
  ];

  return (
    <>
      <Head>
        <title>Dashboard - FF Tournament</title>
      </Head>
      <div className="min-h-screen bg-gray-900 text-white pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Welcome back, {user.name}!
            </h1>
            <p className="text-gray-400">Ready to compete and win prizes?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <Card key={index} className="p-6 hover:scale-105 transition-transform duration-200 cursor-pointer" onClick={() => router.push(stat.route)}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="flex items-center gap-1 text-green-400 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    <span>+{Math.floor(Math.random() * 20)}%</span>
                  </div>
                </div>
                <div className="text-gray-400 text-sm mb-1">{stat.title}</div>
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-400" />
                Recent Tournaments
              </h2>
              <div className="space-y-4">
                {recentTournaments.map((tournament) => (
                  <div key={tournament.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        tournament.status === 'ONGOING' ? 'bg-green-400/10' : 'bg-gray-400/10'
                      }`}>
                        <Trophy className={`h-5 w-5 ${
                          tournament.status === 'ONGOING' ? 'text-green-400' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <div className="font-medium">{tournament.title}</div>
                        <div className="text-sm text-gray-400">
                          {new Date(tournament.date).toLocaleDateString()} • Position: #{tournament.position}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      tournament.status === 'ONGOING' 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                    }`}>
                      {tournament.status}
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => router.push('/user/tournaments')}
              >
                View All Tournaments
                <ArrowRight className="inline h-4 w-4 ml-2" />
              </Button>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Zap className="h-6 w-6 text-blue-400" />
                Quick Actions
              </h2>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => router.push(action.route)}
                    className={`${action.color} hover:opacity-90 text-white p-4 rounded-lg transition-all duration-200 hover:scale-105 text-left w-full`}
                  >
                    <action.icon className="h-6 w-6 mb-2" />
                    <div className="font-semibold">{action.title}</div>
                    <div className="text-sm opacity-80">{action.description}</div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-purple-400" />
              Featured Tournament
            </h2>
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                      FEATURED
                    </span>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                      REGISTRATION OPEN
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Free Fire Championship 2024</h3>
                  <p className="text-gray-400 mb-4">Annual championship with massive prize pool</p>
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Squad</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>June 15, 2024</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      <span>Entry: $50 | Prize: $5000</span>
                    </div>
                  </div>
                </div>
                <Button 
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => router.push('/user/tournaments')}
                >
                  Join Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-400" />
                Upcoming Matches
              </h2>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div>
                      <div className="font-medium">Match #{item}</div>
                      <div className="text-sm text-gray-400">Starts in {item * 15} minutes</div>
                    </div>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Performance Stats
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Win Rate</span>
                    <span className="text-green-400 font-semibold">25%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">K/D Ratio</span>
                    <span className="text-blue-400 font-semibold">3.75</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Avg Position</span>
                    <span className="text-yellow-400 font-semibold">#8</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '80%' }} />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
