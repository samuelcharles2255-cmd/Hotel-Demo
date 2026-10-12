# AETHER — Frontend

Luxury contemporary art hotel UI built with **Next.js 16 (App Router) + Tailwind v4 + TypeScript**.

Design language: quiet luxury × liquid glass × fluid motion (Emil Kowalski-grade craft).

## Run it

Two processes run side by side in development:

- **Frontend** `cd frontend && npm run start -- --port 3010`  — served on **http://localhost:3010**
- **API**   `cd HotelSys && python manage.py runserver 127.0.0.1:8000` — served on **http://127.0.0.1:8000**

The frontend proxies `/api/*` to the local Django process via `next.config.ts` rewrites, so authentication
runs same-origin (the HttpOnly refresh cookie flows without any CORS configuration).

```bash
cd frontend
npm install && npm run build          # build check
npm run start -- --port 3010 &         # frontend (port 3010)
curl -s http://localhost:3010/          # 200 = ready

cd HotelSys
python manage.py runserver 127.0.0.1:8000 &   # Django (port 8000)
curl -s http://127.0.0.1:8000/api/me/       # 401 = ready (needs auth)
```

> The hotel demo project already occupies port 3000; the frontend uses **3010** instead.

```bash
npm run dev          # http://localhost:3000 (dev watcher)
npm run build        # production build check
```

## Pages

| Route | Page |
| --- | --- |
| `/` | Homepage — cinematic hero, three glass collection cards, Experience / Art / Dining, sticky booking bar |
| `/rooms/north-light-suite` | Room detail — full-screen suite hero, floating gallery, sticky booking panel with frosted calendar |
| `/booking` | Booking — split layout, 4-step glass flow with animated progress, date picker, room cards, sticky summary |
| `​/confirmation` | Confirmation — centered charcoal composition, floating room card, summary, itinerary + add-to-calendar |

## Design system

Tokens live in `app/globals.css` under `@theme`:

- `--color-charcoal: #121212` — base surface
- `--color-ivory: #f8f5f0` — type + light surfaces
- `--color-copper: #c07a3a` — key accents only (never decorative)
- `--font-display` → Cormorant Garamond (high-contrast serif, headlines + logo)
- `--font-sans` → Jost (geometric sans, all UI text)

Material classes (all in `globals.css`):

| Class | What it is |
| --- | --- |
| `.glass` | Frosted panel + refractive chromatic edge (`.glass::before`) + liquid caustics (`.glass::after`) |
| `.glass-deep` | Darker, denser glass for bars and booking panels |
| `.glass-light` | Ivory glass for light sections |
| `.float` / `.float-slow` | Gentle floating motion |
| `.trail` | Soft motion-blur drop shadow |
| `.btn-copper` / `.btn-glass` / `.btn-ghost` | Button variants with press feedback |
| `.btn-sheen` | Trailing highlight sweep on hover |
| `.reveal` | Scroll entrance with blur (see `components/Reveal.tsx`) |
| `.shaft` | Animated light shaft across imagery |
| `.eyebrow` / `.display` / `.num` / `.rule` | Typography primitives |

Motion respects `prefers-reduced-motion`.

## Swapping images

All photography is registered in **`lib/images.ts`** — change the URLs there and every
page updates. Current assets are Unsplash placeholders. The auth pages pull the auth-panel image
from the same registry.

## Environment

The frontend uses `NEXT_PUBLIC_API_URL` to decide where to talk to the API:

- Unset (default) → the Next rewrites proxy `/api/*` to the local Django process (development,
  same-origin auth, no CORS needed).
- Set to an API origin (e.g. `https://api.yourhotel.com`) → the frontend talks to it directly.
  The refresh cookie still flows because it's SameSite=Lax and both hosts share one registrable
  domain. In that setup, add the API origin to the Django `CORS_ALLOWED_ORIGINS` in
  `HotelSys/config/settings.py`.

The Django side is configured in `HotelSys/config/settings.py`. Development conveniences:

- The dev origin `http://localhost:3010` is already in `CORS_ALLOWED_ORIGINS`.
- `SITE_URL` is set to `http://localhost:3010` when `DEBUG` so emailed verification/reset links
  open the frontend directly.
- Emails are written to `HotelSys/sent_emails/` (file-based backend) instead of trying real SMTP —
  useful for confirming the email-link flow ends to end.
