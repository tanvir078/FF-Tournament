import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  Plus, Trophy, Calendar, Users, DollarSign, Eye, Edit, Trash2, 
  Search, Filter, Gamepad2, Flame, Clock, MoreVertical, CheckCircle, 
  XCircle, AlertCircle, Settings, Lock, Unlock, Target
} from 'lucide-react';

interface Tournament {
  id: string;
  title: string;
  format: 'SOLO' | 'DUO' | 'SQUAD' | 'CLASH_SQUAD';
  status: 'REGISTRATION_OPEN' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  entryFee: number;
  prizePool: number;
  registeredTeams: number;
  maxTeams: number;
  startDate: string;
  startTime: string;
  description?: string;
  perKillPrize?: number;
  roomDetails?: {
    roomId: string;
    password: string;
  };
}

export default function AdminTournaments() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [formatFilter, setFormatFilter] = useState('ALL');

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }
    fetchTournaments();
  }, [user]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/tournaments');
      setTournaments(response.data || [
        {
          id: '1',
          title: 'Free Fire Championship 2024',
          format: 'SQUAD',
          status: 'REGISTRATION_OPEN',
          entryFee: 50,
          prizePool: 5000,
          perKillPrize: 10,
          registeredTeams: 45,
          maxTeams: 64,
          startDate: '2024-06-15',
          startTime: '20:00',
          description: 'Annual championship tournament',
        },
        {
          id: '2',
          title: 'Weekly Tournament #12',
          format: 'DUO',
          status: 'ONGOING',
          entryFee: 25,
          prizePool: 2000,
          perKillPrize: 5,
          registeredTeams: 32,
          maxTeams: 32,
          startDate: '2024-05-28',
          startTime: '19:00',
          description: 'Weekly competitive series',
          roomDetails: {
            roomId: '12345678',
            password: 'WEEKLY12'
          }
        },
        {
          id: '3',
          title: 'Solo Showdown',
          format: 'SOLO',
          status: 'COMPLETED',
          entryFee: 10,
          prizePool: 1000,
          perKillPrize: 3,
          registeredTeams: 100,
          maxTeams: 100,
          startDate: '2024-05-20',
          startTime: '18:00',
          description: 'Solo battle royale event',
        },
        {
          id: '4',
          title: 'Clash Squad Cup',
          format: 'CLASH_SQUAD',
          status: 'UPCOMING',
          entryFee: 30,
          prizePool: 3000,
          perKillPrize: 7,
          registeredTeams: 20,
          maxTeams: 32,
          startDate: '2024-06-10',
          startTime: '21:00',
          description: '4v4 clash squad tournament',
        },
      ]);
    } catch (err) {
      console.error('Failed to fetch tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTournament = async (tournamentId: string) => {
    if (!confirm('Are you sure you want to delete this tournament?')) return;
    
    try {
      await api.delete(`/admin/tournaments/${tournamentId}`);
      fetchTournaments();
    } catch (err) {
      console.error('Failed to delete tournament');
    }
  };

  const handleToggleStatus = async (tournamentId: string, newStatus: string) => {
    try {
      await api.patch(`/admin/tournaments/${tournamentId}`, { status: newStatus });
      fetchTournaments();
    } catch (err) {
      console.error('Failed to update tournament status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONGOING': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'COMPLETED': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'REGISTRATION_OPEN': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'UPCOMING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
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

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'SOLO': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'DUO': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'SQUAD': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'CLASH_SQUAD': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || tournament.status === statusFilter;
    const matchesFormat = formatFilter === 'ALL' || tournament.format === formatFilter;
    return matchesSearch && matchesStatus && matchesFormat;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <div className="text-xl">Loading Tournaments...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Manage Tournaments
            </h1>
            <p className="text-gray-400">Create, edit, and manage tournament events</p>
          </div>
          <Button 
            onClick={() => router.push('/admin/tournaments/create')}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-5 w-5" />
            Create Tournament
          </Button>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tournaments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="ALL">All Status</option>
                <option value="REGISTRATION_OPEN">Registration Open</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
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
            <Card key={tournament.id} className="p-6 hover:scale-105 transition-transform duration-200">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-purple-400/10 rounded-lg">
                  <Trophy className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tournament.status)}`}>
                    {tournament.status === 'ONGOING' && <Flame className="inline h-3 w-3 mr-1 animate-pulse" />}
                    {tournament.status.replace('_', ' ')}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getFormatColor(tournament.format)}`}>
                    {getFormatLabel(tournament.format)}
                  </span>
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-2">{tournament.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{tournament.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Gamepad2 className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300">{getFormatLabel(tournament.format)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">{new Date(tournament.startDate).toLocaleDateString()} at {tournament.startTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-yellow-400" />
                  <span className="text-gray-300">Entry: ৳{tournament.entryFee} | Prize: ৳{tournament.prizePool}</span>
                </div>
                {tournament.perKillPrize && (
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-red-400" />
                    <span className="text-gray-300">Per Kill: ৳{tournament.perKillPrize}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-300">{tournament.registeredTeams}/{tournament.maxTeams} Teams</span>
                </div>
              </div>

              {tournament.status === 'ONGOING' && tournament.roomDetails && (
                <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-red-400 text-sm mb-2">
                    <Flame className="h-4 w-4 animate-pulse" />
                    <span className="font-semibold">Live Match Room</span>
                  </div>
                  <div className="text-xs text-gray-300">
                    <div>Room ID: {tournament.roomDetails.roomId}</div>
                    <div>Password: {tournament.roomDetails.password}</div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push(`/admin/tournaments/${tournament.id}`)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push(`/admin/tournaments/${tournament.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-red-400 border-red-400/30 hover:bg-red-400/10"
                  onClick={() => handleDeleteTournament(tournament.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredTournaments.length === 0 && (
          <Card className="p-12 text-center">
            <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No tournaments found</h3>
            <p className="text-gray-500 mb-4">Create your first tournament to get started</p>
            <Button onClick={() => router.push('/admin/tournaments/create')}>
              <Plus className="h-5 w-5 mr-2" />
              Create Tournament
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
