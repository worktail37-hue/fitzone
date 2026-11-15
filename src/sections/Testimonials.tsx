import { useCallback, useEffect, useRef, useState } from 'react';
import { PanInfo, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Pause, Play, Quote, Star } from 'lucide-react';
import { TESTIMONIALS_DATA, TestimonialItem } from '../data/testimonials';
import { Card } from '../components/ui/Card';
import { Container } from '../components/ui/Container';
import { Reveal } from '../components/ui/Reveal';
import { SectionHeading } from '../components/ui/SectionHeading';

export interface TestimonialsProps {
  onSlideChange?: (item: TestimonialItem, index: number) => void;
}

const GAP_PX = 24;
const AUTOPLAY_INTERVAL_MS = 6000;
const SWIPE_THRESHOLD_PX = 45;

export function Testimonials({ onSlideChange }: TestimonialsProps) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const totalSlides = TESTIMONIALS_DATA.items.length;

  const [cardsPerView, setCardsPerView] = useState<number>(3);
  const [viewportWidth, setViewportWidth] = useState<number>(1120);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [brokenAvatars, setBrokenAvatars] = useState<Record<string, boolean>>({});

  // Autoplay pause condition states
  const [isPausedByUser, setIsPausedByUser] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isFocusedWithin, setIsFocusedWithin] = useState<boolean>(false);
  const [isTouching, setIsTouching] = useState<boolean>(false);
  const [isTabHidden, setIsTabHidden] = useState<boolean>(false);
  const [isSectionInView, setIsSectionInView] = useState<boolean>(false);

  const maxIndex = Math.max(0, totalSlides - cardsPerView);

  // Recalculate viewport width and cardsPerView via ResizeObserver
  useEffect(() => {
    const viewportEl = viewportRef.current;
    if (!viewportEl) {
      return;
    }

    const updateDimensions = () => {
      const measuredWidth = viewportEl.clientWidth;
      const windowWidth = window.innerWidth;
      const nextCardsPerView = windowWidth >= 1024 ? 3 : windowWidth >= 640 ? 2 : 1;

      setViewportWidth(measuredWidth);
      setCardsPerView(nextCardsPerView);
      setCurrentIndex((prev) => Math.min(prev, Math.max(0, totalSlides - nextCardsPerView)));
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    resizeObserver.observe(viewportEl);
    window.addEventListener('resize', updateDimensions, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [totalSlides]);

  // Track section visibility with IntersectionObserver
  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsSectionInView(entry.isIntersecting);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(sectionEl);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Track browser tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabHidden(document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const goToSlide = useCallback(
    (targetIndex: number) => {
      const clamped = Math.max(0, Math.min(maxIndex, targetIndex));
      setCurrentIndex(clamped);
      const item = TESTIMONIALS_DATA.items[clamped];
      if (item) {
        onSlideChange?.(item, clamped);
      }
    },
    [maxIndex, onSlideChange]
  );

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => {
      const nextIdx = prev <= 0 ? maxIndex : prev - 1;
      const item = TESTIMONIALS_DATA.items[nextIdx];
      if (item) {
        onSlideChange?.(item, nextIdx);
      }
      return nextIdx;
    });
  }, [maxIndex, onSlideChange]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const nextIdx = prev >= maxIndex ? 0 : prev + 1;
      const item = TESTIMONIALS_DATA.items[nextIdx];
      if (item) {
        onSlideChange?.(item, nextIdx);
      }
      return nextIdx;
    });
  }, [maxIndex, onSlideChange]);

  const isAutoplayActive =
    !prefersReducedMotion &&
    !isPausedByUser &&
    !isHovered &&
    !isFocusedWithin &&
    !isTouching &&
    !isTabHidden &&
    isSectionInView;

  // Autoplay interval (6 seconds)
  useEffect(() => {
    if (!isAutoplayActive) {
      return;
    }

    const timerId = window.setInterval(() => {
      handleNext();
    }, AUTOPLAY_INTERVAL_MS);

    return () => {
      window.clearInterval(timerId);
    };
  }, [isAutoplayActive, handleNext]);

  const cardWidthPx =
    cardsPerView > 0
      ? Math.max(240, (viewportWidth - (cardsPerView - 1) * GAP_PX) / cardsPerView)
      : viewportWidth;

  const slideStepPx = cardWidthPx + GAP_PX;
  const targetX = -currentIndex * slideStepPx;
  const maxDragLeft = -maxIndex * slideStepPx;

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsTouching(false);
    const offsetX = info.offset.x;
    const velocityX = info.velocity.x;

    if (offsetX < -SWIPE_THRESHOLD_PX || velocityX < -300) {
      goToSlide(Math.min(maxIndex, currentIndex + 1));
    } else if (offsetX > SWIPE_THRESHOLD_PX || velocityX > 300) {
      goToSlide(Math.max(0, currentIndex - 1));
    }
  };

  const markAvatarBroken = (id: string) => {
    setBrokenAvatars((prev) => ({ ...prev, [id]: true }));
  };

  const totalPaginationPositions = maxIndex + 1;

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      aria-labelledby="testimonials-section-heading"
      className="relative bg-gradient-to-b from-slate-navy/65 via-midnight to-midnight py-20 md:py-28 overflow-hidden scroll-mt-24"
    >
      <Container>
        {/* Centered SectionHeading */}
        <Reveal>
          <SectionHeading
            id="testimonials-section-heading"
            as="h2"
            align="center"
            eyebrow={TESTIMONIALS_DATA.eyebrow}
            titleBefore={TESTIMONIALS_DATA.headingBefore}
            titleHighlight={TESTIMONIALS_DATA.headingHighlight}
            titleAfter={TESTIMONIALS_DATA.headingAfter}
          />
        </Reveal>

        {/* Accessible Sliding Carousel Region */}
        <Reveal delay={0.1} className="mt-12 md:mt-16">
          <div
            role="region"
            aria-roledescription="carousel"
            aria-label={TESTIMONIALS_DATA.carouselAriaLabel}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocusCapture={() => setIsFocusedWithin(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setIsFocusedWithin(false);
              }
            }}
            onTouchStart={() => setIsTouching(true)}
            onTouchEnd={() => setIsTouching(false)}
          >
            {/* Overflow-Hidden Viewport */}
            <div ref={viewportRef} className="overflow-hidden py-2 -my-2">
              <motion.div
                aria-live={isAutoplayActive ? 'off' : 'polite'}
                drag={prefersReducedMotion ? false : 'x'}
                dragConstraints={{ left: maxDragLeft, right: 0 }}
                dragElastic={0.08}
                onDragStart={() => setIsTouching(true)}
                onDragEnd={handleDragEnd}
                animate={{ x: targetX }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : {
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1],
                      }
                }
                style={{ gap: `${GAP_PX}px` }}
                className="flex items-stretch cursor-grab active:cursor-grabbing"
              >
                {TESTIMONIALS_DATA.items.map((item, idx) => {
                  const isVisible = idx >= currentIndex && idx < currentIndex + cardsPerView;
                  const isAvatarBroken = Boolean(brokenAvatars[item.id]);

                  return (
                    <div
                      key={item.id}
                      role="group"
                      aria-roledescription="slide"
                      aria-label={`${idx + 1} of ${totalSlides}`}
                      aria-hidden={!isVisible}
                      style={{ width: `${cardWidthPx}px` }}
                      className="shrink-0 flex"
                    >
                      <Card
                        tabIndex={isVisible ? 0 : -1}
                        className="w-full flex flex-col justify-between p-6 sm:p-8 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
                      >
                        <div>
                          {/* Top Row: Large Signal Red Quote Icon + 5 Signal Red Stars */}
                          <div className="flex items-center justify-between gap-4 mb-5">
                            <Quote
                              aria-hidden="true"
                              className="h-9 w-9 text-signal shrink-0"
                            />
                            <div
                              role="img"
                              aria-label={TESTIMONIALS_DATA.ratingAriaLabel}
                              className="flex items-center gap-1"
                            >
                              {Array.from({ length: item.rating }).map((_, starIdx) => (
                                <Star
                                  key={starIdx}
                                  aria-hidden="true"
                                  className="h-4 w-4 text-signal fill-current"
                                />
                              ))}
                            </div>
                          </div>

                          {/* 3-4 Line Member Quote in Cloud White */}
                          <blockquote className="text-sm sm:text-base text-cloud leading-relaxed mb-6">
                            &ldquo;{item.quote}&rdquo;
                          </blockquote>
                        </div>

                        {/* Member Avatar + Name + Tenure */}
                        <div className="pt-5 border-t border-cloud-border flex items-center gap-3.5">
                          {!isAvatarBroken ? (
                            <img
                              src={item.avatarSrc}
                              alt={item.avatarAlt}
                              width={48}
                              height={48}
                              loading="lazy"
                              decoding="async"
                              draggable={false}
                              referrerPolicy="no-referrer"
                              onError={() => markAvatarBroken(item.id)}
                              className="h-12 w-12 rounded-full object-cover border border-cloud-border shrink-0"
                            />
                          ) : (
                            <div
                              aria-hidden="true"
                              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-midnight border border-signal text-cloud font-display text-xs font-extrabold uppercase"
                            >
                              {item.initials}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="font-display text-sm sm:text-base font-bold uppercase text-cloud truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-cloud-muted truncate">
                              {item.memberTenure}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </motion.div>
            </div>

            {/* Carousel Controls: Prev/Next Arrows, Pagination Dots, and Pause/Play Toggle */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
              {/* Pagination Dots (44x44px minimum tap target wrapper around visual pill) */}
              <div className="flex items-center gap-1" role="tablist" aria-label="Testimonial slides">
                {Array.from({ length: totalPaginationPositions }).map((_, dotIdx) => {
                  const isActive = currentIndex === dotIdx;
                  return (
                    <button
                      key={dotIdx}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Go to testimonial position ${dotIdx + 1} of ${totalPaginationPositions}`}
                      onClick={() => goToSlide(dotIdx)}
                      className="inline-flex h-11 min-h-[44px] min-w-[44px] items-center justify-center px-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-full"
                    >
                      <span
                        className={[
                          'block h-2.5 w-8 rounded-full transition-[transform,background-color] duration-200 ease-out origin-center',
                          isActive
                            ? 'scale-x-100 bg-signal'
                            : 'scale-x-[0.32] bg-slate-navy border border-cloud-border hover:border-signal',
                        ].join(' ')}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Right Controls: Visible Pause/Play Autoplay Button + Prev/Next Circular Buttons */}
              <div className="flex items-center gap-3">
                {!prefersReducedMotion && (
                  <button
                    type="button"
                    aria-label={
                      isPausedByUser
                        ? TESTIMONIALS_DATA.playAutoplayAriaLabel
                        : TESTIMONIALS_DATA.pauseAutoplayAriaLabel
                    }
                    aria-pressed={isPausedByUser}
                    onClick={() => setIsPausedByUser((prev) => !prev)}
                    className="inline-flex h-11 min-h-[44px] min-w-[44px] items-center gap-2 rounded-full border border-cloud-border bg-slate-navy px-4 text-xs font-display font-bold uppercase tracking-wider text-cloud hover:border-signal transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal cursor-pointer"
                  >
                    {isPausedByUser ? (
                      <>
                        <Play aria-hidden="true" className="h-3.5 w-3.5 text-signal fill-current" />
                        <span>{TESTIMONIALS_DATA.playButtonText}</span>
                      </>
                    ) : (
                      <>
                        <Pause aria-hidden="true" className="h-3.5 w-3.5 text-signal fill-current" />
                        <span>{TESTIMONIALS_DATA.pauseButtonText}</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  aria-label={TESTIMONIALS_DATA.prevButtonAriaLabel}
                  onClick={handlePrev}
                  className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-cloud-border bg-slate-navy text-cloud hover:border-signal transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal cursor-pointer"
                >
                  <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  aria-label={TESTIMONIALS_DATA.nextButtonAriaLabel}
                  onClick={handleNext}
                  className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-signal text-cloud hover:bg-signal-hover hover:shadow-signal-glow transition-[background-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal cursor-pointer"
                >
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export default Testimonials;
