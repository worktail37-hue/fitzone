export interface LocationMarker {
  id: string;
  city: string;
  country: string;
  xPercent: number;
  yPercent: number;
  clubCountLabel: string;
}

export interface ContinentPath {
  id: string;
  name: string;
  d: string;
}

export interface LocationsData {
  eyebrow: string;
  headingBefore: string;
  headingHighlight: string;
  headingAfter: string;
  statValue: string;
  statLabel: string;
  statAriaLabel: string;
  description: string;
  mobileSwipeHint: string;
  mapAriaLabel: string;
  continents: ContinentPath[];
  markers: LocationMarker[];
}

export const LOCATIONS_DATA: LocationsData = {
  eyebrow: 'OUR LOCATIONS',
  headingBefore: 'OUR GLOBAL PRESENCE: ',
  headingHighlight: 'FITNESS CENTERS',
  headingAfter: ' AROUND THE WORLD',
  statValue: '23+',
  statLabel: 'Countries',
  statAriaLabel: '23 plus countries with FITZONE locations',
  description:
    'No matter where you are, our gyms are here to help you reach your fitness goals. With locations across the globe, finding a gym near you is easy. Explore our map and find your nearest FITZONE.',
  mobileSwipeHint: 'Swipe horizontally to explore global locations',
  mapAriaLabel: 'World map showing 12 major FITZONE city hubs across 6 continents',
  continents: [
    {
      id: 'north-america',
      name: 'North America',
      d: 'M 75 75 L 155 62 L 265 68 L 315 108 L 285 170 L 252 212 L 222 252 L 188 242 L 165 202 L 130 165 L 92 128 Z',
    },
    {
      id: 'greenland',
      name: 'Greenland',
      d: 'M 318 42 L 388 35 L 405 78 L 352 96 L 312 72 Z',
    },
    {
      id: 'south-america',
      name: 'South America',
      d: 'M 248 265 L 315 278 L 356 328 L 334 405 L 292 468 L 265 452 L 256 365 L 235 305 Z',
    },
    {
      id: 'europe',
      name: 'Europe',
      d: 'M 438 78 L 515 62 L 585 74 L 598 145 L 552 178 L 495 182 L 442 162 L 428 118 Z',
    },
    {
      id: 'africa',
      name: 'Africa',
      d: 'M 445 198 L 538 196 L 598 242 L 605 318 L 568 418 L 522 432 L 492 365 L 442 285 L 432 235 Z',
    },
    {
      id: 'asia',
      name: 'Asia',
      d: 'M 595 72 L 735 58 L 878 82 L 908 148 L 862 228 L 802 282 L 732 268 L 682 252 L 615 222 L 592 155 Z',
    },
    {
      id: 'japan-and-archipelago',
      name: 'East & Southeast Asian Islands',
      d: 'M 865 172 L 892 184 L 882 218 L 856 205 Z M 758 288 L 832 296 L 842 325 L 762 318 Z',
    },
    {
      id: 'australia',
      name: 'Australia',
      d: 'M 775 348 L 878 342 L 908 395 L 882 446 L 798 442 L 762 398 Z',
    },
  ],
  markers: [
    {
      id: 'loc-los-angeles',
      city: 'Los Angeles',
      country: 'United States',
      xPercent: 16.5,
      yPercent: 34.5,
      clubCountLabel: '6 Performance Clubs',
    },
    {
      id: 'loc-mexico-city',
      city: 'Mexico City',
      country: 'Mexico',
      xPercent: 20.5,
      yPercent: 44.5,
      clubCountLabel: '4 Performance Clubs',
    },
    {
      id: 'loc-new-york',
      city: 'New York',
      country: 'United States',
      xPercent: 26.8,
      yPercent: 31.5,
      clubCountLabel: '8 Performance Clubs',
    },
    {
      id: 'loc-sao-paulo',
      city: 'Sao Paulo',
      country: 'Brazil',
      xPercent: 32.8,
      yPercent: 72.5,
      clubCountLabel: '5 Performance Clubs',
    },
    {
      id: 'loc-london',
      city: 'London',
      country: 'United Kingdom',
      xPercent: 46.2,
      yPercent: 25.5,
      clubCountLabel: '7 Performance Clubs',
    },
    {
      id: 'loc-paris',
      city: 'Paris',
      country: 'France',
      xPercent: 48.8,
      yPercent: 29.8,
      clubCountLabel: '5 Performance Clubs',
    },
    {
      id: 'loc-cape-town',
      city: 'Cape Town',
      country: 'South Africa',
      xPercent: 53.5,
      yPercent: 82.0,
      clubCountLabel: '3 Performance Clubs',
    },
    {
      id: 'loc-dubai',
      city: 'Dubai',
      country: 'United Arab Emirates',
      xPercent: 62.5,
      yPercent: 42.0,
      clubCountLabel: '4 Performance Clubs',
    },
    {
      id: 'loc-mumbai',
      city: 'Mumbai',
      country: 'India',
      xPercent: 69.5,
      yPercent: 47.5,
      clubCountLabel: '6 Performance Clubs',
    },
    {
      id: 'loc-singapore',
      city: 'Singapore',
      country: 'Singapore',
      xPercent: 77.8,
      yPercent: 57.5,
      clubCountLabel: '5 Performance Clubs',
    },
    {
      id: 'loc-tokyo',
      city: 'Tokyo',
      country: 'Japan',
      xPercent: 86.8,
      yPercent: 36.5,
      clubCountLabel: '7 Performance Clubs',
    },
    {
      id: 'loc-sydney',
      city: 'Sydney',
      country: 'Australia',
      xPercent: 87.5,
      yPercent: 81.5,
      clubCountLabel: '4 Performance Clubs',
    },
  ],
};
