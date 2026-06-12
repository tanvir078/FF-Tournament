import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Calendar, CheckCircle2, Clock3, Eye, EyeOff, Flame, Lock, Trophy, Users } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Button from '@/views/user/Desktop/_components/Button';
import Card from '@/views/user/Desktop/_components/Card';

type JoinedTournament = {
  id: string;
  name?: string;
  title?: string;
  format?: string;
  entryFee?: number | string;
  prizePool?: number | string;
  status: string;
  startDate?: string;
  startTime?: string;
  registrationStatus: string;
  checkInStatus?: string;
  roomDetails?: { roomId?: string; password?: string };
  competitionMode?: string;
  currentStage?: string;
  game?: { name?: string; lobbyLabels?: { roomId?: string; password?: string } };
  gameMode?: { name?: string };
};

type Section = {
  id: 'checkin' | 'playing' | 'registered' | 'completed';
  title: string;
  description: string;
  items: JoinedTournament[];
};

export default function MyTournamentsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [tournaments, setTournaments] = useState<JoinedTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRoom, setShowRoom] = useState<Record<string, boolean>>({});
  const [checkingIn, setCheckingIn] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) {
      router.push('/user/login');
      return;
    }

    api.get('/tournaments/my-registrations')
      .then(({ data }) => setTournaments(normalizeRegistrations(data)))
      .catch(() => setTournaments([]))
      .finally(() => setLoading(false));
  }, [router, user]);

  const sections = useMemo(() => buildSections(tournaments), [tournaments]);

  const checkIn = async (item: JoinedTournament) => {
    setCheckingIn((current) => ({ ...current, [item.id]: true }));
    try {
      await api.post(`/tournaments/${item.id}/check-in`);
      const { data } = await api.get('/tournaments/my-registrations');
      setTournaments(normalizeRegistrations(data));
    } finally {
      setCheckingIn((current) => ({ ...current, [item.id]: false }));
    }
  };

  if (loading) {
    return <div className="grid min-h-full place-items-center bg-gray-950 text-white">Loading tournaments...</div>;
  }

  return (
    <div className="min-h-full bg-gray-950 text-white">
      <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        <header className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.24),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(17,24,39,0.9))] p-7">
          <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary-300">My Tournaments</p>
              <h1 className="mt-2 text-4xl font-black">Tournament Hub</h1>
              <p className="mt-2 max-w-2xl text-gray-400">Track joined events, check-in, live rooms, brackets, and completed runs from one flow.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Metric icon={Trophy} label="Joined" value={tournaments.length} />
              <Metric icon={CheckCircle2} label="Approved" value={tournaments.filter((item) => item.registrationStatus === 'APPROVED').length} />
              <Metric icon={Lock} label="Rooms" value={tournaments.filter((item) => item.roomDetails?.roomId).length} />
            </div>
          </div>
        </header>

        {tournaments.length ? (
          <div className="space-y-8">
            {sections.map((section) => (
              <TournamentSection
                key={section.id}
                section={section}
                showRoom={showRoom}
                toggleRoom={(id) => setShowRoom((current) => ({ ...current, [id]: !current[id] }))}
                open={(item) => router.push(resolveTournamentLink(item))}
                checkIn={checkIn}
                checkingIn={checkingIn}
              />
            ))}
          </div>
        ) : (
          <Card className="border-white/10 bg-gray-900/80 p-12 text-center">
            <Trophy className="mx-auto mb-4 h-16 w-16 text-gray-600" />
            <h3 className="text-2xl font-black text-gray-200">No joined tournaments</h3>
            <p className="mt-2 text-gray-500">Join an open tournament to start tracking your flow here.</p>
            <Button className="mt-6" onClick={() => router.push('/user/tournaments')}>Browse Tournaments</Button>
          </Card>
        )}
      </div>
    </div>
  );
}

function TournamentSection({
  section,
  showRoom,
  toggleRoom,
  open,
  checkIn,
  checkingIn,
}: {
  section: Section;
  showRoom: Record<string, boolean>;
  toggleRoom: (id: string) => void;
  open: (item: JoinedTournament) => void;
  checkIn: (item: JoinedTournament) => void;
  checkingIn: Record<string, boolean>;
}) {
  if (!section.items.length) return null;

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">{section.title}</h2>
          <p className="mt-1 text-sm text-gray-500">{section.description}</p>
        </div>
        <span className="text-sm font-bold text-gray-500">{section.items.length} active</span>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {section.items.map((item) => (
          <TournamentCard
            key={item.id}
            item={item}
            showRoom={Boolean(showRoom[item.id])}
            toggleRoom={() => toggleRoom(item.id)}
            open={() => open(item)}
            checkIn={() => checkIn(item)}
            checkingIn={Boolean(checkingIn[item.id])}
          />
        ))}
      </div>
    </section>
  );
}

function TournamentCard({
  item,
  showRoom,
  toggleRoom,
  open,
  checkIn,
  checkingIn,
}: {
  item: JoinedTournament;
  showRoom: boolean;
  toggleRoom: () => void;
  open: () => void;
  checkIn: () => void;
  checkingIn: boolean;
}) {
  const roomIdLabel = item.game?.lobbyLabels?.roomId || 'Room ID';
  const passwordLabel = item.game?.lobbyLabels?.password || 'Password';
  const linkLabel = resolveActionLabel(item);

  return (
    <Card className="overflow-hidden border-white/10 bg-gray-900/80 p-5 transition hover:border-primary-400/40">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <StatusBadge value={item.status} />
            <RegistrationBadge value={item.registrationStatus} />
            {item.checkInStatus && item.checkInStatus !== 'NOT_REQUIRED' && <RegistrationBadge value={`CHECK-IN ${item.checkInStatus}`} />}
          </div>

          <h3 className="mt-3 line-clamp-2 text-xl font-black">{item.title || item.name}</h3>
          <p className="mt-1 text-sm text-primary-300">{item.game?.name || 'Game'} · {item.gameMode?.name || item.format || 'Mode'}</p>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-medium text-gray-400 md:grid-cols-4">
            <span><Calendar className="mr-1 inline h-4 w-4" />{item.startDate ? new Date(item.startDate).toLocaleDateString() : 'TBA'}</span>
            <span><Clock3 className="mr-1 inline h-4 w-4" />{item.startTime || 'TBA'}</span>
            <span><Trophy className="mr-1 inline h-4 w-4" />৳{Number(item.prizePool || 0).toLocaleString()}</span>
            <span><Users className="mr-1 inline h-4 w-4" />{item.format || 'Format'}</span>
          </div>
        </div>

        <div className="w-full space-y-3 lg:w-64">
          {item.roomDetails?.roomId ? (
            <div className="rounded-2xl border border-primary-400/20 bg-primary-500/10 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-primary-300"><Lock className="h-4 w-4" />Private room</div>
              <Credential label={roomIdLabel} value={item.roomDetails.roomId} show={showRoom} />
              {item.roomDetails.password && <Credential label={passwordLabel} value={item.roomDetails.password} show={showRoom} />}
              <button onClick={toggleRoom} className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-gray-300">
                {showRoom ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showRoom ? 'Hide' : 'Reveal'}
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-700 bg-gray-950 p-4 text-sm text-gray-400">Room details unlock after assignment and eligibility.</div>
          )}
          <Button className="w-full" variant={item.checkInStatus === 'PENDING' ? 'primary' : 'outline'} onClick={item.checkInStatus === 'PENDING' ? checkIn : open} disabled={checkingIn}>{linkLabel}</Button>
        </div>
      </div>
    </Card>
  );
}

function buildSections(tournaments: JoinedTournament[]): Section[] {
  const checkin = tournaments.filter((item) => item.registrationStatus === 'APPROVED' && item.checkInStatus === 'PENDING');
  const checkinIds = new Set(checkin.map((item) => item.id));
  const playing = tournaments.filter((item) => !checkinIds.has(item.id) && (item.status === 'ONGOING' || Boolean(item.roomDetails?.roomId)));
  const playingIds = new Set(playing.map((item) => item.id));
  const completed = tournaments.filter((item) => !checkinIds.has(item.id) && !playingIds.has(item.id) && item.status === 'COMPLETED');
  const completedIds = new Set(completed.map((item) => item.id));
  const registered = tournaments.filter((item) => !checkinIds.has(item.id) && !playingIds.has(item.id) && !completedIds.has(item.id));

  return [
    {
      id: 'checkin',
      title: 'Check-in Required',
      description: 'Confirm your lineup before the room unlocks.',
      items: checkin,
    },
    {
      id: 'playing',
      title: 'Playing / Live',
      description: 'Live tournaments, active brackets, and room-ready events.',
      items: playing,
    },
    {
      id: 'registered',
      title: 'Registered',
      description: 'Approved or pending registrations waiting for match flow.',
      items: registered,
    },
    {
      id: 'completed',
      title: 'Completed',
      description: 'Finished tournaments and result history.',
      items: completed,
    },
  ];
}

function normalizeRegistrations(value: any): JoinedTournament[] {
  const raw = Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : Array.isArray(value?.items) ? value.items : [];
  return raw.map((item: any) => item.tournament ? {
    ...item.tournament,
    registrationStatus: item.status || item.registrationStatus || 'PENDING',
    checkInStatus: item.checkInStatus,
    roomDetails: item.roomDetails || item.tournament.roomDetails,
  } : item);
}

function resolveTournamentLink(item: JoinedTournament) {
  if (item.roomDetails?.roomId) return `/user/tournaments/${item.id}?tab=room`;
  if (item.status === 'ONGOING') return `/user/tournaments/${item.id}?tab=${item.competitionMode === 'KNOCKOUT' ? 'bracket' : 'matches'}`;
  if (item.status === 'COMPLETED') return `/user/tournaments/${item.id}?tab=${item.competitionMode === 'KNOCKOUT' ? 'bracket' : 'matches'}`;
  return `/user/tournaments/${item.id}`;
}

function resolveActionLabel(item: JoinedTournament) {
  if (item.roomDetails?.roomId) return 'Open Room';
  if (item.checkInStatus === 'PENDING') return 'Check In';
  if (item.competitionMode === 'KNOCKOUT' && ['ONGOING', 'COMPLETED'].includes(item.status)) return 'View Bracket';
  if (['ONGOING', 'COMPLETED'].includes(item.status)) return 'View Matches';
  return 'View Details';
}

function Metric({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <Icon className="mb-3 h-5 w-5 text-primary-300" />
      <div className="text-2xl font-black">{value}</div>
      <div className="text-xs font-semibold uppercase text-gray-400">{label}</div>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const live = value === 'ONGOING';
  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${live ? 'border-red-400/30 bg-red-500/10 text-red-300' : 'border-gray-600 bg-gray-800 text-gray-300'}`}>
      {live && <Flame className="mr-1 inline h-3 w-3" />}
      {value.replace(/_/g, ' ')}
    </span>
  );
}

function RegistrationBadge({ value }: { value: string }) {
  const tone = value.includes('APPROVED') || value.includes('CHECKED_IN')
    ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
    : value.includes('PENDING')
      ? 'border-amber-400/30 bg-amber-500/10 text-amber-300'
      : 'border-gray-600 bg-gray-800 text-gray-300';
  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${tone}`}>{value.replace(/_/g, ' ')}</span>;
}

function Credential({ label, value, show }: { label: string; value: string; show: boolean }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-mono text-gray-100">{show ? value : '••••••••'}</span>
    </div>
  );
}
