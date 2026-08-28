---
id: i54-everything-exported-has-a-door-a-sweep-o
status: shipped
closed: 2026-08-26T16:03:59.941Z
carried_count: 3
carried:
  - Every new behavior carries its check, and the battery is green at rest — raid-debt-the-door-regime-is-built-for-four-doors-and-proved-with-one (gate-implementation.md)
  - Walker (deliverable/machines/methods/meth-spawn-hands.md) — raid-iss-the-spawn-check-refuses-the-answer-its-own-guidance-calls-legitimate (spawn-for-requirements.md)
  - command and tool docs — raid-iss-no-write-verb-announces-the-door-refusals-before-firing-them (sweep-consistency.md)
started: 2026-08-26T10:40:37.828Z
opened: 2026-08-20T19:35:31.935Z
goal: "Everything exported has a door: a sweep over every entry point replaces the hand-written list of two, and the working code nobody can reach gets a surface."
vision: |-
  THE PROBLEM. The guard that checks entry points can be got at walks a hand-written list holding two of them. Everything else exported goes unchecked.

  WHAT THAT ALREADY HID. Two working pieces of code sit behind no door at all. One reports which of three conditions a given folder is in. The other lists what a built system has altered by itself since it was made. Tests exercise both, so they work. No surface exposes either, so nobody can ask them anything.

  WHAT DONE LOOKS LIKE.

  - The guard sweeps every exported entry point rather than a list somebody maintains by hand.
  - Anything exported and reachable from no surface is named, and the answer is either a door or a deletion.
  - The two found so far get their door, so the capability the tests prove is a capability somebody can use.

  WHY THESE TWO ARE ONE PIECE. The second is what the first failed to catch. Building the sweep without giving the found code a door leaves the report true and useless; giving these two a door without the sweep fixes the instances and not the hole.

  WHY IT SUITS AN UNATTENDED RUN. The sweep is mechanical: the export list is in the source, and the surfaces are enumerable. Only the door design for the two found pieces needs judgment, and that is small.
inputs:
  - wt-a-guard-checks-that-entry-points-can-be-got-at-and-it-walks-
  - wt-two-working-pieces-of-code-sit-behind-no-door-at-all-one-rep
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

## Owner ruling, 2026-08-26 — do not resize

THE OWNER'S WORDS: "No. Don't resize."

WHAT IT ANSWERS. The kickoff gate set the change size to major and the
motivation gate's follow-up scheduled a sampling probe that could have
re-sized the record down to minor. The guide had put that possibility to the
owner twice, as the largest lever on how long this record takes.

THE RULING CLOSES IT. Major stands. The wide scope stands. The record is not
collapsed to the seeded sweep whatever the sampling probe returns.

WHAT THE PROBE IS STILL FOR. It still runs and it still matters, because it
decides WHICH sites the disk door covers. What it may no longer do is change
the change size or the shape of the machine below the kickoff.

SO A LATER STATE MUST NOT READ THE FALSIFIER AS A SIZING QUESTION. The
motivation gate's red-team box names "re-sizes the record to minor" as the
consequence of a falsifying result. That consequence is withdrawn by this
ruling, and the gate is left standing rather than reopened, because the
finding it rests on did not change — only the owner's decision about what to
do with it.

## The carving finding, 2026-08-26 — doors are named for purposes

THIS IS THE MOST IMPORTANT FINDING IN THE RECORD SO FAR, and it says the
carving this record started with is wrong.

THE OWNER ASKED THE QUESTION PLAINLY: is there a door to the disk, then a door
to syscalls, then a door to the web? They added that badly bundled interfaces
are what make a system hard to understand.

THE ANSWER IS NO, AND IT COMES FROM THE PRIMARY SOURCE. Alistair Cockburn,
"Hexagonal Architecture" (Ports and Adapters), HaT Technical Report 2005.02,
at alistair.cockburn.us/hexagonal-architecture/.

HIS DEFINITION: "A port identifies a purposeful conversation." Not a resource,
not a device, not an API surface.

THE WORKED FAILURE IS THE OWNER'S QUESTION, ANSWERED BY A REAL SYSTEM. A
weather-alert system had four interfaces "identified and discussed by
technology, linked to purpose": a wire feed, answering machines, a GUI, a
database. The paper describes them facing a maintenance and testing nightmare.

THEIR FIX, VERBATIM: "Their shift in design was to architect the system's
interfaces by purpose rather than by technology, and to have the technologies
be substitutable (on all sides) by adapters."

SO A DISK DOOR AND A WEB DOOR ARE TECHNOLOGIES. They belong behind an adapter,
not in the name of the door.

HOW MANY. Cockburn favours "a small number, two, three or four ports", and says
both extremes — one per use case, or one in and one out — are wrong. He also
says choosing the wrong number does no particular damage, so it stays a matter
of intuition.

### Doors do map onto the neighbours, and he says so

THE OWNER WONDERED WHETHER DOORS GO INTO THE NEIGHBOURS. They do.

VERBATIM: "These observations lead us to follow the system's use case context
diagram and draw the primary ports and primary adapters on the left side of the
hexagon, and the secondary ports and secondary adapters on the right."

THE SPLIT IS PRIMARY AGAINST SECONDARY. A primary neighbour drives the
application. A secondary one the application drives. It is the same distinction
use cases draw between a primary and a secondary actor.

THIS RECORD ALREADY DREW THE CONTEXT DIAGRAM at draw-context, with seven
neighbours. Splitting those seven into driving and driven is now owed, and it
is cheap.

### Two independent lines of evidence agree

THE FIELD SCAN says carve by purpose, from the man who named the pattern.

THE FALSIFIER PASS FOUND THE SAME THING WITHOUT LOOKING FOR IT. Of 64 judged
writes, 30 share one shape: read a claim, record or form file, modify it, write
it back, none atomic and none hash-checked, plus the directory creation before
it. The reading hand concluded the object that pays is a claim writer rather
than a disk facade.

A CLAIM WRITER IS A PURPOSE. A DISK FACADE IS A TECHNOLOGY.

### What it changes

THE DOORS THIS RECORD BUILDS ARE NAMED FOR CONVERSATIONS. On the evidence so
far the candidates are persisting a claim, reading the corpus, and reaching
outward for an answer.

THE OWNER'S SEARCH GUIDANCE AND RESULT STORE BELONG IN THE THIRD ONE, and the
reason is now principled rather than convenient. Both are about the PURPOSE of
asking a question, not about HTTP.

### Two corrections this finding forces on earlier states

THE EXCEPTION RESEARCH WAS OVERWEIGHTED, and the owner said so. It was one of
three ideas and it received a six-system comparison while the carving question
received none. The work stands; its weight in the record was wrong.

ONE TRANSCRIPTION QUESTION IS CLOSED. An earlier message reached this session
as "a single gate for Cisco as a sampling". The owner has since written
"syscalls" plainly. The reading was right and the record no longer carries it
as open.

## The neighbours walk, 2026-08-26 — seven neighbours, four doors

The owner asked what the carving finding means for OUR doors and for OUR
neighbours. This is the answer, and it is measured rather than argued.

The walk asked one question of each of the seven neighbours drawn at
draw-context: what does this system say to it, and what does it say back? Two
neighbours whose sentences read the same share a door. A neighbour with no
sentence holds no door.

### The result

| neighbour | the conversation | side |
| --- | --- | --- |
| toolchain | store and retrieve bytes at an address | secondary |
| driven-project | store and retrieve bytes at an address | secondary |
| git | record and retrieve versions of the tree | secondary |
| web | ask the outside world a question | secondary |
| agent-harness | serve one lane call | primary |
| obsidian | none — it changes the tree without speaking | neither |
| cloud-host | none — it is a condition, not a party | neither |

### What it changes

THE OWNER'S THREE DOORS SURVIVE, WITH ONE JOINED AND ONE DROPPED. The disk
door and the web door stand. The syscall door does not appear at all — nothing
in this system holds a conversation with the kernel that is not already the
byte conversation or the process conversation. What appears instead is a
version door, for git, which none of the three named.

THE DISK DOOR IS WIDER THAN IT LOOKED. The toolchain and the driven project
are one conversation, not two. A door built for this tree that cannot reach a
declared root is half a door.

THE SWEEP IS NOT A CONVENIENCE. Obsidian holds no conversation, so no door can
ever govern a hand edit. The sweep is the only mechanism that reaches that
path, which is why the requirement demands two callers of one rule rather than
one.

NOTHING HAS TO BE RENAMED, because no engine-facing door exists yet. The
finding changes what gets BUILT, not what gets renamed. The agent-facing lane
is a different customer and is untouched.

### Why four is worth saying

Cockburn's paper favours "a small number, two, three or four ports". The walk
was not aimed at that number — it asked what each neighbour says, and four fell
out. Two independent routes landing on the same small count is why this is on
the record rather than in a note.

The primary and secondary split comes free with it. One door is driven by the
outside (the harness calls us). Three are driven by us. That is the left and
right of Cockburn's hexagon, and it was the first thing the follow-up owed.

### The honest note about scope

This iteration was chosen as mechanical work an unattended box could walk
alone. It is not that any more, and it stopped being that when the one-door
principle was added to it. The original selection criterion no longer holds,
and saying so is worth more than pretending the record still fits it.
