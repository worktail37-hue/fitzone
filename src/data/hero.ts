export interface HeroFloatingStat {
  id: string;
  value: string;
  label: string;
  position: 'top-left' | 'bottom-right';
}

export interface HeroAvatarPlaceholder {
  id: string;
  initials: string;
  label: string;
}

export interface HeroData {
  badgeText: string;
  headingBefore: string;
  headingHighlight: string;
  headingAfter: string;
  description: string;
  primaryCta: {
    label: string;
    targetId: string;
  };
  secondaryCta: {
    label: string;
    ariaLabel: string;
  };
  socialProof: {
    avatars: HeroAvatarPlaceholder[];
    ratingStars: number;
    ratingAriaLabel: string;
    summaryScore: string;
    summaryText: string;
  };
  tagsLabel: string;
  tags: string[];
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
    fallbackLabel: string;
    fallbackSubtext: string;
  };
  floatingStats: HeroFloatingStat[];
  videoModal: {
    badge: string;
    titleBefore: string;
    titleHighlight: string;
    titleAfter: string;
    subtitle: string;
    durationLabel: string;
    resolutionLabel: string;
    closeAriaLabel: string;
    playPreviewLabel: string;
    pausePreviewLabel: string;
    playingStatusText: string;
    pausedStatusText: string;
    highlights: {
      id: string;
      timestamp: string;
      title: string;
    }[];
    ctaLabel: string;
  };
}

export const HERO_DATA: HeroData = {
  badgeText: '#1 FITNESS CLUB IN YOUR CITY',
  headingBefore: 'PUSH YOUR ',
  headingHighlight: 'LIMITS',
  headingAfter: ' WITH US',
  description:
    'From beginner to advanced, experience workouts designed to help you achieve peak performance and exceed your fitness goals.',
  primaryCta: {
    label: 'Join Now',
    targetId: 'plans',
  },
  secondaryCta: {
    label: 'Watch Video',
    ariaLabel: 'Watch FITZONE facility and training overview video',
  },
  socialProof: {
    avatars: [
      { id: 'member-1', initials: 'MK', label: 'Member Marcus K.' },
      { id: 'member-2', initials: 'SR', label: 'Member Elena R.' },
      { id: 'member-3', initials: 'JD', label: 'Member Devon J.' },
    ],
    ratingStars: 5,
    ratingAriaLabel: 'Rated 5 out of 5 stars by members',
    summaryScore: '12K+',
    summaryText: 'happy members',
  },
  tagsLabel: 'Training disciplines and amenities',
  tags: [
    'Personal Training',
    'Strength',
    'Group Classes',
    'Swimming',
    'Cardio Equipment',
    'Functional Workouts',
  ],
  image: {
    src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=75',
    alt: 'Muscular athlete performing high-intensity strength training inside the dark lit FITZONE performance gym',
    width: 800,
    height: 1000,
    fallbackLabel: 'FITZONE PERFORMANCE FLOOR',
    fallbackSubtext: 'High-Performance Strength & Conditioning Club',
  },
  floatingStats: [
    {
      id: 'stat-members',
      value: '27K+',
      label: 'Members',
      position: 'top-left',
    },
    {
      id: 'stat-classes',
      value: '60+',
      label: 'Weekly Classes',
      position: 'bottom-right',
    },
  ],
  videoModal: {
    badge: 'FITZONE FACILITY TOUR',
    titleBefore: 'INSIDE THE ',
    titleHighlight: 'ARENA',
    titleAfter: ' OF STRENGTH',
    subtitle:
      'Explore our 24,000 sq ft Olympic lifting deck, metabolic turf lanes, heated lap pool, and contrast recovery suite.',
    durationLabel: '02:14',
    resolutionLabel: '4K HDR PREVIEW',
    closeAriaLabel: 'Close video modal',
    playPreviewLabel: 'Play Preview',
    pausePreviewLabel: 'Pause Preview',
    playingStatusText: 'Playing facility walkthrough reel...',
    pausedStatusText: 'Preview paused — press play to inspect training zones',
    highlights: [
      { id: 'zone-1', timestamp: '00:15', title: 'Olympic Free-Weight & Power Racks' },
      { id: 'zone-2', timestamp: '00:58', title: 'High-Intensity Metabolic Turf Track' },
      { id: 'zone-3', timestamp: '01:36', title: '25m Indoor Lap Pool & Cold Plunge' },
    ],
    ctaLabel: 'Claim Free Trial Pass',
  },
};
