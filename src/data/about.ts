export interface AboutStatItem {
  id: string;
  target: number;
  suffix: string;
  label: string;
  ariaLabel: string;
}

export interface AboutData {
  eyebrow: string;
  headingBefore: string;
  headingHighlight: string;
  headingAfter: string;
  description: string;
  statsAriaLabel: string;
  stats: AboutStatItem[];
  videoFeature: {
    imageSrc: string;
    imageAlt: string;
    width: number;
    height: number;
    playButtonAriaLabel: string;
    captionTitle: string;
    captionSubtitle: string;
    durationBadge: string;
    fallbackTitle: string;
    fallbackSubtitle: string;
  };
}

export const ABOUT_DATA: AboutData = {
  eyebrow: 'ABOUT US',
  headingBefore: 'YOUR ',
  headingHighlight: 'FITNESS',
  headingAfter: ' JOURNEY STARTS HERE',
  description:
    'At FITZONE, we are dedicated to helping you reach your full fitness potential. With top-tier equipment, expert trainers, and a welcoming community, we provide the perfect environment to push your limits and achieve your goals.',
  statsAriaLabel: 'FITZONE key performance statistics',
  stats: [
    {
      id: 'stat-years',
      target: 12,
      suffix: '+',
      label: 'Years of Excellence',
      ariaLabel: '12 plus years of excellence',
    },
    {
      id: 'stat-members',
      target: 27,
      suffix: 'K+',
      label: 'Members',
      ariaLabel: '27 thousand plus members',
    },
    {
      id: 'stat-classes',
      target: 60,
      suffix: '+',
      label: 'Weekly Classes',
      ariaLabel: '60 plus weekly classes',
    },
    {
      id: 'stat-trainers',
      target: 117,
      suffix: '+',
      label: 'Expert Trainers',
      ariaLabel: '117 plus expert trainers',
    },
  ],
  videoFeature: {
    imageSrc:
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=75',
    imageAlt:
      'Wide view of the moody FITZONE strength and conditioning floor featuring competition racks and dramatic lighting',
    width: 1400,
    height: 680,
    playButtonAriaLabel: 'Play FITZONE gym interior walkthrough video',
    captionTitle: 'STEP INSIDE OUR CHAMPIONSHIP TRAINING FLOOR',
    captionSubtitle: '24,000 sq ft of calibrated free weights, turf sprint lanes, and recovery labs',
    durationBadge: '02:14 · 4K TOUR',
    fallbackTitle: 'FITZONE CHAMPIONSHIP TRAINING ARENA',
    fallbackSubtitle: 'Calibrated Strength, Turf Conditioning & Recovery Suite',
  },
};
