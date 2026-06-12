import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Bell, CheckCircle2, Clock3, LockKeyhole, Mail, ShieldAlert, WalletCards } from 'lucide-react';
import api from '@/lib/api';
import Card from '@/views/user/Desktop/_components/Card';

type Activity = { id: string; title: string; detail: string; path: string; icon: typeof Bell; tone: string };

export default function ActivityRail({ className = '' }: { className?: string }) {
  const router = useRouter();
  const [data, setData] = useState({ profiles: [] as any[], invites: [] as any[], registrations: [] as any[], claims: [] as any[], notifications: [] as any[] });
  useEffect(() => {
    Promise.allSettled([api.get('/game-profiles/mine'), api.get('/teams/invitations/mine'), api.get('/tournaments/my-registrations'), api.get('/result-claims/mine'), api.get('/notifications')]).then(([profiles, invites, registrations, claims, notifications]) => setData({
      profiles: profiles.status === 'fulfilled' ? profiles.value.data : [],
      invites: invites.status === 'fulfilled' ? invites.value.data : [],
      registrations: registrations.status === 'fulfilled' ? registrations.value.data : [],
      claims: claims.status === 'fulfilled' ? claims.value.data : [],
      notifications: notifications.status === 'fulfilled' ? notifications.value.data : [],
    }));
  }, []);
  const activities = useMemo(() => {
    const items: Activity[] = [];
    data.profiles.filter((profile) => profile.verificationStatus !== 'VERIFIED').forEach((profile) => items.push({ id: `profile-${profile.id}`, title: 'Profile verification', detail: `${profile.game?.name || 'Game'} profile is ${profile.verificationStatus.toLowerCase()}.`, path: '/user/game-profiles', icon: ShieldAlert, tone: 'text-yellow-400' }));
    data.invites.forEach((invite) => items.push({ id: `invite-${invite.id}`, title: 'Team invitation', detail: `${invite.team?.name || 'A team'} invited you to join.`, path: '/user/teams', icon: Mail, tone: 'text-blue-400' }));
    data.registrations.filter((registration) => registration.checkInStatus === 'PENDING').forEach((registration) => items.push({ id: `checkin-${registration.id}`, title: 'Check-in required', detail: `${registration.title || registration.name} is waiting for captain check-in.`, path: `/user/tournaments/${registration.id}`, icon: Clock3, tone: 'text-orange-400' }));
    data.registrations.filter((registration) => registration.roomDetails).forEach((registration) => items.push({ id: `room-${registration.id}`, title: 'Lobby available', detail: `${registration.title || registration.name} lobby credentials are ready.`, path: `/user/tournaments/${registration.id}`, icon: LockKeyhole, tone: 'text-green-400' }));
    data.claims.filter((claim) => claim.status === 'PENDING').forEach((claim) => items.push({ id: `claim-${claim.id}`, title: 'Result under review', detail: `${claim.tournament?.title || 'Tournament'} reward review is pending.`, path: '/user/matches', icon: WalletCards, tone: 'text-purple-400' }));
    data.notifications.filter((notification) => !notification.isRead).slice(0, 3).forEach((notification) => items.push({ id: `notification-${notification.id}`, title: notification.title, detail: notification.message, path: '/user/notifications', icon: Bell, tone: 'text-primary-400' }));
    return items.slice(0, 7);
  }, [data]);
  return <Card className={`p-5 ${className}`}><div className="mb-4 flex items-center justify-between"><h3 className="flex items-center gap-2 font-bold"><Bell className="h-4 w-4 text-primary-400" />Activity</h3><button onClick={() => router.push('/user/notifications')} className="text-xs text-primary-400">View all</button></div><div className="space-y-2">{activities.length ? activities.map((activity) => <button key={activity.id} onClick={() => router.push(activity.path)} className="flex w-full gap-3 rounded-xl bg-gray-800/40 p-3 text-left transition hover:bg-gray-800"><activity.icon className={`mt-0.5 h-4 w-4 shrink-0 ${activity.tone}`} /><span><span className="block text-sm font-semibold">{activity.title}</span><span className="mt-1 block text-xs text-gray-400">{activity.detail}</span></span></button>) : <div className="py-5 text-center text-sm text-gray-500"><CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-green-400" />You are all caught up.</div>}</div></Card>;
}
