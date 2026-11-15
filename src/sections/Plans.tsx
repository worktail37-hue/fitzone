import { useMemo } from 'react';
import { useReducedMotion } from 'motion/react';
import { Check } from 'lucide-react';
import { PLANS_DATA, PlanTier } from '../data/plans';
import SocialCards, { CardItem } from '@/components/ui/card-fan-carousel';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Container } from '../components/ui/Container';
import { Reveal } from '../components/ui/Reveal';
import { SectionHeading } from '../components/ui/SectionHeading';

export interface PlansProps {
  onSelectPlan?: (plan: PlanTier) => void;
}

export function Plans({ onSelectPlan }: PlansProps) {
  const prefersReducedMotion = useReducedMotion();

  const handleGetStarted = (plan: PlanTier) => {
    onSelectPlan?.(plan);
    const contactSection = document.getElementById(plan.ctaTargetId);
    if (contactSection) {
      contactSection.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    }
  };

  const fanCards = useMemo<CardItem[]>(
    () =>
      PLANS_DATA.tiers.map((tier) => ({
        id: tier.id,
        mobileOrderClass: tier.mobileOrderClass,
        content: (
          <Card
            as="article"
            className={[
              'relative w-full flex flex-col justify-between p-7 sm:p-8',
              'transition-[border-color,box-shadow] duration-250 ease-out',
              tier.featured
                ? 'border-signal shadow-signal-glow hover:border-signal'
                : 'border-cloud-border hover:border-signal/50 hover:shadow-signal-glow',
            ].join(' ')}
          >
            <div>
              {/* Card Header Row: Plan Name + Optional MOST POPULAR Badge */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="font-display text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-cloud">
                  {tier.name}
                </h3>

                {tier.featured && tier.popularBadge && (
                  <span className="inline-block rounded-full bg-signal px-3.5 py-1 font-display text-[11px] font-bold uppercase tracking-wider text-cloud whitespace-nowrap">
                    {tier.popularBadge}
                  </span>
                )}
              </div>

              {/* Tagline */}
              <p className="text-sm text-cloud-muted mb-6">{tier.tagline}</p>

              {/* Price Block */}
              <div className="pb-6 mb-6 border-b border-cloud-border flex items-baseline gap-1.5">
                <span className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-cloud tabular-nums">
                  {tier.price}
                </span>
                <span className="text-sm font-medium text-cloud-muted">
                  {tier.period}
                </span>
              </div>

              {/* Feature List */}
              <ul className="space-y-3.5 mb-8">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm sm:text-base text-cloud"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-signal-surface text-signal"
                    >
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Full-Width Get Started CTA */}
            <Button
              variant={tier.featured ? 'primary' : 'outline'}
              size="md"
              showArrow
              onClick={() => handleGetStarted(tier)}
              className="w-full"
            >
              {tier.ctaLabel}
            </Button>
          </Card>
        ),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prefersReducedMotion, onSelectPlan]
  );

  return (
    <section
      id="plans"
      aria-labelledby="plans-section-heading"
      className="relative bg-midnight py-20 md:py-28 overflow-hidden scroll-mt-24"
    >
      <Container>
        {/* Centered SectionHeading */}
        <Reveal>
          <SectionHeading
            id="plans-section-heading"
            as="h2"
            align="center"
            eyebrow={PLANS_DATA.eyebrow}
            titleBefore={PLANS_DATA.headingBefore}
            titleHighlight={PLANS_DATA.headingHighlight}
            titleAfter={PLANS_DATA.headingAfter}
          />
        </Reveal>

        {/* 3 Subscription Cards with GSAP Card-Fan Entrance & Elastic Hover Spread */}
        <div className="mt-12 md:mt-16">
          <SocialCards cards={fanCards} />
        </div>
      </Container>
    </section>
  );
}

export default Plans;
