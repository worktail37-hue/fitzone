import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Pause, Play, X } from 'lucide-react';
import { HERO_DATA } from '../../data/hero';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { Button } from './Button';

export interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: RefObject<HTMLElement | null>;
  onPrimaryAction?: () => void;
}

/**
 * Reusable accessible video modal shared between the Hero and About sections.
 * Supports Escape key dismissal, backdrop click, close button, background scroll lock,
 * keyboard focus trapping, and focus restoration to the triggering element.
 */
export function VideoModal({
  isOpen,
  onClose,
  triggerRef,
  onPrimaryAction,
}: VideoModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(true);
  const [activeHighlightId, setActiveHighlightId] = useState(
    HERO_DATA.videoModal.highlights[0]?.id ?? ''
  );

  const handleClose = useCallback(() => {
    onClose();
    window.requestAnimationFrame(() => {
      triggerRef?.current?.focus();
    });
  }, [onClose, triggerRef]);

  useFocusTrap(modalRef, isOpen, handleClose, triggerRef);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setIsPlayingPreview(true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            aria-hidden="true"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 bg-midnight/85 backdrop-blur-sm"
          />

          {/* Modal Dialog Surface */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shared-video-modal-title"
            initial={
              prefersReducedMotion
                ? { opacity: 1, scale: 1, y: 0 }
                : { opacity: 0, scale: 0.96, y: 12 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0, scale: 1, y: 0 }
                : { opacity: 0, scale: 0.96, y: 12 }
            }
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-3xl rounded-3xl bg-slate-navy border border-cloud-border p-5 sm:p-8 shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-signal" />
                  <span className="font-display text-xs font-bold uppercase tracking-widest text-cloud">
                    {HERO_DATA.videoModal.badge}
                  </span>
                </div>
                <h2
                  id="shared-video-modal-title"
                  className="text-fluid-h3 font-display font-extrabold uppercase text-cloud"
                >
                  {HERO_DATA.videoModal.titleBefore}
                  <span className="text-signal">{HERO_DATA.videoModal.titleHighlight}</span>
                  {HERO_DATA.videoModal.titleAfter}
                </h2>
              </div>

              <button
                type="button"
                aria-label={HERO_DATA.videoModal.closeAriaLabel}
                onClick={handleClose}
                className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-midnight/80 border border-cloud-border text-cloud hover:border-signal transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal cursor-pointer shrink-0"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            {/* Self-Contained Placeholder Video Frame (No External Embed) */}
            <div className="relative overflow-hidden rounded-2xl border border-cloud-border bg-midnight aspect-video flex flex-col justify-between p-5 sm:p-7">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-midnight via-slate-navy/75 to-signal/20"
              />

              {/* Top Frame Status Row */}
              <div className="relative z-10 flex items-center justify-between gap-4 text-xs">
                <span className="font-display font-bold uppercase tracking-wider text-cloud">
                  {HERO_DATA.videoModal.resolutionLabel}
                </span>
                <span className="font-display font-bold text-cloud tabular-nums">
                  {HERO_DATA.videoModal.durationLabel}
                </span>
              </div>

              {/* Center Play/Pause Interactive Control */}
              <div className="relative z-10 my-auto flex flex-col items-center text-center">
                <button
                  type="button"
                  aria-label={
                    isPlayingPreview
                      ? HERO_DATA.videoModal.pausePreviewLabel
                      : HERO_DATA.videoModal.playPreviewLabel
                  }
                  onClick={() => setIsPlayingPreview((prev) => !prev)}
                  className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-signal text-cloud hover:bg-signal-hover hover:shadow-signal-glow transition-[transform,background-color,box-shadow] duration-150 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud cursor-pointer"
                >
                  {isPlayingPreview ? (
                    <Pause aria-hidden="true" className="h-7 w-7 fill-current" />
                  ) : (
                    <Play aria-hidden="true" className="h-7 w-7 fill-current ml-0.5" />
                  )}
                </button>
                <p className="mt-3 text-xs sm:text-sm font-medium text-cloud">
                  {isPlayingPreview
                    ? HERO_DATA.videoModal.playingStatusText
                    : HERO_DATA.videoModal.pausedStatusText}
                </p>
              </div>

              {/* Bottom Scrubber & Chapter Markers */}
              <div className="relative z-10 space-y-3">
                <div className="h-1.5 w-full rounded-full bg-slate-navy overflow-hidden">
                  <motion.div
                    className="h-full w-full bg-signal origin-left"
                    initial={{ scaleX: 0.35 }}
                    animate={{
                      scaleX:
                        activeHighlightId === 'zone-1'
                          ? 0.25
                          : activeHighlightId === 'zone-2'
                          ? 0.6
                          : 0.92,
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {HERO_DATA.videoModal.highlights.map((item) => {
                    const isSelected = activeHighlightId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveHighlightId(item.id)}
                        className={[
                          'flex min-h-[44px] items-center gap-2 rounded-xl px-3 py-2 text-left text-xs transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal',
                          isSelected
                            ? 'bg-slate-navy border border-signal text-cloud'
                            : 'bg-midnight/70 border border-cloud-border text-cloud-muted hover:text-cloud',
                        ].join(' ')}
                      >
                        <span className="rounded bg-signal px-1.5 py-0.5 font-display text-[11px] font-bold text-cloud tabular-nums shrink-0">
                          {item.timestamp}
                        </span>
                        <span className="truncate">{item.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer Description + Action */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-sm text-cloud-muted max-w-lg">
                {HERO_DATA.videoModal.subtitle}
              </p>
              <Button
                variant="primary"
                size="md"
                showArrow
                onClick={() => {
                  handleClose();
                  onPrimaryAction?.();
                }}
              >
                {HERO_DATA.videoModal.ctaLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
