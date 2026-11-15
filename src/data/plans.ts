export interface PlanTier {
  id: 'basic' | 'standard' | 'premium';
  name: string;
  price: string;
  period: string;
  tagline: string;
  featured: boolean;
  popularBadge?: string;
  features: string[];
  ctaLabel: string;
  ctaTargetId: string;
  mobileOrderClass: string;
}

export interface PlansData {
  eyebrow: string;
  headingBefore: string;
  headingHighlight: string;
  headingAfter: string;
  tiers: PlanTier[];
}

export const PLANS_DATA: PlansData = {
  eyebrow: 'SUBSCRIPTIONS',
  headingBefore: 'FLEXIBLE ',
  headingHighlight: 'PLANS',
  headingAfter: ' FOR EVERY GOAL',
  tiers: [
    {
      id: 'basic',
      name: 'BASIC',
      price: '$25',
      period: '/month',
      tagline: 'Ideal for casual gym-goers',
      featured: false,
      features: [
        'Unlimited access to the gym',
        '1 free group class per month',
        'Free access to relaxation areas',
      ],
      ctaLabel: 'Get Started',
      ctaTargetId: 'contact',
      mobileOrderClass: 'order-2 lg:order-1',
    },
    {
      id: 'standard',
      name: 'STANDARD',
      price: '$35',
      period: '/month',
      tagline: 'Best for regular members',
      featured: true,
      popularBadge: 'MOST POPULAR',
      features: [
        'Everything in Basic',
        '3 free group classes per month',
        'Free access to relaxation areas and sauna',
      ],
      ctaLabel: 'Get Started',
      ctaTargetId: 'contact',
      mobileOrderClass: 'order-1 lg:order-2',
    },
    {
      id: 'premium',
      name: 'PREMIUM',
      price: '$45',
      period: '/month',
      tagline: 'For serious results',
      featured: false,
      features: [
        'Unlimited access to the gym',
        'Unlimited group classes',
        '2 personal training sessions per month',
        'Free access to relaxation areas, sauna and pool',
      ],
      ctaLabel: 'Get Started',
      ctaTargetId: 'contact',
      mobileOrderClass: 'order-3 lg:order-3',
    },
  ],
};
