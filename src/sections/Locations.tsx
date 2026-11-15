import { memo, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { Globe, MapPin } from 'lucide-react';
import { LOCATIONS_DATA, LocationMarker } from '../data/locations';
import { useAnimationActive } from '../hooks/useAnimationActive';
import { Container } from '../components/ui/Container';
import { Reveal } from '../components/ui/Reveal';
import { SectionHeading } from '../components/ui/SectionHeading';

export interface LocationsProps {
  onSelectLocation?: (marker: LocationMarker) => void;
}

export const Locations = memo(function Locations({
  onSelectLocation,
}: LocationsProps) {
  const prefersReducedMotion = useReducedMotion();
  const mapWrapperRef = useRef<HTMLDivElement | null>(null);
  const isPulseActive = useAnimationActive(mapWrapperRef, 0.05);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>('loc-new-york');

  const handleMarkerActivate = (marker: LocationMarker) => {
    setActiveMarkerId(marker.id);
    onSelectLocation?.(marker);
  };

  return (
    <section
      id="locations"
      aria-labelledby="locations-section-heading"
      className="relative bg-midnight py-20 md:py-28 overflow-hidden scroll-mt-24"
    >
      <Container>
        {/* Top Intro Block */}
        <Reveal>
          <div className="max-w-4xl">
            <SectionHeading
              id="locations-section-heading"
              as="h2"
              eyebrow={LOCATIONS_DATA.eyebrow}
              titleBefore={LOCATIONS_DATA.headingBefore}
              titleHighlight={LOCATIONS_DATA.headingHighlight}
              titleAfter={LOCATIONS_DATA.headingAfter}
            />

            {/* Left-Aligned "23+ Countries" Stat Beside Intro Paragraph */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8 pt-6 border-t border-cloud-border">
              <div
                aria-label={LOCATIONS_DATA.statAriaLabel}
                className="shrink-0 sm:pr-8 sm:border-r sm:border-cloud-border"
              >
                <span className="sr-only">{LOCATIONS_DATA.statAriaLabel}</span>
                <p
                  aria-hidden="true"
                  className="font-display text-4xl sm:text-5xl font-extrabold uppercase leading-none text-signal tabular-nums"
                >
                  {LOCATIONS_DATA.statValue}
                </p>
                <p
                  aria-hidden="true"
                  className="mt-1.5 font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-cloud"
                >
                  {LOCATIONS_DATA.statLabel}
                </p>
              </div>

              <p className="text-fluid-body text-cloud-muted leading-relaxed">
                {LOCATIONS_DATA.description}
              </p>
            </div>
          </div>
        </Reveal>

        {/* Mobile Swipe Hint (< 640px) */}
        <div className="mt-10 mb-3 flex items-center justify-between sm:hidden text-xs text-cloud-muted">
          <span className="inline-flex items-center gap-1.5">
            <Globe aria-hidden="true" className="h-3.5 w-3.5 text-signal" />
            <span>{LOCATIONS_DATA.mobileSwipeHint}</span>
          </span>
        </div>

        {/* Dotted World Map Container (Horizontally Scrollable on < 640px, Min-Width 640px) */}
        <Reveal delay={0.15} className="mt-4 sm:mt-12">
          <div
            ref={mapWrapperRef}
            className={[
              'w-full overflow-x-auto rounded-3xl bg-slate-navy/45 border border-cloud-border p-4 sm:p-6 lg:p-8',
              '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
              !isPulseActive ? 'map-pulse-paused' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className="relative min-w-[640px] w-full aspect-[2/1]">
              {/* Single Inline Dotted World Map SVG (Under 20 Total SVG Elements) */}
              <svg
                viewBox="0 0 1000 500"
                role="img"
                aria-label={LOCATIONS_DATA.mapAriaLabel}
                className="w-full h-auto block select-none pointer-events-none"
              >
                <defs>
                  <pattern
                    id="fitzone-world-dots"
                    width="12"
                    height="12"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle
                      cx="6"
                      cy="6"
                      r="2"
                      className="fill-cloud opacity-[0.18]"
                    />
                  </pattern>

                  <clipPath id="fitzone-continents-clip">
                    {(LOCATIONS_DATA.continents ?? []).map((continent) => (
                      <path key={continent.id} d={continent.d} />
                    ))}
                  </clipPath>
                </defs>

                {/* Subtle Latitude / Longitude Reference Hairlines */}
                <line
                  x1="40"
                  y1="250"
                  x2="960"
                  y2="250"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  strokeDasharray="4 8"
                  className="text-cloud opacity-[0.07]"
                />
                <line
                  x1="500"
                  y1="30"
                  x2="500"
                  y2="470"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  strokeDasharray="4 8"
                  className="text-cloud opacity-[0.07]"
                />

                {/* Dotted Continents Layer */}
                <rect
                  x="0"
                  y="0"
                  width="1000"
                  height="500"
                  fill="url(#fitzone-world-dots)"
                  clipPath="url(#fitzone-continents-clip)"
                />
              </svg>

              {/* 12 Interactive Signal Red City Markers (44px Touch Target Wrapper) */}
              <div className="absolute inset-0">
                {(LOCATIONS_DATA.markers ?? []).map((marker, idx) => {
                  const isActive = activeMarkerId === marker.id;

                  const horizontalAlignClass =
                    marker.xPercent < 22
                      ? 'left-0 translate-x-0'
                      : marker.xPercent > 78
                      ? 'right-0 translate-x-0'
                      : 'left-1/2 -translate-x-1/2';

                  const verticalAlignClass =
                    marker.yPercent < 28 ? 'top-full mt-1.5' : 'bottom-full mb-1.5';

                  return (
                    <div
                      key={marker.id}
                      style={{
                        left: `${marker.xPercent}%`,
                        top: `${marker.yPercent}%`,
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                    >
                      <button
                        type="button"
                        aria-label={`FITZONE ${marker.city}, ${marker.country} (${marker.clubCountLabel})`}
                        aria-expanded={isActive}
                        onMouseEnter={() => handleMarkerActivate(marker)}
                        onFocus={() => handleMarkerActivate(marker)}
                        onClick={() => handleMarkerActivate(marker)}
                        onBlur={() =>
                          setActiveMarkerId((prev) => (prev === marker.id ? null : prev))
                        }
                        className="group relative flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud cursor-pointer"
                      >
                        {/* Pulsing Outer Ring (Paused When Out of View, Tab Hidden, or Reduced Motion) */}
                        {!prefersReducedMotion && (
                          <span
                            aria-hidden="true"
                            style={{ animationDelay: `${idx * 0.2}s` }}
                            className="marker-pulse-ring pointer-events-none absolute h-5 w-5 rounded-full bg-signal"
                          />
                        )}

                        {/* Soft Static Halo */}
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute h-5 w-5 rounded-full bg-signal/35 transition-transform duration-150 group-hover:scale-125"
                        />

                        {/* Core Signal Red Dot */}
                        <span
                          aria-hidden="true"
                          className="relative z-10 h-2.5 w-2.5 rounded-full bg-signal ring-2 ring-cloud transition-transform duration-150 group-hover:scale-125"
                        />
                      </button>

                      {/* Edge-Safe Deep Slate Navy Tooltip */}
                      {isActive && (
                        <div
                          role="status"
                          className={`pointer-events-none absolute z-30 ${horizontalAlignClass} ${verticalAlignClass} rounded-xl bg-slate-navy border border-signal/60 px-3.5 py-2 shadow-xl whitespace-nowrap`}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin
                              aria-hidden="true"
                              className="h-3.5 w-3.5 text-signal shrink-0"
                            />
                            <span className="font-display text-xs font-extrabold uppercase tracking-wider text-cloud">
                              {marker.city}
                            </span>
                            <span aria-hidden="true" className="text-cloud-muted text-xs">
                              ·
                            </span>
                            <span className="text-xs text-cloud-muted">{marker.country}</span>
                          </div>
                          <p className="mt-0.5 text-[11px] font-medium text-cloud-muted">
                            {marker.clubCountLabel}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
});

export default Locations;
