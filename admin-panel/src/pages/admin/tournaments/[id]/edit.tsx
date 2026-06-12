import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../../../store/auth';
import api from '../../../../lib/api';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import TournamentWorkspaceTabs from '@/components/tournaments/TournamentWorkspaceTabs';

export default function EditTournament() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [games, setGames] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    gameId: '',
    gameModeId: '',
    description: '',
    format: 'SQUAD',
    competitionMode: 'STANDARD',
    entryFee: 0,
    prizePool: 0,
    maxTeams: 100,
    startDate: '',
    endDate: '',
    registrationStart: '',
    registrationEnd: '',
    rules: [] as string[],
    maps: [] as string[],
    banner: '',
    perKillReward: 0,
    prizeDistribution: { '1': 0, '2': 0, '3': 0 },
    roomDetails: { roomId: '', password: '' },
    requiresVerifiedProfile: false,
    checkInEnabled: false,
    checkInOpensAt: '',
    checkInClosesAt: '',
  });
  const [ruleInput, setRuleInput] = useState('');
  const [mapInput, setMapInput] = useState('');
  const selectedGame = games.find((game) => game.id === formData.gameId);
  const selectGame = (gameId: string) => {
    const game = games.find((item) => item.id === gameId);
    const mode = game?.modes?.find((item: any) => item.enabled);
    setFormData({ ...formData, gameId, gameModeId: mode?.id || '', format: mode?.format || 'SOLO', maps: [] });
  };
  const selectMode = (gameModeId: string) => {
    const mode = selectedGame?.modes?.find((item: any) => item.id === gameModeId);
    setFormData({ ...formData, gameModeId, format: mode?.format || formData.format });
  };

  useEffect(() => {
    if (!user || !['ADMIN', 'ORGANIZER'].includes(user.role)) {
      router.push('/admin/login');
      return;
    }
    if (id) {
      fetchTournament();
    }
  }, [user, id]);
  useEffect(() => { api.get('/games').then(({ data }) => setGames(data || [])); }, []);

  const fetchTournament = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tournaments/${id}`);
      const tournament = response.data;
      setFormData({
        title: tournament.title || '',
        gameId: tournament.gameId || '',
        gameModeId: tournament.gameModeId || '',
        description: tournament.description || '',
        format: tournament.format || 'SQUAD',
        competitionMode: tournament.competitionMode || 'STANDARD',
        entryFee: tournament.entryFee || 0,
        prizePool: tournament.prizePool || 0,
        maxTeams: tournament.maxTeams || 100,
        startDate: tournament.startDate ? tournament.startDate.slice(0, 16) : '',
        endDate: tournament.endDate ? tournament.endDate.slice(0, 16) : '',
        registrationStart: tournament.registrationStart ? tournament.registrationStart.slice(0, 16) : '',
        registrationEnd: tournament.registrationEnd ? tournament.registrationEnd.slice(0, 16) : '',
        rules: tournament.rules || [],
        maps: tournament.maps || [],
        banner: tournament.banner || '',
        perKillReward: tournament.perKillReward || 0,
        prizeDistribution: { '1': tournament.prizeDistribution?.['1'] || 0, '2': tournament.prizeDistribution?.['2'] || 0, '3': tournament.prizeDistribution?.['3'] || 0 },
        roomDetails: tournament.roomDetails || { roomId: '', password: '' },
        requiresVerifiedProfile: tournament.requiresVerifiedProfile || false,
        checkInEnabled: tournament.checkInEnabled || false,
        checkInOpensAt: tournament.checkInOpensAt ? tournament.checkInOpensAt.slice(0, 16) : '',
        checkInClosesAt: tournament.checkInClosesAt ? tournament.checkInClosesAt.slice(0, 16) : '',
      });
    } catch (err) {
      setError('Failed to load tournament');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = () => {
    if (ruleInput.trim()) {
      setFormData({ ...formData, rules: [...formData.rules, ruleInput.trim()] });
      setRuleInput('');
    }
  };

  const handleRemoveRule = (index: number) => {
    setFormData({ ...formData, rules: formData.rules.filter((_, i) => i !== index) });
  };

  const handleAddMap = () => {
    if (mapInput.trim()) {
      setFormData({ ...formData, maps: [...formData.maps, mapInput.trim()] });
      setMapInput('');
    }
  };

  const handleRemoveMap = (index: number) => {
    setFormData({ ...formData, maps: formData.maps.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      await api.put(`/tournaments/${id}`, formData);
      alert('Tournament updated successfully!');
      router.push('/admin/tournaments');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update tournament');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <TournamentWorkspaceTabs tournamentId={String(id)} active="Settings" />
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Edit Tournament</h1>
          <Button variant="outline" onClick={() => router.push('/admin/tournaments')}>
            Back to Tournaments
          </Button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Game *</label>
                <select value={formData.gameId} onChange={(e) => selectGame(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3" required><option value="">Select game</option>{games.map((game) => <option key={game.id} value={game.id}>{game.name}</option>)}</select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Game Mode *</label>
                <select value={formData.gameModeId} onChange={(e) => selectMode(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3" required><option value="">Select mode</option>{(selectedGame?.modes || []).filter((mode: any) => mode.enabled).map((mode: any) => <option key={mode.id} value={mode.id}>{mode.name} · {mode.rosterSize} starters + {mode.substituteLimit} subs</option>)}</select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Format *</label>
                <select
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="SQUAD">Squad</option>
                  <option value="DUO">Duo</option>
                  <option value="SOLO">Solo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Entry Fee (৳) *</label>
                <Input
                  type="number"
                  value={formData.entryFee}
                  onChange={(e) => setFormData({ ...formData, entryFee: parseFloat(e.target.value) || 0 })}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Competition Mode *</label>
                <select value={formData.competitionMode} onChange={(e) => setFormData({ ...formData, competitionMode: e.target.value })} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3">
                  <option value="STANDARD">Standard</option>
                  <option value="KNOCKOUT">Knockout (16 or 32 teams)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Per Kill Reward (৳)</label>
                <Input type="number" value={formData.perKillReward} onChange={(e) => setFormData({ ...formData, perKillReward: parseFloat(e.target.value) || 0 })} min="0" />
              </div>

              {(['1', '2', '3'] as const).map((placement) => <div key={placement}>
                <label className="block text-sm font-medium mb-2">Placement #{placement} Reward (৳)</label>
                <Input type="number" value={formData.prizeDistribution[placement]} onChange={(e) => setFormData({ ...formData, prizeDistribution: { ...formData.prizeDistribution, [placement]: parseFloat(e.target.value) || 0 } })} min="0" />
              </div>)}

              <div>
                <label className="block text-sm font-medium mb-2">Default Room ID</label>
                <Input value={formData.roomDetails.roomId} onChange={(e) => setFormData({ ...formData, roomDetails: { ...formData.roomDetails, roomId: e.target.value } })} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Default Room Password</label>
                <Input value={formData.roomDetails.password} onChange={(e) => setFormData({ ...formData, roomDetails: { ...formData.roomDetails, password: e.target.value } })} />
              </div>

              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.requiresVerifiedProfile} onChange={(e) => setFormData({ ...formData, requiresVerifiedProfile: e.target.checked })} /> Require verified game profiles</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.checkInEnabled} onChange={(e) => setFormData({ ...formData, checkInEnabled: e.target.checked })} /> Enable captain check-in</label>
              {formData.checkInEnabled && <><div><label className="block text-sm font-medium mb-2">Check-in Opens</label><Input type="datetime-local" value={formData.checkInOpensAt} onChange={(e) => setFormData({ ...formData, checkInOpensAt: e.target.value })} /></div><div><label className="block text-sm font-medium mb-2">Check-in Closes</label><Input type="datetime-local" value={formData.checkInClosesAt} onChange={(e) => setFormData({ ...formData, checkInClosesAt: e.target.value })} /></div></>}

              <div>
                <label className="block text-sm font-medium mb-2">Prize Pool (৳) *</label>
                <Input
                  type="number"
                  value={formData.prizePool}
                  onChange={(e) => setFormData({ ...formData, prizePool: parseFloat(e.target.value) || 0 })}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Max Teams *</label>
                <Input
                  type="number"
                  value={formData.maxTeams}
                  onChange={(e) => setFormData({ ...formData, maxTeams: parseInt(e.target.value) || 0 })}
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Banner URL (optional)</label>
                <Input
                  value={formData.banner}
                  onChange={(e) => setFormData({ ...formData, banner: e.target.value })}
                  placeholder="https://example.com/banner.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Start Date *</label>
                <Input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">End Date *</label>
                <Input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Registration Start *</label>
                <Input
                  type="datetime-local"
                  value={formData.registrationStart}
                  onChange={(e) => setFormData({ ...formData, registrationStart: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Registration End *</label>
                <Input
                  type="datetime-local"
                  value={formData.registrationEnd}
                  onChange={(e) => setFormData({ ...formData, registrationEnd: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-32"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Rules</label>
              <div className="flex space-x-2 mb-2">
                <Input
                  value={ruleInput}
                  onChange={(e) => setRuleInput(e.target.value)}
                  placeholder="Add a rule"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRule())}
                />
                <Button type="button" onClick={handleAddRule}>Add</Button>
              </div>
              <ul className="list-disc list-inside space-y-1">
                {formData.rules.map((rule, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                    <span>{rule}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveRule(index)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Maps</label>
              <div className="flex space-x-2 mb-2">
                <Input
                  value={mapInput}
                  onChange={(e) => setMapInput(e.target.value)}
                  placeholder="Add a map"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMap())}
                />
                <Button type="button" onClick={handleAddMap}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.maps.map((map, index) => (
                  <span key={index} className="bg-gray-800 px-3 py-1 rounded-full flex items-center space-x-2">
                    <span>{map}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMap(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Tournament'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/tournaments')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
