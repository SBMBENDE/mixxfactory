/**
 * OAuth2 Configuration for Google and Facebook
 */

export const oauthConfig = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/google/callback`,
    scopes: ['profile', 'email'],
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
  },
  facebook: {
    appId: process.env.FACEBOOK_APP_ID || '',
    appSecret: process.env.FACEBOOK_APP_SECRET || '',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/facebook/callback`,
    scopes: ['public_profile', 'email'],
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
  },
};

/**
 * Validate OAuth configuration
 */
export function validateOAuthConfig(provider: 'google' | 'facebook'): boolean {
  if (provider === 'google') {
    return !!(
      process.env.GOOGLE_CLIENT_ID && 
      process.env.GOOGLE_CLIENT_SECRET
    );
  }
  
  if (provider === 'facebook') {
    return !!(
      process.env.FACEBOOK_APP_ID && 
      process.env.FACEBOOK_APP_SECRET
    );
  }
  
  return false;
}

/**
 * Get OAuth authorization URL
 */
export function getOAuthAuthorizationUrl(
  provider: 'google' | 'facebook',
  state: string
): string {
  const config = oauthConfig[provider];
  
  if (provider === 'google') {
    const googleConfig = config as typeof oauthConfig['google'];
    const params = new URLSearchParams({
      client_id: googleConfig.clientId,
      redirect_uri: googleConfig.redirectUri,
      response_type: 'code',
      scope: googleConfig.scopes.join(' '),
      state,
      access_type: 'offline',
    });
    return `${googleConfig.authUrl}?${params.toString()}`;
  }
  
  if (provider === 'facebook') {
    const params = new URLSearchParams({
      app_id: oauthConfig.facebook.appId,
      redirect_uri: config.redirectUri,
      scope: config.scopes.join(','),
      state,
      response_type: 'code',
    });
    return `${config.authUrl}?${params.toString()}`;
  }
  
  return '';
}
