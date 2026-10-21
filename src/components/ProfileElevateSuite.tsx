import React from 'react';
import { Page17ElevateScreen } from './Page17ElevateScreen';

export interface ProfileElevateSuiteProps {
  onApplyBioDraft?: (newBio: string) => void;
  onUpgradeToMembership?: () => void;
  onNavigateHelp?: () => void;
}

/**
 * ProfileElevateSuite
 * Integrates the full Elevate capabilities into the member's Profile experience:
 * - Profile Scorecard / Intelligence metrics & telemetry
 * - Makeover Studio with Suggested Bio Draft & direct bio application
 * - Editorial service offerings & custom service checkout
 * - Orders tracking & refund management (available for membership members)
 */
export const ProfileElevateSuite: React.FC<ProfileElevateSuiteProps> = ({
  onApplyBioDraft,
  onUpgradeToMembership,
  onNavigateHelp,
}) => {
  return (
    <div
      style={{
        width: '100%',
        marginTop: '8px',
      }}
    >
      <Page17ElevateScreen
        embedded={true}
        onApplyBioDraft={onApplyBioDraft}
        onUpgradeToMembership={onUpgradeToMembership}
        onNavigateHelp={onNavigateHelp}
        showStatusBar={false}
        showHomeIndicator={false}
      />
    </div>
  );
};
