export interface GalleryItem {
  id: string;
  caption: string;
  zoneSubtitle: string;
  aspectRatio: '4:5' | '4:3';
  width: number;
  height: number;
  imageSrc: string;
  imageAlt: string;
}

export interface GalleryData {
  eyebrow: string;
  headingBefore: string;
  headingHighlight: string;
  headingAfter: string;
  carouselAriaLabel: string;
  prevButtonAriaLabel: string;
  nextButtonAriaLabel: string;
  progressAriaLabel: string;
  openLightboxAriaPrefix: string;
  fallbackText: string;
  lightbox: {
    dialogAriaLabel: string;
    closeAriaLabel: string;
    prevAriaLabel: string;
    nextAriaLabel: string;
  };
  items: GalleryItem[];
}

export const GALLERY_DATA: GalleryData = {
  eyebrow: 'GALLERY',
  headingBefore: 'INSIDE THE ',
  headingHighlight: 'FITZONE',
  headingAfter: ' EXPERIENCE',
  carouselAriaLabel: 'FITZONE facility photo gallery carousel',
  prevButtonAriaLabel: 'Scroll gallery left',
  nextButtonAriaLabel: 'Scroll gallery right',
  progressAriaLabel: 'Gallery scroll position',
  openLightboxAriaPrefix: 'View full size photo:',
  fallbackText: 'FITZONE Facility View',
  lightbox: {
    dialogAriaLabel: 'Gallery image lightbox viewer',
    closeAriaLabel: 'Close lightbox viewer',
    prevAriaLabel: 'View previous gallery image',
    nextAriaLabel: 'View next gallery image',
  },
  items: [
    {
      id: 'gallery-gym-floor',
      caption: 'Main Gym Floor',
      zoneSubtitle: '24,000 sq ft open-span athletic training arena',
      aspectRatio: '4:5',
      width: 640,
      height: 800,
      imageSrc:
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=75',
      imageAlt:
        'Expansive FITZONE main training floor with dramatic dark architectural lighting and rows of strength equipment',
    },
    {
      id: 'gallery-free-weights',
      caption: 'Free Weights Deck',
      zoneSubtitle: 'Calibrated competition dumbbells and Eleiko barbells',
      aspectRatio: '4:3',
      width: 960,
      height: 720,
      imageSrc:
        'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1000&q=75',
      imageAlt:
        'Heavy dumbbell racks and Olympic barbell lifting platforms on the FITZONE free weights deck',
    },
    {
      id: 'gallery-cardio-area',
      caption: 'Cardio & Endurance Lab',
      zoneSubtitle: 'Curved sprint treadmills, Concept2 ergs, and air bikes',
      aspectRatio: '4:5',
      width: 640,
      height: 800,
      imageSrc:
        'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=1000&q=75',
      imageAlt:
        'Row of performance treadmills and conditioning machines inside the FITZONE cardio lab',
    },
    {
      id: 'gallery-group-class',
      caption: 'Group Conditioning Studio',
      zoneSubtitle: 'High-output metabolic circuits and team HIIT sessions',
      aspectRatio: '4:3',
      width: 960,
      height: 720,
      imageSrc:
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=75',
      imageAlt:
        'Athletes training together during a high-energy coach-led group conditioning session',
    },
    {
      id: 'gallery-swimming-pool',
      caption: '25m Heated Lap Pool',
      zoneSubtitle: 'Competition lanes for low-impact endurance and recovery',
      aspectRatio: '4:5',
      width: 640,
      height: 800,
      imageSrc:
        'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1000&q=75',
      imageAlt:
        'Lit indoor 25-meter heated swimming pool with lane markers inside FITZONE',
    },
    {
      id: 'gallery-sauna-recovery',
      caption: 'Sauna & Cold Plunge Suite',
      zoneSubtitle: 'Full-spectrum infrared sauna and 42°F contrast hydrotherapy',
      aspectRatio: '4:3',
      width: 960,
      height: 720,
      imageSrc:
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=75',
      imageAlt:
        'Cedar wood sauna and contrast hydrotherapy recovery suite for post-workout regeneration',
    },
    {
      id: 'gallery-boxing-zone',
      caption: 'Boxing & Combat Arena',
      zoneSubtitle: 'Heavy bags, speed platforms, and conditioning ring',
      aspectRatio: '4:5',
      width: 640,
      height: 800,
      imageSrc:
        'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1000&q=75',
      imageAlt:
        'Athlete wrapping hands beside heavy punching bags in the dark FITZONE boxing zone',
    },
    {
      id: 'gallery-locker-lounge',
      caption: 'Executive Locker & Fuel Lounge',
      zoneSubtitle: 'Private showers, digital lockers, and recovery shake bar',
      aspectRatio: '4:3',
      width: 960,
      height: 720,
      imageSrc:
        'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=1000&q=75',
      imageAlt:
        'Sleek architectural locker room and member recovery lounge at FITZONE',
    },
  ],
};
