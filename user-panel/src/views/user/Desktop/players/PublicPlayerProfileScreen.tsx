import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Ban, Camera, Flag, MessageCircle, Shield, Swords, UserMinus, UserPlus, Users } from 'lucide-react';
import { fetchPublicPlayer, followPlayer, openDirectConversation, PublicPlayerProfile, unfollowPlayer } from '@/lib/userSocial';
import { useAuthStore } from '@/store/auth';
import Button from '@/views/user/Desktop/_components/Button';

export default function DesktopPublicPlayerProfileScreen() {
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
      // Backend social endpoint fallback.
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
    return <div className="min-h-screen bg-[#070a12] p-10 text-white">Loading player...</div>;
  }

  return (
    <div className="min-h-screen bg-[#070a12] text-white">
      <main className="mx-auto max-w-7xl px-8 py-8">
        <section className="relative h-[330px] overflow-hidden rounded-[28px] border border-white/10">
          <img src={profile.coverImage || '/images/dashboard-bg.png'} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/10" />
          <div className="absolute inset-0 flex items-end justify-between gap-6 p-8">
            <div className="flex min-w-0 items-end gap-5">
              <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-[28px] border border-white/25 bg-white/10">
                {profile.avatar ? <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" /> : <Camera className="h-10 w-10 text-white/70" />}
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-4xl font-black">{profile.name}</h1>
                <p className="mt-1 text-lg font-bold text-primary-200">@{profile.platformHandle || profile.id}</p>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">{profile.bio || 'No public bio added.'}</p>
                <div className="mt-3 flex gap-2 text-xs font-black">
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1.5 text-emerald-200">Progotix Player</span>
                  {profile.isMutual && <span className="rounded-full bg-sky-400/15 px-3 py-1.5 text-sky-200">Mutual</span>}
                </div>
              </div>
            </div>
            {!profile.isSelf && (
              <div className="flex shrink-0 gap-3">
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

        <section className="mt-6 grid grid-cols-6 gap-3">
          {[
            ['Joined', profile.stats.tournamentsJoined],
            ['Wins', profile.stats.wins],
            ['Kills', profile.stats.kills],
            ['Win Rate', `${profile.stats.winRate}%`],
            ['Followers', profile.stats.followers],
            ['Following', profile.stats.following],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
              <div className="text-2xl font-black">{value}</div>
              <div className="mt-1 text-xs font-black uppercase tracking-wide text-white/40">{label}</div>
            </div>
          ))}
        </section>

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)_360px] gap-6">
          <div className="space-y-6">
            <ProfileSection icon={Swords} title="Game Profiles">
              {profile.gameProfiles.length ? (
                <div className="grid grid-cols-2 gap-3">
                  {profile.gameProfiles.map((gameProfile) => (
                    <div key={gameProfile.id || gameProfile.ign} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-black">{gameProfile.game?.name || 'Game'}</h3>
                        <Shield className="h-5 w-5 text-emerald-300" />
                      </div>
                      <p className="mt-2 text-sm text-white/60">{gameProfile.ign || 'IGN hidden'} · {gameProfile.region || 'Global'}</p>
                      <p className="mt-3 text-xs text-white/42">UID {gameProfile.uidVisibility === 'PUBLIC' ? gameProfile.uid || 'not set' : 'hidden'}</p>
                    </div>
                  ))}
                </div>
              ) : <Empty text="No public game profile." />}
            </ProfileSection>

            <ProfileSection icon={Users} title="Team">
              {profile.teams.length ? profile.teams.map((team) => (
                <div key={team.id || team.name} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <h3 className="font-black">{team.name}</h3>
                  <p className="mt-1 text-sm text-white/55">{team.tag ? `${team.tag} · ` : ''}{team.game?.name || 'Tournament team'} · {team.role || 'Member'}</p>
                </div>
              )) : <Empty text="No public team info." />}
            </ProfileSection>
          </div>

          <aside className="space-y-6">
            {profile.privacy.showSocialLinks && (
              <ProfileSection icon={MessageCircle} title="Social">
                {profile.socialLinks.length ? profile.socialLinks.map((link) => (
                  <a key={`${link.provider}-${link.url}`} href={link.url} target="_blank" rel="noreferrer" className="mb-2 block rounded-2xl bg-black/25 px-4 py-3 text-sm font-bold text-white/75">
                    {link.provider}
                  </a>
                )) : <Empty text="No social links." />}
              </ProfileSection>
            )}

            {!profile.isSelf && (
              <ProfileSection icon={Flag} title="Safety">
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="ghost" className="text-red-300"><Ban className="mr-2 h-4 w-4" />Block</Button>
                  <Button variant="ghost" className="text-amber-200"><Flag className="mr-2 h-4 w-4" />Report</Button>
                </div>
              </ProfileSection>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

function ProfileSection({ icon: Icon, title, children }: { icon: any; title: string; children: ReactNode }) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary-300" />
        <h2 className="text-xl font-black">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm text-white/45">{text}</div>;
}
