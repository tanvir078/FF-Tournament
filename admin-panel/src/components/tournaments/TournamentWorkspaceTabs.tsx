import { useRouter } from 'next/router';

const tabs = [
  ['Overview', ''],
  ['Registrations', 'registrations'],
  ['Line-ups', 'lineups'],
  ['Matches', 'matches'],
  ['Rooms', 'rooms'],
  ['Bracket', 'bracket'],
  ['Claims', 'claims'],
  ['Settings', 'edit'],
];

export default function TournamentWorkspaceTabs({ tournamentId, active }: { tournamentId: string; active: string }) {
  const router = useRouter();
  const path = (value: string) => value.startsWith('/') ? value : `/admin/tournaments/${tournamentId}${value ? `/${value}` : ''}`;
  return <div className="mb-6 flex gap-2 overflow-x-auto border-b border-gray-700 pb-3">{tabs.map(([label, value]) => <button key={label} onClick={() => router.push(path(value))} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${active === label ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>{label}</button>)}</div>;
}
