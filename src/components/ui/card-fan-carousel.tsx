"use client";

import {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export interface CardItem {
  id?: string;
  imgUrl?: string;
  alt?: string;
  linkUrl?: string;
  mobileOrderClass?: string;
  content?: ReactNode;
}

export interface SocialCardsProps {
  cards: CardItem[];
  className?: string;
}

const MAX_VISIBLE = 7;
const HALF = 3;

const FAN_POSITIONS = [
  { rot: -21, scale: 0.7756, x: -30, y: 7.3, zIndex: 1 },
  { rot: -14, scale: 0.8498, x: -22, y: 4.0, zIndex: 2 },
  { rot: -7, scale: 0.9346, x: -11, y: 1.3, zIndex: 3 },
  { rot: 0, scale: 1.0, x: 0, y: 0.0, zIndex: 10 },
  { rot: 7, scale: 0.9346, x: 11, y: 1.3, zIndex: 3 },
  { rot: 14, scale: 0.8498, x: 22, y: 4.0, zIndex: 2 },
  { rot: 21, scale: 0.7756, x: 30, y: 7.3, zIndex: 1 },
];

function getResponsiveMultiplier(width: number) {
  if (width < 480) return 0.28;
  if (width < 640) return 0.38;
  if (width < 768) return 0.5;
  if (width < 1024) return 0.75;
  if (width < 1280) return 0.86;
  return 1.0;
}

/**
 * Returns a multiplier (0..1] that scales y-offsets and entry animation
 * distances when the viewport is too short for the ideal layout height.
 */
function getHeightMultiplier(width: number) {
  let idealPx: number;
  if (width < 480) idealPx = 22 * 16; // 352px
  else if (width < 640) idealPx = 26 * 16; // 416px
  else if (width < 768) idealPx = 28 * 16; // 448px
  else if (width < 1024) idealPx = 34 * 16; // 544px
  else idealPx = 38 * 16; // 608px

  const available = window.innerHeight * 0.7; // 70vh budget
  if (available >= idealPx) return 1;
  return available / idealPx;
}

function getSlotConfig(totalCards: number, slot: number, isRichCardMode: boolean) {
  if (totalCards >= MAX_VISIBLE) return FAN_POSITIONS[slot];

  // Dedicated 3-card fan geometry for rich subscription/pricing cards so all 3 cards
  // fan out with the signature arc (-7deg, 0deg, +7deg) without obscuring text
  if (isRichCardMode && totalCards === 3) {
    if (slot === 0) {
      return { rot: -7, scale: 0.945, x: -22.5, y: 1.5, zIndex: 3 };
    }
    if (slot === 1) {
      return { rot: 0, scale: 1.02, x: 0, y: 0.0, zIndex: 10 };
    }
    return { rot: 7, scale: 0.945, x: 22.5, y: 1.5, zIndex: 3 };
  }

  const center = totalCards >> 1;
  const distance = totalCards > 1 ? (slot - center) / center : 0;
  const absDistance = Math.abs(distance);
  return {
    rot: distance * 21,
    scale: 1.0 - 0.2244 * absDistance * absDistance,
    x: distance * 30,
    y: absDistance * absDistance * 7.3,
    zIndex: 10 - Math.abs(slot - center),
  };
}

const ARROW_CLASSES =
  "relative flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full border-[1.5px] border-cloud-border bg-slate-navy/80 backdrop-blur-[16px] text-cloud cursor-pointer shrink-0 z-30 outline-none shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:border-signal hover:text-cloud active:opacity-70 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-signal";

export default function SocialCards({ cards, className }: SocialCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);
  const hasEntered = useRef(false);
  const directionRef = useRef<"left" | "right" | null>(null);
  const prevVisible = useRef<Set<number>>(new Set());

  const totalCards = cards.length;
  const isRichCardMode = cards.some((card) => Boolean(card.content));
  const needsPagination = totalCards > MAX_VISIBLE;
  const [centerIndex, setCenterIndex] = useState(
    needsPagination ? HALF : totalCards >> 1
  );
  const [isInView, setIsInView] = useState(false);

  // Trigger initial elastic fan-out animation when scrolled into viewport
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const getVisibleMap = useCallback(
    (center: number) => {
      const map = new Map<number, number>();
      if (!needsPagination) {
        cards.forEach((_, i) => map.set(i, i));
        return map;
      }
      for (let slot = 0; slot < MAX_VISIBLE; slot++) {
        map.set(
          (((center + slot - HALF) % totalCards) + totalCards) % totalCards,
          slot
        );
      }
      return map;
    },
    [totalCards, needsPagination, cards]
  );

  const cycle = useCallback(
    (direction: "left" | "right") => {
      if (isAnimating.current || !needsPagination) return;
      isAnimating.current = true;
      directionRef.current = direction;
      setCenterIndex((prev) =>
        direction === "right"
          ? (prev + 1) % totalCards
          : (prev - 1 + totalCards) % totalCards
      );
    },
    [totalCards, needsPagination]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !totalCards || !isInView) return;

    const cardElements = Array.from(
      container.querySelectorAll<HTMLElement>(".fan-card")
    );
    if (!cardElements.length) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const visibleMap = getVisibleMap(centerIndex);
    const previouslyVisible = prevVisible.current;
    const direction = directionRef.current;
    const isFirstMount = !hasEntered.current;
    const viewportW = window.innerWidth;
    const isDesktopFan = !isRichCardMode || viewportW >= 1024;
    const multiplier = getResponsiveMultiplier(viewportW);
    const hMult = getHeightMultiplier(viewportW);
    const slotCount = needsPagination ? MAX_VISIBLE : totalCards;
    const config = (slot: number) =>
      getSlotConfig(slotCount, slot, isRichCardMode);

    if (isFirstMount) isAnimating.current = true;

    let completedCount = 0;
    const visibleCount = visibleMap.size;
    const onCardDone = () => {
      if (++completedCount >= visibleCount) {
        isAnimating.current = false;
        if (isFirstMount) hasEntered.current = true;
      }
    };

    cardElements.forEach((card, cardIndex) => {
      const slot = visibleMap.get(cardIndex);
      const wasVisible = previouslyVisible.has(cardIndex);

      if (slot !== undefined) {
        const { x, y, rot, scale, zIndex } = config(slot);
        const target = isDesktopFan
          ? {
              x: `${x * multiplier}rem`,
              y: `${y * hMult}rem`,
              rotation: rot,
              scale,
              opacity: 1,
              zIndex,
              force3D: true,
            }
          : {
              x: "0rem",
              y: "0rem",
              rotation: 0,
              scale: 1,
              opacity: 1,
              zIndex: slot === 1 ? 10 : 3,
              force3D: true,
            };

        if (prefersReducedMotion) {
          gsap.set(card, target);
          onCardDone();
        } else if (isFirstMount) {
          gsap.set(card, {
            x: 0,
            y: `${10 * hMult}rem`,
            rotation: 0,
            scale: 0.65,
            opacity: 0,
            force3D: true,
          });
          gsap.to(card, {
            ...target,
            duration: 1.2,
            ease: "elastic.out(1.05,.78)",
            delay: 0.12 + slot * 0.08,
            onComplete: onCardDone,
          });
        } else if (!wasVisible) {
          const enterX = direction === "right" ? 40 : -40;
          gsap.set(card, {
            x: `${enterX}rem`,
            y: `${y * hMult}rem`,
            rotation: direction === "right" ? 30 : -30,
            scale: 0.5,
            opacity: 0,
            force3D: true,
          });
          gsap.to(card, {
            ...target,
            duration: 0.6,
            ease: "power2.out",
            onComplete: onCardDone,
          });
        } else {
          gsap.to(card, {
            ...target,
            duration: 0.5,
            ease: "power2.out",
            onComplete: onCardDone,
          });
        }
      } else if (wasVisible) {
        const exitX = direction === "right" ? -40 : 40;
        gsap.to(card, {
          x: `${exitX}rem`,
          opacity: 0,
          scale: 0.5,
          rotation: direction === "right" ? -30 : 30,
          duration: 0.4,
          ease: "power2.in",
          zIndex: 0,
          force3D: true,
        });
      } else if (isFirstMount) {
        gsap.set(card, { opacity: 0, scale: 0.3, x: 0, y: 0, zIndex: 0 });
      }
    });

    prevVisible.current = new Set(visibleMap.keys());

    // Hover interactions
    const visibleEntries: { el: HTMLElement; slot: number }[] = [];
    cardElements.forEach((el, i) => {
      const slot = visibleMap.get(i);
      if (slot !== undefined) visibleEntries.push({ el, slot });
    });
    visibleEntries.sort((a, b) => a.slot - b.slot);

    let activeSlot: number | null = null;
    let leaveTimer: ReturnType<typeof setTimeout> | null = null;
    const centerSlot = visibleEntries.length >> 1;

    const updateHoverLayout = (hoveredSlot: number | null) => {
      if (prefersReducedMotion) return;

      const currentW = window.innerWidth;
      const desktopFanActive = !isRichCardMode || currentW >= 1024;
      const mult = getResponsiveMultiplier(currentW);
      const hM = getHeightMultiplier(currentW);

      visibleEntries.forEach(({ el, slot }) => {
        const base = config(slot);

        if (!desktopFanActive) {
          const isHovered = hoveredSlot === slot;
          gsap.to(el, {
            x: "0rem",
            y: isHovered ? "-0.5rem" : "0rem",
            rotation: 0,
            scale: isHovered ? 1.02 : 1,
            duration: 0.45,
            ease: "elastic.out(1,.75)",
            overwrite: "auto",
            force3D: true,
          });
          return;
        }

        let targetX = base.x * mult;
        let targetY = base.y * hM;
        let targetRot = base.rot;
        let targetScale = base.scale;
        let delay = 0;

        if (hoveredSlot !== null) {
          const distance = Math.abs(slot - hoveredSlot);
          delay = distance * 0.02;

          if (slot === hoveredSlot) {
            targetY -= (isRichCardMode ? 1.8 : 2.5) * hM;
            targetScale *= isRichCardMode ? 1.05 : 1.08;
            if (isRichCardMode) {
              targetRot = base.rot * 0.35;
            }
          } else {
            const normalized =
              centerSlot > 0 ? (slot - centerSlot) / centerSlot : 0;
            const basePush = isRichCardMode ? 3.2 : 8;
            const pushStrength =
              basePush *
              (1 - Math.abs(normalized) * 0.45) *
              (1 + 0.2 * Math.max(0, 3 - distance));

            if (slot < hoveredSlot) {
              targetX -= pushStrength * mult;
              targetRot -= 3 / (distance + 1);
            } else {
              targetX += pushStrength * mult;
              targetRot += 3 / (distance + 1);
            }

            if (
              slot === visibleEntries.length - 1 &&
              hoveredSlot < centerSlot
            ) {
              targetY -= 0.75 * hM;
            }
            if (slot === 0 && hoveredSlot > centerSlot) {
              targetY -= 0.75 * hM;
            }
          }
        } else {
          delay = Math.abs(slot - centerSlot) * 0.02;
        }

        gsap.to(el, {
          x: `${targetX}rem`,
          y: `${targetY}rem`,
          rotation: targetRot,
          scale: targetScale,
          duration: 0.5,
          delay,
          ease: "elastic.out(1,.75)",
          overwrite: "auto",
          force3D: true,
        });
        gsap.set(el, {
          zIndex:
            hoveredSlot === slot ? 25 : base.zIndex,
        });
      });
    };

    const enterHandlers = visibleEntries.map(({ el, slot }) => {
      const handler = () => {
        if (isAnimating.current) return;
        if (leaveTimer) {
          clearTimeout(leaveTimer);
          leaveTimer = null;
        }
        if (activeSlot !== slot) {
          activeSlot = slot;
          updateHoverLayout(slot);
        }
      };
      el.addEventListener("mouseenter", handler);
      el.addEventListener("focusin", handler);
      return { el, handler };
    });

    const onMouseLeave = () => {
      if (isAnimating.current) return;
      if (leaveTimer) clearTimeout(leaveTimer);
      leaveTimer = setTimeout(() => {
        activeSlot = null;
        updateHoverLayout(null);
      }, 50);
    };
    container.addEventListener("mouseleave", onMouseLeave);

    let resizeRafId: number | null = null;
    const onResize = () => {
      if (resizeRafId !== null) return;
      resizeRafId = window.requestAnimationFrame(() => {
        resizeRafId = null;
        if (!isAnimating.current) {
          updateHoverLayout(activeSlot);
        }
      });
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      enterHandlers.forEach(({ el, handler }) => {
        el.removeEventListener("mouseenter", handler);
        el.removeEventListener("focusin", handler);
      });
      container.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", onResize);
      if (leaveTimer) clearTimeout(leaveTimer);
      if (resizeRafId !== null) window.cancelAnimationFrame(resizeRafId);
      gsap.killTweensOf(cardElements);
    };
  }, [centerIndex, totalCards, getVisibleMap, needsPagination, isInView, isRichCardMode]);

  if (!totalCards) return null;

  const chevron = (direction: "left" | "right") => (
    <svg
      aria-hidden="true"
      className="relative z-[2] w-4 h-4 md:w-5 md:h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline
        points={direction === "left" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"}
      />
    </svg>
  );

  return (
    <div
      className={cn(
        "flex flex-col items-center w-full relative z-20",
        className
      )}
    >
      <div className="flex items-center justify-center w-full max-w-[90rem]">
        <div
          ref={containerRef}
          className={cn(
            "fan-layout relative w-full max-w-[80rem]",
            isRichCardMode
              ? "grid grid-cols-1 gap-6 lg:grid-cols-none lg:flex lg:justify-center lg:items-center lg:min-h-[590px] lg:py-8"
              : "flex justify-center items-center min-h-[360px] sm:min-h-[440px] lg:min-h-[560px]"
          )}
        >
          {cards.map((card, index) => {
            if (card.content) {
              return (
                <div
                  key={card.id ?? index}
                  className={cn(
                    "fan-card flex w-full lg:w-[350px] xl:w-[372px] lg:absolute will-change-[transform,opacity] origin-bottom",
                    card.mobileOrderClass,
                    !isInView && "opacity-0"
                  )}
                >
                  {card.content}
                </div>
              );
            }

            const image = (
              <div className="relative w-full h-full overflow-hidden rounded-2xl border border-cloud-border bg-slate-navy shadow-2xl">
                {card.imgUrl && (
                  <img
                    src={card.imgUrl}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    alt={card.alt || `Card ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover z-10"
                  />
                )}
              </div>
            );

            return card.linkUrl ? (
              <a
                key={card.id ?? index}
                href={card.linkUrl}
                target={card.linkUrl.startsWith("http") ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="fan-card block cursor-pointer absolute w-[220px] h-[300px] sm:w-[260px] sm:h-[360px] lg:w-[300px] lg:h-[420px] will-change-[transform,opacity]"
              >
                {image}
              </a>
            ) : (
              <div
                key={card.id ?? index}
                className="fan-card absolute w-[220px] h-[300px] sm:w-[260px] sm:h-[360px] lg:w-[300px] lg:h-[420px] will-change-[transform,opacity]"
              >
                {image}
              </div>
            );
          })}
        </div>
      </div>

      {needsPagination && (
        <div className="flex items-center justify-center gap-4 mt-4 md:mt-6 z-30">
          <button
            type="button"
            className={`${ARROW_CLASSES} w-11 h-11 md:w-12 md:h-12`}
            onClick={() => cycle("left")}
            aria-label="Previous card"
          >
            {chevron("left")}
          </button>
          <div className="flex items-center gap-2">
            {cards.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-transform duration-300 ${
                  i === centerIndex
                    ? "bg-signal scale-[1.3]"
                    : "bg-cloud/20"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            className={`${ARROW_CLASSES} w-11 h-11 md:w-12 md:h-12`}
            onClick={() => cycle("right")}
            aria-label="Next card"
          >
            {chevron("right")}
          </button>
        </div>
      )}
    </div>
  );
}

export { SocialCards as CardFanCarousel };
