# ayu.vibee — Project Reference

## Overview

Photography portfolio and AI curation platform for Ayush Bhattacharya (Kolkata, India). React 19 + Vite 6 frontend, Express backend, Firebase Firestore (custom named DB), Google Gemini AI for captions and analysis. Admin console behind Google-only OAuth gate.

**Live app:** Runs on port 5000 via `npm run dev` (workflow: "Start application")

---

## Stack

- **Frontend:** React 19 + Vite 6 + Tailwind CSS v4
- **Fonts:** Playfair Display (serif), Plus Jakarta Sans (sans)
- **Animations:** Framer Motion (`motion/react`)
- **Backend:** Express.js (`server.ts`) — proxies Vite in dev, serves `dist/` in prod
- **Database:** Firebase Firestore — project `comet-db-c8090`, custom DB ID `ai-studio-97045bd3-44f2-46c3-9e0e-bf492f13c2c1`
- **Auth:** Firebase Auth, Google provider only
- **AI:** Google Gemini via `@google/genai` (server-side, key in `GEMINI_API_KEY`)
- **Image compression:** `browser-image-compression` via `src/utils/compressor.ts`

---

## Key Files

| File | Purpose |
|---|---|
| `src/App.tsx` | Root view router (portfolio / stories / about / contact / admin) |
| `src/firebase.ts` | Firebase app init — hardcoded config + custom DB ID |
| `src/dbHelper.ts` | All Firestore CRUD, analytics tracking, photo view counters |
| `src/types.ts` | Shared interfaces: `Photo`, `Post`, `AdminStats` |
| `src/components/GateKeeper.tsx` | Google OAuth gate — checks `VITE_ADMIN_EMAIL` env var |
| `src/components/AdminConsole.tsx` | Full admin dashboard (photos, blog, AI, analytics) |
| `src/components/ProfileView.tsx` | About page + public gallery + lightbox |
| `src/components/Carousel.tsx` | Protected image carousel (right-click/drag blocked) |
| `src/components/ProtectedImage.tsx` | Reusable image wrapper with shield overlay |
| `src/components/Navigation.tsx` | Top nav + mobile drawer + footer with Curator Gate link |
| `src/components/ContactView.tsx` | Contact page — socials + mailto form |
| `src/components/StoriesView.tsx` | Blog listing + post reader |
| `src/components/TermsView.tsx` | Legal manifesto / T&C page |
| `src/index.css` | Global styles, image protection CSS, scrollbar, fonts |
| `server.ts` | Express server — Vite dev proxy + static prod serving |
| `firestore.rules` | Firestore security rules (deploy via Firebase Console) |

---

## Firestore Collections

| Collection | Public Read | Write |
|---|---|---|
| `photos` | ✅ Yes | Auth only |
| `posts` | ✅ Yes | Auth only |
| `insights` | ✅ Yes | Public (analytics) |

**Important:** Rules must be manually deployed to Firebase Console → the named database, not the default one. The CLI `firebase deploy` also works once authenticated.

**Photo view counts** are stored at `insights/photo_counts` as `{ [photoId]: number }` — incremented on lightbox open.

**Aggregate analytics** are at `insights/aggregate` — keys: `retinalEncounters`, `portfolioViews`, `storyViews`, `aboutViews`, `adminViews`.

---

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | Replit Secret / `.env.local` | Gemini AI for captions + analysis |
| `VITE_ADMIN_EMAIL` | Replit Secret | Restricts Curator Gate to one Google account |

If `VITE_ADMIN_EMAIL` is not set, any Google-authenticated user can access admin.

---

## Component Conventions

- **CSS:** Tailwind utility classes only — no separate `.module.css` files. Custom utilities (`.label-sm`, `.field`) defined in `src/index.css`.
- **Images:** All public-facing images should use `ProtectedImage` or have `onContextMenu`, `onDragStart`, `draggable={false}` attributes. Carousel.tsx already includes a transparent shield overlay.
- **Firebase writes:** Never write without auth check on sensitive collections. Use `request.auth != null` pattern.
- **AI calls:** Always go through the Express server at `/api/generate` — never expose `GEMINI_API_KEY` to the client.
- **No auto-seeding:** `getPhotosFromDB` and `getPostsFromDB` return static defaults when DB is empty — they do NOT write to Firestore automatically. Only the admin uploads real content.
- **ImageEditor:** The prop is `imageUrl` (not `src`).
- **Compression util:** `compressImage(file)` and `formatBytes(bytes)` from `src/utils/compressor.ts`.

---

## Admin Access

Footer link: **⬡ Curator Gate [admins]** — opens `GateKeeper.tsx`

- Sign in with Google only
- Must match `VITE_ADMIN_EMAIL` (if set)
- Session persists via Firebase Auth state

---

## User Preferences

- Minimal comments in code — clean and self-explanatory
- Tailwind-only styling (no CSS modules, no inline `style={{}}` unless necessary)
- Museum/editorial aesthetic — serif headings, monospace labels, cream/off-white backgrounds
- No emojis in UI unless already present in the design
- Keep auto-seeding writes out of public-facing DB functions
- Image protection on all gallery/portfolio images
