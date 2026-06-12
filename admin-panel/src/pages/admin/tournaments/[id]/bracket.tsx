import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TournamentWorkspaceTabs from '@/components/tournaments/TournamentWorkspaceTabs';
import {
  Trophy,
  Users,
  Swords,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Crown,
  Medal,
  Star,
} from 'lucide-react';

interface BracketMatch {
  id: string;
  matchNumber: number;
  stage: string;
  status: string;
  scheduledTime: string;
  roomId?: string;
  roomPassword?: string;
  map?: string;
  slots: Array<{
    slotNumber: number;
    teamId: string;
    teamName: string;
  }>;
  results?: Array<{
    teamId: string;
    placement: number;
  }>;
}

interface Bracket {
  tournamentId: string;
  tournamentName: string;
  bracketSize: number;
  stages: string[];
  totalTeams: number;
  matches: BracketMatch[];
}

type BracketStage = 'QUALIFIER' | 'ROUND_2' | 'ROUND_3' | 'SEMI_FINAL' | 'FINAL';

const stageOrder: BracketStage[] = ['QUALIFIER', 'ROUND_2', 'ROUND_3', 'SEMI_FINAL', 'FINAL'];

export default function BracketPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuthStore();
  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<BracketMatch | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [roomForm, setRoomForm] = useState({ roomId: '', roomPassword: '', status: 'SCHEDULED' });

  useEffect(() => {
    if (!id || !user) return;
    fetchBracket();
  }, [id, user]);

  const fetchBracket = async () => {
    try {
      setLoading(true);
      const [matchesRes, tournamentRes] = await Promise.all([
        api.get(`/matches/by-tournament/${id}`),
        api.get(`/tournaments/${id}`),
      ]);
      const matches: BracketMatch[] = matchesRes.data || [];
      const stages = Array.from(
        new Set(matches.map((m: BracketMatch) => m.stage).filter(Boolean))
      ).sort((a, b) => stageOrder.indexOf(a as BracketStage) - stageOrder.indexOf(b as BracketStage)) as BracketStage[];

      setBracket({
        tournamentId: id as string,
        tournamentName: tournamentRes.data?.title || 'Tournament',
        bracketSize: matches.length > 0 ? Math.pow(2, Math.ceil(Math.log2(matches.length * 2))) : 2,
        stages,
        totalTeams: tournamentRes.data?.maxTeams || 0,
        matches,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load bracket');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBracket = async () => {
    try {
      setSubmitting(true);
      setError('');
      await api.post(`/tournaments/${id}/bracket/generate`);
      await fetchBracket();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate bracket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectWinner = async (teamId: string) => {
    if (!selectedMatch) return;
    try {
      setSubmitting(true);
      setError('');
      await api.post(`/matches/${selectedMatch.id}/winner`, { winnerTeamId: teamId });
      setSelectedMatch(null);
      await fetchBracket();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record winner');
    } finally {
      setSubmitting(false);
    }
  };

  const openMatch = (match: BracketMatch) => {
    setSelectedMatch(match);
    setRoomForm({
      roomId: match.roomId || '',
      roomPassword: match.roomPassword || '',
      status: match.status || 'SCHEDULED',
    });
  };

  const handleSaveMatchControl = async () => {
    if (!selectedMatch) return;
    try {
      setSubmitting(true);
      setError('');
      await api.patch(`/matches/${selectedMatch.id}`, roomForm);
      await fetchBracket();
      setSelectedMatch((current) => current ? { ...current, ...roomForm } : current);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update match control');
    } finally {
      setSubmitting(false);
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'QUALIFIER': return 'Round 1';
      case 'ROUND_2': return 'Round 2';
      case 'ROUND_3': return 'Round 3';
      case 'SEMI_FINAL': return 'Semi Final';
      case 'FINAL': return 'Grand Final';
      default: return stage;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'QUALIFIER': return 'border-gray-600 bg-gray-800/50';
      case 'ROUND_2': return 'border-blue-600/50 bg-blue-900/20';
      case 'ROUND_3': return 'border-cyan-600/50 bg-cyan-900/20';
      case 'SEMI_FINAL': return 'border-purple-600/50 bg-purple-900/20';
      case 'FINAL': return 'border-yellow-500/50 bg-yellow-900/20';
      default: return 'border-gray-600 bg-gray-800/50';
    }
  };

  const getWinner = (match: BracketMatch) => {
    if (!match.results || match.results.length === 0) return null;
    return match.results.find(r => r.placement === 1);
  };

  const getLoser = (match: BracketMatch) => {
    if (!match.results || match.results.length === 0) return null;
    return match.results.find(r => r.placement === 2);
  };

  const getMatchWinner = (match: BracketMatch) => {
    const winner = getWinner(match);
    if (!winner) return null;
    const slot = match.slots.find(s => s.teamId === winner.teamId);
    return slot || null;
  };

  const getMatchLoser = (match: BracketMatch) => {
    const loser = getLoser(match);
    if (!loser) return null;
    const slot = match.slots.find(s => s.teamId === loser.teamId);
    return slot || null;
  };

  const matchesByStage = (stage: string) =>
    bracket?.matches.filter(m => m.stage === stage) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!bracket) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Bracket Available</h2>
          <p className="text-gray-400 mb-4">The bracket hasn't been generated yet.</p>
          <Button onClick={() => router.push(`/admin/tournaments/${id}`)}>
            Back to Tournament
          </Button>
        </Card>
      </div>
    );
  }

  if (bracket.matches.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Bracket Empty</h2>
          <p className="text-gray-400 mb-4">No matches generated for this bracket.</p>
          {error && <p className="text-red-400 mb-4">{error}</p>}
          <Button onClick={handleGenerateBracket} disabled={submitting}>
            {submitting ? 'Generating...' : 'Generate Bracket'}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TournamentWorkspaceTabs tournamentId={String(id)} active="Bracket" />
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => router.push(`/admin/tournaments/${id}`)}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-2"
            >
              ← Back to Tournament
            </button>
            <h1 className="text-3xl font-bold">
              {bracket.tournamentName}
            </h1>
            <p className="text-gray-400">
              Bracket • {bracket.totalTeams} teams • {bracket.matches.length} matches
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowResults(!showResults);
              }}
            >
              {showResults ? 'Hide' : 'Show'} Results
            </Button>
          </div>
        </div>

        {/* Bracket Tree */}
        <div className="space-y-8">
          {bracket.stages.map((stage) => {
            const stageMatches = matchesByStage(stage);
            if (stageMatches.length === 0) return null;

            return (
              <div key={stage}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-bold">{getStageLabel(stage)}</h2>
                  <span className={`text-xs px-3 py-1 rounded-full border ${getStageColor(stage)}`}>
                    {stageMatches.length} matches
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stageMatches.map((match) => {
                    const winner = getMatchWinner(match);
                    const loser = getMatchLoser(match);
                    const isCompleted = match.status === 'COMPLETED';
                    const isScheduled = match.status === 'SCHEDULED';

                    return (
                      <Card
                        key={match.id}
                        className={`p-4 cursor-pointer transition-all hover:scale-[1.02] border-2 ${
                          selectedMatch?.id === match.id
                            ? 'border-primary-500 bg-primary-500/5'
                            : 'border-gray-800 hover:border-gray-700'
                        } ${getStageColor(stage)}`}
                        onClick={() => openMatch(match)}
                      >
                        <div className="text-xs text-gray-500 mb-3 flex items-center justify-between">
                          <span>Match #{match.matchNumber}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            isCompleted ? 'bg-green-500/20 text-green-400' :
                            isScheduled ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {match.status}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {/* Team 1 */}
                          <div className={`flex items-center justify-between p-2 rounded-lg ${
                            winner?.teamId === match.slots[0]?.teamId
                              ? 'bg-green-500/20 border border-green-500/30'
                              : 'bg-gray-800/50'
                          }`}>
                            <div className="flex items-center gap-2 min-w-0">
                              <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="text-sm font-medium truncate">
                                {match.slots[0]?.teamName || 'TBD'}
                              </span>
                            </div>
                            {winner?.teamId === match.slots[0]?.teamId && (
                              <Crown className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                            )}
                          </div>

                          {/* VS Divider */}
                          <div className="flex items-center justify-center">
                            <div className="px-3 py-1 bg-gray-800 rounded-full text-xs font-bold text-gray-400">
                              VS
                            </div>
                          </div>

                          {/* Team 2 */}
                          <div className={`flex items-center justify-between p-2 rounded-lg ${
                            winner?.teamId === match.slots[1]?.teamId
                              ? 'bg-green-500/20 border border-green-500/30'
                              : 'bg-gray-800/50'
                          }`}>
                            <div className="flex items-center gap-2 min-w-0">
                              <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="text-sm font-medium truncate">
                                {match.slots[1]?.teamName || 'TBD'}
                              </span>
                            </div>
                            {winner?.teamId === match.slots[1]?.teamId && (
                              <Crown className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                            )}
                          </div>
                        </div>

                        {/* Match Info */}
                        <div className="mt-3 pt-3 border-t border-gray-700/50">
                          <div className="text-xs text-gray-500">
                            {new Date(match.scheduledTime).toLocaleString()}
                          </div>
                          <div className="mt-1 text-xs text-blue-300">
                            Room: {match.roomId || 'Not assigned'}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Match Detail Modal */}
        {selectedMatch && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-6 max-w-lg w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">
                  Match #{selectedMatch.matchNumber}
                </h3>
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedMatch.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                    selectedMatch.status === 'SCHEDULED' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {selectedMatch.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {getStageLabel(selectedMatch.stage)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl ${
                    getMatchWinner(selectedMatch)?.teamId === selectedMatch.slots[0]?.teamId
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-gray-800'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-gray-400" />
                      <span className="font-medium">{selectedMatch.slots[0]?.teamName || 'TBD'}</span>
                    </div>
                    {getMatchWinner(selectedMatch)?.teamId === selectedMatch.slots[0]?.teamId && (
                      <div className="flex items-center gap-1 text-yellow-400 text-sm">
                        <Crown className="h-4 w-4" />
                        Winner
                      </div>
                    )}
                  </div>

                  <div className={`p-4 rounded-xl ${
                    getMatchWinner(selectedMatch)?.teamId === selectedMatch.slots[1]?.teamId
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-gray-800'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-gray-400" />
                      <span className="font-medium">{selectedMatch.slots[1]?.teamName || 'TBD'}</span>
                    </div>
                    {getMatchWinner(selectedMatch)?.teamId === selectedMatch.slots[1]?.teamId && (
                      <div className="flex items-center gap-1 text-yellow-400 text-sm">
                        <Crown className="h-4 w-4" />
                        Winner
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  Scheduled: {new Date(selectedMatch.scheduledTime).toLocaleString()}
                </div>

                <div className="rounded-xl bg-gray-800 p-4">
                  <h4 className="mb-3 font-semibold">Match Control</h4>
                  <div className="space-y-3">
                    <select
                      value={roomForm.status}
                      onChange={(event) => setRoomForm({ ...roomForm, status: event.target.value })}
                      className="w-full rounded bg-gray-900 px-3 py-3"
                    >
                      <option>SCHEDULED</option>
                      <option>IN_PROGRESS</option>
                      <option>COMPLETED</option>
                      <option>CANCELLED</option>
                    </select>
                    <Input value={roomForm.roomId} onChange={(event) => setRoomForm({ ...roomForm, roomId: event.target.value })} placeholder="Room / Lobby ID" />
                    <Input value={roomForm.roomPassword} onChange={(event) => setRoomForm({ ...roomForm, roomPassword: event.target.value })} placeholder="Password (optional)" />
                    <Button className="w-full" disabled={submitting} onClick={handleSaveMatchControl}>
                      {submitting ? 'Saving...' : 'Save Room & Status'}
                    </Button>
                  </div>
                </div>

                {selectedMatch.status === 'COMPLETED' && selectedMatch.results && (
                  <div className="bg-gray-800 p-4 rounded-xl">
                    <h4 className="font-semibold mb-2">Results</h4>
                    {selectedMatch.results.map((result) => {
                      const team = selectedMatch.slots.find(s => s.teamId === result.teamId);
                      return (
                        <div key={result.teamId} className="flex items-center justify-between py-2">
                          <span className="font-medium">{team?.teamName || 'Unknown'}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            result.placement === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                            result.placement === 2 ? 'bg-gray-500/20 text-gray-400' :
                            'bg-gray-700 text-gray-500'
                          }`}>
                            #{result.placement}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedMatch.status === 'SCHEDULED' && selectedMatch.slots.length === 2 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Select Winner</h4>
                    {selectedMatch.slots.map((slot) => (
                      <Button
                        key={slot.teamId}
                        className="w-full"
                        variant="outline"
                        disabled={submitting}
                        onClick={() => handleSelectWinner(slot.teamId)}
                      >
                        {slot.teamName}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
