---
form: decompose-structure
by: agent
signed_off: 2026-08-19T11:33:06.455Z
authors: agent
files: null
---

# Evidence form / decompose-structure

## current_situation

The structure does not move. Nineteen elements stand and none is added, renamed or removed.

ONE EDIT WAS LEGAL AT THIS SIZE and one was made: the single new function allocates into el-arrival, beside the seven arrival functions already there.

No new interface is demanded, because the new function consumes and produces flows that already cross the same boundary.

## elements

- el-account
- el-arrival
- el-bootstrap
- el-change-reporter
- el-coupling-disposer
- el-engine-delta
- el-entrypoint
- el-front-desk
- el-holding-pen
- el-method-compiler
- el-mirror
- el-project-producer
- el-query-evaluator
- el-record-store
- el-resolution-seam
- el-test-runner
- el-update-runner
- el-vehicle-producer
- el-walk-engine

## allocation

NINETEEN ELEMENTS, THIRTY-EIGHT FUNCTIONS. Every function is implemented at least once and every element implements at least one.

### The one allocation this state made

`state-which-build-this-is` sits on el-arrival, and on nothing else.

- IT IS AN ARRIVAL ACT. It answers a question about an install, on the machine where the install happened, and that is what el-arrival is.
- IT IS NOT THE ENTRYPOINT'S. el-entrypoint takes a repository, an iteration and a command and produces a walking agent. Asking a version starts nothing, so putting it there would put a path that opens no port inside an element whose whole statement is that it starts one.

### Why the spread is one and not two

A SECOND ELEMENT WOULD SPLIT ONE FACT ACROSS TWO PLACES. The version comes from the manifest, and el-arrival already reads that manifest to judge the runtime against its declared floor. Two elements reading the same file for two questions is the shape that lets them disagree.

### No new owed cell

THE MATRIX DEMANDS NOTHING NEW. The function consumes flow-arrival-request and produces flow-arrival-account. Both already cross the boundary el-arrival sits on, and `account-for-the-arrival` already produces the second of them.

SO NOTHING NEW CROSSES. A cell is owed when a flow runs between two elements that had none between them; this flow runs where a flow already ran.

### The four existing rows this delta's requirements land on

- fn-arrive-on-a-machine.judge-the-runtime, on el-arrival, now also carries the preflight row.
- fn-run-a-governed-walk.serve-a-step, on el-satellite and el-walk-engine in the standing matrix, now also carries the empty-source row.
- fn-run-a-governed-walk.show-where-it-stands, on el-mirror, now also carries the paint row and the reader half of the actor row.
- fn-arrive-on-a-machine.state-which-build-this-is, on el-arrival, carries the version row.

EVERY ONE OF THESE IS AN EXISTING FUNCTION ON AN EXISTING ELEMENT. That is what makes this a minor: the requirements landed on structure that was already there.

## follow_up

author-tests is next and it writes the pins for four of the five rows.

TWO DECISIONS THIS STATE OWED, and both are answered here rather than deferred.

- THE SPLIT IS NOT DESIGNED. The measurement that decides it arrives at verification, which is after every build state. So the item stays written as measure-then-decide, and the honest outcome may be a strike with a number rather than a divided file. Nothing is built for it in M6.
- THE PREFLIGHT FIX DOES NOT CREATE A CIRCULAR IMPORT. preflight.ts already imports from the engine's own modules, and the palette reader sits in render.ts which imports nothing from preflight. The edge runs one way, so asking the reader where it looked is an ordinary import.

THE ESCALATE TELL IS ABSENT. Nothing here wanted a new element or a new interface, which is the tell that would say the architecture is moving and the size is wrong.

## anything_else

WHAT WAS CONSIDERED AND REJECTED: a new element for the version answer.

The argument for it is that a release check is a different concern from an arrival, and one day it may run in a pipeline that never arrives at anything.

The argument against, and the one that wins today, is that an element is a black box somebody maintains. A box whose whole content is one line of output, sharing its input and its output flows with the box beside it, is a boundary with nothing on either side of it.

IF THAT CHANGES — if the release check grows a second question, or runs somewhere el-arrival cannot — the element is minted then, and it is minted with two things to hold rather than one.
