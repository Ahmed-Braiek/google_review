# Google Review Gamification SaaS — Backend API Documentation

**Version:** MVP 1.0  
**Backend:** Node.js + Express  
**Database:** MySQL  
**Authentication:** JWT  
**Architecture:** Multi-tenant / multi-store  
**Default local base URL:** `http://localhost:3000`

---

## 1. Overview

This backend powers a multi-tenant SaaS for cafés, restaurants, and other merchants using a gamified QR-code experience.

A single MySQL database manages multiple companies (`tenants`) and multiple stores for each company.

Main flow:

1. Customer scans the store QR code.
2. Frontend loads the public store/game configuration.
3. Customer submits their contact information.
4. Backend selects the winning prize.
5. Backend creates a participation.
6. Backend creates a unique coupon valid for 30 days.
7. Customer can click the Google review CTA.
8. Backend tracks the review click.
9. Cashier/manager/owner can validate the coupon.
10. Merchant dashboard shows analytics.

---

# 2. Technology Stack

- Node.js
- Express
- MySQL / `mysql2`
- JWT / `jsonwebtoken`
- `bcryptjs`
- `dotenv`
- `cors`
- `helmet`
- `express-rate-limit`
- `crypto`

---

# 3. Environment Variables

Example `.env`:

```env
PORT=3000

DB_HOST=srv1928.hstgr.io
DB_PORT=3306
DB_NAME=u597838853_google_review
DB_USER=u597838853_google_review
DB_PASSWORD=YOUR_DATABASE_PASSWORD

JWT_SECRET=YOUR_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=7d
```

Frontend does not need the database credentials.

---

# 4. Authentication

Authentication uses JWT Bearer tokens.

Login returns:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "JWT_TOKEN",
    "user": {
      "id": 1,
      "tenant_id": 1,
      "name": "Coffee Owner",
      "email": "owner@test.com",
      "role": "owner"
    }
  }
}
```

Protected requests must send:

```http
Authorization: Bearer JWT_TOKEN
```

JWT contains:

```json
{
  "userId": 1,
  "tenantId": 1,
  "role": "owner"
}
```

The backend obtains the tenant from the JWT. The frontend must not send or choose `tenant_id`.

---

# 5. Roles

Implemented roles:

- `owner`
- `manager`
- `cashier`
- `super_admin` exists in the database model but the current merchant user-management API does not allow owners to create super admins.

Current permissions:

| Feature | Owner | Manager | Cashier |
|---|---:|---:|---:|
| Login | Yes | Yes | Yes |
| Dashboard | Yes | Yes | No |
| Manage users | Yes | No | No |
| Coupon lookup | Yes | Yes | Yes |
| Coupon validation | Yes | Yes | Yes |
| Store/Game/Prize routes | JWT protected; frontend should expose merchant management mainly to owner/authorized back-office users |
| Public game | Public | Public | Public |

> Important MVP note: users currently belong to a tenant, not yet to a specific store. Store-level staff assignment was identified as a recommended next hardening step but is not part of the completed backend.

---

# 6. Standard Response Format

Success:

```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

Failure:

```json
{
  "success": false,
  "message": "Error message"
}
```

Common HTTP codes:

- `200` success
- `201` created
- `400` invalid request/configuration
- `401` missing/invalid JWT
- `403` access denied
- `404` resource not found
- `409` conflict/already used/already exists
- `410` expired resource
- `429` participation/rate limit
- `500` internal server error

---

# 7. Health

## GET `/api/health`

Checks API and MySQL connection.

### cURL

```bash
curl -X GET "http://localhost:3000/api/health"
```

Example response:

```json
{
  "success": true,
  "message": "Google Review SaaS API is running",
  "database": "connected",
  "database_time": "2026-08-23T00:00:00.000Z"
}
```

---

# 8. Auth API

## POST `/api/auth/login`

### Body

```json
{
  "email": "owner@test.com",
  "password": "Admin123!"
}
```

### cURL

```bash
curl -X POST "http://localhost:3000/api/auth/login" \
-H "Content-Type: application/json" \
-d "{\"email\":\"owner@test.com\",\"password\":\"Admin123!\"}"
```

### Success

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "JWT_TOKEN",
    "user": {
      "id": 1,
      "tenant_id": 1,
      "name": "Coffee Owner",
      "email": "owner@test.com",
      "role": "owner"
    }
  }
}
```

---

## GET `/api/auth/me`

Returns logged-in user.

### cURL

```bash
curl -X GET "http://localhost:3000/api/auth/me" \
-H "Authorization: Bearer YOUR_TOKEN"
```

---

# 9. Stores API

All routes require JWT.

## POST `/api/stores`

Create a store.

### Body

```json
{
  "name": "Coffee Lac 1",
  "slug": "coffee-lac-1",
  "address": "Les Berges du Lac 1, Tunis",
  "phone": "+21620000000",
  "google_review_url": "https://g.page/r/TEST/review",
  "logo_url": "https://example.com/logo.png",
  "primary_color": "#C58A45"
}
```

### cURL

```bash
curl -X POST "http://localhost:3000/api/stores" \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d "{\"name\":\"Coffee Lac 1\",\"slug\":\"coffee-lac-1\",\"address\":\"Les Berges du Lac 1, Tunis\",\"phone\":\"+21620000000\",\"google_review_url\":\"https://g.page/r/TEST/review\",\"logo_url\":\"https://example.com/logo.png\",\"primary_color\":\"#C58A45\"}"
```

---

## GET `/api/stores`

List current tenant stores.

```bash
curl -X GET "http://localhost:3000/api/stores" \
-H "Authorization: Bearer YOUR_TOKEN"
```

---

## GET `/api/stores/:id`

```bash
curl -X GET "http://localhost:3000/api/stores/1" \
-H "Authorization: Bearer YOUR_TOKEN"
```

---

## PUT `/api/stores/:id`

Partial update supported.

### Body example

```json
{
  "name": "Coffee Lac Premium",
  "primary_color": "#D4A15A"
}
```

### cURL

```bash
curl -X PUT "http://localhost:3000/api/stores/1" \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d "{\"name\":\"Coffee Lac Premium\",\"primary_color\":\"#D4A15A\"}"
```

---

## DELETE `/api/stores/:id`

MVP route physically deletes the store.

```bash
curl -X DELETE "http://localhost:3000/api/stores/1" \
-H "Authorization: Bearer YOUR_TOKEN"
```

> Recommended production improvement: prefer `status = inactive` instead of physical deletion.

---

# 10. Games API

Supported game types:

- `wheel`
- `scratch`
- `slot`

## POST `/api/games`

### Body

```json
{
  "store_id": 1,
  "name": "Summer Wheel",
  "type": "wheel",
  "title": "Tournez et gagnez !",
  "description": "Gagnez un cadeau offert par Coffee Lac",
  "active": true
}
```

### cURL

```bash
curl -X POST "http://localhost:3000/api/games" \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d "{\"store_id\":1,\"name\":\"Summer Wheel\",\"type\":\"wheel\",\"title\":\"Tournez et gagnez !\",\"description\":\"Gagnez un cadeau offert par Coffee Lac\",\"active\":true}"
```

---

## GET `/api/games`

```bash
curl -X GET "http://localhost:3000/api/games" \
-H "Authorization: Bearer YOUR_TOKEN"
```

Filter:

```http
GET /api/games?store_id=1
```

---

## GET `/api/games/:id`

```bash
curl -X GET "http://localhost:3000/api/games/1" \
-H "Authorization: Bearer YOUR_TOKEN"
```

---

## PUT `/api/games/:id`

Example:

```json
{
  "title": "Nouvelle roue",
  "active": true
}
```

---

## DELETE `/api/games/:id`

```bash
curl -X DELETE "http://localhost:3000/api/games/1" \
-H "Authorization: Bearer YOUR_TOKEN"
```

---

# 11. Prizes API

Prize probability rules:

- probability must be between `0` and `100`
- total active prize probability cannot exceed `100`
- public game will only run when active probabilities total exactly `100%`

Example:

- Café offert: 60
- Réduction 10%: 25
- Dessert offert: 10
- Gros lot: 5

Total: `100`

---

## POST `/api/prizes`

### Body

```json
{
  "game_id": 1,
  "name": "Café offert",
  "description": "Un café offert lors de votre prochaine visite",
  "probability": 60,
  "coupon_prefix": "CAFE",
  "active": true
}
```

### cURL

```bash
curl -X POST "http://localhost:3000/api/prizes" \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d "{\"game_id\":1,\"name\":\"Cafe offert\",\"description\":\"Un cafe offert lors de votre prochaine visite\",\"probability\":60,\"coupon_prefix\":\"CAFE\",\"active\":true}"
```

---

## GET `/api/prizes/game/:gameId`

```bash
curl -X GET "http://localhost:3000/api/prizes/game/1" \
-H "Authorization: Bearer YOUR_TOKEN"
```

Response includes:

```json
{
  "success": true,
  "count": 4,
  "total_active_probability": 100,
  "probability_complete": true,
  "data": []
}
```

---

## PUT `/api/prizes/:id`

Partial update.

---

## DELETE `/api/prizes/:id`

```bash
curl -X DELETE "http://localhost:3000/api/prizes/1" \
-H "Authorization: Bearer YOUR_TOKEN"
```

---

# 12. Public Customer API

These routes do not require JWT.

## GET `/api/public/store/:slug`

Frontend uses this when the customer opens/scans the QR URL.

Example:

```http
GET /api/public/store/coffee-lac-1
```

### cURL

```bash
curl -X GET "http://localhost:3000/api/public/store/coffee-lac-1"
```

### Example response

```json
{
  "success": true,
  "data": {
    "store": {
      "id": 1,
      "name": "Coffee Lac 1",
      "slug": "coffee-lac-1",
      "address": "Les Berges du Lac 1, Tunis",
      "phone": "+21620000000",
      "logo_url": "https://example.com/logo.png",
      "primary_color": "#C58A45"
    },
    "game": {
      "id": 1,
      "name": "Summer Wheel",
      "type": "wheel",
      "title": "Tournez et gagnez !",
      "description": "Gagnez un cadeau",
      "prizes": [
        {
          "id": 1,
          "name": "Cafe offert",
          "description": "..."
        }
      ]
    }
  }
}
```

Prize probabilities are intentionally not returned publicly.

---

# 13. Play Game API

## POST `/api/public/store/:slug/play`

This is the central customer endpoint.

### Body

At least:

- `first_name`
- either `email` or `phone`

Example:

```json
{
  "first_name": "Mohamed",
  "email": "mohamed@test.com",
  "phone": "+21620123456",
  "marketing_optin": true
}
```

### cURL

```bash
curl -X POST "http://localhost:3000/api/public/store/coffee-lac-1/play" \
-H "Content-Type: application/json" \
-d "{\"first_name\":\"Mohamed\",\"email\":\"mohamed@test.com\",\"phone\":\"+21620123456\",\"marketing_optin\":true}"
```

### Successful response

```json
{
  "success": true,
  "message": "Congratulations!",
  "data": {
    "participation_id": 1,
    "customer": {
      "id": 1,
      "first_name": "Mohamed"
    },
    "store": {
      "id": 1,
      "name": "Coffee Lac 1"
    },
    "game": {
      "id": 1,
      "name": "Summer Wheel",
      "type": "wheel"
    },
    "prize": {
      "id": 1,
      "name": "Cafe offert",
      "description": "..."
    },
    "coupon": {
      "id": 1,
      "code": "CAFE-A18F72BC",
      "status": "active",
      "expires_at": "2026-09-22T..."
    },
    "google_review_url": "https://g.page/r/TEST/review"
  }
}
```

### Frontend rule

The frontend MUST NOT select the winner.

Correct flow:

1. user taps Spin
2. frontend calls `/play`
3. backend returns `prize.id`
4. frontend animates wheel
5. wheel visually stops on the prize returned by backend

---

# 14. Participation Limit

A customer can participate only once per store every 30 days.

Identification uses stored customer email and/or phone.

When blocked:

```json
{
  "success": false,
  "message": "You have already participated this month",
  "next_play_available_in": "30 days",
  "next_play_at": "2026-09-22T..."
}
```

HTTP status:

```text
429
```

---

# 15. Coupon Rules

Coupons are generated by the backend.

Format example:

```text
CAFE-A18F72BC
REDUC10-1234ABCD
VIP-A1B2C3D4
```

Coupon states:

- `active`
- `used`
- `expired`

Generated coupons expire 30 days after the participation.

---

# 16. Google Review Click Tracking

## POST `/api/public/store/:slug/review-click`

Frontend calls this when the customer taps the Google review CTA.

### Body

```json
{
  "participation_id": 1
}
```

### cURL

```bash
curl -X POST "http://localhost:3000/api/public/store/coffee-lac-1/review-click" \
-H "Content-Type: application/json" \
-d "{\"participation_id\":1}"
```

### Response

```json
{
  "success": true,
  "message": "Review click tracked successfully",
  "data": {
    "review_click_id": 1,
    "google_review_url": "https://g.page/r/TEST/review"
  }
}
```

### Frontend flow

1. customer presses Google review button
2. frontend calls `/review-click`
3. backend returns `google_review_url`
4. frontend opens that URL

This metric tracks a Google review CTA click. It does not prove that a review was actually submitted.

---

# 17. Coupon API

Requires JWT.

## GET `/api/coupons/:code`

Used by owner/manager/cashier to inspect a coupon.

### cURL

```bash
curl -X GET "http://localhost:3000/api/coupons/CAFE-A18F72BC" \
-H "Authorization: Bearer YOUR_TOKEN"
```

Response includes:

- coupon status
- expiration
- store
- prize
- customer information
- validity

Example:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "CAFE-A18F72BC",
    "status": "active",
    "store_id": 1,
    "prize_name": "Cafe offert",
    "store_name": "Coffee Lac 1",
    "customer_name": "Mohamed",
    "validity": "valid"
  }
}
```

---

## POST `/api/coupons/validate`

Allowed roles:

- owner
- manager
- cashier

### Body

```json
{
  "code": "CAFE-A18F72BC",
  "store_id": 1
}
```

### cURL

```bash
curl -X POST "http://localhost:3000/api/coupons/validate" \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d "{\"code\":\"CAFE-A18F72BC\",\"store_id\":1}"
```

### Success

```json
{
  "success": true,
  "message": "Coupon validated successfully",
  "data": {
    "coupon_id": 1,
    "code": "CAFE-A18F72BC",
    "prize": {
      "id": 1,
      "name": "Cafe offert",
      "description": "..."
    },
    "store": {
      "id": 1,
      "name": "Coffee Lac 1"
    },
    "status": "used",
    "used_at": "..."
  }
}
```

### Already used

HTTP `409`

```json
{
  "success": false,
  "message": "Coupon has already been used",
  "used_at": "..."
}
```

### Expired

HTTP `410`

```json
{
  "success": false,
  "message": "Coupon has expired"
}
```

### Wrong store

HTTP `403`

```json
{
  "success": false,
  "message": "Coupon does not belong to this store"
}
```

Coupon validation uses a DB transaction and row lock (`FOR UPDATE`) to prevent two simultaneous validations from both succeeding.

---

# 18. Dashboard API

Requires JWT.

Allowed:

- owner
- manager

## GET `/api/dashboard/stats`

### cURL

```bash
curl -X GET "http://localhost:3000/api/dashboard/stats" \
-H "Authorization: Bearer YOUR_TOKEN"
```

### Store filter

```http
GET /api/dashboard/stats?store_id=1
```

```bash
curl -X GET "http://localhost:3000/api/dashboard/stats?store_id=1" \
-H "Authorization: Bearer YOUR_TOKEN"
```

The backend verifies that the requested store belongs to the current tenant.

### Response structure

```json
{
  "success": true,
  "data": {
    "filters": {
      "store_id": null
    },
    "overview": {
      "total_stores": 2,
      "total_games": 1,
      "total_customers": 5,
      "total_participations": 5,
      "today_participations": 2
    },
    "coupons": {
      "total": 5,
      "active": 4,
      "used": 1,
      "expired": 0,
      "redemption_rate": 20
    },
    "google_reviews": {
      "clicks": 4,
      "click_rate": 80
    },
    "top_prizes": [
      {
        "id": 1,
        "name": "Cafe offert",
        "wins": 3
      }
    ],
    "stores": [
      {
        "id": 1,
        "name": "Coffee Lac 1",
        "participations": 5
      }
    ],
    "last_7_days": [
      {
        "date": "2026-08-23",
        "participations": 2
      }
    ]
  }
}
```

> The `google_reviews` block assumes the review-click metrics were added to the dashboard controller as implemented during backend development.

---

# 19. Users / Staff API

Only `owner` can manage staff using these routes.

The owner can create:

- `manager`
- `cashier`

Owner cannot create a `super_admin`.

---

## GET `/api/users`

```bash
curl -X GET "http://localhost:3000/api/users" \
-H "Authorization: Bearer YOUR_OWNER_TOKEN"
```

---

## POST `/api/users`

### Body

```json
{
  "name": "Manager Lac",
  "email": "manager@coffee.com",
  "password": "Manager123!",
  "role": "manager"
}
```

### cURL

```bash
curl -X POST "http://localhost:3000/api/users" \
-H "Authorization: Bearer YOUR_OWNER_TOKEN" \
-H "Content-Type: application/json" \
-d "{\"name\":\"Manager Lac\",\"email\":\"manager@coffee.com\",\"password\":\"Manager123!\",\"role\":\"manager\"}"
```

Cashier example:

```json
{
  "name": "Cashier Lac",
  "email": "cashier@coffee.com",
  "password": "Cashier123!",
  "role": "cashier"
}
```

Passwords are hashed by the backend with bcrypt.

Minimum password length currently enforced: 8 characters.

---

## GET `/api/users/:id`

```bash
curl -X GET "http://localhost:3000/api/users/2" \
-H "Authorization: Bearer YOUR_OWNER_TOKEN"
```

---

## PUT `/api/users/:id`

Partial update.

Examples:

Change role:

```json
{
  "role": "cashier"
}
```

Deactivate:

```json
{
  "status": "inactive"
}
```

Change password:

```json
{
  "password": "NewPassword123!"
}
```

### cURL

```bash
curl -X PUT "http://localhost:3000/api/users/2" \
-H "Authorization: Bearer YOUR_OWNER_TOKEN" \
-H "Content-Type: application/json" \
-d "{\"status\":\"inactive\"}"
```

---

## DELETE `/api/users/:id`

This is a soft delete.

The backend sets:

```text
status = inactive
```

It does not physically delete the user.

```bash
curl -X DELETE "http://localhost:3000/api/users/2" \
-H "Authorization: Bearer YOUR_OWNER_TOKEN"
```

The owner cannot deactivate their own account using this route.

---

# 20. Login Behavior for Inactive Users

An inactive user cannot log in.

Response:

```json
{
  "success": false,
  "message": "User account is inactive"
}
```

---

# 21. Multi-Tenant Security

The database contains multiple tenants.

Example:

```text
Tenant 1
  Coffee Brand A
    Store 1
    Store 2

Tenant 2
  Coffee Brand B
    Store 1
```

Protected backend queries use the tenant from the JWT:

```text
req.user.tenantId
```

The frontend must never be allowed to choose the tenant.

For example, store lookup is effectively:

```sql
SELECT *
FROM stores
WHERE id = ?
AND tenant_id = ?;
```

If Tenant 2 requests a Tenant 1 resource, the backend returns `404`.

---

# 22. Database Tables Used

Current MVP uses:

```text
tenants
users
stores
games
prizes
customers
participations
coupons
review_clicks
```

Important relationships:

```text
tenant
  |
  +-- users
  |
  +-- stores
       |
       +-- games
       |    |
       |    +-- prizes
       |
       +-- customers
       |
       +-- participations
             |
             +-- coupon
             |
             +-- review_click
```

---

# 23. Main Frontend Customer Journey

Recommended frontend implementation:

```text
QR / Public URL
    |
    v
GET /api/public/store/:slug
    |
    v
Render store branding
logo
primary color
game title
prize labels
    |
    v
Customer lead form
first_name
email or phone
marketing_optin
    |
    v
POST /api/public/store/:slug/play
    |
    v
Receive winner + coupon
    |
    v
Animate wheel to backend-selected prize
    |
    v
Display coupon
    |
    +----------> Google review button
                    |
                    v
POST /review-click
                    |
                    v
Open google_review_url
```

---

# 24. Merchant Frontend Journey

```text
Login
 |
 v
POST /api/auth/login
 |
 v
Store JWT securely
 |
 v
GET /api/auth/me
 |
 +-- Dashboard
 |    GET /api/dashboard/stats
 |
 +-- Stores
 |    /api/stores
 |
 +-- Games
 |    /api/games
 |
 +-- Prizes
 |    /api/prizes
 |
 +-- Staff
 |    /api/users
 |
 +-- Coupon Scanner
      GET /api/coupons/:code
      POST /api/coupons/validate
```

---

# 25. Cashier Frontend Journey

```text
Cashier login
    |
    v
JWT role = cashier
    |
    v
Scan / enter coupon
    |
    v
GET /api/coupons/:code
    |
    v
Display:
prize
customer
store
validity
    |
    v
Confirm redemption
    |
    v
POST /api/coupons/validate
```

---

# 26. Game Frontend Important Details

For a wheel UI:

The public configuration returns prize IDs and labels.

When `/play` returns:

```json
{
  "prize": {
    "id": 3,
    "name": "Dessert offert"
  }
}
```

the frontend should locate prize ID `3` on the wheel and calculate the animation ending angle.

Never use JavaScript random selection to determine the actual winner.

---

# 27. Google Review Compliance / Product Behavior

The reward is generated before and independently of the Google review action.

The customer receives their prize/coupon regardless of whether they leave a Google review.

The Google review button should be shown after the reward result.

Do not make prize redemption conditional on posting a review.

---

# 28. Rate Limiting

The public `/play` endpoint is rate-limited.

Current MVP example:

```text
15 requests / minute
```

Frontend should gracefully display:

```json
{
  "success": false,
  "message": "Too many requests. Please try again later."
}
```

when HTTP `429` is returned.

---

# 29. Frontend Error Handling

Frontend should use HTTP status + `message`.

Examples:

### Missing field

```json
{
  "success": false,
  "message": "Email or phone is required"
}
```

### No game

```json
{
  "success": false,
  "message": "No active game available"
}
```

### Invalid prize configuration

```json
{
  "success": false,
  "message": "Game probabilities must total 100%",
  "total_probability": 90
}
```

### Already played

```json
{
  "success": false,
  "message": "You have already participated this month",
  "next_play_available_in": "30 days",
  "next_play_at": "..."
}
```

---

# 30. Recommended Token Handling

For web frontend:

- keep token out of URLs
- always send it using `Authorization: Bearer ...`
- clear token on logout
- if API returns `401`, redirect to login
- frontend should never expose JWT secret or DB credentials

---

# 31. Current MVP Completion Status

Implemented and tested:

- MySQL connection
- Express API
- JWT authentication
- `/auth/me`
- multi-tenant isolation
- stores CRUD
- games CRUD
- prizes CRUD
- prize probability protection
- backend weighted winner selection
- public store loading
- lead/customer creation
- 30-day participation restriction
- participation creation
- unique coupon generation
- 30-day coupon expiration
- coupon lookup
- coupon redemption/validation
- prevention of double coupon use
- Google review click tracking
- dashboard analytics
- staff creation/update/deactivation
- owner / manager / cashier role middleware
- public play rate limiting

---

# 32. Known MVP Limitations / Not Yet Implemented

The frontend developer should know that the following were discussed but are not part of the completed MVP backend yet:

### Store assignment for staff

Currently:

```text
user -> tenant
```

Not yet:

```text
user -> specific store(s)
```

Therefore a manager/cashier is currently tenant-scoped, not store-scoped.

Recommended future table:

```text
user_stores
- id
- tenant_id
- user_id
- store_id
- created_at
```

### Full Super Admin CRUD

A complete `/api/admin/tenants` super-admin management module was planned but not implemented during this MVP build.

### Customer list API

No dedicated:

```text
GET /api/customers
GET /api/customers/:id
```

was completed yet.

### Participation history API

No dedicated:

```text
GET /api/participations
```

was completed yet.

### Full coupon-list API

Current coupon API supports lookup by code and validation; a paginated general coupon-history endpoint was not completed.

### Google Business Profile API

Not implemented in MVP.

### Confirmed review submission

The backend tracks review CTA clicks only.

It does not confirm that the user actually submitted a Google review.

### Stripe

Not implemented.

### SMS / Email services

Not implemented.

### AI-generated Google review replies

Not implemented.

### QR/PDF print generator

Not implemented.

### Redis

Not used in MVP.

---

# 33. Suggested Frontend Pages

Recommended frontend structure:

## Public

- `/:storeSlug`
  - public landing/game
- result screen
- coupon screen
- Google review CTA

## Authentication

- login

## Merchant Owner

- dashboard
- stores
- store editor
- games
- prize configuration
- staff/users
- coupon lookup

## Manager

- dashboard
- coupon lookup/validation

## Cashier

- coupon scanner / coupon input
- coupon details
- validate button

---

# 34. Suggested Frontend API Service Structure

Example:

```text
src/
  api/
    apiClient.js
    auth.api.js
    stores.api.js
    games.api.js
    prizes.api.js
    public.api.js
    coupons.api.js
    dashboard.api.js
    users.api.js
```

Use one common API client that adds:

```http
Authorization: Bearer TOKEN
```

to protected requests.

---

# 35. Suggested Frontend Environment Variable

Example:

```env
VITE_API_URL=http://localhost:3000
```

or for Next.js:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Production frontend should replace this with the deployed backend URL.

---

# 36. Quick Endpoint Index

## Public

```text
GET    /api/health

GET    /api/public/store/:slug
POST   /api/public/store/:slug/play
POST   /api/public/store/:slug/review-click
```

## Authentication

```text
POST   /api/auth/login
GET    /api/auth/me
```

## Stores

```text
POST   /api/stores
GET    /api/stores
GET    /api/stores/:id
PUT    /api/stores/:id
DELETE /api/stores/:id
```

## Games

```text
POST   /api/games
GET    /api/games
GET    /api/games/:id
PUT    /api/games/:id
DELETE /api/games/:id
```

## Prizes

```text
POST   /api/prizes
GET    /api/prizes/game/:gameId
PUT    /api/prizes/:id
DELETE /api/prizes/:id
```

## Coupons

```text
GET    /api/coupons/:code
POST   /api/coupons/validate
```

## Dashboard

```text
GET    /api/dashboard/stats
GET    /api/dashboard/stats?store_id=:id
```

## Users

```text
GET    /api/users
POST   /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
```

---

# 37. Frontend Integration Priority

Recommended order:

1. API client + auth token
2. login
3. merchant dashboard
4. stores
5. games
6. prizes
7. public QR landing
8. lead form
9. game animation connected to `/play`
10. coupon result
11. review-click CTA
12. cashier coupon scanner
13. staff management

---

# 38. Final Notes

The backend is designed around one database serving multiple businesses.

Every protected resource is tenant-isolated through the JWT.

The public game winner is selected server-side.

The reward is independent of leaving a Google review.

The frontend should treat backend responses as the source of truth for:

- winner
- coupon
- coupon status
- next allowed participation date
- user role
- tenant-owned data
- dashboard statistics

