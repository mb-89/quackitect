---
id: i54-everything-exported-has-a-door-a-sweep-o
status: open
started: 2026-08-26T10:40:37.828Z
opened: 2026-08-20T19:35:31.935Z
goal: "Everything exported has a door: a sweep over every entry point replaces the hand-written list of two, and the working code nobody can reach gets a surface."
vision: "THE PROBLEM. The guard that checks entry points can be got at walks a hand-written list holding two of them. Everything else exported goes unchecked.\n\nWHAT THAT ALREADY HID. Two working pieces of code sit behind no door at all. One reports which of three conditions a given folder is in. The other lists what a built system has altered by itself since it was made. Tests exercise both, so they work. No surface exposes either, so nobody can ask them anything.\n\nWHAT DONE LOOKS LIKE.\n\n- The guard sweeps every exported entry point rather than a list somebody maintains by hand.\n- Anything exported and reachable from no surface is named, and the answer is either a door or a deletion.\n- The two found so far get their door, so the capability the tests prove is a capability somebody can use.\n\nWHY THESE TWO ARE ONE PIECE. The second is what the first failed to catch. Building the sweep without giving the found code a door leaves the report true and useless; giving these two a door without the sweep fixes the instances and not the hole.\n\nWHY IT SUITS AN UNATTENDED RUN. The sweep is mechanical: the export list is in the source, and the surfaces are enumerable. Only the door design for the two found pieces needs judgment, and that is small."
inputs:
  - "wt-a-guard-checks-that-entry-points-can-be-got-at-and-it-walks-"
  - "wt-two-working-pieces-of-code-sit-behind-no-door-at-all-one-rep"
depends_on: []
---

# i54-everything-exported-has-a-door-a-sweep-o

## Goal

Everything exported has a door: a sweep over every entry point replaces the hand-written list of two, and the working code nobody can reach gets a surface.

## Rough vision

THE PROBLEM. The guard that checks entry points can be got at walks a hand-written list holding two of them. Everything else exported goes unchecked.

WHAT THAT ALREADY HID. Two working pieces of code sit behind no door at all. One reports which of three conditions a given folder is in. The other lists what a built system has altered by itself since it was made. Tests exercise both, so they work. No surface exposes either, so nobody can ask them anything.

WHAT DONE LOOKS LIKE.

- The guard sweeps every exported entry point rather than a list somebody maintains by hand.
- Anything exported and reachable from no surface is named, and the answer is either a door or a deletion.
- The two found so far get their door, so the capability the tests prove is a capability somebody can use.

WHY THESE TWO ARE ONE PIECE. The second is what the first failed to catch. Building the sweep without giving the found code a door leaves the report true and useless; giving these two a door without the sweep fixes the instances and not the hole.

WHY IT SUITS AN UNATTENDED RUN. The sweep is mechanical: the export list is in the source, and the surfaces are enumerable. Only the door design for the two found pieces needs judgment, and that is small.

## Inputs

- wt-a-guard-checks-that-entry-points-can-be-got-at-and-it-walks-
- wt-two-working-pieces-of-code-sit-behind-no-door-at-all-one-rep

## Owner ruling, 2026-08-26 — the one door principle

The owner widened this record on the day it was entered. The words were
theirs; the shaping below is the walker's, and the owner corrects it.

THE PRINCIPLE, as they put it: one door per capability, and we adhere to it a
lot. This record is the opportunity to rework what already exists and work the
principle in, rather than to add one more sweep beside the others.

THREE DOORS WERE NAMED.

- DISK. Nothing reaches disk except through the warm model, unless there is a
  good reason against it.
- THE REASONS AGAINST. Even the exceptions go through a door of their own, so
  an exception is declared rather than improvised.
- THE INTERNET. Reaching outward gets a central door too, and that door earns
  its keep by improving what passes through it. Guidance for a search, and a
  place the results are kept.

WHY THE EXCEPTION DOOR MATTERS MOST. A rule with undeclared exceptions is not a
rule, and nothing can count the exceptions. A rule whose exceptions are
declared in one place can be measured, reviewed and tightened.

THESE ARE IDEAS, NOT ORDERS. The owner said so in as many words, and said any
of them may be dismissed where it does not make sense. A dismissal is recorded
with its reason.

## What the principle costs here, measured

MEASURED 2026-08-26 over deliverable/engine, deliverable/cage and
deliverable/machines. 180 source files scanned. The scripts are in the call
log under this session's se_run refs.

93 of 180 files reach disk or the network directly: 398 disk call sites and 52
network call sites.

THE DISK SITES SPLIT THREE WAYS.

- The door and its neighbours: 5 files, 6 writes, 22 reads. These ARE the door.
- Bin scripts and entrypoints: 28 files, 31 writes, 118 reads. Several run
  before any door exists, so these are hatch candidates rather than targets.
- Engine core: 50 files, 117 writes, 272 reads. This is where a rule bites.

SEVEN FILES CARRY 64 OF THE 117 CORE WRITES: session.ts, iterations.ts, run.ts,
sessionclaims.ts, benchmark.ts, produce.ts, sessionforms.ts.

THE ENGINE HAS NO DOOR OF ITS OWN. 79 engine modules import node:fs directly.
files.ts and web.ts exist but face the AGENT, not the engine — files.ts opens
with "drop-in replacements for Read / Write / Edit / ls / Glob".

SO THEIR IMPORTER COUNTS ARE NOT ADHERENCE FIGURES. files.ts has 5 importers
and web.ts has 1. Read as adherence those look damning and would be a wrong
finding, because engine modules were never their customers.

THERE IS NO WARM MODEL. There are six private in-memory caches, in vault.ts,
trace.ts, vocabulary.ts, rigor-matrix.ts, machines/compile.ts and
iterations-draw.ts. None knows about the others.

ONE INTERNAL SEAM DOES EXIST AND IS WELL ADHERED. paths.ts, the path jail, has
20 importers. The pool already records its hole in
wt-enginesearchts-never-reaches-the-one-path-visibility-seam-in.

WHAT IS NOT MEASURED. Whether any given site SHOULD go through a door. The
count is the size of the question, never the size of the defect.

## The pattern is already built here once, for widgets

deliverable/machines/widget-exemptions.md carries the whole shape, and this
record generalises it rather than importing one from outside.

- ONE RULE. Only a module the editor registry names may emit widget markup.
- ONE DOOR. The editor registry at deliverable/engine/editors/index.ts.
- ONE DECLARED HATCH. One bullet per file: the path, an em dash, the reason.
- THE REASON IS LOAD-BEARING. Its own words: a bullet with no reason is ignored
  by the reader, on purpose.
- THE HATCH IS FINDABLE. Its own words: a hatch nobody can find is the same as
  no hatch, so the list lives where a person can read it rather than inside the
  engine as a constant.
- TWO CALLERS, NO SECOND COPY. A write-time refusal, SE-C-146, and a whole-tree
  sweep for a break no write arrived with.

### One transcribed word is unresolved

The owner dictates by voice. One sentence reached this session as "a single
gate for Cisco as a sampling like this might also be interesting".

No control here is called Cisco. It is read as a further example of the same
principle rather than as a named thing.

Nothing is built on the literal word. The question stands for the owner, and
the reading rule is guidance/voice.md under reading the owner.
