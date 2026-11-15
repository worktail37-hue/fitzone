import { sanitizeInput, sanitizeMultilineInput } from './sanitize';

export interface ValidationResult {
  isValid: boolean;
  sanitizedValue: string;
  error?: string;
}

export const VALIDATION_LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 80,
  EMAIL_MAX: 120,
  PHONE_MIN_DIGITS: 7,
  PHONE_MAX_DIGITS: 15,
  PHONE_MAX_LENGTH: 20,
  MESSAGE_MAX: 500,
} as const;

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const PHONE_FORMAT_REGEX = /^[+]?[0-9\s\-()]{7,20}$/;
// Letters, spaces, hyphens, and apostrophes only
const NAME_ALLOWED_REGEX = /^[\p{L}\p{M}\s'-]+$/u;

// Detect common SQL/NoSQL/script injection patterns in free-text inputs
const INJECTION_SIGNATURE_REGEX =
  /(?:\b(?:union\s+select|select\s+.*\s+from|insert\s+into|drop\s+table|delete\s+from|update\s+.*\s+set|xp_cmdshell)\b|--\s|\/\*[\s\S]*?\*\/|\$(?:where|ne|gt|lt|regex)\b|<script|javascript:)/i;

const BLOCKED_EMAIL_DOMAINS = new Set([
  'localhost',
  'example.com',
  'example.org',
  'example.net',
  'test.com',
  'invalid',
  'local',
]);

export function validateName(rawName: string): ValidationResult {
  const sanitizedValue = sanitizeInput(rawName);

  if (!sanitizedValue) {
    return {
      isValid: false,
      sanitizedValue,
      error: 'Full name is required.',
    };
  }

  if (sanitizedValue.length < VALIDATION_LIMITS.NAME_MIN) {
    return {
      isValid: false,
      sanitizedValue,
      error: `Full name must be at least ${VALIDATION_LIMITS.NAME_MIN} characters.`,
    };
  }

  if (sanitizedValue.length > VALIDATION_LIMITS.NAME_MAX) {
    return {
      isValid: false,
      sanitizedValue,
      error: `Full name cannot exceed ${VALIDATION_LIMITS.NAME_MAX} characters.`,
    };
  }

  if (!NAME_ALLOWED_REGEX.test(sanitizedValue) || INJECTION_SIGNATURE_REGEX.test(rawName)) {
    return {
      isValid: false,
      sanitizedValue,
      error: 'Name may only contain letters, spaces, hyphens, and apostrophes.',
    };
  }

  return { isValid: true, sanitizedValue };
}

export function validateEmail(rawEmail: string): ValidationResult {
  const sanitizedValue = sanitizeInput(rawEmail).toLowerCase();

  if (!sanitizedValue) {
    return {
      isValid: false,
      sanitizedValue,
      error: 'Email address is required.',
    };
  }

  if (
    sanitizedValue.length > VALIDATION_LIMITS.EMAIL_MAX ||
    !EMAIL_REGEX.test(sanitizedValue) ||
    INJECTION_SIGNATURE_REGEX.test(rawEmail)
  ) {
    return {
      isValid: false,
      sanitizedValue,
      error: 'Please enter a valid email address (e.g. alex@domain.com).',
    };
  }

  const domain = sanitizedValue.split('@')[1] ?? '';
  if (BLOCKED_EMAIL_DOMAINS.has(domain) || domain.endsWith('.local') || domain.endsWith('.invalid')) {
    return {
      isValid: false,
      sanitizedValue,
      error: 'Please enter a valid active email domain.',
    };
  }

  return { isValid: true, sanitizedValue };
}

export function validatePhone(rawPhone: string, isRequired = false): ValidationResult {
  const sanitizedValue = sanitizeInput(rawPhone);

  if (!sanitizedValue) {
    if (isRequired) {
      return {
        isValid: false,
        sanitizedValue,
        error: 'Phone number is required.',
      };
    }
    return { isValid: true, sanitizedValue: '' };
  }

  const digitsOnly = sanitizedValue.replace(/\D/g, '');

  if (
    sanitizedValue.length > VALIDATION_LIMITS.PHONE_MAX_LENGTH ||
    !PHONE_FORMAT_REGEX.test(sanitizedValue) ||
    digitsOnly.length < VALIDATION_LIMITS.PHONE_MIN_DIGITS ||
    digitsOnly.length > VALIDATION_LIMITS.PHONE_MAX_DIGITS
  ) {
    return {
      isValid: false,
      sanitizedValue,
      error: `Phone number must contain ${VALIDATION_LIMITS.PHONE_MIN_DIGITS} to ${VALIDATION_LIMITS.PHONE_MAX_DIGITS} digits (only +, spaces, dashes, and parentheses allowed).`,
    };
  }

  return { isValid: true, sanitizedValue };
}

export function validateAllowedOption<T extends string>(
  rawValue: string,
  allowedValues: readonly T[],
  fieldLabel: string
): ValidationResult {
  const sanitizedValue = sanitizeInput(rawValue);

  if (!allowedValues.includes(sanitizedValue as T)) {
    return {
      isValid: false,
      sanitizedValue,
      error: `Please select a valid ${fieldLabel.toLowerCase()} option.`,
    };
  }

  return { isValid: true, sanitizedValue };
}

export function validateMessage(rawMessage: string): ValidationResult {
  const sanitizedValue = sanitizeMultilineInput(rawMessage);

  if (sanitizedValue.length > VALIDATION_LIMITS.MESSAGE_MAX) {
    return {
      isValid: false,
      sanitizedValue,
      error: `Message cannot exceed ${VALIDATION_LIMITS.MESSAGE_MAX} characters.`,
    };
  }

  if (INJECTION_SIGNATURE_REGEX.test(rawMessage)) {
    return {
      isValid: false,
      sanitizedValue,
      error: 'Message contains unsupported query or script syntax.',
    };
  }

  return { isValid: true, sanitizedValue };
}
