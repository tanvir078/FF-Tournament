import api from './api';

export type SocialProvider = 'google' | 'facebook' | 'linkedin';

export function getSocialCallbackUrl() {
  if (typeof window === 'undefined') return '/auth/social/callback';
  return `${window.location.origin}/auth/social/callback`;
}

export async function startSocialAuth(provider: SocialProvider) {
  const response = await api.get(`/auth/social/${provider}/redirect`, {
    params: { redirectUri: getSocialCallbackUrl() },
  });

  if (!response.data?.url) {
    throw new Error('Social login URL was not returned.');
  }

  window.location.href = response.data.url;
}

export async function completeSocialAuth(provider: SocialProvider, code: string, state: string) {
  const response = await api.post(`/auth/social/${provider}/callback`, {
    code,
    state,
    redirectUri: getSocialCallbackUrl(),
  });

  return response.data;
}
