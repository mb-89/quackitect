---
minted_in: i36
id: tsp-supported-harness-serves-one-lane-contract
type: "[[test-spec]]"
statement: A session starting in a supported harness identifies that harness by name and serves the same lane contract inside every limit measured for it, before the first work state is reached.
method: test
verifies:
  - req-supported-harness-serves-one-lane-contract
files:
  - tests/cage.test.ts
  - tests/skills.test.ts
---

## Scope

What every supported harness must have in place before any work starts. Three
claims.

- The harness is IDENTIFIED. The lane knows which host it is talking to, by
  name, and says so.
- The contract is ONE. The same lane verbs, the same refusals, the same
  reading loop, whichever host it is.
- The payloads FIT. No instruction text and no tool description exceeds the
  limit measured for that host.

WHAT IS DELIBERATELY OUT. Feature parity between hosts. A host that lacks
native web search still serves the contract; it simply serves it without that
one exception.

## Approach

DESIGN METHOD: pairwise across two axes — the harness, and the payload class
being measured. Every supported harness is exercised against every payload
class, because a limit that binds on one host is invisible on another.

The limits are DATA, not constants written into the test. A measured limit
per host lives beside the harness list, and the test reads it. A test carrying
its own copy of the numbers proves the copy.

LEVEL: integration. Identification and payload assembly only happen together,
at session start.

DEPTH: high. This is the requirement the whole iteration is named for, and its
failure mode is the expensive one: the lane appears to work, then truncates
something at the boundary and the agent acts on a partial instruction.

## Steps

Every case in `tests/cage.test.ts` and `tests/skills.test.ts` is one step.
Seven cases stand across the two files today.

ONE IS ALREADY GREEN and it carries the parity half directly.

- The deep research skill is projected identically for supported harness
  paths.

FOUR CAGE CASES SUPPORT IT without claiming it, and they stay.

- Every hook script the engine ships is wired somewhere a host actually loads.
- The arrival hook is wired in the root settings, the file a fresh clone
  reads.
- The cage template is the file the installer places, and it parses.
- The stop hook is wired by name, because losing it is silent.

THE FOUR BELOW ARE RED TODAY. Nothing names the host, and nothing measures a
payload against a per-host limit.

- Every supported harness is named in one place, and the list is what the
  tests iterate.
- A session reports which harness it is running in, and the report is
  available before the first work state.
- No instruction payload assembled for a harness exceeds that harness's
  measured limit.
- No tool description served to a harness exceeds that harness's measured
  limit.

## Why the limits are read and not written down twice

A measured limit is a fact about a host, and it changes when the host changes.
Written into a test it becomes a second source, and the day the measurement is
redone the test keeps passing against the old number.

Reading the same data the lane reads means a stale measurement fails
everywhere at once, which is the only way a limit stays honest.
