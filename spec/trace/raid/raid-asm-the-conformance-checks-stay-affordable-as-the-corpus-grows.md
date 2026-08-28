---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: raid-asm-the-conformance-checks-stay-affordable-as-the-corpus-grows
type: "[[raid]]"
kind: assumption
statement: The conformance checks stay inside their budgets as the corpus grows, so the write guard keeps refusing at the write and the sweep keeps running at the moments the engine chose.
owner: the driving agent
trigger: any write that feels slow, any sweep past two seconds, or a corpus above three thousand nodes
probe: HOLDS today at 1066 ms against a two-second line, and THE OTHER CLAUSE OF THE TRIGGER HAS ALREADY FIRED - the corpus is 3118 nodes, above the three thousand named. The cost is 72 percent per-node walk, read and parse, and under 25 percent per-rule, so growth lands on the half a rule author cannot control. Full result in the 2026-08-26 section below.
probe_2026_08_17: unprobed by i35, and the empty date is filled rather than the verdict invented. The corpus grew this run by 20 nodes — 5 requirements, 7 functions, 6 flows, 1 story, 1 use case — and the sweep stayed green at 1150 nodes in 410 ms. That is a data point on cost, not a probe of the assumption, which is about growth this iteration did not test.
status: probed
probed: 2026-08-26
impact: the guard grows too slow for the write and moves to the sweep, which is a demotion the whole iteration was built to avoid.
breaks_how_badly: abrasive
how_likely: plausible
source_refs:
  - req-a-check-too-slow-for-the-write-moves-to-the-sweep
  - req-a-write-that-breaks-the-corpus-refuses
  - req-a-check-binds-without-engine-code
---

## The assumption

EVERY NUMBER THIS ITERATION RECORDED CAME OFF ONE CORPUS SIZE. The sweep ran
at 327 to 388 milliseconds over roughly 1019 nodes. The write guard was
measured inside the write budget on the same tree.

NOTHING HERE SAYS WHAT EITHER COSTS AT TEN THOUSAND NODES.

## Why it is worth a row rather than a shrug

THE METHOD ALREADY HAS THE ESCAPE HATCH, and that is the danger.
`req-a-check-too-slow-for-the-write-moves-to-the-sweep` says a check that
outgrows the write budget is demoted to the sweep. So a slow check does not
break loudly. It quietly stops being a write-time refusal and becomes a
report somebody reads later.

THAT IS EXACTLY THE FAILURE THIS ITERATION WAS BUILT TO END. The thesis is
that conformance runs at the write, not at a review. A check that drifts into
the sweep has walked the thesis backwards without anybody deciding to.

## Probe

TWO MEASUREMENTS, both cheap.

- Grow a fixture corpus to three thousand nodes and run the sweep. Read the
  wall clock.
- Time one guarded write against that corpus.

WHAT WOULD SETTLE IT: a sweep that scales linearly and a write still inside
its budget. Either number growing faster than the node count is the answer
this row is waiting for.

## Where it was found

THE VALIDATION GATE NAMED IT AND MINTED NOTHING. Its round 2 closed with
"what this gate cannot see: whether the checks stay right as the corpus
grows". That was true and it was prose, so it would have left with the
record.

The release gate's own field asks for assumptions the milestone treats as
true without having established them. This is that, written down.

## Probe result, 2026-08-26

THE TRIGGER HAS FIRED, AND THE ASSUMPTION STILL HOLDS.

### The trigger

This node fires on a corpus above three thousand nodes. The corpus is 3118. Nobody noticed until this probe went looking.

The other clause has not fired. The sweep runs at 1066 ms against a two-second line.

### Where the time goes

Whole process, three runs: 1350 ms, 1422 ms, 1415 ms.

The sweep's own printed corpus figure across the same three runs: 1059 ms, 1132 ms, 1124 ms, over 3117 nodes.

Each phase timed in its own process, so each gets a cold start the way the real binary does:

- walk and read, 3117 files and 12.66 MB: 125, 127, 139 ms
- YAML parse: 707, 708, 614 ms, the single largest cost in the sweep
- `outsideVocabulary`: 238, 194, 311 ms cold, and 206, 199, 195 ms warm
- `ruleFindings`: inside the noise floor cold, and 1.4, 0.6, 0.3 ms warm
- `markerHits`: 125, 91, 96 ms
- `strays`, the widget guard: 56, 42, 43 ms

### Per-node against per-rule

Inside the corpus sweep, the per-node work — walk, read, parse — is 762, 851, 807 ms. That is about 72 percent of the phase.

The per-rule work is `outsideVocabulary` at roughly 200 to 250 ms plus `ruleFindings` at about 1 ms. Under 25 percent combined.

GROWTH LANDS ON THE PER-NODE HALF, which no rule author controls.

### What one more rule costs

Three figures, spanning two orders of magnitude.

- A rule over frontmatter already parsed, doing a lookup: about 1 ms.
- A rule over content already read, running a regex: 15 to 19 ms.
- A rule that walks and reads the tree itself: 91 to 125 ms.

`markerHits` is the third kind. It is a second full pass over the same 3117 files the corpus sweep has just read.

`strays` never touches the corpus. It walks the engine's own TypeScript files, so its 42 to 56 ms does not grow as the corpus grows.

### Spread

Three runs of the whole binary vary by 72 ms, about 5 percent. The corpus sweep timed standalone varies by 197 ms, about 16 percent.

Read the per-phase figures with that spread in mind.
