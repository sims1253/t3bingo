# Validation Dry Run Report

**Date:** 2026-04-07  
**Project:** t3ingo (greenfield)

---

## 1. Tool Availability Status

| Tool | Status | Version / Path |
|------|--------|----------------|
| Agent-Browser Skill | ✅ Available | Listed in `~/.factory/droids/` (accessible via Skill tool) |
| Playwright | ✅ Installed | v1.59.1 (via npx) |
| Bun | ✅ Installed | v1.3.4 (`/home/m0hawk/.bun/bin/bun`) |
| Node.js | ✅ Installed | v25.8.1 |
| npm / npx | ✅ Installed | v11.11.0 |
| Google Chrome | ✅ Installed | `/usr/bin/google-chrome` |
| Chromium (standalone) | ❌ Not in PATH | — |

**Verdict:** All core testing tools are available. Playwright + Chrome are ready for browser-based testing. Bun can run dev servers and test runners.

---

## 2. Machine Resources

| Metric | Value |
|--------|-------|
| **Total RAM** | 31 GiB |
| **Used RAM** | ~10 GiB |
| **Available RAM** | ~20 GiB |
| **Swap** | 8 GiB (unused) |
| **CPU Cores** | 24 |
| **Shared Mem** | 5.0 MiB (negligible) |

### Concurrency Calculation

- **Available headroom:** 20 GiB RAM
- **70% allocation for validation:** 20 × 0.70 = **14 GiB (14,336 MB)**
- **Dev server overhead:** ~200 MB → **Remaining: 14,136 MB**
- **Per agent-browser instance:** ~300 MB

| Limiting Factor | Calculation | Max Instances |
|-----------------|-------------|---------------|
| **RAM** | 14,136 MB ÷ 300 MB | **~47 instances** |
| **CPU** | 24 cores ÷ 3 cores/instance (conservative) | **~8 instances** |

**CPU is the bottleneck**, not RAM. Each browser instance is CPU-intensive; allocating ~3 cores per instance ensures smooth operation without contention.

### Recommended Max Concurrent Agent-Browser Validators

> **8 concurrent instances**

This leaves ~11.6 GiB RAM headroom (well within budget) and ~1 core spare for the dev server and system processes.

---

## 3. Environment Validation Readiness

### ✅ Can bun run dev servers?
Yes. Bun v1.3.4 is installed and can serve as both runtime and package manager. It supports `bun run dev` for typical frameworks (Next.js, Vite, Astro, etc.).

### ✅ Browser-based testing readiness
- Google Chrome is installed at `/usr/bin/google-chrome`
- Playwright v1.59.1 is available
- Agent-browser skill is accessible
- No missing dependencies identified

### ⚠️ Port Availability
Ports in the **3000–3100** range are **clear**. One unrelated port was found listening (54624), which is outside our range.

**Recommended dev server port:** `3000`

---

## 4. Blockers

**None identified.** The environment is fully ready for browser-based validation testing with agent-browser.

---

## 5. Summary

- All testing tools are installed and functional
- 24 CPU cores / 31 GiB RAM provides ample capacity
- **Recommended: up to 8 concurrent agent-browser instances**
- Dev server should bind to port 3000
- No blockers detected
