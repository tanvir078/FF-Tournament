import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Users, Trophy, Target, Calendar, UserPlus, ArrowLeft, Settings } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';

interface Player {
  id: string;
  ign: string;
  role: string;
  kills: number;
  wins: number;
  points: number;
}

interface Team {
  id: string;
  name: string;
  tag: string;
  captain: string;
  players: Player[];
  totalPoints: number;
  totalWins: number;
  totalKills: number;
  maxPlayers: number;
  createdAt: string;
}

export default function TeamDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuthStore();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteIgn, setInviteIgn] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchTeam();
    }
  }, [id]);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/teams/${id}`);
      setTeam(response.data);
    } catch (err) {
      console.error('Failed to fetch team');
      router.push('/user/teams');
    } finally {
      setLoading(false);
    }
  };

  const handleInvitePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/teams/${id}/invite`, { ign: inviteIgn });
      setShowInviteModal(false);
      setInviteIgn('');
      fetchTeam();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to invite player');
    }
  };

  const handleLeaveTeam = async () => {
    if (!confirm('Are you sure you want to leave this team?')) return;
    try {
      await api.post(`/teams/${id}/leave`);
      router.push('/user/teams');
    } catch (err) {
      console.error('Failed to leave team');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-xl text-white">Loading team...</div>
        </div>
      </>
    );
  }

  if (!team) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-xl text-white">Team not found</div>
        </div>
      </>
    );
  }

  const isCaptain = team.captain === user?.ign;
  const isMember = team.players.some(p => p.ign === user?.ign);

  return (
    <>
      <Head>
        <title>{team.name} - FF Tournament</title>
      </Head>
      <Navbar />
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="outline" onClick={() => router.push('/user/teams')} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Teams
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{team.name}</h1>
                    <p className="text-gray-400">Tag: [{team.tag}]</p>
                  </div>
                  {isCaptain && (
                    <Button variant="outline" onClick={() => router.push(`/user/teams/${id}/manage`)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <Trophy className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{team.totalWins}</p>
                    <p className="text-sm text-gray-400">Total Wins</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <Target className="h-6 w-6 text-red-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{team.totalKills}</p>
                    <p className="text-sm text-gray-400">Total Kills</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <Trophy className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{team.totalPoints}</p>
                    <p className="text-sm text-gray-400">Total Points</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>Created: {new Date(team.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{team.players.length}/{team.maxPlayers} Players</span>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Team Members</h2>
                  {isCaptain && team.players.length < team.maxPlayers && (
                    <Button size="sm" onClick={() => setShowInviteModal(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Player
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  {team.players.map((player) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        player.ign === team.captain ? 'bg-blue-900/20 border border-blue-500/30' : 'bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{player.ign}</p>
                          <p className="text-sm text-gray-400">
                            {player.ign === team.captain ? 'Captain' : player.role}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-6 text-center">
                        <div>
                          <p className="font-bold text-white">{player.kills}</p>
                          <p className="text-xs text-gray-400">Kills</p>
                        </div>
                        <div>
                          <p className="font-bold text-white">{player.wins}</p>
                          <p className="text-xs text-gray-400">Wins</p>
                        </div>
                        <div>
                          <p className="font-bold text-white">{player.points}</p>
                          <p className="text-xs text-gray-400">Points</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {isMember && !isCaptain && (
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <Button variant="outline" onClick={handleLeaveTeam} className="w-full">
                      Leave Team
                    </Button>
                  </div>
                )}
              </Card>
            </div>

            <div>
              <Card className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Team Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Win Rate</span>
                    <span className="text-white font-semibold">
                      {team.totalWins > 0 ? Math.round((team.totalWins / Math.max(team.totalWins, 1)) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Kills/Match</span>
                    <span className="text-white font-semibold">
                      {team.totalWins > 0 ? (team.totalKills / team.totalWins).toFixed(1) : '0.0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Points/Match</span>
                    <span className="text-white font-semibold">
                      {team.totalWins > 0 ? (team.totalPoints / team.totalWins).toFixed(0) : '0'}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Invite Player</h2>
              <Button variant="outline" size="sm" onClick={() => setShowInviteModal(false)}>
                <ArrowLeft className="h-4 w-4 rotate-45" />
              </Button>
            </div>
            <form onSubmit={handleInvitePlayer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Player IGN</label>
                <input
                  type="text"
                  value={inviteIgn}
                  onChange={(e) => setInviteIgn(e.target.value)}
                  required
                  placeholder="Enter player's in-game name"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
              <Button type="submit" className="w-full">
                Send Invitation
              </Button>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
