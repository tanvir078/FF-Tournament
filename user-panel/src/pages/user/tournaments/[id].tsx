import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { 
  Trophy, Calendar, Users, Clock, MapPin, ArrowLeft, Share2, 
  Copy, Check, Gamepad2, DollarSign, Target, Shield, Info, 
  Flame, Star, Lock, Eye, EyeOff, Upload, X, ArrowRight
} from 'lucide-react';

interface Tournament {
  id: string;
  name: string;
  description: string;
  format: string;
  entryFee: number;
  prizePool: number;
  perKillReward: number;
  maxTeams: number;
  registeredTeams: number;
  status: string;
  startDate: string;
  startTime: string;
  registrationDeadline: string;
  rules: string[];
  maps: string[];
  banner?: string;
  isFree: boolean;
  isFeatured: boolean;
  roomDetails?: {
    roomId: string;
    password: string;
  };
  paymentMethods: string[];
}

export default function TournamentDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuthStore();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    method: 'bkash',
    transactionId: '',
    screenshot: null as File | null
  });
  const [copied, setCopied] = useState(false);
  const [showRoomDetails, setShowRoomDetails] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTournament();
    }
  }, [id]);

  const fetchTournament = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tournaments/${id}`);
      setTournament(response.data);
      checkRegistrationStatus();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tournament');
    } finally {
      setLoading(false);
    }
  };

  const checkRegistrationStatus = async () => {
    try {
      const response = await api.get(`/tournaments/${id}/registration-status`);
      setIsRegistered(response.data.isRegistered);
    } catch (err) {
      setIsRegistered(false);
    }
  };

  const handleJoinTournament = async () => {
    if (!user) {
      router.push('/user/login');
      return;
    }

    if (!tournament) return;

    // Validation checks
    if (tournament.status !== 'UPCOMING') {
      setError('This tournament is not accepting registrations');
      return;
    }

    if (tournament.registeredTeams >= tournament.maxTeams) {
      setError('This tournament is full');
      return;
    }

    if (new Date(tournament.registrationDeadline) < new Date()) {
      setError('Registration deadline has passed');
      return;
    }

    if (tournament.format === 'SQUAD' || tournament.format === 'CLASH_SQUAD') {
      // Check if user has a team
      try {
        const teamResponse = await api.get('/teams/my-team');
        if (!teamResponse.data) {
          setError('You need to create a team to join this tournament');
          return;
        }
      } catch (err) {
        setError('You need to create a team to join this tournament');
        return;
      }
    }

    if (tournament?.isFree) {
      // Free tournament - direct join
      try {
        await api.post(`/tournaments/${id}/join`);
        setIsRegistered(true);
        checkRegistrationStatus();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to join tournament');
      }
    } else {
      // Paid tournament - show payment modal
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentData.transactionId) {
      setError('Transaction ID is required');
      return;
    }

    if (!paymentData.screenshot) {
      setError('Payment screenshot is required');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('method', paymentData.method);
      formData.append('transactionId', paymentData.transactionId);
      if (paymentData.screenshot) {
        formData.append('screenshot', paymentData.screenshot);
      }

      await api.post(`/tournaments/${id}/join`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setShowPaymentModal(false);
      setPaymentData({ method: 'bkash', transactionId: '', screenshot: null });
      setIsRegistered(true);
      checkRegistrationStatus();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit payment');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'UPCOMING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'COMPLETED': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'CANCELLED': return 'bg-red-900/20 text-red-400 border-red-500/30';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-red-500">{error || 'Tournament not found'}</div>
      </div>
    );
  }

  const isRegistrationOpen = new Date(tournament.registrationDeadline) > new Date();
  const isFull = tournament.registeredTeams >= tournament.maxTeams;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/user/tournaments" className="text-blue-400 hover:text-blue-300 mb-4 inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Tournaments
        </Link>

        {tournament.banner && (
          <div className="w-full h-64 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl mb-6 overflow-hidden flex items-center justify-center">
            <Gamepad2 className="h-24 w-24 text-white/20" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  {tournament.isFeatured && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-semibold text-yellow-400">FEATURED</span>
                    </div>
                  )}
                  <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    {tournament.name}
                  </h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(tournament.status)}`}>
                      {tournament.status === 'LIVE' && <Flame className="inline h-3 w-3 mr-1 animate-pulse" />}
                      {tournament.status}
                    </span>
                    <span className="text-sm text-gray-400">{getFormatLabel(tournament.format)}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="flex items-center gap-2"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Share'}
                </Button>
              </div>

              <p className="text-gray-300 mb-6">{tournament.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Gamepad2 className="h-4 w-4" />
                    Format
                  </div>
                  <div className="text-xl font-bold">{getFormatLabel(tournament.format)}</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <DollarSign className="h-4 w-4" />
                    Entry Fee
                  </div>
                  <div className="text-xl font-bold">
                    {tournament.isFree ? (
                      <span className="text-green-400">FREE</span>
                    ) : (
                      `৳${tournament.entryFee}`
                    )}
                  </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Trophy className="h-4 w-4" />
                    Prize Pool
                  </div>
                  <div className="text-xl font-bold text-green-400">৳{tournament.prizePool.toLocaleString()}</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Target className="h-4 w-4" />
                    Per Kill
                  </div>
                  <div className="text-xl font-bold text-blue-400">৳{tournament.perKillReward}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Users className="h-4 w-4" />
                    Teams
                  </div>
                  <div className="text-xl font-bold">{tournament.registeredTeams}/{tournament.maxTeams}</div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" 
                      style={{ width: `${(tournament.registeredTeams / tournament.maxTeams) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Calendar className="h-4 w-4" />
                    Start Time
                  </div>
                  <div className="text-xl font-bold">{tournament.startDate}</div>
                  <div className="text-sm text-gray-400">{tournament.startTime}</div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Schedule
                </h2>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="h-4 w-4" />
                    <span>Registration Deadline: {tournament.registrationDeadline}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 mt-2">
                    <Clock className="h-4 w-4" />
                    <span>Match Start: {tournament.startDate} at {tournament.startTime}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Rules
                </h2>
                <ul className="space-y-2">
                  {tournament.rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300 bg-gray-800 p-3 rounded-lg">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Maps
                </h2>
                <div className="flex flex-wrap gap-2">
                  {tournament.maps.map((map, index) => (
                    <span key={index} className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 py-2 rounded-full text-sm border border-blue-500/30">
                      {map}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            {isRegistered && tournament.roomDetails && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Room Details
                </h2>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Room ID:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg">{showRoomDetails ? tournament.roomDetails.roomId : '••••••••'}</span>
                      <button onClick={() => setShowRoomDetails(!showRoomDetails)} className="text-gray-400 hover:text-white">
                        {showRoomDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Password:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg">{showRoomDetails ? tournament.roomDetails.password : '••••••••'}</span>
                      <button onClick={() => setShowRoomDetails(!showRoomDetails)} className="text-gray-400 hover:text-white">
                        {showRoomDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Actions</h2>

              {isRegistered ? (
                <div className="bg-green-500/20 border border-green-500 p-4 rounded-lg mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-5 w-5 text-green-400" />
                    <p className="text-green-400 font-semibold">Registered!</p>
                  </div>
                  <p className="text-sm text-gray-300">You have successfully joined this tournament. Room details will be available before the match.</p>
                </div>
              ) : isFull ? (
                <div className="bg-red-500/20 border border-red-500 p-4 rounded-lg mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <X className="h-5 w-5 text-red-400" />
                    <p className="text-red-400 font-semibold">Registration Full</p>
                  </div>
                  <p className="text-sm text-gray-300">All spots have been taken. Try joining another tournament.</p>
                </div>
              ) : !isRegistrationOpen ? (
                <div className="bg-yellow-500/20 border border-yellow-500 p-4 rounded-lg mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-5 w-5 text-yellow-400" />
                    <p className="text-yellow-400 font-semibold">Registration Closed</p>
                  </div>
                  <p className="text-sm text-gray-300">Registration deadline has passed.</p>
                </div>
              ) : (
                <>
                  <Button
                    onClick={handleJoinTournament}
                    className="w-full mb-4 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={!user}
                  >
                    {user ? 'Join Tournament' : 'Login to Join'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  {!tournament.isFree && (
                    <div className="bg-gray-800 p-4 rounded-lg mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">Entry Fee:</span>
                        <span className="font-bold text-lg">৳{tournament.entryFee}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Payment via: {tournament.paymentMethods.join(', ')}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="border-t border-gray-700 pt-4 mt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Tournament Info
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Format:</span>
                    <span>{getFormatLabel(tournament.format)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Teams:</span>
                    <span>{tournament.maxTeams}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Per Kill:</span>
                    <span className="text-green-400">৳{tournament.perKillReward}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Complete Payment</h2>
                <Button variant="outline" size="sm" onClick={() => setShowPaymentModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
                  <select
                    value={paymentData.method}
                    onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="rocket">Rocket</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Transaction ID</label>
                  <input
                    type="text"
                    required
                    value={paymentData.transactionId}
                    onChange={(e) => setPaymentData({ ...paymentData, transactionId: e.target.value })}
                    placeholder="Enter your transaction ID"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Payment Screenshot</label>
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPaymentData({ ...paymentData, screenshot: e.target.files?.[0] || null })}
                      className="hidden"
                      id="screenshot"
                    />
                    <label htmlFor="screenshot" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Click to upload screenshot</p>
                      {paymentData.screenshot && (
                        <p className="text-sm text-green-400 mt-2">{paymentData.screenshot.name}</p>
                      )}
                    </label>
                  </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Amount to Pay:</span>
                    <span className="font-bold text-lg">৳{tournament.entryFee}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Send payment to: 017XXXXXXXX (bKash)
                  </p>
                </div>
                <Button type="submit" className="w-full">
                  Submit Payment
                </Button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
