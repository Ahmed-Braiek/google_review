# L'Atelier Doré Lottery — Standalone Next.js frontend

This project is a standalone Next.js App Router implementation of the 13-screen QR review reward experience. It runs entirely in the browser with local campaign data and browser storage; no backend or database is required.

## Frontend behavior

- The lottery reveal lasts **2 real seconds** before the result screen opens.
- The browser selects a configured local prize and creates a local coupon.
- Forward/back screen changes use premium View Transitions plus a CSS fallback.
- All 13 screens include a contextual tutorial, with a permanent `?` button to replay it.
- Store branding, game data and prize labels come from `lib/defaultCampaign.ts`.
- Customer details, participation, prize, coupon, delivery choice and redemption state stay in browser storage.
- Google CTA clicks open the configured review URL directly.

## Run

Optional `.env.local`:

```env
NEXT_PUBLIC_DEFAULT_STORE_SLUG=atelier-dore
```

`NEXT_PUBLIC_DEFAULT_STORE_SLUG` controls the default local campaign URL. It does not connect to a server.

Then:

```bash
npm install
npm run dev
```

Frontend:

```text
http://localhost:3010
```

Direct store URL:

```text
http://localhost:3010/c/atelier-dore
```
