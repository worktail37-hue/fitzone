"use client";

import {
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { Instagram, Linkedin, Twitter, User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CarouselSocialLink {
  platform: "instagram" | "twitter" | "linkedin";
  url: string;
  ariaLabel: string;
}

export interface CarouselItem {
  id: string | number;
  stat: string;
  quote: string;
  author: string;
  role: string;
  defaultImage: string;
  selectedImage: string;
  alt?: string;
  badge?: string;
  socials?: CarouselSocialLink[];
}

export interface CalendlyCarouselProps extends HTMLAttributes<HTMLDivElement> {
  items: CarouselItem[];
  autoPlayInterval?: number;
  pauseOnHover?: boolean;
  ariaLabel?: string;
}

type ScreenTier = "mobile" | "tablet" | "desktop";

const VISIBLE_OFFSETS = [-4, -3, -2, -1, 0, 1, 2, 3, 4] as const;

const TRANSITION_SPRING = {
  type: "spring",
  stiffness: 220,
  damping: 26,
  mass: 0.75,
} as const;

function SocialPlatformIcon({
  platform,
}: {
  platform: CarouselSocialLink["platform"];
}) {
  if (platform === "instagram") {
    return <Instagram aria-hidden="true" className="h-4 w-4" />;
  }
  if (platform === "twitter") {
    return <Twitter aria-hidden="true" className="h-4 w-4" />;
  }
  return <Linkedin aria-hidden="true" className="h-4 w-4" />;
}

export function CalendlyCarousel({
  items,
  autoPlayInterval = 6000,
  pauseOnHover = true,
  ariaLabel = "Expert trainers carousel",
  className,
  ...props
}: CalendlyCarouselProps) {
  const prefersReducedMotion = useReducedMotion();

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef<number>(0);

  // State
  const [page, setPage] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isFocusedWithin, setIsFocusedWithin] = useState<boolean>(false);
  const [isInView, setIsInView] = useState<boolean>(true);
  const [isTabHidden, setIsTabHidden] = useState<boolean>(false);
  const [tier, setTier] = useState<ScreenTier>("desktop");
  const [viewportWidth, setViewportWidth] = useState<number>(1200);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const total = items.length;
  const activeIndex = total > 0 ? ((page % total) + total) % total : 0;

  const resetProgressIndicator = useCallback(() => {
    elapsedRef.current = 0;
    lastTimeRef.current = null;
    if (progressBarRef.current) {
      progressBarRef.current.style.transform = "scaleX(0)";
    }
  }, []);

  // Responsive tier listener throttled via requestAnimationFrame
  useEffect(() => {
    let rafId: number | null = null;

    const updateViewportTier = () => {
      const width = window.innerWidth;
      setViewportWidth(width);

      if (width < 768) {
        setTier("mobile");
      } else if (width < 1120) {
        setTier("tablet");
      } else {
        setTier("desktop");
      }
    };

    const handleResize = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(() => {
          updateViewportTier();
          rafId = null;
        });
      }
    };

    updateViewportTier();
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  // Pause autoplay when carousel is scrolled out of view
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsInView(entry.isIntersecting);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Pause autoplay when browser tab is hidden
  useEffect(() => {
    const handleVisibility = () => {
      setIsTabHidden(document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Smooth 60fps requestAnimationFrame progress loop (updates DOM ref directly with zero React re-renders)
  useEffect(() => {
    if (
      total <= 1 ||
      prefersReducedMotion ||
      !isInView ||
      isTabHidden ||
      isFocusedWithin ||
      (pauseOnHover && isHovered)
    ) {
      lastTimeRef.current = null;
      return;
    }

    const step = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }

      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      elapsedRef.current += delta;

      if (elapsedRef.current >= autoPlayInterval) {
        elapsedRef.current = 0;
        lastTimeRef.current = null;
        if (progressBarRef.current) {
          progressBarRef.current.style.transform = "scaleX(0)";
        }
        setPage((curr) => curr + 1);
        return;
      }

      const ratio = Math.min(elapsedRef.current / autoPlayInterval, 1);
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${ratio})`;
      }

      animationFrameRef.current = window.requestAnimationFrame(step);
    };

    animationFrameRef.current = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      lastTimeRef.current = null;
    };
  }, [
    page,
    total,
    pauseOnHover,
    isHovered,
    isFocusedWithin,
    isInView,
    isTabHidden,
    prefersReducedMotion,
    autoPlayInterval,
  ]);

  // Handlers
  const handlePrev = useCallback(() => {
    resetProgressIndicator();
    setPage((curr) => curr - 1);
  }, [resetProgressIndicator]);

  const handleNext = useCallback(() => {
    resetProgressIndicator();
    setPage((curr) => curr + 1);
  }, [resetProgressIndicator]);

  const handleSelectTab = (event: MouseEvent<HTMLButtonElement>) => {
    const indexStr = event.currentTarget.dataset.index;

    if (indexStr !== undefined) {
      const targetIdx = Number.parseInt(indexStr, 10);
      let diff = targetIdx - activeIndex;

      if (diff > total / 2) {
        diff -= total;
      } else if (diff < -total / 2) {
        diff += total;
      }

      resetProgressIndicator();
      setPage((curr) => curr + diff);
    }
  };

  const handleSelectCard = (event: MouseEvent<HTMLDivElement>) => {
    const offsetStr = event.currentTarget.dataset.offset;

    if (offsetStr !== undefined) {
      const offset = Number.parseInt(offsetStr, 10);

      if (offset !== 0) {
        resetProgressIndicator();
        setPage((curr) => curr + offset);
      }
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      handlePrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      handleNext();
    }
  };

  const markImageBroken = (key: string) => {
    setBrokenImages((prev) => ({ ...prev, [key]: true }));
  };

  if (total === 0) {
    return null;
  }

  const activeDimensions = {
    desktop: { width: 762, height: 513 },
    tablet: { width: 560, height: 440 },
    mobile: { width: Math.min(340, Math.max(264, viewportWidth - 56)), height: 510 },
  }[tier];

  const cardTransition = prefersReducedMotion
    ? { duration: 0 }
    : TRANSITION_SPRING;

  return (
    <div
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocusCapture={() => setIsFocusedWithin(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsFocusedWithin(false);
        }
      }}
      className={cn(
        "relative w-full max-w-[1240px] mx-auto flex flex-col items-center select-none outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-3xl py-4 overflow-hidden",
        className
      )}
      {...props}
    >
      <div
        id="carousel-view-panel"
        role="tabpanel"
        aria-live="polite"
        className="relative w-full flex items-center justify-center"
        style={{ height: activeDimensions.height }}
      >
        {VISIBLE_OFFSETS.map((offset) => {
          const virtualIndex = page + offset;
          const itemIndex = ((virtualIndex % total) + total) % total;
          const item = items[itemIndex];
          const isActive = offset === 0;
          const isBroken = Boolean(brokenImages[String(item.id)]);

          const getVariant = () => {
            if (tier === "mobile") {
              const activeW = activeDimensions.width;
              const activeH = activeDimensions.height;
              const gap = 16;
              const peekW = 60;
              const peekH = 410;

              if (offset === 0) {
                return {
                  x: -activeW / 2,
                  y: -activeH / 2,
                  width: activeW,
                  height: activeH,
                  opacity: 1,
                  zIndex: 20,
                  pointerEvents: "auto" as const,
                };
              }

              if (offset === -1) {
                return {
                  x: -activeW / 2 - gap - peekW,
                  y: -peekH / 2,
                  width: peekW,
                  height: peekH,
                  opacity: 1,
                  zIndex: 30,
                  pointerEvents: "auto" as const,
                };
              }

              if (offset === 1) {
                return {
                  x: activeW / 2 + gap,
                  y: -peekH / 2,
                  width: peekW,
                  height: peekH,
                  opacity: 1,
                  zIndex: 30,
                  pointerEvents: "auto" as const,
                };
              }

              return {
                x: offset < 0 ? -activeW / 2 - 220 : activeW / 2 + 220,
                y: -peekH / 2,
                width: peekW,
                height: peekH,
                opacity: 0,
                zIndex: 0,
                pointerEvents: "none" as const,
              };
            }

            if (tier === "tablet") {
              const activeW = 560;
              const activeH = 440;
              const gap = 18;
              const sideW = 100;
              const sideH = 340;

              if (offset === 0) {
                return {
                  x: -activeW / 2,
                  y: -activeH / 2,
                  width: activeW,
                  height: activeH,
                  opacity: 1,
                  zIndex: 20,
                  pointerEvents: "auto" as const,
                };
              }

              if (offset === -1) {
                return {
                  x: -activeW / 2 - gap - sideW,
                  y: -sideH / 2,
                  width: sideW,
                  height: sideH,
                  opacity: 1,
                  zIndex: 30,
                  pointerEvents: "auto" as const,
                };
              }

              if (offset === 1) {
                return {
                  x: activeW / 2 + gap,
                  y: -sideH / 2,
                  width: sideW,
                  height: sideH,
                  opacity: 1,
                  zIndex: 30,
                  pointerEvents: "auto" as const,
                };
              }

              return {
                x: offset < 0 ? -activeW / 2 - 240 : activeW / 2 + 240,
                y: -sideH / 2,
                width: 74,
                height: 205,
                opacity: 0,
                zIndex: 0,
                pointerEvents: "none" as const,
              };
            }

            switch (offset) {
              case 0:
                return {
                  x: -381,
                  y: -256.5,
                  width: 762,
                  height: 513,
                  opacity: 1,
                  zIndex: 20,
                  pointerEvents: "auto" as const,
                };
              case -1:
                return {
                  x: -506,
                  y: -172,
                  width: 105,
                  height: 344,
                  opacity: 1,
                  zIndex: 30,
                  pointerEvents: "auto" as const,
                };
              case 1:
                return {
                  x: 401,
                  y: -172,
                  width: 105,
                  height: 344,
                  opacity: 1,
                  zIndex: 30,
                  pointerEvents: "auto" as const,
                };
              case -2:
                return {
                  x: -596,
                  y: -102.5,
                  width: 74,
                  height: 205,
                  opacity: 1,
                  zIndex: 30,
                  pointerEvents: "auto" as const,
                };
              case 2:
                return {
                  x: 522,
                  y: -102.5,
                  width: 74,
                  height: 205,
                  opacity: 1,
                  zIndex: 30,
                  pointerEvents: "auto" as const,
                };
              case -3:
                return {
                  x: -720,
                  y: -102.5,
                  width: 74,
                  height: 205,
                  opacity: 0,
                  zIndex: 0,
                  pointerEvents: "none" as const,
                };
              case 3:
                return {
                  x: 646,
                  y: -102.5,
                  width: 74,
                  height: 205,
                  opacity: 0,
                  zIndex: 0,
                  pointerEvents: "none" as const,
                };
              default:
                return {
                  x: offset < 0 ? -860 : 860,
                  y: -102.5,
                  width: 74,
                  height: 205,
                  opacity: 0,
                  zIndex: 0,
                  pointerEvents: "none" as const,
                };
            }
          };

          return (
            <motion.div
              key={virtualIndex}
              data-offset={offset}
              onClick={handleSelectCard}
              initial={false}
              animate={getVariant()}
              transition={cardTransition}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                willChange: "transform, width, height, opacity",
              }}
              className={cn(
                "rounded-[28px] sm:rounded-[32px] bg-card text-card-foreground border border-cloud-border shadow-[0_14px_36px_rgba(0,0,0,0.55)] overflow-visible",
                isActive && "border-signal/40",
                !isActive && "cursor-pointer hover:border-signal/45"
              )}
            >
              {/* Connected SVG Bridge: offset -1 to 0 */}
              {offset === -1 && (
                <div
                  aria-hidden="true"
                  className="absolute top-0 bottom-0 flex items-center text-card pointer-events-none z-[100]"
                  style={{
                    width: 22,
                    height: 42,
                    margin: "auto 0",
                    left: "calc(100% - 1px)",
                  }}
                >
                  <svg
                    viewBox="0 0 20 37.3338"
                    preserveAspectRatio="none"
                    className="size-full fill-current overflow-visible block"
                  >
                    <path d="M0 0C0 0 1.2422 13.5759 10 13.5759C18.7578 13.5759 20 0 20 0V37.3338C20 37.3338 18.7578 23.7578 10 23.7578C1.2422 23.7578 0 37.3338 0 37.3338V0Z" />
                  </svg>
                </div>
              )}

              {/* Connected SVG Bridge: offset 1 to 0 */}
              {offset === 1 && (
                <div
                  aria-hidden="true"
                  className="absolute top-0 bottom-0 flex items-center text-card pointer-events-none z-[100]"
                  style={{
                    width: 22,
                    height: 42,
                    margin: "auto 0",
                    right: "calc(100% - 1px)",
                  }}
                >
                  <svg
                    viewBox="0 0 20 37.3338"
                    preserveAspectRatio="none"
                    className="size-full fill-current overflow-visible block"
                  >
                    <path d="M0 0C0 0 1.2422 13.5759 10 13.5759C18.7578 13.5759 20 0 20 0V37.3338C20 37.3338 18.7578 23.7578 10 23.7578C1.2422 23.7578 0 37.3338 0 37.3338V0Z" />
                  </svg>
                </div>
              )}

              {/* Connected SVG Bridge: offset -2 to -1 (Desktop) */}
              {offset === -2 && tier === "desktop" && (
                <div
                  aria-hidden="true"
                  className="absolute top-0 bottom-0 flex items-center text-card pointer-events-none z-[100]"
                  style={{
                    width: 18,
                    height: 28,
                    margin: "auto 0",
                    left: "calc(100% - 1px)",
                  }}
                >
                  <svg
                    viewBox="0 0 16 28"
                    preserveAspectRatio="none"
                    className="size-full fill-current overflow-visible block"
                  >
                    <path d="M0 0C0 0 0.993759 10.1818 8 10.1818C15.0062 10.1818 16 0 16 0V28C16 28 15.0062 17.8182 8 17.8182C0.993759 17.8182 0 28 0 28V0Z" />
                  </svg>
                </div>
              )}

              {/* Connected SVG Bridge: offset 2 to 1 (Desktop) */}
              {offset === 2 && tier === "desktop" && (
                <div
                  aria-hidden="true"
                  className="absolute top-0 bottom-0 flex items-center text-card pointer-events-none z-[100]"
                  style={{
                    width: 18,
                    height: 28,
                    margin: "auto 0",
                    right: "calc(100% - 1px)",
                  }}
                >
                  <svg
                    viewBox="0 0 16 28"
                    preserveAspectRatio="none"
                    className="size-full fill-current overflow-visible block"
                  >
                    <path d="M0 0C0 0 0.993759 10.1818 8 10.1818C15.0062 10.1818 16 0 16 0V28C16 28 15.0062 17.8182 8 17.8182C0.993759 17.8182 0 28 0 28V0Z" />
                  </svg>
                </div>
              )}

              <div
                className="size-full overflow-hidden relative"
                style={{ borderRadius: "inherit" }}
              >
                {/* Collapsed / Side Card Image Layer */}
                <motion.div
                  initial={false}
                  animate={{ opacity: isActive ? 0 : 1 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className={cn(
                    "absolute inset-0 p-2",
                    isActive && "pointer-events-none"
                  )}
                >
                  <div className="size-full rounded-[20px] sm:rounded-[24px] overflow-hidden bg-muted relative">
                    {!isBroken ? (
                      <img
                        alt={item.alt || item.author}
                        src={item.defaultImage}
                        width={600}
                        height={800}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        draggable={false}
                        onError={() => markImageBroken(String(item.id))}
                        className="size-full object-cover object-top"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center bg-gradient-to-br from-slate-navy via-midnight to-slate-navy">
                        <User aria-hidden="true" className="h-6 w-6 text-signal" />
                      </div>
                    )}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-midnight/70 via-transparent to-transparent"
                    />
                  </div>
                </motion.div>

                {/* Active Center Card Content Layer */}
                <div
                  className="absolute"
                  style={{
                    left: "50%",
                    top: "50%",
                    width: activeDimensions.width,
                    height: activeDimensions.height,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <motion.div
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      x: isActive ? 0 : offset < 0 ? -822 : 822,
                    }}
                    transition={cardTransition}
                    className={cn(
                      "size-full flex flex-col md:flex-row p-4 sm:p-5 md:p-6 lg:p-7 gap-3 sm:gap-4 md:gap-6",
                      !isActive && "pointer-events-none"
                    )}
                  >
                    <div className="flex-1 min-w-0 flex flex-col items-center md:items-start text-center md:text-left justify-between py-1 gap-2 sm:gap-3">
                      <div className="w-full">
                        {item.badge && (
                          <span className="inline-block rounded-full bg-signal px-3.5 py-1 font-display text-[11px] font-bold uppercase tracking-wider text-cloud mb-2.5">
                            {item.badge}
                          </span>
                        )}
                        <h3
                          title={item.stat}
                          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-extrabold uppercase tracking-tight text-foreground leading-tight w-full"
                        >
                          {item.stat}
                        </h3>
                      </div>

                      <div className="relative w-full min-w-0 my-auto py-1">
                        <span
                          aria-hidden="true"
                          className="font-display text-2xl sm:text-3xl lg:text-4xl text-signal/60 absolute right-full top-0 pr-1.5 select-none pointer-events-none hidden md:inline"
                        >
                          “
                        </span>

                        <p className="text-xs sm:text-sm md:text-base text-cloud-muted leading-relaxed">
                          “{item.quote}”
                        </p>
                      </div>

                      <div className="flex flex-wrap min-w-0 w-full max-w-full items-center justify-center md:justify-between gap-3">
                        {/* Signature Connected Author & Role Pill */}
                        <div className="flex flex-col items-center md:items-start min-w-0 max-w-full">
                          <span className="w-fit inline-flex items-center justify-center rounded-[6px] font-display font-bold uppercase tracking-wider py-1 px-3 text-[11px] sm:text-xs bg-secondary text-secondary-foreground border border-cloud-border shrink-0 select-none">
                            <span className="whitespace-nowrap font-bold">
                              {item.author}
                            </span>
                          </span>

                          <div
                            aria-hidden="true"
                            className="shrink-0 flex items-center justify-center md:justify-start px-3 h-[6px] -my-[1px] text-secondary relative z-10"
                          >
                            <svg
                              className="block shrink-0 fill-current overflow-visible"
                              preserveAspectRatio="none"
                              viewBox="0 -2 14 12"
                              width="14"
                              height="10"
                            >
                              <path d="M0 -2 V0 C0 0 5.09091 0.49688 5.09091 4 C5.09091 7.50312 0 8 0 8 V10 H14 V8 C14 8 8.90909 7.50312 8.90909 4 C8.90909 0.49688 14 0 14 0 V-2 Z" />
                            </svg>
                          </div>

                          <span className="w-fit inline-flex items-center justify-center rounded-[6px] font-medium py-1 px-3 text-[11px] sm:text-xs bg-secondary text-muted-foreground border border-cloud-border max-w-full select-none">
                            <span title={item.role} className="truncate">
                              {item.role}
                            </span>
                          </span>
                        </div>

                        {/* Trainer Social Links (44x44px minimum tap target) */}
                        {item.socials && item.socials.length > 0 && (
                          <div className="flex items-center gap-2 shrink-0">
                            {item.socials.map((social) => (
                              <a
                                key={social.platform}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={social.ariaLabel}
                                tabIndex={isActive ? 0 : -1}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-midnight border border-cloud-border text-cloud hover:bg-signal hover:border-signal transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
                              >
                                <SocialPlatformIcon platform={social.platform} />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Active Trainer Portrait Image */}
                    <div className="relative shrink-0 overflow-hidden rounded-[18px] sm:rounded-[22px] bg-muted border border-cloud-border w-full md:w-[clamp(180px,44%,320px)] flex-1 md:flex-initial md:h-full max-h-[200px] md:max-h-none">
                      {!isBroken ? (
                        <img
                          alt={item.alt || item.author}
                          src={item.selectedImage}
                          width={600}
                          height={800}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          draggable={false}
                          onError={() => markImageBroken(String(item.id))}
                          className="size-full object-cover object-top"
                        />
                      ) : (
                        <div
                          role="img"
                          aria-label={item.alt || item.author}
                          className="size-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-navy via-midnight to-slate-navy"
                        >
                          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-midnight/80 border border-cloud-border mb-3">
                            <User aria-hidden="true" className="h-7 w-7 text-signal" />
                          </div>
                          <p className="font-display text-sm font-bold uppercase tracking-wider text-cloud">
                            {item.stat}
                          </p>
                        </div>
                      )}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-midnight/50 via-transparent to-transparent"
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Tablist with 44x44px Touch Target Wrapper & Smooth Progress Fill */}
      <div
        role="tablist"
        aria-label="Select trainer slide"
        className="flex items-center gap-1 mt-5"
      >
        {items.map((item, idx) => {
          const isSelected = idx === activeIndex;

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              data-index={idx}
              id={`carousel-tab-${idx}`}
              aria-controls="carousel-view-panel"
              onClick={handleSelectTab}
              aria-selected={isSelected}
              aria-label={`View trainer ${item.stat} (${idx + 1} of ${total})`}
              tabIndex={isSelected ? 0 : -1}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center px-1.5 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
            >
              <span
                className={cn(
                  "block h-[8px] rounded-[3px] overflow-hidden transition-[width] duration-300 ease-out",
                  isSelected
                    ? "w-[80px] bg-slate-navy border border-cloud-border"
                    : "w-[8px] bg-slate-navy border border-cloud-border hover:border-signal"
                )}
              >
                {isSelected && (
                  <div
                    ref={progressBarRef}
                    className="h-full w-full rounded-[3px] bg-signal"
                    style={{
                      transformOrigin: "0% 50%",
                      transform: "scaleX(0)",
                    }}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { CalendlyCarousel as ConnectedCarousel };
