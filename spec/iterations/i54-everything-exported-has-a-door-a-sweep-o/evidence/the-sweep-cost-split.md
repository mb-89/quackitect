---
form: the-sweep-cost-split
by: agent
signed_off: 2026-08-26T13:35:46.427Z
authors: agent
files: null
---

# Evidence form / the-sweep-cost-split

## current_situation

HOLDS ON COST. The trigger has already fired on size.

### The trigger nobody was watching

`raid-asm-the-conformance-checks-stay-affordable-as-the-corpus-grows` fires on a corpus above three thousand nodes. The corpus is 3118.

Nothing noticed. That is the risk this spike probes, demonstrated rather than argued. The sweep's own growth has no criterion watching it, so its trigger passed unread.

The other clause has not fired. The sweep runs at 1066 ms against a two-second line.

### Whole-process wall clock

Three runs: 1350 ms, 1422 ms, 1415 ms. The binary's own printed corpus figure across the same runs: 1059 ms, 1132 ms, 1124 ms, over 3117 nodes.

### Per phase, each timed in its own process so each gets a cold start

- walk and read, 3117 files and 12.66 MB: 125, 127, 139 ms
- YAML parse: 707, 708, 614 ms
- `outsideVocabulary`: 238, 194, 311 ms
- `ruleFindings`: inside the noise floor
- `markerHits`: 125, 91, 96 ms
- `strays`, the widget guard: 56, 42, 43 ms

Warm and in-process, two of those tighten. `outsideVocabulary` runs at 206, 199, 195 ms. `ruleFindings` runs at 1.4, 0.6, 0.3 ms, and that is its honest figure.

### Per-node against per-rule

Inside the corpus sweep the per-node work — walk, read, parse — is 762, 851, 807 ms. That is about 72 percent of the phase.

The per-rule work is `outsideVocabulary` at roughly 200 to 250 ms plus `ruleFindings` at about 1 ms. Under 25 percent combined.

YAML parsing alone is the largest single cost, at 614 to 708 ms. Growth lands on the per-node half, which no rule author controls.

### What one more rule costs

Three figures, spanning two orders of magnitude.

- A rule over frontmatter already parsed, doing a lookup: about 1 ms.
- A rule over content already read, running a regex: 15 to 19 ms.
- A rule that walks and reads the tree itself: 91 to 125 ms.

`markerHits` is the third kind. It is a second full pass over the same 3117 files the corpus sweep has just read.

`strays` never touches the corpus. It walks the engine's own TypeScript files, so its 42 to 56 ms does not grow with the corpus.

### Spread

Three runs of the whole binary vary by 72 ms, about 5 percent. The corpus sweep timed standalone varies by 197 ms, about 16 percent.

## built

- spec/trace/experiment/exp-where-does-the-sweep-s-runtime-actually-go.md

## follow_up

- `el-door-sweep` must reuse a pass that already ran. As a lookup over parsed frontmatter it costs about 1 ms; as its own walk it costs about a hundred times that. The design chooses which.
- A rule should declare its cost class. Nothing today makes an author say whether they wrote the 1 ms kind or the 100 ms kind, and the difference is invisible until the sweep is timed.
- The fired trigger needs an owner's eye. The corpus crossed three thousand nodes and the assumption's own trigger went unread, which is the risk itself rather than a side finding.
- `markerHits` is a second full pass over files already read. Folding it into the first pass would return 91 to 125 ms with no rule removed.

## anything_else

The risk this spike probes is confirmed by the way it was found. The corpus-size trigger had fired and nothing surfaced it; a spike aimed at a different question had to go looking.

A criterion watching the sweep's own runtime would have said so on the boot after the crossing.
