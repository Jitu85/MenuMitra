# MenuMitra — Production Deployment Guide
**Developed by Abhijit Kumar Misra**  
**Phase 9 — Testing & Go-Live**  
Document Version: 1.0 | Date: May 2026

---

## Architecture Overview

```
Customers / Owners / Admin
          │
          ▼
  Vercel (Frontend)
  https://menu-mitra.vercel.app
          │
          ▼ HTTPS / REST API
  Railway (Backend)
  https://menumitra-production.up.railway.app
          │
          ▼
  Supabase (PostgreSQL)
  aws-1-ap-northeast-1.pooler.supabase.com
```

---

## Part 1 — Backend Deployment (Railway)

### Step 1 — Push latest code to Railway

```bash
cd "C:\Users\HP\Documents\My Project\MenuMitra\MenuMitra\Server"
git add .
git commit -m "Phase 9: Testing & Deployment"
git push
```

Railway auto-deploys on every `git push` to the connected branch.

### Step 2 — Verify Railway Environment Variables

Go to: **Railway Dashboard → Your Project → Variables**

Ensure these are set (copy from `.env`):

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Supabase pooled connection URL |
| `DIRECT_URL` | Your Supabase direct connection URL |
| `JWT_SECRET` | (64+ char random string) |
| `JWT_ADMIN_SECRET` | (64+ char random string) |
| `JWT_REFRESH_SECRET` | (64+ char random string) |
| `ADMIN_LOGIN_ID` | `Jitu` |
| `ADMIN_EMAIL` | `abhijit.jituwreath@gmail.com` |
| `ADMIN_PASSWORD` | `admin123` (change in production!) |
| `EMAIL_FROM` | `abhijit.jituwreath@gmail.com` |
| `EMAIL_PASS` | Your Gmail App Password (see below) |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
| `RAZORPAY_KEY_ID` | `rzp_live_XXXXXXXXXX` (Live key from Razorpay Dashboard) |
| `RAZORPAY_KEY_SECRET` | Your Razorpay live key secret |
| `RAZORPAY_WEBHOOK_SECRET` | Your Razorpay webhook secret |
| `FRONTEND_URL` | `https://menu-mitra.vercel.app` |
| `NODE_ENV` | `production` |
| `PORT` | `4000` |

### Step 3 — Gmail App Password Setup (for OTP/Reset emails)

1. Go to your Google Account → Security → 2-Step Verification (enable if not already)
2. Go to **App Passwords** → Select "Mail" → Select "Windows Computer"
3. Copy the 16-character app password
4. Set `EMAIL_PASS` = that password in Railway Variables
5. Set `EMAIL_FROM` = `abhijit.jituwreath@gmail.com`

> **Note:** You must use an **App Password**, not your regular Gmail password. Gmail blocks regular SMTP login.

### Step 4 — Verify Backend Health

```bash
# Run production smoke test
cd "C:\Users\HP\Documents\My Project\MenuMitra\MenuMitra\Server"
node tests/production_smoke_test.js
```

Or visit directly: `https://menumitra-production.up.railway.app/api/health`

Expected response:
```json
{ "status": "ok", "db": "connected", "env": "production" }
```

---

## Part 2 — Frontend Deployment (Vercel)

### Step 1 — Set Vercel Environment Variables

Go to: **Vercel Dashboard → menu-mitra project → Settings → Environment Variables**

| Variable | Value | Environments |
|---|---|---|
| `REACT_APP_API_URL` | `https://menumitra-production.up.railway.app/api` | Production |
| `REACT_APP_RAZORPAY_KEY` | `rzp_live_XXXXXXXXXX` | Production |
| `REACT_APP_RAZORPAY_SUBSCRIPTION_PAGE` | `https://pages.razorpay.com/pl_SvCPlnDwmb2zKY/view` | All |
| `REACT_APP_API_URL` | `http://localhost:4000/api` | Development |
| `REACT_APP_RAZORPAY_KEY` | `rzp_test_mockKey123` | Development |

### Step 2 — Deploy to Vercel

```bash
cd "C:\Users\HP\Documents\My Project\MenuMitra\MenuMitra\Client"
npm run build
# Then push to git — Vercel auto-deploys
git add .
git commit -m "Phase 9: Production build"
git push
```

Or use Vercel CLI:
```bash
npx vercel --prod
```

### Step 3 — Verify Frontend

Visit: `https://menu-mitra.vercel.app`

Check:
- [ ] Landing page loads without errors
- [ ] "Start Free Trial" button → `/signup`
- [ ] "Subscribe Now — ₹100/mo" Razorpay button visible in pricing section
- [ ] Owner Login → `/login` works
- [ ] Admin Login → `/admin/login` with `Jitu` / `admin123`

---

## Part 3 — Razorpay Setup

### For Order Payments (API-based checkout)

1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings → API Keys → Generate Live Keys**
3. Copy `Key ID` (starts with `rzp_live_`) and `Key Secret`
4. Set in Railway: `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
5. Set in Vercel: `REACT_APP_RAZORPAY_KEY` = Key ID

### For Subscription Payments (Payment Page)

Your Razorpay Payment Page is already set up:
- **Page URL:** `https://pages.razorpay.com/pl_SvCPlnDwmb2zKY/view`
- **Page ID:** `pl_SvCPlnDwmb2zKY`
- This page is embedded on the Landing Page and the Owner Subscription page
- When a customer pays, you receive the payment in your Razorpay account
- Use Admin Panel → Owner Management to manually extend their subscription

### Webhook Setup (Optional — for automatic activation)

1. Razorpay Dashboard → Settings → Webhooks → Add New Webhook
2. URL: `https://menumitra-production.up.railway.app/api/subscription/webhook`
3. Events: `payment.captured`, `subscription.activated`
4. Copy the Webhook Secret → Set as `RAZORPAY_WEBHOOK_SECRET` in Railway

---

## Part 4 — Running All Tests

### Unit Tests (Jest — no server needed)

```bash
cd "C:\Users\HP\Documents\My Project\MenuMitra\MenuMitra\Server"
npm install          # Install Jest + Supertest
npm test             # Runs all tests in tests/*.test.js
```

Expected output: `Tests: 30+ passed, 0 failed`

### E2E Integration Test (local server required)

```bash
# Start server first (in separate terminal):
npm run dev

# Then run tests:
npm run test:e2e
```

### E2E Against Production

```bash
npm run test:e2e:prod
```

### Load Test

```bash
# Requires server running. Set TEST_SLUG to a real owner slug.
TEST_SLUG=sharma-dhaba-delhi npm run test:load
```

### Security Audit

```bash
npm run test:security
```

### Production Smoke Test

```bash
PROD_SLUG=your-real-slug npm run test:smoke
```

---

## Part 5 — Go-Live Checklist

### Pre-Launch (Before going live)

- [ ] All unit tests pass (`npm test`)
- [ ] E2E test passes locally (`npm run test:e2e`)
- [ ] Production smoke test passes (`npm run test:smoke`)
- [ ] Gmail App Password configured — test reset email actually arrives
- [ ] Razorpay live keys set in Railway + Vercel (not test keys)
- [ ] `REACT_APP_RAZORPAY_KEY` set to live key in Vercel Production environment
- [ ] Backend `NODE_ENV=production` in Railway
- [ ] Admin password changed from default `admin123` to something strong
- [ ] Cloudinary credentials set — test food image upload works

### Post-Launch Verification

- [ ] Register a test owner account → verify 30-day trial starts
- [ ] Add a menu item with photo → photo uploads to Cloudinary
- [ ] Access customer menu via slug URL → menu loads correctly
- [ ] Place a test order → verify order appears in owner dashboard
- [ ] Owner marks order as paid → status updates
- [ ] QR code downloads correctly
- [ ] Admin panel shows real owner statistics
- [ ] Password reset email arrives correctly
- [ ] Subscription "Renew" button opens Razorpay payment page

---

## Part 6 — Monitoring & Maintenance

### Check Server Logs

```bash
# Railway CLI (if installed)
railway logs

# Or view in Railway Dashboard → Deployments → View Logs
```

### Daily Health Check

```bash
node tests/production_smoke_test.js
```

### Database Access

Connect to Supabase: `https://app.supabase.com/project/xacjlxzwjivwxhheqnmr`

### Admin Panel Access

URL: `https://menu-mitra.vercel.app/admin/login`  
Login ID: `Jitu`  
Password: (set in Railway `ADMIN_PASSWORD`)

---

## Part 7 — Future Upgrades (Post Testing Phase)

When you're ready after the testing period:

1. **Custom Domain** — Point `menumitra.in` to Vercel (A record / CNAME) and `api.menumitra.in` to Railway
2. **Real Admin Password** — Change `admin123` to a strong password in Railway env vars
3. **Remove Hardcoded Fallbacks** — Clean up credential fallbacks in `index.js` and `app.js`
4. **Sentry Error Monitoring** — Add `SENTRY_DSN` to Railway and install `@sentry/node`
5. **Redis for Rate Limiting** — Currently disabled; enable if needed for production load
6. **Automated Subscription Cron** — Verify `node-cron` subscription expiry checks are running

---

*Document prepared for MenuMitra — Developed by Abhijit Kumar Misra*
