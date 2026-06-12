import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Trophy,
  Target,
  Users,
  Wallet,
  Award,
  Crosshair,
  Zap,
  Medal,
  TrendingUp,
  Copy,
  Crown,
  Shield,
  Clock,
  ChevronRight,
  Flame,
  Star,
  MapPin,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import Card from '@/views/user/Desktop/_components/Card';
import Button from '@/views/user/Desktop/_components/Button';
import ActivityRail from '@/views/user/Desktop/_components/ActivityRail';

interface Match {
  id: string;
  tournamentId: string;
  tournamentName: string;
  matchNumber: number;
  scheduledTime: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'SCHEDULED';
  position?: number;
  kills?: number;
  points?: number;
  roomId?: string;
  roomPassword?: string;
}

const emptyData = {
  registrations: [] as any[],
  matches: [] as Match[],
  team: null as any,
  featured: [] as any[],
};

export default function Dashboard() {
  const router = useRouter();
  const { user, hydrated } = useAuthStore();
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'achievements'>('overview');

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.push('/user/login');
      return;
    }
    const load = async () => {
      setLoading(true);
      const [registrations, matches, team, featured] = await Promise.allSettled([
        api.get('/tournaments/my-registrations'),
        api.get('/matches/my-matches'),
        api.get('/teams/my-team'),
        api.get('/tournaments/featured'),
      ]);

      const matchesData = matches.status === 'fulfilled' ? matches.value.data : [];

      setData({
        registrations: registrations.status === 'fulfilled' ? registrations.value.data : [],
        matches: matchesData,
        team: team.status === 'fulfilled' ? team.value.data : null,
        featured: featured.status === 'fulfilled' ? featured.value.data : [],
      });
      setLoading(false);
    };
    load();
  }, [hydrated, router, user]);

  const completedMatches = data.matches.filter((m) => m.status === 'COMPLETED');
  const wins = completedMatches.filter((m) => m.position === 1).length;
  const totalKills = completedMatches.reduce((sum, m) => sum + (m.kills || 0), 0);
  const totalDeaths = completedMatches.length - wins;
  const winRate = completedMatches.length > 0 ? Math.round((wins / completedMatches.length) * 100) : 0;
  const kdRatio = totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : totalKills.toString();

  const upcomingMatches = data.matches
    .filter((m) => m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS')
    .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
  const liveMatches = upcomingMatches.filter((m) => m.status === 'IN_PROGRESS');
  const scheduledMatches = upcomingMatches.filter((m) => m.status === 'SCHEDULED');

  const activeTournament = data.registrations.find(
    (r) => r.status === 'ACTIVE' || r.status === 'ONGOING'
  );

  const handleCopyReferral = () => {
    const referralCode = user?.id?.slice(0, 8).toUpperCase() || 'FFUSER';
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!hydrated || !user || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - FF Tournament</title>
      </Head>
      <div>
          <div className="relative z-20 bg-gray-950 md:static md:bg-transparent">
          {/* Tab navigation */}
          <div className="mb-6 grid grid-cols-3 border-b border-gray-800 pb-px sm:gap-2 sm:pt-6">
            {(['overview', 'performance', 'achievements'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  relative px-1 py-2.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm
                  ${activeTab === tab
                    ? 'text-primary-400'
                    : 'text-gray-500 hover:text-gray-300'
                  }
                `}
              >
                {tab === 'overview' && 'Overview'}
                {tab === 'performance' && 'Performance'}
                {tab === 'achievements' && 'Achievements'}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
                )}
              </button>
            ))}
          </div>



          {/* Tab content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Active Tournament Card */}
              {activeTournament && (
                <Card className="p-6 border-l-4 border-l-primary-500 bg-gradient-to-r from-primary-500/5 to-transparent">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-xs text-primary-400 font-medium mb-1 uppercase tracking-wider">
                        Active Tournament
                      </div>
                      <h3 className="text-lg font-bold">{activeTournament.title}</h3>
                    </div>
                    <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-medium rounded-full border border-green-500/20">
                      {activeTournament.status}
                    </span>
                  </div>

                </Card>
              )}

              {/* Match center */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card className="border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-base font-bold">
                      <Flame className="h-4 w-4 text-red-400" />
                      Live Matches
                    </h3>
                    <span className="rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400">
                      {liveMatches.length} live
                    </span>
                  </div>

                  {liveMatches.length > 0 ? (
                    <div className="space-y-2">
                      {liveMatches.slice(0, 3).map((match) => (
                        <div key={match.id} className="rounded-xl border border-red-500/20 bg-gray-900/40 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium">{match.tournamentName}</div>
                              <div className="mt-1 text-xs text-gray-400">Match #{match.matchNumber}</div>
                            </div>
                            <span className="shrink-0 rounded-full bg-red-500/10 px-2 py-1 text-[10px] font-bold uppercase text-red-400">
                              Live now
                            </span>
                          </div>
                          {match.roomId && (
                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-red-500/10 pt-2 text-xs">
                              <span className="font-mono text-primary-400">Room: {match.roomId}</span>
                              <span className="font-mono text-primary-400">Pass: {match.roomPassword || '-'}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-5 text-center text-sm text-gray-500">No live match right now</p>
                  )}
                </Card>

                <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-base font-bold">
                      <Clock className="h-4 w-4 text-blue-400" />
                      Scheduled Matches
                    </h3>
                    <button
                      onClick={() => router.push('/user/matches')}
                      className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300"
                    >
                      View all <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>

                  {scheduledMatches.length > 0 ? (
                    <div className="space-y-2">
                      {scheduledMatches.slice(0, 3).map((match) => (
                        <div key={match.id} className="flex items-center justify-between gap-3 rounded-xl bg-gray-900/40 p-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">{match.tournamentName}</div>
                            <div className="mt-1 text-xs text-gray-500">Match #{match.matchNumber}</div>
                          </div>
                          <div className="shrink-0 text-right text-xs text-gray-400">
                            <div>{new Date(match.scheduledTime).toLocaleDateString()}</div>
                            <div className="mt-1 text-gray-500">
                              {new Date(match.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-5 text-center text-sm text-gray-500">No scheduled match yet</p>
                  )}
                </Card>
              </div>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Recent Matches - spans 8 cols */}
                <Card className="lg:col-span-8 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-base flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-400" />
                      Recent Matches
                    </h3>
                    <button
                      onClick={() => router.push('/user/matches')}
                      className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                    >
                      View all <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                  {completedMatches.length > 0 ? (
                    <div className="space-y-2">
                      {completedMatches.slice(0, 4).map((match) => (
                        <div
                          key={match.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/60 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                              match.position === 1 ? 'bg-yellow-500/10 text-yellow-400' :
                              match.position && match.position <= 3 ? 'bg-gray-500/10 text-gray-400' :
                              'bg-gray-800 text-gray-500'
                            }`}>
                              #{match.position || '-'}
                            </div>
                            <div>
                              <div className="text-sm font-medium">{match.tournamentName}</div>
                              <div className="text-xs text-gray-500">
                                {match.kills} kills • {match.points} pts
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(match.scheduledTime).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <Flame className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No matches played yet</p>
                      <Button size="sm" className="mt-3" onClick={() => router.push('/user/tournaments')}>
                        Browse Tournaments
                      </Button>
                    </div>
                  )}
                </Card>

                {/* Quick Actions - spans 4 cols */}
                <Card className="lg:col-span-4 p-6">
                  <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: Trophy, label: 'Tournaments', path: '/user/tournaments', color: 'from-purple-500/10 to-purple-500/5 border-purple-500/20' },
                      { icon: Users, label: 'My Team', path: '/user/teams/manage', color: 'from-blue-500/10 to-blue-500/5 border-blue-500/20' },
                      { icon: Wallet, label: 'Wallet', path: '/user/wallet', color: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20' },
                      { icon: TrendingUp, label: 'Leaderboard', path: '/user/leaderboard', color: 'from-orange-500/10 to-orange-500/5 border-orange-500/20' },
                      { icon: Target, label: 'Matches', path: '/user/matches', color: 'from-red-500/10 to-red-500/5 border-red-500/20' },
                      { icon: Shield, label: 'Rules', path: '/user/rules', color: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20' },
                    ].map((action) => (
                      <button
                        key={action.path}
                        onClick={() => router.push(action.path)}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br ${action.color} border hover:scale-[1.02] transition-all duration-200`}
                      >
                        <action.icon className="h-5 w-5 mb-2 text-gray-300" />
                        <span className="text-xs font-medium text-gray-300">{action.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Referral */}
                  <div className="mt-4 p-4 bg-gray-800/30 rounded-xl">
                    <div className="text-xs text-gray-500 mb-2">Referral Code</div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm font-mono bg-gray-800 px-3 py-2 rounded-lg text-primary-400">
                        {user.id?.slice(0, 8).toUpperCase() || 'FFUSER'}
                      </code>
                      <button
                        onClick={handleCopyReferral}
                        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                      >
                        {copied ? <Star className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">Earn ৳50 per referral</div>
                  </div>
                </Card>

                {/* Featured Tournaments - spans 6 cols */}
                <ActivityRail className="hidden lg:col-span-4 lg:block" />

                {/* Featured Tournaments - spans 6 cols */}
                {data.featured.length > 0 && (
                  <Card className="lg:col-span-6 p-6">
                    <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      Featured Tournaments
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {data.featured.slice(0, 4).map((tournament) => (
                        <button
                          key={tournament.id}
                          onClick={() => router.push(`/user/tournaments/${tournament.id}`)}
                          className="text-left p-4 rounded-xl bg-gray-800/30 hover:bg-gray-800/60 border border-gray-800 hover:border-gray-700 transition-all group"
                        >
                          <div className="font-medium text-sm group-hover:text-primary-400 transition-colors">
                            {tournament.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-2 space-y-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              {tournament.format}
                            </div>
                            <div>Entry: ৳{tournament.entryFee}</div>
                            <div className="text-emerald-400">Prize: ৳{tournament.prizePool}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-4"
                      onClick={() => router.push('/user/tournaments')}
                    >
                      Browse All Tournaments
                    </Button>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              {/* Performance Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Matches', value: completedMatches.length, icon: Target },
                  { label: 'Total Wins', value: wins, icon: Trophy },
                  { label: 'Total Kills', value: totalKills, icon: Crosshair },
                  { label: 'K/D Ratio', value: kdRatio, icon: Zap },
                  { label: 'MVP Count', value: wins, icon: Medal },
                  { label: 'Booyahs', value: wins, icon: Crown },
                  { label: 'Points', value: completedMatches.reduce((s, m) => s + (m.points || 0), 0), icon: Star },
                  { label: 'Avg Kills', value: completedMatches.length > 0 ? (totalKills / completedMatches.length).toFixed(1) : '0', icon: Crosshair },
                ].map((stat) => (
                  <Card key={stat.label} className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-gray-800">
                        <stat.icon className="h-4 w-4 text-primary-400" />
                      </div>
                      <span className="text-xs text-gray-500">{stat.label}</span>
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </Card>
                ))}
              </div>

              {/* Kills Chart */}
              {completedMatches.length > 0 && (
                <Card className="p-6">
                  <h3 className="font-bold text-base mb-5">Kills Per Match (Last 5)</h3>
                  <div className="flex items-end gap-3 h-40">
                    {completedMatches.slice(0, 5).map((match, i) => {
                      const maxKills = Math.max(...completedMatches.slice(0, 5).map(m => m.kills || 0), 1);
                      const height = ((match.kills || 0) / maxKills) * 100;
                      return (
                        <div key={match.id} className="flex-1 flex flex-col items-center gap-2">
                          <div className="text-xs text-gray-400">{match.kills || 0}</div>
                          <div className="w-full bg-gray-800 rounded-lg overflow-hidden" style={{ height: '120px' }}>
                            <div
                              className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-lg transition-all duration-700"
                              style={{ height: `${Math.max(height, 5)}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-600">#{match.matchNumber}</div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {completedMatches.length === 0 && (
                <Card className="p-10 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-700" />
                  <p className="text-gray-500">No match data available yet</p>
                  <Button className="mt-4" onClick={() => router.push('/user/tournaments')}>
                    Join a Tournament
                  </Button>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'First Win', desc: 'Win your first match', icon: Trophy, rarity: 'Common', unlock: wins > 0 },
                { name: 'Sharpshooter', desc: '100+ total kills', icon: Crosshair, rarity: 'Rare', unlock: totalKills >= 100 },
                { name: 'Veteran', desc: 'Play 10+ tournaments', icon: Shield, rarity: 'Rare', unlock: data.registrations.length >= 10 },
                { name: 'Champion', desc: 'Win 3+ tournaments', icon: Crown, rarity: 'Epic', unlock: wins >= 3 },
                { name: 'Team Player', desc: 'Win with a team', icon: Users, rarity: 'Common', unlock: !!data.team && wins > 0 },
                { name: 'Headshot Master', desc: '50+ headshot kills', icon: Award, rarity: 'Epic', unlock: false },
                { name: 'Booyah Master', desc: 'Get 10 booyahs', icon: Zap, rarity: 'Rare', unlock: wins >= 10 },
                { name: 'Dedicated', desc: 'Play 50+ matches', icon: Flame, rarity: 'Epic', unlock: completedMatches.length >= 50 },
                { name: 'Legend', desc: 'Win 10+ tournaments', icon: Medal, rarity: 'Legendary', unlock: wins >= 10 },
              ].map((achievement) => (
                <Card
                  key={achievement.name}
                  className={`p-5 transition-all ${
                    achievement.unlock
                      ? 'border-primary-500/30 bg-primary-500/5'
                      : 'opacity-50 grayscale'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      achievement.rarity === 'Common' ? 'bg-gray-700' :
                      achievement.rarity === 'Rare' ? 'bg-blue-500/10' :
                      achievement.rarity === 'Epic' ? 'bg-purple-500/10' :
                      'bg-yellow-500/10'
                    }`}>
                      <achievement.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{achievement.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{achievement.desc}</div>
                      <div className={`text-xs mt-2 inline-block px-2 py-0.5 rounded-full ${
                        achievement.rarity === 'Common' ? 'bg-gray-700 text-gray-300' :
                        achievement.rarity === 'Rare' ? 'bg-blue-500/10 text-blue-400' :
                        achievement.rarity === 'Epic' ? 'bg-purple-500/10 text-purple-400' :
                        'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {achievement.rarity}
                      </div>
                    </div>
                    {achievement.unlock && (
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
          </div>
      </div>
    </>
  );
}
