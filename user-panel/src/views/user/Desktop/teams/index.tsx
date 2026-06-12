import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Check, Plus, Search, Settings, UserPlus, Users, X } from 'lucide-react';
import Button from '@/views/user/Desktop/_components/Button';
import Card from '@/views/user/Desktop/_components/Card';
import Input from '@/views/user/Desktop/_components/Input';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';

interface Team {
  id: string;
  name: string;
  captain: string | { ign?: string; name?: string };
  players: number | unknown[];
  totalPoints: number;
  wins: number;
  logo?: string;
  maxPlayers: number;
  game?: { name: string };
}

interface TeamInvitation {
  id: string;
  team: {
    id: string;
    name: string;
    tag?: string;
    captain?: string | { ign?: string; name?: string };
    game?: { name: string };
  };
}

const getCaptainName = (captain: Team['captain']) =>
  typeof captain === 'string' ? captain : captain?.ign || captain?.name || '';

const getPlayerCount = (players: Team['players']) =>
  Array.isArray(players) ? players.length : players;

export default function Teams() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [teams, setTeams] = useState<Team[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTeam, setNewTeam] = useState({ name: '', tag: '', gameId: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/user/login');
      return;
    }
    fetchTeams();
  }, [user]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const [teamsResponse, invitationsResponse, gamesResponse] = await Promise.all([
        api.get('/teams'),
        api.get('/teams/invitations/mine'),
        api.get('/games'),
      ]);
      setTeams(teamsResponse.data);
      setInvitations(invitationsResponse.data);
      setGames(gamesResponse.data || []);
    } catch (err) {
      console.error('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const handleInvitation = async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      setError('');
      await api.put(`/teams/invitations/${id}`, { status });
      await fetchTeams();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update invitation');
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/teams', newTeam);
      setShowCreateModal(false);
      setNewTeam({ name: '', tag: '', gameId: '' });
      fetchTeams();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create team');
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getCaptainName(team.captain).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-xl text-white">Loading teams...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Teams - FF Tournament</title>
      </Head>
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Teams</h1>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Create Team
            </Button>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {invitations.length > 0 && (
            <Card className="p-6 mb-6 border-primary-500/40">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary-400" />
                Pending Team Invitations
              </h2>
              <div className="space-y-3">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="flex flex-col gap-3 rounded-lg bg-gray-800 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-semibold text-white">{invitation.team.name}</div>
                      <div className="text-sm text-gray-400">
                        {invitation.team.tag ? `${invitation.team.tag} · ` : ''}
                        Captain: {getCaptainName(invitation.team.captain || '')}
                        {invitation.team.game?.name ? ` · ${invitation.team.game.name}` : ''}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleInvitation(invitation.id, 'ACCEPTED')}>
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleInvitation(invitation.id, 'REJECTED')}>
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search teams..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <Card key={team.id} className="p-6 hover:border-primary-500 transition cursor-pointer">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mr-4">
                    <Users className="h-8 w-8 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{team.name}</h3>
                    <p className="text-xs font-semibold text-primary-400">{team.game?.name || 'Free Fire'}</p>
                    <p className="text-sm text-gray-400">Captain: {getCaptainName(team.captain)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-500">{getPlayerCount(team.players)}</p>
                    <p className="text-xs text-gray-400">Players</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-500">{team.wins}</p>
                    <p className="text-xs text-gray-400">Wins</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-500">{team.totalPoints}</p>
                    <p className="text-xs text-gray-400">Points</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" className="flex-1" onClick={() => router.push(`/user/teams/${team.id}`)}>
                    <Users className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  {getCaptainName(team.captain) === user?.ign && (
                    <Button variant="outline" onClick={() => router.push('/user/teams/manage')}>
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {filteredTeams.length === 0 && (
            <Card className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No teams found</h3>
              <p className="text-gray-500">Create a team or search for existing teams</p>
            </Card>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create Team</h2>
              <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                <Plus className="h-4 w-4 rotate-45" />
              </Button>
            </div>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <select value={newTeam.gameId} onChange={(e) => setNewTeam({ ...newTeam, gameId: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3" required><option value="">Select game</option>{games.map((game) => <option value={game.id} key={game.id}>{game.name}</option>)}</select>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Team Name</label>
                <Input
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  required
                  placeholder="Enter team name"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Team Tag (3-4 characters)</label>
                <Input
                  value={newTeam.tag}
                  onChange={(e) => setNewTeam({ ...newTeam, tag: e.target.value })}
                  required
                  maxLength={4}
                  placeholder="e.g., ELT"
                  className="w-full"
                />
              </div>
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
              <Button type="submit" className="w-full">
                Create Team
              </Button>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
