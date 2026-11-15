# FITZONE — High-Performance Gym & Training Club

A single-page, multi-section performance gym website built with **React 19**, **Vite**, **TypeScript**, **Tailwind CSS v4**, **Framer Motion (`motion/react`)**, **GSAP**, and **lucide-react**.

---

## Architecture & Sections

1. **Navbar & Scroll Progress Bar**: Sticky pill-shaped navigation bar with mobile slide-down focus-trapped menu and a 3px GPU-accelerated Signal Red scroll progress indicator.
2. **Hero**: Two-column layout with staggered entrance fade-ins, LCP-optimized athlete photography, floating glass metric cards, and an accessible video walkthrough modal.
3. **About (`#about`)**: Brand story, 4 `IntersectionObserver` + `requestAnimationFrame` count-up statistics cards, and a wide facility video feature block.
4. **Services (`#services`)**: Native CSS scroll-snap horizontal carousel with touch swipe, mouse drag, keyboard navigation, and a passive scroll progress indicator.
5. **Why Choose Us (`#why-us`)**: Split athlete visual with member rating glass badge and a single-open keyboard-accessible accordion.
6. **Trainers (`#trainers`)**: Connected spring-physics coach carousel with SVG metaball bridges, autoplay progress indicator, and accessible social links.
7. **Membership Plans (`#plans`)**: 3-tier pricing cards (`Basic`, featured `Standard`, `Premium`) with GSAP card-fan entrance and elastic hover spread that preselects the chosen plan in the Free Trial form.
8. **Global Locations (`#locations`)**: Single inline SVG dotted world map (`<pattern>` + `<clipPath>`) with 12 focusable city markers and edge-safe tooltips.
9. **Gallery (`#gallery`)**: Alternating `4:5` and `4:3` native scroll-snap carousel with an accessible full-screen lightbox viewer.
10. **Testimonials (`#testimonials`)**: `ResizeObserver`-driven Framer Motion sliding carousel (1/2/3 cards per view) with pause-aware 6-second autoplay.
11. **FAQ (`#faq`)**: 7-question accessible single-open accordion.
12. **Contact / Free-Trial Form (`#contact`)**: Controlled, validated, sanitized lead capture form with honeypot, timing check, and client-side rate limiting.
13. **CTA (`#cta`) & Footer**: Final conversion card and 4-column semantic footer with back-to-top button.

---

## Development & Build

```bash
npm install
npm run dev      # Starts Vite dev server on port 3000
npm run lint     # Runs strict TypeScript check (tsc --noEmit)
npm run build    # Produces production bundle in dist/
```

Configure environment variables in `.env.local` by copying `.env.example`:

```ini
VITE_SITE_NAME="FITZONE"
VITE_APP_URL=""
VITE_SUPPORT_EMAIL="concierge@fitzone.club"
VITE_FORM_ENDPOINT=""
```

---

## SECURITY NOTES

### 1. CRITICAL WARNING: Git History & Secret Rotation
> **WARNING — ROTATE ANY PREVIOUSLY HARDCODED SECRETS IMMEDIATELY:**
> Removing a hardcoded secret in a new commit does **not** remove it from Git history (`git log`, commit blobs, or public forks). If any API key, database URI, Stripe secret key, Supabase `service_role` key, OAuth client secret, or JWT signing key was ever committed to the repository at any point in the past, consider it compromised and **rotate/revoke that credential immediately** in the provider's dashboard before deploying to production.

### 2. Environment Variables & Client-Side Exposure Rules
- **Browser-Exposed Prefixes (`VITE_`, `NEXT_PUBLIC_`, `REACT_APP_`)**: Any variable prefixed with `VITE_` (or `NEXT_PUBLIC_` / `REACT_APP_`) is statically embedded into the client JavaScript bundle and visible to anyone inspecting network traffic or source maps.
- **What Must NEVER Be Exposed Client-Side**:
  - **Supabase**: Never expose the `service_role` key in client code. The Supabase `anon` key may only be used client-side if **Row Level Security (RLS)** is enabled and enforced on every table.
  - **Stripe**: Only the publishable key (`pk_live_*` / `pk_test_*`) may be used client-side. The Stripe secret key (`sk_live_*` / `sk_test_*`) and webhook signing secret (`whsec_*`) must stay strictly server-side.
  - **Database Connection Strings**: PostgreSQL URLs, MongoDB URIs, and Redis URLs must remain server-side only.
  - **Auth & Third-Party API Keys**: OAuth client secrets, JWT signing keys, and third-party API keys (Gemini, OpenAI, SendGrid, Twilio, AWS, Firebase Admin) must remain in server-side environment variables only.

### 3. Server-Side Validation & Anti-Abuse Requirements
Client-side validation, input sanitization (`src/lib/sanitize.ts`), minimum interaction timing checks, honeypot fields, and `sessionStorage` rate limiting improve UX and deter basic bots, **but client-side controls can always be bypassed by direct HTTP requests**. When connecting `VITE_FORM_ENDPOINT` to a production backend:
- **Re-validate and sanitize on the server**: Enforce strict schema validation (length limits, allowed enum values, email/phone format) and strip/escape HTML on the backend before storing or forwarding leads.
- **Server-side rate limiting**: Enforce IP-based and fingerprint-based rate limiting (e.g., Redis token bucket or Cloudflare WAF rules).
- **Bot verification (CAPTCHA)**: Integrate **Cloudflare Turnstile** or **Google reCAPTCHA** with server-side token verification on the POST handler.
- **CORS & CSRF protection**: Restrict `Access-Control-Allow-Origin` to the production domain and require JSON content types.

### 4. Recommended Production HTTP Security Headers
Serve the production build over **HTTPS only** and configure your reverse proxy, CDN, or Cloud Run / hosting layer to send the following HTTP response headers:

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://images.unsplash.com; connect-src 'self' https://your-api-endpoint.example.com; frame-ancestors 'self';
```
