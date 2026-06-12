import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { AlertCircle, Calendar, Clock3, Copy, Eye, EyeOff, Flame, Lock, Trophy } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Button from '@/views/user/Desktop/_components/Button';
import Card from '@/views/user/Desktop/_components/Card';

type Match = {
  id: string;
  tournamentId: string;
  tournamentName: string;
  matchNumber: number;
  stage: string;
  status: 'SCHEDULED' | 'ROOM_CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledTime: string;
  roomId?: string;
  roomPassword?: string;
  map: string;
  format: string;
  tournament?: { game?: { lobbyLabels?: { roomId?: string; password?: string } } };
};

type MatchSection = {
  id: 'live' | 'upcoming' | 'completed';
  title: string;
  description: string;
  matches: Match[];
};

export default function MatchCenterScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [matches, setMatches] = useState<Match[]>([]);
  const [claims, setClaims] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [showRoomDetails, setShowRoomDetails] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) {
      router.push('/user/login');
      return;
    }

    Promise.all([api.get('/matches/my-matches'), api.get('/result-claims/mine')])
      .then(([matchesResponse, claimsResponse]) => {
        setMatches(Array.isArray(matchesResponse.data) ? matchesResponse.data : []);
        setClaims(Object.fromEntries((claimsResponse.data || []).map((claim: any) => [claim.matchId, claim])));
      })
      .finally(() => setLoading(false));
  }, [router, user]);

  const sections = useMemo(() => buildSections(matches), [matches]);

  const toggleRoom = (matchId: string) => {
    setShowRoomDetails((current) => ({ ...current, [matchId]: !current[matchId] }));
  };

  const copyCredential = (value?: string) => {
    if (value) void navigator.clipboard.writeText(value);
  };

  if (loading) {
    return <div className="grid min-h-full place-items-center bg-gray-950 text-white">Loading matches...</div>;
  }

  return (
    <div className="min-h-full bg-gray-950 text-white">
      <div className="mx-auto max-w-7xl space-y-7 px-6 py-6">
        <header className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.22),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(17,24,39,0.9))] p-7">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">Match Center</p>
          <h1 className="mt-2 text-4xl font-black">Rooms, Schedule, Claims</h1>
          <p className="mt-2 max-w-2xl text-gray-400">Follow upcoming matches, reveal eligible room credentials, and submit result claims after completion.</p>
        </header>

        {matches.length ? (
          <div className="space-y-8">
            {sections.map((section) => (
              <MatchSectionView
                key={section.id}
                section={section}
                claims={claims}
                showRoomDetails={showRoomDetails}
                toggleRoom={toggleRoom}
                copyCredential={copyCredential}
                openTournament={(match) => router.push(`/user/tournaments/${match.tournamentId}?tab=${match.status === 'COMPLETED' ? 'matches' : 'room'}`)}
                claimResult={(match) => router.push(`/user/matches/${match.id}/claim`)}
              />
            ))}
          </div>
        ) : (
          <Card className="border-white/10 bg-gray-900/80 p-12 text-center">
            <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-600" />
            <h3 className="text-2xl font-black text-gray-200">No matches yet</h3>
            <p className="mt-2 text-gray-500">Join a tournament and approved matches will appear here.</p>
            <Button className="mt-6" onClick={() => router.push('/user/tournaments')}>Browse Tournaments</Button>
          </Card>
        )}
      </div>
    </div>
  );
}

function MatchSectionView({
  section,
  claims,
  showRoomDetails,
  toggleRoom,
  copyCredential,
  openTournament,
  claimResult,
}: {
  section: MatchSection;
  claims: Record<string, any>;
  showRoomDetails: Record<string, boolean>;
  toggleRoom: (matchId: string) => void;
  copyCredential: (value?: string) => void;
  openTournament: (match: Match) => void;
  claimResult: (match: Match) => void;
}) {
  if (!section.matches.length) return null;

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">{section.title}</h2>
          <p className="mt-1 text-sm text-gray-500">{section.description}</p>
        </div>
        <span className="text-sm font-bold text-gray-500">{section.matches.length} matches</span>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {section.matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            claim={claims[match.id]}
            roomVisible={Boolean(showRoomDetails[match.id])}
            toggleRoom={() => toggleRoom(match.id)}
            copyCredential={copyCredential}
            openTournament={() => openTournament(match)}
            claimResult={() => claimResult(match)}
          />
        ))}
      </div>
    </section>
  );
}

function MatchCard({
  match,
  claim,
  roomVisible,
  toggleRoom,
  copyCredential,
  openTournament,
  claimResult,
}: {
  match: Match;
  claim?: any;
  roomVisible: boolean;
  toggleRoom: () => void;
  copyCredential: (value?: string) => void;
  openTournament: () => void;
  claimResult: () => void;
}) {
  const live = match.status === 'IN_PROGRESS';
  const completed = match.status === 'COMPLETED';

  return (
    <Card className="border-white/10 bg-gray-900/80 p-5">
      {claim && (
        <div className={`mb-4 rounded-xl border px-3 py-2 text-sm font-bold ${claimTone(claim.status)}`}>
          {claim.status === 'APPROVED'
            ? `Reward approved: ৳${Number((claim.rewards || []).reduce((sum: number, reward: any) => sum + Number(reward.approvedAmount || 0), 0)).toLocaleString()}`
            : `Result claim ${String(claim.status).toLowerCase()}`}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <StatusBadge status={match.status} />
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-black text-gray-300">{formatMeta(match.stage)}</span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-black text-gray-300">{match.format}</span>
      </div>

      <h3 className="mt-3 line-clamp-2 text-xl font-black">{match.tournamentName}</h3>
      <p className="mt-1 text-sm text-gray-400">Match #{match.matchNumber} · {match.map || 'Map TBA'}</p>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-medium text-gray-400">
        <span><Calendar className="mr-1 inline h-4 w-4" />{new Date(match.scheduledTime).toLocaleDateString()}</span>
        <span><Clock3 className="mr-1 inline h-4 w-4" />{new Date(match.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      {live && <RoomPanel match={match} show={roomVisible} toggle={toggleRoom} copyCredential={copyCredential} />}

      {!live && !completed && (
        <div className="mt-4 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-sm text-blue-200">
          <Clock3 className="mr-2 inline h-4 w-4" />
          Starts in {timeUntil(match.scheduledTime)}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        {completed ? (
          <Button variant="outline" disabled={Boolean(claim)} onClick={claimResult}>{claim ? 'Claim Submitted' : 'Submit Claim'}</Button>
        ) : (
          <Button variant="outline" disabled={!match.roomId && live}>{live ? (match.roomId ? 'Lobby Ready' : 'Lobby Pending') : 'Scheduled'}</Button>
        )}
        <Button onClick={openTournament}>Tournament</Button>
      </div>
    </Card>
  );
}

function RoomPanel({ match, show, toggle, copyCredential }: { match: Match; show: boolean; toggle: () => void; copyCredential: (value?: string) => void }) {
  if (!match.roomId) {
    return (
      <div className="mt-4 rounded-2xl border border-yellow-500/25 bg-yellow-500/10 p-3 text-sm text-yellow-100">
        <AlertCircle className="mr-2 inline h-4 w-4" />
        Lobby is still private.
      </div>
    );
  }

  const roomIdLabel = match.tournament?.game?.lobbyLabels?.roomId || 'Room ID';
  const passwordLabel = match.tournament?.game?.lobbyLabels?.password || 'Password';

  return (
    <div className="mt-4 rounded-2xl border border-red-500/25 bg-red-500/10 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-red-200"><Lock className="h-4 w-4" />Lobby Ready</div>
      <Credential label={roomIdLabel} value={match.roomId} show={show} onCopy={() => copyCredential(match.roomId)} />
      {match.roomPassword && <Credential label={passwordLabel} value={match.roomPassword} show={show} onCopy={() => copyCredential(match.roomPassword)} />}
      <button onClick={toggle} className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-gray-300">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {show ? 'Hide' : 'Reveal'}
      </button>
    </div>
  );
}

function buildSections(matches: Match[]): MatchSection[] {
  const sorted = [...matches].sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
  const live = sorted.filter((match) => match.status === 'IN_PROGRESS' || (Boolean(match.roomId) && match.status !== 'COMPLETED'));
  const liveIds = new Set(live.map((match) => match.id));
  const completed = sorted.filter((match) => !liveIds.has(match.id) && match.status === 'COMPLETED');
  const upcoming = sorted.filter((match) => !liveIds.has(match.id) && match.status === 'SCHEDULED' && !match.roomId);

  return [
    {
      id: 'live',
      title: 'Live / Lobby Ready',
      description: 'Active matches and private room access.',
      matches: live,
    },
    {
      id: 'upcoming',
      title: 'Upcoming Matches',
      description: 'Scheduled matches waiting for room assignment.',
      matches: upcoming,
    },
    {
      id: 'completed',
      title: 'Completed / Claims',
      description: 'Submit result claims and track reward review.',
      matches: completed,
    },
  ];
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === 'IN_PROGRESS'
    ? 'border-red-400/30 bg-red-500/10 text-red-300'
    : status === 'COMPLETED'
      ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
      : 'border-blue-400/30 bg-blue-500/10 text-blue-300';
  return <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${tone}`}>{status === 'IN_PROGRESS' && <Flame className="mr-1 inline h-3 w-3" />}{status.replace(/_/g, ' ')}</span>;
}

function Credential({ label, value, show, onCopy }: { label: string; value: string; show: boolean; onCopy: () => void }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="flex items-center gap-2 font-mono text-gray-100">
        {show ? value : '••••••••'}
        <button onClick={onCopy} className="text-gray-400" aria-label={`Copy ${label}`}><Copy className="h-4 w-4" /></button>
      </span>
    </div>
  );
}

function claimTone(status?: string) {
  if (status === 'APPROVED') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
  if (status === 'REJECTED') return 'border-red-500/30 bg-red-500/10 text-red-300';
  return 'border-purple-500/30 bg-purple-500/10 text-purple-300';
}

function timeUntil(date: string) {
  const diff = new Date(date).getTime() - Date.now();
  if (diff <= 0) return 'soon';
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatMeta(value?: string) {
  return (value || 'Stage').replace(/_/g, ' ');
}
