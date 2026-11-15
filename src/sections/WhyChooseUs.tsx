import { memo, useState } from 'react';
import { Dumbbell, Star } from 'lucide-react';
import { WHY_CHOOSE_US_DATA, WhyChooseUsItem } from '../data/whyChooseUs';
import { Accordion } from '../components/ui/Accordion';
import { Container } from '../components/ui/Container';
import { Reveal } from '../components/ui/Reveal';
import { SectionHeading } from '../components/ui/SectionHeading';

export interface WhyChooseUsProps {
  onAccordionChange?: (item: WhyChooseUsItem) => void;
}

export const WhyChooseUs = memo(function WhyChooseUs({
  onAccordionChange,
}: WhyChooseUsProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <section
      id="why-us"
      aria-labelledby="why-choose-us-heading"
      className="relative bg-midnight py-20 md:py-28 overflow-hidden scroll-mt-24"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* LEFT COLUMN: Tall Rounded-3xl Athlete Image + Floating Rating Glass Card (Stacked First on Mobile) */}
          <div className="lg:col-span-5">
            <Reveal direction="left">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-cloud-border bg-slate-navy">
                  {!imageError ? (
                    <img
                      src={WHY_CHOOSE_US_DATA.image.src}
                      alt={WHY_CHOOSE_US_DATA.image.alt}
                      width={WHY_CHOOSE_US_DATA.image.width}
                      height={WHY_CHOOSE_US_DATA.image.height}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      onError={() => setImageError(true)}
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <div
                      role="img"
                      aria-label={WHY_CHOOSE_US_DATA.image.alt}
                      className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-slate-navy via-midnight to-slate-navy"
                    >
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-midnight/80 border border-cloud-border mb-4">
                        <Dumbbell aria-hidden="true" className="h-8 w-8 text-signal" />
                      </div>
                      <p className="font-display text-base sm:text-lg font-extrabold uppercase tracking-wider text-cloud">
                        {WHY_CHOOSE_US_DATA.image.fallbackTitle}
                      </p>
                      <p className="text-xs sm:text-sm text-cloud-muted mt-1">
                        {WHY_CHOOSE_US_DATA.image.fallbackSubtitle}
                      </p>
                    </div>
                  )}

                  {/* Navy Gradient Overlay */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-midnight via-midnight/35 to-transparent"
                  />
                </div>

                {/* Floating Deep Slate Navy Glass Card on Image Corner: "4.9/5 Member Rating" with 5 Red Stars */}
                <div
                  aria-label={WHY_CHOOSE_US_DATA.ratingBadge.ariaLabel}
                  className="absolute bottom-5 left-4 sm:bottom-7 sm:left-6 z-20 flex items-center gap-3.5 rounded-2xl bg-slate-navy/90 backdrop-blur-md border border-cloud-border px-4 py-3.5 shadow-xl"
                >
                  <div>
                    <div className="flex items-center gap-1 mb-1" aria-hidden="true">
                      {Array.from({ length: WHY_CHOOSE_US_DATA.ratingBadge.stars }).map(
                        (_, starIdx) => (
                          <Star
                            key={starIdx}
                            className="h-3.5 w-3.5 text-signal fill-current"
                          />
                        )
                      )}
                    </div>
                    <p className="font-display text-lg sm:text-xl font-extrabold uppercase tracking-tight text-cloud tabular-nums">
                      <span className="text-signal">{WHY_CHOOSE_US_DATA.ratingBadge.score}</span>{' '}
                      <span className="text-sm font-bold text-cloud">
                        {WHY_CHOOSE_US_DATA.ratingBadge.label}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* RIGHT COLUMN: SectionHeading + Shared 4-Item Single-Open Accessible Accordion */}
          <div className="lg:col-span-7">
            <Reveal direction="right">
              <SectionHeading
                id="why-choose-us-heading"
                as="h2"
                eyebrow={WHY_CHOOSE_US_DATA.eyebrow}
                titleBefore={WHY_CHOOSE_US_DATA.headingBefore}
                titleHighlight={WHY_CHOOSE_US_DATA.headingHighlight}
                titleAfter={WHY_CHOOSE_US_DATA.headingAfter}
              />

              <Accordion
                items={WHY_CHOOSE_US_DATA.items}
                ariaLabel={WHY_CHOOSE_US_DATA.accordionAriaLabel}
                defaultOpenId={WHY_CHOOSE_US_DATA.items[0]?.id ?? null}
                allowAllClosed={false}
                idPrefix="why-us-accordion"
                className="mt-8 sm:mt-10"
                onItemChange={(item) => onAccordionChange?.(item)}
              />
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
});

export default WhyChooseUs;
