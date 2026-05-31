import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  Calendar, Clock, MapPin, Gamepad2, Flame, Lock, 
  Eye, EyeOff, Trophy, Users, Filter, AlertCircle
} from 'lucide-react';

interface Match {
  id: string;
  tournamentId: string;
  tournamentName: string;
  matchNumber: number;
  stage: string;
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  scheduledTime: string;
  roomCode?: string;
  roomPassword?: string;
  map: string;
  format: string;
}

export default function MatchesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [showRoomDetails, setShowRoomDetails] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) {
      router.push('/user/login');
      return;
    }
    fetchMatches();
  }, [user]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      // Using dummy data for now
      const dummyMatches: Match[] = [
        {
          id: '1',
          tournamentId: '1',
          tournamentName: 'FF Pro League Season 1',
          matchNumber: 1,
          stage: 'QUALIFIER',
          status: 'SCHEDULED',
          scheduledTime: '2024-06-01T20:00:00Z',
          roomCode: '12345678',
          roomPassword: 'PRO2024',
          map: 'Bermuda',
          format: 'SQUAD'
        },
        {
          id: '2',
          tournamentId: '1',
          tournamentName: 'FF Pro League Season 1',
          matchNumber: 2,
          stage: 'QUALIFIER',
          status: 'SCHEDULED',
          scheduledTime: '2024-06-01T21:00:00Z',
          roomCode: '87654321',
          roomPassword: 'PRO2024',
          map: 'Purgatory',
          format: 'SQUAD'
        },
        {
          id: '3',
          tournamentId: '2',
          tournamentName: 'Weekly Clash Cup',
          matchNumber: 1,
          stage: 'FINALS',
          status: 'ONGOING',
          scheduledTime: '2024-05-28T19:00:00Z',
          roomCode: '55555555',
          roomPassword: 'CLASH123',
          map: 'Kalahari',
          format: 'CLASH_SQUAD'
        },
        {
          id: '4',
          tournamentId: '3',
          tournamentName: 'Solo Championship',
          matchNumber: 5,
          stage: 'FINALS',
          status: 'COMPLETED',
          scheduledTime: '2024-05-20T18:00:00Z',
          map: 'Bermuda',
          format: 'SOLO'
        },
        {
          id: '5',
          tournamentId: '1',
          tournamentName: 'FF Pro League Season 1',
          matchNumber: 3,
          stage: 'QUALIFIER',
          status: 'SCHEDULED',
          scheduledTime: '2024-06-01T22:00:00Z',
          roomCode: '99999999',
          roomPassword: 'PRO2024',
          map: 'Kalahari',
          format: 'SQUAD'
        }
      ];
      setMatches(dummyMatches);
    } catch (err) {
      console.error('Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  const toggleRoomDetails = (matchId: string) => {
    setShowRoomDetails(prev => ({
      ...prev,
      [matchId]: !prev[matchId]
    }));
  };

  const filteredMatches = matches.filter(m => {
    if (filter === 'ALL') return true;
    return m.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'ONGOING': return 'bg-red-500/20 text-red-400 border-red-500/30';
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

  const getTimeUntilMatch = (scheduledTime: string) => {
    const now = new Date();
    const scheduled = new Date(scheduledTime);
    const diff = scheduled.getTime() - now.getTime();
    
    if (diff < 0) return 'Started';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
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
            Match Schedule
          </h1>
          <p className="text-gray-400">View your upcoming and completed matches</p>
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
              <option value="ALL">All Matches</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="ONGOING">Live</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </Card>

        {filteredMatches.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No matches found</h3>
            <p className="text-gray-500 mb-4">You don't have any scheduled matches yet</p>
            <Button onClick={() => router.push('/user/tournaments')}>
              Join a Tournament
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <Card key={match.id} className="p-6 hover:scale-[1.01] transition-transform duration-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(match.status)}`}>
                        {match.status === 'ONGOING' && <Flame className="inline h-3 w-3 mr-1 animate-pulse" />}
                        {match.status}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border-purple-500/30">
                        {match.stage}
                      </span>
                      <span className="text-sm text-gray-400">{getFormatLabel(match.format)}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">{match.tournamentName}</h3>
                    <div className="text-sm text-gray-400 mb-4">Match #{match.matchNumber}</div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="h-4 w-4" />
                        {new Date(match.scheduledTime).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="h-4 w-4" />
                        {new Date(match.scheduledTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MapPin className="h-4 w-4" />
                        {match.map}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {match.status === 'SCHEDULED' ? (
                          <span className="text-blue-400 font-semibold">
                            {getTimeUntilMatch(match.scheduledTime)}
                          </span>
                        ) : match.status === 'ONGOING' ? (
                          <span className="text-red-400 font-semibold animate-pulse">LIVE NOW</span>
                        ) : (
                          <span className="text-gray-400">Completed</span>
                        )}
                      </div>
                    </div>

                    {match.status === 'ONGOING' && match.roomCode && (
                      <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-lg">
                        <div className="flex items-center gap-2 text-red-400 mb-3">
                          <Flame className="h-4 w-4 animate-pulse" />
                          <span className="font-semibold">Match is Live!</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Room ID:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-lg">
                                {showRoomDetails[match.id] ? match.roomCode : '••••••••'}
                              </span>
                              <button
                                onClick={() => toggleRoomDetails(match.id)}
                                className="text-gray-400 hover:text-white"
                              >
                                {showRoomDetails[match.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                          {match.roomPassword && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">Password:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-lg">
                                  {showRoomDetails[match.id] ? match.roomPassword : '••••••••'}
                                </span>
                                <button
                                  onClick={() => toggleRoomDetails(match.id)}
                                  className="text-gray-400 hover:text-white"
                                >
                                  {showRoomDetails[match.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {match.status === 'SCHEDULED' && (
                      <div className="bg-blue-500/20 border border-blue-500/30 p-4 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-400 mb-2">
                          <Clock className="h-4 w-4" />
                          <span className="font-semibold">
                            Starts in {getTimeUntilMatch(match.scheduledTime)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">
                          Room details will be available 15 minutes before match
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 min-w-[200px]">
                    {match.status === 'COMPLETED' ? (
                      <Button variant="outline" className="w-full">
                        <Trophy className="h-4 w-4 mr-2" />
                        View Results
                      </Button>
                    ) : match.status === 'ONGOING' ? (
                      <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
                        <Gamepad2 className="h-4 w-4 mr-2" />
                        Join Match
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full">
                        <Calendar className="h-4 w-4 mr-2" />
                        Set Reminder
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => router.push(`/user/tournaments/${match.tournamentId}`)}
                    >
                      View Tournament
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
