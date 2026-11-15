export interface ServiceItem {
  id: string;
  title: string;
  categoryTag: string;
  shortSummary: string;
  imageSrc: string;
  imageAlt: string;
  width: number;
  height: number;
  ctaAriaLabel: string;
}

export interface ServicesData {
  eyebrow: string;
  headingBefore: string;
  headingHighlight: string;
  headingAfter: string;
  description: string;
  carouselAriaLabel: string;
  prevButtonAriaLabel: string;
  nextButtonAriaLabel: string;
  progressAriaLabel: string;
  fallbackSubtitle: string;
  items: ServiceItem[];
}

export const SERVICES_DATA: ServicesData = {
  eyebrow: 'OUR SERVICES',
  headingBefore: 'UNLEASH YOUR POTENTIAL: ',
  headingHighlight: 'PREMIUM FITNESS SERVICES',
  headingAfter: ' TAILORED FOR YOU',
  description:
    'We offer personalized fitness services to help you reach your goals, from one-on-one coaching to high-energy classes and recovery sessions.',
  carouselAriaLabel: 'Services carousel',
  prevButtonAriaLabel: 'Scroll to previous service card',
  nextButtonAriaLabel: 'Scroll to next service card',
  progressAriaLabel: 'Services carousel scroll progress',
  fallbackSubtitle: 'FITZONE Performance Discipline',
  items: [
    {
      id: 'personal-training',
      title: 'Personal Training',
      categoryTag: '01 · 1-on-1 Coaching',
      shortSummary: 'Custom periodized strength and conditioning blocks with CSCS coaches.',
      imageSrc:
        'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=75',
      imageAlt:
        'Personal trainer guiding an athlete through heavy barbell form inside the dark FITZONE training studio',
      width: 640,
      height: 800,
      ctaAriaLabel: 'Explore Personal Training membership options',
    },
    {
      id: 'fitness-classes',
      title: 'Fitness Classes',
      categoryTag: '02 · High-Energy Group',
      shortSummary: 'Metabolic conditioning, HIIT turf circuits, and team endurance sessions.',
      imageSrc:
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=75',
      imageAlt:
        'Group of athletes performing synchronized high-intensity conditioning drills in a moody gym class',
      width: 640,
      height: 800,
      ctaAriaLabel: 'Explore Fitness Classes membership options',
    },
    {
      id: 'swim-training',
      title: 'Swim Training',
      categoryTag: '03 · 25m Heated Pool',
      shortSummary: 'Low-impact cardiovascular endurance and triathlon stroke mechanics.',
      imageSrc:
        'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=75',
      imageAlt:
        'Competitive swimmer cutting through the water in a dark indoor championship lap pool',
      width: 640,
      height: 800,
      ctaAriaLabel: 'Explore Swim Training membership options',
    },
    {
      id: 'strength-training',
      title: 'Strength Training',
      categoryTag: '04 · Olympic Lifting',
      shortSummary: 'Calibrated competition racks, specialty bars, and hypertrophy machines.',
      imageSrc:
        'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=75',
      imageAlt:
        'Muscular athlete lifting heavy dumbbells on the FITZONE free-weight strength floor',
      width: 640,
      height: 800,
      ctaAriaLabel: 'Explore Strength Training membership options',
    },
    {
      id: 'yoga-and-recovery',
      title: 'Yoga and Recovery',
      categoryTag: '05 · Mobility & CNS Reset',
      shortSummary: 'Guided mobility flows, breathwork, contrast cold plunge, and infrared sauna.',
      imageSrc:
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=75',
      imageAlt:
        'Athlete practicing deep mobility and recovery stretching in a calm studio space',
      width: 640,
      height: 800,
      ctaAriaLabel: 'Explore Yoga and Recovery membership options',
    },
    {
      id: 'nutrition-coaching',
      title: 'Nutrition Coaching',
      categoryTag: '06 · Macro & Fueling',
      shortSummary: 'DEXA-informed body recomposition and performance fueling protocols.',
      imageSrc:
        'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=75',
      imageAlt:
        'High-protein athlete performance meal preparation with fresh whole ingredients',
      width: 640,
      height: 800,
      ctaAriaLabel: 'Explore Nutrition Coaching membership options',
    },
  ],
};
