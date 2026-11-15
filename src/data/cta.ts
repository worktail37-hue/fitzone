export interface CtaData {
  headingBefore: string;
  headingHighlight: string;
  headingAfter: string;
  description: string;
  buttonLabel: string;
  buttonTargetId: string;
  reassuranceText: string;
}

export const CTA_DATA: CtaData = {
  headingBefore: 'READY TO ',
  headingHighlight: 'GROW',
  headingAfter: '?',
  description:
    'Take the first step toward a stronger, healthier you by claiming your free one-week membership at FITZONE. Experience our state-of-the-art facilities, join our energizing classes, and see why FITZONE is the perfect place to reach your fitness goals.',
  buttonLabel: 'Get Free Trial',
  buttonTargetId: 'contact',
  reassuranceText: 'No credit card required. Cancel anytime.',
};
