import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import Button from '@/views/user/Desktop/_components/Button';
import Card from '@/views/user/Desktop/_components/Card';
import { Camera, Link as LinkIcon, Trophy } from 'lucide-react';

export default function ResultClaimPage() {
  const router = useRouter();
  const { id } = router.query;
  const [type, setType] = useState('PLACEMENT_KILLS');
  const [match, setMatch] = useState<any>(null);
  const [existingClaim, setExistingClaim] = useState<any>(null);
  const [placement, setPlacement] = useState('1');
  const [kills, setKills] = useState('0');
  const [homeScore, setHomeScore] = useState('0');
  const [awayScore, setAwayScore] = useState('0');
  const [winner, setWinner] = useState('');
  const [seriesScore, setSeriesScore] = useState('');
  const [proofs, setProofs] = useState<File[]>([]);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    if (!id) return;
    Promise.all([api.get(`/matches/${id}`), api.get('/result-claims/mine')]).then(([matchResponse, claimsResponse]) => {
      setMatch(matchResponse.data);
      setType(matchResponse.data.tournament?.scoringConfig?.type || matchResponse.data.tournament?.game?.scoringPreset?.type || 'PLACEMENT_KILLS');
      setExistingClaim((claimsResponse.data || []).find((claim: any) => claim.matchId === id));
    }).catch(() => undefined);
  }, [id]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!proofs.length) return setError('At least one screenshot is required.');
    const body = new FormData();
    if (type === 'SCORELINE') { body.append('homeScore', homeScore); body.append('awayScore', awayScore); }
    else if (type === 'SERIES_WINNER') { body.append('winner', winner); if (seriesScore) body.append('seriesScore', seriesScore); }
    else { body.append('placement', placement); body.append('kills', kills); }
    if (evidenceUrl) body.append('evidenceUrl', evidenceUrl);
    proofs.forEach((proof) => body.append('proofs[]', proof));
    try {
      setSubmitting(true); setError('');
      await api.post(`/matches/${id}/result-claims`, body, { headers: { 'Content-Type': 'multipart/form-data' } });
      router.push('/user/matches');
    } catch (err: any) {
      setError(err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat().join(' ') || 'Unable to submit claim.');
    } finally { setSubmitting(false); }
  };
  if (existingClaim) return <div className="min-h-screen bg-gray-950 px-4 py-8 text-white"><Card className="mx-auto max-w-xl p-6 text-center"><Trophy className="mx-auto mb-3 h-12 w-12 text-purple-400" /><h1 className="text-2xl font-bold">Claim Already Submitted</h1><p className="mt-2 text-gray-400">Status: {existingClaim.status}. Admin reward review will update your wallet activity.</p><Button className="mt-5" onClick={() => router.push('/user/matches')}>Back to Matches</Button></Card></div>;
  return <div className="min-h-screen bg-gray-950 text-white px-4 py-8"><Card className="max-w-xl mx-auto p-6">
    <h1 className="text-2xl font-bold mb-2">Submit Result Claim</h1><p className="text-sm text-gray-400 mb-5">Team tournaments must be submitted by the captain. Admin will verify your evidence before wallet credit.</p>
    {match && <div className="mb-5 rounded-lg bg-gray-900 p-4 text-sm text-gray-300"><div className="font-semibold text-white">{match.tournament?.title || match.tournamentName}</div><div>Match #{match.matchNumber} · {match.stage} · {match.map}</div><div>Scoring: {type.replace('_', ' ').toLowerCase()}</div></div>}
    <form onSubmit={submit} className="space-y-4">
      {type === 'SCORELINE' ? <><input type="number" min="0" value={homeScore} onChange={(e) => setHomeScore(e.target.value)} placeholder="Your score" className="w-full px-4 py-3 bg-gray-800 rounded-lg" /><input type="number" min="0" value={awayScore} onChange={(e) => setAwayScore(e.target.value)} placeholder="Opponent score" className="w-full px-4 py-3 bg-gray-800 rounded-lg" /></> : type === 'SERIES_WINNER' ? <><input value={winner} onChange={(e) => setWinner(e.target.value)} placeholder="Winning team" required className="w-full px-4 py-3 bg-gray-800 rounded-lg" /><input value={seriesScore} onChange={(e) => setSeriesScore(e.target.value)} placeholder="Series score, e.g. 2-1" className="w-full px-4 py-3 bg-gray-800 rounded-lg" /></> : <><input type="number" min="1" value={placement} onChange={(e) => setPlacement(e.target.value)} placeholder="Placement" className="w-full px-4 py-3 bg-gray-800 rounded-lg" /><input type="number" min="0" value={kills} onChange={(e) => setKills(e.target.value)} placeholder="Kills" className="w-full px-4 py-3 bg-gray-800 rounded-lg" /></>}
      <label className="block rounded-lg border border-dashed border-gray-700 bg-gray-900 p-4 text-sm text-gray-300"><span className="mb-2 flex items-center gap-2 font-semibold text-white"><Camera className="h-4 w-4" />Required screenshots</span><input type="file" multiple accept="image/*" onChange={(e) => setProofs(Array.from(e.target.files || []))} className="w-full text-sm" /><span className="mt-2 block text-xs text-gray-500">{proofs.length ? `${proofs.length} screenshot(s) selected` : 'At least one screenshot is required.'}</span></label><label className="block"><span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-300"><LinkIcon className="h-4 w-4" />Optional evidence URL</span><input value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)} placeholder="Video, stream, or album URL" className="w-full px-4 py-3 bg-gray-800 rounded-lg" /></label>
      {error && <p className="text-sm text-red-400">{error}</p>}<div className="flex gap-2"><Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Claim'}</Button><Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button></div>
    </form>
  </Card></div>;
}
