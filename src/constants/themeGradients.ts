/**
 * VennZ Luxury Theme Gradients
 * Matches the signature Elevate atmospheric background:
 * Transitions smoothly from dark to light in both dark theme and light theme,
 * with a luminous ambient bloom (dark-to-light depth).
 */

export const THEME_PAGE_GRADIENTS = {
  dark: {
    // Top-to-bottom dark-to-light gradient with Elevate-style ambient radial glow
    background:
      'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(161, 82, 95, 0.28) 0%, transparent 75%), linear-gradient(180deg, #0D0713 0%, #170E20 28%, #261325 65%, #180D1E 100%)',
    backgroundColor: '#140E1C',
    // Scrim overlay for screens with botanical wallpaper (Discover, Matches, Mixers, Chat)
    scrimGradient:
      'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(161, 82, 95, 0.28) 0%, transparent 75%), linear-gradient(180deg, rgba(13, 7, 19, 0.52) 0%, rgba(22, 13, 30, 0.40) 45%, rgba(38, 19, 37, 0.48) 100%)',
  },
  light: {
    // Top-to-bottom rich rose/mauve to porcelain blush gradient with Elevate-style luminous bloom
    background:
      'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(200, 120, 145, 0.24) 0%, transparent 75%), linear-gradient(180deg, #EAD5DA 0%, #F3E4E8 25%, #FAF1F3 65%, #FDF7F8 100%)',
    backgroundColor: '#FAF1F3',
    // Scrim overlay for screens with botanical wallpaper
    scrimGradient:
      'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(200, 120, 145, 0.22) 0%, transparent 75%), linear-gradient(180deg, rgba(234, 213, 218, 0.45) 0%, rgba(243, 228, 232, 0.35) 45%, rgba(250, 241, 243, 0.38) 100%)',
  },
};

export const getPageBackground = (isDark: boolean): string =>
  isDark ? THEME_PAGE_GRADIENTS.dark.background : THEME_PAGE_GRADIENTS.light.background;

export const getPageScrim = (isDark: boolean): string =>
  isDark ? THEME_PAGE_GRADIENTS.dark.scrimGradient : THEME_PAGE_GRADIENTS.light.scrimGradient;
