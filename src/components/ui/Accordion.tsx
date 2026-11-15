import { KeyboardEvent as ReactKeyboardEvent, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

export interface AccordionItemData {
  id: string;
  titleHighlight: string;
  titleRest: string;
  fullTitle: string;
  description: string;
}

export interface AccordionProps {
  items: AccordionItemData[];
  ariaLabel: string;
  defaultOpenId?: string | null;
  allowAllClosed?: boolean;
  idPrefix?: string;
  className?: string;
  onItemChange?: (item: AccordionItemData, isOpen: boolean) => void;
}

/**
 * Shared accessible single-open Accordion component used by WhyChooseUs and FAQ.
 * Animates only opacity and transform (translateY) for 60fps compositor performance.
 */
export function Accordion({
  items,
  ariaLabel,
  defaultOpenId = null,
  allowAllClosed = true,
  idPrefix = 'accordion',
  className = '',
  onItemChange,
}: AccordionProps) {
  const prefersReducedMotion = useReducedMotion();
  const [openId, setOpenId] = useState<string | null>(defaultOpenId);
  const headerButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  if (!items || items.length === 0) {
    return null;
  }

  const handleToggleItem = (item: AccordionItemData) => {
    setOpenId((prevId) => {
      const isCurrentlyOpen = prevId === item.id;
      const nextId = isCurrentlyOpen ? (allowAllClosed ? null : item.id) : item.id;
      onItemChange?.(item, nextId === item.id);
      return nextId;
    });
  };

  const handleHeaderKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    const total = items.length;
    if (total === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = (index + 1) % total;
      headerButtonRefs.current[nextIndex]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = (index - 1 + total) % total;
      headerButtonRefs.current[prevIndex]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      headerButtonRefs.current[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      headerButtonRefs.current[total - 1]?.focus();
    }
  };

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={`space-y-3.5 ${className}`.trim()}
    >
      {items.map((item, idx) => {
        const isOpen = openId === item.id;
        const buttonId = `${idPrefix}-header-${item.id}`;
        const panelId = `${idPrefix}-panel-${item.id}`;

        return (
          <div
            key={item.id}
            className={[
              'rounded-xl bg-slate-navy border transition-colors duration-150',
              isOpen
                ? 'border-signal/45'
                : 'border-cloud-border hover:border-cloud/25',
            ].join(' ')}
          >
            <h3>
              <button
                ref={(el) => {
                  headerButtonRefs.current[idx] = el;
                }}
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => handleToggleItem(item)}
                onKeyDown={(e) => handleHeaderKeyDown(e, idx)}
                className="flex w-full min-h-[56px] items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 text-left font-display text-lg sm:text-xl font-extrabold uppercase tracking-tight text-cloud cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-midnight"
              >
                <span>
                  <span className={isOpen ? 'text-signal' : 'text-cloud'}>
                    {item.titleHighlight}
                  </span>
                  <span>{item.titleRest}</span>
                </span>

                <span
                  aria-hidden="true"
                  className={[
                    'inline-flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border transition-[transform,background-color,border-color] duration-200 ease-out',
                    isOpen
                      ? 'rotate-45 bg-signal border-signal text-cloud'
                      : 'rotate-0 bg-midnight/70 border-cloud-border text-cloud',
                  ].join(' ')}
                >
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={
                    prefersReducedMotion
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: -6 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={
                    prefersReducedMotion
                      ? { opacity: 0, y: 0 }
                      : { opacity: 0, y: -6 }
                  }
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { duration: 0.22, ease: 'easeOut' }
                  }
                  className="px-5 pb-5 sm:px-6 sm:pb-6 pt-3 border-t border-cloud-border/60"
                >
                  <p className="text-sm sm:text-base text-cloud-muted leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
