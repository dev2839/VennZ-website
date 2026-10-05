import React, { useState, useEffect } from 'react';
import { IntroAnimation } from './components/IntroAnimation';
import { SplashScreen } from './components/SplashScreen';
import { Page2AuthScreen } from './components/Page2AuthScreen';
import { Page4ProfileScreen } from './components/Page4ProfileScreen';
import { Page5IdentityScreen } from './components/Page5IdentityScreen';
import { Page6ContextScreen } from './components/Page6ContextScreen';
import { Page7StandardsScreen } from './components/Page7StandardsScreen';
import { Page8WaitlistScreen } from './components/Page8WaitlistScreen';
import { Page9MembershipScreen } from './components/Page9MembershipScreen';
import { Page10OverviewScreen } from './components/Page10OverviewScreen';
import { Page11DiscoverScreen } from './components/Page11DiscoverScreen';
import { Page12FullProfileScreen } from './components/Page12FullProfileScreen';
import { Page13YouScreen } from './components/Page13YouScreen';
import { Page14HelpScreen } from './components/Page14HelpScreen';
import { Page15MatchesScreen } from './components/Page15MatchesScreen';
import { Page16ChatScreen } from './components/Page16ChatScreen';
import { Page17ElevateScreen } from './components/Page17ElevateScreen';
import { Page18MixersScreen } from './components/Page18MixersScreen';
import { WebNavbar, type RoutePath } from './components/WebNavbar';
import { WebFooter } from './components/WebFooter';
import { DUMMY_DISCOVER_PROFILES } from './data/dummyProfiles';
import type { DiscoverProfile } from './types/discover';
import type { MatchItem } from './types/matches';
import { useAuth } from './context/AuthContext';

export const App: React.FC = () => {
  const {
    startComplimentaryFirstLook,
    setMembershipStatus,
    resetAuth,
    appearanceMode,
    matches,
    setApplicationDecision,
    isAuthenticated,
  } = useAuth();

  const isDark = appearanceMode === 'after-dark';

  const [selectedProfileForFullView, setSelectedProfileForFullView] = useState<DiscoverProfile | null>(
    () => DUMMY_DISCOVER_PROFILES[0]
  );
  const [selectedChatMatch, setSelectedChatMatch] = useState<MatchItem | null>(null);
  const [matchesInitialSubTab, setMatchesInitialSubTab] = useState<'matches' | 'requests'>('matches');

  const [membershipReturnPath, setMembershipReturnPath] = useState<RoutePath>('/join/waitlist');
  const [membershipViewMode, setMembershipViewMode] = useState<'all' | 'membership_only' | 'complimentary_only'>('all');

  const VALID_PATHS: RoutePath[] = [
    '/',
    '/join',
    '/login',
    '/join/verify-code',
    '/join/profile',
    '/join/identity-verification',
    '/join/context',
    '/join/standards',
    '/join/waitlist',
    '/join/membership',
    '/join/submitted',
    '/overview',
    '/discover',
    '/member/profile',
    '/member/you',
    '/member/help',
    '/member/matches',
    '/member/chat',
    '/member/elevate',
    '/member/mixers',
  ];

  // ── Startup auth-aware routing ──────────────────────────────────────────────
  // Read auth state from localStorage synchronously so we know before first render
  // whether the user is authenticated (completed sign-in) or not.
  const getStartupAuthState = (): { isAuthenticated: boolean; membershipStatus: string | null } => {
    try {
      const saved = localStorage.getItem('inner_circle_auth_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          isAuthenticated: !!parsed?.isAuthenticated,
          membershipStatus: parsed?.membershipStatus || null,
        };
      }
    } catch {}
    return { isAuthenticated: false, membershipStatus: null };
  };


  const [currentPath, setCurrentPath] = useState<RoutePath>(() => {
    const { isAuthenticated } = getStartupAuthState();

    // If NOT authenticated → always start at root regardless of saved path
    if (!isAuthenticated) {
      try {
        // Clear any stale path so next load is also clean
        sessionStorage.removeItem('inner_circle_path');
        localStorage.removeItem('inner_circle_path');
      } catch {}
      return '/';
    }

    // If authenticated → restore their last known member page
    try {
      const savedPath = (sessionStorage.getItem('inner_circle_path') || localStorage.getItem('inner_circle_path')) as RoutePath;
      if (savedPath && VALID_PATHS.includes(savedPath) && savedPath !== '/') {
        return savedPath;
      }
    } catch {}

    // Authenticated but no saved path → go to discover
    return '/discover';
  });

  const [showIntro, setShowIntro] = useState<boolean>(() => {
    // Show intro animation ONLY when user is NOT authenticated and we're starting at root
    const { isAuthenticated } = getStartupAuthState();
    return !isAuthenticated;
  });

  const [learnModalOpen, setLearnModalOpen] = useState(false);
  const [isUpdatingPhotosMode, setIsUpdatingPhotosMode] = useState<boolean>(false);

  // Sync with browser history popstate
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname as RoutePath;
      if (VALID_PATHS.includes(path)) {
        setCurrentPath(path);
        try {
          sessionStorage.setItem('inner_circle_path', path);
          localStorage.setItem('inner_circle_path', path);
        } catch {}
      } else {
        setCurrentPath('/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: RoutePath) => {
    setCurrentPath(path);
    try {
      sessionStorage.setItem('inner_circle_path', path);
      localStorage.setItem('inner_circle_path', path);
      window.history.pushState({}, '', path);
    } catch {
      // Ignore in environments without history API
    }
    window.scrollTo(0, 0);
  };

  // Handlers for Page 1
  const handleGetStarted = () => {
    // If user is already authenticated, go directly to discover — no need to sign in again
    if (isAuthenticated) {
      navigate('/discover');
    } else {
      navigate('/join');
    }
  };
  const handleLearnHowItWorks = () => setLearnModalOpen(true);


  // Handlers for Page 2 (Unified Phone & OTP Authentication)
  const handleBackToSplash = () => navigate('/');
  const handleOtpSuccess = () => navigate('/join/profile');

  // Handlers for Page 4 (Profile Setup)
  const handleBackToOtp = () => navigate('/login');
  const handleProfileSuccess = () => navigate('/join/identity-verification');

  // Handlers for Page 5 (Verify Identity)
  const handleBackToProfile = () => navigate('/join/profile');
  const handleIdentitySuccess = () => navigate('/join/context');

  // Handlers for Page 6 (Context)
  const handleBackToIdentity = () => navigate('/join/identity-verification');
  const handleContextSuccess = () => navigate('/join/standards');
  const handleContextSkip = () => navigate('/join/standards');

  // Handlers for Page 7 (Standards)
  const handleBackToContext = () => navigate('/join/context');
  const handleStandardsSubmit = () => navigate('/join/waitlist');

  // Handlers for Page 8 (Application / Waitlist)
  const handleBackFromWaitlist = () => navigate('/join/standards');
  const handleReturnToWelcomeFromWaitlist = () => navigate('/');
  const handleUpdatePhotographsFromWaitlist = () => {
    setIsUpdatingPhotosMode(true);
    navigate('/join/profile');
  };
  const handleSelectMembershipFromWaitlist = () => {
    setMembershipReturnPath('/join/waitlist');
    setMembershipViewMode('membership_only');
    navigate('/join/membership');
  };
  const handleSelectFreeTrialFromWaitlist = () => {
    setMembershipReturnPath('/join/waitlist');
    setMembershipViewMode('complimentary_only');
    navigate('/join/membership');
  };

  // Handlers for Page 9 (Membership)
  const handleBackFromMembership = () => navigate(membershipReturnPath);
  const handlePaymentSuccess = () => {
    setMembershipStatus('member');
    navigate('/discover');
  };
  const handleComplimentarySuccess = () => {
    startComplimentaryFirstLook();
    navigate('/overview');
  };
  const handleUpgradeToMembership = () => navigate('/join/waitlist');

  // Handlers for Page 13 (You / Membership)
  const handleNavigateHelpFromYou = () => navigate('/member/help');
  const handleManageMembershipFromYou = () => {
    setMembershipReturnPath('/member/you');
    setMembershipViewMode('all');
    navigate('/join/membership');
  };
  const handleSignOutFromYou = () => {
    resetAuth();
    navigate('/');
  };
  const handleDeleteAccountFromYou = () => {
    resetAuth();
    navigate('/');
  };

  // Handlers for Page 14 (Help & Contact Us)
  const handleBackFromHelp = () => navigate('/member/you');

  // Render the active screen inside the responsive web container
  const renderActiveScreen = (showStatusBar: boolean, showHomeIndicator: boolean) => {
    if (currentPath === '/join' || currentPath === '/login') {
      return (
        <Page2AuthScreen
          onBack={handleBackToSplash}
          onSuccess={handleOtpSuccess}
          showStatusBar={showStatusBar}
          showHomeIndicator={showHomeIndicator}
        />
      );
    }

    if (currentPath === '/join/verify-code') {
      return (
        <Page2AuthScreen
          initialStep="otp"
          onBack={handleBackToSplash}
          onSuccess={handleOtpSuccess}
          showStatusBar={showStatusBar}
          showHomeIndicator={showHomeIndicator}
        />
      );
    }

    if (currentPath === '/join/profile') {
      return (
        <Page4ProfileScreen
          onBack={() => {
            if (isUpdatingPhotosMode) {
              setIsUpdatingPhotosMode(false);
              navigate('/join/waitlist');
            } else {
              handleBackToOtp();
            }
          }}
          onSuccess={handleProfileSuccess}
          isUpdatingPhotosMode={isUpdatingPhotosMode}
          onPhotosUpdated={() => {
            setIsUpdatingPhotosMode(false);
            setApplicationDecision(null);
            navigate('/join/waitlist');
          }}
          showStatusBar={showStatusBar}
          showHomeIndicator={showHomeIndicator}
        />
      );
    }

    if (currentPath === '/join/identity-verification') {
      return (
        <Page5IdentityScreen
          onBack={handleBackToProfile}
          onSuccess={handleIdentitySuccess}
          showStatusBar={showStatusBar}
          showHomeIndicator={showHomeIndicator}
        />
      );
    }

    if (currentPath === '/join/context') {
      return (
        <Page6ContextScreen
          onBack={handleBackToIdentity}
          onSuccess={handleContextSuccess}
          onSkip={handleContextSkip}
          showStatusBar={showStatusBar}
          showHomeIndicator={showHomeIndicator}
        />
      );
    }

    if (currentPath === '/join/standards') {
      return (
        <Page7StandardsScreen
          onBack={handleBackToContext}
          onSubmit={handleStandardsSubmit}
          showStatusBar={showStatusBar}
          showHomeIndicator={showHomeIndicator}
        />
      );
    }

    if (currentPath === '/join/waitlist' || currentPath === '/join/submitted') {
      return (
        <Page8WaitlistScreen
          onBack={handleBackFromWaitlist}
          onReturnToWelcome={handleReturnToWelcomeFromWaitlist}
          onUpdatePhotographs={handleUpdatePhotographsFromWaitlist}
          onSelectMembership={handleSelectMembershipFromWaitlist}
          onSelectFreeTrial={handleSelectFreeTrialFromWaitlist}
          showStatusBar={showStatusBar}
          showHomeIndicator={showHomeIndicator}
        />
      );
    }

    if (currentPath === '/join/membership') {
      return (
        <Page9MembershipScreen
          onBack={handleBackFromMembership}
          onPaymentSuccess={handlePaymentSuccess}
          onComplimentarySuccess={handleComplimentarySuccess}
          viewMode={membershipViewMode}
          showStatusBar={showStatusBar}
          showHomeIndicator={showHomeIndicator}
        />
      );
    }

    if (currentPath === '/overview') {
      return (
        <Page10OverviewScreen
          onBack={() => navigate('/join/membership')}
          onNavigateHome={() => navigate('/discover')}
          showStatusBar={showStatusBar}
          showHomeIndicator={showHomeIndicator}
        />
      );
    }

    if (currentPath === '/discover') {
      return (
        <Page11DiscoverScreen
          onViewFullProfile={(profile) => {
            setSelectedProfileForFullView(profile);
            navigate('/member/profile');
          }}
          onSelectTab={(tab) => {
            if (tab === 'you') {
              navigate('/member/you');
            } else if (tab === 'matches') {
              setMatchesInitialSubTab('matches');
              navigate('/member/matches');
            } else if (tab === 'elevate') {
              navigate('/member/elevate');
            } else if (tab === 'mixers') {
              navigate('/member/mixers');
            }
          }}
          onUpgradeToMembership={handleUpgradeToMembership}
          showStatusBar={showStatusBar}
          showHomeIndicator={showHomeIndicator}
        />
      );
    }

    if (currentPath === '/member/profile') {
      const profileToView = selectedProfileForFullView || DUMMY_DISCOVER_PROFILES[0];
      return (
        <Page12FullProfileScreen
          profile={profileToView}
          onBack={() => navigate('/discover')}
          onActionComplete={() => navigate('/discover')}
          onSelectTab={(tab) => {
            if (tab === 'you') {
              navigate('/member/you');
            } else if (tab === 'discover') {
              navigate('/discover');
            } else if (tab === 'matches') {
              setMatchesInitialSubTab('matches');
              navigate('/member/matches');
            } else if (tab === 'elevate') {
              navigate('/member/elevate');
            } else if (tab === 'mixers') {
              navigate('/member/mixers');
            }
          }}
          showStatusBar={showStatusBar}
          showHomeIndicator={showHomeIndicator}
        />
      );
    }

    if (currentPath === '/member/you') {
      return (
        <Page13YouScreen
          onNavigateHelp={handleNavigateHelpFromYou}
          onManageMembership={handleManageMembershipFromYou}
          onSignOut={handleSignOutFromYou}
          onDeleteAccount={handleDeleteAccountFromYou}
          onUpgradeToMembership={handleUpgradeToMembership}
          onNavigateMatches={(subTab) => {
            setMatchesInitialSubTab(subTab);
            navigate('/member/matches');
          }}
          onSelectTab={(tab) => {
            if (tab === 'discover') {
              navigate('/discover');
            } else if (tab === 'matches') {
              setMatchesInitialSubTab('matches');
              navigate('/member/matches');
            } else if (tab === 'elevate') {
              navigate('/member/elevate');
            } else if (tab === 'mixers') {
              navigate('/member/mixers');
            }
          }}
          showStatusBar={showStatusBar}
          showHomeIndicator={showHomeIndicator}
        />
      );
    }

    if (currentPath === '/member/help') {
      return (
        <Page14HelpScreen
          onBack={handleBackFromHelp}
          onSelectTab={(tab) => {
            if (tab === 'discover') {
              navigate('/discover');
            } else if (tab === 'you') {
              navigate('/member/you');
            } else if (tab === 'matches') {
              setMatchesInitialSubTab('matches');
              navigate('/member/matches');
            } else if (tab === 'elevate') {
              navigate('/member/elevate');
            } else if (tab === 'mixers') {
              navigate('/member/mixers');
            }
          }}
          showStatusBar={showStatusBar}
          showHomeIndicator={showHomeIndicator}
        />
      );
    }

    if (currentPath === '/member/matches') {
      return (
        <Page15MatchesScreen
          initialSubTab={matchesInitialSubTab}
          onOpenChat={(match) => {
            setSelectedChatMatch(match);
            navigate('/member/chat');
          }}
          onSelectTab={(tab) => {
            if (tab === 'discover') {
              navigate('/discover');
            } else if (tab === 'you') {
              navigate('/member/you');
            } else if (tab === 'elevate') {
              navigate('/member/elevate');
            } else if (tab === 'mixers') {
              navigate('/member/mixers');
            }
          }}
          onNavigateHelp={() => navigate('/member/help')}
          showStatusBar={showStatusBar}
          showHomeIndicator={showHomeIndicator}
        />
      );
    }

    if (currentPath === '/member/chat') {
      const matchToChat = selectedChatMatch || (matches && matches[0]) || {
        id: 'match-meera-30',
        profileId: 'meera-30',
        name: 'Meera',
        age: 30,
        city: 'PUNE, INDIA',
        designation: 'Corporate Counsel',
        company: 'Shardul Amarchand Mangaldas',
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&auto=format&fit=crop&q=85',
        isVerified: true,
        matchedAt: Date.now(),
        lastMessage: "Thank you for accepting — I'm Meera. How has your week been?",
        lastMessageTime: Date.now(),
      };
      return (
        <Page16ChatScreen
          match={matchToChat}
          onBack={() => navigate('/member/matches')}
          onSelectTab={(tab) => {
            if (tab === 'discover') {
              navigate('/discover');
            } else if (tab === 'matches') {
              navigate('/member/matches');
            } else if (tab === 'you') {
              navigate('/member/you');
            } else if (tab === 'elevate') {
              navigate('/member/elevate');
            } else if (tab === 'mixers') {
              navigate('/member/mixers');
            }
          }}
          onNavigateHelp={() => navigate('/member/help')}
          showStatusBar={showStatusBar}
          showHomeIndicator={showHomeIndicator}
        />
      );
    }

    if (currentPath === '/member/elevate') {
      return (
        <Page17ElevateScreen
          onSelectTab={(tab) => {
            if (tab === 'discover') {
              navigate('/discover');
            } else if (tab === 'matches') {
              navigate('/member/matches');
            } else if (tab === 'you') {
              navigate('/member/you');
            } else if (tab === 'mixers') {
              navigate('/member/mixers');
            }
          }}
          onNavigateHelp={() => navigate('/member/help')}
          onUpgradeToMembership={handleUpgradeToMembership}
          showStatusBar={showStatusBar}
          showHomeIndicator={showHomeIndicator}
        />
      );
    }

    if (currentPath === '/member/mixers') {
      return (
        <Page18MixersScreen
          onSelectTab={(tab) => {
            if (tab === 'discover') {
              navigate('/discover');
            } else if (tab === 'matches') {
              navigate('/member/matches');
            } else if (tab === 'elevate') {
              navigate('/member/elevate');
            } else if (tab === 'you') {
              navigate('/member/you');
            }
          }}
          onNavigateHelp={() => navigate('/member/help')}
          onUpgradeToMembership={handleUpgradeToMembership}
          showStatusBar={showStatusBar}
          showHomeIndicator={showHomeIndicator}
        />
      );
    }

    // Default: Page 1 Splash
    return (
      <SplashScreen
        onGetStarted={handleGetStarted}
        onLearnHowItWorks={handleLearnHowItWorks}
        showStatusBar={showStatusBar}
        showHomeIndicator={showHomeIndicator}
        isIntroActive={showIntro}
      />
    );
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isDark ? '#140E1C' : '#FAF1F3',
        color: isDark ? '#FDF3F5' : '#462037',
        fontFamily: 'var(--font-sans)',
        position: 'relative',
      }}
    >
      {/* Intro Launch Animation */}
      {showIntro && (
        <IntroAnimation
          onComplete={() => {
            setShowIntro(false);
            try {
              sessionStorage.setItem('vennz_intro_seen', 'true');
            } catch {}
          }}
        />
      )}

      {/* Universal Desktop & Mobile Web Navigation Bar on non-auth pages */}
      {currentPath !== '/join' &&
        currentPath !== '/login' &&
        currentPath !== '/join/verify-code' && (
          <WebNavbar currentPath={currentPath} onNavigate={navigate} />
        )}

      {/* Main Responsive Web Content Area */}
      <main
        key={currentPath}
        className="page-transition-enter"
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        {renderActiveScreen(false, false)}
      </main>

      {/* Comprehensive Editorial Web Footer */}
      {currentPath !== '/member/chat' &&
        currentPath !== '/join' &&
        currentPath !== '/login' &&
        currentPath !== '/join/verify-code' && (
          <WebFooter onNavigate={(path) => navigate(path as RoutePath)} />
        )}

      {/* Learn How It Works Modal (Page 1) */}
      {learnModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(20, 14, 28, 0.85)',
            backdropFilter: 'blur(12px)',
            padding: '24px',
          }}
          onClick={() => setLearnModalOpen(false)}
        >
          <div
            className="modal-content-animated"
            style={{
              width: '100%',
              maxWidth: '420px',
              backgroundColor: isDark ? '#462037' : '#FAF1F3',
              border: isDark ? '1px solid rgba(161, 82, 95, 0.35)' : '1px solid rgba(199, 87, 124, 0.25)',
              borderRadius: '24px',
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.55)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: isDark ? 'rgba(249, 170, 173, 0.12)' : 'rgba(161, 82, 95, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isDark ? '#F9AAAD' : '#A1525F'}>
                <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
              </svg>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '24px',
                color: isDark ? '#FDF3F5' : '#462037',
                marginBottom: '8px',
              }}
            >
              How VennZ Works
            </h3>

            <p
              style={{
                fontSize: '14px',
                lineHeight: '1.6',
                color: isDark ? '#D4A2AC' : '#683A46',
                marginBottom: '24px',
              }}
            >
              VennZ is an exclusive, vetted dating community with rigorous identity verification, career standards, curated introductions, and private mixer gatherings.
            </p>

            <button
              type="button"
              className="btn-tactile"
              onClick={() => {
                setLearnModalOpen(false);
                navigate('/join');
              }}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '9999px',
                border: 'none',
                background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                color: '#FDF3F5',
                fontSize: '14.5px',
                fontWeight: 600,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(161, 82, 95, 0.35)',
              }}
            >
              Continue to Apply →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
