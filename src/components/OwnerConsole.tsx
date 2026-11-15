import { Check, Copy, Lock, RefreshCw, ShieldCheck, Sliders, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AllowedPlanOption } from '../data/contact';
import { useFocusTrap } from '../hooks/useFocusTrap';
import {
  enforcePublicUrlCleanliness,
  getActiveUrls,
  isOwnerPrivateHost,
} from '../lib/accessControl';
import {
  getOwnerRateLimitSnapshot,
  OwnerRateLimitSnapshot,
  RATE_LIMIT_QUOTAS,
  resetAllRateLimitsForOwner,
} from '../lib/rateLimiter';

interface OwnerConsoleProps {
  selectedPlan: AllowedPlanOption;
  onOwnerSelectPlan: (plan: AllowedPlanOption) => void;
}

export function OwnerConsole({ selectedPlan, onOwnerSelectPlan }: OwnerConsoleProps) {
  const [isOwnerHost, setIsOwnerHost] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<'private' | 'public' | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<OwnerRateLimitSnapshot>({
    attemptsLastMinute: 0,
    submissionsLastTenMinutes: 0,
    resetsLastHour: 0,
    claimedTrialCount: 0,
  });

  const modalRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const { privateOwnerUrl, publicVisitorUrl } = getActiveUrls();

  const refreshSnapshot = useCallback(() => {
    const data = getOwnerRateLimitSnapshot();
    if (data) {
      setSnapshot(data);
    }
  }, []);

  useEffect(() => {
    enforcePublicUrlCleanliness();
    const allowed = isOwnerPrivateHost();
    setIsOwnerHost(allowed);

    if (allowed) {
      refreshSnapshot();
      setIsOpen(true);
    }
  }, [refreshSnapshot]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setResetSuccessMessage(null);
  }, []);

  const handleOpen = useCallback(() => {
    if (!isOwnerPrivateHost()) return;
    refreshSnapshot();
    setIsOpen(true);
  }, [refreshSnapshot]);

  useFocusTrap(modalRef, isOpen && isOwnerHost, handleClose, triggerRef);

  const handleCopyUrl = useCallback(async (url: string, key: 'private' | 'public') => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 2200);
    } catch {
      // Clipboard API unavailable in restricted context
    }
  }, []);

  const handleResetQuotas = useCallback(() => {
    if (!isOwnerPrivateHost()) return;
    const didReset = resetAllRateLimitsForOwner();
    if (didReset) {
      refreshSnapshot();
      setResetSuccessMessage(
        'All local trial rate-limit counters and claimed email locks have been reset for owner testing.'
      );
    }
  }, [refreshSnapshot]);

  const handleTestPlanFunnel = useCallback(
    (plan: AllowedPlanOption) => {
      if (!isOwnerPrivateHost()) return;
      onOwnerSelectPlan(plan);
      setIsOpen(false);
      const contactEl = document.getElementById('contact');
      contactEl?.scrollIntoView({ behavior: 'smooth' });
    },
    [onOwnerSelectPlan]
  );

  // STRICT SECURITY BOUNDARY: Never mount any DOM nodes on the Public Visitor URL (/public or /)
  if (!isOwnerHost) {
    return null;
  }

  return (
    <>
      {/* Floating Owner Trigger Badge — Rendered EXCLUSIVELY on Private Owner URL (/owner) */}
      <div className="fixed bottom-5 left-5 z-40">
        <button
          ref={triggerRef}
          type="button"
          onClick={handleOpen}
          aria-label="Open FITZONE Owner Private Console"
          className="inline-flex min-h-[44px] min-w-[44px] items-center gap-2.5 rounded-xl border border-signal/50 bg-slate-navy/95 px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-cloud shadow-card backdrop-blur-md transition-all duration-200 hover:border-signal hover:bg-signal hover:shadow-signal-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
        >
          <Lock className="h-4 w-4 text-signal group-hover:text-cloud" aria-hidden="true" />
          <span>Owner Console</span>
        </button>
      </div>

      {/* Owner Command Center Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-midnight/85 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="owner-console-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
        >
          <div
            ref={modalRef}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-cloud-border bg-slate-navy p-6 md:p-8 text-cloud shadow-card"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-cloud-border pb-5">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-display font-bold uppercase tracking-widest text-signal mb-1.5">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  <span>Owners Only • Private Environment</span>
                </div>
                <h2
                  id="owner-console-title"
                  className="font-display text-xl md:text-2xl font-extrabold uppercase tracking-tight text-cloud"
                >
                  FITZONE <span className="text-signal">OWNER COMMAND</span>
                </h2>
                <p className="mt-1 text-xs md:text-sm text-cloud-muted">
                  These administrative tools and diagnostics are strictly isolated to the Private Owner URL and are completely stripped from the Public URL.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Close Owner Console"
                className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-cloud-border bg-midnight/70 text-cloud-muted transition-colors hover:border-signal hover:text-cloud focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Section 1: Verified Environment URLs */}
            <div className="mt-6 space-y-4">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-cloud-muted">
                1. Environment Access URLs
              </h3>

              {/* Private URL Card */}
              <div className="rounded-2xl border border-signal/40 bg-midnight/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <span className="font-display text-xs font-bold uppercase tracking-wider text-signal">
                    Private URL (Owners Only — Full Owner Controls)
                  </span>
                  <span className="text-xs font-medium text-cloud-muted">
                    Owner Console Unlocked
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <code className="break-all rounded-lg bg-slate-navy/80 px-3 py-2 text-xs text-cloud border border-cloud-border flex-1">
                    {privateOwnerUrl}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(privateOwnerUrl, 'private')}
                    className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-2 rounded-xl bg-signal px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-cloud transition-colors hover:bg-signal-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud"
                  >
                    {copiedKey === 'private' ? (
                      <>
                        <Check className="h-4 w-4" aria-hidden="true" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" aria-hidden="true" />
                        <span>Copy Private URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Public URL Card */}
              <div className="rounded-2xl border border-cloud-border bg-midnight/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <span className="font-display text-xs font-bold uppercase tracking-wider text-cloud">
                    Public URL (Everyone Else — Visitor Mode Only)
                  </span>
                  <span className="text-xs font-medium text-cloud-muted">
                    Owner Functions Blocked
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <code className="break-all rounded-lg bg-slate-navy/80 px-3 py-2 text-xs text-cloud border border-cloud-border flex-1">
                    {publicVisitorUrl}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(publicVisitorUrl, 'public')}
                    className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-2 rounded-xl border border-cloud-border bg-slate-navy px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-cloud transition-colors hover:border-signal hover:text-signal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
                  >
                    {copiedKey === 'public' ? (
                      <>
                        <Check className="h-4 w-4" aria-hidden="true" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" aria-hidden="true" />
                        <span>Copy Public URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Section 2: Owner-Only Rate Limit & Trial Quota Management */}
            <div className="mt-6 border-t border-cloud-border pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-cloud-muted">
                    2. Owner-Only Trial Quota &amp; Security Controls
                  </h3>
                  <p className="text-xs text-cloud-muted mt-0.5">
                    Inspect or reset session anti-spam counters for testing the Free Trial funnel.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetQuotas}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-xl border border-signal/50 bg-midnight px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-cloud transition-colors hover:bg-signal hover:border-signal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  <span>Reset Trial Quotas</span>
                </button>
              </div>

              {resetSuccessMessage && (
                <div
                  role="status"
                  className="mb-4 rounded-xl border border-signal/40 bg-midnight/90 px-4 py-3 text-xs text-cloud"
                >
                  {resetSuccessMessage}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-cloud-border bg-midnight/60 p-3">
                  <div className="text-xs text-cloud-muted">Attempts (1m)</div>
                  <div className="mt-1 font-display text-lg font-extrabold text-cloud">
                    {snapshot.attemptsLastMinute} / {RATE_LIMIT_QUOTAS.MAX_ATTEMPTS_PER_MINUTE}
                  </div>
                </div>
                <div className="rounded-xl border border-cloud-border bg-midnight/60 p-3">
                  <div className="text-xs text-cloud-muted">Trials (10m)</div>
                  <div className="mt-1 font-display text-lg font-extrabold text-cloud">
                    {snapshot.submissionsLastTenMinutes} /{' '}
                    {RATE_LIMIT_QUOTAS.MAX_SUBMISSIONS_PER_10_MIN}
                  </div>
                </div>
                <div className="rounded-xl border border-cloud-border bg-midnight/60 p-3">
                  <div className="text-xs text-cloud-muted">Erasures (1h)</div>
                  <div className="mt-1 font-display text-lg font-extrabold text-cloud">
                    {snapshot.resetsLastHour} / {RATE_LIMIT_QUOTAS.MAX_RESETS_PER_HOUR}
                  </div>
                </div>
                <div className="rounded-xl border border-cloud-border bg-midnight/60 p-3">
                  <div className="text-xs text-cloud-muted">Claimed Emails</div>
                  <div className="mt-1 font-display text-lg font-extrabold text-signal">
                    {snapshot.claimedTrialCount}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Owner Funnel Simulator */}
            <div className="mt-6 border-t border-cloud-border pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Sliders className="h-4 w-4 text-signal" aria-hidden="true" />
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-cloud-muted">
                  3. Owner Funnel Test — Pre-Select Tier &amp; Jump to Trial Form
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['Basic', 'Standard', 'Premium'] as const).map((tier) => {
                  const isActive = selectedPlan === tier;
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => handleTestPlanFunnel(tier)}
                      className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal ${
                        isActive
                          ? 'border-signal bg-signal text-cloud'
                          : 'border-cloud-border bg-midnight/70 text-cloud hover:border-signal'
                      }`}
                    >
                      Test {tier} Funnel
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
