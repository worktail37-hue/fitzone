import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { SITE_NAVIGATION } from '../data/siteData';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { Button } from './ui/Button';
import { Container } from './ui/Container';

export interface NavbarProps {
  onSelectSection?: (sectionId: string) => void;
  onFreeTrialClick?: () => void;
}

export function Navbar({ onSelectSection, onFreeTrialClick }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobilePanelRef = useRef<HTMLDivElement | null>(null);
  const mobileToggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  useFocusTrap(mobilePanelRef, isMobileMenuOpen, closeMobileMenu, mobileToggleButtonRef);

  const handleNavClick = (sectionId: string) => {
    closeMobileMenu();
    onSelectSection?.(sectionId);
  };

  const handleTrialClick = () => {
    closeMobileMenu();
    onFreeTrialClick?.();
  };

  return (
    <header className="sticky top-3 z-40 w-full pt-1">
      <Container>
        <div className="relative">
          {/* Sticky Floating Pill-Shaped Navbar */}
          <div className="flex items-center justify-between gap-8 rounded-full bg-slate-navy/75 backdrop-blur-md border border-cloud-border px-5 py-3 sm:px-7">
            {/* Zone 1: Brand Title (single text element) */}
            <a
              href="#top"
              onClick={() => handleNavClick('top')}
              className="inline-flex min-h-[44px] items-center font-display text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-cloud whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-md"
            >
              {SITE_NAVIGATION.brandName}
            </a>

            {/* Zone 2: Desktop Navigation Links (5 concise single-line links) */}
            <nav
              aria-label="Primary navigation"
              className="hidden md:flex items-center gap-7"
            >
              {SITE_NAVIGATION.links.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => handleNavClick(item.id)}
                  className="relative inline-flex min-h-[44px] items-center py-1 text-sm font-medium text-cloud-muted hover:text-cloud transition-colors duration-150 whitespace-nowrap shrink-0 after:content-[''] after:absolute after:left-0 after:bottom-2 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-signal after:transition-transform after:duration-150 hover:after:scale-x-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-sm"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Zone 3: Primary Action + Mobile Menu Trigger */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden md:block">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleTrialClick}
                >
                  {SITE_NAVIGATION.ctaLabel}
                </Button>
              </div>

              <button
                ref={mobileToggleButtonRef}
                type="button"
                aria-label={
                  isMobileMenuOpen
                    ? SITE_NAVIGATION.mobileMenuAriaClose
                    : SITE_NAVIGATION.mobileMenuAriaOpen
                }
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation-panel"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="inline-flex md:hidden h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-cloud-border bg-midnight/60 text-cloud hover:border-signal transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal cursor-pointer"
              >
                {isMobileMenuOpen ? (
                  <X aria-hidden="true" className="h-5 w-5" />
                ) : (
                  <Menu aria-hidden="true" className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Animated Slide-Down Panel with Focus Trap */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                id="mobile-navigation-panel"
                ref={mobilePanelRef}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation menu"
                initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0, y: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-slate-navy/95 backdrop-blur-lg border border-cloud-border p-5 md:hidden"
              >
                <nav aria-label="Mobile primary navigation" className="flex flex-col gap-1">
                  {SITE_NAVIGATION.links.map((item) => (
                    <a
                      key={item.id}
                      href={item.href}
                      onClick={() => handleNavClick(item.id)}
                      className="flex min-h-[48px] items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-cloud hover:bg-midnight/60 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
                    >
                      <span>{item.label}</span>
                    </a>
                  ))}
                </nav>

                <div className="mt-4 pt-4 border-t border-cloud-border">
                  <Button
                    variant="primary"
                    size="md"
                    showArrow
                    className="w-full"
                    onClick={handleTrialClick}
                  >
                    {SITE_NAVIGATION.ctaLabel}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Container>
    </header>
  );
}
