/**
 * Hardened input sanitization utilities against XSS, unclosed HTML tag injection,
 * dangerous URI schemes (javascript:/data:/vbscript:), inline event handlers,
 * prototype pollution tokens, and CSV/Spreadsheet formula injection.
 */

const DANGEROUS_PROTOCOL_REGEX = /\b(?:javascript|vbscript|data)\s*:/gi;
const INLINE_EVENT_HANDLER_REGEX = /\bon[a-z]{2,20}\s*=/gi;
const PROTOTYPE_POLLUTION_REGEX = /\b(?:__proto__|constructor\s*\.\s*prototype|prototype\s*\[)/gi;
// Spreadsheet / CSV formula triggers (=, +, -, @) at the start of a field
const FORMULA_PREFIX_REGEX = /^[=+\-@]+/;

/**
 * Sanitizes single-line untrusted user input:
 * - Strips all HTML blocks, complete tags, and stray angle brackets (< and >)
 * - Strips dangerous URI schemes and inline event handler patterns
 * - Strips prototype pollution tokens and ASCII control characters
 * - Neutralizes leading spreadsheet formula characters (=, +, @)
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const cleaned = input
    // Remove <script> and <style> blocks completely
    .replace(/<(script|style)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '')
    // Strip all HTML tags (closed or unclosed) and any remaining angle brackets
    .replace(/<[^>]*>?/g, '')
    .replace(/[<>]/g, '')
    // Strip dangerous URI schemes and event handlers
    .replace(DANGEROUS_PROTOCOL_REGEX, '')
    .replace(INLINE_EVENT_HANDLER_REGEX, '')
    .replace(PROTOTYPE_POLLUTION_REGEX, '')
    // Remove ASCII control characters and null bytes
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    // Collapse multiple spaces into single space and trim
    .replace(/\s+/g, ' ')
    .trim();

  // Neutralize leading spreadsheet formula injection characters (=, @)
  return cleaned.replace(/^[=@]+/, '').trim();
}

/**
 * Sanitizes multiline text input (such as message fields) while preserving safe line breaks
 * and neutralizing multi-line CSV/formula injection payloads.
 */
export function sanitizeMultilineInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/<(script|style)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '')
    .replace(/<[^>]*>?/g, '')
    .replace(/[<>]/g, '')
    .replace(DANGEROUS_PROTOCOL_REGEX, '')
    .replace(INLINE_EVENT_HANDLER_REGEX, '')
    .replace(PROTOTYPE_POLLUTION_REGEX, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .split('\n')
    .map((line) => line.replace(FORMULA_PREFIX_REGEX, '').trimEnd())
    .join('\n')
    .trim();
}

/**
 * Normalizes an email address to its canonical form to prevent Free Trial abuse
 * via +subaddressing aliases (e.g., user+trial2@gmail.com -> user@gmail.com)
 * or dot variations on Gmail/Googlemail domains.
 */
export function normalizeCanonicalEmail(rawEmail: string): string {
  const sanitized = sanitizeInput(rawEmail).toLowerCase();
  const parts = sanitized.split('@');
  if (parts.length !== 2) {
    return sanitized;
  }

  let [localPart, domain] = parts;
  // Strip +tag subaddressing
  const plusIndex = localPart.indexOf('+');
  if (plusIndex !== -1) {
    localPart = localPart.slice(0, plusIndex);
  }

  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    localPart = localPart.replace(/\./g, '');
    domain = 'gmail.com';
  }

  return `${localPart}@${domain}`;
}
