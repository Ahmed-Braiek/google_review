# Validation — route-fixed Next.js build

Validation performed after aligning the frontend with the exact Express route registration supplied by the user.

- TypeScript/TSX syntax transpilation: **52 source files**, 0 syntax failures (`next-env.d.ts` excluded from transpile-only check).
- Local TypeScript import graph: **0 missing project imports** across 53 TS/TSX files including declarations.
- Route registry smoke check: passed for health, auth, stores, games, prizes, public game, coupons, dashboard and users.
- Next.js backend proxy now forwards only the HTTP methods actually registered by this backend: GET, POST, PUT and DELETE. PATCH was removed.
- `npm run check:backend` was executed against a local mock Express-compatible server and correctly validated both `/api/health` and `/api/public/store/atelier-dore`.
- No standalone `.html` files exist in the deliverable.
- No `Math.random()` winner selection exists outside documentation.
- Lottery visual reveal is configured for **2,000 ms**; the third reel finishes at the 2-second mark. Reduced-motion accessibility uses a shorter reveal.
- Screen-to-screen motion includes View Transitions plus a CSS entry-animation fallback.
- Tutorial definitions exist for all 13 screens.
- Coupon staff flow now uses only registered protected routes in this order: login → `/api/auth/me` → coupon lookup → coupon validate.
- Store/game/prize/dashboard/user CRUD paths are centralized in `lib/api/routes.ts` and wrapped in `lib/api/merchantApi.ts` for future merchant UI.

## Environment limitation

The project dependencies are not installed in this build environment, and npm registry access is unavailable here. A full `next build` / dependency-aware TypeScript check therefore cannot be run until `npm install` succeeds in a networked environment.

After installing dependencies locally, run:

```bash
npm run typecheck
npm run build
```
