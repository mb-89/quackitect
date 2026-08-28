---
unreachable_refs:
  - cand-the-program-route
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: el-update-runner
type: "[[element]]"
statement: Runs an arriving update program against the vehicle's tree as it now stands, and leaves what the program did readable and unkept until a person accepts it.
kind: new
realization: make
group: the-bootstrap
implements:
  - fn-run-a-governed-walk.take-an-update
source_refs:
  - raid-dec-an-update-arrives-as-a-program
  - raid-tripwire-i16-a-structural-migration-cannot-be-written
  - raid-dec-a-copy-is-a-clone-that-keeps-its-history
  - cand-the-program-route
  - vp-the-engine
---

## What it does

AN UPDATE ARRIVES AS A PROGRAM, and this element is what runs it. The program
says WHAT to change and never WHERE, so it does not care how the vehicle has
restructured the files it touches.

THAT IS THE ONE PROPERTY THE WHOLE DESIGN TURNS ON. A patch series or a
three-way merge both address by location, so a vehicle that moved a file has
already lost. A program addresses by identity and finds the file wherever it
now sits.

IT RUNS ONE VERSION SPAN AT A TIME. Taking three versions at once would make
the result unreadable, and readable is the only thing standing between a
migration and a silent wrong answer.

NOTHING IS KEPT UNTIL A PERSON ACCEPTS IT. The result is left in the tree
unstaged, so the vehicle's owner reads a real diff rather than a report about
one.

## What it leans on, and where that is written down

THE INVENTORY MAKES THE UPDATE DECIDABLE. [[req-overlay-drift-reported]] clause
three says it plainly: the report of what the vehicle changed is the only thing
that can say which of those changes an arriving update touches. Without it this
element is blind and step 7 of [[uc-vendor-and-overlay]] cannot be performed at
all.

SO THE INVENTORY IS AN INPUT, NEVER A BY-PRODUCT. That is why the reporting
element stands apart rather than being folded in here.

## The failure this element does not prevent

A MIGRATION THAT RUNS, SUCCEEDS AND PRODUCES SOMETHING WRONG. The program is
authored upstream by somebody who has never seen this vehicle, and nothing here
can know what the author meant.

WHAT IT DOES INSTEAD IS PUT THE RESULT IN FRONT OF SOMEBODY. That is a weaker
guarantee than a merge conflict, honestly weaker, and it is the winner's
sharpest weakness against the criterion this iteration ranked first.

A PERSON WHO DOES NOT READ THE DIFF HAS NO SIGNAL. That is recorded on
[[flow-applied-change]] and it is not solved here.

## The tripwire that would falsify the whole route

[[raid-tripwire-i16-a-structural-migration-cannot-be-written]] IS THE ONE
CREDIBLE FLIP. If an engine change turns out not to be expressible as a program
— a restructuring nobody can write as instructions — this element has nothing to
run and the design has to fall back.

ITS PROBE AND ITS FALLBACK ARE ON THE TRIPWIRE, not repeated here.

## What crosses its boundary

IN: `flow-update-program`, crossing the system edge from upstream.

IN: `flow-vehicle-inventory`, from [[el-change-reporter]], across
[[if-change-reporter-to-update-runner]]. That is this element's one interface.

OUT: `flow-applied-change`, crossing OUT to the person who has to read it.

NOTHING GOES BACK TOWARD THE ENGINE. The direction is inward only, which is
what keeps [[req-nothing-a-copy-does-reaches-its-source]] intact while an
update still arrives.

## The realization concept

MAKE. A program format, a runner for it, and the discipline of leaving the
result unkept.

THE FORMAT IS THE EXPENSIVE HALF and it is not designed here. What a program
may say, and what it may not, decides whether an engine change can be expressed
at all — which is exactly what the tripwire probes.
