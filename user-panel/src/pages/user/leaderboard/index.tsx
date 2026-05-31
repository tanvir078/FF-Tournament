import Head from 'next/head';
import { useState } from 'react';
import { Trophy, Medal, TrendingUp, Users, Target, Gamepad2, Filter, Crown, Award } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface LeaderboardEntry {
  rank: number;
  team: string;
  tag: string;
  points: number;
  kills: number;
  matches: number;
  kd: number;
  wins: number;
}

export default function Leaderboard() {
  const [filter, setFilter] = useState('ALL');
  const [timeRange, setTimeRange] = useState('SEASON');

  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, team: 'Elite Warriors', tag: '[ELITE]', points: 1250, kills: 45, matches: 10, kd: 4.5, wins: 3 },
    { rank: 2, team: 'Fire Squad', tag: '[FIRE]', points: 1180, kills: 42, matches: 10, kd: 4.2, wins: 2 },
    { rank: 3, team: 'Night Hunters', tag: '[NH]', points: 1100, kills: 38, matches: 10, kd: 3.8, wins: 2 },
    { rank: 4, team: 'Storm Breakers', tag: '[STORM]', points: 1050, kills: 35, matches: 10, kd: 3.5, wins: 1 },
    { rank: 5, team: 'Shadow Ops', tag: '[SHADOW]', points: 980, kills: 32, matches: 10, kd: 3.2, wins: 1 },
    { rank: 6, team: 'Dragon Force', tag: '[DRAGON]', points: 920, kills: 30, matches: 10, kd: 3.0, wins: 1 },
    { rank: 7, team: 'Phoenix Rising', tag: '[PHX]', points: 880, kills: 28, matches: 10, kd: 2.8, wins: 0 },
    { rank: 8, team: 'Thunder Strike', tag: '[THUNDER]', points: 850, kills: 27, matches: 10, kd: 2.7, wins: 0 },
    { rank: 9, team: 'Ice Warriors', tag: '[ICE]', points: 820, kills: 25, matches: 10, kd: 2.5, wins: 0 },
    { rank: 10, team: 'Blaze Squad', tag: '[BLAZE]', points: 780, kills: 23, matches: 10, kd: 2.3, wins: 0 },
    { rank: 11, team: 'Ghost Squad', tag: '[GHOST]', points: 750, kills: 22, matches: 10, kd: 2.2, wins: 0 },
    { rank: 12, team: 'Venom Strike', tag: '[VENOM]', points: 720, kills: 21, matches: 10, kd: 2.1, wins: 0 },
    { rank: 13, team: 'Crimson Tide', tag: '[CRIMSON]', points: 690, kills: 20, matches: 10, kd: 2.0, wins: 0 },
    { rank: 14, team: 'Steel Legion', tag: '[STEEL]', points: 660, kills: 19, matches: 10, kd: 1.9, wins: 0 },
    { rank: 15, team: 'Nova Force', tag: '[NOVA]', points: 630, kills: 18, matches: 10, kd: 1.8, wins: 0 },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-orange-500" />;
    return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/50';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/50';
    if (rank === 3) return 'bg-gradient-to-r from-orange-500/20 to-orange-600/10 border-orange-500/50';
    return 'bg-gray-800/50 border-gray-700/50';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500 text-black';
    if (rank === 2) return 'bg-gray-400 text-black';
    if (rank === 3) return 'bg-orange-500 text-white';
    return 'bg-gray-700 text-gray-300';
  };

  return (
    <>
      <Head>
        <title>Leaderboard - FF Tournament</title>
      </Head>
      <div className="min-h-screen bg-gray-900 text-white pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Leaderboard
            </h1>
            <p className="text-gray-400">Top performing teams and players</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Crown className="h-4 w-4" />
                    Top Team
                  </div>
                  <p className="text-2xl font-bold text-white">Elite Warriors</p>
                  <p className="text-lg text-yellow-400">1,250 pts</p>
                </div>
                <Trophy className="h-16 w-16 text-yellow-400" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3 text-gray-400 text-sm mb-2">
                <Users className="h-4 w-4" />
                Total Teams
              </div>
              <p className="text-3xl font-bold text-white">156</p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3 text-gray-400 text-sm mb-2">
                <Gamepad2 className="h-4 w-4" />
                Total Matches
              </div>
              <p className="text-3xl font-bold text-white">1,240</p>
            </Card>
          </div>

          <Card className="p-6 mb-8">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">Filter:</span>
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="ALL">All Teams</option>
                <option value="TOP10">Top 10</option>
                <option value="TOP50">Top 50</option>
                <option value="TOP100">Top 100</option>
              </select>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="SEASON">This Season</option>
                <option value="MONTH">This Month</option>
                <option value="WEEK">This Week</option>
                <option value="ALL_TIME">All Time</option>
              </select>
            </div>
          </Card>

          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <Card 
                key={entry.rank} 
                className={`p-4 hover:scale-[1.01] transition-transform duration-200 border-2 ${getRankBg(entry.rank)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankBadge(entry.rank)} font-bold text-lg`}>
                      {entry.rank}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <span className="text-sm font-bold">
                          {entry.team.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{entry.team}</span>
                          <span className="text-xs text-gray-400">{entry.tag}</span>
                        </div>
                        <div className="text-sm text-gray-400">
                          {entry.wins} wins • {entry.matches} matches
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                        <Trophy className="h-3 w-3" />
                        Points
                      </div>
                      <div className="text-xl font-bold text-yellow-400">{entry.points}</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                        <Target className="h-3 w-3" />
                        Kills
                      </div>
                      <div className="text-xl font-bold text-red-400">{entry.kills}</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                        <TrendingUp className="h-3 w-3" />
                        K/D
                      </div>
                      <div className="text-xl font-bold text-green-400">{entry.kd}</div>
                    </div>
                    {entry.rank <= 3 && (
                      <div className="flex items-center gap-1">
                        <Award className="h-5 w-5 text-yellow-400" />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-6 mt-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Season Rewards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border border-yellow-500/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  <span className="font-semibold text-yellow-400">1st Place</span>
                </div>
                <p className="text-sm text-gray-300">৳10,000 + Exclusive Badge</p>
              </div>
              <div className="bg-gradient-to-r from-gray-400/20 to-gray-500/10 border border-gray-400/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Medal className="h-5 w-5 text-gray-400" />
                  <span className="font-semibold text-gray-400">2nd Place</span>
                </div>
                <p className="text-sm text-gray-300">৳5,000 + Exclusive Badge</p>
              </div>
              <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/10 border border-orange-500/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Medal className="h-5 w-5 text-orange-400" />
                  <span className="font-semibold text-orange-400">3rd Place</span>
                </div>
                <p className="text-sm text-gray-300">৳2,500 + Exclusive Badge</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
