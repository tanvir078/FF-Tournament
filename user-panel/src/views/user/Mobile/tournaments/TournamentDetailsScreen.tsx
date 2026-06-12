import Head from 'next/head';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Copy,
  Eye,
  EyeOff,
  Flame,
  Gamepad2,
  Info,
  Lock,
  MapPin,
  Medal,
  Share2,
  Shield,
  ShieldCheck,
  Star,
  Target,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Button from '@/views/user/Mobile/_components/Button';
import Card from '@/views/user/Mobile/_components/Card';
import {
  StatusBadge,
  formatDate,
  getTournamentImage,
  getTournamentTimingLabel,
  getTournamentTitle,
  isFreeTournament,
  isTournamentFull,
  isTournamentJoinable,
  normalizeTournament,
  type Tournament as SharedTournament,
} from '@/views/user/Mobile/_components/tournaments';
import dashboardBg from '@/images/dashboard-bg.png';
import MobileBracketTree from '@/views/user/Mobile/tournaments/_bracket/MobileBracketTree';

type Tournament = SharedTournament & {
  title: string;
  description?: string;
  perKillReward?: number | string;
  registrationDeadline?: string | null;
  registrationEnd?: string | null;
  rules?: string[] | null;
  maps?: string[] | null;
  roomDetails?: { roomId?: string; password?: string } | null;
  checkInEnabled?: boolean;
  requiresVerifiedProfile?: boolean;
  checkInOpensAt?: string | null;
  checkInClosesAt?: string | null;
  prizeDistribution?: Array<{ rank?: string; placement?: string; amount?: number | string }> | Record<string, number | string> | null;
  organizer?: { name?: string; platformHandle?: string };
  game?: SharedTournament['game'] & { lobbyLabels?: { roomId?: string; password?: string } };
  gameMode?: SharedTournament['gameMode'] & { rosterSize?: number; substituteLimit?: number };
  participants?: Participant[];
  registrations?: Participant[];
};

type Match = {
  id: string;
  matchNumber?: number;
  stage?: string;
  status?: string;
  scheduledTime?: string;
  map?: string;
  roomId?: string;
  roomPassword?: string;
  slots?: Array<{ teamId?: string; teamName?: string; name?: string; slotNumber?: number }> | null;
  results?: Array<{ teamId?: string; placement?: number | string }> | null;
};

type Participant = {
  id?: string;
  status?: string;
  seed?: number;
  teamName?: string;
  name?: string;
  ign?: string;
  userName?: string;
  team?: { name?: string; tag?: string; logo?: string };
  user?: { name?: string; ign?: string; platformHandle?: string; avatar?: string };
  gameProfile?: { ign?: string; uid?: string; region?: string; verificationStatus?: string };
  starters?: Array<{ name?: string; ign?: string; platformHandle?: string }>;
};

type Tab = 'Overview' | 'Bracket' | 'Players' | 'Matches' | 'Rules' | 'Prizes' | 'Room';

const tabs: Tab[] = ['Overview', 'Bracket', 'Players', 'Matches', 'Rules', 'Prizes', 'Room'];

export default function TournamentDetailsPage() {
  const router = useRouter();
  const rawId = router.query.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const { user } = useAuthStore();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registration, setRegistration] = useState<any>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [copied, setCopied] = useState(false);
  const [copiedRoom, setCopiedRoom] = useState('');
  const [showRoom, setShowRoom] = useState(false);

  useEffect(() => {
    const tab = parseTab(router.query.tab);
    if (tab) setActiveTab(tab);
  }, [router.query.tab]);

  const fetchTournament = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError('');
      const [tournamentResponse, registrationResponse, bracketResponse, matchesResponse] = await Promise.allSettled([
        api.get(`/tournaments/${id}`),
        api.get(`/tournaments/${id}/registration-status`),
        api.get(`/tournaments/${id}/bracket`),
        api.get(`/matches/by-tournament/${id}`),
      ]);

      if (tournamentResponse.status !== 'fulfilled') {
        throw tournamentResponse.reason;
      }

      const bracketData = bracketResponse.status === 'fulfilled' ? bracketResponse.value.data : null;
      const normalized = normalizeTournament({
        ...tournamentResponse.value.data,
        ...(bracketData?.tournament || {}),
      }) as Tournament;
      setTournament(normalized);
      if (registrationResponse.status === 'fulfilled') {
        setIsRegistered(Boolean(registrationResponse.value.data.isRegistered));
        setRegistration(registrationResponse.value.data.registration);
      } else {
        setIsRegistered(false);
        setRegistration(null);
      }
      const nextMatches = bracketData?.matches
        ? normalizeList(bracketData.matches)
        : matchesResponse.status === 'fulfilled'
          ? normalizeList(matchesResponse.value.data)
          : [];
      setMatches(nextMatches);
      setParticipants(bracketData?.participants ? normalizeList(bracketData.participants) : getParticipants(normalized, nextMatches));
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'Failed to load tournament.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchTournament();
  }, [fetchTournament]);

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleCopyRoom = async (label: string, value?: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopiedRoom(label);
    setTimeout(() => setCopiedRoom(''), 1800);
  };

  const handleCheckIn = async () => {
    if (!id) return;

    try {
      setError('');
      const response = await api.post(`/tournaments/${id}/check-in`);
      setRegistration(response.data);
      await fetchTournament();
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'Unable to check in.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 p-4 text-white">
        <div className="mx-auto max-w-7xl space-y-5">
          <div className="h-72 animate-pulse rounded-2xl bg-gray-800" />
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="h-96 animate-pulse rounded-xl bg-gray-800" />
            <div className="h-96 animate-pulse rounded-xl bg-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="grid min-h-screen place-items-center bg-gray-950 px-4 text-white">
        <Card className="max-w-lg border-red-500/30 bg-red-500/10 p-8 text-center">
          <Trophy className="mx-auto mb-4 h-12 w-12 text-red-300" />
          <h1 className="text-xl font-black">Tournament unavailable</h1>
          <p className="mt-2 text-sm text-red-100">{error || 'Tournament not found.'}</p>
          <Button className="mt-5" onClick={() => router.push('/user/tournaments')}>Back to tournaments</Button>
        </Card>
      </div>
    );
  }

  const image = getTournamentImage(tournament) || dashboardBg.src;
  const title = getTournamentTitle(tournament);
  const registeredTeams = Number(tournament.registeredTeams || 0);
  const maxTeams = Number(tournament.maxTeams || 0);
  const progress = maxTeams ? Math.min(100, (registeredTeams / maxTeams) * 100) : 0;
  const isFull = isTournamentFull(tournament);
  const registrationOpen = isTournamentJoinable(tournament);
  const entryFee = Number(tournament.entryFee || 0);
  const isFree = isFreeTournament(tournament);
  const roomVisible = Boolean(isRegistered && (tournament.roomDetails || matches.some((match) => match.roomId)));

  return (
    <>
      <Head>
        <title>{title} - Tournament</title>
      </Head>

      <div className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/user/tournaments" className="inline-flex items-center gap-2 text-sm font-bold text-primary-300 hover:text-primary-200">
            <ArrowLeft className="h-4 w-4" />
            Back to tournaments
          </Link>

          <Hero
            image={image}
            tournament={tournament}
            title={title}
            onShare={handleShare}
            copied={copied}
          />

          {error && (
            <Card className="border-red-500/30 bg-red-500/10 p-4 text-sm font-bold text-red-200">
              {error}
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <main className="min-w-0 space-y-5">
              <Card className="overflow-hidden border-white/10 bg-gray-900/90">
                <div className="scrollbar-hide flex gap-2 overflow-x-auto border-b border-white/10 px-4 py-3 sm:px-5">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-black transition ${activeTab === tab ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="p-4 sm:p-6">
                  {activeTab === 'Overview' && (
                    <OverviewTab tournament={tournament} progress={progress} registeredTeams={registeredTeams} maxTeams={maxTeams} />
                  )}
                  {activeTab === 'Bracket' && <BracketTab tournament={tournament} matches={matches} />}
                  {activeTab === 'Players' && <ParticipantsTab tournament={tournament} participants={participants} />}
                  {activeTab === 'Matches' && <MatchesTab matches={matches} />}
                  {activeTab === 'Rules' && <RulesTab rules={tournament.rules || []} maps={tournament.maps || []} />}
                  {activeTab === 'Prizes' && <PrizesTab tournament={tournament} />}
                  {activeTab === 'Room' && (
                    <RoomTab
                      visible={roomVisible}
                      tournament={tournament}
                      showRoom={showRoom}
                      setShowRoom={setShowRoom}
                      copiedRoom={copiedRoom}
                      copyRoom={handleCopyRoom}
                      isRegistered={isRegistered}
                      matches={matches}
                    />
                  )}
                </div>
              </Card>
            </main>

            <ActionPanel
              tournament={tournament}
              user={user}
              isRegistered={isRegistered}
              registration={registration}
              isFull={isFull}
              registrationOpen={registrationOpen}
              isFree={isFree}
              entryFee={entryFee}
              onJoin={() => router.push(user ? `/user/tournaments/${tournament.id}/join` : '/user/login')}
              onCheckIn={handleCheckIn}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function Hero({
  image,
  tournament,
  title,
  onShare,
  copied,
}: {
  image: string;
  tournament: Tournament;
  title: string;
  onShare: () => void;
  copied: boolean;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gray-900 shadow-2xl shadow-black/30">
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/55 to-gray-950/10" />

      <button onClick={onShare} className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-gray-200 backdrop-blur hover:text-white" aria-label="Share tournament">
        {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Share2 className="h-4 w-4" />}
      </button>

      <div className="relative grid min-h-[300px] gap-6 p-5 sm:p-8">
        <div className="flex min-w-0 flex-col justify-end">
          <div className="mb-4 flex flex-wrap gap-2">
            <StatusBadge status={tournament.status} />
            {tournament.isFeatured && (
              <span className="rounded-full border border-yellow-300/40 bg-yellow-400/15 px-2.5 py-1 text-[10px] font-black uppercase text-yellow-200">
                <Star className="mr-1 inline h-3 w-3 fill-yellow-200" />
                Featured
              </span>
            )}
            <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase text-gray-200">
              {tournament.game?.name || 'Game'}
            </span>
          </div>

          <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">
            {title}
          </h1>
        </div>
      </div>
    </section>
  );
}

function OverviewTab({
  tournament,
  progress,
  registeredTeams,
  maxTeams,
}: {
  tournament: Tournament;
  progress: number;
  registeredTeams: number;
  maxTeams: number;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard icon={Gamepad2} label="Format" value={tournament.gameMode?.name || tournament.format || 'Mode'} />
        <InfoCard icon={Trophy} label="Prize Pool" value={`৳${Number(tournament.prizePool || 0).toLocaleString()}`} tone="text-emerald-300" />
        <InfoCard icon={Target} label="Per Kill" value={`৳${Number(tournament.perKillReward || 0).toLocaleString()}`} tone="text-primary-300" />
        <InfoCard icon={Calendar} label="Start" value={`${formatDate(tournament.startDate)}${tournament.startTime ? `, ${tournament.startTime}` : ''}`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-white/10 bg-gray-950/50 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-black">Participant capacity</h3>
            <span className="text-sm font-bold text-gray-400">{registeredTeams}/{maxTeams || '-'}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-800">
            <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-emerald-400" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-3 text-sm text-gray-400">Approved registrations count toward available tournament slots.</p>
        </Card>

        <Card className="border-white/10 bg-gray-950/50 p-5">
          <h3 className="mb-3 font-black">Schedule</h3>
          <div className="space-y-3 text-sm text-gray-300">
            <TimelineRow label="Registration closes" value={formatDate(tournament.registrationDeadline || tournament.registrationEnd || undefined)} />
            <TimelineRow label="Tournament starts" value={`${formatDate(tournament.startDate)}${tournament.startTime ? ` at ${tournament.startTime}` : ''}`} />
            <TimelineRow label="Check-in" value={tournament.checkInEnabled ? `${formatDate(tournament.checkInOpensAt || undefined)} - ${formatDate(tournament.checkInClosesAt || undefined)}` : 'Not required'} />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MetaBlock title="Game & organizer" rows={[
          ['Game', tournament.game?.name || 'Game TBA'],
          ['Mode', tournament.gameMode?.name || tournament.format || 'Mode TBA'],
          ['Organizer', tournament.organizer?.name || tournament.organizer?.platformHandle || 'Arena Organizer'],
          ['Competition', formatMeta(tournament.competitionMode || tournament.stage || tournament.currentStage || 'Standard')],
        ]} />
        <MetaBlock title="Line-up policy" rows={[
          ['Roster size', String(tournament.gameMode?.rosterSize || (tournament.format === 'SOLO' ? 1 : tournament.format === 'DUO' ? 2 : 4))],
          ['Substitutes', String(tournament.gameMode?.substituteLimit || 0)],
          ['Profile verification', tournament.requiresVerifiedProfile ? 'Required' : 'Standard'],
          ['Room access', tournament.checkInEnabled ? 'After check-in approval' : 'After approval'],
        ]} />
      </div>
    </div>
  );
}

function MatchesTab({ matches }: { matches: Match[] }) {
  if (!matches.length) {
    return (
      <Card className="border-white/10 bg-gray-950/50 p-8 text-center text-gray-400">
        <Calendar className="mx-auto mb-3 h-10 w-10 text-gray-600" />
        Match schedule becomes available after organizer publishes the room plan.
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => (
        <Card key={match.id} className="border-white/10 bg-gray-950/50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-black">Match {match.matchNumber || '-'}</h3>
              <p className="mt-1 text-sm text-gray-400">{formatMeta(match.stage || 'Stage pending')} · {match.map || 'Map pending'}</p>
            </div>
            <div className="text-right text-sm">
              <StatusBadge status={match.status || 'SCHEDULED'} />
              <p className="mt-2 text-gray-400">{match.scheduledTime ? new Date(match.scheduledTime).toLocaleString() : 'Schedule pending'}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function BracketTab({ tournament, matches }: { tournament: Tournament; matches: Match[] }) {
  return <MobileBracketTree tournament={tournament} matches={matches} />;
}

function ParticipantsTab({ tournament, participants }: { tournament: Tournament; participants: Participant[] }) {
  const rosterSize = Number(tournament.gameMode?.rosterSize || (tournament.format === 'SOLO' ? 1 : tournament.format === 'DUO' ? 2 : 4));
  const teamMode = rosterSize > 1;

  if (!participants.length) {
    return (
      <Card className="border-white/10 bg-gray-950/50 p-8 text-center text-gray-400">
        <Users className="mx-auto mb-3 h-10 w-10 text-gray-600" />
        Approved {teamMode ? 'teams' : 'players'} will appear here after registration sync.
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {participants.map((participant, index) => {
        const name = getParticipantName(participant, teamMode);
        const profile = participant.gameProfile;
        const starters = normalizeLineup(participant.starters);
        return (
          <Card key={participant.id || `${name}-${index}`} className="border-white/10 bg-gray-950/50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary-500/15 text-xs font-black text-primary-200">
                    {participant.seed || index + 1}
                  </span>
                  <h3 className="truncate font-black text-white">{name}</h3>
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  {teamMode ? `${starters.length || rosterSize} player lineup` : profile?.ign || participant.ign || 'Solo player'}
                  {profile?.region ? ` · ${profile.region}` : ''}
                </p>
              </div>
              <StatusBadge status={participant.status || 'APPROVED'} />
            </div>
            {teamMode && starters.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {starters.map((starter: any, starterIndex) => (
                  <span key={`${name}-${starterIndex}`} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-gray-300">
                    {starter.platformHandle || starter.ign || starter.name || `Player ${starterIndex + 1}`}
                  </span>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function RulesTab({ rules, maps }: { rules: string[]; maps: string[] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-black"><Shield className="h-5 w-5 text-primary-300" /> Rules</h3>
        {rules.length ? (
          <div className="space-y-2">
            {rules.map((rule, index) => (
              <div key={`${rule}-${index}`} className="flex gap-3 rounded-xl border border-white/10 bg-gray-950/50 p-3 text-sm text-gray-300">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                {rule}
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-white/10 bg-gray-950/50 p-5 text-sm text-gray-400">Rules have not been published yet.</p>
        )}
      </div>
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-black"><MapPin className="h-5 w-5 text-primary-300" /> Maps</h3>
        <div className="flex flex-wrap gap-2">
          {maps.length ? maps.map((map) => (
            <span key={map} className="rounded-full border border-primary-400/30 bg-primary-500/10 px-3 py-2 text-xs font-black text-primary-200">{map}</span>
          )) : <span className="text-sm text-gray-400">Map pool TBA</span>}
        </div>
      </div>
    </div>
  );
}

function PrizesTab({ tournament }: { tournament: Tournament }) {
  const prizes = normalizePrizeDistribution(tournament.prizeDistribution);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <InfoCard icon={Trophy} label="Prize Pool" value={`৳${Number(tournament.prizePool || 0).toLocaleString()}`} tone="text-emerald-300" />
        <InfoCard icon={Target} label="Per Kill Reward" value={`৳${Number(tournament.perKillReward || 0).toLocaleString()}`} tone="text-primary-300" />
      </div>

      {prizes.length ? prizes.map(({ placement, amount }) => (
        <Card key={placement} className="flex items-center justify-between border-white/10 bg-gray-950/50 p-4">
          <span className="flex items-center gap-2 font-bold text-gray-300"><Medal className="h-4 w-4 text-yellow-300" /> {placement}</span>
          <span className="text-lg font-black text-emerald-300">৳{Number(amount).toLocaleString()}</span>
        </Card>
      )) : (
        <Card className="border-white/10 bg-gray-950/50 p-5 text-sm text-gray-400">Detailed prize distribution will be announced soon.</Card>
      )}
    </div>
  );
}

function RoomTab({
  visible,
  tournament,
  showRoom,
  setShowRoom,
  copiedRoom,
  copyRoom,
  isRegistered,
  matches,
}: {
  visible: boolean;
  tournament: Tournament;
  showRoom: boolean;
  setShowRoom: (value: boolean) => void;
  copiedRoom: string;
  copyRoom: (label: string, value?: string) => void;
  isRegistered: boolean;
  matches: Match[];
}) {
  if (!isRegistered) {
    return <LockedRoom message="Join this tournament first. Room credentials are available only to approved participants." />;
  }

  if (!visible) {
    return <LockedRoom message="Room details are not available yet. They unlock after organizer assignment and check-in requirements." />;
  }

  const roomMatches = matches.filter((match) => match.roomId);
  const defaultRoom = tournament.roomDetails?.roomId ? [{ id: 'default-room', matchNumber: 0, stage: 'Tournament', map: 'Default lobby', roomId: tournament.roomDetails.roomId, roomPassword: tournament.roomDetails.password } as Match] : [];
  const rooms = roomMatches.length ? roomMatches : defaultRoom;

  return (
    <Card className="border-emerald-500/30 bg-emerald-500/10 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-black text-white"><Lock className="h-5 w-5 text-emerald-300" /> Room credentials</h3>
          <p className="mt-1 text-sm text-emerald-100/80">Do not share lobby credentials outside your approved line-up.</p>
        </div>
        <button onClick={() => setShowRoom(!showRoom)} className="rounded-xl bg-white/10 p-2 text-white" aria-label="Toggle room details">
          {showRoom ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      <div className="space-y-3">
        {rooms.map((room) => (
          <div key={room.id} className="rounded-xl border border-white/10 bg-gray-950/45 p-3">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-emerald-100/70">
              {room.matchNumber ? `Match #${room.matchNumber}` : 'Default Room'} · {room.map || room.stage || 'Lobby'}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Credential label={tournament.game?.lobbyLabels?.roomId || 'Room ID'} value={showRoom ? room.roomId || '' : '••••••••'} copied={copiedRoom === `room-${room.id}`} onCopy={() => copyRoom(`room-${room.id}`, room.roomId)} />
              {room.roomPassword && <Credential label={tournament.game?.lobbyLabels?.password || 'Password'} value={showRoom ? room.roomPassword : '••••••••'} copied={copiedRoom === `password-${room.id}`} onCopy={() => copyRoom(`password-${room.id}`, room.roomPassword)} />}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ActionPanel({
  tournament,
  user,
  isRegistered,
  registration,
  isFull,
  registrationOpen,
  isFree,
  entryFee,
  onJoin,
  onCheckIn,
}: {
  tournament: Tournament;
  user: any;
  isRegistered: boolean;
  registration: any;
  isFull: boolean;
  registrationOpen: boolean;
  isFree: boolean;
  entryFee: number;
  onJoin: () => void;
  onCheckIn: () => void;
}) {
  return (
    <aside className="lg:sticky lg:top-20 lg:self-start">
      <Card className="border-white/10 bg-gray-900/95 p-5 shadow-xl shadow-black/20">
        <h2 className="text-xl font-black">Registration control</h2>
        <p className="mt-1 text-sm text-gray-400">{getTournamentTimingLabel(tournament)}</p>

        <div className="mt-5">
          {isRegistered ? (
            <StateBox tone="success" title="Registered" icon={Check} text="Your tournament registration is confirmed. Track room and match updates from this page." />
          ) : isFull ? (
            <StateBox tone="danger" title="Registration full" icon={X} text="All available tournament slots are already taken." />
          ) : !registrationOpen ? (
            <StateBox tone="warning" title="Registration unavailable" icon={Info} text="Registration is closed or the deadline has passed." />
          ) : (
            <Button className="w-full gap-2" size="lg" onClick={onJoin}>
              {user ? 'Join Tournament' : 'Login to Join'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isRegistered && tournament.checkInEnabled && registration?.checkInStatus === 'PENDING' && (
          <Button className="mt-3 w-full gap-2" onClick={onCheckIn}>
            <ShieldCheck className="h-4 w-4" />
            Check In Line-up
          </Button>
        )}

        {isRegistered && tournament.checkInEnabled && registration?.checkInStatus === 'CHECKED_IN' && (
          <p className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm font-bold text-emerald-200">
            Line-up check-in confirmed.
          </p>
        )}

        <TeamStatePanel tournament={tournament} registration={registration} isRegistered={isRegistered} />

        <div className="mt-5 space-y-3 border-t border-white/10 pt-5">
          <PanelRow label="Entry fee" value={isFree ? 'Free' : `৳${entryFee.toLocaleString()}`} />
          <PanelRow label="Prize pool" value={`৳${Number(tournament.prizePool || 0).toLocaleString()}`} />
          <PanelRow label="Format" value={tournament.gameMode?.name || tournament.format || 'Mode'} />
          <PanelRow label="Roster" value={`${tournament.gameMode?.rosterSize || (tournament.format === 'SOLO' ? 1 : tournament.format === 'DUO' ? 2 : 4)} players`} />
          <PanelRow label="Check-in" value={tournament.checkInEnabled ? 'Required' : 'Not required'} />
        </div>
      </Card>
    </aside>
  );
}

function TeamStatePanel({ tournament, registration, isRegistered }: { tournament: Tournament; registration: any; isRegistered: boolean }) {
  const rosterSize = Number(tournament.gameMode?.rosterSize || (tournament.format === 'SOLO' ? 1 : tournament.format === 'DUO' ? 2 : 4));
  const teamMode = rosterSize > 1;
  const teamName = registration?.team?.name || registration?.teamName || registration?.team?.teamName || '';
  const captain = registration?.team?.captain?.platformHandle || registration?.team?.captain?.ign || registration?.team?.captain?.name || registration?.captainName || '';
  const starters = normalizeLineup(registration?.starters || registration?.starterUsers || registration?.lineup?.starters || registration?.starterUserIds);
  const substitutes = normalizeLineup(registration?.substitutes || registration?.substituteUsers || registration?.lineup?.substitutes || registration?.substituteUserIds);
  const status = registration?.status || registration?.registrationStatus || (isRegistered ? 'REGISTERED' : 'NOT JOINED');
  const checkIn = registration?.checkInStatus || (tournament.checkInEnabled ? 'PENDING' : 'NOT REQUIRED');

  return (
    <div className="mt-4 border-y border-white/10 bg-gray-950/55 px-3 py-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-gray-300">
          <Users className="h-4 w-4 text-primary-300" />
          {teamMode ? 'Team state' : 'Player state'}
        </span>
        <span className="text-[11px] font-black text-gray-500">{status.replace(/_/g, ' ')}</span>
      </div>

      <div className="space-y-2">
        <PanelRow label={teamMode ? 'Team' : 'Entry'} value={teamMode ? teamName || 'Team pending' : 'Solo player'} />
        {teamMode && <PanelRow label="Captain" value={captain || 'Captain pending'} />}
        <PanelRow label="Line-up" value={teamMode ? `${starters.length || 0}/${rosterSize} starters` : '1/1 player'} />
        {teamMode && <PanelRow label="Substitutes" value={String(substitutes.length || 0)} />}
        <PanelRow label="Check-in state" value={checkIn.replace(/_/g, ' ')} />
      </div>
    </div>
  );
}

function normalizeLineup(value: any): any[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return value.split(',').filter(Boolean);
    }
  }
  return [];
}

function normalizeList(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  return [];
}

function getParticipants(tournament: Tournament, matches: Match[]) {
  const direct = normalizeList(tournament.participants).length
    ? normalizeList(tournament.participants)
    : normalizeList(tournament.registrations);
  if (direct.length) return direct;

  const byName = new Map<string, Participant>();
  matches.forEach((match) => {
    (match.slots || []).forEach((slot) => {
      const name = slot.teamName || slot.name;
      if (!name || name === 'TBD') return;
      byName.set(slot.teamId || name, {
        id: slot.teamId || name,
        teamName: slot.teamName,
        name,
        status: 'SEEDED',
      });
    });
  });
  return Array.from(byName.values());
}

function getParticipantName(participant: Participant, teamMode: boolean) {
  if (teamMode) return participant.teamName || participant.team?.name || participant.name || 'Team pending';
  return participant.user?.platformHandle || participant.user?.ign || participant.gameProfile?.ign || participant.ign || participant.userName || participant.name || 'Player pending';
}

function InfoCard({ icon: Icon, label, value, tone = 'text-white' }: { icon: typeof Trophy; label: string; value: string; tone?: string }) {
  return (
    <Card className="border-white/10 bg-gray-950/50 p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
        <Icon className="h-4 w-4 text-primary-300" />
        {label}
      </div>
      <div className={`mt-2 truncate text-xl font-black ${tone}`}>{value}</div>
    </Card>
  );
}

function TimelineRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-bold">{value}</span>
    </div>
  );
}

function MetaBlock({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <Card className="border-white/10 bg-gray-950/50 p-5">
      <h3 className="mb-4 font-black">{title}</h3>
      <div className="space-y-3">
        {rows.map(([label, value]) => <PanelRow key={label} label={label} value={value} />)}
      </div>
    </Card>
  );
}

function PanelRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-bold text-gray-200">{value}</span>
    </div>
  );
}

function StateBox({ tone, title, text, icon: Icon }: { tone: 'success' | 'danger' | 'warning'; title: string; text: string; icon: typeof Check }) {
  const classes = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    danger: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
    warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-100',
  };

  return (
    <div className={`rounded-xl border p-4 ${classes[tone]}`}>
      <div className="flex items-center gap-2 font-black">
        <Icon className="h-5 w-5" />
        {title}
      </div>
      <p className="mt-2 text-sm opacity-85">{text}</p>
    </div>
  );
}

function LockedRoom({ message }: { message: string }) {
  return (
    <Card className="border-white/10 bg-gray-950/50 p-8 text-center text-gray-400">
      <Lock className="mx-auto mb-3 h-10 w-10 text-gray-600" />
      {message}
    </Card>
  );
}

function Credential({ label, value, copied, onCopy }: { label: string; value: string; copied: boolean; onCopy: () => void }) {
  return (
    <div className="rounded-xl border border-white/10 bg-gray-950/60 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-500">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="font-mono text-lg font-black text-white">{value}</span>
        <button onClick={onCopy} className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-white" aria-label={`Copy ${label}`}>
          {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function formatMeta(value?: string) {
  if (!value) return 'Standard';
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizePrizeDistribution(distribution: Tournament['prizeDistribution']) {
  if (!distribution) return [];

  if (Array.isArray(distribution)) {
    return distribution
      .map((item, index) => ({
        placement: item.rank || item.placement || `Placement #${index + 1}`,
        amount: item.amount || 0,
      }))
      .filter((item) => Number(item.amount) > 0);
  }

  return Object.entries(distribution)
    .map(([placement, amount]) => ({
      placement: placement.match(/^\d+$/) ? `Placement #${placement}` : placement,
      amount,
    }))
    .filter((item) => Number(item.amount) > 0);
}

function parseTab(value: unknown): Tab | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string') return null;
  const normalized = raw.toLowerCase();
  return tabs.find((tab) => tab.toLowerCase() === normalized) || null;
}
