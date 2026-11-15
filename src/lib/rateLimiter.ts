import { isOwnerPrivateHost } from './accessControl';
import { normalizeCanonicalEmail } from './sanitize';

/**
 * Rate limiting, anti-trial-abuse, and correlation ID utilities.
 *
 * Enforces:
 * - Max 5 attempts per minute on form/auth submissions (`fitzone_rl_attempt_1m`).
 * - Max 3 completed submissions per 10 minutes (`fitzone_trial_submission_timestamps`).
 * - Max 3 reset / personal data deletion requests per hour (`fitzone_rl_reset_1h`).
 * - One free trial claim per canonical email identity (`fitzone_claimed_trial_hashes`).
 * - Rate-limit buckets are NEVER cleared by user-triggered data deletion to prevent rate-limit bypass.
 */

const ATTEMPT_1M_KEY = 'fitzone_rl_attempt_1m';
const SUBMIT_10M_KEY = 'fitzone_trial_submission_timestamps';
const RESET_1H_KEY = 'fitzone_rl_reset_1h';
const CLAIMED_TRIAL_HASHES_KEY = 'fitzone_claimed_trial_hashes';

const ONE_MINUTE_MS = 60 * 1000;
const TEN_MINUTES_MS = 10 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

export const RATE_LIMIT_QUOTAS = {
  MAX_ATTEMPTS_PER_MINUTE: 5,
  MAX_SUBMISSIONS_PER_10_MIN: 3,
  MAX_RESETS_PER_HOUR: 3,
} as const;

const memoryBuckets: Record<string, number[]> = {
  [ATTEMPT_1M_KEY]: [],
  [SUBMIT_10M_KEY]: [],
  [RESET_1H_KEY]: [],
};

let memoryClaimedHashes: string[] = [];

function readTimestamps(key: string, windowMs: number, now: number): number[] {
  const cutoff = now - windowMs;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const valid = parsed.filter(
          (ts): ts is number => typeof ts === 'number' && ts > cutoff
        );
        memoryBuckets[key] = valid;
        return valid;
      }
    }
  } catch {
    // Fallback to in-memory bucket
  }
  const current = memoryBuckets[key] ?? [];
  const filtered = current.filter((ts) => ts > cutoff);
  memoryBuckets[key] = filtered;
  return filtered;
}

function recordTimestamp(key: string, windowMs: number, now: number): void {
  const updated = [...readTimestamps(key, windowMs, now), now];
  memoryBuckets[key] = updated;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Computes a non-reversible FNV-1a 64-bit hex fingerprint of the canonical email
 * so no plaintext email is ever stored in sessionStorage.
 */
export function computeCanonicalEmailFingerprint(rawEmail: string): string {
  const canonical = normalizeCanonicalEmail(rawEmail);
  let h1 = 0xdeadbeef ^ canonical.length;
  let h2 = 0x41c6ce57 ^ canonical.length;

  for (let i = 0; i < canonical.length; i++) {
    const ch = canonical.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return `fp_${(h2 >>> 0).toString(16).padStart(8, '0')}${(h1 >>> 0)
    .toString(16)
    .padStart(8, '0')}`;
}

function readClaimedTrialFingerprints(): string[] {
  try {
    const raw = window.sessionStorage.getItem(CLAIMED_TRIAL_HASHES_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const valid = parsed.filter((item): item is string => typeof item === 'string');
        memoryClaimedHashes = valid;
        return valid;
      }
    }
  } catch {
    // Fallback to memory
  }
  return memoryClaimedHashes;
}

export function hasClaimedFreeTrial(rawEmail: string): boolean {
  const fp = computeCanonicalEmailFingerprint(rawEmail);
  return readClaimedTrialFingerprints().includes(fp);
}

export function recordClaimedFreeTrial(rawEmail: string): string {
  const fp = computeCanonicalEmailFingerprint(rawEmail);
  const existing = readClaimedTrialFingerprints();
  if (!existing.includes(fp)) {
    const updated = [...existing, fp];
    memoryClaimedHashes = updated;
    try {
      window.sessionStorage.setItem(CLAIMED_TRIAL_HASHES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  }
  return fp;
}

export function removeClaimedFreeTrialByFingerprint(fingerprint: string): void {
  if (!fingerprint) return;
  const updated = readClaimedTrialFingerprints().filter((fp) => fp !== fingerprint);
  memoryClaimedHashes = updated;
  try {
    if (updated.length === 0) {
      window.sessionStorage.removeItem(CLAIMED_TRIAL_HASHES_KEY);
    } else {
      window.sessionStorage.setItem(CLAIMED_TRIAL_HASHES_KEY, JSON.stringify(updated));
    }
  } catch {
    // Ignore storage errors
  }
}

export function checkAndRecordSubmissionAttempt(now: number = Date.now()): {
  allowed: boolean;
  reason?: 'minute_limit' | 'ten_minute_limit';
} {
  const attemptsLastMinute = readTimestamps(ATTEMPT_1M_KEY, ONE_MINUTE_MS, now);
  if (attemptsLastMinute.length >= RATE_LIMIT_QUOTAS.MAX_ATTEMPTS_PER_MINUTE) {
    return { allowed: false, reason: 'minute_limit' };
  }

  const submissionsLastTenMin = readTimestamps(SUBMIT_10M_KEY, TEN_MINUTES_MS, now);
  if (submissionsLastTenMin.length >= RATE_LIMIT_QUOTAS.MAX_SUBMISSIONS_PER_10_MIN) {
    return { allowed: false, reason: 'ten_minute_limit' };
  }

  recordTimestamp(ATTEMPT_1M_KEY, ONE_MINUTE_MS, now);
  return { allowed: true };
}

export function recordCompletedSubmission(now: number = Date.now()): void {
  recordTimestamp(SUBMIT_10M_KEY, TEN_MINUTES_MS, now);
}

export function checkAndRecordResetOrDeleteAttempt(now: number = Date.now()): {
  allowed: boolean;
} {
  const resetsLastHour = readTimestamps(RESET_1H_KEY, ONE_HOUR_MS, now);
  if (resetsLastHour.length >= RATE_LIMIT_QUOTAS.MAX_RESETS_PER_HOUR) {
    return { allowed: false };
  }
  recordTimestamp(RESET_1H_KEY, ONE_HOUR_MS, now);
  return { allowed: true };
}

/**
 * Generates a unique, non-sensitive correlation ID for error tracking.
 */
export function generateCorrelationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `FZ-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  }
  const randomHex = Math.random().toString(16).slice(2, 10).toUpperCase();
  return `FZ-${randomHex.padEnd(8, '0')}`;
}

/**
 * Generates an unguessable session-bound erasure token for verified submissions
 * so users can only delete their own verified submission (preventing IDOR).
 */
export function generateSessionErasureToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `ert_${crypto.randomUUID().replace(/-/g, '')}`;
  }
  return `ert_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export interface OwnerRateLimitSnapshot {
  attemptsLastMinute: number;
  submissionsLastTenMinutes: number;
  resetsLastHour: number;
  claimedTrialCount: number;
}

/**
 * OWNER-ONLY FUNCTION: Returns current rate-limit counters for the Owner Console.
 * Strictly blocked on the Public URL (`ais-pre-*`).
 */
export function getOwnerRateLimitSnapshot(now: number = Date.now()): OwnerRateLimitSnapshot | null {
  if (!isOwnerPrivateHost()) {
    return null;
  }

  return {
    attemptsLastMinute: readTimestamps(ATTEMPT_1M_KEY, ONE_MINUTE_MS, now).length,
    submissionsLastTenMinutes: readTimestamps(SUBMIT_10M_KEY, TEN_MINUTES_MS, now).length,
    resetsLastHour: readTimestamps(RESET_1H_KEY, ONE_HOUR_MS, now).length,
    claimedTrialCount: readClaimedTrialFingerprints().length,
  };
}

/**
 * OWNER-ONLY FUNCTION: Clears local rate-limit buckets and claimed trial fingerprints
 * so the owner can test form flows on the Private URL without waiting for cooldown windows.
 * Strictly blocked on the Public URL (`ais-pre-*`).
 */
export function resetAllRateLimitsForOwner(): boolean {
  if (!isOwnerPrivateHost()) {
    return false;
  }

  memoryBuckets[ATTEMPT_1M_KEY] = [];
  memoryBuckets[SUBMIT_10M_KEY] = [];
  memoryBuckets[RESET_1H_KEY] = [];
  memoryClaimedHashes = [];

  try {
    window.sessionStorage.removeItem(ATTEMPT_1M_KEY);
    window.sessionStorage.removeItem(SUBMIT_10M_KEY);
    window.sessionStorage.removeItem(RESET_1H_KEY);
    window.sessionStorage.removeItem(CLAIMED_TRIAL_HASHES_KEY);
  } catch {
    // Ignore storage errors
  }

  return true;
}

