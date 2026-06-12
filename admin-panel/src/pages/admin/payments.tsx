import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  DollarSign, CheckCircle, XCircle, Clock, Image as ImageIcon, 
  Search, Filter, Eye, Download, AlertCircle, CreditCard, User, 
  Calendar, Trophy, MoreVertical, ExternalLink
} from 'lucide-react';

interface Payment {
  id: string;
  type: 'TOURNAMENT_ENTRY' | 'DEPOSIT' | 'WITHDRAWAL';
  userId: string;
  username: string;
  userEmail: string;
  amount: number;
  method: string;
  transactionId: string;
  screenshot?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  tournamentId?: string;
  tournamentName?: string;
  createdAt: string;
  description?: string;
}

export default function AdminPayments() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }
    fetchPayments();
  }, [user]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/payments');
      setPayments((data.data || []).map((row: any) => ({
        id: row.id, type: 'DEPOSIT', userId: row.wallet?.userId || '',
        username: row.wallet?.user?.name || row.wallet?.userId || 'User',
        userEmail: row.wallet?.user?.email || '', amount: Number(row.amount),
        method: row.metadata?.method || 'manual', transactionId: row.reference || '',
        status: row.status === 'COMPLETED' ? 'APPROVED' : row.status === 'FAILED' ? 'REJECTED' : 'PENDING',
        createdAt: row.createdAt, description: row.description,
      })));
    } catch (err) {
      console.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId: string) => {
    try {
      await api.patch(`/admin/payments/${paymentId}`, { status: 'COMPLETED' });
      fetchPayments();
      alert('Payment approved successfully');
    } catch (err) {
      console.error('Failed to approve payment');
    }
  };

  const handleReject = async () => {
    if (!selectedPayment || !rejectReason) return;
    
    try {
      await api.patch(`/admin/payments/${selectedPayment.id}`, { 
        status: 'FAILED',
        rejectReason 
      });
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedPayment(null);
      fetchPayments();
      alert('Payment rejected successfully');
    } catch (err) {
      console.error('Failed to reject payment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'REJECTED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TOURNAMENT_ENTRY': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'DEPOSIT': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'WITHDRAWAL': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'TOURNAMENT_ENTRY': return 'Tournament Entry';
      case 'DEPOSIT': return 'Deposit';
      case 'WITHDRAWAL': return 'Withdrawal';
      default: return type;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || payment.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingCount = payments.filter(p => p.status === 'PENDING').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <div className="text-xl">Loading Payments...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Payment Verification
          </h1>
          <p className="text-gray-400">Review and verify user payment requests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Clock className="h-4 w-4" />
              Pending
            </div>
            <div className="text-3xl font-bold text-yellow-400">{pendingCount}</div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <CheckCircle className="h-4 w-4" />
              Approved Today
            </div>
            <div className="text-3xl font-bold text-green-400">
              {payments.filter(p => p.status === 'APPROVED').length}
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <XCircle className="h-4 w-4" />
              Rejected Today
            </div>
            <div className="text-3xl font-bold text-red-400">
              {payments.filter(p => p.status === 'REJECTED').length}
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <DollarSign className="h-4 w-4" />
              Total Volume
            </div>
            <div className="text-3xl font-bold text-blue-400">
              ৳{payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
            </div>
          </Card>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by username, email, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="ALL">All Types</option>
                <option value="TOURNAMENT_ENTRY">Tournament Entry</option>
                <option value="DEPOSIT">Deposit</option>
                <option value="WITHDRAWAL">Withdrawal</option>
              </select>
            </div>
          </div>
        </Card>

        {filteredPayments.length === 0 ? (
          <Card className="p-12 text-center">
            <DollarSign className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No payments found</h3>
            <p className="text-gray-500">Adjust your filters to see more results</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <Card key={payment.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(payment.type)}`}>
                        {getTypeLabel(payment.type)}
                      </span>
                      <span className="text-sm text-gray-400">
                        {new Date(payment.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-blue-400" />
                        <span className="text-gray-300">{payment.username}</span>
                        <span className="text-gray-500">({payment.userEmail})</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-green-400" />
                        <span className="text-gray-300 font-semibold">৳{payment.amount}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="h-4 w-4 text-purple-400" />
                        <span className="text-gray-300">{payment.method}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <ExternalLink className="h-4 w-4 text-yellow-400" />
                        <span className="text-gray-300 font-mono">{payment.transactionId}</span>
                      </div>
                    </div>

                    {payment.tournamentName && (
                      <div className="flex items-center gap-2 text-sm mb-4">
                        <Trophy className="h-4 w-4 text-orange-400" />
                        <span className="text-gray-300">{payment.tournamentName}</span>
                      </div>
                    )}

                    {payment.screenshot && (
                      <div className="bg-gray-800 p-4 rounded-lg mb-4">
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                          <ImageIcon className="h-4 w-4" />
                          <span>Payment Screenshot</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-32 h-20 bg-gray-700 rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-gray-500" />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(payment.screenshot, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Full
                          </Button>
                        </div>
                      </div>
                    )}

                    {payment.status === 'REJECTED' && (
                      <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-red-400 text-sm">
                          <XCircle className="h-4 w-4" />
                          <span className="font-semibold">Rejected</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex lg:flex-col gap-2 min-w-[200px]">
                    {payment.status === 'PENDING' && (
                      <>
                        <Button
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                          onClick={() => handleApprove(payment.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full text-red-400 border-red-400 hover:bg-red-400/10"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowRejectModal(true);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                    {payment.status === 'APPROVED' && (
                      <Button variant="outline" className="w-full" disabled>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approved
                      </Button>
                    )}
                    {payment.status === 'REJECTED' && (
                      <Button variant="outline" className="w-full text-red-400 border-red-400" disabled>
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejected
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Reject Payment</h2>
                <Button variant="outline" size="sm" onClick={() => setShowRejectModal(false)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Reason for Rejection</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter the reason for rejecting this payment..."
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={handleReject}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Confirm Reject
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectReason('');
                      setSelectedPayment(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
