import Head from 'next/head';
import { useState, useEffect } from 'react';
import { Trophy, Calendar, Users, Clock, MapPin, ArrowRight, Filter, Search, Gamepad2, Flame, Star, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface Tournament {
  id: string;
  name: string;
  format: string;
  entryFee: number;
  prizePool: number;
  perKillReward: number;
  startDate: string;
  startTime: string;
  status: string;
  registeredTeams: number;
  maxTeams: number;
  stage: string;
  isFree: boolean;
  isFeatured: boolean;
}

export default function Tournaments() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState('ALL');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tournaments');
      setTournaments(response.data || []);
    } catch (err) {
      console.error('Failed to fetch tournaments');
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesFilter = filter === 'ALL' || tournament.status === filter;
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFormat = formatFilter === 'ALL' || tournament.format === formatFilter;
    return matchesFilter && matchesSearch && matchesFormat;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'UPCOMING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'COMPLETED': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'CANCELLED': return 'bg-red-900/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'SOLO': return 'Solo';
      case 'DUO': return 'Duo';
      case 'SQUAD': return 'Squad';
      case 'CLASH_SQUAD': return 'Clash Squad';
      default: return format;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'SOLO': return <Users className="h-4 w-4" />;
      case 'DUO': return <Users className="h-4 w-4" />;
      case 'SQUAD': return <Users className="h-4 w-4" />;
      case 'CLASH_SQUAD': return <Gamepad2 className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  return (
    <>
      <Head>
        <title>Tournaments - FF Tournament</title>
      </Head>
      <div className="min-h-screen bg-gray-900 text-white pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Tournaments
            </h1>
            <p className="text-gray-400">Join competitions and win prizes</p>
          </div>

          <Card className="p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tournaments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="LIVE">Live</option>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                <select
                  value={formatFilter}
                  onChange={(e) => setFormatFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ALL">All Formats</option>
                  <option value="SOLO">Solo</option>
                  <option value="DUO">Duo</option>
                  <option value="SQUAD">Squad</option>
                  <option value="CLASH_SQUAD">Clash Squad</option>
                </select>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((tournament) => (
              <Card 
                key={tournament.id} 
                className="p-6 hover:scale-105 transition-transform duration-200 cursor-pointer border-2 hover:border-primary-500/50"
                onClick={() => router.push(`/user/tournaments/${tournament.id}`)}
              >
                {tournament.isFeatured && (
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-semibold text-yellow-400">FEATURED</span>
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(tournament.status)}`}>
                    {tournament.status === 'LIVE' && <Flame className="inline h-3 w-3 mr-1 animate-pulse" />}
                    {tournament.status}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    {getFormatIcon(tournament.format)}
                    <span>{getFormatLabel(tournament.format)}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{tournament.name}</h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-400 text-sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    {tournament.startDate} at {tournament.startTime}
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <Users className="h-4 w-4 mr-2" />
                    {tournament.registeredTeams}/{tournament.maxTeams} Teams
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <Trophy className="h-4 w-4 mr-2" />
                    Prize: ৳{tournament.prizePool.toLocaleString()}
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Per Kill: ৳{tournament.perKillReward}
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2" />
                    {tournament.isFree ? (
                      <span className="text-green-400 font-semibold">FREE ENTRY</span>
                    ) : (
                      <span className="text-white">Entry: ৳{tournament.entryFee}</span>
                    )}
                  </div>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" 
                    style={{ width: `${(tournament.registeredTeams / tournament.maxTeams) * 100}%` }}
                  />
                </div>

                <Button 
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {tournament.status === 'LIVE' ? 'Watch Live' : tournament.status === 'COMPLETED' ? 'View Results' : 'Join Now'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>

          {filteredTournaments.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No tournaments found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
