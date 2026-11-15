export interface TrainerSocialLink {
  platform: 'instagram' | 'twitter' | 'linkedin';
  url: string;
  ariaLabel: string;
}

export interface TrainerItem {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  quote: string;
  imageSrc: string;
  imageAlt: string;
  width: number;
  height: number;
  socials: TrainerSocialLink[];
}

export interface TrainersData {
  eyebrow: string;
  headingBefore: string;
  headingHighlight: string;
  headingAfter: string;
  subtext: string;
  fallbackRoleLabel: string;
  items: TrainerItem[];
}

export const TRAINERS_DATA: TrainersData = {
  eyebrow: 'OUR TRAINERS',
  headingBefore: 'MEET YOUR ',
  headingHighlight: 'EXPERT',
  headingAfter: ' TRAINERS',
  subtext: 'Certified coaches who turn your goals into a plan and your plan into results.',
  fallbackRoleLabel: 'FITZONE Certified Performance Coach',
  items: [
    {
      id: 'trainer-marcus-reed',
      name: 'Marcus Reed',
      specialty: 'Strength and Conditioning',
      experience: '11+ Years Experience · CSCS, USAW',
      quote:
        'Progressive overload, disciplined biomechanics, and structured recovery are the foundation of lasting strength.',
      imageSrc:
        'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=800&q=75',
      imageAlt: 'Portrait of Marcus Reed, FITZONE Strength and Conditioning Head Coach',
      width: 600,
      height: 800,
      socials: [
        {
          platform: 'instagram',
          url: 'https://instagram.com',
          ariaLabel: 'Follow Marcus Reed on Instagram',
        },
        {
          platform: 'twitter',
          url: 'https://x.com',
          ariaLabel: 'Follow Marcus Reed on X (Twitter)',
        },
        {
          platform: 'linkedin',
          url: 'https://linkedin.com',
          ariaLabel: 'Connect with Marcus Reed on LinkedIn',
        },
      ],
    },
    {
      id: 'trainer-aisha-khan',
      name: 'Aisha Khan',
      specialty: 'HIIT and Cardio',
      experience: '8+ Years Experience · NASM-PES',
      quote:
        'High-output interval conditioning builds the metabolic engine and mental grit to push past any plateau.',
      imageSrc:
        'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=800&q=75',
      imageAlt: 'Portrait of Aisha Khan, FITZONE HIIT and Metabolic Conditioning Coach',
      width: 600,
      height: 800,
      socials: [
        {
          platform: 'instagram',
          url: 'https://instagram.com',
          ariaLabel: 'Follow Aisha Khan on Instagram',
        },
        {
          platform: 'twitter',
          url: 'https://x.com',
          ariaLabel: 'Follow Aisha Khan on X (Twitter)',
        },
        {
          platform: 'linkedin',
          url: 'https://linkedin.com',
          ariaLabel: 'Connect with Aisha Khan on LinkedIn',
        },
      ],
    },
    {
      id: 'trainer-daniel-cruz',
      name: 'Daniel Cruz',
      specialty: 'Personal Training',
      experience: '9+ Years Experience · NSCA-CPT',
      quote:
        'Every athlete is unique—customizing nutrition, training volume, and accountability turns ambition into measurable results.',
      imageSrc:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=75',
      imageAlt: 'Portrait of Daniel Cruz, FITZONE Lead Personal Training Specialist',
      width: 600,
      height: 800,
      socials: [
        {
          platform: 'instagram',
          url: 'https://instagram.com',
          ariaLabel: 'Follow Daniel Cruz on Instagram',
        },
        {
          platform: 'twitter',
          url: 'https://x.com',
          ariaLabel: 'Follow Daniel Cruz on X (Twitter)',
        },
        {
          platform: 'linkedin',
          url: 'https://linkedin.com',
          ariaLabel: 'Connect with Daniel Cruz on LinkedIn',
        },
      ],
    },
    {
      id: 'trainer-sofia-martin',
      name: 'Sofia Martin',
      specialty: 'Yoga and Mobility',
      experience: '7+ Years Experience · FRCms, E-RYT 500',
      quote:
        'Unlocking joint range of motion and breath control lets you lift heavier, move pain-free, and recover faster.',
      imageSrc:
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=75',
      imageAlt: 'Portrait of Sofia Martin, FITZONE Yoga, Mobility, and Recovery Coach',
      width: 600,
      height: 800,
      socials: [
        {
          platform: 'instagram',
          url: 'https://instagram.com',
          ariaLabel: 'Follow Sofia Martin on Instagram',
        },
        {
          platform: 'twitter',
          url: 'https://x.com',
          ariaLabel: 'Follow Sofia Martin on X (Twitter)',
        },
        {
          platform: 'linkedin',
          url: 'https://linkedin.com',
          ariaLabel: 'Connect with Sofia Martin on LinkedIn',
        },
      ],
    },
  ],
};
