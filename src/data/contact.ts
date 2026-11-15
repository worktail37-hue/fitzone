export const ALLOWED_PLANS = ['Basic', 'Standard', 'Premium', 'Not sure yet'] as const;
export type AllowedPlanOption = (typeof ALLOWED_PLANS)[number];

export const ALLOWED_TIMES = ['Morning', 'Afternoon', 'Evening'] as const;
export type AllowedTimeOption = (typeof ALLOWED_TIMES)[number];

export const ALLOWED_GOALS = [
  'Lose weight',
  'Build muscle',
  'Improve endurance',
  'General fitness',
] as const;
export type AllowedGoalOption = (typeof ALLOWED_GOALS)[number];

export interface ContactInfoRow {
  id: 'address' | 'phone' | 'email' | 'hours';
  label: string;
  value: string;
  subValue?: string;
}

export interface ContactData {
  eyebrow: string;
  headingBefore: string;
  headingHighlight: string;
  headingAfter: string;
  description: string;
  contactInfo: ContactInfoRow[];
  form: {
    title: string;
    subtitle: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phoneOptionalBadge: string;
    phonePlaceholder: string;
    preferredPlanLabel: string;
    preferredTimeLabel: string;
    fitnessGoalLabel: string;
    messageLabel: string;
    messageOptionalBadge: string;
    messagePlaceholder: string;
    consentLabel: string;
    consentError: string;
    honeypotLabel: string;
    submitButtonLabel: string;
    submittingButtonLabel: string;
    fastSubmitError: string;
    rateLimitError: string;
    successHeading: string;
    successMessage: string;
    resetButtonLabel: string;
    retryButtonLabel: string;
    deleteDataButtonLabel: string;
    deleteDataSuccessMessage: string;
  };
}

export const CONTACT_DATA: ContactData = {
  eyebrow: 'FREE TRIAL',
  headingBefore: 'CLAIM YOUR ',
  headingHighlight: 'FREE WEEK',
  headingAfter: ' AND START TODAY',
  description:
    'Experience full access to our Olympic lifting floor, 60+ weekly conditioning classes, heated lap pool, and contrast recovery suite with zero commitment.',
  contactInfo: [
    {
      id: 'address',
      label: 'Flagship Club Address',
      value: '740 Hudson Performance Ave, Suite 200',
      subValue: 'New York, NY 10014 · Validated Member Parking',
    },
    {
      id: 'phone',
      label: 'Member Concierge Desk',
      value: '+1 (555) 234-8910',
      subValue: 'Direct line for trial scheduling & private tours',
    },
    {
      id: 'email',
      label: 'Email Support',
      value: 'concierge@fitzone.club',
      subValue: 'Responses within 4 business hours',
    },
    {
      id: 'hours',
      label: 'Club & Coaching Hours',
      value: '24/7 Biometric Member Access',
      subValue: 'Staffed Coaching & Recovery: Mon–Sun, 5:00 AM – 11:00 PM',
    },
  ],
  form: {
    title: 'Reserve Your 7-Day Pass',
    subtitle: 'All fields marked with * are required. No credit card needed.',
    fullNameLabel: 'Full Name *',
    fullNamePlaceholder: 'Alex Mercer',
    emailLabel: 'Email Address *',
    emailPlaceholder: 'alex.mercer@example.com',
    phoneLabel: 'Phone Number',
    phoneOptionalBadge: 'Optional',
    phonePlaceholder: '+1 (555) 234-5678',
    preferredPlanLabel: 'Preferred Plan *',
    preferredTimeLabel: 'Preferred Training Time *',
    fitnessGoalLabel: 'Primary Fitness Goal *',
    messageLabel: 'Training Notes or Questions',
    messageOptionalBadge: 'Optional',
    messagePlaceholder: 'Tell us about your current training routine or any injuries we should know about...',
    consentLabel: 'I agree to be contacted about my free trial.',
    consentError: 'Please confirm that you agree to be contacted about your free trial.',
    honeypotLabel: 'Company Website URL (leave blank)',
    submitButtonLabel: 'Claim My Free Week',
    submittingButtonLabel: 'Submitting Request...',
    fastSubmitError: 'Please take a moment to review your details before submitting.',
    rateLimitError:
      'You have reached the maximum of 3 trial requests in 10 minutes. Please wait a few minutes before trying again.',
    successHeading: 'Free Trial Pass Reserved',
    successMessage: "You're in! We'll contact you within 24 hours.",
    resetButtonLabel: 'Send another request',
    retryButtonLabel: 'Try Again',
    deleteDataButtonLabel: 'Delete My Personal Data',
    deleteDataSuccessMessage:
      'All personal data and session records have been permanently deleted.',
  },
};
