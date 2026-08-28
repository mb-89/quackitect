---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: exp-where-does-the-sweep-s-runtime-actually-go
type: "[[experiment]]"
statement: How much of the sweep's runtime is per-node work and how much is per-rule, measured by timing each phase in its own process across three rounds?
probes:
  - raid-risk-the-sweep-s-own-runtime-has-no-criterion-watching-it
  - raid-asm-the-conformance-checks-stay-affordable-as-the-corpus-grows
timebox: three timed runs of the sweep's own phases
form: script
chunk: none — the whole corpus was swept, 3117 nodes and 12.66 MB
faked: none. The real binary and the real corpus were timed. Each phase ran in its OWN process so it got a cold start, matching how the real single call behaves.
fallback: pre-agreed at seeding. If a new rule costs more than the sweep can absorb, rules move off the boot path and run only at verification.
verdict: holds
measured: 2026-08-26. Whole process 1350, 1422, 1415 ms. The corpus sweep is 72 percent per-node walk, read and parse, and under 25 percent per-rule. THE CORPUS-SIZE HALF OF THE RISK'S TRIGGER HAS ALREADY FIRED at 3118 nodes against a bar of three thousand.
folds_to: The corpus-size half of the affordability assumption's trigger has fired at 3118 nodes and nobody read it, which demonstrates the risk rather than arguing it. el-door-sweep gains a hard constraint - reuse a pass that already ran, because a rule that walks the tree itself costs a hundred times one that reads parsed frontmatter.
promote: none - the finding is the product
source_refs:
  - rank-unknowns, the seeded pick
  - deliverable/engine/bin/sweep.ts — the binary timed
---

## Setup

Two scripts were used. One timed the phases in a single process, which gives warm figures. The other ran ONE phase per process, so every phase paid a cold start the way the real binary's single call does.

Three rounds of each. The corpus is 3117 nodes and 12.66 MB.

## Result

HOLDS ON COST. THE TRIGGER HAS ALREADY FIRED ON SIZE.

### The trigger nobody was watching

`raid-asm-the-conformance-checks-stay-affordable-as-the-corpus-grows` fires on a corpus above three thousand nodes. The corpus is 3118.

Nothing noticed. That is the risk this spike probes, demonstrated rather than argued: THE SWEEP'S OWN GROWTH HAS NO CRITERION WATCHING IT, so its trigger passed unread.

The other clause of that trigger has not fired. The sweep runs at 1066 ms against a two-second line.

### Whole-process wall clock

Three runs: 1350 ms, 1422 ms, 1415 ms.

The binary's own printed corpus figure across the same three runs: 1059 ms, 1132 ms, 1124 ms.

### Per phase, cold

- walk and read, 3117 files: 125, 127, 139 ms
- YAML parse: 707, 708, 614 ms
- `outsideVocabulary`: 238, 194, 311 ms
- `ruleFindings`: inside the noise floor
- `markerHits`: 125, 91, 96 ms
- `strays`, the widget guard: 56, 42, 43 ms

Warm, in-process, two of those tighten a lot. `outsideVocabulary` runs at 206, 199, 195 ms. `ruleFindings` runs at 1.4, 0.6, 0.3 ms, and that is the honest figure for it.

`strays` splits as `surfaceFiles` 18.7, 16.3, 16.3 ms; `emitters` 21.8, 19.2, 19.4 ms; `exempted` 0.1 ms in all three rounds.

### Per-node against per-rule

Inside the corpus sweep, the per-node work — walk, read, parse — is 762, 851, 807 ms. That is about 72 percent of the phase.

The per-rule work is `outsideVocabulary` at roughly 200 to 250 ms plus `ruleFindings` at about 1 ms. Under 25 percent combined.

YAML PARSING ALONE IS THE LARGEST SINGLE COST, at 614 to 708 ms.

GROWTH LANDS ON THE PER-NODE HALF, which no rule author controls.

### What one more rule costs, and it spans two orders of magnitude

- A rule over frontmatter already parsed, doing a lookup: about 1 ms.
- A rule over content already read, running a regex: 15 to 19 ms.
- A rule that walks and reads the tree itself: 91 to 125 ms.

`markerHits` is the third kind. It is a second full pass over the same 3117 files the corpus sweep has just read, and its cost matches the standalone walk-and-read figure almost exactly.

`strays` never touches the corpus at all. It walks the engine's own TypeScript files, so its 42 to 56 ms does not grow as the corpus grows.

### Spread, so the figures are read correctly

Three runs of the whole binary vary by 72 ms, about 5 percent.

The corpus sweep timed standalone varies by 197 ms, about 16 percent.

### What it means for the design

A NEW RULE IS AFFORDABLE IF IT REUSES A PASS THAT ALREADY RAN. The door sweep can be the 1 ms kind or the 15 ms kind at no meaningful cost.

It becomes the 100 ms kind the moment it walks the tree itself, and that is a design choice rather than a property of the rule.
