---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: cand-os-rooted
type: "[[candidate]]"
name: "OS rooted"
statement: "one engine process per bound record, rooted by the operating system, so the engine holds no resolution rule at all"
picks:
  - "[[opt-one-process-per-record-rooted-by-the-os]]"
  - "[[opt-one-rule-covers-reads-and-writes-alike]]"
  - "[[opt-the-common-path-needs-no-tree-the-rare-one-names-it]]"
  - "[[opt-fan-the-method-out-to-every-tree]]"
  - "[[opt-name-the-resolved-tree-in-every-answer]]"
  - "[[opt-the-claim-file-registers-the-tree]]"
  - "[[opt-one-resolution-seam-not-a-rule-per-tool]]"
  - "[[opt-restart-only-this-records-engine]]"
---

## Why this one

THE ONE CANDIDATE THAT WRITES NO RESOLUTION RULE. Every other line on the
chart adds engine code that decides which tree a path names. This one deletes
the question by starting the process in the right place.

The shell hole closes for free, because a child inherits the working
directory. That hole is open by construction today: SE-C-134 guards five
write verbs and cannot watch se_run, and the i8 field report of 2026-08-12
records the bypass being used.

It is also the only line whose core mechanism is tested by somebody else.
Process working directories are older and better exercised than anything we
would write.

## What it sheds

The single session. The mirror, the claim ledger and the note inbox are
machine-wide and single, so several engine processes must share them or hand
them to one owner. Neither is free and neither is designed.

It also multiplies against the self-hosting exception rather than answering
it. raid-asm-engine-serves-from-the-bound-tree stays open, because this
product still edits the engine it is running.

## How it works

One engine process per bound record, started with its working directory set to
that record's tree. Relative paths then resolve by the mechanism every program
on the machine already uses, and the engine writes no resolution rule at all.

THE SEAM THAT MATTERS IS THE SHARED STATE. The mirror, the claim ledger, the
note inbox and the call log are machine-wide and single. Several engine
processes cannot each own them, so one of two things must happen: a single
owner process serves them over a local channel, or they move out of the
process entirely and every instance reads them from disk with a lock.

Neither is designed, and this is the only candidate that needs an answer.

The shell hole closes for free, because a child process inherits the working
directory. That hole is open by construction today and the i8 field report of
2026-08-12 records it being used.

Method is fanned out to every tree, so no process needs to reach outside its
own. Every answer still names the tree it came from, because a reader looking
at four processes' logs needs to tell them apart.

## What it costs

PROCESS MANAGEMENT, WHICH IS NEW MACHINERY RATHER THAN A NEW RULE. Starting,
supervising and reaping one engine per bound record, plus whatever serves the
shared state.

Against that, the resolution itself costs NOTHING to build and nothing to
test. It is the only candidate whose core mechanism was written and exercised
by somebody else.

A walk that spans two records needs two processes talking, and today one
session reaching into another record is normal work rather than a leak.

## What it leans on

- THAT THE SHARED STATE CAN BE SPLIT OR SERVED. Unanswered. The mirror is a
  server today, so it is the natural owner, but nothing says the note inbox or
  the claim ledger can live behind it.
- THAT PER-RECORD PROCESSES ARE AFFORDABLE. Twenty-seven worktrees stood on
  this machine on 2026-08-13. Nobody has measured what twenty-seven engine
  processes cost, and the one-second rule applies to every one of them.
- THAT THE SELF-HOSTING EXCEPTION SURVIVES IT. raid-asm-engine-serves-from-
  the-bound-tree stays open under this candidate rather than being answered by
  it, because this product still edits the engine it is running.

## What happens when the engine changes

ADDED 2026-08-14, when the chart gained a row it was not drawn against.

ONE PROCESS PER RECORD, SO ONE PROCESS RESTARTS. An engine edit made inside a
record brings that record's process up again. Every other record keeps
running the version it started with, untouched.

AGAINST req-an-engine-change-applies-in-its-own-record THIS PASSES, and it
passes on machinery this line already carries for a different row. The
per-record process was found for rooting; it answers the engine row for free.

THE COST IS A RESTART, AND THE RESTART IS AFFORDABLE HERE. The walk resumes
from the repository by construction - the pull recomputes position from disk
and the reading is re-owed - so a restart costs a start-up rather than a
walk. Measured 2026-08-14: 67 ms cold per process, ~36 ms warm, with the
engine module load excluded. What a full engine load costs is unmeasured.

WHAT IT ADDS TO THE SHED PILE. With N records open there are N engine
versions running, and nothing shows which record runs which.

## Answers to the demands this record had not addressed

WRITTEN 2026-08-14, when the owner ruled that an unanswered demand is an
incomplete line rather than a weakness. Each answer is what THIS design
gives.

### A write lands where it is meant

THIS IS THE ONE DEMAND THIS LINE ADMITS IT DOES NOT MEET, and the admission
is in its own text above: the operating system resolves a relative path
climbing out of the record perfectly happily, and nothing refuses it.

THE ANSWER THIS LINE CAN GIVE: the same seam it already picks - one resolver
no tool may bypass - compares the resolved path against the record's own root
and refuses what falls outside. The working directory makes the common case
free; the seam catches the case the working directory would serve.

SO THE GAP IS A RULE THIS LINE HAS NOT WRITTEN, not a limit of the shape. It
is stated here so a judge rules on the design rather than on the silence.

### A resolution is proven by read-back

ADOPTABLE AND NOT PICKED. A process rooted in the record can read back through
its own working directory, which is the same mechanism that did the write.

### Version control resolves like every call

THE PROCESS'S WORKING DIRECTORY ANSWERS IT FOR FREE. A version-control
command run by a record's process inherits that directory, so it operates on
that record's tree by the platform's own rule, with no engine code involved.
This is the cheapest answer on the chart.

REACHING TRUNK is the case it does not cover: that needs the core-owned path
that this line does not have and [[cand-core-satellite]] does.

### A surface resolves to what it shows

THIS LINE'S OWN TEXT NAMES IT AS BROKEN. The mirror, the claim ledger and the
note inbox are machine-wide and single, and the panel must now draw several
processes with nothing saying how.

THE ANSWER IT COULD GIVE: one owner process serves the surfaces and asks each
record's process for its content. That is the shape [[cand-core-satellite]]
makes its design, and this line leaves undesigned.

### A method change reaches without a step-out

THE FAN-OUT IS THE ANSWER, and it is the pick this line already takes. Method
is written once and landed in trunk and every open tree in one act, from
wherever the agent stands. Nobody leaves their record to change method.

THE WRITING AGENT'S OWN PROCESS RECEIVES IT with every other, so their next
call reads the changed method from their own tree.

WHAT IT COSTS is what this record already records for the fan: a copy in
every tree, and nothing signalling which copy answered.

### Entry levels the record's tree

STARTING A RECORD'S PROCESS IS THE MOMENT. The supervisor brings the tree
level with trunk and commits what it brought before the process serves its
first call.

THAT IS CHEAPER HERE THAN ANYWHERE ELSE ON THE CHART, because a process start
is already happening and nothing is in flight to disturb. A record with no
process has no walk to run against a half-levelled tree.

A PARTIAL LEVELLING MEANS THE PROCESS DOES NOT START. The supervisor either
brings it up level or reports why it could not, which is the same all-or-
nothing the fan-out already demands.
