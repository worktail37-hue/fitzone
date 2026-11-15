import {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Dumbbell } from 'lucide-react';
import { SERVICES_DATA, ServiceItem } from '../data/services';
import { Container } from '../components/ui/Container';
import { Reveal } from '../components/ui/Reveal';
import { SectionHeading } from '../components/ui/SectionHeading';

export interface ServicesProps {
  onSelectService?: (service: ServiceItem) => void;
}

export function Services({ onSelectService }: ServicesProps) {
  const prefersReducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const isTrackInView = useInView(trackRef, { once: true, amount: 0.15 });

  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(1 / SERVICES_DATA.items.length);
  const [isDragging, setIsDragging] = useState(false);

  const dragStateRef = useRef<{
    isDown: boolean;
    startX: number;
    startScrollLeft: number;
    hasMoved: boolean;
  }>({
    isDown: false,
    startX: 0,
    startScrollLeft: 0,
    hasMoved: false,
  });

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = track;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);
    const epsilon = 4;

    setCanScrollPrev(scrollLeft > epsilon);
    setCanScrollNext(scrollLeft < maxScroll - epsilon);

    if (maxScroll <= 0) {
      setScrollProgress(1);
    } else {
      const minFraction = Math.min(1, clientWidth / scrollWidth);
      const rawRatio = Math.min(1, Math.max(0, scrollLeft / maxScroll));
      const normalized = minFraction + rawRatio * (1 - minFraction);
      setScrollProgress(normalized);
    }
  }, []);

  // Passive scroll and resize listeners throttled with requestAnimationFrame
  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    let rafId: number | null = null;

    const handleScrollOrResize = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(() => {
          updateScrollState();
          rafId = null;
        });
      }
    };

    updateScrollState();
    track.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    return () => {
      track.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [updateScrollState]);

  const scrollByOneCard = useCallback(
    (direction: -1 | 1) => {
      const track = trackRef.current;
      if (!track) {
        return;
      }

      const firstCard = track.querySelector<HTMLElement>('[data-service-card]');
      const gapPx = 24;
      const stepWidth = firstCard ? firstCard.offsetWidth + gapPx : track.clientWidth * 0.8;

      track.scrollBy({
        left: direction * stepWidth,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    },
    [prefersReducedMotion]
  );

  // Keyboard arrow key support when track is focused
  const handleTrackKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollByOneCard(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollByOneCard(-1);
    }
  };

  // Mouse drag handlers (prevents accidental clicks when dragging)
  const handleMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || event.button !== 0) {
      return;
    }

    dragStateRef.current = {
      isDown: true,
      startX: event.pageX - track.offsetLeft,
      startScrollLeft: track.scrollLeft,
      hasMoved: false,
    };
  };

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || !dragStateRef.current.isDown) {
      return;
    }

    const currentX = event.pageX - track.offsetLeft;
    const deltaX = currentX - dragStateRef.current.startX;

    if (Math.abs(deltaX) > 6) {
      if (!dragStateRef.current.hasMoved) {
        dragStateRef.current.hasMoved = true;
        setIsDragging(true);
      }
      event.preventDefault();
      track.scrollLeft = dragStateRef.current.startScrollLeft - deltaX;
    }
  };

  const endMouseDrag = () => {
    if (dragStateRef.current.isDown) {
      dragStateRef.current.isDown = false;
      setIsDragging(false);
    }
  };

  const handleServiceAction = (service: ServiceItem) => {
    if (dragStateRef.current.hasMoved) {
      dragStateRef.current.hasMoved = false;
      return;
    }
    onSelectService?.(service);
    const plansSection = document.getElementById('plans');
    plansSection?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  const markImageBroken = (id: string) => {
    setBrokenImages((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section
      id="services"
      aria-labelledby="services-section-heading"
      className="relative bg-midnight py-20 md:py-28 overflow-hidden scroll-mt-24"
    >
      <Container>
        {/* Header Row: SectionHeading on Left, Circular Prev/Next Buttons on Right (Desktop) / Below (Mobile) */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12 md:mb-14">
          <Reveal className="max-w-3xl">
            <SectionHeading
              id="services-section-heading"
              as="h2"
              eyebrow={SERVICES_DATA.eyebrow}
              titleBefore={SERVICES_DATA.headingBefore}
              titleHighlight={SERVICES_DATA.headingHighlight}
              titleAfter={SERVICES_DATA.headingAfter}
              subtext={SERVICES_DATA.description}
            />
          </Reveal>

          <Reveal delay={0.1} className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              aria-label={SERVICES_DATA.prevButtonAriaLabel}
              disabled={!canScrollPrev}
              onClick={() => scrollByOneCard(-1)}
              className="inline-flex h-12 w-12 min-h-[44px] min-w-[44px] sm:h-14 sm:w-14 items-center justify-center rounded-full border border-cloud-border bg-slate-navy/80 text-cloud transition-[transform,border-color,background-color,opacity] duration-150 ease-out hover:border-signal hover:bg-slate-navy active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-midnight disabled:opacity-35 disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowLeft aria-hidden="true" className="h-5 w-5" />
            </button>

            <button
              type="button"
              aria-label={SERVICES_DATA.nextButtonAriaLabel}
              disabled={!canScrollNext}
              onClick={() => scrollByOneCard(1)}
              className="inline-flex h-12 w-12 min-h-[44px] min-w-[44px] sm:h-14 sm:w-14 items-center justify-center rounded-full bg-signal text-cloud transition-[transform,background-color,box-shadow,opacity] duration-150 ease-out hover:bg-signal-hover hover:shadow-signal-glow active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-midnight disabled:opacity-35 disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowRight aria-hidden="true" className="h-5 w-5" />
            </button>
          </Reveal>
        </div>

        {/* Horizontally Scrolling Native Scroll-Snap Carousel Track */}
        <div
          ref={trackRef}
          role="region"
          aria-label={SERVICES_DATA.carouselAriaLabel}
          tabIndex={0}
          onKeyDown={handleTrackKeyDown}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={endMouseDrag}
          onMouseLeave={endMouseDrag}
          className={[
            'flex gap-5 sm:gap-6 overflow-x-auto pb-2 select-none',
            '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-2xl',
            isDragging
              ? 'snap-none scroll-auto cursor-grabbing'
              : 'snap-x snap-mandatory cursor-grab',
          ].join(' ')}
        >
          {SERVICES_DATA.items.map((service, idx) => {
            const isBroken = Boolean(brokenImages[service.id]);

            return (
              <motion.article
                key={service.id}
                data-service-card
                initial={
                  prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }
                }
                animate={
                  prefersReducedMotion || isTrackInView
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 24 }
                }
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : {
                        duration: 0.6,
                        delay: idx * 0.08,
                        ease: 'easeOut',
                      }
                }
                className="group relative w-[85%] sm:w-[45%] lg:w-[24%] shrink-0 snap-start aspect-[4/5] rounded-2xl overflow-hidden border border-cloud-border bg-slate-navy"
              >
                {/* Card Visual with 1.05 Hover Scale over 0.5s */}
                {!isBroken ? (
                  <img
                    src={service.imageSrc}
                    alt={service.imageAlt}
                    width={service.width}
                    height={service.height}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    referrerPolicy="no-referrer"
                    onError={() => markImageBroken(service.id)}
                    className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                ) : (
                  /* Deep Slate Navy Fallback with Dumbbell Icon */
                  <div
                    role="img"
                    aria-label={service.imageAlt}
                    className="h-full w-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-navy via-midnight to-slate-navy"
                  >
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-midnight/80 border border-cloud-border mb-4">
                      <Dumbbell aria-hidden="true" className="h-8 w-8 text-signal" />
                    </div>
                    <p className="font-display text-sm font-bold uppercase tracking-wider text-cloud">
                      {service.title}
                    </p>
                    <p className="text-xs text-cloud-muted mt-1">
                      {SERVICES_DATA.fallbackSubtitle}
                    </p>
                  </div>
                )}

                {/* Dark Navy Gradient Scrim at the Bottom */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-midnight via-midnight/50 to-transparent"
                />

                {/* Bottom Content Overlay: Service Name (Bottom-Left) + Circular Red Arrow Button (Bottom-Right) */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <span className="block font-display text-[11px] font-bold uppercase tracking-widest text-cloud-muted mb-1">
                      {service.categoryTag}
                    </span>
                    <h3 className="font-display text-lg sm:text-xl font-bold uppercase text-cloud leading-snug">
                      {service.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    aria-label={service.ctaAriaLabel}
                    onClick={() => handleServiceAction(service)}
                    className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full bg-signal/85 border border-signal text-cloud transition-[transform,background-color,box-shadow,border-color] duration-200 ease-out group-hover:bg-signal group-hover:shadow-signal-glow group-hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud focus-visible:ring-offset-2 focus-visible:ring-offset-midnight cursor-pointer"
                  >
                    <ArrowUpRight aria-hidden="true" className="h-5 w-5" />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Thin Scroll Progress Bar Below Track (Deep Slate Navy Track, Signal Red Indicator) */}
        <div
          aria-label={SERVICES_DATA.progressAriaLabel}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(scrollProgress * 100)}
          className="mt-8 h-1.5 w-full rounded-full bg-slate-navy overflow-hidden"
        >
          <div
            className="h-full w-full bg-signal origin-left transition-transform duration-150 ease-out"
            style={{
              transform: `scaleX(${scrollProgress})`,
            }}
          />
        </div>
      </Container>
    </section>
  );
}

export default Services;
