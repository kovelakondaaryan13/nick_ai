# Nick AI — Product Requirements Document

**v1 · internal alpha**
Aryan Kovelakonda · Bengaluru · April 2026
*Confidential — internal only — do not distribute*

---

# Part 1 — The Product

## 1. Summary

Nick AI is a mobile-first web app (PWA) where a real food creator's AI clone — voice, personality, and recipes — guides home cooks through cooking, hands-free, in real time. The flagship persona is Nick DiGiovanni: former MasterChef finalist, 10M+ YouTube subscribers.

The thesis: people watch their favorite chefs on YouTube but can't replicate the recipes alone. The gap between watching a chef and cooking with one has never been closed. Nick AI closes it.

This document covers v1 — the internal alpha. It is built and used internally only. Nick's name, voice, and likeness do not leave the team. No public deploys, no marketing, no investor demos featuring his persona until written consent is obtained.

## 2. The user

Primary user persona for v1 testing:

- **Who:** Home cooks aged 22–40 who follow food creators on YouTube and Instagram. Watch cooking videos for entertainment but rarely replicate the recipes.
- **Tech:** iPhone or Android, comfortable with apps, expect mobile-grade UX. Browser kitchen sessions on phone propped up next to a cutting board.
- **Behavior:** Opens fridge, sees what they have, doesn't know what to make, gives up and orders in. Or follows a YouTube tutorial but loses their place mid-cook because their hands are wet.
- **Geography:** Primary market India tier-1 cities. Secondary US and SEA.
- **v1 testing pool:** 5–20 people. Friends, family, the founding team. Internal only.

The user's most important moment: they tap "Start cooking," set their phone on the counter, and Nick walks them through the meal without them ever needing to touch the screen again.

## 3. Thesis & positioning

### Positioning line

> *"Cook with your favorite chef. Their voice, their recipes, live in your kitchen."*

### What makes this defensible

The cooking-app market splits into commoditized buckets. Nick AI sits at the intersection of three buckets where no one is currently sitting:

- **Hands-free voice cooking** (Yes Chef, AskChef, Voicipe) — voice but no creator, no brand, generic TTS, narrating other people's recipes.
- **Creator-AI clones** (Delphi.ai — Tony Robbins, Matthew Hussey, Gabby Bernstein) — real creator voice but for 1:1 coaching text chat, no kitchen workflow, no cook mode, no recipe data.
- **Chef-branded recipe apps** (TinyChef / Sanjeev Kapoor) — chef's content but generic Alexa voice, content-first not conversation-first.

Nick AI is the first product where a real famous creator's voice talks to you, knows where you are in their recipe, and answers back live. The defensible window is roughly 12–18 months before Delphi or a similar horizontal player expands into cooking.

## 4. Scope

v1 builds the full design template (16 designed screens + auth + fridge scan flow). All screens function. All features work end-to-end. This is not an MVP slice — it's the complete alpha.

### In scope

- Onboarding (taste fingerprint, dietary needs, allergens)
- Auth (email/password via Supabase)
- Home (personalized hero carousel + browse grid)
- Nick chat (text + voice input, inline recipe cards, suggested prompts)
- Fridge scan (camera → vision → ingredient editor → chat handoff)
- Recipe detail (ingredients, steps, notes, scale serves, swap items)
- Cooking Mode (hands-free, TTS read-aloud in Nick's voice, auto-timers, screen wake-lock)
- Past Meals (history, ratings, stats, cook again)
- Browse + Search (full library, filter chips, semantic search)
- Surprise Me (dice flow, shake-to-reroll, respects diet)
- Profile (taste fingerprint editor, dietary, kitchen tools, settings)
- Notifications inbox (Nick suggestions, scheduled cook reminders, system messages)
- Shopping List (recipe-derived, grouped, OS sync to Apple Reminders)
- Offline mode (last 5 saved recipes + cooking mode cached)
- Memory layer (Nick remembers prior conversations, meals cooked, ratings)

### Out of scope (deferred to v2 or v3)

- Multiple chefs / chef selection
- Subscription / paywall
- Native iOS / Android (still PWA in v1)
- Public marketing site / landing page
- Real fridge IoT integrations
- Social / sharing / community feed
- Macro / calorie tracking
- Live mid-cook voice Q&A (the hardest feature — push to v2 once core proven)
- Creator portal / analytics dashboard

## 5. Brand

- **Working name:** Nick AI (internal). Public name TBD before any external launch.
- **Domain (intended):** aichef.app
- **Tagline:** "Cook with your favorite chef. Their voice, their recipes, live in your kitchen."
- **Tone:** Warm, direct, energetic. Sounds like a real chef friend, not an AI assistant. Present-tense, no hedging. Avoids "AI" framing in user-facing copy. Nick is just "Nick," not "your AI chef."
- **Visual:** Clean, mobile-first. Light theme primary. Hero food photography drives the feel. No sci-fi or robot iconography.
- **Don't:** Generic AI assistant framing. Macro/calorie tracker positioning (wrong product). Stock photo food. Heavy onboarding.

## 6. The Nick persona

Nick DiGiovanni is the flagship persona for v1. His characteristics drive the chat system prompt and voice clone.

- **Voice tone:** Energetic, food-obsessed, encouraging. Uses simple language. Loves smashburgers, the perfect crispy thing, anything with a great crust.
- **In character rules:** Never says "I'm an AI." Never breaks character. Refuses politely if asked anything off-topic from cooking and food, then steers back.
- **Knowledge boundaries:** Talks about food, cooking technique, kitchen tools, ingredients, his recipes. Won't give medical / dietary medical advice (suggests consulting a professional). Won't comment on competitors or other chefs negatively.
- **Voice clone source (deferred):** 30+ minutes of clean Nick audio ripped from his YouTube using yt-dlp + ffmpeg, music/intros stripped. Uploaded to ElevenLabs Voice Lab. Phase 6 deliverable.

Legal floor: Nick's name, voice, likeness are internal-only. No external exposure of his persona until written consent. v1 repository is private. No Vercel public preview URL.

---

## 7. Feature inventory by screen

Every screen and feature pulled from the design template. This section is the source of truth for what exists in v1.

### 7.1 Onboarding (4 steps)

- Step 1: Welcome — "Hi, I'm Nick. Let me learn about you so I can cook for you."
- Step 2: Taste fingerprint — 8 flavor chips (Spicy, Sweet, Umami, Bitter, Sour, Smoky, Herby, Rich). Pick ≥3. Single-tap toggle. Skip allowed (defaults work).
- Step 3: Dietary needs — Vegetarian, Gluten-free, Allergens (peanuts, shellfish, dairy, eggs). On/off toggles. Optional.
- Step 4: Kitchen tools — quick checklist (stovetop, oven, microwave, blender, food processor, instant pot, cast iron, etc). Optional but improves recommendations.
- Progress dots at top. Skip button always visible top-right.
- CTA disabled until ≥1 selection on the current step.
- On finish: write to user profile, route to Home.

### 7.2 Home

- Header: "AI Chef" wordmark left (taps return to top), bell icon top-right (unread dot indicator).
- Greeting changes by time of day: GOOD MORNING / GOOD AFTERNOON / GOOD EVENING.
- Hero "For You" carousel ~40% screen height. Horizontally swipeable. 3-dot pagination, active dot elongates. Peek of next card visible.
- Each hero card: dish image, name, meta line (e.g. "30 min · high protein"). Tap routes to Recipe Detail.
- Hero recommendations come from semantic recipe ranking against user's Taste Fingerprint embedding.
- "Browse" 2x2 category grid: Healthy, Snacks, Gourmet, Random/Surprise. Subtle fill, each tile = icon + name + subtitle.
- Bottom nav: 5 tabs — Home, Past Meals, Nick Chat (center, elevated FAB), Browse, Profile. Center FAB is the primary CTA.

### 7.3 Home — offline state

- Top banner with dashed border: "You're offline · showing cached recommendations" + retry chip.
- Empty state mid-screen: "Nick can't reach the kitchen" + "your last 5 saved recipes still work offline · cooking mode is fully cached."
- Two CTAs: "View saved" (secondary, dashed) + "Try again" (primary, dark fill).
- Last 5 saved recipes accessible. Cook mode for those recipes works offline (steps, timers, TTS pre-cached).

### 7.4 Nick chat

- Header: "Nick · your AI chef" + "online · learns from you" subtitle. Settings gear top-right. Close (X) top-left slides chat down to last tab.
- Chef-hat avatar consistent across app.
- User messages right-aligned (dark fill). Nick messages left-aligned (white).
- Recipe cards rendered inline in chat: dish image, title, meta ("22 min · uses 6/8 of your fridge"), 3 buttons — Cook this (primary), Swap, Why?
- "Why?" chip → Nick explains the recommendation in plain language.
- Suggested prompts strip above composer, scrolls horizontally (e.g. "something quick," "only what's in my fridge," "comfort food").
- Composer: mic button (voice input via Web Speech API or Whisper), text field, send button. One of each always visible.
- Typing indicator: 3-dot loop while Nick generates.
- Message history persists per user via Supabase + Qdrant memory layer.

### 7.5 Nick loading state

- Header: "Nick is thinking · looking through 12 dishes" (dynamic count).
- Spinning dashed ring + sparkle pulse animation.
- Skeleton bars hint at incoming content shape.
- Subtitle swaps as task progresses (e.g. "checking your taste preferences" → "matching to your fridge" → "writing the recipe").

### 7.6 Recipe detail

- Hero food shot 200px tall, scrolls under header on scroll-up (parallax).
- Top-right: Heart (save), Share (system share sheet).
- Title + subtitle ("recommended by Nick · matches: spicy, umami").
- 3 meta cards: Time, Energy (kcal), Servings. Tap "servings" → scale recipe up/down (re-calc all ingredient quantities).
- 3 swipeable tabs: Ingredients, Steps, Notes.
- Ingredients tab: checkbox per item = "I have it." Strikethrough on check. Quantities right-aligned.
- "Add missing to list" button (dashed) → unchecked items added to Shopping List.
- "Swap an item" button (dashed) → opens chat with Nick asking for substitutions for selected ingredient.
- Bookmark icon left of CTA (saves recipe).
- "Start cooking" primary CTA → routes to Cook Mode (full screen).

### 7.7 Cook Mode

- Segmented progress bar at top — one segment per step, current filled.
- Step label: "STEP 3 OF 5 · MISO SALMON" (small caps).
- Step title: large readable type. Step body: full instruction text.
- Hero step image (visual reference).
- TTS read-aloud auto-starts on step entry. Volume icon top-right toggles voice on/off ("cook from across kitchen" mode).
- Voice playback uses Nick's ElevenLabs cloned voice.
- Auto-detected timer — parses step text for "X minutes/seconds." Renders circular timer on right with countdown, label (e.g. "4-minute sear"), status text ("flip when timer rings").
- Pause/resume timer.
- Audio chime when timer ends.
- Voice navigation: "next," "repeat," "back" via Web Speech API (mic indicator while listening).
- Tap "Next step" primary CTA. Back arrow left of CTA goes to previous step.
- Screen wake-lock active (phone never sleeps mid-cook).
- X top-left exits cook mode, with confirmation modal to prevent accidental exits.
- Final step → finish screen: "Nice work" + rating prompt + "Save to Past Meals."

### 7.8 Past Meals

- Header: "Past meals · Nick learns from your history."
- Stats strip: count this week, average rating, reorder count.
- Filter button top-right → sheet (cuisine, rating, time).
- Grouped by recency: TODAY, YESTERDAY, THIS WEEK, EARLIER.
- Each row: thumbnail, name, time, star rating, "Cook again" chip (one-tap reorder), chevron right.
- Empty state: dashed circle + clock icon, "No meals yet," CTA "Ask Nick for an idea" → chat.
- Every cooked meal feeds back into the memory layer (Qdrant) for future personalization.

### 7.9 Browse

- Header: "Browse · all categories & filters."
- Filter chips horizontal scroll: active = filled, inactive = outlined.
- Search action top-right → Search screen.
- Category grid (denser than home): Healthy, Snacks, Gourmet, Vegetarian, <30 min, Surprise.
- Live count under each category name.
- Tap tile → search results pre-filtered to that category.

### 7.10 Search

- Inline back chevron + dismissible search field (current query visible).
- Result count: "34 results · 'chicken'."
- Sort chip top-right: Best match (default, personalized via Taste Fingerprint embedding) → tap for other modes (Newest, Quickest).
- "Hot" chip on top-ranked results = personalized match.
- "In your fridge" badge on results that match scanned ingredients.
- Each result row: thumbnail, name, meta line.
- Backed by Qdrant semantic search across recipe library + user fingerprint.

### 7.11 Surprise Me

- Large dice icon, spins on entry (~700ms). Subtitle "shaking 12,890 ideas..."
- Result fades in: dish image, name, meta tags.
- Shake-to-reroll gesture (DeviceMotion API). Re-roll secondary button.
- "Cook this" primary CTA, equal weight to Re-roll.
- Always respects diet/allergens — never shows blocked items.

### 7.12 Profile

- Avatar circle (initial-based).
- Name + meta ("Alex P. · 34 meals · joined Mar '26"). Edit profile chip.
- Taste Fingerprint section: live state of onboarding selections. Tap any chip to remove. "+ add" chip to add new flavors.
- Settings rows (each pushes its own screen): Dietary needs, Kitchen tools, Notifications, Shopping list sync, Privacy & data.
- Gear icon top-right → app-level settings (theme, sign out, etc).

### 7.13 Notifications inbox

- Filter chips: All / Nick / Reminders.
- Each card: icon, title, time/subtitle. Unread = white card + dot. Read = soft-fill, no dot.
- Sources: Nick recipe suggestions, scheduled cook reminders, curated content drops, shopping list ready.
- Empty footer when scrolled to end: "that's everything for now."

### 7.14 Shopping List

- Header: "Shopping list · 3 recipes · 14 items." Sync icon top-right.
- Filter chips: All / Produce / Pantry / Protein.
- Auto-grouped sections (Produce / Pantry / Protein), based on ingredient categorization.
- Each row: checkbox, item, quantity. Checked = strikethrough + soft fill.
- "+ add an item" dashed input row at bottom of each section.
- Bottom CTA: sync to Apple Reminders (or other OS list app).
- Items added automatically when user taps "Add missing to list" on Recipe Detail.

### 7.15 Fridge scan flow (4 sub-screens)

- Trigger: camera button in Nick chat composer, or from Home ("What's in your fridge?" prompt).
- Permission prompt: explains why camera is needed.
- Camera view: live preview, capture button, flip camera, manual upload fallback.
- Capture → sends image to OpenAI GPT-4o Vision via /api/scan.
- Vision API returns ingredient JSON: `{ ingredients: [{ name, confidence }] }`.
- Ingredient editor screen: list of detected items, low-confidence flagged. Tap to remove. Manual add input at bottom.
- Confirm → ingredients pushed back into chat context. Nick suggests 3 recipes from his library that maximize ingredient overlap.
- Persistent fridge state: latest scan saved per user, surfaces as "In your fridge" badge across Search and Recipe Detail.

---

## 8. Cross-cutting capabilities

- **Memory layer (Qdrant):** Every Nick chat exchange, meal cooked, rating, and Taste Fingerprint update gets embedded and stored. Retrieval injects the top 5 most relevant memories into Nick's system prompt on every turn. This is what makes Nick "learn" the user.
- **Semantic recipe search (Qdrant):** All recipes embedded on insert. Search and Browse use vector similarity for ranking. Falls back to Postgres tsvector for exact name match.
- **Personalization engine:** Taste Fingerprint stored as embedding. Hero carousel + "Hot" chip in search use cosine similarity between fingerprint and recipe embeddings.
- **Diet/allergen filter:** Applied globally. Surprise Me, Browse, Search, and recommendations all filter the recipe set before ranking. Never shown to user as a hidden item.
- **TTS pipeline:** Step text → ElevenLabs streaming TTS with Nick's voice ID → HTMLAudioElement playback. Common phrases (greetings, transitions) pre-cached as static MP3s for zero-latency feel.
- **STT pipeline:** Web Speech API for low-latency commands in Cook Mode. OpenAI Whisper for higher-accuracy chat input.
- **Camera & vision:** getUserMedia in mobile browser → canvas frame → base64 → GPT-4o Vision API. HTTPS required (Vercel handles).
- **Offline cache:** Service worker caches last 5 saved recipes + their step images + pre-generated TTS audio. Cook Mode fully functional offline for those recipes.
- **Push notifications:** Web Push API. Server-side scheduler triggers Nick suggestion pushes (e.g. evening dinner ideas), cook reminders (user-scheduled), shopping list ready.
- **OS integrations:** Apple Reminders for shopping list (deep link via x-apple-reminderkit:// or copy-to-clipboard fallback). System share sheet on Recipe Detail.
- **Device motion:** DeviceMotionEvent for shake-to-reroll on Surprise Me. Permission prompt on first use.
- **Time-of-day awareness:** Greeting changes morning/afternoon/evening based on local time. Influences Nick's tone in chat (lighter mornings, dinner-focused evenings).
- **Screen wake-lock:** `navigator.wakeLock.request('screen')` on Cook Mode mount, released on exit.

## 9. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind | PWA-ready, fast iteration, hosting on Vercel free tier, App Router for streaming |
| Hosting | Vercel (private deployment, password-protected if shared) | Zero-config Next.js hosting, auto HTTPS, preview deploys for testing |
| Auth + DB | Supabase (Postgres + Auth + Storage + Realtime) | Free tier covers v1, email/password out of the box, RLS policies for security |
| Vector DB | Qdrant Cloud (free tier) | Memory layer + semantic search, both use cases. Open-source, hosted free tier |
| Chat LLM | OpenAI GPT-4o | Same provider as vision and Whisper, single key. Tone quality acceptable for alpha. Revisit Anthropic for v2. |
| Vision | OpenAI GPT-4o Vision | Strong ingredient detection from fridge photos, structured JSON output |
| STT (chat) | OpenAI Whisper API | Higher accuracy than browser Web Speech for variable accents/kitchen noise |
| STT (cook mode) | Web Speech API (browser native) | Low latency for short commands ("next," "repeat"). Fallback to Whisper if poor. |
| TTS / voice clone | ElevenLabs (Instant Voice Clone) | Best-in-class voice clone quality from short audio samples, streaming endpoint <1.2s latency |
| Embeddings | OpenAI text-embedding-3-small | Cheap, 1536 dims, good quality. Used for both memory and recipe vectors. |
| State | React Server Components + Zustand for client state | RSC for data fetching, Zustand for chat composer / cook mode local state |
| Service worker | Workbox via next-pwa | Offline cache for last-5 recipes, install-to-home-screen |
| Repo | Private GitHub repo (gh CLI authenticated) | Internal-only, no public access, controlled collaborators |

## 10. Data model

High-level schema. Implementation details (column types, indexes, RLS policies) belong in the build phase docs, not here.

### Postgres (Supabase)

- **profiles** — user_id (PK, FK auth.users), display_name, avatar_initial, taste_fingerprint (text[]), dietary_flags (jsonb), allergens (text[]), kitchen_tools (text[]), joined_at, meals_count.
- **recipes** — id, title, slug, description, hero_image_url, time_minutes, kcal, base_servings, difficulty, cuisine, tags (text[]), categories (text[]), ingredients (jsonb — array of {name, quantity, unit, optional}), steps (jsonb — array of {title, body, image_url, timer_seconds?}), notes, created_at.
- **chat_messages** — id, user_id, role (user|assistant), content, recipe_card_ids (uuid[] nullable), created_at.
- **cook_sessions** — id, user_id, recipe_id, started_at, completed_at, current_step, rating (1–5 nullable), notes.
- **fridge_scans** — id, user_id, scanned_at, ingredients (jsonb — array of {name, confidence, edited}), source_image_path.
- **shopping_list_items** — id, user_id, source_recipe_id (nullable), name, quantity, unit, category (produce|pantry|protein), checked, added_at.
- **notifications** — id, user_id, type (suggestion|reminder|system), title, body, read, scheduled_for, created_at.
- **saved_recipes** — user_id, recipe_id, saved_at (composite PK).

### Qdrant collections

- **recipes_v1** — vector for each recipe (embedding of title + description + tags + ingredients). Payload: recipe_id, title, cuisine, tags, time_minutes, dietary_flags.
- **user_memory** — vector per memory (chat exchanges, cooked meals, ratings, fingerprint updates). Payload: user_id, memory_type (chat|meal|rating|fingerprint), content, created_at, source_id.

### Why Qdrant for memory

LLM context windows are finite. As a user accumulates conversations and cooked meals, you can't stuff all of it into Nick's system prompt. Qdrant solves this: every new chat turn embeds the user's current message, retrieves the top 5 most relevant past memories, injects them into the prompt as "things you remember about this user." Nick's continuity is built on this layer.

## 11. AI behavior — Nick's system

### System prompt structure

1. Persona block: who Nick is, how he talks, what he loves, what he refuses to do.
2. User profile block (injected per-request): name, taste fingerprint, dietary flags, allergens, kitchen tools.
3. Memory block (injected per-request): top 5 retrieved memories from Qdrant for this turn.
4. Fridge state block (injected if recent scan exists): current ingredients in user's fridge.
5. Recipe context block (injected when recommending): top 5 candidate recipes from Qdrant with their full metadata.
6. Tools block: available function calls (suggest_recipes, search_recipes, get_recipe, request_substitution, save_to_shopping_list).
7. Response format rules: when to render inline recipe cards vs plain text, max 3 recipes per turn, etc.

### Tool calls

- **suggest_recipes(intent, count=3)** — returns top N recipes given user's current ask + fingerprint + fridge.
- **search_recipes(query, filters)** — semantic search.
- **get_recipe(recipe_id)** — fetches full recipe for inline rendering.
- **request_substitution(ingredient, recipe_id)** — Nick suggests 1–2 swaps.
- **save_to_shopping_list(items)** — writes items to user's shopping list.

### Constraints

- Max response length: 200 words for chat replies. Recipe cards count toward UI but not word budget.
- Always return at most 3 recipe cards per turn (UI constraint and avoids overwhelming user).
- If user asks something off-topic (politics, news, medical), Nick redirects warmly: "Not my arena — but if you want to talk about what's for dinner, I'm in."
- If user has allergens flagged, Nick will not recommend recipes containing them. He will mention this naturally if relevant: "You're shellfish-free, so I'm leaving the prawn out and going with chicken."
- If a tool call fails (Qdrant down, OpenAI rate limit), graceful degradation: show user a soft error in chat, not a stack trace.

## 12. Non-functional requirements

- **Performance:** Home screen loads <2s on 4G. Chat first token <2s. Cook mode step transition <300ms. TTS playback start <1.2s after step entry.
- **Reliability:** Cook mode must not crash mid-recipe. Service worker caches last-5 recipes. App degrades gracefully when offline.
- **Privacy:** User chat history stored encrypted at rest (Supabase default). RLS policies on every table — a user can only read/write their own rows. Fridge images deleted from Supabase Storage 30 days after scan.
- **Security:** All API routes server-side. No OpenAI/ElevenLabs/Qdrant keys exposed to client. Supabase anon key client-side is fine (RLS enforces access).
- **Mobile-first:** 375px base width. All interactions thumb-reachable. No hover dependencies. Tap targets ≥44px.
- **Accessibility:** Min contrast 4.5:1. ARIA labels on icon buttons. Cook mode text ≥18px. Voice mode does not require sight.
- **Cost ceiling (alpha):** <$50/month at 20 active users. Set OpenAI usage caps. ElevenLabs free tier covers ~10K chars/month — may need paid plan during heavy testing.

## 13. Risks & open questions

- **Voice latency in cook mode.** ElevenLabs streaming claims <1.2s but real-world with mobile network is unproven. Mitigation: pre-cache common phrases, run a latency spike before phase 6.
- **iOS Safari audio autoplay restrictions.** First user tap unlocks audio context. Cook mode entry must include a "start" tap to enable TTS. Solved pattern, but easy to miss.
- **Voice clone quality from YouTube audio.** Music, intros, multiple voices in clips. May need 2–3 hours of source audio cleaned manually. If quality is poor, fall back to a generic high-quality TTS voice for alpha and document the gap.
- **Vision accuracy on real fridges.** GPT-4o Vision is good but not perfect on cluttered fridges. Confidence threshold + user editing screen is the safety net. Track false-positive/negative rates in alpha.
- **Qdrant memory retrieval relevance.** Naive top-5 retrieval can pull old, irrelevant memories. May need recency bias or memory decay. Tune in alpha.
- **Apple Reminders deep link unreliable on web.** Fallback: copy-to-clipboard with toast "Copied. Open Reminders to paste." Acceptable for alpha.
- **Legal: Nick's likeness.** Internal alpha is defensible. Any external exposure (TestFlight beyond family, Vercel public URL, social posts) requires written consent. Hard line.
- **Cost runaway.** OpenAI + ElevenLabs + Qdrant all on usage-based pricing. Set hard caps in each provider's dashboard. Monitor weekly during alpha.

## 14. Success criteria for v1

Alpha is "shipped" when:

1. A new tester can sign up, complete onboarding, and reach Home in under 90 seconds.
2. Tester can scan their fridge, get an ingredient list back in <5s, edit it, and receive 3 recipe suggestions from Nick that use what they have.
3. Tester can pick a recipe, enter cook mode, and complete the recipe end-to-end without touching the screen mid-cook (voice navigation works, timers fire, TTS reads each step).
4. Tester can chat with Nick. Nick remembers their last conversation in their next session (memory layer working).
5. Tester can save a recipe and access it offline.
6. All 16 designed screens render correctly on iPhone Safari and Android Chrome at 375px and 412px.
7. No PII or API key leaks in client bundle (verified via build inspection).

---

# Part 2 — Build Phases

Each phase is a discrete, shippable unit. Each becomes its own build prompt for Claude Code in your IDE.

## How phases work

- Phases are sequential. Don't start phase N+1 until phase N has its checkpoint passing.
- Each phase has: goal, what gets built, dependencies on previous phases, definition of done, time estimate.
- Total estimate: 25–35 hours of focused build time across 2–3 days. Solo, with Claude Max.
- After each phase: commit, push, update `.claude/changelog.md`, update `.claude/context.md` if scope shifted.

---

## Phase 0 — Foundations

- **Goal:** Functional Next.js app on localhost, connected to Supabase, with auth working. "Hello, signed in user" page displays.
- **Estimate:** 1.5–2 hours.
- **Dependencies:** All API keys in hand (Supabase, OpenAI, ElevenLabs, Qdrant). Nick audio not needed yet.

### Build

1. Scaffold: `npx create-next-app@latest nick-ai` with TypeScript, Tailwind, App Router, src/, ESLint, default import alias.
2. Initialize git, create private repo with gh, push first commit.
3. `.env.local` with: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, `QDRANT_URL`, `QDRANT_API_KEY`.
4. Install: `@supabase/supabase-js`, `@supabase/ssr`, `openai`, `@qdrant/js-client-rest`, `zustand`, `lucide-react`, `sonner`.
5. Supabase client setup: `src/lib/supabase/client.ts` (browser) and `src/lib/supabase/server.ts` (server).
6. Middleware: `src/middleware.ts` — redirects unauthenticated users from protected routes to `/signin`.
7. Routes: `/signup`, `/signin`, `/` (protected). Email/password forms. Sign-out button.
8. Tailwind config: mobile-first base, design tokens for colors/spacing matching the wireframe aesthetic.

### Definition of done

- `npm run dev` → localhost:3000 → redirects to `/signin` if not logged in.
- Sign up with email/password → confirms → redirects to `/`.
- `/` shows "Hello, [user email]" + sign-out button.
- All keys in `.env.local`. None exposed to client bundle (verified via build output).

---

## Phase 1 — Database schema & seed

- **Goal:** All Supabase tables created with RLS policies. 30+ Nick recipes seeded. Qdrant collections initialized. Recipe vectors loaded.
- **Estimate:** 2–3 hours.
- **Dependencies:** Phase 0 complete.

### Build

1. SQL migration in Supabase dashboard: profiles, recipes, chat_messages, cook_sessions, fridge_scans, shopping_list_items, notifications, saved_recipes.
2. RLS policies: each table allows SELECT/INSERT/UPDATE/DELETE only where `user_id = auth.uid()`. Recipes table: SELECT for all authenticated users (read-only).
3. On signup trigger: insert profile row with default values.
4. Recipe seed: write 30 of Nick's signature dishes (research from his YouTube — smashburger, salmon, pasta carbonara, etc). Use Claude in your IDE to generate the JSON. Each: title, description, hero_image_url (placeholder OK for now), time, kcal, servings, difficulty, cuisine, tags, ingredients[], steps[], notes.
5. Qdrant: create `recipes_v1` collection (1536 dims, cosine). Embed each recipe's (title + description + tags + ingredient names) using OpenAI text-embedding-3-small. Upsert with payload {recipe_id, title, time, dietary_flags, cuisine, tags}.
6. Qdrant: create `user_memory` collection (1536 dims, cosine). Empty for now.
7. API route `/api/admin/seed` for re-running seeds (dev only, gated).

### Definition of done

- Tables exist with correct schemas. RLS verified by attempting cross-user reads (should fail).
- 30 recipes in Postgres. 30 vectors in Qdrant `recipes_v1` collection.
- Sign up new user → profile row auto-created.

---

## Phase 2 — Onboarding flow

- **Goal:** First-time users complete the 4-step onboarding. Taste fingerprint and dietary data persist to profile.
- **Estimate:** 2 hours.
- **Dependencies:** Phase 1 complete.

### Build

1. Detect first-time user (`profile.taste_fingerprint` is empty) → redirect to `/onboarding`.
2. Routes: `/onboarding/welcome`, `/onboarding/taste`, `/onboarding/dietary`, `/onboarding/tools`.
3. Shared layout: progress dots top, Skip button top-right, mobile-first.
4. Taste step: 8 chips, single-tap toggle, CTA disabled until ≥1 selected.
5. Dietary step: toggle rows + allergen multiselect.
6. Tools step: checklist of common kitchen equipment.
7. On finish: PATCH profile with all collected data + embed taste fingerprint to Qdrant `user_memory` as a `memory_type='fingerprint'` record. Redirect to `/`.

### Definition of done

- New user → onboarding → home. Profile has taste_fingerprint, dietary_flags, allergens, kitchen_tools populated.
- Returning user skips onboarding.

---

## Phase 3 — Home + Browse + bottom nav shell

- **Goal:** User lands on Home, sees personalized hero carousel, category grid, working bottom nav. Browse and category-filter screens functional.
- **Estimate:** 3–4 hours.
- **Dependencies:** Phase 2 complete.

### Build

1. Bottom nav component: 5 tabs, center FAB elevated, persistent across all main screens.
2. Home page: time-of-day greeting, hero carousel (Embla Carousel), 2x2 category grid.
3. Personalized hero ranking: query Qdrant `recipes_v1` with user's taste fingerprint embedding, top 5 results filtered by dietary flags.
4. Category grid: each tile routes to `/browse?category=[name]`.
5. `/browse` page: full grid (Healthy, Snacks, Gourmet, Vegetarian, Quick, Surprise), filter chips, search action top-right.
6. `/browse?category=X`: server fetches recipes for that category, renders list.
7. Notifications bell links to `/notifications` (placeholder for now — phase 11).

### Definition of done

- Home loads with personalized hero based on taste fingerprint.
- All 4 category tiles route correctly. Browse shows all categories with live counts.
- Bottom nav navigates between Home, Past Meals (placeholder), Chat (placeholder), Browse, Profile (placeholder).

---

## Phase 4 — Recipe Detail + Cook Mode (no voice yet)

- **Goal:** User can tap a recipe, view full detail, scale servings, toggle ingredient checkboxes, and enter Cook Mode. Cook mode steps through visually with timers.
- **Estimate:** 4–5 hours.
- **Dependencies:** Phase 3 complete. No voice clone needed yet — use generic browser TTS as placeholder.

### Build

1. `/recipes/[id]`: hero image (parallax), title, subtitle, 3 meta cards, 3 swipeable tabs (Ingredients/Steps/Notes).
2. Servings scaler: tap servings card → stepper modal. All ingredient quantities recompute via formula.
3. Ingredient checkboxes ("I have it") with strikethrough. "Add missing to list" appends unchecked items to shopping_list_items.
4. "Swap an item" → routes to chat with prefilled prompt: "What can I use instead of [ingredient] in [recipe]?"
5. Heart save → toggles saved_recipes row. Share → `navigator.share()` with recipe URL.
6. `/cook/[id]`: full-screen cook mode. Segmented progress bar. Step label, title, body, image.
7. Step navigation: tap Next, tap Back, tap Repeat-current. Confirmation modal on X exit.
8. Auto-detect timers: regex parse step body for `/(\d+)\s*(min|minute|seconds?)/i`. Render circular timer (use a lightweight library or custom SVG ring).
9. Audio chime on timer end (Web Audio API, simple oscillator).
10. Screen wake-lock on mount (`navigator.wakeLock.request('screen')`), released on unmount.
11. Use `SpeechSynthesisUtterance` (browser native) as placeholder TTS. Voice icon top-right toggles on/off. ElevenLabs swap happens in phase 9.
12. On final step: "Nice work" screen, 5-star rating prompt, "Save to Past Meals." Writes cook_sessions row + `memory_type='meal'` record to Qdrant.

### Definition of done

- Recipe detail fully functional. Servings scaling works. Save and share work.
- Cook mode: step through end-to-end without touching screen except Next/Back. Timers fire. TTS reads each step (browser voice for now). Wake-lock prevents sleep. Rating saves to DB.

---

## Phase 5 — Nick chat (text + memory layer)

- **Goal:** User can chat with Nick. Nick replies in character. Recipe cards render inline. Memory layer working — Nick remembers prior conversations across sessions.
- **Estimate:** 5–7 hours. The longest phase.
- **Dependencies:** Phase 4 complete. Recipes embedded in Qdrant. User profile populated.

### Build

1. `/chat` page: full-screen mobile chat, header with Nick avatar/title, X close top-left, settings gear top-right.
2. Composer: mic button + text field + send. Suggested prompts strip above (3–5 horizontally scrollable starters).
3. API route `/api/chat` (server): receives user message, runs the full pipeline.
4. Pipeline: (a) embed user message via OpenAI text-embedding-3-small. (b) Qdrant query `user_memory` filtered by user_id, top 5. (c) Qdrant query `recipes_v1` if user intent looks recipe-related, top 5 candidates. (d) Build full system prompt with persona block + user profile block + memory block + fridge state block + recipe candidates. (e) Call OpenAI gpt-4o with tool definitions.
5. Tool handlers (server): suggest_recipes, search_recipes, get_recipe, request_substitution, save_to_shopping_list. Each returns structured data Nick formats into chat.
6. Inline recipe cards in chat: when Nick calls suggest_recipes, render dish image + title + meta + Cook this/Swap/Why? buttons. "Cook this" routes to `/recipes/[id]`.
7. Streaming response: use OpenAI streaming, render Nick's text token-by-token. Typing indicator while waiting for first token.
8. Persistence: every user message + Nick reply written to chat_messages. Also embedded and upserted to Qdrant `user_memory` with `memory_type='chat'`.
9. On chat page mount: load last 50 messages from chat_messages.
10. Voice input via mic button: use Web Speech API for quick recording → send to Whisper API → transcribe → inject into composer.
11. "Why?" chip on a recipe card: client sends a follow-up message "Why this recipe?" with recipe_id context.

### Definition of done

- Send message — Nick replies in character within 3 seconds first token.
- Ask "what should I make tonight" — Nick suggests 3 recipes inline, all match user's dietary flags.
- Ask a question, close app, return next day, send a related message — Nick references the prior conversation (memory works).
- Mic button records voice, transcribes via Whisper, populates composer.
- Off-topic question ("what's the weather") — Nick redirects warmly to cooking.

---

## Phase 6 — Fridge scan flow

- **Goal:** User taps camera button in chat → opens camera → scans fridge → sees ingredient list → edits → confirms → Nick suggests recipes that maximize ingredient usage.
- **Estimate:** 3–4 hours.
- **Dependencies:** Phase 5 complete. HTTPS required (Vercel preview deploy or local with self-signed cert).

### Build

1. Camera button in chat composer. Tap → routes to `/scan`.
2. `/scan/permission`: explainer screen → "Allow camera" CTA. Browser permission prompt.
3. `/scan/capture`: `getUserMedia({ video: { facingMode: 'environment' } })`, live preview, capture button (large center FAB), flip camera button, manual upload fallback.
4. Capture: draw video frame to canvas, toBlob → base64 → POST to `/api/scan`.
5. API route `/api/scan`: receives image, calls OpenAI gpt-4o with vision and structured output prompt: `"Identify ingredients visible. Return JSON: {ingredients: [{name: string, confidence: 0-1}]}. Only common food ingredients."`
6. Save image to Supabase Storage (bucket 'fridge-scans' with 30-day TTL policy).
7. `/scan/confirm`: list of detected ingredients. Low-confidence (<0.7) flagged with warning icon. Tap to remove. Manual add input. Confirm button.
8. On confirm: save fridge_scans row, update user's latest fridge state (used by chat pipeline). Route back to `/chat` with system message: "You scanned your fridge. Nick has 3 ideas." Triggers an automatic chat turn.

### Definition of done

- Camera permission prompts on first use, persists thereafter.
- Scan a real fridge → ingredient list appears in <5s with reasonable accuracy.
- Edit list → confirm → Nick suggests 3 recipes that use those ingredients.
- Manual upload fallback works when camera denied.

---

## Phase 7 — Past Meals + Surprise Me

- **Goal:** Past Meals tab shows cooking history with stats and ratings. Surprise Me dice flow works with shake-to-reroll.
- **Estimate:** 2–3 hours.
- **Dependencies:** Phase 4 (cook sessions exist). Phase 5 (recipes searchable).

### Build

1. `/past-meals`: query cook_sessions for user, group by recency. Stats strip: count this week, avg rating, reorder count.
2. Each row: thumbnail, name, time, star rating, Cook again chip (re-routes to `/cook/[id]`), chevron → `/recipes/[id]`.
3. Filter sheet: cuisine multiselect, rating range, time range. Modal slide-up.
4. Empty state: dashed circle + clock icon, CTA "Ask Nick for an idea" → chat.
5. `/surprise`: dice icon spins on entry, fades in random recipe respecting diet/allergens.
6. Random pick algo: Postgres recipes filtered by user's dietary flags → ORDER BY random() LIMIT 1. (Postgres random is fine for v1.)
7. Re-roll button + DeviceMotionEvent shake detection (threshold-based). First-use permission prompt for motion.

### Definition of done

- Cook a recipe end-to-end — it appears in Past Meals with correct rating.
- Cook again chip works.
- Surprise Me serves a random recipe respecting dietary flags. Shake-to-reroll triggers on physical shake.

---

## Phase 8 — Profile + Shopping List + Notifications

- **Goal:** All settings screens functional. Shopping list aggregates, syncs to OS. Notifications inbox shows scheduled and triggered notifications.
- **Estimate:** 3–4 hours.
- **Dependencies:** Phase 4 (Add to list works from Recipe Detail). Phase 7.

### Build

1. `/profile`: avatar, name, meta line, Edit profile chip. Taste Fingerprint chip editor (live save on toggle). Settings rows.
2. `/profile/dietary`: full dietary editor, save on change.
3. `/profile/tools`: kitchen tools checklist.
4. `/profile/notifications`: toggles for each notification type.
5. `/profile/shopping-sync`: pick OS reminders integration (Apple Reminders default, Google Tasks alt).
6. `/profile/privacy`: data export (JSON download), account deletion (with confirm).
7. `/shopping-list`: query shopping_list_items for user, group by category. Checkbox toggle. + add row at bottom of each section.
8. Sync CTA: build `x-apple-reminderkit://` deep link or copy-to-clipboard fallback with toast.
9. `/notifications`: query notifications table, render cards. Filter chips: All / Nick / Reminders.
10. Server-side notification scheduler: cron-like job (Vercel Cron or Supabase Edge Function on schedule). Daily 6pm: insert "Nick has 3 dinner ideas for tonight" notification per active user with personalized recipes.
11. Web Push API: register service worker, request permission, store push subscription per user. Send pushes when notifications inserted.

### Definition of done

- All Profile rows pushable, all settings persist.
- Add 3 ingredients from a recipe to shopping list → they appear grouped correctly. Sync to Apple Reminders works (or copy-to-clipboard fallback).
- Daily cron triggers "Nick has 3 ideas" notification — visible in inbox + push notification fires (if granted).

---

## Phase 9 — Nick voice clone + ElevenLabs integration

- **Goal:** Replace placeholder browser TTS with Nick's actual cloned voice. Cook mode reads steps in his voice. Chat optionally plays Nick replies aloud.
- **Estimate:** 2–3 hours (after audio prep done).
- **Dependencies:** Audio prep done offline before this phase — 30+ min Nick MP3 ripped from YouTube via yt-dlp + ffmpeg, music/intros stripped.

### Audio prep (offline, before phase 9)

- `yt-dlp -x --audio-format mp3 --audio-quality 0 [URL]` for 5–10 of his solo-talking videos.
- `ffmpeg -ss [start] -to [end]` to clip out only Nick speaking, no music.
- Stitch into one MP3, ~30–60 minutes.
- Upload to ElevenLabs Voice Lab → Instant Voice Clone (or Professional for better quality). Save voice ID.

### Build

1. Add `ELEVENLABS_VOICE_ID` to `.env.local`.
2. API route `/api/tts`: accepts {text, voice_id}, calls ElevenLabs streaming endpoint, returns audio stream.
3. Cache common phrases as static MP3s in `/public/audio/` (greetings, transitions, "nice work," etc). Generate once, commit to repo.
4. Cook mode: replace `SpeechSynthesisUtterance` with `/api/tts` call. HTMLAudioElement plays returned stream.
5. First-tap audio unlock: on cook mode entry, require user tap "Start cooking" to unlock audio context (iOS Safari).
6. Chat: optional toggle "Play Nick's voice on responses" — when on, every Nick reply also calls `/api/tts` and auto-plays.
7. Latency budget: pre-generate next step's audio while user is on current step (background fetch).

### Definition of done

- Cook mode reads steps in Nick's voice with <1.5s start latency.
- Voice quality is recognizably Nick (subjective — you decide).
- First-step tap-to-start works on iOS Safari.
- Common phrases play instantly (cached).

---

## Phase 10 — Voice navigation in Cook Mode

- **Goal:** User says "next," "repeat," "back" — cook mode advances/replays/reverses without touching screen.
- **Estimate:** 2 hours.
- **Dependencies:** Phase 9 complete.

### Build

1. Web Speech Recognition API: continuous listening mode while in cook mode.
2. Wake word optional for v1 — can require a mic-on toggle button. Press to activate, press again to deactivate.
3. Recognized commands: "next," "next step," "repeat," "again," "back," "previous," "pause," "resume."
4. Visual indicator when listening (mic icon pulse).
5. Fallback: if browser doesn't support Web Speech, hide mic button, force tap navigation.

### Definition of done

- Say "next" → advances. Say "repeat" → re-plays current TTS. Say "back" → previous step.
- Works hands-free at typical kitchen distance (1–2m from phone).
- Doesn't trigger on Nick's voice playing through speaker (basic anti-feedback — pause listening while TTS plays).

---

## Phase 11 — Offline mode + service worker

- **Goal:** Last 5 saved recipes accessible offline. Cook mode for those recipes works fully offline.
- **Estimate:** 2–3 hours.
- **Dependencies:** All prior phases complete.

### Build

1. Add `next-pwa` with Workbox config.
2. Cache strategies: NetworkFirst for `/api/*`, CacheFirst for `/_next/static`, StaleWhileRevalidate for recipe pages.
3. Pre-cache last-5-saved recipes on app load: fetch their detail JSON, hero images, step images, pre-generated TTS audio for each step.
4. Offline detection: `navigator.onLine` + ping check. When offline, route home to `/home/offline` component (the dashed-border banner state).
5. Manifest.json for install-to-home-screen: name, icons, theme color, display: standalone.
6. "View saved" CTA on offline screen → lists cached recipes → opens cook mode for any (works fully offline).

### Definition of done

- Save 5 recipes → turn on airplane mode → home shows offline banner with retry.
- Open a saved recipe in airplane mode → cook mode works end-to-end including TTS audio.
- App installs to home screen on iOS Safari and Android Chrome (PWA criteria met).

---

## Phase 12 — Polish + bug bash

- **Goal:** Walkthrough survives a 5-minute demo to a stranger. All known bugs squashed. Visual consistency across screens.
- **Estimate:** 3–4 hours.
- **Dependencies:** Phase 11 complete.

### Build

1. Cross-screen audit: open every screen in iPhone Safari and Android Chrome at 375px and 412px. Fix overflow, alignment, font issues.
2. Loading states: every async fetch has a skeleton or spinner.
3. Empty states: every list has a thoughtful empty state (Past Meals, Notifications, Shopping List, Search no-results).
4. Error states: API failures show graceful toast (sonner), not blank screens.
5. Animation polish: page transitions, chip toggle feedback, button press states.
6. Performance: Lighthouse audit on Home, Chat, Cook Mode. Target Performance >85, Accessibility >90.
7. Final pass: README.md with setup instructions, link to `.claude/context.md`, list of features, internal-only disclaimer.

### Definition of done

- All 6 success criteria from PRD section 14 verified in real testing.
- README current. `.claude/changelog.md` reflects every phase.
- Repo is private. No public Vercel URL active.

---

## Phase summary

| Phase | Theme | Hours | Output |
|-------|-------|-------|--------|
| 0 | Foundations | 1.5–2 | Auth working |
| 1 | Schema & seed | 2–3 | 30 recipes loaded |
| 2 | Onboarding | 2 | Profile populated |
| 3 | Home + Browse + nav | 3–4 | Personalized home |
| 4 | Recipe Detail + Cook Mode (no voice) | 4–5 | End-to-end cook flow |
| 5 | Nick chat + memory | 5–7 | Nick is alive |
| 6 | Fridge scan | 3–4 | Vision → recipes |
| 7 | Past Meals + Surprise | 2–3 | History + dice |
| 8 | Profile + Shopping + Notifications | 3–4 | All settings |
| 9 | Voice clone (ElevenLabs) | 2–3 | Nick's real voice |
| 10 | Voice nav in cook mode | 2 | Hands-free |
| 11 | Offline + PWA | 2–3 | Works offline |
| 12 | Polish + bug bash | 3–4 | Demo-ready |
| **Total** | | **34–47 hours** | **Full alpha** |

---

## How to use this PRD with Claude Code

1. At the start of each phase, copy the phase section (goal + build + done) into Claude Code in your IDE as the prompt.
2. Tell Claude Code: "Read `.claude/context.md` and `CLAUDE.md` first. Then build Phase [N] following these specs. After each significant change, show me the diff and explain in 2 lines."
3. After Claude Code completes a phase, run the Definition-of-Done checks yourself before moving on.
4. Update `.claude/changelog.md` with what shipped, what's broken, what's deferred. Update `.claude/context.md` to flip the phase tracker forward.
5. Commit and push after every phase.

---

*End of PRD · v1.0 · April 2026*
