import { FormEvent, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Trash2,
} from 'lucide-react';
import {
  ALLOWED_GOALS,
  ALLOWED_PLANS,
  ALLOWED_TIMES,
  AllowedGoalOption,
  AllowedPlanOption,
  AllowedTimeOption,
  CONTACT_DATA,
  ContactInfoRow,
} from '../data/contact';
import {
  checkAndRecordResetOrDeleteAttempt,
  checkAndRecordSubmissionAttempt,
  generateCorrelationId,
  hasClaimedFreeTrial,
  recordClaimedFreeTrial,
  recordCompletedSubmission,
  removeClaimedFreeTrialByFingerprint,
} from '../lib/rateLimiter';
import { sanitizeInput, sanitizeMultilineInput } from '../lib/sanitize';
import {
  requestPersonalDataDeletion,
  submitFreeTrialForm,
} from '../lib/submitForm';
import {
  VALIDATION_LIMITS,
  validateAllowedOption,
  validateEmail,
  validateMessage,
  validateName,
  validatePhone,
} from '../lib/validators';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Container } from '../components/ui/Container';
import { Reveal } from '../components/ui/Reveal';
import { SectionHeading } from '../components/ui/SectionHeading';

export interface ContactProps {
  selectedPlan?: AllowedPlanOption;
  onSubmissionSuccess?: (plan: AllowedPlanOption) => void;
}

type FieldName =
  | 'fullName'
  | 'email'
  | 'phone'
  | 'preferredPlan'
  | 'preferredTime'
  | 'fitnessGoal'
  | 'message'
  | 'consent';

type FieldErrors = Partial<Record<FieldName, string>>;

const MIN_INTERACTION_MS = 3000; // 3 seconds minimum interaction time

function ContactRowIcon({ type }: { type: ContactInfoRow['id'] }) {
  if (type === 'address') {
    return <MapPin aria-hidden="true" className="h-5 w-5 text-signal shrink-0" />;
  }
  if (type === 'phone') {
    return <Phone aria-hidden="true" className="h-5 w-5 text-signal shrink-0" />;
  }
  if (type === 'email') {
    return <Mail aria-hidden="true" className="h-5 w-5 text-signal shrink-0" />;
  }
  return <Clock aria-hidden="true" className="h-5 w-5 text-signal shrink-0" />;
}

export function Contact({ selectedPlan, onSubmissionSuccess }: ContactProps) {
  const prefersReducedMotion = useReducedMotion();

  // Controlled form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredPlan, setPreferredPlan] = useState<AllowedPlanOption>(
    selectedPlan ?? 'Standard'
  );
  const [preferredTime, setPreferredTime] = useState<AllowedTimeOption>('Morning');
  const [fitnessGoal, setFitnessGoal] = useState<AllowedGoalOption>('Build muscle');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submitErrorBanner, setSubmitErrorBanner] = useState<string | null>(null);
  const [dataDeletedNotice, setDataDeletedNotice] = useState<string | null>(null);
  const [verifiedErasureToken, setVerifiedErasureToken] = useState<string | null>(null);
  const [verifiedClaimFingerprint, setVerifiedClaimFingerprint] = useState<string>('');

  // Refs for focus management and anti-abuse timing
  const firstInteractionAtRef = useRef<number | null>(null);
  const isSubmittingRef = useRef<boolean>(false);

  const fullNameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const preferredPlanRef = useRef<HTMLSelectElement | null>(null);
  const preferredTimeRef = useRef<HTMLSelectElement | null>(null);
  const fitnessGoalRef = useRef<HTMLSelectElement | null>(null);
  const messageRef = useRef<HTMLTextAreaElement | null>(null);
  const consentRef = useRef<HTMLInputElement | null>(null);
  const successContainerRef = useRef<HTMLDivElement | null>(null);
  const errorBannerRef = useRef<HTMLDivElement | null>(null);

  // Sync preselected plan when user clicks "Get Started" on a pricing card
  useEffect(() => {
    if (selectedPlan && ALLOWED_PLANS.includes(selectedPlan)) {
      setPreferredPlan(selectedPlan);
      setErrors((prev) => ({ ...prev, preferredPlan: undefined }));
    }
  }, [selectedPlan]);

  // Also listen for custom event `fitzone:select-plan` if triggered from anywhere
  useEffect(() => {
    const handleCustomPlanSelect = (event: Event) => {
      const customEvent = event as CustomEvent<{ planName?: string }>;
      const rawPlanName = customEvent.detail?.planName;
      if (!rawPlanName) return;

      const normalized =
        rawPlanName.charAt(0).toUpperCase() + rawPlanName.slice(1).toLowerCase();
      if (ALLOWED_PLANS.includes(normalized as AllowedPlanOption)) {
        setPreferredPlan(normalized as AllowedPlanOption);
      }
    };

    window.addEventListener('fitzone:select-plan', handleCustomPlanSelect);
    return () => {
      window.removeEventListener('fitzone:select-plan', handleCustomPlanSelect);
    };
  }, []);

  const markInteracted = () => {
    if (firstInteractionAtRef.current === null) {
      firstInteractionAtRef.current = Date.now();
    }
  };

  const validateSingleField = (field: FieldName, value?: string | boolean): string | undefined => {
    switch (field) {
      case 'fullName':
        return validateName(typeof value === 'string' ? value : fullName).error;
      case 'email':
        return validateEmail(typeof value === 'string' ? value : email).error;
      case 'phone':
        return validatePhone(typeof value === 'string' ? value : phone, false).error;
      case 'preferredPlan':
        return validateAllowedOption(
          typeof value === 'string' ? value : preferredPlan,
          ALLOWED_PLANS,
          'Preferred plan'
        ).error;
      case 'preferredTime':
        return validateAllowedOption(
          typeof value === 'string' ? value : preferredTime,
          ALLOWED_TIMES,
          'Preferred time'
        ).error;
      case 'fitnessGoal':
        return validateAllowedOption(
          typeof value === 'string' ? value : fitnessGoal,
          ALLOWED_GOALS,
          'Fitness goal'
        ).error;
      case 'message':
        return validateMessage(typeof value === 'string' ? value : message).error;
      case 'consent': {
        const checked = typeof value === 'boolean' ? value : consent;
        return checked ? undefined : CONTACT_DATA.form.consentError;
      }
      default:
        return undefined;
    }
  };

  const handleFieldBlur = (field: FieldName) => {
    const fieldError = validateSingleField(field);
    setErrors((prev) => ({ ...prev, [field]: fieldError }));
  };

  const focusFirstInvalidField = (validationErrors: FieldErrors) => {
    const order: { field: FieldName; ref: { current: HTMLElement | null } }[] = [
      { field: 'fullName', ref: fullNameRef },
      { field: 'email', ref: emailRef },
      { field: 'phone', ref: phoneRef },
      { field: 'preferredPlan', ref: preferredPlanRef },
      { field: 'preferredTime', ref: preferredTimeRef },
      { field: 'fitnessGoal', ref: fitnessGoalRef },
      { field: 'message', ref: messageRef },
      { field: 'consent', ref: consentRef },
    ];

    for (const item of order) {
      if (validationErrors[item.field]) {
        item.ref.current?.focus();
        break;
      }
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Prevent double-clicks / concurrent submissions
    if (isSubmittingRef.current || status === 'submitting') {
      return;
    }

    setSubmitErrorBanner(null);
    setDataDeletedNotice(null);

    // 1. Validate all fields
    const nextErrors: FieldErrors = {
      fullName: validateSingleField('fullName'),
      email: validateSingleField('email'),
      phone: validateSingleField('phone'),
      preferredPlan: validateSingleField('preferredPlan'),
      preferredTime: validateSingleField('preferredTime'),
      fitnessGoal: validateSingleField('fitnessGoal'),
      message: validateSingleField('message'),
      consent: validateSingleField('consent'),
    };

    const hasValidationErrors = Object.values(nextErrors).some((msg) => Boolean(msg));
    setErrors(nextErrors);

    if (hasValidationErrors) {
      focusFirstInvalidField(nextErrors);
      return;
    }

    // 2. Honeypot check: if filled by a bot, silently pretend success without sending anything
    if (honeypot.trim().length > 0) {
      setFullName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setConsent(false);
      setHoneypot('');
      setStatus('success');
      window.requestAnimationFrame(() => {
        successContainerRef.current?.focus();
      });
      return;
    }

    const now = Date.now();

    // 3. Minimum time since first interaction check (reject submissions under 3 seconds)
    const elapsedSinceFirstInteraction =
      firstInteractionAtRef.current !== null ? now - firstInteractionAtRef.current : 0;

    if (elapsedSinceFirstInteraction < MIN_INTERACTION_MS) {
      const correlationId = generateCorrelationId();
      setStatus('error');
      setSubmitErrorBanner(`${CONTACT_DATA.form.fastSubmitError} (Ref: ${correlationId})`);
      window.requestAnimationFrame(() => {
        errorBannerRef.current?.focus();
      });
      return;
    }

    // 4. Business logic check: block duplicate Free Trial claims for the same canonical email (including +alias variations)
    if (hasClaimedFreeTrial(email)) {
      const correlationId = generateCorrelationId();
      setStatus('error');
      setSubmitErrorBanner(
        `A free 7-day trial pass has already been claimed for this email address. (Ref: ${correlationId})`
      );
      window.requestAnimationFrame(() => {
        errorBannerRef.current?.focus();
      });
      return;
    }

    // 5. Rate limit check: max 5 attempts/minute and max 3 completed submissions/10 minutes
    const rateCheck = checkAndRecordSubmissionAttempt(now);
    if (!rateCheck.allowed) {
      const correlationId = generateCorrelationId();
      setStatus('error');
      setSubmitErrorBanner(`${CONTACT_DATA.form.rateLimitError} (Ref: ${correlationId})`);
      window.requestAnimationFrame(() => {
        errorBannerRef.current?.focus();
      });
      return;
    }

    // 6. Sanitize all fields before submitting
    isSubmittingRef.current = true;
    setStatus('submitting');

    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const result = await submitFreeTrialForm({
      fullName: sanitizeInput(fullName),
      email: sanitizedEmail,
      phone: sanitizeInput(phone),
      preferredPlan: sanitizeInput(preferredPlan),
      preferredTime: sanitizeInput(preferredTime),
      fitnessGoal: sanitizeInput(fitnessGoal),
      message: sanitizeMultilineInput(message),
      consent,
    });

    isSubmittingRef.current = false;

    if (result.ok) {
      recordCompletedSubmission(Date.now());
      const fingerprint = recordClaimedFreeTrial(sanitizedEmail);
      setVerifiedClaimFingerprint(fingerprint);
      setVerifiedErasureToken(result.erasureToken ?? null);
      // Immediately clear plaintext PII from React state after submission
      setFullName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setConsent(false);
      setHoneypot('');
      setStatus('success');
      onSubmissionSuccess?.(preferredPlan);
      window.requestAnimationFrame(() => {
        successContainerRef.current?.focus();
      });
    } else {
      const correlationId = result.correlationId ?? generateCorrelationId();
      setStatus('error');
      setSubmitErrorBanner(
        result.errorMessage ??
          `Unable to process your request right now. Please try again. (Ref: ${correlationId})`
      );
      window.requestAnimationFrame(() => {
        errorBannerRef.current?.focus();
      });
    }
  };

  const handleResetForm = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setPreferredPlan(selectedPlan ?? 'Standard');
    setPreferredTime('Morning');
    setFitnessGoal('Build muscle');
    setMessage('');
    setConsent(false);
    setHoneypot('');
    setErrors({});
    setSubmitErrorBanner(null);
    setDataDeletedNotice(null);
    setStatus('idle');
    firstInteractionAtRef.current = Date.now();

    window.requestAnimationFrame(() => {
      fullNameRef.current?.focus();
    });
  };

  const handleDeletePersonalData = async () => {
    const resetCheck = checkAndRecordResetOrDeleteAttempt();
    if (!resetCheck.allowed) {
      const correlationId = generateCorrelationId();
      setStatus('error');
      setSubmitErrorBanner(
        `Maximum of 3 reset/deletion requests per hour reached. Please try again later. (Ref: ${correlationId})`
      );
      return;
    }

    // Only transmit a remote DELETE if this session holds a verified erasureToken (prevents IDOR)
    await requestPersonalDataDeletion(verifiedErasureToken);
    if (verifiedClaimFingerprint) {
      removeClaimedFreeTrialByFingerprint(verifiedClaimFingerprint);
    }

    setFullName('');
    setEmail('');
    setPhone('');
    setMessage('');
    setConsent(false);
    setHoneypot('');
    setVerifiedErasureToken(null);
    setVerifiedClaimFingerprint('');
    setErrors({});
    setSubmitErrorBanner(null);
    setStatus('idle');
    setDataDeletedNotice(CONTACT_DATA.form.deleteDataSuccessMessage);
    firstInteractionAtRef.current = Date.now();
  };

  const inputBaseClass = [
    'w-full min-h-[46px] rounded-xl bg-midnight border px-4 py-2.5 text-base text-cloud placeholder:text-cloud-muted/45',
    'transition-colors duration-150 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:border-signal',
  ].join(' ');

  return (
    <section
      id="contact"
      aria-labelledby="contact-section-heading"
      className="relative bg-gradient-to-b from-slate-navy/65 via-midnight to-midnight py-20 md:py-28 overflow-hidden scroll-mt-24"
    >
      {/* Faint Signal Red Radial Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 h-[420px] w-[620px] rounded-full bg-signal/15 blur-3xl"
      />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* LEFT COLUMN: SectionHeading + Short Paragraph + Contact Info Rows */}
          <div className="lg:col-span-5">
            <Reveal>
              <SectionHeading
                id="contact-section-heading"
                as="h2"
                eyebrow={CONTACT_DATA.eyebrow}
                titleBefore={CONTACT_DATA.headingBefore}
                titleHighlight={CONTACT_DATA.headingHighlight}
                titleAfter={CONTACT_DATA.headingAfter}
                subtext={CONTACT_DATA.description}
              />

              <div className="mt-8 sm:mt-10 space-y-5 pt-8 border-t border-cloud-border">
                {CONTACT_DATA.contactInfo.map((row) => (
                  <div key={row.id} className="flex items-start gap-4">
                    <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-navy border border-cloud-border">
                      <ContactRowIcon type={row.id} />
                    </div>
                    <div>
                      <p className="font-display text-xs font-bold uppercase tracking-wider text-cloud-muted">
                        {row.label}
                      </p>
                      <p className="mt-0.5 text-sm sm:text-base font-medium text-cloud">
                        {row.value}
                      </p>
                      {row.subValue && (
                        <p className="mt-0.5 text-xs text-cloud-muted">{row.subValue}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* RIGHT COLUMN: Free Trial Form Inside Deep Slate Navy Card */}
          <div className="lg:col-span-7">
            <Reveal delay={0.1}>
              <Card className="p-6 sm:p-8 lg:p-10">
                {status === 'success' ? (
                  <motion.div
                    ref={successContainerRef}
                    role="status"
                    aria-live="polite"
                    tabIndex={-1}
                    initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="py-10 text-center focus:outline-none"
                  >
                    <motion.div
                      initial={prefersReducedMotion ? { scale: 1 } : { scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-signal text-cloud shadow-signal-glow"
                    >
                      <CheckCircle2 aria-hidden="true" className="h-9 w-9" />
                    </motion.div>

                    <h3 className="text-fluid-h3 font-display font-extrabold uppercase text-cloud mb-2">
                      {CONTACT_DATA.form.successHeading}
                    </h3>
                    <p className="text-base sm:text-lg text-cloud-muted max-w-md mx-auto mb-8">
                      {CONTACT_DATA.form.successMessage}
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                      <Button
                        variant="outline"
                        size="md"
                        onClick={handleResetForm}
                      >
                        {CONTACT_DATA.form.resetButtonLabel}
                      </Button>

                      <button
                        type="button"
                        onClick={handleDeletePersonalData}
                        className="inline-flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-display font-bold uppercase tracking-wider text-cloud-muted hover:text-cloud border border-cloud-border hover:border-signal transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal cursor-pointer"
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4 text-signal" />
                        <span>{CONTACT_DATA.form.deleteDataButtonLabel}</span>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    onFocusCapture={markInteracted}
                    onChange={markInteracted}
                    noValidate
                  >
                    <div className="mb-6 pb-5 border-b border-cloud-border">
                      <h3 className="text-fluid-h3 font-display font-extrabold uppercase text-cloud">
                        {CONTACT_DATA.form.title}
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-cloud-muted">
                        {CONTACT_DATA.form.subtitle}
                      </p>
                    </div>

                    {/* Submission / Rate-Limit Error Alert Banner */}
                    {status === 'error' && submitErrorBanner && (
                      <div
                        ref={errorBannerRef}
                        role="alert"
                        tabIndex={-1}
                        className="mb-6 rounded-xl bg-midnight border border-error-text/60 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 focus:outline-none"
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle
                            aria-hidden="true"
                            className="h-5 w-5 text-error-text shrink-0 mt-0.5"
                          />
                          <p className="text-sm text-error-text leading-relaxed">
                            {submitErrorBanner}
                          </p>
                        </div>

                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                        >
                          {CONTACT_DATA.form.retryButtonLabel}
                        </Button>
                      </div>
                    )}

                    {/* Visually Hidden Honeypot Field */}
                    <div
                      aria-hidden="true"
                      className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden opacity-0 pointer-events-none"
                    >
                      <label htmlFor="contact-company-website">
                        {CONTACT_DATA.form.honeypotLabel}
                      </label>
                      <input
                        id="contact-company-website"
                        name="companyWebsite"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* 1. Full Name */}
                      <div>
                        <label
                          htmlFor="contact-full-name"
                          className="block font-display text-xs font-bold uppercase tracking-wider text-cloud mb-2"
                        >
                          {CONTACT_DATA.form.fullNameLabel}
                        </label>
                        <input
                          ref={fullNameRef}
                          id="contact-full-name"
                          name="fullName"
                          type="text"
                          required
                          autoComplete="name"
                          maxLength={VALIDATION_LIMITS.NAME_MAX}
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (errors.fullName) {
                              setErrors((prev) => ({
                                ...prev,
                                fullName: validateSingleField('fullName', e.target.value),
                              }));
                            }
                          }}
                          onBlur={() => handleFieldBlur('fullName')}
                          placeholder={CONTACT_DATA.form.fullNamePlaceholder}
                          aria-invalid={Boolean(errors.fullName)}
                          aria-describedby={errors.fullName ? 'error-full-name' : undefined}
                          className={`${inputBaseClass} ${
                            errors.fullName ? 'border-error-text' : 'border-cloud-border'
                          }`}
                        />
                        {errors.fullName && (
                          <p
                            id="error-full-name"
                            role="alert"
                            className="mt-1.5 text-xs text-error-text"
                          >
                            {errors.fullName}
                          </p>
                        )}
                      </div>

                      {/* 2. Email */}
                      <div>
                        <label
                          htmlFor="contact-email"
                          className="block font-display text-xs font-bold uppercase tracking-wider text-cloud mb-2"
                        >
                          {CONTACT_DATA.form.emailLabel}
                        </label>
                        <input
                          ref={emailRef}
                          id="contact-email"
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          inputMode="email"
                          maxLength={VALIDATION_LIMITS.EMAIL_MAX}
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) {
                              setErrors((prev) => ({
                                ...prev,
                                email: validateSingleField('email', e.target.value),
                              }));
                            }
                          }}
                          onBlur={() => handleFieldBlur('email')}
                          placeholder={CONTACT_DATA.form.emailPlaceholder}
                          aria-invalid={Boolean(errors.email)}
                          aria-describedby={errors.email ? 'error-email' : undefined}
                          className={`${inputBaseClass} ${
                            errors.email ? 'border-error-text' : 'border-cloud-border'
                          }`}
                        />
                        {errors.email && (
                          <p
                            id="error-email"
                            role="alert"
                            className="mt-1.5 text-xs text-error-text"
                          >
                            {errors.email}
                          </p>
                        )}
                      </div>

                      {/* 3. Phone (Optional) */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <label
                            htmlFor="contact-phone"
                            className="block font-display text-xs font-bold uppercase tracking-wider text-cloud"
                          >
                            {CONTACT_DATA.form.phoneLabel}
                          </label>
                          <span className="text-[11px] text-cloud-muted">
                            {CONTACT_DATA.form.phoneOptionalBadge}
                          </span>
                        </div>
                        <input
                          ref={phoneRef}
                          id="contact-phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          inputMode="tel"
                          maxLength={VALIDATION_LIMITS.PHONE_MAX_LENGTH}
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (errors.phone) {
                              setErrors((prev) => ({
                                ...prev,
                                phone: validateSingleField('phone', e.target.value),
                              }));
                            }
                          }}
                          onBlur={() => handleFieldBlur('phone')}
                          placeholder={CONTACT_DATA.form.phonePlaceholder}
                          aria-invalid={Boolean(errors.phone)}
                          aria-describedby={errors.phone ? 'error-phone' : undefined}
                          className={`${inputBaseClass} ${
                            errors.phone ? 'border-error-text' : 'border-cloud-border'
                          }`}
                        />
                        {errors.phone && (
                          <p
                            id="error-phone"
                            role="alert"
                            className="mt-1.5 text-xs text-error-text"
                          >
                            {errors.phone}
                          </p>
                        )}
                      </div>

                      {/* 4. Preferred Plan Select */}
                      <div>
                        <label
                          htmlFor="contact-preferred-plan"
                          className="block font-display text-xs font-bold uppercase tracking-wider text-cloud mb-2"
                        >
                          {CONTACT_DATA.form.preferredPlanLabel}
                        </label>
                        <select
                          ref={preferredPlanRef}
                          id="contact-preferred-plan"
                          name="preferredPlan"
                          value={preferredPlan}
                          onChange={(e) => {
                            const val = e.target.value as AllowedPlanOption;
                            setPreferredPlan(val);
                            setErrors((prev) => ({
                              ...prev,
                              preferredPlan: validateSingleField('preferredPlan', val),
                            }));
                          }}
                          onBlur={() => handleFieldBlur('preferredPlan')}
                          aria-invalid={Boolean(errors.preferredPlan)}
                          aria-describedby={
                            errors.preferredPlan ? 'error-preferred-plan' : undefined
                          }
                          className={`${inputBaseClass} cursor-pointer ${
                            errors.preferredPlan ? 'border-error-text' : 'border-cloud-border'
                          }`}
                        >
                          {ALLOWED_PLANS.map((planOption) => (
                            <option
                              key={planOption}
                              value={planOption}
                              className="bg-slate-navy text-cloud"
                            >
                              {planOption}
                            </option>
                          ))}
                        </select>
                        {errors.preferredPlan && (
                          <p
                            id="error-preferred-plan"
                            role="alert"
                            className="mt-1.5 text-xs text-error-text"
                          >
                            {errors.preferredPlan}
                          </p>
                        )}
                      </div>

                      {/* 5. Preferred Time Select */}
                      <div>
                        <label
                          htmlFor="contact-preferred-time"
                          className="block font-display text-xs font-bold uppercase tracking-wider text-cloud mb-2"
                        >
                          {CONTACT_DATA.form.preferredTimeLabel}
                        </label>
                        <select
                          ref={preferredTimeRef}
                          id="contact-preferred-time"
                          name="preferredTime"
                          value={preferredTime}
                          onChange={(e) => {
                            const val = e.target.value as AllowedTimeOption;
                            setPreferredTime(val);
                            setErrors((prev) => ({
                              ...prev,
                              preferredTime: validateSingleField('preferredTime', val),
                            }));
                          }}
                          onBlur={() => handleFieldBlur('preferredTime')}
                          aria-invalid={Boolean(errors.preferredTime)}
                          aria-describedby={
                            errors.preferredTime ? 'error-preferred-time' : undefined
                          }
                          className={`${inputBaseClass} cursor-pointer ${
                            errors.preferredTime ? 'border-error-text' : 'border-cloud-border'
                          }`}
                        >
                          {ALLOWED_TIMES.map((timeOption) => (
                            <option
                              key={timeOption}
                              value={timeOption}
                              className="bg-slate-navy text-cloud"
                            >
                              {timeOption}
                            </option>
                          ))}
                        </select>
                        {errors.preferredTime && (
                          <p
                            id="error-preferred-time"
                            role="alert"
                            className="mt-1.5 text-xs text-error-text"
                          >
                            {errors.preferredTime}
                          </p>
                        )}
                      </div>

                      {/* 6. Fitness Goal Select */}
                      <div>
                        <label
                          htmlFor="contact-fitness-goal"
                          className="block font-display text-xs font-bold uppercase tracking-wider text-cloud mb-2"
                        >
                          {CONTACT_DATA.form.fitnessGoalLabel}
                        </label>
                        <select
                          ref={fitnessGoalRef}
                          id="contact-fitness-goal"
                          name="fitnessGoal"
                          value={fitnessGoal}
                          onChange={(e) => {
                            const val = e.target.value as AllowedGoalOption;
                            setFitnessGoal(val);
                            setErrors((prev) => ({
                              ...prev,
                              fitnessGoal: validateSingleField('fitnessGoal', val),
                            }));
                          }}
                          onBlur={() => handleFieldBlur('fitnessGoal')}
                          aria-invalid={Boolean(errors.fitnessGoal)}
                          aria-describedby={
                            errors.fitnessGoal ? 'error-fitness-goal' : undefined
                          }
                          className={`${inputBaseClass} cursor-pointer ${
                            errors.fitnessGoal ? 'border-error-text' : 'border-cloud-border'
                          }`}
                        >
                          {ALLOWED_GOALS.map((goalOption) => (
                            <option
                              key={goalOption}
                              value={goalOption}
                              className="bg-slate-navy text-cloud"
                            >
                              {goalOption}
                            </option>
                          ))}
                        </select>
                        {errors.fitnessGoal && (
                          <p
                            id="error-fitness-goal"
                            role="alert"
                            className="mt-1.5 text-xs text-error-text"
                          >
                            {errors.fitnessGoal}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 7. Message (Optional Textarea, Max 500 Chars + Live Counter) */}
                    <div className="mt-5">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <label
                          htmlFor="contact-message"
                          className="block font-display text-xs font-bold uppercase tracking-wider text-cloud"
                        >
                          {CONTACT_DATA.form.messageLabel}
                        </label>
                        <span
                          id="contact-message-counter"
                          className="text-xs text-cloud-muted tabular-nums"
                        >
                          {message.length} / {VALIDATION_LIMITS.MESSAGE_MAX}
                        </span>
                      </div>

                      <textarea
                        ref={messageRef}
                        id="contact-message"
                        name="message"
                        rows={3}
                        maxLength={VALIDATION_LIMITS.MESSAGE_MAX}
                        value={message}
                        onChange={(e) => {
                          setMessage(e.target.value);
                          if (errors.message) {
                            setErrors((prev) => ({
                              ...prev,
                              message: validateSingleField('message', e.target.value),
                            }));
                          }
                        }}
                        onBlur={() => handleFieldBlur('message')}
                        placeholder={CONTACT_DATA.form.messagePlaceholder}
                        aria-invalid={Boolean(errors.message)}
                        aria-describedby={
                          errors.message
                            ? 'error-message contact-message-counter'
                            : 'contact-message-counter'
                        }
                        className={`${inputBaseClass} py-3 resize-y ${
                          errors.message ? 'border-error-text' : 'border-cloud-border'
                        }`}
                      />
                      {errors.message && (
                        <p
                          id="error-message"
                          role="alert"
                          className="mt-1.5 text-xs text-error-text"
                        >
                          {errors.message}
                        </p>
                      )}
                    </div>

                    {/* 8. Required Consent Checkbox */}
                    <div className="mt-5">
                      <label
                        htmlFor="contact-consent"
                        className="flex min-h-[44px] items-center gap-3 py-1.5 cursor-pointer select-none"
                      >
                        <span className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] -ml-2.5 shrink-0 items-center justify-center">
                          <input
                            ref={consentRef}
                            id="contact-consent"
                            name="consent"
                            type="checkbox"
                            required
                            checked={consent}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setConsent(checked);
                              setErrors((prev) => ({
                                ...prev,
                                consent: validateSingleField('consent', checked),
                              }));
                            }}
                            onBlur={() => handleFieldBlur('consent')}
                            aria-invalid={Boolean(errors.consent)}
                            aria-describedby={errors.consent ? 'error-consent' : undefined}
                            className="h-5 w-5 shrink-0 rounded border border-cloud-border bg-midnight accent-signal cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-slate-navy"
                          />
                        </span>
                        <span className="text-sm text-cloud leading-relaxed">
                          {CONTACT_DATA.form.consentLabel}
                        </span>
                      </label>
                      {errors.consent && (
                        <p
                          id="error-consent"
                          role="alert"
                          className="mt-1.5 text-xs text-error-text"
                        >
                          {errors.consent}
                        </p>
                      )}
                    </div>

                    {dataDeletedNotice && (
                      <div
                        role="status"
                        aria-live="polite"
                        className="mt-5 rounded-xl bg-midnight border border-signal/50 px-4 py-3 text-xs sm:text-sm text-cloud flex items-center gap-2.5"
                      >
                        <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-signal shrink-0" />
                        <span>{dataDeletedNotice}</span>
                      </div>
                    )}

                    {/* Submit Button with Loading Spinner State + Personal Data Deletion Option */}
                    <div className="mt-7 space-y-3">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        showArrow={status !== 'submitting'}
                        disabled={status === 'submitting'}
                        className="w-full"
                      >
                        {status === 'submitting' ? (
                          <span className="inline-flex items-center gap-2.5">
                            <Loader2
                              aria-hidden="true"
                              className="h-5 w-5 animate-spin"
                            />
                            <span>{CONTACT_DATA.form.submittingButtonLabel}</span>
                          </span>
                        ) : (
                          CONTACT_DATA.form.submitButtonLabel
                        )}
                      </Button>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleDeletePersonalData}
                          className="inline-flex min-h-[44px] items-center gap-1.5 px-2 text-xs text-cloud-muted hover:text-cloud transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-sm cursor-pointer"
                        >
                          <Trash2 aria-hidden="true" className="h-3.5 w-3.5 text-signal" />
                          <span>{CONTACT_DATA.form.deleteDataButtonLabel}</span>
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </Card>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default Contact;
