export interface NavLinkItem {
  id: string;
  label: string;
  href: string;
}

export const SITE_NAVIGATION: {
  brandName: string;
  skipToContentLabel: string;
  links: NavLinkItem[];
  ctaLabel: string;
  ctaHref: string;
  mobileMenuAriaOpen: string;
  mobileMenuAriaClose: string;
} = {
  brandName: 'FITZONE',
  skipToContentLabel: 'Skip to main content',
  links: [
    { id: 'about', label: 'About', href: '#about' },
    { id: 'services', label: 'Services', href: '#services' },
    { id: 'plans', label: 'Plans', href: '#plans' },
    { id: 'locations', label: 'Locations', href: '#locations' },
    { id: 'faq', label: 'FAQ', href: '#faq' },
  ],
  ctaLabel: 'Free Trial',
  ctaHref: '#contact',
  mobileMenuAriaOpen: 'Open navigation menu',
  mobileMenuAriaClose: 'Close navigation menu',
};

export const ERROR_BOUNDARY_DATA = {
  eyebrow: 'System Recovery Mode',
  headingBefore: 'INTERRUPTED ',
  headingHighlight: 'TRAINING',
  headingAfter: ' SESSION',
  description:
    'An unexpected rendering issue occurred inside this view. Your session data remains safe—reload the interface to return to FITZONE.',
  retryLabel: 'Reload FITZONE Interface',
} as const;
