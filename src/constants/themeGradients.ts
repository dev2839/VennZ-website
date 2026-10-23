/**
 * VennZ Luxury Theme Gradients
 * Matches the signature dark purplish-plum tone from the logo & welcome experience:
 * Deep, elegant obsidian plum undertones sampled directly from the splash logo screen.
 */

export const THEME_PAGE_GRADIENTS = {
  dark: {
    // Exact signature luxury dark plum ambient gradient from the splash logo screen:
    background:
      'radial-gradient(ellipse at 50% 16%, rgba(70, 32, 55, 0.45) 0%, rgba(104, 58, 70, 0.22) 40%, rgba(20, 14, 28, 0.98) 90%), #140E1C',
    backgroundColor: '#140E1C',
    scrimGradient:
      'radial-gradient(ellipse at 50% 16%, rgba(70, 32, 55, 0.25) 0%, rgba(20, 14, 28, 0.7) 90%)',
  },
  light: {
    background:
      'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(200, 120, 145, 0.24) 0%, transparent 75%), linear-gradient(180deg, #EAD5DA 0%, #F3E4E8 25%, #FAF1F3 65%, #FDF7F8 100%)',
    backgroundColor: '#FAF1F3',
    scrimGradient:
      'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(200, 120, 145, 0.22) 0%, transparent 75%), linear-gradient(180deg, rgba(234, 213, 218, 0.45) 0%, rgba(243, 228, 232, 0.35) 45%, rgba(250, 241, 243, 0.38) 100%)',
  },
};

export const getPageBackground = (isDark: boolean): string =>
  isDark ? THEME_PAGE_GRADIENTS.dark.background : THEME_PAGE_GRADIENTS.light.background;

export const getPageScrim = (isDark: boolean): string =>
  isDark ? THEME_PAGE_GRADIENTS.dark.scrimGradient : THEME_PAGE_GRADIENTS.light.scrimGradient;
