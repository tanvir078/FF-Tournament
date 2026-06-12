import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function GameProfilesPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const load = () => api.get('/admin/game-profiles').then(({ data }) => setProfiles(data || []));
  useEffect(() => { void load(); }, []);
  const review = async (id: string, verificationStatus: 'VERIFIED' | 'REJECTED') => {
    await api.patch(`/admin/game-profiles/${id}`, { verificationStatus });
    await load();
  };
  return <div className="min-h-screen bg-gray-900 text-white py-8"><div className="max-w-5xl mx-auto px-4"><h1 className="text-3xl font-bold mb-2">Game Profile Verification</h1><p className="text-gray-400 mb-6">Review player identities used for restricted tournaments.</p><div className="space-y-3">{profiles.map((profile) => <Card className="p-4" key={profile.id}><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><b>{profile.user?.platformHandle || profile.user?.name}</b><p className="text-sm text-gray-400">{profile.game?.name} · {profile.ign} · UID {profile.uid} · {profile.verificationStatus}</p></div><div className="flex gap-2"><Button size="sm" onClick={() => review(profile.id, 'VERIFIED')}>Verify</Button><Button size="sm" variant="outline" onClick={() => review(profile.id, 'REJECTED')}>Reject</Button></div></div></Card>)}</div></div></div>;
}
