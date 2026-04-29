# Nick AI

A mobile-first PWA where a real food creator's AI clone — voice, personality, and recipes — guides home cooks through cooking, hands-free, in real time. The flagship persona is Nick DiGiovanni. Users open the app, chat with Nick, scan their fridge, pick a recipe, and cook it start-to-finish with voice navigation, auto-timers, and TTS read-aloud — without ever touching the screen.

> **Internal-only — do not distribute.** Nick's name, voice, and likeness do not leave the team until written consent is obtained.

## Setup

```bash
git clone https://github.com/kovelakondaaryan13/nick_ai.git
cd nick_ai
npm install
# Copy .env from team chat (contains Supabase, OpenAI, Qdrant, ElevenLabs keys)
npm run dev
```

Build requires `NODE_OPTIONS=--max-old-space-size=512` on constrained machines.

## Stack

- **Framework:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Auth + DB:** Supabase (Auth, Postgres, Storage, RLS)
- **Vector search:** Qdrant Cloud (recipe embeddings + user memory)
- **AI:** OpenAI GPT-4o (chat, vision), text-embedding-3-small, Whisper (transcription)
- **Voice:** ElevenLabs (TTS voice clone), Web Speech Recognition (voice nav)
- **Client state:** Zustand
- **AI SDK:** Vercel AI SDK v6 (`ai@6`, `@ai-sdk/openai@3`, `@ai-sdk/react@3`)
- **Hosting:** Vercel (private)

## Phases shipped

All 12 build phases complete. See [`.claude/build_prompts.md`](.claude/build_prompts.md) for the full prompt sequence.

| Phase | Feature |
|-------|---------|
| 0 | Next.js 16 scaffold, Supabase auth, middleware |
| 1 | Database schema, RLS, 31 recipe seed, Qdrant collections |
| 2 | 4-step onboarding (taste, dietary, tools) |
| 3 | Home (hero carousel, categories), Browse, Bottom nav |
| 4 | Recipe detail (parallax, scaler, checkboxes), Cook mode (timer, TTS, wake-lock) |
| 5 | Nick Chat (streaming, tools, voice input, memory) |
| 6 | Fridge Scan (camera, GPT-4o Vision, ingredient editor) |
| 7 | Past Meals (history, stats, filters), Surprise Me (dice, shake-to-reroll) |
| 8 | Profile (taste editor, dietary, tools, privacy, data export), Shopping List, Notifications, Daily suggestions cron |
| 9 | ElevenLabs TTS infrastructure, voice clone hook, chat voice toggle |
| 10 | Voice navigation in cook mode (Web Speech Recognition, hands-free commands) |
| 11 | Offline mode, PWA service worker, install prompt |
| 12 | Polish, error handling, micro-interactions, README |

## Docs

- Full product spec: `.claude/Nick_AI_PRD.md`
- Build sequence: `.claude/build_prompts.md`
- Project state: `.claude/context.md`
- Change log: `.claude/changelog.md`

## Not in v1

- Multiple chefs / chef selection
- Subscription / paywall
- Native iOS / Android (PWA only)
- Public marketing site
- Real fridge IoT integrations
- Social / sharing / community feed
- Macro / calorie tracking
- Live mid-cook voice Q&A
- Creator portal / analytics dashboard
