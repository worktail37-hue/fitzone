import { motion, useReducedMotion } from 'motion/react';
import { CTA_DATA } from '../data/cta';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';

export interface CTAProps {
  onCtaClick?: () => void;
}

export function CTA({ onCtaClick }: CTAProps) {
  const prefersReducedMotion = useReducedMotion();

  const handleGetFreeTrial = () => {
    onCtaClick?.();
    const contactSection = document.getElementById(CTA_DATA.buttonTargetId);
    if (contactSection) {
      contactSection.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    }
  };

  return (
    <section
      id="cta"
      aria-labelledby="cta-section-heading"
      className="relative bg-midnight py-16 md:py-24 overflow-hidden"
    >
      <Container>
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.6, ease: 'easeOut' }
          }
          className="relative overflow-hidden rounded-3xl bg-slate-navy border border-cloud-border px-6 py-16 sm:px-12 md:py-24 text-center"
        >
          {/* Faint Signal Red Radial Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[320px] w-[520px] rounded-full bg-signal/15 blur-3xl"
          />

          <div className="relative z-10 mx-auto max-w-3xl flex flex-col items-center">
            <h2
              id="cta-section-heading"
              className="text-fluid-h2 font-display font-extrabold uppercase tracking-tight text-cloud leading-[1.06]"
            >
              {CTA_DATA.headingBefore}
              <span className="text-signal">{CTA_DATA.headingHighlight}</span>
              {CTA_DATA.headingAfter}
            </h2>

            <p className="mt-5 text-fluid-body-lg text-cloud-muted max-w-2xl leading-relaxed">
              {CTA_DATA.description}
            </p>

            <div className="mt-8">
              <Button
                variant="primary"
                size="lg"
                showArrow
                onClick={handleGetFreeTrial}
                className="hover:shadow-signal-glow"
              >
                {CTA_DATA.buttonLabel}
              </Button>
            </div>

            <p className="mt-4 text-xs sm:text-sm text-cloud-muted">
              {CTA_DATA.reassuranceText}
            </p>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

export default CTA;
