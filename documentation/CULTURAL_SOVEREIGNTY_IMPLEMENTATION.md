# Cultural Sovereignty & Localisation — Implementation Report

> **Date:** 2026-07-05 (updated — final version)
> **Scope:** Tikanga Māori principles, Māori Data Sovereignty, privacy compliance, and internationalisation
> **Related:** [`Māori Principles and Data Sovereignty.md`](./M%C4%81ori%20Principles%20and%20Data%20Sovereignty.md)

---

## Overview

This report documents the implementation of cultural sovereignty features
across the ForeXchange codebase. All changes are grounded in the four Tikanga
Māori principles (Pūkenga & Ōtakapopo, Whānaungatanga, Pāranga & KaTika,
Tapu & Noa) and the Māori Data Sovereignty framework (Te Mana Raraunga).

---

## Changes Delivered

### 1. Internationalisation (i18n) Framework — Māori Language Support

| File | Type | Description |
|------|------|-------------|
| `frontend/src/i18n/index.ts` | New | i18next initialisation with auto-detection (localStorage > navigator), fallback to English |
| `frontend/src/i18n/en.json` | New | Complete English dictionary (**228 keys**) covering all 10+ pages |
| `frontend/src/i18n/mi.json` | New | Te Reo Māori dictionary (228 keys); 219/228 are distinct translations |
| `frontend/package.json` | Updated | Added `react-i18next`, `i18next`, `i18next-browser-languagedetector` |
| `frontend/src/main.tsx` | Updated | `import "./i18n"` bootstraps i18n at app startup |

### 2. Language Switcher UI

| File | Type | Description |
|------|------|-------------|
| `frontend/src/components/Common/LanguageSwitcher.tsx` | New | Toggle buttons (EN / Māori) with active-state highlighting |
| `frontend/src/layout/AppHeader.tsx` | Updated | Primary dashboard header — LanguageSwitcher rendered in top-right |

**Coverage:** All dashboard pages use the same header with EN/Māori toggle.

### 3. Privacy Policy Page

| File | Type | Description |
|------|------|-------------|
| `frontend/src/routes/privacy.tsx` | New | `/privacy` route with 6 sections; supports EN/Māori toggle |
| `frontend/src/routeTree.gen.ts` | Updated | Registered `/privacy` in the typed route tree |

### 4. Registration — Privacy Consent & Data Notice

| File | Type | Description |
|------|------|-------------|
| `frontend/src/components/auth/SignUpForm.tsx` | Updated | "Privacy Policy" links to `/privacy`; data sovereignty notice below checkbox |
| `frontend/src/routes/signup.tsx` | Updated | Privacy policy link with data handling statement |

### 5. Dashboard — Kia Ora Greeting

| File | Type | Description |
|------|------|-------------|
| `frontend/src/pages/Dashboard/Home.tsx` | Updated | `t("greeting.user", { name })` greeting at top of content area |

### 6. User Name Synchronisation

| File | Type | Description |
|------|------|-------------|
| `frontend/src/hooks/useAuth.ts` | Updated | `user_name` synced to/from localStorage; cleared on logout |

### 7. Data Sovereignty API Endpoint

| File | Type | Description |
|------|------|-------------|
| `backend/app/api/routes/utils.py` | Updated | `GET /api/v1/utils/data-sovereignty/` |

Returns: principles, data categories, encryption, access control, compliance refs.

### 8. Full Page Translation Coverage

All route pages support EN/Māori switching:

| Route | Page | Translation Keys |
|-------|------|:----------------:|
| `/login` | Log In | `login.*` |
| `/signup` | Sign Up | `signup.*` |
| `/` | Dashboard | `dashboard.*` |
| `/rates` | Live Rates | `rates.*` |
| `/remittance` | New Remittance | `remittance.*` |
| `/history` | Transaction History | `history.*` + `recentTransactions.*` |
| `/compliance` | Compliance Audit | `compliance.*` |
| `/settings` | User Settings | `settings.*` + `userInfo.*` + `changePwd.*` + `deleteAccount.*` |
| `/recover-password` | Password Recovery | `recoverPassword.*` |
| `/reset-password` | Reset Password | `resetPassword.*` |
| `/privacy` | Privacy Policy | `privacy.*` |

### 9. Sidebar & Navigation

| File | Type | Description |
|------|------|-------------|
| `frontend/src/layout/AppSidebar.tsx` | Updated | Nav items and section headers use `t()` |

### 10. Dark Mode Colour Fixes

| File | Type | Description |
|------|------|-------------|
| `frontend/src/index.css` | Updated | Added CSS utilities with `dark:` variants |
| `frontend/src/layout/AppSidebar.tsx` | Updated | Sidebar text `dark:text-gray-200` |
| `frontend/src/routes/_layout/compliance.tsx` | Updated | Replaced `text-muted-foreground` |
| `frontend/src/components/UserSettings/*.tsx` | Updated | All form labels + values in dark mode |

### 11. Notification Dropdown

| File | Type | Description |
|------|------|-------------|
| `frontend/src/components/header/NotificationDropdown.tsx` | Updated | Title, action text, timestamps, "View All" — all use `t()` |

### 12. Community Feedback — README

| File | Type | Description |
|------|------|-------------|
| `README.md` | Updated | Community feedback invitation + Māori principles table |

---

## Files Changed — Summary

| Category | Files Created | Files Modified |
|----------|:------------:|:--------------:|
| i18n infrastructure | 3 | 2 |
| Language switcher | 1 | 2 |
| Privacy page | 1 | 1 |
| Registration consent | 0 | 2 |
| Dashboard + user sync | 0 | 2 |
| Data sovereignty API | 0 | 1 |
| Route tree | 0 | 1 |
| All route pages (10 files) | 0 | 10 |
| Sidebar + CSS | 0 | 2 |
| User settings (3 components) | 0 | 3 |
| Notification dropdown | 0 | 1 |
| README | 0 | 1 |
| **Total** | **5** | **28** |

---

## Build Verification

```text
vite v7.3.5 building client environment for production...
✓ 2260 modules transformed.
✓ built in 3.7s (latest build — zero TypeScript errors)
```
