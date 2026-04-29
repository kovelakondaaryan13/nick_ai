# Changelog

Dated log of every change. Newest at top. Tiniest changes included.

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
