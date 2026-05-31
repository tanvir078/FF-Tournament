import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Navbar from '@/components/layout/Navbar';
import { 
  Users, Plus, UserPlus, Trash2, Shield, Gamepad2, 
  Crown, Mail, Edit, X, Check, Copy, Share2, ArrowLeft
} from 'lucide-react';

interface Player {
  id: string;
  ign: string;
  role: 'captain' | 'member';
  kills: number;
  wins: number;
  points: number;
  joinedAt: string;
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

export default function TeamManagement() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteIgn, setInviteIgn] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/user/login');
      return;
    }
    fetchUserTeam();
  }, [user]);

  const fetchUserTeam = async () => {
    try {
      setLoading(true);
      const response = await api.get('/teams/my-team');
      setTeam(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setTeam(null);
      } else {
        setError('Failed to load team');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInvitePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/teams/${team?.id}/invite`, { ign: inviteIgn });
      setInviteIgn('');
      setShowInviteModal(false);
      fetchUserTeam();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send invitation');
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    if (!confirm('Are you sure you want to remove this player?')) return;
    
    try {
      await api.delete(`/teams/${team?.id}/players/${playerId}`);
      fetchUserTeam();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove player');
    }
  };

  const handleCopyInviteCode = () => {
    const inviteCode = `JOIN-${team?.tag}-${team?.id}`;
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="text-xl">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button variant="outline" onClick={() => router.push('/user/teams')} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Teams
            </Button>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Team Management
            </h1>
            <p className="text-gray-400">Manage your squad for tournaments</p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {!team ? (
            <Card className="p-8">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl">
                    <Users className="h-16 w-16 text-blue-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2">You don't have a team yet</h2>
                <p className="text-gray-400">Create a team to participate in tournaments</p>
              </div>
              <div className="max-w-md mx-auto">
                <Button 
                  onClick={() => router.push('/user/teams')} 
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="h-5 w-5" />
                  Create Team
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Gamepad2 className="h-10 w-10 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-2xl font-bold">{team.name}</h2>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold">
                            {team.tag}
                          </span>
                        </div>
                        <p className="text-gray-400">{team.players.length}/{team.maxPlayers} Members</p>
                      </div>
                    </div>
                    {team.captain === user?.ign && (
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Crown className="h-4 w-4" />
                        Wins
                      </div>
                      <div className="text-2xl font-bold text-green-400">{team.totalWins}</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Users className="h-4 w-4" />
                        Kills
                      </div>
                      <div className="text-2xl font-bold">{team.totalKills}</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Shield className="h-4 w-4" />
                        Points
                      </div>
                      <div className="text-2xl font-bold text-yellow-400">{team.totalPoints}</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Gamepad2 className="h-4 w-4" />
                        Players
                      </div>
                      <div className="text-2xl font-bold">{team.players.length}</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Team Members
                    </h3>
                    {team.captain === user?.ign && team.players.length < team.maxPlayers && (
                      <Button size="sm" onClick={() => setShowInviteModal(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {team.players.map((player) => (
                      <div key={player.id} className={`flex items-center justify-between p-4 rounded-lg ${
                        player.ign === team.captain ? 'bg-blue-900/20 border border-blue-500/30' : 'bg-gray-800'
                      }`}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-lg font-bold">
                            {player.ign?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{player.ign}</span>
                              {player.ign === team.captain && (
                                <Crown className="h-4 w-4 text-yellow-400" />
                              )}
                            </div>
                            <div className="text-sm text-gray-400">
                              {player.kills} kills • {player.wins} wins • {player.points} pts
                            </div>
                          </div>
                        </div>
                        {team.captain === user?.ign && player.ign !== team.captain && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemovePlayer(player.id)}
                            className="text-red-400 border-red-400 hover:bg-red-400/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Invite Players
                  </h3>
                  
                  <div className="border-t border-gray-700 pt-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      Share Invite Code
                    </h4>
                    <div className="bg-gray-800 p-3 rounded-lg mb-3">
                      <code className="text-sm text-blue-400">JOIN-{team.tag}-{team.id}</code>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center gap-2"
                      onClick={handleCopyInviteCode}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy Code'}
                    </Button>
                  </div>
                </Card>

                {team.captain === user?.ign && (
                  <Card className="p-6">
                    <h3 className="text-xl font-bold mb-4">Team Settings</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                        <Edit className="h-4 w-4" />
                        Edit Team Details
                      </Button>
                      <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                        <Shield className="h-4 w-4" />
                        Transfer Captain
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center justify-center gap-2 text-red-400 border-red-400 hover:bg-red-400/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        Disband Team
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}

          {showInviteModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Invite Player</h2>
                  <Button variant="outline" size="sm" onClick={() => setShowInviteModal(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <form onSubmit={handleInvitePlayer} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Player IGN</label>
                    <Input
                      value={inviteIgn}
                      onChange={(e) => setInviteIgn(e.target.value)}
                      required
                      placeholder="Enter player's in-game name"
                      className="w-full"
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
        </div>
      </div>
    </>
  );
}
