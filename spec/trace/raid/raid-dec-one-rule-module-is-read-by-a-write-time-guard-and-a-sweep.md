---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: raid-dec-one-rule-module-is-read-by-a-write-time-guard-and-a-sweep
type: "[[raid]]"
kind: decision
statement: A rule about which modules may reach an outside capability is stated once in one module, and read by two callers with different reach - a write-time guard handed one file, and a sweep handed the tree.
owner: the maintainer
trigger: a third caller appears that wants to hold its own copy of the predicate, or the write-time guard is asked to read the corpus
status: decided
impact: If this proves wrong, the rule is stated in two places that drift apart, and the write path and the sweep disagree about what is legal without either of them being able to say so.
breaks_how_badly: crippling
how_likely: conceivable
source_refs:
  - "[[cand-the-narrow-guard]]"
  - "[[req-a-preflight-check-asks-the-reader-where-it-looked]]"
  - evidence/evaluate-set.md — the front has one member and it is this candidate
  - evidence/graft-onto-the-winner.md — the grafted design scores 4, 3, 3, 4, 3, 3
---

## What was decided

ONE MODULE HOLDS THE RULE. It exports a predicate over a single string, a
reader of the registry naming which modules hold a door, and a reader of the
departure list.

TWO CALLERS READ IT AND NEITHER HOLDS A COPY.

- The write-time guard is handed the root, one path, and the content being
  written. It reads at most one file from disk.
- The sweep is handed the tree and answers completeness.

THE SPLIT IS BY REACH, NEVER BY AUTHORITY. Neither caller decides anything the
other does not, and both consult the same registry and the same list.

## Where the shape comes from

[deliverable/engine/widgets.ts](deliverable/engine/widgets.ts) already stands
in exactly this shape for one rule. It is 186 lines with six exports, and three
callers read it: the write path, the sweep, and a test.

THIS DECISION GENERALISES IT. What changes is the predicate and the two lists,
not the shape.

## Rejected options

### Buy the rule from a configured checker

`@biomejs/biome` 2.5.6 is already installed and ships `noRestrictedImports`,
which this tree does not enable. One configuration stanza would turn it on.

WHY IT LOST. The rule has NO IMPORTER AXIS. Every option it takes — `paths`,
`patterns`, `group`, `importNames`, `allowImportNames`, `importNamePattern` —
describes what is imported. None describes who is importing.

A DOOR RULE IS A RULE ABOUT THE IMPORTER: everybody is refused and the door is
allowed. The bought rule can only refuse the door alongside everyone else.

Two routes recover the importer and both reshape something. A folder per door
means every door must BE a folder, and this tree's nearest thing to a door is a
file. A per-file suppression comment scatters the departure list across the
tree, which costs the coverage answer.

### Hand the capability to each module instead of letting it import one

The only option on the chart that removes the problem rather than governing it,
and the only one aiming at rank 1 on the ranked failure modes.

WHY IT LOST. Its own load-bearing assumption was measured and falsified. It
assumed the composition points are few; there are 29 command-line entry points,
and 29 of the 81 disk-reaching modules ARE those entry points.

Nothing in the language enforces the handing, so the guarantee rests on nobody
importing directly — a rule again, wearing a structure's clothes.

### Leave the tree as it is

81 modules reach the disk with no rule stating who may.

WHY IT LOST. It scored zero on five of six criteria and was dominated by every
other candidate.

## Consequences

- A THIRD CALLER IS CHEAP AND A COPY IS NOT. Anything wanting the rule imports
  the module. A caller that reimplements the predicate is the defect this
  decision exists to prevent.
- THE WRITE PATH NEVER READS THE CORPUS. It is bounded to the file in front of
  it, which is what keeps it inside the one-second call budget with two orders
  of magnitude to spare.
- THE TWO CALLERS MAY DISAGREE DELIBERATELY, in one line. The existing rule lets
  a file that already trips the predicate keep being edited, and the sweep
  reports it anyway. That asymmetry is a feature and it survives.
- A BREAK THAT ARRIVES WITHOUT A WRITE IS INVISIBLE until the sweep runs, and
  the window is the sweep's interval. That is accepted, and
  [[raid-asm-every-write-that-adds-a-departure-passes-through-the-lane]] carries
  the counterexample that already stands.
- THE RULE SITS AT RANK 3 of the four ranked failure modes: refused with a
  remedy. This decision buys a check, never a guarantee.
