import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Camera,
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  Globe2,
  Lock,
  LogOut,
  MessageCircle,
  Shield,
  Swords,
  Users,
} from 'lucide-react';
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
import Button from '@/views/user/Mobile/_components/Button';
import Input from '@/views/user/Mobile/_components/Input';

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

export default function MobileProfileScreen() {
  const router = useRouter();
  const { user, setAuth, logout } = useAuthStore();
  const [profile, setProfile] = useState<PublicPlayerProfile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
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

    try {
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
    return <div className="min-h-screen bg-[#070a12] px-4 py-10 text-white">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-[#070a12] pb-24 text-white">
      <section className="relative h-[245px] overflow-hidden rounded-b-[28px]">
        <img src={profile.coverImage || '/images/dashboard-bg.png'} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070a12] via-[#070a12]/30 to-black/30" />
        <button
          onClick={() => setEditing(true)}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur"
          aria-label="Edit profile"
        >
          <Edit3 className="h-4 w-4" />
        </button>
        <div className="absolute inset-x-0 bottom-0 px-4 pb-5">
          <div className="flex items-end gap-3">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/25 bg-white/10">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
              ) : (
                <Camera className="h-8 w-8 text-white/70" />
              )}
            </div>
            <div className="min-w-0 pb-1">
              <h1 className="truncate text-2xl font-black">{profile.name}</h1>
              <p className="truncate text-sm font-semibold text-primary-200">@{profile.platformHandle || 'set-handle'}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold">
                <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-emerald-200">Progotix Player</span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-white/80">{completion}% complete</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="space-y-6 px-4 pt-5">
        {error && <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

        <section className="grid grid-cols-4 gap-2 rounded-3xl border border-white/10 bg-white/[0.04] p-3">
          {[
            ['Joined', profile.stats.tournamentsJoined],
            ['Wins', profile.stats.wins],
            ['Kills', profile.stats.kills],
            ['Followers', profile.stats.followers],
          ].map(([label, value]) => (
            <button
              key={label}
              onClick={() => (label === 'Followers' ? router.push('/user/followers') : undefined)}
              className="min-w-0 rounded-2xl bg-black/20 px-2 py-3 text-center"
            >
              <div className="truncate text-lg font-black">{value}</div>
              <div className="truncate text-[10px] font-bold uppercase text-white/45">{label}</div>
            </button>
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-black">Player Info</h2>
            <Button size="sm" onClick={() => setEditing((value) => !value)}>{editing ? 'Close' : 'Edit'}</Button>
          </div>

          {!editing ? (
            <div className="space-y-4">
              <p className="text-sm leading-6 text-white/72">{profile.bio || 'No bio added yet.'}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info icon={Globe2} label={profile.country || 'Country not set'} />
                <Info icon={MessageCircle} label={profile.language || 'Language not set'} />
                <Info icon={profile.privacy.profileVisibility === 'PUBLIC' ? Eye : Lock} label={profile.privacy.profileVisibility} />
                <Info icon={profile.privacy.messagePrivacy === 'NOBODY' ? EyeOff : MessageCircle} label={`${profile.privacy.messagePrivacy} messages`} />
              </div>
            </div>
          ) : (
            <form onSubmit={submitProfile} className="space-y-3">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Display name" />
              <Input value={form.platformHandle} onChange={(e) => setForm({ ...form, platformHandle: e.target.value })} placeholder="Platform handle" />
              <Input value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} placeholder="Avatar image URL" />
              <Input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="Cover image URL" />
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Short player bio"
                className="min-h-24 w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm outline-none focus:border-primary-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Country" />
                <Input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} placeholder="Language" />
              </div>
              <select value={form.profileVisibility} onChange={(e) => setForm({ ...form, profileVisibility: e.target.value as any })} className="h-11 w-full rounded-xl border border-gray-700 bg-gray-800 px-3 text-sm">
                <option value="PUBLIC">Public profile</option>
                <option value="FOLLOWERS">Followers only</option>
                <option value="PRIVATE">Private profile</option>
              </select>
              <select value={form.messagePrivacy} onChange={(e) => setForm({ ...form, messagePrivacy: e.target.value as any })} className="h-11 w-full rounded-xl border border-gray-700 bg-gray-800 px-3 text-sm">
                <option value="EVERYONE">Messages from everyone</option>
                <option value="FOLLOWERS">Messages from followers</option>
                <option value="NOBODY">No direct messages</option>
              </select>
              <label className="flex items-center justify-between rounded-2xl bg-black/25 px-4 py-3 text-sm">
                Show social links
                <input type="checkbox" checked={form.showSocialLinks} onChange={(e) => setForm({ ...form, showSocialLinks: e.target.checked })} />
              </label>
              <label className="flex items-center justify-between rounded-2xl bg-black/25 px-4 py-3 text-sm">
                Show tournament history
                <input type="checkbox" checked={form.showTournamentHistory} onChange={(e) => setForm({ ...form, showTournamentHistory: e.target.checked })} />
              </label>
              <Button type="submit" disabled={saving} className="w-full">{saving ? 'Saving...' : 'Save profile'}</Button>
            </form>
          )}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-4">
          <h2 className="mb-3 text-lg font-black">Social Links</h2>
          {editing ? (
            <div className="space-y-3">
              {socialProviders.map((provider) => (
                <Input
                  key={provider.id}
                  value={form.socialLinks[provider.id] || ''}
                  onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, [provider.id]: e.target.value } })}
                  placeholder={provider.placeholder}
                />
              ))}
            </div>
          ) : profile.socialLinks.length ? (
            <div className="flex flex-wrap gap-2">
              {profile.socialLinks.map((link) => (
                <a key={`${link.provider}-${link.url}`} href={link.url} target="_blank" rel="noreferrer" className="rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white/80">
                  {link.provider}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/45">No social links added.</p>
          )}
        </section>

        <section className="space-y-3">
          <SectionTitle icon={Swords} title="Game Profiles" action={() => router.push('/user/game-profiles')} />
          {profile.gameProfiles.length ? profile.gameProfiles.map((gameProfile) => (
            <div key={gameProfile.id || gameProfile.ign} className="rounded-3xl border border-white/10 bg-white/[0.035] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-black">{gameProfile.game?.name || 'Game'}</h3>
                  <p className="text-sm text-white/60">{gameProfile.ign || 'IGN not set'} · {gameProfile.region || 'Global'}</p>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-black text-emerald-200">{gameProfile.verificationStatus || 'PENDING'}</span>
              </div>
              <p className="mt-3 text-xs text-white/45">UID {gameProfile.uidVisibility === 'PUBLIC' ? gameProfile.uid || 'not set' : 'hidden on public profile'}</p>
            </div>
          )) : <EmptyLine text="Add game profile to join restricted tournaments." />}
        </section>

        <section className="space-y-3">
          <SectionTitle icon={Users} title="Team" action={() => router.push('/user/teams/manage')} />
          {profile.teams.length ? profile.teams.map((team) => (
            <div key={team.id || team.name} className="rounded-3xl border border-white/10 bg-white/[0.035] p-4">
              <h3 className="font-black">{team.name}</h3>
              <p className="text-sm text-white/55">{team.tag ? `${team.tag} · ` : ''}{team.game?.name || 'Tournament team'} · {team.role || 'Member'}</p>
            </div>
          )) : <EmptyLine text="No team linked yet." />}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-4">
          <h2 className="mb-3 text-lg font-black">Security</h2>
          <form onSubmit={changePassword} className="space-y-3">
            <Input type="password" value={password.currentPassword} onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} placeholder="Current password" />
            <Input type="password" value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} placeholder="New password" />
            <Input type="password" value={password.confirmPassword} onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })} placeholder="Confirm password" />
            <Button type="submit" variant="outline" className="w-full">Update password</Button>
          </form>
        </section>

        <Button variant="ghost" onClick={handleLogout} className="w-full text-red-300">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </main>
    </div>
  );
}

function Info({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-black/20 px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-primary-200" />
      <span className="truncate text-xs font-semibold text-white/72">{label}</span>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, action }: { icon: any; title: string; action: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary-300" />
        <h2 className="text-lg font-black">{title}</h2>
      </div>
      <button onClick={action} className="text-xs font-black text-primary-200">Manage</button>
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 px-4 py-5 text-sm text-white/45">
      {text}
    </div>
  );
}
