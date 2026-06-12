import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
  ArrowRight,
  Calendar,
  Clock3,
  Flame,
  Gamepad2,
  RefreshCw,
  Search,
  ShieldCheck,
  Trophy,
  Users,
  WalletCards,
} from 'lucide-react';
import dashboardBg from '@/images/dashboard-bg.png';
import api from '@/lib/api';
import Button from '@/views/user/Mobile/_components/Button';
import Card from '@/views/user/Mobile/_components/Card';

export type Game = {
  id: string;
  name: string;
  icon?: string;
  banner?: string;
  modes?: Array<{ id?: string; name?: string; format?: string; enabled?: boolean }>;
};

export type Banner = {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  isActive?: boolean;
  order?: number;
  startDate?: string | null;
  endDate?: string | null;
  isFeatured?: boolean;
};

export type Tournament = {
  id: string;
  name?: string;
  title?: string;
  gameId?: string;
  game?: { id?: string; name?: string; banner?: string; icon?: string };
  gameMode?: { id?: string; name?: string; format?: string };
  game_mode?: { id?: string; name?: string; format?: string; rosterSize?: number; substituteLimit?: number };
  banner?: string;
  description?: string;
  format?: string;
  stage?: string;
  currentStage?: string;
  competitionMode?: string;
  entryFee?: number | string;
  prizePool?: number | string;
  registrationEnd?: string;
  registrationDeadline?: string;
  startDate?: string;
  startTime?: string;
  status: string;
  registeredTeams?: number;
  maxTeams?: number;
  isFree?: boolean;
  isFeatured?: boolean;
};

export type StatusFilter = 'ALL' | 'REGISTRATION_OPEN' | 'UPCOMING' | 'ONGOING' | 'COMPLETED';
export type FeeFilter = 'ALL' | 'FREE' | 'PAID';

export const statusTabs: Array<{ value: StatusFilter; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'REGISTRATION_OPEN', label: 'Open' },
  { value: 'UPCOMING', label: 'Upcoming' },
  { value: 'ONGOING', label: 'Live' },
  { value: 'COMPLETED', label: 'Completed' },
];

export const feeOptions: Array<{ value: FeeFilter; label: string }> = [
  { value: 'ALL', label: 'Any fee' },
  { value: 'FREE', label: 'Free' },
  { value: 'PAID', label: 'Paid' },
];

const statusTone: Record<string, string> = {
  DRAFT: 'border-gray-500/40 bg-gray-500/15 text-gray-300',
  REGISTRATION_OPEN: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300',
  REGISTRATION_CLOSED: 'border-amber-400/40 bg-amber-500/15 text-amber-300',
  ONGOING: 'border-red-400/40 bg-red-500/15 text-red-300',
  COMPLETED: 'border-slate-400/40 bg-slate-500/15 text-slate-300',
  CANCELLED: 'border-rose-400/40 bg-rose-500/15 text-rose-300',
};

export function useTournamentDiscoveryData() {
  const [games, setGames] = useState<Game[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    const [gameResponse, tournamentResponse] = await Promise.allSettled([
      api.get('/games'),
      api.get('/tournaments'),
    ]);

    if (tournamentResponse.status === 'fulfilled') {
      const nextTournaments = normalizeTournaments(tournamentResponse.value.data).filter(isVisibleTournament);
      const nextGames = gameResponse.status === 'fulfilled'
        ? normalizeApiList<Game>(gameResponse.value.data)
        : deriveGamesFromTournaments(nextTournaments);

      setTournaments(nextTournaments);
      setGames(nextGames);
      setLoading(false);
      return;
    }

    const requestError: any = tournamentResponse.reason;
    const status = requestError?.response?.status;
    const message = requestError?.response?.data?.message;

    setGames([]);
    setTournaments([]);
    setError(
      status === 401 || status === 403
        ? 'Session expired. Please login again to view tournaments.'
        : message || 'Tournament API is not responding right now.'
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { games, tournaments, loading, error, reload: load };
}

function normalizeApiList<T>(value: any): T[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

export function normalizeTournament(value: any): Tournament {
  return {
    ...value,
    gameMode: value?.gameMode || value?.game_mode,
  };
}

export function normalizeTournaments(value: any): Tournament[] {
  return normalizeApiList<any>(value).map(normalizeTournament);
}

function deriveGamesFromTournaments(tournaments: Tournament[]): Game[] {
  const gamesById = new Map<string, Game>();

  tournaments.forEach((tournament) => {
    const id = tournament.gameId || tournament.game?.id || tournament.game?.name;
    const name = tournament.game?.name;

    if (!id || !name || gamesById.has(id)) return;

    gamesById.set(id, {
      id,
      name,
      icon: tournament.game?.icon,
      banner: tournament.game?.banner,
      modes: tournament.gameMode ? [{
        id: tournament.gameMode.id,
        name: tournament.gameMode.name,
        format: tournament.gameMode.format,
      }] : [],
    });
  });

  return Array.from(gamesById.values());
}

export function useBanners(tournaments: Tournament[]) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/banners');
      const active = getActiveBanners(response.data || []);
      setBanners(active);
    } catch {
      setBanners(createFallbackBanners(tournaments));
    } finally {
      setLoading(false);
    }
  }, [tournaments]);

  useEffect(() => {
    void load();
  }, [load]);

  const resolved = banners.length ? banners : createFallbackBanners(tournaments);

  return { banners: resolved, loading, reload: load };
}

export function useTournamentFilters(tournaments: Tournament[], games: Game[]) {
  const [search, setSearch] = useState('');
  const [gameId, setGameId] = useState('ALL');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [fee, setFee] = useState<FeeFilter>('ALL');
  const [mode, setMode] = useState('ALL');

  const modeOptions = useMemo(() => {
    const labels = new Set<string>();
    tournaments.forEach((tournament) => {
      const label = tournament.gameMode?.name || tournament.format;
      if (label) labels.add(label);
    });
    games.forEach((game) => {
      game.modes?.forEach((gameMode) => {
        if (gameMode.enabled === false) return;
        const label = gameMode.name || gameMode.format;
        if (label) labels.add(label);
      });
    });
    return ['ALL', ...Array.from(labels).sort()];
  }, [games, tournaments]);

  const filtered = useMemo(() => tournaments.filter((tournament) => {
    const title = getTournamentTitle(tournament).toLowerCase();
    const startsAt = tournament.startDate ? new Date(tournament.startDate) : null;
    const startsInHours = startsAt ? (startsAt.getTime() - Date.now()) / 3600000 : Infinity;
    const statusMatch = status === 'ALL' || (status === 'UPCOMING'
      ? ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED'].includes(tournament.status) && startsInHours > 0
      : tournament.status === status);
    const feeMatch = fee === 'ALL' || (fee === 'FREE' ? isFreeTournament(tournament) : !isFreeTournament(tournament));
    const modeLabel = tournament.gameMode?.name || tournament.format || '';

    return title.includes(search.trim().toLowerCase())
      && (gameId === 'ALL' || tournament.gameId === gameId || tournament.game?.id === gameId)
      && statusMatch
      && feeMatch
      && (mode === 'ALL' || modeLabel === mode);
  }), [fee, gameId, mode, search, status, tournaments]);

  const resetFilters = () => {
    setSearch('');
    setGameId('ALL');
    setStatus('ALL');
    setFee('ALL');
    setMode('ALL');
  };

  return {
    search,
    setSearch,
    gameId,
    setGameId,
    status,
    setStatus,
    fee,
    setFee,
    mode,
    setMode,
    modeOptions,
    filtered,
    resetFilters,
  };
}

export function getActiveBanners(banners: Banner[]) {
  const now = Date.now();

  return banners
    .filter((banner) => {
      if (banner.isActive === false) return false;
      const startsAt = banner.startDate ? new Date(banner.startDate).getTime() : null;
      const endsAt = banner.endDate ? new Date(banner.endDate).getTime() : null;
      if (startsAt && startsAt > now) return false;
      if (endsAt && endsAt < now) return false;
      return Boolean(banner.imageUrl);
    })
    .sort((first, second) => Number(first.order || 0) - Number(second.order || 0));
}

export function createFallbackBanners(tournaments: Tournament[]) {
  const featured = sortTournaments(tournaments)
    .filter(isVisibleTournament)
    .filter((tournament) => getTournamentImage(tournament))
    .slice(0, 4);

  if (!featured.length) {
    return [{
      id: 'fallback-arena',
      title: 'Tournament Arena',
      description: 'Join live rooms, squad battles, and featured competitions.',
      imageUrl: dashboardBg.src,
      linkUrl: '/user/tournaments',
      isActive: true,
      order: 0,
      isFeatured: true,
    }];
  }

  return featured.map((tournament, index) => ({
    id: `fallback-${tournament.id}`,
    title: getTournamentTitle(tournament),
    description: `${tournament.game?.name || 'Game'} · ${getTournamentTimingLabel(tournament)} · Prize ৳${Number(tournament.prizePool || 0).toLocaleString()}`,
    imageUrl: getTournamentImage(tournament) || dashboardBg.src,
    linkUrl: `/user/tournaments/${tournament.id}`,
    isActive: true,
    order: index,
    isFeatured: Boolean(tournament.isFeatured),
  }));
}

export function getTournamentTitle(tournament: Tournament) {
  return tournament.title || tournament.name || 'Untitled Tournament';
}

export function getTournamentImage(tournament?: Tournament | null) {
  return tournament?.banner || tournament?.game?.banner || '';
}

export function getHeroImage(tournaments: Tournament[], games: Game[], selectedGameId: string) {
  const featuredOpen = getFeaturedTournament(tournaments);
  if (featuredOpen) return getTournamentImage(featuredOpen);

  const selectedGame = games.find((game) => game.id === selectedGameId && game.banner);
  if (selectedGame?.banner) return selectedGame.banner;

  const firstTournamentWithBanner = tournaments.find((tournament) => getTournamentImage(tournament));
  if (firstTournamentWithBanner) return getTournamentImage(firstTournamentWithBanner);

  return dashboardBg.src;
}

export function getFeaturedTournament(tournaments: Tournament[]) {
  const visible = sortTournaments(tournaments).filter(isVisibleTournament);

  return visible.find((tournament) =>
    tournament.isFeatured && tournament.status === 'REGISTRATION_OPEN' && getTournamentImage(tournament)
  ) || visible.find((tournament) =>
    tournament.status === 'REGISTRATION_OPEN' && getTournamentImage(tournament)
  ) || visible.find((tournament) => getTournamentImage(tournament)) || null;
}

export function getUpcomingTournaments(tournaments: Tournament[], limit?: number) {
  const upcoming = sortTournaments(tournaments)
    .filter((tournament) => {
      if (tournament.status === 'COMPLETED' || tournament.status === 'CANCELLED') return false;
      if (!tournament.startDate) return tournament.status === 'REGISTRATION_OPEN' || tournament.status === 'REGISTRATION_CLOSED';
      return new Date(tournament.startDate).getTime() >= Date.now() - 3600000;
    })
    .sort((first, second) => getTimeValue(first.startDate) - getTimeValue(second.startDate));

  return typeof limit === 'number' ? upcoming.slice(0, limit) : upcoming;
}

export function groupTournamentsByGame(tournaments: Tournament[], games: Game[], selectedGameId: string) {
  const sorted = sortTournaments(tournaments);
  if (selectedGameId !== 'ALL') {
    const game = games.find((item) => item.id === selectedGameId);
    return [{
      id: selectedGameId,
      title: game?.name || sorted[0]?.game?.name || 'Selected Game',
      tournaments: sorted,
    }];
  }

  const groups = games.map((game) => ({
    id: game.id,
    title: game.name,
    tournaments: sorted.filter((tournament) => tournament.gameId === game.id || tournament.game?.id === game.id),
  })).filter((group) => group.tournaments.length > 0);

  const knownIds = new Set(games.map((game) => game.id));
  const uncategorized = sorted.filter((tournament) => !tournament.gameId || !knownIds.has(tournament.gameId));

  return [
    ...(sorted.length ? [{ id: 'ALL', title: 'All Games', tournaments: sorted }] : []),
    ...groups,
    ...(uncategorized.length ? [{ id: 'OTHER', title: 'Other Tournaments', tournaments: uncategorized }] : []),
  ];
}

export function groupTournamentsByGameAndStatus(tournaments: Tournament[], games: Game[], selectedGameId: string) {
  const gameGroups = groupTournamentsByGame(tournaments, games, selectedGameId)
    .filter((group) => selectedGameId !== 'ALL' || group.id !== 'ALL');

  const groups = gameGroups.length
    ? gameGroups
    : (tournaments.length ? [{ id: 'ALL', title: 'All Games', tournaments: sortTournaments(tournaments) }] : []);

  return groups.map((group) => {
    const sorted = sortTournaments(group.tournaments);
    const open = sorted.filter((tournament) => tournament.status === 'REGISTRATION_OPEN');
    const live = sorted.filter((tournament) => tournament.status === 'ONGOING');
    const recent = sorted.filter((tournament) => ['COMPLETED', 'REGISTRATION_CLOSED'].includes(tournament.status));

    return {
      ...group,
      rails: [
        ...(open.length ? [{ id: `${group.id}-open`, title: 'Open Registration', tournaments: open }] : []),
        ...(live.length ? [{ id: `${group.id}-live`, title: 'Live Now', tournaments: live }] : []),
        ...(recent.length ? [{ id: `${group.id}-recent`, title: 'Recent & Closed', tournaments: recent }] : []),
        ...(!open.length && !live.length && !recent.length && sorted.length
          ? [{ id: `${group.id}-all`, title: 'All Tournaments', tournaments: sorted }]
          : []),
      ],
    };
  });
}

export function BannerCarousel({
  banners,
  compact = false,
}: {
  banners: Banner[];
  compact?: boolean;
}) {
  const router = useRouter();

  const openBanner = (banner: Banner) => {
    if (!banner.linkUrl) return;

    if (banner.linkUrl.startsWith('/')) {
      router.push(banner.linkUrl);
      return;
    }

    window.open(banner.linkUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section aria-label="Tournament promotions">
      <div className={`scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto ${compact ? 'px-4 pb-1' : 'pb-2'}`}>
        {banners.map((banner) => (
          <button
            key={banner.id}
            type="button"
            onClick={() => openBanner(banner)}
            className={`${compact ? 'h-[250px] w-[calc(100vw-2rem)] min-w-[calc(100vw-2rem)]' : 'h-[360px] w-full min-w-full'} relative snap-start overflow-hidden rounded-2xl bg-gray-900`}
            aria-label={banner.title}
          >
            <img src={banner.imageUrl} alt={banner.title} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </section>
  );
}

export function sortTournaments(tournaments: Tournament[]) {
  const statusWeight: Record<string, number> = {
    ONGOING: 0,
    REGISTRATION_OPEN: 1,
    REGISTRATION_CLOSED: 2,
    DRAFT: 3,
    COMPLETED: 4,
    CANCELLED: 5,
  };

  return [...tournaments].sort((first, second) => {
    const featuredDiff = Number(Boolean(second.isFeatured)) - Number(Boolean(first.isFeatured));
    if (featuredDiff) return featuredDiff;

    const statusDiff = (statusWeight[first.status] ?? 10) - (statusWeight[second.status] ?? 10);
    if (statusDiff) return statusDiff;

    return getTimeValue(first.startDate) - getTimeValue(second.startDate);
  });
}

export function TournamentCard({
  tournament,
  compact = false,
  targetPath,
}: {
  tournament: Tournament;
  compact?: boolean;
  targetPath?: string;
}) {
  const router = useRouter();
  const title = getTournamentTitle(tournament);
  const image = getTournamentImage(tournament);
  const maxTeams = Number(tournament.maxTeams || 0);
  const registeredTeams = Number(tournament.registeredTeams || 0);
  const progress = maxTeams ? Math.min(100, (registeredTeams / maxTeams) * 100) : 0;
  const full = isTournamentFull(tournament);
  const entryLabel = isFreeTournament(tournament) ? 'Free' : `৳${Number(tournament.entryFee || 0).toLocaleString()}`;
  const canJoin = isTournamentJoinable(tournament);
  const cta = canJoin ? 'Join Tournament' : 'View Details';
  const stage = formatMetaLabel(tournament.stage || tournament.currentStage || tournament.competitionMode);
  const timingLabel = getTournamentTimingLabel(tournament);

  return (
    <button
      type="button"
      onClick={() => router.push(targetPath || (canJoin ? `/user/tournaments/${tournament.id}/join` : `/user/tournaments/${tournament.id}`))}
      className={`group flex-none overflow-hidden rounded-xl border border-white/10 bg-gray-900/80 text-left transition hover:-translate-y-0.5 hover:border-primary-400/50 ${compact ? 'w-[236px]' : 'w-full'}`}
    >
      <div className={`${compact ? 'h-[126px]' : 'h-36'} relative overflow-hidden bg-gray-800`}>
        {image ? (
          <img src={image} alt="" className="h-full w-full object-cover opacity-85 transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.28),transparent_36%),linear-gradient(135deg,#111827,#172554)]">
            <Trophy className="h-12 w-12 text-primary-300/80" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <StatusBadge status={tournament.status} />
          {!compact && tournament.isFeatured && (
            <span className="rounded-full border border-yellow-300/40 bg-yellow-400/15 px-2.5 py-1 text-[10px] font-black uppercase text-yellow-200">
              Featured
            </span>
          )}
          {!compact && full && (
            <span className="rounded-full border border-rose-300/40 bg-rose-500/15 px-2.5 py-1 text-[10px] font-black uppercase text-rose-200">
              Full
            </span>
          )}
        </div>
      </div>

      <div className={`${compact ? 'p-3.5' : 'p-4'}`}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="truncate text-xs font-bold text-primary-300">
            {tournament.game?.name || 'Tournament'}
          </span>
          <span className="shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-gray-300">
            {tournament.gameMode?.name || tournament.format || 'Mode'}
          </span>
        </div>

        <h3 className={`${compact ? 'min-h-[2.5rem] text-sm' : 'min-h-[3.25rem] text-lg'} line-clamp-2 font-black leading-tight text-white`}>
          {title}
        </h3>

        {!compact && (
          <div className="mt-3 flex flex-wrap gap-2">
            {stage && (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-gray-300">
                {stage}
              </span>
            )}
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-gray-300">
              {timingLabel}
            </span>
          </div>
        )}

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-gray-800">
          <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-emerald-400" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs font-medium text-gray-400">
          {!compact && <span className="min-w-0 truncate"><Users className="mr-1 inline h-3.5 w-3.5" />{registeredTeams}/{maxTeams || '-'}</span>}
          <span className="min-w-0 truncate"><WalletCards className="mr-1 inline h-3.5 w-3.5" />{entryLabel}</span>
          <span className="min-w-0 truncate"><Trophy className="mr-1 inline h-3.5 w-3.5" />৳{Number(tournament.prizePool || 0).toLocaleString()}</span>
          <span className="min-w-0 truncate"><Calendar className="mr-1 inline h-3.5 w-3.5" />{formatDate(tournament.startDate)}</span>
        </div>

        <span className="mt-4 inline-flex items-center gap-2 text-xs font-black text-primary-300">
          {cta}
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </button>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${statusTone[status] || 'border-gray-600 bg-gray-900/70 text-gray-300'}`}>
      {status === 'ONGOING' && <Flame className="mr-1 inline h-3 w-3" />}
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder = 'Search tournaments',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative min-w-0">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-white/10 bg-gray-950/80 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-primary-400"
      />
    </div>
  );
}

export function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return (
    <Card className="border-red-500/30 bg-red-500/10 p-8 text-center">
      <p className="font-bold text-red-200">{message}</p>
      <Button className="mt-5 gap-2" onClick={retry}>
        <RefreshCw className="h-4 w-4" />
        Retry
      </Button>
    </Card>
  );
}

export function InlineLoadWarning({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-black text-amber-100">Tournament feed unavailable</p>
          <p className="mt-1 text-sm text-amber-100/75">{message}</p>
        </div>
        <Button className="gap-2" size="sm" onClick={retry}>
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    </div>
  );
}

export function EmptyState({ reset }: { reset: () => void }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-10 text-center">
      <Trophy className="mx-auto mb-4 h-14 w-14 text-gray-600" />
      <h3 className="text-xl font-black text-white">No tournaments found</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
        Try changing the game, status, mode, or search term to find another competition.
      </p>
      <Button className="mt-5" variant="outline" onClick={reset}>
        Reset Filters
      </Button>
    </div>
  );
}

export function LoadingSkeleton({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className="space-y-6">
      <div className={`animate-pulse rounded-2xl bg-gray-800 ${mobile ? 'h-52' : 'h-72'}`} />
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: mobile ? 5 : 8 }).map((_, index) => (
          <div key={index} className="h-10 w-28 flex-none animate-pulse rounded-full bg-gray-800" />
        ))}
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: mobile ? 3 : 4 }).map((_, index) => (
          <div key={index} className={`${mobile ? 'h-80 w-[244px]' : 'h-96 w-[318px]'} flex-none animate-pulse rounded-xl bg-gray-800`} />
        ))}
      </div>
    </div>
  );
}

export function SpotlightPanel({ tournament }: { tournament: Tournament | null }) {
  if (!tournament) return null;

  const title = getTournamentTitle(tournament);
  const description = tournament.description || 'Featured competition ready for registration. Review rules, prepare your lineup, and enter before slots close.';
  
  return (
    <Card className="border-white/10 bg-gray-950/65 p-4 backdrop-blur">
      <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary-200">
        <ShieldCheck className="h-4 w-4" />
        Spotlight
      </div>
      <h2 className="line-clamp-2 text-xl font-black text-white">{title}</h2>
      <p className="mt-2 line-clamp-2 text-sm text-gray-300">{description}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-gray-300">
        <span className="rounded-lg bg-white/5 px-3 py-2"><Trophy className="mr-1 inline h-3.5 w-3.5 text-yellow-300" />৳{Number(tournament.prizePool || 0).toLocaleString()}</span>
        <span className="rounded-lg bg-white/5 px-3 py-2"><Clock3 className="mr-1 inline h-3.5 w-3.5 text-primary-300" />{getTournamentTimingLabel(tournament)}</span>
      </div>
    </Card>
  );
}

export function formatDate(date?: string) {
  if (!date) return 'TBA';
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export function getTournamentTimingLabel(tournament: Tournament) {
  if (tournament.status === 'ONGOING') return 'Live now';

  const deadline = tournament.registrationDeadline || tournament.registrationEnd;
  if (tournament.status === 'REGISTRATION_OPEN' && deadline) {
    const deadlineValue = getDeadlineTimeValue(deadline);
    if (deadlineValue && deadlineValue < Date.now()) return 'Registration closed';
    return `Closes ${formatDate(deadline)}`;
  }

  if (tournament.startDate) return `Starts ${formatDate(tournament.startDate)}`;
  return 'Schedule TBA';
}

function formatMetaLabel(value?: string) {
  if (!value) return '';
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getTimeValue(date?: string) {
  if (!date) return Number.MAX_SAFE_INTEGER;
  const value = new Date(date).getTime();
  return Number.isNaN(value) ? Number.MAX_SAFE_INTEGER : value;
}

export function isVisibleTournament(tournament: Tournament) {
  return !['DRAFT', 'CANCELLED'].includes(tournament.status);
}

export function isTournamentFull(tournament: Tournament) {
  const maxTeams = Number(tournament.maxTeams || 0);
  const registeredTeams = Number(tournament.registeredTeams || 0);
  return Boolean(maxTeams && registeredTeams >= maxTeams);
}

export function isTournamentJoinable(tournament: Tournament) {
  if (tournament.status !== 'REGISTRATION_OPEN') return false;
  if (isTournamentFull(tournament)) return false;

  const deadline = tournament.registrationDeadline || tournament.registrationEnd;
  const deadlineValue = getDeadlineTimeValue(deadline);
  return !deadlineValue || deadlineValue >= Date.now();
}

export function getDeadlineTimeValue(date?: string | null) {
  if (!date) return null;
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const value = dateOnly ? new Date(`${date}T23:59:59`).getTime() : new Date(date).getTime();
  if (!dateOnly && /\s00:00:00$/.test(date)) {
    const dayEnd = new Date(date.replace(/\s00:00:00$/, 'T23:59:59')).getTime();
    return Number.isNaN(dayEnd) ? null : dayEnd;
  }
  return Number.isNaN(value) ? null : value;
}

export function isFreeTournament(tournament: Tournament) {
  return Boolean(tournament.isFree) || Number(tournament.entryFee || 0) <= 0;
}
