import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function ClaimsPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [error, setError] = useState('');
  const load = () => api.get('/management/result-claims').then(({ data }) => setClaims(data || [])).catch((err) => setError(err.response?.data?.message || 'Unable to load claims.'));
  useEffect(() => { void load(); }, []);
  const review = async (claim: any, status: 'APPROVED' | 'REJECTED') => {
    await api.put(`/management/result-claims/${claim.id}`, {
      status,
      rewards: claim.rewards.map((reward: any) => ({ userId: reward.userId, amount: Number(reward.approvedAmount ?? reward.suggestedAmount) })),
    });
    load();
  };
  return <div className="min-h-screen bg-gray-900 text-white py-8"><div className="max-w-5xl mx-auto px-4">
    <h1 className="text-3xl font-bold mb-2">Result Claims</h1><p className="text-gray-400 mb-6">Review screenshots and confirm per-member wallet rewards.</p>
    {error && <p className="text-red-400 mb-4">{error}</p>}
    <div className="space-y-4">{claims.map((claim) => <Card className="p-5" key={claim.id}>
      <div className="flex flex-wrap justify-between gap-4"><div><h2 className="font-bold">{claim.tournament?.title}</h2><p className="text-sm text-gray-400">{claim.resultPayload?.type === 'SCORELINE' ? `${claim.resultPayload.homeScore}-${claim.resultPayload.awayScore} · ${claim.resultPayload.winner} won` : claim.resultPayload?.type === 'SERIES_WINNER' ? `${claim.resultPayload.winner} won${claim.resultPayload.seriesScore ? ` · ${claim.resultPayload.seriesScore}` : ''}` : `Placement #${claim.placement} · ${claim.kills} kills`} · {claim.status}</p></div>
      <div className="flex gap-2">{claim.status === 'PENDING' && <><Button size="sm" onClick={() => review(claim, 'APPROVED')}>Approve Rewards</Button><Button size="sm" variant="outline" onClick={() => review(claim, 'REJECTED')}>Reject</Button></>}</div></div>
      <div className="mt-4 grid gap-2">{claim.rewards.map((reward: any) => <label key={reward.id} className="flex items-center justify-between gap-3 bg-gray-800 p-3 rounded"><span>{reward.user?.name || reward.userId}</span><input type="number" defaultValue={reward.suggestedAmount} onChange={(e) => reward.approvedAmount = Number(e.target.value)} className="w-28 bg-gray-900 px-2 py-1 rounded" /></label>)}</div>
      <div className="mt-3 flex gap-3 text-sm">{claim.proofPaths?.map((proof: string) => <a key={proof} className="text-blue-400 underline" href={`${(process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api$/, '')}/storage/${proof}`} target="_blank" rel="noreferrer">View proof</a>)}</div>
    </Card>)}</div>
  </div></div>;
}
