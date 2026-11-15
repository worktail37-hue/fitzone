import { memo, useCallback, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Calendar, Dumbbell, Play, Star, Users } from 'lucide-react';
import { HERO_DATA } from '../data/hero';
import { useAnimationActive } from '../hooks/useAnimationActive';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { VideoModal } from '../components/ui/VideoModal';

export interface HeroProps {
  onJoinClick?: () => void;
  onVideoModalToggle?: (isOpen: boolean) => void;
}

export const Hero = memo(function Hero({ onJoinClick, onVideoModalToggle }: HeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const isLoopActive = useAnimationActive(sectionRef, 0.05);

  const [imageError, setImageError] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const watchVideoButtonRef = useRef<HTMLButtonElement | null>(null);

  const openVideoModal = () => {
    setIsVideoOpen(true);
    onVideoModalToggle?.(true);
  };

  const closeVideoModal = useCallback(() => {
    setIsVideoOpen(false);
    onVideoModalToggle?.(false);
  }, [onVideoModalToggle]);

  const handleJoinNow = () => {
    onJoinClick?.();
    const target = document.getElementById(HERO_DATA.primaryCta.targetId);
    target?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  const getFadeItemProps = (delaySeconds: number) => {
    if (prefersReducedMotion) {
      return {};
    }
    return {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      transition: {
        duration: 0.6,
        delay: delaySeconds,
        ease: 'easeOut' as const,
      },
    };
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-main-heading"
      className="relative min-h-[90vh] w-full flex items-center bg-midnight overflow-hidden py-10 sm:py-14 lg:py-20"
    >
      {/* Faint diagonal gradient from Deep Slate Navy */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-navy/65 via-midnight to-midnight"
      />

      {/* Subtle 5% opacity architectural grid & dot texture for depth */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05]"
      >
        <defs>
          <pattern
            id="fitzone-hero-grid"
            width="36"
            height="36"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.25" className="fill-cloud" />
            <path
              d="M 36 0 L 0 0 0 36"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-cloud"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#fitzone-hero-grid)" />
      </svg>

      {/* Soft radial Signal Red glow (15-20% opacity) behind the athlete visual */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-[380px] w-[380px] sm:h-[520px] sm:w-[520px] rounded-full bg-signal/18 blur-3xl"
      />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* LEFT COLUMN: Content (Stacked first on mobile) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* 1. Small Pill Badge (0.0s delay) */}
            <motion.div {...getFadeItemProps(0)}>
              <div className="inline-flex items-center gap-2.5 rounded-full bg-slate-navy border border-cloud-border px-4 py-1.5 mb-6">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-signal shrink-0"
                />
                <span className="font-display text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] text-cloud">
                  {HERO_DATA.badgeText}
                </span>
              </div>
            </motion.div>

            {/* 2. H1 Heading in Uppercase Montserrat 800 with "LIMITS" in Signal Red (0.1s delay) */}
            <motion.div {...getFadeItemProps(0.1)} className="w-full">
              <h1
                id="hero-main-heading"
                className="font-display font-extrabold uppercase text-cloud tracking-tight leading-[1.04] text-[clamp(2.15rem,4.8vw+0.75rem,4.35rem)] max-w-2xl mb-5"
              >
                {HERO_DATA.headingBefore}
                <span className="text-signal">{HERO_DATA.headingHighlight}</span>
                {HERO_DATA.headingAfter}
              </h1>
            </motion.div>

            {/* 3. Short Paragraph (max 2 lines on desktop, 0.2s delay) */}
            <motion.div {...getFadeItemProps(0.2)} className="w-full">
              <p className="text-fluid-body-lg text-cloud-muted max-w-xl leading-relaxed sm:line-clamp-2 mb-8">
                {HERO_DATA.description}
              </p>
            </motion.div>

            {/* 4. Action Buttons: Primary Red "Join Now" + Outline "Watch Video" (0.3s delay) */}
            <motion.div
              {...getFadeItemProps(0.3)}
              className="flex flex-wrap items-center gap-4 mb-9 w-full sm:w-auto"
            >
              <Button
                variant="primary"
                size="lg"
                showArrow
                onClick={handleJoinNow}
                className="w-full sm:w-auto hover:-translate-y-0.5 hover:shadow-signal-glow"
              >
                {HERO_DATA.primaryCta.label}
              </Button>

              <button
                ref={watchVideoButtonRef}
                type="button"
                aria-label={HERO_DATA.secondaryCta.ariaLabel}
                aria-haspopup="dialog"
                aria-expanded={isVideoOpen}
                onClick={openVideoModal}
                className="group inline-flex w-full sm:w-auto min-h-[52px] items-center justify-center gap-3 rounded-xl bg-slate-navy/70 border border-cloud-border px-6 py-3 font-display text-base font-bold uppercase tracking-wider text-cloud whitespace-nowrap shrink-0 cursor-pointer transition-[transform,border-color,background-color,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:border-signal hover:bg-slate-navy hover:shadow-signal-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-midnight"
              >
                <span
                  aria-hidden="true"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-signal text-cloud shrink-0 transition-transform duration-150 ease-out group-hover:scale-105"
                >
                  <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                </span>
                <span>{HERO_DATA.secondaryCta.label}</span>
              </button>
            </motion.div>

            {/* 5. Social Proof Row: 3 overlapping avatars, 5 red stars, "12K+ happy members" (0.4s delay) */}
            <motion.div
              {...getFadeItemProps(0.4)}
              className="flex flex-wrap items-center gap-4 mb-8"
            >
              <div className="flex items-center -space-x-2.5" aria-hidden="true">
                {(HERO_DATA.socialProof.avatars ?? []).map((avatar, index) => (
                  <div
                    key={avatar.id}
                    title={avatar.label}
                    className={[
                      'inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-midnight font-display text-xs font-extrabold uppercase text-cloud',
                      index === 1 ? 'bg-signal' : 'bg-slate-navy',
                    ].join(' ')}
                  >
                    {avatar.initials}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <div
                  className="flex items-center gap-1"
                  aria-label={HERO_DATA.socialProof.ratingAriaLabel}
                  role="img"
                >
                  {Array.from({ length: HERO_DATA.socialProof.ratingStars }).map((_, idx) => (
                    <Star
                      key={idx}
                      aria-hidden="true"
                      className="h-4 w-4 text-signal fill-current"
                    />
                  ))}
                </div>
                <p className="text-sm text-cloud-muted">
                  <span className="font-display font-bold text-cloud tabular-nums">
                    {HERO_DATA.socialProof.summaryScore}
                  </span>{' '}
                  {HERO_DATA.socialProof.summaryText}
                </p>
              </div>
            </motion.div>

            {/* 6. Row of 6 Small Pill Tags (0.5s delay) */}
            <motion.div {...getFadeItemProps(0.5)} className="w-full">
              <ul
                aria-label={HERO_DATA.tagsLabel}
                className="flex flex-wrap items-center gap-2"
              >
                {(HERO_DATA.tags ?? []).map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-slate-navy border border-cloud-border px-3.5 py-1.5 text-xs font-medium text-cloud whitespace-nowrap"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: High-Contrast Athlete Visual + Floating Glass Cards (0.3s delay) */}
          <div className="lg:col-span-5 relative w-full max-w-lg mx-auto lg:max-w-none">
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
              className="relative"
            >
              {/* Main Athlete Image Container (LCP Image: fetchPriority="high") */}
              <div className="relative overflow-hidden rounded-3xl border border-cloud-border bg-slate-navy aspect-[4/5] w-full">
                {!imageError ? (
                  <img
                    src={HERO_DATA.image.src}
                    alt={HERO_DATA.image.alt}
                    width={HERO_DATA.image.width}
                    height={HERO_DATA.image.height}
                    fetchPriority="high"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div
                    role="img"
                    aria-label={HERO_DATA.image.alt}
                    className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-slate-navy via-midnight to-slate-navy"
                  >
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-midnight/80 border border-cloud-border mb-5">
                      <Dumbbell aria-hidden="true" className="h-10 w-10 text-signal" />
                    </div>
                    <p className="font-display text-lg font-extrabold uppercase tracking-wider text-cloud">
                      {HERO_DATA.image.fallbackLabel}
                    </p>
                    <p className="text-sm text-cloud-muted mt-1">
                      {HERO_DATA.image.fallbackSubtext}
                    </p>
                  </div>
                )}

                {/* Navy-to-transparent gradient overlay at the bottom */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-midnight via-midnight/35 to-transparent"
                />
              </div>

              {/* Floating Glass Cards Overlapping Image Edges (Paused when off-screen or tab hidden) */}
              {(HERO_DATA.floatingStats ?? []).map((stat, idx) => {
                const isTopLeft = stat.position === 'top-left';
                const positionClasses = isTopLeft
                  ? 'top-4 left-3 sm:top-8 sm:-left-5'
                  : 'bottom-5 right-3 sm:bottom-8 sm:-right-5';

                return (
                  <motion.div
                    key={stat.id}
                    animate={isLoopActive ? { y: [0, -8, 0] } : { y: 0 }}
                    transition={
                      isLoopActive
                        ? {
                            duration: 4,
                            delay: idx * 0.8,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }
                        : { duration: 0.2 }
                    }
                    className={`absolute ${positionClasses} z-20 flex items-center gap-3 rounded-2xl bg-slate-navy/85 backdrop-blur-md border border-cloud-border px-4 py-3 shadow-xl`}
                  >
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-midnight/80 border border-cloud-border shrink-0">
                      {isTopLeft ? (
                        <Users aria-hidden="true" className="h-5 w-5 text-signal" />
                      ) : (
                        <Calendar aria-hidden="true" className="h-5 w-5 text-signal" />
                      )}
                    </div>
                    <div>
                      <p className="font-display text-lg sm:text-xl font-extrabold uppercase leading-none text-signal tabular-nums">
                        {stat.value}
                      </p>
                      <p className="text-xs font-medium text-cloud mt-1 whitespace-nowrap">
                        {stat.label}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </Container>

      {/* Shared Accessible Video Modal */}
      <VideoModal
        isOpen={isVideoOpen}
        onClose={closeVideoModal}
        triggerRef={watchVideoButtonRef}
        onPrimaryAction={handleJoinNow}
      />
    </section>
  );
});

export default Hero;
