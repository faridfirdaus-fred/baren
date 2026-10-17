# E10-4: Browser Compatibility Test Checklist (NFR-CMP-01)

**Requirement:** Chrome, Firefox, Edge, Safari — 2 versi mayor terakhir

## Test Matrix

| Browser         | Versions      | Status | Notes                          |
|-----------------|---------------|--------|--------------------------------|
| Chrome          | 130, 129      | ⬜     | Desktop + mobile               |
| Firefox         | 131, 130      | ⬜     | Desktop + mobile               |
| Edge            | 130, 129      | ⬜     | Desktop (Chromium-based)       |
| Safari          | 18, 17        | ⬜     | Desktop + iOS                  |

## Critical Flows to Test

### 1. Landing Page (Visitor)
- [ ] Hero video autoplay + controls
- [ ] Scroll-reveal animations (fade-in-up)
- [ ] Carousel navigation (keyboard + mouse)
- [ ] Navigation menu (desktop + mobile hamburger)
- [ ] Wishlist button → Google OAuth flow
- [ ] Comments section (login, post, view)
- [ ] Gallery lightbox (keyboard Escape/Arrow)
- [ ] FAQ accordion (click + keyboard)

### 2. Admin Panel
- [ ] Login form (email/password)
- [ ] Dashboard stats display
- [ ] Hero/News/Features CRUD forms
- [ ] Image upload (R2 presigned URL)
- [ ] Wishlist CSV export download
- [ ] Landing cards drag reorder (keyboard ↑↓)
- [ ] Comments delete confirmation modal
- [ ] Logout + redirect protection

### 3. Responsive Breakpoints
- [ ] 360px (mobile portrait)
- [ ] 768px (tablet)
- [ ] 1024px (desktop)
- [ ] 1920px (large desktop)

### 4. Accessibility
- [ ] Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- [ ] Screen reader compatibility (NVDA/JAWS/VoiceOver)
- [ ] Focus indicators visible
- [ ] Color contrast (WCAG AA)
- [ ] Form labels + error messages

### 5. Performance
- [ ] LCP ≤ 3s (Lighthouse mobile)
- [ ] No console errors
- [ ] Smooth animations (60fps)
- [ ] Images lazy load below fold

## Known Browser-Specific Issues

### Chrome/Edge (Chromium)
- ✅ Full feature support
- ⚠️ Check: video autoplay policy (muted required)

### Firefox
- ✅ Full feature support
- ⚠️ Check: Intersection Observer timing (scroll-reveal)

### Safari
- ⚠️ Check: `100svh` viewport units (iOS Safari collapsing UI)
- ⚠️ Check: video poster fallback
- ⚠️ Check: date input format (comments timestamp)
- ⚠️ Check: CSS `text-wrap: balance` (fallback OK)

## Test Execution

### Automated (Playwright)
```bash
# Chrome (default)
E2_TEST_ADMIN_EMAIL=admin@example.com E2_TEST_ADMIN_PASSWORD=pass \
  node scripts/test-admin-panel.mjs http://localhost:3000

# Firefox
E2_TEST_ADMIN_EMAIL=admin@example.com E2_TEST_ADMIN_PASSWORD=pass \
  node scripts/test-admin-panel.mjs --browser=firefox http://localhost:3000
```

### Manual (Safari, iOS)
1. Open https://yourdomain.com in Safari 18/17
2. Test critical flows above
3. Check responsive breakpoints
4. Test on iPhone Safari (iOS 18/17)

## Definition of Done
- ✅ All critical flows work on Chrome 130+
- ✅ All critical flows work on Firefox 131+
- ✅ All critical flows work on Edge 130+
- ✅ All critical flows work on Safari 18+ (desktop)
- ✅ Mobile responsive on iOS Safari
- ✅ No console errors on any browser
- ⚠️ Safari-specific workarounds documented if needed

## Notes
- Automated tests cover Chrome/Firefox via Playwright
- Safari requires manual testing (WebKit engine differences)
- iOS Safari: test 100svh hero height on actual device
- Legacy browser support: NOT required (NFR-CMP-01 = latest 2 versions)
