import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Search, UserPlus } from 'lucide-react';
import api from '@/lib/api';
import Button from '@/views/user/Desktop/_components/Button';
import Input from '@/views/user/Desktop/_components/Input';

type FollowPlayer = {
  id: string;
  name: string;
  platformHandle?: string;
  avatar?: string;
};

export default function DesktopFollowListScreen({ mode }: { mode: 'followers' | 'following' }) {
  const router = useRouter();
  const [players, setPlayers] = useState<FollowPlayer[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.get(`/users/me/${mode}`).then((response) => {
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setPlayers(data);
    }).catch(() => setPlayers([]));
  }, [mode]);

  const filtered = players.filter((player) =>
    `${player.name} ${player.platformHandle || ''}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#070a12] text-white">
      <main className="mx-auto max-w-6xl px-8 py-8">
        <header className="mb-6 flex items-center justify-between gap-6">
          <h1 className="text-3xl font-black">{mode === 'followers' ? 'Followers' : 'Following'}</h1>
          <div className="relative w-80">
            <Search className="absolute left-3 top-3 h-5 w-5 text-white/35" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search players" className="pl-10" />
          </div>
        </header>

        {filtered.length ? (
          <div className="grid grid-cols-2 gap-4">
            {filtered.map((player) => (
              <button key={player.id} onClick={() => router.push(`/user/players/${player.platformHandle || player.id}`)} className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.035] p-4 text-left">
                <div className="h-16 w-16 overflow-hidden rounded-2xl bg-white/10">
                  {player.avatar && <img src={player.avatar} alt={player.name} className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-lg font-black">{player.name}</div>
                  <div className="truncate text-sm font-semibold text-primary-200">@{player.platformHandle || player.id}</div>
                </div>
                <UserPlus className="h-5 w-5 text-white/45" />
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 px-8 py-14 text-center">
            <p className="text-sm text-white/50">No players found.</p>
            <Button className="mt-4" onClick={() => router.push('/user/tournaments')}>Discover tournaments</Button>
          </div>
        )}
      </main>
    </div>
  );
}
