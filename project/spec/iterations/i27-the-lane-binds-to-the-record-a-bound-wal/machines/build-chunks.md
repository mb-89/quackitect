---
steps:
  - id: seam-resolve
    statement: "the resolver answers with the store beside the path, so a caller can tell which tree replied"
    depends_on: []
    realization: code
  - id: seam-route
    statement: "a call naming a different owner is routed rather than refused as an escape"
    depends_on: []
    realization: code
  - id: seam-sweep
    statement: "route the modules that read the filesystem for themselves through the resolver, lint.ts first"
    depends_on: [seam-resolve]
    realization: code
  - id: answer-bound
    statement: "declare a bound for an answer, return a small one whole, and serve the rest of a large one by reference"
    depends_on: []
    realization: code
  - id: refusal-remedies
    statement: "a not-standing refusal names the verb that fixes it, a reopen says what it will drop, and a resubmit carries the bless"
    depends_on: []
    realization: code
  - id: form-checks
    statement: "the voice lint runs at submit, a grade outside its catalogue refuses, and a node-table cell never truncates in silence"
    depends_on: []
    realization: code
  - id: delta-compose
    statement: "compose a record's machine from its own folder first and trunk second, and name every file that came from the record"
    depends_on: [seam-resolve]
    realization: code
  - id: supervisor-level
    statement: "entry levels the tree, rebases the delta and commits what it brought, or stops the record with the conflict named"
    depends_on: [delta-compose]
    realization: code
  - id: supervisor-watch
    statement: "a deadline on the call, a beat on the process, and a previous composition kept until the replacement has served"
    depends_on: [supervisor-level]
    realization: code
  - id: core-process
    statement: "one core process owning trunk, the ledgers, the routing table and the heavy-slot count"
    depends_on: [supervisor-watch]
    realization: code
  - id: satellite-process
    statement: "one satellite per agent, rooted in its record's tree and running its composed machine"
    depends_on: [core-process]
    realization: code
  - id: channel
    statement: "the local channel between core and satellite, carrying the lease and the beat and naming the store on every answer"
    depends_on: [satellite-process]
    realization: code
---

# The build plan

Twelve chunks. The order is shaped by two lenses at once, and both are
recorded here so a reviewer can judge the order rather than only the pieces.

## RISK FIRST, which decides what goes at the front

The seam is the riskiest piece and the one everything else leans on.
[[raid-risk-a-write-lands-in-the-wrong-tree-silently]] is an ISSUE rather than
a risk: [[exp-one-seam]] recorded it happening twice on 2026-08-14, with the
paths.

So `seam-resolve` and `seam-route` start first and start together. If the seam
cannot be made total, everything downstream is built on sand and the record
should stop rather than continue.

## PARALLEL FLOW, which decides the shape

Six lots, and every later lot leans on exactly one earlier lot.

- THE SEAM: seam-resolve, seam-route, seam-sweep.
- THE BOUND: answer-bound. Leans on nothing.
- THE ENGINE'S OWN DEBTS: refusal-remedies, form-checks. Lean on nothing.
- THE DELTA: delta-compose. Leans on the seam.
- THE SUPERVISOR: supervisor-level, supervisor-watch. Leans on the delta.
- THE PROCESSES: core-process, satellite-process, channel. Lean on the
  supervisor.

FOUR CHUNKS CAN START AT ONCE: seam-resolve, seam-route, answer-bound,
refusal-remedies. A fifth, form-checks, joins them. That is the fan-out the
lots exist to buy.

## Why the processes come last rather than first

They are the largest build on the chart and they are the part that cannot be
tested without the rest. The seam, the delta and the supervisor each turn a
red test green on their own; the processes turn none until all three stand.

A walking skeleton would have put a thin core-and-satellite first. It was not
taken, because the risk here is not integration between the parts. It is
whether the seam can be made total at all.

## What each chunk turns green

The eight reds authored at author-tests are the work list.

- seam-resolve: every resolution names the store it resolved to.
- seam-route: a call naming trunk is routed rather than refused.
- delta-compose: a record's own folder may override an engine file.
- supervisor-level: entry levels the tree, and a stale override stops the
  record.
- answer-bound: the bound exists, a small answer is whole, and a large one
  carries a reference.

seam-sweep, supervisor-watch, refusal-remedies, form-checks and the three
process chunks turn no authored red green. They are owed by the design, by
the register, or by defects this record found while walking, and each says
which above.

## What is deliberately not here

NO CHUNK FOR HOLDING A RECORD'S WORK IN MEMORY. It is adoptable by every line
and deferred pending a profile, so building for it now would be building for
an undecided choice.

NO WORKER POOL. The heavy-slot LEASE rides in `core-process` instead, on the
owner's ruling of 2026-08-14 and for the reasons [[dsp-core-and-satellite]]
records.
