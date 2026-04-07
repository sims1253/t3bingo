# Deployment Options for TanStack Start / Vite / React App (2026)

> Research date: April 7, 2026

## TanStack Start Deployment Support Overview

TanStack Start has **official hosting partners**: **Cloudflare**, **Netlify**, and **Railway**. These have dedicated deployment adapters and first-class documentation. Vercel is also supported via the Nitro adapter.

**Available deployment targets:**
- `cloudflare-workers` — Official partner, dedicated `@cloudflare/vite-plugin`
- `netlify` — Official partner, dedicated `@netlify/vite-plugin-tanstack-start`
- `railway` — Official partner, uses Nitro adapter, auto-detects builds
- `vercel` — Supported via Nitro adapter
- `nitro` — Generic adapter deploying to many platforms
- `node-server` / Docker — Self-hosted
- `bun` — Bun runtime server

---

## Platform Comparison

### 1. Cloudflare Workers/Pages ⭐ RECOMMENDED

**Official TanStack Start partner** with dedicated `@cloudflare/vite-plugin`.

| Feature | Free Tier |
|---|---|
| **Requests** | 100,000 requests/day |
| **CPU time** | 10ms per invocation |
| **Static assets** | Unlimited, free |
| **Builds** | 500/month (Pages) |
| **Files** | 20,000 per site |
| **Custom domains** | 100 per project |
| **Bandwidth/Egress** | Unlimited (no charge) |
| **Storage (KV)** | 100K reads/day, 1K writes/day |
| **D1 Database** | 5M rows read/day, 100K writes/day, 5GB storage |
| **Commercial use** | ✅ Allowed |

- **SSR Support**: Full SSR via Cloudflare Workers with the dedicated plugin
- **Deployment**: Git push (auto-deploy) or `wrangler deploy` CLI
- **Cold starts**: Near-zero (edge runtime, V8 isolates)
- **Restrictions**: 10ms CPU time per invocation on free plan (usually sufficient for simple SSR)
- **Best for**: Simple web apps, globally distributed, excellent free tier

### 2. Netlify ⭐ Official Partner

**Official TanStack Start partner** with dedicated `@netlify/vite-plugin-tanstack-start`.

| Feature | Free Tier |
|---|---|
| **Credits** | 300 credits/month |
| **Bandwidth** | 100 GB/month |
| **Build minutes** | 300/month |
| **Function invocations** | 125,000/month |
| **Edge function invocations** | 1M/month |
| **Sites** | Unlimited |
| **Storage** | 10 GB |
| **Form submissions** | 100/month |
| **Commercial use** | ✅ Allowed |

- **SSR Support**: Full SSR via Netlify Functions + edge functions
- **Deployment**: Git push (auto-deploy from GitHub/GitLab) or `netlify deploy` CLI
- **Cold starts**: Moderate (serverless functions have ~1-2s cold start; edge functions faster)
- **Restrictions**: Function timeout of 10 seconds; credit system can be confusing
- **Best for**: JAMstack/static sites with SSR, simple full-stack apps

### 3. Vercel

Supported via **Nitro adapter** (no dedicated plugin). Uses the standard TanStack Start → Nitro → Vercel pipeline.

| Feature | Hobby (Free) Tier |
|---|---|
| **Bandwidth** | 100 GB/month |
| **Active CPU** | 4 CPU-hours/month |
| **Provisioned Memory** | 360 GB-hours/month |
| **Function Invocations** | 1,000,000/month |
| **Edge Requests** | 1,000,000/month |
| **Build execution minutes** | 6,000/month |
| **Deployments/day** | 100 |
| **Projects** | 200 |
| **Function duration limit** | 10s default, up to 60s |
| **Commercial use** | ❌ **NOT allowed** on Hobby plan |

- **SSR Support**: Full SSR via serverless/edge functions
- **Deployment**: Git push (auto-deploy from GitHub) or Vercel CLI
- **Cold starts**: Moderate for serverless functions; edge functions are faster
- **Restrictions**: **Non-commercial use only** on Hobby plan — this is a big limitation for any monetized project
- **Best for**: Personal/hobby projects only on free tier; commercial use requires $20/mo Pro plan

### 4. Railway ⭐ Official Partner

**Official TanStack Start partner**. Uses the Nitro adapter under the hood.

| Feature | Free Tier | Hobby ($5/mo) |
|---|---|---|
| **Price** | $0/month | $5/month (includes $5 usage credit) |
| **RAM** | 512 MB | 48 GB |
| **CPU** | 1 vCPU | 48 vCPU |
| **Included credit** | $1/month | $5/month |
| **Replicas** | 1 | 6 |
| **Ephemeral storage** | 1 GB | 100 GB |
| **Image size** | 4 GB | 100 GB |

- **SSR Support**: Full Node.js server — runs as a persistent process
- **Deployment**: Git push to connected repo, auto-detects build settings
- **Cold starts**: No cold starts (persistent server), but free tier may have limited resources
- **Restrictions**: Free tier is very limited (512MB RAM, $1 credit); Hobby plan at $5/mo is the realistic minimum
- **Cost estimate for a small app**: ~$3-5/month on Hobby (512MB RAM + minimal CPU)
- **Best for**: Full-stack apps needing persistent server, databases

### 5. Render

No dedicated TanStack Start adapter. Deploy as a Node.js web service.

| Feature | Free Tier |
|---|---|
| **Instance hours** | 750 hours/month |
| **RAM** | 512 MB (shared) |
| **Bandwidth** | 100 GB/month (shared across all services) |
| **Build pipeline** | Limited (shared) |
| **Custom domains** | ✅ |
| **SSL** | ✅ Managed |
| **Commercial use** | ✅ Allowed |

- **SSR Support**: Full Node.js server
- **Deployment**: Git push (auto-deploy from GitHub/GitLab) or Render CLI
- **Cold starts**: **Major issue** — free services spin down after 15 minutes of inactivity; ~1 minute to spin back up; shows loading page during spin-up
- **Restrictions**: Spun-down services serve a `Disallow: /` robots.txt (bad for SEO); ephemeral filesystem; no persistent disks on free tier; Render may restart at any time
- **Best for**: Testing and demos; not ideal for production due to spin-down behavior

### 6. Fly.io

No dedicated TanStack Start adapter. Deploy as a Docker container (Node.js or Bun server).

| Feature | Free Trial | Paid |
|---|---|---|
| **Duration** | 7 days OR 2 VM hours (whichever first) | Pay-as-you-go |
| **VMs** | Up to 10 | Unlimited |
| **RAM** | 4 GB per VM | Varies |
| **vCPU** | Up to 2 per VM | Varies |
| **Volume storage** | 20 GB | Varies |
| **Commercial use** | N/A (trial only) | ✅ |

- **SSR Support**: Full server via Docker container
- **Deployment**: `fly deploy` CLI after building Docker image
- **Cold starts**: Machines auto-stop; ~1-3 seconds to restart (Fly.io Machines are fast)
- **Restrictions**: **No permanent free tier** — trial is only 7 days or 2 VM hours. After that, pay-as-you-go with minimum costs ~$2-5/month for a small app
- **Cost estimate**: ~$1.94/month for smallest VM (shared-cpu-1x@256MB), but IPv4 costs extra (~$2/month)
- **Best for**: Only if you need container-level control; not free

---

## Summary Table

| Platform | Free Tier | SSR Support | TanStack Adapter | Cold Starts | Commercial OK | Best For |
|---|---|---|---|---|---|---|
| **Cloudflare** | ✅ Generous | ✅ Workers | ✅ Official plugin | Near-zero | ✅ | ⭐ **Best free option** |
| **Netlify** | ✅ Good | ✅ Functions | ✅ Official plugin | Moderate | ✅ | Static + SSR hybrid |
| **Vercel** | ✅ Good | ✅ Serverless/Edge | Via Nitro | Moderate | ❌ No | Hobby/personal only |
| **Railway** | ✅ Very limited | ✅ Node.js | ✅ Official partner | None | ✅ | Persistent server ($5/mo) |
| **Render** | ✅ Good | ✅ Node.js | None (manual) | **Bad** (15min spin-down) | ✅ | Testing/demos |
| **Fly.io** | ❌ Trial only | ✅ Docker | None (manual) | Low | ✅ | Container hosting (paid) |

---

## Recommendation for a Simple Bingo Game

### 🏆 Best choice: **Cloudflare Workers**

1. **Free forever** with generous limits (100K requests/day, unlimited bandwidth)
2. **Official TanStack Start plugin** — first-class support
3. **Near-zero cold starts** — edge runtime using V8 isolates
4. **Commercial use allowed** on free plan
5. **Globally distributed** by default
6. Deploy with `wrangler deploy` or connect to GitHub

### Runner-up: **Netlify**

1. Free with 300 credits/month, 100GB bandwidth
2. Official TanStack Start plugin
3. Commercial use allowed
4. Slightly more complex credit-based billing
5. Moderate cold starts on serverless functions

### Budget option: **Railway Hobby** ($5/month)

If you need a persistent Node.js server (e.g., WebSocket support for real-time bingo), Railway at $5/month gives you a full server with no cold starts, built-in databases, and auto-deployment from Git.

---

## Key Considerations

- **Vercel's Hobby plan is non-commercial only** — skip if you plan to monetize
- **Render's free tier spins down after 15 min inactivity** — not suitable for production
- **Fly.io has no permanent free tier** — trial only
- **Cloudflare's 10ms CPU limit per invocation** is generally sufficient for simple SSR pages but could be limiting for heavy server-side computation
- For **WebSocket support** (real-time multiplayer bingo), consider Railway ($5/mo) or Fly.io ($3-5/mo) since serverless platforms have limitations with persistent connections
- All platforms support **custom domains** and **HTTPS**
