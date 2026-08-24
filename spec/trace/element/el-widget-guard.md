---
minted_in: i4-the-panel-round-the-archived-iteration-b
id: el-widget-guard
type: "[[element]]"
statement: Refuses any module the editor registry does not name that emits widget markup, so a second surface cannot be written rather than being merely discouraged.
kind: new
realization: make
group: the-walk
implements:
  - fn-run-a-governed-walk.guard-a-write
satisfies:
  - req-a-wrong-act-never-passes-silently
source_refs:
  - raid-the-surface-repeats-a-computed-view-behind-a-guard
  - opt-a-second-surface-is-made-unrepresentable
  - raid-emitting-a-widget-is-detectable-by-a-check
---

ONLY A MODULE THE EDITOR REGISTRY NAMES MAY EMIT WIDGETS. Every other module
that does is a refusal, typed and carrying a remedy like every other refusal
here.

THE RULE WAS ONE EXPORTED ENTRY POINT UNTIL THE PROBE RAN. That reading does
not survive a tree where twenty form editors each emit their own markup and
have to. The registry at `deliverable/engine/editors/index.ts` already says who
owns the widget vocabulary, so the rule compares two lists that both stand
today. It is stronger than the original rather than weaker: an entry point can
grow silently, and a registry cannot.

IT ANSWERS AT THE WRITE WHERE IT CAN, and moves to the sweep where it cannot.
That is this system's own pattern rather than a special case:
req-a-check-too-slow-for-the-write-moves-to-the-sweep says a check that cannot
answer inside the write's budget runs in the sweep and reports, never behind a
flag the author can clear.

SO THE GUARD HAS TWO HALVES. A write that plainly adds an emitter outside the
entry point is refused as it lands. A break the write did not arrive with is
found by the sweep and reported.

Boundary: the dispatched write, and the source tree behind it.

Realization: a rule in the write guard, with the same rule run over the tree
by the sweep, plus a declared exemption list.

## The exemption is part of the design

A TEST FIXTURE, A DIAGNOSTIC PAGE AND A VENDORED COMPONENT all emit markup and
none of them is a second surface. The exemption is declared rather than
silent, and a hatch nobody can find is the same as no hatch.

## What the probe settled

THE PREDICATE IS WRITTEN AND IT DISCRIMINATES. A template literal carrying an
opening block tag, or a tag with a class attribute, flagged 38 of 171 engine
sources on 2026-08-23. Twenty of the 38 are registered editors. `mirror.ts`
flags zero, which is the negative case the predicate had to get right.

SO THE ELEMENT DOES NOT DEGRADE TO A CONVENTION. The assumption
[[raid-emitting-a-widget-is-detectable-by-a-check]] holds, and the axis it was
chosen for stands.

## What is still not established

THE PREDICATE FINDS EMITTERS, NOT DERIVERS. A registered editor that begins
computing its own answers about the walk emits nothing new and passes. That is
a different check and this element does not carry it.
