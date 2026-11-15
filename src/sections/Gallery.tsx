import {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Image as ImageIcon, Maximize2, X } from 'lucide-react';
import { GALLERY_DATA, GalleryItem } from '../data/gallery';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { Container } from '../components/ui/Container';
import { Reveal } from '../components/ui/Reveal';
import { SectionHeading } from '../components/ui/SectionHeading';

export interface GalleryProps {
  onOpenImage?: (item: GalleryItem, index: number) => void;
}

export function Gallery({ onOpenImage }: GalleryProps) {
  const prefersReducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const isTrackInView = useInView(trackRef, { once: true, amount: 0.15 });

  const cardButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lightboxRef = useRef<HTMLDivElement | null>(null);
  const lastOpenedIndexRef = useRef<number | null>(null);

  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(1 / GALLERY_DATA.items.length);
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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

  const scrollTrackByStep = useCallback(
    (direction: -1 | 1) => {
      const track = trackRef.current;
      if (!track) {
        return;
      }

      const firstCard = track.querySelector<HTMLElement>('[data-gallery-card]');
      const gapPx = 24;
      const stepWidth = firstCard ? firstCard.offsetWidth + gapPx : track.clientWidth * 0.75;

      track.scrollBy({
        left: direction * stepWidth,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    },
    [prefersReducedMotion]
  );

  const handleTrackKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollTrackByStep(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollTrackByStep(-1);
    }
  };

  // Mouse drag handlers
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

  const handleCardClick = (item: GalleryItem, index: number) => {
    if (dragStateRef.current.hasMoved) {
      dragStateRef.current.hasMoved = false;
      return;
    }
    lastOpenedIndexRef.current = index;
    setLightboxIndex(index);
    onOpenImage?.(item, index);
  };

  const closeLightbox = useCallback(() => {
    const returnIndex = lastOpenedIndexRef.current;
    setLightboxIndex(null);
    window.requestAnimationFrame(() => {
      if (returnIndex !== null) {
        cardButtonRefs.current[returnIndex]?.focus();
      }
    });
  }, []);

  const showPrevLightboxImage = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return (prev - 1 + GALLERY_DATA.items.length) % GALLERY_DATA.items.length;
    });
  }, []);

  const showNextLightboxImage = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return (prev + 1) % GALLERY_DATA.items.length;
    });
  }, []);

  useFocusTrap(lightboxRef, lightboxIndex !== null, closeLightbox);

  // Lock background scroll & support Left/Right arrow keys when lightbox is open
  useEffect(() => {
    if (lightboxIndex === null) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleLightboxKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showPrevLightboxImage();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        showNextLightboxImage();
      }
    };

    window.addEventListener('keydown', handleLightboxKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleLightboxKeyDown);
    };
  }, [lightboxIndex, showPrevLightboxImage, showNextLightboxImage]);

  const markImageBroken = (id: string) => {
    setBrokenImages((prev) => ({ ...prev, [id]: true }));
  };

  const activeLightboxItem =
    lightboxIndex !== null ? GALLERY_DATA.items[lightboxIndex] : null;

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-section-heading"
      className="relative bg-midnight py-20 md:py-28 overflow-hidden scroll-mt-24"
    >
      <Container>
        {/* Header Row: SectionHeading on Left, Prev/Next Circular Arrow Buttons on Right / Below */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12 md:mb-14">
          <Reveal>
            <SectionHeading
              id="gallery-section-heading"
              as="h2"
              eyebrow={GALLERY_DATA.eyebrow}
              titleBefore={GALLERY_DATA.headingBefore}
              titleHighlight={GALLERY_DATA.headingHighlight}
              titleAfter={GALLERY_DATA.headingAfter}
            />
          </Reveal>

          <Reveal delay={0.1} className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              aria-label={GALLERY_DATA.prevButtonAriaLabel}
              disabled={!canScrollPrev}
              onClick={() => scrollTrackByStep(-1)}
              className="inline-flex h-12 w-12 min-h-[44px] min-w-[44px] sm:h-14 sm:w-14 items-center justify-center rounded-full border border-cloud-border bg-slate-navy/80 text-cloud transition-[transform,border-color,background-color,opacity] duration-150 ease-out hover:border-signal hover:bg-slate-navy active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-midnight disabled:opacity-35 disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowLeft aria-hidden="true" className="h-5 w-5" />
            </button>

            <button
              type="button"
              aria-label={GALLERY_DATA.nextButtonAriaLabel}
              disabled={!canScrollNext}
              onClick={() => scrollTrackByStep(1)}
              className="inline-flex h-12 w-12 min-h-[44px] min-w-[44px] sm:h-14 sm:w-14 items-center justify-center rounded-full bg-signal text-cloud transition-[transform,background-color,box-shadow,opacity] duration-150 ease-out hover:bg-signal-hover hover:shadow-signal-glow active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-midnight disabled:opacity-35 disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowRight aria-hidden="true" className="h-5 w-5" />
            </button>
          </Reveal>
        </div>

        {/* Horizontally Scrolling Track of 8 Alternating 4:5 and 4:3 Gallery Cards */}
        <div
          ref={trackRef}
          role="region"
          aria-label={GALLERY_DATA.carouselAriaLabel}
          tabIndex={0}
          onKeyDown={handleTrackKeyDown}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={endMouseDrag}
          onMouseLeave={endMouseDrag}
          className={[
            'flex items-stretch gap-5 sm:gap-6 overflow-x-auto pb-2 select-none',
            '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-2xl',
            isDragging
              ? 'snap-none scroll-auto cursor-grabbing'
              : 'snap-x snap-mandatory cursor-grab',
          ].join(' ')}
        >
          {GALLERY_DATA.items.map((item, idx) => {
            const isBroken = Boolean(brokenImages[item.id]);
            const isTall = item.aspectRatio === '4:5';
            const cardDimensionClass = isTall
              ? 'h-[320px] sm:h-[380px] lg:h-[420px] aspect-[4/5]'
              : 'h-[320px] sm:h-[380px] lg:h-[420px] aspect-[4/3] max-w-[85vw]';

            return (
              <motion.div
                key={item.id}
                data-gallery-card
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
                className={`shrink-0 snap-start ${cardDimensionClass}`}
              >
                <button
                  ref={(el) => {
                    cardButtonRefs.current[idx] = el;
                  }}
                  type="button"
                  aria-label={`${GALLERY_DATA.openLightboxAriaPrefix} ${item.caption}`}
                  onClick={() => handleCardClick(item, idx)}
                  className="group relative h-full w-full overflow-hidden rounded-2xl border border-cloud-border bg-slate-navy text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-midnight cursor-pointer block"
                >
                  {!isBroken ? (
                    <img
                      src={item.imageSrc}
                      alt={item.imageAlt}
                      width={item.width}
                      height={item.height}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      referrerPolicy="no-referrer"
                      onError={() => markImageBroken(item.id)}
                      className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  ) : (
                    /* Navy Gradient Fallback with Image Icon */
                    <div
                      role="img"
                      aria-label={item.imageAlt}
                      className="h-full w-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-navy via-midnight to-slate-navy"
                    >
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-midnight/80 border border-cloud-border mb-3">
                        <ImageIcon aria-hidden="true" className="h-7 w-7 text-signal" />
                      </div>
                      <p className="font-display text-sm font-bold uppercase tracking-wider text-cloud">
                        {item.caption}
                      </p>
                      <p className="text-xs text-cloud-muted mt-1">
                        {GALLERY_DATA.fallbackText}
                      </p>
                    </div>
                  )}

                  {/* Soft Navy Gradient Overlay that Fades In Stronger on Hover */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-midnight via-midnight/35 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                  />

                  {/* Top-Right Subtle Expand Affordance */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-navy/85 backdrop-blur-md border border-cloud-border text-cloud opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </span>

                  {/* Small Caption Pill at Bottom-Left */}
                  <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-full bg-slate-navy/85 backdrop-blur-md border border-cloud-border px-4 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-cloud truncate">
                      {item.caption}
                    </span>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Thin Progress Bar Below Track */}
        <div
          aria-label={GALLERY_DATA.progressAriaLabel}
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

      {/* Accessible Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && activeLightboxItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Dark Backdrop */}
            <motion.div
              aria-hidden="true"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeLightbox}
              className="fixed inset-0 bg-midnight/90 backdrop-blur-md"
            />

            {/* Dialog Content */}
            <motion.div
              ref={lightboxRef}
              role="dialog"
              aria-modal="true"
              aria-label={GALLERY_DATA.lightbox.dialogAriaLabel}
              initial={
                prefersReducedMotion
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.96 }
              }
              animate={{ opacity: 1, scale: 1 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0, scale: 1 }
                  : { opacity: 0, scale: 0.96 }
              }
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="relative z-10 w-full max-w-5xl rounded-3xl bg-slate-navy border border-cloud-border p-4 sm:p-6 shadow-2xl"
            >
              {/* Top Bar: Counter ("3 / 8") + Close Button */}
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-midnight px-3.5 py-1 font-display text-xs font-extrabold uppercase tracking-wider text-cloud tabular-nums border border-cloud-border">
                    {lightboxIndex + 1} / {GALLERY_DATA.items.length}
                  </span>
                  <span className="font-display text-sm sm:text-base font-extrabold uppercase text-cloud truncate">
                    {activeLightboxItem.caption}
                  </span>
                </div>

                <button
                  type="button"
                  aria-label={GALLERY_DATA.lightbox.closeAriaLabel}
                  onClick={closeLightbox}
                  className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-midnight/85 border border-cloud-border text-cloud hover:border-signal transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal cursor-pointer shrink-0"
                >
                  <X aria-hidden="true" className="h-5 w-5" />
                </button>
              </div>

              {/* Main Image Frame + Prev/Next Controls */}
              <div className="relative overflow-hidden rounded-2xl bg-midnight border border-cloud-border aspect-[16/10] max-h-[70vh] w-full flex items-center justify-center">
                {!brokenImages[activeLightboxItem.id] ? (
                  <img
                    src={activeLightboxItem.imageSrc}
                    alt={activeLightboxItem.imageAlt}
                    width={activeLightboxItem.width}
                    height={activeLightboxItem.height}
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={() => markImageBroken(activeLightboxItem.id)}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div
                    role="img"
                    aria-label={activeLightboxItem.imageAlt}
                    className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-slate-navy via-midnight to-slate-navy"
                  >
                    <ImageIcon aria-hidden="true" className="h-12 w-12 text-signal mb-3" />
                    <p className="font-display text-lg font-extrabold uppercase text-cloud">
                      {activeLightboxItem.caption}
                    </p>
                    <p className="text-sm text-cloud-muted mt-1">
                      {activeLightboxItem.zoneSubtitle}
                    </p>
                  </div>
                )}

                {/* Previous Button */}
                <button
                  type="button"
                  aria-label={GALLERY_DATA.lightbox.prevAriaLabel}
                  onClick={showPrevLightboxImage}
                  className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 min-h-[44px] min-w-[44px] sm:h-12 sm:w-12 items-center justify-center rounded-full bg-slate-navy/90 backdrop-blur-md border border-cloud-border text-cloud hover:border-signal hover:bg-signal transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud cursor-pointer"
                >
                  <ArrowLeft aria-hidden="true" className="h-5 w-5" />
                </button>

                {/* Next Button */}
                <button
                  type="button"
                  aria-label={GALLERY_DATA.lightbox.nextAriaLabel}
                  onClick={showNextLightboxImage}
                  className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 min-h-[44px] min-w-[44px] sm:h-12 sm:w-12 items-center justify-center rounded-full bg-signal text-cloud hover:bg-signal-hover hover:shadow-signal-glow transition-[background-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud cursor-pointer"
                >
                  <ArrowRight aria-hidden="true" className="h-5 w-5" />
                </button>
              </div>

              {/* Bottom Caption */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-cloud-muted">
                <p>{activeLightboxItem.zoneSubtitle}</p>
                <p className="font-display text-xs uppercase tracking-wider text-cloud">
                  {activeLightboxItem.aspectRatio} Architectural Frame
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default Gallery;
