import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import TournamentWorkspaceTabs from '@/components/tournaments/TournamentWorkspaceTabs';

export default function TournamentRoomsPage() {
  const { query } = useRouter();
  const tournamentId = String(query.id || '');
  const [rooms, setRooms] = useState<any[]>([]);
  const [tournament, setTournament] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [defaultForm, setDefaultForm] = useState({ roomId: '', password: '' });
  const [form, setForm] = useState({ roomId: '', password: '' });
  const load = async () => {
    if (!tournamentId) return;
    const [roomsResponse, tournamentResponse] = await Promise.all([
      api.get('/management/rooms', { params: { tournamentId } }),
      api.get(`/tournaments/${tournamentId}`),
    ]);
    setRooms(roomsResponse.data || []);
    setTournament(tournamentResponse.data);
    setDefaultForm({
      roomId: tournamentResponse.data?.roomDetails?.roomId || '',
      password: tournamentResponse.data?.roomDetails?.password || '',
    });
  };
  useEffect(() => { void load(); }, [tournamentId]);
  const saveDefault = async (event: FormEvent) => {
    event.preventDefault();
    await api.put(`/tournaments/${tournamentId}`, { roomDetails: defaultForm });
    await load();
  };
  const save = async (event: FormEvent) => { event.preventDefault(); await api.patch(`/management/rooms/${editing.id}`, form); setEditing(null); await load(); };
  return <div className="min-h-screen bg-gray-900 px-4 py-8 text-white"><div className="mx-auto max-w-6xl">
    <h1 className="text-3xl font-bold">Tournament Rooms</h1><p className="mb-5 text-gray-400">Manage private lobby credentials for scheduled matches.</p>
    <TournamentWorkspaceTabs tournamentId={tournamentId} active="Rooms" />
    <Card className="mb-5 p-5">
      <h2 className="mb-2 font-bold">Default Tournament Room</h2>
      <p className="mb-4 text-sm text-gray-400">{tournament?.title || 'Tournament'} fallback room, visible to approved checked-in participants when no match room is assigned.</p>
      <form onSubmit={saveDefault} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <Input value={defaultForm.roomId} onChange={(e) => setDefaultForm({ ...defaultForm, roomId: e.target.value })} placeholder="Default room / lobby ID" />
        <Input value={defaultForm.password} onChange={(e) => setDefaultForm({ ...defaultForm, password: e.target.value })} placeholder="Default password (optional)" />
        <Button type="submit">Save Default</Button>
      </form>
    </Card>
    <div className="space-y-3">{rooms.length ? rooms.map((room) => <Card key={room.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><b>Match #{room.matchNumber} · {room.map}</b><p className="text-sm text-gray-400">{new Date(room.scheduledTime).toLocaleString()} · {room.status}</p><p className="text-sm text-blue-300">Lobby: {room.roomId} · Password: {room.password || 'Not required'}</p></div><Button size="sm" variant="outline" onClick={() => { setEditing(room); setForm({ roomId: room.roomId || '', password: room.password || '' }); }}>Edit Room</Button></Card>) : <Card className="p-6 text-gray-400">No room assigned yet. Assign a lobby from the Matches tab.</Card>}</div>
    {editing && <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"><Card className="w-full max-w-lg p-5"><h2 className="mb-4 font-bold">Update Match #{editing.matchNumber} Room</h2><form onSubmit={save} className="space-y-3"><Input value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })} placeholder="Room / Lobby ID" /><Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password (optional)" /><div className="flex gap-2"><Button type="submit">Save Room</Button><Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button></div></form></Card></div>}
  </div></div>;
}
