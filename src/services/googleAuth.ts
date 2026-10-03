// Google Identity Services (GSI) OAuth 2.0 Integration

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
            error_callback?: (error: any) => void;
          }) => GoogleTokenClient;
          initCodeClient: (config: {
            client_id: string;
            scope: string;
            ux_mode?: 'popup' | 'redirect';
            redirect_uri?: string;
            callback: (response: any) => void;
          }) => any;
        };
      };
    };
  }
}

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  hd?: string;
  prompt: string;
  token_type: string;
  scope: string;
  error?: string;
  error_description?: string;
  error_uri?: string;
}

export interface GoogleTokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

export interface GoogleUserProfile {
  sub: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email: string;
  email_verified: boolean;
}

class GoogleAuthService {
  private scriptLoaded = false;
  private tokenClient: GoogleTokenClient | null = null;

  public getClientId(): string | undefined {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID;
  }

  public isConfigured(): boolean {
    const id = this.getClientId();
    return Boolean(id && id.trim().length > 0 && !id.includes('your-google-client-id'));
  }

  public async loadGoogleScript(): Promise<boolean> {
    if (this.scriptLoaded && window.google) {
      return true;
    }

    return new Promise((resolve) => {
      // Check if already injected
      const existing = document.getElementById('google-gsi-client');
      if (existing) {
        this.scriptLoaded = true;
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
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

  public async initiateGoogleSignIn(
    onSuccess: (profile: GoogleUserProfile) => void,
    onError: (error: string) => void
  ): Promise<{ status: 'initiated' | 'missing_config' | 'error'; message?: string }> {
    const clientId = this.getClientId();

    if (!this.isConfigured() || !clientId) {
      return {
        status: 'missing_config',
        message: 'Google Client ID (VITE_GOOGLE_CLIENT_ID) is not configured in the project environment.',
      };
    }

    const loaded = await this.loadGoogleScript();
    if (!loaded || !window.google?.accounts?.oauth2) {
      return {
        status: 'error',
        message: 'Failed to load Google Identity Services SDK. Please check your internet connection.',
      };
    }

    try {
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: async (tokenResponse: GoogleTokenResponse) => {
          if (tokenResponse.error) {
            onError(tokenResponse.error_description || tokenResponse.error);
            return;
          }

          try {
            // Fetch verified user profile using Google's userinfo endpoint
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            });

            if (!res.ok) {
              throw new Error('Failed to retrieve user profile from Google');
            }

            const profile: GoogleUserProfile = await res.json();
            onSuccess(profile);
          } catch (err: any) {
            onError(err?.message || 'Error retrieving Google profile');
          }
        },
        error_callback: (error) => {
          onError(error?.message || 'Google Sign-In was cancelled or failed.');
        },
      });

      // Request Google's actual account selection popup
      this.tokenClient.requestAccessToken({ prompt: 'select_account' });
      return { status: 'initiated' };
    } catch (err: any) {
      return {
        status: 'error',
        message: err?.message || 'Failed to initialize Google OAuth flow',
      };
    }
  }
}

export const googleAuth = new GoogleAuthService();
