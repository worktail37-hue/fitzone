export interface WhyChooseUsItem {
  id: string;
  titleHighlight: string;
  titleRest: string;
  fullTitle: string;
  description: string;
}

export interface WhyChooseUsData {
  eyebrow: string;
  headingBefore: string;
  headingHighlight: string;
  headingAfter: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
    fallbackTitle: string;
    fallbackSubtitle: string;
  };
  ratingBadge: {
    score: string;
    label: string;
    stars: number;
    ariaLabel: string;
  };
  accordionAriaLabel: string;
  items: WhyChooseUsItem[];
}

export const WHY_CHOOSE_US_DATA: WhyChooseUsData = {
  eyebrow: 'WHY CHOOSE US',
  headingBefore: 'WHY CHOOSE US FOR YOUR ',
  headingHighlight: 'FITNESS',
  headingAfter: ' JOURNEY?',
  image: {
    src: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=75',
    alt: 'Focused athlete preparing for a heavy barbell deadlift inside the dark lit FITZONE strength arena',
    width: 760,
    height: 950,
    fallbackTitle: 'FITZONE PERFORMANCE ADVANTAGE',
    fallbackSubtitle: 'Championship Equipment · Certified Coaches · Proven Results',
  },
  ratingBadge: {
    score: '4.9/5',
    label: 'Member Rating',
    stars: 5,
    ariaLabel: 'Rated 4.9 out of 5 stars by FITZONE members',
  },
  accordionAriaLabel: 'Reasons to choose FITZONE',
  items: [
    {
      id: 'why-equipment',
      titleHighlight: 'State-of-the-Art',
      titleRest: ' Equipment',
      fullTitle: 'State-of-the-Art Equipment',
      description:
        'Train on competition-calibrated Eleiko barbells, custom power racks, biomechanical plate-loaded machines, and dedicated sprint turf lanes engineered for safe progressive overload.',
    },
    {
      id: 'why-trainers',
      titleHighlight: 'Expert',
      titleRest: ' Trainers',
      fullTitle: 'Expert Trainers',
      description:
        'Work directly with CSCS-certified strength coaches, sports nutritionists, and mobility specialists who build data-backed periodization programs tailored to your physiology.',
    },
    {
      id: 'why-classes',
      titleHighlight: 'Wide Range',
      titleRest: ' of Classes',
      fullTitle: 'Wide Range of Classes',
      description:
        'Choose from over 60 weekly coach-led sessions spanning Olympic lifting, metabolic HIIT circuits, heated lap swimming, athletic conditioning, and guided contrast recovery.',
    },
    {
      id: 'why-community',
      titleHighlight: 'Welcoming',
      titleRest: ' Community',
      fullTitle: 'Welcoming Community',
      description:
        'Step into an ego-free, high-accountability training culture where first-time lifters and competitive athletes push each other toward measurable personal records.',
    },
  ],
};
