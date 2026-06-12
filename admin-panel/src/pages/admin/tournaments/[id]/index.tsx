import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../../../store/auth';
import api from '../../../../lib/api';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import { Calendar, DollarSign, Users, Trophy, Eye, MapPin, ClipboardList } from 'lucide-react';
import TournamentWorkspaceTabs from '@/components/tournaments/TournamentWorkspaceTabs';

interface Tournament {
  id: string;
  title: string;
  description?: string;
  banner?: string;
  format: string;
  status: string;
  entryFee: number;
  prizePool: number;
  registeredTeams: number;
  maxTeams: number;
  startDate?: string;
  endDate?: string;
  registrationStart?: string;
  registrationEnd?: string;
  rules?: string[];
  maps?: string[];
  roomDetails?: {
    roomId: string;
    password: string;
  };
}

const formatDateTime = (value?: string) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

export default function ViewTournament() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuthStore();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentsSummary, setPaymentsSummary] = useState<any | null>(null);

  useEffect(() => {
    if (!user || !['ADMIN', 'ORGANIZER'].includes(user.role)) {
      router.push('/admin/login');
      return;
    }
    if (id) {
      fetchTournament();
      fetchPaymentsSummary();
    }
  }, [user, id]);

  const fetchPaymentsSummary = async () => {
    try {
      const res = await api.get(`/payments/tournament/${id}`);
      const rows = res.data || [];
      const pending = rows.filter((r: any) => r.status === 'PENDING').length;
      const completed = rows.filter((r: any) => r.status === 'COMPLETED');
      const totalCollected = completed.reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
      const latest = rows.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      setPaymentsSummary({ pending, totalCollected, latest });
    } catch (err) {
      // ignore silently
    }
  };

  const fetchTournament = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tournaments/${id}`);
      setTournament(response.data);
    } catch (err) {
      console.error(err);
      setError('Unable to load tournament details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading tournament...</div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
        <div className="max-w-xl text-center">
          <p className="text-red-400 mb-4">{error || 'Tournament not found.'}</p>
          <Button variant="outline" onClick={() => router.push('/admin/tournaments')}>
            Back to Tournaments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <TournamentWorkspaceTabs tournamentId={tournament.id} active="Overview" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Tournament Details</h1>
            <p className="text-gray-400">Review the tournament information and status.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={() => router.push('/admin/tournaments')}>
              Back to Tournaments
            </Button>
            <Button onClick={() => router.push(`/admin/tournaments/${tournament.id}/edit`)}>
              Edit Tournament
            </Button>
            <Button variant="outline" onClick={() => router.push(`/admin/tournaments/${tournament.id}/registrations`)}>
              View Registrations
            </Button>
            <Button variant="outline" onClick={() => router.push(`/admin/tournaments/${tournament.id}/payments`)}>
              View Payments
            </Button>
            <Button variant="outline" onClick={() => router.push(`/admin/tournaments/${tournament.id}/bracket`)}>
              View Bracket
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.6fr] gap-6">
          <Card className="p-6 space-y-6">
            {tournament.banner ? (
              <img
                src={tournament.banner}
                alt={tournament.title}
                className="w-full h-64 object-cover rounded-xl border border-gray-700"
              />
            ) : (
              <div className="w-full h-64 rounded-xl border border-dashed border-gray-700 bg-gray-800 flex items-center justify-center text-gray-500">
                No banner image provided
              </div>
            )}

            <div>
              <h2 className="text-3xl font-semibold mb-2">{tournament.title}</h2>
              <p className="text-gray-400">{tournament.description || 'No description available.'}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2 text-gray-300 mb-3">
                  <ClipboardList className="h-5 w-5 text-primary-400" />
                  <span className="font-semibold">Basic Info</span>
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <div><span className="text-gray-400">Status:</span> {tournament.status.replace('_', ' ')}</div>
                  <div><span className="text-gray-400">Format:</span> {tournament.format}</div>
                  <div><span className="text-gray-400">Entry Fee:</span> ৳{tournament.entryFee}</div>
                  <div><span className="text-gray-400">Prize Pool:</span> ৳{tournament.prizePool}</div>
                  <div><span className="text-gray-400">Teams:</span> {tournament.registeredTeams}/{tournament.maxTeams}</div>
                </div>
              </div>

              <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2 text-gray-300 mb-3">
                  <Calendar className="h-5 w-5 text-green-400" />
                  <span className="font-semibold">Schedule</span>
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <div><span className="text-gray-400">Registration:</span> {formatDateTime(tournament.registrationStart)} - {formatDateTime(tournament.registrationEnd)}</div>
                  <div><span className="text-gray-400">Event:</span> {formatDateTime(tournament.startDate)} - {formatDateTime(tournament.endDate)}</div>
                </div>
              </div>
            </div>

            {(tournament.rules?.length ?? 0) > 0 && (
              <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-800">
                <h3 className="text-lg font-semibold mb-3">Rules</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  {(tournament.rules || []).map((rule, index) => (
                    <li key={index}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}

            {(tournament.maps?.length ?? 0) > 0 && (
              <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-800">
                <h3 className="text-lg font-semibold mb-3">Maps</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  {(tournament.maps || []).map((map, index) => (
                    <li key={index}>{map}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-blue-400" />
              <h2 className="text-xl font-semibold">Tournament Summary</h2>
            </div>

            <div className="space-y-4 text-gray-300 text-sm">
              <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                  <span className="font-medium">Prize Pool</span>
                </div>
                <div className="text-lg">৳{tournament.prizePool}</div>
              </div>

              <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <span className="font-medium">Entry Fee</span>
                </div>
                <div className="text-lg">৳{tournament.entryFee}</div>
              </div>

              <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-purple-400" />
                  <span className="font-medium">Teams</span>
                </div>
                <div className="text-lg">{tournament.registeredTeams}/{tournament.maxTeams}</div>
              </div>

              {tournament.roomDetails ? (
                <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-800">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-red-400" />
                    <span className="font-medium">Room Details</span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-300">
                    <div>Room ID: {tournament.roomDetails.roomId}</div>
                    <div>Password: {tournament.roomDetails.password}</div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-800 text-sm text-gray-400">
                  No room details available.
                </div>
              )}
              {paymentsSummary && (
                <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-800">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    <span className="font-medium">Payments</span>
                  </div>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>Pending: <span className="text-white ml-2">{paymentsSummary.pending}</span></div>
                    <div>Total Collected: <span className="text-white ml-2">৳{paymentsSummary.totalCollected}</span></div>
                    {paymentsSummary.latest && (
                      <div className="text-xs text-gray-400">Latest: {new Date(paymentsSummary.latest.createdAt).toLocaleString()}</div>
                    )}
                    <div className="mt-3">
                      <Button size="sm" variant="outline" onClick={() => router.push(`/admin/tournaments/${tournament.id}/payments`)}>Open Payments</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
