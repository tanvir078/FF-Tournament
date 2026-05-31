import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/auth';
import api from '../../lib/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Check, X, DollarSign, Clock, User, AlertCircle } from 'lucide-react';

interface WithdrawRequest {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  amount: number;
  method: string;
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
  mobileNumber?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'COMPLETED';
  rejectionReason?: string;
  adminNote?: string;
  createdAt: string;
  processedAt?: string;
}

export default function WithdrawalManagement() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalProcessedAmount: 0,
  });

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }
    fetchWithdrawals();
    fetchStats();
  }, [user, filter]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const endpoint = filter === 'ALL' ? '/withdraw' : `/withdraw?status=${filter}`;
      const response = await api.get(endpoint);
      setWithdrawals(response.data || []);
    } catch (err) {
      console.error('Failed to fetch withdrawals');
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/withdraw/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const handleApprove = async (withdrawalId: string) => {
    if (!confirm('Are you sure you want to approve this withdrawal?')) return;
    
    try {
      await api.put(`/withdraw/${withdrawalId}`, { status: 'APPROVED' });
      fetchWithdrawals();
      fetchStats();
      alert('Withdrawal approved successfully');
    } catch (err) {
      alert('Failed to approve withdrawal');
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal) return;
    
    try {
      await api.put(`/withdraw/${selectedWithdrawal.id}`, {
        status: 'REJECTED',
        rejectionReason,
      });
      setShowRejectModal(false);
      setSelectedWithdrawal(null);
      setRejectionReason('');
      fetchWithdrawals();
      fetchStats();
      alert('Withdrawal rejected successfully');
    } catch (err) {
      alert('Failed to reject withdrawal');
    }
  };

  const openRejectModal = (withdrawal: WithdrawRequest) => {
    setSelectedWithdrawal(withdrawal);
    setShowRejectModal(true);
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Withdrawal Management</h1>
          <Button variant="outline" onClick={() => router.push('/admin')}>
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Clock className="h-4 w-4" />
              Pending
            </div>
            <div className="text-3xl font-bold text-yellow-400">{stats.pending}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Check className="h-4 w-4" />
              Approved
            </div>
            <div className="text-3xl font-bold text-green-400">{stats.approved}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <X className="h-4 w-4" />
              Rejected
            </div>
            <div className="text-3xl font-bold text-red-400">{stats.rejected}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <DollarSign className="h-4 w-4" />
              Total Processed
            </div>
            <div className="text-3xl font-bold text-blue-400">
              ৳{stats.totalProcessedAmount.toFixed(0)}
            </div>
          </Card>
        </div>

        <div className="mb-6">
          <div className="flex space-x-4 items-center">
            <label className="text-gray-400">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="ALL">All</option>
            </select>
          </div>
        </div>

        <Card className="p-6">
          {withdrawals.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No withdrawals found</p>
          ) : (
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="bg-gray-800 p-6 rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-2xl font-bold text-white">৳{withdrawal.amount.toFixed(0)}</div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          withdrawal.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                          withdrawal.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                          withdrawal.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                          withdrawal.status === 'PROCESSING' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {withdrawal.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <User className="h-4 w-4" />
                          <span>{withdrawal.user?.name || withdrawal.user?.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <DollarSign className="h-4 w-4" />
                          <span>Method: {withdrawal.method}</span>
                        </div>
                        {withdrawal.accountNumber && (
                          <div className="flex items-center gap-2 text-gray-400">
                            <span>Account: {withdrawal.accountNumber}</span>
                          </div>
                        )}
                        {withdrawal.mobileNumber && (
                          <div className="flex items-center gap-2 text-gray-400">
                            <span>Mobile: {withdrawal.mobileNumber}</span>
                          </div>
                        )}
                        {withdrawal.bankName && (
                          <div className="flex items-center gap-2 text-gray-400">
                            <span>Bank: {withdrawal.bankName}</span>
                          </div>
                        )}
                        {withdrawal.accountName && (
                          <div className="flex items-center gap-2 text-gray-400">
                            <span>Account Name: {withdrawal.accountName}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-400">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(withdrawal.createdAt).toLocaleString()}</span>
                        </div>
                      </div>

                      {withdrawal.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <div className="flex items-center gap-2 text-red-400 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            <span>Reason: {withdrawal.rejectionReason}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {withdrawal.status === 'PENDING' && (
                      <div className="flex space-x-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(withdrawal.id)}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openRejectModal(withdrawal)}
                          className="text-red-400 border-red-400 hover:bg-red-400/10"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {showRejectModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Reject Withdrawal</h2>
            <div className="mb-4">
              <p className="text-gray-400 mb-2">Amount: ৳{selectedWithdrawal.amount.toFixed(0)}</p>
              <p className="text-gray-400 mb-4">User: {selectedWithdrawal.user?.name || selectedWithdrawal.user?.email}</p>
              <label className="block text-sm font-medium text-gray-300 mb-2">Rejection Reason</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter reason for rejection..."
              />
            </div>
            <div className="flex gap-4">
              <Button onClick={handleReject} className="flex-1">
                Confirm Reject
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedWithdrawal(null);
                  setRejectionReason('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
