import { useState, useEffect } from 'react';

/**
 * useIsMobile hook
 * 
 * Returns true ONLY for mobile devices (screen width < 768px).
 * Returns false for iPad, tablet, laptop, and PC (screen width >= 768px).
 * 
 * This ensures laptop, PC, and iPad view remain 100% unchanged.
 */
export const useIsMobile = (breakpoint = 768): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};
