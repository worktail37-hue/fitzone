import { appConfig } from './env';
import { generateCorrelationId, generateSessionErasureToken } from './rateLimiter';
import { sanitizeInput, sanitizeMultilineInput } from './sanitize';

export interface FreeTrialFormPayload {
  fullName: string;
  email: string;
  phone?: string;
  preferredPlan: string;
  preferredTime: string;
  fitnessGoal: string;
  message?: string;
  consent: boolean;
}

export interface SubmitFormResult {
  ok: boolean;
  correlationId?: string;
  erasureToken?: string;
  errorMessage?: string;
}

const REQUEST_TIMEOUT_MS = 10000;
const DEMO_SIMULATION_DELAY_MS = 1000;
const GENERIC_SUBMISSION_ERROR =
  'Unable to process your request right now. Please check your connection and try again.';

function buildGenericErrorResult(): SubmitFormResult {
  const correlationId = generateCorrelationId();
  return {
    ok: false,
    correlationId,
    errorMessage: `${GENERIC_SUBMISSION_ERROR} (Ref: ${correlationId})`,
  };
}

/**
 * Sanitizes, minimizes, and submits the Free Trial form payload via POST JSON.
 *
 * - Strips optional `phone` and `message` fields when empty so no unnecessary keys are sent.
 * - Uses `credentials: 'omit'`, `referrerPolicy: 'no-referrer'`, and attaches an `X-Correlation-ID` header.
 * - Issues a session-bound `erasureToken` so subsequent data-deletion requests are cryptographically
 *   bound to the verified submission (preventing arbitrary email IDOR deletion).
 */
export async function submitFreeTrialForm(
  rawPayload: FreeTrialFormPayload
): Promise<SubmitFormResult> {
  const cleanPhone = rawPayload.phone ? sanitizeInput(rawPayload.phone) : '';
  const cleanMessage = rawPayload.message
    ? sanitizeMultilineInput(rawPayload.message).slice(0, 500)
    : '';

  const minimizedPayload: FreeTrialFormPayload = {
    fullName: sanitizeInput(rawPayload.fullName),
    email: sanitizeInput(rawPayload.email).toLowerCase(),
    preferredPlan: sanitizeInput(rawPayload.preferredPlan),
    preferredTime: sanitizeInput(rawPayload.preferredTime),
    fitnessGoal: sanitizeInput(rawPayload.fitnessGoal),
    consent: Boolean(rawPayload.consent),
    ...(cleanPhone ? { phone: cleanPhone } : {}),
    ...(cleanMessage ? { message: cleanMessage } : {}),
  };

  const erasureToken = generateSessionErasureToken();
  const endpoint = appConfig.formEndpoint;

  if (!endpoint) {
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, DEMO_SIMULATION_DELAY_MS);
    });
    return { ok: true, erasureToken };
  }

  const correlationId = generateCorrelationId();
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Correlation-ID': correlationId,
        'X-Erasure-Token': erasureToken,
      },
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(minimizedPayload),
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        ok: false,
        correlationId,
        errorMessage: `${GENERIC_SUBMISSION_ERROR} (Ref: ${correlationId})`,
      };
    }

    return { ok: true, correlationId, erasureToken };
  } catch {
    return buildGenericErrorResult();
  } finally {
    window.clearTimeout(timeoutId);
  }
}

/**
 * Sends a personal data deletion/erasure request ONLY when the caller possesses
 * a valid session-bound `erasureToken` from a verified submission (preventing IDOR
 * where an attacker types another user's email address and triggers deletion).
 */
export async function requestPersonalDataDeletion(
  verifiedErasureToken: string | null
): Promise<SubmitFormResult> {
  const endpoint = appConfig.formEndpoint;

  // Never send a remote DELETE request without a verified session erasureToken
  if (!endpoint || !verifiedErasureToken || !verifiedErasureToken.startsWith('ert_')) {
    return { ok: true };
  }

  const correlationId = generateCorrelationId();
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Correlation-ID': correlationId,
        Authorization: `Bearer ${verifiedErasureToken}`,
      },
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify({
        action: 'delete_personal_data',
        erasureToken: verifiedErasureToken,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        ok: false,
        correlationId,
        errorMessage: `${GENERIC_SUBMISSION_ERROR} (Ref: ${correlationId})`,
      };
    }

    return { ok: true, correlationId };
  } catch {
    return buildGenericErrorResult();
  } finally {
    window.clearTimeout(timeoutId);
  }
}
