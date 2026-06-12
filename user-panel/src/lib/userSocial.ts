import api from './api';

export type SocialProvider =
  | 'facebook'
  | 'youtube'
  | 'discord'
  | 'twitch'
  | 'tiktok'
  | 'instagram'
  | 'x'
  | 'website';

export type UserPrivacy = {
  profileVisibility: 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';
  messagePrivacy: 'EVERYONE' | 'FOLLOWERS' | 'NOBODY';
  showSocialLinks: boolean;
  showTournamentHistory: boolean;
};

export type SocialLink = {
  id?: string;
  provider: SocialProvider;
  url: string;
  visible?: boolean;
  order?: number;
};

export type PlayerGameProfile = {
  id?: string;
  game?: { id?: string; name?: string; imageUrl?: string };
  ign?: string;
  uid?: string;
  region?: string;
  rank?: string;
  role?: string;
  platform?: string;
  verificationStatus?: string;
  uidVisibility?: 'PUBLIC' | 'PRIVATE';
};

export type PlayerTeam = {
  id?: string;
  name?: string;
  tag?: string;
  logo?: string;
  game?: { name?: string };
  role?: string;
  wins?: number;
  totalPoints?: number;
  members?: unknown[];
};

export type PlayerStats = {
  tournamentsJoined: number;
  wins: number;
  kills: number;
  winRate: number;
  kdRatio: string;
  followers: number;
  following: number;
};

export type PublicPlayerProfile = {
  id: string;
  name: string;
  email?: string;
  platformHandle?: string;
  ign?: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  country?: string;
  language?: string;
  joinedAt?: string;
  isSelf?: boolean;
  isFollowing?: boolean;
  isBlocked?: boolean;
  isMutual?: boolean;
  privacy: UserPrivacy;
  stats: PlayerStats;
  socialLinks: SocialLink[];
  gameProfiles: PlayerGameProfile[];
  teams: PlayerTeam[];
  recentTournaments: any[];
  activity: Array<{ id: string; title: string; meta?: string; type?: string }>;
};

export type Conversation = {
  id: string;
  user?: Pick<PublicPlayerProfile, 'id' | 'name' | 'platformHandle' | 'avatar'>;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
};

export type DirectMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  status?: 'sending' | 'sent' | 'failed' | 'read';
  createdAt?: string;
};

export const socialProviders: Array<{ id: SocialProvider; label: string; placeholder: string }> = [
  { id: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/username' },
  { id: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@channel' },
  { id: 'discord', label: 'Discord', placeholder: 'https://discord.gg/server or username' },
  { id: 'twitch', label: 'Twitch', placeholder: 'https://twitch.tv/channel' },
  { id: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@username' },
  { id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
  { id: 'x', label: 'X', placeholder: 'https://x.com/username' },
  { id: 'website', label: 'Website', placeholder: 'https://example.com' },
];

export const defaultPrivacy: UserPrivacy = {
  profileVisibility: 'PUBLIC',
  messagePrivacy: 'EVERYONE',
  showSocialLinks: true,
  showTournamentHistory: true,
};

const fallbackCover = '/images/dashboard-bg.png';

const arrayFrom = (value: any) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  return [];
};

const numberFrom = (value: any, fallback = 0) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
};

export function buildProfileFromSources(params: {
  user: any;
  wallet?: any;
  registrations?: any[];
  matches?: any[];
  gameProfiles?: any[];
  teams?: any[];
  publicData?: any;
}): PublicPlayerProfile {
  const user = params.publicData?.user || params.publicData || params.user || {};
  const matches = arrayFrom(params.publicData?.matches || params.matches);
  const registrations = arrayFrom(params.publicData?.registrations || params.publicData?.recentTournaments || params.registrations);
  const completedMatches = matches.filter((match: any) => match.status === 'COMPLETED');
  const wins = completedMatches.filter((match: any) => match.position === 1 || match.result === 'WIN').length;
  const kills = completedMatches.reduce((sum: number, match: any) => sum + numberFrom(match.kills), 0);
  const deaths = Math.max(completedMatches.length - wins, 0);
  const winRate = completedMatches.length ? Math.round((wins / completedMatches.length) * 100) : 0;
  const kdRatio = deaths > 0 ? (kills / deaths).toFixed(2) : kills.toString();
  const followerCount = numberFrom(params.publicData?.stats?.followers ?? params.publicData?.followerCount);
  const followingCount = numberFrom(params.publicData?.stats?.following ?? params.publicData?.followingCount);

  return {
    id: String(user.id || 'me'),
    name: user.name || user.ign || 'Progotix Player',
    email: user.email,
    platformHandle: user.platformHandle || user.handle || user.username || user.ign,
    ign: user.ign,
    avatar: user.avatar || user.profileImage,
    coverImage: user.coverImage || user.cover || fallbackCover,
    bio: user.bio || 'Competitive player on Progotix Tournaments.',
    country: user.country || 'Bangladesh',
    language: user.language || 'Bangla',
    joinedAt: user.createdAt || user.created_at,
    isSelf: Boolean(params.publicData?.isSelf),
    isFollowing: Boolean(params.publicData?.isFollowing),
    isBlocked: Boolean(params.publicData?.isBlocked),
    isMutual: Boolean(params.publicData?.isMutual),
    privacy: { ...defaultPrivacy, ...(user.privacy || params.publicData?.privacy || {}) },
    stats: {
      tournamentsJoined: numberFrom(params.publicData?.stats?.tournamentsJoined, registrations.length),
      wins: numberFrom(params.publicData?.stats?.wins, wins),
      kills: numberFrom(params.publicData?.stats?.kills, kills),
      winRate: numberFrom(params.publicData?.stats?.winRate, winRate),
      kdRatio: params.publicData?.stats?.kdRatio || kdRatio,
      followers: followerCount,
      following: followingCount,
    },
    socialLinks: arrayFrom(user.socialLinks || params.publicData?.socialLinks),
    gameProfiles: arrayFrom(params.publicData?.gameProfiles || params.gameProfiles),
    teams: arrayFrom(params.publicData?.teams || params.teams),
    recentTournaments: registrations.slice(0, 6),
    activity: arrayFrom(params.publicData?.activity).slice(0, 8),
  };
}

export async function fetchOwnProfile(user: any): Promise<PublicPlayerProfile> {
  const [profile, wallet, registrations, matches, gameProfiles, myTeam] = await Promise.allSettled([
    api.get('/users/profile'),
    api.get('/wallet/user'),
    api.get('/tournaments/my-registrations'),
    api.get('/matches/my-matches'),
    api.get('/game-profiles/mine'),
    api.get('/teams/my-team'),
  ]);

  return buildProfileFromSources({
    user: profile.status === 'fulfilled' ? profile.value.data : user,
    wallet: wallet.status === 'fulfilled' ? wallet.value.data : null,
    registrations: registrations.status === 'fulfilled' ? arrayFrom(registrations.value.data) : [],
    matches: matches.status === 'fulfilled' ? arrayFrom(matches.value.data) : [],
    gameProfiles: gameProfiles.status === 'fulfilled' ? arrayFrom(gameProfiles.value.data) : [],
    teams: myTeam.status === 'fulfilled' && myTeam.value.data ? [myTeam.value.data] : [],
  });
}

export async function fetchPublicPlayer(identifier: string, currentUser: any): Promise<PublicPlayerProfile> {
  const candidates = [
    `/players/${identifier}`,
    `/users/${identifier}/public-profile`,
    `/users/public/${identifier}`,
  ];

  for (const endpoint of candidates) {
    try {
      const response = await api.get(endpoint);
      return buildProfileFromSources({ user: currentUser, publicData: response.data });
    } catch {
      // Try the next compatible backend shape.
    }
  }

  const ownHandle = currentUser?.platformHandle || currentUser?.id;
  const isSelf = identifier === currentUser?.id || identifier === ownHandle;
  return buildProfileFromSources({
    user: isSelf ? currentUser : {
      id: identifier,
      name: 'Progotix Player',
      platformHandle: identifier,
      bio: 'Public profile is ready. Backend profile endpoint will fill this with live player data.',
    },
    publicData: { isSelf },
  });
}

export async function saveProfileSettings(payload: Record<string, any>) {
  try {
    const response = await api.put('/users/profile', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function followPlayer(playerId: string) {
  return api.post(`/users/${playerId}/follow`);
}

export async function unfollowPlayer(playerId: string) {
  return api.delete(`/users/${playerId}/follow`);
}

export async function openDirectConversation(playerId: string) {
  const response = await api.post('/conversations/direct', { userId: playerId });
  return response.data;
}

export async function fetchConversations(): Promise<Conversation[]> {
  try {
    const response = await api.get('/conversations');
    return arrayFrom(response.data);
  } catch {
    return [];
  }
}

export async function fetchMessages(conversationId: string): Promise<DirectMessage[]> {
  try {
    const response = await api.get(`/conversations/${conversationId}/messages`);
    return arrayFrom(response.data);
  } catch {
    return [];
  }
}

export async function sendDirectMessage(conversationId: string, body: string) {
  const response = await api.post(`/conversations/${conversationId}/messages`, { body });
  return response.data;
}
