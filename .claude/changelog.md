# Changelog

Dated log of every change. Newest at top. Tiniest changes included.

## 2026-04-29
- **Updated ELEVENLABS_VOICE_ID** to custom Nick clone voice `7FZFrYtZRrKLHTp9VJka` (was Rachel default `21m00Tcm4TlvDq8ikWAM`).
- **3 critical runtime fixes:**
  1. `/api/chat` returning 400 — Zod schema expected `content: string` but AI SDK v6 `useChat` sends `content` as array of parts. Replaced strict Zod validation with flexible parsing that handles both string and array content formats.
  2. `/api/scan` fridge scan not returning structured ingredients — added `response_format: { type: "json_object" }` to GPT-4o call and moved ingredient detection instructions to system prompt. Guarantees clean JSON output instead of markdown-wrapped text.
  3. TTS not playing in cook mode — `ELEVENLABS_VOICE_ID` was placeholder `ADD_AFTER_PHASE_9_VOICE_CLONE`, which triggered the 503 fallback in `/api/tts`. Set to ElevenLabs default Rachel voice `21m00Tcm4TlvDq8ikWAM`.
  - 41 routes, build clean.
- **Reverted to white/blue theme** — full visual redesign replacing dark theme across 35+ files:
  - Colour system: bg #FFFFFF, cards #F8F9FA, elevated #F3F4F6, text #111111, secondary #6B7280, accent #2563EB (blue), border #E5E7EB, success #4CAF50 (green kept).
  - Foundation: globals.css CSS vars updated, layout.tsx bg-white + Toaster theme="light", themeColor #FFFFFF.
  - Components: bottom-nav (white bar, blue FAB/active), recipe-card (light cards, blue badge), pwa-install-prompt (white card, blue install), taste-editor (blue selected chips), sign-out-button (light borders).
  - Major pages: home, chat (white bg, blue user bubbles), cook mode (white bg, blue buttons/progress), recipe detail (white bg, from-white gradient, blue tabs/checkboxes), surprise (white bg, blue dice/buttons).
  - Secondary: profile (+ 6 sub-pages), past meals, shopping list, notifications, browse, cook done — all white/blue.
  - Auth: signin + signup (white bg, blue CTAs/links, light inputs).
  - Onboarding: welcome (blue avatar), taste, dietary (blue toggles), tools — all blue chips/CTAs.
  - Scan: kept black bg for camera, only changed accent #FF6B35→#2563EB. Review page fully light.
  - Loading skeletons (6): #F3F4F6 blocks, #E5E7EB borders.
  - manifest.json: theme_color and background_color → #FFFFFF.
  - Settings page: "Dark" → "Light".
  - Playfair Display headings kept.
- **Fixed "For You" hero carousel showing empty:**
  - `/api/recipes/hero` — added safety-net fallback with console.error logging when primary query returns empty.
  - Created `/api/recipes/random` — new endpoint returning 5 recent recipes as client-side fallback.
  - `home-client.tsx` — fetch now falls back to `/api/recipes/random` if hero returns empty or fails.
  - 41 routes (new /api/recipes/random), build clean.
- **Switched chat to OpenRouter (Gemma 3 27B):**
  - `/api/chat/route.ts` — replaced `@ai-sdk/openai` GPT-4o with OpenRouter `google/gemma-3-27b-it` (free, no limits) via `createOpenAI` with custom baseURL.
  - Added `OPENROUTER_API_KEY` to `.env` and `.env.example`.
  - Kept `OPENAI_API_KEY` for: fridge scan vision (GPT-4o), Whisper STT, embeddings (`text-embedding-3-small`).
  - `src/lib/openai.ts` unchanged — still uses OpenAI for embeddings.
  - `/api/scan`, `/api/transcribe` unchanged — still use OpenAI directly.
  - 40 routes, build clean.
- **Dark theme brand identity overhaul** — full visual redesign across every page:
  - Colour system: bg-primary #0F0F0F, bg-card #1A1A1A, bg-elevated #242424, text-primary #F5F0E8, text-secondary #9A9A8A, accent #FF6B35, success #4CAF50, border #2A2A2A.
  - Typography: Installed Playfair Display (via next/font/google, CSS variable `--font-playfair`) for headings, Inter for body.
  - Foundation: globals.css CSS custom properties, layout.tsx dark body + Playfair variable, Toaster theme="dark".
  - Core components: bottom-nav (dark bar, orange FAB), recipe-card (dark card, Playfair titles).
  - Major pages: home (dark bg, Playfair heading, orange scan CTA, dark browse cards), chat (dark bg, orange user bubbles, dark Nick cards), cook mode (orange progress/buttons, Playfair step headings, dark modals), recipe detail (gradient to #0F0F0F, dark glass buttons, orange tabs/checkboxes).
  - Secondary pages: past-meals, profile (+ all 6 sub-pages), shopping-list, notifications, surprise, scan, scan/review, cook done — all dark.
  - Auth pages: signin + signup — dark inputs, orange CTAs, orange links.
  - Onboarding: welcome (orange avatar, Playfair heading), taste, dietary, tools — all dark with orange selected chips/toggles/CTAs.
  - Components: pwa-install-prompt (dark card, orange install), taste-editor (dark chips/borders), sign-out-button (dark border).
  - Loading skeletons: all 6 updated to dark (#1A1A1A blocks, #2A2A2A borders).
  - manifest.json: theme_color and background_color updated to #0F0F0F.
  - 40 routes, build clean.
- **8 medium-priority fixes (accessibility, API consistency, loading states, security polish):**
  1. Added `aria-label` to ~36 icon-only buttons across 18 files (back, close, filter, settings, save, share, voice toggle, mic, send, camera, copy, add, star rating).
  2. Added `aria-pressed` to allergen toggle buttons in dietary page.
  3. Added `role="dialog"` + `aria-modal="true"` + `aria-labelledby` to privacy delete modal and cook mode exit modal.
  4. `/api/recipes/hero` — returns 401 instead of `{ recipes: [] }` when no user session.
  5. `/api/cron/daily-suggestions` — replaced simple string comparison with `crypto.timingSafeEqual` for bearer token auth.
  6. Added `loading.tsx` skeleton screens to: browse, recipe detail, past meals, shopping list, notifications, profile.
  7. Added SVG favicon (`public/favicon.svg`) + `<link rel="icon">` in layout.
  - 40 routes, build clean.
- **12 critical/high/config fixes applied pre-deploy:**
  1. `/api/transcribe` — added Supabase auth (401) + 10MB file size limit (413) + try/catch on Whisper call (502).
  2. `/api/tts` — added Supabase auth (401), removed in-memory char counter, added per-user daily limit (50k chars/day) via new `tts_usage` table with upsert on `(user_id, usage_date)`. Returns 429 with browser fallback when limit hit.
  3. `/api/me` DELETE — replaced 7 individual DELETE queries with `supabase.rpc("delete_user_data")` Postgres function running all deletes in one transaction. Created migration `0003_delete_user_rpc.sql`.
  4. `/api/scan` — added 10MB file size limit (413) + MIME type validation (only jpeg/png/webp, returns 415).
  5. `next.config.ts` — added `poweredByHeader: false` + security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
  6. `/api/chat` — added Zod validation on request body: messages array with role enum + content string (1-2000 chars). Returns 400 with structured errors.
  7. `/api/onboarding/complete` — added Zod validation: taste_fingerprint (8 known flavors, max 8), dietary_flags (strict boolean object), allergens (known list), kitchen_tools (known list). `.strict()` rejects unknown keys. Case-insensitive.
  8. `/api/cook/complete` — added Zod validation: recipe_id must be UUID, rating must be integer 1-5. Returns 400.
  9. `middleware.ts` — cached `onboarding_complete` status in httpOnly cookie (7-day TTL). Skips DB query when cookie present. Cookie set on onboarding complete (both skip and full paths).
  10. `useTTS.ts` — added useEffect cleanup: revokes all prefetched blob URLs, aborts in-flight fetch requests, stops playing audio on unmount. Added dedicated `prefetchAbortRef`.
  11. Created `.env.example` with all 10 keys (values redacted), comments explaining each key and where to get it.
  12. `tsconfig.json` — updated target from ES2017 to ES2020.
  - Created migration `0002_tts_usage.sql` — `tts_usage` table with RLS, unique constraint on `(user_id, usage_date)`.
  - 40 routes total, build clean.
- **v1.0-alpha release.** All 12 build phases complete. 40 routes, build clean.
- **Phase 12 complete:** Polish + bug bash.
  - Added error handling with toast notifications (sonner) to: shopping list (toggleCheck rollback + addItem), taste editor (save rollback), surprise page (fetch error), notifications (markRead), chat API (rate limit 429, Qdrant fallback to Postgres random).
  - Chat API: request body validation, embedding error returns friendly 429, Qdrant memory search fails gracefully (empty array), recipe search falls back to random Postgres query when Qdrant is down.
  - Added micro-interactions in `globals.css`: button press scale(0.97), chip tap scale(0.95), CSS View Transitions API (`@view-transition { navigation: auto }`) for page transitions.
  - Updated `README.md`: full project description, setup instructions, stack, phases table, not-in-v1 list.
  - Updated `.claude/context.md`: phase set to "Phase 12 complete · v1 alpha shipped", added known issues / deferred section.
  - 40 routes total, build clean.
- **Phase 11 complete:** Offline mode + PWA service worker.
  - Created `public/sw.js` — custom service worker with 4 caching strategies: NetworkFirst (3s timeout) for `/api/*`, CacheFirst for static assets/images/fonts, StaleWhileRevalidate for pages, NetworkOnly for `/api/chat`. Supports `CACHE_RECIPE` and `CACHE_TTS` message events for targeted pre-caching.
  - Created `public/manifest.json` — PWA manifest with name "Nick AI", standalone display, theme_color #1A1A1A, background_color #FAFAF7, SVG placeholder icons (chef hat, dark on white).
  - Created `public/icons/icon-192.svg` and `icon-512.svg` — placeholder chef hat icons.
  - Created `src/components/sw-register.tsx` — registers service worker on mount.
  - Created `src/components/offline-precache.tsx` — on main layout mount, fetches user's last 5 saved recipes and pre-caches their pages, hero images, step images, and TTS audio via service worker postMessage. Fire-and-forget with 5s delay.
  - Created `src/components/pwa-install-prompt.tsx` — install prompt after 3 sessions. Android Chrome: `beforeinstallprompt` event with Install/Not now buttons. iOS Safari: manual instructions (tap Share → Add to Home Screen). Dismissible, persisted to localStorage.
  - Created `src/hooks/useOnlineStatus.ts` — `navigator.onLine` + online/offline events + `/api/health` ping every 30s.
  - Created `src/app/api/health/route.ts` — simple `{status: "ok"}` endpoint for connectivity check.
  - Updated `src/app/layout.tsx` — added manifest link, apple-web-app meta, theme-color viewport, apple-touch-icon, SW register + offline precache + PWA install prompt components.
  - Updated `src/app/(main)/home-client.tsx` — offline banner (dashed border, WifiOff icon, retry chip), "Nick can't reach the kitchen" empty state with View saved + Try again CTAs when offline and no cached recipes.
  - Cook mode for saved recipes works offline (HTML + images + TTS audio pre-cached by SW). Non-cached recipes show SW 503 fallback.
  - Shopping list, past meals, profile: StaleWhileRevalidate caching shows stale-but-readable data offline.
  - 40 routes total, build clean.

## 2026-04-27
- **Phase 10 complete:** Voice navigation in cook mode (Web Speech Recognition).
  - Added Web Speech Recognition to `cook-mode-client.tsx` — feature-detected `SpeechRecognition` / `webkitSpeechRecognition`. Mic toggle button in header (off by default). When on, continuous listening with command matching.
  - Command vocabulary: "next"/"next step"/"go on"/"continue" → next step, "back"/"previous"/"go back" → previous step, "repeat"/"again"/"say again" → re-trigger TTS, "pause"/"stop timer" → pause timer, "resume"/"start timer" → resume timer, "exit"/"cancel"/"i'm done" → exit confirmation.
  - Anti-feedback loop: recognition pauses while TTS audio plays (via `isSpeakingRef`), auto-restarts 500ms after TTS ends.
  - Error handling: auto-restart on error after 2s delay, auto-restart on recognition end after 300ms.
  - Refactored `circular-timer.tsx` to use `forwardRef` + `useImperativeHandle` — exposes `pause()`, `resume()`, `isPaused()` methods via `CircularTimerHandle` interface for voice command control.
  - Visual indicators: pulsing red mic icon when listening, ping dot, muted mic state when TTS playing.
  - Preference persisted to `localStorage.cook_voice_nav_enabled`.
  - Help tooltip shown on first cook mode entry with speech recognition available: "Try saying 'next' or 'repeat' to navigate hands-free." Auto-dismisses after 5s, stored in `localStorage.cook_voice_nav_tip_seen`.
  - Graceful degradation: mic toggle hidden entirely on browsers without speech recognition support.
  - 39 routes total, build clean.
- **Phase 9 complete:** Nick voice clone infrastructure (ElevenLabs TTS).
  - Created `/api/tts` route — POST accepts `{text}`, streams audio/mpeg from ElevenLabs `eleven_turbo_v2_5` model. Returns 503 with `fallback: "browser"` when ELEVENLABS_VOICE_ID not configured. Tracks character count with console warning near free tier limit.
  - Created `src/hooks/useTTS.ts` — shared hook with `speak()`, `stop()`, `prefetch()`. Tries ElevenLabs first, falls back to browser SpeechSynthesis. Supports pre-fetching next step audio as blob URL for zero-latency playback.
  - Rewrote cook mode TTS: replaced raw `SpeechSynthesisUtterance` with `useTTS` hook. On step entry, speaks current step and prefetches next step audio. iOS Safari audio unlock on "Start cooking" tap (silent AudioContext buffer). Green pulse indicator when speaking.
  - Added chat voice toggle: Volume icon in chat header. When on, plays Nick voice (first 2 sentences) after each assistant response completes. Persisted to `localStorage.chat_voice_enabled`. Off by default.
  - Note: `ELEVENLABS_VOICE_ID` still placeholder — browser TTS active as fallback until voice clone audio prep is done.
  - Build required `NODE_OPTIONS=--max-old-space-size=512` due to tight disk space on machine.
  - 39 routes total, build clean.
- **Phase 8 complete:** Profile + Shopping List + Notifications.
  - Rewrote `/profile` page: 80px avatar, name + stats, "Edit profile" chip, interactive taste fingerprint editor (add/remove flavor chips with optimistic Supabase updates), 5 settings rows linking to sub-routes.
  - Created 6 profile sub-pages: `/profile/edit` (display name), `/profile/dietary` (vegetarian/gluten-free toggles + allergen chips), `/profile/tools` (15-item kitchen tool checklist), `/profile/notifications` (suggestions/reminders/system toggles → `notif_prefs` jsonb), `/profile/privacy` (data export JSON download + account deletion with confirm modal), `/profile/settings` (theme placeholder + sign out).
  - Created `/api/me/export` (GET) — returns all user data as JSON (profile, chat messages, cook sessions, fridge scans, shopping list, saved recipes).
  - Created `/api/me` (DELETE) — cascades deletion across all user tables.
  - Created `/shopping-list` page: category-grouped items (produce/protein/dairy/pantry/other) with checkbox toggle (optimistic + Supabase PATCH), per-section "Add item" input, copy-to-clipboard sync, filter chips, empty state.
  - Rewrote `/notifications` page: server-fetched notifications, filter chips (All/Nick/Reminders), notification cards with type icons + unread dot + time ago, tap-to-mark-read + navigate to recipe if body contains recipe_ids JSON.
  - Created `/api/cron/daily-suggestions` — iterates onboarded users, embeds taste fingerprint, queries Qdrant top 3 recipes, inserts suggestion notification. Protected by CRON_SECRET bearer token.
  - 38 routes total, build clean.
- **Phase 7 complete:** Past Meals + Surprise Me.
  - Replaced `/past-meals` placeholder with full page: server-fetched cook_sessions joined with recipes, stats strip (this week count, avg rating, reorders), recency grouping (Today/Yesterday/This Week/Earlier), cuisine + min-rating filter sheet, meal rows with thumbnail + rating stars + "Cook again" chip. Empty state preserved with "Ask Nick for an idea" CTA.
  - Created `/api/surprise` route — fetches all recipes, filters by dietary flags + allergens, picks random one via `Math.random()`, returns recipe + total count.
  - Created `/surprise` page — dice spin animation (700ms CSS), fade-in result card with hero image + meta tags + cuisine chip, "Re-roll" (dashed border) and "Cook this" (dark) CTAs, shake-to-reroll via DeviceMotionEvent (with iOS requestPermission pattern), magnitude threshold >25.
  - 27 routes total, build clean.
- **Phase 6 complete:** Fridge Scan flow.
  - Created `/scan` page — full-screen camera view with `getUserMedia`, environment/user facing mode toggle, capture-to-canvas-to-blob, retake/confirm flow, file upload fallback when camera permission denied.
  - Created `/api/scan` route — accepts image blob, sends to GPT-4o Vision with structured ingredient JSON prompt, parses response, saves to `fridge_scans` table with user_id + timestamp + ingredients.
  - Created `/scan/review` page — ingredient chips with confidence coloring (amber for low/medium), tap-to-remove, manual add input, "Ask Nick what to make" CTA (passes ingredient list to `/chat?prompt=`), "Scan again" secondary CTA.
  - Added camera button to chat composer bar → links to `/scan`.
  - Added "Scan your fridge" quick action card on home page (dashed border, camera icon).
  - Fridge state already integrated in chat pipeline — `buildSystemPrompt` includes latest fridge scan ingredients when available.
  - 24 routes total, build clean.
- **Phase 5 complete:** Nick Chat with memory layer + tool calling + voice input.
  - Created `/chat` page (standalone, no bottom nav) with: message bubbles (user dark, Nick white with avatar), suggested prompts strip, composer with mic + text + send, typing indicator (3-dot bounce), streaming token display via AI SDK v6 `useChat`, inline recipe card rendering from tool results.
  - Created `/api/transcribe` route — accepts audio blob, calls OpenAI Whisper, returns transcript for press-hold mic input.
  - Updated `/api/chat/route.ts` for AI SDK v6: `parameters` → `inputSchema`, removed `maxSteps` (replaced with `prepareStep`), `toDataStreamResponse()` → `toUIMessageStreamResponse()`.
  - Installed `@ai-sdk/react` (v3.0.170) — `useChat` moved to its own package in AI SDK v6.
  - Removed `(main)/chat` placeholder (route conflict with standalone `/chat`). Bottom nav FAB links directly to `/chat`.
  - Chat UI uses `message.parts` API (v6) instead of legacy `content` + `toolInvocations`. Tool results with recipes render as inline cards with "Cook this" links.
  - Wrapped chat page in Suspense boundary for `useSearchParams` (Next.js 16 requirement).
  - Nick prompt builder (`nick-prompt.ts`) + Qdrant memory pipeline + 3 tools (suggest_recipes, search_recipes, request_substitution) all wired.
- Added `Nick_AI_PRD.md` to `.claude/` — full Product Requirements Document for Nick AI v1 alpha. 757 lines covering product spec, 13 build phases, data model, tech stack, AI behavior, and success criteria.
- Added `build_prompts.md` to `.claude/` — companion build prompts for all 13 phases.
- **Phase 0 started:** Scaffolded Next.js 16 manually (create-next-app rejected folder name with spaces). Installed all deps. Created Supabase client/server utils, auth middleware, /signin, /signup, /auth/callback, protected home page, README. TypeScript compiles clean. Build blocked on empty Supabase keys in `.env`.
- Populated `.env` with all 7 required API keys for v1 alpha: Supabase (URL, anon, service_role), OpenAI, Qdrant (URL, key), ElevenLabs.
- Placeholders kept for: `ELEVENLABS_VOICE_ID` (Phase 9 deliverable), `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY` (Phase 8, generated locally).
- **Phase 0 complete:** Build passes, auth works with Supabase keys.
- **Phase 1 complete:** 8 tables + RLS + profile trigger created in Supabase. 31 Nick recipes seeded to Postgres + Qdrant recipes_v1 (embeddings via text-embedding-3-small). Both Qdrant collections (recipes_v1, user_memory) initialized. OpenAI + Qdrant client libs created.
- **Phase 2 complete:** 4-step onboarding flow (welcome → taste → dietary → tools). Zustand store for client state. API route saves profile + embeds taste fingerprint to Qdrant. Middleware redirects first-time users. Skip button works at any step.
- **Phase 3 complete:** Bottom nav with center FAB. Home page with time-of-day greeting, personalized hero carousel (Qdrant-powered), 2x2 category grid. Browse page with 6 categories + live counts + filtered recipe lists. Profile with taste fingerprint display + sign out. Placeholder pages for chat, past meals, notifications.
- **Phase 4 complete:** Recipe detail (/recipes/[id]) with hero parallax, servings scaler, ingredient checkboxes, add-to-shopping-list, swap-an-item link. Cook mode (/cook/[id]) with progress bar, step navigation, auto-timer detection, circular timer with chime, browser TTS placeholder, wake-lock, exit confirmation. Cook done page with 5-star rating → saves cook_sessions + Qdrant memory. 22 routes total, all building clean.

## 2026-04-23
- Installed graphify (`graphify claude install`): added `## graphify` section to `CLAUDE.md`, registered PreToolUse hook in `.claude/settings.json`.
- Ran first `/graphify .` pass. Outputs in `graphify-out/` (`graph.html`, `graph.json`, `GRAPH_REPORT.md`, `cost.json`, `manifest.json`). Graph built on `CLAUDE.md` only — 18 nodes, 20 edges, 4 communities. Changelog is the top cross-community bridge node.
- Attempted to populate `.claude/context.md` and `.claude/brand.md` with AI Chef product info. **Blocked: no established info exists** — all files are placeholders, no prior session context, no product docs in repo. Awaiting user input on: thesis, phase, priorities, tech stack, founder, brand positioning. [TBD]
