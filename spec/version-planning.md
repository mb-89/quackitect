---
id: version-planning
statement: The planned iterations, the decisions behind them, and everything harvested from v1 and v2 — so no version has to be re-opened for planning again.
---

# Version planning

## What this file is, and why it is in git

This file holds the plan. An agent on another machine clones the repo, is told
"do iteration i8", and finds everything it needs here.

IT IS SELF-CONTAINED ON PURPOSE. Notes are machine-local and never committed,
so a note reference travels nowhere. Everything an iteration needs is written
out below.

IT IS TEMPORARY. Planning does not belong in version control (owner, 2026-08-12).
This file exists until the options pool lands — see i17 — and then it dissolves
into that.

i17 SHIPPED ON 2026-08-18, so the condition this file set for its own end has
come true. The pool stands at spec/trace/work-token/. Dissolving this
file into it is not done and is nobody's task yet; until somebody rules on it,
the sweep above keeps the file honest rather than pretending it is current.

## The mining rule

V1 AND V2 ARE MINED. Their planning content is here. Do not re-open either
version to plan work.

READING V1'S CODE IS DIFFERENT AND ENCOURAGED. When you build something v1
built, read how it did it. Everything in v1 is reachable through the lane at a
committed ref — `se_file_read`, `se_file_search` and `se_file_glob` all take
`ref`. `main` reaches v1, `v2` reaches v2. The v2 idea inventory also stands
whole at `V2-INVENTORY.md`.

V1 IS AN UNRELIABLE SOURCE (owner ruling 2026-08-12). v2 and v3 exist because
v1 did not work. A decision written down in v1 is evidence that v1 tried it,
nothing more. Mine it for FEATURES, never for authority.

---

# Part 1 — The standing decisions

Everything below was ruled on 2026-08-12 unless dated otherwise.

## D1 — the machine format

Obsidian stops being the editor. Truth stays markdown and other human-readable
files.

OBSIDIAN COMPATIBILITY IS A REQUIREMENT, not a habit. Every markdown we write
stays Obsidian-compatible where it makes sense. This wants a requirement row
minted, not a convention remembered.

STATE MACHINES BECOME PLANTUML FILES, in PlantUML syntax. We write our own
renderer, Cytoscape-based, the same way the trace graph renderer is.

`@plantuml/core` is UNDECIDED. The format is the decision; the renderer is
ours either way. We check whether to integrate the library when we get there.

THE DATABASE FORMAT: we write our own databases, reading files that are
Obsidian Bases compatible. We may extend the format — Obsidian falls back
gracefully on what it does not understand, and that is accepted.

## D2 — the autonomy ladder, and the numbers go

NUMERIC PRIORITIES ARE ABOLISHED. Not 0.01, not 0.1, not 0.2, not 0.8. The
words are the whole truth.

THE `priority:` TAG DOES NOT APPEAR IN STATE MACHINES ANY MORE. It is replaced
by the AUTONOMY LEVEL, named by its word. The tag is called `autonomy`.

THE 1.5 TIER BECOMES THE WORD `blocked`. The archives are person-only, and
`blocked` already means nothing moves without the person. Once the numbers are
gone and comparison is by rung ORDER, the old contradiction — `blocked` was 0
at the control end and 1.5 at the state end — disappears by construction.

### Every surviving numeric site, swept 2026-08-12

Six canvases carry a numeric machine-level priority:
`machines/boot.canvas` (0.01), `enumerate-space.canvas` (0.2),
`expeditions.canvas` (0.4), `ideation.canvas` (1),
`expedition_archive.canvas` (1.5), `iteration_archive.canvas` (1.5).

One canvas already uses the word: `machines/iterations.canvas` says
`"operational"`. That is the proof the migration is mechanical.

Engine-minted states, hard-coded numbers:
`engine/iterations.ts` lines 264, 273, 300, 342, 382, 646, 670, 696, 704, 1014;
`engine/expmachine.ts` lines 42, 149, 244, 299, 345, 361;
`engine/rigor-matrix.ts` lines 625, 662, 681;
`engine/session.ts` line 1780 — which mints at priority 0, and
`machines/scale.md` says no state is ever authored at 0.

Documentation: `guidance/authoring/machines.md` line 79 still documents the
range as "0.01 .. 1". `machines/scale.md` lines 45 to 51 carry the numbers as
transitional anchors.

Served payloads carry numbers on the wire: the pull's `options`, `se_survey`'s
`doors`, and the packet's `states`.

Three test files were pinned to the current numbers on 2026-08-12 and are
redone by this work: `threshold.test.ts`, `route.test.ts`, `editsafety.test.ts`.

## References — the glossary

A dependency is not only code. Documents, links, standards and vendored code
all go in ONE list, each with a VERSION. The thing is called a REFERENCE.

A reference is a NOTE CLASS with a TEMPLATE, in the same model of linked notes
as everything else. Build the template first; reference notes then reference it.

REFERENCES ARE NOT TRACE NODES. No id, no type, no upward edge, no place on the
spine. They live in a glossary beside the trace.

MOST OF IT ALREADY EXISTS. `spec/references/` holds 25 files carrying
title, url, kind, version, accessed and tags, plus a prose body. It already
spans the range: `ref-ieee-1016` (a standard, version 2009), `ref-agans-debugging`
(a book, 2002, no URL), `ref-claude-code-harness-study` (a web source, 2026-04).

WHAT IS MISSING: vendored code is not in it (mermaid and the TRIZ matrix have
no reference file); there is no `mode` field, so import and vendored are not two
modes of one declaration; no location field; no content hash; and nothing checks
a version against an upstream manifest.

A REFERENCE NODE RECORDS A CONTENT HASH of our vendored copy alongside the
version. The version answers whether upstream moved. The hash answers whether
somebody edited OUR copy — a rule enforced today by nothing but a code comment
at `engine/catalogs.ts` line 99.

DIVERGENCE AS BIT-DELTAS IS REJECTED. Compare MANIFESTS. If the last version
vendored in was 1.0 and the newest is 2.0, that is enough to decide.

VENDORING IN AND OUT BOTH PRODUCE REFERENCE NOTES, and the note points at where
the vendored copy sits.

THE FROZEN WINDOW COVERS REFERENCES. A new version of a standard is NOT adopted
mid-iteration. The iteration continues on the version it started with, and the
reference updates afterwards. Same input-process-output shape as everything else.

## Modules — qualified ids from day one

The module qualifier reaches INTO EVERY NODE ID. The current module is `se`,
so ids read `se.req-foo`. A second module, `tslib`, gives `tslib.req-bar`.
Presentation hides the qualifier while only one module exists.

Driving cases: a TypeScript library of generic code importable by another
project, and Benjamin the knowledge worker as a `kb` module.

THE ORDER IS LINT FIRST, ruled after v1's own warning. v1's
`raid-module-id-collisions` is still open and says: keep globally unique ids
and lint module prefixes BEFORE any composite identity change.

So: ONE iteration, TWO PHASES. The module-prefix lint lands first and passes
over the whole corpus. The composite rename then happens in the same walk,
with the lint as its gate.

CONSTRAINTS FROM V1, worth keeping: modules share one workspace iteration and
one ledger — they scope ownership and views, they do NOT create independent
timelines. Dotted ids give nesting without nested gates, nested ledgers or
nested iteration state.

## Claims are assumptions, cited by id

Not a source that can be referenced. A single CLAIM that can be referenced.

A claim is fundamentally an assumption — we assume it is right. It goes in the
register as `kind: assumption`, and other things cite THAT. When it turns out
false, everything built on it is visibly stale.

MOST OF IT IS BUILT. `spec/trace/raid/raid-corpus-stays-small.md` is exactly the
shape: kind assumption, an owner, a trigger, a probe, a probed date, and the
probe's result written back into the entry.

THE THREE GAPS: nothing forces a claim to cite an assumption; `source_refs` is
unchecked free text, so a citation can point at nothing
(`machines/trace-schema.md` lines 296 to 297 say so plainly); and nothing
computes the blast radius when an assumption's status flips.

THE CAVEAT, already written in `guidance/voice.md` and easy to lose: an
assertion about the system is CHECKABLE, so check it rather than citing it.
Only where the check is not cheap does the belief become a register entry.
A register that fills with what a test could have settled becomes a list
nobody reads.

BEST-BEFORE DATES ARE ADOPTED. Assumptions today carry an EVENT trigger only,
and `guidance/method/retro.md` step 5 sweeps DEBTS only. So an assumption whose
event never fires is never revisited. Give it a date beside the trigger and
sweep assumptions the way debts are swept.

## The blast radius — we have the policy, not the computation

Change a requirement and everything downstream is in the radius. Change a state
high in a machine and everything below it is. Change a decision or a claim and
everything under it is.

Our contract's `recheck` block already states the POLICY — read what is written,
ask only whether the named change moved it. The COMPUTATION is missing.

V1 BUILT IT AND ITS SPLIT IS THE VALUABLE PART (`product/engine-go/triage.go`
at ref main). The cone divides in two:

- NEEDS RE-RULING, when the gate's own subject moved. Three cases: its own
  statement changed; its own definition changed while statement and deps did
  not; or a direct dependency that is itself a blessed gate had ITS statement
  hash move.
- STILL-HOLDS CANDIDATE for everything else — upstream content only, or pure
  propagation where own inputs are unchanged and the cone was dragged by a
  named root.

THE SPLIT IS DERIVED FROM WHAT THE WHY-DELTA ALREADY REPORTS, never new
analysis. And v1 writes its own honest limit into the code: the section says
CANDIDATES, because the owner rules and the triage only groups.

A flat "everything downstream is suspect" is what makes a large cone unusable.
The split is what makes it reviewable.

## Hashing — a ladder, not a choice

THREE LEVELS, and they are not competing:

- RAW BYTES. What we do today. CRLF, whitespace and key order all move it.
  Too sensitive.
- CANONICAL FORM. Normalise line endings, trim trailing whitespace, sort
  frontmatter keys, then hash. Kills churn, keeps everything semantic. One
  normaliser, nearly free.
- EXTRACTED GRAPH. Hash the semantics only. Kills reordering too, but needs an
  extractor per artifact kind, and the extractor becomes a thing that can be
  wrong.

THE RULE THAT PICKS: hash at the level your ripple should fire at.

ADOPTED: canonical form everywhere as the floor. Graph level only where an
extractor already exists — after D1 the machine compiler IS that extractor, so
machines get graph-level and nothing else needs it yet.

V1 PROVED THE GRAPH LEVEL WORKS. Cosmetic changes — comments, whitespace,
reordering element lines within a layer — left the hash bit-identical. One added
flow moved it.

MTIME IS NOT CONTENT. v1 retired mtime comparison because a fresh clone stamps
checkout-time on old source and the engine rebuilt itself BACKWARD. Our
`engine/discipline.ts` still fingerprints the tree by `size:mtimeMs`, while
`editsafety.test.ts` explicitly tests that a size-and-mtime cache would miss an
edit. We know the lesson in one lane and not the other.

## The golden root — NOT adopted

v1 computed a merkle root over the whole spec. It was annoying because it has
NO LOCALITY: it says something moved, never what, and it turns a migration into
an all-or-nothing byte-exactness problem.

WHAT WE LOSE BY NOT HAVING IT: almost nothing. Git already gives content
identity, tamper evidence and migration verification. The one thing git does not
give is a fingerprint scoped to the SPEC ONLY, so a code-only commit does not
move the book's identity stamp. That is low value today.

IF IT EVER COMES BACK, keep the TREE and not just the root. A root is the top of
a merkle tree; publishing only the root throws away the locality that makes a
failed comparison diagnosable.

## The waiver — NOT adopted

v1 had waivers: a failed check accepted anyway, always a user-adjudicated gate.

We do not need one, because THE ENGINE REFUSES. You cannot walk the lower steps
while the upper ones are unmet.

THE CONDITION ON THAT RULING: the engine must actually refuse. A system you can
simply ignore is worse than one with a recorded waiver. Verifying that the
refusal really holds is work, not an assumption.

## Reified connections — NOT adopted

v1 moved semantic relations out of frontmatter into first-class files, because
reified edges are addressable and frontmatter lists are not.

THE PREMISE DOES NOT HOLD FOR US. Frontmatter lists cannot be addressable in
OBSIDIAN. They can be in our own renderer, and D1 drops Obsidian.

THE TRIGGER TO REVISIT: the first time an edge genuinely needs a rationale of
its own and has nowhere to put it.

## Visualisation — there is no infrastructure grave

v1 recorded that deterministic layout of arbitrary graphs is an infrastructure
grave. THAT IS OVERRIDDEN.

Deterministic layout of arbitrary graphs is going to exist, in the
documentation. The reason is decisive: HUMANS CANNOT READ THE DATA IN THE
DATABASE WITHOUT VISUALISATIONS.

Why v1 stopped is not what its note says. It stopped because AI is very bad at
visual design, so the work is slow. Slow is not a grave. Every agent stumbles
over that line; it should stop being quoted.

NO COORDINATES, LAYOUT DERIVES — in principle, and it settles the whole parked
layout cluster. But some graphs still need design work, the trace graph among
them. Derived layout is the default, not a prohibition on shaping a view.

THE FALLBACK IF THE TRACE EVER GETS TOO BIG: v1's collapsible cluster bundling.
It looked bad in v1 and the idea is still good. Its definition is mechanical
rather than heuristic — a REGULAR FAN, a subgraph whose internals touch nothing
outside except through its inputs, collapses to one box with external edges
drawn to the boundary and a click to expand. Crucially it TOUCHES NO DATA, so
reviewability never forces a semantic merger.

We can also filter the trace graph by value proposition today.

## Notes, triage, and the options pool

RAW NOTES NEVER ENTER VERSION CONTROL. They are dumps and can carry private
data. That is a hard line.

THE CONCEPT WE LACKED HAS A NAME, and it is David Anderson's Kanban Method.
A mature system has no backlog — it has a POOL OF OPTIONS. A backlog implies
big-batch transfer; an options pool implies individual commitment and
single-piece flow. The COMMITMENT POINT is where you decide to deliver, and
UPSTREAM KANBAN is the filtering before it, whose discipline he calls TRIAGE.

The vendors do not help. Jira and Azure DevOps offer a Backlog list and a New
state, with triage as a convention rather than a named stage.

OUR THREE STAGES MAP ONE TO ONE: raw capture is upstream of everything, the
retro's drain is the triage, what survives is the options pool, and seeding a
survivor into an iteration is the commitment point.

THE POOL IS ANDERSON'S; THE NODE IS OURS, AND THEY DO NOT SHARE A NAME (owner
ruling 2026-08-18). What stands in the pool is a WORK TOKEN, never an "option".
The corpus already spends `option` on the morphological chart's design choices,
and two node kinds cannot answer to one word.

WE ALREADY HAVE THE TRIAGE. `se_note_drain` carries four dispositions, and
draining to `backlog` already REQUIRES a `where` naming the re-entry condition.

THE TWO GAPS: a drained note is still the same line in `.se/notes.jsonl` with a
disposition stamped on it, so it still carries whatever the capture carried; and
`.se/` is gitignored, so all 205 options are machine-local and no other machine
can see the pool it is meant to pull from.

THE FIX, BUILT IN i17: draining to `backlog` MINTS A WORK TOKEN in the repo —
rewritten, stating what stands and its ready-when, carrying no private data.
The raw note stays local and is marked drained. The tokens live under
`spec/trace/work-token/`, and the survey reads them from there.

THE REWRITE IS THE PRIVACY BOUNDARY. It is also the value boundary: something
nobody can state cleanly for another machine was never worth standing.

THE BOUNDARY IS ENFORCED, NOT ASKED FOR. A statement sharing a six-word run
with its note refuses (SE-C-140), and so does one sharing an identifier — a
path, an address, an opaque token. `se_file_write` cannot open a second door
into the pool folder; only the mint writes there.

V1 ADDS A SECOND REASON, as a killer requirement: the pool lives ABOVE
iterations, on trunk, SO NOTES SURVIVE A DISCARDED EXPERIMENT.

## The `.se` folder

`.se` MOVES INTO THE PRODUCT FOLDER, beside `.obsidian`. Today it sits at the
project root, one level above `project/` — `engine/paths.ts` line 30 resolves it
as `join(root, ".se", "roots.json")`.

THE OLD RULING IS NOT IN THE WAY. `engine/paths.ts` lines 150 to 152 say `.se`
is always the project root, but that ruling is about BRANCH INDEPENDENCE — the
notes and call log belong to the machine, not to a branch. It says nothing about
depth. One phrase changes; the intent survives.

MARKER: change `.gitignore` so `.se` itself is tracked and its CONTENTS are
ignored, the way `.obsidian/` is tracked while `.obsidian/workspace.json` is
ignored. A marker that is never committed cannot mark anything for a fresh
clone.

V1'S ANSWER WAS SHARPER AND IS WORTH WEIGHING: a committed FILE as the marker,
found by walking UP, with absence a LOUD ERROR and never a silent fallback. And
the invariant that made it work — engine writes into the repo are exactly four
named truth mutations, so git status stays clean on any other command.

THE EXCLUSION SPLITS BY FILE, not by directory. `engine/paths.ts` line 18 hides
five directory names and records no reason for any of them. `.se` is the wrong
one to hide wholesale: it costs 121 unfollowable citations, a retro step that
instructs a read the lane forbids (`retro.md` step 8 says to read
`.se/test-last-run.json`), and the agent's inability to read back the roots
declaration it maintains.

Hide only what has a structured door: `calls.jsonl` (se_log_query),
`notes.jsonl` (se_survey), and the reading (the pull). `.git`, `node_modules`,
`.venv` and `__pycache__` stay hidden.

`.quack-watch.json` moves inside the marker folder. v1 had a stated law behind
this: at most about five visible files and folders per level, dotfolders exempt.

THE REQ-MINE FILES ARE NOT COMMITTED. They go to the scratchpad. So the 121
citations cannot be repaired by committing their sources — they must be
REWRITTEN to point at something that exists, most likely reference notes for
the v1 and v2 corpora at their refs.

## The scratchpad

THE SCRATCHPAD MAY HOLD WHATEVER THE WORK NEEDS. It is gitignored (landed
2026-08-12) and `engine/bin/package.ts` already keeps it out of the shipped
archive.

`tests/files.test.ts` now skips it. The no-binaries rule was always about what
the PRODUCT owns; reaching into the workbench made it refuse inputs.

## The prompt layer and the recital

THE FOLDER ALREADY EXISTS AND WE BUILT IT. `guidance/` is projected into
`AGENTS.md` and `CLAUDE.md` by place-prompt-layer, and preflight REFUSES TO BOOT
if what was placed is not the projection.

`machines/states/read_contract.md` already carries the argument: a read-proof
says a document passed through once, and a compaction erases it while the walk
carries on with a hash that proves nothing. Prompt-layer text cannot be
compacted away.

THE BLOCKER IS REFRESH. The layer is placed at boot and not re-read mid-session.
It carries what is always true and cannot carry what is true only at the state
you stand in.

`UserPromptSubmit` hooks do not rescue it, for a structural reason no fix
touches: THE HOOK FIRES ONCE PER USER MESSAGE, NOT PER AGENT TURN. The walk
pulls many times inside one message. The walk moves faster than the hook fires.
Separately, GitHub issue 49063 reports `additionalContext` never reaching the
model in the VS Code extension on Windows, closed as not planned and stale.

THE RECITAL COMES BACK AS THE READ RECEIPT. The prompt layer carries: your
target is the front desk, and when you reach it you recite the contract.
Everything currently served on the way to the desk is REMOVED. Then the delivery
is observable instead of trusted.

v1 removed its rendered prompt layer because field data showed the embedded copy
did not produce the recital. What we lost was THE RECITAL ITSELF, and putting it
back is what makes the layer testable.

THE CHEAPER FIX AVAILABLE NOW, independent of any harness question:
`se_file_read`'s own description says `.se/reading.md` holds every document the
way ahead demands, concatenated, and that reading it CREDITS THEM ALL — one call
instead of one per document. That door exists and boot does not take it.

## The LSP

Dropping Obsidian removes the editor that gave frontmatter its affordances. An
LSP replaces them and gives more: diagnostics at the keystroke rather than at a
lint, completion for field names and enum values, and go-to-definition for links.

It answers a standing complaint that frontmatter constraints fire TOO LATE and
live in TWO PLACES. An LSP fires at the keystroke and can read the same
frontmatter-keyed schema.

V1'S SCHEMA SHAPE IS READY TO TAKE: field schemas are frontmatter-keyed notes —
`required`, `enum_<field>`, `pattern_<field>`, `min_` and `max_` — a common
schema merging with the per-type one, and defaults living IN the schema. With a
recorded tripwire: the day a rule needs conditionals or nesting, GENERATE real
JSON Schema from the frontmatter, which stays the authored source.

## Architecture versus detailed design

ARCHITECTURE IS EVERYTHING HARD TO REVERT, OR WITH SYSTEM-WIDE IMPACT — and
system-wide impact is itself hard to revert. THE DOORS YOU CANNOT WALK BACK OUT
OF ARE ARCHITECTURE. Everything else is detailed design.

This is the owner's formulation and it is better than v1's, which named only
system-wide impact and important qualities.

## The AI-involvement marks

DEFERRED to the book rebuild, for an external reason: European legislation
requires AI-generated text to be marked, so documentation will carry the marks.

V1'S DESIGN IS COMPLETE AND READY. The marks measure INVOLVEMENT ONLY — 3 is
fully generated, 1 is slightly touched — never trust or review. The author owns
all published content and no unreviewed state exists to render. THE AI ADJUSTS
THE MARK AT WRITE TIME on the surface-versus-core line: surface touches leave
it, core touches raise it, and DOUBT LEANS HIGHER. The human only reduces it by
judgment. It renders as small vertical icons in the text margin.

Two alternatives were rejected with reasons: a faceted review axis, because it
solves a problem this process refuses to have, and a bare textual AI label,
because it is the proven-worst format.

v1's fundamentals state it more strictly than its ADR: a person's rework removes
robots, and ANY AI TOUCH RESETS THEM TO THREE. Rule between the two before
building.

## Attribution by exclusion

THE STANCE IS AGREED: an unlogged change is not ours to override. Our
compare-and-swap already refuses a write when disk moved since the read, so
nothing clobbers a change the lane did not make.

THE MARKING HALF IS DEFERRED to the book rebuild, with the involvement marks.

## Captured images

REJECTED, because our rule is stronger and already enforced.
`req-every-artifact-is-readable-text` is a must: zero binary files under the
product root, measured by the suite on every run. A figure is authored as inline
SVG, Mermaid or ASCII, and that cost is accepted.

Screenshots stay usable as WORKING AIDS in the scratchpad. They do not travel in
git and they are not part of the product. Anything that must be authoritative
gets converted to a diffable form.

## Idempotent cross-machine minting

REJECTED. `hash(template + occasion)` only collides when the occasion token
matches exactly, so it moves the matching problem rather than solving it.

The narrow thing worth keeping needs none of that machinery: a reference note
takes its id from the SOURCE's own identity — a url, or title plus version —
because that identity is canonical rather than invented per occasion.

## Presets, test levels, killers

PRESETS: rejected. v1 shipped five reading paths over one book; not missed.

TEST LEVELS: rejected. v1 declared method AND level (unit, integration, system,
acceptance). We have verification and validation and that is enough.

KILLER CHECKS: rejected. Not a good idea, and our state machine structure is
better.

## Types

v3 has no type axis. v1 composed a project TYPE over a RIGOR floor.

WE MAY NEED IT, especially for BUILD STEPS. And we are not empty: we already
have TYPED GUIDANCE VIA TAGS — a state carries tags and guidance joins to them.

NOT URGENT. v1's problem with types was that it never really used them, so
nobody could see how well they work.

## The comment system — the vision

Build v1's comment layer into the book again. Then go further.

THE VISION: the comment system exists EVERYWHERE. Mark something on any surface,
the microphone opens, say what is wrong with it, and it is stored AS TEXT linked
to the place marked.

IT COMPOSES FROM PARTS WE HAVE OR HAVE RULED. v1's comment layer gives the
anchoring model. The notes pipeline gives the rest: a spoken comment is RAW
CAPTURE, private and local, and triage rewrites the keepers into the options
pool. v1 already stripped author names at exactly that crossing.

WHERE IT IS HARD, named honestly. "Everywhere" means several anchoring models,
not one — prose anchors on a quote selector, a drawing on a node id, a table on
a cell, a form on a field. The comment SCHEMA is shared and the ANCHOR is
per-surface. Speech to text is not free and a hosted service would send the
owner's spoken words off the machine, which meets the same privacy line that
keeps raw notes out of git. And the surfaces are in flux, so build against the
book first, which v1 proved and which is the surface that travels to people.

---

# Part 2 — The iterations

Format: id, whether it needs the owner, what it waits on, and what it is.

## Mechanical — nothing needed from the owner

These can run on any machine, in parallel, subject only to the named ordering.

EACH HEADING CARRIES ITS STATUS, and the record is what it was read from.
spec/iterations/<id>/record.md holds the only authoritative status;
this file is a copy and a copy goes stale. When the two disagree, the record
is right.

### i3 — the walk's feedback loop  (SHIPPED 2026-08-13)

Reading credit survives a reload, a red objective serves its fill, one verb
answers why a state is grey. Absorbs the introspection-verb work.

### i4 — the panel round  (OPEN — started, not shipped)

The archived iteration browses like the live one, a bless repaints without a
reload, a grey state says why.

### i5 — engine hygiene  (OPEN — built and verified, at validation)

THE SEEDED BUNDLE WAS SIX DAYS OLD AND WAS AUDITED AT THE KICKOFF, not carried
in whole. Thirteen items went in; three were struck against the code, which had
already absorbed them, and two went back to the pool as work with no measured
cost yet. What was built is the measured remainder, five requirements:

- the entrypoint answers `--version` before it resolves a root, so a package
  proves itself with one command on a checkout too broken to start
- the acting role is stamped on the call-log record where the call is SERVED,
  and no reader infers it from the tool name any more
- the brand folder is named ONCE in code, and preflight asks the readers where
  they looked instead of spelling the paths a second time
- a live source that resolves to nothing SAYS SO on the form, so an empty table
  and a broken one stop looking alike
- one function decides how a state is painted, and the third green — done with
  its law proven — is told apart by stroke, not by a second shade

FIVE ENGINE AND CORPUS DEFECTS were found blocking the walk and repaired on the
record rather than folded in silently. A tester with fresh context returned
twelve findings, eleven fixed and one recorded.

Absorbed and NOT built: the refusal-to-guidance anchoring sweep, the duplicate
sync sweep, the slow test-file split, the tests cluster and the pre-push battery
gate. Those were the items with no measured cost, and they are in the pool.

### i6 — conformance goes mechanical  (SHIPPED 2026-08-16)

Checks bind to the named elements and run at the write, not at a review.

V1 BUILT THIS FOR STATE MACHINES. Its extractor checked the CODE'S TRANSITION
SET against the model graph and flagged unreachable states. See
`guide-model-syntax.md` at ref main.

### i7 — the trace sharpens  (SEEDED)

Finer grain than files, and the dead-code sweep widens past the engine.

V1'S ANSWER TO THE GRAIN QUESTION: ELEMENTS ARE DESIGN REGIONS, FILES ARE
THEMES. A file may span ranks; it groups regions by theme, derived from
co-location. UNMARKED LOCAL HELPERS ARE ARCHITECTURALLY INVISIBLE.

The join is a code marker. Every v1 Go file opens with
`// design: <region-id>  implements: <req-ids>`. Allocated with no realising
region is an honest planned hole; a region no model allocates is the sky-fall
lint — no device falls from the sky.

### i8 — se.help  (SHIPPED 2026-08-13)

THE VERB, plus the demand log that records every miss as a ranked missing-tool
signal, plus the missing-capability enumeration.

WHY IT IS FIRST. It is the only true speed enabler in the set. Our own number:
`guidance/method/retro.md` records that on 2026-08-07 `se_run` stood at 3249
calls out of 28612 — the second most-used verb in the lane. A lane whose escape
hatch is its second-busiest door is missing verbs. Today the retro asks a person
to hand-mine that list; se.help produces it mechanically.

THE HONEST WEAKNESS: the SEARCH half is weaker here than in v2, because this
harness already loads tool schemas on demand and the lane's descriptions are
long. Nobody has counted how often an agent fails to find a verb that exists.
Build both halves; if one must be cut, the demand log is the one with evidence.

V1 AND V2 REACHED THE SAME IDEA TWICE. v1's `guidance.md` describes a
DESCRIPTION CATALOG with lazy bodies loaded by named trigger; v2's se.help is a
keyword search over tools and guidance. Same shape, built neither time.

THIS IS THE CLOUD-ITERATION CANDIDATE. Additive, self-contained, clear done
condition, and an unwatched failure costs one new verb.

### i9 — .se and the corpus  (SEEDED)

The move into the product folder, the committed marker, the exclusion split by
file, `.quack-watch.json` moved inside, method fan-out to every open worktree,
and the single-corpus reader.

RUNS BEFORE i10, because the 121 citation repairs need `.se` readable.

NO OPEN JUDGMENT REMAINS. The marker is the Obsidian pattern. The req-mine files
are not committed. The worktree concern was checked and is not one: an owner
ruling of 2026-08-07 already pins `.se` to one root by path KIND, and `seDir` is
three lines. Add one test asserting it resolves to one place while a record is
bound, so the guarantee stays pinned rather than trusted.

### i10 — the big sweep  (SEEDED)

ONE PASS OVER ONE KEY. Module-prefix lint, then module-qualified ids, the
reference glossary, the `source_refs` migration, the 121 broken citations, and
assumption citations.

SIZE: 315 nodes carry `source_refs`; roughly 498 trace nodes carry `minted_in`,
which is the order of the corpus.

TWO PHASES IN ONE WALK. The lint lands first and passes over the whole corpus.
The composite rename follows with the lint as its gate.

WHY ONE PASS. Four separate jobs touch the same key in the same files. Running
them apart means rewriting the corpus four times and leaving windows where half
the ids are qualified.

THE RESIDUE GOES TO THE OWNER. Some of the 315 strings will not resolve to
anything citable. They are listed, not guessed at and not dropped silently.

WHAT MAKES IT SURVIVABLE: `raid-dec-stable-ids` is a decided ruling that ids are
contracts, a renamed node owes a migration, and the orphan check runs at every
submit. A missed id shows up as an orphan rather than as silent rot.

### i11 — the engine-fix bundle  (SHIPPED 2026-08-16)

About twenty named defects that i3 and i5 do not claim. Among them: a
sub-machine can be skipped whole; `build_chart` writes candidate notes but not
the candidate drawing; the fill answer returns the whole form twice; the battery
hands back raw output where the scoped run hands back structure; reopening a
state while standing downstream makes the walk owe the later form first; silent
fallbacks that hide a moved file; the engine cannot be asked how it is; the
shim's proxy fetch has no timeout; there is no in-flight tree switch between
worktrees.

TWO FROM TODAY. The stale security row: `req-mirror-stays-on-the-machine` says
in its own body that the demand is NOT MET, and its `source_refs` cite the old
broken call, while `engine/mirror.ts` line 915 passes `"127.0.0.1"` and meets it.
Rewrite the Detail and the refs, then sweep the other rows from the same ISO
25010 pass for the same shape. VERIFICATION STATUS DOES NOT BELONG IN A
REQUIREMENT BODY; that is what evidence is for, and a row that narrates it goes
stale every time somebody satisfies it.

And: the map lies. At autonomy 0.2 the pull refuses to enter `expeditions`,
while `route("expeditions")` reports no closure at all, because the route weighs
the start state it lands on rather than the container door.

### i12 — performance  (SHIPPED 2026-08-15)

The one-second rule on the machine page and on opening a form, pull pagination,
the survey window, and the O(n cubed) comparison walk.

V1'S BATTERY SHAPE if the battery is touched: progress, batch and concurrency
INSIDE the guarded write path, as a bounded worker pool whose results flow
through the SAME verdict-write guard — one serialization point, no second write
path. Caps at spare cores, order-independent tests only.

### i13 — the machine format migration  (SEEDED)

Canvases become PlantUML. The Cytoscape renderer for machines. Edges move off
the canvas.

IT CARRIES THE AUTONOMY TAG RENAME, because it rewrites every machine file
anyway. Doing the numbers first and then migrating means doing them twice.

HASH THE GRAPH, NOT THE BYTES, and decide it here rather than after. The
compiler already extracts the graph.

THE AUTHORING DISCIPLINE, portable from v1 whole: declare every element FIRST,
one per line, then the flows on declared names only. A flow to an undeclared
name is a dangling reference and a lint finding. EVERY FLOW CARRIES A PAYLOAD
LABEL; an empty one is a lint finding. NO COORDINATES, EVER. The syntax is a
PINNED SUBSET — anything beyond it is a lint finding, and the file still parses
past it.

MINT THE OBSIDIAN-COMPATIBILITY REQUIREMENT here.

MUST NOT RACE i14 — same files.

### i14 — the ladder, engine half  (SEEDED)

Comparison logic from numeric to rung order, `machines/scale.md`,
`guidance/authoring/machines.md`, and the three test files pinned on 2026-08-12.

PAIRS WITH i13. Do not race it over the same files.

### i15 — the database  (OPEN — started, not shipped)

Our own database reading Bases-compatible files, with the graceful-extension
rule.

HARVEST, DO NOT INVENT. v1's `spec/queries/` at ref main holds 26 working
`.base` files. `requirements.base` is `filters` / `views` / table type / `order`
/ `sort` / `groupBy` — Obsidian Bases YAML.

AND v1 BUILT THE READER: `adr-query-in-engine` describes a PINNED IN-ENGINE
BASES SUBSET over nodes, edges, states and notes, returning filtered rows with
chosen fields and REFUSING AN UNKNOWN FIELD WITH THE FIELD LIST, with the MCP
surface serving it read-only. CONFORMANCE FIXTURES GUARD SUBSET DRIFT and the
subset extends TEST-FIRST.

### i16 — the vehicle overlay  (SEEDED)

THE i10 EDGE IS CUT, on the owner's ruling of 2026-08-18. It used to wait on
i10, because `req-overlay-resolution` demands one shared identity scheme and
module-qualified ids ARE that scheme.

WHAT SHIPPED INSTEAD NEEDED NO SUCH SCHEME. A vehicle mints its own 12-hex
`instance` and records the identity of the tree it came from, so two copies
are told apart without module-qualified ids. The overlay resolution chain is
still unbuilt, and it is what still wants i10.

FULLY SPECIFIED AND ENTIRELY UNBUILT. `uc-vendor-and-overlay`,
`req-overlay-resolution` with eight clauses, `req-overlay-survives-update`,
`req-overlay-drift-reported`, `req-second-product-reuses-install`. The engine
contains 16 occurrences of the word overlay and 11 are SVG layering.

`req-engine-folder-is-sealed` WAS ON THAT LIST AND IS REMOVED, on the owner's
ruling of 2026-08-18 that nothing is sealed. A vehicle is a complete
independent copy and owns everything in it, including what the parent wrote.
[[raid-dec-an-import-is-read-only-and-a-vendored-copy-is-yours]] replaces it,
and it carries the law the sealed requirement had garbled: the rule is the
DIRECTION of writes, never a folder.

IT IS SMALLER THAN IT LOOKS, AND THAT SENTENCE NEEDS ONE QUALIFICATION. v1's
`product/engine-go/resolver.go` at ref main is the chain in about thirty lines:
a layer list, most-specific first, un-overridden resources inheriting, and a
vehicle overriding by placing a file rather than by editing.

BUT THE CHAIN PORTS AND ITS TOP LAYER DOES NOT. v1's most-specific layer is a
per-workspace DATA HOME and this product has no data home at all, which
[[raid-risk-the-overlay-location-is-unchosen]] records. i16 found this by
reading the resolver rather than by assuming the port, and it is the reason the
iteration needed an M4 lane instead of a build.

V1'S VEHICLE IN ONE LINE: a vehicle is built EMPTY, imports quackitect as `se`,
and owns local doc modules. That is why the module is called `se`.

MODULE LAYOUT, from `product/engine-go/module.go`: `modules/<dotted.id>/import`
is a mirror of upstream and is never hand-edited; `modules/<dotted.id>/overlay`
is yours and import never touches it; `module.toml` records provenance. Import
plans deterministic file operations and DRY RUN IS THE DEFAULT review surface.

DO NOT SUBSTITUTE BRAND NAMES AT RENDER TIME. v1 rejected that because rewriting
text the ledger hashes would hide content from the trust chain. The renderer
takes identity surfaces from the brand layer, and method prose is written
brand-neutral where it speaks about itself.

### i17 — the options pool  (SHIPPED 2026-08-18)

Draining a note to `backlog` mints a WORK TOKEN in the repo, rewritten and
carrying no private data. The pool lives above iterations so it survives a
discarded experiment and so every machine can see it.

THIS FILE DISSOLVES INTO IT.

### i18 — the blast radius  (SEEDED)

The downstream cone, computed, with v1's two-way split: needs re-ruling versus
still-holds candidate. Read `product/engine-go/triage.go` at ref main before
designing.

## Judgment — the owner sits with these

EVERY J BELOW IS A SEEDED RECORD NOW, and the mapping is one to one. Each
carries the JUDGMENT prefix in its own goal. The J numbers are kept here
because Part 3 and the ordering rules cite them.

- J1 is i19
- J2 is i20
- J3 is i21
- J4 is i22
- J5 is i23
- J6 is i24
- J7 is i25
- J8 is i26

### J1 — emit.report

The report on how an iteration went. The owner has ideas and wants to talk
first.

### J2 — emit.book

The whole product, not one iteration. Study v1's book at ref main before
designing, and compare against StrictDoc.

CARRIES the AI-involvement marks.

V1'S BOOK DESIGN, ready to weigh: truth lives ONLY in spec sources and all
judgment happens there; everything downstream is deterministic; the emitter
renders to ONE self-contained HTML with transclusion at emit time. JUDGMENT
UPSTREAM, DETERMINISTIC DOWNSTREAM. The reader corrects the SOURCES, never the
projection, and the next emit proves the correction took.

Derivable sections render as CANNED QUERIES; authored prose only where judgment
adds something. AGENT-DRAFTED SECTION PROSE IS REJECTED because it drifts.

The book stays ONE FILE, paging client-side.

THE THREE LAWS from v1's guidance chapter, and they are the best thing in it:
DERIVED OVER AUTHORED — a derivable section written by hand is a defect.
NO GREEN OCEAN — failing and missing render prominently; passing masses collapse
into counts. ONE SCREEN BY DEFAULT — full detail one interaction away.

NO GREEN OCEAN IN ACTION: v1's V&V chapter opens with the exceptions, not the
matrix. The verified mass is one derived count; every unverified requirement is
named FIRST. With zero exceptions the block is ONE GREEN SENTENCE. Its reason: a
hole never hides on page nine of a green table.

AND THE TRACE RENDERS ONE PAGE PER NEED, not one giant graph, reusing the
grouping the report already bakes.

THE COMMENT LAYER lands here: comments in one embedded W3C Web Annotation
island, highlights through the CSS Custom Highlight API so the DOM is never
mutated, save rewriting only the island so an uncommented save is a
byte-identical no-op, and a read-back that prints a LIST of note candidates with
author names already replaced by the reader role. A BULK IMPORTER STAYS
REJECTED: nothing enters the ledger without judgment.

### J3 — Benjamin, as the `kb` module

The second module, and the first real test of qualified ids beyond `se`.

### J4 — the frozen window

Pull at iteration start, push at ship, frozen between, covering code AND
references. Adds the ship-review row to M9.

WAITS ON i10 — there is nothing to freeze until references exist.

### J5 — the UI sitting

The owner's UI rulings, the mirror cut which is already ruled, the VS Code shell
layout, and the coverage dashboard. Wants the owner at the screen.

THE DASHBOARD IS THE COVERAGE SURFACE WE LACK. The mechanical checks exist in
`engine/trace.ts`; what is missing is the live view. v1's trick is worth
copying: the register's filter columns carry the facet coverage, so A
ZERO-COUNT VALUE IS THE COMPLETENESS CHECK, LIVE.

### J6 — the phone loop

Far down, after the webview work. It gained a second job: it is what makes a
cloud iteration supervisable.

CARRIES A SPIKE, not a verdict: prove the tunnel in THIS environment. The claim
that cloudflared failed VM-side is second-hand from v2's inventory, the owner
remembers it working, and a v2-era finding about a tunnel is weak evidence about
today.

CARRIES A NAMED KILL-CRITERION that does not decay: v2 shipped a defect where
the hosted page said "Blessed" while the engine ignored the answer. A false
success on an adjudication surface is worse than no surface.

V1 BUILT ONE TOO. `adr-handoff-html` at ref main: ONE browsable HTML page per
bless moment, the gate's cone as collapsed colour-coded rows expanding to full
detail, the y/n bless ON the page riding the ask path with actor and channel
recorded, and THE SAME PAGE TRAVELS TO THE PHONE. No standing register, because
adjudication is a MOMENT, not a dashboard.

Its security answer, with the risk accepted after a red-team round: authenticity
equals possession of the paired channel credential. Mitigations recorded:
high-entropy topics, asks carrying check ids and never secrets, late and
duplicate answers idempotently ignored. Upgrade paths in order: self-hosted ntfy
with tokens and ACLs, then Slack socket-mode.

### J7 — the voice, and the linter

INTEGRATE VALE. It is single-click installable and it is a good thing.

TEACH IT ASD-STE100. The standard sits at
`scratchpad/ASD-STE100_ISSUE9.pdf`. The lane cannot read it — 3.3MB of
binary, refused under SE-C-126 — so extracting its text is the first task.

V1'S PATTERN: Vale auto-pulled once per OS into the data home and run as a
SUBPROCESS, never linked, never hand-rolled, with a LOUD WARNING when the pull
fails. Maintaining a prose linter was explicitly rejected.

ARM IT AT ZERO DEBT. v1's rule: historical findings are CORRECTED, NEVER
EXEMPTED, and only then does a finding fail the lint. Exemptions freeze debt and
teach nothing. We carry 26 measured prose findings; fix them first.

THE GLOSSARY DISCIPLINE rides here: one note per term, usage is a MARKED LINK,
the chapter generated used-terms-only with back-references and first-use
expansion. A LINK TO A MISSING TERM ERRORS; AN UNLINKED SCANNED USAGE ADVISES.
The terms lint reads THE GLOSSARY as its only term list — no second list, and
thinness is fixed by growing the glossary.

AND THE LINK GRAPH: v1's `autolink.go` is 99 lines. Longest name wins at a
position, authored links and inline code are protected spans, code fences and
headings and raw-HTML lines are exempt whole because inline SVG carries text a
link would corrupt, and AN ALIAS CLAIMED BY TWO NOTES IS A HARD ERROR AT INDEX
BUILD — the book surfaces it and never guesses.

### J8 — the comment system everywhere

The vision above. After the book proves the anchoring model.

---

# Part 3 — The critical path

The owner's decisions, in the order that unblocks the most work.

THIS SECTION WAS WRITTEN ON 2026-08-12 AND SWEPT ON 2026-08-18. What follows
is what stands on the sweep date. The record files are the authority; this is
a reading of them.

DONE — D1 the machine format, and D2 the autonomy ladder. Between them they
unblocked i13, i14 and i15 and settled about twenty-five parked backlog notes.

SHIPPED, THIRTEEN OF THEM: i1, i2, i3, i6, i8, i11, i12, i17, i27, i28, i33,
i34, i35. The last five are records this file never planned — they were seeded
after it was written, and the section below names them.

OPEN, MEANING STARTED AND NOT SHIPPED: i4 and i15.

SEEDED AND WAITING: i5, i7, i9, i10, i13, i14, i16, i18, i29, i30, i31, i32,
and the eight judgment records i19 to i26.

CHAINED: i9 then i10, then i16, i22 (was J4) and i18.

THE OWNER'S REMAINING QUEUE, any order: i19 emit.report, i20 emit.book, i21
Benjamin, i23 the UI sitting, i25 the voice. i22 waits for i10. i24 and i26
sit behind i23 and i20 respectively.

### The records this file never planned

Seeded after 2026-08-12, listed so the plan is not read as the whole set.

- i27 — the lane binds to the record. SHIPPED 2026-08-14.
- i28 — the cloud runs from its seed alone. SHIPPED 2026-08-15.
- i29 — frontmatter is typed and the engine writes it. Seeded.
- i30 — reverse engineering: recover the trace work never had. Seeded.
- i31 — the process becomes measurable: a walk replays from events. Seeded.
- i32 — the agent's thinking is measured, and states rank by drag. Seeded.
- i33 — every interface answers inside a second, or says why not. SHIPPED
  2026-08-17.
- i34 — one tree: iterations and archives live on trunk, record branches and
  worktrees go. SHIPPED 2026-08-16.
- i35 — the cloud run's findings land. SHIPPED 2026-08-17.

## The ordering rules that actually bind

### The run order, set by the owner 2026-08-13

THE ENABLERS RUN FIRST, IN THIS ORDER: i27, i28, i11, i12. Then i9.

ALL FOUR ENABLERS HAVE SHIPPED, and i9 has not been started. The ordering
argument below is kept because it is the owner's reasoning, not a status.

THEY ARE NOT A CHAIN. Only i28 waits on i27 mechanically. The rest is
PRIORITY, not prerequisite, so they may run at once where there are machines
for them — the order says which to start when there is one machine free, not
which to hold back.

WHY EACH ONE EARNS ITS PLACE.

- i27 binds the lane to the record. The step-out it removes ran eight times in
  a single session, three of them inside one verification.
- i28 lets work run in the cloud. THE OWNER'S ARGUMENT, and it beats the
  others: every one of them saves time inside one machine, and this one adds
  machines. It multiplies the whole set rather than any single record.
- i11 stops the pull overflowing. A gate fill answered 236KB, and the reading
  detour that forces ran a dozen times in a day.
- i12 halves the battery's wall clock, which every later iteration pays on
  every run.
- i9 is the only agent record that unlocks DECISIONS of the owner's: i9 leads
  to i10, and i10 makes i21 and i22 available. Running it early spreads the
  owner's load instead of piling those two on later.

THE OWNER'S DECISIONS BELONG INSIDE THAT WINDOW, not before it and not after.
i4 and then i20, made while the enablers run. Agents are busy for that whole
stretch, so a decision taken then costs no waiting — and i23 stands unblocked
the moment the enablers land, with no gap where a machine idles.

EVERYTHING ELSE IS FILL, in no order: i5, i6, i7, i13, i15, i17, i18, i29,
i30. i19 and i25 unlock nothing and can go whenever.

i19 GREW ON 2026-08-15. It now carries the whole milestone one-pager
programme, all ten pages and the deck. It still unlocks nothing, so its place
in the order does not change. It is no longer a small filler.

### An open question this raises

Part 4 carries a v1 law: ORDER IS NOT DEPENDENCY — depends_on states real
prerequisites only, never display order.

i23 now waits on i4, i27 and i11 in the graph. i4 is a real prerequisite. The
other two are a JUDGMENT: i23 is the largest build in the set, and running it
before the lane binding and the pull fix makes it pay both taxes the whole
way. That is a cost argument, not an impossibility, so under the strict
reading of the law those two edges do not belong there.

They are kept because the owner asked for the order to be visible on the
board, and the board draws edges rather than priorities. THE REAL FIX is a
priority the container can draw without blocking, and until that exists the
choice is between an invisible order and an over-strict one. Owner's to rule.

### The file-level rules

i13 AND i14 TOUCH THE SAME FILES. Do not race them.

i10 AND i13 DO NOT OVERLAP — i10 rewrites spec ids and `source_refs`, i13
rewrites machine definitions. They can run on different machines at once.

EVERYTHING ELSE in the mechanical set touches distinct file sets.

---

# Part 4 — Ten laws worth adopting, from v1

Each one is cheap and each one is a rule we do not have.

ORDER IS NOT DEPENDENCY. `depends_on` states real prerequisites only, never
display order, so agent-blessable fillers never stand between the person and the
gate.

MERGE THE HAND-OFF, NEVER THE NODES. One page may present several blessables,
but each bless is recorded individually and a split answer stays possible.

EXPEDITIONS: UNLIMITED EPISTEMIC REACH, ZERO AUTHORITY. Findings enter the
ledger only through a promotion gate whose scrutiny scales with the blast
radius. Interior spike churn never moves a hash.

GUARDS LIVE IN ONE DISPATCH PASS, never per handler — for coverage uniformity
and for one tested predicate set. Tripwire: a rule table past ten per-command
entries has become per-command logic in disguise.

MINTING IS ENGINE-OWNED. Schema-valid skeletons at birth, moving the strict
parser's guarantee FROM READ TIME TO BIRTH TIME. v1's sugar forms include
`mint defer --ready-when` and `mint supersede` stamping the classification
edges — we have the first idea and not the second.

TEMPLATE-FIRST. Every fix lands in the template, the instance re-derives, and
DRIFT GATES THE SYNC. That is our promotion question made mechanical.

DISCOVER ONCE, FIX BATCHED, CONFIRM ONCE. The battery collects failures and
reports them once at the end. WE VIOLATE THIS TODAY IN A SPECIFIC WAY: our
battery collects all failures, but the stored verdict TRUNCATED the list at
capture, so a session saw 4 of 9 and had to re-run files live. The law is right
and the plumbing breaks it.

The owner's proposal for enforcing it: an EDIT MODE, like a Python context
manager. Inside edit mode you cannot run tests; leaving it runs them once.

NEVER-CACHED SUITES. A test may declare that the cache skips it — the escape
hatch for tamper checks that must always really run.

RED-UNOBSERVABLE IS A RECORDED EXEMPTION. A test whose red was never observable
cites the decision instead of a red observation, so the marker stays mandatory
and the exemption stays sweepable.

NO EMBEDDED DATA. Resources resolve from the live layer beside the binary, never
from a frozen copy inside it. An embedded copy freezes at compile time while the
layer keeps moving, and the two drift apart silently.

---

# Part 5 — Risks carried forward from v1

These are v1's recorded risks that are live for us. They are candidates for our
own register, not entries by inheritance.

THE TRACE GRAPH HAS NO PRECEDENT AT SCALE. v1's prior-art research found that
Jama's item-level trace views are TABULAR and its diagram view is TYPE-LEVEL
ONLY. Our node-link graph is a differentiator without tool precedent. The
mitigation is the collapsible fold described above, and this is a real risk the
owner has agreed to record.

CACHED MEMOS GO STALE. v1 rated this 0.7 — the highest in its register — and
observed it twice. We have been bitten already: `engine/session.ts` records that
the route memo used to clear on form writes only and IT WEDGED THE WALK on
2026-08-07. Our backlog carries three cache layers and three manual reloads.

A NEW REFUSAL CAN HIT A LAWFUL MOVE. v1's mitigation is a stronger invariant
than we state: every refusal names the lawful lane, one channel never gets a new
refusal, and a lane stays open per command class. We give every refusal an
executable remedy, which is the same instinct without the guarantee.

THE SEEDED CHECKLIST DRIFTS FROM ITS TEMPLATE. v1's mitigation: the seeder reads
the SOURCE at seed time, with NO BAKED COPY. Our pin bakes `rigor_matrix_hash`
and `demands` into a pin file and detects movement afterwards — the other
choice.

NO OUTSIDE READER HAS VALIDATED ANYTHING. v1 recorded that only the owner and
the driving agent had ever read its book. The same is true of our spec, and we
carry newcomer requirements nobody outside the loop has tested.

---

# Part 6 — Where the harvest lives

V1, at ref `main`. Its spec is about 300 small files: roughly 110 ADRs under
`spec/decisions/`, 34 glossary terms, 35 references, 26 `.base` queries, 24 raid
entries, 13 guides, 11 stakeholders, 11 use cases, 8 method cards, 5 models, 7
IFUs and 18 `man-*` book chapters. Its engine is about 90 Go files under
`product/engine-go/`.

MINED FOR PLANNING: all 8 method cards, the model-syntax and pruning guides, the
fundamentals, the rules, the whole risk register, the book chapters, and roughly
45 ADRs chosen as those bearing on decisions we have taken.

NOT MINED: about 65 tail ADRs, mostly veto and small-scope entries; the 7 IFU
documents; the 11 stakeholder classes.

THE GO SOURCE IS A REFERENCE, NOT A ONE-TIME EXTRACTION. Code carries design no
ADR states, and you only know which part you need while building the thing it
implemented. The files worth opening are named against their iterations above.

V2, at ref `v2`, with its idea inventory at `V2-INVENTORY.md`. That
inventory was produced by a full walk of the v2 corpus and every idea in it
carries its source key. v2 needs no further opening.

## The milestone one-pager, all of it in i19 emit.report (owner design, 2026-08-15)

EVERY GATE PRODUCES A ONE-PAGER: an HTML page that reads like a slide but does
more, embedded beside the state machine. Open a submitted milestone and the
one-pager sits next to the drawing. Bless from there, or drill into any of it.
Export it later for a report. When the iteration closes, its one-pagers become
a deck.

IT IS A PROJECTION OF THE GATE, NOTHING MORE. The gate form already carries
the verdict, the three rounds, the register additions and the checklists. The
one-pager renders them. It authors nothing, and a field it needs that does not
exist is a finding about the FORM, not a reason to write prose.

IT IS A LIVE VIEW, NOT A COPY. The evidence layer points at the requirements,
tests, runs and register entries where they live. A slide that copies evidence
goes stale; a view that points at it cannot. INCOSE's 2025 work on engineering
reviews and the ASPICE assessor literature both land on the same point: a
review is better served by artifacts with their links intact than by a
document that flattened them.

SO IT IS MECHANICAL BY CONSTRUCTION. The agent fills the form as it does
today. The engine renders. No extra step, and the page cannot drift from the
evidence because it IS the evidence.

### All ten pages land in i19, and none of them are spread (owner ruling, 2026-08-15)

THE PROGRAMME WAS SPREAD ACROSS TEN ITERATIONS AND IS NOT ANY MORE. Every
milestone one-pager, and the combined deck, land in i19 emit.report.

| what | where |
| --- | --- |
| M0 kickoff to M9 release, all ten pages | i19 emit.report |
| the combined deck | i19 emit.report |

THE OWNER'S REASON, 2026-08-15. The one-pager needs their input, and the
enablers must run as fast as possible. A page assigned to an enabler puts an
owner decision on the critical path. i19 is a judgment iteration where the
owner already sits, and the deck already landed there, so the whole programme
goes where its input already lives.

IT CAME OFF i28 FIRST AND BY NAME. M0 kickoff was i28's row. i28 is the cloud
enabler, and keeping it free of owner input is the whole point of the move.

WHAT THE MOVE COSTS, stated rather than hidden. The spread had an argument and
that argument is now dropped:

- The first two pages were to teach the template and make the rest cheaper.
  Now all ten are learned in one iteration.
- Run order meant each page existed before the iteration after it needed to
  look at one. Now no iteration has a one-pager until i19 lands.

WHAT SURVIVES THE MOVE UNCHANGED. Each iteration WALKS every milestone, so
any iteration can build any milestone's page — that is why the reassignment is
legal at all. And J1 was always the assembly point; it is now the build point
too, so the deck stops being assembly of parts built elsewhere and becomes one
piece of work.

### What the research settled, so it is not re-derived

THE CONTENT SHAPE IS THE PYRAMID: the conclusion first, three to five
supporting blocks, evidence beneath each. BLUF at the top — the recommendation
before anything else. Numbers rather than adjectives.

THE HOUSE FORMAT ALREADY EXISTS and the one-pager should not invent a second
one: assertion-evidence (Michael Alley), one claim carried by evidence beside
it, never a bullet list. meth-story-slideshow holds it, with `---` between
slides and `|||` splitting the halves.

NASA NPR 7123.1A APPENDIX G WAS READ IN FULL, and most of it does not
transfer. Two of its ideas were considered and DROPPED as already ours:

- "Available to participants prior to the review" is our entry conditions, and
  ours is stronger. NASA lists what must be available because the pack is
  paper; our claim guard refuses the gate while any upstream form is
  incomplete. A missing input gives us a shut gate, not a thin pack.
- "Updated X" — the delta framing — is raid-debt-delta-default-views, already
  rescheduled to i15.

WHAT DID TRANSFER became a gate rule rather than a one-pager feature: every
review's first entrance criterion is that the previous review's open items are
closed or carry a plan. That is now two rules — a Repayment section on every
debt, and an override that must name a register entry. Both live where gates
are defined, and the one-pager shows them for free because it projects the
gate.

## Two mechanical checks for i11's bundle (2026-08-15)

i11 is the engine-fix bundle of named defects. Two more, both from i12's retro,
both small and both with their rule already written down.

- A DEBT WITHOUT A REPAYMENT SECTION REFUSES. The check row is already in
  machines/items/raid.md, mirroring the assumption's Probe rule. Six standing
  debts predate it and want the section adding.
- A VERDICT OF `pass with overrides` REFUSES WHILE raid_additions SAYS none.
  The rule and its measurement are in meth-gate-review.md.
