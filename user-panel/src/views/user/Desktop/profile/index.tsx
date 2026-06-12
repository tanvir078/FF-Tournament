import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Camera, Edit3, Globe2, Lock, LogOut, MessageCircle, Shield, Swords, Users } from 'lucide-react';
import api from '@/lib/api';
import {
  PublicPlayerProfile,
  SocialLink,
  defaultPrivacy,
  fetchOwnProfile,
  saveProfileSettings,
  socialProviders,
} from '@/lib/userSocial';
import { useAuthStore } from '@/store/auth';
import Button from '@/views/user/Desktop/_components/Button';
import Input from '@/views/user/Desktop/_components/Input';

const emptyProfile: PublicPlayerProfile = {
  id: '',
  name: 'Progotix Player',
  privacy: defaultPrivacy,
  stats: { tournamentsJoined: 0, wins: 0, kills: 0, winRate: 0, kdRatio: '0', followers: 0, following: 0 },
  socialLinks: [],
  gameProfiles: [],
  teams: [],
  recentTournaments: [],
  activity: [],
};

const linkValue = (links: SocialLink[], provider: SocialLink['provider']) =>
  links.find((link) => link.provider === provider)?.url || '';

export default function DesktopProfileScreen() {
  const router = useRouter();
  const { user, setAuth, logout } = useAuthStore();
  const [profile, setProfile] = useState<PublicPlayerProfile>(emptyProfile);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    platformHandle: '',
    avatar: '',
    coverImage: '',
    bio: '',
    country: '',
    language: '',
    profileVisibility: defaultPrivacy.profileVisibility,
    messagePrivacy: defaultPrivacy.messagePrivacy,
    showSocialLinks: true,
    showTournamentHistory: true,
    socialLinks: {} as Record<string, string>,
  });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (!user) {
      router.push('/user/login');
      return;
    }
    fetchOwnProfile(user)
      .then((next) => {
        setProfile(next);
        setForm({
          name: next.name || '',
          platformHandle: next.platformHandle || '',
          avatar: next.avatar || '',
          coverImage: next.coverImage || '',
          bio: next.bio || '',
          country: next.country || '',
          language: next.language || '',
          profileVisibility: next.privacy.profileVisibility,
          messagePrivacy: next.privacy.messagePrivacy,
          showSocialLinks: next.privacy.showSocialLinks,
          showTournamentHistory: next.privacy.showTournamentHistory,
          socialLinks: Object.fromEntries(socialProviders.map((provider) => [provider.id, linkValue(next.socialLinks, provider.id)])),
        });
      })
      .catch(() => setError('Profile data could not be loaded.'))
      .finally(() => setLoading(false));
  }, [router, user]);

  const completion = useMemo(() => {
    const checks = [
      Boolean(form.avatar || profile.avatar),
      Boolean(form.coverImage || profile.coverImage),
      Boolean(form.bio),
      profile.gameProfiles.length > 0,
      profile.teams.length > 0,
      Object.values(form.socialLinks).some(Boolean),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form, profile]);

  const submitProfile = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const socialLinks = socialProviders
      .map((provider, order) => ({ provider: provider.id, url: form.socialLinks[provider.id]?.trim(), visible: true, order }))
      .filter((link) => link.url);
    const payload = {
      name: form.name,
      platformHandle: form.platformHandle,
      avatar: form.avatar,
      coverImage: form.coverImage,
      bio: form.bio,
      country: form.country,
      language: form.language,
      privacy: {
        profileVisibility: form.profileVisibility,
        messagePrivacy: form.messagePrivacy,
        showSocialLinks: form.showSocialLinks,
        showTournamentHistory: form.showTournamentHistory,
      },
      socialLinks,
    };
    try {
      const updated = await saveProfileSettings(payload);
      setAuth({ ...(user as any), ...updated, ...payload }, localStorage.getItem('token') || '');
      setProfile((current) => ({ ...current, ...payload, privacy: payload.privacy, socialLinks }));
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Profile update failed. Backend social profile endpoint may not be ready yet.');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (password.newPassword !== password.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    await api.put('/users/change-password', {
      currentPassword: password.currentPassword,
      newPassword: password.newPassword,
    });
    setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleLogout = () => {
    logout();
    router.push('/user/login');
  };

  if (loading) {
    return <div className="min-h-screen bg-[#070a12] p-10 text-white">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-[#070a12] text-white">
      <main className="mx-auto max-w-7xl px-8 py-8">
        {error && <div className="mb-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

        <section className="relative h-[310px] overflow-hidden rounded-[26px] border border-white/10">
          <img src={profile.coverImage || '/images/dashboard-bg.png'} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/45 to-black/10" />
          <div className="absolute inset-0 flex items-end justify-between gap-6 p-8">
            <div className="flex min-w-0 items-end gap-5">
              <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-[28px] border border-white/25 bg-white/10">
                {profile.avatar ? <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" /> : <Camera className="h-10 w-10 text-white/70" />}
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-4xl font-black">{profile.name}</h1>
                <p className="mt-1 text-lg font-bold text-primary-200">@{profile.platformHandle || 'set-handle'}</p>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">{profile.bio || 'No bio added yet.'}</p>
              </div>
            </div>
            <div className="flex shrink-0 gap-3">
              <Button onClick={() => setEditing((value) => !value)}>
                <Edit3 className="mr-2 h-4 w-4" />
                {editing ? 'Close Editor' : 'Edit Profile'}
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-6 gap-3">
          {[
            ['Joined', profile.stats.tournamentsJoined],
            ['Wins', profile.stats.wins],
            ['Kills', profile.stats.kills],
            ['Win Rate', `${profile.stats.winRate}%`],
            ['Followers', profile.stats.followers],
            ['Complete', `${completion}%`],
          ].map(([label, value]) => (
            <button key={label} onClick={() => (label === 'Followers' ? router.push('/user/followers') : undefined)} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-left">
              <div className="text-2xl font-black">{value}</div>
              <div className="mt-1 text-xs font-black uppercase tracking-wide text-white/40">{label}</div>
            </button>
          ))}
        </section>

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)_360px] gap-6">
          <div className="space-y-6">
            {editing && (
              <form onSubmit={submitProfile} className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
                <h2 className="mb-4 text-xl font-black">Profile Editor</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Display name" />
                  <Input value={form.platformHandle} onChange={(e) => setForm({ ...form, platformHandle: e.target.value })} placeholder="Platform handle" />
                  <Input value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} placeholder="Avatar image URL" />
                  <Input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="Cover image URL" />
                  <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Country" />
                  <Input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} placeholder="Language" />
                </div>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Short player bio" className="mt-3 min-h-24 w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm outline-none focus:border-primary-500" />
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <select value={form.profileVisibility} onChange={(e) => setForm({ ...form, profileVisibility: e.target.value as any })} className="h-11 rounded-xl border border-gray-700 bg-gray-800 px-3 text-sm">
                    <option value="PUBLIC">Public profile</option>
                    <option value="FOLLOWERS">Followers only</option>
                    <option value="PRIVATE">Private profile</option>
                  </select>
                  <select value={form.messagePrivacy} onChange={(e) => setForm({ ...form, messagePrivacy: e.target.value as any })} className="h-11 rounded-xl border border-gray-700 bg-gray-800 px-3 text-sm">
                    <option value="EVERYONE">Messages from everyone</option>
                    <option value="FOLLOWERS">Messages from followers</option>
                    <option value="NOBODY">No direct messages</option>
                  </select>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <label className="flex items-center justify-between rounded-2xl bg-black/25 px-4 py-3 text-sm">Show social links <input type="checkbox" checked={form.showSocialLinks} onChange={(e) => setForm({ ...form, showSocialLinks: e.target.checked })} /></label>
                  <label className="flex items-center justify-between rounded-2xl bg-black/25 px-4 py-3 text-sm">Show tournament history <input type="checkbox" checked={form.showTournamentHistory} onChange={(e) => setForm({ ...form, showTournamentHistory: e.target.checked })} /></label>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {socialProviders.map((provider) => (
                    <Input key={provider.id} value={form.socialLinks[provider.id] || ''} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, [provider.id]: e.target.value } })} placeholder={provider.placeholder} />
                  ))}
                </div>
                <Button type="submit" disabled={saving} className="mt-4">{saving ? 'Saving...' : 'Save profile'}</Button>
              </form>
            )}

            <ProfileSection icon={Swords} title="Game Profiles" action={() => router.push('/user/game-profiles')} actionText="Manage">
              {profile.gameProfiles.length ? (
                <div className="grid grid-cols-2 gap-3">
                  {profile.gameProfiles.map((gameProfile) => (
                    <div key={gameProfile.id || gameProfile.ign} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-black">{gameProfile.game?.name || 'Game'}</h3>
                        <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-black text-emerald-200">{gameProfile.verificationStatus || 'PENDING'}</span>
                      </div>
                      <p className="mt-2 text-sm text-white/60">{gameProfile.ign || 'IGN not set'} · {gameProfile.region || 'Global'}</p>
                      <p className="mt-3 text-xs text-white/42">UID {gameProfile.uidVisibility === 'PUBLIC' ? gameProfile.uid || 'not set' : 'hidden on public profile'}</p>
                    </div>
                  ))}
                </div>
              ) : <EmptyLine text="Add game profile to join restricted tournaments." />}
            </ProfileSection>

            <ProfileSection icon={Users} title="Team" action={() => router.push('/user/teams/manage')} actionText="Manage">
              {profile.teams.length ? profile.teams.map((team) => (
                <div key={team.id || team.name} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <h3 className="font-black">{team.name}</h3>
                  <p className="mt-1 text-sm text-white/55">{team.tag ? `${team.tag} · ` : ''}{team.game?.name || 'Tournament team'} · {team.role || 'Member'}</p>
                </div>
              )) : <EmptyLine text="No team linked yet." />}
            </ProfileSection>
          </div>

          <aside className="space-y-6">
            <ProfileSection icon={Globe2} title="Social Links">
              {profile.socialLinks.length ? profile.socialLinks.map((link) => (
                <a key={`${link.provider}-${link.url}`} href={link.url} target="_blank" rel="noreferrer" className="mb-2 block rounded-2xl bg-black/25 px-4 py-3 text-sm font-bold text-white/75">
                  {link.provider}
                </a>
              )) : <EmptyLine text="No social links added." />}
            </ProfileSection>

            <ProfileSection icon={Shield} title="Privacy">
              <Info icon={profile.privacy.profileVisibility === 'PRIVATE' ? Lock : Globe2} label={`Profile: ${profile.privacy.profileVisibility}`} />
              <Info icon={MessageCircle} label={`Messages: ${profile.privacy.messagePrivacy}`} />
              <Info icon={profile.privacy.showSocialLinks ? Globe2 : Lock} label={`Social links: ${profile.privacy.showSocialLinks ? 'visible' : 'hidden'}`} />
            </ProfileSection>

            <ProfileSection icon={Lock} title="Security">
              <form onSubmit={changePassword} className="space-y-3">
                <Input type="password" value={password.currentPassword} onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} placeholder="Current password" />
                <Input type="password" value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} placeholder="New password" />
                <Input type="password" value={password.confirmPassword} onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })} placeholder="Confirm password" />
                <Button type="submit" variant="outline" className="w-full">Update password</Button>
              </form>
            </ProfileSection>
          </aside>
        </div>
      </main>
    </div>
  );
}

function ProfileSection({ icon: Icon, title, action, actionText, children }: { icon: any; title: string; action?: () => void; actionText?: string; children: ReactNode }) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary-300" />
          <h2 className="text-xl font-black">{title}</h2>
        </div>
        {action && <button onClick={action} className="text-sm font-black text-primary-200">{actionText}</button>}
      </div>
      {children}
    </section>
  );
}

function Info({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="mb-2 flex min-w-0 items-center gap-2 rounded-2xl bg-black/20 px-3 py-3">
      <Icon className="h-4 w-4 shrink-0 text-primary-200" />
      <span className="truncate text-sm font-semibold text-white/72">{label}</span>
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm text-white/45">{text}</div>;
}
