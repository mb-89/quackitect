---
kind: report
story: sty-read-why-the-code-departs-from-its-own-design
spec: tsp-the-door-regime-s-static-attributes
performed: 2026-08-26
performed_by: reviewer
---

# Demonstration — read why the code departs from its own design

## What was demonstrated

A person opens the departure list and reads why each module is allowed past the
door.

## Who performed it, and why not the builder

A REVIEWER HAND, spawned fresh with no share of the build's context, registered
in the call log under the reviewer role. The question
is whether a stranger who finds a module doing something the design forbids can
tell a decision from a mistake. The hand that wrote the reasons cannot answer
that about its own writing.

It was given the story, the demonstration step and the lane rule, and nothing
about what it should conclude.

THIS IS THE ONE NO TEST CAN STAND IN FOR. A test can prove the list parses. It
cannot prove the list reads.

## What the reader found

TWO DEPARTURES STAND, both below the marker in
`deliverable/machines/doors.md`, both parsing under the rule's own shape.

- `deliverable/engine/doors.ts` — the door itself.
- `deliverable/engine/run.ts` — a module that writes only logs it owns.

## Per-departure verdict

THE DOOR'S OWN DEPARTURE LANDS. It is self-referential and says so: the rule
that decides who may read and write has to read the tree to answer. The reader
confirmed it in the file itself — two direct reads, and a header comment stating
the same thing from the other side. The whole argument arrives in one sentence
and takes about thirty seconds to check.

THE LOG MODULE'S DEPARTURE LANDED, AND WAS OFF BY ONE. Its counts were exact:
three module-local helpers, ten sites. Its jail was not. Eight of the ten land
under `.se/jobs`; two write `.se/estimates.jsonl` one level above, through a
different helper. The reason won its authority by sounding measured, and one of
its measured phrases was wrong.

THAT WAS VERIFIED AND CORRECTED. `deliverable/engine/run.ts` lines 1481 and 1482
write through `seDir` and `estimateLog`, not `jobDir`. The departure now says so.

## What the reader could not learn, and it is the finding

THE PAGE HID ITS OWN SCALE. It closed with "Two departures are declared below",
which reads as *two modules talk to the disk and here is why both are fine*. The
truth is that most of the engine does, and two of them explained themselves.

THE PAGE ARGUES THAT A TYPED COUNT WOULD GO STALE, and the reader let that
argument stand rather than endorsing it. A hand-written number goes stale the first
time somebody adds an import, and a hand-written count standing beside a computed
one is the defect the whole file exists to stop.

WHAT WAS MISSING WAS THE POINTER. Nothing sent the reader to the sweep, named the
command, or said the number is large. The page now does all three, still without
printing a figure of its own.

## What the demonstration does not show

WHETHER THE RULE IS BINDING TODAY. It warns rather than refuses while the
undeclared count is this high, and blocks once it is near zero. The sweep says
so; the list did not, and a reader of the list alone would conclude the rule was
already live.

THE SILENT MALFORMED CLASS, from the list's own page. A bullet naming a path with
no `.ts` extension matches nothing and is not honoured. The write guard refuses
one, so it cannot arrive through the lane. A person editing the file by hand is
exactly the person who needs that warning, and the "How to add one" section does
not carry it.

## Verdict

PARTLY SUCCEEDED, AND THE PART THAT FAILED IS FIXED. A person can open the list
and read a real, checkable reason for each module named. Before the two
corrections above, that same person would have left believing the engine's disk
boundary was two exceptions wide.
