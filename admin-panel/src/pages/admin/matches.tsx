import { FormEvent, useEffect, useState } from 'react';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

const emptyForm = { tournamentId: '', matchNumber: '1', stage: 'QUALIFIER', map: 'Bermuda', scheduledTime: '', roomId: '', roomPassword: '' };

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<any>(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [matchesResponse, tournamentsResponse] = await Promise.all([api.get('/matches'), api.get('/management/tournaments')]);
      setMatches(matchesResponse.data || []);
      setTournaments(tournamentsResponse.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load matches.');
    }
  };

  useEffect(() => { void load(); }, []);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setError('');
      await api.post('/matches', { ...form, matchNumber: Number(form.matchNumber), scheduledTime: new Date(form.scheduledTime).toISOString() });
      setForm(emptyForm);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to create match.');
    }
  };

  const update = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await api.patch(`/matches/${editing.id}`, editing);
      setEditing(null);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to update match.');
    }
  };

  return <div className="min-h-screen bg-gray-900 text-white py-8"><div className="max-w-6xl mx-auto px-4">
    <h1 className="text-3xl font-bold mb-2">Matches</h1><p className="text-gray-400 mb-6">Create schedules, update status, and assign private rooms.</p>
    {error && <p className="text-red-400 mb-4">{error}</p>}
    <Card className="p-5 mb-6"><h2 className="font-bold mb-4">Create Match</h2><form onSubmit={create} className="grid md:grid-cols-3 gap-3">
      <select required value={form.tournamentId} onChange={(e) => setForm({ ...form, tournamentId: e.target.value })} className="bg-gray-800 rounded px-3"><option value="">Select tournament</option>{tournaments.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select>
      <Input required type="number" min="1" value={form.matchNumber} onChange={(e) => setForm({ ...form, matchNumber: e.target.value })} placeholder="Match number" />
      <Input required value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} placeholder="Stage" />
      <Input required value={form.map} onChange={(e) => setForm({ ...form, map: e.target.value })} placeholder="Map" />
      <Input required type="datetime-local" value={form.scheduledTime} onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })} />
      <Input value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })} placeholder="Room ID" />
      <Input value={form.roomPassword} onChange={(e) => setForm({ ...form, roomPassword: e.target.value })} placeholder="Room password" />
      <Button type="submit">Create Match</Button>
    </form></Card>
    <div className="space-y-3">{matches.length ? matches.map((match) => <Card className="p-4" key={match.id}><div className="flex flex-wrap justify-between gap-3"><div><b>{match.tournament?.title || 'Tournament'} · Match #{match.matchNumber}</b><p className="text-sm text-gray-400">{match.stage} · {match.map} · {new Date(match.scheduledTime).toLocaleString()}</p><p className="text-sm text-blue-300">Room: {match.roomId || 'Not assigned'}</p></div><div className="flex items-center gap-3"><span className="text-sm text-blue-400">{match.status}</span><Button size="sm" variant="outline" onClick={() => setEditing({ ...match })}>Edit</Button></div></div></Card>) : <Card className="p-6 text-gray-400">No matches created.</Card>}</div>
    {editing && <div className="fixed inset-0 bg-black/60 grid place-items-center p-4 z-50"><Card className="p-5 w-full max-w-lg"><h2 className="font-bold mb-4">Update Match</h2><form onSubmit={update} className="space-y-3"><select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="w-full bg-gray-800 rounded px-3 py-3"><option>SCHEDULED</option><option>IN_PROGRESS</option><option>COMPLETED</option><option>CANCELLED</option></select><Input value={editing.roomId || ''} onChange={(e) => setEditing({ ...editing, roomId: e.target.value })} placeholder="Room ID" /><Input value={editing.roomPassword || ''} onChange={(e) => setEditing({ ...editing, roomPassword: e.target.value })} placeholder="Room password" /><div className="flex gap-2"><Button type="submit">Save</Button><Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button></div></form></Card></div>}
  </div></div>;
}
