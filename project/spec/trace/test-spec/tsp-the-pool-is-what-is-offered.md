---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: tsp-the-pool-is-what-is-offered
type: "[[test-spec]]"
statement: What stands open is answered from the repository, completely and identically to both readers, verified by test over the survey.
method: "test"
verifies:
  - "req-open-work-is-answered-from-the-repository-not-a-local-store"
  - "req-a-windowed-pool-answer-says-that-it-was-windowed"
  - "req-the-pool-answers-a-person-and-an-agent-from-one-source"
files:
  - "tests/pool-offer.test.ts"
---

## Scope

The reading half. This is the iteration's own kill criterion made mechanical:
gate-motivation named "the pool is never READ" as what would make the whole
extension wrong, and these cases are what would catch it.

## Approach

Component level, and THE FIXTURE IS THE POINT. The condition that matters is a
clone that HAS the repository and has an EMPTY local note store — because that
is the only state where reading the wrong source is visible. A test whose root
has both stores populated would pass over a survey that read either one.

## Steps

Every case in the referenced file is one step and its name states the claim.
The load-bearing steps:

- with options on disk and an empty local store, the survey lists every option
- with an undrained capture in the local store, that capture is NOT in the
  options list, and the pending count still reports it
- a windowed answer carries how many stand and how many were shown
- an answer that omits an option without saying so fails the case
- the person's rendered source and the lane caller's answer name the same
  options at the same moment

## The case that would be easy to write wrongly

ASSERTING THE COUNT IS NOT ASSERTING THE SOURCE. A survey that read a stale
local store could still report the right number. The cases assert the option
IDS, and the empty-local-store fixture is what makes the source unambiguous.
