// Apple Sign-In (Sign in with Apple JS) OAuth 2.0 Integration
// Configured via VITE_APPLE_CLIENT_ID (Apple Services ID from developer.apple.com)

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: {
          clientId: string;
          scope: string;
          redirectURI: string;
          state?: string;
          nonce?: string;
          usePopup?: boolean;
        }) => void;
        signIn: () => Promise<AppleAuthSignInResponse>;
      };
    };
  }
}

export interface AppleUserProfile {
  sub: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
}

export interface AppleAuthSignInResponse {
  authorization: {
    code: string;
    id_token: string;
    state?: string;
  };
  user?: {
    name?: {
      firstName?: string;
      lastName?: string;
    };
    email?: string;
  };
}

export interface AppleAuthResult {
  status: 'success' | 'pending_configuration' | 'error';
  message?: string;
  profile?: AppleUserProfile;
}

/**
 * Decodes payload from Apple's JWT identity token
 */
export function decodeAppleJwt(idToken: string): Partial<AppleUserProfile> | null {
  try {
    const parts = idToken.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const data = JSON.parse(jsonPayload);
    return {
      sub: data.sub || '',
      email: data.email || '',
    };
  } catch (err) {
    console.error('Failed to parse Apple JWT id_token:', err);
    return null;
  }
}

class AppleAuthService {
  private scriptLoaded = false;
  private isInitialized = false;

  public getClientId(): string | undefined {
    return import.meta.env.VITE_APPLE_CLIENT_ID;
  }

  public isConfigured(): boolean {
    const id = this.getClientId();
    return Boolean(id && id.trim().length > 0 && !id.includes('your-apple-client-id'));
  }

  /**
   * Preloads Apple's official Web Authentication SDK
   */
  public async loadAppleScript(): Promise<boolean> {
    if (this.scriptLoaded && window.AppleID) {
      return true;
    }

    return new Promise((resolve) => {
      if (window.AppleID) {
        this.scriptLoaded = true;
        resolve(true);
        return;
      }

      const existing = document.getElementById('apple-sign-in-sdk');
      if (existing) {
        this.scriptLoaded = true;
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.id = 'apple-sign-in-sdk';
      script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.scriptLoaded = true;
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Initializes AppleID.auth with current environment client ID and origin
   */
  public async initializeApple(): Promise<boolean> {
    const clientId = this.getClientId();
    if (!this.isConfigured() || !clientId) return false;

    const loaded = await this.loadAppleScript();
    if (!loaded || !window.AppleID?.auth) return false;

    try {
      window.AppleID.auth.init({
        clientId: clientId.trim(),
        scope: 'name email',
        redirectURI: window.location.origin,
        usePopup: true,
      });
      this.isInitialized = true;
      return true;
    } catch (err) {
      console.warn('Apple Sign-In initialization notice:', err);
      return false;
    }
  }

  /**
   * Initiates Apple Sign-In flow across web & mobile devices
   */
  public async initiateAppleSignIn(
    onSuccess: (profile: AppleUserProfile) => void,
    onError: (error: string) => void
  ): Promise<AppleAuthResult> {
    const clientId = this.getClientId();

    if (!this.isConfigured() || !clientId) {
      return {
        status: 'pending_configuration',
        message:
          'Apple Sign-In requires an Apple Services ID (VITE_APPLE_CLIENT_ID) configured in your environment or Vercel dashboard.',
      };
    }

    const loaded = await this.loadAppleScript();
    if (!loaded || !window.AppleID?.auth) {
      return {
        status: 'error',
        message: 'Failed to load Apple Sign-In SDK. Please check your internet connection.',
      };
    }

    try {
      if (!this.isInitialized) {
        await this.initializeApple();
      }

      const response = await window.AppleID.auth.signIn();

      if (response && response.authorization) {
        const decoded = decodeAppleJwt(response.authorization.id_token);
        const firstName = response.user?.name?.firstName || '';
        const lastName = response.user?.name?.lastName || '';
        const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Apple Member';
        const email = response.user?.email || decoded?.email || '';

        const profile: AppleUserProfile = {
          sub: decoded?.sub || 'apple-user',
          email,
          name: fullName,
          firstName,
          lastName,
        };

        onSuccess(profile);
        return { status: 'success', profile };
      }

      onError('Apple Sign-In authorization response was incomplete.');
      return { status: 'error', message: 'Incomplete response' };
    } catch (err: any) {
      // User dismissed popup or cancelled
      const message = err?.error === 'popup_closed_by_user'
        ? 'Apple Sign-In window was closed.'
        : err?.message || 'Apple Sign-In could not be completed.';
      onError(message);
      return { status: 'error', message };
    }
  }
}

export const appleAuth = new AppleAuthService();
