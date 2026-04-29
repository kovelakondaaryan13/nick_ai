# Nick AI — Build Prompts

**Companion to `docs/Nick_AI_PRD.md`**
Version 1.0 · April 2026

This file contains every prompt you'll paste into Claude Code to build Nick AI v1, in order. One section per phase. Phases are sequential — don't start Phase N+1 until Phase N's "Definition of done" passes.

---

## How to use this file

1. Open this file (`docs/build_prompts.md`) alongside Claude Code in your IDE.
2. For each phase: copy the entire prompt block (from `### Prompt` to the next `---`), paste into Claude Code, hit enter.
3. Claude Code will read `CLAUDE.md` + `.claude/context.md` + the relevant PRD section first, then build.
4. After each significant change, Claude Code shows a diff and a 2-line explanation. Read each one. Don't auto-approve.
5. When the phase is done, run the **Definition of done** checks yourself before moving to the next phase.
6. After every phase: commit, push, update `.claude/changelog.md`, update `.claude/context.md`'s "Phase" line.

### Universal rules to remind Claude Code in any phase

If Claude Code gets confused mid-phase, paste this:

> Stop. Re-read `CLAUDE.md`, `.claude/context.md`, and the relevant phase section in `docs/Nick_AI_PRD.md`. Then summarize: (a) what you've shipped so far in this phase, (b) what's still to do, (c) any deviation from the spec. Don't write code until I confirm.

### Universal end-of-phase prompt

After every phase, paste this before moving on:

> Phase complete. Now: (1) run through the Definition of done checks for this phase from `docs/Nick_AI_PRD.md` and tell me which pass and which don't. (2) Append a dated entry to `.claude/changelog.md` with: what shipped, what was deferred, any decisions made. (3) Update `.claude/context.md` — change the "Phase" line to reflect the new state. (4) Stage all changes for commit with a clear message starting with `feat(phaseN):`. Don't commit yet — show me the staged diff first.

---

## Phase -1 — Prerequisites (do this once, before Phase 0)

You confirmed `.env` is not yet populated and Qdrant account exists but cluster status is unclear. Get all 7 keys in `.env` before starting Phase 0.

### Steps (do these manually, not via Claude Code)

1. **Supabase URL + anon key + service role key**
   - Go to your Supabase project dashboard → Settings → API.
   - Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`.
   - Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Copy `service_role` key (under "Project API keys") → `SUPABASE_SERVICE_ROLE_KEY`. Keep this server-side only.

2. **OpenAI key**
   - Go to platform.openai.com → API Keys → create or copy.
   - Verify $5+ credit on Billing page.
   - Set a usage limit at $25/month under Settings → Limits.
   - Copy → `OPENAI_API_KEY`.

3. **ElevenLabs key**
   - elevenlabs.io → Profile → API Key.
   - Copy → `ELEVENLABS_API_KEY`.
   - You'll add `ELEVENLABS_VOICE_ID` later, in Phase 9, after creating Nick's clone.

4. **Qdrant Cloud cluster**
   - Go to cloud.qdrant.io.
   - If no cluster exists: click "Create" → free tier (1GB) → name it `nick-ai`.
   - Copy the cluster URL (something like `https://xyz.cloud.qdrant.io:6333`) → `QDRANT_URL`.
   - Click "API keys" in the cluster → create one → `QDRANT_API_KEY`.

### Final `.env` contents

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-proj-...
ELEVENLABS_API_KEY=...
QDRANT_URL=https://xxxxx.cloud.qdrant.io:6333
QDRANT_API_KEY=...
```

When all 7 are in `.env`, you're ready for Phase 0.

> **Reminder:** `.env` is intentionally tracked in this repo because all keys are test keys with usage caps. Per `CLAUDE.md`. If a production key is ever introduced, flag it and revisit `.gitignore`.

---

## Phase 0 — Foundations

**Goal:** Functional Next.js app on localhost, connected to Supabase, with auth working. "Hello, signed in user" page displays.
**Estimate:** 1.5–2 hours.

### Prompt

```
Read CLAUDE.md, .claude/context.md, and the "Phase 0 — Foundations" 
section of docs/Nick_AI_PRD.md. Then build Phase 0.

Confirm before writing code: that .env has all 7 keys filled in 
(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, 
SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, ELEVENLABS_API_KEY, 
QDRANT_URL, QDRANT_API_KEY). If any are missing, stop and tell me 
which.

Build sequence:

1. Scaffold Next.js in the CURRENT folder (don't create a new 
   subdirectory). Use: npx create-next-app@latest . with 
   TypeScript, Tailwind, App Router, src/, ESLint, default import 
   alias yes. The folder is the existing NICK AI project root. 
   Don't overwrite CLAUDE.md, .env, .claude/, docs/, or graphify-out/.

2. After scaffold, install: 
   @supabase/supabase-js @supabase/ssr openai @qdrant/js-client-rest 
   zustand lucide-react sonner embla-carousel-react

3. Create src/lib/supabase/client.ts (browser client) and 
   src/lib/supabase/server.ts (server client using @supabase/ssr 
   cookie-based pattern).

4. Create src/middleware.ts that protects all routes except 
   /signin, /signup, and /auth/callback. Unauthenticated users 
   get redirected to /signin.

5. Create routes:
   - /signin (email + password form, sign-in button, link to /signup)
   - /signup (email + password form, sign-up button, link to /signin)
   - /auth/callback (Supabase email confirmation handler)
   - / (protected; shows "Hello, [user.email]" + sign-out button)

6. Style: mobile-first Tailwind, 375px base viewport. Don't go heavy 
   on design yet — clean and minimal. Black text on white, dark fill 
   buttons, generous spacing. Reserve real design system for Phase 3.

7. Update tailwind.config.ts: extend theme with a "nick" color 
   palette placeholder we'll fill in Phase 3.

8. Add a brief README.md at root: project name, internal-only 
   warning, "see docs/Nick_AI_PRD.md for full spec," "see 
   docs/build_prompts.md for build sequence."

After each significant change, show me the diff and explain in 
2 lines what changed and why.

When done, before I run the Definition of done checks, do this:
- Run npm run dev and confirm it starts cleanly
- Run npm run build and confirm no TypeScript errors  
- Print a tree of src/ at depth 3

Definition of done (I'll verify):
- npm run dev → localhost:3000 → redirects to /signin if not logged in
- Sign up with email/password → email confirmation → redirects to /
- / shows "Hello, [user email]" + sign-out button
- Sign-out works, returns to /signin
- All keys in .env. None exposed in client bundle (verify by 
  searching .next/static/ for "sk-" or "service_role")
- README.md and updated tailwind config committed
```

### After Phase 0

Run the universal end-of-phase prompt (top of this file). Then commit with `feat(phase0): scaffold Next.js with Supabase auth`.

---

## Phase 1 — Database schema & seed

**Goal:** All Supabase tables created with RLS policies. 30+ Nick recipes seeded. Qdrant collections initialized. Recipe vectors loaded.
**Estimate:** 2–3 hours.
**Dependencies:** Phase 0 complete.

### Prompt

```
Read CLAUDE.md, .claude/context.md, and the "Phase 1 — Database 
schema & seed" section of docs/Nick_AI_PRD.md. Also re-read 
section 10 (Data model) of the PRD for the table specs. Then 
build Phase 1.

This phase has 3 parts: (a) Postgres schema + RLS, (b) recipe 
seed data, (c) Qdrant collections + recipe embeddings.

Build sequence:

1. Create supabase/migrations/0001_initial_schema.sql containing 
   all 8 tables per PRD section 10. Use UUID primary keys. Include:
   - profiles (with FK to auth.users on user_id, ON DELETE CASCADE)
   - recipes (id uuid, all metadata, jsonb for ingredients and steps)
   - chat_messages
   - cook_sessions
   - fridge_scans
   - shopping_list_items
   - notifications
   - saved_recipes (composite PK user_id + recipe_id)

2. In the same migration, add RLS policies:
   - Every user-data table: enable RLS, policy "users can only 
     access their own rows" (user_id = auth.uid()) for all 
     SELECT/INSERT/UPDATE/DELETE
   - recipes table: enable RLS, SELECT allowed for all 
     authenticated users (read-only library), INSERT/UPDATE/DELETE 
     for service role only

3. In the same migration, add a trigger on auth.users INSERT that 
   creates a default profiles row.

4. I'll run this migration manually in Supabase dashboard SQL 
   editor. Print it for me.

5. Create supabase/seed/recipes.json with 30 Nick DiGiovanni 
   recipes. Use real recipes from his YouTube as inspiration — 
   smashburger, salmon teriyaki bowl, garlic butter steak, 
   chocolate chip cookies, crispy chicken, the world's best grilled 
   cheese, etc. Each recipe must include:
   - title, slug (kebab-case), description (2 sentences), 
     hero_image_url (use a Unsplash food photo URL placeholder for 
     each — find appropriate ones), time_minutes, kcal, 
     base_servings (default 2), difficulty (easy|medium|hard), 
     cuisine, tags (array — e.g. ["spicy","umami","comfort"]), 
     categories (array — must use ONLY these values: ["healthy","snacks","gourmet","random"]), 
     ingredients (array of {name, quantity, unit, optional}), 
     steps (array of {title, body, image_url, timer_seconds}), 
     notes
   - Make sure tags align with the 8 onboarding flavors when 
     applicable: spicy, sweet, umami, bitter, sour, smoky, herby, 
     rich
   - Distribute categories: ~10 healthy, ~7 snacks, ~7 gourmet, 
     ~6 anything (will surface in random)
   - Steps: 4–7 per recipe. Always include timer_seconds where the 
     step involves cooking (sear, simmer, bake). Set to null for 
     prep steps.

6. Create scripts/seed.ts (run with tsx) that:
   - Loads recipes.json
   - Inserts each into Supabase recipes table (use service role 
     client, not anon)
   - Creates Qdrant collection "recipes_v1" with vector size 1536, 
     distance Cosine, if not exists
   - Embeds (title + description + " " + tags.join(" ") + " " + 
     ingredients.map(i => i.name).join(" ")) using OpenAI 
     text-embedding-3-small for each recipe
   - Upserts to Qdrant with point id = recipe uuid, vector = 
     embedding, payload = {recipe_id, title, cuisine, tags, 
     categories, time_minutes, dietary_flags (derive from tags + 
     ingredients — e.g. has_meat: true if any ingredient.name 
     matches /chicken|beef|pork|salmon|prawn|lamb/i)}
   - Logs progress per recipe

7. Create scripts/init_qdrant.ts that creates both Qdrant 
   collections (recipes_v1 + user_memory) idempotently. Run this 
   once before seed.

8. Add npm scripts to package.json:
   - "qdrant:init": "tsx scripts/init_qdrant.ts"
   - "seed": "tsx scripts/seed.ts"

9. Create src/lib/qdrant.ts with a typed client (server-side only) 
   exporting: qdrant client instance, COLLECTIONS = {RECIPES, 
   MEMORY}, helper functions upsertRecipe(), searchRecipes(), 
   upsertMemory(), searchMemory().

10. Create src/lib/openai.ts with a typed OpenAI client (server-side 
    only) and a helper embed(text: string): Promise<number[]>.

After printing the SQL migration, wait for me to confirm I've run it 
in Supabase dashboard before doing the seed step.

After seed completes, verify:
- 30 rows in recipes table (SELECT count(*) FROM recipes)
- 30 points in Qdrant recipes_v1 collection (use Qdrant client 
  count endpoint)
- Print a sample of one recipe's payload from Qdrant to confirm 
  structure

Definition of done (I'll verify):
- 8 tables exist in Supabase with correct schemas
- RLS verified by attempting cross-user reads (should fail)
- 30 recipes loaded, all with hero_image_url, ingredients, steps, 
  tags, categories
- 30 vectors in Qdrant recipes_v1 with correct payload schema
- Sign up new user → profile row auto-created (test the trigger)
- Both npm scripts work (seed is idempotent — running it twice 
  doesn't duplicate data)
```

### After Phase 1

Run end-of-phase prompt. Commit `feat(phase1): schema, RLS, 30 recipe seed, qdrant collections`.

---

## Phase 2 — Onboarding flow

**Goal:** First-time users complete the 4-step onboarding. Taste fingerprint and dietary data persist to profile.
**Estimate:** 2 hours.
**Dependencies:** Phase 1 complete.

### Prompt

```
Read CLAUDE.md, .claude/context.md, and section "7.1 Onboarding 
(4 steps)" + the "Phase 2 — Onboarding flow" build phase in 
docs/Nick_AI_PRD.md. Then build Phase 2.

Build sequence:

1. Create middleware logic: after sign-in, check profile. If 
   taste_fingerprint is null/empty AND profile.onboarding_complete 
   is false → redirect to /onboarding/welcome. (Add an 
   onboarding_complete boolean column to profiles via a new 
   migration if not present — supabase/migrations/0002_onboarding.sql.)

2. Create shared layout src/app/onboarding/layout.tsx:
   - Mobile-first 375px-wide centered container
   - Top: progress dots (4 dots, current filled), Skip button 
     top-right
   - Bottom: persistent CTA area
   - Black-on-white minimal, mirroring wireframe screen 01

3. Create routes:
   - /onboarding/welcome — "Hi, I'm Nick. Let me learn about you 
     so I can cook for you." Single primary CTA "Let's go" → next.
   - /onboarding/taste — "What flavours do you lean toward?" 
     8 chips: Spicy, Sweet, Umami, Bitter, Sour, Smoky, Herby, 
     Rich. Single-tap toggle. Pick 3+ subtitle. CTA "Continue" 
     enabled at ≥1, but show subtle prompt below "pick 3 or more 
     for better recommendations" if only 1–2 selected.
   - /onboarding/dietary — Vegetarian toggle, Gluten-free toggle, 
     Allergens multi-select (peanuts, shellfish, dairy, eggs, 
     soy, tree nuts).
   - /onboarding/tools — Checklist of common kitchen tools 
     (stovetop, oven, microwave, blender, food processor, instant 
     pot, cast iron pan, air fryer, stand mixer, immersion 
     blender). All optional.

4. Use Zustand or React Context to hold onboarding state 
   client-side across the 4 steps. Don't write to DB until final 
   step.

5. Final step CTA "Finish" → POST to /api/onboarding/complete:
   - Updates profiles row: taste_fingerprint, dietary_flags 
     (jsonb {vegetarian, gluten_free}), allergens (text[]), 
     kitchen_tools (text[]), onboarding_complete = true
   - Embeds (taste_fingerprint.join(" ") + " " + 
     allergens.join(" ")) → upserts to Qdrant user_memory with 
     memory_type='fingerprint', payload includes user_id and 
     created_at
   - Returns success → client redirects to /

6. Skip button on any step: marks onboarding_complete=true with 
   defaults (empty taste, no dietary, no tools), no fingerprint 
   embedding written. Routes to /.

7. Style: chip toggles match wireframe (filled = selected, 
   outlined = unselected). Use Tailwind only. Lucide icons for 
   tools where appropriate.

After each step page, show me the diff and confirm the route 
works in dev.

Definition of done (I'll verify):
- New user signs up → completes onboarding → lands on / 
  (hello world page from Phase 0)
- Profile in Supabase has all 4 fields populated correctly
- Qdrant user_memory has 1 point for the new user with 
  memory_type='fingerprint'
- Returning user (onboarding_complete=true) skips onboarding, 
  goes straight to /
- Skip button works at any step, marks complete with defaults
```

### After Phase 2

Run end-of-phase prompt. Commit `feat(phase2): 4-step onboarding with taste fingerprint`.

---

## Phase 3 — Home + Browse + bottom nav shell

**Goal:** User lands on Home, sees personalized hero carousel, category grid, working bottom nav. Browse and category-filter screens functional.
**Estimate:** 3–4 hours.
**Dependencies:** Phase 2 complete.

### Prompt

```
Read CLAUDE.md, .claude/context.md, sections 7.2 (Home) and 7.9 
(Browse) of docs/Nick_AI_PRD.md, plus the "Phase 3" build section. 
Then build Phase 3.

Before code: design tokens. Create src/lib/design.ts (or extend 
tailwind.config.ts) with the following palette inspired by the 
wireframe deck. Light, mobile-first, food-forward:
- bg.primary: #FAFAF7 (off-white)
- bg.elevated: #FFFFFF
- text.primary: #111111
- text.secondary: #6B6B6B  
- text.tertiary: #A0A0A0
- accent.fab: #1A1A1A (dark fill for Nick chat FAB)
- accent.fab-fg: #FFFFFF
- border.subtle: #ECECEC
- border.dashed: #D0D0D0
- chip.selected: #1A1A1A
- chip.selected-fg: #FFFFFF
- chip.unselected-bg: transparent
- chip.unselected-border: #D0D0D0
Typography: Inter for body, weights 400/500/600/700.

Build sequence:

1. Bottom nav component src/components/bottom-nav.tsx:
   - 5 tabs in this order: Home (house icon), Past Meals (clock), 
     Nick Chat (CENTER, elevated FAB — 56px circle, dark fill, 
     ChefHat icon), Browse (grid icon), Profile (user icon)
   - Center FAB extends above the nav bar, slight shadow
   - Tabs route to: /, /past-meals, /chat, /browse, /profile
   - Active tab: filled icon. Inactive: outline.
   - Use lucide-react icons.
   - Persistent across all main screens (use a layout group).

2. Persistent layout src/app/(main)/layout.tsx that wraps all 
   tabbed screens. Bottom nav rendered here. Routes /chat, /cook, 
   /scan, /onboarding live OUTSIDE this layout (full screen).

3. Move the Phase 0 hello-world / route INSIDE (main) and replace 
   with the real Home page:
   - Header: "AI Chef" wordmark left (link href="/"), bell icon 
     top-right (link href="/notifications", placeholder for now). 
     Show a small dot if there are unread notifications (query 
     count from notifications table where read=false).
   - Greeting: "GOOD MORNING/AFTERNOON/EVENING · pick tonight's 
     plate" — small caps, text.tertiary. Branch on local hour: 
     <12 morning, 12–17 afternoon, ≥17 evening.
   - Section "For You" with hero carousel (~40% screen height, 
     Embla carousel). Each card: hero_image_url as bg, dish title 
     bottom-left, meta line below ("30 min · high protein"). 
     3-dot pagination below carousel, active dot 24px wide, 
     others 6px.
   - Section "Browse" with 2x2 category grid: Healthy (leaf icon, 
     subtitle "nutrient-dense"), Snacks (bag icon, "quick bites"), 
     Gourmet (chef hat, "elevated"), Random (grid icon, 
     "surprise me"). Each tile: 1:1 aspect, soft fill, icon top-left, 
     name middle-left, subtitle below name. Each tile is a Link.

4. Personalized hero ranking — server component or server action:
   - Fetch user profile (taste_fingerprint, dietary_flags, allergens)
   - Compute hero candidates: query Qdrant recipes_v1 with the 
     fingerprint embedding (re-embed taste_fingerprint.join(" ") 
     each request OR fetch from user_memory; for v1, re-embed is 
     simpler), top 10 results
   - Filter: drop recipes where dietary_flags conflict 
     (vegetarian user → drop has_meat; allergen overlap → drop)
   - Take top 5
   - If user has empty fingerprint (skipped onboarding): random 
     5 recipes ordered by created_at desc
   - Pass to client component as props

5. Routes:
   - /browse — full grid: 6 tiles in 2 columns: Healthy, Snacks, 
     Gourmet, Vegetarian, Quick (<30 min), Random. Each shows 
     live count under name (SELECT count(*) FROM recipes WHERE 
     [filter]). Search action top-right (icon button, routes to 
     /browse/search — placeholder for Phase 5/8 enhancement).
   - /browse?category=X — filtered list of recipes in that 
     category. Recipe rows: thumbnail, name, time, difficulty.
   - /chat — placeholder ("coming in Phase 5")
   - /past-meals — placeholder ("coming in Phase 7")
   - /profile — placeholder ("coming in Phase 8")
   - /notifications — placeholder ("coming in Phase 8")

6. Recipe card component src/components/recipe-card.tsx for use in 
   carousel and lists. Two variants: "hero" (large, full image) 
   and "row" (small, horizontal layout).

7. Mobile responsiveness: lock max-width to 480px on viewports 
   wider than that, center the app. Body bg outside the app 
   container = bg.primary so it looks intentional on desktop.

After building, run npm run dev. Walk me through clicking through 
home → category tile → browse list → and back. Show me the diff 
of the most important files (home page, bottom-nav, layout).

Definition of done:
- Home loads with personalized hero carousel based on taste 
  fingerprint
- All 4 home tiles route correctly to /browse?category=X
- /browse shows all 6 categories with live counts
- /browse?category=healthy lists only healthy recipes
- Bottom nav navigates between all 5 tabs (placeholders OK for 3 of them)
- Greeting changes based on local time
- Notification dot shows when unread > 0 (manually insert a row 
  to test)
- Layout is locked to 480px wide max on desktop, scrolls cleanly 
  on iPhone Safari at 375px
```

### After Phase 3

Run end-of-phase prompt. Commit `feat(phase3): home, browse, bottom nav with personalized hero`.

---

## Phase 4 — Recipe Detail + Cook Mode (no voice)

**Goal:** User can tap a recipe, view full detail, scale servings, toggle ingredient checkboxes, and enter Cook Mode. Cook mode steps through visually with timers.
**Estimate:** 4–5 hours.
**Dependencies:** Phase 3 complete.

### Prompt

```
Read CLAUDE.md, .claude/context.md, sections 7.6 (Recipe detail) 
and 7.7 (Cook Mode) of docs/Nick_AI_PRD.md, plus the "Phase 4" 
build section. Then build Phase 4.

This phase is the core flow. Don't skim.

Build sequence:

PART A — Recipe Detail (/recipes/[id])

1. Server component fetches recipe by id from Supabase. 404 if not 
   found. Hero image fills top 200px with parallax on scroll-up 
   (use a small client component for the parallax — translateY 
   based on scrollY).

2. Top-right floating buttons over hero: Heart (toggle 
   saved_recipes row, optimistic UI), Share (call navigator.share 
   with title + URL, fallback to copy-link toast).

3. Title + subtitle ("recommended by Nick · matches: spicy, umami" 
   — derive matches from intersection of recipe.tags ∩ 
   user.taste_fingerprint).

4. Three meta cards horizontal: Time (X min), Energy (X kcal), 
   Servings (X servings). Tap servings card → opens stepper modal 
   (1-12 serves). On change, recompute all ingredient quantities 
   client-side: scaledQty = baseQty * (newServings / 
   recipe.base_servings). Round to 1 decimal, special-case 
   integers.

5. Three swipeable tabs (Ingredients, Steps, Notes). Use a simple 
   tab component, swipe via Embla or basic touch handlers.

6. Ingredients tab: each ingredient row has a checkbox 
   ("I have it"), name, quantity right-aligned. Checkbox toggle = 
   strikethrough name + lighter text. Persist checked state in 
   client state only (not DB) — resets on page reload.

7. Below ingredient list: two dashed-border buttons:
   - "Add missing to list" → POST unchecked items to 
     /api/shopping-list/add (creates shopping_list_items rows, 
     dedupe by name+user). Toast success.
   - "Swap an item" → opens a single-select sheet of current 
     ingredients → tap one → routes to /chat?prompt=What can I 
     use instead of [ingredient] in [recipe.title]? (Phase 5 
     handles the actual chat).

8. Steps tab: numbered list of steps. Each step shows step_image 
   thumbnail (if any), title, body. No interaction yet — read-only 
   preview.

9. Notes tab: notes text rendered as markdown.

10. Bottom CTA bar (sticky): bookmark icon left (Heart, secondary), 
    "Start cooking" primary button right (full width minus 
    bookmark). CTA routes to /cook/[id].

PART B — Cook Mode (/cook/[id])

11. Full-screen layout, NO bottom nav. X close top-left.

12. State: currentStep (0-indexed), wakeLockSentinel ref, 
    activeTimers map.

13. On mount:
    - Request screen wake-lock: navigator.wakeLock.request('screen'). 
      Store sentinel. Re-request on visibilitychange if released.
    - Show "Tap to start" overlay covering screen until user 
      taps once. This unlocks audio context (iOS Safari 
      requirement, important for Phase 9 even though no audio 
      yet — establish the pattern now).

14. Segmented progress bar at top: one bar segment per step. 
    Current segment filled, completed segments filled darker, 
    upcoming outlined.

15. Step content area:
    - Small caps label: "STEP X OF Y · RECIPE TITLE"
    - Step title (large, bold, 24px)
    - Step hero image (if step.image_url, else use recipe hero)
    - Step body text (18px, generous line height)

16. Auto-detect timer per step:
    - Parse step.body with regex: 
      /(\d+)\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?)/i
    - If found, also use step.timer_seconds from DB if set 
      (DB takes precedence)
    - Render circular timer on right side: 
      <CircularTimer durationSec={N} label="X-min sear" 
      autoStart={true} onComplete={chime} />
    - Timer auto-starts on step entry, can pause/resume by tap
    - On timer complete: play Web Audio API chime (simple 
      sine oscillator beep, 880Hz, 200ms × 3)

17. CircularTimer component: SVG ring, countdown text in middle 
    (M:SS format), pause/resume on tap.

18. Bottom nav for cook mode:
    - Back arrow (left) → previous step (disabled on step 0)
    - "Next step" primary CTA (right, large) → next step. On 
      final step text changes to "Finish."
    - Repeat icon (small, beside back) → re-trigger TTS 
      (placeholder browser TTS for now).

19. TTS placeholder using browser's SpeechSynthesisUtterance:
    - On step entry, speak step.title + ". " + step.body
    - Volume icon top-right toggles voice on/off, persist in 
      localStorage as cook_voice_enabled
    - Cancel any in-progress speech when step changes

20. X exit: confirmation modal "Exit cook mode? Your progress 
    will be saved." → on confirm, write a partial cook_sessions 
    row (started_at, current_step, completed_at=null) and route 
    back to /recipes/[id].

21. On final step, "Finish" button → /cook/[id]/done page:
    - "Nice work!" header
    - 5-star rating prompt (large stars, tap to rate)
    - "Save to Past Meals" primary CTA → POST to 
      /api/cook/complete with rating → writes cook_sessions row 
      with completed_at, current_step=N, rating → also embeds 
      ("Cooked " + recipe.title + " · rated " + rating + " stars") 
      and upserts to Qdrant user_memory with memory_type='meal'
    - On success: route to /past-meals (placeholder still, but 
      the row will be there for Phase 7)

22. Release wake-lock and cancel speech synthesis on cook mode 
    unmount.

After building, walk me through cooking one recipe end-to-end on 
both desktop (Chrome) and mobile (iOS Safari if accessible). Show 
me the diff of the cook page and CircularTimer component.

Definition of done:
- Recipe detail loads with all metadata, image parallax works
- Servings scaling: change from 2 to 4 → all quantities double
- Save (heart) toggles persist after reload
- Share opens native share sheet on mobile, copies to clipboard 
  on desktop with toast
- "Add missing to list" creates shopping_list_items rows
- "Swap an item" routes to /chat with prefilled prompt 
  (Phase 5 will receive)
- Cook mode: enter, tap to start, screen doesn't sleep for at 
  least 60s of idle (verify wake-lock)
- Step navigation: Next, Back, Repeat all work
- Auto-timer: a step that says "simmer for 4 minutes" shows a 
  4:00 circular timer that auto-starts and chimes at zero
- Browser TTS reads each step (will be replaced in Phase 9)
- Volume toggle mutes voice
- Exit confirms before bailing
- Final step → rating → cook_sessions row persisted, memory 
  embedded in Qdrant
```

### After Phase 4

Run end-of-phase prompt. Commit `feat(phase4): recipe detail and cook mode (no voice yet)`.

---

## Phase 5 — Nick chat (text + memory layer)

**Goal:** User can chat with Nick. Nick replies in character. Recipe cards render inline. Memory layer working — Nick remembers prior conversations across sessions.
**Estimate:** 5–7 hours. Longest phase. Don't rush.
**Dependencies:** Phase 4 complete.

### Prompt

```
Read CLAUDE.md, .claude/context.md, sections 7.4 (Nick chat), 7.5 
(Loading state), 8 (Cross-cutting capabilities — memory layer), 
and 11 (AI behavior — Nick's system) of docs/Nick_AI_PRD.md, plus 
the "Phase 5" build section. This is the longest phase — read 
everything before writing code.

This phase has 4 parts: (a) chat UI, (b) memory pipeline, 
(c) tool-calling pipeline, (d) recipe card rendering inline.

Build sequence:

PART A — Chat UI (/chat)

1. Full-screen chat layout. NO bottom nav (chat is its own thing 
   when open). X close top-left → routes to /. Settings gear 
   top-right (placeholder, links to /profile).

2. Header: chef hat icon + "Nick · your AI chef" + "online · 
   learns from you" subtitle.

3. Messages list (scroll up, latest at bottom). Auto-scroll to 
   bottom on new message. Use a virtualized list if message count 
   could grow large (skip for v1, simple flex column is fine).

4. Message bubbles:
   - User: right-aligned, dark fill (chip.selected color), white 
     text, max-width 80%
   - Nick: left-aligned, white bg, border.subtle, black text, 
     small chef-hat avatar to the left
   - Inline recipe cards (defined in PART D) render in the Nick 
     bubble flow

5. Suggested prompts strip above composer (horizontally 
   scrollable). 5 starters when messages.length === 0:
   - "Something quick"
   - "Use what's in my fridge"
   - "Comfort food"
   - "Surprise me"
   - "Healthy and light"
   Tap → fills composer + auto-sends.

6. Composer (sticky bottom): mic button (left), text input 
   (flex-1, placeholder "Message Nick..."), send button (right, 
   ChefHat icon, dark fill). Mic and send always visible.

7. Typing indicator: when waiting on Nick, show 3-dot loop in a 
   Nick-style bubble. Replace with first token when streaming 
   starts.

8. On chat page mount: SSR fetch last 50 messages from 
   chat_messages, render. Client takes over for new messages.

9. Read prefilled prompt from URL: if /chat?prompt=X, populate 
   composer with X but don't auto-send (let user tap send).

PART B — Memory pipeline (server)

10. API route src/app/api/chat/route.ts (POST). Streaming 
    response.

11. Server-side flow on each user message:
    a. Save user message to chat_messages (role='user').
    b. Embed user message via openai.embed().
    c. Query Qdrant user_memory: filter by user_id, top 5 by 
       cosine similarity. Add a recency boost (created_at within 
       last 7 days × 1.1 score).
    d. Query Qdrant recipes_v1: top 5 by similarity to user 
       message, filtered by user dietary_flags + allergens.
    e. Build system prompt (see PART C).
    f. Stream completion from OpenAI gpt-4o with tool definitions.
    g. As tokens stream, write to response. As tool calls happen, 
       handle them server-side, append results to messages, 
       continue streaming.
    h. When response complete, save Nick's reply to chat_messages 
       (role='assistant'). Embed both (user msg) and (assistant 
       reply) and upsert each to Qdrant user_memory with 
       memory_type='chat', payload includes user_id, 
       message_id, created_at, source_text.

PART C — System prompt structure

12. Create src/lib/nick-prompt.ts that builds the system prompt 
    string given: user profile, retrieved memories, retrieved 
    recipe candidates, latest fridge state.

13. Persona block (static):
    """
    You are Nick — Nick DiGiovanni, the chef. You're warm, 
    direct, energetic. You love smashburgers, the perfect crispy 
    thing, and anything with a great crust. You speak in present 
    tense, use simple language, never hedge. You never say you 
    are an AI. You never break character. If asked something 
    off-topic from cooking and food, you redirect warmly: 
    "Not my arena — but if you want to talk about what's for 
    dinner, I'm in." You won't give medical advice (suggest a 
    professional). You won't trash other chefs.
    
    You're cooking with one user at a time — a real home cook, 
    not a customer. Keep replies short (under 150 words). Use 
    line breaks. Talk like a friend, not a manual.
    """

14. User profile block (templated): name, taste_fingerprint, 
    dietary_flags, allergens, kitchen_tools.

15. Memory block (templated, optional): "Things you remember 
    about this user from past conversations:" + bullet list of 
    top 5 retrieved memories.

16. Fridge block (templated, optional): if fridge_scans table 
    has a row for this user within last 24 hours, include 
    "What's in their fridge right now: [comma-separated 
    ingredients]"

17. Recipe candidates block: top 5 recipes from Qdrant filtered 
    for diet, formatted as JSON for tool reference.

18. Tool block: function definitions for OpenAI tool calls — 
    suggest_recipes, search_recipes, get_recipe, 
    request_substitution, save_to_shopping_list. Each with proper 
    JSON schema.

19. Format rules: "When suggesting recipes, ALWAYS call the 
    suggest_recipes tool. Don't list recipe names in plain text. 
    Maximum 3 recipe cards per response."

PART D — Tool handlers and recipe cards

20. Server-side tool handlers (in same /api/chat route):
    - suggest_recipes(intent: string, count?: number) — embed 
      intent, query recipes_v1, filter by user dietary, return 
      top N as structured array {recipe_id, title, time, why}
    - search_recipes(query: string) — same but with explicit 
      query
    - get_recipe(recipe_id) — full recipe fetch
    - request_substitution(ingredient, recipe_id) — Nick 
      suggests 1–2 swaps. Implement as a sub-prompt to OpenAI: 
      "User wants to swap [ingredient] in [recipe]. Suggest 
      1–2 substitutions as JSON [{name, note}]"
    - save_to_shopping_list(items) — write to 
      shopping_list_items, return success

21. Tool call results get appended to the message stream as 
    structured JSON. Client parses the message stream:
    - Text tokens → append to current Nick bubble
    - Tool call result for suggest_recipes → render inline 
      RecipeCard for each suggestion within the same Nick bubble
    - Tool call result for save_to_shopping_list → render a 
      "✓ Added 3 items to your list" success chip

22. Inline RecipeCard component (renders in chat):
    - Image, title, time + meta line ("22 min · uses 6/8 of your 
      fridge" — compute usage if fridge state present, else 
      omit)
    - 3 buttons in row: "Cook this" (primary, dark) → 
      /recipes/[id], "Swap" → triggers a swap chat turn, "Why?" 
      → triggers a follow-up message "Why did you suggest 
      [recipe.title]?" with recipe context.

23. Voice input on mic button:
    - Press and hold mic button → start MediaRecorder 
      capturing audio, show recording indicator (pulsing red dot)
    - Release → stop recording, POST blob to /api/transcribe 
      (calls OpenAI Whisper API), receive transcript text, 
      inject into composer (don't auto-send).

24. /api/transcribe route — accepts audio blob, calls Whisper, 
    returns {text}.

25. Streaming with Vercel AI SDK or custom SSE — your choice. 
    Vercel AI SDK is cleaner for tool calling. If using it: 
    npm install ai @ai-sdk/openai. Use streamText with tools.

After building, walk me through:
- Send "what should I make tonight" → 3 inline recipe cards
- Tap "Why?" on one → Nick explains
- Tap "Swap" on a recipe ingredient (this routes from recipe 
  detail) → Nick suggests substitution
- Send "what's the weather" → Nick redirects warmly
- Sign out, sign back in next "session" — send a related 
  follow-up — Nick references prior conversation (memory works)
- Press-hold mic → speak → release → transcript appears in 
  composer

Definition of done:
- Send a chat → Nick first token under 3s
- "What should I make tonight" → 3 inline cards, all match 
  user's dietary flags
- Memory: ask Nick a question about a past meal you logged in 
  Phase 4 — he references it
- Mic button: press-hold, speak, release, get transcript
- Off-topic question → warm redirect
- Recipe card "Cook this" routes to /recipes/[id]
- Recipe card "Why?" triggers explanation in chat
- chat_messages and user_memory both growing (verify in 
  Supabase + Qdrant)
- Streaming visibly streams (tokens appear progressively)
```

### After Phase 5

Run end-of-phase prompt. Commit `feat(phase5): nick chat with tool calling and qdrant memory layer`. **Big checkpoint here.** If this phase works, the product thesis is technically alive. Take a break before Phase 6.

---

## Phase 6 — Fridge scan flow

**Goal:** User taps camera button in chat → opens camera → scans fridge → sees ingredient list → edits → confirms → Nick suggests recipes that maximize ingredient usage.
**Estimate:** 3–4 hours.
**Dependencies:** Phase 5 complete. HTTPS required (use Vercel preview deploy or `vercel dev`).

### Prompt

```
Read CLAUDE.md, .claude/context.md, section 7.15 (Fridge scan 
flow) and the "Phase 6" build section of docs/Nick_AI_PRD.md. 
Then build Phase 6.

IMPORTANT: getUserMedia requires HTTPS. Test on Vercel preview 
deploy or use `vercel dev` locally. localhost works in Chrome but 
not iOS Safari for camera.

Build sequence:

1. Camera button in chat composer (already there from Phase 5? — 
   add if missing; mic on left, camera in middle, send on right). 
   Tap → routes to /scan/permission.

2. /scan/permission page:
   - Headline "Nick wants to peek in your fridge"
   - Body: "Snap a photo and I'll figure out what you've got. 
     Camera stays on your phone — Nick only sees what you show 
     him."
   - Primary CTA "Allow camera" → triggers getUserMedia, on 
     success route to /scan/capture, on denial route to 
     /scan/upload-fallback
   - Secondary "Skip — I'll type ingredients" → 
     /scan/upload-fallback (shows manual ingredient input 
     instead).

3. /scan/capture:
   - Full-screen video element with srcObject = stream from 
     getUserMedia({video: {facingMode: 'environment'}})
   - Capture button (large center FAB at bottom, white circle 
     with dark inner ring)
   - Flip camera button (top-right, RotateCcw icon) — switches 
     facingMode user/environment
   - X cancel top-left → /chat
   - Manual upload button bottom-left (upload icon) → opens 
     file input, accept image/*

4. Capture handler:
   - Pause video stream momentarily
   - Draw current video frame to canvas (match video dimensions)
   - Convert canvas to blob (JPEG, quality 0.85)
   - Show loading overlay "Looking in your fridge..." with 
     spinning dashed ring (mirror style of /chat loading state 
     from Phase 5 — dashed ring)
   - POST blob to /api/scan as multipart form data
   - On response, route to /scan/confirm with scan_id

5. /api/scan route:
   - Accept image (form data)
   - Upload image to Supabase Storage bucket 'fridge-scans' 
     under path {user_id}/{timestamp}.jpg. Create bucket if not 
     exists with private access.
   - Read image as base64
   - Call OpenAI gpt-4o with vision:
     ```
     model: 'gpt-4o',
     messages: [{
       role: 'user',
       content: [
         {type: 'text', text: 'Identify food ingredients visible 
         in this fridge photo. Return ONLY valid JSON in this 
         exact shape: {"ingredients": [{"name": string, 
         "confidence": number 0-1, "category": "produce" | 
         "pantry" | "protein" | "dairy" | "other"}]}. Only 
         identify common food items. If you can\'t see a fridge 
         or can\'t identify clear food items, return 
         {"ingredients": []}.'},
         {type: 'image_url', image_url: {url: dataUrl}}
       ]
     }],
     response_format: {type: 'json_object'}
     ```
   - Parse JSON response. Save to fridge_scans table with 
     ingredients (jsonb), source_image_path. Return scan_id.

6. /scan/confirm/[scan_id] page:
   - Fetch fridge_scans row by id
   - Render ingredient list:
     - Each row: name, category icon left, low-confidence 
       (<0.7) flagged with warning icon and slightly muted text
     - Tap to remove (× button on right, animates out)
   - "Add an ingredient" dashed input at bottom of list — 
     manual add
   - Primary CTA "Confirm — ask Nick" at bottom

7. On confirm:
   - PATCH fridge_scans row with edited ingredient list (mark 
     each entry edited:true if user changed it)
   - Update user's "latest fridge state" (this is implicit — 
     /api/chat already reads most recent fridge_scans row 
     per Phase 5)
   - POST a system-triggered chat turn: route to /chat?scanned=true. 
     Chat page detects scanned=true on mount, sends a 
     server-side initiated message: "I just scanned my fridge. 
     What can I make?" — Nick auto-replies with 3 recipe 
     suggestions that use the scanned ingredients.

8. /scan/upload-fallback:
   - Manual ingredient input: text field + "+ Add" → list grows 
     below.
   - Primary CTA "Confirm — ask Nick" — saves to fridge_scans 
     with all entries edited:true, source_image_path:null.

After building, test the flow end-to-end on a real phone with 
HTTPS (Vercel preview). Show me the /api/scan implementation 
diff and the /scan/confirm page.

Definition of done:
- Camera permission prompts on first use, persists thereafter
- Scan a real fridge → ingredient list returns in <5s with 
  reasonable accuracy
- Edit list (remove items, add manually) → confirm → routes to 
  /chat with auto-triggered recipe suggestions
- Nick's suggestions reference the scanned ingredients ("you've 
  got eggs, butter, and pasta — let's make carbonara")
- Manual upload fallback works when camera denied
- Manual entry fallback works for users who skip camera entirely
- Image stored in Supabase Storage under user's path, fridge_scans 
  row created with valid JSON
```

### After Phase 6

Run end-of-phase prompt. Commit `feat(phase6): fridge scan with vision pipeline`.

---

## Phase 7 — Past Meals + Surprise Me

**Goal:** Past Meals tab shows cooking history with stats and ratings. Surprise Me dice flow works with shake-to-reroll.
**Estimate:** 2–3 hours.
**Dependencies:** Phase 4 (cook sessions exist).

### Prompt

```
Read CLAUDE.md, .claude/context.md, sections 7.8 (Past Meals), 
7.11 (Surprise Me) and the "Phase 7" build section. Then build 
Phase 7.

PART A — Past Meals (/past-meals)

1. Server fetch cook_sessions for user where completed_at is not 
   null, joined with recipes for thumbnail/title.

2. Stats strip (top, dashed-outlined cards):
   - Count this week (cook_sessions completed in last 7 days)
   - Avg rating (rounded to 1 decimal)
   - Reorders (cook_sessions where the same recipe_id has been 
     cooked >1 time by this user — count distinct repeated 
     recipes)

3. Filter button top-right (icon): opens slide-up sheet with: 
   cuisine multi-select (from distinct recipe.cuisine), rating 
   range slider, time range slider. Apply filters as URL params, 
   server re-fetches.

4. Group meals by recency, render section headers:
   - TODAY (completed_at >= start of today)
   - YESTERDAY
   - THIS WEEK (last 7 days excluding above)
   - EARLIER (everything older)

5. Each meal row:
   - Recipe thumbnail (use hero_image_url, square 64x64)
   - Recipe name + meta (time + difficulty)
   - Star rating inline (5 stars, filled per rating)
   - "Cook again" chip (right) — dark fill, taps to /cook/[id]
   - Whole row tap (excluding chip) → /recipes/[id]
   - Chevron right indicator

6. Empty state (cook_sessions.length === 0):
   - Centered dashed circle with clock icon
   - "No meals yet"
   - "Cook your first dish and it'll show up here. Nick learns 
     from every plate."
   - Primary CTA "Ask Nick for an idea" → /chat

PART B — Surprise Me (/surprise)

7. Trigger from home category tile "Random / Surprise" → /surprise.

8. /surprise page:
   - Header "Surprise me · rolling the dice..." with X close 
     left
   - Large dice icon (Dice5 from lucide-react) center top, 
     spins on entry (CSS animation 700ms rotate)
   - Subtitle "shaking 12,890 ideas..." (use real recipe count 
     for fun)
   - After 700ms, fade-in result card below

9. Random pick algo (server action or API route):
   - Query recipes filtered by user dietary_flags + allergens 
     (no meat for vegetarian, no allergens)
   - ORDER BY random() LIMIT 1 (Postgres random is fine)
   - Return recipe

10. Result card:
    - Hero image
    - Title, meta tags as chips ("Sichuan", "Spicy", "Noodles")
    - Two CTAs equal weight at bottom: "Re-roll" (secondary, 
      dashed) and "Cook this" (primary, dark)

11. Shake-to-reroll:
    - Add DeviceMotionEvent listener on mount (after permission 
      granted on iOS — requires user gesture for 
      DeviceMotionEvent.requestPermission())
    - Track acceleration deltas, threshold trigger (e.g. 
      sqrt(x²+y²+z²) > 25 within 200ms window)
    - On trigger, re-fetch random recipe, animate dice spin 
      again, fade in new result
    - Permission prompt on first use ("Allow motion to shake 
      for new ideas?")

12. Re-roll button: same effect as shake.

13. "Cook this" → /recipes/[id].

After building, walk me through cooking a recipe in /cook → 
checking it appears in /past-meals → tapping Cook again → 
recovers cook flow. Then test /surprise on phone and verify 
shake works.

Definition of done:
- /past-meals shows all completed cook_sessions correctly grouped
- Stats strip shows accurate counts
- Filter sheet works (cuisine, rating, time)
- "Cook again" chip routes to /cook/[id]
- Empty state shown when no sessions
- /surprise: dice spins, random recipe appears, respects diet
- Shake to reroll triggers new recipe (real device test)
- Re-roll button works
```

### After Phase 7

Run end-of-phase prompt. Commit `feat(phase7): past meals history and surprise me`.

---

## Phase 8 — Profile + Shopping List + Notifications

**Goal:** All settings screens functional. Shopping list aggregates, syncs to OS. Notifications inbox shows scheduled and triggered notifications.
**Estimate:** 3–4 hours.
**Dependencies:** Phase 4 (Add to list works), Phase 7.

### Prompt

```
Read CLAUDE.md, .claude/context.md, sections 7.12 (Profile), 7.13 
(Notifications), 7.14 (Shopping List) and the "Phase 8" build 
section of docs/Nick_AI_PRD.md. Then build Phase 8.

PART A — Profile (/profile and sub-routes)

1. /profile main page:
   - Avatar circle (large, 80px, initial-based color from 
     username)
   - Name + meta line ("Alex P. · 34 meals · joined Mar '26")
   - "Edit profile" dashed chip → /profile/edit
   - "TASTE FINGERPRINT" section:
     - All flavors from profile.taste_fingerprint as filled chips
     - Tap any to remove (PATCH profile, optimistic UI)
     - "+ add" outlined chip → opens flavor picker (8 flavors 
       not currently selected)
   - Settings rows (each is a Link with chevron right):
     - Dietary needs (subtitle: "gluten-free · 2 allergens" — 
       generated from profile)
     - Kitchen tools (subtitle: "12 items")
     - Notifications (subtitle: "meal reminders on" — based on 
       prefs)
     - Shopping list sync (subtitle: "apple reminders")
     - Privacy & data
   - Gear icon top-right → /profile/settings (theme, sign out)

2. /profile/edit — edit display_name, save → back.

3. /profile/dietary — toggles for vegetarian, gluten-free, 
   allergens multi-select. Save on change (PATCH profile + 
   re-embed taste fingerprint to user_memory if changed).

4. /profile/tools — checklist of kitchen tools. Save on toggle.

5. /profile/notifications — toggles per notification type 
   (suggestions, reminders, system). Stores in profiles.notif_prefs 
   (jsonb).

6. /profile/shopping-sync — radio: Apple Reminders (default), 
   Google Tasks, None.

7. /profile/privacy:
   - "Export my data" → POST /api/me/export → returns JSON 
     download of user's profile + chat_messages + cook_sessions + 
     fridge_scans
   - "Delete account" → confirm → DELETE /api/me → cascades all 
     user data (Supabase cascade on auth.users delete, plus 
     manual Qdrant point deletion)

8. /profile/settings — theme toggle (light/dark — light only for 
   v1, dark deferred), sign-out button.

PART B — Shopping List (/shopping-list)

9. Add a migration (0003_shopping.sql) that adds a `category` 
   column to shopping_list_items (text, check constraint produce | 
   pantry | protein | dairy | other) if not already present.

10. /shopping-list page:
    - Header: "Shopping list · X recipes · Y items" (count 
      distinct source_recipe_id and total items)
    - Sync icon top-right → triggers OS sync (see step 13)
    - Filter chips horizontal: All / Produce / Pantry / Protein
    - Auto-grouped sections by category, with section headers 
      (PRODUCE / PANTRY / PROTEIN / DAIRY / OTHER)
    - Each row: checkbox, item name, quantity right-aligned, 
      category icon
    - Checkbox toggle: optimistic UI, PATCH 
      shopping_list_items.checked. Checked = strikethrough text + 
      bg.elevated soft fill.
    - "+ add an item" dashed input at bottom of EACH section — 
      submits → POST shopping_list_items with that category.
    - Empty state: "Your list is empty. Add ingredients from any 
      recipe."

11. Bottom CTA: "Sync to Apple Reminders" 
    - On tap: build x-apple-reminderkit:// deep link with all 
      unchecked items as comma-separated string. Window.location.
    - Fallback: if not iOS, copy items to clipboard as 
      newline-separated list. Show toast "Copied. Paste into 
      your reminders app."

12. Adding to list (from Recipe Detail in Phase 4): assign 
    category by mapping ingredient name keywords:
    - has "chicken|beef|salmon|prawn|pork|lamb|tofu" → protein
    - has "milk|cheese|cream|yogurt|butter" → dairy
    - has "salt|pepper|oil|sugar|flour|rice|pasta|sauce" → pantry
    - else → produce

PART C — Notifications (/notifications + scheduler)

13. /notifications page:
    - Filter chips: All / Nick / Reminders
    - Each notification card:
      - Icon (left, varies by type)
      - Title (bold), subtitle (muted), time (right)
      - Unread = white card + dot. Read = bg.elevated, no dot.
    - Tap card → mark as read (PATCH), navigate to action URL 
      stored in notification.body (parse if JSON)
    - Empty footer when scrolled past last: "that's everything 
      for now"

14. Server-side notification scheduler (Vercel Cron):
    - Add vercel.json with cron job: 
      "schedule": "0 11 * * *" (11am UTC = 4:30pm IST = evening 
      idea timing for India users)
    - Endpoint: /api/cron/daily-suggestions
    - Logic: for each user with profile.onboarding_complete=true 
      and notif_prefs.suggestions !== false:
      - Query Qdrant recipes_v1 with their fingerprint, top 3, 
        filtered by diet
      - Insert notification: {type: 'suggestion', title: 'Nick 
        has 3 dinner ideas for tonight', body: JSON 
        {recipe_ids: [...]}, scheduled_for: now}
      - If push subscription exists, send Web Push notification

15. Web Push setup:
    - Generate VAPID keys (one-time, paste into env: 
      VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
    - On first visit to /notifications, prompt for push 
      permission. Save subscription to push_subscriptions table 
      (add migration 0004_push_subs.sql).
    - /api/push/send (server) — given user_id and notification, 
      send push via web-push library.

After building, manually trigger /api/cron/daily-suggestions and 
verify a notification row gets created. Walk me through 
shopping list flow: cook a recipe, add ingredients to list, 
view list, sync.

Definition of done:
- All Profile rows pushable, all settings persist after reload
- Taste fingerprint editor: remove/add chips persists
- Account export downloads valid JSON
- Account delete cascades all user data
- Shopping list correctly grouped by category, checkbox toggles 
  persist
- Add item from each section input works
- Sync to Apple Reminders deep links on iOS, copies to 
  clipboard elsewhere
- /api/cron/daily-suggestions inserts a notification per user
- Push subscription saves on permission grant
- Push notification fires when notification is inserted (test 
  with a real subscription)
```

### After Phase 8

Run end-of-phase prompt. Commit `feat(phase8): profile, shopping list, notifications + cron`.

---

## Phase 9 — Nick voice clone + ElevenLabs integration

**Goal:** Replace placeholder browser TTS with Nick's actual cloned voice. Cook mode reads steps in his voice. Chat optionally plays Nick replies aloud.
**Estimate:** 2–3 hours (after audio prep).
**Dependencies:** Audio prep done offline first.

### Prerequisite: audio prep (do this BEFORE running Phase 9 prompt)

```bash
# Install yt-dlp and ffmpeg first if not already
# brew install yt-dlp ffmpeg  (macOS)

# Download audio from 5–10 of Nick's solo-talking videos
mkdir nick-audio && cd nick-audio
yt-dlp -x --audio-format mp3 --audio-quality 0 "VIDEO_URL_1"
yt-dlp -x --audio-format mp3 --audio-quality 0 "VIDEO_URL_2"
# repeat...

# For each, clip out only Nick speaking (no music, no intros)
# Identify clean segments by listening, then clip:
ffmpeg -i input.mp3 -ss 00:00:30 -to 00:03:45 -c copy clip1.mp3
ffmpeg -i input.mp3 -ss 00:05:10 -to 00:08:20 -c copy clip2.mp3

# Concatenate into one file
# Make a list.txt with: file 'clip1.mp3' / file 'clip2.mp3' / etc.
ffmpeg -f concat -safe 0 -i list.txt -c copy nick-master.mp3

# Verify total is 30+ minutes
ffprobe nick-master.mp3 2>&1 | grep Duration

# Upload to ElevenLabs:
# 1. Go to elevenlabs.io → Voice Lab → Add Voice → Instant Voice Clone
# 2. Upload nick-master.mp3
# 3. Name: "Nick DiGiovanni (internal alpha)"
# 4. Save voice ID (looks like: 21m00Tcm4TlvDq8ikWAM)
# 5. Add to .env: ELEVENLABS_VOICE_ID=<the_id>
```

### Prompt

```
Read CLAUDE.md, .claude/context.md, section 8 (TTS pipeline) and 
the "Phase 9" build section of docs/Nick_AI_PRD.md. Then build 
Phase 9.

Confirm before code: ELEVENLABS_VOICE_ID is in .env. If not, stop 
and tell me to do the audio prep first.

Build sequence:

1. /api/tts route:
   - Accepts {text: string, voice_id?: string} 
     (default voice_id = process.env.ELEVENLABS_VOICE_ID)
   - Calls ElevenLabs streaming endpoint:
     POST 
     https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream
     headers: xi-api-key, accept: audio/mpeg, content-type: 
     application/json
     body: {
       text,
       model_id: "eleven_turbo_v2_5",  // fastest
       voice_settings: {
         stability: 0.5,
         similarity_boost: 0.75,
         style: 0.3,  // some character
         use_speaker_boost: true
       }
     }
   - Stream the response body back to client as 
     audio/mpeg

2. Common phrases pre-cache:
   - Create scripts/precache-tts.ts that takes an array of 
     phrases:
     - "Let's get started."
     - "Nice work."
     - "Next step."
     - "Hold up — let me check that."
     - "Hey, what are we making today?"
   - For each, calls ElevenLabs (non-streaming endpoint), saves 
     to public/audio/{slug}.mp3
   - Run once: npm run precache-tts. Commit the audio files.

3. Cook Mode TTS swap (from Phase 4 placeholder):
   - Replace SpeechSynthesisUtterance with calls to /api/tts
   - On step entry: 
     ```
     const audio = new Audio('/api/tts?text=' + 
       encodeURIComponent(stepText))
     audio.play()
     ```
   - Or use HTMLAudioElement + fetch ReadableStream 
     (better for streaming)
   - Volume toggle: when off, don't request TTS at all (saves 
     ElevenLabs quota)
   - Repeat button: re-trigger fetch and play

4. iOS Safari audio unlock (already added in Phase 4 — verify):
   - The "Tap to start" overlay before cook mode begins MUST 
     play a silent or very short audio clip on tap to unlock 
     audio context. If not done in Phase 4, add now: tap → 
     play /audio/lets-get-started.mp3 (the precached one).

5. Pre-fetch next step's audio in background:
   - When user enters step N, immediately fetch /api/tts for 
     step N+1's text in background, store as Blob URL in state. 
     When user advances, play that pre-fetched blob (zero 
     latency).
   - Use AbortController to cancel pre-fetch on step skip.

6. Chat voice toggle:
   - In /chat header settings gear menu (or as a small toggle), 
     add "Play Nick's voice on responses" option. Persist in 
     localStorage as chat_voice_enabled.
   - When enabled: after each Nick text response completes 
     streaming, call /api/tts with the full reply text, play 
     audio.
   - Cap audio for chat at 30 seconds — if reply text would 
     produce longer, truncate to first 2 sentences for voice 
     (still show full text).

7. ElevenLabs quota monitoring:
   - Log character count per /api/tts call
   - Add a soft warning in dev console when monthly count 
     approaches free tier (10,000 chars)
   - In future, you'll need a paid plan during heavy testing.

After building, walk me through cook mode end-to-end and confirm 
Nick's voice plays. Compare voice quality subjectively to the 
YouTube original — if it's wrong, we may need to redo the audio 
prep.

Definition of done:
- Cook mode reads each step in Nick's voice, <1.5s start latency 
  for step 1 (cold)
- Step 2+ effectively zero latency (pre-fetched)
- Voice quality recognizably Nick (subjective — your call)
- Volume toggle in cook mode mutes correctly
- Chat voice toggle plays Nick replies as audio
- Common phrases (pre-cached) play instantly without API call
- iOS Safari first-tap unlock works
- ElevenLabs quota tracked in logs
```

### After Phase 9

Run end-of-phase prompt. Commit `feat(phase9): elevenlabs voice clone integration`.

---

## Phase 10 — Voice navigation in Cook Mode

**Goal:** User says "next," "repeat," "back" — cook mode advances/replays/reverses without touching screen.
**Estimate:** 2 hours.
**Dependencies:** Phase 9 complete.

### Prompt

```
Read CLAUDE.md, .claude/context.md, and the "Phase 10" build 
section of docs/Nick_AI_PRD.md. Then build Phase 10.

Build sequence:

1. Web Speech Recognition (only Chrome/Edge mobile, Safari has 
   partial support via webkit prefix):
   - Feature detect: 
     window.SpeechRecognition || 
     window.webkitSpeechRecognition. If neither: hide voice 
     features in cook mode, force tap navigation.

2. In cook mode, add a mic toggle button (top-right area, near 
   volume icon). Off by default. On = continuous listening 
   while in cook mode.

3. When mic toggle on:
   - Start SpeechRecognition: 
     continuous=true, interimResults=false, lang='en-US'
   - On result event: get transcript, lowercase, trim
   - Match against command list:
     - "next" / "next step" / "go on" / "continue" → next step
     - "back" / "previous" / "go back" → previous step
     - "repeat" / "again" / "say again" → re-trigger TTS for 
       current step
     - "pause" / "stop timer" → pause active timer
     - "resume" / "start timer" → resume timer
     - "exit" / "cancel" / "i'm done" → trigger exit confirmation

4. Anti-feedback: pause SpeechRecognition while TTS audio is 
   playing (audio.onplay → recognition.stop(); audio.onended → 
   recognition.start()).

5. Visual indicator: when listening, mic icon pulses (animation). 
   When TTS playing, mic icon shows "muted" state.

6. Error handling: 
   - SpeechRecognition errors (no-speech, audio-capture, 
     network) → log, restart after 2s
   - Unrecognized command → no-op, no audio feedback (avoids 
     annoying user)

7. Save user's voice nav preference: 
   localStorage.cook_voice_nav_enabled. Defaults to false 
   (user must opt in per session).

8. Add a brief help tooltip on first cook mode entry with voice 
   nav available: "Try saying 'next' or 'repeat' to navigate 
   hands-free."

After building, test on a real phone:
- Stand 1m away from phone
- Say "next" → advances
- Say "repeat" → replays Nick reading current step
- Say "back" → previous
- Verify Nick's voice doesn't trigger commands during playback

Definition of done:
- Mic toggle works in cook mode
- "next" / "back" / "repeat" / "pause" / "resume" all recognized 
  at typical kitchen distance
- Anti-feedback: TTS playback doesn't trigger recognition
- Browser without speech recognition: gracefully hides feature
- Toggle preference persists across cook mode sessions
```

### After Phase 10

Run end-of-phase prompt. Commit `feat(phase10): voice navigation in cook mode`.

---

## Phase 11 — Offline mode + service worker

**Goal:** Last 5 saved recipes accessible offline. Cook mode for those recipes works fully offline.
**Estimate:** 2–3 hours.
**Dependencies:** All prior phases.

### Prompt

```
Read CLAUDE.md, .claude/context.md, sections 7.3 (Home offline) 
and 8 (Cross-cutting — Offline cache) plus the "Phase 11" build 
section of docs/Nick_AI_PRD.md. Then build Phase 11.

Build sequence:

1. Install next-pwa:
   npm install next-pwa
   And update next.config.ts to wrap with withPWA, register 
   service worker.

2. Custom Workbox runtime config:
   - NetworkFirst for /api/* with timeout 3s, fallback to cache
   - CacheFirst for /_next/static, /_next/image, fonts, /audio/*
   - StaleWhileRevalidate for / and /recipes/[id] pages
   - NetworkOnly for /api/chat (don't cache LLM responses)

3. Pre-cache last-5-saved on app load:
   - On any main layout mount, fetch user's saved_recipes (top 
     5 by saved_at desc)
   - For each: pre-fetch /recipes/[id] HTML, hero image URL, 
     each step.image_url, /api/tts pre-generated audio for each 
     step (call /api/tts for step body, store the resulting 
     blob in cache via service worker postMessage)
   - Fire and forget. Don't block UI on this.

4. Manifest.json (next-pwa generates):
   - name: "Nick AI"
   - short_name: "Nick AI"
   - icons: 192x192 + 512x512 (use a placeholder for now — 
     simple chef hat icon, dark on white)
   - theme_color: #1A1A1A
   - background_color: #FAFAF7
   - display: standalone
   - start_url: /

5. Offline detection hook 
   src/hooks/useOnlineStatus.ts:
   - useState(navigator.onLine)
   - useEffect listens to 'online' / 'offline' events
   - Optionally pings /api/health every 30s for actual 
     connectivity (some networks show online but no real 
     reachability)

6. Home page offline state:
   - When useOnlineStatus = false:
     - Top of home: dashed-border banner: "You're offline · 
       showing cached recommendations" + retry chip (calls 
       online check)
     - Replace personalized hero with last-5-saved recipes
     - Below: "Nick can't reach the kitchen" empty state with 
       "View saved" + "Try again" CTAs

7. Cook mode offline:
   - Cook mode for a saved recipe: works fully offline (HTML 
     cached, images cached, TTS audio cached)
   - Cook mode for non-saved recipe: shows "This recipe needs 
     internet to start. Save it for offline access."

8. /shopping-list, /past-meals, /profile: cached HTML 
   (StaleWhileRevalidate) so they show stale-but-readable 
   data offline. Mutations queued (or just disabled offline — 
   simpler for v1).

9. Add to layout: install prompt for PWA. Track if user has 
   dismissed via localStorage. Show subtle "Add to Home Screen" 
   prompt after 3 sessions on iOS Safari (manual instructions) 
   and Android Chrome (beforeinstallprompt event).

After building, test:
- Save 5 recipes
- Open DevTools → Application → toggle offline
- Reload home → shows cached + offline banner
- Open a saved recipe → cook mode → step through (should work)
- Open a NON-saved recipe → blocking message
- Re-enable network → banner disappears

Definition of done:
- Service worker registered, lighthouse PWA audit passes basic 
  criteria
- Last 5 saved recipes pre-cached (HTML + images + TTS audio)
- Offline mode: home shows banner, list of saved, cook mode 
  works for saved recipes
- App installable to home screen on Android Chrome (beforeinstallprompt)
- iOS Safari install instructions shown
- Online → cached pages refresh in background (StaleWhileRevalidate)
```

### After Phase 11

Run end-of-phase prompt. Commit `feat(phase11): pwa offline support and install`.

---

## Phase 12 — Polish + bug bash

**Goal:** Walkthrough survives a 5-minute demo to a stranger. All known bugs squashed. Visual consistency across screens.
**Estimate:** 3–4 hours.
**Dependencies:** Phase 11 complete.

### Prompt

```
Read CLAUDE.md, .claude/context.md, section 14 (Success criteria) 
and the "Phase 12" build section of docs/Nick_AI_PRD.md. This is 
the final phase. Then run the full polish + bug bash.

Build sequence:

PART A — Cross-screen audit

1. Walk through every screen at 375px (iPhone SE) and 412px 
   (Pixel 7) viewport in DevTools mobile emulation. List any 
   issues:
   - Text overflow / clipping
   - Touch target <44px
   - Misalignment
   - Inconsistent spacing
   - Font weight inconsistencies
   Fix all.

2. Test on real iPhone Safari and Android Chrome. List 
   browser-specific issues. Fix.

3. Color audit: every text-on-background combination must hit 
   contrast 4.5:1 (use Lighthouse accessibility audit).

PART B — Loading and empty states

4. Every async fetch must have a loading state (skeleton 
   preferred over spinner where possible):
   - Home hero carousel skeleton
   - Recipe detail skeleton
   - Chat history skeleton
   - Past Meals skeleton
   - Shopping List skeleton

5. Every list must have a thoughtful empty state:
   - Past Meals empty (already done in Phase 7)
   - Notifications empty
   - Shopping List empty
   - Search no-results
   - Chat first-time (use suggested prompts as the empty state — 
     already done in Phase 5)

PART C — Error states

6. Every API call wrapped in try/catch. On error: toast (sonner) 
   with friendly message + "try again" action. Never show stack 
   traces or raw errors.

7. Specific error scenarios to handle gracefully:
   - OpenAI rate limit → "Nick's catching his breath. Try again 
     in a sec."
   - Qdrant down → fallback to plain Postgres recipe random for 
     suggestions
   - ElevenLabs quota exceeded → fall back to browser TTS with 
     subtle warning
   - Camera denied → already handled (Phase 6)
   - Network drop mid-chat → show "Reconnecting..." status, retry

PART D — Animations

8. Page transitions: subtle slide or fade (next/navigation has 
   built-in via View Transitions API in modern browsers — try it).

9. Micro-interactions:
   - Chip tap: scale 0.95 → 1.0 over 100ms
   - Button press: brief darken
   - Heart save: pop + color fill
   - Timer complete: chime + brief border flash on the timer ring
   - Send button: brief scale on send

10. Carousel swipe: ensure inertia feel (Embla default is good).

PART E — Performance

11. Lighthouse audit on Home, Chat, Cook Mode (mobile profile):
    - Target Performance >85
    - Target Accessibility >90
    - Target Best Practices >90
    - Target SEO can be ignored (private app)

12. Common perf wins:
    - Image optimization: use next/image everywhere with 
      proper sizes, priority on hero images only
    - Font loading: preload Inter
    - Lazy-load below-the-fold components (carousel can SSR, 
      category grid can lazy)
    - Avoid client-side data fetching where server components 
      can do it

PART F — README + docs

13. Final README.md:
    - Project description (1 paragraph from PRD section 1)
    - "Internal-only — do not distribute" warning
    - Setup section: clone, npm install, copy .env from team 
      chat, npm run dev
    - Stack section (from PRD section 9)
    - Phases shipped section (link to docs/build_prompts.md)
    - "Not in v1" section (from PRD section 4 out-of-scope list)

14. Update .claude/context.md:
    - Phase: "Phase 12 complete · v1 shipped"
    - Add a "Known issues / deferred" section with any bugs you 
      didn't fix

15. Update .claude/changelog.md with a final v1.0 release entry.

PART G — Final verification

16. Run through PRD section 14 success criteria one by one, 
    document pass/fail in changelog:
    - Sign up + onboarding + Home in <90s
    - Fridge scan → ingredient list <5s → 3 Nick recipe 
      suggestions using those ingredients
    - Pick recipe → cook mode → finish without touching screen 
      mid-cook (voice nav, timers, TTS)
    - Chat with Nick — memory persists across sessions
    - Save recipe + access offline
    - All 16 designed screens render at 375px and 412px
    - No PII or API key in client bundle (grep .next/static for 
      sk-, service_role, etc.)

17. Take a 30-second screen recording of the full happy path 
    (sign up → onboard → home → chat → cook). Save to 
    docs/demo.mp4.

After completing all parts, write a final commit message 
summarizing the v1 alpha release and tag the commit:
git tag v1.0-alpha
git push --tags

Definition of done:
- Lighthouse: Performance >85, Accessibility >90, Best 
  Practices >90 on Home, Chat, Cook Mode
- All 7 success criteria from PRD section 14 pass
- README.md current
- Changelog has v1.0 release entry
- Demo recording saved
- Repo is private. No public URLs active.
- Tag v1.0-alpha pushed to origin
```

### After Phase 12

Final commit and push:
- `feat(phase12): v1 alpha polish, bug bash, and release`
- Tag `v1.0-alpha`

Update `.claude/context.md` to reflect "Phase 12 complete — v1 alpha shipped." Then close the laptop, eat something, and go test it on real users.

---

## Reference: How to recover when things go wrong

### Claude Code starts hallucinating files that don't exist

> Stop. List the actual files in src/ at depth 3. Don't reference any file that isn't in that list. Re-read the PRD section we're working on.

### Phase prompt's scope feels too big mid-build

> Pause. Define a "minimum done" for this phase that ships the core flow. Move the rest to a TODO list in `.claude/changelog.md`. Build only the minimum done now.

### A library or API you're suggesting doesn't exist

> The package/API you mentioned doesn't seem to exist. Search the web (or npm) for the correct one before continuing. If unsure, propose 2 alternatives and let me pick.

### You merged a broken phase into main

> Roll back the last commit with git reset --soft HEAD~1. Re-stage what worked, drop what didn't. Recommit with a partial-phase tag like phase4-partial. Open an issue in `.claude/changelog.md` for the broken portion.

### Costs spiking unexpectedly

> Pause all work. Check OpenAI + ElevenLabs + Qdrant usage dashboards. Identify which API is spiking. Add caching, rate limiting, or short-circuit logic. Don't resume building until burn rate is below $1/hour.

---

*End of build prompts · v1.0 · April 2026*
*Companion to docs/Nick_AI_PRD.md*
