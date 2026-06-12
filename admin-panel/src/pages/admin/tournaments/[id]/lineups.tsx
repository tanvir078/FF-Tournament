import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import TournamentWorkspaceTabs from '@/components/tournaments/TournamentWorkspaceTabs';

export default function LineupsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [lineups, setLineups] = useState<any[]>([]);
  const [error, setError] = useState('');
  const load = () => api.get(`/tournaments/${id}/lineups`).then(({ data }) => setLineups(data || [])).catch((err) => setError(err.response?.data?.message || 'Unable to load line-ups.'));
  useEffect(() => { if (id) void load(); }, [id]);
  return <div className="min-h-screen bg-gray-900 text-white py-8"><div className="max-w-6xl mx-auto px-4">
    <div className="mb-5 flex items-center justify-between gap-3"><div><h1 className="text-3xl font-bold">Tournament Line-ups</h1><p className="text-gray-400">Review captain selections, starters, substitutes, and game profiles.</p></div><Button variant="outline" onClick={load}>Refresh</Button></div>
    <TournamentWorkspaceTabs tournamentId={String(id)} active="Line-ups" />{error && <p className="mb-4 text-red-400">{error}</p>}
    <div className="space-y-4">{lineups.length ? lineups.map((lineup) => <Card className="p-5" key={lineup.id}><div className="mb-4 flex flex-wrap justify-between gap-3"><div><h2 className="font-bold">{lineup.team?.name || 'Team line-up'}</h2><p className="text-sm text-gray-400">{lineup.team?.game?.name || 'Legacy game'} · Captain: {lineup.registration?.user?.platformHandle || lineup.registration?.user?.name}</p></div><span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">{lineup.status}</span></div><div className="grid gap-3 md:grid-cols-2">{lineup.members?.map((member: any) => <div key={member.id} className="rounded-lg bg-gray-800 p-3"><div className="flex justify-between gap-2"><span className="font-semibold">{member.user?.platformHandle || member.user?.name}</span><span className={member.role === 'STARTER' ? 'text-green-400' : 'text-yellow-400'}>{member.role}</span></div><div className="mt-1 text-xs text-gray-400">{member.profile ? `${member.profile.ign} · ${member.profile.uid}` : 'Legacy profile'}</div></div>)}</div></Card>) : <Card className="p-8 text-center text-gray-400">No selected line-ups yet.</Card>}</div>
  </div></div>;
}
