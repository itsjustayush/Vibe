<div align="center">

<br />

# ⬡ ayu.vibee

**Photography Portfolio & AI Curation Platform**

*by Ayush Bhattacharya — Kolkata, India*

<br />

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

<br />

> A museum-grade photography portfolio with a private AI-powered admin console for photo management, blog publishing, and intelligent image curation using Google Gemini.

<br />

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Firebase Setup](#firebase-setup)
- [Admin Console](#admin-console)
- [Image Protection](#image-protection)
- [Deployment](#deployment)

---

## Overview

**ayu.vibee** is a full-stack creative portfolio built for Ayush Bhattacharya — a photographer, coder, and JEE aspirant from Kolkata. The site serves a dual purpose:

- **Public** — An editorial-grade photography portfolio with a gallery, blog ("Stories"), about page, and contact section.
- **Private** — A locked admin console ("Curator Gate") accessible only via Google OAuth to a whitelisted admin email, enabling full content management powered by Gemini AI.

---

## Features

### Public Portfolio
- **Gallery** — Filterable photo grid with category tabs, tag filters, and a full-screen lightbox carousel
- **Stories** — Long-form photography blog with markdown-style post rendering
- **About** — Editorial profile page with academic timeline, interests, and curated portfolio section
- **Contact** — Social links grid and direct email form

### Admin Console (Curator Gate)
- **Photo Upload** — Drag-and-drop bulk upload with client-side image compression
- **AI Captions** — One-click Gemini Pro caption and description generation for any photo
- **Image Editor** — Crop, rotate, and adjust photos before publishing
- **Blog Editor** — Rich text post creation with cover image and Gemini theme analysis
- **Video Analysis** — Gemini multimodal analysis for video content
- **Library** — Grid/list view with drag-to-reorder, bulk select/delete, and per-photo view counters
- **Analytics** — Live visitor insights: portfolio views, story reads, about page hits

### Technical
- **Visitor Counters** — Per-photo view tracking stored in Firestore (anonymous, event-only)
- **Image Protection** — Right-click block, drag prevention, transparent shield overlay, iOS touch-callout block
- **Firestore Security Rules** — Public read for photos/posts, auth-only writes, public analytics increments

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 6 |
| Styling | Tailwind CSS v4 + Playfair Display + Plus Jakarta Sans |
| Animations | Framer Motion (motion/react) |
| Backend | Express.js (Node) — serves Vite in dev, static in prod |
| Database | Firebase Firestore (custom named database) |
| Auth | Firebase Auth — Google OAuth only |
| AI | Google Gemini Pro (via `@google/genai`) |
| Image Utils | Client-side compression (`browser-image-compression`) |
| Icons | Google Material Symbols |

---

## Project Structure

```
ayu.vibee/
├── src/
│   ├── assets/
│   │   └── images/             # Local image assets (logo, portrait)
│   ├── components/
│   │   ├── AdminConsole.tsx    # Full admin dashboard
│   │   ├── AyuVibeeLogo.tsx    # Brand logo component
│   │   ├── Carousel.tsx        # Protected image carousel
│   │   ├── ContactView.tsx     # Contact page
│   │   ├── GateKeeper.tsx      # Google OAuth admin gate
│   │   ├── ImageEditor.tsx     # Crop/rotate image editor
│   │   ├── Navigation.tsx      # Top nav + footer
│   │   ├── ProfileView.tsx     # About page + gallery
│   │   ├── ProtectedImage.tsx  # Right-click/drag protection wrapper
│   │   ├── SpiralLoader.tsx    # Brand loading animation
│   │   ├── StoriesView.tsx     # Blog listing + post reader
│   │   └── TermsView.tsx       # Legal manifesto / T&C
│   ├── utils/
│   │   └── compressor.ts       # Image compression utilities
│   ├── App.tsx                 # Root view router
│   ├── dbHelper.ts             # All Firestore CRUD + analytics
│   ├── firebase.ts             # Firebase app + auth + db init
│   ├── index.css               # Global styles + image protection CSS
│   └── types.ts                # Shared TypeScript interfaces
├── server.ts                   # Express server (serves Vite / static)
├── firestore.rules             # Firestore security rules
├── firebase.json               # Firebase CLI config
└── .firebaserc                 # Firebase project alias
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Firebase project with Firestore and Google Auth enabled
- A Gemini API key from [Google AI Studio](https://aistudio.google.com)

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (see below)
cp .env.example .env.local

# 3. Start the development server
npm run dev
```

The app runs at `http://localhost:5000`.

---

## Environment Variables

Create a `.env.local` file (never commit this):

```env
# Gemini AI — required for caption generation and analysis
GEMINI_API_KEY=your_gemini_api_key_here

# Admin restriction — only this email can pass the Curator Gate
VITE_ADMIN_EMAIL=your.email@gmail.com
```

> **Note:** Firebase config (API keys, project ID, etc.) is currently hardcoded in `src/firebase.ts` since it uses client-safe public credentials. For extra hygiene, these can also be moved to `VITE_` prefixed env vars.

---

## Firebase Setup

### 1. Firestore Database
This project uses a **custom-named Firestore database** (not the default). The database ID is configured in `src/firebase.ts`.

The database uses three collections:

| Collection | Purpose | Rules |
|---|---|---|
| `photos` | Gallery images | Public read, auth-only write |
| `posts` | Blog articles | Public read, auth-only write |
| `insights` | Analytics counters | Public read + write |

### 2. Deploy Security Rules

Publish `firestore.rules` via **Firebase Console**:

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Select your project → **Firestore Database**
3. Select your named database from the dropdown
4. Click **Rules** → paste the contents of `firestore.rules` → **Publish**

Or via CLI (if `firebase-tools` is authenticated):

```bash
firebase deploy --only firestore:rules
```

### 3. Google Auth

In Firebase Console → **Authentication** → **Sign-in method**:
- Enable **Google** provider
- Add your deployment domain to **Authorized domains**

---

## Admin Console

The Curator Gate is accessible via the `⬡ Curator Gate [admins]` link in the site footer.

- Sign in with **Google** only (no password auth)
- Access is restricted to the email set in `VITE_ADMIN_EMAIL`
- If `VITE_ADMIN_EMAIL` is not set, any authenticated Google account is allowed

**Admin capabilities:**

```
Overview      → Live analytics dashboard
Photos        → Upload, edit, reorder, bulk-delete, AI captions
Stories       → Create and publish blog posts with Gemini theme analysis  
Video AI      → Multimodal video analysis via Gemini
Settings      → Account info and logout
```

---

## Image Protection

All public-facing gallery images are protected against casual saving:

- **Right-click blocked** — `contextmenu` event prevented on all images
- **Drag-to-desktop blocked** — `draggable={false}` + `onDragStart` prevented
- **Transparent shield overlay** — invisible `<div>` sits over each carousel image; drag attempts capture an empty element
- **iOS long-press blocked** — `-webkit-touch-callout: none` applied globally
- **Selection blocked** — `user-select: none` + `-webkit-user-drag: none` on all `img` elements

> These barriers stop casual copying. For full IP protection, burn visible watermarks into source files before uploading and register works with your national copyright authority.

---

## Deployment

The app is deployed via **Replit Deployments** (Autoscale). To publish:

1. Ensure all environment variables are set as **Replit Secrets**
2. Click **Deploy** in the Replit workspace
3. The app will be available at your `.replit.app` domain

The Express server in `server.ts` handles both development (Vite proxy) and production (serves the built `dist/` folder) via `NODE_ENV` detection.

---

<div align="center">

<br />

*© 2026 AYU.VIBEE Photography & Editorial. All rights reserved.*

*Unauthorized reproduction, distribution, or AI training use of visual assets is strictly prohibited.*

</div>
