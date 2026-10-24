import React, { useState, useEffect, useRef } from 'react';
import { IntroAnimation } from './components/IntroAnimation';
import { SplashScreen } from './components/SplashScreen';
import { Page2AuthScreen } from './components/Page2AuthScreen';
import { Page3DigiLockerScreen } from './components/Page3DigiLockerScreen';
import { Page4ProfileScreen } from './components/Page4ProfileScreen';
import { Page5IdentityScreen } from './components/Page5IdentityScreen';
import { Page6ContextScreen } from './components/Page6ContextScreen';
import { Page7StandardsScreen } from './components/Page7StandardsScreen';
import { Page8WaitlistScreen } from './components/Page8WaitlistScreen';
import { Page9MembershipScreen } from './components/Page9MembershipScreen';
import { Page11DiscoverScreen } from './components/Page11DiscoverScreen';
import { Page12FullProfileScreen } from './components/Page12FullProfileScreen';
import { MyProfileScreen } from './components/MyProfileScreen';
import { Page14HelpScreen } from './components/Page14HelpScreen';
import { Page15MatchesScreen } from './components/Page15MatchesScreen';
import { Page16ChatScreen } from './components/Page16ChatScreen';
import { PageBlindDateScreen } from './components/PageBlindDateScreen';
import { Page18MixersScreen } from './components/Page18MixersScreen';
import { Page19AfterHoursScreen } from './components/Page19AfterHoursScreen';
import { WebNavbar, type RoutePath } from './components/WebNavbar';
import { WebFooter } from './components/WebFooter';
import { useIsMobile } from './mobile/useIsMobile';
import { NotificationPopup } from './components/NotificationPopup';
import { ModalPortal } from './components/ModalPortal';
import { DUMMY_DISCOVER_PROFILES } from './data/dummyProfiles';
import type { DiscoverProfile } from './types/discover';
import type { MatchItem } from './types/matches';
import { useAuth } from './context/AuthContext';
import { getPageBackground } from './constants/themeGradients';

export const App: React.FC = () => {
  const isMobile = useIsMobile(768);
  const {
    startComplimentaryFirstLook,
    setMembershipStatus,
    appearanceMode,
    matches,
    setApplicationDecision,
    isAuthenticated,
    membershipStatus,
    isDigiLockerVerified,
    isIdentityVerified,
    isApplicationSubmitted,
    profile,
    signOut,
    deleteAccount,
  } = useAuth();

  const isDark = appearanceMode === 'after-dark';

  const [selectedProfileForFullView, setSelectedProfileForFullView] = useState<DiscoverProfile | null>(
    () => DUMMY_DISCOVER_PROFILES[0]
  );
  const [profileViewSource, setProfileViewSource] = useState<RoutePath>('/discover');
  const [selectedChatMatch, setSelectedChatMatch] = useState<MatchItem | null>(null);
  const [matchesInitialSubTab, setMatchesInitialSubTab] = useState<'matches' | 'requests'>('matches');

  const [membershipReturnPath, setMembershipReturnPath] = useState<RoutePath>('/join/waitlist');
  const [membershipViewMode, setMembershipViewMode] = useState<'all' | 'membership_only' | 'complimentary_only'>('all');
  const [afterHoursChatActive, setAfterHoursChatActive] = useState<boolean>(false);

  const VALID_PATHS: RoutePath[] = [
    '/',
    '/join',
    '/login',
    '/join/verify-code',
    '/join/digilocker',
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
    '/member/my-profile',
    '/member/you',
    '/member/help',
    '/member/matches',
    '/member/chat',
    '/member/elevate',
    '/member/blinddate',
    '/member/mixers',
    '/member/afterhours',
  ];

// isRegisteredUser replaced with direct onboarding gating logic

  // Ref to the main content wrapper — used to reset internal scroll on navigation
  const mainRef = useRef<HTMLDivElement>(null);

  const [currentPath, setCurrentPath] = useState<RoutePath>(() => {
    // If URL has an explicit direct route that is not root, support it
    const path = window.location.pathname as RoutePath;
    if (path && path !== '/' && VALID_PATHS.includes(path)) {
      if (path === '/overview') return '/discover';
      return path;
    }
    // Every time website starts/opens, always start at root '/' (Welcome page)
    return '/';
  });

  const [showIntro, setShowIntro] = useState<boolean>(() => {
    // Every time website starts at root, always start with intro animation
    const path = window.location.pathname;
    return path === '/' || path === '';
  });

  // ── Theme synchronization on HTML & body for native controls & autofill ─
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', appearanceMode);
    document.body.setAttribute('data-theme', appearanceMode);
  }, [appearanceMode]);

  // ── Scroll-to-top on every page/route change ──────────────────────────────
  // Pages use internal overflow containers (not window), so we reset all of them.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    // Reset any internal overflow containers inside the newly rendered page
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
      if (mainRef.current) {
        mainRef.current.scrollTop = 0;
        const scrollables = mainRef.current.querySelectorAll<HTMLElement>(
          '[style*="overflow"], [class*="overflow"]'
        );
        scrollables.forEach((el) => {
          el.scrollTop = 0;
        });
      }
    }, 25);
    return () => clearTimeout(timer);
  }, [currentPath]);

  const [learnModalOpen, setLearnModalOpen] = useState(false);
  const [isUpdatingPhotosMode, setIsUpdatingPhotosMode] = useState<boolean>(false);

  // Sync with browser history popstate
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname as RoutePath;
      if (VALID_PATHS.includes(path)) {
        if (path === '/overview') {
          navigate('/discover');
          return;
        }
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
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    if (mainRef.current) mainRef.current.scrollTop = 0;
  };

  // Handlers for Page 1
  const handleGetStarted = () => {
    // Full member/complimentary: go straight to discover
    if (membershipStatus === 'member' || membershipStatus === 'complimentary') {
      navigate('/discover');
      return;
    }
    // Not authenticated yet: go to sign-in
    if (!isAuthenticated) {
      navigate('/join');
      return;
    }
    // Authenticated but onboarding incomplete — resume at correct next step
    if (!isDigiLockerVerified) {
      navigate('/join/digilocker');
      return;
    }
    if (!profile.vennzName || !profile.city || !profile.genderIdentity) {
      navigate('/join/profile');
      return;
    }
    if (!isIdentityVerified) {
      navigate('/join/identity-verification');
      return;
    }
    if (!isApplicationSubmitted) {
      navigate('/join/context');
      return;
    }
    // Application submitted but no membership — show waitlist/status screen
    navigate('/join/waitlist');
  };
  const handleLearnHowItWorks = () => setLearnModalOpen(true);


  // Handlers for Page 2 (Unified Phone & OTP Authentication)
  const handleBackToSplash = () => navigate('/');
  // After OTP success → DigiLocker verification (before profile setup)
  const handleOtpSuccess = () => {
    let currentMembership = membershipStatus;
    let digiVerified = isDigiLockerVerified;
    let currentVennzName = profile.vennzName;
    let currentCity = profile.city;
    let currentGender = profile.genderIdentity;
    let identityVerified = isIdentityVerified;
    let appSubmitted = isApplicationSubmitted;

    try {
      const savedArchive = localStorage.getItem('vennz_registered_account_archive');
      if (savedArchive) {
        const parsed = JSON.parse(savedArchive);
        if (parsed.membershipStatus) currentMembership = parsed.membershipStatus;
        if (parsed.isDigiLockerVerified !== undefined) digiVerified = parsed.isDigiLockerVerified;
        if (parsed.profile?.vennzName) currentVennzName = parsed.profile.vennzName;
        if (parsed.profile?.city) currentCity = parsed.profile.city;
        if (parsed.profile?.genderIdentity) currentGender = parsed.profile.genderIdentity;
        if (parsed.isIdentityVerified !== undefined) identityVerified = parsed.isIdentityVerified;
        if (parsed.isApplicationSubmitted !== undefined) appSubmitted = parsed.isApplicationSubmitted;
      }
    } catch {
      // Ignore
    }

    // Full member / complimentary: go straight to discover
    if (currentMembership === 'member' || currentMembership === 'complimentary') {
      navigate('/discover');
      return;
    }
    // Incomplete onboarding: resume at the exact step left off at
    if (!digiVerified) {
      navigate('/join/digilocker');
      return;
    }
    if (!currentVennzName || !currentCity || !currentGender) {
      navigate('/join/profile');
      return;
    }
    if (!identityVerified) {
      navigate('/join/identity-verification');
      return;
    }
    if (!appSubmitted) {
      navigate('/join/context');
      return;
    }
    navigate('/join/waitlist');
  };

  // Handlers for Page 3 (DigiLocker Verification)
  const handleBackFromDigiLocker = () => navigate('/login');
  const handleDigiLockerSuccess = () => navigate('/join/profile');

  // Handlers for Page 4 (Profile Setup)
  const handleBackToOtp = () => navigate('/join/digilocker');
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
    navigate('/discover');
  };
  const handleUpgradeToMembership = () => navigate('/join/waitlist');

  // Handlers for Member Profile & Membership Account
  const handleNavigateHelpFromYou = () => navigate('/member/help');
  const handleManageMembershipFromYou = () => {
    setMembershipReturnPath('/member/my-profile');
    setMembershipViewMode('all');
    navigate('/join/membership');
  };
  const handleSignOutFromYou = () => {
    signOut();
    navigate('/');
  };
  const handleDeleteAccountFromYou = () => {
    deleteAccount();
    navigate('/');
  };

  // Handlers for Page 14 (Help & Contact Us)
  const handleBackFromHelp = () => navigate('/member/my-profile');

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

    if (currentPath === '/join/digilocker') {
      return (
        <Page3DigiLockerScreen
          onBack={handleBackFromDigiLocker}
          onSuccess={handleDigiLockerSuccess}
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
      navigate('/discover');
      return null;
    }

    if (currentPath === '/discover') {
      return (
        <Page11DiscoverScreen
          onViewFullProfile={(profile) => {
            setProfileViewSource('/discover');
            setSelectedProfileForFullView(profile);
            navigate('/member/profile');
          }}
          onSelectTab={(tab) => {
            if (tab === 'you' || tab === 'profile') {
              navigate('/member/my-profile');
            } else if (tab === 'matches') {
              setMatchesInitialSubTab('matches');
              navigate('/member/matches');
            } else if (tab === 'elevate' || tab === 'blinddate') {
              navigate('/member/blinddate');
            } else if (tab === 'mixers') {
              navigate('/member/mixers');
            } else if (tab === 'afterhours') {
              navigate('/member/afterhours');
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
          onBack={() => navigate(profileViewSource || '/discover')}
          onActionComplete={() => navigate(profileViewSource || '/discover')}
          onSelectTab={(tab) => {
            if (tab === 'you' || tab === 'profile') {
              navigate('/member/my-profile');
            } else if (tab === 'discover') {
              navigate('/discover');
            } else if (tab === 'matches') {
              setMatchesInitialSubTab('matches');
              navigate('/member/matches');
            } else if (tab === 'elevate' || tab === 'blinddate') {
              navigate('/member/blinddate');
            } else if (tab === 'mixers') {
              navigate('/member/mixers');
            } else if (tab === 'afterhours') {
              navigate('/member/afterhours');
            }
          }}
          showStatusBar={showStatusBar}
          showHomeIndicator={showHomeIndicator}
        />
      );
    }

    if (currentPath === '/member/my-profile' || currentPath === '/member/you') {
      return (
        <MyProfileScreen
          onBack={() => navigate('/discover')}
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
            } else if (tab === 'elevate' || tab === 'blinddate') {
              navigate('/member/blinddate');
            } else if (tab === 'mixers') {
              navigate('/member/mixers');
            } else if (tab === 'afterhours') {
              navigate('/member/afterhours');
            } else {
              navigate('/member/my-profile');
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
            } else if (tab === 'you' || tab === 'profile') {
              navigate('/member/my-profile');
            } else if (tab === 'matches') {
              setMatchesInitialSubTab('matches');
              navigate('/member/matches');
            } else if (tab === 'elevate' || tab === 'blinddate') {
              navigate('/member/blinddate');
            } else if (tab === 'mixers') {
              navigate('/member/mixers');
            } else if (tab === 'afterhours') {
              navigate('/member/afterhours');
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
          onViewProfile={(match) => {
            setProfileViewSource('/member/matches');
            // Convert MatchItem to DiscoverProfile shape for viewing
            const discoverProfile = DUMMY_DISCOVER_PROFILES.find(
              (p) => p.id === match.profileId || p.id === match.id
            ) || {
              id: match.profileId || match.id,
              firstName: match.name.split(' ')[0],
              age: match.age,
              city: match.city,
              designation: match.designation,
              company: match.company || '',
              photos: [match.photo],
              isVerified: match.isVerified,
              introduction: '',
              interests: [],
              gender: 'woman' as const,
              activeStatus: 'Active recently',
            };
            setSelectedProfileForFullView(discoverProfile);
            navigate('/member/profile');
          }}
          onSelectTab={(tab) => {
            if (tab === 'discover') {
              navigate('/discover');
            } else if (tab === 'you' || tab === 'profile') {
              navigate('/member/my-profile');
            } else if (tab === 'elevate' || tab === 'blinddate') {
              navigate('/member/blinddate');
            } else if (tab === 'mixers') {
              navigate('/member/mixers');
            } else if (tab === 'afterhours') {
              navigate('/member/afterhours');
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
        name: 'Meera Sen',
        age: 30,
        city: 'PUNE, INDIA',
        designation: 'Corporate Counsel',
        company: 'Shardul Amarchand Mangaldas',
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&auto=format&fit=crop&q=85',
        isVerified: true,
        matchedAt: Date.now(),
        lastMessage: "Thank you for accepting — I'm Meera Sen. How has your week been?",
        lastMessageTime: Date.now(),
      };
      return (
        <Page16ChatScreen
          match={matchToChat}
          onBack={() => navigate('/member/matches')}
          onViewMatchProfile={(match) => {
            setProfileViewSource('/member/chat');
            const discoverProfile = DUMMY_DISCOVER_PROFILES.find(
              (p) => p.id === match.profileId || p.id === match.id
            ) || {
              id: match.profileId || match.id,
              firstName: match.name.split(' ')[0],
              age: match.age,
              city: match.city,
              designation: match.designation,
              company: match.company || '',
              photos: [match.photo],
              isVerified: match.isVerified,
              introduction: '',
              interests: [],
              gender: 'woman' as const,
              activeStatus: 'Active recently',
            };
            setSelectedProfileForFullView(discoverProfile);
            navigate('/member/profile');
          }}
          onSelectTab={(tab) => {
            if (tab === 'discover') {
              navigate('/discover');
            } else if (tab === 'matches') {
              navigate('/member/matches');
            } else if (tab === 'you' || tab === 'profile') {
              navigate('/member/my-profile');
            } else if (tab === 'elevate' || tab === 'blinddate') {
              navigate('/member/blinddate');
            } else if (tab === 'mixers') {
              navigate('/member/mixers');
            } else if (tab === 'afterhours') {
              navigate('/member/afterhours');
            }
          }}
          onNavigateHelp={() => navigate('/member/help')}
          showStatusBar={showStatusBar}
          showHomeIndicator={showHomeIndicator}
        />
      );
    }

    if (currentPath === '/member/blinddate' || currentPath === '/member/elevate') {
      return (
        <PageBlindDateScreen
          onNavigateChat={(matchId) => {
            const match = matches.find((m) => m.id === matchId);
            if (match) {
              setSelectedChatMatch(match);
            }
            navigate('/member/chat');
          }}
          onSelectTab={(tab) => {
            if (tab === 'discover') {
              navigate('/discover');
            } else if (tab === 'matches') {
              navigate('/member/matches');
            } else if (tab === 'you' || tab === 'profile') {
              navigate('/member/my-profile');
            } else if (tab === 'mixers') {
              navigate('/member/mixers');
            } else if (tab === 'afterhours') {
              navigate('/member/afterhours');
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
            } else if (tab === 'elevate' || tab === 'blinddate') {
              navigate('/member/blinddate');
            } else if (tab === 'you' || tab === 'profile') {
              navigate('/member/my-profile');
            } else if (tab === 'afterhours') {
              navigate('/member/afterhours');
            }
          }}
          onNavigateHelp={() => navigate('/member/help')}
          onUpgradeToMembership={handleUpgradeToMembership}
          showStatusBar={showStatusBar}
          showHomeIndicator={showHomeIndicator}
        />
      );
    }

    if (currentPath === '/member/afterhours') {
      return (
        <Page19AfterHoursScreen
          onSelectTab={(tab) => {
            if (tab === 'discover') {
              navigate('/discover');
            } else if (tab === 'matches') {
              setMatchesInitialSubTab('matches');
              navigate('/member/matches');
            } else if (tab === 'elevate' || tab === 'blinddate') {
              navigate('/member/blinddate');
            } else if (tab === 'mixers') {
              navigate('/member/mixers');
            } else if (tab === 'you' || tab === 'profile') {
              navigate('/member/my-profile');
            }
          }}
          onNavigateHelp={() => navigate('/member/help')}
          onUpgradeToMembership={handleUpgradeToMembership}
          onNavigateToChat={() => navigate('/member/chat')}
          onChatViewChange={(isChatOrQueue) => setAfterHoursChatActive(isChatOrQueue)}
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

  const isFullHeightChatMode =
    currentPath === '/member/chat' ||
    (currentPath === '/member/afterhours' && afterHoursChatActive);

  return (
    <div
      style={{
        height: isFullHeightChatMode ? '100dvh' : undefined,
        maxHeight: isFullHeightChatMode ? '100dvh' : undefined,
        minHeight: isFullHeightChatMode ? '100dvh' : '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: getPageBackground(isDark),
        backgroundColor: isDark ? '#140E1C' : '#FAF1F3',
        color: isDark ? '#FDF3F5' : '#462037',
        fontFamily: 'var(--font-sans)',
        position: 'relative',
        overflow: isFullHeightChatMode ? 'hidden' : undefined,
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
        currentPath !== '/join/verify-code' &&
        currentPath !== '/join/digilocker' && (
          <WebNavbar currentPath={currentPath} onNavigate={navigate} />
        )}

      {/* Main Responsive Web Content Area */}
      <main
        ref={mainRef}
        key={currentPath}
        className="page-transition-enter"
        style={{
          width: '100%',
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 5,
          boxSizing: 'border-box',
          overflow: isFullHeightChatMode ? 'hidden' : undefined,
          ...(isFullHeightChatMode
            ? {
                height: '100%',
                maxHeight: '100%',
              }
            : {}),
        }}
      >
        {renderActiveScreen(false, false)}
      </main>

      {/* Comprehensive Editorial Web Footer: Excluded from discover, mixers, elevate, matches, pickforme, afterhours, and full profile view */}
      {!isFullHeightChatMode &&
        currentPath !== '/join' &&
        currentPath !== '/login' &&
        currentPath !== '/join/verify-code' &&
        currentPath !== '/join/digilocker' &&
        currentPath !== '/discover' &&
        currentPath !== '/member/mixers' &&
        currentPath !== '/member/elevate' &&
        currentPath !== '/member/matches' &&
        currentPath !== '/member/blinddate' &&
        currentPath !== '/member/afterhours' &&
        currentPath !== '/member/profile' &&
        (!isMobile ||
          currentPath === '/' ||
          currentPath === '/overview' ||
          currentPath === '/join/profile' ||
          currentPath === '/member/you' ||
          currentPath === '/member/my-profile') && (
          <WebFooter onNavigate={(path) => navigate(path as RoutePath)} />
        )}

      {/* Luxury Minimalist Notification Toast Popup: only mounted for users with fully active membership */}
      {(membershipStatus === 'member' || membershipStatus === 'complimentary') && (
        <NotificationPopup onNavigate={(path) => navigate(path as RoutePath)} />
      )}

      {/* Learn How It Works Modal (Page 1) */}
      {learnModalOpen && (
        <ModalPortal>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
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
                fontSize: '26px',
                color: isDark ? '#FDF3F5' : '#462037',
                marginBottom: '8px',
              }}
            >
              How VennZ Works
            </h3>

            <p
              style={{
                fontSize: '16px',
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
                fontSize: '16.5px',
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
        </ModalPortal>
      )}
    </div>
  );
};

export default App;
