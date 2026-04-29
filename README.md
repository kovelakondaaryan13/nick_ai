# Nick AI

**Internal only — do not distribute.**

AI-powered cooking companion where Nick DiGiovanni's clone guides you through recipes, hands-free, in real time. Mobile-first PWA.

## Setup

```bash
git clone <repo-url>
cd nick-ai
npm install
# Copy .env from team — all keys are test keys with usage caps
npm run dev
```

## Docs

- Full product spec: `.claude/Nick_AI_PRD.md`
- Build sequence: `.claude/build_prompts.md`
- Project state: `.claude/context.md`
- Change log: `.claude/changelog.md`

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase (Auth + Postgres + Storage) · Qdrant Cloud · OpenAI GPT-4o · ElevenLabs · Zustand
