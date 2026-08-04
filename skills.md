This file is a merged representation of the entire codebase, combined into a single document by Repomix.
The content has been processed where security check has been disabled.

<file_summary>
This section contains a summary of this file.

<purpose>
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.
</purpose>

<file_format>
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  - File path as an attribute
  - Full contents of the file
</file_format>

<usage_guidelines>
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.
</usage_guidelines>

<notes>
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Security check has been disabled - content may contain sensitive information
- Files are sorted by Git change count (files with more changes are at the bottom)
</notes>

</file_summary>

<directory_structure>
.agents/
  adr/
    0001-explicit-setup-pointer-only-for-hard-dependencies.md
    0002-ship-as-a-claude-code-plugin.md
  invocation.md
  writing-docs.md
.changeset/
  ask-matt-wayfinder-guidance.md
  codex-skill-metadata.md
  config.json
  friendlier-setup-and-local-tickets.md
  grilling-general-use.md
  prototype-primary-source.md
  README.md
  ship-as-claude-plugin.md
  wayfinder-decision-tickets.md
  wayfinder-research-subagents.md
  yagni-scope-improve-architecture.md
.claude-plugin/
  marketplace.json
  plugin.json
.github/
  workflows/
    release.yml
.out-of-scope/
  mainstream-issue-trackers-only.md
  question-limits.md
  setup-skill-verify-mode.md
docs/
  engineering/
    ask-matt.md
    code-review.md
    codebase-design.md
    diagnosing-bugs.md
    domain-modeling.md
    grill-with-docs.md
    implement.md
    improve-codebase-architecture.md
    prototype.md
    research.md
    resolving-merge-conflicts.md
    setup-matt-pocock-skills.md
    tdd.md
    to-spec.md
    to-tickets.md
    triage.md
    wayfinder.md
  productivity/
    grill-me.md
    grilling.md
    handoff.md
    teach.md
    writing-great-skills.md
scripts/
  link-skills.sh
  list-skills.sh
skills/
  deprecated/
    design-an-interface/
      agents/
        openai.yaml
      SKILL.md
    qa/
      agents/
        openai.yaml
      SKILL.md
    request-refactor-plan/
      agents/
        openai.yaml
      SKILL.md
    ubiquitous-language/
      agents/
        openai.yaml
      SKILL.md
    README.md
  engineering/
    ask-matt/
      agents/
        openai.yaml
      SKILL.md
    code-review/
      agents/
        openai.yaml
      SKILL.md
    codebase-design/
      agents/
        openai.yaml
      DEEPENING.md
      DESIGN-IT-TWICE.md
      SKILL.md
    diagnosing-bugs/
      agents/
        openai.yaml
      scripts/
        hitl-loop.template.sh
      SKILL.md
    domain-modeling/
      agents/
        openai.yaml
      ADR-FORMAT.md
      CONTEXT-FORMAT.md
      SKILL.md
    grill-with-docs/
      agents/
        openai.yaml
      SKILL.md
    implement/
      agents/
        openai.yaml
      SKILL.md
    improve-codebase-architecture/
      agents/
        openai.yaml
      HTML-REPORT.md
      SKILL.md
    prototype/
      agents/
        openai.yaml
      LOGIC.md
      SKILL.md
      UI.md
    research/
      agents/
        openai.yaml
      SKILL.md
    resolving-merge-conflicts/
      agents/
        openai.yaml
      SKILL.md
    setup-matt-pocock-skills/
      agents/
        openai.yaml
      domain.md
      issue-tracker-github.md
      issue-tracker-gitlab.md
      issue-tracker-local.md
      SKILL.md
      triage-labels.md
    tdd/
      agents/
        openai.yaml
      mocking.md
      SKILL.md
      tests.md
    to-spec/
      agents/
        openai.yaml
      SKILL.md
    to-tickets/
      agents/
        openai.yaml
      SKILL.md
    triage/
      agents/
        openai.yaml
      AGENT-BRIEF.md
      OUT-OF-SCOPE.md
      SKILL.md
    wayfinder/
      agents/
        openai.yaml
      SKILL.md
    README.md
  in-progress/
    batch-grill-me/
      agents/
        openai.yaml
      SKILL.md
    claude-handoff/
      agents/
        openai.yaml
      SKILL.md
    loop-me/
      agents/
        openai.yaml
      SKILL.md
    setup-ts-deep-modules/
      agents/
        openai.yaml
      dependency-cruiser.config.cjs
      SKILL.md
    to-questionnaire/
      agents/
        openai.yaml
      SKILL.md
    wizard/
      agents/
        openai.yaml
      SKILL.md
      template.sh
    writing-beats/
      agents/
        openai.yaml
      SKILL.md
    writing-fragments/
      agents/
        openai.yaml
      SKILL.md
    writing-shape/
      agents/
        openai.yaml
      SKILL.md
    README.md
  misc/
    git-guardrails-claude-code/
      agents/
        openai.yaml
      scripts/
        block-dangerous-git.sh
      SKILL.md
    migrate-to-shoehorn/
      agents/
        openai.yaml
      SKILL.md
    scaffold-exercises/
      agents/
        openai.yaml
      SKILL.md
    setup-pre-commit/
      agents/
        openai.yaml
      SKILL.md
    README.md
  personal/
    edit-article/
      agents/
        openai.yaml
      SKILL.md
    obsidian-vault/
      agents/
        openai.yaml
      SKILL.md
    README.md
  productivity/
    grill-me/
      agents/
        openai.yaml
      SKILL.md
    grilling/
      agents/
        openai.yaml
      SKILL.md
    handoff/
      agents/
        openai.yaml
      SKILL.md
    teach/
      agents/
        openai.yaml
      GLOSSARY-FORMAT.md
      LEARNING-RECORD-FORMAT.md
      MISSION-FORMAT.md
      RESOURCES-FORMAT.md
      SKILL.md
    writing-great-skills/
      agents/
        openai.yaml
      GLOSSARY.md
      SKILL.md
    README.md
.gitignore
CHANGELOG.md
CLAUDE.md
CONTEXT.md
LICENSE
package.json
README.md
</directory_structure>

<files>
This section contains the contents of the repository's files.

<file path=".agents/adr/0001-explicit-setup-pointer-only-for-hard-dependencies.md">
# Explicit `/setup-matt-pocock-skills` pointer only for hard dependencies

Engineering skills depend on per-repo config (issue tracker, triage label vocabulary, domain doc layout) seeded by `/setup-matt-pocock-skills`. Some skills cannot meaningfully function without that config — they have to publish to a specific issue tracker or apply a specific label string. Others only use it to sharpen output (vocabulary, ADR awareness) and degrade gracefully without it.

We split these into **hard-dependency** and **soft-dependency** skills:

- **Hard dependency** (`to-tickets`, `to-spec`, `triage`) — include an explicit one-liner: _"… should have been provided to you — run `/setup-matt-pocock-skills` if not."_ Without the mapping, output is wrong, not just fuzzy.
- **Soft dependency** (`diagnose`, `tdd`, `improve-codebase-architecture`) — reference "the project's domain glossary" and "ADRs in the area you're touching" in vague prose only. If the docs aren't there, the skill still works; output is just less sharp.

The split keeps soft-dependency skills token-light and avoids cargo-culting the setup pointer into places where it isn't load-bearing.
</file>

<file path=".agents/adr/0002-ship-as-a-claude-code-plugin.md">
# Ship the skill set as a native Claude Code plugin; defer a native Codex plugin

These skills have always been installable via [skills.sh](https://skills.sh/mattpocock/skills) (`npx skills add mattpocock/skills`), which copies editable skill files into a user's project across Claude Code, Codex, and other Agent-Skills-standard harnesses. A recurring request is a **plug-and-play** distribution: subscribe to the set as a read-only, always-current bundle you don't edit, rather than a fork you own. That is exactly what native plugin systems provide.

We ship a native **Claude Code plugin** and, for now, **defer** a native **Codex plugin**. The split is forced by how each ecosystem's plugin manifest selects skills, against this repo's bucketed layout.

## The constraint: bucketed skills vs. single-path selection

Skills live in bucket folders under `skills/` — `engineering/` and `productivity/` are **promoted** (shipped); `misc/`, `personal/`, `in-progress/`, and `deprecated/` are **not**. A plugin must expose only the promoted set, which spans two of those bucket folders.

- **Claude Code** — `.claude-plugin/plugin.json` accepts `skills` as an **array of explicit skill-directory paths**. We list the promoted skills one by one, exclude everything else with zero ambiguity, and add `.claude-plugin/marketplace.json` so the repo is its own single-plugin marketplace. Verified end to end: `claude plugin validate . --strict` passes, and `marketplace add` → `install` resolves all promoted skills.

- **Codex** — `.codex-plugin/plugin.json` accepts `skills` only as a **single path string** (arrays are rejected with `missing or invalid plugin.json`), and Codex discovers `SKILL.md` files recursively under it. There is no way to name two bucket folders, or to curate a subset, from one path. Two escape hatches were tested and rejected:
  - Pointing at `./skills/` would also ship `deprecated/`, `in-progress/`, `personal/`, and `misc/` — retired, draft, and personal skills we deliberately don't promote.
  - A curated flat directory of **symlinks** into the buckets does not survive install: Codex copies the plugin tree into its cache and **drops symlinks**, so the skills arrive empty.

The only robust ways to give Codex a single promoted-only path are (a) **restructure** so `skills/` contains only promoted skills (moving the non-promoted buckets out — a large blast radius across `CLAUDE.md`, `scripts/link-skills.sh`, the bucket READMEs, and the local dev workflow that relies on `in-progress/` and `personal/`), or (b) **commit duplicate copies** of promoted skills into a flat directory (a sync burden and a second source of truth). Both are structural decisions, not something to bundle into shipping the Claude plugin. This is very likely the original, half-remembered reason a plugin wasn't shipped earlier: the manifest formats didn't cleanly express a curated subset of a bucketed repo.

## Decision

- Ship the **Claude Code plugin** now (`.claude-plugin/plugin.json` + `.claude-plugin/marketplace.json`), curated to the promoted set, as the headline v1.2 deliverable.
- Keep **skills.sh** as the universal installer — it already serves Codex and other harnesses today, so no Codex user is left without an install path.
- **Defer** the native Codex plugin until we decide between restructuring `skills/` to promoted-only vs. committing a generated flat copy. Revisit when Codex either supports a `skills` array / include-list or preserves symlinks on install.

## Invariants this creates

- Every promoted skill has an entry in `.claude-plugin/plugin.json`'s `skills` array (this already stood as a `CLAUDE.md` rule; it now also gates the plugin's contents).
- `.claude-plugin/plugin.json`'s `version` tracks `package.json`'s version — bump both together on release. Claude uses the plugin `version` to decide when installed users see an update.
</file>

<file path=".agents/invocation.md">
# Model-invoked vs user-invoked

Every `SKILL.md` in this repo is a skill. The one axis that splits them is **invocation** — who can reach it:

- **User-invoked** — reachable **only by the human typing its name**. Set `disable-model-invocation: true` in the frontmatter (Claude Code) and `policy.allow_implicit_invocation: false` in `agents/openai.yaml` (Codex). The `description` is **human-facing**: a one-line summary read by a person browsing slash-commands. Strip trigger lists ("Use when the user says…").
- **Model-invoked** — reachable by **model or user**. The default: omit `disable-model-invocation` and the `policy` block from `agents/openai.yaml`. The `description` is **model-facing** and keeps rich trigger phrasing ("Use when the user wants…, mentions…, asks for…") so auto-invocation fires. The test for whether a skill should stay model-invoked: _could the model usefully reach for this autonomously?_ (Reuse is the reason to extract a skill, not the test.)

Each harness excludes a user-invoked skill from the model's reach in its own way, so nothing but the human can fire it — no other skill can. A user-invoked skill may invoke model-invoked skills, but it can never reach another user-invoked skill.

Every skill also carries an `agents/openai.yaml` beside its `SKILL.md`. It holds Codex UI metadata — `interface.display_name` and `interface.short_description` for the skill picker — and, for user-invoked skills, the `policy.allow_implicit_invocation: false` that pairs with `disable-model-invocation`. Keep the two in sync: a skill is user-invoked in both harnesses or neither.

Bucket `README.md`s and the top-level `README.md` group entries into **User-invoked** and **Model-invoked**.

## Dependencies between them

Dependencies are expressed as **`/skill`-style prose invocation** ("Run the `/grilling` skill"), not deep `../other-skill/FILE.md` cross-references. Shared reference docs live inside the skill that owns them; other skills reach that material by invoking the skill, not by linking across folders.

## Passive vs active domain work

Merely _reading_ `CONTEXT.md` for vocabulary is a one-line prose pointer, not the `domain-modeling` skill. Only the active build/sharpen discipline (challenge terms, edge-case scenarios, write ADRs, update `CONTEXT.md` inline) is `domain-modeling`.
</file>

<file path=".agents/writing-docs.md">
# Writing docs pages

Every skill in `engineering/` and `productivity/` has a human-facing **docs page** at `docs/<bucket>/<skill-name>.md` — the docs tree mirrors those two bucket folders under `skills/`. It is published at `https://aihero.dev/skills-<skill-name>`; the URL is always `skills-<skill-name>` regardless of bucket, so the docs path is repo organisation only. The page is not the skill and not a copy of `SKILL.md`. Only these two buckets are promoted; the rest (`misc/`, `personal/`, `in-progress/`, `deprecated/`) ship no docs page.

Most of these skills are **user-invoked**: the agent will never fire them for you, so *you* are the index that has to remember they exist and when to reach for them. That memory is **cognitive load**. The job of a docs page is to relieve it — to orient one reader around one skill so they can hold it in their head, know when to reach for it, and see where it sits in the system. The pages are collectively a distributed router; each is a node.

Act whenever a promoted skill is added, renamed, or has its behaviour changed: create or re-sync its docs page. A rename moves the file too (`docs/<bucket>/<old>.md` → `docs/<bucket>/<new>.md`), because the published URL tracks the name; a skill that moves between `engineering/` and `productivity/` moves its docs file to the matching folder. Skills in `misc/`, `personal/`, `in-progress/`, and `deprecated/` get no page — none of those buckets is promoted. A skill moving *out* of one of them into `engineering/` or `productivity/` gains a page; one moving the other way loses it.

Because these pages are published on `aihero.dev`, **every link is absolute** — never a repo-relative path. A link to another skill points at `https://aihero.dev/skills-<name>`; a link into the repo points at its full `https://github.com/mattpocock/skills/...` URL. A relative link that works in the repo breaks once published.

There is no H1 — the published page takes its title from the slug.

## Page structure

Fill the template below. The **fixed frame** (Quickstart block, source link, `## What it does`, `## When to reach for it`, `## Where it fits`) appears on every page. The **adaptable middle** — `## Prerequisites` and the free-form substance sections — carries only what this particular skill earns; delete the rest.

<page-template>

Quickstart:

```bash
npx skills add mattpocock/skills --skill=<name>
```

```bash
npx skills update <name>
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/<bucket>/<name>)

## What it does

One or two plain-language paragraphs. Lead with the skill's one-sentence job, then state the **defining constraint** — the single fact that makes this skill behave differently from the obvious default (for `to-spec`: it does not interview the user again, it synthesises what is already known). Write it as a plain declarative sentence — never a labelled aside like "The defining constraint:" or "The key thing:"; the formula reads as filler. This line is the most valuable on the page; never omit it.

## When to reach for it

How and when you reach for the skill — two beats, both effectively always present:

- **Invocation mode.** State whether you type it or the agent fires it. A user-invoked skill: "You invoke this by typing `/<name>` — the agent won't reach for it on its own." A model-invoked skill: "Type `/<name>`, or the agent reaches for it automatically when a task fits."
- **Trigger boundary.** The index entry: "reach for this when …". Where the skill is confusable with a sibling, add the other half — "for <X> instead, use [<sibling>](https://aihero.dev/skills-<sibling>)."

## Prerequisites

Optional — include only when the skill needs something in place to be functional; omit the heading entirely otherwise. Covers: a **workspace it writes into** (a stateful skill like `grill-with-docs` writes `CONTEXT.md` and ADRs; `teach` builds a whole directory — say what it writes and where), **prior setup** (`triage`/`to-spec`/`to-tickets` need `setup-matt-pocock-skills` to have configured an issue tracker), or **repo-specific tooling**. A stateless skill that runs anywhere has no prerequisites — drop the section.

## <free-form middle>

One to three short sections, in the skill's *own vocabulary*, that make it click — choose whatever headings fit the skill: the loop it runs, the artifact it produces, the fork it makes, the one anti-pattern it kills. There is no prescribed heading; the skills are too heterogeneous for one.

The single non-negotiable: **surface the skill's leading word / defining idea** — `tight` feedback loop, `deep module`, throwaway-code-answers-a-question, red-green. It pays off twice: the reader learns what the skill *is*, and learns the word they'll later think with to *reach for* it.

## It's working if

Optional. A short, checkable list of the observable signals that tell the reader the skill is actually doing its job — what they should see when it fires, and by absence when it hasn't. Include it when a skill has crisp tells (e.g. `to-spec` writes without re-interviewing you; a leading word reappearing in the trace); omit the heading when the signals are vague. A few bullets, no more.

## Where it fits

Always present. Situate the skill in the system in a sentence or two:

- **Role.** Name it: a **chain step** (`grill-with-docs → to-spec → to-tickets → implement → code-review`), a **run-once setup** (`setup-matt-pocock-skills`), **periodic maintenance** (`improve-codebase-architecture`, "every few days"), or a **reach-for-it-anytime standalone** (`diagnosing-bugs`, `prototype`, `handoff`). A standalone's map is one honest sentence — far better than omitting the section.
- **Neighbours.** The one or two siblings that matter, each with a because-clause, linked absolutely.
- **The map.** Point to [ask-matt](https://aihero.dev/skills-ask-matt), the router over the whole set, so this page stays a node and never has to redraw the graph.

</page-template>

## Conventions

- Explain the **why**, not the process. The page orients and situates the skill; it never reproduces the `SKILL.md` steps or template dumps — a human choosing a tool does not need the runbook.
- Use the skill's **leading words** (_seam_, _deep module_, _tracer bullet_) so the page and the skill speak one language.
- Keep the page itself low-load. It is documentation *about* low-cognitive-load skills; furniture (spare headings, restated links) is the thing it is arguing against.

## Done when

- The page exists at `docs/<bucket>/<name>.md`, and no stale page survives a rename or bucket move.
- The Quickstart block and source link name the correct bucket and skill; the update line names the skill.
- `## What it does` states the defining constraint, as plain prose rather than a labelled aside.
- `## When to reach for it` states invocation mode and the trigger boundary.
- `## Where it fits` names the role and links to `ask-matt`.
- A prerequisite (workspace, prior setup, tooling) is stated where one exists, and the section is absent where none does.
- The middle surfaces the leading word.
- Every link is absolute, and every one resolves.
</file>

<file path=".changeset/ask-matt-wayfinder-guidance.md">
---
"mattpocock-skills": patch
---

Make `/ask-matt` clued-up about `/wayfinder` — the heaviest, most cognitively demanding flow.

The router now sharpens the two routing mistakes people most often make with wayfinder:

- **Over-reaching for it.** It's slower and denser than a single grill, so it's flagged as the heaviest flow and reserved for the idea that genuinely won't fit one session — a well-scoped feature belongs on `/grill-with-docs`, not here.
- **Losing the way at the handoff.** When the map clears, wayfinder hands off, it doesn't build: merge onto the main flow at `/to-spec` (which collapses the map's linked decisions into a buildable plan) rather than looping the map straight into `/implement`. Straight-to-`/implement` is only for efforts that turned out genuinely small.
</file>

<file path=".changeset/codex-skill-metadata.md">
---
"mattpocock-skills": minor
---

Add Codex metadata alongside each skill's Claude Code frontmatter so the set works in both harnesses without generated copies.

- Add an `agents/openai.yaml` beside every `SKILL.md` with Codex UI metadata (`interface.display_name`, `interface.short_description`).
- Mark every user-invoked skill with `policy.allow_implicit_invocation: false`, the Codex analog of `disable-model-invocation: true`, so Codex excludes it from implicit invocation while explicit `$skill` invocation still works.
- Document the dual-harness invocation model in `.agents/invocation.md`, `CLAUDE.md`, and the promoted-bucket READMEs.
- Add `AGENTS.md` as a symlink to `CLAUDE.md` so Codex reads the same repo instructions.
</file>

<file path=".changeset/config.json">
{
  "$schema": "https://unpkg.com/@changesets/config@3.1.4/schema.json",
  "changelog": [
    "@changesets/changelog-github",
    { "repo": "mattpocock/skills" }
  ],
  "commit": false,
  "privatePackages": { "version": true, "tag": true },
  "fixed": [],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
</file>

<file path=".changeset/friendlier-setup-and-local-tickets.md">
---
"mattpocock-skills": patch
---

Make `/setup-matt-pocock-skills` friendlier and align the local-markdown tracker with the current spec.

- **Triage labels** are now asked about only when the `triage` skill is installed, and then as a single recommended-yes question ("keep the default triage labels?") instead of an override interrogation. When `triage` isn't installed, the section — and `docs/agents/triage-labels.md` — are skipped.
- **External PRs as a request surface** is no longer a setup question. The GitHub/GitLab templates still carry the flag, defaulted off; a user can flip it in `docs/agents/issue-tracker.md` later.
- **Domain docs** default to single-context without asking; multi-context is only offered when the repo shows monorepo signals.
- **Local-markdown tickets** are now one file per ticket under `.scratch/<feature>/issues/<NN>-<slug>.md` — never a single combined `tickets.md`. `/to-tickets` and the local issue-tracker template now agree, and the spec file is `spec.md` (not `PRD.md`) to match `/to-spec`.

Docs pages for `setup-matt-pocock-skills` and `to-tickets` re-synced.
</file>

<file path=".changeset/grilling-general-use.md">
---
"mattpocock-skills": patch
---

Reword **`grilling`** for general use. Its description and body no longer scope the interview to a software plan: "this plan" → "this", "enact the plan" → "act on it", and "exploring the codebase" → "exploring the environment". The technique is unchanged; it now reads as a stress-test of any plan, decision, or idea.
</file>

<file path=".changeset/prototype-primary-source.md">
---
"mattpocock-skills": minor
---

Reword how the **`prototype`** skill handles its artifacts around a single idea: **the prototype is a primary source**. Rather than being deleted once it's answered its question, the prototype is captured as runnable evidence on a throwaway branch (`prototype/<name>`) out of main, with a context pointer to it left on the implementation issue — so the main branch keeps only the validated decision while the exploration stays findable. The answer (verdict + question) is still captured durably in an issue/ADR/commit.
</file>

<file path=".changeset/README.md">
# Changesets

Hello and welcome! This folder has been automatically generated by `@changesets/cli`, a build tool that works
with multi-package repos, or single-package repos to help you version and publish your code. You can
find the full documentation for it [in our repository](https://github.com/changesets/changesets).

We have a quick list of common questions to get you started engaging with this project in
[our documentation](https://github.com/changesets/changesets/blob/main/docs/common-questions.md).
</file>

<file path=".changeset/ship-as-claude-plugin.md">
---
"mattpocock-skills": minor
---

Ship the skill set as a native **Claude Code plugin**. The repo is now its own single-plugin marketplace, so you can subscribe to the promoted skills as a managed, read-only bundle instead of copying editable files:

```
/plugin marketplace add mattpocock/skills
/plugin install mattpocock-skills@mattpocock
```

`.claude-plugin/plugin.json` gains full marketplace metadata (version, description, author, license, keywords) and a sibling `.claude-plugin/marketplace.json` lists the plugin. `skills.sh` remains the universal installer (and the path for Codex and other harnesses today); a native Codex plugin is deferred — see `.agents/adr/0002-ship-as-a-claude-code-plugin.md` for why.
</file>

<file path=".changeset/wayfinder-decision-tickets.md">
---
"mattpocock-skills": patch
---

Name the `/wayfinder` unit a **decision ticket**.

People kept reading a wayfinder ticket as an ordinary *implementation* ticket — a slice of a build to execute — when wayfinder uses them as **decision tickets**: questions whose resolution is a decision. The skill description and its opening line now introduce "decision ticket" (and say what makes it one), and the `ask-matt` / engineering README wayfinder blurbs and the docs page match — while "ticket" stays the everyday word once the term is established. `CONTEXT.md` records **Decision ticket** as a domain term so the "avoid: ticket" guidance no longer contradicts wayfinder's deliberate use of the word.
</file>

<file path=".changeset/wayfinder-research-subagents.md">
---
"mattpocock-skills": minor
---

Wayfinder now burns research tickets down with subagents instead of leaving them parked for a separately-launched session.

Research stays a real ticket type — it's a genuine shared blocker that downstream decisions hang on, and that dependency is exactly what the frontier's blocking edges exist to render. What changes is how it's resolved: because research is AFK, charting doesn't stop and read it. After creating the tickets, the charting session fires a `/research` subagent for each research ticket to burn it down in parallel, capturing the findings on a throwaway `research/<name>` branch with a context pointer. Research tickets are the one exception to *one ticket per session*.
</file>

<file path=".changeset/yagni-scope-improve-architecture.md">
---
"mattpocock-skills": minor
---

Add a YAGNI scoping filter to the **`improve-codebase-architecture`** skill's Explore step. Instead of scanning the whole repo evenly, it now scopes to where change is actually landing: if you name a direction it takes it, otherwise it reads the last ~20 commit messages to bias exploration toward actively-developed paths. A deepening opportunity in code nobody touches is a refactor you'll never cash in — the leverage only pays off where you keep editing — so the report stops tidying dormant corners of the repo.
</file>

<file path=".claude-plugin/marketplace.json">
{
  "name": "mattpocock",
  "owner": {
    "name": "Matt Pocock",
    "url": "https://www.aihero.dev"
  },
  "description": "Matt Pocock's skills for real engineering, as an installable Claude Code plugin.",
  "plugins": [
    {
      "name": "mattpocock-skills",
      "source": "./",
      "description": "Matt Pocock's agent skills for real engineering — grilling, spec/ticket flows, TDD, code review, domain modelling and more.",
      "category": "engineering",
      "keywords": [
        "engineering",
        "skills",
        "tdd",
        "code-review",
        "grilling"
      ]
    }
  ]
}
</file>

<file path=".claude-plugin/plugin.json">
{
  "name": "mattpocock-skills",
  "version": "1.2.0",
  "description": "Matt Pocock's agent skills for real engineering — grilling, spec/ticket flows, TDD, code review, domain modelling and more. Plug-and-play, not vibe coding.",
  "author": {
    "name": "Matt Pocock",
    "url": "https://www.aihero.dev"
  },
  "homepage": "https://www.aihero.dev/s/skills-newsletter",
  "repository": "https://github.com/mattpocock/skills",
  "license": "MIT",
  "keywords": [
    "engineering",
    "skills",
    "tdd",
    "code-review",
    "grilling",
    "domain-modeling",
    "productivity"
  ],
  "skills": [
    "./skills/engineering/ask-matt",
    "./skills/engineering/diagnosing-bugs",
    "./skills/engineering/grill-with-docs",
    "./skills/engineering/triage",
    "./skills/engineering/improve-codebase-architecture",
    "./skills/engineering/setup-matt-pocock-skills",
    "./skills/engineering/tdd",
    "./skills/engineering/to-spec",
    "./skills/engineering/to-tickets",
    "./skills/engineering/wayfinder",
    "./skills/engineering/implement",
    "./skills/engineering/prototype",
    "./skills/engineering/research",
    "./skills/engineering/domain-modeling",
    "./skills/engineering/codebase-design",
    "./skills/engineering/code-review",
    "./skills/engineering/resolving-merge-conflicts",
    "./skills/productivity/grill-me",
    "./skills/productivity/grilling",
    "./skills/productivity/handoff",
    "./skills/productivity/teach",
    "./skills/productivity/writing-great-skills"
  ]
}
</file>

<file path=".github/workflows/release.yml">
name: Release

on:
  push:
    branches:
      - main

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    name: Version
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install dependencies
        run: npm ci

      - name: Create Version Pull Request
        uses: changesets/action@v1
        with:
          version: npx changeset version
          publish: npx changeset tag
          commit: "chore: version skills"
          title: "chore: version skills"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
</file>

<file path=".out-of-scope/mainstream-issue-trackers-only.md">
# Issue tracker integrations are limited to mainstream tools

`setup-matt-pocock-skills` only offers first-class support for **mainstream** issue trackers. Requests to add support for niche, new, or single-vendor experimental trackers are out of scope.

## Why this is out of scope

Every issue-tracker backend hard-codes a CLI shape into the skills (commands, flags, output parsing). Each new backend is permanent maintenance surface — it has to keep working as the tool's CLI evolves, and it has to keep being tested against `/to-spec`, `/to-tickets`, `/triage`, and friends. That cost is only worth paying for trackers a meaningful fraction of users actually have.

"Mainstream" is a judgment call, not a numeric bar:

- GitHub, GitLab, and Backlog.md are the kind of tools we'd consider mainstream — broadly known, widely used, well past the experimental phase.
- A brand-new agent-focused tool with a few hundred GitHub stars is not, no matter how interesting the design.

Stars, age, and download counts are useful signals when making the call but none of them is the rule. The rule is: would a typical engineer recognise this tool and have plausibly chosen it for their team?

The escape hatches for non-mainstream trackers already exist:

- `local markdown` for lightweight in-repo tracking.
- `other/custom` for users who want to wire something up themselves.

Neither requires the core skills to know about the specific tool.

## Prior requests

- #99 — "Add dex as an issue tracker backend" (dex was ~3 months old and ~300 stars at the time of the request)
</file>

<file path=".out-of-scope/question-limits.md">
# Hard limits on the number of questions during grilling

The `/grill-me` skill (and grilling sessions inside other skills) does not enforce a maximum number of questions. Requests to add a configurable cap or hard ceiling are out of scope.

## Why this is out of scope

Grilling is intentionally open-ended. The point is to keep digging until each branch of the decision tree is resolved — some plans need three questions, some need fifty. A fixed cap would either cut off useful exploration on hard problems or feel arbitrary on easy ones.

If a session feels too long, the right escape hatches already exist:

- The user can stop the session at any time and accept the current state of the plan.
- The user can tell the model to wrap up, summarise, and move on — natural-language steering is the intended control surface, not a numeric limit.

Adding a hard cap would also conflate two different failure modes: a model that asks too many questions because the plan is genuinely under-specified (working as intended) vs. a model that asks redundant or low-value questions (a prompt-quality issue, not a quantity issue). The fix for the latter belongs in the skill prompt, not in a counter.

## Prior requests

- #44 — "Codex just asked me 200 questions"
</file>

<file path=".out-of-scope/setup-skill-verify-mode.md">
# Verify/Check Mode for `setup-matt-pocock-skills`

This project will not add a dedicated verify/check mode (or a separate verify skill) for `setup-matt-pocock-skills`.

## Why this is out of scope

A second skill — or a `--verify` flag — for checking whether `docs/agents/*.md` artifacts still match the seed-template schema would duplicate work the existing setup skill already handles in conversation.

The intended workflow is: **run `/setup-matt-pocock-skills` and tell it to verify your current setup.** The skill is prompt-driven, so the maintainer can scope it to a verification pass ("don't rewrite anything, just check my existing files against the current seed templates and report drift") without needing a separate code path. Adding a flag or a sibling skill would split the surface area of a feature that's already expressible through the natural-language entry point.

Keeping configuration management to a single skill also avoids the maintenance cost of two skills drifting from each other when seed templates evolve.

## Prior requests

- #106 — Feature request: verify/check mode for setup-matt-pocock-skills
</file>

<file path="docs/engineering/ask-matt.md">
Quickstart:

```bash
npx skills add mattpocock/skills --skill=ask-matt
```

```bash
npx skills update ask-matt
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/ask-matt)

## What it does

`ask-matt` is the router over the skills in this repo. You describe the situation you're in; it tells you which skill or flow fits and in what order to run them.

It **does no work itself**. It doesn't grill, write a spec, or fix anything — it only orients. It exists for the **user-invoked** skills above all: nothing fires those for you, so *you* have to remember they exist, and `ask-matt` is the memory you offload that to. It also points at the model-invoked skills you'd reach for by name — `/tdd`, `/diagnosing-bugs`, `/prototype`, `/code-review`, and the two vocabulary references, `/domain-modeling` and `/codebase-design`. It answers "which one, and when", then hands you off to the skill that actually does the job.

## When to reach for it

You invoke this by typing `/ask-matt` — the agent won't reach for it on its own.

Reach for it whenever you're unsure which skill or flow a situation calls for: you have an idea and don't know where to start, a pile of bug reports and don't know if they're for `/triage`, or two skills that look interchangeable and you can't tell them apart. If you already know the skill you want, skip the router and invoke it directly.

## Flows, not just skills

The idea `ask-matt` gives you to think with is the **flow** — a path *through* the skills rather than a single one. Most work runs along one **main flow** (idea → ship: grill → spec → tickets → implement → review), two **on-ramps** merge onto it (a triage lane for incoming bugs and requests; a codebase-health lane that generates ideas), and everything else is a **standalone** you reach for on its own. Ask a question and you get placed on the right flow, at the right step — not just handed a tool.

## Where it fits

`ask-matt` is the **router** — the standalone map that sits over the whole set. It is the node every other docs page links back to as [ask-matt](https://aihero.dev/skills-ask-matt), so it never sits *in* a chain; it points *into* every chain. From here you'll most often land on [grill-with-docs](https://aihero.dev/skills-grill-with-docs), the head of the main flow, or [triage](https://aihero.dev/skills-triage), the on-ramp for work you didn't create. When even the router's own picture is stale, its [Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/ask-matt) is the map of record.
</file>

<file path="docs/engineering/code-review.md">
Quickstart:

```bash
npx skills add mattpocock/skills --skill=code-review
```

```bash
npx skills update code-review
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/code-review)

## What it does

`code-review` reviews the diff between `HEAD` and a fixed point you supply — a commit, branch, tag, or merge-base — along two separate axes: **Standards** (does the code follow this repo's documented conventions?) and **Spec** (does it implement what the originating issue or spec asked for?). It runs each axis as its own parallel sub-agent and reports them side by side. It never merges or re-ranks the two sets of findings — keeping them separate is the whole point, because a change can pass one axis and fail the other, and a single blended verdict lets one mask the other.

## When to reach for it

Type `/code-review`, or the agent reaches for it automatically when you ask to review a branch, a PR, work-in-progress changes, or anything "since X".

Reach for this when there is a diff to judge against a known-good point and you want the two questions — *is it built right?* and *is it the right thing?* — answered independently. It runs at the end of the build loop; for actually writing the code test-first, use [tdd](https://aihero.dev/skills-tdd), and for building a whole spec into code use [implement](https://aihero.dev/skills-implement), which runs its own `/code-review` pass before committing.

## Prerequisites

The **Spec** axis needs somewhere to find the originating spec — an issue reference in the commit messages, a path you pass in, or a spec under `docs/`/`specs/`. That issue-tracker wiring comes from [setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills); without a spec the Spec axis simply skips and says so. The **Standards** axis needs nothing set up — it always carries a built-in Fowler smell baseline even in a repo that documents no conventions.

## Two axes, never merged

The defining idea is the **two axes**. **Standards** asks whether the diff conforms to how this repo writes code — its `CODING_STANDARDS.md` or `CONTRIBUTING.md`, plus a fixed baseline of ~12 Fowler code smells (Mysterious Name, Duplicated Code, Feature Envy, Data Clumps, …). Two rules keep the baseline safe: a documented repo standard always overrides it, and every smell is a judgement call, never a hard violation. **Spec** asks the orthogonal question — does the code do what the issue or spec actually asked, without missing requirements or smuggling in scope creep?

They run as parallel sub-agents so neither pollutes the other's context, and the final report presents them under separate `## Standards` and `## Spec` headings with a per-axis summary. There is deliberately no single winner across axes.

## It's working if

- It pins and confirms the fixed point first (`git rev-parse`), failing fast on a bad ref or empty diff rather than inside the sub-agents.
- Standards and Spec findings arrive in two distinct blocks, each citing its source — a repo standard or baseline smell for one, a quoted spec line for the other.
- When no spec can be found, the Spec axis reports "no spec available" instead of inventing requirements.

## Where it fits

`code-review` is the review step at the tail of the main build chain:

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review
```

Its closest neighbour is [implement](https://aihero.dev/skills-implement), which drives the build and calls this as its own review pass before committing; upstream, the spec it checks against is produced by [to-spec](https://aihero.dev/skills-to-spec) and [to-tickets](https://aihero.dev/skills-to-tickets). When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
</file>

<file path="docs/engineering/codebase-design.md">
Quickstart:

```bash
npx skills add mattpocock/skills --skill=codebase-design
```

```bash
npx skills update codebase-design
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/codebase-design)

## What it does

`codebase-design` gives you a shared, precise vocabulary for designing **deep modules** — a lot of behaviour hidden behind a small interface, placed at a clean seam, testable through that interface.

It is a **language, not a procedure**. It doesn't restructure your code or hand you a refactor plan — it fixes the words (module, interface, depth, seam, adapter, leverage, locality) so that every design conversation and every other skill that touches design speaks the same way. Consistent language is the whole point; "component," "service," "API," and "boundary" are deliberately banned because they blur the distinctions that matter.

## When to reach for it

Type `/codebase-design`, or the agent reaches for it automatically when a task fits.

Reach for it when you're designing or improving a module's interface, hunting for deepening opportunities, deciding where a seam goes, or making code more testable and AI-navigable. Other skills pull it in whenever they need the deep-module vocabulary. If you want to sharpen the project's *domain* terms rather than its module design, use [domain-modeling](https://aihero.dev/skills-domain-modeling) instead; to run a whole architecture pass over an existing codebase, use [improve-codebase-architecture](https://aihero.dev/skills-improve-codebase-architecture).

## Deep, not shallow

A module is **deep** when a large amount of behaviour sits behind a small interface, and **shallow** when the interface is nearly as complex as the implementation. Depth is measured as **leverage** — how much a caller (or a test) can exercise per unit of interface they have to learn. Crucially, depth is a property of the *interface*, not the implementation: a deep module can be internally composed of small, swappable parts that just never surface to callers.

Two checks do most of the work. The **deletion test**: imagine deleting the module — if complexity vanishes, it was a pass-through; if it reappears across N callers, it was earning its keep. And **one adapter means a hypothetical seam; two adapters means a real one** — don't cut a seam until something actually varies across it.

## The interface is the test surface

Callers and tests cross the same seam, so a well-placed interface gives tests something durable to aim at while the code underneath moves freely. That's why the vocabulary insists on **seam** (Feathers' term — a place you can change behaviour without editing there) over the overloaded "boundary," and why "interface" here means *every fact a caller must know*: signatures, yes, but also invariants, ordering, error modes, and performance — not just the type-level surface.

## Pulled out on purpose

`codebase-design` is the **single source of truth** for the deep-module vocabulary, split out as its own model-invoked skill so anything can reach it. Other skills point at it rather than restating the words: [tdd](https://aihero.dev/skills-tdd) borrows it to place a seam before writing the test, [improve-codebase-architecture](https://aihero.dev/skills-improve-codebase-architecture) leans on it while restructuring existing code, and [to-spec](https://aihero.dev/skills-to-spec) speaks it when it sketches seams and deepening opportunities before writing a spec.

The point of keeping it standalone is that you can also reach for it on its own — as a **reference** for how to think about module design — without triggering the larger process any of those skills mandate. Fix the words once, in one place, and every design conversation inherits them.

## Where it fits

`codebase-design` is a **reach-for-it-anytime standalone** — the shared vocabulary layer under the engineering skills. Its closest neighbour is [domain-modeling](https://aihero.dev/skills-domain-modeling), the parallel vocabulary skill for the problem domain rather than the module structure. When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
</file>

<file path="docs/engineering/diagnosing-bugs.md">
Quickstart:

```bash
npx skills add mattpocock/skills --skill=diagnosing-bugs
```

```bash
npx skills update diagnosing-bugs
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/diagnosing-bugs)

## What it does

`diagnosing-bugs` runs a disciplined diagnosis loop for hard bugs and performance regressions — building a repro, minimising it, ranking hypotheses, instrumenting, then fixing with a regression test.

It refuses to hypothesise before you have a **tight feedback loop** — one runnable command that already goes red on *this* bug. Reading code to build a theory before that command exists is the exact failure this skill prevents. No red-capable loop, no diagnosis.

## When to reach for it

Type `/diagnosing-bugs`, or the agent reaches for it automatically when a task fits — it fires on "diagnose" / "debug this", or when you report something broken, throwing, failing, or slow.

Reach for it on the hard ones: the bug that resists a first glance, the intermittent flake, the regression that crept in between two known-good states. For a quick throwaway to sanity-check a design question rather than chase a defect, use [prototype](https://aihero.dev/skills-prototype) instead.

## The tight loop is the skill

Everything else — bisection, hypothesis-testing, instrumentation — is mechanical once you have the signal. So the skill spends disproportionate effort on Phase 1: constructing a pass/fail command that drives the actual bug code path and asserts the user's exact symptom, then **tightening** it until it is fast, deterministic, and agent-runnable. A 30-second flaky loop is barely better than none; a 2-second deterministic one is a debugging superpower.

It gives you a ladder of ways to build that loop — failing test, curl script, CLI diff, headless browser, replayed trace, throwaway harness, fuzz loop, `git bisect run`, differential run — and, only as a last resort, a human-in-the-loop bash script. For non-deterministic bugs the goal isn't a clean repro but a **higher reproduction rate**: loop the trigger, parallelise, add stress until the flake is debuggable.

## It's working if

- It builds and runs a repro command *before* theorising — and pastes the invocation and its red output.
- The loop asserts the symptom you actually reported, not a nearby failure.
- Hypotheses arrive as a ranked, falsifiable list shown to you before any are tested.
- Debug instrumentation is tagged (`[DEBUG-...]`) and grepped away before it declares done.

## Where it fits

`diagnosing-bugs` is a reach-for-it-anytime standalone — you drop into it the moment something is broken, and drop out once the fix and its regression test are in. Its post-mortem hands off to [improve-codebase-architecture](https://aihero.dev/skills-improve-codebase-architecture) when the real finding is that there's no good seam to lock the bug down — the code, not the bug, is the problem. When you're unsure which skill fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
</file>

<file path="docs/engineering/domain-modeling.md">
Quickstart:

```bash
npx skills add mattpocock/skills --skill=domain-modeling
```

```bash
npx skills update domain-modeling
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/domain-modeling)

## What it does

`domain-modeling` builds and sharpens a project's **ubiquitous language** as you design — challenging fuzzy terms, stress-testing relationships with concrete scenarios, and writing the glossary and decisions down the moment they crystallise.

This is the **active** discipline, not the passive one. Merely reading `CONTEXT.md` to borrow its vocabulary is a one-line habit any skill can do; this skill is for when you are *changing* the model — coining a canonical term, catching a contradiction between the code and what you just said, recording a hard-to-reverse decision. And it keeps the glossary clean: `CONTEXT.md` is a glossary and nothing else — no implementation details, no spec, no scratch pad.

## When to reach for it

Type `/domain-modeling`, or the agent reaches for it automatically when a task fits — when you are pinning down terminology, resolving an overloaded word, or recording an architectural decision.

Reach for it when the *words* are the problem: two people mean different things by "cancellation", "account" is doing three jobs, or a design conversation keeps snagging on a concept that has never been named precisely. If instead the module's *shape* is the problem — where the seam goes, how deep the interface is — use [codebase-design](https://aihero.dev/skills-codebase-design). If you want the plan itself interrogated before you build, use [grilling](https://aihero.dev/skills-grilling).

## Prerequisites

The skill writes into two places, both created lazily — only once there is something to record. Resolved terms go into `CONTEXT.md` at the root (or, in a multi-context repo flagged by a `CONTEXT-MAP.md`, into the per-context `CONTEXT.md`). Decisions go into `docs/adr/`. Nothing needs to exist up front; the first resolved term creates the glossary, the first real trade-off creates the ADR.

## Glossary vs. ADR

Two artifacts, two different bars:

- **The glossary** (`CONTEXT.md`) captures language. Every time a vague term is made canonical, it's written down inline — not batched — so the shared vocabulary stays current with the conversation. It stays ruthlessly free of implementation detail.
- **An ADR** captures a decision, and the bar is high: offered only when the choice is **hard to reverse**, **surprising without context**, and **the result of a real trade-off**. Miss any one of the three and there is no ADR. This is what keeps `docs/adr/` a record of consequential forks rather than a diary.

The move that makes it click: when you state how something works, the skill cross-references the code and surfaces the contradiction — "your code cancels entire Orders, but you just said partial cancellation is possible — which is right?" The language and the code are forced to agree.

## Pulled out on purpose

`domain-modeling` is the **single source of truth** for building the project's ubiquitous language, split out as its own model-invoked skill so any other skill can reach it. [grill-with-docs](https://aihero.dev/skills-grill-with-docs) leans on it to record terms and decisions as a grilling session runs, [triage](https://aihero.dev/skills-triage) uses it to keep tickets in the project's own words, and [improve-codebase-architecture](https://aihero.dev/skills-improve-codebase-architecture) reaches for it while it works.

Keeping it standalone means you can also reach for it directly — as a **reference** for how to sharpen a model — without committing to the steps any of those skills mandate. The language lives in one place, and everything that needs it points there.

## Where it fits

`domain-modeling` is a **reach-for-it-anytime standalone** that runs *underneath* other skills as often as at a fixed step. Its closest neighbour is [codebase-design](https://aihero.dev/skills-codebase-design), because a shared language is what lets you name a deep module and its seam precisely; downstream, a settled glossary is exactly what [to-spec](https://aihero.dev/skills-to-spec) synthesises into a spec written in the project's own words. When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
</file>

<file path="docs/engineering/grill-with-docs.md">
Quickstart:

```bash
npx skills add mattpocock/skills --skill=grill-with-docs
```

```bash
npx skills update grill-with-docs
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/grill-with-docs)

## What it does

`grill-with-docs` interviews you relentlessly about a plan or design, one question at a time, until you and the agent reach a shared understanding — and it writes the vocabulary and decisions down as you go.

The grilling **leaves a paper trail**. A plain interview sharpens your thinking and then evaporates when the session ends; this one captures each term the moment it's resolved into a `CONTEXT.md` glossary, and records the hard, one-way decisions as ADRs. The alignment survives the conversation instead of living only in your head.

## When to reach for it

You invoke this by typing `/grill-with-docs` — the agent won't reach for it on its own.

Reach for it at the very start of a change, when the plan is still fuzzy and the domain language isn't settled, and you want to stress-test both before any code exists. If you only want the interview and don't need the artifacts, use [grilling](https://aihero.dev/skills-grilling); if the plan is already clear and you just need to pin down or record terminology, use [domain-modeling](https://aihero.dev/skills-domain-modeling). And if the change is too big to hold in one session and its route is still foggy — a greenfield project, a huge feature build — start upstream with [wayfinder](https://aihero.dev/skills-wayfinder): it charts the effort as a map of decisions, then hands back to this main flow once the way is clear.

## Prerequisites

This skill is stateful — it writes into your repo as it grills. Resolved terms land in a `CONTEXT.md` glossary at the root (or the relevant context's `CONTEXT.md` if a `CONTEXT-MAP.md` marks a multi-context repo), and genuinely hard-to-reverse decisions land as ADRs under `docs/adr/`. Both are created lazily — nothing exists until the first term or decision crystallises — so you don't need to scaffold anything up front, but you do need to be somewhere it's safe to write these files.

## The grill

The engine is a **grill**: a relentless, one-question-at-a-time walk down the decision tree, resolving dependencies between decisions before moving on, with a recommended answer offered for every question. Questions the codebase can answer are answered by reading the codebase, not by asking you.

What makes this variant its own skill is where the answers go. As the grill runs, fuzzy language gets sharpened into canonical terms and written to the glossary inline — not batched at the end. The glossary stays a glossary: pure vocabulary, no implementation details, no spec. ADRs are offered sparingly, only when a decision is hard to reverse, surprising without context, and the result of a real trade-off. Most sessions produce a sharper glossary and few or no ADRs, and that's the intended shape.

## It's working if

- It asks one question at a time and waits, rather than dumping a questionnaire.
- Terms get written to `CONTEXT.md` the moment they resolve, in your project's own words.
- It reaches into the codebase to answer its own questions where it can.
- ADRs stay rare — you're not asked to rubber-stamp reversible choices.

## Where it fits

`grill-with-docs` is the opening step of the main build chain:

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review
```

It comes first, before anything is written down as a spec: it produces the shared understanding and settled vocabulary that [to-spec](https://aihero.dev/skills-to-spec) then synthesises into a spec without re-interviewing you. Its close neighbours are [grilling](https://aihero.dev/skills-grilling), the same interview without the docs, and [domain-modeling](https://aihero.dev/skills-domain-modeling), the glossary-and-ADR discipline it drives. When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
</file>

<file path="docs/engineering/implement.md">
Quickstart:

```bash
npx skills add mattpocock/skills --skill=implement
```

```bash
npx skills update implement
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/implement)

## What it does

`implement` builds the work described in a spec or a set of tickets — driving it through test-driven development, typechecking, and the full test suite, then handing off to review and committing to the current branch.

It does **not** decide what to build. The spec is already settled and the seams are already agreed; `implement` executes that plan rather than reopening it. It is the hands, not the head — the thinking happened upstream.

## When to reach for it

You invoke this by typing `/implement` — the agent won't reach for it on its own.

Reach for it once the work is written down as a spec or split into tickets and you're ready to turn that into code. If the spec doesn't exist yet, write it first — for that, use [to-spec](https://aihero.dev/skills-to-spec), or [to-tickets](https://aihero.dev/skills-to-tickets) to break a spec into tickets. If you just want to build something test-first without a full spec, drop to [tdd](https://aihero.dev/skills-tdd) directly.

## Pre-agreed seams

The idea `implement` runs on is the **seam** — the stable interface a feature is tested at, chosen before any code is written. It doesn't invent seams mid-build; it uses the ones already picked (during [to-spec](https://aihero.dev/skills-to-spec)) and writes tests against them via [tdd](https://aihero.dev/skills-tdd). Working at pre-agreed seams is what keeps the implementation honest: the tests target something durable, so the code underneath can move without the tests moving.

Around that core it keeps the loop tight — typecheck often, run single test files as it goes, run the whole suite once at the end — then closes out with a review pass and a commit to the current branch.

## Where it fits

`implement` is the build step near the end of the main chain, just before the review:

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review
```

Reach for it after the work has been specced and sequenced, not before. Its key neighbours are [to-tickets](https://aihero.dev/skills-to-tickets), which produces the tickets — each declaring its blocking edges — that it works through, and [tdd](https://aihero.dev/skills-tdd), which it drives internally to write the tests at each seam before running its own [code-review](https://aihero.dev/skills-code-review) pass and committing. When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
</file>

<file path="docs/engineering/improve-codebase-architecture.md">
Quickstart:

```bash
npx skills add mattpocock/skills --skill=improve-codebase-architecture
```

```bash
npx skills update improve-codebase-architecture
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/improve-codebase-architecture)

## What it does

`improve-codebase-architecture` scans a codebase for **deepening opportunities** — places where a shallow module (an interface nearly as complex as the thing it hides) could become a deep one — presents them as a self-contained visual HTML report, then grills through whichever one you pick.

It does **not** hand you a flat list of refactors. Every candidate has to pass the **deletion test** — would removing this module *concentrate* complexity behind a smaller interface, or just move it around? Only the "concentrates" cases earn a card. That filter is what stops the report from becoming generic cleanup advice.

Unless you point it at a specific area, it also scopes itself to where development is actually landing — reading the recent commits to bias toward the code you're still changing. Deepening a module pays off by making future changes to it easier, so it puts extra weight on the parts of the repo that have recently changed.

## When to reach for it

You invoke this by typing `/improve-codebase-architecture` — the agent won't reach for it on its own.

Reach for it as a periodic health check: every few days, or whenever a codebase has started to feel like it takes too much bouncing between small modules to understand one concept. It reads the existing architecture and proposes where to deepen it. If you already know the module you want to redesign and just need the vocabulary to think it through, use [codebase-design](https://aihero.dev/skills-codebase-design) instead — this skill is the survey that finds the candidates; that one is the design bench.

## Deepening opportunities

The whole skill turns on one idea: **depth**. A deep module hides a lot of functionality behind a small, stable interface; a shallow one leaks its implementation through an interface almost as wide as the code beneath it. The report hunts for shallowness — pure functions extracted only for testability while the real bugs hide in how they're called (no **locality**), modules that leak across their **seams**, concepts you can't understand without opening five files — and proposes the deepening that would fix it.

It speaks in the shared design vocabulary (**module**, **interface**, **depth**, **seam**, **adapter**, **leverage**, **locality**) and in your project's own domain language from `CONTEXT.md`, so a candidate reads as "deepen the Order intake module," never "refactor the FooBarHandler."

## The report, then the grill

The output is a browser-ready HTML file written to your OS temp directory — nothing lands in the repo. Each candidate is a card with the files involved, the friction, a plain-English solution, the benefit in terms of locality and leverage, a before/after diagram, and a `Strong` / `Worth exploring` / `Speculative` badge. It closes with the one it would tackle first.

Then it stops and asks which one you want to explore. Pick one and it runs the [grilling](https://aihero.dev/skills-grilling) loop over that design — constraints, what sits behind the seam, which tests survive — updating the domain model inline as decisions crystallise.

## Where it fits

`improve-codebase-architecture` is **periodic maintenance** — run it every few days, not as a step in a chain. Its neighbours are [codebase-design](https://aihero.dev/skills-codebase-design), which owns the depth-and-seam vocabulary every candidate is written in, [grilling](https://aihero.dev/skills-grilling), which walks the decision tree once you've chosen a candidate, and [domain-modeling](https://aihero.dev/skills-domain-modeling), which keeps `CONTEXT.md` and the ADRs current as the redesign settles. When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
</file>

<file path="docs/engineering/prototype.md">
Quickstart:

```bash
npx skills add mattpocock/skills --skill=prototype
```

```bash
npx skills update prototype
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/prototype)

## What it does

`prototype` builds a small, disposable program whose only job is to answer one design question — does this state model feel right, or what should this UI look like.

The code is **throwaway from day one**, and marked as such. It carries no tests, no error handling beyond what makes it run, no abstractions, and no persistence. The point is to learn something fast and then delete it — so the moment you start hardening it, you've stopped prototyping.

## When to reach for it

Type `/prototype`, or the agent reaches for it automatically when a task fits.

Reach for it when you have a design question that's hard to settle on paper — a state machine with cases you can't hold in your head, or a screen you can't picture until you see a few versions side by side. If instead something already built is misbehaving and you need to find out why, use [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs); prototyping explores what to build, not why the built thing is broken.

## Two branches

The question decides the shape, and there are two shapes:

- **"Does this logic / state model feel right?"** — a tiny interactive terminal app that pushes the state machine through the awkward cases, printing the full state after every action so you can watch what changes.
- **"What should this look like?"** — several radically different UI variations on one route, switchable from a floating bar, so you compare real renders instead of imagining them.

Picking the wrong branch wastes the whole prototype, so the question comes first. Both branches keep state in memory, run from one command, and surface the full state on every step.

## Keep the prototype as a primary source

A finished prototype leaves two things. The **answer** — the verdict plus the question it settled — is what you capture durably (a commit message, an ADR, an issue). The **prototype itself is a primary source** — the runnable evidence the answer came from.

The prototype doesn't belong in the main branch: no tests, no error handling, nothing to maintain. But that's not a reason to destroy it. Once the answer is captured, fold any validated decision into the real code, then capture the prototype on a throwaway branch — out of main, never merged — and leave a context pointer to it on the implementation issue. The main branch stays clean; the raw exploration stays one click away for anyone who wants to re-run it. A prototype left rotting in the main branch has outlived its purpose — a prototype captured as a primary source on a side branch hasn't.

## Where it fits

`prototype` is a reach-for-it-anytime standalone: you drop into it to resolve a design question, then drop back out. Its answer often feeds the next step — a validated state model or UI direction becomes settled input for [to-spec](https://aihero.dev/skills-to-spec) to write up, or an architectural decision worth recording via [domain-modeling](https://aihero.dev/skills-domain-modeling). When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
</file>

<file path="docs/engineering/research.md">
Quickstart:

```bash
npx skills add mattpocock/skills --skill=research
```

```bash
npx skills update research
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/research)

## What it does

`research` answers a question by reading the sources that own the answer and leaving a cited Markdown file behind. It works only from **primary sources** — official docs, source code, specs, first-party APIs — never a secondary write-up of them, so what it saves is traceable back to something authoritative rather than a summary of a summary.

## When to reach for it

Type `/research`, or the agent reaches for it automatically when a task turns into reading legwork.

Reach for it when the next step is *finding something out* — how an API behaves, what a spec actually says, whether a claim holds — and you'd rather not stall your own thread doing the reading. For sharpening a plan by interview instead of by reading, use [grilling](https://aihero.dev/skills-grilling); for exploring what to build with throwaway code, use [prototype](https://aihero.dev/skills-prototype).

## Delegated legwork

The defining move is that the reading runs as a **background agent**. You keep working; it goes off, follows each claim back to its primary source, and drops a single cited Markdown file into wherever the repo keeps such notes. Research is legwork you delegate, not thinking you outsource — you get back a document to react to, with its sources attached.

## Where it fits

A reach-for-it-anytime standalone that feeds the thinking skills: the file it produces is something to grill, plan, or design against, so it sits upstream of work like [grilling](https://aihero.dev/skills-grilling) and [to-prd](https://aihero.dev/skills-to-prd) rather than in the build chain. For the whole map, see [ask-matt](https://aihero.dev/skills-ask-matt).
</file>

<file path="docs/engineering/resolving-merge-conflicts.md">
Quickstart:

```bash
npx skills add mattpocock/skills --skill=resolving-merge-conflicts
```

```bash
npx skills update resolving-merge-conflicts
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/resolving-merge-conflicts)

## What it does

`resolving-merge-conflicts` works through an in-progress git merge or rebase conflict, hunk by hunk, and finishes the operation — resolved, checked, and committed.

It resolves by **intent**, not by text. Before touching a hunk it traces each side back to its **primary source** — the commit message, the PR, the original issue — to understand why the change was made, then preserves both intents where they're compatible. It never invents new behaviour to paper over a clash, and it never reaches for `--abort`: the merge always gets finished.

## When to reach for it

Type `/resolving-merge-conflicts`, or the agent reaches for it automatically when a task fits.

Reach for this when you're mid-merge or mid-rebase and git has stopped on conflicts it can't resolve itself. It's for the conflict in front of you — not for planning the merge or for debugging behaviour that broke afterwards. If the merge is done but something's now failing for reasons you can't see, use [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs) instead.

## Resolving by intent

The trap in a conflict is treating it as a text problem — picking "ours" or "theirs" to make the markers go away. This skill treats it as an **intent** problem. Each side of a hunk exists because someone wanted something; the resolution has to honour both wants where it can, and where they're genuinely incompatible, pick the one that matches the merge's stated goal and note the trade-off out loud.

That's why the primary sources matter. You can't preserve an intent you haven't read, so the work starts in the history — commits, PRs, tickets — not in the diff.

## It's working if

- Each resolved hunk keeps both sides' behaviour, or names the trade-off where it couldn't.
- No new behaviour appears that wasn't on either branch.
- The project's own checks — typecheck, tests, format — are found and run green before the commit.
- The merge or rebase is carried all the way to a finished commit, never aborted.

## Where it fits

A reach-for-it-anytime standalone: you invoke it at the moment a merge or rebase stalls, and it hands you back a clean, committed tree. Its natural neighbour is [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs), because a merge that resolves cleanly but misbehaves afterwards is a diagnosis problem, not a conflict one. When you're unsure which skill fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
</file>

<file path="docs/engineering/setup-matt-pocock-skills.md">
Quickstart:

```bash
npx skills add mattpocock/skills --skill=setup-matt-pocock-skills
```

```bash
npx skills update setup-matt-pocock-skills
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/setup-matt-pocock-skills)

## What it does

`setup-matt-pocock-skills` teaches one repo how the engineering skills should behave in it — where issues live, what the triage labels are called, and where the domain docs sit — and records those answers as **config** the other skills read.

It writes config, it does not hard-code behaviour. The engineering chain assumes three files under `docs/agents/` exist; this skill is the one-time bootstrap that produces them, discovered from your actual repo (`git remote`, existing labels, existing `CONTEXT.md`) and confirmed with you rather than guessed. It is prompt-driven — explore, present what it found, confirm, then write — not a deterministic scaffold.

## When to reach for it

You invoke this by typing `/setup-matt-pocock-skills` — the agent won't reach for it on its own.

Reach for it **once per repo, before the first use of any other engineering skill**. If [triage](https://aihero.dev/skills-triage), [to-spec](https://aihero.dev/skills-to-spec), or [to-tickets](https://aihero.dev/skills-to-tickets) start guessing where your issues live or applying labels that don't exist, they haven't been set up here yet. Re-run it only to switch issue trackers or start over — day-to-day tweaks are just edits to `docs/agents/*.md`.

## The three decisions

It leads each with a recommended answer you can accept in a word, and skips whatever it can already infer — so most runs are a couple of quick confirmations:

- **Issue tracker** — where work is tracked, so `triage`/`to-spec`/`to-tickets` know whether to call `gh`, `glab`, write markdown under `.scratch/`, or follow a workflow you describe. GitHub, GitLab, local markdown, or other. (It proposes the one that matches your `git remote`.)
- **Triage labels** — asked only if the `triage` skill is installed, and then just: keep the default labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`)? Say no only if your tracker already uses other names, so `triage` applies real ones instead of creating duplicates.
- **Domain docs** — assumed single-context (one `CONTEXT.md` + `docs/adr/` at the root), which fits almost every repo; it only raises a multi-context map when it spots monorepo signals.

The output is a set of files under `docs/agents/` — `issue-tracker.md`, `domain.md`, and `triage-labels.md` when `triage` is installed — plus an `## Agent skills` block pointing to them in whichever of `CLAUDE.md` / `AGENTS.md` the repo already uses. Those files are the shared substrate the rest of the toolkit stands on.

## It's working if

- `issue-tracker.md` and `domain.md` land under `docs/agents/` (plus `triage-labels.md` when `triage` is installed), and an `## Agent skills` section appears in your `CLAUDE.md` or `AGENTS.md`.
- The tracker it proposes matches your real `git remote`, and the labels match strings that already exist in your repo.
- Afterwards, `triage` and `to-tickets` act on the right place with the right labels instead of asking or guessing.

## Where it fits

`setup-matt-pocock-skills` is a **run-once setup** — the foundation the whole engineering set stands on, not a step you repeat. Its neighbours are the skills that read what it writes: [triage](https://aihero.dev/skills-triage), because it applies the label vocabulary configured here, and [to-spec](https://aihero.dev/skills-to-spec) / [to-tickets](https://aihero.dev/skills-to-tickets), because they publish into the issue tracker configured here. Run it first; everything downstream assumes it has. When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
</file>

<file path="docs/engineering/tdd.md">
Quickstart:

```bash
npx skills add mattpocock/skills --skill=tdd
```

```bash
npx skills update tdd
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/tdd)

## What it does

`tdd` builds a feature or fixes a bug test-first, one behaviour at a time, driving the code out through a red-green loop.

It will **not** write all the tests up front. Batching the tests first ("horizontal slicing") produces tests of _imagined_ behaviour — they check the shape of things and go numb to real changes. `tdd` instead takes vertical slices: one test, then just enough code to pass it, then the next test, each cycle informed by what the last one taught you. Tests target public interfaces only, so the implementation underneath can change without the tests moving.

## When to reach for it

Type `/tdd`, or the agent reaches for it automatically when a task fits — building a feature or fixing a bug test-first, or when you say "red-green-refactor".

Reach for it when there's a concrete behaviour to build and you want tests that survive a refactor. If the behaviour isn't pinned down yet, settle the spec first — for that, use [to-spec](https://aihero.dev/skills-to-spec). When the work is really about the shape of the interface rather than the tests, use [codebase-design](https://aihero.dev/skills-codebase-design); `tdd` calls into it for the deep-module vocabulary during planning.

## Red-green, one slice at a time

The leading idea is the **red-green loop**: write one failing test (red), add just enough code to pass it (green), then repeat for the next behaviour — each cycle informed by what the last one taught you. The very first cycle is a **tracer bullet**: one test that proves a single path works end-to-end, before you build outward from it. Because you just wrote the code, you know exactly which behaviour matters and how to verify it — you never outrun your headlights by committing to test structure you don't yet understand.

Two rules keep the tests honest. A good test reads like a specification ("user can checkout with valid cart") and exercises real code paths through the public API, so renaming an internal function never breaks it. And expected values come from an independent source of truth — a known-good literal, a worked example, the spec — never recomputed the way the code computes them, which is how a **tautological** test passes by construction and tells you nothing.

Refactoring only happens once the suite is green; never while red.

## It's working if

- It writes one test, gets it passing, and only then writes the next — not a batch of tests followed by a batch of code.
- The tests name behaviours, not internals, and would survive an internal rename.
- Expected values are literals from the spec, not figures derived the same way the code derives them.

## Where it fits

`tdd` is the red-green loop the main build chain runs to write code:

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review
```

[implement](https://aihero.dev/skills-implement) is the chain's build step, and it drives `tdd` internally to build each ticket test-first before handing off to [code-review](https://aihero.dev/skills-code-review) — so `tdd` is the engine inside that step rather than a step of its own. You can also reach for it directly, whenever there's a concrete behaviour to build without a full spec. Its other neighbour is [codebase-design](https://aihero.dev/skills-codebase-design), which it leans on to find deep-module seams worth testing at. When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
</file>

<file path="docs/engineering/to-spec.md">
Quickstart:

```bash
npx skills add mattpocock/skills --skill=to-spec
```

```bash
npx skills update to-spec
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/to-spec)

## What it does

`to-spec` turns the current conversation and your codebase understanding into a spec (you may know this document as a PRD), then publishes it to your issue tracker.

It does **not** interview you again. By the time you reach for it, the alignment work is done — `to-spec` synthesises what is already known rather than asking a fresh round of questions.

## When to reach for it

You invoke this by typing `/to-spec` — the agent won't reach for it on its own.

Reach for it once a change has been talked through and the domain language is settled, and you want that shared understanding written down before any code is written. If you *haven't* aligned yet, grill first — for that, use [grill-with-docs](https://aihero.dev/skills-grill-with-docs). To split the finished spec into tickets, use [to-tickets](https://aihero.dev/skills-to-tickets).

## Prerequisites

`to-spec` publishes into your issue tracker, so [setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills) must have configured the tracker and triage labels for this repo first. It applies the `ready-for-agent` label itself — no separate triage pass needed.

## What the spec includes

- **Problem statement** — what is broken or missing, and why it's worth solving, in the project's own vocabulary.
- **Solution** — the shape of the fix at a high level, before any implementation detail.
- **User stories** — an extensive, numbered list of the concrete behaviours the change must support, each one independently checkable.
- **Implementation decisions** — the choices already settled during the conversation, so they aren't relitigated later.
- **Testing decisions** — the seams the feature will be tested at, and what "done" looks like.
- **Out-of-scope items** — what this change deliberately does *not* cover, to keep the ticket bounded.
- **Further notes** — anything else worth carrying forward that doesn't fit the sections above.

## Deep modules

Before writing the spec, `to-spec` sketches the **seams** at which the feature will be tested and looks for **deep module** opportunities — a lot of functionality hidden behind a small, stable interface. It prefers existing seams to new ones and the highest seam possible, ideally just one across the whole change.

That matters for agentic development: a good interface gives tests something durable to target, so the code underneath can change without the tests moving.

## It's working if

- It starts writing the spec instead of asking you a fresh round of questions.
- It checks the seams with you before writing, and proposes as few as possible.
- The spec comes back in your project's domain vocabulary, not generic boilerplate.

## Where it fits

`to-spec` is a step in the main build chain:

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review
```

Reach for it after the plan and domain language are resolved, and before you break the work into implementation tickets. Its key neighbours are [grill-with-docs](https://aihero.dev/skills-grill-with-docs), which sharpens the context so the spec is precise, and [to-tickets](https://aihero.dev/skills-to-tickets), which turns the spec into a set of tickets for [implement](https://aihero.dev/skills-implement) to build. When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
</file>

<file path="docs/engineering/to-tickets.md">
Quickstart:

```bash
npx skills add mattpocock/skills --skill=to-tickets
```

```bash
npx skills update to-tickets
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/to-tickets)

## What it does

`to-tickets` breaks a plan, spec, or the current conversation into a set of **tickets** — each a tracer-bullet vertical slice — and publishes them to your configured tracker, with every ticket declaring the tickets that block it.

Every ticket is a **tracer bullet** — a thin *vertical* slice that cuts through all integration layers end-to-end (schema, API, UI, tests), never a horizontal slice of one layer. A completed slice is demoable or verifiable on its own, which is what makes each ticket safe to hand to an agent.

## When to reach for it

You invoke this by typing `/to-tickets` — the agent won't reach for it on its own.

Reach for it once you have an agreed plan or a written spec and you want it split into tickets. Point it at the conversation, or pass a spec or issue reference and it fetches the body and comments first. If the change hasn't been written up as a spec yet, produce one first — for that, use [to-spec](https://aihero.dev/skills-to-spec).

## Prerequisites

`to-tickets` publishes into your issue tracker, so [setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills) must have configured the tracker and its triage label vocabulary for this repo first. On a real tracker it applies the ready-for-agent label as it publishes.

## One artifact, two readings

The blocking edges are the whole point. They make one set of tickets read two ways, depending on the tracker:

- **Local files** → one file per ticket under `.scratch/<feature>/issues/`, numbered blockers-first, the edges written as text. You work them top-to-bottom, by hand, staying in the loop.
- **A real tracker (GitHub, Linear)** → one issue per ticket, the edges as native blocking links (or sub-issues). Any ticket whose blockers are all done is on the **frontier** and can be grabbed — so several agents can run at once.

The edges live in the ticket regardless of medium; the medium only decides whether anything acts on them in parallel. `to-tickets` produces the artifact — how you run it (sequential by hand, or a parallel fleet) is up to you.

## Vertical slices, not horizontal ones

The whole skill turns on one distinction. A **horizontal** slice ships one layer of the change — all the schema, or all the API — and nothing works until every layer lands. A **vertical** slice, the tracer bullet, ships one narrow path through *every* layer at once, so it can be demoed the moment it's done.

Before slicing, `to-tickets` looks for prefactoring — "make the change easy, then make the easy change" — and orders that work first. It then quizzes you on the breakdown (granularity, blocking edges, what to merge or split) before publishing anything, and publishes blockers first so each ticket's "Blocked by" can reference a real ticket.

## The wide-refactor exception

One shape breaks the tracer-bullet rule: a **wide refactor** — a single mechanical change (rename a column, retype a shared symbol) whose **blast radius** fans across the whole codebase, so one edit breaks thousands of call sites at once and no vertical slice can land green. `to-tickets` slices it as **expand–contract** instead: expand (add the new form beside the old so nothing breaks), migrate (move call sites over in batches sized by blast radius, one ticket per batch, CI green throughout because the old form still exists), then contract (delete the old form once no caller remains). When even the batches can't stay green alone, they share an integration branch that all block a final integrate-and-verify ticket, and green is promised only there.

## Where it fits

`to-tickets` is a step in the main build chain:

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review
```

It sits between [to-spec](https://aihero.dev/skills-to-spec), which hands it a settled spec with user stories to slice against, and [implement](https://aihero.dev/skills-implement), which builds each ticket, driving [tdd](https://aihero.dev/skills-tdd) internally to write the tests test-first, before its [code-review](https://aihero.dev/skills-code-review) pass. Work the frontier one ticket per fresh context, clearing between them. When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
</file>

<file path="docs/engineering/triage.md">
Quickstart:

```bash
npx skills add mattpocock/skills --skill=triage
```

```bash
npx skills update triage
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/triage)

## What it does

`triage` moves issues on your project's tracker through a small **state machine** of triage roles — categorise them, verify the claim, grill them into shape if needed, and leave a ready-for-agent brief.

It never labels blind. Every triaged item carries exactly one **category** role (`bug` / `enhancement`) and one **state** role (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), and it *recommends and waits* — it tells you its category and state call with reasoning, then acts only on your direction. Before anything is promoted to `ready-for-agent`, it verifies the claim first: a bug gets reproduced, a PR gets checked out and run.

## When to reach for it

You invoke this by typing `/triage` and describing what you want in natural language — the agent won't reach for it on its own. "Show me anything that needs my attention", "let's look at #42", "move #42 to ready-for-agent".

Reach for it when your issue tracker has raw, unevaluated reports and you want them sorted, verified, and turned into work an agent or human can pick up. To turn a settled conversation into a fresh spec instead, use [to-spec](https://aihero.dev/skills-to-spec); to split an existing spec into tickets, use [to-tickets](https://aihero.dev/skills-to-tickets). `triage` is the reverse direction — it processes what's *already* landed in the tracker.

## Prerequisites

`triage` reads and writes your issue tracker, so [setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills) must have configured the tracker and the label mapping first. The role names above are **canonical** — the actual label strings in your tracker may differ, and that mapping is what setup provides. The config also decides whether external PRs count as a request surface, and who counts as external.

## A PR is an issue with attached code

Where the tracker treats external pull requests as a request surface, `triage` runs them through the *same* machine: same category roles, same states, same transitions — the states just read against the diff instead of a report. `ready-for-agent` means a brief is attached and an agent should take the next step on the code; `ready-for-human` means it's ready to merge. Discovery surfaces only external PRs, but an explicitly named PR is always triaged regardless of author.

## Verify before you brief

The step that separates `triage` from ad-hoc labelling is verification. It reproduces the bug from the reporter's steps, or checks out the PR and runs the tests, and reports back: confirmed with a code path, failed, or insufficient detail (which is itself a strong `needs-info` signal). It also runs two codebase checks — **redundancy** (is this already implemented? then it's a `wontfix`) and **prior rejection** (does `.out-of-scope/` already say no?). A confirmed verification makes a far stronger agent brief; guessing does not.

## It's working if

- Every item it touches ends with exactly one category role and one state role — never zero, never two conflicting states.
- It hands you a recommendation with reasoning and waits, rather than relabelling on its own.
- Bugs get reproduced and PRs get run before anything reaches `ready-for-agent`.
- Every comment it posts to the tracker opens with the `> *This was generated by AI during triage.*` disclaimer.

## Where it fits

`triage` is the **periodic maintenance** pass over your issue tracker — run it whenever reports pile up, to keep the queue sorted and the `ready-for-agent` column trustworthy. It sits at the front of the tracker, upstream of the build chain: the briefs it writes are what [tdd](https://aihero.dev/skills-tdd) later picks up to implement. When a request needs sharpening it leans on [grilling](https://aihero.dev/skills-grilling) and [domain-modeling](https://aihero.dev/skills-domain-modeling) to grill it into shape one question at a time. Its close neighbour is [to-spec](https://aihero.dev/skills-to-spec), which populates the tracker from a fresh conversation where `triage` processes what's already there. When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
</file>

<file path="docs/engineering/wayfinder.md">
Quickstart:

```bash
npx skills add mattpocock/skills --skill=wayfinder
```

```bash
npx skills update wayfinder
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/wayfinder)

## What it does

`wayfinder` takes an effort too big for one agent session — wrapped in fog, where the way from here to the goal isn't visible yet — and charts it as a **shared map** of **decision tickets** on your issue tracker, then resolves them one at a time until the way is clear. It **plans, it doesn't do**: every ticket resolves a decision — a question to settle, not a slice of a build to execute — and the map is done when nothing is left to decide before someone goes and builds the thing — so it produces decisions, not deliverables.

## When to reach for it

You invoke this by typing `/wayfinder` — the agent won't reach for it on its own.

Reach for it when an effort is **more than one agent session can hold** and the route to its **destination** is still foggy — you can feel the shape of the work but can't yet write it down as a spec or a plan. For turning an *already-clear* thread into a spec, use [to-spec](https://aihero.dev/skills-to-spec); for slicing an already-understood plan into buildable tickets, use [to-tickets](https://aihero.dev/skills-to-tickets). Wayfinder sits upstream of both: it's what you run when there's too much fog to spec directly.

## Prerequisites

The map and its tickets live on the repo's issue tracker, so wayfinder needs the tracker wiring that [setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills) lays down — it seeds a "Wayfinding operations" section describing how the map, child tickets, blocking, and frontier queries are expressed for GitHub, GitLab, or local-markdown. Absent that doc, wayfinder defaults to a local-markdown map.

## The map is an index, fog is the frontier

The **map** is a single `wayfinder:map` issue whose tickets are its child issues — one shared URL the whole team can watch. It's an **index, not a store**: each decision lives in exactly one place (its ticket), and the map only gists and links, never restates. A session loads the map at low resolution and zooms into individual tickets on demand.

Beyond the live tickets lies the **fog of war** — decisions you can tell are coming but can't yet pin down. The test for whether something is a ticket or still fog is whether you can *state the question precisely now*, not whether you can answer it. Resolving a ticket clears the fog ahead of it, **graduating** whatever's now specifiable into fresh tickets. The **frontier** is the open, unblocked, unclaimed tickets — the edge of the known — and it's what the tracker's native blocking renders visually, so you see what's takeable without opening the map. Fog only gathers *toward* the **destination**; work past it is ruled **out of scope**, closed, never graduating.

Every ticket is **HITL** (human in the loop — grilling, prototype) or **AFK** (agent alone — research); a HITL ticket only resolves through a live exchange, so the agent never answers its own questions. Research stays a real ticket — a shared blocker downstream decisions hang on — but because it's AFK, a session doesn't stop and read: it fires a `/research` **subagent** to burn the ticket down in parallel, keeping the frontier fast, and captures the findings on a throwaway `research/<name>` branch.

## It's working if

- Naming the **destination** is the first act — before any ticket exists — because it fixes the scope every ticket is measured against.
- One map is one `wayfinder:map` issue; tickets are its child issues, referred to by **name**, never a bare `#42`.
- A session resolves **at most one ticket** (research tickets excepted), records the answer as a resolution comment, closes the ticket, and appends a one-line pointer to *Decisions so far*.
- If the opening grill surfaces **no fog**, it stops and tells you the journey is small enough to skip the map.

## Where it fits

`wayfinder` is a big-idea **on-ramp**: an effort too large and foggy to spec in one sitting generates a cleared map of decisions, which then merges onto the main build flow. When the fog is pushed back and the way is clear, hand off to [to-spec](https://aihero.dev/skills-to-spec) to schedule the multi-session build (or, if the effort turned out small, implement directly). It leans on [grilling](https://aihero.dev/skills-grilling) and [domain-modeling](https://aihero.dev/skills-domain-modeling) to resolve individual tickets, and on [prototype](https://aihero.dev/skills-prototype) and [research](https://aihero.dev/skills-research) for the ticket types that need them. When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
</file>

<file path="docs/productivity/grill-me.md">
Quickstart:

```bash
npx skills add mattpocock/skills --skill=grill-me
```

```bash
npx skills update grill-me
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/productivity/grill-me)

## What it does

`grill-me` runs a relentless interview about a plan or design, walking every branch of the decision tree until you and the agent reach a **shared understanding**.

It asks **one question at a time** and waits. It never dumps a batch of questions at you — that is bewildering — and where a question can be answered by reading the codebase, it goes and reads rather than asking. Each question comes with the agent's own recommended answer, so you are reacting to a proposal, not staring at a blank prompt.

## When to reach for it

You invoke this by typing `/grill-me` — the agent won't reach for it on its own.

Reach for it before you build, when a plan feels roughly right but you can sense unresolved decisions hiding in it — the moment you want the soft spots found and forced into the open. If you want that same interrogation to also leave a paper trail of ADRs and a glossary behind, use [grill-with-docs](https://aihero.dev/skills-grill-with-docs) instead. And if the effort is too big to hold in one session and the route to the goal is still foggy — a greenfield project, a huge feature build — start further upstream with [wayfinder](https://aihero.dev/skills-wayfinder), which charts it as a map of decisions first and then merges back into this flow.

## The decision tree

The session walks the plan as a tree of decisions, resolving dependencies between them one by one — a parent decision settled before the choices that hang off it. The point is not to reach agreement quickly; it is to make every implicit call explicit, so nothing important is left silently assumed. You come out the other side with a plan whose branches have all been visited.

`grill-me` is **stateless**: it writes nothing and leaves no workspace behind. It runs anywhere, and the only artifact is the sharpened understanding in the conversation itself. That is the deliberate contrast with [grill-with-docs](https://aihero.dev/skills-grill-with-docs), which captures the same interview as durable ADRs and a glossary.

## Where it fits

`grill-me` is a reach-for-it-anytime standalone — the pre-build stress test you run whenever a plan needs hardening. It is the stateless, user-invoked front door to the [grilling](https://aihero.dev/skills-grilling) primitive; its closest neighbour is [grill-with-docs](https://aihero.dev/skills-grill-with-docs), the stateful sibling that runs the same interview but additionally records the decisions as ADRs and a glossary. If the outcome is a spec you want written down, hand off to [to-spec](https://aihero.dev/skills-to-spec), which synthesises the settled understanding into a spec without re-interviewing you. When you're unsure which flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
</file>

<file path="docs/productivity/grilling.md">
Quickstart:

```bash
npx skills add mattpocock/skills --skill=grilling
```

```bash
npx skills update grilling
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/productivity/grilling)

## What it does

`grilling` is the relentless interview that stress-tests a plan or design before you build it. It walks down the decision tree branch by branch, resolving the dependencies between decisions one at a time until you and the agent share the same understanding.

It asks **one question at a time** and waits for your answer before the next — never a bulk list, which is bewildering. Each question comes with the agent's own recommended answer, and any question the codebase can settle it explores instead of asking you. It won't start enacting the plan until you confirm the shared understanding has been reached.

## When to reach for it

Type `/grilling`, or the agent reaches for it automatically when a task fits — this is the underlying primitive, not a user-only entry point.

Reach for it when a plan or design still has soft spots and you want them surfaced before code is written. In practice you usually invoke it through one of its two wrappers rather than by name: for a plain grilling session use [grill-me](https://aihero.dev/skills-grill-me); to have the session also write ADRs and a glossary as it goes, use [grill-with-docs](https://aihero.dev/skills-grill-with-docs).

## The decision tree

The mental model is a **decision tree**: every plan branches into decisions, and decisions depend on each other. `grilling` descends that tree one node at a time, so an early answer can reshape which questions come next. That is why the questions arrive singly and in dependency order — a firehose of parallel questions loses the structure that makes the interview converge on a shared understanding.

## Pulled out on purpose

`grilling` is the **single source of truth** for the interview technique, split out as a model-invoked **primitive** so every skill that needs an interview can reach it instead of reinventing one. [grill-me](https://aihero.dev/skills-grill-me) and [grill-with-docs](https://aihero.dev/skills-grill-with-docs) are its two user-invoked front doors, but [improve-codebase-architecture](https://aihero.dev/skills-improve-codebase-architecture) and [triage](https://aihero.dev/skills-triage) also lean on it to pressure-test their own decisions.

Keeping the technique in one place means you can also reach for it directly when you just want the interview — without the ADR-writing or ticket-shaping that its wrappers add on top.

## Where it fits

`grilling` is the interview **primitive** under the main build chain: [grill-with-docs](https://aihero.dev/skills-grill-with-docs) runs it to sharpen context before [to-spec](https://aihero.dev/skills-to-spec) writes the spec. When you're unsure which entry point fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
</file>

<file path="docs/productivity/handoff.md">
Quickstart:

```bash
npx skills add mattpocock/skills --skill=handoff
```

```bash
npx skills update handoff
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/productivity/handoff)

## What it does

`handoff` compacts the current conversation into a **handoff document** — a single write-up a fresh agent can read to pick up the work where you left off.

It does **not** re-state what already lives elsewhere. Anything captured in a spec, plan, ADR, issue, commit, or diff is referenced by path or URL, never copied. The document carries only the live thread — what you were doing, why, and what's next — and it's saved to your OS's temporary directory, not into the workspace, so it never becomes another artifact to maintain.

## When to reach for it

You invoke this by typing `/handoff` — the agent won't reach for it on its own. Pass a note about what the next session is for and the document is tailored to it.

Reach for this when a conversation has gone long enough that its context is at risk — you're near a context limit, wrapping for the day, or deliberately handing the work to another agent — and you want the thread preserved without dragging the whole transcript along.

## What the document carries

- **The live thread** — what's in flight and why, in the conversation's own terms, minus anything already written down elsewhere.
- **Suggested skills** — a pointer to the skills the next agent should reach for to continue.
- **References, not copies** — links and paths to the specs, plans, ADRs, issues, and diffs that hold the settled detail.
- **Redacted secrets** — API keys, passwords, and PII stripped before the document is written.

The idea to hold onto is **compaction**: a handoff is the conversation squeezed down to just its resumable core, so a fresh agent inherits the momentum, not the noise.

## Where it fits

`handoff` is a reach-for-it-anytime standalone — it sits at the seam between two sessions rather than inside a build chain. It pairs naturally with the artifact-producing skills whose output it points at: [to-spec](https://aihero.dev/skills-to-spec), because a finished spec is exactly the kind of settled detail a handoff references instead of repeating. When you're unsure which skill fits the moment, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
</file>

<file path="docs/productivity/teach.md">
Quickstart:

```bash
npx skills add mattpocock/skills --skill=teach
```

```bash
npx skills update teach
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/productivity/teach)

## What it does

`teach` turns the current directory into a standing teaching workspace and teaches you one topic across many sessions — devising short, beautiful, interactive lessons tied to *why* you want to learn.

It does **not** teach from the model's own memory. Parametric knowledge is treated as untrusted; before it can teach, it gathers high-trust resources and grounds every claim in a citation. And it is stateful — the workspace remembers what you've learned, so each session picks up where the last left off rather than starting from scratch.

## When to reach for it

You invoke this by typing `/teach` — the agent won't reach for it on its own.

Reach for it when you want to *learn* a topic over time — a language, a framework, yoga, theoretical physics — and want the sessions to accumulate rather than evaporate. It is not for a one-off explanation; if you just need something clarified in the moment, ask directly. Reach for `teach` when the learning is a project.

## Prerequisites

`teach` builds a whole directory in place, so run it somewhere you're happy to keep as a dedicated workspace. Over time it writes:

- `MISSION.md` — the reason you're learning this, which grounds everything else. If it's empty, `teach`'s first job is to question you until it isn't.
- `RESOURCES.md` — the vetted, high-trust sources it teaches from.
- `./lessons/*.html` — the numbered, self-contained lessons (the primary unit of teaching).
- `./reference/*.html` — compressed cheat-sheets, algorithms, glossaries you'll return to.
- `./learning-records/*.md` — what you've learned, ADR-style, used to judge what to teach next.
- `./assets/*` — reusable components (a shared stylesheet first) so the lessons look like one course.
- `NOTES.md` — your teaching preferences.

## Mission, and the zone of proximal development

Every lesson hangs off the **mission**. Without it, knowledge has nothing to attach to and lessons feel abstract — so the mission is the first thing `teach` pins down and keeps updating as you grow. From the mission and your learning records it computes your **zone of proximal development**: the next lesson should challenge you *just enough*, no more.

## Storage strength, not fluency

The word to think with is **storage strength** — long-term retention — as opposed to **fluency**, the in-the-moment recall that feels like mastery but isn't. `teach` deliberately builds the former through desirable difficulty: retrieval practice, spacing, and interleaving. Knowledge is taught first (where difficulty is the enemy), then skills are drilled through a tight feedback loop (where difficulty is the tool).

## Where it fits

`teach` is a reach-for-it-anytime standalone — a long-running learning project you drive session by session, not a step in a build chain. It shares no workflow with the other productivity skills; it simply owns its workspace directory and lives there. When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
</file>

<file path="docs/productivity/writing-great-skills.md">
Quickstart:

```bash
npx skills add mattpocock/skills --skill=writing-great-skills
```

```bash
npx skills update writing-great-skills
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/productivity/writing-great-skills)

## What it does

`writing-great-skills` is the reference you write and edit skills against — the shared vocabulary and principles that make a skill predictable.

A skill's job is to wrangle determinism out of a stochastic system, so the goal is not the same *output* every run but the same *process*. **Predictability** is the root virtue, and every design choice is judged against it — not against how clever, complete, or exhaustive the skill reads.

## When to reach for it

You invoke this by typing `/writing-great-skills` — the agent won't reach for it on its own.

Reach for it whenever you're authoring a new skill or editing an existing one and want it to behave the same way every time: deciding invocation mode, writing a description, choosing what lives in `SKILL.md` versus a linked file, or diagnosing why a skill misfires.

## Cognitive load

The concept the whole reference turns on is **cognitive load** — and its counterpart, **context load**. Every skill spends one or the other:

- A **model-invoked** skill keeps a description in the window every turn, so it costs **context load** but fires on its own.
- A **user-invoked** skill strips that description; it costs zero context load, but now *you* are the index that has to remember it exists — that's **cognitive load**.

Most of these skills are user-invoked, which is why cognitive load is the pressure the whole system is built to manage: when user-invoked skills multiply past what you can hold in your head, the cure is a **router skill** that names the others and when to reach for each. Once you're thinking in these two loads, most authoring decisions — split or don't, inline or disclose, model- or user-invoked — become the same trade made in different places.

## The other levers

The rest of the reference is the toolkit for spending those loads well:

- **Leading words** — a compact concept already in the model's pretraining (_tight_, _red_, _tracer bullet_) that the agent thinks with while running the skill. It anchors execution *and* invocation in the fewest tokens; hunt restatements that a single word can retire.
- **Information hierarchy** — the ladder from in-skill step, to in-skill reference, to external reference behind a **context pointer**. **Progressive disclosure** is the move down that ladder so the top stays legible.
- **Pruning** — single source of truth, relevance, and the no-op test applied sentence by sentence, against **sediment** and **sprawl**.
- **Failure modes** — **premature completion**, **duplication**, **sediment**, **sprawl**, **no-op** — to diagnose a skill that isn't behaving.

## Where it fits

This is a reach-for-it-anytime standalone reference — the meta-skill you consult while building the rest of the set, not a step in a chain. Its natural neighbour is any router you maintain, because a router is the direct cure for the cognitive load that user-invoked skills pile up; when you're unsure which skill or flow fits a task, [ask-matt](https://aihero.dev/skills-ask-matt) routes you over the whole set.
</file>

<file path="scripts/link-skills.sh">
#!/usr/bin/env bash
set -euo pipefail

# NOTE: This is a dev-only script, intended for use by maintainers of this repo.
# It is not a supported installer. Modifications to it — or requests for
# modifications — will not be approved.
#
# Links all skills in the repository into the local skill directories used by
# each agent harness:
#   - ~/.claude/skills  — Claude Code
#   - ~/.agents/skills  — Codex and other Agent Skills-compatible harnesses
# Each entry is a symlink into this repo, so a `git pull` is all that's needed
# to keep installed skills up to date.

REPO="$(cd "$(dirname "$0")/.." && pwd)"
DESTS=("$HOME/.claude/skills" "$HOME/.agents/skills")

# Collect the repo's skills once, link into every destination.
names=()
srcs=()
while IFS= read -r -d '' skill_md; do
  src="$(dirname "$skill_md")"
  names+=("$(basename "$src")")
  srcs+=("$src")
done < <(find "$REPO/skills" -name SKILL.md -not -path '*/node_modules/*' -not -path '*/deprecated/*' -print0)

for DEST in "${DESTS[@]}"; do
  # If $DEST is a symlink that resolves into this repo, we'd end up writing the
  # per-skill symlinks back into the repo's own skills/ tree. Detect and bail
  # out instead of polluting the working copy.
  if [ -L "$DEST" ]; then
    resolved="$(readlink -f "$DEST")"
    case "$resolved" in
      "$REPO"|"$REPO"/*)
        echo "error: $DEST is a symlink into this repo ($resolved)." >&2
        echo "Remove it (rm \"$DEST\") and re-run; the script will recreate it as a real dir." >&2
        exit 1
        ;;
    esac
  fi

  mkdir -p "$DEST"

  for i in "${!names[@]}"; do
    name="${names[$i]}"
    src="${srcs[$i]}"
    target="$DEST/$name"

    if [ -e "$target" ] && [ ! -L "$target" ]; then
      rm -rf "$target"
    fi

    ln -sfn "$src" "$target"
    echo "linked $name -> $src ($DEST)"
  done
done
</file>

<file path="scripts/list-skills.sh">
#!/usr/bin/env bash
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"

cd "$REPO"
find . -name SKILL.md -not -path '*/node_modules/*' | sed 's|^\./||' | sort
</file>

<file path="skills/deprecated/design-an-interface/agents/openai.yaml">
interface:
  display_name: "Design an Interface"
  short_description: "Explore alternative module interfaces"
</file>

<file path="skills/deprecated/design-an-interface/SKILL.md">
---
name: design-an-interface
description: Generate multiple radically different interface designs for a module using parallel sub-agents. Use when user wants to design an API, explore interface options, compare module shapes, or mentions "design it twice".
---

# Design an Interface

Based on "Design It Twice" from "A Philosophy of Software Design": your first idea is unlikely to be the best. Generate multiple radically different designs, then compare.

## Workflow

### 1. Gather Requirements

Before designing, understand:

- [ ] What problem does this module solve?
- [ ] Who are the callers? (other modules, external users, tests)
- [ ] What are the key operations?
- [ ] Any constraints? (performance, compatibility, existing patterns)
- [ ] What should be hidden inside vs exposed?

Ask: "What does this module need to do? Who will use it?"

### 2. Generate Designs (Parallel Sub-Agents)

Spawn 3+ sub-agents simultaneously using Task tool. Each must produce a **radically different** approach.

```
Prompt template for each sub-agent:

Design an interface for: [module description]

Requirements: [gathered requirements]

Constraints for this design: [assign a different constraint to each agent]
- Agent 1: "Minimize method count - aim for 1-3 methods max"
- Agent 2: "Maximize flexibility - support many use cases"
- Agent 3: "Optimize for the most common case"
- Agent 4: "Take inspiration from [specific paradigm/library]"

Output format:
1. Interface signature (types/methods)
2. Usage example (how caller uses it)
3. What this design hides internally
4. Trade-offs of this approach
```

### 3. Present Designs

Show each design with:

1. **Interface signature** - types, methods, params
2. **Usage examples** - how callers actually use it in practice
3. **What it hides** - complexity kept internal

Present designs sequentially so user can absorb each approach before comparison.

### 4. Compare Designs

After showing all designs, compare them on:

- **Interface simplicity**: fewer methods, simpler params
- **General-purpose vs specialized**: flexibility vs focus
- **Implementation efficiency**: does shape allow efficient internals?
- **Depth**: small interface hiding significant complexity (good) vs large interface with thin implementation (bad)
- **Ease of correct use** vs **ease of misuse**

Discuss trade-offs in prose, not tables. Highlight where designs diverge most.

### 5. Synthesize

Often the best design combines insights from multiple options. Ask:

- "Which design best fits your primary use case?"
- "Any elements from other designs worth incorporating?"

## Evaluation Criteria

From "A Philosophy of Software Design":

**Interface simplicity**: Fewer methods, simpler params = easier to learn and use correctly.

**General-purpose**: Can handle future use cases without changes. But beware over-generalization.

**Implementation efficiency**: Does interface shape allow efficient implementation? Or force awkward internals?

**Depth**: Small interface hiding significant complexity = deep module (good). Large interface with thin implementation = shallow module (avoid).

## Anti-Patterns

- Don't let sub-agents produce similar designs - enforce radical difference
- Don't skip comparison - the value is in contrast
- Don't implement - this is purely about interface shape
- Don't evaluate based on implementation effort
</file>

<file path="skills/deprecated/qa/agents/openai.yaml">
interface:
  display_name: "QA"
  short_description: "Conversational QA that files issues"
</file>

<file path="skills/deprecated/qa/SKILL.md">
---
name: qa
description: Interactive QA session where user reports bugs or issues conversationally, and the agent files GitHub issues. Explores the codebase in the background for context and domain language. Use when user wants to report bugs, do QA, file issues conversationally, or mentions "QA session".
---

# QA Session

Run an interactive QA session. The user describes problems they're encountering. You clarify, explore the codebase for context, and file GitHub issues that are durable, user-focused, and use the project's domain language.

## For each issue the user raises

### 1. Listen and lightly clarify

Let the user describe the problem in their own words. Ask **at most 2-3 short clarifying questions** focused on:

- What they expected vs what actually happened
- Steps to reproduce (if not obvious)
- Whether it's consistent or intermittent

Do NOT over-interview. If the description is clear enough to file, move on.

### 2. Explore the codebase in the background

While talking to the user, kick off an Agent (subagent_type=Explore) in the background to understand the relevant area. The goal is NOT to find a fix — it's to:

- Learn the domain language used in that area (check UBIQUITOUS_LANGUAGE.md)
- Understand what the feature is supposed to do
- Identify the user-facing behavior boundary

This context helps you write a better issue — but the issue itself should NOT reference specific files, line numbers, or internal implementation details.

### 3. Assess scope: single issue or breakdown?

Before filing, decide whether this is a **single issue** or needs to be **broken down** into multiple issues.

Break down when:

- The fix spans multiple independent areas (e.g. "the form validation is wrong AND the success message is missing AND the redirect is broken")
- There are clearly separable concerns that different people could work on in parallel
- The user describes something that has multiple distinct failure modes or symptoms

Keep as a single issue when:

- It's one behavior that's wrong in one place
- The symptoms are all caused by the same root behavior

### 4. File the GitHub issue(s)

Create issues with `gh issue create`. Do NOT ask the user to review first — just file and share URLs.

Issues must be **durable** — they should still make sense after major refactors. Write from the user's perspective.

#### For a single issue

Use this template:

```
## What happened

[Describe the actual behavior the user experienced, in plain language]

## What I expected

[Describe the expected behavior]

## Steps to reproduce

1. [Concrete, numbered steps a developer can follow]
2. [Use domain terms from the codebase, not internal module names]
3. [Include relevant inputs, flags, or configuration]

## Additional context

[Any extra observations from the user or from codebase exploration that help frame the issue — e.g. "this only happens when using the Docker layer, not the filesystem layer" — use domain language but don't cite files]
```

#### For a breakdown (multiple issues)

Create issues in dependency order (blockers first) so you can reference real issue numbers.

Use this template for each sub-issue:

```
## Parent issue

#<parent-issue-number> (if you created a tracking issue) or "Reported during QA session"

## What's wrong

[Describe this specific behavior problem — just this slice, not the whole report]

## What I expected

[Expected behavior for this specific slice]

## Steps to reproduce

1. [Steps specific to THIS issue]

## Blocked by

- #<issue-number> (if this issue can't be fixed until another is resolved)

Or "None — can start immediately" if no blockers.

## Additional context

[Any extra observations relevant to this slice]
```

When creating a breakdown:

- **Prefer many thin issues over few thick ones** — each should be independently fixable and verifiable
- **Mark blocking relationships honestly** — if issue B genuinely can't be tested until issue A is fixed, say so. If they're independent, mark both as "None — can start immediately"
- **Create issues in dependency order** so you can reference real issue numbers in "Blocked by"
- **Maximize parallelism** — the goal is that multiple people (or agents) can grab different issues simultaneously

#### Rules for all issue bodies

- **No file paths or line numbers** — these go stale
- **Use the project's domain language** (check UBIQUITOUS_LANGUAGE.md if it exists)
- **Describe behaviors, not code** — "the sync service fails to apply the patch" not "applyPatch() throws on line 42"
- **Reproduction steps are mandatory** — if you can't determine them, ask the user
- **Keep it concise** — a developer should be able to read the issue in 30 seconds

After filing, print all issue URLs (with blocking relationships summarized) and ask: "Next issue, or are we done?"

### 5. Continue the session

Keep going until the user says they're done. Each issue is independent — don't batch them.
</file>

<file path="skills/deprecated/request-refactor-plan/agents/openai.yaml">
interface:
  display_name: "Request Refactor Plan"
  short_description: "Plan a safe incremental refactor"
</file>

<file path="skills/deprecated/request-refactor-plan/SKILL.md">
---
name: request-refactor-plan
description: Create a detailed refactor plan with tiny commits via user interview, then file it as a GitHub issue. Use when user wants to plan a refactor, create a refactoring RFC, or break a refactor into safe incremental steps.
---

This skill will be invoked when the user wants to create a refactor request. You should go through the steps below. You may skip steps if you don't consider them necessary.

1. Ask the user for a long, detailed description of the problem they want to solve and any potential ideas for solutions.

2. Explore the repo to verify their assertions and understand the current state of the codebase.

3. Ask whether they have considered other options, and present other options to them.

4. Interview the user about the implementation. Be extremely detailed and thorough.

5. Hammer out the exact scope of the implementation. Work out what you plan to change and what you plan not to change.

6. Look in the codebase to check for test coverage of this area of the codebase. If there is insufficient test coverage, ask the user what their plans for testing are.

7. Break the implementation into a plan of tiny commits. Remember Martin Fowler's advice to "make each refactoring step as small as possible, so that you can always see the program working."

8. Create a GitHub issue with the refactor plan. Use the following template for the issue description:

<refactor-plan-template>

## Problem Statement

The problem that the developer is facing, from the developer's perspective.

## Solution

The solution to the problem, from the developer's perspective.

## Commits

A LONG, detailed implementation plan. Write the plan in plain English, breaking down the implementation into the tiniest commits possible. Each commit should leave the codebase in a working state.

## Decision Document

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Out of Scope

A description of the things that are out of scope for this refactor.

## Further Notes (optional)

Any further notes about the refactor.

</refactor-plan-template>
</file>

<file path="skills/deprecated/ubiquitous-language/agents/openai.yaml">
interface:
  display_name: "Ubiquitous Language"
  short_description: "Build a shared domain glossary"
policy:
  allow_implicit_invocation: false
</file>

<file path="skills/deprecated/ubiquitous-language/SKILL.md">
---
name: ubiquitous-language
description: Extract a DDD-style ubiquitous language glossary from the current conversation, flagging ambiguities and proposing canonical terms. Saves to UBIQUITOUS_LANGUAGE.md. Use when user wants to define domain terms, build a glossary, harden terminology, create a ubiquitous language, or mentions "domain model" or "DDD".
disable-model-invocation: true
---

# Ubiquitous Language

Extract and formalize domain terminology from the current conversation into a consistent glossary, saved to a local file.

## Process

1. **Scan the conversation** for domain-relevant nouns, verbs, and concepts
2. **Identify problems**:
   - Same word used for different concepts (ambiguity)
   - Different words used for the same concept (synonyms)
   - Vague or overloaded terms
3. **Propose a canonical glossary** with opinionated term choices
4. **Write to `UBIQUITOUS_LANGUAGE.md`** in the working directory using the format below
5. **Output a summary** inline in the conversation

## Output Format

Write a `UBIQUITOUS_LANGUAGE.md` file with this structure:

```md
# Ubiquitous Language

## Order lifecycle

| Term        | Definition                                              | Aliases to avoid      |
| ----------- | ------------------------------------------------------- | --------------------- |
| **Order**   | A customer's request to purchase one or more items      | Purchase, transaction |
| **Invoice** | A request for payment sent to a customer after delivery | Bill, payment request |

## People

| Term         | Definition                                  | Aliases to avoid       |
| ------------ | ------------------------------------------- | ---------------------- |
| **Customer** | A person or organization that places orders | Client, buyer, account |
| **User**     | An authentication identity in the system    | Login, account         |

## Relationships

- An **Invoice** belongs to exactly one **Customer**
- An **Order** produces one or more **Invoices**

## Example dialogue

> **Dev:** "When a **Customer** places an **Order**, do we create the **Invoice** immediately?"
> **Domain expert:** "No — an **Invoice** is only generated once a **Fulfillment** is confirmed. A single **Order** can produce multiple **Invoices** if items ship in separate **Shipments**."
> **Dev:** "So if a **Shipment** is cancelled before dispatch, no **Invoice** exists for it?"
> **Domain expert:** "Exactly. The **Invoice** lifecycle is tied to the **Fulfillment**, not the **Order**."

## Flagged ambiguities

- "account" was used to mean both **Customer** and **User** — these are distinct concepts: a **Customer** places orders, while a **User** is an authentication identity that may or may not represent a **Customer**.
```

## Rules

- **Be opinionated.** When multiple words exist for the same concept, pick the best one and list the others as aliases to avoid.
- **Flag conflicts explicitly.** If a term is used ambiguously in the conversation, call it out in the "Flagged ambiguities" section with a clear recommendation.
- **Only include terms relevant for domain experts.** Skip the names of modules or classes unless they have meaning in the domain language.
- **Keep definitions tight.** One sentence max. Define what it IS, not what it does.
- **Show relationships.** Use bold term names and express cardinality where obvious.
- **Only include domain terms.** Skip generic programming concepts (array, function, endpoint) unless they have domain-specific meaning.
- **Group terms into multiple tables** when natural clusters emerge (e.g. by subdomain, lifecycle, or actor). Each group gets its own heading and table. If all terms belong to a single cohesive domain, one table is fine — don't force groupings.
- **Write an example dialogue.** A short conversation (3-5 exchanges) between a dev and a domain expert that demonstrates how the terms interact naturally. The dialogue should clarify boundaries between related concepts and show terms being used precisely.

<example>

## Example dialogue

> **Dev:** "How do I test the **sync service** without Docker?"

> **Domain expert:** "Provide the **filesystem layer** instead of the **Docker layer**. It implements the same **Sandbox service** interface but uses a local directory as the **sandbox**."

> **Dev:** "So **sync-in** still creates a **bundle** and unpacks it?"

> **Domain expert:** "Exactly. The **sync service** doesn't know which layer it's talking to. It calls `exec` and `copyIn` — the **filesystem layer** just runs those as local shell commands."

</example>

## Re-running

When invoked again in the same conversation:

1. Read the existing `UBIQUITOUS_LANGUAGE.md`
2. Incorporate any new terms from subsequent discussion
3. Update definitions if understanding has evolved
4. Re-flag any new ambiguities
5. Rewrite the example dialogue to incorporate new terms
</file>

<file path="skills/deprecated/README.md">
# Deprecated

Skills I no longer use.

- **[design-an-interface](./design-an-interface/SKILL.md)** — Generate multiple radically different interface designs for a module using parallel sub-agents.
- **[qa](./qa/SKILL.md)** — Interactive QA session where user reports bugs conversationally and the agent files GitHub issues.
- **[request-refactor-plan](./request-refactor-plan/SKILL.md)** — Create a detailed refactor plan with tiny commits via user interview, then file it as a GitHub issue.
- **[ubiquitous-language](./ubiquitous-language/SKILL.md)** — Extract a DDD-style ubiquitous language glossary from the current conversation.
</file>

<file path="skills/engineering/ask-matt/agents/openai.yaml">
interface:
  display_name: "Ask Matt"
  short_description: "Find the right skill or workflow"
policy:
  allow_implicit_invocation: false
</file>

<file path="skills/engineering/ask-matt/SKILL.md">
---
name: ask-matt
description: Ask which skill or flow fits your situation. A router over the skills in this repo.
disable-model-invocation: true
---

# Ask Matt

You don't remember every skill, so ask.

A **flow** is a path through the skills. Most paths run along one **main flow**, and two **on-ramps** merge onto it. Everything else is standalone, or a vocabulary layer that runs underneath.

## The main flow: idea → ship

The route most work travels. You have an idea and want it built.

1. **`/grill-with-docs`** — sharpen the idea by interview. Start here when you **have a codebase**: it's stateful, retaining what it learns in `CONTEXT.md` and ADRs. (No codebase? Use `/grill-me` — see Standalone. Both run the same `/grilling` primitive; `grill-with-docs` is the one that leaves a paper trail.)
2. **Branch — can you settle every question in conversation?** If a question needs a runnable answer (state, business logic, a UI you have to see), detour through a prototype, bridged by **`/handoff`** in both directions (see Crossing sessions):
   - **`/handoff`** out, then open a fresh session against that file,
   - **`/prototype`** to answer the question with throwaway code,
   - **`/handoff`** back what you learned, and reference it from the original idea thread.
3. **Branch — is this a multi-session build?**
   - **Yes** → **`/to-spec`** (turn the thread into a spec), then **`/to-tickets`** to split it into tracer-bullet tickets, each declaring its **blocking edges**. On a local tracker that's one file per ticket under `.scratch/<feature>/issues/`, worked blockers-first by hand; on a real tracker the edges become native blocking links, so any ticket whose blockers are done can be grabbed — kick off **`/implement`** per ticket, **clearing context between each one**.
   - **No** → **`/implement`** right here, in the same context window.

   Either way, **`/implement`** builds each issue by driving **`/tdd`** internally — one red-green slice at a time — then closes out by running **`/code-review`**, a two-axis review (Standards + Spec) of the diff, before committing. Reach for **`/tdd`** on its own when you just want to build a concrete behaviour test-first without a full spec, and **`/code-review`** on its own whenever you want to review a branch or PR against a fixed point.

### Context hygiene

Keep steps 1–3 in **one unbroken context window** — don't compact or clear until after `/to-tickets` — so the grilling, spec, and tickets all build on the same thinking. Each `/implement` then starts fresh, working from the ticket.

The limit on this is the **[smart zone](https://www.aihero.dev/ai-coding-dictionary/smart-zone)**: the window (~120k tokens on state-of-the-art models) within which the model still reasons sharply. If a session approaches it before `/to-tickets`, don't push on degraded — `/handoff` and continue in a fresh thread.

## On-ramps

A starting situation that generates work, then merges onto the main flow.

- **Bugs and requests piling up** → **`/triage`**. It moves issues through triage roles and produces agent-ready issues, which **`/implement`** later picks up.

  Triage is only for issues **you didn't create** — bug reports, incoming feature requests, anything that arrives raw. Tickets that `/to-tickets` produced are already agent-ready, so **don't triage them**.

- **Something's broken** → **`/diagnosing-bugs`**. For the hard ones: the bug that resists a first glance, the intermittent flake, the regression that crept in between two known-good states. It refuses to theorise until it has a **tight feedback loop** — one command that already goes red on *this* bug — then fixes with a regression test. Its post-mortem hands off to **`/improve-codebase-architecture`** when the real finding is that there's no good seam to lock the bug down.

- **A huge, foggy effort — a greenfield project or a huge feature build, too big for one session** → **`/wayfinder`**, the most cognitively demanding flow here. When the way from here to the destination isn't visible yet, it charts a **shared map** of **decision tickets** on the issue tracker and resolves them one at a time — producing **decisions, not deliverables** — until the fog is pushed back and the way is clear. Where **`/grill-with-docs`** sharpens an idea you can hold in one session, wayfinder is for the idea you can't — and it's slower and denser, so save it for exactly that, never a well-scoped feature.

  When the map clears, **it hands off, it doesn't build**: merge onto the main flow at **`/to-spec`**, which collapses the map's linked decisions into a buildable plan, then `/to-tickets` and `/implement` as usual. Looping the map straight into `/implement` skips that collapse and throws the linked detail away — go straight to `/implement` only when the effort turned out genuinely small.

## Codebase health

Not feature work — upkeep.

- **`/improve-codebase-architecture`** — run whenever you have a spare moment to keep the codebase good for agents to operate in. It surfaces **deepening opportunities**; picking one _generates an idea_ you can take into the main flow at `/grill-with-docs`. It's the survey that finds the candidates; **`/codebase-design`** (below) is the bench you design the chosen one on.

## Vocabulary underneath

Two model-invoked references that run *beneath* the other skills — each the single source of truth for its vocabulary. Reach for them directly when the **words**, not the process, are the problem; or let the skills above pull them in.

- **`/domain-modeling`** — sharpen the project's *domain* language: challenge a fuzzy term, resolve an overloaded word ("account" doing three jobs), record a hard-to-reverse decision as an ADR. It's the active discipline `/grill-with-docs` drives to keep `CONTEXT.md` a clean glossary.
- **`/codebase-design`** — the deep-module vocabulary (module, interface, depth, seam, adapter, leverage, locality) for designing a module's *shape*: a lot of behaviour behind a small interface at a clean seam. `/tdd` and `/improve-codebase-architecture` both speak it.

## Crossing sessions

- **`/handoff`** — when a thread is full or you need to branch off (e.g. into a `/prototype` session), this compacts the conversation into a markdown file. You don't continue in place — you **open a new session and reference that file** to carry the context across. It's the bridge between context windows, in either direction. Use it when you want a **fresh session** but need the **current conversation preserved**.
- **`/compact`** (built-in) — stay in the **same conversation**, letting the earlier turns be summarized. Use it at **intentional breaks between phases**, when you don't mind losing the verbatim history. Don't compact mid-phase — the agent can lose its way. `/handoff` forks; `/compact` continues.

## Standalone

Off the main flow entirely.

- **`/grill-me`** — the same relentless interview as `/grill-with-docs`, but for when you have **no codebase**. Stateless: it saves nothing locally, builds no `CONTEXT.md`. Reach for it to sharpen any plan or design that doesn't live in a repo.
- **`/prototype`** — a small, throwaway program that answers one design question: does this state model feel right, or what should this UI look like. Throwaway from day one — keep the answer, delete the code. It's the detour in step 2 of the main flow, but reach for it any time a design question is hard to settle on paper.
- **`/research`** — delegate reading legwork to a **background agent**: it investigates a question against **primary sources**, then leaves a cited Markdown file in the repo. Keep working while it reads. The file it produces is something to take *into* the main flow at `/grill-with-docs` — research feeds the thinking, it doesn't replace it.
- **`/teach`** — learn a concept over multiple sessions, using the current directory as a stateful workspace.
- **`/writing-great-skills`** — reference for writing and editing skills well.

## Precondition

**`/setup-matt-pocock-skills`** — run before your first engineering flow to configure the issue tracker, triage labels, and doc layout the other skills assume. Custom issue trackers also work.
</file>

<file path="skills/engineering/code-review/agents/openai.yaml">
interface:
  display_name: "Code Review"
  short_description: "Review a diff on standards and spec"
</file>

<file path="skills/engineering/code-review/SKILL.md">
---
name: code-review
description: Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes — Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match what the originating issue/PRD asked for?). Runs both reviews in parallel sub-agents and reports them side by side. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to "review since X".
---

Two-axis review of the diff between `HEAD` and a fixed point the user supplies:

- **Standards** — does the code conform to this repo's documented coding standards?
- **Spec** — does the code faithfully implement the originating issue / PRD / spec?

Both axes run as **parallel sub-agents** so they don't pollute each other's context, then this skill aggregates their findings.

The issue tracker should have been provided to you — run `/setup-matt-pocock-skills` if `docs/agents/issue-tracker.md` is missing.

## Process

### 1. Pin the fixed point

Whatever the user said is the fixed point — a commit SHA, branch name, tag, `main`, `HEAD~5`, etc. If they didn't specify one, ask for it.

Capture the diff command once: `git diff <fixed-point>...HEAD` (three-dot, so the comparison is against the merge-base). Also note the list of commits via `git log <fixed-point>..HEAD --oneline`.

Before going further, confirm the fixed point resolves (`git rev-parse <fixed-point>`) and the diff is non-empty. A bad ref or empty diff should fail here — not inside two parallel sub-agents.

### 2. Identify the spec source

Look for the originating spec, in this order:

1. Issue references in the commit messages (`#123`, `Closes #45`, GitLab `!67`, etc.) — fetch via the workflow in `docs/agents/issue-tracker.md`.
2. A path the user passed as an argument.
3. A PRD/spec file under `docs/`, `specs/`, or `.scratch/` matching the branch name or feature.
4. If nothing is found, ask the user where the spec is. If they say there isn't one, the **Spec** sub-agent will skip and report "no spec available".

### 3. Identify the standards sources

Anything in the repo that documents how code should be written, such as `CODING_STANDARDS.md` or `CONTRIBUTING.md`.

On top of whatever the repo documents, the Standards axis always carries the **smell baseline** below — a fixed set of Fowler code smells (_Refactoring_, ch.3) that applies even when a repo documents nothing. Two rules bind it:

- **The repo overrides.** A documented repo standard always wins; where it endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a labelled heuristic ("possible Feature Envy"), never a hard violation — and, like any standard here, skip anything tooling already enforces.

Each smell reads *what it is* → *how to fix*; match it against the diff:

- **Mysterious Name** — a function, variable, or type whose name doesn't reveal what it does or holds. → rename it; if no honest name comes, the design's murky.
- **Duplicated Code** — the same logic shape appears in more than one hunk or file in the change. → extract the shared shape, call it from both.
- **Feature Envy** — a method that reaches into another object's data more than its own. → move the method onto the data it envies.
- **Data Clumps** — the same few fields or params keep travelling together (a type wanting to be born). → bundle them into one type, pass that.
- **Primitive Obsession** — a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type.
- **Repeated Switches** — the same `switch`/`if`-cascade on the same type recurs across the change. → replace with polymorphism, or one map both sites share.
- **Shotgun Surgery** — one logical change forces scattered edits across many files in the diff. → gather what changes together into one module.
- **Divergent Change** — one file or module is edited for several unrelated reasons. → split so each module changes for one reason.
- **Speculative Generality** — abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it; inline back until a real need shows.
- **Message Chains** — long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- **Middle Man** — a class or function that mostly just delegates onward. → cut it, call the real target direct.
- **Refused Bequest** — a subclass or implementer that ignores or overrides most of what it inherits. → drop the inheritance, use composition.

### 4. Spawn both sub-agents in parallel

Send a single message with two `Agent` tool calls. Use the `general-purpose` subagent for both.

**Standards sub-agent prompt** — include:

- The full diff command and commit list.
- The list of standards-source files you found in step 3, **plus the smell baseline from step 3** pasted in full — the sub-agent has no other access to it.
- The brief: "Report — per file/hunk where relevant — (a) every place the diff violates a documented standard: cite the standard (file + the rule); and (b) any baseline smell you spot: name it and quote the hunk. Distinguish hard violations from judgement calls — documented-standard breaches can be hard, but baseline smells are always judgement calls, and a documented repo standard overrides the baseline. Skip anything tooling enforces. Under 400 words."

**Spec sub-agent prompt** — include:

- The diff command and commit list.
- The path or fetched contents of the spec.
- The brief: "Report: (a) requirements the spec asked for that are missing or partial; (b) behaviour in the diff that wasn't asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong. Quote the spec line for each finding. Under 400 words."

If the spec is missing, skip the Spec sub-agent and note this in the final report.

### 5. Aggregate

Present the two reports under `## Standards` and `## Spec` headings, verbatim or lightly cleaned. Do **not** merge or rerank findings — the two axes are deliberately separate (see _Why two axes_).

End with a one-line summary: total findings per axis, and the worst issue _within each axis_ (if any). Don't pick a single winner across axes — that's the reranking the separation exists to prevent.

## Why two axes

A change can pass one axis and fail the other:

- Code that follows every standard but implements the wrong thing → **Standards pass, Spec fail.**
- Code that does exactly what the issue asked but breaks the project's conventions → **Spec pass, Standards fail.**

Reporting them separately stops one axis from masking the other.
</file>

<file path="skills/engineering/codebase-design/agents/openai.yaml">
interface:
  display_name: "Codebase Design"
  short_description: "Vocabulary for deep-module design"
</file>

<file path="skills/engineering/codebase-design/DEEPENING.md">
# Deepening

How to deepen a cluster of shallow modules safely, given its dependencies. Assumes the vocabulary in [SKILL.md](SKILL.md) — **module**, **interface**, **seam**, **adapter**.

## Dependency categories

When assessing a candidate for deepening, classify its dependencies. The category determines how the deepened module is tested across its seam.

### 1. In-process

Pure computation, in-memory state, no I/O. Always deepenable — merge the modules and test through the new interface directly. No adapter needed.

### 2. Local-substitutable

Dependencies that have local test stand-ins (PGLite for Postgres, in-memory filesystem). Deepenable if the stand-in exists. The deepened module is tested with the stand-in running in the test suite. The seam is internal; no port at the module's external interface.

### 3. Remote but owned (Ports & Adapters)

Your own services across a network boundary (microservices, internal APIs). Define a **port** (interface) at the seam. The deep module owns the logic; the transport is injected as an **adapter**. Tests use an in-memory adapter. Production uses an HTTP/gRPC/queue adapter.

Recommendation shape: *"Define a port at the seam, implement an HTTP adapter for production and an in-memory adapter for testing, so the logic sits in one deep module even though it's deployed across a network."*

### 4. True external (Mock)

Third-party services (Stripe, Twilio, etc.) you don't control. The deepened module takes the external dependency as an injected port; tests provide a mock adapter.

## Seam discipline

- **One adapter means a hypothetical seam. Two adapters means a real one.** Don't introduce a port unless at least two adapters are justified (typically production + test). A single-adapter seam is just indirection.
- **Internal seams vs external seams.** A deep module can have internal seams (private to its implementation, used by its own tests) as well as the external seam at its interface. Don't expose internal seams through the interface just because tests use them.

## Testing strategy: replace, don't layer

- Old unit tests on shallow modules become waste once tests at the deepened module's interface exist — delete them.
- Write new tests at the deepened module's interface. The **interface is the test surface**.
- Tests assert on observable outcomes through the interface, not internal state.
- Tests should survive internal refactors — they describe behaviour, not implementation. If a test has to change when the implementation changes, it's testing past the interface.
</file>

<file path="skills/engineering/codebase-design/DESIGN-IT-TWICE.md">
# Design It Twice

When the user wants to explore alternative interfaces for a chosen deepening candidate, use this parallel sub-agent pattern. Based on "Design It Twice" (Ousterhout) — your first idea is unlikely to be the best.

Uses the vocabulary in [SKILL.md](SKILL.md) — **module**, **interface**, **seam**, **adapter**, **leverage**.

## Process

### 1. Frame the problem space

Before spawning sub-agents, write a user-facing explanation of the problem space for the chosen candidate:

- The constraints any new interface would need to satisfy
- The dependencies it would rely on, and which category they fall into (see [DEEPENING.md](DEEPENING.md))
- A rough illustrative code sketch to ground the constraints — not a proposal, just a way to make the constraints concrete

Show this to the user, then immediately proceed to Step 2. The user reads and thinks while the sub-agents work in parallel.

### 2. Spawn sub-agents

Spawn 3+ sub-agents in parallel using the Agent tool. Each must produce a **radically different** interface for the deepened module.

Prompt each sub-agent with a separate technical brief (file paths, coupling details, dependency category from [DEEPENING.md](DEEPENING.md), what sits behind the seam). The brief is independent of the user-facing problem-space explanation in Step 1. Give each agent a different design constraint:

- Agent 1: "Minimize the interface — aim for 1–3 entry points max. Maximise leverage per entry point."
- Agent 2: "Maximise flexibility — support many use cases and extension."
- Agent 3: "Optimise for the most common caller — make the default case trivial."
- Agent 4 (if applicable): "Design around ports & adapters for cross-seam dependencies."

Include both [SKILL.md](SKILL.md) vocabulary and CONTEXT.md vocabulary in the brief so each sub-agent names things consistently with the architecture language and the project's domain language.

Each sub-agent outputs:

1. Interface (types, methods, params — plus invariants, ordering, error modes)
2. Usage example showing how callers use it
3. What the implementation hides behind the seam
4. Dependency strategy and adapters (see [DEEPENING.md](DEEPENING.md))
5. Trade-offs — where leverage is high, where it's thin

### 3. Present and compare

Present designs sequentially so the user can absorb each one, then compare them in prose. Contrast by **depth** (leverage at the interface), **locality** (where change concentrates), and **seam placement**.

After comparing, give your own recommendation: which design you think is strongest and why. If elements from different designs would combine well, propose a hybrid. Be opinionated — the user wants a strong read, not a menu.
</file>

<file path="skills/engineering/codebase-design/SKILL.md">
---
name: codebase-design
description: Shared vocabulary for designing deep modules. Use when the user wants to design or improve a module's interface, find deepening opportunities, decide where a seam goes, make code more testable or AI-navigable, or when another skill needs the deep-module vocabulary.
---

# Codebase Design

Design **deep modules**: a lot of behaviour behind a small interface, placed at a clean seam, testable through that interface. Use this language and these principles wherever code is being designed or restructured. The aim is leverage for callers, locality for maintainers, and testability for everyone.

## Glossary

Use these terms exactly — don't substitute "component," "service," "API," or "boundary." Consistent language is the whole point.

**Module** — anything with an interface and an implementation. Deliberately scale-agnostic: a function, class, package, or tier-spanning slice. _Avoid_: unit, component, service.

**Interface** — everything a caller must know to use the module correctly: the type signature, but also invariants, ordering constraints, error modes, required configuration, and performance characteristics. _Avoid_: API, signature (too narrow — they refer only to the type-level surface).

**Implementation** — what's inside a module, its body of code. Distinct from **Adapter**: a thing can be a small adapter with a large implementation (a Postgres repo) or a large adapter with a small implementation (an in-memory fake). Reach for "adapter" when the seam is the topic; "implementation" otherwise.

**Depth** — leverage at the interface: the amount of behaviour a caller (or test) can exercise per unit of interface they have to learn. A module is **deep** when a large amount of behaviour sits behind a small interface, **shallow** when the interface is nearly as complex as the implementation.

**Seam** _(Michael Feathers)_ — a place where you can alter behaviour without editing in that place; the *location* at which a module's interface lives. Where to put the seam is its own design decision, distinct from what goes behind it. _Avoid_: boundary (overloaded with DDD's bounded context).

**Adapter** — a concrete thing that satisfies an interface at a seam. Describes *role* (what slot it fills), not substance (what's inside).

**Leverage** — what callers get from depth: more capability per unit of interface they learn. One implementation pays back across N call sites and M tests.

**Locality** — what maintainers get from depth: change, bugs, knowledge, and verification concentrate in one place rather than spreading across callers. Fix once, fixed everywhere.

## Deep vs shallow

**Deep module** = small interface + lots of implementation:

```
┌─────────────────────┐
│   Small Interface   │  ← Few methods, simple params
├─────────────────────┤
│                     │
│  Deep Implementation│  ← Complex logic hidden
│                     │
└─────────────────────┘
```

**Shallow module** = large interface + little implementation (avoid):

```
┌─────────────────────────────────┐
│       Large Interface           │  ← Many methods, complex params
├─────────────────────────────────┤
│  Thin Implementation            │  ← Just passes through
└─────────────────────────────────┘
```

When designing an interface, ask:

- Can I reduce the number of methods?
- Can I simplify the parameters?
- Can I hide more complexity inside?

## Principles

- **Depth is a property of the interface, not the implementation.** A deep module can be internally composed of small, mockable, swappable parts — they just aren't part of the interface. A module can have **internal seams** (private to its implementation, used by its own tests) as well as the **external seam** at its interface.
- **The deletion test.** Imagine deleting the module. If complexity vanishes, it was a pass-through. If complexity reappears across N callers, it was earning its keep.
- **The interface is the test surface.** Callers and tests cross the same seam. If you want to test *past* the interface, the module is probably the wrong shape.
- **One adapter means a hypothetical seam. Two adapters means a real one.** Don't introduce a seam unless something actually varies across it.

## Designing for testability

Good interfaces make testing natural:

1. **Accept dependencies, don't create them.**

   ```typescript
   // Testable
   function processOrder(order, paymentGateway) {}

   // Hard to test
   function processOrder(order) {
     const gateway = new StripeGateway();
   }
   ```

2. **Return results, don't produce side effects.**

   ```typescript
   // Testable
   function calculateDiscount(cart): Discount {}

   // Hard to test
   function applyDiscount(cart): void {
     cart.total -= discount;
   }
   ```

3. **Small surface area.** Fewer methods = fewer tests needed. Fewer params = simpler test setup.

## Relationships

- A **Module** has exactly one **Interface** (the surface it presents to callers and tests).
- **Depth** is a property of a **Module**, measured against its **Interface**.
- A **Seam** is where a **Module**'s **Interface** lives.
- An **Adapter** sits at a **Seam** and satisfies the **Interface**.
- **Depth** produces **Leverage** for callers and **Locality** for maintainers.

## Rejected framings

- **Depth as ratio of implementation-lines to interface-lines** (Ousterhout): rewards padding the implementation. We use depth-as-leverage instead.
- **"Interface" as the TypeScript `interface` keyword or a class's public methods**: too narrow — interface here includes every fact a caller must know.
- **"Boundary"**: overloaded with DDD's bounded context. Say **seam** or **interface**.

## Going deeper

- **Deepening a cluster given its dependencies** — see [DEEPENING.md](DEEPENING.md): dependency categories, seam discipline, and replace-don't-layer testing.
- **Exploring alternative interfaces** — see [DESIGN-IT-TWICE.md](DESIGN-IT-TWICE.md): spin up parallel sub-agents to design the interface several radically different ways, then compare on depth, locality, and seam placement.
</file>

<file path="skills/engineering/diagnosing-bugs/agents/openai.yaml">
interface:
  display_name: "Diagnosing Bugs"
  short_description: "Diagnose hard bugs and regressions"
</file>

<file path="skills/engineering/diagnosing-bugs/scripts/hitl-loop.template.sh">
#!/usr/bin/env bash
# Human-in-the-loop reproduction loop.
# Copy this file, edit the steps below, and run it.
# The agent runs the script; the user follows prompts in their terminal.
#
# Usage:
#   bash hitl-loop.template.sh
#
# Two helpers:
#   step "<instruction>"          → show instruction, wait for Enter
#   capture VAR "<question>"      → show question, read response into VAR
#
# At the end, captured values are printed as KEY=VALUE for the agent to parse.

set -euo pipefail

step() {
  printf '\n>>> %s\n' "$1"
  read -r -p "    [Enter when done] " _
}

capture() {
  local var="$1" question="$2" answer
  printf '\n>>> %s\n' "$question"
  read -r -p "    > " answer
  printf -v "$var" '%s' "$answer"
}

# --- edit below ---------------------------------------------------------

step "Open the app at http://localhost:3000 and sign in."

capture ERRORED "Click the 'Export' button. Did it throw an error? (y/n)"

capture ERROR_MSG "Paste the error message (or 'none'):"

# --- edit above ---------------------------------------------------------

printf '\n--- Captured ---\n'
printf 'ERRORED=%s\n' "$ERRORED"
printf 'ERROR_MSG=%s\n' "$ERROR_MSG"
</file>

<file path="skills/engineering/diagnosing-bugs/SKILL.md">
---
name: diagnosing-bugs
description: Diagnosis loop for hard bugs and performance regressions. Use when the user says "diagnose"/"debug this", or reports something broken/throwing/failing/slow.
---

# Diagnosing Bugs

A discipline for hard bugs. Skip phases only when explicitly justified.

When exploring the codebase, read `CONTEXT.md` (if it exists) to get a clear mental model of the relevant modules, and check ADRs in the area you're touching.

## Phase 1 — Build a feedback loop

**This is the skill.** Everything else is mechanical. If you have a **tight** pass/fail signal for the bug — one that goes red on _this_ bug — you will find the cause; bisection, hypothesis-testing, and instrumentation all just consume it. If you don't have one, no amount of staring at code will save you.

Spend disproportionate effort here. **Be aggressive. Be creative. Refuse to give up.**

### Ways to construct one — try them in roughly this order

1. **Failing test** at whatever seam reaches the bug — unit, integration, e2e.
2. **Curl / HTTP script** against a running dev server.
3. **CLI invocation** with a fixture input, diffing stdout against a known-good snapshot.
4. **Headless browser script** (Playwright / Puppeteer) — drives the UI, asserts on DOM/console/network.
5. **Replay a captured trace.** Save a real network request / payload / event log to disk; replay it through the code path in isolation.
6. **Throwaway harness.** Spin up a minimal subset of the system (one service, mocked deps) that exercises the bug code path with a single function call.
7. **Property / fuzz loop.** If the bug is "sometimes wrong output", run 1000 random inputs and look for the failure mode.
8. **Bisection harness.** If the bug appeared between two known states (commit, dataset, version), automate "boot at state X, check, repeat" so you can `git bisect run` it.
9. **Differential loop.** Run the same input through old-version vs new-version (or two configs) and diff outputs.
10. **HITL bash script.** Last resort. If a human must click, drive _them_ with `scripts/hitl-loop.template.sh` so the loop is still structured. Captured output feeds back to you.

Build the right feedback loop, and the bug is 90% fixed.

### Tighten the loop

Treat the loop as a product. Once you have _a_ loop, **tighten** it:

- Can I make it faster? (Cache setup, skip unrelated init, narrow the test scope.)
- Can I make the signal sharper? (Assert on the specific symptom, not "didn't crash".)
- Can I make it more deterministic? (Pin time, seed RNG, isolate filesystem, freeze network.)

A 30-second flaky loop is barely better than no loop; a 2-second deterministic one is tight — a debugging superpower.

### Non-deterministic bugs

The goal is not a clean repro but a **higher reproduction rate**. Loop the trigger 100×, parallelise, add stress, narrow timing windows, inject sleeps. A 50%-flake bug is debuggable; 1% is not — keep raising the rate until it's debuggable.

### When you genuinely cannot build a loop

Stop and say so explicitly. List what you tried. Ask the user for: (a) access to whatever environment reproduces it, (b) a captured artifact (HAR file, log dump, core dump, screen recording with timestamps), or (c) permission to add temporary production instrumentation. Do **not** proceed to hypothesise without a loop.

### Completion criterion — a tight loop that goes red

Phase 1 is done when the loop is **tight** and **red-capable**: you can name **one command** — a script path, a test invocation, a curl — that you have **already run at least once** (paste the invocation and its output), and that is:

- [ ] **Red-capable** — it drives the actual bug code path and asserts the **user's exact symptom**, so it can go red on this bug and green once fixed. Not "runs without erroring" — it must be able to _catch this specific bug_.
- [ ] **Deterministic** — same verdict every run (flaky bugs: a pinned, high reproduction rate, per above).
- [ ] **Fast** — seconds, not minutes.
- [ ] **Agent-runnable** — you can run it unattended; a human in the loop only via `scripts/hitl-loop.template.sh`.

If you catch yourself reading code to build a theory before this command exists, **stop — jumping straight to a hypothesis is the exact failure this skill prevents.** No red-capable command, no Phase 2.

## Phase 2 — Reproduce + minimise

Run the loop. Watch it go red — the bug appears.

Confirm:

- [ ] The loop produces the failure mode the **user** described — not a different failure that happens to be nearby. Wrong bug = wrong fix.
- [ ] The failure is reproducible across multiple runs (or, for non-deterministic bugs, reproducible at a high enough rate to debug against).
- [ ] You have captured the exact symptom (error message, wrong output, slow timing) so later phases can verify the fix actually addresses it.

### Minimise

Once it's red, shrink the repro to the **smallest scenario that still goes red**. Cut inputs, callers, config, data, and steps **one at a time**, re-running the loop after each cut — keep only what's load-bearing for the failure.

Why bother: a minimal repro shrinks the hypothesis space in Phase 3 (fewer moving parts left to suspect) and becomes the clean regression test in Phase 5.

Done when **every remaining element is load-bearing** — removing any one of them makes the loop go green.

Do not proceed until you have reproduced **and** minimised.

## Phase 3 — Hypothesise

Generate **3–5 ranked hypotheses** before testing any of them. Single-hypothesis generation anchors on the first plausible idea.

Each hypothesis must be **falsifiable**: state the prediction it makes.

> Format: "If <X> is the cause, then <changing Y> will make the bug disappear / <changing Z> will make it worse."

If you cannot state the prediction, the hypothesis is a vibe — discard or sharpen it.

**Show the ranked list to the user before testing.** They often have domain knowledge that re-ranks instantly ("we just deployed a change to #3"), or know hypotheses they've already ruled out. Cheap checkpoint, big time saver. Don't block on it — proceed with your ranking if the user is AFK.

## Phase 4 — Instrument

Each probe must map to a specific prediction from Phase 3. **Change one variable at a time.**

Tool preference:

1. **Debugger / REPL inspection** if the env supports it. One breakpoint beats ten logs.
2. **Targeted logs** at the boundaries that distinguish hypotheses.
3. Never "log everything and grep".

**Tag every debug log** with a unique prefix, e.g. `[DEBUG-a4f2]`. Cleanup at the end becomes a single grep. Untagged logs survive; tagged logs die.

**Perf branch.** For performance regressions, logs are usually wrong. Instead: establish a baseline measurement (timing harness, `performance.now()`, profiler, query plan), then bisect. Measure first, fix second.

## Phase 5 — Fix + regression test

Write the regression test **before the fix** — but only if there is a **correct seam** for it.

A correct seam is one where the test exercises the **real bug pattern** as it occurs at the call site. If the only available seam is too shallow (single-caller test when the bug needs multiple callers, unit test that can't replicate the chain that triggered the bug), a regression test there gives false confidence.

**If no correct seam exists, that itself is the finding.** Note it. The codebase architecture is preventing the bug from being locked down. Flag this for the next phase.

If a correct seam exists:

1. Turn the minimised repro into a failing test at that seam.
2. Watch it fail.
3. Apply the fix.
4. Watch it pass.
5. Re-run the Phase 1 feedback loop against the original (un-minimised) scenario.

## Phase 6 — Cleanup + post-mortem

Required before declaring done:

- [ ] Original repro no longer reproduces (re-run the Phase 1 loop)
- [ ] Regression test passes (or absence of seam is documented)
- [ ] All `[DEBUG-...]` instrumentation removed (`grep` the prefix)
- [ ] Throwaway prototypes deleted (or moved to a clearly-marked debug location)
- [ ] The hypothesis that turned out correct is stated in the commit / PR message — so the next debugger learns

**Then ask: what would have prevented this bug?** If the answer involves architectural change (no good test seam, tangled callers, hidden coupling) hand off to the `/improve-codebase-architecture` skill with the specifics. Make the recommendation **after** the fix is in, not before — you have more information now than when you started.
</file>

<file path="skills/engineering/domain-modeling/agents/openai.yaml">
interface:
  display_name: "Domain Modeling"
  short_description: "Build and sharpen a domain model"
</file>

<file path="skills/engineering/domain-modeling/ADR-FORMAT.md">
# ADR Format

ADRs live in `docs/adr/` and use sequential numbering: `0001-slug.md`, `0002-slug.md`, etc.

Create the `docs/adr/` directory lazily — only when the first ADR is needed.

## Template

```md
# {Short title of the decision}

{1-3 sentences: what's the context, what did we decide, and why.}
```

That's it. An ADR can be a single paragraph. The value is in recording *that* a decision was made and *why* — not in filling out sections.

## Optional sections

Only include these when they add genuine value. Most ADRs won't need them.

- **Status** frontmatter (`proposed | accepted | deprecated | superseded by ADR-NNNN`) — useful when decisions are revisited
- **Considered Options** — only when the rejected alternatives are worth remembering
- **Consequences** — only when non-obvious downstream effects need to be called out

## Numbering

Scan `docs/adr/` for the highest existing number and increment by one.

## When to offer an ADR

All three of these must be true:

1. **Hard to reverse** — the cost of changing your mind later is meaningful
2. **Surprising without context** — a future reader will look at the code and wonder "why on earth did they do it this way?"
3. **The result of a real trade-off** — there were genuine alternatives and you picked one for specific reasons

If a decision is easy to reverse, skip it — you'll just reverse it. If it's not surprising, nobody will wonder why. If there was no real alternative, there's nothing to record beyond "we did the obvious thing."

### What qualifies

- **Architectural shape.** "We're using a monorepo." "The write model is event-sourced, the read model is projected into Postgres."
- **Integration patterns between contexts.** "Ordering and Billing communicate via domain events, not synchronous HTTP."
- **Technology choices that carry lock-in.** Database, message bus, auth provider, deployment target. Not every library — just the ones that would take a quarter to swap out.
- **Boundary and scope decisions.** "Customer data is owned by the Customer context; other contexts reference it by ID only." The explicit no-s are as valuable as the yes-s.
- **Deliberate deviations from the obvious path.** "We're using manual SQL instead of an ORM because X." Anything where a reasonable reader would assume the opposite. These stop the next engineer from "fixing" something that was deliberate.
- **Constraints not visible in the code.** "We can't use AWS because of compliance requirements." "Response times must be under 200ms because of the partner API contract."
- **Rejected alternatives when the rejection is non-obvious.** If you considered GraphQL and picked REST for subtle reasons, record it — otherwise someone will suggest GraphQL again in six months.
</file>

<file path="skills/engineering/domain-modeling/CONTEXT-FORMAT.md">
# CONTEXT.md Format

## Structure

```md
# {Context Name}

{One or two sentence description of what this context is and why it exists.}

## Language

**Order**:
{A one or two sentence description of the term}
_Avoid_: Purchase, transaction

**Invoice**:
A request for payment sent to a customer after delivery.
_Avoid_: Bill, payment request

**Customer**:
A person or organization that places orders.
_Avoid_: Client, buyer, account
```

## Rules

- **Be opinionated.** When multiple words exist for the same concept, pick the best one and list the others under `_Avoid_`.
- **Keep definitions tight.** One or two sentences max. Define what it IS, not what it does.
- **Only include terms specific to this project's context.** General programming concepts (timeouts, error types, utility patterns) don't belong even if the project uses them extensively. Before adding a term, ask: is this a concept unique to this context, or a general programming concept? Only the former belongs.
- **Group terms under subheadings** when natural clusters emerge. If all terms belong to a single cohesive area, a flat list is fine.

## Single vs multi-context repos

**Single context (most repos):** One `CONTEXT.md` at the repo root.

**Multiple contexts:** A `CONTEXT-MAP.md` at the repo root lists the contexts, where they live, and how they relate to each other:

```md
# Context Map

## Contexts

- [Ordering](./src/ordering/CONTEXT.md) — receives and tracks customer orders
- [Billing](./src/billing/CONTEXT.md) — generates invoices and processes payments
- [Fulfillment](./src/fulfillment/CONTEXT.md) — manages warehouse picking and shipping

## Relationships

- **Ordering → Fulfillment**: Ordering emits `OrderPlaced` events; Fulfillment consumes them to start picking
- **Fulfillment → Billing**: Fulfillment emits `ShipmentDispatched` events; Billing consumes them to generate invoices
- **Ordering ↔ Billing**: Shared types for `CustomerId` and `Money`
```

The skill infers which structure applies:

- If `CONTEXT-MAP.md` exists, read it to find contexts
- If only a root `CONTEXT.md` exists, single context
- If neither exists, create a root `CONTEXT.md` lazily when the first term is resolved

When multiple contexts exist, infer which one the current topic relates to. If unclear, ask.
</file>

<file path="skills/engineering/domain-modeling/SKILL.md">
---
name: domain-modeling
description: Build and sharpen a project's domain model. Use when the user wants to pin down domain terminology or a ubiquitous language, record an architectural decision, or when another skill needs to maintain the domain model.
---

# Domain Modeling

Actively build and sharpen the project's domain model as you design. This is the *active* discipline — challenging terms, inventing edge-case scenarios, and writing the glossary and decisions down the moment they crystallise. (Merely *reading* `CONTEXT.md` for vocabulary is not this skill — that's a one-line habit any skill can do. This skill is for when you're changing the model, not just consuming it.)

## File structure

Most repos have a single context:

```
/
├── CONTEXT.md
├── docs/
│   └── adr/
│       ├── 0001-event-sourced-orders.md
│       └── 0002-postgres-for-write-model.md
└── src/
```

If a `CONTEXT-MAP.md` exists at the root, the repo has multiple contexts. The map points to where each one lives:

```
/
├── CONTEXT-MAP.md
├── docs/
│   └── adr/                          ← system-wide decisions
├── src/
│   ├── ordering/
│   │   ├── CONTEXT.md
│   │   └── docs/adr/                 ← context-specific decisions
│   └── billing/
│       ├── CONTEXT.md
│       └── docs/adr/
```

Create files lazily — only when you have something to write. If no `CONTEXT.md` exists, create one when the first term is resolved. If no `docs/adr/` exists, create it when the first ADR is needed.

## During the session

### Challenge against the glossary

When the user uses a term that conflicts with the existing language in `CONTEXT.md`, call it out immediately. "Your glossary defines 'cancellation' as X, but you seem to mean Y — which is it?"

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term. "You're saying 'account' — do you mean the Customer or the User? Those are different things."

### Discuss concrete scenarios

When domain relationships are being discussed, stress-test them with specific scenarios. Invent scenarios that probe edge cases and force the user to be precise about the boundaries between concepts.

### Cross-reference with code

When the user states how something works, check whether the code agrees. If you find a contradiction, surface it: "Your code cancels entire Orders, but you just said partial cancellation is possible — which is right?"

### Update CONTEXT.md inline

When a term is resolved, update `CONTEXT.md` right there. Don't batch these up — capture them as they happen. Use the format in [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md).

`CONTEXT.md` should be totally devoid of implementation details. Do not treat `CONTEXT.md` as a spec, a scratch pad, or a repository for implementation decisions. It is a glossary and nothing else.

### Offer ADRs sparingly

Only offer to create an ADR when all three are true:

1. **Hard to reverse** — the cost of changing your mind later is meaningful
2. **Surprising without context** — a future reader will wonder "why did they do it this way?"
3. **The result of a real trade-off** — there were genuine alternatives and you picked one for specific reasons

If any of the three is missing, skip the ADR. Use the format in [ADR-FORMAT.md](./ADR-FORMAT.md).
</file>

<file path="skills/engineering/grill-with-docs/agents/openai.yaml">
interface:
  display_name: "Grill with Docs"
  short_description: "Grill a design and write its docs"
policy:
  allow_implicit_invocation: false
</file>

<file path="skills/engineering/grill-with-docs/SKILL.md">
---
name: grill-with-docs
description: A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go.
disable-model-invocation: true
---

Run a `/grilling` session, using the `/domain-modeling` skill.
</file>

<file path="skills/engineering/implement/agents/openai.yaml">
interface:
  display_name: "Implement"
  short_description: "Build work from a spec or tickets"
policy:
  allow_implicit_invocation: false
</file>

<file path="skills/engineering/implement/SKILL.md">
---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

Use /tdd where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, use /code-review to review the work.

Commit your work to the current branch.
</file>

<file path="skills/engineering/improve-codebase-architecture/agents/openai.yaml">
interface:
  display_name: "Improve Codebase Architecture"
  short_description: "Find and grill architecture improvements"
policy:
  allow_implicit_invocation: false
</file>

<file path="skills/engineering/improve-codebase-architecture/HTML-REPORT.md">
# HTML Report Format

The architectural review is rendered as a single self-contained HTML file in the OS temp directory. Tailwind and Mermaid both come from CDNs. Mermaid handles graph-shaped diagrams reliably; hand-built divs and inline SVG handle the more editorial visuals (mass diagrams, cross-sections). Mix the two — don't lean on Mermaid for everything, it'll start to look generic.

## Scaffold

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Architecture review — {{repo name}}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="module">
      import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
      mermaid.initialize({ startOnLoad: true, theme: "neutral", securityLevel: "loose" });
    </script>
    <style>
      /* small custom layer for things Tailwind doesn't cover cleanly:
         dashed seam lines, hand-drawn-feeling arrow heads, etc. */
      .seam { stroke-dasharray: 4 4; }
      .leak { stroke: #dc2626; }
      .deep { background: linear-gradient(135deg, #0f172a, #1e293b); }
    </style>
  </head>
  <body class="bg-stone-50 text-slate-900 font-sans">
    <main class="max-w-5xl mx-auto px-6 py-12 space-y-12">
      <header>...</header>
      <section id="candidates" class="space-y-10">...</section>
      <section id="top-recommendation">...</section>
    </main>
  </body>
</html>
```

## Header

Repo name, date, and a compact legend: solid box = module, dashed line = seam, red arrow = leakage, thick dark box = deep module. No introduction paragraph — straight into the candidates.

## Candidate card

The diagrams carry the weight. Prose is sparse, plain, and uses the glossary terms (from the `/codebase-design` skill) without ceremony.

Each candidate is one `<article>`:

- **Title** — short, names the deepening (e.g. "Collapse the Order intake pipeline").
- **Badge row** — recommendation strength (`Strong` = emerald, `Worth exploring` = amber, `Speculative` = slate), plus a tag for the dependency category (`in-process`, `local-substitutable`, `ports & adapters`, `mock`).
- **Files** — monospaced list, `font-mono text-sm`.
- **Before / After diagram** — the centrepiece. Two columns, side by side. See patterns below.
- **Problem** — one sentence. What hurts.
- **Solution** — one sentence. What changes.
- **Wins** — bullets, ≤6 words each. e.g. "Tests hit one interface", "Pricing logic stops leaking", "Delete 4 shallow wrappers".
- **ADR callout** (if applicable) — one line in an amber-tinted box.

No paragraphs of explanation. If the diagram needs a paragraph to be understood, redraw the diagram.

## Diagram patterns

Pick the pattern that fits the candidate. Mix them. Don't make every diagram look the same — variety is part of the point.

### Mermaid graph (the workhorse for dependencies / call flow)

Use a Mermaid `flowchart` or `graph` when the point is "X calls Y calls Z, and look at the mess." Wrap it in a Tailwind-styled card so it doesn't feel parachuted in. Style with classDef to colour leakage edges red and the deep module dark. Sequence diagrams work well for "before: 6 round-trips; after: 1."

```html
<div class="rounded-lg border border-slate-200 bg-white p-4">
  <pre class="mermaid">
    flowchart LR
      A[OrderHandler] --> B[OrderValidator]
      B --> C[OrderRepo]
      C -.leak.-> D[PricingClient]
      classDef leak stroke:#dc2626,stroke-width:2px;
      class C,D leak
  </pre>
</div>
```

### Hand-built boxes-and-arrows (when Mermaid's layout fights you)

Modules as `<div>`s with borders and labels. Arrows as inline SVG `<line>` or `<path>` elements positioned absolutely over a relative container. Reach for this when you want the "after" diagram to feel like one thick-bordered deep module with greyed-out internals — Mermaid won't render that with the right weight.

### Cross-section (good for layered shallowness)

Stack horizontal bands (`h-12 border-l-4`) to show layers a call passes through. Before: 6 thin layers each doing nothing. After: 1 thick band labelled with the consolidated responsibility.

### Mass diagram (good for "interface as wide as implementation")

Two rectangles per module — one for interface surface area, one for implementation. Before: interface rectangle is nearly as tall as the implementation rectangle (shallow). After: interface rectangle is short, implementation rectangle is tall (deep).

### Call-graph collapse

Before: a tree of function calls rendered as nested boxes. After: the same tree collapsed into one box, with the now-internal calls shown faded inside it.

## Style guidance

- Lean editorial, not corporate-dashboard. Generous whitespace. Serif optional for headings (`font-serif` works well with stone/slate).
- Colour sparingly: one accent (emerald or indigo) plus red for leakage and amber for warnings.
- Keep diagrams ~320px tall so before/after sits comfortably side by side without scrolling.
- Use `text-xs uppercase tracking-wider` for module labels inside diagrams — they should read as schematic, not as UI.
- The only scripts are the Tailwind CDN and the Mermaid ESM import. The report is otherwise static — no app code, no interactivity beyond Mermaid's own rendering.

## Top recommendation section

One larger card. Candidate name, one sentence on why, anchor link to its card. That's it.

## Tone

Plain English, concise — but the architectural nouns and verbs come straight from the `/codebase-design` skill. Concision is not an excuse to drift.

**Use exactly:** module, interface, implementation, depth, deep, shallow, seam, adapter, leverage, locality.

**Never substitute:** component, service, unit (for module) · API, signature (for interface) · boundary (for seam) · layer, wrapper (for module, when you mean module).

**Phrasings that fit the style:**

- "Order intake module is shallow — interface nearly matches the implementation."
- "Pricing leaks across the seam."
- "Deepen: one interface, one place to test."
- "Two adapters justify the seam: HTTP in prod, in-memory in tests."

**Wins bullets** name the gain in glossary terms: *"locality: bugs concentrate in one module"*, *"leverage: one interface, N call sites"*, *"interface shrinks; implementation absorbs the wrappers"*. Don't write *"easier to maintain"* or *"cleaner code"* — those terms aren't in the glossary and don't earn their place.

No hedging, no throat-clearing, no "it's worth noting that…". If a sentence could be a bullet, make it a bullet. If a bullet could be cut, cut it. If a term isn't in the `/codebase-design` glossary, reach for one that is before inventing a new one.
</file>

<file path="skills/engineering/improve-codebase-architecture/SKILL.md">
---
name: improve-codebase-architecture
description: Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick.
disable-model-invocation: true
---

# Improve Codebase Architecture

Surface architectural friction and propose **deepening opportunities** — refactors that turn shallow modules into deep ones. The aim is testability and AI-navigability.

This command is _informed_ by the project's domain model and built on a shared design vocabulary:

- Run the `/codebase-design` skill for the architecture vocabulary (**module**, **interface**, **depth**, **seam**, **adapter**, **leverage**, **locality**) and its principles (the deletion test, "the interface is the test surface", "one adapter = hypothetical seam, two = real"). Use these terms exactly in every suggestion — don't drift into "component," "service," "API," or "boundary."
- The domain language in `CONTEXT.md` gives names to good seams; ADRs in `docs/adr/` record decisions this command should not re-litigate.

## Process

### 1. Explore

**Scope before you scan — YAGNI.** Deepening a module pays off by making future changes to it easier, so put extra weight on the parts of the codebase that have recently changed. Decide *where* to look before you look:

- If the user named a direction — a module, a subsystem, a pain point — take it, and skip the inference below.
- Otherwise, walk back a good stretch of the commit history (`git log --oneline`) to find the codebase's hot spots — the files and areas that keep coming up — and let those paths pull your attention first. If the changes are scattered with no clear hot spot, widen the net.

Read the project's domain glossary (`CONTEXT.md`) and any ADRs in the area you're touching first.

Then use the Agent tool with `subagent_type=Explore` to walk the codebase. Don't follow rigid heuristics — explore organically and note where you experience friction:

- Where does understanding one concept require bouncing between many small modules?
- Where are modules **shallow** — interface nearly as complex as the implementation?
- Where have pure functions been extracted just for testability, but the real bugs hide in how they're called (no **locality**)?
- Where do tightly-coupled modules leak across their seams?
- Which parts of the codebase are untested, or hard to test through their current interface?

Apply the **deletion test** to anything you suspect is shallow: would deleting it concentrate complexity, or just move it? A "yes, concentrates" is the signal you want.

### 2. Present candidates as an HTML report

Write a self-contained HTML file to the OS temp directory so nothing lands in the repo. Resolve the temp dir from `$TMPDIR`, falling back to `/tmp` (or `%TEMP%` on Windows), and write to `<tmpdir>/architecture-review-<timestamp>.html` so each run gets a fresh file. Open it for the user — `xdg-open <path>` on Linux, `open <path>` on macOS, `start <path>` on Windows — and tell them the absolute path.

The report uses **Tailwind via CDN** for layout and styling, and **Mermaid via CDN** for diagrams where a graph/flow/sequence reliably communicates the structure. Mix Mermaid with hand-crafted CSS/SVG visuals — use Mermaid when relationships are graph-shaped (call graphs, dependencies, sequences), and hand-built divs/SVG when you want something more editorial (mass diagrams, cross-sections, collapse animations). Each candidate gets a **before/after visualisation**. Be visual.

For each candidate, render a card with:

- **Files** — which files/modules are involved
- **Problem** — why the current architecture is causing friction
- **Solution** — plain English description of what would change
- **Benefits** — explained in terms of locality and leverage, and how tests would improve
- **Before / After diagram** — side-by-side, custom-drawn, illustrating the shallowness and the deepening
- **Recommendation strength** — one of `Strong`, `Worth exploring`, `Speculative`, rendered as a badge

End the report with a **Top recommendation** section: which candidate you'd tackle first and why.

**Use CONTEXT.md vocabulary for the domain, and the `/codebase-design` vocabulary for the architecture.** If `CONTEXT.md` defines "Order," talk about "the Order intake module" — not "the FooBarHandler," and not "the Order service."

**ADR conflicts**: if a candidate contradicts an existing ADR, only surface it when the friction is real enough to warrant revisiting the ADR. Mark it clearly in the card (e.g. a warning callout: _"contradicts ADR-0007 — but worth reopening because…"_). Don't list every theoretical refactor an ADR forbids.

See [HTML-REPORT.md](HTML-REPORT.md) for the full HTML scaffold, diagram patterns, and styling guidance.

Do NOT propose interfaces yet. After the file is written, ask the user: "Which of these would you like to explore?"

### 3. Grilling loop

Once the user picks a candidate, run the `/grilling` skill to walk the decision tree with them — constraints, dependencies, the shape of the deepened module, what sits behind the seam, what tests survive.

Side effects happen inline as decisions crystallize — run the `/domain-modeling` skill to keep the domain model current as you go:

- **Naming a deepened module after a concept not in `CONTEXT.md`?** Add the term to `CONTEXT.md`. Create the file lazily if it doesn't exist.
- **Sharpening a fuzzy term during the conversation?** Update `CONTEXT.md` right there.
- **User rejects the candidate with a load-bearing reason?** Offer an ADR, framed as: _"Want me to record this as an ADR so future architecture reviews don't re-suggest it?"_ Only offer when the reason would actually be needed by a future explorer to avoid re-suggesting the same thing — skip ephemeral reasons ("not worth it right now") and self-evident ones.
- **Want to explore alternative interfaces for the deepened module?** Run the `/codebase-design` skill and use its design-it-twice parallel sub-agent pattern.
</file>

<file path="skills/engineering/prototype/agents/openai.yaml">
interface:
  display_name: "Prototype"
  short_description: "Prototype to answer a design question"
</file>

<file path="skills/engineering/prototype/LOGIC.md">
# Logic Prototype

A tiny interactive terminal app that lets the user drive a state model by hand. Use this when the question is about **business logic, state transitions, or data shape** — the kind of thing that looks reasonable on paper but only feels wrong once you push it through real cases.

## When this is the right shape

- "I'm not sure if this state machine handles the edge case where X then Y."
- "Does this data model actually let me represent the case where..."
- "I want to feel out what the API should look like before writing it."
- Anything where the user wants to **press buttons and watch state change**.

If the question is "what should this look like" — wrong branch. Use [UI.md](UI.md).

## Process

### 1. State the question

Before writing code, write down what state model and what question you're prototyping. One paragraph, in the prototype's README or a comment at the top of the file. A logic prototype that answers the wrong question is pure waste — make the question explicit so it can be checked later, whether the user is watching now or returning to it AFK.

### 2. Pick the language

Use whatever the host project uses. If the project has no obvious runtime (e.g. a docs repo), ask.

Match the project's existing conventions for tooling — don't add a new package manager or runtime just for the prototype.

### 3. Isolate the logic in a portable module

Put the actual logic — the bit that's answering the question — behind a small, pure interface that could be lifted out and dropped into the real codebase later. The TUI around it is throwaway; the logic module shouldn't be.

The right shape depends on the question:

- **A pure reducer** — `(state, action) => state`. Good when actions are discrete events and state is a single value.
- **A state machine** — explicit states and transitions. Good when "which actions are even legal right now" is part of the question.
- **A small set of pure functions** over a plain data type. Good when there's no implicit current state — just transformations.
- **A class or module with a clear method surface** when the logic genuinely owns ongoing internal state.

Pick whichever shape best fits the question being asked, *not* whichever is easiest to wire to a TUI. Keep it pure: no I/O, no terminal code, no `console.log` for control flow. The TUI imports it and calls into it; nothing flows the other direction.

This is what makes the prototype useful past its own lifetime: when the question's been answered, the validated reducer / machine / function set can be lifted into the real module on its own.

### 4. Build the smallest TUI that exposes the state

Build it as a **lightweight TUI** — on every tick, clear the screen (`console.clear()` / `print("\033[2J\033[H")` / equivalent) and re-render the whole frame. The user should always see one stable view, not an ever-growing scrollback.

Each frame has two parts, in this order:

1. **Current state**, pretty-printed and diff-friendly (one field per line, or formatted JSON). Use **bold** for field names or section headers and **dim** for less important context (timestamps, IDs, derived values). Native ANSI escape codes are fine — `\x1b[1m` bold, `\x1b[2m` dim, `\x1b[0m` reset. No need to pull in a styling library unless one is already in the project.
2. **Keyboard shortcuts**, listed at the bottom: `[a] add user  [d] delete user  [t] tick clock  [q] quit`. Bold the key, dim the description, or vice-versa — whatever reads cleanly.

Behaviour:

1. **Initialise state** — a single in-memory object/struct. Render the first frame on start.
2. **Read one keystroke (or one line)** at a time, dispatch to a handler that mutates state.
3. **Re-render** the full frame after every action — don't append, replace.
4. **Loop until quit.**

The whole frame should fit on one screen.

### 5. Make it runnable in one command

Add a script to the project's existing task runner (`package.json` scripts, `Makefile`, `justfile`, `pyproject.toml`). The user should run `pnpm run <prototype-name>` or equivalent — never need to remember a path.

If the host project has no task runner, just put the command at the top of the prototype's README.

### 6. Hand it over

Give the user the run command. They'll drive it themselves; the interesting moments are when they say "wait, that shouldn't be possible" or "huh, I assumed X would be different" — those are the bugs in the _idea_, which is the whole point. If they want new actions added, add them. Prototypes evolve.

### 7. Capture the answer and the prototype

Once the prototype has answered its question, capture the answer, then capture the prototype the way the [SKILL](SKILL.md) describes. The logic-specific mapping: the validated reducer / machine / function set lifts into the real module (the decision, absorbed); the TUI shell rides along to the throwaway branch that keeps the prototype as a primary source.

## Anti-patterns

- **Don't add tests.** A prototype that needs tests is no longer a prototype.
- **Don't wire it to the real database.** Use an in-memory store unless the question is specifically about persistence.
- **Don't generalise.** No "what if we wanted to support X later." The prototype answers one question.
- **Don't blur the logic and the TUI together.** If the reducer / state machine references `console.log`, prompts, or terminal escape codes, it's no longer portable. Keep the TUI as a thin shell over a pure module.
- **Don't ship the TUI shell into production.** The shell is optimised for being driven by hand from a terminal. The logic module behind it is the bit worth keeping.
</file>

<file path="skills/engineering/prototype/SKILL.md">
---
name: prototype
description: Build a throwaway prototype to answer a design question. Use when the user wants to sanity-check whether a state model or logic feels right, or explore what a UI should look like.
---

# Prototype

A prototype is **throwaway code that answers a question**. The question decides the shape.

## Pick a branch

Identify which question is being answered — from the user's prompt, the surrounding code, or by asking if the user is around:

- **"Does this logic / state model feel right?"** → [LOGIC.md](LOGIC.md). Build a tiny interactive terminal app that pushes the state machine through cases that are hard to reason about on paper.
- **"What should this look like?"** → [UI.md](UI.md). Generate several radically different UI variations on a single route, switchable via a URL search param and a floating bottom bar.

The two branches produce very different artifacts — getting this wrong wastes the whole prototype. If the question is genuinely ambiguous and the user isn't reachable, default to whichever branch better matches the surrounding code (a backend module → logic; a page or component → UI) and state the assumption at the top of the prototype.

## Rules that apply to both

1. **Throwaway from day one, and clearly marked as such.** Locate the prototype code close to where it will actually be used (next to the module or page it's prototyping for) so context is obvious — but name it so a casual reader can see it's a prototype, not production. For throwaway UI routes, obey whatever routing convention the project already uses; don't invent a new top-level structure.
2. **One command to run.** Whatever the project's existing task runner supports — `pnpm <name>`, `python <path>`, `bun <path>`, etc. The user must be able to start it without thinking.
3. **No persistence by default.** State lives in memory. Persistence is the thing the prototype is _checking_, not something it should depend on. If the question explicitly involves a database, hit a scratch DB or a local file with a clear "PROTOTYPE — wipe me" name.
4. **Skip the polish.** No tests, no error handling beyond what makes the prototype _runnable_, no abstractions. The point is to learn something fast.
5. **Surface the state.** After every action (logic) or on every variant switch (UI), print or render the full relevant state so the user can see what changed.
6. **Capture it when done.** Fold any validated decision into the real code, then capture the prototype itself as a **primary source**: commit it to a throwaway branch, out of main, and leave a context pointer to that branch on the implementation issue. Capture the answer too — the verdict and the question it settled — in the issue or a commit. The main branch keeps only the validated decision.
</file>

<file path="skills/engineering/prototype/UI.md">
# UI Prototype

Generate **several radically different UI variations** on a single route, switchable from a floating bottom bar. The user flips between variants in the browser, picks one (or steals bits from each), then throws the rest away.

If the question is about logic/state rather than what something looks like — wrong branch. Use [LOGIC.md](LOGIC.md).

## When this is the right shape

- "What should this page look like?"
- "I want to see a few options for this dashboard before committing."
- "Try a different layout for the settings screen."
- Any time the user would otherwise spend a day picking between three vague mockups in their head.

## Two sub-shapes — strongly prefer sub-shape A

A UI prototype is much easier to judge when it's **butting up against the rest of the app** — real header, real sidebar, real data, real density. A throwaway route on its own is a vacuum: every variant looks fine in isolation. Default to sub-shape A whenever there's a plausible existing page to host the variants. Only reach for sub-shape B if the prototype genuinely has no nearby home.

### Sub-shape A — adjustment to an existing page (preferred)

The route already exists. Variants are rendered **on the same route**, gated by a `?variant=` URL search param. The existing data fetching, params, and auth all stay — only the rendering swaps. This is the default; pick it unless there's a specific reason not to.

If the prototype is for something that doesn't yet have a page but *would naturally live inside one* (a new section of the dashboard, a new card on the settings screen, a new step in an existing flow) — that's still sub-shape A. Mount the variants inside the host page.

### Sub-shape B — a new page (last resort)

Only use this when the thing being prototyped genuinely has no existing page to live inside — e.g. an entirely new top-level surface, or a flow that can't be embedded anywhere sensible.

Create a **throwaway route** following whatever routing convention the project already uses — don't invent a new top-level structure. Name it so it's obviously a prototype (e.g. include the word `prototype` in the path or filename). Same `?variant=` pattern.

Before committing to sub-shape B, sanity-check: is there really no existing page this could be embedded in? An empty route hides design problems that a populated one would expose.

In both sub-shapes the floating bottom bar is identical.

## Process

### 1. State the question and pick N

Default to **3 variants**. More than 5 stops being radically different and starts being noise — cap there.

Write down the plan in one line, in the prototype's location or a top-of-file comment:

> "Three variants of the settings page, switchable via `?variant=`, on the existing `/settings` route."

This works whether the user is here to push back or not.

### 2. Generate radically different variants

Draft each variant. Hold each one to:

- The page's purpose and the data it has access to.
- The project's component library / styling system (TailwindCSS, shadcn, MUI, plain CSS, whatever).
- A clear exported component name, e.g. `VariantA`, `VariantB`, `VariantC`.

Variants must be **structurally different** — different layout, different information hierarchy, different primary affordance, not just different colours. Three slightly-tweaked card grids isn't a UI prototype, it's wallpaper. If two drafts come out too similar, redo one with explicit "do not use a card grid" guidance.

### 3. Wire them together

Create a single switcher component on the route:

```tsx
// pseudo-code — adapt to the project's framework
const variant = searchParams.get('variant') ?? 'A';
return (
  <>
    {variant === 'A' && <VariantA {...data} />}
    {variant === 'B' && <VariantB {...data} />}
    {variant === 'C' && <VariantC {...data} />}
    <PrototypeSwitcher variants={['A','B','C']} current={variant} />
  </>
);
```

For sub-shape A (existing page): keep all the existing data fetching above the switcher; only the rendered subtree changes per variant.

For sub-shape B (new page): the throwaway route under `/prototype/<name>` mounts the same switcher.

### 4. Build the floating switcher

A small fixed-position bar at the bottom-centre of the screen with three pieces:

- **Left arrow** — cycles to the previous variant (wraps around).
- **Variant label** — shows the current variant key and, if the variant exports a name, that name too. e.g. `B — Sidebar layout`.
- **Right arrow** — cycles forward (wraps around).

Behaviour:

- Clicking an arrow updates the URL search param (use the framework's router — `router.replace` on Next, `navigate` on React Router, etc) so the variant is shareable and reload-stable.
- Keyboard: `←` and `→` arrow keys also cycle. Don't intercept arrow keys when an `<input>`, `<textarea>`, or `[contenteditable]` is focused.
- Visually distinct from the page (e.g. high-contrast pill, subtle shadow) so it's obviously not part of the design being evaluated.
- Hidden in production builds — gate on `process.env.NODE_ENV !== 'production'` or an equivalent check, so a stray prototype merge can't ship the bar to users.

Put the switcher in a single shared component so both sub-shapes can reuse it. Locate it wherever shared UI lives in the project.

### 5. Hand it over

Surface the URL (and the `?variant=` keys). The user will flip through whenever they get to it. The interesting feedback is usually **"I want the header from B with the sidebar from C"** — that's the actual design they want.

### 6. Capture the answer and clean up

Once a variant has won, capture the answer — which variant and why — then capture the prototype the way the [SKILL](SKILL.md) describes. Fold the winner into the real code and move the rest onto the throwaway branch, not into main:

- **Sub-shape A** — fold the winner into the existing page; drop the losing variants and the switcher from main.
- **Sub-shape B** — promote the winning variant to a real route; drop the throwaway route and the switcher from main.

The full set of variants is the primary source, so it lands on the throwaway branch, not the bin — variant components and the switcher left in the main branch rot fast and confuse the next reader.

## Anti-patterns

- **Variants that differ only in colour or copy.** That's a tweak, not a prototype. Real variants disagree about structure.
- **Sharing too much code between variants.** A shared `<Header>` is fine; a shared `<Layout>` defeats the point. Each variant should be free to throw out the layout.
- **Wiring variants to real mutations.** Read-only prototypes are fine. If a variant needs to mutate, point it at a stub — the question is "what should this look like", not "does the backend work".
- **Promoting the prototype directly to production.** The variant code was written under prototype constraints (no tests, minimal error handling). Rewrite it properly when you fold it in.
</file>

<file path="skills/engineering/research/agents/openai.yaml">
interface:
  display_name: "Research"
  short_description: "Research from high-trust sources"
</file>

<file path="skills/engineering/research/SKILL.md">
---
name: research
description: Investigate a question against high-trust primary sources and capture the findings as a Markdown file in the repo. Use when the user wants a topic researched, docs or API facts gathered, or reading legwork delegated to a background agent.
---

Spin up a **background agent** to do the research, so you keep working while it reads.

Its job:

1. Investigate the question against **primary sources** — official docs, source code, specs, first-party APIs — not a secondary write-up of them. Follow every claim back to the source that owns it.
2. Write the findings to a single Markdown file, citing each claim's source.
3. Save it where the repo already keeps such notes; match the existing convention, and if there is none, put it somewhere sensible and say where.
</file>

<file path="skills/engineering/resolving-merge-conflicts/agents/openai.yaml">
interface:
  display_name: "Resolving Merge Conflicts"
  short_description: "Resolve merge and rebase conflicts"
</file>

<file path="skills/engineering/resolving-merge-conflicts/SKILL.md">
---
name: resolving-merge-conflicts
description: "Use when you need to resolve an in-progress git merge/rebase conflict."
---

1. **See the current state** of the merge/rebase. Check git history, and the conflicting files.

2. **Find the primary sources** for each conflict. Understand deeply why each change was made, and what the original intent was. Read the commit messages, check the PRs, check original issues/tickets.

3. **Resolve each hunk.** Preserve both intents where possible. Where incompatible, pick the one matching the merge's stated goal and note the trade-off. Do **not** invent new behaviour. Always resolve; never `--abort`.

4. Discover the project's **automated checks** and run them — typically typecheck, then tests, then format. Fix anything the merge broke.

5. **Finish the merge/rebase.** Stage everything and commit. If rebasing, continue the rebase process until all commits are rebased.
</file>

<file path="skills/engineering/setup-matt-pocock-skills/agents/openai.yaml">
interface:
  display_name: "Setup Matt Pocock Skills"
  short_description: "Configure a repo for the skills"
policy:
  allow_implicit_invocation: false
</file>

<file path="skills/engineering/setup-matt-pocock-skills/domain.md">
# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root, or
- **`CONTEXT-MAP.md`** at the repo root if it exists — it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`docs/adr/`** — read ADRs that touch the area you're about to work in. In multi-context repos, also check `src/<context>/docs/adr/` for context-scoped decisions.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context repo (most repos):

```
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-event-sourced-orders.md
│   └── 0002-postgres-for-write-model.md
└── src/
```

Multi-context repo (presence of `CONTEXT-MAP.md` at the root):

```
/
├── CONTEXT-MAP.md
├── docs/adr/                          ← system-wide decisions
└── src/
    ├── ordering/
    │   ├── CONTEXT.md
    │   └── docs/adr/                  ← context-specific decisions
    └── billing/
        ├── CONTEXT.md
        └── docs/adr/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because…_
</file>

<file path="skills/engineering/setup-matt-pocock-skills/issue-tracker-github.md">
# Issue tracker: GitHub

Issues and PRDs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

Infer the repo from `git remote -v` — `gh` does this automatically when run inside a clone.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

When set to `yes`, PRs run through the same labels and states as issues, using the `gh pr` equivalents:

- **Read a PR**: `gh pr view <number> --comments` and `gh pr diff <number>` for the diff.
- **List external PRs for triage**: `gh pr list --state open --json number,title,body,labels,author,authorAssociation,comments` then keep only `authorAssociation` of `CONTRIBUTOR`, `FIRST_TIME_CONTRIBUTOR`, or `NONE` (drop `OWNER`/`MEMBER`/`COLLABORATOR`).
- **Comment / label / close**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`, `gh pr close`.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either — resolve with `gh pr view 42` and fall back to `gh issue view 42`.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

- **Map**: a single issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body. `gh issue create --label wayfinder:map`.
- **Child ticket**: an issue linked to the map as a GitHub sub-issue (`gh api` on the sub-issues endpoint). Where sub-issues aren't enabled, add the child to a task list in the map body and put `Part of #<map>` at the top of the child body. Labels: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). Once claimed, the ticket is assigned to the driving dev.
- **Blocking**: GitHub's **native issue dependencies** — the canonical, UI-visible representation. Add an edge with `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, where `<blocker-db-id>` is the blocker's numeric **database id** (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`, _not_ the `#number` or `node_id`). GitHub reports `issue_dependencies_summary.blocked_by` (open blockers only — the live gate). Where dependencies aren't available, fall back to a `Blocked by: #<n>, #<n>` line at the top of the child body. A ticket is unblocked when every blocker is closed.
- **Frontier query**: list the map's open children (`gh issue list --state open`, scoped to the map's sub-issues / task list), drop any with an open blocker (`issue_dependencies_summary.blocked_by > 0`, or an open issue in the `Blocked by` line) or an assignee; first in map order wins.
- **Claim**: `gh issue edit <n> --add-assignee @me` — the session's first write.
- **Resolve**: `gh issue comment <n> --body "<answer>"`, then `gh issue close <n>`, then append a context pointer (gist + link) to the map's Decisions-so-far.
</file>

<file path="skills/engineering/setup-matt-pocock-skills/issue-tracker-gitlab.md">
# Issue tracker: GitLab

Issues and PRDs for this repo live as GitLab issues. Use the [`glab`](https://gitlab.com/gitlab-org/cli) CLI for all operations.

## Conventions

- **Create an issue**: `glab issue create --title "..." --description "..."`. Use a heredoc for multi-line descriptions. Pass `--description -` to open an editor.
- **Read an issue**: `glab issue view <number> --comments`. Use `-F json` for machine-readable output.
- **List issues**: `glab issue list -F json` with appropriate `--label` filters.
- **Comment on an issue**: `glab issue note <number> --message "..."`. GitLab calls comments "notes".
- **Apply / remove labels**: `glab issue update <number> --label "..."` / `--unlabel "..."`. Multiple labels can be comma-separated or by repeating the flag.
- **Close**: `glab issue close <number>`. `glab issue close` does not accept a closing comment, so post the explanation first with `glab issue note <number> --message "..."`, then close.
- **Merge requests**: GitLab calls PRs "merge requests". Use `glab mr create`, `glab mr view`, `glab mr note`, etc. — the same shape as `gh pr ...` with `mr` in place of `pr` and `note`/`--message` in place of `comment`/`--body`.

Infer the repo from `git remote -v` — `glab` does this automatically when run inside a clone.

## Merge requests as a triage surface

**MRs as a request surface: no.** _(Set to `yes` if this repo treats external merge requests as feature requests; `/triage` reads this flag.)_

When set to `yes`, MRs run through the same labels and states as issues, using the `glab mr` equivalents:

- **Read an MR**: `glab mr view <number> --comments` and `glab mr diff <number>` for the diff.
- **List external MRs for triage**: `glab mr list -F json`, then keep only MRs whose author is not a project member/owner (a contributor's MR, not a maintainer's in-flight work).
- **Comment / label / close**: `glab mr note`, `glab mr update --label`/`--unlabel`, `glab mr close`.

Unlike GitHub, GitLab numbers issues and MRs separately, so `#42` is unambiguous once you know which surface the maintainer means.

## When a skill says "publish to the issue tracker"

Create a GitLab issue.

## When a skill says "fetch the relevant ticket"

Run `glab issue view <number> --comments`.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

- **Map**: a single issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body. `glab issue create --label wayfinder:map`. (On GitLab tiers with native epics, an epic may hold the map instead; a labelled issue works everywhere.)
- **Child ticket**: an issue carrying `Part of #<map>` at the top of its description and labels `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). Once claimed, the ticket is assigned to the driving dev.
- **Blocking**: GitLab's **native blocking link** — the canonical, UI-visible representation. Add it with the `/blocked_by #<n>` quick action, posted as a note (`glab issue note <child> --message "/blocked_by #<blocker>"`). Native blocking links are a Premium/Ultimate feature; on the free tier (or where unavailable) fall back to a `Blocked by: #<n>, #<n>` line at the top of the description. A ticket is unblocked when every blocker is closed.
- **Frontier query**: `glab issue list -F json` scoped to the map's children, drop any with an open blocker — a native `blocked_by` link to an open issue (`glab api projects/:id/issues/:iid/links`), or an open issue in the `Blocked by` line — or an assignee; first in map order wins.
- **Claim**: `glab issue update <n> --assignee @me` — the session's first write.
- **Resolve**: `glab issue note <n> --message "<answer>"`, then `glab issue close <n>`, then append a context pointer (gist + link) to the map's Decisions-so-far.
</file>

<file path="skills/engineering/setup-matt-pocock-skills/issue-tracker-local.md">
# Issue tracker: Local Markdown

Issues and specs (you may know a spec as a PRD) for this repo live as markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The spec is `.scratch/<feature-slug>/spec.md`
- Implementation issues are one file per ticket at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01` — never a single combined tickets file
- Triage state is recorded as a `Status:` line near the top of each issue file (see `triage-labels.md` for the role strings)
- Comments and conversation history append to the bottom of the file under a `## Comments` heading

## When a skill says "publish to the issue tracker"

Create a new file under `.scratch/<feature-slug>/` (creating the directory if needed).

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path. The user will normally pass the path or the issue number directly.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a file with one **child** file per ticket.

- **Map**: `.scratch/<effort>/map.md` — the Notes / Decisions-so-far / Fog body.
- **Child ticket**: `.scratch/<effort>/issues/NN-<slug>.md`, numbered from `01`, with the question in the body. A `Type:` line records the ticket type (`research`/`prototype`/`grilling`/`task`); a `Status:` line records `claimed`/`resolved`.
- **Blocking**: a `Blocked by: NN, NN` line near the top. A ticket is unblocked when every file it lists is `resolved`.
- **Frontier**: scan `.scratch/<effort>/issues/` for files that are open, unblocked, and unclaimed; first by number wins.
- **Claim**: set `Status: claimed` and save before any work.
- **Resolve**: append the answer under an `## Answer` heading, set `Status: resolved`, then append a context pointer (gist + link) to the map's Decisions-so-far in `map.md`.
</file>

<file path="skills/engineering/setup-matt-pocock-skills/SKILL.md">
---
name: setup-matt-pocock-skills
description: Configure this repo for the engineering skills — set up its issue tracker, triage label vocabulary, and domain doc layout. Run once before first use of the other engineering skills.
disable-model-invocation: true
---

# Setup Matt Pocock's Skills

Scaffold the per-repo configuration that the engineering skills assume:

- **Issue tracker** — where issues live (GitHub by default; local markdown is also supported out of the box)
- **Triage labels** — the strings used for the five canonical triage roles
- **Domain docs** — where `CONTEXT.md` and ADRs live, and the consumer rules for reading them

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with the user, then write.

## Process

### 1. Explore

Look at the current repo to understand its starting state. Read whatever exists; don't assume:

- `git remote -v` and `.git/config` — is this a GitHub repo? Which one?
- `AGENTS.md` and `CLAUDE.md` at the repo root — does either exist? Is there already an `## Agent skills` section in either?
- `CONTEXT.md` and `CONTEXT-MAP.md` at the repo root
- `docs/adr/` and any `src/*/docs/adr/` directories
- `docs/agents/` — does this skill's prior output already exist?
- `.scratch/` — sign that a local-markdown issue tracker convention is already in use
- Is the `triage` skill installed? (a `triage` skill folder alongside this one, or `triage` in your available skills.) This decides whether Section B runs at all.
- Monorepo signals — a `pnpm-workspace.yaml`, a `workspaces` field in `package.json`, or a populated `packages/*` with its own `src/`. Present only in a genuinely large multi-package repo; their absence means single-context, which is almost every repo.

### 2. Present findings and ask

Summarise what's present and what's missing. Then take the sections in order — one section, one answer, then the next.

Lead each section with the recommended answer so the user can accept it in a word. Give a one-line explainer only when the choice genuinely branches; skip the section entirely when exploration already settled it (Section B when `triage` isn't installed, Section C when there's no monorepo).

**Section A — Issue tracker.**

> Explainer: The "issue tracker" is where issues live for this repo. Skills like `to-tickets`, `triage`, `to-spec`, and `qa` read from and write to it — they need to know whether to call `gh issue create`, write a markdown file under `.scratch/`, or follow some other workflow you describe. Pick the place you actually track work for this repo.

Default posture: these skills were designed for GitHub. If a `git remote` points at GitHub, propose that. If a `git remote` points at GitLab (`gitlab.com` or a self-hosted host), propose GitLab. Otherwise (or if the user prefers), offer:

- **GitHub** — issues live in the repo's GitHub Issues (uses the `gh` CLI)
- **GitLab** — issues live in the repo's GitLab Issues (uses the [`glab`](https://gitlab.com/gitlab-org/cli) CLI)
- **Local markdown** — issues live as files under `.scratch/<feature>/` in this repo (good for solo projects or repos without a remote)
- **Other** (Jira, Linear, etc.) — ask the user to describe the workflow in one paragraph; the skill will record it as freeform prose

Record the choice in `docs/agents/issue-tracker.md`. The GitHub and GitLab templates carry a "PRs as a request surface" flag, defaulted **off** — leave it off and don't raise it; a user who wants external PRs in the triage queue can flip the flag in the file later.

**Section B — Triage label vocabulary.** Skip this section entirely if the `triage` skill isn't installed (exploration told you) — an uninstalled skill needs no labels.

If it is installed, ask exactly one question:

> Do you want to keep the default triage labels? (recommended: **yes**)

The defaults are the five canonical roles, each label string equal to its name: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. On **yes**, write them as-is. Only if the user says no — usually because their tracker already uses other names (e.g. `bug:triage` for `needs-triage`) — collect the overrides so `triage` applies existing labels instead of creating duplicates.

**Section C — Domain docs.** Default to **single-context** — one `CONTEXT.md` + `docs/adr/` at the repo root. This fits almost every repo; write it without asking.

Offer **multi-context** — a root `CONTEXT-MAP.md` pointing to per-context `CONTEXT.md` files — only when exploration found monorepo signals. Then confirm which layout they want.

### 3. Confirm and edit

Show the user a draft of:

- The `## Agent skills` block to add to whichever of `CLAUDE.md` / `AGENTS.md` is being edited (see step 4 for selection rules)
- The contents of `docs/agents/issue-tracker.md`, `docs/agents/domain.md`, and `docs/agents/triage-labels.md` (the last only when `triage` is installed)

Let them edit before writing.

### 4. Write

**Pick the file to edit:**

- If `CLAUDE.md` exists, edit it.
- Else if `AGENTS.md` exists, edit it.
- If neither exists, ask the user which one to create — don't pick for them.

Never create `AGENTS.md` when `CLAUDE.md` already exists (or vice versa) — always edit the one that's already there.

If an `## Agent skills` block already exists in the chosen file, update its contents in-place rather than appending a duplicate. Don't overwrite user edits to the surrounding sections.

The block:

```markdown
## Agent skills

### Issue tracker

[one-line summary of where issues are tracked]. See `docs/agents/issue-tracker.md`.

### Triage labels

[one-line summary of the label vocabulary]. See `docs/agents/triage-labels.md`.

### Domain docs

[one-line summary of layout — "single-context" or "multi-context"]. See `docs/agents/domain.md`.
```

Include the `### Triage labels` sub-block, and write `docs/agents/triage-labels.md`, only when `triage` is installed and Section B ran. When it isn't, both are omitted.

Then write the docs files using the seed templates in this skill folder as a starting point:

- [issue-tracker-github.md](./issue-tracker-github.md) — GitHub issue tracker
- [issue-tracker-gitlab.md](./issue-tracker-gitlab.md) — GitLab issue tracker
- [issue-tracker-local.md](./issue-tracker-local.md) — local-markdown issue tracker
- [triage-labels.md](./triage-labels.md) — label mapping (only if `triage` is installed)
- [domain.md](./domain.md) — domain doc consumer rules + layout

For "other" issue trackers, write `docs/agents/issue-tracker.md` from scratch using the user's description.

### 5. Done

Tell the user the setup is complete and which engineering skills will now read from these files. Mention they can edit `docs/agents/*.md` directly later — re-running this skill is only necessary if they want to switch issue trackers or restart from scratch.
</file>

<file path="skills/engineering/setup-matt-pocock-skills/triage-labels.md">
# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actual label strings used in this repo's issue tracker.

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`               | `needs-info`         | Waiting on reporter for more information |
| `ready-for-agent`          | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | `ready-for-human`    | Requires human implementation            |
| `wontfix`                  | `wontfix`            | Will not be actioned                     |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.

Edit the right-hand column to match whatever vocabulary you actually use.
</file>

<file path="skills/engineering/tdd/agents/openai.yaml">
interface:
  display_name: "TDD"
  short_description: "Test-driven red-green-refactor"
</file>

<file path="skills/engineering/tdd/mocking.md">
# When to Mock

Mock at **system boundaries** only:

- External APIs (payment, email, etc.)
- Databases (sometimes - prefer test DB)
- Time/randomness
- File system (sometimes)

Don't mock:

- Your own classes/modules
- Internal collaborators
- Anything you control

## Designing for Mockability

At system boundaries, design interfaces that are easy to mock:

**1. Use dependency injection**

Pass external dependencies in rather than creating them internally:

```typescript
// Easy to mock
function processPayment(order, paymentClient) {
  return paymentClient.charge(order.total);
}

// Hard to mock
function processPayment(order) {
  const client = new StripeClient(process.env.STRIPE_KEY);
  return client.charge(order.total);
}
```

**2. Prefer SDK-style interfaces over generic fetchers**

Create specific functions for each external operation instead of one generic function with conditional logic:

```typescript
// GOOD: Each function is independently mockable
const api = {
  getUser: (id) => fetch(`/users/${id}`),
  getOrders: (userId) => fetch(`/users/${userId}/orders`),
  createOrder: (data) => fetch('/orders', { method: 'POST', body: data }),
};

// BAD: Mocking requires conditional logic inside the mock
const api = {
  fetch: (endpoint, options) => fetch(endpoint, options),
};
```

The SDK approach means:
- Each mock returns one specific shape
- No conditional logic in test setup
- Easier to see which endpoints a test exercises
- Type safety per endpoint
</file>

<file path="skills/engineering/tdd/SKILL.md">
---
name: tdd
description: Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.
---

# Test-Driven Development

TDD is the red → green loop. This skill is the reference that makes that loop produce tests worth keeping: what a good test is, where tests go, the anti-patterns, and the rules of the loop. Every section applies on every cycle — consult them before and during the loop, not after.

When exploring the codebase, read `CONTEXT.md` (if it exists) so test names and interface vocabulary match the project's domain language, and respect ADRs in the area you're touching.

## What a good test is

Tests verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't. A good test reads like a specification — "user can checkout with valid cart" tells you exactly what capability exists — and survives refactors because it doesn't care about internal structure.

See [tests.md](tests.md) for examples and [mocking.md](mocking.md) for mocking guidelines.

## Seams — where tests go

A **seam** is the public boundary you test at: the interface where you observe behavior without reaching inside. Tests live at seams, never against internals.

**Test only at pre-agreed seams.** Before writing any test, write down the seams under test and confirm them with the user. No test is written at an unconfirmed seam. You can't test everything — agreeing the seams up front is how testing effort lands on the critical paths and complex logic instead of every edge case.

Ask: "What's the public interface, and which seams should we test?"

## Anti-patterns

- **Implementation-coupled** — mocks internal collaborators, tests private methods, or verifies through a side channel (querying the database instead of using the interface). The tell: the test breaks when you refactor but behavior hasn't changed.
- **Tautological** — the assertion recomputes the expected value the way the code does (`expect(add(a, b)).toBe(a + b)`, a snapshot derived by hand the same way, a constant asserted equal to itself), so it passes by construction and can never disagree with the code. Expected values must come from an independent source of truth — a known-good literal, a worked example, the spec.
- **Horizontal slicing** — writing all tests first, then all implementation. Bulk tests verify _imagined_ behavior: you test the _shape_ of things rather than user-facing behavior, the tests go insensitive to real changes, and you commit to test structure before understanding the implementation. Work in **vertical slices** instead — one test → one implementation → repeat, each test a **tracer bullet** that responds to what the last cycle taught you.

## Rules of the loop

- **Red before green.** Write the failing test first, then only enough code to pass it. Don't anticipate future tests or add speculative features.
- **One slice at a time.** One seam, one test, one minimal implementation per cycle.
- **Refactoring is not part of the loop.** It belongs to the review stage (see the `code-review` skill), not the red → green implementation cycle.
</file>

<file path="skills/engineering/tdd/tests.md">
# Good and Bad Tests

## Good Tests

**Integration-style**: Test through real interfaces, not mocks of internal parts.

```typescript
// GOOD: Tests observable behavior
test("user can checkout with valid cart", async () => {
  const cart = createCart();
  cart.add(product);
  const result = await checkout(cart, paymentMethod);
  expect(result.status).toBe("confirmed");
});
```

Characteristics:

- Tests behavior users/callers care about
- Uses public API only
- Survives internal refactors
- Describes WHAT, not HOW
- One logical assertion per test

## Bad Tests

**Implementation-detail tests**: Coupled to internal structure.

```typescript
// BAD: Tests implementation details
test("checkout calls paymentService.process", async () => {
  const mockPayment = jest.mock(paymentService);
  await checkout(cart, payment);
  expect(mockPayment.process).toHaveBeenCalledWith(cart.total);
});
```

Red flags:

- Mocking internal collaborators
- Testing private methods
- Asserting on call counts/order
- Test breaks when refactoring without behavior change
- Test name describes HOW not WHAT
- Verifying through external means instead of interface

```typescript
// BAD: Bypasses interface to verify
test("createUser saves to database", async () => {
  await createUser({ name: "Alice" });
  const row = await db.query("SELECT * FROM users WHERE name = ?", ["Alice"]);
  expect(row).toBeDefined();
});

// GOOD: Verifies through interface
test("createUser makes user retrievable", async () => {
  const user = await createUser({ name: "Alice" });
  const retrieved = await getUser(user.id);
  expect(retrieved.name).toBe("Alice");
});
```

**Tautological tests**: Expected value restates the implementation, so the test passes by construction.

```typescript
// BAD: Expected value is recomputed the way the code computes it
test("calculateTotal sums line items", () => {
  const items = [{ price: 10 }, { price: 5 }];
  const expected = items.reduce((sum, i) => sum + i.price, 0);
  expect(calculateTotal(items)).toBe(expected);
});

// GOOD: Expected value is an independent, known literal
test("calculateTotal sums line items", () => {
  expect(calculateTotal([{ price: 10 }, { price: 5 }])).toBe(15);
});
```
</file>

<file path="skills/engineering/to-spec/agents/openai.yaml">
interface:
  display_name: "To Spec"
  short_description: "Turn a conversation into a spec"
policy:
  allow_implicit_invocation: false
</file>

<file path="skills/engineering/to-spec/SKILL.md">
---
name: to-spec
description: Turn the current conversation into a spec and publish it to the project issue tracker — no interview, just synthesis of what you've already discussed.
disable-model-invocation: true
---

This skill takes the current conversation context and codebase understanding and produces a spec (you may know this document as a PRD). Do NOT interview the user — just synthesize what you already know.

The issue tracker and triage label vocabulary should have been provided to you — run `/setup-matt-pocock-skills` if not.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already. Use the project's domain glossary vocabulary throughout the spec, and respect any ADRs in the area you're touching.

2. Sketch out the seams at which you're going to test the feature. Existing seams should be preferred to new ones. Use the highest seam possible. If new seams are needed, propose them at the highest point you can. The fewer seams across the codebase, the better - the ideal number is one.

Check with the user that these seams match their expectations.

3. Write the spec using the template below, then publish it to the project issue tracker. Apply the `ready-for-agent` triage label - no need for additional triage.

<spec-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format of:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

This list of user stories should be extremely extensive and cover all aspects of the feature.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it within the relevant decision and note briefly that it came from a prototype. Trim to the decision-rich parts — not a working demo, just the important bits.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Out of Scope

A description of the things that are out of scope for this spec.

## Further Notes

Any further notes about the feature.

</spec-template>
</file>

<file path="skills/engineering/to-tickets/agents/openai.yaml">
interface:
  display_name: "To Tickets"
  short_description: "Split a plan into tracer-bullet tickets"
policy:
  allow_implicit_invocation: false
</file>

<file path="skills/engineering/to-tickets/SKILL.md">
---
name: to-tickets
description: Break a plan, spec, or the current conversation into a set of tracer-bullet tickets, each declaring its blocking edges, published to the configured tracker — edges as text in one file per ticket locally, or native blocking links on a real tracker.
disable-model-invocation: true
---

# To Tickets

Break a plan, spec, or conversation into a set of **tickets** — tracer-bullet vertical slices, each declaring the tickets that **block** it.

The issue tracker and triage label vocabulary should have been provided to you — run `/setup-matt-pocock-skills` if not.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes a reference (a spec path, an issue number or URL) as an argument, fetch it and read its full body and comments.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code. Ticket titles and descriptions should use the project's domain glossary vocabulary, and respect ADRs in the area you're touching.

Look for opportunities to prefactor the code to make the implementation easier. "Make the change easy, then make the easy change."

### 3. Draft vertical slices

Break the work into **tracer bullet** tickets.

<vertical-slice-rules>

- Each slice cuts a narrow but COMPLETE path through every layer (schema, API, UI, tests) — vertical, NOT a horizontal slice of one layer
- A completed slice is demoable or verifiable on its own
- Each slice is sized to fit in a single fresh context window
- Any prefactoring should be done first

</vertical-slice-rules>

Give each ticket its **blocking edges** — the other tickets that must complete before it can start. A ticket with no blockers can start immediately.

**Wide refactors are the exception to vertical slicing.** A **wide refactor** is one mechanical change — rename a column, retype a shared symbol — whose **blast radius** fans across the whole codebase, so a single edit breaks thousands of call sites at once and no vertical slice can land green. Don't force it into a tracer bullet; sequence it as **expand–contract**. First expand: add the new form beside the old so nothing breaks. Then migrate the call sites over in batches sized by blast radius (per package, per directory), each batch its own ticket blocked by the expand, keeping CI green batch to batch because the old form still exists. Finally contract: delete the old form once no caller remains, in a ticket blocked by every migrate batch. When even the batches can't stay green alone, keep the sequence but let them share an integration branch that all block a final integrate-and-verify ticket — green is promised only there.

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each ticket, show:

- **Title**: short descriptive name
- **Blocked by**: which other tickets (if any) must complete first
- **What it delivers**: the end-to-end behaviour this ticket makes work

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the blocking edges correct — does each ticket only depend on tickets that genuinely gate it?
- Should any tickets be merged or split further?

Iterate until the user approves the breakdown.

### 5. Publish the tickets to the configured tracker

Publish the approved tickets. **How** depends on the tracker `/setup-matt-pocock-skills` configured — the tickets are the same either way, only the shape of the blocking edges changes:

- **Local files** → write one file per ticket under `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01` in dependency order (blockers first). Each file's "Blocked by" lists the numbers/titles it depends on. Use the per-ticket file template below — one ticket per file, never a single combined file.
- **A real issue tracker (GitHub, Linear, …)** → publish one issue per ticket in dependency order (blockers first) so each ticket's blocking edges can reference real identifiers. Use the platform's native blocking / sub-issue relationship where it has one; otherwise set each ticket's "Blocked by" to the blocking issues. Apply the `ready-for-agent` triage label unless instructed otherwise — the tickets are agent-grabbable by construction.

Work the **frontier**: any ticket whose blockers are all done. For a purely linear chain that means top to bottom.

Do NOT close or modify any parent issue.

<local-ticket-template>

# <NN> — <Ticket title>

**What to build:** the end-to-end behaviour this ticket makes work, from the user's perspective — not a layer-by-layer implementation list.

**Blocked by:** the numbers/titles of the tickets that gate this one, or "None — can start immediately".

**Status:** ready-for-agent

- [ ] Acceptance criterion 1
- [ ] Acceptance criterion 2

</local-ticket-template>

<issue-template>

## Parent

A reference to the parent issue on the tracker (if the source was an existing issue, otherwise omit this section).

## What to build

The end-to-end behaviour this ticket makes work, from the user's perspective — not layer-by-layer implementation.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Blocked by

- A reference to each blocking ticket, or "None — can start immediately".

</issue-template>

In either form, avoid specific file paths or code snippets — they go stale fast. Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it and note briefly that it came from a prototype. Trim to the decision-rich parts — not a working demo, just the important bits.
</file>

<file path="skills/engineering/triage/agents/openai.yaml">
interface:
  display_name: "Triage"
  short_description: "Move issues through triage roles"
policy:
  allow_implicit_invocation: false
</file>

<file path="skills/engineering/triage/AGENT-BRIEF.md">
# Writing Agent Briefs

An agent brief is a structured comment posted on a GitHub issue or PR when it moves to `ready-for-agent`. It is the authoritative specification that an AFK agent will work from. The original body and discussion are context — the agent brief is the contract.

The brief states **what the agent should do**, which stretches to both surfaces: for an issue, that's building the change from nothing; for a PR, it's what's left to do *to the existing diff* — finish it, close gaps, address review points. Same principles either way; the PR example below shows the difference.

## Principles

### Durability over precision

The issue may sit in `ready-for-agent` for days or weeks. The codebase will change in the meantime. Write the brief so it stays useful even as files are renamed, moved, or refactored.

- **Do** describe interfaces, types, and behavioral contracts
- **Do** name specific types, function signatures, or config shapes that the agent should look for or modify
- **Don't** reference file paths — they go stale
- **Don't** reference line numbers
- **Don't** assume the current implementation structure will remain the same

### Behavioral, not procedural

Describe **what** the system should do, not **how** to implement it. The agent will explore the codebase fresh and make its own implementation decisions.

- **Good:** "The `SkillConfig` type should accept an optional `schedule` field of type `CronExpression`"
- **Bad:** "Open src/types/skill.ts and add a schedule field on line 42"
- **Good:** "When a user runs `/triage` with no arguments, they should see a summary of issues needing attention"
- **Bad:** "Add a switch statement in the main handler function"

### Complete acceptance criteria

The agent needs to know when it's done. Every agent brief must have concrete, testable acceptance criteria. Each criterion should be independently verifiable.

- **Good:** "Running `gh issue list --label needs-triage` returns issues that have been through initial classification"
- **Bad:** "Triage should work correctly"

### Explicit scope boundaries

State what is out of scope. This prevents the agent from gold-plating or making assumptions about adjacent features.

## Template

```markdown
## Agent Brief

**Category:** bug / enhancement
**Summary:** one-line description of what needs to happen

**Current behavior:**
Describe what happens now. For bugs, this is the broken behavior.
For enhancements, this is the status quo the feature builds on.

**Desired behavior:**
Describe what should happen after the agent's work is complete.
Be specific about edge cases and error conditions.

**Key interfaces:**
- `TypeName` — what needs to change and why
- `functionName()` return type — what it currently returns vs what it should return
- Config shape — any new configuration options needed

**Acceptance criteria:**
- [ ] Specific, testable criterion 1
- [ ] Specific, testable criterion 2
- [ ] Specific, testable criterion 3

**Out of scope:**
- Thing that should NOT be changed or addressed in this issue
- Adjacent feature that might seem related but is separate
```

## Examples

### Good agent brief (bug)

```markdown
## Agent Brief

**Category:** bug
**Summary:** Skill description truncation drops mid-word, producing broken output

**Current behavior:**
When a skill description exceeds 1024 characters, it is truncated at exactly
1024 characters regardless of word boundaries. This produces descriptions
that end mid-word (e.g. "Use when the user wants to confi").

**Desired behavior:**
Truncation should break at the last word boundary before 1024 characters
and append "..." to indicate truncation.

**Key interfaces:**
- The `SkillMetadata` type's `description` field — no type change needed,
  but the validation/processing logic that populates it needs to respect
  word boundaries
- Any function that reads SKILL.md frontmatter and extracts the description

**Acceptance criteria:**
- [ ] Descriptions under 1024 chars are unchanged
- [ ] Descriptions over 1024 chars are truncated at the last word boundary
      before 1024 chars
- [ ] Truncated descriptions end with "..."
- [ ] The total length including "..." does not exceed 1024 chars

**Out of scope:**
- Changing the 1024 char limit itself
- Multi-line description support
```

### Good agent brief (enhancement)

```markdown
## Agent Brief

**Category:** enhancement
**Summary:** Add `.out-of-scope/` directory support for tracking rejected feature requests

**Current behavior:**
When a feature request is rejected, the issue is closed with a `wontfix` label
and a comment. There is no persistent record of the decision or reasoning.
Future similar requests require the maintainer to recall or search for the
prior discussion.

**Desired behavior:**
Rejected feature requests should be documented in `.out-of-scope/<concept>.md`
files that capture the decision, reasoning, and links to all issues that
requested the feature. When triaging new issues, these files should be
checked for matches.

**Key interfaces:**
- Markdown file format in `.out-of-scope/` — each file should have a
  `# Concept Name` heading, a `**Decision:**` line, a `**Reason:**` line,
  and a `**Prior requests:**` list with issue links
- The triage workflow should read all `.out-of-scope/*.md` files early
  and match incoming issues against them by concept similarity

**Acceptance criteria:**
- [ ] Closing a feature as wontfix creates/updates a file in `.out-of-scope/`
- [ ] The file includes the decision, reasoning, and link to the closed issue
- [ ] If a matching `.out-of-scope/` file already exists, the new issue is
      appended to its "Prior requests" list rather than creating a duplicate
- [ ] During triage, existing `.out-of-scope/` files are checked and surfaced
      when a new issue matches a prior rejection

**Out of scope:**
- Automated matching (human confirms the match)
- Reopening previously rejected features
- Bug reports (only enhancement rejections go to `.out-of-scope/`)
```

### Good agent brief (PR)

For a PR, "Current behavior" describes the state of the diff, and the brief asks the agent to finish or fix it rather than build from scratch.

```markdown
## Agent Brief

**Category:** enhancement
**Summary:** Finish the contributor's `--json` output flag for `triage list`

**Current behavior:**
The PR adds a `--json` flag that serializes the issue list to JSON. The happy
path works and the diff matches the project's command structure. Two gaps
remain: errors are still printed as human text (not JSON), and the new flag has
no test coverage.

**Desired behavior:**
With `--json`, all output — including errors — is well-formed JSON on stdout,
and the command's exit codes are unchanged. The existing human-readable output
is untouched when the flag is absent.

**Key interfaces:**
- The command's error path should emit `{ "error": string }` under `--json`
  instead of the plain-text error
- Reuse the existing serializer the PR already added; don't introduce a second

**Acceptance criteria:**
- [ ] `triage list --json` emits valid JSON for both success and error cases
- [ ] Exit codes match the non-JSON command
- [ ] A test covers the `--json` success output and one error case
- [ ] Default (non-JSON) output is byte-for-byte unchanged

**Out of scope:**
- Adding `--json` to any other command
- Changing the JSON shape of the success payload the PR already defined
```

### Bad agent brief

```markdown
## Agent Brief

**Summary:** Fix the triage bug

**What to do:**
The triage thing is broken. Look at the main file and fix it.
The function around line 150 has the issue.

**Files to change:**
- src/triage/handler.ts (line 150)
- src/types.ts (line 42)
```

This is bad because:
- No category
- Vague description ("the triage thing is broken")
- References file paths and line numbers that will go stale
- No acceptance criteria
- No scope boundaries
- No description of current vs desired behavior
</file>

<file path="skills/engineering/triage/OUT-OF-SCOPE.md">
# Out-of-Scope Knowledge Base

The `.out-of-scope/` directory in a repo stores persistent records of rejected feature requests. It serves two purposes:

1. **Institutional memory** — why a feature was rejected, so the reasoning isn't lost when the issue is closed
2. **Deduplication** — when a new issue comes in that matches a prior rejection, the skill can surface the previous decision instead of re-litigating it

## Directory structure

```
.out-of-scope/
├── dark-mode.md
├── plugin-system.md
└── graphql-api.md
```

One file per **concept**, not per issue. Multiple issues requesting the same thing are grouped under one file.

## File format

The file should be written in a relaxed, readable style — more like a short design document than a database entry. Use paragraphs, code samples, and examples to make the reasoning clear and useful to someone encountering it for the first time.

```markdown
# Dark Mode

This project does not support dark mode or user-facing theming.

## Why this is out of scope

The rendering pipeline assumes a single color palette defined in
`ThemeConfig`. Supporting multiple themes would require:

- A theme context provider wrapping the entire component tree
- Per-component theme-aware style resolution
- A persistence layer for user theme preferences

This is a significant architectural change that doesn't align with the
project's focus on content authoring. Theming is a concern for downstream
consumers who embed or redistribute the output.

```ts
// The current ThemeConfig interface is not designed for runtime switching:
interface ThemeConfig {
  colors: ColorPalette; // single palette, resolved at build time
  fonts: FontStack;
}
```

## Prior requests

- #42 — "Add dark mode support"
- #87 — "Night theme for accessibility"
- #134 — "Dark theme option"
```

### Naming the file

Use a short, descriptive kebab-case name for the concept: `dark-mode.md`, `plugin-system.md`, `graphql-api.md`. The name should be recognizable enough that someone browsing the directory understands what was rejected without opening the file.

### Writing the reason

The reason should be substantive — not "we don't want this" but why. Good reasons reference:

- Project scope or philosophy ("This project focuses on X; theming is a downstream concern")
- Technical constraints ("Supporting this would require Y, which conflicts with our Z architecture")
- Strategic decisions ("We chose to use A instead of B because...")

The reason should be durable. Avoid referencing temporary circumstances ("we're too busy right now") — those aren't real rejections, they're deferrals.

## When to check `.out-of-scope/`

During triage (Step 1: Gather context), read all files in `.out-of-scope/`. When evaluating a new issue:

- Check if the request matches an existing out-of-scope concept
- Matching is by concept similarity, not keyword — "night theme" matches `dark-mode.md`
- If there's a match, surface it to the maintainer: "This is similar to `.out-of-scope/dark-mode.md` — we rejected this before because [reason]. Do you still feel the same way?"

The maintainer may:

- **Confirm** — the new issue gets added to the existing file's "Prior requests" list, then closed
- **Reconsider** — the out-of-scope file gets deleted or updated, and the issue proceeds through normal triage
- **Disagree** — the issues are related but distinct, proceed with normal triage

## When to write to `.out-of-scope/`

Only when an **enhancement** (not a bug) is *rejected* as `wontfix`. This applies to enhancement PRs exactly as it does to issues — a rejected PR is recorded here so the same request doesn't return as fresh code.

Do **not** write here when something is closed as `wontfix` because it's **already implemented**. That's a built feature, not a rejected one; recording it would poison the dedup checks with false rejections. Instead, the closing comment points to where the feature already lives.

The flow:

1. Maintainer decides a feature request is out of scope
2. Check if a matching `.out-of-scope/` file already exists
3. If yes: append the new issue to the "Prior requests" list
4. If no: create a new file with the concept name, decision, reason, and first prior request
5. Post a comment on the issue explaining the decision and mentioning the `.out-of-scope/` file
6. Close the issue with the `wontfix` label

## Updating or removing out-of-scope files

If the maintainer changes their mind about a previously rejected concept:

- Delete the `.out-of-scope/` file
- The skill does not need to reopen old issues — they're historical records
- The new issue that triggered the reconsideration proceeds through normal triage
</file>

<file path="skills/engineering/triage/SKILL.md">
---
name: triage
description: Move issues and external PRs through a state machine of triage roles — categorise, verify, grill if needed, and write agent-ready briefs.
disable-model-invocation: true
---

# Triage

Move issues on the project issue tracker through a small state machine of triage roles.

If this repo treats external pull requests as a request surface (see the issue-tracker config), triage covers them too: **a PR is an issue with attached code** — same roles, same states, same machine, with a few deltas marked "for a PR" below. Resolve a bare `#42` to an issue or PR per the tracker config.

Every comment or issue posted to the issue tracker during triage **must** start with this disclaimer:

```
> *This was generated by AI during triage.*
```

## Reference docs

- [AGENT-BRIEF.md](AGENT-BRIEF.md) — how to write durable agent briefs
- [OUT-OF-SCOPE.md](OUT-OF-SCOPE.md) — how the `.out-of-scope/` knowledge base works

## Roles

Two **category** roles:

- `bug` — something is broken
- `enhancement` — new feature or improvement

Five **state** roles:

- `needs-triage` — maintainer needs to evaluate
- `needs-info` — waiting on reporter for more information
- `ready-for-agent` — fully specified, ready for an AFK agent
- `ready-for-human` — needs human implementation
- `wontfix` — will not be actioned

For a PR, the same states read against the attached code: `ready-for-agent` means a brief is attached and an agent should take the next step on the diff; `ready-for-human` means it's ready for a human to merge.

Every triaged issue should carry exactly one category role and one state role. If state roles conflict, flag it and ask the maintainer before doing anything else.

These are canonical role names — the actual label strings used in the issue tracker may differ. The mapping should have been provided to you - run `/setup-matt-pocock-skills` if not.

State transitions: an unlabeled issue normally goes to `needs-triage` first; from there it moves to `needs-info`, `ready-for-agent`, `ready-for-human`, or `wontfix`. `needs-info` returns to `needs-triage` once the reporter replies. The maintainer can override at any time — flag transitions that look unusual and ask before proceeding.

## Invocation

The maintainer invokes `/triage` and describes what they want in natural language. Interpret the request and act. Examples:

- "Show me anything that needs my attention"
- "Let's look at #42" (issue or PR)
- "Move #42 to ready-for-agent"
- "What's ready for agents to pick up?"

## Show what needs attention

Query the issue tracker and present three buckets, oldest first:

1. **Unlabeled** — never triaged.
2. **`needs-triage`** — evaluation in progress.
3. **`needs-info` with reporter activity since the last triage notes** — needs re-evaluation.

When PRs are in scope, include external PRs in these buckets and tag each line `[PR]` or `[issue]`. Discovery surfaces only *external* PRs (the tracker config defines who counts as external) — a collaborator's in-flight PR is not triage work. This filter is discovery-only; an explicitly named PR is always triaged regardless of author.

Show counts and a one-line summary per item. Let the maintainer pick.

## Triage a specific issue or PR

1. **Gather context.** Read the full issue or PR (body, comments, labels, author, dates; for a PR, the diff too). Parse any prior triage notes so you don't re-ask resolved questions. Explore the codebase using the project's domain glossary, respecting ADRs in the area. Run two checks against the codebase: (a) **redundancy** — search for an existing implementation of the requested behavior by domain concept (not just the request's wording), and report where you looked. If found, it's an already-implemented `wontfix` (step 5). (b) **prior rejection** — read `.out-of-scope/*.md` and surface any that resembles this request.

2. **Recommend.** Tell the maintainer your category and state recommendation with reasoning, plus a brief codebase summary relevant to the request — including whether it's already implemented. Wait for direction.

3. **Verify the claim.** Before any grilling, check that the claim holds up. For a bug, reproduce it from the reporter's steps. For a PR, confirm the diff does what it claims — check it out, run the relevant tests or commands. Report what happened: confirmed (with code path), failed, or insufficient detail (a strong `needs-info` signal). A confirmed verification makes a much stronger agent brief.

4. **Grill (if needed).** If the request needs fleshing out, run the `/grilling` and `/domain-modeling` skills together — grill it into shape one question at a time, sharpening domain terms and updating `CONTEXT.md`/ADRs inline as decisions land.

5. **Apply the outcome:**
   - `ready-for-agent` — post an agent brief comment ([AGENT-BRIEF.md](AGENT-BRIEF.md)).
   - `ready-for-human` — same structure as an agent brief, but note why it can't be delegated (judgment calls, external access, design decisions, manual testing).
   - `needs-info` — post triage notes (template below).
   - `wontfix` — close, with the comment depending on *why*:
     - **Already implemented** — the change already exists in the codebase. Point to where it lives; do **not** write to `.out-of-scope/` (that KB is for *rejected* requests, not built ones).
     - **Rejected (bug)** — polite explanation, then close.
     - **Rejected (enhancement)** — write to `.out-of-scope/`, link to it from a comment, then close ([OUT-OF-SCOPE.md](OUT-OF-SCOPE.md)).
   - `needs-triage` — apply the role. Optional comment if there's partial progress.

## Quick state override

If the maintainer says "move #42 to ready-for-agent", trust them and apply the role directly. Confirm what you're about to do (role changes, comment, close), then act. Skip grilling. If moving to `ready-for-agent` without a grilling session, ask whether they want to write an agent brief.

## Needs-info template

```markdown
## Triage Notes

**What we've established so far:**

- point 1
- point 2

**What we still need from you (@reporter):**

- question 1
- question 2
```

Capture everything resolved during grilling under "established so far" so the work isn't lost. Questions must be specific and actionable, not "please provide more info".

## Resuming a previous session

If prior triage notes exist on the issue or PR, read them, check whether the reporter has answered any outstanding questions, and present an updated picture before continuing. Don't re-ask resolved questions.
</file>

<file path="skills/engineering/wayfinder/agents/openai.yaml">
interface:
  display_name: "Wayfinder"
  short_description: "Map a large effort as decision tickets"
policy:
  allow_implicit_invocation: false
</file>

<file path="skills/engineering/wayfinder/SKILL.md">
---
name: wayfinder
description: Plan a huge chunk of work — more than one agent session can hold — as a shared map of decision tickets on your issue tracker, and resolve them one at a time until the way to the destination is clear.
disable-model-invocation: true
---

A loose idea has arrived — too big for one agent session, and wrapped in fog: the way from here to the **destination** isn't visible yet. Wayfinding is about finding that way, not charging at the destination. This skill charts the way as a **shared map** on the repo's issue tracker, then works its **decision tickets** — questions whose resolution is a decision, not slices of a build to execute — one at a time until the route is clear.

The destination varies per effort, and naming it is the first act of charting — it shapes every ticket. It might be a spec to hand off and iterate on, a decision to lock before planning starts, or a change made in place like a data-structure migration. The map is domain-agnostic — engineering work, course content, whatever fits the shape.

## Plan, don't do

Wayfinder is **planning** by default: each ticket resolves a decision, and the map is done when the way is clear — nothing left to decide before someone goes and does the thing. The pull to just do the work is usually the signal you've reached the edge of the map and it's time to hand off. An effort can override this in its **Notes** — carrying execution into the map itself — but absent that, produce decisions, not deliverables.

## Refer by name

Every map and ticket is an issue, so it has a **name** — its title. In everything the human reads — narration, the map's Decisions-so-far — refer to it by that name, never by a bare id, number, or slug. A wall of `#42, #43, #44` is illegible; names read at a glance. The id and URL don't vanish — a name wraps its link — but they ride *inside* the name, never stand in for it.

## The Map

The map is a single issue on this repo's issue tracker, labelled `wayfinder:map` — the canonical artifact. Its tickets are child issues of the map.

The map is an **index**, not a store. It lists the decisions made and points at the tickets that hold their detail; a decision lives in exactly one place — its ticket — so the map never restates it, only gists it and links.

**Where the map, its child tickets, blocking, and frontier queries physically live is tracker-specific.** The issue tracker should have been provided to you — run `/setup-matt-pocock-skills` if not. Consult the tracker doc's "Wayfinding operations" section for how _this_ repo expresses them. If no tracker has been provided, default to the local-markdown tracker.

### The map body

The whole map at low resolution, loaded once per session. Open tickets are **not** listed — they are open child issues, found by query.

```markdown
## Destination

<what reaching the end of this map looks like — the spec, decision, or change this effort is finding its way to. One or two lines; every session orients to it before choosing a ticket.>

## Notes

<domain; skills every session should consult; standing preferences for this effort>

## Decisions so far

<!-- the index — one line per closed ticket: enough to judge relevance, then zoom the link for the detail the ticket holds -->

- [<closed ticket title>](link) — <one-line gist of the answer>

## Not yet specified

<!-- see "Fog of war": in-scope fog you can't ticket yet; graduates as the frontier advances -->

## Out of scope

<!-- see "Out of scope": work ruled beyond the destination; closed, never graduates -->
```

### Tickets

Each ticket is a **child issue** of the map; the tracker's issue id is its identity. Its body is the question, sized to one 100K token agent session:

```markdown
## Question

<the decision or investigation this ticket resolves>
```

Each ticket carries a `wayfinder:<type>` label — one of `research`, `prototype`, `grilling`, `task` (see [Ticket Types](#ticket-types)).

A session **claims** a ticket by assigning it to the dev driving the map, **first**, before any work, so concurrent sessions skip it. That assignee _is_ the claim: an open, unassigned ticket is unclaimed.

Blocking uses the tracker's **native** dependency relationship — essential because it renders the frontier _visually_ in the tracker's own UI, so the human sees what's takeable without opening the map. Only a tracker that lacks native blocking falls back to a body convention. A ticket is **unblocked** when every ticket blocking it is closed; the **frontier** is the open, unblocked, unclaimed children — the edge of the known.

The answer isn't part of the body — it's recorded on resolution (see [Work through the map](#work-through-the-map)). Assets created while resolving a ticket are linked from the issue, not pasted in.

## Ticket Types

Every ticket is either **HITL** — human in the loop, worked *with* a human who speaks for themselves — or **AFK**, driven by the agent alone. A HITL ticket only resolves through that live exchange; the agent never stands in for the human's side of it (a grilling agent that answers its own questions has broken this).

- **Research** (AFK): Reading documentation, third-party APIs, or local resources like knowledge bases to surface a fact a decision waits on. Resolved by a `/research` **subagent**. Use when knowledge outside the current working directory is required.
- **Prototype** (HITL): Raise the fidelity of the discussion by making a cheap, rough, concrete artifact to react to — an outline, a rough take, a stub, or UI/logic code via the /prototype skill. Links the prototype as an asset. Use when "how should it look" or "how should it behave" is the key question.
- **Grilling** (HITL): Conversation via the /grilling and /domain-modeling skills, one question at a time. The default case.
- **Task** (HITL or AFK): Manual work that must happen before a *decision* can be made — nothing to decide, prototype, or research, but the discussion is blocked until it's done. Signing up for a service so its API can be judged, provisioning access, moving data so its shape can be seen. This is the one type that *does* rather than decides — and it earns its place by unblocking a decision, not by delivering the destination. The agent drives it alone where it can (AFK); otherwise it hands the human a precise checklist (HITL). Resolved when the work is done; the answer records what was done and any resulting facts (credentials location, new URLs, row counts) later tickets depend on.

## Fog of war

The map is _deliberately_ incomplete: don't chart what you can't yet see. Beyond the live tickets lies the **fog of war** — the dim view of decisions and investigations you can tell are coming but can't yet pin down, because they hang on questions still open. Resolving a ticket clears the fog ahead of it, graduating whatever's now specifiable into fresh tickets — one at a time, until the way to the destination is clear and no tickets remain.

The map's **Not yet specified** section is where that dim view is written down: the suspected question, the area to revisit later. It's the undiscovered frontier _toward_ the destination — everything here is in scope, just not sharp enough to ticket. Write as loosely or as fully as the view allows; it doubles as a signpost for collaborators reading where the effort is headed.

**Fog or ticket?** The test is whether you can state the question precisely now — _not_ whether you can answer it now.

- **Ticket when** the question is already sharp — even if it's blocked and you can't act on it yet.
- **Not yet specified when** you can't yet phrase it that sharply. Don't pre-slice the fog into ticket-sized pieces: it's coarser than a ticket, and one patch may graduate into several tickets, or none, once the frontier reaches it.

**Not yet specified** excludes what's already decided (Decisions so far), what's already a live ticket, and what's out of scope (the next section).

## Out of scope

Fog only ever gathers _toward_ the destination. The destination fixes the scope, so work beyond it is **out of scope** — it isn't fog, and it doesn't belong in **Not yet specified**. It gets its own **Out of scope** section on the map: work you've consciously ruled out of _this_ effort. Scope, not sharpness, lands it here.

Out-of-scope work never graduates — the frontier stops at the destination — so it returns only if the destination is redrawn, and then as a fresh effort, not a resumption.

Ruling something out of scope is a scoping act, not a step on the route. When a ticket that already exists turns out to sit past the destination — mis-scoped in while charting, or exposed by a resolution — **close it** (a closed ticket is unambiguously off the frontier) and leave one line in the **Out of scope** section: the gist plus why it's out of scope, linking the closed ticket. It stays out of **Decisions so far**, which records the route actually walked — a scope boundary isn't a step on it.

## Invocation

Two modes. Either way, **never resolve more than one ticket per session** — with the exception of research tickets.

### Chart the map

User invokes with a loose idea.

1. **Name the destination.** Run a `/grilling` and `/domain-modeling` session to pin down what this map is finding its way to — the spec, decision, or change. The destination fixes the scope, so it's settled first.
2. **Map the frontier.** Grill again, **breadth-first** this time: fan out across the whole space rather than deep on any one thread, surfacing the open decisions and the first steps takeable now. **If this surfaces no fog** — the way to the destination is already clear, the whole journey small enough for one session — you don't need a map. Stop and ask the user how they'd like to proceed.
3. **Create the map** (label `wayfinder:map`): Destination and Notes filled in, Decisions-so-far empty, the fog sketched into **Not yet specified**.
4. **Create the tickets you can specify now** as child issues of the map — then wire blocking edges in a **second pass** (issues need ids before they can reference each other). Wiring sorts them into the frontier and the blocked; everything you can't yet specify stays in the fog — the **Not yet specified** section.
5. **Fire the research subagents.** For each `research` ticket you just created, spin up a `/research` subagent to resolve it in parallel, capturing its findings on a throwaway `research/<name>` branch with a context pointer from the ticket.
6. Stop — charting is one session's work; it hand-resolves nothing.

### Work through the map

User invokes with a map (URL or number). A ticket is **optional** — without one, you pick the next decision, not the user.

1. Load the **map** — the low-res view, not every ticket body.
2. Choose the ticket. If the user named one, use it. Otherwise take the first frontier ticket in order. **Claim it**: assign it to yourself before any work.
3. Resolve it — **zoom as needed**: fetch the full body of any related or closed ticket on demand; invoke the skills the `## Notes` block names. If in doubt, use `/grilling` and `/domain-modeling`.
4. Record the resolution: post the answer as a **resolution comment**, **close** the issue, and **append a context pointer** to the map's Decisions-so-far.
5. Add newly-surfaced tickets (create-then-wire); graduate any fog the answer has made specifiable, clearing each graduated patch from **Not yet specified** so it lives only as its new ticket. If the answer reveals a ticket — this one or another — sits beyond the destination, **rule it out of scope** rather than resolving it on the route. If the decision invalidates other parts of the map, update or delete those tickets.

The user may run unblocked tickets in parallel, so expect other sessions to be editing the tracker concurrently.
</file>

<file path="skills/engineering/README.md">
# Engineering

Skills I use daily for code work.

## User-invoked

Reachable only when you type them (Claude Code: `disable-model-invocation: true`; Codex: `policy.allow_implicit_invocation: false` in `agents/openai.yaml`).

- **[ask-matt](./ask-matt/SKILL.md)** — Ask which skill or flow fits your situation. A router over the user-invoked skills in this repo.
- **[grill-with-docs](./grill-with-docs/SKILL.md)** — Grilling session that also builds your project's domain model, sharpening terminology and updating `CONTEXT.md` and ADRs inline.
- **[triage](./triage/SKILL.md)** — Move issues through a state machine of triage roles.
- **[improve-codebase-architecture](./improve-codebase-architecture/SKILL.md)** — Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick.
- **[setup-matt-pocock-skills](./setup-matt-pocock-skills/SKILL.md)** — Configure this repo for the engineering skills (issue tracker, triage labels, domain doc layout). Run once per repo.
- **[to-spec](./to-spec/SKILL.md)** — Turn the current conversation into a spec and publish it to the issue tracker.
- **[to-tickets](./to-tickets/SKILL.md)** — Break any plan, spec, or conversation into a set of tracer-bullet tickets, each declaring its blocking edges — text in a local file, or native blocking links on a real tracker.
- **[implement](./implement/SKILL.md)** — Build the work described by a spec or set of tickets, driving `/tdd` at pre-agreed seams and closing out with `/code-review` before committing.
- **[wayfinder](./wayfinder/SKILL.md)** — Plan a huge chunk of work — more than one agent session can hold — as a shared map of decision tickets on the issue tracker, resolved one at a time until the way to the destination is clear.

## Model-invoked

Model- or user-reachable (rich trigger phrasing so the model can reach for them).

- **[prototype](./prototype/SKILL.md)** — Build a throwaway prototype to answer a design question: a runnable terminal app for state/logic, or several toggleable UI variations.

- **[diagnosing-bugs](./diagnosing-bugs/SKILL.md)** — Disciplined diagnosis loop for hard bugs and performance regressions: reproduce → minimise → hypothesise → instrument → fix → regression-test.
- **[research](./research/SKILL.md)** — Investigate a question against high-trust primary sources and capture the findings as a cited Markdown file in the repo, run as a background agent.
- **[tdd](./tdd/SKILL.md)** — Test-driven development with a red-green-refactor loop. Builds features or fixes bugs one vertical slice at a time.
- **[domain-modeling](./domain-modeling/SKILL.md)** — Actively build and sharpen a project's domain model — challenge terms, stress-test with scenarios, update `CONTEXT.md` and ADRs inline.
- **[codebase-design](./codebase-design/SKILL.md)** — Shared discipline and vocabulary for designing deep modules: small interfaces, clean seams, testable through the interface.
- **[code-review](./code-review/SKILL.md)** — Two-axis review of the diff since a fixed point: **Standards** (does it follow the repo's coding standards, plus a Fowler smell baseline?) and **Spec** (does it faithfully implement the originating issue/PRD?), run as parallel sub-agents.
- **[resolving-merge-conflicts](./resolving-merge-conflicts/SKILL.md)** — Work through an in-progress git merge or rebase conflict hunk by hunk, resolving by intent traced to each side's primary source, then finish the operation — never `--abort`.
</file>

<file path="skills/in-progress/batch-grill-me/agents/openai.yaml">
interface:
  display_name: "Batch Grill Me"
  short_description: "Sharpen a plan a round of questions at a time"
policy:
  allow_implicit_invocation: false
</file>

<file path="skills/in-progress/batch-grill-me/SKILL.md">
---
name: batch-grill-me
description: A relentless interview that asks every frontier question at once, round by round.
disable-model-invocation: true
---

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled — the questions you can ask *now* without guessing at answers you haven't heard yet. Ask the whole frontier in one round: number each question and give your recommended answer. Then wait for the user's answers before the next round.

Each round the user answers reshapes the tree — settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a *later* round, not this one.

Finding *facts* is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent to find it — don't ask the user for anything you could look up yourself. Don't block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the sub-agent to report — ask the rest of the frontier now. The *decisions* are the user's — put each to them and wait.

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Do not act on it until the user confirms you have reached a shared understanding.
</file>

<file path="skills/in-progress/claude-handoff/agents/openai.yaml">
interface:
  display_name: "Claude Handoff"
  short_description: "Hand off to a background agent"
policy:
  allow_implicit_invocation: false
</file>

<file path="skills/in-progress/claude-handoff/SKILL.md">
---
name: claude-handoff
description: Hand the current conversation off to a fresh background agent that picks up the work immediately.
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
---

Write a handoff summary of the current conversation so a fresh agent can continue the work. Instead of saving it, launch a background agent seeded with the summary as its prompt: `claude --bg --name "<descriptive name>" "<handoff summary>"`. It starts in the current working directory and returns immediately; the user manages it with `claude agents`.

Always pass `-n`/`--name` with a descriptive name (e.g. `--name "Fix login bug"`) — it sets the display name shown in the job list, session picker, and terminal title.

Include a "suggested skills" section in the summary, which suggests skills that the agent should invoke.

Do not duplicate content already captured in other artifacts (PRDs, plans, ADRs, issues, commits, diffs). Reference them by path or URL instead.

Redact any sensitive information, such as API keys, passwords, or personally identifiable information — the summary becomes the agent's prompt.

If the user passed arguments, treat them as a description of what the next session will focus on and tailor the summary accordingly.
</file>

<file path="skills/in-progress/loop-me/agents/openai.yaml">
interface:
  display_name: "Loop Me"
  short_description: "Spec the workflows you want to build"
policy:
  allow_implicit_invocation: false
</file>

<file path="skills/in-progress/loop-me/SKILL.md">
---
name: loop-me
description: Grill me about specs for the workflows I want to build, within this workspace.
disable-model-invocation: true
argument-hint: "A workflow to design, or nothing to go find one"
---

Run a stateful `/grilling` session whose only output is **workflow** specs. Use the grilling discipline — relentless, one question at a time, a recommended answer attached to each — aimed at the vocabulary and goal below. Create, edit, and delete specs as the grilling resolves things.

## The loop lens

A **loop** is a recurring pattern in the user's life: their career, their week, their morning, a single repeated activity. Picturing a life as loops within loops reveals how predictable its activities really are — which is what makes them worth **delegating**. Use the lens to find loops worth specifying, and propose ones the user hasn't noticed.

A **workflow** is the spec of one loop, made real. You run a workflow on a loop — the loop is its running instantiation. Workflows live in `workflows/*.md` and are the source of truth.

## Vocabulary

A shared language, reached for only when a workflow calls for it — never a checklist. **Mandate nothing structural**: a workflow needs no AI, no checkpoint, and no schedule unless the grilling shows it does.

- **Trigger** — what fires each run: an **event** (a new email, a new issue) or a **schedule** (every morning). Event-triggering is usually the more efficient.
- **Checkpoint** — a human-in-the-loop point where the user is asked to verify or decide. Some workflows have none and run autonomously; some use no AI at all.
- **Push right** — defer the checkpoint as far as it will go. Do maximal work before involving the human, so they are asked once, late, with everything prepared.
- **Brief** — what a checkpoint presents: a tight, decision-ready summary — what was produced, why, and a link down to the asset itself — never the raw output. The user reads a brief, not a draft. Speed of review is imperative.

## Definition of done

A workflow spec is done when an implementer agent could build it without asking a single question. Grill until then; nothing is done while a question remains.

## The workspace

- `workflows/*.md` — one spec per workflow.
- `NOTES.md` — raw notes on the user's world: the tools they use, the channels they process, and their own terminology for both. When it is empty or thin, interview them about their world before specifying anything. Sharpen fuzzy terms into canonical ones as they surface, and record them here.
</file>

<file path="skills/in-progress/setup-ts-deep-modules/agents/openai.yaml">
interface:
  display_name: "Setup TS Deep Modules"
  short_description: "Enforce deep TypeScript modules"
policy:
  allow_implicit_invocation: false
</file>

<file path="skills/in-progress/setup-ts-deep-modules/dependency-cruiser.config.cjs">
// @ts-check
// Deep-module enforcement for dependency-cruiser.
//
// Each package under the packages root is a DEEP MODULE: a lot of behaviour
// behind a small interface. A package's PUBLIC SURFACE is its ENTRY POINTS —
// the files at the package root. Implementation lives in SUBFOLDERS and is
// private — by convention `lib/` for implementation and `tests/` for tests,
// though any subfolder is private. A package may expose several small entry
// points (index.ts, client.ts, server.ts, …) — prefer that over one giant
// barrel index.
//
// The only thing you should ever need to edit here is PACKAGES_ROOT.

/** Where packages live. One immediate child dir per package (flat, no nesting). */
const PACKAGES_ROOT = "src/packages";

// --- derived patterns (no need to edit) -------------------------------------
const R = PACKAGES_ROOT;
/**
 * A package's private internals: anything nested inside a package subfolder.
 * The package's root files are its entry points and are NOT matched here —
 * they stay importable from outside.
 */
const PACKAGE_INTERNALS = `^${R}/[^/]+/[^/]+/`;

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "entrypoint-boundary-from-app",
      comment:
        "App/root code may import a package's entry points (its root files), but nothing inside its subfolders.",
      severity: "error",
      from: { pathNot: `^${R}/` }, // importer is NOT inside any package
      to: { path: PACKAGE_INTERNALS },
    },
    {
      name: "entrypoint-boundary-across-packages",
      comment:
        "A package's own files import each other freely, but may reach OTHER packages only through their entry points — never their internals.",
      severity: "error",
      // importer is inside a package ($1), but is not a test file
      from: { path: `^${R}/([^/]+)/`, pathNot: `^${R}/[^/]+/tests/` },
      to: {
        path: PACKAGE_INTERNALS,
        pathNot: `^${R}/$1/`, // same package → intra-package freedom
      },
    },
    {
      name: "tests-through-entrypoints",
      comment:
        "A package's tests exercise it through its entry points like everyone else: they may import any package's entry points and their own tests/ fixtures, but never any package's internals — not even their own.",
      severity: "error",
      from: { path: `^${R}/([^/]+)/tests/` }, // a test file, in package $1
      to: {
        path: PACKAGE_INTERNALS,
        pathNot: `^${R}/$1/tests/`, // own tests/ fixtures → allowed
      },
    },
    {
      name: "tests-folder-is-private",
      comment:
        "A package's tests/ folder is reachable only from tests — nothing else may import fixtures.",
      severity: "error",
      from: { pathNot: `^${R}/[^/]+/tests/` }, // importer is not itself a test
      to: { path: `^${R}/[^/]+/tests/` },
    },
    {
      name: "no-circular",
      comment: "No dependency cycles. Scope to `^${R}/` if you want to allow cycles outside packages.",
      severity: "error",
      from: {},
      to: { circular: true },
    },

    // --- Layering (optional, off by default) ----------------------------------
    // Interface-hiding controls HOW you import (through the entry points).
    // Layering controls WHICH packages may depend on which. Add your own rules
    // here, e.g.:
    //
    // {
    //   name: "ui-may-not-depend-on-billing",
    //   severity: "error",
    //   from: { path: `^${R}/ui/` },
    //   to:   { path: `^${R}/billing/` },
    // },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    },
  },
};
</file>

<file path="skills/in-progress/setup-ts-deep-modules/SKILL.md">
---
name: setup-ts-deep-modules
description: Wire dependency-cruiser into a TypeScript repo so each package is a deep module — implementation hidden in subfolders, reachable only through its entry-point files. User-invoked.
disable-model-invocation: true
---

# Setup TS Deep Modules

Make every package in this repo a **deep module**: a lot of behaviour behind a small interface. A package's public surface is its **entry points** — the files at the package root — and everything in its subfolders is hidden. This skill installs [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) and the rules that make the entry points the only way in, then proves the rules bite.

For the vocabulary (deep module, interface, seam, depth), run the `/codebase-design` skill — use its language throughout.

## The shape this enforces

```
src/packages/
  <name>/
    index.ts        ← an entry point (public). Import this from outside.
    client.ts       ← another entry point. Packages may expose SEVERAL.
    lib/            ← implementation: hidden from outside, free to import each other.
    tests/          ← co-located tests + fixtures (a subfolder, so private).
```

The public surface is the package's **root files** — not one designated `index.ts`. By convention implementation lives in `lib/` and tests in `tests/`, giving every package the same two-folder shape. The rule itself is general, though: *anything* in *any* subfolder is private, so you never extend the config to add a folder.

Four rules, all `error`:

1. **Entry-point boundary** — code outside a package (app code or another package) may import only that package's entry points (its root files), never anything in its subfolders.
2. **Intra-package freedom** — a package's own files import each other freely.
3. **Tests through the entry points** — files under `<pkg>/tests/` may import any package's entry points and their own `tests/` fixtures, but never any package's subfolder internals (not even their own). Integration tests across packages are fine; deep imports are not.
4. **No cycles** — no dependency cycles.

**Entry points, not a barrel.** Because the public surface is *every* root file, a package can expose several small entry points (`index.ts`, `client.ts`, `server.ts`) instead of funnelling everything through one giant `index.ts`. Barrel files that re-export a whole subtree are discouraged — keep entry points small and hide implementation in subfolders.

Layering (which packages may depend on which) is a *different* concern and is left as a commented stub in the config for this repo to fill in.

## Steps

### 1. Detect the environment

- **Package manager** — `pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, `bun.lockb` → bun, else npm. Use it for every command below (`pnpm`/`yarn`/`npm run`/`bunx`).
- **Packages root** — if `src/` exists use `src/packages`, else `packages`. Confirm the choice with the user if the repo already has a different obvious convention.
- **Existing config** — check for a `.dependency-cruiser.*` file. If one exists, do **not** overwrite it: merge the four rules and the options in, and tell the user what you added.

**Done when:** package manager, packages root, and existing-config status are all known.

### 2. Install dependency-cruiser

Install `dependency-cruiser` as a devDependency with the detected package manager.

**Done when:** `dependency-cruiser` is in `devDependencies`.

### 3. Write the config

Copy [`dependency-cruiser.config.cjs`](./dependency-cruiser.config.cjs) to the repo root as `.dependency-cruiser.cjs`. Set `PACKAGES_ROOT` to the root detected in step 1. The rules are path-depth based and extension-agnostic, so nothing else needs adapting.

**Done when:** `.dependency-cruiser.cjs` exists with the correct `PACKAGES_ROOT`, and the four forbidden rules are present.

### 4. Wire it into the checks

- Add a `lint:boundaries` script: `depcruise <packages-root>` (or `depcruise src`).
- Fold it into the repo's umbrella check command — the one that already runs typecheck (e.g. a `check` / `ci` / `validate` script). Do **not** touch `tsconfig` or add path aliases.
- If there is no umbrella script, add `lint:boundaries` and tell the user to include it in CI.

**Done when:** `lint:boundaries` exists and runs as part of the same command as typecheck.

### 5. Scaffold the example package

Create a committed `<packages-root>/example/` as a copy-me template:

- `index.ts` — an entry point. Export one function that delegates to an internal file (so the package is visibly *deep*, not a pass-through).
- `lib/impl.ts` — an internal file in a **subfolder**, imported by `index.ts`, not reachable from outside.
- `tests/example.test.ts` — imports **only** `../index` (an entry point), and asserts against the public function.

Tell the user this is a starter template to copy or delete.

**Done when:** the example package exists, exposes its behaviour through a root entry point, and hides `impl` in a subfolder.

### 6. Prove the rules bite

This is the completion criterion for the whole skill — a config that doesn't fail on a violation is worthless.

1. Run `lint:boundaries`. It must **pass** on the clean example.
2. Temporarily add a deep import to `tests/example.test.ts` (e.g. `import { thing } from "../lib/impl"`). Run `lint:boundaries` again — it must **fail** with `tests-through-entrypoints`.
3. Revert the deep import. Run once more — it must **pass**.

**Done when:** you have observed a pass, then a fail on the deep import, then a pass again. If step 2 does not fail, the rules are not wired correctly — fix before finishing.

### 7. Document the convention

Write a `README.md` **in the packages folder** (`<packages-root>/README.md`) — next to the packages it governs — covering: the `src/packages/<name>/` layout (entry points at the root, `lib/` for implementation, `tests/` for tests), "import only through a package's entry points (its root files)", and how to run `lint:boundaries`. **Discourage barrel files** explicitly — expose several small entry points instead of re-exporting a whole subtree through one index. Keep it to the copy-me snippet plus the four rules in one paragraph each.

Then add a **context pointer** to it from the repo's agent-instructions file — `CLAUDE.md` if present, else `AGENTS.md` (create `AGENTS.md` if neither exists). One line is enough, e.g. `Packages are deep modules — see [src/packages/README.md](./src/packages/README.md) before adding or importing one.` This is what makes an agent discover the boundary rule instead of tripping over it.

**Done when:** `<packages-root>/README.md` exists and discourages barrels, and the repo's `CLAUDE.md`/`AGENTS.md` links to it.

## Notes

- The config's `$1` back-references (dependency-cruiser's group matching) are what let a package reach its own internals while outsiders can't — don't flatten them into separate per-package rules.
- Public vs private is decided by **depth**: a package's root files are entry points; anything in a subfolder is private. The conventional subfolders are `lib/` (implementation) and `tests/`, but the rule doesn't hardcode them — any subfolder is private, so a new folder never needs a config change. Adding an entry point is just adding a root file — no barrel.
- Packages are **flat**: one tier of immediate children under the root. A package's internals may nest as deep as you like; a package may not contain another package.
- Use `.cjs` (not `.js`) so the config's `module.exports` works even in `"type": "module"` repos.
</file>

<file path="skills/in-progress/to-questionnaire/agents/openai.yaml">
interface:
  display_name: "To Questionnaire"
  short_description: "Front-load questions into a doc for someone to answer"
policy:
  allow_implicit_invocation: false
</file>

<file path="skills/in-progress/to-questionnaire/SKILL.md">
---
name: to-questionnaire
description: Turn a decision you can't fully answer into a questionnaire for someone else to fill in.
disable-model-invocation: true
---

Turn something the user can't answer alone into a **questionnaire** — a Markdown document they hand to one person to fill in async, or fill out together over a meeting. The recipient holds knowledge the user lacks; the questionnaire pulls it out of them.

**Grill the send, not the subject.** Interview the user only about the _send_, which they can always answer: who it goes to, and what they need back. The questions in the document then target the **gap** between what the recipient knows and what the user needs.

1. **Who is it going to?** Ask, in one exchange, the recipient's role, expertise, and relationship to the user. This fixes the questionnaire's tone and how much context it must carry. Done when you know who the recipient is and what they know that the user doesn't.

2. **What do you need back?** Ask, in one exchange, the specific decisions or facts the user can't resolve alone and needs from this person. Done when you have a concrete list of what the user must walk away able to do or decide.

3. **Write the questionnaire.** Draft questions aimed at the gap from steps 1–2, following the Document structure below. Write it to `to-questionnaire-<slug>.md` in the current directory (slug from the topic) and report the path. Done when the file exists and every item the user named in step 2 is covered by a question.

## Document structure

Frame the document as a **discovery questionnaire**: the user lacks context, the recipient holds it. Order questions most-important-first — async means you may only get one pass — and group them under `##` headings by theme once there are more than a handful. Write it using the template below.

<questionnaire-template>

# <Questionnaire title>

**Purpose:** why this questionnaire exists and the decision riding on it.

**From:** <the user> — **To:** <the recipient> — **How your answers will be used:** <where they go>

## Context

One paragraph orienting a recipient who wasn't in the user's head. Enough to answer well, not a page.

## How to answer

Deadline and rough effort. Partial answers and "I don't know" are useful — flag anything you're unsure of rather than skipping it.

## <Theme heading>

One `##` section per theme. Under each, its questions, most-important-first. Every question is one idea — never compound — with an answer stub directly beneath, and a one-line _why this matters_ only where the question could be misread or invite a throwaway answer.

<question-example>
### What load is the system expected to handle at launch?

_Why this matters: it decides whether we provision for burst traffic now or defer it._

>
</question-example>

## Anything else?

A closing catch-all: anything we didn't ask that we should know?

</questionnaire-template>
</file>

<file path="skills/in-progress/wizard/agents/openai.yaml">
interface:
  display_name: "Wizard"
  short_description: "Generate an interactive setup wizard"
policy:
  allow_implicit_invocation: false
</file>

<file path="skills/in-progress/wizard/SKILL.md">
---
name: wizard
description: Generate an interactive bash wizard that walks a human through a manual procedure — third-party setup, a one-off migration, an A→B state transition — opening URLs, capturing values, confirming each step, and writing .env files and GitHub Actions secrets.
disable-model-invocation: true
---

# Wizard

A **wizard** is a bash script that walks a human, step by step, through a manual procedure that's tedious to do by hand and tedious to re-explain to an AI every time. It opens each URL, says exactly what to click and copy, captures the values, writes them where they belong (`.env`, GitHub secrets), confirms at every stage, and shows how much is left. It might configure third-party services, run a one-off migration, or move the project from one state to another.

The delightful UX is already solved by [template.sh](template.sh) — progress with time-remaining, confirmation gates, cross-platform URL opening (including WSL), hidden secret entry, idempotent `.env` upserts, `gh secret`/`gh variable` writes, and a closing summary. **Your job is only to scope the procedure and author its stages.** The library above the `STAGES` marker is identical in every wizard; that consistency is the point — never hand-edit it.

A wizard is ephemeral by default — built for one run, saved to a scratch or `scripts/` path, deleted when the job's done. Commit it only when the user wants a repeatable setup path that should live in the repo.

## Process

### 1. Scope the procedure

Work out every manual step the human must take and every value that gets captured along the way. Read the repo first — don't ask cold:

- For setup: `.env`, `.env.example`, `.env.*`, `README`, `docker-compose*`, framework config, and `.github/workflows/*` (every `secrets.*` / `vars.*` reference is a value the wizard must produce).
- For a migration or transition: the current state, the target state, and the irreversible actions between them.

Then show the user the ordered list of stages and the values each produces, and confirm — they may add, drop, or reorder.

**Done when:** every stage is named in order, and for each captured value you know (a) where the human gets it, (b) where it's written (`.env`, a GitHub secret, both, or nowhere — some stages are pure actions), and (c) whether it's secret (hidden entry) or public.

### 2. Map each stage's journey

For each stage, write the precise path a human follows: which URL to open, what to do there, where a value is shown, which variable it fills — e.g. "Dashboard → Developers → API keys → Reveal test key → copy". Where you don't actually know the current UI or the exact command, say so and ask the user or check the docs — never invent steps that may not exist.

**Done when:** every stage traces to concrete instructions a stranger could follow.

### 3. Author the wizard

Copy `template.sh` to the target path. Replace the example stage with one `stage` per step, in dependency order. Use the library helpers — `stage`, `say`/`step`, `open_url`, `ask`/`ask_secret`, `write_env`, `set_secret`/`set_var`, `pause`/`confirm` — and set `TOTAL_STAGES` and `TOTAL_MINUTES` to honest estimates (this drives the time-remaining display).

Hold the bar the template sets: open the URL before asking for its value, use `ask_secret` for anything secret, `write_env` every persisted value, `set_secret` only the values CI actually needs, and `confirm` before any irreversible action. Each `stage` clears the screen so only the current step is visible — keep a stage to one focused task so nothing the human needs scrolls away. Don't touch the library above the marker.

### 4. Verify and hand off

- `bash -n <script>`; run `shellcheck` if available.
- `chmod +x <script>`.
- Don't run it end-to-end yourself — it opens browsers and blocks on human input. Trace it statically instead: every value from step 1 is captured and lands where step 1 said, and every `set_secret` name exactly matches a `secrets.*` reference in CI.
- Tell the user how to run it. If it's a repeatable setup path, commit it and link it from the README so the next person runs the script instead of asking an AI.
</file>

<file path="skills/in-progress/wizard/template.sh">
#!/usr/bin/env bash
#
# A wizard — walks a human through a manual procedure step by step.
# Generated by the /wizard skill.
#
# Everything above the "STAGES" marker is the wizard library: do not hand-edit
# it. Author the per-step stages below the marker.

set -euo pipefail

# ──────────────────────────────────────────────────────────────────────────
# Wizard library — delightful, consistent UX. Identical across every wizard.
# ──────────────────────────────────────────────────────────────────────────

if [[ -t 1 ]] && command -v tput >/dev/null 2>&1 && [[ "$(tput colors 2>/dev/null || echo 0)" -ge 8 ]]; then
  BOLD=$(tput bold); DIM=$(tput dim); RESET=$(tput sgr0)
  BLUE=$(tput setaf 4); GREEN=$(tput setaf 2); YELLOW=$(tput setaf 3); RED=$(tput setaf 1)
else
  BOLD=""; DIM=""; RESET=""; BLUE=""; GREEN=""; YELLOW=""; RED=""
fi

# Author sets these two at the top of the stages section.
TOTAL_STAGES=0
TOTAL_MINUTES=0

_STAGE_INDEX=0
_MINUTES_ELAPSED=0
ENV_FILE="${ENV_FILE:-.env}"
WRITTEN_ENV=()    # KEYs written to ENV_FILE this run
WRITTEN_SECRET=() # secret NAMEs set this run
SKIPPED=()        # things we couldn't do (e.g. gh missing)

# _clear — wipe the terminal so only the current step is on screen. No-op when
# output isn't a terminal, so piped logs stay readable.
_clear() {
  [[ -t 1 ]] || return 0
  if command -v tput >/dev/null 2>&1; then tput clear; else printf '\033[2J\033[3J\033[H'; fi
}

# banner "Title" — opening frame: what this wizard does and how long it takes.
banner() {
  _clear
  printf '\n%s%s  %s%s\n' "$BOLD" "$BLUE" "$1" "$RESET"
  printf '%s  %s stages · about %s minutes%s\n\n' \
    "$DIM" "$TOTAL_STAGES" "$TOTAL_MINUTES" "$RESET"
  printf '%s  You drive the browser; this wizard tells you exactly what to do and\n' "$DIM"
  printf '  captures the values you copy back. Stop any time with Ctrl-C and re-run\n'
  printf '  later — it remembers values already saved.%s\n' "$RESET"
  pause "Ready to start?"
}

# stage "Name" <minutes> — clear the screen, then announce a stage and show
# progress + time remaining. Clearing keeps only the current step on screen.
stage() {
  _clear
  _STAGE_INDEX=$((_STAGE_INDEX + 1))
  local remaining=$((TOTAL_MINUTES - _MINUTES_ELAPSED))
  (( remaining < 0 )) && remaining=0
  _MINUTES_ELAPSED=$((_MINUTES_ELAPSED + ${2:-0}))
  printf '\n%s%s▸ Stage %s/%s · %s%s  %s(~%s min left)%s\n' \
    "$BOLD" "$BLUE" "$_STAGE_INDEX" "$TOTAL_STAGES" "$1" "$RESET" "$DIM" "$remaining" "$RESET"
}

# say "..." — a plain instruction line.
say()  { printf '  %s\n' "$1"; }
# step "..." — a numbered-feeling action the human takes in the browser.
step() { printf '  %s•%s %s\n' "$BLUE" "$RESET" "$1"; }
note() { printf '  %s%s%s\n' "$DIM" "$1" "$RESET"; }
warn() { printf '  %s⚠ %s%s\n' "$YELLOW" "$1" "$RESET"; }

# open_url URL — open in the human's browser, cross-platform incl. WSL.
open_url() {
  local url="$1"
  printf '  %s↗ opening%s %s\n' "$GREEN" "$RESET" "$url"
  { if   command -v wslview     >/dev/null 2>&1; then wslview "$url"
    elif command -v explorer.exe >/dev/null 2>&1; then explorer.exe "$url"
    elif command -v xdg-open    >/dev/null 2>&1; then xdg-open "$url"
    elif command -v open        >/dev/null 2>&1; then open "$url"
    else warn "couldn't open a browser — visit it manually: $url"; fi
  } >/dev/null 2>&1 || warn "couldn't open a browser — visit it manually: $url"
}

# pause "msg" — wait for the human to confirm they've done the manual part.
pause() {
  printf '  %s%s%s ' "$DIM" "${1:-Press Enter to continue}" "$RESET"
  read -r _ || true
}

# confirm "question" — y/N gate; returns success on yes.
confirm() {
  local reply=""
  printf '  %s? %s [y/N] ' "$YELLOW" "$1"
  read -r reply || true
  [[ "$reply" =~ ^[Yy] ]]
}

# _existing KEY — current value of KEY in ENV_FILE, if any.
_existing() {
  [[ -f "$ENV_FILE" ]] || return 1
  local line; line=$(grep -E "^${1}=" "$ENV_FILE" | tail -n1) || return 1
  printf '%s' "${line#*=}"
}

# ask KEY "Prompt" — read a value into $KEY. Offers the existing .env value as
# a default on re-runs (Enter keeps it). Visible input (non-secret).
ask() {
  local key="$1" prompt="$2" current input
  current=$(_existing "$key" || true)
  if [[ -n "$current" ]]; then
    printf '  %s%s%s %s[Enter keeps current]%s ' "$BOLD" "$prompt" "$RESET" "$DIM" "$RESET"
  else
    printf '  %s%s%s ' "$BOLD" "$prompt" "$RESET"
  fi
  read -r input || true
  [[ -z "$input" && -n "$current" ]] && input="$current"
  printf -v "$key" '%s' "$input"
}

# ask_secret KEY "Prompt" — like ask, but input is hidden.
ask_secret() {
  local key="$1" prompt="$2" current input
  current=$(_existing "$key" || true)
  if [[ -n "$current" ]]; then
    printf '  %s%s%s %s[Enter keeps current]%s ' "$BOLD" "$prompt" "$RESET" "$DIM" "$RESET"
  else
    printf '  %s%s%s ' "$BOLD" "$prompt" "$RESET"
  fi
  read -rs input || true
  printf '\n'
  [[ -z "$input" && -n "$current" ]] && input="$current"
  printf -v "$key" '%s' "$input"
}

# write_env KEY VALUE — upsert KEY=VALUE into ENV_FILE (creates it; replaces
# any existing line). Idempotent.
write_env() {
  local key="$1" value="$2" tmp
  touch "$ENV_FILE"
  tmp=$(mktemp)
  grep -vE "^${key}=" "$ENV_FILE" > "$tmp" || true
  printf '%s=%s\n' "$key" "$value" >> "$tmp"
  mv "$tmp" "$ENV_FILE"
  WRITTEN_ENV+=("$key")
  printf '  %s✓ wrote%s %s → %s\n' "$GREEN" "$RESET" "$key" "$ENV_FILE"
}

# set_secret NAME VALUE — set a GitHub Actions repo secret via gh. Falls back
# to a warning (and records it) if gh is unavailable or unauthenticated.
set_secret() {
  local name="$1" value="$2"
  if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
    if printf '%s' "$value" | gh secret set "$name" >/dev/null 2>&1; then
      WRITTEN_SECRET+=("$name")
      printf '  %s✓ set%s GitHub secret %s\n' "$GREEN" "$RESET" "$name"
      return
    fi
  fi
  SKIPPED+=("GitHub secret $name (set it manually: gh secret set $name)")
  warn "skipped GitHub secret $name — gh not ready; set it later"
}

# set_var NAME VALUE — set a GitHub Actions repo variable (non-secret).
set_var() {
  local name="$1" value="$2"
  if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
    if gh variable set "$name" --body "$value" >/dev/null 2>&1; then
      printf '  %s✓ set%s GitHub variable %s\n' "$GREEN" "$RESET" "$name"
      return
    fi
  fi
  SKIPPED+=("GitHub variable $name")
  warn "skipped GitHub variable $name — gh not ready; set it later"
}

# finish — clear, then a closing summary of everything configured.
finish() {
  _clear
  printf '\n%s%s  ✓ Setup complete%s\n' "$BOLD" "$GREEN" "$RESET"
  (( ${#WRITTEN_ENV[@]} ))    && note "wrote ${#WRITTEN_ENV[@]} value(s) to $ENV_FILE: ${WRITTEN_ENV[*]}"
  (( ${#WRITTEN_SECRET[@]} )) && note "set ${#WRITTEN_SECRET[@]} GitHub secret(s): ${WRITTEN_SECRET[*]}"
  if (( ${#SKIPPED[@]} )); then
    printf '\n'; warn "still to do by hand:"
    for s in "${SKIPPED[@]}"; do note "  - $s"; done
  fi
  printf '\n'
}

# ──────────────────────────────────────────────────────────────────────────
# STAGES — author this section. One stage() per step the human takes.
# Replace the example below. Set the two totals to match the stages you write.
# ──────────────────────────────────────────────────────────────────────────

TOTAL_STAGES=1
TOTAL_MINUTES=5

banner "Stripe setup"

# ── Example stage: replace with your real steps ───────────────────────────
stage "Stripe — API keys" 5
say "We'll grab your Stripe test keys and store them for local dev + CI."
open_url "https://dashboard.stripe.com/test/apikeys"
step "On the API keys page, copy the Publishable key (starts pk_test_)."
ask STRIPE_PUBLISHABLE_KEY "Paste the publishable key:"
step "Click 'Reveal test key' on the Secret key row, then copy it."
ask_secret STRIPE_SECRET_KEY "Paste the secret key:"
write_env STRIPE_PUBLISHABLE_KEY "$STRIPE_PUBLISHABLE_KEY"
write_env STRIPE_SECRET_KEY "$STRIPE_SECRET_KEY"
set_secret STRIPE_SECRET_KEY "$STRIPE_SECRET_KEY"   # CI needs this one
# ──────────────────────────────────────────────────────────────────────────

finish
</file>

<file path="skills/in-progress/writing-beats/agents/openai.yaml">
interface:
  display_name: "Writing Beats"
  short_description: "Assemble raw material into beats"
policy:
  allow_implicit_invocation: false
</file>

<file path="skills/in-progress/writing-beats/SKILL.md">
---
name: writing-beats
description: Writing, exploit — assemble raw material into a journey of beats, grounding each term before a beat leans on it.
disable-model-invocation: true
---

<what-to-do>

The user has passed (or will pass) a markdown file of raw material. This is **exploit**: the exploring is done, the pile is fixed — commit to a path through it and mine the pile to fill each beat.

If the user did not say where to save the article, ask once and remember the path.

Then run a beat-by-beat journey, choose-your-own-adventure style:

1. **Establish the prerequisites.** Before any beats, settle with the user what the audience already knows walking in — the concepts that are **grounded** from the start. Everything else must be grounded by a beat before a later beat can use it. See [Grounding](#grounding).
2. Write 2–3 candidate **starting beats**, drawn from the raw material. Each is a different entry point into the article. Each may only lean on grounded concepts; note what new concepts each one grounds. Show the user the beats before writing to the article file. The user picks one. Preview what beats that pick unlocks — as if the user is seeing a little way down the path.
3. Once the user picks a starting beat, write **only that beat** to the article file. A beat may be one sentence or several paragraphs — whatever that beat naturally is. Stop there.
4. Re-read the article file from disk. Then offer 2–3 candidate **next beats** — different directions the journey could pivot to from where the article now stands. Each must be reachable from the current grounded set; note what each one grounds.
5. Loop steps 3–5 until the article reaches a natural end.

</what-to-do>

<supporting-info>

## Grounding

Every **concept** has to be **grounded** before a beat can lean on it: the audience either walked in knowing it or met it in an earlier beat. A beat that reaches for an ungrounded concept loses the reader — that is the one move the journey can't make. The unit is the concept, not the word for it: a beat can lean on an idea the reader lacks even with no jargon in sight. Where a concept has a name — a **term** — grounding it means landing the idea and the term together.

A concept gets grounded one of two ways:

- **Prerequisite** — grounded before the first beat. The audience brings it. Fixed at the start.
- **Introduced** — a beat establishes it, and from then on it's grounded for every later beat.

So each beat does two jobs: it **requires** concepts that are already grounded, and it **grounds** new ones. Keep a running list of what's grounded so far, and update it each time a beat lands.

This is what shapes the choose-your-own-adventure. A candidate beat is only reachable if everything it requires is already grounded; picking a beat that grounds concept X unlocks every beat that was waiting on X. When you offer next beats, they must all be reachable from the current grounded set — and say what each one grounds, so the user can see which paths it opens.

The big lever is what you make a prerequisite versus what you ground inside the piece. Demand too much up front and you shut out readers who don't have it; ground too much inside and the early beats drown in definitions. Settle this with the user when you establish prerequisites, and revisit it whenever a tempting beat turns out to require a concept nothing has grounded yet — the fix is either a grounding beat before it, or promoting the concept to a prerequisite.

## What is a beat

A beat is one move in the journey. It does one thing — sets a scene, lands a point, asks a question, drops an aside, twists the angle. Then it stops, leaving the reader at a place where the next beat can pivot.

A beat is sized by what it needs:

- A single sentence if that's all the move is ("And then nothing happened for three weeks.").
- A short paragraph if the move needs setup.
- Multiple paragraphs if the beat is a self-contained vignette, argument, or example.

If a "beat" needs five paragraphs and three subheadings, it's not a beat — it's two beats glued together. Split it.

## Pulling from the pile

Pull material from the raw pile to populate each beat. You can paraphrase, split, recombine, or quote. The pile is a quarry.

## Ending the journey

The article ends when the journey is complete — not when the pile is empty. Most piles will have leftover fragments that don't make it in. That is fine; that is the point of having more raw material than you need.

## Writing rhythm

- Append one beat at a time. Never write ahead.
- Re-read the article file from disk before every write. Preserve user edits absolutely.
- If the user edits a previous beat substantially, let it change what comes next.
- If the user says "rewrite that beat" or "go back and try a different beat 3", do it — edit in place, leave the rest alone.

</supporting-info>
</file>

<file path="skills/in-progress/writing-fragments/agents/openai.yaml">
interface:
  display_name: "Writing Fragments"
  short_description: "Mine raw writing fragments"
policy:
  allow_implicit_invocation: false
</file>

<file path="skills/in-progress/writing-fragments/SKILL.md">
---
name: writing-fragments
description: Writing, explore — mine raw fragments, no structure yet.
disable-model-invocation: true
---

<what-to-do>

This is pure **explore**: widen the space of what could be written without committing to structure — committing is _exploit_, a separate skill's job. Run a grilling session that produces fragments, interviewing the user relentlessly about whatever they want to write about. Imposing phases, outlines, or article structure is out of scope here.

As fragments emerge from either side of the conversation, append them to a single markdown file.

If the user did not pass a path, ask once where to save the document, then remember it for the rest of the session.

Capture fragments from the very first thing the user says, including the initial prompt.

On first write, put a single H1 at the top with a working title (it can change later) and nothing else — no metadata, no TOC, no date.

</what-to-do>

<supporting-info>

## What is a fragment

A fragment is any piece of text that might survive into the final article. It must be _readable by the author_ — the author can tell what it means — but it does not need to define its terms or be comprehensible to a cold reader. The bar is "is this a piece of good writing?", not "is this a self-contained argument?"

Fragments are deliberately heterogeneous. Examples of what could be a fragment:

- A sharp sentence you'd want to deploy somewhere but don't yet know where.
- A claim with a one-line justification.
- A vignette: a thing that happened, a code snippet, a scenario, an analogy.
- A half-thought: "something about how X feels like Y, work this out later."
- A quote, a piece of dialogue, an overheard line.
- A list of related observations that hang together by feel.
- A complaint, a confession, a punchline.
- A **leading word** — a compact metaphor or coinage the whole piece can hang on (one term that names the idea, the way _tracer bullets_ or _fog of war_ names a whole pattern).

Of these, the leading word is the most valuable fragment to land. It is load-bearing: name the right one in explore and it shapes the structure, the transitions, and the title later — paying dividends through the entire exploit phase. When the conversation circles a recurring idea, push to coin a word for it.

The novelist's diary is the model: years of unstructured noticings that later get mined for raw material. Fragments are noticings.

## File format

```markdown
# Working title

A first fragment lives here.

It can be multiple paragraphs. It can include lists, code, quotes — whatever
shape the fragment naturally takes.

---

A second fragment.

---

> A quoted line that the user wants to keep around.

A reaction to it.

---

- A cluster of related observations
- That hang together by feel
- And want to be near each other
```

Fragments are separated by a horizontal rule (`\n---\n`). No headings inside the body. No tags. No order beyond the order they were added.

## Writing rhythm

Append silently. Don't ask permission for each fragment. Mention what you added in passing ("adding that"), but don't interrupt the conversation with save dialogs.

Before every write: re-read the file from disk. The user may have edited, reordered, or deleted fragments between turns — preserve their changes. Never overwrite the file; only append (or, if the user asks, edit a specific fragment in place).

The user can say "cut the last one", "rewrite that one sharper", "merge those two" at any time. Treat those as first-class instructions.

</supporting-info>
</file>

<file path="skills/in-progress/writing-shape/agents/openai.yaml">
interface:
  display_name: "Writing Shape"
  short_description: "Shape raw material into an article"
policy:
  allow_implicit_invocation: false
</file>

<file path="skills/in-progress/writing-shape/SKILL.md">
---
name: writing-shape
description: Writing, exploit — shape raw material into an article, paragraph by paragraph.
disable-model-invocation: true
---

<what-to-do>

The user has passed (or will pass) a markdown file of raw material. Treat it as the input pile — anything from a tidy list of fragments to a wall of unstructured prose to a transcript. The format does not matter. Read it end-to-end before doing anything else.

Then run a shaping session that produces a separate article document. This is **exploit**: the exploring is done, the pile is fixed — commit to a structure and mine the pile to fill it. Do not edit the raw material file — it is read-only to this skill.

If the user did not say where to save the article, ask once and remember the path.

</what-to-do>

<supporting-info>

## The loop

1. **Read the pile.** Read the input file in full. Form a sense of what's in it.
2. **Establish the prerequisites.** Settle with the user what the reader knows walking in — the concepts that are **grounded** from the start. Everything else must be grounded by a block before a later block can lean on it. See [Grounding](#grounding).
3. **Draft 2–3 candidate openings.** Each opening should imply a different thesis or angle for the article. Show all of them. Force the user to pick or compose a hybrid. The chosen opening defines what the rest of the article must do.
4. **Grow paragraph by paragraph.** After the opening lands, ask "given this opening, what does the reader need to hear next?" Pull material from the pile to answer. The next block may only lean on grounded concepts, and grounds new ones as it lands. Argue about the form the next block takes — a paragraph, a list, a table, a callout, a quote, a code block. Each format choice should be deliberate and defensible.
5. **Append to the article file as you go.** Don't batch. Write each agreed paragraph or block immediately so the user can see the article taking shape.
6. **Loop step 4 until the article is done.** The user decides when it's done.

## Grounding

Every **concept** has to be **grounded** before a block can lean on it: the reader either walked in knowing it or met it in an earlier block. A block that reaches for an ungrounded concept loses the reader. The unit is the concept, not the word for it — a block can lean on an idea the reader lacks even with no jargon in sight. Where a concept has a name — a **term** — grounding it means landing the idea and the term together.

A concept gets grounded one of two ways:

- **Prerequisite** — grounded before the opening. The reader brings it. Fixed at the start.
- **Introduced** — a block establishes it, and from then on it's grounded for the rest of the article.

Keep a running list of what's grounded. When you ask "what does the reader need to hear next?", an ungrounded concept the next move needs is itself the answer: ground it first — here or in an earlier block — or you can't make the move. This is the gap-naming of [Pulling from the pile](#pulling-from-the-pile) one level up: there the pile is missing material; here the article is missing a foundation.

The lever is what you make a prerequisite versus what you ground inside the article. Demand too much up front and you shut readers out; ground too much inside and the opening drowns in definitions. Settle it with the user when you establish prerequisites.

## Conversational feel

This is a grilling session inverted. In ideation, the question was "what are you actually noticing?" Here it's "what is this article actually arguing, and in what order does the reader need to hear it?" Push back. Refuse to let weak transitions slide. If a paragraph doesn't earn its place, cut it.

Specific moves to keep using:

- "What does this paragraph do for the reader that the previous one didn't?"
- "If I cut this, what breaks?"
- "Is this prose, or should it be a list? Why prose?"
- "This sentence is doing two jobs — split it or pick one."
- "The opening promised X. We've drifted to Y. Either re-thread it or change the opening."

## Pulling from the pile

Treat the raw material as a quarry, not a script. Pull a fragment, rework it to fit the surrounding paragraph, and place it. A fragment may be split across multiple paragraphs, merged with another, or paraphrased. The pile's job is to be mined; the article's job is to read as one voice.

If the pile lacks something the article needs, name the gap explicitly: "We need an example here and the pile doesn't have one — give me one now or we cut this section."

## Format arguments to actually have

When choosing how to render a block, weigh these tradeoffs out loud with the user, not silently:

- **Prose vs. list.** Prose carries argument; lists carry parallel items. If items aren't truly parallel, prose is better. If they are, a list is faster to scan.
- **Inline vs. callout.** Tips, warnings, and asides go in callouts (`> [!TIP]`, `> [!NOTE]`) — but only if they'd genuinely derail the main argument inline. Otherwise leave them inline.
- **Table vs. repeated structure.** If the same shape repeats 3+ times with the same fields, a table. Otherwise prose with bold leads.
- **Quote vs. paraphrase.** Quote when the original wording is the point. Paraphrase when only the idea matters.
- **Code block vs. inline code.** Multi-line, runnable, or illustrative → block. Single token or identifier → inline.

## Writing rhythm

Append to the article file as each block is agreed. Re-read the file from disk before every write — the user may have edited between turns. Never overwrite blindly. If the user wants a paragraph rewritten, edit that specific paragraph in place; leave the rest alone.

## Out of scope

- Mining for new fragments that aren't in the pile (handle gaps as in "Pulling from the pile").
- Editing the raw material file.
- Publishing, formatting for a specific platform, or adding frontmatter the user didn't ask for.

</supporting-info>
</file>

<file path="skills/in-progress/README.md">
# In Progress

Skills that are still being developed. They're not ready to ship — expect rough edges, breaking changes, and abandoned experiments. They're excluded from the plugin and the top-level README until they graduate to a stable bucket.

- **[loop-me](./loop-me/SKILL.md)** — Grill yourself into implementable workflow specs over multiple sessions, using the current directory as a stateful workspace. User-invoked.
- **[wizard](./wizard/SKILL.md)** — Generate an interactive bash wizard that walks a human through a manual procedure (setup, a one-off migration, a state transition) — opening URLs, capturing values, writing `.env` and GitHub Actions secrets. User-invoked.
- **[writing-beats](./writing-beats/SKILL.md)** — Shape an article as a journey of beats, choose-your-own-adventure style. Pick a starting beat, write only that beat, then pivot to the next, until the article reaches a natural end.
- **[writing-fragments](./writing-fragments/SKILL.md)** — Grilling session that mines you for fragments — heterogeneous nuggets of writing — and appends them to a single document as raw material for a future article.
- **[writing-shape](./writing-shape/SKILL.md)** — Take a markdown file of raw material and shape it into an article paragraph by paragraph, arguing format choices at each step.
- **[claude-handoff](./claude-handoff/SKILL.md)** — Hand the current conversation off to a fresh background agent that picks up the work immediately, seeded with a handoff summary via `claude --bg`. User-invoked.
- **[setup-ts-deep-modules](./setup-ts-deep-modules/SKILL.md)** — Wire dependency-cruiser into a TypeScript repo so each package is a deep module — implementation hidden in subfolders, reachable only through its entry-point files, tests exercising it through those. User-invoked.
- **[to-questionnaire](./to-questionnaire/SKILL.md)** — Turn a decision you can't fully answer into a Markdown questionnaire for someone else to fill in async, or over a meeting. It grills you about the send (who it's for, what you need back), not the subject. User-invoked.
- **[batch-grill-me](./batch-grill-me/SKILL.md)** — Relentless interview that walks the design tree in rounds instead of one question at a time — each round asks the whole frontier of decisions whose prerequisites are already settled, then recomputes from your answers. User-invoked.
</file>

<file path="skills/misc/git-guardrails-claude-code/agents/openai.yaml">
interface:
  display_name: "Git Guardrails for Claude Code"
  short_description: "Block dangerous git commands"
</file>

<file path="skills/misc/git-guardrails-claude-code/scripts/block-dangerous-git.sh">
#!/bin/bash

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

DANGEROUS_PATTERNS=(
  "git push"
  "git reset --hard"
  "git clean -fd"
  "git clean -f"
  "git branch -D"
  "git checkout \."
  "git restore \."
  "push --force"
  "reset --hard"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qE "$pattern"; then
    echo "BLOCKED: '$COMMAND' matches dangerous pattern '$pattern'. The user has prevented you from doing this." >&2
    exit 2
  fi
done

exit 0
</file>

<file path="skills/misc/git-guardrails-claude-code/SKILL.md">
---
name: git-guardrails-claude-code
description: Set up Claude Code hooks to block dangerous git commands (push, reset --hard, clean, branch -D, etc.) before they execute. Use when user wants to prevent destructive git operations, add git safety hooks, or block git push/reset in Claude Code.
---

# Setup Git Guardrails

Sets up a PreToolUse hook that intercepts and blocks dangerous git commands before Claude executes them.

## What Gets Blocked

- `git push` (all variants including `--force`)
- `git reset --hard`
- `git clean -f` / `git clean -fd`
- `git branch -D`
- `git checkout .` / `git restore .`

When blocked, Claude sees a message telling it that it does not have authority to access these commands.

## Steps

### 1. Ask scope

Ask the user: install for **this project only** (`.claude/settings.json`) or **all projects** (`~/.claude/settings.json`)?

### 2. Copy the hook script

The bundled script is at: [scripts/block-dangerous-git.sh](scripts/block-dangerous-git.sh)

Copy it to the target location based on scope:

- **Project**: `.claude/hooks/block-dangerous-git.sh`
- **Global**: `~/.claude/hooks/block-dangerous-git.sh`

Make it executable with `chmod +x`.

### 3. Add hook to settings

Add to the appropriate settings file:

**Project** (`.claude/settings.json`):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-dangerous-git.sh"
          }
        ]
      }
    ]
  }
}
```

**Global** (`~/.claude/settings.json`):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/block-dangerous-git.sh"
          }
        ]
      }
    ]
  }
}
```

If the settings file already exists, merge the hook into existing `hooks.PreToolUse` array — don't overwrite other settings.

### 4. Ask about customization

Ask if user wants to add or remove any patterns from the blocked list. Edit the copied script accordingly.

### 5. Verify

Run a quick test:

```bash
echo '{"tool_input":{"command":"git push origin main"}}' | <path-to-script>
```

Should exit with code 2 and print a BLOCKED message to stderr.
</file>

<file path="skills/misc/migrate-to-shoehorn/agents/openai.yaml">
interface:
  display_name: "Migrate to Shoehorn"
  short_description: "Replace test assertions with shoehorn"
</file>

<file path="skills/misc/migrate-to-shoehorn/SKILL.md">
---
name: migrate-to-shoehorn
description: Migrate test files from `as` type assertions to @total-typescript/shoehorn. Use when user mentions shoehorn, wants to replace `as` in tests, or needs partial test data.
---

# Migrate to Shoehorn

## Why shoehorn?

`shoehorn` lets you pass partial data in tests while keeping TypeScript happy. It replaces `as` assertions with type-safe alternatives.

**Test code only.** Never use shoehorn in production code.

Problems with `as` in tests:

- Trained not to use it
- Must manually specify target type
- Double-as (`as unknown as Type`) for intentionally wrong data

## Install

```bash
npm i @total-typescript/shoehorn
```

## Migration patterns

### Large objects with few needed properties

Before:

```ts
type Request = {
  body: { id: string };
  headers: Record<string, string>;
  cookies: Record<string, string>;
  // ...20 more properties
};

it("gets user by id", () => {
  // Only care about body.id but must fake entire Request
  getUser({
    body: { id: "123" },
    headers: {},
    cookies: {},
    // ...fake all 20 properties
  });
});
```

After:

```ts
import { fromPartial } from "@total-typescript/shoehorn";

it("gets user by id", () => {
  getUser(
    fromPartial({
      body: { id: "123" },
    }),
  );
});
```

### `as Type` → `fromPartial()`

Before:

```ts
getUser({ body: { id: "123" } } as Request);
```

After:

```ts
import { fromPartial } from "@total-typescript/shoehorn";

getUser(fromPartial({ body: { id: "123" } }));
```

### `as unknown as Type` → `fromAny()`

Before:

```ts
getUser({ body: { id: 123 } } as unknown as Request); // wrong type on purpose
```

After:

```ts
import { fromAny } from "@total-typescript/shoehorn";

getUser(fromAny({ body: { id: 123 } }));
```

## When to use each

| Function        | Use case                                           |
| --------------- | -------------------------------------------------- |
| `fromPartial()` | Pass partial data that still type-checks           |
| `fromAny()`     | Pass intentionally wrong data (keeps autocomplete) |
| `fromExact()`   | Force full object (swap with fromPartial later)    |

## Workflow

1. **Gather requirements** - ask user:
   - What test files have `as` assertions causing problems?
   - Are they dealing with large objects where only some properties matter?
   - Do they need to pass intentionally wrong data for error testing?

2. **Install and migrate**:
   - [ ] Install: `npm i @total-typescript/shoehorn`
   - [ ] Find test files with `as` assertions: `grep -r " as [A-Z]" --include="*.test.ts" --include="*.spec.ts"`
   - [ ] Replace `as Type` with `fromPartial()`
   - [ ] Replace `as unknown as Type` with `fromAny()`
   - [ ] Add imports from `@total-typescript/shoehorn`
   - [ ] Run type check to verify
</file>

<file path="skills/misc/scaffold-exercises/agents/openai.yaml">
interface:
  display_name: "Scaffold Exercises"
  short_description: "Scaffold lint-ready course exercises"
</file>

<file path="skills/misc/scaffold-exercises/SKILL.md">
---
name: scaffold-exercises
description: Create exercise directory structures with sections, problems, solutions, and explainers that pass linting. Use when user wants to scaffold exercises, create exercise stubs, or set up a new course section.
---

# Scaffold Exercises

Create exercise directory structures that pass `pnpm ai-hero-cli internal lint`, then commit with `git commit`.

## Directory naming

- **Sections**: `XX-section-name/` inside `exercises/` (e.g., `01-retrieval-skill-building`)
- **Exercises**: `XX.YY-exercise-name/` inside a section (e.g., `01.03-retrieval-with-bm25`)
- Section number = `XX`, exercise number = `XX.YY`
- Names are dash-case (lowercase, hyphens)

## Exercise variants

Each exercise needs at least one of these subfolders:

- `problem/` - student workspace with TODOs
- `solution/` - reference implementation
- `explainer/` - conceptual material, no TODOs

When stubbing, default to `explainer/` unless the plan specifies otherwise.

## Required files

Each subfolder (`problem/`, `solution/`, `explainer/`) needs a `readme.md` that:

- Is **not empty** (must have real content, even a single title line works)
- Has no broken links

When stubbing, create a minimal readme with a title and a description:

```md
# Exercise Title

Description here
```

If the subfolder has code, it also needs a `main.ts` (>1 line). But for stubs, a readme-only exercise is fine.

## Workflow

1. **Parse the plan** - extract section names, exercise names, and variant types
2. **Create directories** - `mkdir -p` for each path
3. **Create stub readmes** - one `readme.md` per variant folder with a title
4. **Run lint** - `pnpm ai-hero-cli internal lint` to validate
5. **Fix any errors** - iterate until lint passes

## Lint rules summary

The linter (`pnpm ai-hero-cli internal lint`) checks:

- Each exercise has subfolders (`problem/`, `solution/`, `explainer/`)
- At least one of `problem/`, `explainer/`, or `explainer.1/` exists
- `readme.md` exists and is non-empty in the primary subfolder
- No `.gitkeep` files
- No `speaker-notes.md` files
- No broken links in readmes
- No `pnpm run exercise` commands in readmes
- `main.ts` required per subfolder unless it's readme-only

## Moving/renaming exercises

When renumbering or moving exercises:

1. Use `git mv` (not `mv`) to rename directories - preserves git history
2. Update the numeric prefix to maintain order
3. Re-run lint after moves

Example:

```bash
git mv exercises/01-retrieval/01.03-embeddings exercises/01-retrieval/01.04-embeddings
```

## Example: stubbing from a plan

Given a plan like:

```
Section 05: Memory Skill Building
- 05.01 Introduction to Memory
- 05.02 Short-term Memory (explainer + problem + solution)
- 05.03 Long-term Memory
```

Create:

```bash
mkdir -p exercises/05-memory-skill-building/05.01-introduction-to-memory/explainer
mkdir -p exercises/05-memory-skill-building/05.02-short-term-memory/{explainer,problem,solution}
mkdir -p exercises/05-memory-skill-building/05.03-long-term-memory/explainer
```

Then create readme stubs:

```
exercises/05-memory-skill-building/05.01-introduction-to-memory/explainer/readme.md -> "# Introduction to Memory"
exercises/05-memory-skill-building/05.02-short-term-memory/explainer/readme.md -> "# Short-term Memory"
exercises/05-memory-skill-building/05.02-short-term-memory/problem/readme.md -> "# Short-term Memory"
exercises/05-memory-skill-building/05.02-short-term-memory/solution/readme.md -> "# Short-term Memory"
exercises/05-memory-skill-building/05.03-long-term-memory/explainer/readme.md -> "# Long-term Memory"
```
</file>

<file path="skills/misc/setup-pre-commit/agents/openai.yaml">
interface:
  display_name: "Setup Pre-Commit"
  short_description: "Add pre-commit quality checks"
</file>

<file path="skills/misc/setup-pre-commit/SKILL.md">
---
name: setup-pre-commit
description: Set up Husky pre-commit hooks with lint-staged (Prettier), type checking, and tests in the current repo. Use when user wants to add pre-commit hooks, set up Husky, configure lint-staged, or add commit-time formatting/typechecking/testing.
---

# Setup Pre-Commit Hooks

## What This Sets Up

- **Husky** pre-commit hook
- **lint-staged** running Prettier on all staged files
- **Prettier** config (if missing)
- **typecheck** and **test** scripts in the pre-commit hook

## Steps

### 1. Detect package manager

Check for `package-lock.json` (npm), `pnpm-lock.yaml` (pnpm), `yarn.lock` (yarn), `bun.lockb` (bun). Use whichever is present. Default to npm if unclear.

### 2. Install dependencies

Install as devDependencies:

```
husky lint-staged prettier
```

### 3. Initialize Husky

```bash
npx husky init
```

This creates `.husky/` dir and adds `prepare: "husky"` to package.json.

### 4. Create `.husky/pre-commit`

Write this file (no shebang needed for Husky v9+):

```
npx lint-staged
npm run typecheck
npm run test
```

**Adapt**: Replace `npm` with detected package manager. If repo has no `typecheck` or `test` script in package.json, omit those lines and tell the user.

### 5. Create `.lintstagedrc`

```json
{
  "*": "prettier --ignore-unknown --write"
}
```

### 6. Create `.prettierrc` (if missing)

Only create if no Prettier config exists. Use these defaults:

```json
{
  "useTabs": false,
  "tabWidth": 2,
  "printWidth": 80,
  "singleQuote": false,
  "trailingComma": "es5",
  "semi": true,
  "arrowParens": "always"
}
```

### 7. Verify

- [ ] `.husky/pre-commit` exists and is executable
- [ ] `.lintstagedrc` exists
- [ ] `prepare` script in package.json is `"husky"`
- [ ] `prettier` config exists
- [ ] Run `npx lint-staged` to verify it works

### 8. Commit

Stage all changed/created files and commit with message: `Add pre-commit hooks (husky + lint-staged + prettier)`

This will run through the new pre-commit hooks — a good smoke test that everything works.

## Notes

- Husky v9+ doesn't need shebangs in hook files
- `prettier --ignore-unknown` skips files Prettier can't parse (images, etc.)
- The pre-commit runs lint-staged first (fast, staged-only), then full typecheck and tests
</file>

<file path="skills/misc/README.md">
# Misc

Tools I keep around but rarely use — not promoted in the plugin.

- **[git-guardrails-claude-code](./git-guardrails-claude-code/SKILL.md)** — Set up Claude Code hooks to block dangerous git commands (push, reset --hard, clean, etc.) before they execute.
- **[migrate-to-shoehorn](./migrate-to-shoehorn/SKILL.md)** — Migrate test files from `as` type assertions to @total-typescript/shoehorn.
- **[scaffold-exercises](./scaffold-exercises/SKILL.md)** — Create exercise directory structures with sections, problems, solutions, and explainers.
- **[setup-pre-commit](./setup-pre-commit/SKILL.md)** — Set up Husky pre-commit hooks with lint-staged, Prettier, type checking, and tests.
</file>

<file path="skills/personal/edit-article/agents/openai.yaml">
interface:
  display_name: "Edit Article"
  short_description: "Restructure and tighten a draft"
policy:
  allow_implicit_invocation: false
</file>

<file path="skills/personal/edit-article/SKILL.md">
---
name: edit-article
description: Edit and improve articles by restructuring sections, improving clarity, and tightening prose. Use when user wants to edit, revise, or improve an article draft.
disable-model-invocation: true
---

1. First, divide the article into sections based on its headings. Think about the main points you want to make during those sections.

Consider that information is a directed acyclic graph, and that pieces of information can depend on other pieces of information. Make sure that the order of the sections and their contents respects these dependencies.

Confirm the sections with the user.

2. For each section:

2a. Rewrite the section to improve clarity, coherence, and flow. Use maximum 240 characters per paragraph.
</file>

<file path="skills/personal/obsidian-vault/agents/openai.yaml">
interface:
  display_name: "Obsidian Vault"
  short_description: "Manage linked notes in Obsidian"
</file>

<file path="skills/personal/obsidian-vault/SKILL.md">
---
name: obsidian-vault
description: Search, create, and manage notes in the Obsidian vault with wikilinks and index notes. Use when user wants to find, create, or organize notes in Obsidian.
---

# Obsidian Vault

## Vault location

`/mnt/d/Obsidian Vault/AI Research/`

Mostly flat at root level.

## Naming conventions

- **Index notes**: aggregate related topics (e.g., `Ralph Wiggum Index.md`, `Skills Index.md`, `RAG Index.md`)
- **Title case** for all note names
- No folders for organization - use links and index notes instead

## Linking

- Use Obsidian `[[wikilinks]]` syntax: `[[Note Title]]`
- Notes link to dependencies/related notes at the bottom
- Index notes are just lists of `[[wikilinks]]`

## Workflows

### Search for notes

```bash
# Search by filename
find "/mnt/d/Obsidian Vault/AI Research/" -name "*.md" | grep -i "keyword"

# Search by content
grep -rl "keyword" "/mnt/d/Obsidian Vault/AI Research/" --include="*.md"
```

Or use Grep/Glob tools directly on the vault path.

### Create a new note

1. Use **Title Case** for filename
2. Write content as a unit of learning (per vault rules)
3. Add `[[wikilinks]]` to related notes at the bottom
4. If part of a numbered sequence, use the hierarchical numbering scheme

### Find related notes

Search for `[[Note Title]]` across the vault to find backlinks:

```bash
grep -rl "\\[\\[Note Title\\]\\]" "/mnt/d/Obsidian Vault/AI Research/"
```

### Find index notes

```bash
find "/mnt/d/Obsidian Vault/AI Research/" -name "*Index*"
```
</file>

<file path="skills/personal/README.md">
# Personal

Skills tied to my own setup, not promoted in the plugin.

- **[edit-article](./edit-article/SKILL.md)** — Edit and improve articles by restructuring sections, improving clarity, and tightening prose.
- **[obsidian-vault](./obsidian-vault/SKILL.md)** — Search, create, and manage notes in an Obsidian vault with wikilinks and index notes.
</file>

<file path="skills/productivity/grill-me/agents/openai.yaml">
interface:
  display_name: "Grill Me"
  short_description: "Sharpen a plan through interview"
policy:
  allow_implicit_invocation: false
</file>

<file path="skills/productivity/grill-me/SKILL.md">
---
name: grill-me
description: A relentless interview to sharpen a plan or design.
disable-model-invocation: true
---

Run a `/grilling` session.
</file>

<file path="skills/productivity/grilling/agents/openai.yaml">
interface:
  display_name: "Grilling"
  short_description: "Stress-test thinking one question at a time"
</file>

<file path="skills/productivity/grilling/SKILL.md">
---
name: grilling
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
---

Interview me relentlessly about every aspect of this until we reach a shared understanding. Walk down each branch of the decision tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time, waiting for feedback on each question before continuing. Asking multiple questions at once is bewildering.

If a *fact* can be found by exploring the environment (filesystem, tools, etc.), look it up rather than asking me. The *decisions*, though, are mine — put each one to me and wait for my answer.

Do not act on it until I confirm we have reached a shared understanding.
</file>

<file path="skills/productivity/handoff/agents/openai.yaml">
interface:
  display_name: "Handoff"
  short_description: "Compact a conversation into a handoff"
policy:
  allow_implicit_invocation: false
</file>

<file path="skills/productivity/handoff/SKILL.md">
---
name: handoff
description: Compact the current conversation into a handoff document for another agent to pick up.
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
---

Write a handoff document summarising the current conversation so a fresh agent can continue the work. Save to the temporary directory of the user's OS - not the current workspace.

Include a "suggested skills" section in the document, which suggests skills that the agent should invoke.

Do not duplicate content already captured in other artifacts (specs, plans, ADRs, issues, commits, diffs). Reference them by path or URL instead.

Redact any sensitive information, such as API keys, passwords, or personally identifiable information.

If the user passed arguments, treat them as a description of what the next session will focus on and tailor the doc accordingly.
</file>

<file path="skills/productivity/teach/agents/openai.yaml">
interface:
  display_name: "Teach"
  short_description: "Learn a concept in a guided workspace"
policy:
  allow_implicit_invocation: false
</file>

<file path="skills/productivity/teach/GLOSSARY-FORMAT.md">
# GLOSSARY.md Format

`GLOSSARY.md` is the canonical language for this teaching workspace. All explainers, exercises, and learning records should adhere to its terminology. Building it is itself part of learning: compressing a concept into a tight definition is evidence the user understands it.

## Structure

```md
# {Topic} Glossary

{One or two sentence description of the topic this glossary covers.}

## Terms

**Hypertrophy**:
Muscle growth driven by mechanical tension and metabolic stress over repeated training sessions.
_Avoid_: Bulking, getting big

**Progressive overload**:
Systematically increasing the demand on a muscle over time — via load, volume, or intensity.
_Avoid_: Pushing harder, levelling up

**RPE (Rate of Perceived Exertion)**:
A 1–10 self-rating of how hard a set felt, where 10 is failure and 8 means two reps left in the tank.
_Avoid_: Effort score, intensity rating
```

## Rules

- **Add a term only when the user understands it.** The glossary is a record of compressed knowledge, not a dictionary the user reads to learn. If the user has just been introduced to a concept, wait until they can use it correctly before promoting it here.
- **Be opinionated.** When several words exist for the same concept, pick the best one and list the rest as aliases to avoid. This is how language compresses.
- **Keep definitions tight.** One or two sentences. Define what the term IS, not what it does or how to do it.
- **Use the glossary's own terms inside definitions.** Once a term is in the glossary, prefer it everywhere — including inside other definitions. This is what makes complex terms easier to grasp later.
- **Group under subheadings** when natural clusters emerge (e.g. `## Anatomy`, `## Programming`). A flat list is fine when terms cohere.
- **Flag ambiguities explicitly.** If a term is used loosely in the wider field, note the resolution: "In this workspace, 'set' always means a working set — warm-ups are tracked separately."
- **Revise as understanding deepens.** A definition the user wrote in week one may be wrong by week six. Update in place; do not leave stale entries.
</file>

<file path="skills/productivity/teach/LEARNING-RECORD-FORMAT.md">
# Learning Record Format

Learning records live in `./learning-records/` and use sequential numbering: `0001-slug.md`, `0002-slug.md`, etc. Create the directory lazily — only when the first record is written.

They are the teaching equivalent of ADRs: they capture non-obvious lessons, key insights, and stated prior knowledge that will steer future sessions. They are used to calculate the zone of proximal development.

## Template

```md
# {Short title of what was learned or established}

{1-3 sentences: what was learned (or what prior knowledge was established), and why it matters for future sessions.}
```

That is the whole format. A learning record can be a single paragraph. The value is recording _that_ this is now known and _why_ it changes what to teach next — not in filling out sections.

## Optional sections

Only include these when they add genuine value. Most records won't need them.

- **Status** frontmatter (`active | superseded by LR-NNNN`) — useful when an earlier understanding turns out to be wrong and is replaced.
- **Evidence** — how the user demonstrated the understanding (a question answered, an exercise completed, prior experience cited). Useful when the claim might be revisited.
- **Implications** — what this unlocks or rules out for future sessions. Worth recording when non-obvious.

## Numbering

Scan `./learning-records/` for the highest existing number and increment by one.

## When to write a learning record

Write one when any of these is true:

1. **The user demonstrated genuine understanding of something non-trivial** — not just exposure, but evidence they can use the concept correctly. This sets a new floor for what to teach next.
2. **The user disclosed prior knowledge** — "I already know X." Record it so future sessions don't re-teach it. Also record the _depth_ claimed.
3. **A misconception was corrected** — the user previously believed something wrong and now sees why. These are high-value: they predict future stumbling blocks for related topics.
4. **The mission shifted in response to learning** — the user discovered they cared about something different than they thought. Cross-link to [[MISSION.md]] and update it.

### What does _not_ qualify

- Material that was merely covered. Coverage is not learning. Wait for evidence.
- Anything already captured tersely in [[GLOSSARY.md]] as a term definition. Don't duplicate.
- Session-by-session activity logs. Learning records are not a journal — they are decision-grade insights.

## Supersession

When a later record contradicts an earlier one (the user's understanding deepened or corrected), mark the old record `Status: superseded by LR-NNNN` rather than deleting it. The history of how understanding evolved is itself useful signal.
</file>

<file path="skills/productivity/teach/MISSION-FORMAT.md">
# MISSION.md Format

`MISSION.md` lives at the workspace root. It captures the _reason_ the user is learning this topic. Every teaching decision — what to teach next, which resources to surface, which exercises to design — should trace back to this document.

## Template

```md
# Mission: {Topic}

## Why
{1-3 sentences. The concrete real-world goal the user is chasing. What changes in their life or work when they have this skill? Avoid abstract framings like "to understand X" — push for the underlying outcome.}

## Success looks like
- {A specific, observable thing the user will be able to do}
- {Another specific thing}
- {…}

## Constraints
- {Time, budget, prior commitments, learning preferences, anything that bounds the approach}

## Out of scope
- {Adjacent topics the user explicitly does not want to chase right now — protects the zone of proximal development}
```

## Rules

- **One mission per workspace.** If the user wants to learn two unrelated things, that is two workspaces.
- **Concrete over abstract.** "Run a half marathon by October" beats "get fitter." "Ship a Rust CLI to my team" beats "learn Rust."
- **Push back on vagueness.** If the user cannot articulate why, interview them before writing anything. A bad mission is worse than no mission.
- **Revise when reality shifts.** Missions change. When the user's goal moves, update this file — don't leave a stale mission steering future sessions.
- **Keep it short.** If `MISSION.md` runs past a screen, it has stopped being a compass and started being a plan.
</file>

<file path="skills/productivity/teach/RESOURCES-FORMAT.md">
# RESOURCES.md Format

`RESOURCES.md` is the curated set of trusted sources for this topic. Knowledge for explainers should be drawn from here, not from parametric guesses. Wisdom comes from the communities listed here.

## Structure

```md
# {Topic} Resources

## Knowledge

- [Book: _The Science and Practice of Strength Training_ — Zatsiorsky & Kraemer](https://example.com)
  Foundational text on programming and adaptation. Use for: anything to do with periodisation, recovery, intensity zones.
- [Article: "How Much Should I Train?" — Greg Nuckols (Stronger By Science)](https://example.com)
  Evidence-based review of volume landmarks. Use for: weekly set targets per muscle group.

## Wisdom (Communities)

- [r/weightroom](https://reddit.com/r/weightroom)
  High-signal subreddit, moderated against bro-science. Use for: programme critique, plateau troubleshooting.
- Local: Tuesday strength class at {gym name}
  Use for: real-time coaching feedback on lifts.
```

## Rules

- **High-trust only.** Prefer primary sources, recognised experts, peer-reviewed work, and communities with strong moderation. If a resource is marketing dressed as education, leave it out.
- **Annotate every entry.** A bare link is useless in three months. Add one line: what it covers and when to reach for it.
- **Group by Knowledge / Wisdom.** Mirrors the philosophy in [SKILL.md](./SKILL.md). It is fine for a resource to appear in only one group.
- **Surface gaps explicitly.** If no good resource exists for an area the mission needs, write a `## Gaps` section listing what is missing. This drives future search.
- **Prune ruthlessly.** A resource that turned out to be wrong, shallow, or off-mission should be removed, not buried. Better five sharp sources than thirty mediocre ones.
- **Record community preferences.** If the user has opted out of joining communities, note it here so future sessions don't keep proposing them.
</file>

<file path="skills/productivity/teach/SKILL.md">
---
name: teach
description: Teach the user a new skill or concept, within this workspace.
disable-model-invocation: true
argument-hint: "What would you like to learn about?"
---

The user has asked you to teach them something. This is a stateful request - they intend to learn the topic over multiple sessions.

## Teaching Workspace

Treat the current directory as a teaching workspace. The state of their learning is captured in this directory in several files:

- `MISSION.md`: A document capturing the _reason_ the user is interested in the topic. This should be used to ground all teaching. Use the format in [MISSION-FORMAT.md](./MISSION-FORMAT.md).
- `./reference/*.html`: A directory of reference materials. These are the compressed learnings from the lessons - cheat sheets, reference algorithms, syntax, yoga poses, glossaries. They are the raw units of learning. They should be beautiful documents which print out well, and are designed for quick reference.
- `RESOURCES.md`: A list of resources which can be explored to ground your teaching in contextual knowledge, or to acquire knowledge and wisdom. Use the format in [RESOURCES-FORMAT.md](./RESOURCES-FORMAT.md).
- `./learning-records/*.md`: A directory of learning records, which capture what the user has learned. These are loosely equivalent to architectural decision records in software development - they capture non-obvious lessons and key insights that may need to be revised later, or drive future sessions. These should be used to calculate the zone of proximal development. They are titled `0001-<dash-case-name>.md`, where the number increments each time. Use the format in [LEARNING-RECORD-FORMAT.md](./LEARNING-RECORD-FORMAT.md).
- `./lessons/*.html`: A directory of lessons. A **lesson** is a single, self-contained HTML output that teaches one tightly-scoped thing tied to the mission. This is the primary unit of teaching in this workspace.
- `./assets/*`: Reusable **components** shared across lessons. See [Assets](#assets).
- `NOTES.md`: A scratchpad for you to jot down user preferences, or working notes.

## Philosophy

To learn at a deep level, the user needs three things:

- **Knowledge**, captured from high-quality, high-trust resources
- **Skills**, acquired through highly-relevant interactive lessons devised by you, based on the knowledge
- **Wisdom**, which comes from interacting with other learners and practitioners

Before the `RESOURCES.md` is well-populated, your focus should be to find high-quality resources which will help the user acquire knowledge. Never trust your parametric knowledge.

Some topics may require more skills than knowledge. Learning more about theoretical physics might be more knowledge-based. For yoga, more skills-based.

### Fluency vs Storage Strength

You should be careful to split between two types of learning:

- **Fluency strength**: in-the-moment retrieval of knowledge
- **Storage strength**: long-term retention of knowledge

Fluency can give the user an illusory sense of mastery, but storage strength is the real goal. Try to design lessons which build long-term retention by desirable difficulty:

- Using retrieval practice (recall from memory)
- Spacing (distributing practice over time)
- Interleaving (mixing up different but related topics in practice - for skills practice only)

## Lessons

A lesson is the main thing you produce — the unit in which knowledge and skills reach the user. Each lesson is one self-contained HTML file, saved to `./lessons/` and titled `0001-<dash-case-name>.html` where the number increments each time.

A lesson should be **beautiful** — clean, readable typography and layout — since the user will return to these later to review. Think Tufte.

The lesson should be short, and completable very quickly. Learners' working memory is very small, and we need to stay within it. But each lesson should give the user a single tangible win that they can build on. It should be directly tied to the mission, and should be in the user's zone of proximal development.

If possible, open the lesson file for the user by running a CLI command.

Each lesson should link via HTML anchors to other lessons and reference documents.

Each lesson should recommend a primary source for the user to read or watch. This should be the most high-quality, high-trust resource you found on the topic.

Each lesson should contain a reminder to ask followup questions to the agent. The agent is their teacher, and can assist with anything that's unclear.

## Assets

Lessons are built from reusable **components**, stored in `./assets/`: stylesheets, quiz widgets, simulators, diagram helpers — anything a second lesson could reuse.

Reuse is the default, not the exception. Before authoring a lesson, read `./assets/` and build from the components already there. When a lesson needs something new and reusable, write it as a component in `./assets/` and link to it — never inline code a future lesson would duplicate.

A shared stylesheet is the first component every workspace earns: every lesson links it, so the lessons look like one consistent course rather than a pile of one-offs. As the workspace grows, so should the component library.

## The Mission

Every lesson should be tied into the mission - the reason that the user is interested in learning about the topic.

If the user is unclear about the mission, or the `MISSION.md` is not populated, your first job should be to question the user on why they want to learn this.

Failing to understand the mission will mean knowledge acquisition is not grounded in real-world goals. Lessons will feel too abstract. You will have no way of judging what the user should do next.

Missions may change as the user develops more skills and knowledge. This is normal - make sure to update the `MISSION.md` and add a learning record to capture the change. Confirm with the user before changing the mission.

## Zone Of Proximal Development

Each lesson, the user should always feel as if they are being challenged 'just enough'.

The user may specify an exact thing they want to learn. If they don't, figure out their zone of proximal development by:

- Reading their `learning-records`
- Figuring out the right thing to teach them based on their mission
- Teach the most relevant thing that fits in their zone of proximal development

## Knowledge

Lessons should be designed around a skill the user is going to learn. The knowledge in the lesson should be only what's required to acquire that skill. You teach the knowledge first, then get the user to practice the skills via an interactive feedback loop.

Knowledge should first be gathered from trusted resources. Use `RESOURCES.md` to keep track of them. Lessons should be littered with citations - links to external resources to back up any claim made. This increases the trustworthiness of the lesson.

For acquiring knowledge, difficulty is the enemy. It eats working memory you need for understanding.

## Skills

If knowledge is all about acquisition, skills are about durability and flexibility. Make the knowledge stick.

For skill acquisition, difficulty is the tool. Effortful retrieval is what builds storage strength. Skills should be taught through interactive lessons. There are several tools at your disposal:

- Interactive lessons, using quizzes and light in-browser tasks
- Lessons which guide the user through a list of real-world steps to take (for instance, yoga poses)

Each of these should be based on a **feedback loop**, where the user receives feedback on their performance. This feedback loop should be as tight as possible, giving feedback immediately - and ideally automatically.

For quizzes, each answer should be exactly the same number of words (and characters, if possible). Don't give the user any clues about the answer through formatting.

## Acquiring Wisdom

Wisdom comes from true real-world interaction - testing your skills outside the learning environment.

When the user asks a question that appears to require wisdom, your default posture should be to attempt to answer - but to ultimately delegate to a **community**.

A community is a place (online or offline) where the user can test their skills in the real world. This might be a forum, a subreddit, a real-world class (budget permitting) or a local interest group.

You should attempt to find high-reputation communities the user can join. If the user expresses a preference that they don't want to join a community, respect it.

## Reference Documents

While creating lessons, you should also create reference documents. Lessons can reference these documents - they are useful for tracking raw units of knowledge useful across lessons.

Lessons will rarely be revisited later - reference documents will be. They should be the compressed essence of the lesson, in a format designed for quick reference.

Some learning topics lend themselves to reference:

- Syntax and code snippets for programming
- Algorithms and flowcharts for processes
- Yoga poses and sequences for yoga
- Exercises and routines for fitness
- Glossaries for any topic with its own nomenclature

Glossaries, in particular, are an essential reference. Once one is created, it should be adhered to in every lesson.

## `NOTES.md`

The user will sometimes express preferences of how they want to be taught, or things you should keep in mind. This is the place to record those preferences, so you can refer back to them when designing lessons or working with the user.
</file>

<file path="skills/productivity/writing-great-skills/agents/openai.yaml">
interface:
  display_name: "Writing Great Skills"
  short_description: "Principles for predictable skills"
policy:
  allow_implicit_invocation: false
</file>

<file path="skills/productivity/writing-great-skills/GLOSSARY.md">
# Glossary — Building Great Skills

The domain model for what makes a skill great. A skill exists to wrangle determinism out of a stochastic system; the root virtue is **Predictability**, and every term below is a lever on it. This is the disclosed reference for [`writing-great-skills`](SKILL.md).

The terms are grouped by axis: **Invocation** (how a skill is reached), **Information Hierarchy** (how its content is arranged), **Steering** (how the agent's runtime behaviour is shaped), and **Pruning** (how it is kept lean). Each **failure mode** lives beside the lever that cures it, tagged _failure mode_.

**Bold terms** in any definition are themselves defined in this glossary; find them by their heading.

## Predictability

The degree to which a skill makes the agent behave the same _way_ on every run — the same process, not the same output (a brainstorming skill should _predictably_ diverge; its tokens vary, its behaviour doesn't). The root virtue every other term serves — cost and maintainability are symptoms of it, not rivals.

_Avoid_: consistency, reliability, robustness, output-determinism

## Invocation

How a skill is reached — and the two loads you pay for the choice.

### Model-Invoked

A skill that keeps its **description** field, so the agent can see it and fire it autonomously — and the human can still type its name, so model-invocation always _includes_ user reach. There is no model-only state: a description only ever _adds_ agent discovery, never removes the human's. Pays a permanent **context load** on every turn in exchange for that discoverability. Reachable by other skills, because the description that makes it agent-discoverable makes it invocable. A model-invoked skill whose content is all **reference** is also one home for shared reference: another skill can invoke it, so reference needed by several skills lives in one place. Pick model-invocation only when the agent must reach the skill on its own; if it never fires except by hand, drop the description and pay no context load.

_Avoid_: ability, tool, capability

### User-Invoked

A skill with its **description** stripped — invisible to the agent and reachable only by the human typing its name (user-_only_, where **model-invoked** is user-_and-agent_). Trades agent-discoverability for zero **context load**. Because it has no description, nothing but the human can reach it: no other skill can fire it.

_Avoid_: procedure, workflow, command

### Description

The skill's machine-readable trigger, and the one **context pointer** a **model-invoked** skill is forced to keep loaded at all times. Its mere presence _is_ the invocation axis: keep it and the skill is model-invoked (and reachable by other skills); delete it and the skill is **user-invoked**, reachable only by the human. The source of a model-invoked skill's **context load**.

_Avoid_: frontmatter, summary

### Context Pointer

A reference held in the agent's context that names some out-of-context material and encodes the condition for reaching it. The **description** is the top-level context pointer (context window → skill); pointers to disclosed files are the same object one level down. Its wording, not the target, decides _when_ the agent reaches — and _how reliably_. A must-have target behind a weakly worded pointer is a variance bug: fix the wording first, and inline the material only if sharpening fails.

_Avoid_: link, reference, import

### Context Load

The cost a **model-invoked** skill imposes on the agent's context window — its **description**, always loaded, spending both tokens and attention. What **user-invoked** skills escape by having no description, and the brake on splitting into more model-invoked skills.

_Avoid_: token cost, context bloat

### Cognitive Load

The cost a **user-invoked** skill imposes on the human — what they must hold in their head: which skills exist and when to reach for each (the human is the index). What **model-invocation** removes by being agent-discoverable, and the brake on splitting into more user-invoked skills. Not a cost to minimise: it is the price of human agency, the reason some skills stay user-invoked. Spend it where human judgement matters; remove it where it does not.

_Avoid_: human index, burden, overhead

### Router Skill

A **user-invoked** skill whose job is to point at your other user-invoked skills — naming each and when to reach for it — so the human has one skill to remember instead of many. It can only hint, never fire them: user-invoked skills have no **description**, so nothing but the human can reach them. The cure for **cognitive load** when user-invoked skills multiply.

_Avoid_: dispatcher, menu, registry, index, router procedure

### Granularity

How finely you divide skills. Finer division spends one of the two loads: more **model-invoked** skills spend **context load** (more descriptions crowding the window and competing for attention); more **user-invoked** skills spend **cognitive load** (more for the human to remember and reach for). Two cuts guide the division. By **invocation**, split off a model-invoked skill where you have a distinct **leading word** to trigger it — a trigger word you actually use in your prompts. By **sequence**, split a run of **steps** where a step's **post-completion steps** need hiding, since isolating it in its own context clears what follows. Beware the reverse: merging sequences exposes each step's post-completion steps to what follows, inviting premature completion.

_Avoid_: chunking, modularity

## Information Hierarchy

How a skill's content is arranged, and how far down the ladder each piece sits.

### Information Hierarchy

A skill's content ranked by how immediately the agent needs it — a single ladder, produced by two cuts: in-file or behind a pointer, and step or reference. The rungs:

- **Steps** — in-file, primary
- **Reference**, in-file — secondary
- **Reference**, disclosed — behind a **context pointer**

A skill with no **steps** uses just the bottom two rungs — often a legitimately flat peer-set (e.g. every rule of a review on one rung), which is a fine arrangement, not a smell. The hierarchy is independent of invocation: a skill can be model- or user-invoked whether it is all steps, all reference, or both. When a skill has steps, in-file reference that should be disclosed buries them and turns attending to them into a coin-flip — a variance lever, not just a legibility one. Keep the top of the ladder legible; push down it whatever you can.

_Avoid_: structure, organization, layout

### Steps

The ordered actions the agent performs — when a skill has them, the primary tier of its content, and the part that earns its place in SKILL.md. Not every skill has steps: a skill can be all steps (`tdd`), all **reference** (a review), or both, independent of invocation. Every step ends on a **completion criterion**, clear or vague.

_Avoid_: workflow, instructions, choreography

### Reference

Material the agent refers to on demand — definitions, facts, parameters, examples, conditional instructions. When a skill has **steps** it is secondary to them; when a skill has none it is the entire content; or it lives outside any skill entirely — see **External Reference**. Reached via **context pointers**, and the prime candidate for **progressive disclosure**.

_Avoid_: supporting material, docs, background

### External Reference

**Reference** that lives outside the skill system — a plain file, no **description**, no **steps**, not invocable — that any skill can point at. The home for shared reference that needn't fire on its own, and the only shared home two **user-invoked** skills can use, since neither has a description and so neither can fire the other.

_Avoid_: doc, resource, knowledge base

### Progressive Disclosure

Moving **reference** down the ladder — out of SKILL.md and behind a **context pointer** — so the top stays legible. Not primarily a token optimisation; it is how the **information hierarchy** is protected. Licensed by **branching**: disclose what only some branches need, inline what every path needs, and if a pointer fires unreliably on must-have material, sharpen its wording, and pull it back inline only if that fails.

_Avoid_: lazy loading, chunking

### Co-location

Keeping the material an agent needs at once in one place — a concept's definition, rules, and caveats under a single heading, not scattered across the file — so reading one part brings its neighbours with it. The within-file companion to the **Information Hierarchy**: the hierarchy ranks _how far down_ a piece sits; co-location decides _what sits beside it_ once there. There is no formula for the right format of a body of **reference**; the test is that a skill should read like documentation written for the agent, and grouped material reads that way where scattered material does not. Distinct from **Duplication**: that repeats one meaning in two places, where scattering fragments a single meaning across many.

_Avoid_: grouping, clustering, cohesion

### Sprawl

_Failure mode._ A skill that is simply too long — too many lines in SKILL.md — independent of whether they are stale or repeated. Even an all-live, all-unique skill can sprawl. It costs readability (the agent wades through more before it can act, and attention thins across the excess), maintainability (every extra line is one more to keep **relevant**), and tokens. The cure is the **information hierarchy**: push **reference** down behind **context pointers**, and split by **branch** or sequence so each path carries only what it needs. Distinct from **sediment** (length from stale accumulation) and **duplication** (length from repeated meaning) — sprawl is length itself, whatever its cause.

_Avoid_: bloat, length, size, verbosity

## Steering

The levers that shape the agent's runtime behaviour toward **Predictability**.

### Branch

A distinct way a skill can be invoked — a case the skill handles — so different runs take different paths through it. A skill with many steps may carry many branches; a linear one has none.

_Avoid_: path, case, fork

### Leading Word

A compact concept — also called a _Leitwort_ — already living in the model's pretraining, that the agent thinks with while running the skill. It encodes a behavioural principle in the fewest possible tokens by invoking priors the model already holds (e.g. _lesson_, _proximal zone of development_, _fog of war_, _tracer bullets_). Repeated as a token, never as a sentence, it accumulates a distributed definition across the skill and anchors a whole region of behaviour. Coining your own works if you define it clearly, but a made-up word recruits no priors — you pay in definition tokens what a pretrained word gives free. Reach for an existing word first.

A leading word serves **predictability** twice. In the body it anchors **execution** — the agent reaches for the same behaviour every time the concept appears, and inside flat reference it focuses attention on a class of thing to look for, recruiting the right checks each run. In the **description** it anchors **invocation** — and not only within the skill: when the same word lives in your prompts, your docs, and your codebase, the agent links that shared language to the skill and fires it more reliably. Word a description with the leading words you actually use when you want the skill.

_Avoid_: keyword, term, motif

### Completion Criterion

The condition that tells the agent a unit of work is done — the target it judges against. Two properties make it a lever, not just a quality. Its **clarity** (can the agent tell done from not-done?) resists **premature completion** — a vague bound ("understanding reached") lets the agent declare done and slip to the next step; this axis needs _steps_ to bite, since premature completion is a between-steps failure. Its **demand** (how much it requires) sets **legwork** — "every modified model accounted for" forces thorough work where "produce a change list" does not — and this axis is _not_ step-bound: it can bind a body of flat reference too, which is how a skill with no steps still carries an exhaustiveness bar ("every rule applied"). The strongest criteria are both checkable and exhaustive.

_Avoid_: done condition, exit condition, stopping rule

### Legwork

The work an agent does behind the scenes within a single step — reading files, exploring the codebase, making changes, digging up what it needs rather than offloading to the user. It lives below the step structure: never written as its own step, latent in the wording, controlled by the agent rather than the skill. The within-step counterpart to **post-completion steps**' across-step pull. Raised by a **leading word** (_comprehensive_, _thorough_) or a **completion criterion** that demands the work be exhaustive — including the demand axis applied to flat reference, which is what drives a skill of flat reference to cover all its rungs. Goes thin either when that demand is missing or when **premature completion** cuts the step short.

_Avoid_: scope, effort, diligence, coverage

### Post-Completion Steps

The **steps** that follow the current step. Visible, they pull the agent forward into **premature completion** — the more it sees, the stronger the tug; the defence is to hide them by splitting the sequence of steps into two.

_Avoid_: horizon, fog of war, lookahead

### Premature Completion

_Failure mode._ Ending the current step before it is genuinely done, because the agent's attention slips to being done rather than to the work. A between-steps failure: it needs **steps** to occur — a skill with no steps that quits early isn't premature completion but thin **legwork** under an unmet demand. A tug-of-war between two forces: visible **post-completion steps** (the pull forward) and the **completion criterion**'s clarity (the resistance — a sharp, checkable bar holds; a vague one gives way). Fuzziness is the necessary condition: a sharp bound resists the pull no matter how many later steps are visible, so a step that never rushes needs no defending. Two levers hold a step that does, but reach for them in order: **sharpen the bound first** — it is local and cheap. Only when the criterion is irreducibly fuzzy _and_ you actually observe the rush do you **hide the later steps** — and hiding only works across a real context boundary (a user-invoked hand-off or a subagent dispatch; an inline model-invoked call leaves the later steps in context and clears nothing). One cause of thin legwork, but distinct from it: legwork can be thin even when a step runs to full completion.

_Avoid_: premature closure, the rush, rushing, shortcutting

### Negation

_Failure mode._ Steering by prohibition — telling the agent what _not_ to do — which drags the forbidden behaviour into context and makes it _more_ available, not less. _Don't think of an elephant_, and the elephant is all there is; _never write verbose comments_, and verbosity is the pattern the agent has just read. The negation is a weak modifier the strongly-activated concept overruns, so the ban half-reads as an instruction to do the thing. Its **leading word** is the _elephant_: whatever a prohibition names into the frame. Cure: prompt the **positive** — describe the target behaviour ("write one-line comments") so the banned one is never spoken. A prohibition earns its place only as a hard guardrail on a behaviour you cannot phrase positively; even then, pair it with the positive target so attention lands on what to do.

_Avoid_: ironic rebound, don't-prompting, the pink elephant

## Pruning

Keeping a skill lean — each remedy paired with the failure it cures.

### Single Source of Truth

The desired state where each meaning lives in exactly one authoritative place, so a change to the skill's behaviour is a change in one place. **Duplication** is its violation.

_Avoid_: home, canonical location

### Duplication

_Failure mode._ The same meaning given more than one **single source of truth**. It costs maintenance (change one place, you must change the others), costs tokens, and inflates prominence — repeating a meaning weights it on the ladder past its real rank. The accidental inverse of a **leading word**, which raises attention on purpose by repeating a token, never the meaning.

_Avoid_: repetition, redundancy

### Relevance

Whether a line still bears on what the skill does — the lens for what to keep. A line loses relevance either by never bearing on the task (mere exposition, or a **branch** that should be disclosed) or by going stale: drifting out of date as the behaviour or world it describes changes. Shorter skills are easier to keep relevant, because each line is cheaper to check. Distinct from **no-op**: relevance asks whether a line bears on the task, not whether it changes behaviour.

_Avoid_: load-bearing, staleness, freshness

### Sediment

_Failure mode._ Layers of old content that settle in a skill and are never cleared, because adding feels safe and removing feels risky — so stale and irrelevant lines accumulate and you must core down through them to find what is still live. The default fate of any skill without a pruning discipline; the slow erosion of **relevance**, as opposed to **duplication**'s repeated meaning.

_Avoid_: accretion, bloat, cruft, rot

### No-Op

_Failure mode._ An instruction that changes nothing because the model already does it by default — you pay load to tell the agent what it would do anyway. The test: does a line change behaviour versus the default? A line can be perfectly **relevant** and still be a no-op. The same priors that make a **leading word** free make a no-op worthless.

A leading word is a _technique_; No-Op is a _verdict_ on a line — and they cross. A leading word too weak to beat the default is a no-op (_be thorough_ when the agent is already thorough-ish), and the fix is a stronger word that passes the verdict (_relentless_), not a different technique. So the No-Op test — does it change behaviour versus the default? — is also how you grade whether a leading word is earning its repetitions. This is model-relative, not reader-relative: two people disagreeing over whether a line is a no-op disagree about the default, and settle it by running the skill, not by debate.

_Avoid_: redundant instruction, restating the obvious, belaboring
</file>

<file path="skills/productivity/writing-great-skills/SKILL.md">
---
name: writing-great-skills
description: Reference for writing and editing skills well — the vocabulary and principles that make a skill predictable.
disable-model-invocation: true
---

A skill exists to wrangle determinism out of a stochastic system. **Predictability** — the agent taking the same _process_ every run, not producing the same output — is the root virtue; every lever below serves it.

**Bold terms** are defined in [`GLOSSARY.md`](GLOSSARY.md); look them up there for the full meaning.

## Invocation

Two choices, trading different costs:

- A **model-invoked** skill keeps a **description**, so the agent can fire it autonomously _and_ other skills can reach it (you can still type its name too). It contributes to **context load** — the description sits in the window every turn. Mechanics: omit `disable-model-invocation`, and write a model-facing description with rich trigger phrasing ("Use when the user wants…, mentions…").
- A **user-invoked** skill strips the description from the agent's reach: only you, typing its name, can invoke it — and no other skill can. Zero context load, but it spends **cognitive load**: _you_ are the index that must remember it exists. Mechanics: set `disable-model-invocation: true`; the `description` becomes human-facing — a one-line summary, trigger lists stripped.

Pick model-invocation only when the agent must reach the skill on its own, or another skill must. If it only ever fires by hand, make it user-invoked and pay no context load.

When user-invoked skills multiply past what you can remember, that piled-up cognitive load is cured by a **router skill**: one user-invoked skill that names the others and when to reach for each.

## Writing the description

A model-invoked **description** does two jobs — state what the skill is, and list the **branches** that should trigger it. Every word increases **context load**, so a description earns even harder pruning than the body:

- **Front-load the skill's leading word** — the description is where it does its invocation work.
- **One trigger per branch.** Synonyms that rename a single branch are **duplication** — "build features using TDD … asks for test-first development" is one branch written twice. Collapse them; keep only genuinely distinct branches.
- **Cut identity that's already in the body.** Keep the description to triggers, plus any "when another skill needs…" reach clause.

## Information hierarchy

A skill is built from two content types — **steps** and **reference** — that mix freely: a skill can be all steps, all reference, or both. The core decision is which to use and where each sits on the **information hierarchy**, a ladder ranked by how immediately the agent needs the material:

1. **In-skill step** — an ordered action in `SKILL.md`, the primary tier: what the agent does, in order. Each step ends on a **completion criterion**, the condition that tells the agent the work is done. Make it _checkable_ (can the agent tell done from not-done?) and, where it matters, _exhaustive_ ("every modified model accounted for", not "produce a change list") — a vague criterion invites **premature completion**.
2. **In-skill reference** — a definition, rule, or fact in `SKILL.md`, consulted on demand. Often a legitimately flat peer-set (every rule of a review on one rung) — a fine arrangement, not a smell. _This skill is all reference._
3. **External reference** — reference pushed out of `SKILL.md` into a separate file, reached by a **context pointer**, loaded only when the pointer fires. (Spans _disclosed_ reference — a sibling file like `GLOSSARY.md`, still part of the skill — through fully **external reference** that lives outside the skill system and any skill can point at.)

A demanding completion criterion drives thorough **legwork** — the digging the agent does within the work — whether the skill has steps or not, since "every rule applied" binds flat reference just as "every step done" binds a sequence.

Push too little down and the top bloats; push too much and you hide material the agent actually needs. That tension is the whole decision.

**Progressive disclosure** is the move down the ladder — out of `SKILL.md` into a linked file — so the top stays legible. Mechanics: a linked `.md` file in the skill folder, named for what it holds (this skill discloses its full definitions to `GLOSSARY.md`). Some skills are used in more than one way, and each distinct way is a **branch** — different runs taking different paths through the skill. Branching is the cleanest disclosure test: inline what every branch needs, and push behind a pointer what only some branches reach. A **context pointer**'s _wording_, not its target, decides when and how reliably the agent reaches the material.

Where the ladder decides _how far down_ a piece sits, **co-location** decides _what sits beside it_ once there: keep a concept's definition, rules, and caveats under one heading rather than scattered, so reading one part brings its neighbours with it.

## When to split

**Granularity** is how finely you divide skills, and each cut spends one of the two loads, so split only when the cut earns it. Two cuts:

- **By invocation** — split off a **model-invoked** skill when you have a distinct **leading word** that should trigger it on its own, or another skill must reach it. You pay **context load** for the new always-loaded **description**, so that independent reach has to be worth it.
- **By sequence** — split a run of **steps** when the steps still ahead (a step's **post-completion steps**) tempt the agent to rush the one in front of it (**premature completion**). Keeping them out of view encourages the agent to do more **legwork** on the current task.

## Pruning

Keep each meaning in a **single source of truth**: one authoritative place, so changing the behaviour is a one-place edit.

Check every line for **relevance**: does it still bear on what the skill does?

Then hunt **no-ops** sentence by sentence, not just line by line: run the no-op test on each sentence in isolation, and when one fails, delete the whole sentence rather than trim words from it. Be aggressive — most prose that fails should go, not be rewritten.

## Leading words

A **leading word** is a compact concept already living in the model's pretraining that the agent thinks with while running the skill (e.g. _lesson_, _fog of war_, _tracer bullets_). Repeated throughout the text (though not necessarily - a strong leading word might only be needed once), it accumulates a distributed definition and anchors a whole region of behaviour in the fewest tokens, by recruiting priors the model already holds.

It serves predictability twice. In the body it anchors _execution_: the agent reaches for the same behaviour every time the word appears. In the description it anchors _invocation_: when the same word lives in your prompts, docs, and code, the agent links that shared language to the skill and fires it more reliably.

Hunt for opportunities to refactor skills to use leading words. A triad spelled out at three sites (**duplication**), a description spending a sentence to gesture at one idea — each is a passage begging to **collapse** into a single token. Examples include:

- "fast, deterministic, low-overhead" -> _tight_ — one quality restated across a phase — into a single pretrained word (a _tight_ loop).
- "a loop you believe in" -> _red_ — converts a fuzzy gate into a binary observable state (the loop goes _red_ on the bug, or it doesn't).

You win twice over: fewer tokens, _and_ a sharper hook for the agent to hang its thinking on. Assume every skill is carrying restatements that leading words retire — go find them.

## Failure modes

Use these to diagnose issues the user may be having with the skill.

- **Premature completion** — ending a step before it's genuinely done, attention slipping to _being done_. Defence, in order: sharpen the completion criterion first (cheap, local); only if it is irreducibly fuzzy _and_ you observe the rush, hide the post-completion steps by splitting (the sequence cut).
- **Duplication** — the same meaning in more than one place. Costs maintenance and tokens, and inflates a meaning's prominence on the ladder past its real rank.
- **Sediment** — stale layers that settle because adding feels safe and removing feels risky. The default fate of any skill without a pruning discipline.
- **Sprawl** — a skill simply too long, even when every line is live and unique. Hurts readability and maintainability and wastes tokens. The cure is the ladder: disclose **reference** behind pointers, and split by **branch** or sequence so each path carries only what it needs.
- **No-op** — a line the model already obeys by default, so you pay load to say nothing. The test: does it change behaviour versus the default? A weak leading word (_be thorough_ when the agent is already thorough-ish) is a no-op; the fix is a stronger word (_relentless_), not a different technique.
- **Negation** — steering by prohibition backfires: _don't think of an elephant_ names the elephant and makes it more available, not less. Prompt the **positive** — state the target behaviour so the banned one is never spoken; keep a prohibition only as a hard guardrail you can't phrase positively, and even then pair it with what to do instead.
</file>

<file path="skills/productivity/README.md">
# Productivity

General workflow tools, not code-specific.

## User-invoked

Reachable only when you type them (Claude Code: `disable-model-invocation: true`; Codex: `policy.allow_implicit_invocation: false` in `agents/openai.yaml`).

- **[grill-me](./grill-me/SKILL.md)** — Get relentlessly interviewed about a plan or design until every branch of the decision tree is resolved.
- **[handoff](./handoff/SKILL.md)** — Compact the current conversation into a handoff document so another agent can continue the work.
- **[teach](./teach/SKILL.md)** — Teach the user a new skill or concept over multiple sessions, using the current directory as a stateful teaching workspace.
- **[writing-great-skills](./writing-great-skills/SKILL.md)** — Reference for writing and editing skills well: the vocabulary and principles that make a skill predictable.

## Model-invoked

Model- or user-reachable (rich trigger phrasing so the model can reach for them).

- **[grilling](./grilling/SKILL.md)** — Interview the user relentlessly about a plan, decision, or idea until every branch of the decision tree is resolved.
</file>

<file path=".gitignore">
node_modules
</file>

<file path="CHANGELOG.md">
# mattpocock-skills

## 1.1.0

### Minor Changes

- [#406](https://github.com/mattpocock/skills/pull/406) [`930a450`](https://github.com/mattpocock/skills/commit/930a450089f77a49af09001d955db8452a4b867d) Thanks [@mattpocock](https://github.com/mattpocock)! - Bring the **`ask-matt`** router up to date with the full skill set. It now maps five skills it was missing: **`tdd`** (woven into the main flow as the red-green engine `implement` drives), **`diagnosing-bugs`** (a new "Something's broken" on-ramp — there was previously no route for a bug), **`domain-modeling`** and **`codebase-design`** (a new "Vocabulary underneath" section), and **`grilling`** (the shared interview primitive). `prototype` is fleshed out as a standalone and the description broadens from "user-invoked skills" to "the skills". A maintenance rule is added to `CLAUDE.md` so any future skill add/rename/remove or flow change triggers an `ask-matt` re-check, beside the existing docs-page re-sync rule.

- [#464](https://github.com/mattpocock/skills/pull/464) [`639df6e`](https://github.com/mattpocock/skills/commit/639df6e7386dfddc739b2aecdeff37a876f2483b) Thanks [@mattpocock](https://github.com/mattpocock)! - Promote and harden **`code-review`**. The in-progress **`review`** skill is renamed to **`code-review`** and moved from `in-progress/` into `engineering/`: it now ships in the plugin, is listed in the top-level and Engineering READMEs (Model-invoked), and has a docs page at `docs/engineering/code-review.md`. The `/implement` skill and docs point at `/code-review`.

  It also gains an always-on **Fowler smell baseline** on its Standards axis — a curated ~12 high-signal "Bad Smells in Code" (Mysterious Name, Duplicated Code, Feature Envy, Data Clumps, Primitive Obsession, Repeated Switches, Shotgun Surgery, Divergent Change, Speculative Generality, Message Chains, Middle Man, Refused Bequest) inlined into `SKILL.md` as a fixed baseline alongside whatever the repo documents, not a new third axis. Two binding rules keep it safe: a documented repo standard overrides the baseline, and every smell is reported as a judgement call, never a hard violation.

- [#464](https://github.com/mattpocock/skills/pull/464) [`639df6e`](https://github.com/mattpocock/skills/commit/639df6e7386dfddc739b2aecdeff37a876f2483b) Thanks [@mattpocock](https://github.com/mattpocock)! - Sharpen **`grilling`** on two fronts.

  **A confirmation gate.** The agent won't enact the plan until you confirm the shared understanding has been reached — turning the skill's existing "shared understanding" completion criterion into an explicit stop-gate. The `description` also recruits the pretrained **`grill`** leading word ("Grill the user relentlessly") to sharpen invocation, and the docs page is re-synced.

  **Facts vs. decisions.** Grilling now splits _facts_ (look them up — explore the codebase) from _decisions_ (put each one to the human and wait for their answer). The old blanket line — "if a question can be answered by exploring the codebase, explore the codebase instead" — was written for the live-human case, but once another skill runs grilling inside a resolve-the-ticket frame it read as license to answer _decisions_ autonomously too. Separating the two keeps a grilling agent from racing ahead and answering its own questions.

- [#463](https://github.com/mattpocock/skills/pull/463) [`af6d692`](https://github.com/mattpocock/skills/commit/af6d6922c3e2b5288eef155346cbe319e4ed3bd0) Thanks [@mattpocock](https://github.com/mattpocock)! - Add two adjacent Steering failure modes to **`writing-great-skills`**, both about how language you think of as "off" still steers the agent. **Negation** — the _elephant_ — is steering by prohibition: naming what _not_ to do drags the forbidden behaviour into context and makes it _more_ available, not less (_don't think of an elephant_), so the cure is to prompt the **positive**. **Negative Space** — the void — is blindness to the steering done by what you leave _out_: every decision a skill declines is delegated to the agent's priors rather than left neutral, so the cure is to read a draft for its silences and decide each omission deliberately (fill it, or leave it open as a real **branch**). Kept as two entries, not one — they carry different diagnostics and different cures — each a full `GLOSSARY.md` entry plus a `SKILL.md` failure-mode bullet, matching how every other failure mode is carried.

- [`850873c`](https://github.com/mattpocock/skills/commit/850873cd73d5f81826ebf512ad35d2b1e113001f) Thanks [@mattpocock](https://github.com/mattpocock)! - Make the **`prototype`** skill model-invoked, so the agent can reach for it autonomously (and other skills can too). Its description is rewritten around the leading word _prototype_ — throwaway code that answers a design question — with one trigger per branch (state/logic sanity-check, or UI exploration).

- [#409](https://github.com/mattpocock/skills/pull/409) [`0d74d01`](https://github.com/mattpocock/skills/commit/0d74d01cbc64ca27778a49b38599f70c534e76a0) Thanks [@mattpocock](https://github.com/mattpocock)! - Add the **`research`** skill — a small, model-invoked skill that spins up a **background agent** to investigate a question against **primary sources** (official docs, source code, specs, first-party APIs), then leaves a single cited Markdown file wherever the repo keeps such notes. It's delegable reading legwork: you keep working while it reads, and get back a document to grill, plan, or design against. Listed in the top-level and Engineering READMEs (Model-invoked), added to `.claude-plugin/plugin.json`, given a docs page at `docs/engineering/research.md`, and routed as a Standalone in `ask-matt`.

- [#469](https://github.com/mattpocock/skills/pull/469) [`a0329ba`](https://github.com/mattpocock/skills/commit/a0329ba95751f58566ed7ab484475917a68f1629) Thanks [@mattpocock](https://github.com/mattpocock)! - Split the **`to-issues`** skill into a lean **Process** and a **Reference** section, and teach it to handle a **wide refactor** — a single mechanical change (like renaming a column) whose **blast radius** fans across the whole codebase, breaking thousands of call sites at once so no vertical slice can land green. The drafting step now points at two co-located reference blocks: the **Vertical slice rules** for ordinary tracer bullets, and **Wide refactors**, which slices the change by **expand–contract** (expand the new form beside the old, migrate call sites in batches sized by blast radius, then contract the old form away) so CI stays green batch to batch — or, when it can't, only at a final integrate-and-verify issue. The issue body template moves into Reference too.

- [#464](https://github.com/mattpocock/skills/pull/464) [`386d4ff`](https://github.com/mattpocock/skills/commit/386d4ff719a7c420ad1454232d0436b01f1b8c17) Thanks [@mattpocock](https://github.com/mattpocock)! - Unify the planning skills. **`to-prd` is renamed to `to-spec`** — "spec" is now the single through-line term (it still opens with "you may know this document as a PRD" for discoverability). **`to-plan` and `to-issues` are merged into one `to-tickets` skill, and `to-issues` is deleted.**

  `to-tickets` breaks a plan, spec, or conversation into a set of **tickets** — tracer-bullet vertical slices, each declaring its **blocking edges**. That one artifact reads two ways depending on the tracker `/setup-matt-pocock-skills` configured: a **local file** (`tickets.md`) writes the edges as text and you work it top-to-bottom by hand; a **real tracker** writes them as native blocking links, so any ticket whose blockers are done is on the frontier and several agents can run at once. The edges live in the ticket either way — the medium only decides whether anything acts on them in parallel.

  Publishing prefers the tracker's **native sub-issues** for parent → slice and **native blocking edges** for `Blocked by` where the tracker supports them, keeping the `## Parent` / `## Blocked by` body sections as the fallback. The "What to build" template points at where a `/prototype`'s code lives rather than inlining a snippet from it.

  `ask-matt`'s main flow now routes `idea → /to-spec → /to-tickets → /implement`, and there are human-facing docs pages at `docs/engineering/to-spec.md` and `docs/engineering/to-tickets.md`.

- [#464](https://github.com/mattpocock/skills/pull/464) [`0557d57`](https://github.com/mattpocock/skills/commit/0557d57579d9b3d39839fdaf8d4a6542b17539ce) Thanks [@mattpocock](https://github.com/mattpocock)! - Settle wayfinder's place in the docs as a **situational on-ramp**, not the new main entry flow — the grill-led _idea → ship_ chain stays the front door (crowning wayfinder as the default spine is a v2-sized move, not a 1.1). The **`ask-matt`** router now names wayfinder's concrete triggers — a greenfield project or a huge feature build, too big for one session — and the two grill front doors (**`grill-me`**, **`grill-with-docs`**) signpost _up_ to wayfinder for the effort that's too big to hold in one session, so the on-ramp is discoverable from where a reader actually starts.

- [#464](https://github.com/mattpocock/skills/pull/464) [`639df6e`](https://github.com/mattpocock/skills/commit/639df6e7386dfddc739b2aecdeff37a876f2483b) Thanks [@mattpocock](https://github.com/mattpocock)! - Graduate and reframe **`wayfinder`** — the skill for planning a huge chunk of work, more than one agent session can hold. It moves out of `in-progress/` into `engineering/` (plugin entry, top-level + Engineering READMEs under **User-invoked**, a docs page at `docs/engineering/wayfinder.md`, and a route in `ask-matt`), landing as a mature skill. The rename and reframe that got it there:

  - **`decision-mapping` is renamed to `wayfinder`**, invoked as `/wayfinder`. "Decision map" was jargony and inaccurate — only one ticket type is actually a decision. The reframe charts a route through a foggy problem instead, giving one coherent leading-word frame — **fog of war**, **frontier**, **the map** — rather than an invented term layered on top.
  - **Destination as the leading word.** Wayfinding finds the _way_ to a destination; it doesn't charge at building it. Naming the destination is the first act of charting — it fixes the scope and shapes every ticket — so the map gains a `## Destination` field every session orients to, and triage pins it before any ticket exists.
  - **Plan, don't do.** The map produces **decisions, not deliverables**; it's done when nothing is left to decide before someone builds the thing. An effort can override this in its Notes.
  - **The map is an index, not a store.** A decision lives in exactly one place — its ticket — so the map only gists and links, never restates; graduating fog into a ticket clears the graduated patch so nothing lingers in two places.
  - **Collaborative by default.** The map moves off a local Markdown file onto the repo's issue tracker: a single `wayfinder:map` issue whose tickets are its child issues — one shared URL the team can watch. Sessions load the map at low resolution and zoom into tickets on demand. Wayfinder stays tracker-agnostic (GitHub, GitLab, local-markdown) behind a pointer in `docs/agents/issue-tracker.md`, and `setup-matt-pocock-skills` seeds the "Wayfinding operations" section.
  - **Claim by assignment, not a label.** A session claims a ticket by assigning it to the driving dev — the assignee _is_ the claim — freeing the label vocabulary to `wayfinder:<type>` alone.
  - **Native blocking.** Blocking prefers the tracker's native dependency relationship, which renders the frontier visually in the tracker's own UI so the human sees what's takeable without opening the map. GitHub and GitLab templates spell out the native recipe, with a body-convention fallback.
  - **Fog vs. out of scope, split.** Two plainly-named map sections — `## Not yet specified` (in-scope fog that graduates as the frontier advances) and `## Out of scope` (work ruled beyond the destination, closed, never graduating) — so beyond-destination work no longer reads as takeable frontier.
  - **A fourth `task` ticket type.** For literal manual work that blocks a decision (provisioning access, moving data, signing up for a service) — the one type that _does_ rather than decides, earning its place by unblocking a decision.
  - **HITL / AFK ticket classification.** Every ticket type is **HITL** (human in the loop — grilling, prototype) or **AFK** (agent alone — research; task is either). A HITL ticket only resolves through the live exchange, so "wait for the human" falls out of the label — a grilling agent that answers its own questions has, by definition, broken HITL. (This fixes students' reports of `/wayfinder` grilling _itself_ instead of the human.)
  - **No-fog early exit restored.** If the opening breadth-first grilling surfaces no fog, the journey is small enough for one session — so it stops and asks how you'd like to proceed rather than building a map nobody needs.

### Patch Changes

- [#464](https://github.com/mattpocock/skills/pull/464) [`639df6e`](https://github.com/mattpocock/skills/commit/639df6e7386dfddc739b2aecdeff37a876f2483b) Thanks [@mattpocock](https://github.com/mattpocock)! - Reshape **`tdd`** into a reference-only skill and add a missing anti-pattern.

  **Reference-only.** The red → green → refactor loop is anchored by leading words the model already holds, so the step-by-step Workflow was largely restating the loop. Dropped the Workflow and per-cycle checklist; folded their one durable idea — vertical slices / tracer bullets — into the Anti-patterns section and a short Rules-of-the-loop list. Introduced **seam** as the leading word for where tests go: test only at pre-agreed seams, confirmed with the user before any test is written. Also dropped the refactor stage — TDD is now red → green; refactoring belongs to the review stage, so the refactor rule and `refactoring.md` moved out (its home is `code-review`).

  **Tautological tests.** Added the tautological-test anti-pattern: a test whose assertion is recomputed the way the code computes it passes by construction and gives zero confidence — distinct from the implementation-coupling anti-pattern already covered. Added as a peer at the same sites: a Philosophy principle (expected values must come from an independent source of truth), a checklist gate, and a BAD/GOOD example pair in `tests.md`.

- [`e00eadb`](https://github.com/mattpocock/skills/commit/e00eadb4bb32c3d5a631ead1a5ed5d6a7c5f74e2) Thanks [@mattpocock](https://github.com/mattpocock)! - Extend the **`triage`** skill to triage external pull requests, treating a PR as an issue with attached code that runs through the same roles and state machine. PRs flow inline alongside issues (gated by a per-repo setup toggle), discovery surfaces only external PRs, the bug-only "reproduce" step is generalized into a single "verify the claim" step, and a redundancy check resolves already-implemented requests to `wontfix` without polluting the out-of-scope knowledge base. `setup-matt-pocock-skills` gains the PRs-as-a-request-surface toggle for GitHub/GitLab.

- [#472](https://github.com/mattpocock/skills/pull/472) [`d869d45`](https://github.com/mattpocock/skills/commit/d869d45afc32beab1c2d1350f8de5e81589512cd) Thanks [@mattpocock](https://github.com/mattpocock)! - Fix **`wayfinder`** hardcoding the issue-tracker doc path, which broke the indirection the rest of the suite relies on.

  `to-issues`, `to-prd`, and `triage` never name a path — they resolve the tracker through the `### Issue tracker` block that `setup-matt-pocock-skills` writes into `CLAUDE.md` / `AGENTS.md`, which points at the tracker doc wherever it lives. Wayfinder instead pinned the literal `docs/agents/issue-tracker.md`, so in a repo that keeps its agent docs elsewhere it silently fell back to the local-markdown tracker — even one whose `CLAUDE.md` clearly declares GitHub issues. It now resolves the doc via that same pointer and reads its "Wayfinding operations" section by name, keeping the indirection consistent across the suite.

## 1.0.1

### Patch Changes

- [`d20ee26`](https://github.com/mattpocock/skills/commit/d20ee2684e2a9442698ac3c1e0f2c5b68c4cf296) Thanks [@mattpocock](https://github.com/mattpocock)! - Make the **`teach`** skill reuse-first. Lessons are now built from reusable **components** in `./assets/` — stylesheets, quiz widgets, simulators, diagram helpers. Reuse is the default: the agent reads `./assets/` before authoring a lesson, builds from what's there, and extracts anything new and reusable into a component rather than inlining it.

## 1.0.0

### Major Changes

- [`47bde84`](https://github.com/mattpocock/skills/commit/47bde84da032afb2e5058f997f3bbca47d321dbd) Thanks [@mattpocock](https://github.com/mattpocock)! - Add the **`ask-matt`** skill — a user-invoked router that points you at the right skill or flow for your situation.

  **Breaking:** `ask-matt` routes over the other user-invoked skills in this repo, so it expects them to be installed.

- [`47bde84`](https://github.com/mattpocock/skills/commit/47bde84da032afb2e5058f997f3bbca47d321dbd) Thanks [@mattpocock](https://github.com/mattpocock)! - Add the shared design skills and rewire existing skills onto them.

  - New **`codebase-design`** skill — the deep-module vocabulary (module, interface, depth, seam, adapter) and the principles for putting a lot of behaviour behind a small interface. The language that previously lived in `improve-codebase-architecture/LANGUAGE.md` now lives here, generalized for reuse across skills.
  - New **`domain-modeling`** skill — actively build and sharpen a project's domain model, stress-testing terms against the glossary and keeping `CONTEXT.md` and ADRs current.
  - `improve-codebase-architecture` now draws its architecture vocabulary from `/codebase-design` and its domain model from `/domain-modeling`.
  - `tdd` now leans on `/codebase-design` for interface-design guidance — its inline `deep-modules.md` / `interface-design.md` notes were removed in favour of the shared skill.
  - `grill-with-docs` now builds the domain model inline via `/domain-modeling`.

  **Breaking:** these skills now depend on the new `codebase-design` / `domain-modeling` skills, so you must install them too.

- [`47bde84`](https://github.com/mattpocock/skills/commit/47bde84da032afb2e5058f997f3bbca47d321dbd) Thanks [@mattpocock](https://github.com/mattpocock)! - Remove the **`caveman`** and **`zoom-out`** skills.

  - `caveman` was a duplicate of another skill I was testing and was never meant to be public.
  - `zoom-out` went unused in practice, so it's been removed from the repo.

  **Breaking:** both skills have been removed.

- [`47bde84`](https://github.com/mattpocock/skills/commit/47bde84da032afb2e5058f997f3bbca47d321dbd) Thanks [@mattpocock](https://github.com/mattpocock)! - Rename the **`diagnose`** skill to **`diagnosing-bugs`**.

  **Breaking:** invoke it as `/diagnosing-bugs` — the old `/diagnose` name no longer exists.

- [`47bde84`](https://github.com/mattpocock/skills/commit/47bde84da032afb2e5058f997f3bbca47d321dbd) Thanks [@mattpocock](https://github.com/mattpocock)! - Replace **`write-a-skill`** with **`writing-great-skills`**.

  - Removed `write-a-skill`.
  - Added `writing-great-skills` (plus its `GLOSSARY.md`) — a reference for writing and editing skills well: the vocabulary and principles that make a skill predictable, hunting no-ops down to the sentence level.
  - Exposed `grilling` as a model-invoked skill — the reusable interview loop behind `grill-me` and `grill-with-docs`.

  **Breaking:** `write-a-skill` has been removed; use `writing-great-skills` instead.

### Minor Changes

- [`47bde84`](https://github.com/mattpocock/skills/commit/47bde84da032afb2e5058f997f3bbca47d321dbd) Thanks [@mattpocock](https://github.com/mattpocock)! - Add the **`resolving-merge-conflicts`** skill — a loop for resolving an in-progress git merge or rebase conflict. Standalone, with no dependencies on other skills.

- [`47bde84`](https://github.com/mattpocock/skills/commit/47bde84da032afb2e5058f997f3bbca47d321dbd) Thanks [@mattpocock](https://github.com/mattpocock)! - Rename the skill taxonomy from **Commands / Skills** to **User-invoked / Model-invoked** across the docs, and add `docs/invocation.md` defining the split: user-invoked skills are reachable only when you type them and exist to orchestrate; model-invoked skills can also be reached automatically when the task fits. A user-invoked skill may invoke model-invoked skills, but never another user-invoked one.

### Patch Changes

- [`47bde84`](https://github.com/mattpocock/skills/commit/47bde84da032afb2e5058f997f3bbca47d321dbd) Thanks [@mattpocock](https://github.com/mattpocock)! - Tighten the **`review`** skill: fail-fast ref check, single-sourced rules, and no-op cuts.
</file>

<file path="CLAUDE.md">
Skills are organized into bucket folders under `skills/`:

- `engineering/` — daily code work
- `productivity/` — daily non-code workflow tools
- `misc/` — kept around but rarely used, not promoted
- `personal/` — tied to my own setup, not promoted
- `in-progress/` — drafts not yet ready to ship
- `deprecated/` — no longer used

Every skill in `engineering/` or `productivity/` (the **promoted** buckets) must have a reference in the top-level `README.md` and an entry in `.claude-plugin/plugin.json`'s `skills` array (the Claude Code plugin ships exactly the promoted set). Skills in `misc/`, `personal/`, `in-progress/`, and `deprecated/` must not appear in either.

The repo is also its own single-plugin Claude Code marketplace: `.claude-plugin/marketplace.json` lists the one `mattpocock-skills` plugin. When bumping the release version, keep `.claude-plugin/plugin.json`'s `version` in sync with `package.json`'s — Claude uses the plugin `version` to decide when installed users see an update. Run `claude plugin validate . --strict` after touching either manifest. Why a Claude plugin but not (yet) a Codex one lives in [.agents/adr/0002-ship-as-a-claude-code-plugin.md](./.agents/adr/0002-ship-as-a-claude-code-plugin.md).

Each skill entry in the top-level `README.md` must link the skill name to its `SKILL.md`.

Each bucket folder has a `README.md` that lists every skill in the bucket with a one-line description, with the skill name linked to its `SKILL.md`. The promoted buckets' `README.md`s and the top-level `README.md` group entries into **User-invoked** and **Model-invoked**; non-promoted bucket `README.md`s (`misc/`, `personal/`) use a flat list.

Skills in `engineering/` and `productivity/` also have a human-facing docs page at `docs/<bucket>/<skill-name>.md` (the docs tree mirrors those two bucket folders under `skills/`). The published URL is `https://aihero.dev/skills-<skill-name>` regardless of bucket — the docs path is repo organisation only. When you add, rename, or change the behaviour of a skill in `engineering/` or `productivity/`, create or re-sync its docs page following [.agents/writing-docs.md](./.agents/writing-docs.md). Skills in the non-promoted buckets (`misc/`, `personal/`, `in-progress/`, `deprecated/`) get **no** docs page.

Every `SKILL.md` is either user-invoked (`disable-model-invocation: true` plus `policy.allow_implicit_invocation: false` in `agents/openai.yaml`, reachable only by the human) or model-invoked (model- or user-reachable). See [.agents/invocation.md](./.agents/invocation.md).

[`ask-matt`](./skills/engineering/ask-matt/SKILL.md) is the router that maps every user-reachable skill and how they relate. The same trigger that re-syncs a docs page applies to it: whenever you add, rename, remove, or change how a user-reachable skill fits the flows, re-read `ask-matt`'s `SKILL.md` and update it so the map stays accurate — a new skill it never mentions, or a stale one it still routes to, is a router that lies.

To (re)link every skill into the local harness skill directories (`~/.claude/skills`, `~/.agents/skills`), run `scripts/link-skills.sh`. Each entry is a symlink into this repo, so a `git pull` keeps installed skills current; re-run the script after adding, removing, or renaming a skill.
</file>

<file path="CONTEXT.md">
# Matt Pocock Skills

A collection of agent skills (slash commands and behaviors) loaded by Claude Code. Skills are organized into buckets and consumed by per-repo configuration emitted by `/setup-matt-pocock-skills`.

## Language

**Issue tracker**:
The tool that hosts a repo's issues — GitHub Issues, Linear, a local `.scratch/` markdown convention, or similar. Skills like `to-tickets`, `to-spec`, `triage`, and `qa` read from and write to it.
_Avoid_: backlog manager, backlog backend, issue host

**Issue**:
A single tracked unit of work inside an **Issue tracker** — a bug, task, spec, or slice produced by `to-tickets`.
_Avoid_: ticket (use only when quoting external systems that call them tickets, or for a **Decision ticket** — see below)

**Decision ticket**:
A `wayfinder` unit — a child **Issue** of a `wayfinder:map` holding a *question* whose resolution is a decision, not a slice of a build to execute. The **decision** qualifier is what keeps it distinct from an implementation ticket; `wayfinder` introduces the term, then uses "ticket".

**Triage role**:
A canonical state-machine label applied to an **Issue** during triage (e.g. `needs-triage`, `ready-for-afk`). Each role maps to a real label string in the **Issue tracker** via `docs/agents/triage-labels.md`.

## Relationships

- An **Issue tracker** holds many **Issues**
- An **Issue** carries one **Triage role** at a time
- A **Decision ticket** is an **Issue** (a child of a `wayfinder:map`)

## Flagged ambiguities

- "backlog" was previously used to mean both the *tool* hosting issues and the *body of work* inside it — resolved: the tool is the **Issue tracker**; "backlog" is no longer used as a domain term.
- "backlog backend" / "backlog manager" — resolved: collapsed into **Issue tracker**.
</file>

<file path="LICENSE">
MIT License

Copyright (c) 2026 Matt Pocock

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</file>

<file path="package.json">
{
  "name": "mattpocock-skills",
  "version": "1.1.0",
  "private": true,
  "description": "Matt Pocock's agent skills for real engineering",
  "repository": {
    "type": "git",
    "url": "https://github.com/mattpocock/skills"
  },
  "license": "MIT",
  "scripts": {
    "changeset": "changeset",
    "version": "changeset version"
  },
  "devDependencies": {
    "@changesets/changelog-github": "^0.7.0",
    "@changesets/cli": "^2.30.0"
  },
  "packageManager": "npm@10.9.4"
}
</file>

<file path="README.md">
<p>
  <a href="https://www.aihero.dev/s/skills-newsletter">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://res.cloudinary.com/total-typescript/image/upload/v1777382277/skills-repo-dark_2x.png">
      <source media="(prefers-color-scheme: light)" srcset="https://res.cloudinary.com/total-typescript/image/upload/v1777382277/skill-repo-light_2x.png">
      <img alt="Skills" src="https://res.cloudinary.com/total-typescript/image/upload/v1777382277/skill-repo-light_2x.png" width="369">
    </picture>
  </a>
</p>

# Skills For Real Engineers

[![skills.sh](https://skills.sh/b/mattpocock/skills)](https://skills.sh/mattpocock/skills)

My agent skills that I use every day to do real engineering - not vibe coding.

Developing real applications is hard. Approaches like GSD, BMAD, and Spec-Kit try to help by owning the process. But while doing so, they take away your control and make bugs in the process hard to resolve.

These skills are designed to be small, easy to adapt, and composable. They work with any model. They're based on decades of engineering experience. Hack around with them. Make them your own. Enjoy.

If you want to keep up with changes to these skills, and any new ones I create, you can join ~60,000 other devs on my newsletter:

[Sign Up To The Newsletter](https://www.aihero.dev/s/skills-newsletter)

## Installation (30-second setup)

Two ways in, two philosophies. **The [Claude Code plugin](https://code.claude.com/docs/en/plugins)** installs the whole set as a managed, read-only bundle that updates when I ship — you subscribe rather than fork. **[skills.sh](https://skills.sh/mattpocock/skills)** copies editable skill files into your project, so you can hack on them and make them your own. Pick one — installing both leaves you with every skill twice.

### 1. Get the skills

<details>
<summary><strong>Claude Code</strong></summary>

```bash
claude plugins install mattpocock-skills
```

Or, from inside a session:

```
/plugin install mattpocock-skills
```

It's in Claude Code's official marketplace, so there's nothing to add first, and updates arrive automatically.

</details>

<details>
<summary><strong>Codex, and other agents</strong></summary>

```bash
npx skills@latest add mattpocock/skills
```

Pick the skills you want, and which coding agents to install them on. **The installer lets you choose which skills to take — make sure `setup-matt-pocock-skills` is one of them.**

A native Codex plugin is on the roadmap — see [`.agents/adr/0002-ship-as-a-claude-code-plugin.md`](./.agents/adr/0002-ship-as-a-claude-code-plugin.md).

</details>

<details>
<summary><strong>For tinkerers</strong></summary>

Use the same installer, on any agent — including Claude Code:

```bash
npx skills@latest add mattpocock/skills
```

It writes the skills into your repo as ordinary files you own and can edit. Nothing updates behind your back; pull my latest changes when you want them with `npx skills update`.

</details>

### 2. Run `/setup-matt-pocock-skills`

In your agent, run it once per repo. It will:

- Ask you which issue tracker you want to use (GitHub, Linear, or local files)
- Ask you what labels you apply to tickets when you triage them (`/triage` uses labels)
- Ask you where you want to save any docs we create

### 3. Bam - you're ready to go.

## Why These Skills Exist

I built these skills as a way to fix common failure modes I see with Claude Code, Codex, and other coding agents.

### #1: The Agent Didn't Do What I Want

> "No-one knows exactly what they want"
>
> David Thomas & Andrew Hunt, [The Pragmatic Programmer](https://www.amazon.co.uk/Pragmatic-Programmer-Anniversary-Journey-Mastery/dp/B0833F1T3V)

**The Problem**. The most common failure mode in software development is misalignment. You think the dev knows what you want. Then you see what they've built - and you realize it didn't understand you at all.

This is just the same in the AI age. There is a communication gap between you and the agent. The fix for this is a **grilling session** - getting the agent to ask you detailed questions about what you're building.

**The Fix** is to use:

- [`/grill-me`](./skills/productivity/grill-me/SKILL.md) - for non-code uses
- [`/grill-with-docs`](./skills/engineering/grill-with-docs/SKILL.md) - same as [`/grill-me`](./skills/productivity/grill-me/SKILL.md), but adds more goodies (see below)

These are my most popular skills. They help you align with the agent before you get started, and think deeply about the change you're making. Use them _every_ time you want to make a change.

### #2: The Agent Is Way Too Verbose

> With a ubiquitous language, conversations among developers and expressions of the code are all derived from the same domain model.
>
> Eric Evans, [Domain-Driven-Design](https://www.amazon.co.uk/Domain-Driven-Design-Tackling-Complexity-Software/dp/0321125215)

**The Problem**: At the start of a project, devs and the people they're building the software for (the domain experts) are usually speaking different languages.

I felt the same tension with my agents. Agents are usually dropped into a project and asked to figure out the jargon as they go. So they use 20 words where 1 will do.

**The Fix** for this is a shared language. It's a document that helps agents decode the jargon used in the project.

<details>
<summary>
Example
</summary>

Here's an example [`CONTEXT.md`](https://github.com/mattpocock/course-video-manager/blob/076a5a7a182db0fe1e62971dd7a68bcadf010f1c/CONTEXT.md), from my `course-video-manager` repo. Which one is easier to read?

- **BEFORE**: "There's a problem when a lesson inside a section of a course is made 'real' (i.e. given a spot in the file system)"
- **AFTER**: "There's a problem with the materialization cascade"

This concision pays off session after session.

</details>

This is built into [`/grill-with-docs`](./skills/engineering/grill-with-docs/SKILL.md). It's a grilling session, but that helps you build a shared language with the AI, and document hard-to-explain decisions in ADR's.

It's hard to explain how powerful this is. It might be the single coolest technique in this repo. Try it, and see.

> [!TIP]
> A shared language has many other benefits than reducing verbosity:
>
> - **Variables, functions and files are named consistently**, using the shared language
> - As a result, the **codebase is easier to navigate** for the agent
> - The agent also **spends fewer tokens on thinking**, because it has access to a more concise language

### #3: The Code Doesn't Work

> "Always take small, deliberate steps. The rate of feedback is your speed limit. Never take on a task that’s too big."
>
> David Thomas & Andrew Hunt, [The Pragmatic Programmer](https://www.amazon.co.uk/Pragmatic-Programmer-Anniversary-Journey-Mastery/dp/B0833F1T3V)

**The Problem**: Let's say that you and the agent are aligned on what to build. What happens when the agent _still_ produces crap?

It's time to look at your feedback loops. Without feedback on how the code it produces actually runs, the agent will be flying blind.

**The Fix**: You need the usual tranche of feedback loops: static types, browser access, and automated tests.

For automated tests, a red-green-refactor loop is critical. This is where the agent writes a failing test first, then fixes the test. This helps give the agent a consistent level of feedback that results in far better code.

I've built a **[`/tdd`](./skills/engineering/tdd/SKILL.md) skill** you can slot into any project. It encourages red-green-refactor and gives the agent plenty of guidance on what makes good and bad tests.

For debugging, I've also built a **[`/diagnosing-bugs`](./skills/engineering/diagnosing-bugs/SKILL.md)** skill that wraps best debugging practices into a simple loop.

### #4: We Built A Ball Of Mud

> "Invest in the design of the system _every day_."
>
> Kent Beck, [Extreme Programming Explained](https://www.amazon.co.uk/Extreme-Programming-Explained-Embrace-Change/dp/0321278658)

> "The best modules are deep. They allow a lot of functionality to be accessed through a simple interface."
>
> John Ousterhout, [A Philosophy Of Software Design](https://www.amazon.co.uk/Philosophy-Software-Design-2nd/dp/173210221X)

**The Problem**: Most apps built with agents are complex and hard to change. Because agents can radically speed up coding, they also accelerate software entropy. Codebases get more complex at an unprecedented rate.

**The Fix** for this is a radical new approach to AI-powered development: caring about the design of the code.

This is built in to every layer of these skills:

- [`/to-spec`](./skills/engineering/to-spec/SKILL.md) quizzes you about which modules you're touching before creating a spec

And crucially, [`/improve-codebase-architecture`](./skills/engineering/improve-codebase-architecture/SKILL.md) helps you rescue a codebase that has become a ball of mud. I recommend running it on your codebase once every few days.

### Summary

Software engineering fundamentals matter more than ever. These skills are my best effort at condensing these fundamentals into repeatable practices, to help you ship the best apps of your career. Enjoy.

## Reference

These split on one axis — who can invoke them. **User-invoked** skills are reachable only when you type them (e.g. `/grill-me`); their job is to orchestrate. **Model-invoked** skills can be invoked by you _or_ reached for automatically by the agent when the task fits; they hold the reusable discipline. A user-invoked skill may invoke model-invoked skills, but never another user-invoked one.

### Engineering

Skills I use daily for code work.

**User-invoked**

- **[ask-matt](./skills/engineering/ask-matt/SKILL.md)** — Ask which skill or flow fits your situation. A router over the user-invoked skills in this repo.
- **[grill-with-docs](./skills/engineering/grill-with-docs/SKILL.md)** — Grilling session that also builds your project's domain model, sharpening terminology and updating `CONTEXT.md` and ADRs inline.
- **[triage](./skills/engineering/triage/SKILL.md)** — Move issues through a state machine of triage roles.
- **[improve-codebase-architecture](./skills/engineering/improve-codebase-architecture/SKILL.md)** — Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick.
- **[setup-matt-pocock-skills](./skills/engineering/setup-matt-pocock-skills/SKILL.md)** — Configure this repo for the engineering skills (issue tracker, triage labels, domain doc layout). Run once per repo before using the other engineering skills.
- **[to-spec](./skills/engineering/to-spec/SKILL.md)** — Turn the current conversation into a spec and publish it to the issue tracker. No interview — just synthesizes what you've already discussed.
- **[to-tickets](./skills/engineering/to-tickets/SKILL.md)** — Break any plan, spec, or conversation into a set of tracer-bullet tickets, each declaring its blocking edges — written as text in a local file, or as native blocking links on a real tracker.
- **[implement](./skills/engineering/implement/SKILL.md)** — Build the work described by a spec or set of tickets, driving `/tdd` at pre-agreed seams and closing out with `/code-review` before committing.
- **[wayfinder](./skills/engineering/wayfinder/SKILL.md)** — Plan a huge chunk of work, more than one agent session can hold, as a shared map of investigation tickets on the issue tracker — resolve them one at a time until the way to the destination is clear.

**Model-invoked**

- **[prototype](./skills/engineering/prototype/SKILL.md)** — Build a throwaway prototype to answer a design question — a runnable terminal app for state/logic questions, or several radically different UI variations toggleable from one route.
- **[diagnosing-bugs](./skills/engineering/diagnosing-bugs/SKILL.md)** — Disciplined diagnosis loop for hard bugs and performance regressions: reproduce → minimise → hypothesise → instrument → fix → regression-test.
- **[research](./skills/engineering/research/SKILL.md)** — Investigate a question against high-trust primary sources and capture the findings as a cited Markdown file in the repo, run as a background agent.
- **[tdd](./skills/engineering/tdd/SKILL.md)** — Test-driven development with a red-green-refactor loop. Builds features or fixes bugs one vertical slice at a time.
- **[domain-modeling](./skills/engineering/domain-modeling/SKILL.md)** — Actively build and sharpen a project's domain model — challenge terms against the glossary, stress-test with edge-case scenarios, and update `CONTEXT.md` and ADRs inline.
- **[codebase-design](./skills/engineering/codebase-design/SKILL.md)** — Shared discipline and vocabulary for designing deep modules: a lot of behaviour behind a small interface, placed at a clean seam, testable through that interface.
- **[code-review](./skills/engineering/code-review/SKILL.md)** — Two-axis review of the diff since a fixed point: **Standards** (does it follow the repo's coding standards, plus a Fowler smell baseline?) and **Spec** (does it faithfully implement the originating issue/PRD?), run as parallel sub-agents so neither pollutes the other.
- **[resolving-merge-conflicts](./skills/engineering/resolving-merge-conflicts/SKILL.md)** — Work through an in-progress git merge or rebase conflict hunk by hunk, resolving by intent traced to each side's primary source, then finish the operation — never `--abort`.

### Productivity

General workflow tools, not code-specific.

**User-invoked**

- **[grill-me](./skills/productivity/grill-me/SKILL.md)** — Get relentlessly interviewed about a plan or design until every branch of the decision tree is resolved.
- **[handoff](./skills/productivity/handoff/SKILL.md)** — Compact the current conversation into a handoff document so another agent can continue the work.
- **[teach](./skills/productivity/teach/SKILL.md)** — Teach the user a new skill or concept over multiple sessions, using the current directory as a stateful teaching workspace.
- **[writing-great-skills](./skills/productivity/writing-great-skills/SKILL.md)** — Reference for writing and editing skills well: the vocabulary and principles that make a skill predictable.

**Model-invoked**

- **[grilling](./skills/productivity/grilling/SKILL.md)** — Interview the user relentlessly about a plan, decision, or idea until every branch of the decision tree is resolved. The reusable loop behind `grill-me` and `grill-with-docs`.
</file>

</files>
