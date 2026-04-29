# CLAUDE.md — How to operate in this repo

Claude Code auto-loads this file at the start of every session. These rules are binding for all future sessions.

## Read before you write
- At the start of any session, read `.claude/context.md` **before** responding.
- The files in `.claude/` are the source of truth. Conversation memory is not.

## Log every change, same turn
- Any decision made, feature added or cut, dependency swapped, pricing tweaked, research finding, or new assumption → update the relevant file **and** append a dated entry to `.claude/changelog.md` in the **same response**.
- Never defer doc updates to "later."
- Tiniest changes included. If it changed, it gets logged.

## Answer first, then update
- Give the user their answer first.
- Then update docs in the same turn. Don't make them wait.

## Where things belong
- Project state, market, positioning → `.claude/context.md`
- Brand, tone, naming → `.claude/brand.md`
- Reusable workflows → a new file in `.claude/skills/`
- Anything unclear → log in `.claude/changelog.md` and ask the user

## Create new files when they earn their place
- Don't pre-create `roadmap.md`, `decisions.md`, `competitors.md`, etc.
- Create them the moment they have real content — e.g., first architectural decision made → create `decisions.md`; Phase 1 build starts → create `roadmap.md`; deep competitor teardown written → create `competitors.md`.
- When a new file is created, register it in `changelog.md` with the date.

## API keys
- All keys in `.env` are **test keys with hard usage caps**.
- `.env` is tracked in the repo intentionally — no `.gitignore` entry.
- If a production key is ever introduced, **flag it immediately** to the user and log it in `changelog.md`.

## Docs style
- Bullet points. Short sentences. Factual.
- No marketing language.
- Mark uncertainty as `[TBD]` or `[assumption]`.

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"` to keep the graph current
