# Next Steps — AYU.VIBEE Production Enhancement

**Status:** 65% Complete (5 of 8 major phases)

---

## Immediate Actions (This Week)

### 1. Environment Setup
- [ ] Get Resend API key: https://resend.com → Sign up → Get API key
- [ ] Add to `.env.local`:
  ```
  RESEND_API_KEY=re_your_key
  CONTACT_EMAIL=info.cometlabs@gmail.com
  ```
- [ ] Test contact form locally: `npm run dev` → Fill contact form → Should get email

### 2. Verify SEO Setup
- [ ] Open `public/robots.txt` in browser — should be accessible
- [ ] Open `public/sitemap.xml` in browser — should show XML
- [ ] Check `index.html` meta tags — search for "og:" in source
- [ ] Verify favicon loads on home page

### 3. Test PWA Locally
- [ ] Open DevTools: `Ctrl+Shift+I` → Application tab
- [ ] Check "Service Workers" section — should show `sw.js` registered
- [ ] Check "Manifest" section — should load without errors
- [ ] Check "Storage" → Cache Storage — should show `ayu-vibee-v1` cache

### 4. Deploy to Vercel/Netlify
- [ ] Push code to `portfolio-enhancement-roadmap` branch
- [ ] Create Pull Request for review
- [ ] Deploy preview and test
- [ ] Set `RESEND_API_KEY` in production environment

---

## Phase 6: Error Monitoring (6-8 hours)

### Setup
```bash
npm install @sentry/react @sentry/tracing
```

### Implementation
1. **`src/sentry.ts`** — Sentry initialization
   ```typescript
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: process.env.VITE_SENTRY_DSN,
     environment: process.env.NODE_ENV,
     tracesSampleRate: 1.0,
     integrations: [new Sentry.Replay()],
   });
   ```

2. **`src/components/ErrorBoundary.tsx`** — Catch React errors
   ```typescript
   import * as Sentry from "@sentry/react";
   
   const ErrorBoundary = Sentry.withErrorBoundary(Component, {
     fallback: <ErrorFallbackUI />,
   });
   ```

3. **`src/main.tsx`** — Wrap App with ErrorBoundary

4. **Unhandled Rejection Handling**
   ```typescript
   window.addEventListener('unhandledrejection', (event) => {
     Sentry.captureException(event.reason);
   });
   ```

### Deployment
- [ ] Get Sentry DSN from https://sentry.io
- [ ] Set `VITE_SENTRY_DSN` env var
- [ ] Generate source maps: `npm run build`
- [ ] Upload source maps to Sentry

### Monitoring
- [ ] Visit https://sentry.io → Project → Issues
- [ ] Errors should appear within seconds of occurring

---

## Phase 7: Guestbook Feature (8-12 hours)

### Database Schema
Create Firestore collection `guestbook`:
```
Field: id (string, auto)
Field: name (string)
Field: email (string)
Field: message (string)
Field: approved (boolean, default: false)
Field: flagged (boolean, default: false)
Field: createdAt (timestamp)
```

### New Component: `GuestbookView.tsx`
```typescript
export default function GuestbookView() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    // Fetch paginated approved entries from Firestore
    const q = query(
      collection(db, 'guestbook'),
      where('approved', '==', true),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    const unsubscribe = onSnapshot(q, (snap) => {
      setEntries(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as GuestbookEntry)));
    });
    
    return unsubscribe;
  }, [page]);

  return (
    <section>
      <h2>Guestbook</h2>
      {entries.map(entry => (
        <div key={entry.id}>
          <h3>{entry.name}</h3>
          <p>{entry.message}</p>
          <time>{new Date(entry.createdAt).toLocaleDateString()}</time>
        </div>
      ))}
      {/* Pagination */}
    </section>
  );
}
```

### New Component: `GuestbookForm.tsx`
- Similar validation as ContactView
- Profanity filter: https://npm.js.org/package/bad-words
- Rate limiting: check localStorage for submissions this week
- Submit to `/api/guestbook` endpoint

### Server Endpoint: `server.ts` → `/api/guestbook`
```typescript
app.post('/api/guestbook', async (req, res) => {
  const { name, email, message } = req.body;
  
  // Validate
  // Filter profanity
  // Rate limit check
  
  // Add to Firestore (auto-moderate as flagged)
  await db.collection('guestbook').add({
    name, email, message,
    approved: false, // Require admin approval
    flagged: containsProfanity(message),
    createdAt: new Date(),
  });
});
```

### Admin UI Update: `AdminConsole.tsx`
Add section:
```typescript
<section>
  <h3>Guestbook Moderation</h3>
  {/* List pending entries */}
  {/* Buttons: Approve, Reject, Delete */}
  {/* Flag suspicious entries */}
</section>
```

### Integration
- Add "Guestbook" to Navigation
- Embed form in About or Contact page
- Display latest 5 entries in footer

---

## Phase 8: Photography Metadata (Optional, 6-8 hours)

### Extend Photo Type
```typescript
interface Photo {
  id: string;
  url: string;
  // ... existing fields
  
  // NEW:
  camera?: string;       // e.g., "Canon EOS 5D Mark IV"
  lens?: string;         // e.g., "Canon EF 24-70mm f/2.8L"
  iso?: number;          // e.g., 1600
  aperture?: string;     // e.g., "f/2.8"
  shutterSpeed?: string; // e.g., "1/250"
  location?: string;     // e.g., "Kolkata, India"
  tags?: string[];       // e.g., ["architecture", "monsoon", "urban"]
  collectionId?: string; // e.g., "monsoon-2025"
}
```

### Collections System
```typescript
interface PhotoCollection {
  id: string;
  name: string;
  description: string;
  coverImageUrl: string;
  photoCount: number;
  createdAt: Date;
}
```

### UI Enhancements
1. **Photo Details Modal** — Show EXIF in expandable section
2. **Filter UI** — Filter by camera, location, tags
3. **Collections Page** — Browse by collection
4. **Admin Upload** — Add metadata when uploading

---

## Remaining Accessibility Fixes (4-6 hours)

### Add Image Alt Text
- [ ] ProfileView.tsx — Each photo needs descriptive alt text
- [ ] StoriesView.tsx — Article images with alt text
- [ ] AdminConsole.tsx — Preview images with alt text

Example alt text:
```typescript
<img 
  src={photo.url} 
  alt="Abandoned brutalist building with geometric shadows cast by afternoon sunlight"
/>
```

### Add Form ARIA Attributes
- [ ] ContactView: Add `aria-invalid` + `aria-describedby` to errors
- [ ] GuestbookForm: Same pattern

Example:
```typescript
<input
  aria-required="true"
  aria-invalid={errors.name ? true : false}
  aria-describedby={errors.name ? "name-error" : undefined}
/>
{errors.name && <span id="name-error">{errors.name}</span>}
```

### Test with Screen Readers
- [ ] Windows: NVDA (free) — download from https://www.nvaccess.org/
- [ ] Mac: VoiceOver (built-in) — Cmd+F5 to enable
- [ ] Test: Navigate home → portfolio → contact → submit form
- [ ] Verify all labels, buttons, errors are announced

---

## Testing Checklist

### Accessibility
- [ ] Run Lighthouse Accessibility audit (target >95)
- [ ] Test Tab navigation (all interactive elements reachable)
- [ ] Test focus visible (outline/ring on all buttons)
- [ ] Test with screen reader (NVDA / VoiceOver)

### Performance
- [ ] Run Lighthouse Performance (target >95)
- [ ] Check Core Web Vitals (LCP <2.5s, INP <100ms, CLS <0.1)
- [ ] Test on slow network (DevTools > Throttling)
- [ ] Test on low-end device (Lighthouse > "Emulate mobile" > "Moto G Power")

### SEO
- [ ] Google Search Console — Submit sitemap
- [ ] Check indexation — Search "site:ayuvibee.com" in Google
- [ ] Verify meta tags in view-source
- [ ] Test social preview — https://metatags.io/

### PWA
- [ ] Install on mobile — "Add to Home Screen"
- [ ] Use offline (DevTools > Network > Offline)
- [ ] Check splash screen — should show app icon + name
- [ ] Verify app title — should be "AYU.VIBEE"

### Email (Resend)
- [ ] Contact form submission received
- [ ] Admin notification email arrives
- [ ] User confirmation email arrives
- [ ] Check spam folder (sometimes lands there initially)

---

## Deployment Checklist

Before pushing to production:

- [ ] All 8 phases planned / 5+ phases implemented
- [ ] No console errors in DevTools
- [ ] No TypeScript errors: `npm run build`
- [ ] Lighthouse scores >90 on all metrics
- [ ] SEO: robots.txt + sitemap accessible
- [ ] PWA: Service Worker registers + installs
- [ ] Contact form: Emails deliver successfully
- [ ] Accessibility: Keyboard nav + ARIA labels in place
- [ ] Environment variables set in production
- [ ] Git history clean, PR reviewed

---

## Long-Term Roadmap (6+ months)

- [ ] Advanced analytics dashboard
- [ ] AI-powered photo recommendations
- [ ] User accounts + saved favorites
- [ ] Print-on-demand integration
- [ ] Video portfolio section
- [ ] API for external integrations
- [ ] Multi-language support
- [ ] Dark mode toggle

---

## Questions?

1. **How do I get Resend API key?** → Go to https://resend.com, sign up, get key from dashboard
2. **How do I set env vars in Netlify?** → Go to Site settings > Build & deploy > Environment
3. **How do I test PWA offline?** → DevTools > Application > Service Workers > Offline checkbox
4. **How do I add image alt text?** → Just add `alt="description"` to every `<img>` tag
5. **How do I verify SEO?** → Search "site:ayuvibee.com" in Google (may take 2-4 weeks after launch)

---

## File Structure Reference

```
src/
├── components/
│   ├── SEOHead.tsx ✅
│   ├── Navigation.tsx ✅ (updated with ARIA)
│   ├── ContactView.tsx ✅ (updated with Resend)
│   ├── ProfileView.tsx (add alt text)
│   ├── StoriesView.tsx (add alt text)
│   ├── ErrorBoundary.tsx (TODO: Phase 6)
│   ├── GuestbookView.tsx (TODO: Phase 7)
│   ├── GuestbookForm.tsx (TODO: Phase 7)
│   └── AdminConsole.tsx (update with moderation)
├── hooks/
│   ├── useWindowSize.ts ✅
│   ├── useAnalytics.ts ✅
│   └── (add more as needed)
├── utils/
│   ├── contactForm.ts ✅
│   ├── performance.ts ✅
│   └── sentry.ts (TODO: Phase 6)
├── seo/
│   └── metadata.ts ✅
├── App.tsx ✅
└── main.tsx ✅
public/
├── robots.txt ✅
├── sitemap.xml ✅
├── manifest.json ✅
├── sw.js ✅
└── og-image.png ✅
```

---

**Last updated:** 2026-07-05  
**Status:** Ready for Phase 6 (Error Monitoring)  
**Next milestone:** 80% complete (6 of 8 phases)
