---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: dsp-the-door-sweep
type: "[[design-spec]]"
statement: The whole-tree check that asks the rule module the same questions the write guard asks, and reports every module reaching a conversation with no declared departure.
realizes:
  - el-door-sweep
  - if-door-rule-to-door-sweep
  - if-departure-list-to-door-sweep
files:
  - deliverable/engine/bin/sweep.ts
---

## Responsibility

It answers completeness. The write guard answers about one file at a time and cannot see a break no write arrived with — a rename, a merge, a registry line deleted out from under a module still reaching.

The sweep asks the same questions of the whole tree.

### It is no longer a second opinion

THIS CHANGED AT THE PROTOTYPE GATE, and it is the sharpest constraint on this design.

`exp-which-channels-add-a-departure-without-a-path-the-guard-can-judge` measured 38 of 178 engine modules reaching a shell. A shell command carries no path a write-time guard can resolve into a target, so the guard cannot be complete.

The sweep carries that coverage instead. It stops being a second opinion and becomes the only complete check.

### What it deliberately does not do

It holds no predicate. Both crossings below carry the rule from `dsp-the-door-rule`, and a copy here would be the second place holding one truth that this whole record is about.

## Interface

### if-door-rule-to-door-sweep

An in-process call, so the crossing has no clock of its own and its bound is inherited.

What flows: the door table, the reach predicate, and the stray finder, asked of the whole tree rather than of one file.

### if-departure-list-to-door-sweep

Also in-process, and it goes THROUGH the rule module rather than around it. The sweep never opens `deliverable/machines/doors.md` itself.

What flows: the departures for each door, path to reason.

That indirection is the point. Two readers of one file would drift, and only their disagreement would be visible.

## Behavior and constraints

### It must reuse a pass that already ran

`exp-where-does-the-sweep-s-runtime-actually-go` measured three cost classes, and they span two orders of magnitude.

- A rule over frontmatter already parsed, doing a lookup: about 1 ms.
- A rule over content already read, running a regex: 15 to 19 ms.
- A rule that walks and reads the tree itself: 91 to 125 ms.

THIS RULE MUST NOT BE THE THIRD KIND. `markerHits` already is: it is a second full pass over the same 3117 files the corpus sweep has just read, and it costs the same as a standalone walk.

The door rule reads the ENGINE's TypeScript files, not the spec corpus, so it does not ride the corpus pass. It rides the widget guard's pass instead, which already walks the same tree and costs 42 to 56 ms whole.

### Its own runtime has nothing watching it

`raid-risk-the-sweep-s-own-runtime-has-no-criterion-watching-it` records this, and this record demonstrated it rather than arguing it: the corpus crossed 3000 nodes, an assumption's own trigger fired on exactly that, and nobody read it until a spike went looking.

The sweep runs at 1066 ms today against a two-second line, and 72 percent of that is per-node walk, read and parse — the half no rule author controls.

### It reports rather than refuses

A break the corpus already carried lands and reports. A break THIS write arrived with is refused, because the author is present and one edit closes it.

That seam turns on who caused it rather than on how serious it is, and `guidance/refusals.md` states it under SE-C-138.

### It fails loudly on an empty tree

A sweep that finds nothing must not report green. `note-c545c46b8e56` records the existing defect: run from the wrong directory the sweep prints `0 node(s) under spec in 0 ms` and then `markers green`, which is a corpus of zero passing every check.

The door rule inherits the sweep's own strictest line instead: a class it cannot check reports itself unchecked rather than passing silently.

## Rationale

### Why it lives in the existing sweep rather than a new binary

One place already answers "is the tree consistent with its own rules", and it runs on every boot. A second binary would be a second answer to one question.

`deliverable/engine/bin/sweep.ts` already carries the widget guard in exactly this shape, under the name `strays`.

### What the reader must be told

Each door's `governs` line states its own coverage limit. A reader of the sweep's output must be able to tell "nothing found" from "nothing looked at", and 38 modules hold a channel this rule cannot see.

dependency-cruiser has the same blind spot for the same reason, because it reads imports too. That is the category's limit rather than this design's, and saying so is not an excuse for leaving it unsaid.
