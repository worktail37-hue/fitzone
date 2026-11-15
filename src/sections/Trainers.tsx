import { memo } from 'react';
import { TRAINERS_DATA } from '../data/trainers';
import {
  CalendlyCarousel,
  CarouselItem,
} from '@/components/ui/connected-carousel';
import { Container } from '../components/ui/Container';
import { Reveal } from '../components/ui/Reveal';
import { SectionHeading } from '../components/ui/SectionHeading';

const TRAINER_CAROUSEL_ITEMS: CarouselItem[] = TRAINERS_DATA.items.map(
  (trainer) => ({
    id: trainer.id,
    stat: trainer.name,
    quote: trainer.quote,
    author: trainer.name,
    role: trainer.experience,
    defaultImage: trainer.imageSrc,
    selectedImage: trainer.imageSrc,
    alt: trainer.imageAlt,
    badge: trainer.specialty,
    socials: trainer.socials,
  })
);

export const Trainers = memo(function Trainers() {
  return (
    <section
      id="trainers"
      aria-labelledby="trainers-section-heading"
      className="relative bg-midnight py-20 md:py-28 overflow-hidden scroll-mt-24"
    >
      {/* Faint Deep Slate Navy Gradient Band in the Middle for Separation */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-midnight via-slate-navy/45 to-midnight"
      />

      <Container className="relative z-10">
        {/* Centered SectionHeading */}
        <Reveal>
          <SectionHeading
            id="trainers-section-heading"
            as="h2"
            align="center"
            eyebrow={TRAINERS_DATA.eyebrow}
            titleBefore={TRAINERS_DATA.headingBefore}
            titleHighlight={TRAINERS_DATA.headingHighlight}
            titleAfter={TRAINERS_DATA.headingAfter}
            subtext={TRAINERS_DATA.subtext}
          />
        </Reveal>

        {/* Connected Spring-Physics Trainer Carousel */}
        <Reveal delay={0.1} className="mt-12 md:mt-16">
          <CalendlyCarousel
            items={TRAINER_CAROUSEL_ITEMS}
            autoPlayInterval={6000}
            pauseOnHover={true}
            ariaLabel="FITZONE expert trainers carousel"
          />
        </Reveal>
      </Container>
    </section>
  );
});

export default Trainers;
