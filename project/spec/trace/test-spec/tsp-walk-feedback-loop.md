---
minted_in: i3-the-walk-s-feedback-loop-the-reading-cre
id: tsp-walk-feedback-loop
type: "[[test-spec]]"
statement: The walk says what it knows — a reading credit survives a reload and dies with the words, a red objective serves its fill, and one verb names every condition holding a state grey.
method: "test"
verifies:
  - "req-reading-credit-survives-a-reload"
  - "req-red-objective-serves-its-fill"
  - "req-one-verb-says-why-a-state-is-grey"
files:
  - "tests/feedback-loop.test.ts"
---

## Scope

Three places where the engine holds a verdict and does not hand it over. All
three are engine behaviour reachable from a Session over a fresh root, so the
level is integration against the real lane rather than unit.

NOT IN SCOPE: the fill answer returning the whole form twice, which pairs with
the reading credit but belongs to i11. Nor the machine paint's cost, which is
i12's.

## Approach

Integration level, one throwaway root per case, no shared fixture. Each case
stands its own Session and its own server, which is what makes the file legal
to run concurrently.

THE ORACLE IS THE PACKET, never a log line. `session.packet()` reports what the
way still demands, so a credit that survived is observable as an empty
`route_reads` and needs no instrumentation.

A RELOAD IS A SECOND SESSION OVER ONE ROOT. That is what `se_reload` does to
the engine: the process is replaced and the tree is not. Nothing here spawns a
process to prove a process-level claim.

Risk decides depth. The reading credit is the largest item and the one with a
measured daily cost, so it gets both directions — survives unchanged, and dies
when the words move. The other two get one honest check each.

## Steps

Every case in the referenced file is one step, and the case name states its
claim.

WRITTEN AND RED:

- the reading credit survives a reload — credit a fresh root's whole reading,
  stand a second Session over the same root, and assert nothing is owed.
- a document whose content moved is owed again — credit everything, move one
  document's content, and assert that document alone comes back owed.

OWED, AND DELIBERATELY NOT WRITTEN BADLY:

- a wait at a red objective serves the objective's fill. The fixture must
  stand a record up and redden the state the route lands on; a fresh root
  walks to the desk with nothing red, so there is nothing to observe yet.
- one verb names every condition holding a state grey. The verb's NAME is a
  design decision this iteration has not taken, and asserting against a name
  nobody chose would fail for the wrong reason.

A CASE THAT FAILS FOR THE WRONG REASON IS WORSE THAN NO CASE. It reads as
coverage and proves nothing, which is the fabricated-coverage failure this
state's own guidance names. Both owed steps are listed here rather than
claimed in the file.

## What red looks like today

The two written cases fail because `readBuffer` lives in memory only, so a
second Session over one root owes every document again.

That is the reproduction, and it is the requirement's voice.
