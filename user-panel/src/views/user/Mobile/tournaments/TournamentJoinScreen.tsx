import Head from 'next/head';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { AlertCircle, Check, ChevronLeft, ShieldCheck, Users, Wallet } from 'lucide-react';
import api from '@/lib/api';
import Button from '@/views/user/Mobile/_components/Button';
import Card from '@/views/user/Mobile/_components/Card';
import { useAuthStore } from '@/store/auth';
import { isFreeTournament, isTournamentFull, isTournamentJoinable, normalizeTournament } from '@/views/user/Mobile/_components/tournaments';

export default function TournamentJoinPage() {
  const router = useRouter();
  const { id } = router.query;
  const user = useAuthStore((state) => state.user);
  const [tournament, setTournament] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [team, setTeam] = useState<any>(null);
  const [profileId, setProfileId] = useState('');
  const [legacyUid, setLegacyUid] = useState('');
  const [starters, setStarters] = useState<string[]>([]);
  const [substitutes, setSubstitutes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id || !user) return;
    Promise.allSettled([
      api.get(`/tournaments/${id}`),
      api.get('/wallet/user'),
      api.get('/game-profiles/mine'),
      api.get(`/tournaments/${id}/registration-status`),
    ]).then(async ([tournamentResponse, walletResponse, profilesResponse, registrationResponse]) => {
      if (tournamentResponse.status !== 'fulfilled') throw tournamentResponse.reason;

      if (registrationResponse.status === 'fulfilled' && registrationResponse.value.data.isRegistered) {
        await router.replace(`/user/tournaments/${id}`);
        return;
      }

      const selectedTournament: any = normalizeTournament(tournamentResponse.value.data);
      const nextRosterSize = Number(selectedTournament?.gameMode?.rosterSize || (selectedTournament?.format === 'SOLO' ? 1 : selectedTournament?.format === 'DUO' ? 2 : 4));
      setTournament(selectedTournament);
      setWalletBalance(walletResponse.status === 'fulfilled' ? Number(walletResponse.value.data.totalBalance || 0) : 0);

      const rawProfiles = profilesResponse.status === 'fulfilled' && Array.isArray(profilesResponse.value.data) ? profilesResponse.value.data : [];
      const relevantProfiles = rawProfiles.filter((profile: any) => {
        const tournamentGame = selectedTournament.gameId || selectedTournament.game?.id;
        return !tournamentGame || profile.gameId === tournamentGame || profile.game?.id === tournamentGame;
      });
      setProfiles(relevantProfiles);
      if (relevantProfiles.length === 1) setProfileId(relevantProfiles[0].id);
      if (nextRosterSize > 1) {
        try {
          const { data } = await api.get('/teams/my-team', { params: selectedTournament.gameId ? { gameId: selectedTournament.gameId } : undefined });
          setTeam(data);
        } catch {
          setTeam(null);
        }
      }
    }).catch((requestError: any) => setError(requestError.response?.data?.message || 'Unable to load tournament details.'))
      .finally(() => setLoading(false));
  }, [id, router, user]);

  const selectedProfile = profiles.find((profile) => profile.id === profileId);
  const rosterSize = Number(tournament?.gameMode?.rosterSize || (tournament?.format === 'SOLO' ? 1 : tournament?.format === 'DUO' ? 2 : 4));
  const substituteLimit = Number(tournament?.gameMode?.substituteLimit || 0);
  const roster = useMemo(() => {
    if (!team) return [];
    return [
      { id: team.captainId, label: team.captain?.platformHandle || team.captain?.ign || team.captain?.name, captain: true },
      ...(team.memberships || []).filter((member: any) => member.status === 'ACCEPTED').map((member: any) => ({
        id: member.userId, label: member.user?.platformHandle || member.user?.ign || member.user?.name, captain: false,
      })),
    ];
  }, [team]);
  const paid = !tournament?.isFree && Number(tournament?.entryFee) > 0;
  const canPay = !paid || walletBalance >= Number(tournament?.entryFee);
  const canJoin = tournament ? isTournamentJoinable(tournament) : false;
  const isFull = tournament ? isTournamentFull(tournament) : false;
  const isFree = tournament ? isFreeTournament(tournament) : false;
  const isCaptain = rosterSize === 1 || team?.captainId === user?.id;

  const toggle = (userId: string, role: 'starter' | 'substitute') => {
    if (role === 'starter') {
      setSubstitutes((current) => current.filter((item) => item !== userId));
      setStarters((current) => current.includes(userId) ? current.filter((item) => item !== userId) : current.length < rosterSize ? [...current, userId] : current);
    } else {
      setStarters((current) => current.filter((item) => item !== userId));
      setSubstitutes((current) => current.includes(userId) ? current.filter((item) => item !== userId) : current.length < substituteLimit ? [...current, userId] : current);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canJoin) return setError(isFull ? 'This tournament is already full.' : 'Registration is not open for this tournament.');
    if (tournament.gameId && !profileId) return setError(`Add and select your ${tournament.game?.name || 'game'} profile first.`);
    if (tournament.requiresVerifiedProfile && selectedProfile?.verificationStatus !== 'VERIFIED') return setError('This tournament requires a verified game profile.');
    if (rosterSize > 1 && !team) return setError(`Create a ${tournament.game?.name || 'game'} team before joining.`);
    if (rosterSize > 1 && !isCaptain) return setError('Only the team captain can select a line-up and join.');
    if (rosterSize > 1 && starters.length !== rosterSize) return setError(`Select exactly ${rosterSize} starters.`);
    try {
      setSubmitting(true);
      setError('');
      await api.post(`/tournaments/${id}/join`, {
        gameProfileId: profileId || undefined, ffUid: legacyUid || undefined,
        starterUserIds: rosterSize > 1 ? starters : undefined, substituteUserIds: substitutes,
      });
      setSuccess(true);
      setTimeout(() => router.push(`/user/tournaments/${id}`), 1000);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || Object.values(requestError.response?.data?.errors || {}).flat().join(' ') || 'Unable to join tournament.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return <div className="grid min-h-screen place-items-center bg-gray-950 text-white"><Button onClick={() => router.push('/user/login')}>Login to Join</Button></div>;
  if (loading) return <div className="grid min-h-screen place-items-center bg-gray-950 text-white">Loading join setup...</div>;
  if (!tournament) return <div className="grid min-h-screen place-items-center bg-gray-950 text-red-400">{error || 'Tournament not found.'}</div>;
  if (success) return <div className="grid min-h-screen place-items-center bg-gray-950 text-white"><Card className="p-8 text-center"><Check className="mx-auto mb-3 h-14 w-14 text-green-400" /><h2 className="text-2xl font-bold">Successfully Joined</h2><p className="mt-2 text-gray-400">Your registration is approved.</p></Card></div>;

  return <div className="min-h-screen bg-gray-950 px-4 py-8 text-white"><Head><title>Join {tournament.title}</title></Head><div className="mx-auto max-w-3xl">
    <button onClick={() => router.back()} className="mb-5 flex items-center gap-2 text-gray-400 hover:text-white"><ChevronLeft className="h-4 w-4" />Back to tournament</button>
    <Card className="mb-5 p-6"><h1 className="text-2xl font-bold">{tournament.title}</h1><p className="mt-1 text-gray-400">{tournament.game?.name || 'Free Fire'} · {tournament.gameMode?.name || tournament.format} · {tournament.registeredTeams}/{tournament.maxTeams} registered</p></Card>
    {error && <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
    {!canJoin && <p className="mb-4 rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm font-bold text-yellow-200">{isFull ? 'This tournament is full.' : 'Registration is not open right now.'}</p>}
    <form onSubmit={submit} className="space-y-5">
      <Card className="p-6"><h2 className="mb-4 flex items-center gap-2 font-bold"><ShieldCheck className="h-5 w-5 text-blue-400" />1. Game Profile</h2>
        {profiles.length ? <select value={profileId} onChange={(event) => setProfileId(event.target.value)} className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3" required><option value="">Select your {tournament.game?.name || 'game'} profile</option>{profiles.map((profile) => <option value={profile.id} key={profile.id}>{profile.ign} · {profile.uid} · {profile.verificationStatus}</option>)}</select> : <div className="space-y-3">{!tournament.gameId && <input value={legacyUid} onChange={(event) => setLegacyUid(event.target.value)} placeholder="Legacy Free Fire UID" className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3" />}<p className="text-sm text-yellow-300">No {tournament.game?.name || 'game'} profile found.</p><Button type="button" variant="outline" onClick={() => router.push('/user/game-profiles')}>Add Game Profile</Button></div>}
        {tournament.requiresVerifiedProfile && <p className="mt-3 text-xs text-gray-400">Organizer requires a verified profile for every selected player.</p>}
      </Card>
      {rosterSize > 1 && <Card className="p-6"><h2 className="mb-4 flex items-center gap-2 font-bold"><Users className="h-5 w-5 text-purple-400" />2. Team Line-up</h2>
        {!team ? <div><p className="mb-3 text-sm text-yellow-300">Create a {tournament.game?.name || 'game'} team and invite accepted members first.</p><Button type="button" variant="outline" onClick={() => router.push('/user/teams')}>Open Teams</Button></div> : !isCaptain ? <p className="text-sm text-yellow-300">You are a member of {team.name}. Ask captain {team.captain?.platformHandle || team.captain?.name} to register the line-up.</p> : <><p className="mb-3 text-sm text-gray-400">Choose exactly {rosterSize} starters{ substituteLimit ? ` and up to ${substituteLimit} substitutes` : ''}.</p><div className="grid gap-2 sm:grid-cols-2">{roster.map((member) => <label key={member.id} className="flex items-center justify-between rounded-lg bg-gray-800 p-3"><span>{member.label}{member.captain ? ' · Captain' : ''}</span><span className="flex gap-3 text-xs"><label><input type="checkbox" checked={starters.includes(member.id)} onChange={() => toggle(member.id, 'starter')} /> Starter</label>{substituteLimit > 0 && <label><input type="checkbox" checked={substitutes.includes(member.id)} onChange={() => toggle(member.id, 'substitute')} /> Sub</label>}</span></label>)}</div></>}
      </Card>}
      <Card className="p-6"><h2 className="mb-4 flex items-center gap-2 font-bold"><Wallet className="h-5 w-5 text-green-400" />{rosterSize > 1 ? '3' : '2'}. Wallet Confirmation</h2><div className="flex items-center justify-between rounded-lg bg-gray-800 p-4"><div><p className="text-sm text-gray-400">Main wallet balance</p><p className={`text-xl font-bold ${canPay ? 'text-green-400' : 'text-red-400'}`}>৳{walletBalance.toLocaleString()}</p></div><div className="text-right"><p className="text-sm text-gray-400">Entry fee</p><p className="text-xl font-bold">{isFree ? 'FREE' : `৳${Number(tournament.entryFee).toLocaleString()}`}</p></div></div>{!canPay && <div className="mt-3 flex items-center justify-between gap-3 text-sm text-red-300"><span className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />Insufficient balance.</span><Button type="button" size="sm" variant="outline" onClick={() => router.push('/user/wallet')}>Deposit</Button></div>}</Card>
      <Button type="submit" className="w-full" disabled={!canJoin || !canPay || submitting || (rosterSize > 1 && (!team || !isCaptain))}>{submitting ? 'Processing...' : paid ? `Pay ৳${Number(tournament.entryFee).toLocaleString()} & Join` : 'Join Free Tournament'}</Button>
    </form>
  </div></div>;
}
