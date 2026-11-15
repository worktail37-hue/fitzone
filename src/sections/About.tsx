import { memo, useCallback, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Dumbbell, Play } from 'lucide-react';
import { ABOUT_DATA, AboutStatItem } from '../data/about';
import { useAnimationActive } from '../hooks/useAnimationActive';
import { useCountUp } from '../hooks/useCountUp';
import { Card } from '../components/ui/Card';
import { Container } from '../components/ui/Container';
import { Reveal } from '../components/ui/Reveal';
import { SectionHeading } from '../components/ui/SectionHeading';
import { VideoModal } from '../components/ui/VideoModal';

interface StatCardProps {
  stat: AboutStatItem;
  delay: number;
}

const StatCard = memo(function StatCard({ stat, delay }: StatCardProps) {
  const { count, elementRef } = useCountUp<HTMLDivElement>({
    target: stat.target,
    durationMs: 2000,
  });

  return (
    <Reveal delay={delay} className="h-full">
      <div ref={elementRef} className="h-full">
        <Card
          aria-label={stat.ariaLabel}
          className="h-full flex flex-col justify-center items-center md:items-start text-center md:text-left p-6 sm:p-7 transition-[transform,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-signal/40"
        >
          <span className="sr-only">{stat.ariaLabel}</span>
          <p
            aria-hidden="true"
            className="font-display font-extrabold uppercase text-signal leading-none tracking-tight tabular-nums min-w-[4.5ch] text-[clamp(2rem,3.6vw+0.75rem,3.5rem)]"
          >
            {count}
            {stat.suffix}
          </p>
          <p
            aria-hidden="true"
            className="mt-2.5 text-sm sm:text-base font-medium text-cloud"
          >
            {stat.label}
          </p>
        </Card>
      </div>
    </Reveal>
  );
});

export interface AboutProps {
  onVideoModalToggle?: (isOpen: boolean) => void;
  onPrimaryCtaClick?: () => void;
}

export const About = memo(function About({
  onVideoModalToggle,
  onPrimaryCtaClick,
}: AboutProps) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const isPulseActive = useAnimationActive(sectionRef, 0.05);

  const [imageError, setImageError] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const playButtonRef = useRef<HTMLButtonElement | null>(null);

  const openVideoModal = () => {
    setIsVideoOpen(true);
    onVideoModalToggle?.(true);
  };

  const closeVideoModal = useCallback(() => {
    setIsVideoOpen(false);
    onVideoModalToggle?.(false);
  }, [onVideoModalToggle]);

  const handleModalPrimaryAction = () => {
    onPrimaryCtaClick?.();
    const plansSection = document.getElementById('plans');
    plansSection?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <section
      id="about"
      ref={sectionRef}
      aria-labelledby="about-section-heading"
      className="relative bg-midnight py-20 md:py-28 overflow-hidden scroll-mt-24"
    >
      {/* Decorative Diagonal Signal Red Lightning Silhouette at 4.5% Opacity on Right Edge */}
      <svg
        aria-hidden="true"
        viewBox="0 0 480 800"
        fill="none"
        className="pointer-events-none absolute -right-16 top-1/2 -translate-y-1/2 h-[110%] w-auto max-w-none text-signal opacity-[0.045]"
      >
        <path
          d="M320 0L80 430H250L140 800L460 330H285L320 0Z"
          fill="currentColor"
        />
      </svg>

      <Container className="relative z-10">
        {/* Top Block: Centered on Mobile, Left-Aligned on Desktop */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left max-w-3xl">
          <Reveal delay={0}>
            <SectionHeading
              id="about-section-heading"
              as="h2"
              eyebrow={ABOUT_DATA.eyebrow}
              titleBefore={ABOUT_DATA.headingBefore}
              titleHighlight={ABOUT_DATA.headingHighlight}
              titleAfter={ABOUT_DATA.headingAfter}
              className="items-center text-center md:items-start md:text-left"
            />
          </Reveal>

          <Reveal delay={0.1} className="mt-4">
            <p className="text-fluid-body-lg text-cloud-muted leading-relaxed md:line-clamp-3">
              {ABOUT_DATA.description}
            </p>
          </Reveal>
        </div>

        {/* Statistics Row: 4 Columns on Desktop, 2 Columns on Mobile */}
        <div
          role="region"
          aria-label={ABOUT_DATA.statsAriaLabel}
          className="mt-12 md:mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {(ABOUT_DATA.stats ?? []).map((stat, idx) => (
            <StatCard key={stat.id} stat={stat} delay={idx * 0.1} />
          ))}
        </div>

        {/* Wide Rounded-3xl Video Feature Block */}
        <Reveal delay={0.3} className="mt-12 md:mt-16">
          <div className="relative overflow-hidden rounded-3xl border border-cloud-border bg-slate-navy aspect-[16/9] sm:aspect-[21/9] min-h-[260px] w-full group">
            {!imageError ? (
              <img
                src={ABOUT_DATA.videoFeature.imageSrc}
                alt={ABOUT_DATA.videoFeature.imageAlt}
                width={ABOUT_DATA.videoFeature.width}
                height={ABOUT_DATA.videoFeature.height}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              />
            ) : (
              <div
                role="img"
                aria-label={ABOUT_DATA.videoFeature.imageAlt}
                className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-slate-navy via-midnight to-slate-navy"
              >
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-midnight/80 border border-cloud-border mb-4">
                  <Dumbbell aria-hidden="true" className="h-8 w-8 text-signal" />
                </div>
                <p className="font-display text-base sm:text-lg font-extrabold uppercase tracking-wider text-cloud">
                  {ABOUT_DATA.videoFeature.fallbackTitle}
                </p>
                <p className="text-xs sm:text-sm text-cloud-muted mt-1">
                  {ABOUT_DATA.videoFeature.fallbackSubtitle}
                </p>
              </div>
            )}

            {/* Navy Gradient Overlay */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-midnight via-midnight/45 to-midnight/20"
            />

            {/* Centered Circular Signal Red Play Button with Soft Pulsing Ring (Paused offscreen/tab-hidden) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <div className="relative inline-flex items-center justify-center">
                {isPulseActive && (
                  <motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-full bg-signal/45"
                    animate={{ scale: [1, 1.45, 1], opacity: [0.55, 0, 0.55] }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}

                <button
                  ref={playButtonRef}
                  type="button"
                  aria-label={ABOUT_DATA.videoFeature.playButtonAriaLabel}
                  aria-haspopup="dialog"
                  aria-expanded={isVideoOpen}
                  onClick={openVideoModal}
                  className="relative z-10 inline-flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-signal text-cloud hover:bg-signal-hover hover:shadow-signal-glow transition-[transform,background-color,box-shadow] duration-150 ease-out hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud focus-visible:ring-offset-2 focus-visible:ring-offset-midnight cursor-pointer"
                >
                  <Play aria-hidden="true" className="h-7 w-7 sm:h-8 sm:w-8 fill-current ml-1" />
                </button>
              </div>
            </div>

            {/* Bottom Caption Strip */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 hidden sm:flex items-end justify-between gap-4 p-6 lg:p-8">
              <div>
                <p className="font-display text-sm lg:text-base font-extrabold uppercase tracking-wider text-cloud">
                  {ABOUT_DATA.videoFeature.captionTitle}
                </p>
                <p className="text-xs lg:text-sm text-cloud-muted mt-0.5">
                  {ABOUT_DATA.videoFeature.captionSubtitle}
                </p>
              </div>
              <span className="font-display text-xs font-bold uppercase tracking-widest text-cloud shrink-0">
                {ABOUT_DATA.videoFeature.durationBadge}
              </span>
            </div>
          </div>
        </Reveal>
      </Container>

      {/* Reused Accessible Video Modal */}
      <VideoModal
        isOpen={isVideoOpen}
        onClose={closeVideoModal}
        triggerRef={playButtonRef}
        onPrimaryAction={handleModalPrimaryAction}
      />
    </section>
  );
});

export default About;
