# Rayray — Handyman Services App

A mobile app (Expo / React Native + TypeScript) for a handyman services business.
Customers can browse services, book jobs, request quotes, and pay invoices.

## What's in the app

- **Services tab** — service catalog with estimated prices and typical durations.
- **Book tab** — 3-step booking flow: pick a service → pick a day (next 7 days) and
  time slot → enter name/phone/address → confirmation.
- **Quotes tab** — quote request form: service category, job description, optional
  photo note, contact details → confirmation.
- **Invoices tab** — invoice list (mock data) with statuses (paid/unpaid/overdue);
  tap an invoice for details and a **Pay now** button wired to Stripe's PaymentSheet.

## Run it

Requirements: Node.js 18+, the **Expo Go** app on your phone.

```bash
cd rayray-app
npm install
npx expo start
```

Then scan the QR code with Expo Go (Android) or your camera (iOS).

Other commands:

```bash
npm run typecheck   # tsc --noEmit
npx expo start --android
npx expo start --ios
```

## Edit the services

Open `src/data/services.ts` and edit the `SERVICES` array — add, remove, or change
entries. Every screen (Services list, booking picker, quote category picker) reads
from this one file, so no other changes are needed.

## What's mocked vs real

| Feature | Status |
|---|---|
| Services catalog | Real, editable in `src/data/services.ts` |
| Bookings / quote requests | Mock — stored in memory (`src/data/store.ts`), lost on restart |
| Invoices | Mock data (`src/data/mockInvoices.ts`) |
| Payments | Scaffold only — needs real Stripe keys + a backend (see below) |

To persist bookings/quotes across restarts, swap the in-memory arrays in
`src/data/store.ts` for AsyncStorage behind the same function signatures. To go
live, replace the store function bodies with `fetch()` calls to your backend API —
the interfaces are designed to survive that swap.

## Wire up real Stripe payments

1. In the Stripe dashboard, copy your **publishable** key (`pk_test_...` for testing,
   `pk_live_...` for production).
2. In `app.json`, set `expo.extra.stripePublishableKey` to that key
   (currently `"pk_test_REPLACE_ME"`). Never put a secret key (`sk_...`) in the app.
3. Build a tiny backend endpoint that creates a Stripe **PaymentIntent** with your
   secret key and returns `{ clientSecret }`, e.g.
   `POST https://your-server.com/api/payment-intent` with `{ invoiceId, amountCents }`.
4. In `src/screens/InvoiceDetailScreen.tsx`, set `BACKEND_PAYMENT_INTENT_URL` to that
   endpoint.
5. (Optional) For Apple Pay, add your merchant ID in `app.json` under the Stripe
   plugin config and in `App.tsx`.

Until the placeholder key is replaced, tapping **Pay now** shows an explanatory
message instead of attempting a charge.

Note: the Stripe React Native SDK needs a native build (development build via
`npx expo run:android/ios` or EAS Build) — it does not work inside Expo Go.
