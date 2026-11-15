import { memo } from 'react';
import { useReducedMotion } from 'motion/react';
import {
  ArrowUp,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from 'lucide-react';
import { FOOTER_DATA, FooterContactItem, FooterSocialItem } from '../data/footer';
import { Container } from './ui/Container';

function FooterSocialIcon({ id }: { id: FooterSocialItem['id'] }) {
  if (id === 'instagram') {
    return <Instagram aria-hidden="true" className="h-4 w-4" />;
  }
  if (id === 'facebook') {
    return <Facebook aria-hidden="true" className="h-4 w-4" />;
  }
  if (id === 'youtube') {
    return <Youtube aria-hidden="true" className="h-4 w-4" />;
  }
  return <Twitter aria-hidden="true" className="h-4 w-4" />;
}

function FooterContactIcon({ id }: { id: FooterContactItem['id'] }) {
  if (id === 'address') {
    return <MapPin aria-hidden="true" className="h-4 w-4 text-signal shrink-0 mt-0.5" />;
  }
  if (id === 'phone') {
    return <Phone aria-hidden="true" className="h-4 w-4 text-signal shrink-0 mt-0.5" />;
  }
  if (id === 'email') {
    return <Mail aria-hidden="true" className="h-4 w-4 text-signal shrink-0 mt-0.5" />;
  }
  return <Clock aria-hidden="true" className="h-4 w-4 text-signal shrink-0 mt-0.5" />;
}

export const Footer = memo(function Footer() {
  const prefersReducedMotion = useReducedMotion();

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <footer className="bg-midnight border-t border-cloud-border text-cloud pt-16 pb-10">
      <Container>
        {/* 4-Column Main Footer Grid (4 on Desktop, 2 on Tablet, 1 on Mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-cloud-border">
          {/* Column 1: FITZONE Brand + 2-Line Blurb + Social Icons */}
          <div className="space-y-5">
            <a
              href="#top"
              className="inline-flex min-h-[44px] items-center font-display text-2xl font-extrabold uppercase tracking-tight text-cloud focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-sm"
            >
              {FOOTER_DATA.brandName}
            </a>

            <p className="text-sm text-cloud-muted leading-relaxed line-clamp-2">
              {FOOTER_DATA.brandBlurb}
            </p>

            <div className="flex items-center gap-2.5 pt-1">
              {FOOTER_DATA.socials.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-slate-navy border border-cloud-border text-cloud hover:border-signal hover:bg-signal transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
                >
                  <FooterSocialIcon id={social.id} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links (About, Services, Trainers, Plans) */}
          <div>
            <h2 className="font-display text-sm font-extrabold uppercase tracking-wider text-cloud mb-3">
              {FOOTER_DATA.quickLinksTitle}
            </h2>
            <ul className="space-y-1">
              {FOOTER_DATA.quickLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    className="inline-flex min-h-[44px] items-center text-sm text-cloud-muted hover:text-cloud transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support (Locations, Gallery, FAQ, Contact) */}
          <div>
            <h2 className="font-display text-sm font-extrabold uppercase tracking-wider text-cloud mb-3">
              {FOOTER_DATA.supportLinksTitle}
            </h2>
            <ul className="space-y-1">
              {FOOTER_DATA.supportLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    className="inline-flex min-h-[44px] items-center text-sm text-cloud-muted hover:text-cloud transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info (Address, Phone, Email, Opening Hours) */}
          <div>
            <h2 className="font-display text-sm font-extrabold uppercase tracking-wider text-cloud mb-3">
              {FOOTER_DATA.contactTitle}
            </h2>
            <ul className="space-y-2 text-sm text-cloud-muted">
              {FOOTER_DATA.contactItems.map((item) => (
                <li key={item.id} className="flex items-center gap-3 min-h-[44px]">
                  <FooterContactIcon id={item.id} />
                  <div className="min-w-0">
                    <span className="sr-only">{item.label}: </span>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="inline-flex min-h-[44px] items-center text-cloud-muted hover:text-cloud transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-sm break-words"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <span className="leading-relaxed">{item.value}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright Left, Privacy/Terms + Back to Top Button Right */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-cloud-muted">
          <p>{FOOTER_DATA.copyright}</p>

          <div className="flex items-center gap-4 sm:gap-6">
            {FOOTER_DATA.legalLinks.map((legal) => (
              <a
                key={legal.id}
                href={legal.href}
                className="inline-flex min-h-[44px] items-center px-2 text-cloud-muted hover:text-cloud transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-sm"
              >
                {legal.label}
              </a>
            ))}

            <button
              type="button"
              aria-label={FOOTER_DATA.backToTopAriaLabel}
              onClick={handleScrollToTop}
              className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-slate-navy border border-cloud-border text-cloud hover:border-signal hover:bg-signal transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal cursor-pointer shrink-0"
            >
              <ArrowUp aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Container>
    </footer>
  );
});
