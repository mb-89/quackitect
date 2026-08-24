---
minted_in: i62-background-work-reports-its-own-end-the-
id: tsp-background-work-reports-its-own-end
type: "[[test-spec]]"
statement: An entry stops reporting work that has ended, a live but silent process is left alone, settling twice keeps the first outcome and records a disagreement, every entry names its wait's bound, expiry yields to a real ending, one instance takes a workspace, and starting a hand is recordable from any state.
method: test
verifies:
  - req-the-engine-holds-what-it-launched-and-asks-whether-it-exists
  - req-a-run-closes-its-own-entry-when-its-process-exits
  - req-settling-an-entry-is-idempotent-and-the-first-outcome-stands
  - req-every-wait-declares-a-bound-and-expiry-acts
  - req-one-instance-holds-a-folder-and-its-port
  - req-registering-a-spawned-hand-is-accepted-wherever-the-walk-stands
files:
  - deliverable/tests/work-lifecycle.test.ts
priority: must
source_refs:
  - uc-close-the-record-of-work-that-has-ended
  - uc-bound-every-wait-and-act-on-expiry
  - uc-hold-a-folder-against-a-second-engine
---

## Steps

Every case in the referenced file is one step, and the case name states its
claim. Fifteen cases stand.

- an entry whose process is gone stops reporting itself as running
- an entry whose process is alive and silent is left alone
- a run that exits normally settles its own entry without waiting for a sweep
- settling an entry twice keeps the first outcome and never reopens it
- a second settle that disagrees about the outcome is recorded, not discarded
- every registered operation carries the bound its wait will reach
- a workspace is taken by one instance and a second is told which folder is held
- a workspace held by another process refuses the take by the bind itself
- recording that a hand was started is accepted wherever the walk stands
- a call is exempt only when the whole call is a registration
- work the bound closed still reports how it actually ended
- a process the engine can see running is never closed by its bound
- one folder's sweep leaves another folder's work alone
- one entry that cannot be asked never hides the entries after it
- the answer an agent reads says how long the wait is bounded to

## Which cases stand behind each must story

THE DEMONSTRATION EDGE IS NOT HERE. This spec's method is test, and a story is
carried by a demonstration-method spec —
tsp-background-work-closes-itself-on-a-live-machine. This section says which
cases stand behind each story, which is a different claim.

THE RUN THAT DIED WHILE NOBODY WAS HOLDING IT is demonstrated by the first
three cases and by the last four. Its first step is the account read that
closes a dead entry. Its second is existence asked rather than
responsiveness, which the alive-and-silent case guards. Its fourth is a run
closing itself on exit, proved by forcing a sweep FIRST and finding nothing
left for it to close.

THE WAIT THAT SAYS HOW LONG IT WILL WAIT is demonstrated by the bound cases.
Its first step is the answer naming the bound, which is asserted on the ACCOUNT
rather than on the listing, because the account is what a pulling agent reads.
Its second and third are expiry acting and the outcome naming the bound, with a
live process left alone as the guard on both.

## Why the second case is the guard on the first

AN IMPLEMENTATION THAT SETTLES ON SILENCE PASSES THE FIRST AND FAILS THE
SECOND. That pair is the whole existence-not-responsiveness ruling, expressed
as two cases rather than as a comment.

Removing either one leaves a suite that a wrong design can satisfy.

## What is already green, and it is mapped honestly

ONE CASE PASSES TODAY. `settleOperation` returns early on an entry that is not
running, at deliverable/engine/run.ts line 1247, so a second settle cannot
reopen one.

IT IS INCLUDED ANYWAY because the design deliberately has two closers and
nothing else pins that behaviour. A later change that dropped the early return
would break the design silently.

## What the red cases need from the build

- The registry must hold the live end of what it registered. It takes no way to
  name one today, and the test file records that gap as a cast rather than
  hiding it.
- Settling must keep a record when two closers disagree about the outcome.
- An entry must carry the bound of the wait on it, and whether that bound was
  measured or defaulted.
- Taking a workspace must be a thing the engine does, and a second take must be
  refused with what holds it.
- The gate must accept the hand registration from any state, and widen nothing
  else the same verb carries.

## What this spec does not verify

THE WINDOWS HALF. Two of the assumptions under these rows were probed on POSIX
only, and no case here runs on Windows. That is a gap in the evidence rather
than in the spec, and it is recorded on the assumption nodes.
