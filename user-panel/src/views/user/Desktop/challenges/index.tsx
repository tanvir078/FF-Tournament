import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import Card from '@/views/user/Desktop/_components/Card';
import Button from '@/views/user/Desktop/_components/Button';
import {
  Trophy,
  X,
  Check,
  Clock,
  Users,
  Swords,
  Shield,
  RefreshCw,
  AlertTriangle,
  Zap,
} from 'lucide-react';

interface Challenge {
  id: string;
  challengerTeamId: string;
  challengedTeamId: string;
  matchId: string;
  message?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  format: string;
  entryFee: number;
  prizePool: number;
  createdAt: string;
  challengedTeam?: { name: string };
  challengerTeam?: { name: string };
}

export default function TeamChallenges() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [pendingChallenges, setPendingChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [myTeam, setMyTeam] = useState<any>(null);
  const [availableTeams, setAvailableTeams] = useState<any[]>([]);
  const [createForm, setCreateForm] = useState({
    challengedTeamId: '',
    format: 'SQUAD',
    entryFee: 0,
    prizePool: 0,
    message: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/user/login');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [challengesRes, pendingRes, teamRes, teamsRes] = await Promise.all([
        api.get('/team-challenges/my-challenges'),
        api.get('/team-challenges/pending'),
        api.get('/teams/my-team'),
        api.get('/teams'),
      ]);
      setChallenges(challengesRes.data || []);
      setPendingChallenges(pendingRes.data || []);
      setMyTeam(teamRes.data);
      setAvailableTeams((teamsRes.data || []).filter((team: any) => team.id !== teamRes.data?.id));
    } catch (err) {
      console.error('Failed to fetch challenges', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!myTeam) {
      setError('You need a team to issue challenges');
      return;
    }

    try {
      await api.post('/team-challenges', createForm);
      setShowCreateModal(false);
      setCreateForm({ challengedTeamId: '', format: 'SQUAD', entryFee: 0, prizePool: 0, message: '' });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create challenge');
    }
  };

  const handleAccept = async (challengeId: string) => {
    try {
      await api.post(`/team-challenges/${challengeId}/accept`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to accept challenge');
    }
  };

  const handleReject = async (challengeId: string) => {
    const reason = prompt('Rejection reason (optional):');
    try {
      await api.post(`/team-challenges/${challengeId}/reject`, { reason });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject challenge');
    }
  };

  const handleCancel = async (challengeId: string) => {
    if (!confirm('Are you sure you want to cancel this challenge?')) return;
    try {
      await api.post(`/team-challenges/${challengeId}/cancel`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel challenge');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'ACCEPTED':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'REJECTED':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'CANCELLED':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
      case 'COMPLETED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'DUO': return 'Duo';
      case 'SQUAD': return 'Squad';
      case 'CLASH_SQUAD': return 'Clash Squad';
      default: return format;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Head>
        <title>Team Challenges - FF Tournament</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Team Challenges</h1>
            <p className="text-gray-400">Challenge other teams to head-to-head matches</p>
          </div>
          {myTeam && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Swords className="h-4 w-4 mr-2" />
              Issue Challenge
            </Button>
          )}
        </div>

        {!myTeam && (
          <Card className="p-6 mb-6 border-yellow-500/30 bg-yellow-500/5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <p className="text-yellow-400">
                You need to create or join a team before issuing challenges.
                <Button variant="ghost" size="sm" onClick={() => router.push('/user/teams/manage')} className="ml-2">
                  Create Team
                </Button>
              </p>
            </div>
          </Card>
        )}

        {pendingChallenges.length > 0 && activeTab === 'all' && (
          <Card className="p-6 mb-6 border-yellow-500/30 bg-yellow-500/5">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-400" />
              Pending Challenges ({pendingChallenges.length})
            </h2>
            <div className="space-y-3">
              {pendingChallenges.map((challenge) => (
                <div key={challenge.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <div className="flex-1">
                    <div className="font-medium">
                      {challenge.challengerTeam?.name || 'Unknown Team'} challenged your team
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {getFormatLabel(challenge.format)} • Entry: ৳{challenge.entryFee} • Prize: ৳{challenge.prizePool}
                    </div>
                    {challenge.message && (
                      <div className="text-xs text-gray-400 mt-1 italic">"{challenge.message}"</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleAccept(challenge.id)}>
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleReject(challenge.id)}>
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            All Challenges
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'pending'
                ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Pending
            {pendingChallenges.length > 0 && (
              <span className="ml-2 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded-full">
                {pendingChallenges.length}
              </span>
            )}
          </button>
        </div>

        {(activeTab === 'all' ? challenges : pendingChallenges).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(activeTab === 'all' ? challenges : pendingChallenges).map((challenge) => (
              <Card key={challenge.id} className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBadge(challenge.status)}`}>
                    {challenge.status}
                  </span>
                  {challenge.status === 'PENDING' && activeTab === 'all' && challenge.challengerTeamId === myTeam?.id && (
                    <Button size="sm" variant="secondary" onClick={() => handleCancel(challenge.id)}>
                      Cancel
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 text-center">
                    <div className="text-xs text-gray-500 mb-1">Challenger</div>
                    <div className="font-medium text-sm">{challenge.challengerTeam?.name || 'TBD'}</div>
                  </div>
                  <div className="text-lg font-bold text-primary-400">VS</div>
                  <div className="flex-1 text-center">
                    <div className="text-xs text-gray-500 mb-1">Challenged</div>
                    <div className="font-medium text-sm">{challenge.challengedTeam?.name || 'TBD'}</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Format</span>
                    <span>{getFormatLabel(challenge.format)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Entry Fee</span>
                    <span className="text-green-400">৳{challenge.entryFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Prize Pool</span>
                    <span className="text-yellow-400">৳{challenge.prizePool}</span>
                  </div>
                  {challenge.message && (
                    <div className="text-xs text-gray-500 italic mt-2">"{challenge.message}"</div>
                  )}
                </div>

                {challenge.status === 'ACCEPTED' && (
                  <Button
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => router.push(`/user/matches`)}
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    View Match
                  </Button>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Swords className="h-16 w-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No challenges yet</h3>
            <p className="text-gray-500 mb-4">
              {activeTab === 'pending'
                ? 'No pending challenges for your team'
                : 'Start by issuing a challenge to another team'}
            </p>
            {myTeam && activeTab === 'all' && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Swords className="h-4 w-4 mr-2" />
                Issue First Challenge
              </Button>
            )}
          </Card>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Issue Challenge</h2>
              <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Challenged Team</label>
                <select
                  value={createForm.challengedTeamId}
                  onChange={(e) => setCreateForm({ ...createForm, challengedTeamId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select a team</option>
                  {availableTeams.map((team) => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Format</label>
                <select
                  value={createForm.format}
                  onChange={(e) => setCreateForm({ ...createForm, format: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="DUO">Duo</option>
                  <option value="SQUAD">Squad</option>
                  <option value="CLASH_SQUAD">Clash Squad</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Entry Fee (৳)</label>
                <input
                  type="number"
                  value={createForm.entryFee}
                  onChange={(e) => setCreateForm({ ...createForm, entryFee: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0 for friendly match"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Prize Pool (৳)</label>
                <input
                  type="number"
                  value={createForm.prizePool}
                  onChange={(e) => setCreateForm({ ...createForm, prizePool: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Optional prize amount"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Message (optional)</label>
                <textarea
                  value={createForm.message}
                  onChange={(e) => setCreateForm({ ...createForm, message: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Challenge message..."
                  rows={2}
                />
              </div>
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
              <Button type="submit" className="w-full">
                <Zap className="h-4 w-4 mr-2" />
                Send Challenge
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
