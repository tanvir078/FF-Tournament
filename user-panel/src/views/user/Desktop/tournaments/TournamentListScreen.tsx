import Head from 'next/head';
import { useState } from 'react';
import { ChevronRight, GitBranch, Radio, Trophy } from 'lucide-react';
import { usePlatform } from '@/contexts/PlatformContext';
import Button from '@/views/user/Desktop/_components/Button';
import {
  BannerCarousel,
  InlineLoadWarning,
  LoadingSkeleton,
  Tournament,
  TournamentCard,
  isTournamentJoinable,
  sortTournaments,
  useBanners,
  useTournamentDiscoveryData,
} from '@/views/user/Desktop/_components/tournaments';

type DiscoverySection = {
  id: string;
  title: string;
  description: string;
  accent: 'open' | 'live' | 'past' | 'bracket';
  tournaments: Tournament[];
};

export default function DesktopTournamentsPage() {
  const platform = usePlatform();
  const { tournaments, loading, error, reload } = useTournamentDiscoveryData();
  const { banners } = useBanners(tournaments);
  const sections = buildDiscoverySections(tournaments);
  const hasContent = sections.some((section) => section.tournaments.length > 0);

  return (
    <>
      <Head>
        <title>Tournaments - {platform.brandName}</title>
      </Head>

      <div className="min-h-full bg-gray-950 text-white">
        <div className="mx-auto max-w-7xl space-y-8 px-6 py-6">
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <BannerCarousel banners={banners} />
              {error && <InlineLoadWarning message={error} retry={reload} />}

              {hasContent ? (
                <div className="space-y-9">
                  {sections.map((section) => (
                    <TournamentSection key={section.id} section={section} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-gray-900/55 px-8 py-14 text-center">
                  <Trophy className="mx-auto mb-4 h-14 w-14 text-gray-600" />
                  <h2 className="text-2xl font-black">No tournaments available</h2>
                  <p className="mx-auto mt-2 max-w-lg text-sm text-gray-400">
                    Registration, live, past, and bracket tournaments will appear here as soon as they are published.
                  </p>
                  <Button className="mt-6" onClick={reload}>Refresh</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function TournamentSection({ section }: { section: DiscoverySection }) {
  const [expanded, setExpanded] = useState(false);
  if (!section.tournaments.length) return null;

  const initialLimit = section.accent === 'open' ? 8 : 6;
  const visible = expanded ? section.tournaments : section.tournaments.slice(0, initialLimit);
  const hiddenCount = section.tournaments.length - visible.length;

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-5">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <SectionIcon accent={section.accent} />
            <h2 className="text-2xl font-black text-white">{section.title}</h2>
          </div>
          <p className="max-w-2xl text-sm font-medium text-gray-400">{section.description}</p>
        </div>

        {(hiddenCount > 0 || expanded) && (
          <button onClick={() => setExpanded((value) => !value)} className="inline-flex shrink-0 items-center gap-1 text-sm font-black text-primary-300 hover:text-primary-200">
            {expanded ? 'Show Less' : 'View All'}
            <ChevronRight className={`h-4 w-4 transition ${expanded ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {visible.map((tournament) => (
          <TournamentCard
            key={`${section.id}-${tournament.id}`}
            tournament={tournament}
            targetPath={section.accent === 'bracket' ? `/user/tournaments/${tournament.id}?tab=bracket` : undefined}
          />
        ))}
      </div>
    </section>
  );
}

function SectionIcon({ accent }: { accent: DiscoverySection['accent'] }) {
  const className = 'h-5 w-5';
  if (accent === 'live') return <Radio className={`${className} text-red-300`} />;
  if (accent === 'past') return <Trophy className={`${className} text-slate-300`} />;
  if (accent === 'bracket') return <GitBranch className={`${className} text-violet-300`} />;
  return <Trophy className={`${className} text-emerald-300`} />;
}

function buildDiscoverySections(tournaments: Tournament[]): DiscoverySection[] {
  const visible = sortTournaments(tournaments);
  const open = visible.filter((tournament) => isTournamentJoinable(tournament));
  const live = visible.filter((tournament) => tournament.status === 'ONGOING');
  const past = visible.filter((tournament) => ['COMPLETED', 'REGISTRATION_CLOSED'].includes(tournament.status));
  const bracket = visible.filter(isBracketTournament);

  return [
    {
      id: 'open',
      title: 'Upcoming Tournaments',
      description: 'Registration-open events that players can join right now.',
      accent: 'open',
      tournaments: open,
    },
    {
      id: 'live',
      title: 'Live / Ongoing Tournaments',
      description: 'Active rooms, running matches, and tournaments currently in play.',
      accent: 'live',
      tournaments: live,
    },
    {
      id: 'past',
      title: 'Past Tournaments',
      description: 'Recently closed and completed competitions for result review.',
      accent: 'past',
      tournaments: past,
    },
    {
      id: 'bracket',
      title: 'Bracket Tournaments',
      description: 'Knockout and elimination-format tournaments with visual bracket trees.',
      accent: 'bracket',
      tournaments: bracket,
    },
  ];
}

function isBracketTournament(tournament: Tournament) {
  const values = [
    tournament.competitionMode,
    tournament.stage,
    tournament.currentStage,
    tournament.format,
    tournament.gameMode?.format,
    tournament.gameMode?.name,
    tournament.game_mode?.format,
    tournament.game_mode?.name,
  ].filter(Boolean).join(' ').toLowerCase();

  return values.includes('knockout')
    || values.includes('bracket')
    || values.includes('single elimination')
    || values.includes('double elimination');
}
