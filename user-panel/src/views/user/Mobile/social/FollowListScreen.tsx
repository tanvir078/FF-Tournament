import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Search, UserPlus } from 'lucide-react';
import api from '@/lib/api';
import Button from '@/views/user/Mobile/_components/Button';
import Input from '@/views/user/Mobile/_components/Input';

type FollowPlayer = {
  id: string;
  name: string;
  platformHandle?: string;
  avatar?: string;
  isFollowing?: boolean;
};

export default function MobileFollowListScreen({ mode }: { mode: 'followers' | 'following' }) {
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
    <div className="min-h-screen bg-[#070a12] px-4 py-6 pb-24 text-white">
      <header className="mb-5">
        <h1 className="text-2xl font-black">{mode === 'followers' ? 'Followers' : 'Following'}</h1>
      </header>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-3 h-5 w-5 text-white/35" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search players" className="pl-10" />
      </div>

      <div className="space-y-3">
        {filtered.map((player) => (
          <button key={player.id} onClick={() => router.push(`/user/players/${player.platformHandle || player.id}`)} className="flex w-full items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.035] p-3 text-left">
            <div className="h-14 w-14 overflow-hidden rounded-2xl bg-white/10">
              {player.avatar && <img src={player.avatar} alt={player.name} className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-black">{player.name}</div>
              <div className="truncate text-xs font-semibold text-primary-200">@{player.platformHandle || player.id}</div>
            </div>
            <UserPlus className="h-5 w-5 text-white/45" />
          </button>
        ))}
      </div>

      {!filtered.length && (
        <div className="mt-10 rounded-3xl border border-dashed border-white/10 px-5 py-8 text-center">
          <p className="text-sm text-white/50">No players found.</p>
          <Button className="mt-4" onClick={() => router.push('/user/tournaments')}>Discover tournaments</Button>
        </div>
      )}
    </div>
  );
}
