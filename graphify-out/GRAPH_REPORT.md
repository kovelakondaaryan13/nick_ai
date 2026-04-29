# Graph Report - .  (2026-04-23)

## Corpus Check
- Corpus is ~366 words - fits in a single context window. You may not need a graph.

## Summary
- 18 nodes · 20 edges · 4 communities detected
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.68)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `CLAUDE.md Operating Rules` - 4 edges
2. `.claude/changelog.md` - 4 edges
3. `Where Things Belong` - 4 edges
4. `Create New Files When Earned` - 4 edges
5. `Read Before You Write` - 3 edges
6. `.claude/context.md` - 3 edges
7. `Log Every Change Same Turn` - 3 edges
8. `API Keys Policy` - 3 edges
9. `.claude/brand.md` - 2 edges
10. `Answer First Then Update` - 2 edges

## Surprising Connections (you probably didn't know these)
- `CLAUDE.md Operating Rules` --references--> `Read Before You Write`  [EXTRACTED]
  CLAUDE.md → CLAUDE.md  _Bridges community 1 → community 0_
- `Log Every Change Same Turn` --references--> `.claude/changelog.md`  [EXTRACTED]
  CLAUDE.md → CLAUDE.md  _Bridges community 3 → community 1_
- `Where Things Belong` --references--> `.claude/changelog.md`  [EXTRACTED]
  CLAUDE.md → CLAUDE.md  _Bridges community 3 → community 0_
- `Create New Files When Earned` --references--> `.claude/changelog.md`  [EXTRACTED]
  CLAUDE.md → CLAUDE.md  _Bridges community 3 → community 2_

## Hyperedges (group relationships)
- **Doc file routing** — claudemd_where_things_belong, claudemd_context_md, claudemd_brand_md, claudemd_skills_dir, claudemd_changelog_md [EXTRACTED 1.00]
- **Earned-place conditional docs** — claudemd_create_new_files, claudemd_roadmap_md, claudemd_decisions_md, claudemd_competitors_md [EXTRACTED 1.00]

## Communities

### Community 0 - "Source of Truth Docs"
Cohesion: 0.4
Nodes (6): .claude/brand.md, .claude/context.md, Read Before You Write, .claude/skills/, Rationale: Files Are Source of Truth, Where Things Belong

### Community 1 - "Session Workflow Rules"
Cohesion: 0.67
Nodes (4): Answer First Then Update, Docs Style, Log Every Change Same Turn, CLAUDE.md Operating Rules

### Community 2 - "Earned-Place Files"
Cohesion: 0.5
Nodes (4): competitors.md (conditional), Create New Files When Earned, decisions.md (conditional), roadmap.md (conditional)

### Community 3 - "API Keys and Changelog"
Cohesion: 0.5
Nodes (4): API Keys Policy, .claude/changelog.md, .env File, Rationale: Test Keys With Caps

## Knowledge Gaps
- **8 isolated node(s):** `.claude/skills/`, `.env File`, `Docs Style`, `roadmap.md (conditional)`, `decisions.md (conditional)` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `.claude/changelog.md` connect `API Keys and Changelog` to `Source of Truth Docs`, `Session Workflow Rules`, `Earned-Place Files`?**
  _High betweenness centrality (0.662) - this node is a cross-community bridge._
- **Why does `Create New Files When Earned` connect `Earned-Place Files` to `API Keys and Changelog`?**
  _High betweenness centrality (0.331) - this node is a cross-community bridge._
- **Why does `Where Things Belong` connect `Source of Truth Docs` to `API Keys and Changelog`?**
  _High betweenness centrality (0.309) - this node is a cross-community bridge._
- **What connects `.claude/skills/`, `.env File`, `Docs Style` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._