import { Calendar, Crown, GitBranch, ShieldCheck, Users } from 'lucide-react';

export type BracketSlot = {
  teamId?: string;
  teamName?: string;
  name?: string;
  slotNumber?: number;
};

export type BracketResult = {
  teamId?: string;
  placement?: number | string;
};

export type BracketMatch = {
  id: string;
  matchNumber?: number;
  stage?: string;
  status?: string;
  scheduledTime?: string;
  map?: string;
  slots?: BracketSlot[] | null;
  results?: BracketResult[] | null;
};

type BracketTournament = {
  title?: string;
  name?: string;
  game?: { name?: string };
  competitionMode?: string;
  format?: string;
  registeredTeams?: number | string;
  maxTeams?: number | string;
  startDate?: string;
  startTime?: string;
  registrationDeadline?: string | null;
  registrationEnd?: string | null;
  checkInEnabled?: boolean;
  checkInOpensAt?: string | null;
  checkInClosesAt?: string | null;
  gameMode?: { name?: string; rosterSize?: number; substituteLimit?: number };
  maps?: string[] | null;
  minRank?: string;
  maxRank?: string;
  requiredRank?: string;
  allowedRanks?: string[] | string;
  eligibleRanks?: string[] | string;
  rankRequirement?: string;
  allowedTeamTypes?: string[] | string;
  participants?: ParticipantSource[] | null;
  registrations?: ParticipantSource[] | null;
};

type ParticipantSource = {
  id?: string;
  name?: string;
  teamName?: string;
  userName?: string;
  ign?: string;
  seed?: number;
  status?: string;
  team?: { name?: string };
  user?: { name?: string; ign?: string; platformHandle?: string };
};

const stageOrder = ['QUALIFIER', 'ROUND_2', 'ROUND_3', 'SEMI_FINAL', 'FINAL'];
const demoPlayers = ['Rafiq Storm', 'Nayeem Viper', 'Siam Blaze', 'Arman Rex', 'Tanvir Ace', 'Rakib Clutch', 'Fahim Nova', 'Sakib Phantom', 'Jisan Orbit', 'Imran Hex', 'Rayan Frost', 'Hasib Vector', 'Niloy Prime', 'Shuvo Ghost', 'Adnan Flux', 'Ovi Strike'];
const demoTeams = ['Dhaka Reapers', 'Sylhet Titans', 'Chattogram Fury', 'Rajshahi Wolves', 'Khulna Venom', 'Rangpur Eclipse', 'Barishal Hawks', 'Mymensingh Core', 'Mirpur Syndicate', 'Uttara Pulse', 'Narayanganj Nova', 'Cumilla Strikers', 'Gazipur Ghosts', 'Bogura Blazers', 'Jessore Raptors', 'Noakhali Thunder'];

export default function MobileBracketTree({
  tournament,
  matches,
}: {
  tournament: BracketTournament;
  matches: BracketMatch[];
}) {
  const sourceMatches = matches.filter((match) => stageOrder.includes(match.stage || ''));
  const sourceEntrants = getEntrants(tournament, sourceMatches);
  const entrants = sourceEntrants.length ? sourceEntrants : createDemoEntrants(tournament);
  const bracketMatches = sourceMatches.length ? hydrateEmptySlots(sourceMatches, entrants) : createBracketSkeleton(tournament, entrants);
  const grouped = groupByStage(bracketMatches);
  const stages = stageOrder.filter((stage) => grouped[stage]?.length);
  const isKnockout = tournament.competitionMode === 'KNOCKOUT' || bracketMatches.length > 0;

  if (!isKnockout) return <BracketEmpty title="Bracket unavailable" />;

  const timeline = getTimeline(tournament, bracketMatches);
  const eligibility = getEligibility(tournament);

  return (
    <div className="-mx-4 space-y-3">
      <div className="border-y border-white/10 bg-[#070b14]">
        <div className="scrollbar-hide overflow-x-auto px-4 py-4">
          <div className="flex min-w-max gap-5">
            {stages.map((stage, stageIndex) => (
              <section key={stage} className="w-[246px] flex-none">
                <div className="mb-3 flex h-8 items-center justify-between border-b border-white/10">
                  <h3 className="text-xs font-black uppercase tracking-[0.16em] text-gray-300">{stageLabel(stage)}</h3>
                  <span className="text-[10px] font-black text-gray-600">{grouped[stage].length}</span>
                </div>

                <div className="relative space-y-4">
                  {grouped[stage].map((match, matchIndex) => (
                    <BracketNode
                      key={match.id}
                      match={match}
                      connectOut={stageIndex < stages.length - 1}
                      offset={stageIndex * 22 + (matchIndex % 2) * 14}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 px-4">
        <section className="border-y border-white/10 bg-[#070b14] px-3 py-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-gray-300"><Users className="h-4 w-4 text-primary-300" /> Seeds</span>
            <span className="text-xs font-black text-gray-500">{entrants.length}/{Number(tournament.maxTeams || 0) || '-'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(entrants.length ? entrants : [{ id: 'seed-pending', name: 'Seed pending' }]).map((entrant, index) => (
              <div key={`${entrant.id}-${index}`} className="flex h-9 min-w-0 items-center gap-2 border border-white/10 bg-white/[0.03] px-2">
                <span className="w-5 shrink-0 text-[10px] font-black text-gray-500">{index + 1}</span>
                <span className="truncate text-xs font-bold text-gray-200">{entrant.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#070b14] px-3 py-3">
          <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-gray-300"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Eligibility</div>
          <div className="flex flex-wrap gap-2">
            {eligibility.map((item) => <span key={item} className="border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-bold text-gray-300">{item}</span>)}
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#070b14] px-3 py-3">
          <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-gray-300"><Calendar className="h-4 w-4 text-sky-300" /> Timeline</div>
          <div className="space-y-2">
            {timeline.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 border-b border-white/5 pb-2 text-xs last:border-0 last:pb-0">
                <span className="text-gray-500">{item.label}</span>
                <span className="text-right font-bold text-gray-300">{item.value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function BracketNode({ match, connectOut, offset }: { match: BracketMatch; connectOut: boolean; offset: number }) {
  const winnerId = getWinnerId(match);
  const slots = normalizeSlots(match.slots);

  return (
    <div className="relative" style={{ paddingTop: offset }}>
      {connectOut && (
        <div className="absolute right-[-20px] top-[calc(50%+var(--node-offset,0px))] h-px w-5 bg-white/20" />
      )}

      <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0c1220] shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
        <div className="flex h-7 items-center justify-between border-b border-white/10 px-2.5">
          <span className="text-[10px] font-black text-gray-400">M{match.matchNumber || '-'}</span>
          <span className={`h-2 w-2 rounded-full ${statusDot(match.status)}`} />
        </div>

        {slots.map((slot, index) => {
          const won = winnerId && slot.teamId === winnerId;
          return (
            <div
              key={`${match.id}-${slot.slotNumber || index}`}
              className={`flex h-10 items-center justify-between gap-2 border-b border-white/5 px-2.5 last:border-b-0 ${
                won ? 'bg-emerald-400/10 text-white' : 'text-gray-300'
              }`}
            >
              <span className={`min-w-0 truncate text-xs font-bold ${isTbd(slot) ? 'text-gray-500' : ''}`}>{slot.teamName || slot.name || 'TBD'}</span>
              {won && <Crown className="h-3.5 w-3.5 shrink-0 text-yellow-300" />}
            </div>
          );
        })}

        <div className="flex h-7 items-center justify-between gap-2 border-t border-white/10 px-2.5 text-[10px] font-bold text-gray-500">
          <span className="truncate">{match.map || 'Map TBA'}</span>
          <span className="shrink-0">{match.scheduledTime ? formatDateTime(match.scheduledTime) : statusLabel(match.status)}</span>
        </div>
      </div>
    </div>
  );
}

function BracketEmpty({ title }: { title: string }) {
  return (
    <div className="-mx-4 grid min-h-[280px] place-items-center border-y border-white/10 bg-[#070b14] px-4 text-center">
      <div>
        <GitBranch className="mx-auto mb-3 h-10 w-10 text-gray-600" />
        <h3 className="text-sm font-black uppercase tracking-[0.16em] text-gray-300">{title}</h3>
      </div>
    </div>
  );
}

function groupByStage(matches: BracketMatch[]) {
  return matches.reduce<Record<string, BracketMatch[]>>((groups, match) => {
    const stage = match.stage || 'QUALIFIER';
    groups[stage] = [...(groups[stage] || []), match].sort((a, b) => Number(a.matchNumber || 0) - Number(b.matchNumber || 0));
    return groups;
  }, {});
}

function normalizeSlots(slots?: BracketSlot[] | null) {
  const next = Array.isArray(slots) ? [...slots] : [];
  while (next.length < 2) next.push({ slotNumber: next.length + 1, teamName: 'TBD' });
  return next.sort((a, b) => Number(a.slotNumber || 0) - Number(b.slotNumber || 0)).slice(0, 2);
}

function getEntrants(tournament: BracketTournament, matches: BracketMatch[]) {
  const entrants = new Map<string, { id: string; name: string }>();
  matches.forEach((match) => {
    (match.slots || []).forEach((slot) => {
      const name = slot.teamName || slot.name;
      if (!name || name === 'TBD') return;
      entrants.set(slot.teamId || name, { id: slot.teamId || name, name });
    });
  });
  [...(tournament.participants || []), ...(tournament.registrations || [])].forEach((item) => {
    const name = item.teamName || item.team?.name || item.user?.platformHandle || item.user?.ign || item.user?.name || item.ign || item.userName || item.name;
    if (!name) return;
    entrants.set(item.id || name, { id: item.id || name, name });
  });
  return Array.from(entrants.values());
}

function hydrateEmptySlots(matches: BracketMatch[], entrants: Array<{ id: string; name: string }>) {
  let cursor = 0;
  return matches.map((match) => {
    const slots = normalizeSlots(match.slots).map((slot) => {
      if (!isTbd(slot)) return slot;
      const entrant = match.stage === 'QUALIFIER' ? entrants[cursor++] : null;
      return entrant ? { teamId: entrant.id, teamName: entrant.name, slotNumber: slot.slotNumber } : slot;
    });
    return { ...match, slots };
  });
}

function createBracketSkeleton(tournament: BracketTournament, entrants: Array<{ id: string; name: string }>) {
  const size = getBracketSize(tournament);
  const seeded = entrants.slice(0, size);
  while (seeded.length < size) seeded.push({ id: `tbd-${seeded.length + 1}`, name: 'TBD' });

  const stages = getSkeletonStages(size);
  let matchNumber = 1;
  let stageSize = size;
  let cursor = 0;

  return stages.flatMap((stage, stageIndex) => {
    const matchCount = Math.max(1, stageSize / 2);
    const stageMatches = Array.from({ length: matchCount }).map((_, index) => {
      const first = stageIndex === 0 ? seeded[cursor++] : { id: `${stage}-${index}-a`, name: 'TBD' };
      const second = stageIndex === 0 ? seeded[cursor++] : { id: `${stage}-${index}-b`, name: 'TBD' };
      return {
        id: `generated-${stage}-${index}`,
        matchNumber: matchNumber++,
        stage,
        status: 'SCHEDULED',
        map: tournament.maps?.[index % Math.max(1, tournament.maps.length)] || 'Map TBA',
        scheduledTime: stageIndex === 0 ? tournament.startDate : undefined,
        slots: [
          { teamId: first.id, teamName: first.name, slotNumber: 1 },
          { teamId: second.id, teamName: second.name, slotNumber: 2 },
        ],
      };
    });
    stageSize = matchCount;
    return stageMatches;
  });
}

function getBracketSize(tournament: BracketTournament) {
  const maxTeams = Number(tournament.maxTeams || 0);
  const registered = Number(tournament.registeredTeams || 0);
  const target = maxTeams || registered || 8;
  return Math.max(2, Math.min(16, nextPowerOfTwo(target)));
}

function nextPowerOfTwo(value: number) {
  let next = 1;
  while (next < value) next *= 2;
  return next;
}

function getSkeletonStages(size: number) {
  if (size <= 2) return ['FINAL'];
  if (size <= 4) return ['QUALIFIER', 'FINAL'];
  if (size <= 8) return ['QUALIFIER', 'SEMI_FINAL', 'FINAL'];
  return ['QUALIFIER', 'ROUND_2', 'SEMI_FINAL', 'FINAL'];
}

function createDemoEntrants(tournament: BracketTournament) {
  const teamMode = Number(tournament.gameMode?.rosterSize || (tournament.format === 'SOLO' ? 1 : tournament.format === 'DUO' ? 2 : 4)) > 1;
  const size = getBracketSize(tournament);
  const names = teamMode ? demoTeams : demoPlayers;
  return Array.from({ length: size }).map((_, index) => ({
    id: `demo-${index + 1}`,
    name: names[index % names.length],
  }));
}

function getEligibility(tournament: BracketTournament) {
  const ranks = tournament.allowedRanks || tournament.eligibleRanks;
  const rankLabel = Array.isArray(ranks) ? ranks.join(', ') : ranks;
  const teamTypes = Array.isArray(tournament.allowedTeamTypes) ? tournament.allowedTeamTypes.join(', ') : tournament.allowedTeamTypes;
  return [
    tournament.rankRequirement || rankLabel || (tournament.minRank || tournament.maxRank ? `${tournament.minRank || 'Any'} - ${tournament.maxRank || 'Any'}` : ''),
    teamTypes || tournament.gameMode?.name || tournament.format || 'Open lineup',
    tournament.gameMode?.rosterSize ? `${tournament.gameMode.rosterSize} starters` : '',
    tournament.gameMode?.substituteLimit ? `${tournament.gameMode.substituteLimit} substitutes` : '',
  ].filter(Boolean);
}

function getTimeline(tournament: BracketTournament, matches: BracketMatch[]) {
  const firstMatch = [...matches].filter((match) => match.scheduledTime).sort((a, b) => new Date(a.scheduledTime || '').getTime() - new Date(b.scheduledTime || '').getTime())[0];
  return [
    { label: 'Registration', value: formatDate(tournament.registrationDeadline || tournament.registrationEnd || undefined) },
    { label: 'Check-in', value: tournament.checkInEnabled ? `${formatDate(tournament.checkInOpensAt || undefined)} - ${formatDate(tournament.checkInClosesAt || undefined)}` : 'Not required' },
    { label: 'First match', value: firstMatch?.scheduledTime ? formatDateTime(firstMatch.scheduledTime) : `${formatDate(tournament.startDate)}${tournament.startTime ? ` ${tournament.startTime}` : ''}` },
    { label: 'State', value: getBracketState(matches) },
  ];
}

function getBracketState(matches: BracketMatch[]) {
  if (matches.some((match) => match.status === 'IN_PROGRESS')) return 'Live';
  if (matches.every((match) => match.status === 'COMPLETED')) return 'Completed';
  return 'Scheduled';
}

function isTbd(slot: BracketSlot) {
  return !(slot.teamName || slot.name) || slot.teamName === 'TBD' || slot.name === 'TBD';
}

function getWinnerId(match: BracketMatch) {
  return match.results?.find((result) => Number(result.placement) === 1)?.teamId || match.results?.[0]?.teamId || '';
}

function stageLabel(stage: string) {
  return stage.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(date?: string | null) {
  if (!date) return 'TBA';
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function formatDateTime(date?: string | null) {
  if (!date) return 'TBA';
  return new Date(date).toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function statusDot(status?: string) {
  if (status === 'COMPLETED') return 'bg-emerald-400';
  if (status === 'IN_PROGRESS') return 'bg-red-400 shadow-[0_0_18px_rgba(248,113,113,0.9)]';
  return 'bg-gray-500';
}

function statusLabel(status?: string) {
  return (status || 'SCHEDULED').replace(/_/g, ' ');
}
