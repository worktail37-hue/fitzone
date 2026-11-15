export interface FooterLinkItem {
  id: string;
  label: string;
  href: string;
}

export interface FooterSocialItem {
  id: 'instagram' | 'facebook' | 'youtube' | 'x';
  label: string;
  href: string;
}

export interface FooterContactItem {
  id: 'address' | 'phone' | 'email' | 'hours';
  label: string;
  value: string;
  href?: string;
}

export interface FooterData {
  brandName: string;
  brandBlurb: string;
  socials: FooterSocialItem[];
  quickLinksTitle: string;
  quickLinks: FooterLinkItem[];
  supportLinksTitle: string;
  supportLinks: FooterLinkItem[];
  contactTitle: string;
  contactItems: FooterContactItem[];
  copyright: string;
  legalLinks: {
    id: string;
    label: string;
    href: string;
  }[];
  backToTopAriaLabel: string;
}

export const FOOTER_DATA: FooterData = {
  brandName: 'FITZONE',
  brandBlurb:
    'Premier strength, conditioning, and recovery clubs engineered for athletes and everyday lifters pursuing measurable results.',
  socials: [
    {
      id: 'instagram',
      label: 'Follow FITZONE on Instagram',
      href: 'https://instagram.com',
    },
    {
      id: 'facebook',
      label: 'Follow FITZONE on Facebook',
      href: 'https://facebook.com',
    },
    {
      id: 'youtube',
      label: 'Subscribe to FITZONE on YouTube',
      href: 'https://youtube.com',
    },
    {
      id: 'x',
      label: 'Follow FITZONE on X',
      href: 'https://x.com',
    },
  ],
  quickLinksTitle: 'Quick Links',
  quickLinks: [
    { id: 'footer-about', label: 'About', href: '#about' },
    { id: 'footer-services', label: 'Services', href: '#services' },
    { id: 'footer-trainers', label: 'Trainers', href: '#trainers' },
    { id: 'footer-plans', label: 'Plans', href: '#plans' },
  ],
  supportLinksTitle: 'Support',
  supportLinks: [
    { id: 'footer-locations', label: 'Locations', href: '#locations' },
    { id: 'footer-gallery', label: 'Gallery', href: '#gallery' },
    { id: 'footer-faq', label: 'FAQ', href: '#faq' },
    { id: 'footer-contact', label: 'Contact', href: '#contact' },
  ],
  contactTitle: 'Contact',
  contactItems: [
    {
      id: 'address',
      label: 'Address',
      value: '740 Hudson Performance Ave, Suite 200, New York, NY 10014',
    },
    {
      id: 'phone',
      label: 'Phone',
      value: '+1 (555) 234-8910',
      href: 'tel:+15552348910',
    },
    {
      id: 'email',
      label: 'Email',
      value: 'concierge@fitzone.club',
      href: 'mailto:concierge@fitzone.club',
    },
    {
      id: 'hours',
      label: 'Opening Hours',
      value: '24/7 Member Access · Staffed Daily 5:00 AM – 11:00 PM',
    },
  ],
  copyright: '© 2026 FITZONE. All rights reserved.',
  legalLinks: [
    { id: 'privacy', label: 'Privacy Policy', href: '#contact' },
    { id: 'terms', label: 'Terms', href: '#contact' },
  ],
  backToTopAriaLabel: 'Back to top',
};
