import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../../store/auth';
import api from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

export default function DepositsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');
  const [tournamentFilter, setTournamentFilter] = useState('');
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }
    fetchDeposits();
  }, [user]);

  const serverBase = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api').replace(/\/api$/, '');

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (tournamentFilter) params.tournamentId = tournamentFilter;
      if (fromFilter) params.from = fromFilter;
      if (toFilter) params.to = toFilter;
      const res = await api.get('/payments', { params });
      setDeposits(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load deposits');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/payments/${id}/status`, { status });
      fetchDeposits();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Deposit Management</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/admin')}>Back</Button>
            <Button onClick={fetchDeposits}>Refresh</Button>
          </div>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded mb-4">{error}</div>}

        <Card className="p-4">
          <div className="flex gap-2 items-end mb-4">
            <div>
              <label className="text-sm text-gray-400">Status</label>
              <select className="block mt-1 p-2 bg-gray-800 rounded" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400">Tournament ID</label>
              <input className="block mt-1 p-2 bg-gray-800 rounded" value={tournamentFilter} onChange={(e) => setTournamentFilter(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-400">From</label>
              <input type="date" className="block mt-1 p-2 bg-gray-800 rounded" value={fromFilter} onChange={(e) => setFromFilter(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-400">To</label>
              <input type="date" className="block mt-1 p-2 bg-gray-800 rounded" value={toFilter} onChange={(e) => setToFilter(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Per page</label>
              <select className="block mt-1 p-2 bg-gray-800 rounded" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div>
              <Button onClick={() => { setPage(1); fetchDeposits(); }}>Apply</Button>
            </div>
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : deposits.length ? (
            <div className="space-y-3">
              {deposits.map((d) => (
                <div key={d.id} className="flex items-center justify-between bg-gray-800 p-3 rounded">
                  <div>
                    <div className="font-medium">User: {d.userId}</div>
                    <div className="text-sm text-gray-400">Tournament: {d.tournamentId}</div>
                    <div className="text-sm text-gray-400">Transaction: {d.transactionId}</div>
                    <div className="text-sm text-gray-400">Amount: {d.amount} {d.currency}</div>
                    <div className="text-xs text-gray-500">{new Date(d.createdAt).toLocaleString()}</div>
                    {d.screenshotPath && (
                      <div className="mt-2"><a className="text-blue-400 underline" href={`${serverBase}/storage/${d.screenshotPath}`} target="_blank" rel="noreferrer">View Screenshot</a></div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {d.status !== 'COMPLETED' && (
                      <Button size="sm" onClick={() => updateStatus(d.id, 'COMPLETED')}>Complete</Button>
                    )}
                    {d.status !== 'FAILED' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(d.id, 'FAILED')}>Fail</Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => router.push(`/admin/tournaments/${d.tournamentId}/payments`)}>Open Tournament</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No deposits found</div>
          )}
        </Card>
      </div>
    </div>
  );
}
