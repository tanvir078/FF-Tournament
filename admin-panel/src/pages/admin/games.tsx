import { FormEvent, useEffect, useState } from 'react';
import { Gamepad2, Map, Pencil, Plus, Save, Settings2, X } from 'lucide-react';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

type Game = {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  banner?: string;
  enabled: boolean;
  profileFields?: string[];
  lobbyLabels?: Record<string, string>;
  scoringPreset?: { type?: string };
  modes?: GameMode[];
  maps?: GameMap[];
};

type GameMode = {
  id: string;
  name: string;
  slug: string;
  format: string;
  rosterSize: number;
  substituteLimit: number;
  enabled: boolean;
};

type GameMap = { id: string; name: string; enabled: boolean };

const emptyGame = {
  name: '', slug: '', icon: '', banner: '', profileFields: 'uid, ign, region',
  roomLabel: 'Lobby ID', passwordLabel: 'Password', scoringType: 'PLACEMENT_KILLS',
};
const emptyMode = { gameId: '', name: '', slug: '', format: 'SOLO', rosterSize: 1, substituteLimit: 0 };

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [gameForm, setGameForm] = useState(emptyGame);
  const [modeForm, setModeForm] = useState(emptyMode);
  const [mapForm, setMapForm] = useState({ gameId: '', name: '' });
  const [editing, setEditing] = useState<Game | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/games');
      setGames(data || []);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Unable to load game catalog.');
    }
  };

  useEffect(() => { void load(); }, []);

  const payload = (form: typeof emptyGame) => ({
    name: form.name,
    slug: form.slug,
    icon: form.icon || null,
    banner: form.banner || null,
    profileFields: form.profileFields.split(',').map((field) => field.trim()).filter(Boolean),
    lobbyLabels: { roomId: form.roomLabel, ...(form.passwordLabel ? { password: form.passwordLabel } : {}) },
    scoringPreset: { type: form.scoringType },
  });

  const run = async (action: () => Promise<unknown>, success: string) => {
    setError('');
    try {
      await action();
      setMessage(success);
      await load();
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Unable to save catalog changes.');
    }
  };

  const createGame = async (event: FormEvent) => {
    event.preventDefault();
    await run(() => api.post('/admin/games', payload(gameForm)), 'Game added to the catalog.');
    setGameForm(emptyGame);
  };

  const openEditor = (game: Game) => setEditing({
    ...game,
    profileFields: game.profileFields || [],
    lobbyLabels: game.lobbyLabels || {},
    scoringPreset: game.scoringPreset || {},
  });

  const saveGame = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    await run(() => api.patch(`/admin/games/${editing.id}`, {
      name: editing.name, slug: editing.slug, icon: editing.icon || null, banner: editing.banner || null,
      profileFields: editing.profileFields || [], lobbyLabels: editing.lobbyLabels || {},
      scoringPreset: editing.scoringPreset || {},
    }), 'Game preset updated.');
    setEditing(null);
  };

  const createMode = async (event: FormEvent) => {
    event.preventDefault();
    await run(() => api.post(`/admin/games/${modeForm.gameId}/modes`, modeForm), 'Mode preset added.');
    setModeForm({ ...emptyMode, gameId: modeForm.gameId });
  };

  const createMap = async (event: FormEvent) => {
    event.preventDefault();
    await run(() => api.post(`/admin/games/${mapForm.gameId}/maps`, { name: mapForm.name }), 'Map added.');
    setMapForm({ ...mapForm, name: '' });
  };

  return <div className="min-h-screen bg-gray-900 px-4 py-8 text-white">
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold"><Gamepad2 className="text-blue-400" /> Game Catalog</h1>
        <p className="mt-1 text-gray-400">Configure launch games, roster presets, maps, profile fields, lobby labels, and scoring behavior.</p>
      </div>
      {message && <p className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">{message}</p>}
      {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

      <Card className="p-5">
        <h2 className="mb-4 flex items-center gap-2 font-bold"><Plus className="h-4 w-4" /> Add Game</h2>
        <form onSubmit={createGame} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input value={gameForm.name} onChange={(e) => setGameForm({ ...gameForm, name: e.target.value })} placeholder="Game name" required />
          <Input value={gameForm.slug} onChange={(e) => setGameForm({ ...gameForm, slug: e.target.value })} placeholder="game-slug" required />
          <Input value={gameForm.icon} onChange={(e) => setGameForm({ ...gameForm, icon: e.target.value })} placeholder="Icon URL" />
          <Input value={gameForm.banner} onChange={(e) => setGameForm({ ...gameForm, banner: e.target.value })} placeholder="Banner URL" />
          <Input value={gameForm.profileFields} onChange={(e) => setGameForm({ ...gameForm, profileFields: e.target.value })} placeholder="uid, ign, region" />
          <Input value={gameForm.roomLabel} onChange={(e) => setGameForm({ ...gameForm, roomLabel: e.target.value })} placeholder="Lobby ID label" />
          <Input value={gameForm.passwordLabel} onChange={(e) => setGameForm({ ...gameForm, passwordLabel: e.target.value })} placeholder="Password label (optional)" />
          <select value={gameForm.scoringType} onChange={(e) => setGameForm({ ...gameForm, scoringType: e.target.value })} className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-3">
            <option value="PLACEMENT_KILLS">Placement + Kills</option><option value="SCORELINE">Scoreline</option><option value="SERIES_WINNER">Series Winner</option>
          </select>
          <Button type="submit" className="xl:col-span-4">Add Game</Button>
        </form>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 font-bold"><Settings2 className="h-4 w-4" /> Add Mode Preset</h2>
          <form onSubmit={createMode} className="grid gap-3">
            <GameSelect games={games} value={modeForm.gameId} onChange={(gameId) => setModeForm({ ...modeForm, gameId })} />
            <div className="grid gap-3 sm:grid-cols-2"><Input value={modeForm.name} onChange={(e) => setModeForm({ ...modeForm, name: e.target.value })} placeholder="Mode name" required /><Input value={modeForm.slug} onChange={(e) => setModeForm({ ...modeForm, slug: e.target.value })} placeholder="mode-slug" required /></div>
            <div className="grid gap-3 sm:grid-cols-3"><Input value={modeForm.format} onChange={(e) => setModeForm({ ...modeForm, format: e.target.value })} placeholder="Format" required /><Input type="number" min="1" value={modeForm.rosterSize} onChange={(e) => setModeForm({ ...modeForm, rosterSize: Number(e.target.value) })} /><Input type="number" min="0" value={modeForm.substituteLimit} onChange={(e) => setModeForm({ ...modeForm, substituteLimit: Number(e.target.value) })} /></div>
            <Button type="submit">Add Mode</Button>
          </form>
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 font-bold"><Map className="h-4 w-4" /> Add Map</h2>
          <form onSubmit={createMap} className="grid gap-3">
            <GameSelect games={games} value={mapForm.gameId} onChange={(gameId) => setMapForm({ ...mapForm, gameId })} />
            <Input value={mapForm.name} onChange={(e) => setMapForm({ ...mapForm, name: e.target.value })} placeholder="Map name" required />
            <Button type="submit">Add Map</Button>
          </form>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">{games.map((game) => <Card className="overflow-hidden" key={game.id}>
        {game.banner && <img src={game.banner} alt="" className="h-28 w-full object-cover opacity-70" />}
        <div className="p-5">
          <div className="flex justify-between gap-3"><div className="flex gap-3">{game.icon && <img src={game.icon} alt="" className="h-11 w-11 rounded-lg object-cover" />}<div><h2 className="text-xl font-bold">{game.name}</h2><p className="text-sm text-gray-400">{game.slug} · {game.scoringPreset?.type || 'PLACEMENT_KILLS'}</p></div></div><div className="flex gap-2"><Button size="sm" variant="ghost" onClick={() => openEditor(game)}><Pencil className="h-4 w-4" /></Button><Button size="sm" variant={game.enabled ? 'outline' : 'primary'} onClick={() => run(() => api.patch(`/admin/games/${game.id}`, { enabled: !game.enabled }), `Game ${game.enabled ? 'disabled' : 'enabled'}.`)}>{game.enabled ? 'Disable' : 'Enable'}</Button></div></div>
          <p className="mt-4 text-xs uppercase tracking-wide text-gray-500">Modes</p><div className="mt-2 flex flex-wrap gap-2">{(game.modes || []).map((item) => <button className={`rounded px-2 py-1 text-sm ${item.enabled ? 'bg-gray-700 text-gray-200' : 'bg-gray-900 text-gray-500'}`} key={item.id} onClick={() => run(() => api.patch(`/admin/games/${game.id}/modes/${item.id}`, { enabled: !item.enabled }), `Mode ${item.enabled ? 'disabled' : 'enabled'}.`)}>{item.name}: {item.rosterSize} + {item.substituteLimit} subs</button>)}</div>
          <p className="mt-4 text-xs uppercase tracking-wide text-gray-500">Maps</p><div className="mt-2 flex flex-wrap gap-2">{(game.maps || []).map((item) => <button className="rounded border border-gray-700 px-2 py-1 text-sm text-gray-300" key={item.id} onClick={() => run(() => api.delete(`/admin/games/${game.id}/maps/${item.id}`), 'Map removed.')}>{item.name} ×</button>)}</div>
        </div>
      </Card>)}</div>
    </div>

    {editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6">
      <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold">Edit {editing.name}</h2><button onClick={() => setEditing(null)}><X /></button></div>
      <form onSubmit={saveGame} className="grid gap-3 sm:grid-cols-2">
        <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Game name" required /><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="Slug" required />
        <Input value={editing.icon || ''} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} placeholder="Icon URL" /><Input value={editing.banner || ''} onChange={(e) => setEditing({ ...editing, banner: e.target.value })} placeholder="Banner URL" />
        <Input value={(editing.profileFields || []).join(', ')} onChange={(e) => setEditing({ ...editing, profileFields: e.target.value.split(',').map((field) => field.trim()).filter(Boolean) })} placeholder="uid, ign, region" />
        <select value={editing.scoringPreset?.type || 'PLACEMENT_KILLS'} onChange={(e) => setEditing({ ...editing, scoringPreset: { type: e.target.value } })} className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-3"><option value="PLACEMENT_KILLS">Placement + Kills</option><option value="SCORELINE">Scoreline</option><option value="SERIES_WINNER">Series Winner</option></select>
        <Input value={editing.lobbyLabels?.roomId || ''} onChange={(e) => setEditing({ ...editing, lobbyLabels: { ...editing.lobbyLabels, roomId: e.target.value } })} placeholder="Lobby ID label" />
        <Input value={editing.lobbyLabels?.password || ''} onChange={(e) => setEditing({ ...editing, lobbyLabels: { ...editing.lobbyLabels, password: e.target.value } })} placeholder="Password label (optional)" />
        <Button type="submit" className="gap-2 sm:col-span-2"><Save className="h-4 w-4" /> Save Game Preset</Button>
      </form>
    </Card></div>}
  </div>;
}

function GameSelect({ games, value, onChange }: { games: Game[]; value: string; onChange: (gameId: string) => void }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} required className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-3"><option value="">Select game</option>{games.map((game) => <option value={game.id} key={game.id}>{game.name}</option>)}</select>;
}
