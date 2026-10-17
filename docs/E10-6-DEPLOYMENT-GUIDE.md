# E10-6: Production Deployment Guide — Cloudflare Workers

**Date:** 2026-10-17  
**Target:** Deploy BAREN landing page + admin CMS to Cloudflare Workers  
**Pre-requisites:** UAT E10-5 approved ✅

## Architecture

```
┌─────────────────────────────────────────┐
│   Cloudflare Workers (Edge Runtime)     │
│   - Next.js 16 via OpenNext adapter     │
│   - SSR + Static pages                  │
│   - API routes                          │
└──────────┬──────────────────────────────┘
           │
           ├─► Neon Postgres (serverless, pooled)
           │   - Database: pooled connection string
           │   - Tables: users, sessions, content, wishlist
           │
           ├─► Cloudflare R2 (object storage)
           │   - Bucket: baren-assets
           │   - Assets: logos, images, videos
           │
           └─► Google OAuth
               - Client ID/Secret
               - Redirect URI: https://yourdomain.com/api/auth/callback/google
```

## Pre-Deployment Checklist

### 1. Cloudflare Account Setup
- [ ] Cloudflare account created
- [ ] Workers plan: Paid ($5/month minimum for 10M requests)
- [ ] Domain configured (optional, can use workers.dev subdomain)

### 2. R2 Bucket Setup
```bash
# Create R2 bucket
wrangler r2 bucket create baren-assets

# Configure CORS
wrangler r2 bucket cors put baren-assets --config r2-cors.json
```

**r2-cors.json:**
```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

### 3. Neon Database
- [ ] Neon account + project created
- [ ] Pooled connection string obtained
- [ ] Migrations applied: `pnpm db:push`
- [ ] Admin seeded: `pnpm db:seed`

### 4. Google OAuth Setup
- [ ] Google Cloud Console project created
- [ ] OAuth 2.0 credentials configured
- [ ] Authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`
- [ ] Client ID + Secret obtained

---

## Deployment Steps

### Step 1: Build for Production

```bash
# Clean previous builds
rm -rf .next .open-next

# Build Next.js + OpenNext adapter
pnpm build

# Verify build output
ls -la .open-next/
```

**Expected output:**
- `.open-next/server-functions/` (Workers code)
- `.open-next/cache/` (static assets)

---

### Step 2: Configure Secrets

**Required secrets (12 total):**

```bash
# Database
wrangler secret put NEON_DATABASE_URL
# Paste: postgresql://user:pass@host/db?sslmode=require (POOLED)

# Auth
wrangler secret put AUTH_SECRET
# Generate: openssl rand -base64 32

wrangler secret put AUTH_GOOGLE_ID
# From Google Cloud Console

wrangler secret put AUTH_GOOGLE_SECRET
# From Google Cloud Console

# R2 Credentials
wrangler secret put R2_ACCOUNT_ID
# From Cloudflare dashboard → R2 → Account ID

wrangler secret put R2_ACCESS_KEY_ID
# From R2 → Manage R2 API Tokens

wrangler secret put R2_SECRET_ACCESS_KEY
# From R2 token generation

wrangler secret put R2_BUCKET_NAME
# Value: baren-assets

wrangler secret put R2_PUBLIC_DOMAIN
# Value: https://pub-xxxxx.r2.dev (R2 public URL)

# Admin Email (for seeding)
wrangler secret put ADMIN_EMAIL
# Your admin email

wrangler secret put ADMIN_PASSWORD
# Secure password (bcrypt hashed on seed)

# Public URL
wrangler secret put NEXT_PUBLIC_BASE_URL
# Value: https://yourdomain.com
```

---

### Step 3: Deploy to Workers

```bash
# Deploy via opennextjs-cloudflare
pnpm deploy

# Or manual wrangler deploy
wrangler deploy
```

**Expected output:**
```
✨ Uploaded 100% (XXX files)
✨ Published baren (X.XX sec)
   https://baren.your-subdomain.workers.dev
```

---

### Step 4: Custom Domain (Optional)

```bash
# Add custom domain
wrangler domains add yourdomain.com

# Or via Cloudflare dashboard:
# Workers & Pages → baren → Settings → Domains → Add Custom Domain
```

**DNS Configuration:**
- Add CNAME: `yourdomain.com` → `baren.your-subdomain.workers.dev`
- Or use Cloudflare proxied A/AAAA records

---

### Step 5: Update OAuth Redirect URI

**Google Cloud Console:**
1. Navigate to: APIs & Services → Credentials
2. Edit OAuth 2.0 Client ID
3. Add Authorized redirect URI:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```
4. Save

---

### Step 6: Verify Deployment

**Public Landing Page:**
```bash
curl -I https://yourdomain.com
# Expected: 200 OK, HTML content

curl https://yourdomain.com | grep "BAREN"
# Expected: page title contains "BAREN"
```

**Admin Login:**
```bash
# Navigate to: https://yourdomain.com/admin/login
# Login with ADMIN_EMAIL + ADMIN_PASSWORD
# Expected: Dashboard visible
```

**Database Connectivity:**
```bash
# Create test news item in admin
# Expected: Saved to Neon, visible on public page
```

**R2 Upload:**
```bash
# Upload logo in /admin/branding
# Expected: Image accessible via R2_PUBLIC_DOMAIN
```

**Google OAuth:**
```bash
# Click "Gabung Wishlist" → Google sign-in
# Expected: Redirect to Google, return to site, email saved
```

---

## Post-Deployment Verification

### Functional Tests
- [ ] Landing page loads (hero video plays)
- [ ] Admin login works
- [ ] CRUD operations (news, features, gallery)
- [ ] R2 uploads functional
- [ ] Google OAuth wishlist working
- [ ] Comments posting (authenticated)
- [ ] Wishlist CSV export
- [ ] Mobile responsive (360px - 1920px)

### Performance Tests
- [ ] Lighthouse Performance ≥ 80
- [ ] LCP ≤ 3 seconds
- [ ] No console errors

### Security Tests
- [ ] `/admin` redirects to login (unauthenticated)
- [ ] API endpoints require auth (401/403)
- [ ] HTTPS enforced
- [ ] OAuth email verification working

---

## Rollback Procedure

**If deployment fails:**

```bash
# List deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback <DEPLOYMENT_ID>
```

**Or revert via dashboard:**
- Cloudflare Workers → baren → Deployments → Rollback

---

## Monitoring & Logs

**View real-time logs:**
```bash
wrangler tail
```

**Dashboard:**
- Cloudflare Workers → baren → Metrics
- Monitor: Requests/sec, Errors, CPU time

**Neon Database:**
- Neon Console → Project → Monitoring
- Watch: Connection pool, Query performance

---

## Production Environment Variables

**Not stored as secrets (public values):**

Create `wrangler.toml`:
```toml
name = "baren"
main = ".open-next/server-functions/index.mjs"
compatibility_date = "2024-01-01"

[env.production]
vars = { NODE_ENV = "production" }

[[r2_buckets]]
binding = "R2"
bucket_name = "baren-assets"
```

---

## Cost Estimation

**Cloudflare Workers:**
- Free tier: 100k requests/day
- Paid ($5/mo): 10M requests + $0.50/million after

**Cloudflare R2:**
- Storage: $0.015/GB/month
- Class A operations (upload): $4.50/million
- Class B operations (download): $0.36/million
- Egress: FREE

**Neon Postgres:**
- Free tier: 0.5GB storage, 100 compute hours/month
- Pro: $19/mo + usage

**Expected monthly cost (low traffic):** ~$25-40

---

## Troubleshooting

### Issue: 500 Error on Deploy
**Cause:** Missing secrets or incorrect DATABASE_URL  
**Fix:** Verify all 12 secrets, check Neon pooled connection string

### Issue: OAuth Redirect Mismatch
**Cause:** Redirect URI not whitelisted in Google Console  
**Fix:** Add production domain to Authorized redirect URIs

### Issue: R2 Upload Fails
**Cause:** CORS not configured or wrong bucket name  
**Fix:** Apply r2-cors.json, verify R2_BUCKET_NAME secret

### Issue: Database Connection Timeout
**Cause:** Using direct connection instead of pooled  
**Fix:** Use Neon pooled connection string (ends with `?sslmode=require`)

---

## Success Criteria

- ✅ Site accessible at production URL
- ✅ Admin login functional
- ✅ All CRUD operations working
- ✅ R2 uploads successful
- ✅ Google OAuth working
- ✅ No console errors
- ✅ Performance metrics met (LCP ≤3s, Score ≥80)
- ✅ Security tests pass

**Status:** Ready for deployment  
**Approval:** UAT E10-5 completed ✅  
**Next:** Execute deployment commands
