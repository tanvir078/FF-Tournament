import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Crown, Edit3, Gamepad2, LogOut, Mail, Shield, Trash2, UserPlus, Users, X } from 'lucide-react';
import api from '@/lib/api';
import Button from '@/views/user/Mobile/_components/Button';
import Card from '@/views/user/Mobile/_components/Card';
import Input from '@/views/user/Mobile/_components/Input';
import { useAuthStore } from '@/store/auth';

export default function TeamProfilePage({ manage = false }: { manage?: boolean }) {
  const router = useRouter();
  const { id } = router.query;
  const user = useAuthStore((state) => state.user);
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteHandle, setInviteHandle] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', tag: '', description: '', logo: '' });
  const teamId = manage ? team?.id : id;
  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(manage ? '/teams/my-team' : `/teams/${id}`);
      setTeam(data);
      if (data) setForm({ name: data.name || '', tag: data.tag || '', description: data.description || '', logo: data.logo || '' });
    } catch (err: any) { setError(err.response?.data?.message || 'Unable to load team.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { if ((manage || id) && user) void load(); }, [id, manage, user]);
  const isCaptain = team?.captainId === user?.id;
  const accepted = useMemo(() => (team?.memberships || []).filter((membership: any) => membership.status === 'ACCEPTED'), [team]);
  const pending = useMemo(() => (team?.memberships || []).filter((membership: any) => membership.status === 'PENDING'), [team]);
  const roster = team ? [{ id: team.captainId, user: team.captain, captain: true }, ...accepted.map((membership: any) => ({ ...membership, captain: false }))] : [];
  const invite = async (event: FormEvent) => { event.preventDefault(); try { await api.post(`/teams/${teamId}/invite`, { platformHandle: inviteHandle }); setInviteHandle(''); await load(); } catch (err: any) { setError(err.response?.data?.message || 'Unable to invite player.'); } };
  const update = async (event: FormEvent) => { event.preventDefault(); try { await api.put(`/teams/${teamId}`, form); setEditing(false); await load(); } catch (err: any) { setError(err.response?.data?.message || 'Unable to update team.'); } };
  const remove = async (playerId: string) => { if (confirm('Remove this player from the team?')) { await api.delete(`/teams/${teamId}/players/${playerId}`); await load(); } };
  const revoke = async (membershipId: string) => { await api.delete(`/teams/${teamId}/invitations/${membershipId}`); await load(); };
  const leave = async () => { if (confirm('Leave this team?')) { await api.post(`/teams/${teamId}/leave`); router.push('/user/teams'); } };
  const disband = async () => { if (confirm('Disband this team permanently?')) { await api.delete(`/teams/${teamId}`); router.push('/user/teams'); } };
  if (loading) return <div className="min-h-screen bg-gray-900 grid place-items-center text-white">Loading team...</div>;
  if (!team) return <div className="min-h-screen bg-gray-900 grid place-items-center text-red-400">{error || 'Team not found.'}</div>;
  return <div className="min-h-screen bg-gray-900 py-8 text-white"><div className="mx-auto max-w-6xl px-4">
    <Button variant="outline" onClick={() => router.push('/user/teams')} className="mb-5"><ArrowLeft className="mr-2 h-4 w-4" />Back to Teams</Button>
    {error && <div className="mb-4 rounded-lg border border-red-500 bg-red-500/10 p-3 text-red-400">{error}</div>}
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]"><div className="space-y-6"><Card className="p-6"><div className="flex flex-wrap justify-between gap-4"><div className="flex gap-4">{team.logo ? <img src={team.logo} alt="" className="h-20 w-20 rounded-xl object-cover" /> : <div className="grid h-20 w-20 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600"><Gamepad2 className="h-10 w-10" /></div>}<div><div className="mb-2 flex flex-wrap items-center gap-2"><h1 className="text-3xl font-bold">{team.name}</h1><span className="rounded bg-blue-500/20 px-2 py-1 text-xs text-blue-400">{team.tag}</span></div><p className="text-sm font-semibold text-primary-400">{team.game?.name || 'Free Fire'}</p><p className="mt-2 text-gray-400">{team.description || 'No team description yet.'}</p></div></div>{isCaptain && <Button variant="outline" onClick={() => setEditing(!editing)}><Edit3 className="mr-2 h-4 w-4" />Edit</Button>}</div>{editing && <form onSubmit={update} className="mt-5 grid gap-3 md:grid-cols-2"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Team name" /><Input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="Tag" /><Input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="Logo URL" /><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" /><Button type="submit">Save Team</Button></form>}</Card>
    <Card className="p-6"><h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><Users className="h-5 w-5" />Accepted Roster</h2><div className="space-y-3">{roster.map((member: any) => <div key={member.id} className="flex items-center justify-between rounded-lg bg-gray-800 p-4"><div><div className="flex items-center gap-2 font-semibold">{member.user?.platformHandle || member.user?.ign || member.user?.name}{member.captain && <Crown className="h-4 w-4 text-yellow-400" />}</div><div className="text-xs text-gray-400">{member.captain ? 'Captain' : 'Accepted member'}</div></div>{isCaptain && !member.captain && <Button size="sm" variant="outline" onClick={() => remove(member.userId)}><Trash2 className="h-4 w-4 text-red-400" /></Button>}</div>)}</div>{!isCaptain && roster.some((member: any) => member.userId === user?.id) && <Button variant="outline" className="mt-5 w-full" onClick={leave}><LogOut className="mr-2 h-4 w-4" />Leave Team</Button>}</Card></div>
    <div className="space-y-6"><Card className="p-5"><h2 className="mb-3 flex items-center gap-2 font-bold"><Shield className="h-4 w-4" />Team Status</h2><div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-gray-400">Game</span><span>{team.game?.name || 'Legacy'}</span></div><div className="flex justify-between"><span className="text-gray-400">Players</span><span>{roster.length}</span></div><div className="flex justify-between"><span className="text-gray-400">Pending</span><span>{pending.length}</span></div></div></Card>{isCaptain && <><Card className="p-5"><h2 className="mb-3 flex items-center gap-2 font-bold"><UserPlus className="h-4 w-4" />Invite by Handle</h2><form onSubmit={invite} className="space-y-3"><Input value={inviteHandle} onChange={(e) => setInviteHandle(e.target.value)} placeholder="player-handle" required /><Button type="submit" className="w-full">Send Invitation</Button></form></Card><Card className="p-5"><h2 className="mb-3 flex items-center gap-2 font-bold"><Mail className="h-4 w-4" />Pending Invitations</h2><div className="space-y-2">{pending.length ? pending.map((membership: any) => <div key={membership.id} className="flex items-center justify-between rounded-lg bg-gray-800 p-3"><span className="text-sm">{membership.user?.platformHandle || membership.user?.name}</span><button onClick={() => revoke(membership.id)} aria-label="Revoke invitation"><X className="h-4 w-4 text-red-400" /></button></div>) : <p className="text-sm text-gray-500">No pending invitations.</p>}</div></Card><Button variant="outline" className="w-full border-red-500 text-red-400" onClick={disband}><Trash2 className="mr-2 h-4 w-4" />Disband Team</Button></>}</div></div>
  </div></div>;
}
