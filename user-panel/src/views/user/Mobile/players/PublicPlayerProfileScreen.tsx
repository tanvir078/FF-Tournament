import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Ban, Camera, Flag, MessageCircle, Shield, Swords, UserMinus, UserPlus, Users } from 'lucide-react';
import { fetchPublicPlayer, followPlayer, openDirectConversation, PublicPlayerProfile, unfollowPlayer } from '@/lib/userSocial';
import { useAuthStore } from '@/store/auth';
import Button from '@/views/user/Mobile/_components/Button';

const emptyStats = { tournamentsJoined: 0, wins: 0, kills: 0, winRate: 0, kdRatio: '0', followers: 0, following: 0 };

export default function MobilePublicPlayerProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const identifier = String(router.query.identifier || '');
  const [profile, setProfile] = useState<PublicPlayerProfile | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!identifier || !user) return;
    fetchPublicPlayer(identifier, user).then(setProfile);
  }, [identifier, user]);

  const toggleFollow = async () => {
    if (!profile || profile.isSelf) return;
    setBusy(true);
    const nextFollowing = !profile.isFollowing;
    setProfile({
      ...profile,
      isFollowing: nextFollowing,
      stats: { ...profile.stats, followers: Math.max(0, profile.stats.followers + (nextFollowing ? 1 : -1)) },
    });
    try {
      if (nextFollowing) await followPlayer(profile.id);
      else await unfollowPlayer(profile.id);
    } catch {
      // Keep optimistic UI available while backend social endpoints are being wired.
    } finally {
      setBusy(false);
    }
  };

  const openChat = async () => {
    if (!profile || profile.isSelf || profile.privacy.messagePrivacy === 'NOBODY') return;
    try {
      const conversation = await openDirectConversation(profile.id);
      router.push(`/user/chat/${conversation.id || profile.id}`);
    } catch {
      router.push(`/user/chat/${profile.id}?player=${profile.id}`);
    }
  };

  if (!profile) {
    return <div className="min-h-screen bg-[#070a12] px-4 py-10 text-white">Loading player...</div>;
  }

  const stats = profile.stats || emptyStats;

  return (
    <div className="min-h-screen bg-[#070a12] pb-24 text-white">
      <section className="relative h-[270px] overflow-hidden rounded-b-[30px]">
        <img src={profile.coverImage || '/images/dashboard-bg.png'} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070a12] via-black/35 to-black/20" />
        <div className="absolute inset-x-0 bottom-0 px-4 pb-5">
          <div className="flex items-end gap-3">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/25 bg-white/10">
              {profile.avatar ? <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" /> : <Camera className="h-8 w-8 text-white/70" />}
            </div>
            <div className="min-w-0 pb-1">
              <h1 className="truncate text-2xl font-black">{profile.name}</h1>
              <p className="truncate text-sm font-semibold text-primary-200">@{profile.platformHandle || profile.id}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-black">
                <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-emerald-200">Player</span>
                {profile.isMutual && <span className="rounded-full bg-sky-400/15 px-2.5 py-1 text-sky-200">Mutual</span>}
              </div>
            </div>
          </div>
          {!profile.isSelf && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button disabled={busy} onClick={toggleFollow}>
                {profile.isFollowing ? <UserMinus className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                {profile.isFollowing ? 'Following' : 'Follow'}
              </Button>
              <Button variant="outline" onClick={openChat} disabled={profile.privacy.messagePrivacy === 'NOBODY'}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Message
              </Button>
            </div>
          )}
        </div>
      </section>

      <main className="space-y-6 px-4 pt-5">
        <p className="text-sm leading-6 text-white/70">{profile.bio || 'No public bio added.'}</p>

        <section className="grid grid-cols-4 gap-2 rounded-3xl border border-white/10 bg-white/[0.04] p-3">
          {[
            ['Joined', stats.tournamentsJoined],
            ['Wins', stats.wins],
            ['Kills', stats.kills],
            ['Followers', stats.followers],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-black/20 px-2 py-3 text-center">
              <div className="truncate text-lg font-black">{value}</div>
              <div className="truncate text-[10px] font-bold uppercase text-white/45">{label}</div>
            </div>
          ))}
        </section>

        <Section icon={Swords} title="Game Profiles">
          {profile.gameProfiles.length ? profile.gameProfiles.map((gameProfile) => (
            <div key={gameProfile.id || gameProfile.ign} className="rounded-3xl border border-white/10 bg-white/[0.035] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-black">{gameProfile.game?.name || 'Game'}</h3>
                  <p className="text-sm text-white/60">{gameProfile.ign || 'IGN hidden'} · {gameProfile.region || 'Global'}</p>
                </div>
                <Shield className="h-5 w-5 text-emerald-300" />
              </div>
              <p className="mt-3 text-xs text-white/42">UID {gameProfile.uidVisibility === 'PUBLIC' ? gameProfile.uid || 'not set' : 'hidden'}</p>
            </div>
          )) : <Empty text="No public game profile." />}
        </Section>

        <Section icon={Users} title="Team">
          {profile.teams.length ? profile.teams.map((team) => (
            <div key={team.id || team.name} className="rounded-3xl border border-white/10 bg-white/[0.035] p-4">
              <h3 className="font-black">{team.name}</h3>
              <p className="text-sm text-white/55">{team.tag ? `${team.tag} · ` : ''}{team.game?.name || 'Tournament team'} · {team.role || 'Member'}</p>
            </div>
          )) : <Empty text="No public team info." />}
        </Section>

        {profile.privacy.showSocialLinks && (
          <Section icon={MessageCircle} title="Social">
            {profile.socialLinks.length ? (
              <div className="flex flex-wrap gap-2">
                {profile.socialLinks.map((link) => <a key={`${link.provider}-${link.url}`} href={link.url} target="_blank" rel="noreferrer" className="rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white/80">{link.provider}</a>)}
              </div>
            ) : <Empty text="No social links." />}
          </Section>
        )}

        {!profile.isSelf && (
          <div className="grid grid-cols-2 gap-3">
            <Button variant="ghost" className="text-red-300">
              <Ban className="mr-2 h-4 w-4" />
              Block
            </Button>
            <Button variant="ghost" className="text-amber-200">
              <Flag className="mr-2 h-4 w-4" />
              Report
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary-300" />
        <h2 className="text-lg font-black">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-3xl border border-dashed border-white/10 px-4 py-5 text-sm text-white/45">{text}</div>;
}
