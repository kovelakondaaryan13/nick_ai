# Context — READ FIRST

## Project
- **Name:** Nick AI (internal working name)
- **What:** Mobile-first PWA where Nick DiGiovanni's AI clone guides home cooks through recipes, hands-free, in real time.
- **Phase:** Phase 12 complete · v1 alpha shipped
- **Founder:** Aryan Kovelakonda, Bengaluru
- **Status:** Internal alpha, no public deploys

## Tech stack
- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Supabase (Auth + Postgres + Storage + RLS)
- Qdrant Cloud (vector DB for memory + recipe search, 1536-dim cosine)
- OpenRouter + google/gemma-3-27b-it (chat — free, no limits)
- OpenAI GPT-4o (vision scan only), Whisper (STT), text-embedding-3-small (embeddings)
- ElevenLabs (voice clone TTS)
- Vercel AI SDK v6 (ai@6, @ai-sdk/openai@3, @ai-sdk/react@3)
- Zustand (client state)
- Vercel (hosting, private)

## What's built
- 40 routes, all building clean
- Full auth flow (email/password, Supabase)
- 4-step onboarding (taste, dietary, tools)
- Home with personalized hero carousel (Qdrant-powered) + browse categories
- Nick Chat with streaming, 3 tools, voice input (Whisper), memory layer (Qdrant)
- Fridge Scan (camera → GPT-4o Vision → ingredient editor → chat handoff)
- Recipe detail with parallax, servings scaler, ingredient checkboxes, swap items
- Cook mode: step navigation, auto-timers, TTS read-aloud, voice navigation (Web Speech Recognition), wake-lock
- Past Meals with history, ratings, stats, filters, cook again
- Surprise Me with dice animation, shake-to-reroll
- Profile (taste editor, dietary, tools, notifications, privacy, data export, account deletion)
- Shopping List (category-grouped, checkboxes, clipboard sync)
- Notifications inbox with daily AI suggestions cron
- ElevenLabs TTS with browser SpeechSynthesis fallback
- Offline mode: PWA service worker, pre-caching last 5 saved recipes
- PWA install prompt (Android + iOS)
- Error handling with toast notifications across all mutation flows
- Micro-interactions (button press, chip tap, view transitions)
- White/blue theme: #FFFFFF base, #2563EB accent, Playfair Display headings, consistent across all 41 routes

## Known issues / deferred
- `ELEVENLABS_VOICE_ID` set to custom Nick clone voice (`7FZFrYtZRrKLHTp9VJka`)
- PWA icons are SVG placeholders — need proper PNG icons designed
- No real Lighthouse audit run (requires deployed instance)
- View Transitions API only works in Chrome/Edge — no polyfill for Safari
- Vegetarian filter in browse page uses rough approximation
- No screen recording demo yet (requires running on real device)
- `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` still placeholder (push notifications not wired)

## What's next
- Deploy to Vercel (private)
- Set ELEVENLABS_VOICE_ID after voice clone audio prep
- Generate proper PNG PWA icons
- Run Lighthouse audit on deployed instance
- Internal testing with 5-20 users
- Phase 13 (from PRD): Vercel deploy, analytics, monitoring
