import Head from 'next/head';
import { usePlatform } from '@/contexts/PlatformContext';
import {
  BannerCarousel,
  InlineLoadWarning,
  LoadingSkeleton,
  Tournament,
  TournamentCard,
  sortTournaments,
  useBanners,
  useTournamentDiscoveryData,
} from '@/views/user/Mobile/_components/tournaments';

export default function MobileTournamentsPage() {
  const platform = usePlatform();
  const { tournaments, loading, error, reload } = useTournamentDiscoveryData();
  const { banners } = useBanners(tournaments);
  const sections = buildTournamentSections(tournaments);

  return (
    <>
      <Head>
        <title>Tournaments - {platform.brandName}</title>
      </Head>

      <div className="min-h-full bg-gray-950 text-white">
        {loading ? (
          <div className="px-4 pt-4">
            <LoadingSkeleton mobile />
          </div>
        ) : (
          <div className="space-y-5 pb-4">
            <BannerCarousel banners={banners} compact />

            {error && (
              <div className="px-4">
                <InlineLoadWarning message={error} retry={reload} />
              </div>
            )}

            <TournamentRail
              title="Upcoming Tournaments"
              tournaments={sections.upcoming}
              emptyText="No open registration tournaments right now."
            />

            <TournamentRail
              title="Live Tournaments"
              tournaments={sections.live}
              emptyText="No live tournaments right now."
            />

            <TournamentRail
              title="Past Tournaments"
              tournaments={sections.past}
              emptyText="No past tournaments yet."
            />

            <TournamentRail
              title="Bracket Tournaments"
              tournaments={sections.bracket}
              emptyText="No bracket tournaments available."
            />
          </div>
        )}
      </div>
    </>
  );
}

function TournamentRail({
  title,
  tournaments,
  emptyText,
}: {
  title: string;
  tournaments: Tournament[];
  emptyText: string;
}) {
  if (!tournaments.length) {
    if (!emptyText) return null;
    return (
      <section className="px-4">
        <SectionHeader title={title} />
        <div className="rounded-xl border border-white/10 bg-gray-900/45 p-5 text-sm text-gray-400">{emptyText}</div>
      </section>
    );
  }

  const content = (
    <>
      <SectionHeader title={title} />
      <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2 pr-5">
        {tournaments.map((tournament) => (
          <TournamentCard
            key={tournament.id}
            tournament={tournament}
            compact
            targetPath={title === 'Bracket Tournaments' ? `/user/tournaments/${tournament.id}?tab=bracket` : undefined}
          />
        ))}
      </div>
    </>
  );

  return <section className="px-4">{content}</section>;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="mb-3 truncate text-lg font-black text-white">{title}</h2>
  );
}

function buildTournamentSections(tournaments: Tournament[]) {
  const visible = sortTournaments(tournaments);
  const upcoming = visible
    .filter((tournament) => tournament.status === 'REGISTRATION_OPEN')
    .filter((tournament) => !tournament.startDate || new Date(tournament.startDate).getTime() >= Date.now() - 3600000)
    .slice(0, 12);
  const live = visible
    .filter((tournament) => tournament.status === 'ONGOING')
    .slice(0, 12);
  const past = visible
    .filter((tournament) => ['COMPLETED', 'REGISTRATION_CLOSED'].includes(tournament.status))
    .slice(0, 12);
  const bracket = visible
    .filter(isBracketTournament)
    .slice(0, 12);

  return { upcoming, live, past, bracket };
}

function isBracketTournament(tournament: Tournament) {
  const values = [
    tournament.stage,
    tournament.currentStage,
    tournament.competitionMode,
    tournament.format,
    tournament.gameMode?.format,
    tournament.gameMode?.name,
  ].filter(Boolean).join(' ').toLowerCase();

  return ['bracket', 'knockout', 'elimination', 'semi', 'final', 'playoff'].some((keyword) => values.includes(keyword));
}
