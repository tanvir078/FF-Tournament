import { FormEvent, useEffect, useState } from 'react';
import api from '@/lib/api';
import Button from '@/views/user/Mobile/_components/Button';
import Card from '@/views/user/Mobile/_components/Card';
import Input from '@/views/user/Mobile/_components/Input';

export default function GameProfilesPage() {
  const [games, setGames] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [form, setForm] = useState({ gameId: '', uid: '', ign: '', region: '' });
  const [message, setMessage] = useState('');
  const load = async () => {
    const [gamesResponse, profilesResponse] = await Promise.all([api.get('/games'), api.get('/game-profiles/mine')]);
    setGames(gamesResponse.data || []);
    setProfiles(profilesResponse.data || []);
  };
  useEffect(() => { void load(); }, []);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await api.post('/game-profiles', form);
    setForm({ gameId: '', uid: '', ign: '', region: '' });
    setMessage('Game profile saved. Admin verification may be required for restricted tournaments.');
    await load();
  };
  return <div className="min-h-screen bg-gray-900 text-white py-8"><div className="max-w-5xl mx-auto px-4"><h1 className="text-3xl font-bold mb-2">My Game Profiles</h1><p className="text-gray-400 mb-6">Connect the player identity you will use in each game.</p><Card className="p-5 mb-6"><form onSubmit={submit} className="grid gap-3 md:grid-cols-2"><select value={form.gameId} onChange={(e) => setForm({ ...form, gameId: e.target.value })} className="bg-gray-800 border border-gray-700 rounded-lg px-4" required><option value="">Select game</option>{games.map((game) => <option value={game.id} key={game.id}>{game.name}</option>)}</select><Input value={form.uid} onChange={(e) => setForm({ ...form, uid: e.target.value })} placeholder="Player UID" required /><Input value={form.ign} onChange={(e) => setForm({ ...form, ign: e.target.value })} placeholder="In-game name" required /><Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Region (optional)" /><Button type="submit">Save Profile</Button>{message && <p className="text-sm text-green-400 md:col-span-2">{message}</p>}</form></Card><div className="grid gap-4 md:grid-cols-2">{profiles.map((profile) => <Card className="p-5" key={profile.id}><h2 className="font-bold text-xl">{profile.game?.name}</h2><p className="text-gray-300 mt-2">{profile.ign}</p><p className="text-sm text-gray-500">UID: {profile.uid} · {profile.region || 'No region'}</p><span className={`inline-block mt-3 rounded px-2 py-1 text-xs ${profile.verificationStatus === 'VERIFIED' ? 'bg-green-500/20 text-green-400' : profile.verificationStatus === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{profile.verificationStatus}</span></Card>)}</div></div></div>;
}
