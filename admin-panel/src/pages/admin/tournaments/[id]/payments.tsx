import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../../../store/auth';
import api from '../../../../lib/api';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';

export default function PaymentsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }
    if (id) fetchPayments();
  }, [user, id]);

  const serverBase = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api').replace(/\/api$/, '');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/payments/tournament/${id}`);
      setPayments(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (paymentId: string, status: string) => {
    try {
      await api.put(`/payments/${paymentId}/status`, { status });
      fetchPayments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Payments</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/admin/tournaments/${id}`)}>Back</Button>
            <Button onClick={fetchPayments}>Refresh</Button>
          </div>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded mb-4">{error}</div>}

        <Card className="p-4">
          {loading ? (
            <div>Loading...</div>
          ) : payments.length ? (
            <div className="space-y-3">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-gray-800 p-3 rounded">
                  <div>
                    <div className="font-medium">User: {p.userId}</div>
                    <div className="text-sm text-gray-400">Transaction: {p.transactionId}</div>
                    <div className="text-sm text-gray-400">Amount: {p.amount} {p.currency}</div>
                    <div className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleString()}</div>
                    {p.screenshotPath && (
                      <div className="mt-2">
                        <a className="text-blue-400 underline" href={`${serverBase}/storage/${p.screenshotPath}`} target="_blank" rel="noreferrer">View Screenshot</a>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {p.status !== 'COMPLETED' && (
                      <Button size="sm" onClick={() => updateStatus(p.id, 'COMPLETED')}>Mark Completed</Button>
                    )}
                    {p.status !== 'FAILED' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(p.id, 'FAILED')}>Mark Failed</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No payments found</div>
          )}
        </Card>
      </div>
    </div>
  );
}
