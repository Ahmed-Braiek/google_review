# Phase 1 — Security (P0)

## Scope

This phase hardens the existing customer frontend, Express/MySQL backend, and staff dashboard without redesigning the UI.

## Implemented

### Backend-authoritative redemption

- Added `redemption_sessions` migration (`migrations/001_phase1_redemption_security.sql`).
- The backend creates the 5-minute session with database time and persists `started_at`, `expires_at`, state, secure public token, store, tenant, coupon and staff redemption metadata.
- A coupon has at most one redemption session.
- Public redemption status is re-checked server-side; browser/local storage is not authoritative.
- Staff validation uses a database transaction and row locking and marks coupon + redemption together.
- The legacy coupon-validation endpoint now also requires a valid active redemption session so the 5-minute policy cannot be bypassed by entering only the coupon code.

### Customer device isolation

- Removed staff login and staff JWT handling from the customer frontend.
- Customer application exposes only public API routes through its Next.js proxy.
- The customer cannot finalize redemption.

### Secure QR validation URLs

- Redemption start generates a 256-bit random token (`crypto.randomBytes(32)`).
- The QR contains only the dashboard HTTPS redemption URL, for example `https://dashboard.example.com/redeem/<token>`.
- The QR does not include customer personal information, store IDs, or raw authentication material.
- In production, the backend rejects a non-HTTPS dashboard public URL.

### Staff validation in dashboard

- Added `/redeem/[token]` to the dashboard.
- Staff must have an authenticated dashboard session.
- The dashboard obtains redemption details from the backend and validates through the protected redemption endpoint.
- Authorization remains enforced by the Express backend for `owner`, `manager`, and `cashier` roles.

### JWT/session hardening

- Dashboard JWT is no longer stored in `localStorage` or `sessionStorage`.
- Login is handled by a Next.js BFF route and the backend JWT is kept in an HttpOnly, SameSite=Strict cookie; `Secure` is enabled in production.
- Browser JavaScript never receives the JWT.
- Protected Express requests reload the user from MySQL and use the database user role/status/tenant instead of trusting JWT authorization claims.
- JWT verification is pinned to HS256 and configured issuer/audience.

### API proxy hardening

- Customer proxy is allowlisted to public customer endpoints only and does not forward browser Authorization headers.
- Dashboard proxy reads the JWT only from the HttpOnly cookie and allowlists dashboard API roots.
- State-changing dashboard proxy requests enforce same-origin checks.
- Request body limits and upstream timeouts were added.
- Optional client-IP forwarding requires a shared proxy secret and a deployment-controlled trusted header.

### CORS and security headers

- Express wildcard CORS was replaced with a `CORS_ORIGINS` allowlist.
- Helmet remains enabled and `X-Powered-By` is disabled.
- Next.js frontend/dashboard send CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and clickjacking protection headers.
- Authentication/play/redemption routes have specific rate limiters.

### Client-side coupon status

- Persisted frontend state no longer determines redeemed/expired state.
- On load/refresh, a saved redemption token is revalidated against the backend.
- Countdown is display-only and is driven by server-provided remaining seconds; expiry is confirmed by a backend refresh.

## Required deployment configuration

### Backend `.env`

Use `google_review-main/.env.example`. Important Phase 1 values:

- `JWT_SECRET` — strong random production secret.
- `CORS_ORIGINS` — exact public frontend and dashboard origins, comma separated.
- `DASHBOARD_PUBLIC_URL` — production HTTPS dashboard origin.
- `PROXY_SHARED_SECRET` — strong shared secret used only between Next.js and Express.
- `TRUST_PROXY_HOPS` — set only after confirming the real reverse-proxy topology.

### Frontend `.env.local`

Use `Frontend/.env.example`.

### Dashboard `.env.local`

Use `Dashboard/.env.example`.

### Database

Run the migration before deploying the Phase 1 backend:

```bash
mysql -u YOUR_USER -p YOUR_DATABASE < migrations/001_phase1_redemption_security.sql
```

Back up the production database first and test the migration in staging.

## Verification performed in this environment

- Node syntax validation passed for backend JavaScript source files.
- TypeScript/TSX parser syntax validation passed for frontend + dashboard.
- Local TypeScript/TSX import-resolution check passed.
- A full `npm ci` / framework production build could not be completed in this environment because package installation timed out earlier. Run the commands below in the real project environment before production.

```bash
# frontend
npm ci
npm run typecheck
npm run build

# dashboard
npm ci
npm run typecheck
npm run build

# backend
npm ci
npm test   # if a test script exists / after adding the Phase 3 test suite
```

## Phase 1 production gate

Do not deploy until:

1. the SQL migration has succeeded in staging and production,
2. all three applications have their production environment variables,
3. `DASHBOARD_PUBLIC_URL` is HTTPS,
4. CORS origins are exact,
5. proxy/IP settings match the real hosting topology,
6. full installs/builds pass on your deployment environment,
7. a real staff device successfully scans and validates a customer QR,
8. refresh, duplicate validation and expired-session tests pass against the real database.
