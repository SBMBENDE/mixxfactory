/**
 * OAuth Token Exchange and User Profile Retrieval
 */

import { oauthConfig } from './oauth';

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token?: string;
}

export interface GoogleUserProfile {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale?: string;
}

export interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface FacebookUserProfile {
  id: string;
  name: string;
  email: string;
  picture?: {
    data: {
      height: number;
      is_silhouette: boolean;
      url: string;
      width: number;
    };
  };
}

/**
 * Exchange authorization code for access token (Google)
 */
export async function exchangeGoogleCode(code: string): Promise<GoogleTokenResponse> {
  const response = await fetch(oauthConfig.google.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: oauthConfig.google.clientId,
      client_secret: oauthConfig.google.clientSecret,
      redirect_uri: oauthConfig.google.redirectUri,
      grant_type: 'authorization_code',
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange Google code: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Exchange authorization code for access token (Facebook)
 */
export async function exchangeFacebookCode(code: string): Promise<FacebookTokenResponse> {
  const response = await fetch(oauthConfig.facebook.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      app_id: oauthConfig.facebook.appId,
      app_secret: oauthConfig.facebook.appSecret,
      redirect_uri: oauthConfig.facebook.redirectUri,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange Facebook code: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch Google user profile
 */
export async function getGoogleUserProfile(
  accessToken: string
): Promise<GoogleUserProfile> {
  const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Google profile: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch Facebook user profile
 */
export async function getFacebookUserProfile(
  accessToken: string
): Promise<FacebookUserProfile> {
  const response = await fetch(
    'https://graph.facebook.com/me?fields=id,name,email,picture.width(200).height(200)',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch Facebook profile: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Parse ID token to extract user info (Google)
 */
export function parseGoogleIdToken(idToken: string): Partial<GoogleUserProfile> {
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid ID token format');
    }

    // Decode payload (second part)
    const payload = parts[1];
    const decoded = JSON.parse(
      Buffer.from(payload, 'base64').toString('utf-8')
    );

    return {
      sub: decoded.sub,
      email: decoded.email,
      email_verified: decoded.email_verified,
      name: decoded.name,
      given_name: decoded.given_name,
      family_name: decoded.family_name,
      picture: decoded.picture,
    };
  } catch (error) {
    console.error('Failed to parse Google ID token:', error);
    return {};
  }
}
