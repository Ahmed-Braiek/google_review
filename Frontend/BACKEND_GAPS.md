# Backend additions recommended for full production parity

The current backend fully controls prize selection, participation limits, coupon creation, coupon expiration, review-click tracking, staff authentication, and final coupon validation.

To make the five-minute redemption experience backend-authoritative across devices and deployments, add these routes.

## 1. Start or reuse redemption

```http
POST /api/public/coupons/:code/redemption/start
```

Expected behavior:

- create one redemption session only if none exists;
- return the existing active/expired/redeemed session on repeated calls;
- persist `started_at` and `expires_at` in MySQL;
- never reset the five-minute window.

Suggested response:

```json
{
  "success": true,
  "data": {
    "id": 10,
    "coupon_code": "CAFE-A18F72BC",
    "started_at": "2026-08-23T12:00:00.000Z",
    "expires_at": "2026-08-23T12:05:00.000Z",
    "status": "active"
  }
}
```

## 2. Read redemption/coupon status

```http
GET /api/public/coupons/:code/redemption
```

Return only non-sensitive fields required by the customer display. This allows the customer screen to detect staff validation performed on another device.

## 3. Reward delivery

```http
POST /api/public/participations/:id/delivery
```

Body:

```json
{
  "method": "email",
  "destination": "mohamed@test.com"
}
```

Support `email` and `whatsapp`, with rate limiting and delivery status.

## 4. Participation recovery

A secure recovery endpoint based on an opaque token returned by `/play` would allow the customer to restore a coupon after local browser storage is cleared without exposing coupon/customer data publicly.
