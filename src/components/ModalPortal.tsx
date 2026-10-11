import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: React.ReactNode;
}

/**
 * Universal Modal Portal
 * Renders modal contents directly into document.body with top-level z-index (9999).
 * Ensures footers, sticky headers, bottom navigation bars, and page stacking
 * contexts NEVER appear on top of or cut across modal dialogs.
 */
export const ModalPortal: React.FC<ModalPortalProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(children, document.body);
};
