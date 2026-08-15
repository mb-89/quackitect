---
minted_in: i27
id: cand-judged-path
type: "[[candidate]]"
name: "Judged path"
statement: "the decided i1 answer built whole: one predicate at one seam, governing reads and writes by their own rules"
picks:
  - "[[opt-judge-every-path-in-one-dispatch-pass]]"
  - "[[opt-separate-rules-for-reads-and-writes]]"
  - "[[opt-the-common-path-needs-no-tree-the-rare-one-names-it]]"
  - "[[opt-thin-tree-reads-shared-from-trunk]]"
  - "[[opt-read-back-from-the-tree-the-caller-meant]]"
  - "[[opt-the-claim-file-registers-the-tree]]"
  - "[[opt-one-resolution-seam-not-a-rule-per-tool]]"
  - "[[opt-reload-the-whole-engine]]"
---

## Why this one

IT IS ALREADY DECIDED AND IT WAS NEVER PRICED. raid-dec-two-layer-auth was
ruled at i1 with status decided, and its trigger is word for word any write
landing outside the record from inside a bound walk. raid-iss-cheaper-
alternative-never-compared records that this record argued past it without
comparison.

The thin tree is the other half. raid-dec-thin-tree says a record's worktree
holds only the record's own folder, which is what makes the judgment a
one-line predicate rather than a tree walk.

The read-back covers the case a write-judgment cannot: it proves where the
bytes went rather than trusting the verdict.

## What it sheds

It answers the write case and not the read case. A rule about where a write
may LAND says nothing about where a read may come FROM, and today's worst
measured failure was a READ in the wrong tree.

It also inherits a cost the register hides. The probe of 2026-08-14 found the
worktree holding deliverable, guidance and spec - so raid-dec-thin-tree is
decided and UNBUILT, and this candidate pays to build it rather than
inheriting it.

## How it works

The root never moves and every call's path meets ONE predicate at the single
dispatch point: inside the record is writable, outside is not.

THE THIN TREE IS WHAT MAKES THE PREDICATE ONE LINE. raid-dec-thin-tree holds
only the record's own folder in its worktree, so "inside the record" is a
prefix test rather than a tree walk. The decision's own note says exactly
that.

Shared method is not in the tree at all, so there is no method file to
overwrite. SE-C-134 stops being a rule an agent must remember and becomes a
fact about the filesystem.

THE SEAM THAT MATTERS IS THE COVERAGE, and it is TWO RULES rather than one. A
WRITE resolves into the bound record and nowhere else. A READ resolves
wherever the caller can name and the answer carries the tree it came from.

THE ASYMMETRY IS DELIBERATE RATHER THAN A GAP. The two acts fail differently:
a wrong write corrupts and is found at a merge, a wrong read misinforms and is
found only if somebody checks. And confining reads would break real work -
this record's own ruling of 2026-08-13 says one record reaching into another
is normal work, not a leak to be sealed.

So the read-back proves the write landed where the caller meant. It is no
longer the only thing in this candidate that looks at reads.

The claim file registers each record's tree, which is what the predicate
compares against on a peer machine that has no local worktree.

## What it costs

ONE PREDICATE IN ONE PASS, which is the cheapest guard on the chart - and the
register prices it as already decided rather than as build.

THAT PRICE IS WRONG AND THE PROBE FOUND IT. On 2026-08-14, project/ inside
the bound worktree held deliverable, guidance and spec. The worktree is a full
copy. raid-dec-thin-tree is DECIDED AND UNBUILT, so this candidate pays to
build the thin tree rather than inheriting it.

The trunk read is measured: 2.0 ms per file through one long-lived batch
reader, against 47 to 54 ms if a git process is spawned per read. The batch
reader is the option; the naive shape fails.

The read-back adds one read per write.

## What it leans on

- THAT TWO RULES CAN BE KEPT IN STEP. The write rule is strict and the read
  rule is permissive-and-named, so a divergence between them is a hole that
  reads as working. One rule cannot drift from itself; two can. This is the
  price of the flexibility, and it is the candidate's real weakest point now
  that the coverage gap is closed.
- THAT THE THIN TREE CAN BE BUILT. Decided at i1, unbuilt on 2026-08-14, and
  its own note names the untested half: whether a walk survives the method
  moving under it mid-flight.
- THAT THE BATCH READER HOLDS UNDER LOAD. The 2.0 ms figure is one
  measurement of one shape. Every shared read in every walk now depends on it.

## What happens when the engine changes

ADDED 2026-08-14, when the chart gained a row it was not drawn against.

ONE ENGINE, SO ONE RELOAD. The predicate, the thin tree and the read-back all
live inside a single process. Changing any of them takes effect when that
process restarts, and every open record restarts with it.

AGAINST req-an-engine-change-applies-in-its-own-record THIS FAILS BOTH
HALVES. That is the sharpest result on this row, because this line answers
every other demand on the board and this one it does not answer at all.

THE THIN TREE MAKES IT WORSE RATHER THAN BETTER. Shared code is read from
trunk at the moment it is needed, so an engine edit made inside a record is
not even in the store the running engine reads. The record holds no engine
to change.

WHAT THE FIFTH LINE IS. [[cand-live-engine]] is this line with the in-place
swap in place of the reload, drawn separately so the trade stays visible.

## Answers to the demands this record had not addressed

WRITTEN 2026-08-14, when the owner ruled that an unanswered demand is an
incomplete line rather than a weakness. Each answer is what THIS design
gives. Whether the answer is good enough is a judge's call, not this
record's.

### A resolution is proven by read-back

ANSWERED ALREADY, and it is a pick rather than an addition. This line takes
[[opt-read-back-from-the-tree-the-caller-meant]]: every write closes with a
read from the tree the caller named, so the write is proved by what came back
rather than by its own verdict. A test written against this line proves a
landing by reading it, because that is how the line writes.

### Version control resolves like every call

THE PREDICATE IS THE ANSWER. This line judges every path at one dispatch
pass, and version control is a call with a path. It goes through the same
seam, resolves against the same record, and the answer names the store it
used like every other answer.

WHAT THAT COSTS HERE: the record's tree is thin, so a commit of shared
content has to be a commit against trunk, taken through the seam rather than
around it. The seam therefore needs a trunk-directed write path that the
predicate permits and records, and this line does not have one today.

### A surface resolves to what it shows

THE SURFACES USE THE LANE, AND THE LANE USES THE PREDICATE. The panel, the
forms and the trace views resolve through the same dispatch pass as an
agent's call, so a surface showing a record reads that record and says so.

WHAT IS NEW WORK: naming the record on what is shown. The predicate knows
which record it resolved against; nothing today carries that onto the
surface.

### A method change reaches without a step-out

THIS IS THE LINE'S WEAKEST ANSWER AND IT IS STATED PLAINLY. Shared method has
exactly one copy, in trunk, and the record's thin tree holds none of it. So
changing method means writing to trunk from inside a record.

THE SHAPE THAT WOULD ANSWER IT: the same trunk-directed write path the
version-control answer needs. One seam that permits a named, recorded write
outside the bound record covers both. Without it the walker steps out, and
with it they do not.

### An engine change applies where it was made

NO ANSWER THIS LINE CAN GIVE WITHOUT BECOMING A DIFFERENT LINE. One process
serves every record, so its code is one thing. Changing it changes what every
agent is running, and picking it up needs the process to come back.

THAT IS NOT A GAP IN THE WRITING. It follows from the single process, which
is the line's defining choice. [[cand-live-engine]] is this line with that
choice reconsidered.

### Entry levels the record's tree

THERE IS NO SHARED METHOD IN THE TREE TO LEVEL, which is the thin tree's
whole point. Shared content is read from trunk at the moment it is needed, so
it cannot be stale in a worktree that never holds it.

WHAT STILL NEEDS LEVELLING IS THE RECORD'S OWN FOLDER against its branch, and
entry is where that happens: bring it level, commit what was brought, then
begin.

SO THIS LINE MEETS THE DEMAND BY REMOVING MOST OF ITS SUBJECT rather than by
doing the work. That is a real answer and it is a narrower one than the
demand's authors had in mind, and it is stated that way rather than claimed as
equivalent.

THE HALF IT DOES NOT REMOVE is the engine. The engine is shared and read from
trunk like everything else, so a record cannot hold a stale engine either -
and cannot hold a changed one, which is why this line fails the engine demand.
