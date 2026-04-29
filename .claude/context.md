# Context — READ FIRST

## Project
- **Name:** Nick AI (internal working name)
- **What:** Mobile-first PWA where Nick DiGiovanni's AI clone guides home cooks through recipes, hands-free, in real time.
- **Phase:** Phase 0 — Foundations (in progress, blocked on Supabase keys)
- **Founder:** Aryan Kovelakonda, Bengaluru
- **Status:** Internal alpha, no public deploys

## Tech stack
- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Supabase (Auth + Postgres + Storage)
- Qdrant Cloud (vector DB for memory + recipe search)
- OpenAI GPT-4o (chat, vision, embeddings, whisper)
- ElevenLabs (voice clone TTS)
- Zustand (client state)
- Vercel (hosting, private)

## Current blockers
- `.env` Supabase keys needed: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## What's built
- Next.js scaffold with TypeScript + Tailwind v4
- Supabase client (browser) + server (cookie-based SSR) utilities
- Auth middleware protecting all routes except /signin, /signup, /auth/callback
- Sign in + Sign up pages (email/password)
- Auth callback route (email confirmation handler)
- Protected home page ("Hello, user email" + sign out)
- README.md

## What's next
- Fill Supabase keys → verify build + dev server
- Phase 1: Database schema, RLS, 30 recipe seed, Qdrant collections
