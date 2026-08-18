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

## Why the failing direction is the one pinned hardest

A CAGE THAT DENIES TOO MUCH FAILS LOUDLY: the agent hits a refusal and says so.
A cage that denies too little fails silently — the agent holds a native tool,
uses it, and nothing anywhere calls that wrong.

So the cases here are weighted toward the quiet direction. Two of the six check
that something is SAID: the hook announcing a failed arrival, and the opt-out
announcing a skip. Both would pass trivially if the code simply did nothing, and
both are written to fail in exactly that case.
