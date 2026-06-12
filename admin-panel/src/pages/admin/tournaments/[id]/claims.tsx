import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import TournamentWorkspaceTabs from '@/components/tournaments/TournamentWorkspaceTabs';

export default function TournamentClaimsPage() {
  const { query } = useRouter();
  const tournamentId = String(query.id || '');
  const [claims, setClaims] = useState<any[]>([]);
  const load = () => tournamentId && api.get('/management/result-claims', { params: { tournamentId } }).then(({ data }) => setClaims(data || []));
  useEffect(() => { void load(); }, [tournamentId]);
  const review = async (claim: any, status: 'APPROVED' | 'REJECTED') => {
    await api.put(`/management/result-claims/${claim.id}`, { status, rewards: claim.rewards.map((reward: any) => ({ userId: reward.userId, amount: Number(reward.approvedAmount ?? reward.suggestedAmount) })) });
    await load();
  };
  return <div className="min-h-screen bg-gray-900 px-4 py-8 text-white"><div className="mx-auto max-w-5xl">
    <h1 className="text-3xl font-bold">Tournament Claims</h1><p className="mb-5 text-gray-400">Review result proofs and approve per-member wallet credits.</p>
    <TournamentWorkspaceTabs tournamentId={tournamentId} active="Claims" />
    <div className="space-y-4">{claims.length ? claims.map((claim) => <Card className="p-5" key={claim.id}>
      <div className="flex flex-wrap justify-between gap-4"><div><h2 className="font-bold">Match #{claim.match?.matchNumber || '-'}</h2><p className="text-sm text-gray-400">{claim.resultPayload?.type === 'SCORELINE' ? `${claim.resultPayload.homeScore}-${claim.resultPayload.awayScore} · ${claim.resultPayload.winner} won` : claim.resultPayload?.type === 'SERIES_WINNER' ? `${claim.resultPayload.winner} won` : `Placement #${claim.placement} · ${claim.kills} kills`} · {claim.status}</p></div>{claim.status === 'PENDING' && <div className="flex gap-2"><Button size="sm" onClick={() => review(claim, 'APPROVED')}>Approve Rewards</Button><Button size="sm" variant="outline" onClick={() => review(claim, 'REJECTED')}>Reject</Button></div>}</div>
      <div className="mt-4 grid gap-2">{claim.rewards.map((reward: any) => <label key={reward.id} className="flex items-center justify-between gap-3 rounded bg-gray-900 p-3"><span>{reward.user?.name || reward.userId}</span><input type="number" defaultValue={reward.approvedAmount ?? reward.suggestedAmount} onChange={(e) => reward.approvedAmount = Number(e.target.value)} className="w-28 rounded bg-gray-800 px-2 py-1" /></label>)}</div>
      <div className="mt-3 flex gap-3 text-sm">{claim.proofPaths?.map((proof: string) => <a key={proof} className="text-blue-400 underline" href={`${(process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api$/, '')}/storage/${proof}`} target="_blank" rel="noreferrer">View proof</a>)}</div>
    </Card>) : <Card className="p-6 text-gray-400">No result claims submitted for this tournament.</Card>}</div>
  </div></div>;
}
