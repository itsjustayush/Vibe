# AYU.VIBEE Production Enhancement Roadmap — Implementation Guide

**Last Updated:** July 5, 2026  
**Status:** Phase 3 of 6 Complete — 50% ✓

---

## Completed Phases ✅

### Phase 1: SEO & Metadata Foundation ✅
- ✅ Created `/src/seo/metadata.ts` — Centralized SEO configuration
- ✅ Created `/src/components/SEOHead.tsx` — Dynamic meta tag injection for SPA
- ✅ Added comprehensive meta tags to `index.html` (OG, Twitter Card, robots, canonical)
- ✅ Created `/public/robots.txt` — Search engine crawler policy
- ✅ Created `/public/sitemap.xml` — XML sitemap for indexing
- ✅ Generated `/public/og-image.png` — Professional 1200x630px Open Graph image
- ✅ Integrated SEOHead into `App.tsx` with schema markup (Website + Photographer)

**Result:** Site now has complete SEO infrastructure, discoverable by search engines, and ready for Google Search Console submission.

---

### Phase 2: Contact Form with Resend ✅
- ✅ Created `/src/utils/contactForm.ts` — Validation, rate limiting, sanitization
- ✅ Added Resend email API endpoint to `server.ts` (/api/contact)
- ✅ Enhanced `ContactView.tsx` with:
  - Real-time form validation with error messages
  - Rate limiting (5 submissions per 24 hours)
  - Success/error/rate-limit notifications
  - Loading states and disabled buttons
  - Character counter for message field
- ✅ Installed `resend` package (npm install resend)
- ✅ Updated `.env.example` with `RESEND_API_KEY` and `CONTACT_EMAIL`
- ✅ Sends dual emails: admin notification + user confirmation

**Result:** Production-grade contact form with email delivery, validation, and anti-spam protection.

---

### Phase 3: Performance Optimization ✅
- ✅ Created `/src/utils/performance.ts` — Web Vitals monitoring, lazy loading, caching
- ✅ Created `/src/hooks/useWindowSize.ts` — Responsive layout helper
- ✅ Created `/src/hooks/useAnalytics.ts` — Event tracking and analytics utilities
- ✅ Optimized font loading in `index.html`:
  - Preconnect to Google Fonts CDN
  - Font-display: swap for faster rendering
  - Material Icons loaded asynchronously
- ✅ Integrated performance monitoring into `App.tsx`:
  - Web Vitals observation (LCP, CLS, INP)
  - Lazy loading setup
  - DNS preconnection to external domains
  - Page view tracking

**Result:** Site now monitors Core Web Vitals, defers non-critical resources, and tracks user analytics.

---

## Remaining Phases (To Do)

### Phase 4: Accessibility Audit & Fixes (IN PROGRESS)

**Key Tasks:**
1. **ARIA Labels & Landmarks**
   - Add `role="main"` to main content areas
   - Add `role="navigation"` to Navigation component
   - Add `aria-label` to icon buttons
   - Add `aria-live="polite"` to form feedback messages

2. **Keyboard Navigation**
   - Ensure all interactive elements are keyboard accessible
   - Add visible focus indicators (use Tailwind focus rings)
   - Test with Tab/Shift+Tab navigation

3. **Form Accessibility (ContactView)**
   - Add `aria-required="true"` to required fields
   - Add `aria-invalid="true"` + `aria-describedby` to error states
   - Ensure label-input associations via `htmlFor`

4. **Image Alt Text**
   - Audit all `<img>` tags in ProfileView, StoriesView, AdminConsole
   - Add descriptive alt text (not "image" or "photo")
   - Use empty alt="" for decorative images

5. **Color Contrast**
   - Verify WCAG AA contrast ratios (4.5:1 for text, 3:1 for large text)
   - Check placeholder text, disabled states, secondary text

6. **Semantic HTML**
   - Replace `<div>` buttons with `<button>` elements
   - Use `<button type="submit">` for form submissions
   - Use `<a>` for navigation links
   - Add `<main>` wrapper around main content

**Files to Modify:**
- `src/components/ContactView.tsx` — Form accessibility
- `src/components/Navigation.tsx` — Semantic nav + ARIA landmarks
- `src/components/ProfileView.tsx` — Image alt text + keyboard nav
- `src/components/StoriesView.tsx` — Image alt text + focus management

---

### Phase 5: PWA Implementation

**Key Tasks:**
1. **Create Web App Manifest**
   - File: `/public/manifest.json`
   - Name, short_name, description, icons (192x192, 512x512)
   - Display: standalone
   - Orientation: portrait-primary
   - Theme colors matching site

2. **Service Worker**
   - File: `/public/sw.js`
   - Network-first strategy for HTML pages
   - Cache-first strategy for assets (JS, CSS, fonts)
   - Offline fallback page
   - Cache versioning and cleanup

3. **Register Service Worker**
   - Add registration code to `src/main.tsx`
   - Use `register` pattern with lifecycle management

4. **Add to Home Screen**
   - `<link rel="manifest" href="/manifest.json">`
   - `<meta name="apple-mobile-web-app-capable" content="yes">`
   - `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
   - Apple touch icon

**Target:** App installable on mobile/desktop, works offline for cached content.

---

### Phase 6: Error Monitoring with Sentry

**Key Tasks:**
1. **Sentry Integration**
   - Install `@sentry/react`
   - Initialize in `src/main.tsx` with `dsn`, `environment`, `tracesSampleRate`
   - Wrap App with `<Sentry.ErrorBoundary>`

2. **Error Boundary Component**
   - File: `src/components/ErrorBoundary.tsx`
   - Catch React render errors
   - Display user-friendly error message
   - Log to Sentry with user context

3. **Unhandled Promise Rejection Tracking**
   - Add `window.addEventListener('unhandledrejection')`
   - Capture Promise errors to Sentry

4. **Source Maps**
   - Generate source maps in production build
   - Upload to Sentry for readable error traces

5. **Release Tracking**
   - Set `release` version in Sentry init
   - Create releases in Sentry dashboard
   - Track errors by version

**Target:** All errors captured, logged, and visible in Sentry dashboard with source maps.

---

### Phase 7: Guestbook Feature

**Key Tasks:**
1. **Firestore Schema**
   - Collection: `guestbook`
   - Fields: `id`, `name`, `email`, `message`, `createdAt`, `approved`, `flagged`
   - RLS: Admin-only approval, user-specific deletion

2. **GuestbookView Component**
   - Display approved guestbook entries in paginated list
   - Show 10 entries per page
   - Sort by newest first
   - Real-time updates via Firestore listener

3. **Guestbook Form**
   - Embedded in about/contact page
   - Fields: name, email, message
   - Validation (same as contact form)
   - Profanity filter via external API or regex
   - Rate limiting (2 per IP per week)
   - Auto-moderate: flag for admin review

4. **Admin Approval UI**
   - Add section to AdminConsole
   - List pending guestbook entries
   - Approve/reject/delete actions
   - Mark as spam

**Target:** User-submitted guestbook with moderation, displayed with recent entries first.

---

### Phase 8: Photography Metadata System (Optional Enhancement)

**Key Tasks:**
1. **Extended Photo Type**
   - Add fields: `camera`, `lens`, `iso`, `aperture`, `shutterSpeed`, `location`, `tags`, `collectionId`
   - Update Firebase Firestore schema

2. **Metadata Display**
   - Show EXIF data in photo details modal
   - Display location on map (if available)
   - Show tags/categories

3. **Collections Organization**
   - Create collections in UI (e.g., "Monsoon Series", "Architecture 2025")
   - Filter/group photos by collection
   - Display collection info and description

**Target:** Rich photo metadata for gallery organization and viewer education.

---

## Deployment Checklist

### Pre-Deployment
- [ ] Set `RESEND_API_KEY` in Vercel/Netlify environment
- [ ] Set `CONTACT_EMAIL` environment variable
- [ ] (Optional) Set `SENTRY_AUTH_TOKEN` if using Sentry
- [ ] Test contact form with valid email
- [ ] Run Lighthouse audit (target >90 on all metrics)
- [ ] Test keyboard navigation (Tab through all pages)
- [ ] Test on mobile (iOS Safari, Chrome Android)
- [ ] Verify service worker caching (DevTools Application tab)

### Post-Deployment
- [ ] Submit sitemap to Google Search Console
- [ ] Monitor Sentry for errors
- [ ] Check Core Web Vitals in Google Analytics
- [ ] Test "Add to Home Screen" on mobile
- [ ] Verify robots.txt is accessible
- [ ] Confirm OG image shows in social shares

---

## Quick Start: Complete Phase 4 (Accessibility)

1. **Update Navigation.tsx** — Add ARIA landmarks and keyboard nav
2. **Update ContactView.tsx** — Add form ARIA attributes
3. **Update ProfileView.tsx** — Add image alt text
4. **Update StoriesView.tsx** — Add image alt text
5. **Test with Lighthouse Accessibility Audit** — Target 95+
6. **Test with Screen Reader** — NVDA (Windows) or VoiceOver (Mac/iOS)

---

## Environment Variables Required

### Required (for full functionality)
```
RESEND_API_KEY=re_your_api_key_here       # Email service
CONTACT_EMAIL=info.cometlabs@gmail.com    # Where forms are sent
```

### Optional (for enhanced features)
```
SENTRY_DSN=https://...@sentry.io/...      # Error monitoring
SENTRY_AUTH_TOKEN=sntrys_...              # Sentry deployment
```

---

## Performance Targets

- **Lighthouse Performance:** >95
- **Lighthouse Accessibility:** >95
- **Lighthouse Best Practices:** >95
- **Lighthouse SEO:** >95
- **LCP (Largest Contentful Paint):** <2.5s
- **FID/INP (Interaction to Next Paint):** <100ms
- **CLS (Cumulative Layout Shift):** <0.1

---

## Browser Support

- **Desktop:** Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile:** iOS 12+, Android 8+
- **Minimum:** ES2020 JavaScript support

---

## Notes

- All changes preserve the current ImgBB workflow (no modifications to image storage)
- No visual redesign — enhancements are behind-the-scenes
- Admin console workflow unchanged
- Firebase Firestore custom database ID maintained
- Netlify deployment compatible

---

## Questions & Support

For issues with:
- **Resend Integration:** https://resend.com/docs
- **Sentry Setup:** https://docs.sentry.io/platforms/javascript/guides/react/
- **PWA:** https://web.dev/progressive-web-apps/
- **Accessibility:** https://www.w3.org/WAI/ARIA/apg/

Last updated: Phase 3 complete, 50% roadmap implemented.
