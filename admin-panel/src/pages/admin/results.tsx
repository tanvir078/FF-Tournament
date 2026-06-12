import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  Trophy, Search, Filter, Eye, Save, Upload, Download, 
  CheckCircle, XCircle, Target, TrendingUp, Users, Gamepad2,
  Calendar, Crown, Medal, Award, MoreVertical, AlertCircle, Clock
} from 'lucide-react';

interface MatchResult {
  id: string;
  tournamentId: string;
  tournamentName: string;
  matchNumber: number;
  status: 'PENDING' | 'PUBLISHED';
  publishedAt?: string;
  createdAt: string;
}

interface ParticipantResult {
  participantId: string;
  userId: string;
  username: string;
  teamName?: string;
  position: number;
  kills: number;
  points: number;
  prize?: number;
}

export default function AdminResults() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [results, setResults] = useState<ParticipantResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [editingResults, setEditingResults] = useState<Record<string, { position: number; kills: number; points: number }>>({});

  useEffect(() => {
    if (!user || !['ADMIN', 'ORGANIZER'].includes(user.role)) {
      router.push('/admin/login');
      return;
    }
    fetchMatches();
  }, [user]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/matches');
      setMatches((data || []).map((match: any) => ({
        ...match,
        tournamentName: match.tournament?.title || 'Tournament',
        status: match.status === 'COMPLETED' ? 'PUBLISHED' : 'PENDING',
        createdAt: match.createdAt || match.scheduledTime,
      })));
    } catch (err) {
      console.error('Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchResults = async (matchId: string) => {
    try {
      const { data } = await api.get(`/matches/${matchId}`);
      const matchResults = (data.results || []).map((result: any) => ({
        participantId: result.participantId || result.teamId,
        userId: result.userId || result.teamId,
        username: result.username || result.teamName || result.teamId,
        teamName: result.teamName,
        position: result.position || result.placement || 0,
        kills: result.kills || 0,
        points: result.points || 0,
        prize: result.prize || 0,
      }));
      setResults(matchResults);
      setEditingResults(
        matchResults.reduce((acc: Record<string, { position: number; kills: number; points: number }>, r: ParticipantResult) => ({
          ...acc,
          [r.participantId]: { position: r.position, kills: r.kills, points: r.points }
        }), {})
      );
    } catch (err) {
      console.error('Failed to fetch results');
    }
  };

  const handlePublishResults = async () => {
    try {
      await api.patch(`/matches/${selectedMatch?.id}`, { results: Object.values(editingResults), status: 'COMPLETED' });
      setShowPublishModal(false);
      fetchMatches();
      alert('Results published successfully');
    } catch (err) {
      console.error('Failed to publish results');
    }
  };

  const handleUpdateResult = (participantId: string, field: 'position' | 'kills' | 'points', value: number) => {
    setEditingResults(prev => ({
      ...prev,
      [participantId]: { ...prev[participantId], [field]: value }
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredMatches = matches.filter(match => {
    const matchesSearch = 
      match.tournamentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || match.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <div className="text-xl">Loading Results...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Results & Leaderboard
          </h1>
          <p className="text-gray-400">Publish match results and manage tournament leaderboards</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Clock className="h-4 w-4" />
              Pending Results
            </div>
            <div className="text-3xl font-bold text-yellow-400">
              {matches.filter(m => m.status === 'PENDING').length}
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <CheckCircle className="h-4 w-4" />
              Published
            </div>
            <div className="text-3xl font-bold text-green-400">
              {matches.filter(m => m.status === 'PUBLISHED').length}
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Trophy className="h-4 w-4" />
              Total Matches
            </div>
            <div className="text-3xl font-bold text-blue-400">{matches.length}</div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Users className="h-4 w-4" />
              Total Results
            </div>
            <div className="text-3xl font-bold text-purple-400">{matches.filter((match) => match.status === 'PUBLISHED').length}</div>
          </Card>
        </div>

        {!selectedMatch ? (
          <>
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
                    <option value="PENDING">Pending</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
              </div>
            </Card>

            {filteredMatches.length === 0 ? (
              <Card className="p-12 text-center">
                <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No matches found</h3>
                <p className="text-gray-500">Adjust your filters to see more results</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredMatches.map((match) => (
                  <Card key={match.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-400/10 rounded-lg">
                          <Trophy className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold">{match.tournamentName}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(match.status)}`}>
                              {match.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400">
                            Match #{match.matchNumber} • {new Date(match.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedMatch(match);
                            fetchMatchResults(match.id);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Results
                        </Button>
                        {match.status === 'PENDING' && (
                          <Button
                            onClick={() => {
                              setSelectedMatch(match);
                              fetchMatchResults(match.id);
                              setShowPublishModal(true);
                            }}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Publish
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedMatch(null);
                      setResults([]);
                    }}
                  >
                    ← Back
                  </Button>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedMatch.tournamentName}</h2>
                    <p className="text-gray-400">Match #{selectedMatch.matchNumber}</p>
                  </div>
                </div>
                {selectedMatch.status === 'PUBLISHED' && (
                  <Button
                    variant="outline"
                    onClick={() => setShowPublishModal(true)}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Update Results
                  </Button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Position</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Player/Team</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Kills</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Points</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Prize</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {results.map((result, index) => (
                      <tr key={result.participantId} className="hover:bg-gray-800">
                        <td className="px-4 py-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-yellow-500 text-black' :
                            index === 1 ? 'bg-gray-400 text-black' :
                            index === 2 ? 'bg-orange-500 text-white' :
                            'bg-gray-700 text-gray-300'
                          }`}>
                            {index === 0 && <Crown className="h-5 w-5" />}
                            {index === 1 && <Medal className="h-5 w-5" />}
                            {index === 2 && <Medal className="h-5 w-5" />}
                            {index > 2 && `#${result.position}`}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-semibold">{result.username}</div>
                          {result.teamName && (
                            <div className="text-sm text-gray-400">{result.teamName}</div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <Input
                            type="number"
                            value={editingResults[result.participantId]?.kills || result.kills}
                            onChange={(e) => handleUpdateResult(result.participantId, 'kills', parseInt(e.target.value))}
                            className="w-24"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <Input
                            type="number"
                            value={editingResults[result.participantId]?.points || result.points}
                            onChange={(e) => handleUpdateResult(result.participantId, 'points', parseInt(e.target.value))}
                            className="w-24"
                          />
                        </td>
                        <td className="px-4 py-4">
                          {result.prize ? `৳${result.prize}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {showPublishModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Publish Results</h2>
                <Button variant="outline" size="sm" onClick={() => setShowPublishModal(false)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="bg-yellow-500/20 border border-yellow-500/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-400 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-semibold">Confirm Publication</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-2">
                    This will publish the results and update the leaderboard. This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={handlePublishResults}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Publish Results
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPublishModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
