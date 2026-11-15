export interface TestimonialItem {
  id: string;
  quote: string;
  name: string;
  initials: string;
  memberTenure: string;
  rating: number;
  avatarSrc: string;
  avatarAlt: string;
}

export interface TestimonialsData {
  eyebrow: string;
  headingBefore: string;
  headingHighlight: string;
  headingAfter: string;
  carouselAriaLabel: string;
  prevButtonAriaLabel: string;
  nextButtonAriaLabel: string;
  pauseAutoplayAriaLabel: string;
  playAutoplayAriaLabel: string;
  pauseButtonText: string;
  playButtonText: string;
  ratingAriaLabel: string;
  items: TestimonialItem[];
}

export const TESTIMONIALS_DATA: TestimonialsData = {
  eyebrow: 'TESTIMONIALS',
  headingBefore: 'WHAT OUR ',
  headingHighlight: 'MEMBERS',
  headingAfter: ' SAY',
  carouselAriaLabel: 'Member testimonials',
  prevButtonAriaLabel: 'Previous testimonial slide',
  nextButtonAriaLabel: 'Next testimonial slide',
  pauseAutoplayAriaLabel: 'Pause automatic testimonial rotation',
  playAutoplayAriaLabel: 'Start automatic testimonial rotation',
  pauseButtonText: 'Pause',
  playButtonText: 'Autoplay',
  ratingAriaLabel: 'Rated 5 out of 5 stars',
  items: [
    {
      id: 'testimonial-1',
      quote:
        'Joining FITZONE completely transformed how I approach strength training. In ten months working with Coach Marcus, I added 85 lbs to my deadlift while dropping 9% body fat. The calibrated equipment and atmosphere are unmatched.',
      name: 'Liam Vance',
      initials: 'LV',
      memberTenure: 'Member for 2 years',
      rating: 5,
      avatarSrc:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=75',
      avatarAlt: 'Portrait of FITZONE member Liam Vance',
    },
    {
      id: 'testimonial-2',
      quote:
        'The 6 AM metabolic conditioning classes keep me accountable every single week. Even on days when my energy is low, the coaches and training partners push me to hit numbers I never thought I could sustain.',
      name: 'Maya Lin',
      initials: 'ML',
      memberTenure: 'Member for 3 years',
      rating: 5,
      avatarSrc:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=75',
      avatarAlt: 'Portrait of FITZONE member Maya Lin',
    },
    {
      id: 'testimonial-3',
      quote:
        'As a former collegiate swimmer, having a 25-meter heated pool, Olympic lifting platforms, and an infrared recovery suite under one roof is a game changer. My shoulder mobility and endurance are the best they have been in a decade.',
      name: 'Jordan Thorne',
      initials: 'JT',
      memberTenure: 'Member for 1.5 years',
      rating: 5,
      avatarSrc:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=75',
      avatarAlt: 'Portrait of FITZONE member Jordan Thorne',
    },
    {
      id: 'testimonial-4',
      quote:
        'I was intimidated walking into a serious performance gym for the first time, but the onboarding assessment put me completely at ease. Everyone racks their weights, respects the space, and celebrates your personal records.',
      name: 'Clara Morales',
      initials: 'CM',
      memberTenure: 'Member for 1 year',
      rating: 5,
      avatarSrc:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=75',
      avatarAlt: 'Portrait of FITZONE member Clara Morales',
    },
    {
      id: 'testimonial-5',
      quote:
        'The contrast cold plunge and mobility sessions with Coach Sofia saved my marathon prep this season. Instead of burning out at mile 18, I finished with a 14-minute personal best and zero knee pain.',
      name: 'Noah Sterling',
      initials: 'NS',
      memberTenure: 'Member for 4 years',
      rating: 5,
      avatarSrc:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=75',
      avatarAlt: 'Portrait of FITZONE member Noah Sterling',
    },
    {
      id: 'testimonial-6',
      quote:
        'Between 24/7 biometric access and the nutrition coaching check-ins, FITZONE fits seamlessly around my hospital shifts. It is the only club where every piece of machinery is maintained to perfection.',
      name: 'Zara Al-Mansoor',
      initials: 'ZA',
      memberTenure: 'Member for 2.5 years',
      rating: 5,
      avatarSrc:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=240&q=75',
      avatarAlt: 'Portrait of FITZONE member Zara Al-Mansoor',
    },
  ],
};
