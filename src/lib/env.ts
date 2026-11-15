/**
 * Validated environment configuration and startup security assertions.
 *
 * - Ensures debug mode defaults strictly to OFF (false).
 * - Refuses to start if sensitive server-only secrets are accidentally exposed with a VITE_ prefix.
 * - Validates that VITE_FORM_ENDPOINT (when set in production) uses HTTPS or a same-origin relative path.
 * - Provides a database connection string validator enforcing TLS/SSL and rejecting default credentials.
 */

const FORBIDDEN_CLIENT_SECRET_KEYS = [
  'VITE_DATABASE_URL',
  'VITE_POSTGRES_URL',
  'VITE_MONGODB_URI',
  'VITE_SUPABASE_SERVICE_ROLE_KEY',
  'VITE_STRIPE_SECRET_KEY',
  'VITE_JWT_SECRET',
  'VITE_AUTH_SECRET',
  'VITE_OAUTH_CLIENT_SECRET',
  'VITE_OPENAI_API_KEY',
  'VITE_GEMINI_API_KEY',
  'VITE_SENDGRID_API_KEY',
  'VITE_TWILIO_AUTH_TOKEN',
  'VITE_AWS_SECRET_ACCESS_KEY',
] as const;

const WEAK_DB_CREDENTIALS = [
  'postgres:postgres@',
  'root:root@',
  'admin:admin@',
  'user:password@',
  ':password@',
  ':123456@',
] as const;

export const appConfig = {
  siteName: (import.meta.env.VITE_SITE_NAME as string | undefined)?.trim() || 'FITZONE',
  appUrl: (import.meta.env.VITE_APP_URL as string | undefined)?.trim() || '',
  supportEmail:
    (import.meta.env.VITE_SUPPORT_EMAIL as string | undefined)?.trim() ||
    'concierge@fitzone.club',
  formEndpoint: (import.meta.env.VITE_FORM_ENDPOINT as string | undefined)?.trim() || '',
  debugMode: false as const,
} as const;

/**
 * Validates that a database connection string enforces TLS/SSL in production
 * and does not use default or missing credentials.
 */
export function validateDatabaseConnectionSecurity(
  connectionString: string | undefined,
  isProduction: boolean
): void {
  if (!connectionString) {
    return;
  }

  const normalized = connectionString.trim().toLowerCase();

  for (const weakCred of WEAK_DB_CREDENTIALS) {
    if (normalized.includes(weakCred)) {
      throw new Error(
        'Configuration Error: Database connection string contains default or weak credentials.'
      );
    }
  }

  if (
    isProduction &&
    !normalized.includes('sslmode=require') &&
    !normalized.includes('sslmode=verify-full') &&
    !normalized.includes('ssl=true') &&
    !normalized.includes('tls=true')
  ) {
    throw new Error(
      'Configuration Error: Production database connection must enforce TLS/SSL (e.g., ?sslmode=require).'
    );
  }
}

/**
 * Runs at application startup and throws a fatal error if critical security
 * or environment invariants are violated.
 */
export function assertValidEnvironmentConfig(): void {
  const envRecord = import.meta.env as Record<string, unknown>;
  const isProd = Boolean(import.meta.env.PROD);

  // 1. Refuse to start if any server-only secret is exposed to the browser via VITE_
  for (const forbiddenKey of FORBIDDEN_CLIENT_SECRET_KEYS) {
    const val = envRecord[forbiddenKey];
    if (typeof val === 'string' && val.trim().length > 0) {
      throw new Error(
        `Fatal Security Error: Sensitive credential "${forbiddenKey}" must never be exposed with a client-side prefix.`
      );
    }
  }

  // 2. Ensure debug mode is never enabled in production
  const rawDebug = envRecord['VITE_DEBUG'];
  if (isProd && (rawDebug === 'true' || rawDebug === '1')) {
    throw new Error(
      'Fatal Security Error: Debug mode (VITE_DEBUG) must be disabled in production.'
    );
  }

  // 3. Validate VITE_FORM_ENDPOINT protocol if configured
  const endpoint = appConfig.formEndpoint;
  if (endpoint.length > 0) {
    const isRelativeSameOrigin = endpoint.startsWith('/') && !endpoint.startsWith('//');
    const isHttps = endpoint.startsWith('https://');
    const isLocalDevHttp =
      !isProd &&
      (endpoint.startsWith('http://localhost:') ||
        endpoint.startsWith('http://127.0.0.1:'));

    if (!isRelativeSameOrigin && !isHttps && !isLocalDevHttp) {
      throw new Error(
        'Configuration Error: VITE_FORM_ENDPOINT must be a valid HTTPS URL or a same-origin relative path.'
      );
    }
  }
}
