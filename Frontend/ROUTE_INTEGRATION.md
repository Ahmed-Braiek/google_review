# Backend Route Integration

The frontend has been aligned to the exact Express route registration supplied for the project.

## Route source of truth

All route strings are centralized in:

```text
lib/api/routes.ts
```

This prevents components from inventing or duplicating endpoint paths.

## Routes actively used by the 13-screen customer flow

| Purpose | Method | Express route |
|---|---|---|
| Backend/DB status | GET | `/api/health` |
| Load public store/game | GET | `/api/public/store/:slug` |
| Create participation + get winner | POST | `/api/public/store/:slug/play` |
| Track Google review CTA | POST | `/api/public/store/:slug/review-click` |
| Staff login | POST | `/api/auth/login` |
| Verify staff JWT | GET | `/api/auth/me` |
| Inspect coupon | GET | `/api/coupons/:code` |
| Validate coupon | POST | `/api/coupons/validate` |

## Registered routes not needed by the current public flow

The registry also contains the supplied store, game, prize, dashboard and user CRUD routes so future merchant/admin pages can use the same source of truth.

## Deliberately not called

The frontend does not call any of these because they are not registered in the backend you supplied:

```text
/api/redemptions/*
/api/public/coupons/:code/redemption/*
/api/delivery/*
/api/customers/*
/api/participations/*
```

The five-minute display therefore remains a local persistent compatibility timer until a backend redemption-session route exists.
