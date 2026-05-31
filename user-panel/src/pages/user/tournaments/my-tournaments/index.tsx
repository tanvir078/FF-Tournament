import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  Trophy, Calendar, Users, Clock, Gamepad2, Flame, 
  Lock, Eye, EyeOff, Check, X, AlertCircle, Filter
} from 'lucide-react';

interface JoinedTournament {
  id: string;
  name: string;
  format: string;
  entryFee: number;
  prizePool: number;
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  startTime: string;
  registrationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  roomDetails?: {
    roomId: string;
    password: string;
  };
  position?: number;
  kills?: number;
  points?: number;
}

export default function MyTournaments() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [tournaments, setTournaments] = useState<JoinedTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [showRoomDetails, setShowRoomDetails] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) {
      router.push('/user/login');
      return;
    }
    fetchMyTournaments();
  }, [user]);

  const fetchMyTournaments = async () => {
    try {
      setLoading(true);
      // Using dummy data for now
      const dummyTournaments: JoinedTournament[] = [
        {
          id: '1',
          name: 'FF Pro League Season 1',
          format: 'SQUAD',
          entryFee: 100,
          prizePool: 10000,
          status: 'UPCOMING',
          startDate: '2024-06-01',
          startTime: '20:00',
          registrationStatus: 'APPROVED',
          roomDetails: {
            roomId: '12345678',
            password: 'PRO2024'
          }
        },
        {
          id: '2',
          name: 'Weekly Clash Cup',
          format: 'CLASH_SQUAD',
          entryFee: 50,
          prizePool: 5000,
          status: 'LIVE',
          startDate: '2024-05-28',
          startTime: '19:00',
          registrationStatus: 'APPROVED',
          roomDetails: {
            roomId: '87654321',
            password: 'CLASH123'
          }
        },
        {
          id: '3',
          name: 'Solo Championship',
          format: 'SOLO',
          entryFee: 30,
          prizePool: 3000,
          status: 'COMPLETED',
          startDate: '2024-05-20',
          startTime: '18:00',
          registrationStatus: 'APPROVED',
          position: 5,
          kills: 12,
          points: 85
        },
        {
          id: '4',
          name: 'Duo Showdown',
          format: 'DUO',
          entryFee: 40,
          prizePool: 4000,
          status: 'COMPLETED',
          startDate: '2024-05-15',
          startTime: '21:00',
          registrationStatus: 'APPROVED',
          position: 12,
          kills: 8,
          points: 45
        },
        {
          id: '5',
          name: 'Free Fire Weekly',
          format: 'SQUAD',
          entryFee: 0,
          prizePool: 2000,
          status: 'UPCOMING',
          startDate: '2024-06-05',
          startTime: '17:00',
          registrationStatus: 'PENDING'
        }
      ];
      setTournaments(dummyTournaments);
    } catch (err: any) {
      console.error('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const toggleRoomDetails = (tournamentId: string) => {
    setShowRoomDetails(prev => ({
      ...prev,
      [tournamentId]: !prev[tournamentId]
    }));
  };

  const filteredTournaments = tournaments.filter(t => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return t.registrationStatus === 'PENDING';
    return t.status === filter;
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

  const getRegStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'REJECTED': return 'bg-red-500/20 text-red-400 border-red-500/30';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            My Tournaments
          </h1>
          <p className="text-gray-400">View your joined tournaments and match details</p>
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
              <option value="ALL">All Tournaments</option>
              <option value="LIVE">Live</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending Approval</option>
            </select>
          </div>
        </Card>

        {filteredTournaments.length === 0 ? (
          <Card className="p-12 text-center">
            <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No tournaments found</h3>
            <p className="text-gray-500 mb-4">You haven't joined any tournaments yet</p>
            <Button onClick={() => router.push('/user/tournaments')}>
              Browse Tournaments
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTournaments.map((tournament) => (
              <Card key={tournament.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(tournament.status)}`}>
                        {tournament.status === 'LIVE' && <Flame className="inline h-3 w-3 mr-1 animate-pulse" />}
                        {tournament.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRegStatusColor(tournament.registrationStatus)}`}>
                        {tournament.registrationStatus}
                      </span>
                      <span className="text-sm text-gray-400">{getFormatLabel(tournament.format)}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">{tournament.name}</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="h-4 w-4" />
                        {tournament.startDate}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="h-4 w-4" />
                        {tournament.startTime}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Trophy className="h-4 w-4" />
                        ৳{tournament.prizePool.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Gamepad2 className="h-4 w-4" />
                        Entry: {tournament.entryFee === 0 ? 'FREE' : `৳${tournament.entryFee}`}
                      </div>
                    </div>

                    {tournament.status === 'COMPLETED' && tournament.position && (
                      <div className="grid grid-cols-3 gap-4 bg-gray-800 p-4 rounded-lg">
                        <div className="text-center">
                          <div className="text-gray-400 text-sm">Position</div>
                          <div className="text-2xl font-bold text-yellow-400">#{tournament.position}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-400 text-sm">Kills</div>
                          <div className="text-2xl font-bold text-red-400">{tournament.kills}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-400 text-sm">Points</div>
                          <div className="text-2xl font-bold text-green-400">{tournament.points}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 min-w-[200px]">
                    {tournament.registrationStatus === 'PENDING' && (
                      <div className="bg-yellow-500/20 border border-yellow-500/30 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-400 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          <span>Awaiting approval</span>
                        </div>
                      </div>
                    )}

                    {tournament.registrationStatus === 'REJECTED' && (
                      <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-red-400 text-sm">
                          <X className="h-4 w-4" />
                          <span>Registration rejected</span>
                        </div>
                      </div>
                    )}

                    {tournament.registrationStatus === 'APPROVED' && tournament.roomDetails && (
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2 text-gray-400 text-sm">
                          <Lock className="h-4 w-4" />
                          <span>Room Details</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Room ID:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm">
                                {showRoomDetails[tournament.id] ? tournament.roomDetails.roomId : '••••••••'}
                              </span>
                              <button
                                onClick={() => toggleRoomDetails(tournament.id)}
                                className="text-gray-400 hover:text-white"
                              >
                                {showRoomDetails[tournament.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Password:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm">
                                {showRoomDetails[tournament.id] ? tournament.roomDetails.password : '••••••••'}
                              </span>
                              <button
                                onClick={() => toggleRoomDetails(tournament.id)}
                                className="text-gray-400 hover:text-white"
                              >
                                {showRoomDetails[tournament.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/user/tournaments/${tournament.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
