// Google Identity Services (GSI) OAuth 2.0 Integration
// Seamlessly works across all devices: Windows, Linux, macOS, iOS (iPhone/iPad), Android

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string; select_by?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            prompt_parent_id?: string;
          }) => void;
          prompt: (notificationCallback?: (notification: any) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: string | number;
              locale?: string;
            }
          ) => void;
          cancel: () => void;
        };
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

/**
 * Safely decodes a Google JWT ID token payload across all browsers and devices
 */
export function decodeGoogleJwt(credential: string): GoogleUserProfile | null {
  try {
    const parts = credential.split('.');
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
      name: data.name || `${data.given_name || ''} ${data.family_name || ''}`.trim() || data.email || 'Google Member',
      given_name: data.given_name,
      family_name: data.family_name,
      picture: data.picture,
      email: data.email || '',
      email_verified: Boolean(data.email_verified),
    };
  } catch (err) {
    console.error('Failed to decode Google JWT token:', err);
    return null;
  }
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
      if (window.google?.accounts) {
        this.scriptLoaded = true;
        resolve(true);
        return;
      }

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

  /**
   * Initializes Google Identity Services (GIS) ID client
   */
  public async initializeGoogleId(
    onSuccess: (profile: GoogleUserProfile) => void,
    onError: (error: string) => void
  ): Promise<boolean> {
    const clientId = this.getClientId();
    if (!this.isConfigured() || !clientId) return false;

    const loaded = await this.loadGoogleScript();
    if (!loaded || !window.google?.accounts?.id) return false;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: { credential: string }) => {
          if (response.credential) {
            const profile = decodeGoogleJwt(response.credential);
            if (profile) {
              onSuccess(profile);
            } else {
              onError('Failed to parse Google user credentials.');
            }
          } else {
            onError('Google did not return user credentials.');
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      return true;
    } catch (err: any) {
      console.warn('Google ID initialization error:', err);
      return false;
    }
  }

  /**
   * Renders the native Google button into a container for 100% mobile & desktop reliability
   */
  public renderGoogleButton(
    container: HTMLElement,
    onSuccess: (profile: GoogleUserProfile) => void,
    onError: (error: string) => void
  ): boolean {
    const clientId = this.getClientId();
    if (!this.isConfigured() || !clientId || !window.google?.accounts?.id) return false;

    try {
      this.initializeGoogleId(onSuccess, onError);
      window.google.accounts.id.renderButton(container, {
        type: 'standard',
        shape: 'pill',
        theme: 'outline',
        text: 'continue_with',
        size: 'large',
        width: '100%',
        logo_alignment: 'center',
      });
      return true;
    } catch (err) {
      console.warn('Failed to render native Google button', err);
      return false;
    }
  }

  /**
   * Initiates Google Sign-In using popup Token Client or GIS Prompt
   */
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
    if (!loaded || !window.google?.accounts) {
      return {
        status: 'error',
        message: 'Failed to load Google Identity Services SDK. Please check your internet connection.',
      };
    }

    // Use OAuth 2.0 token client
    if (window.google.accounts.oauth2) {
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

        this.tokenClient.requestAccessToken({ prompt: 'select_account' });
        return { status: 'initiated' };
      } catch (err: any) {
        return {
          status: 'error',
          message: err?.message || 'Failed to initialize Google OAuth flow',
        };
      }
    }

    // Fallback to ID prompt
    if (window.google.accounts.id) {
      await this.initializeGoogleId(onSuccess, onError);
      window.google.accounts.id.prompt();
      return { status: 'initiated' };
    }

    return {
      status: 'error',
      message: 'Google Identity Services is not available.',
    };
  }
}

export const googleAuth = new GoogleAuthService();
