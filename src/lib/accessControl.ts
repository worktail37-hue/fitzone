/**
 * Strict Route & Host-Based Access Control separating the Owner-Only Private URL
 * (`/owner`) from the Public Visitor URL (`/public` and `/`).
 *
 * Works seamlessly across Netlify (`*.netlify.app`) and Cloud Run (`*.run.app`):
 * - When accessed via `/` or `/public`, all owner UI elements and owner functions are
 *   completely unmounted and blocked.
 * - When accessed via `/owner` (or `?portal=owner`), the Owner Command Center is unlocked.
 */

export function getActiveUrls(): {
  privateOwnerUrl: string;
  publicVisitorUrl: string;
} {
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://ais-dev-txhpsrxlkvhfsj4owt4ow4-8459846797.asia-east1.run.app';

  return {
    privateOwnerUrl: `${origin}/owner`,
    publicVisitorUrl: `${origin}/public`,
  };
}

const PUBLIC_SHARED_HOST_PREFIX = 'ais-pre-';

/**
 * Returns true ONLY when the user is on the Private Owner URL (`/owner` or `?portal=owner`)
 * and NOT on the `/public` visitor route or `ais-pre-*` public domain.
 */
export function isOwnerPrivateHost(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const hostname = window.location.hostname.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();

  // Never allow owner functions on the `/public` URL or `ais-pre-*` domain
  if (
    hostname.startsWith(PUBLIC_SHARED_HOST_PREFIX) ||
    pathname === '/public' ||
    pathname.startsWith('/public/')
  ) {
    return false;
  }

  // Owner UI is only *hidden* here, never secured: anyone can type /owner or
  // ?portal=owner. Treat this as presentation only, and additionally require the
  // deploy-time flag VITE_OWNER_PORTAL=1 so a production build can keep it off
  // entirely. Real authorisation must happen on the server / in Firestore rules.
  const ownerPortalEnabled = String(import.meta.env.VITE_OWNER_PORTAL || '').trim() === '1';
  if (!ownerPortalEnabled) {
    return false;
  }

  if (pathname === '/owner' || pathname.startsWith('/owner/')) {
    return true;
  }

  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('portal') === 'owner';
  } catch {
    return false;
  }
}

/**
 * Ensures that if a user is on `/public` or `/`, any accidental owner query/hash flags
 * are stripped immediately from the address bar.
 */
export function enforcePublicUrlCleanliness(): void {
  if (typeof window === 'undefined' || isOwnerPrivateHost()) {
    return;
  }

  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has('portal') || url.hash === '#owner') {
      url.searchParams.delete('portal');
      if (url.hash === '#owner') {
        url.hash = '';
      }
      window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
    }
  } catch {
    // Ignore URL parsing errors
  }
}
