import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../../../store/auth';
import api from '../../../../lib/api';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import TournamentWorkspaceTabs from '@/components/tournaments/TournamentWorkspaceTabs';

export default function RegistrationsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !['ADMIN', 'ORGANIZER'].includes(user.role)) {
      router.push('/admin/login');
      return;
    }
    if (id) fetchRegistrations();
  }, [user, id]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tournaments/${id}/registrations`);
      setRegistrations(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const approve = async (regId: string) => {
    try {
      await api.put(`/tournaments/registrations/${regId}/approve`);
      fetchRegistrations();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve');
    }
  };

  const reject = async (regId: string) => {
    if (!confirm('Reject this registration?')) return;
    try {
      await api.put(`/tournaments/registrations/${regId}/reject`);
      fetchRegistrations();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject');
    }
  };

  const exportCsv = () => {
    const rows = registrations.map((registration) => ({
      player: registration.user?.platformHandle || registration.user?.name || registration.userId,
      status: registration.status,
      checkIn: registration.checkInStatus || 'NOT_REQUIRED',
      gameProfile: registration.gameProfile?.ign || registration.ffUid || '',
      team: registration.lineup?.team?.name || '',
      starters: (registration.lineup?.members || [])
        .filter((member: any) => member.role === 'STARTER')
        .map((member: any) => member.user?.platformHandle || member.user?.name || member.userId)
        .join(' | '),
      substitutes: (registration.lineup?.members || [])
        .filter((member: any) => member.role === 'SUBSTITUTE')
        .map((member: any) => member.user?.platformHandle || member.user?.name || member.userId)
        .join(' | '),
      registeredAt: registration.createdAt,
    }));
    const header = Object.keys(rows[0] || { player: '', status: '', checkIn: '', gameProfile: '', team: '', starters: '', substitutes: '', registeredAt: '' });
    const csv = [header.join(','), ...rows.map((row: any) => header.map((key) => `"${String(row[key] || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `tournament-${id}-registrations.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <TournamentWorkspaceTabs tournamentId={String(id)} active="Registrations" />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Registrations</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/admin/tournaments/${id}`)}>Back</Button>
            <Button variant="outline" onClick={exportCsv} disabled={!registrations.length}>Export CSV</Button>
            <Button onClick={fetchRegistrations}>Refresh</Button>
          </div>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded mb-4">{error}</div>}

        <Card className="p-4">
          {loading ? (
            <div>Loading...</div>
          ) : registrations.length ? (
            <div className="space-y-3">
              {registrations.map((r) => (
                <div key={r.id} className="flex flex-col gap-3 bg-gray-800 p-3 rounded lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="font-medium">{r.user?.platformHandle || r.user?.name || r.userId}</div>
                    <div className="mt-1 text-sm text-gray-400">
                      Status: {r.status} · Check-in: {r.checkInStatus || 'NOT_REQUIRED'} · Transaction: {r.transactionId || 'N/A'}
                    </div>
                    <div className="text-sm text-blue-300">
                      Profile: {r.gameProfile?.ign || r.ffUid || 'Not linked'}
                      {r.gameProfile?.region ? ` · ${r.gameProfile.region}` : ''}
                      {r.gameProfile?.verificationStatus ? ` · ${r.gameProfile.verificationStatus}` : ''}
                    </div>
                    {r.lineup?.team && (
                      <div className="mt-2 rounded bg-gray-900/70 p-3 text-sm">
                        <div className="font-semibold text-white">{r.lineup.team.name}</div>
                        <div className="mt-1 text-gray-400">
                          Starters: {(r.lineup.members || []).filter((member: any) => member.role === 'STARTER').map((member: any) => member.user?.platformHandle || member.user?.name || member.userId).join(', ') || 'None'}
                        </div>
                        <div className="text-gray-500">
                          Subs: {(r.lineup.members || []).filter((member: any) => member.role === 'SUBSTITUTE').map((member: any) => member.user?.platformHandle || member.user?.name || member.userId).join(', ') || 'None'}
                        </div>
                      </div>
                    )}
                    <div className="mt-1 text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {r.status !== 'APPROVED' && (
                      <Button size="sm" onClick={() => approve(r.id)}>Approve</Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => reject(r.id)}>Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No registrations found</div>
          )}
        </Card>
      </div>
    </div>
  );
}
