import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import TournamentWorkspaceTabs from '@/components/tournaments/TournamentWorkspaceTabs';

const emptyForm = { matchNumber: '1', stage: 'QUALIFIER', map: '', scheduledTime: '', roomId: '', roomPassword: '' };

export default function TournamentMatchesPage() {
  const { query } = useRouter();
  const tournamentId = String(query.id || '');
  const [matches, setMatches] = useState<any[]>([]);
  const [tournament, setTournament] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<any>(null);
  const [error, setError] = useState('');

  const load = async () => {
    if (!tournamentId) return;
    try {
      const [tournamentResponse, matchesResponse] = await Promise.all([
        api.get(`/tournaments/${tournamentId}`), api.get(`/matches/by-tournament/${tournamentId}`),
      ]);
      setTournament(tournamentResponse.data);
      setMatches(matchesResponse.data || []);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Unable to load tournament matches.');
    }
  };
  useEffect(() => { void load(); }, [tournamentId]);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    await api.post('/matches', { ...form, tournamentId, matchNumber: Number(form.matchNumber), scheduledTime: new Date(form.scheduledTime).toISOString() });
    setForm(emptyForm);
    await load();
  };
  const update = async (event: FormEvent) => {
    event.preventDefault();
    await api.patch(`/matches/${editing.id}`, { status: editing.status, roomId: editing.roomId, roomPassword: editing.roomPassword });
    setEditing(null);
    await load();
  };

  return <div className="min-h-screen bg-gray-900 px-4 py-8 text-white"><div className="mx-auto max-w-6xl">
    <h1 className="text-3xl font-bold">Tournament Matches</h1><p className="mb-5 text-gray-400">{tournament?.title || 'Tournament'} · schedule, room assignment, and match status.</p>
    <TournamentWorkspaceTabs tournamentId={tournamentId} active="Matches" />
    {error && <p className="mb-4 text-red-400">{error}</p>}
    <Card className="mb-6 p-5"><h2 className="mb-4 font-bold">Create Match</h2><form onSubmit={create} className="grid gap-3 md:grid-cols-3">
      <Input required type="number" min="1" value={form.matchNumber} onChange={(e) => setForm({ ...form, matchNumber: e.target.value })} placeholder="Match number" />
      <Input required value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} placeholder="Stage" />
      <Input required value={form.map} onChange={(e) => setForm({ ...form, map: e.target.value })} placeholder="Map" />
      <Input required type="datetime-local" value={form.scheduledTime} onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })} />
      <Input value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })} placeholder="Room / Lobby ID" />
      <Input value={form.roomPassword} onChange={(e) => setForm({ ...form, roomPassword: e.target.value })} placeholder="Password (optional)" />
      <Button type="submit">Create Match</Button>
    </form></Card>
    <div className="space-y-3">{matches.length ? matches.map((match) => <Card className="p-4" key={match.id}><div className="flex flex-wrap justify-between gap-3"><div><b>Match #{match.matchNumber} · {match.stage}</b><p className="text-sm text-gray-400">{match.map} · {new Date(match.scheduledTime).toLocaleString()}</p><p className="text-sm text-blue-300">Lobby: {match.roomId || 'Not assigned'}</p></div><div className="flex items-center gap-3"><span className="text-sm text-blue-400">{match.status}</span><Button size="sm" variant="outline" onClick={() => setEditing({ ...match })}>Edit</Button></div></div></Card>) : <Card className="p-6 text-gray-400">No matches created for this tournament.</Card>}</div>
    {editing && <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"><Card className="w-full max-w-lg p-5"><h2 className="mb-4 font-bold">Update Match</h2><form onSubmit={update} className="space-y-3"><select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="w-full rounded bg-gray-800 px-3 py-3"><option>SCHEDULED</option><option>IN_PROGRESS</option><option>COMPLETED</option><option>CANCELLED</option></select><Input value={editing.roomId || ''} onChange={(e) => setEditing({ ...editing, roomId: e.target.value })} placeholder="Room / Lobby ID" /><Input value={editing.roomPassword || ''} onChange={(e) => setEditing({ ...editing, roomPassword: e.target.value })} placeholder="Password" /><div className="flex gap-2"><Button type="submit">Save</Button><Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button></div></form></Card></div>}
  </div></div>;
}
