/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy, useCallback, useState } from 'react';
import { AllowedPlanOption } from './data/contact';
import { PlanTier } from './data/plans';
import { SITE_NAVIGATION } from './data/siteData';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { OwnerConsole } from './components/OwnerConsole';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { Container } from './components/ui/Container';
import { Hero } from './sections/Hero';

// Lazy-load below-the-fold sections for fast initial paint while keeping Hero and Navbar eager
const About = lazy(() => import('./sections/About'));
const Services = lazy(() => import('./sections/Services'));
const WhyChooseUs = lazy(() => import('./sections/WhyChooseUs'));
const Trainers = lazy(() => import('./sections/Trainers'));
const Plans = lazy(() => import('./sections/Plans'));
const Locations = lazy(() => import('./sections/Locations'));
const Gallery = lazy(() => import('./sections/Gallery'));
const Testimonials = lazy(() => import('./sections/Testimonials'));
const FAQ = lazy(() => import('./sections/FAQ'));
const Contact = lazy(() => import('./sections/Contact'));
const CTA = lazy(() => import('./sections/CTA'));

function SectionSkeleton({ id, minHeightClass = 'min-h-[520px]' }: { id?: string; minHeightClass?: string }) {
  return (
    <div id={id} className={`py-20 md:py-28 bg-midnight scroll-mt-24 ${minHeightClass}`}>
      <Container>
        <div className="h-8 w-44 rounded-lg bg-slate-navy/60 mb-4" />
        <div className="h-12 w-full max-w-xl rounded-xl bg-slate-navy/60 mb-10" />
        <div className="h-80 w-full rounded-3xl bg-slate-navy/40 border border-cloud-border" />
      </Container>
    </div>
  );
}

export default function App() {
  const [selectedPlan, setSelectedPlan] = useState<AllowedPlanOption>('Standard');

  const handleFreeTrialClick = useCallback(() => {
    const contactElement = document.getElementById('contact');
    contactElement?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSelectPlan = useCallback((plan: PlanTier) => {
    const formattedPlan = (plan.name.charAt(0).toUpperCase() +
      plan.name.slice(1).toLowerCase()) as AllowedPlanOption;
    setSelectedPlan(formattedPlan);
  }, []);

  return (
    <ErrorBoundary>
      <div
        id="top"
        className="min-h-screen flex flex-col bg-midnight text-cloud selection:bg-signal selection:text-cloud"
      >
        {/* First Focusable Element: Accessible Skip to Main Content Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:inline-flex focus:min-h-[44px] focus:items-center focus:rounded-xl focus:bg-signal focus:px-5 focus:py-3 focus:font-display focus:text-sm focus:font-bold focus:uppercase focus:tracking-wider focus:text-cloud focus:shadow-signal-glow focus:outline-none focus:ring-2 focus:ring-cloud"
        >
          {SITE_NAVIGATION.skipToContentLabel}
        </a>

        <ScrollProgressBar />

        <Navbar onFreeTrialClick={handleFreeTrialClick} />

        <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
          <Hero />

          <Suspense fallback={<SectionSkeleton id="about" />}>
            <About />
          </Suspense>

          <Suspense fallback={<SectionSkeleton id="services" />}>
            <Services />
          </Suspense>

          <Suspense fallback={<SectionSkeleton id="why-us" />}>
            <WhyChooseUs />
          </Suspense>

          <Suspense fallback={<SectionSkeleton id="trainers" />}>
            <Trainers />
          </Suspense>

          <Suspense fallback={<SectionSkeleton id="plans" />}>
            <Plans onSelectPlan={handleSelectPlan} />
          </Suspense>

          <Suspense fallback={<SectionSkeleton id="locations" />}>
            <Locations />
          </Suspense>

          <Suspense fallback={<SectionSkeleton id="gallery" />}>
            <Gallery />
          </Suspense>

          <Suspense fallback={<SectionSkeleton id="testimonials" />}>
            <Testimonials />
          </Suspense>

          <Suspense fallback={<SectionSkeleton id="faq" />}>
            <FAQ />
          </Suspense>

          <Suspense fallback={<SectionSkeleton id="contact" />}>
            <Contact selectedPlan={selectedPlan} />
          </Suspense>

          <Suspense fallback={<SectionSkeleton id="cta" minHeightClass="min-h-[360px]" />}>
            <CTA />
          </Suspense>
        </main>

        <Footer />

        {/* Owner-Only Private Console — Strictly unmounted on the Public Visitor URL */}
        <OwnerConsole selectedPlan={selectedPlan} onOwnerSelectPlan={setSelectedPlan} />
      </div>
    </ErrorBoundary>
  );
}
