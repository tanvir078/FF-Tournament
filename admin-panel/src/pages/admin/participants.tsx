import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  Users, CheckCircle, XCircle, Clock, Search, Filter, Eye, 
  AlertCircle, Trophy, Gamepad2, User, Calendar, Shield, MoreVertical,
  ExternalLink, Lock, Unlock
} from 'lucide-react';

interface Participant {
  id: string;
  userId: string;
  username: string;
  userEmail: string;
  uid?: string;
  ign?: string;
  tournamentId: string;
  tournamentName: string;
  teamName?: string;
  teamTag?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  joinedAt: string;
  format: 'SOLO' | 'DUO' | 'SQUAD' | 'CLASH_SQUAD';
}

export default function AdminParticipants() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [tournamentFilter, setTournamentFilter] = useState('ALL');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (!user || !['ADMIN', 'ORGANIZER'].includes(user.role)) {
      router.push('/admin/login');
      return;
    }
    fetchParticipants();
  }, [user]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/management/registrations');
      setParticipants((data || []).map((row: any) => ({
        ...row, username: row.user?.name || row.userId, userEmail: row.user?.email || '',
        uid: row.user?.uid, ign: row.user?.ign, tournamentName: row.tournament?.title || '',
        joinedAt: row.createdAt, format: row.tournament?.format || 'SOLO',
        paymentStatus: row.status === 'APPROVED' ? 'PAID' : row.status === 'REJECTED' ? 'FAILED' : 'PENDING',
      })));
    } catch (err) {
      console.error('Failed to fetch participants');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (participantId: string) => {
    try {
      await api.put(`/tournaments/registrations/${participantId}/approve`);
      fetchParticipants();
      alert('Participant approved successfully');
    } catch (err) {
      console.error('Failed to approve participant');
    }
  };

  const handleReject = async () => {
    if (!selectedParticipant || !rejectReason) return;
    
    try {
      await api.put(`/tournaments/registrations/${selectedParticipant.id}/reject`);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedParticipant(null);
      fetchParticipants();
      alert('Participant rejected successfully');
    } catch (err) {
      console.error('Failed to reject participant');
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'FAILED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'SOLO': return 'Solo';
      case 'DUO': return 'Duo';
      case 'SQUAD': return 'Squad';
      case 'CLASH_SQUAD': return 'Clash Squad';
      default: return format;
    }
  };

  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = 
      participant.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (participant.ign && participant.ign.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || participant.status === statusFilter;
    const matchesTournament = tournamentFilter === 'ALL' || participant.tournamentId === tournamentFilter;
    return matchesSearch && matchesStatus && matchesTournament;
  });

  const pendingCount = participants.filter(p => p.status === 'PENDING').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <div className="text-xl">Loading Participants...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Participant Management
          </h1>
          <p className="text-gray-400">Approve or reject tournament participants</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Clock className="h-4 w-4" />
              Pending Approval
            </div>
            <div className="text-3xl font-bold text-yellow-400">{pendingCount}</div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <CheckCircle className="h-4 w-4" />
              Approved
            </div>
            <div className="text-3xl font-bold text-green-400">
              {participants.filter(p => p.status === 'APPROVED').length}
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <XCircle className="h-4 w-4" />
              Rejected
            </div>
            <div className="text-3xl font-bold text-red-400">
              {participants.filter(p => p.status === 'REJECTED').length}
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Users className="h-4 w-4" />
              Total Participants
            </div>
            <div className="text-3xl font-bold text-blue-400">{participants.length}</div>
          </Card>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by username, email, or IGN..."
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
                value={tournamentFilter}
                onChange={(e) => setTournamentFilter(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="ALL">All Tournaments</option>
                <option value="t1">FF Pro League Season 1</option>
                <option value="t2">Weekly Clash Cup</option>
                <option value="t3">Solo Showdown</option>
              </select>
            </div>
          </div>
        </Card>

        {filteredParticipants.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No participants found</h3>
            <p className="text-gray-500">Adjust your filters to see more results</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredParticipants.map((participant) => (
              <Card key={participant.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(participant.status)}`}>
                        {participant.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(participant.paymentStatus)}`}>
                        {participant.paymentStatus}
                      </span>
                      <span className="text-sm text-gray-400">
                        {new Date(participant.joinedAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-blue-400" />
                        <span className="text-gray-300">{participant.username}</span>
                        <span className="text-gray-500">({participant.userEmail})</span>
                      </div>
                      {participant.ign && (
                        <div className="flex items-center gap-2 text-sm">
                          <Gamepad2 className="h-4 w-4 text-purple-400" />
                          <span className="text-gray-300">IGN: {participant.ign}</span>
                        </div>
                      )}
                      {participant.uid && (
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="h-4 w-4 text-green-400" />
                          <span className="text-gray-300">UID: {participant.uid}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="h-4 w-4 text-orange-400" />
                        <span className="text-gray-300">{participant.tournamentName}</span>
                      </div>
                      {participant.teamName && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-cyan-400" />
                          <span className="text-gray-300">{participant.teamName} {participant.teamTag}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Gamepad2 className="h-4 w-4 text-pink-400" />
                        <span className="text-gray-300">{getFormatLabel(participant.format)}</span>
                      </div>
                    </div>

                    {participant.status === 'REJECTED' && (
                      <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-red-400 text-sm">
                          <XCircle className="h-4 w-4" />
                          <span className="font-semibold">Registration Rejected</span>
                        </div>
                      </div>
                    )}

                    {participant.paymentStatus === 'FAILED' && (
                      <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-red-400 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-semibold">Payment Failed</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex lg:flex-col gap-2 min-w-[200px]">
                    {participant.status === 'PENDING' && participant.paymentStatus === 'PAID' && (
                      <>
                        <Button
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                          onClick={() => handleApprove(participant.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full text-red-400 border-red-400 hover:bg-red-400/10"
                          onClick={() => {
                            setSelectedParticipant(participant);
                            setShowRejectModal(true);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                    {participant.status === 'PENDING' && participant.paymentStatus === 'PENDING' && (
                      <Button variant="outline" className="w-full" disabled>
                        <Clock className="h-4 w-4 mr-2" />
                        Awaiting Payment
                      </Button>
                    )}
                    {participant.status === 'APPROVED' && (
                      <Button variant="outline" className="w-full" disabled>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approved
                      </Button>
                    )}
                    {participant.status === 'REJECTED' && (
                      <Button variant="outline" className="w-full text-red-400 border-red-400" disabled>
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejected
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => router.push(`/admin/users/${participant.userId}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
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
                <h2 className="text-xl font-bold">Reject Participant</h2>
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
                    placeholder="Enter the reason for rejecting this participant..."
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
                      setSelectedParticipant(null);
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
