---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: tsp-the-arrival
type: "[[test-spec]]"
statement: An arrival that fails is reported and never mistaken for one that succeeded, the declared runtime floor is read and never edited, and the hook never costs the session.
method: test
verifies:
  - req-the-arrival-never-costs-the-session
  - req-the-declared-runtime-floor-is-read-never-edited
files:
  - tests/arrival.test.ts
---

## Scope

Everything the arrival decides BEFORE it spawns a lane, and the shape of what it
hands back afterwards.

- The runtime judgment, and that the declaration it reads is left untouched.
- The hook exiting zero over an arrival that exited non-zero.
- The opt-out announcing itself rather than skipping silently.
- Every step accounting for itself in one shape.
- A fetch that cannot succeed degrading rather than stopping.

WHAT IS DELIBERATELY OUT, and why. RAISING A LANE. That is a spawn, a port and a
wait, and paying it per case on every battery run buys a branch that
nesting.test.ts and the live walk already exercise. The arrival's idempotent
path is demonstrated rather than tested, and write-requirements says so.

## Steps

Every case in the referenced file is one step, and the case name states its
claim.

1. `a runtime below the declared floor stops the arrival, and the declaration
   is left alone` — the judge-never-adjust half of the runtime row.
2. `an arrival that stops at the runtime places no cage` — a stopped arrival
   leaves nothing half-placed.
3. `the hook survives an arrival that fails, and says so` — the quiet
   direction, pinned: exiting zero over a failure is the silent failure the
   scope names.
4. `SE_NO_ARRIVE skips the hook, and says that it skipped` — an opt-out that
   announces itself rather than looking like a success.
5. `every step accounts for itself in the same shape` — one shape, so a
   failure names its own step instead of reading as "the server is not there".
6. `an unreachable remote degrades the refs step and stops nothing` — the
   arrival carries on and the account is what reports it.

## Why the failing direction is the one pinned hardest

A CAGE THAT DENIES TOO MUCH FAILS LOUDLY: the agent hits a refusal and says so.
A cage that denies too little fails silently — the agent holds a native tool,
uses it, and nothing anywhere calls that wrong.

So the cases here are weighted toward the quiet direction. Two of the six check
that something is SAID: the hook announcing a failed arrival, and the opt-out
announcing a skip. Both would pass trivially if the code simply did nothing, and
both are written to fail in exactly that case.

## Steps

EVERY CASE IN THE REFERENCED FILE IS ONE STEP. The load-bearing ones, and why
each earns its place rather than the whole list restated.

- THE ARRIVAL ITSELF runs end to end, which is the control. Without it a suite
  of failure cases can all pass while nothing works.
- A RUNTIME BELOW THE FLOOR STOPS THE ARRIVAL, and the declaration is left
  alone. Two claims in one case on purpose: the stop, and the fact that
  nothing was edited to make it possible.
- AN ARRIVAL THAT STOPS PLACES NO CAGE. This is the case that matters most. A
  half-arrived machine with no cage is an agent that believes it is caged and
  is not, which is the worst failure this area can produce.
- THE HOOK SURVIVES A FAILED ARRIVAL AND SAYS SO. The requirement is that the
  arrival never costs the session, and a hook that dies with the arrival costs
  exactly that.
- SKIPPING IS LOUD. The escape hatch says that it skipped, so a session that
  quietly did nothing cannot look like one that succeeded.
- EVERY STEP ACCOUNTS FOR ITSELF IN THE SAME SHAPE. This is what makes the
  other cases readable at a failure, because one sentence names one step.
- AN UNREACHABLE REMOTE DEGRADES RATHER THAN STOPS. The boundary case on the
  one input the machine does not control.

THE ORACLE IS THE NAMED STEP, not the exit code. Every failure of the first
cloud run presented as one symptom that pointed at the wrong step in six of
seven cases, and that is the defect these steps exist to prevent.

THIS SECTION WAS ADDED 2026-08-19, at i9's author-tests, because the spec
carried a test method and no Steps. The cases were read before it was written;
nothing here is copied from the file.
