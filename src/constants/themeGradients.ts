/**
 * VennZ Luxury Theme Gradients
 * Matches the signature dark purplish obsidian tone from the logo & welcome experience:
 * Deep, elegant purple/plum undertones with a subtle, gentle gradient ("little gradient not much").
 */

export const THEME_PAGE_GRADIENTS = {
  dark: {
    // Darker, rich purplish-plum tone matching the logo page with a soft, subtle gradient
    background:
      'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(37, 1, 22, 0.84) 0%, rgba(14, 0, 18, 0.73) 50%, transparent 80%), linear-gradient(180deg, #180D22 0%, #150B1E 50%, #120919 100%)',
    backgroundColor: '#1a001d',
    // Scrim overlay for screens with botanical wallpaper (Discover, Matches, Mixers, Chat)
    scrimGradient:
      'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(70, 32, 55, 0.28) 0%, rgba(45, 18, 36, 0.12) 50%, transparent 80%), linear-gradient(180deg, rgba(24, 13, 34, 0.65) 0%, rgba(21, 11, 30, 0.55) 50%, rgba(18, 9, 25, 0.62) 100%)',
  },
  light: {
    // Top-to-bottom rich rose/mauve to porcelain blush gradient with luminous bloom
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
