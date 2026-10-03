import React from 'react';

export interface MemberTopBarProps {
  onConciergeClick?: () => void;
  onLogoClick?: () => void;
}

/**
 * MemberTopBar is preserved for backwards compatibility.
 * In the responsive web edition, WebNavbar provides universal,
 * responsive top-level navigation, notifications, and theme controls.
 */
export const MemberTopBar: React.FC<MemberTopBarProps> = () => {
  return null;
};
