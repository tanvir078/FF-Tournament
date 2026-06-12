import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { api.get('/teams').then(({ data }) => setTeams(data || [])).catch((err) => setError(err.response?.data?.message || 'Unable to load teams.')); }, []);
  const filtered = teams.filter((team) => `${team.name} ${team.tag || ''} ${team.captain?.ign || team.captain?.name || ''}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="min-h-screen bg-gray-900 text-white py-8"><div className="max-w-6xl mx-auto px-4"><h1 className="text-3xl font-bold mb-2">Teams & Rosters</h1><p className="text-gray-400 mb-6">Review linked captains, invitations, and verified memberships.</p><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search teams or captains" className="mb-5" />{error && <p className="text-red-400">{error}</p>}<div className="grid md:grid-cols-2 gap-4">{filtered.map((team) => <Card key={team.id} className="p-5"><div className="flex justify-between gap-3 mb-4"><div><h2 className="font-bold text-xl">{team.name}</h2><p className="text-sm text-gray-400">{team.tag || 'No tag'} · Captain: {team.captain?.ign || team.captain?.name}</p></div><span className="text-sm text-blue-300">{(team.memberships || []).filter((member: any) => member.status === 'ACCEPTED').length + 1} linked</span></div><div className="space-y-2">{(team.memberships || []).length ? team.memberships.map((member: any) => <div key={member.id} className="flex justify-between bg-gray-800 rounded p-3 text-sm"><span>{member.user?.ign || member.user?.name || member.userId}</span><span className={member.status === 'ACCEPTED' ? 'text-green-400' : member.status === 'REJECTED' ? 'text-red-400' : 'text-yellow-400'}>{member.status}</span></div>) : <p className="text-gray-500 text-sm">No invitations yet.</p>}</div></Card>)}</div></div></div>;
}
