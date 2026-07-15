# compose-reference — exact shapes for composing an iteration

The cheatsheet so you never re-derive formats by reading example files. Load this at
`engage start` step 5 (plan & bake). All facts here are load-bearing.

## Trace edge model (semantic direction) — CONNECTIONS MODE
**JSONL connections is THE lane for new work.** Every scaffolded workspace (`start init`,
`start stubs`) defaults `edges = "connections"` (adr-scaffold-edges-connections); frontmatter
edge keys are the LEGACY lane for pre-migration workspaces pending `quack migrate-edges` —
the engine's global default stays frontmatter solely so legacy boards keep loading.
Edges live in `spec/connections/<kind>/edges.jsonl`, one `{"src":"<id>","dst":"<id>"}` line per
edge (one line per dst for a multi-target relation). In connections mode the strict parser
REFUSES frontmatter edge keys (`refines:`, `verifies:`, `addresses:` in the node file)
(go-edge-mode). `depends_on:` stays frontmatter (it is wiring, not a
semantic edge). The directions:
- use-case  refines → need  (`spec/connections/refines/edges.jsonl`)
- requirement  refines → use-case  (optional frontmatter `depends_on: [req-…]`)
- design — **inline in code, never a .md** — `// design: <id>  implements: <req-id>` … `// enddesign`
  (engine scans product/ `.go`/`.py`/`.md`; the marked region's hash folds into the design node)
- test  verifies → requirement (or `req-….<n>` for a numbered statement)  (`verifies/edges.jsonl`)
- ADR  addresses → requirement | use-case | need | model | declared element  (`addresses/edges.jsonl`)

Derived coverage rules (used as `verify: coverage:<rule>` on executed subtasks):
`req-traced`, `req-has-test`, `req-has-design`, `adr-traced`, `designs-realized`, `tests-pass`, `tests-red`.
`tests-red` = every executed test carries a `red-observed` attestation (via `quack observe-red <test>`) at its current hash — test-first RED before the build.

## Trace node frontmatter — in `spec/iterations/<iter>/`
```
---
id: uc-x
type: usecase | requirement | test | adr | need
refines:  [need-y]        # usecase; (requirement uses refines: [uc-…])
verifies: [req-…]         # test only
addresses:[req-…]         # adr only
adjudicated_by: user      # adr only (the stamp vocabulary)
statement: one line — this IS the spec
class: review
verify: selftest:<name>   # test only, optional
killer: true|false
---
## Rationale (not load-bearing)
```
Trace nodes are **content** — never blessed, never DONE/OPEN; they only ripple SUSPECT downstream.

## Gate/subtask frontmatter — in `spec/iterations/<iter>/tasks/` — NO `type:` field
```
---
id: <itag>-m<n>-<name>
statement: one line
milestone: M<n>
class: review | executed
parent: <itag>-m<n>-<parent>     # only nested build steps
killer: true|false
verify: coverage:<rule>          # only executed/derived subtasks
depends_on: [<ids>]
---
```
- Milestone gate: id `<itag>-m<n>-gate`, `class: review`, `killer: true`, `depends_on` = all its subtasks.
- **Milestone-monotonic:** each milestone's subtasks `depends_on` the prior milestone gate.
- **ORDER IS NOT DEPENDENCY (owner law).** A `depends_on` edge states a real prerequisite — nothing else. Never inject an edge just to order parallel subtasks: it delays their readiness, forces false walk order, and blocks the merged hand-off. Subtasks that can be done at the same time all hang off the prior gate, flat. The report orders ties deterministically by ID; the walk serves ready checks by ID.
- **Real prerequisites still chain:** a build step that builds ON another depends on it; `build` depends on its children's completion; a verification that consumes an artifact depends on the step that makes it.
- **Killers ripen WITH the closing gate.** Do not chain filler subtasks BEHIND a killer — with flat wiring the agent-blessable fillers finish first, and the remaining ready killer(s) + gate arrive as ONE combined pager (adr-pager-handoff): one hand-off, one y, every bless recorded individually.
- **ids are iteration-unique** (namespace by `<itag>`, e.g. `i6-m2-gate`). A reused id silently shadows; `quack lint` fails on duplicates.

## Field prefill, provenance, and the hand-off brief
Mint pre-fills every schema field (go-mint-prefill): the schema default where one exists, an
explicit `TBD - propose or veto` marker where none does — no field reaches the user blank.
Each value's source lives in the node's `provenance:` frontmatter block (one indented
`field: source` line; adr-provenance-in-node) and is IDENTITY — a veto edit and its provenance
move under one hash. There is NO standing register (adr-handoff-html): the gate's HAND-OFF
BRIEF derives the colors from that provenance — open decisions (red, dealt one card at a
time with the agent's default and the lettered options), decided-already (green: the
adjudicated filled dot and the agent-confident outlined dot never mix), defaults riding
(yellow, off the page). A decision node authors its alternatives as an `## Options` body
section (`A) …` paragraphs) and its ruling as a lettered `decided_via` — the card then reads
"Bless selects B)". A bless records every stated default in the user's name, on any channel
(page tap or phone card); killer decisions resolve ONLY over a hand-off channel or a console
bless — every other lane refuses.

## Rigor → milestones
- **systematic** = M1–M8. **lean** = L1–L5 → seed as **M1–M5** (L1→M1 … L5→M5). **vibe** = no gates.
- lean's derived coverage per milestone (see `rigor/lean/checklist.md`):
  M2 `{req-traced, req-has-test}` · M3 `{adr-traced}` · M4 `{designs-realized, tests-pass}`.

<!-- design: method-ears-block  implements: req-ears-authoring.2 :: The compose reference carries the five EARS pattern shapes and the authoring instruction, integrated with the tests-red and roles content; new requirement statements at systematic rigor are authored EARS-shaped at compose time and checked by quack lint; historical non-EARS statements carry explicit ears exempt markers citing adr-grandfathers-historical. -->
## EARS — requirement statements (systematic rigor)
Author every NEW `type: requirement` statement in one of the **five EARS shapes**, with **shall**:
- **Ubiquitous** — `The <system> shall <response>.`
- **Event-driven** — `When <trigger>, the <system> shall <response>.`
- **State-driven** — `While <state>, the <system> shall <response>.`
- **Unwanted behaviour** — `If <condition>, then the <system> shall <response>.`
- **Optional feature** — `Where <feature>, the <system> shall <response>.`

No **weasel words** (should, may, appropriate, quickly, user-friendly, robust, flexible, …) — state
the checkable claim. `quack lint` checks **every** requirement statement. Historical non-EARS
statements carry an explicit `ears: exempt - <reason>` marker citing their retire-or-retrofit ADR
(adr-grandfathers-historical) — blessed history is never retrofitted, and no exemption survives
without its recorded decision. A genuinely non-EARS requirement carries `ears: exempt - <reason>`
in its frontmatter (the reason is required; lint counts exemptions). This applies to requirement
statements only — tests keep verifying (`verifies:`, tests-red discipline) and roles keep binding
exactly as above.
<!-- enddesign -->

## Voice binds authored nodes
`product/brand/voice.md` binds every authored `statement:` field. A node is prose like chat and
the book. Re-read voice.md before authoring any node batch. One thought per sentence. Aim for
fifteen words. Define each term at first use. Never join clauses with dashes.

## No plan-lock bless (step 5d)
**Do NOT `quack bless --all` at plan time.** It marks every milestone gate DONE, makes `next` a no-op,
and shows a falsely-green board (an un-built M5 reads green). After composing, gates start **OPEN**.
Executed/derived checks compute live and stay RED (`designs-realized`, `tests-pass`) until the build.
Walk with `next`; **bless each milestone gate one at a time as you genuinely complete it**, via its
handover pager (`quack progress --pager <gate>`). `quack lint` "requirement has no design" holes are
**expected** pre-build; don't chase them.

## Model nodes (structural models)
Project-global, in `spec/models/` (like decisions). `quack mint model --kind <kind>` seeds the
skeleton from the registry (`method/models/*.md` — the file IS the registration). Frontmatter:
`id: model-…`, `type: model`, `kind: <registry kind>`, `statement: <the question it answers>`.
The body is the fenced ```mermaid block — the authored file IS the checked truth; the ledger
hashes the EXTRACTED graph (cosmetic churn never ripples). Elements are allocated AHEAD of code;
the design-marker id is the join; a realized region no model allocates is the sky-fall lint.
Models are trace CONTENT — never blessed, never a gate.

## Structuring methods (optional, M3/M4)
The SAME way a model kind is picked from `method/models/`, a matrix-based structuring method MAY
be picked from the method register (`spec/methods/meth-dsm*`, `meth-dmm`, `meth-mdm`) when
grouping elements into modules or ordering them into a layering: DSM clustering for grouping,
DSM partitioning/tearing for a layering, DSM banding for within-layer parallelism, a DMM/MDM for
a cross-domain mapping. A menu, never a mandate — the systematic checklist's M3/M4 lines are
where it is offered.

## Book render laws (owner law)
Structural learnings land in the TEMPLATE layer (method/templates + the pooled views) BEFORE
or WITH any renderer change - template↔book drift is forbidden. The renderer decides
table-vs-prose deterministically: a homogeneous set of typed nodes is a TABLE (never authored
prose); a statement renders once (row brief; the expand adds only what the row lacks); section
numbers derive at render time; cross-references are links (name + brief), never copies.

## Cross-cutting qualities (NFRs) — the owner's convention
Reserve ONE need for qualities (e.g. `need-qualities`: "the system meets its cross-cutting
quality attributes, ISO/IEC 25010"). Its USE-CASES are the ISO quality characteristics
themselves (`uc-q-reliability`, `uc-q-security`, `uc-q-performance`, ...), and each quality
requirement refines its quality use-case. This keeps `coverage:req-traced` exact — every
requirement, functional or not, refines a use-case — with zero engine special-casing, and
the qualities stay sorted instead of scattering across feature use-cases. (Canonized i0020;
first applied in the Benjamin workspace.)

## Where needs live
Cross-cutting / dogfood needs: `spec/trace/` (`need-engage`, `need-note`, `need-review`, `need-workspace-drive`).
Iteration-specific needs: the iteration dir. **Fold new work under existing needs — do not sprawl new ones.**

## Roles (the implementation seam) — `method/roles/README.md`
The implementation milestone's testdesigner / implementer / tester are **pluggable** (file-based Strategy).
Default binding is **inline** (the driving agent) — omit and behaviour is unchanged. To swap, add a
`roles:` block to `iteration.md` (resolves `iteration.roles` ▸ `type.roles` ▸ `default`):
```
roles:
  testdesigner: default   # | subagent:<name> | tool:spec-kit | tool:openspec
  implementer:  default
  tester:       default
```
The engine never runs a role; it only gates the output (`tests-red`, `designs-realized`, `tests-pass`).
