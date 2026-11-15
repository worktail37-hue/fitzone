import { AccordionItemData } from '../components/ui/Accordion';

export interface FaqData {
  eyebrow: string;
  headingBefore: string;
  headingHighlight: string;
  headingAfter: string;
  description: string;
  contactPromptText: string;
  contactLinkLabel: string;
  contactTargetId: string;
  accordionAriaLabel: string;
  items: AccordionItemData[];
}

export const FAQ_DATA: FaqData = {
  eyebrow: 'FAQ',
  headingBefore: 'FREQUENTLY ASKED ',
  headingHighlight: 'QUESTIONS',
  headingAfter: '',
  description:
    'Everything you need to know about memberships, facility access, personal coaching, and starting your first week at FITZONE.',
  contactPromptText: 'Still have questions?',
  contactLinkLabel: 'Contact us',
  contactTargetId: 'contact',
  accordionAriaLabel: 'Frequently asked questions about FITZONE',
  items: [
    {
      id: 'faq-free-trial',
      titleHighlight: 'How do I start',
      titleRest: ' a free trial?',
      fullTitle: 'How do I start a free trial?',
      description:
        'Complete the free trial form below and choose your preferred training time. Our concierge team will confirm your pass within 24 hours and schedule an optional onboarding tour when you arrive.',
    },
    {
      id: 'faq-opening-hours',
      titleHighlight: 'What are',
      titleRest: ' your opening hours?',
      fullTitle: 'What are your opening hours?',
      description:
        'Our training floor is open 24/7 for active members via biometric pass access. Staffed coaching hours, recovery suites, and the heated lap pool operate daily from 5:00 AM to 11:00 PM.',
    },
    {
      id: 'faq-own-equipment',
      titleHighlight: 'Do I need',
      titleRest: ' to bring my own equipment?',
      fullTitle: 'Do I need to bring my own equipment?',
      description:
        'No—we provide calibrated barbells, lifting belts, chalk, mobility bands, boxing wraps, and chilled towel service. Just bring clean athletic footwear and a refillable water bottle.',
    },
    {
      id: 'faq-freeze-cancel',
      titleHighlight: 'Can I freeze',
      titleRest: ' or cancel my membership?',
      fullTitle: 'Can I freeze or cancel my membership?',
      description:
        'Yes. All FITZONE plans are month-to-month with zero lock-in contracts. You can freeze your membership for up to 60 days per year or cancel anytime with 14 days notice before your billing date.',
    },
    {
      id: 'faq-personal-trainers',
      titleHighlight: 'Are personal',
      titleRest: ' trainers included?',
      fullTitle: 'Are personal trainers included?',
      description:
        'Every new member receives a complimentary 45-minute movement assessment and program blueprint. Premium members also receive 2 dedicated 1-on-1 personal training sessions every month.',
    },
    {
      id: 'faq-parking-lockers',
      titleHighlight: 'Is there parking',
      titleRest: ' and are there locker rooms?',
      fullTitle: 'Is there parking and are there locker rooms?',
      description:
        'Every club features 3 hours of validated underground member parking, secure digital day lockers, private rainfall showers, grooming stations, and an executive recovery lounge.',
    },
    {
      id: 'faq-discounts',
      titleHighlight: 'Do you offer',
      titleRest: ' student or family discounts?',
      fullTitle: 'Do you offer student or family discounts?',
      description:
        'We offer a 15% discount for full-time students, active first responders, and household partners joining on the Standard or Premium tier. Present valid ID during your club onboarding.',
    },
  ],
};
