---
minted_in: i3
id: tsp-walk-feedback-loop
type: "[[test-spec]]"
statement: The walk says what it knows — a reading credit survives a reload and dies with the words, a red objective serves its fill, and one verb names every condition holding a state grey.
method: test
verifies:
  - req-reading-credit-survives-a-reload
  - req-red-objective-serves-its-fill
  - req-one-verb-says-why-a-state-is-grey
files:
  - tests/feedback-loop.test.ts
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

THE READING CREDIT, both directions:

- the reading credit survives a reload — credit a fresh root's whole reading,
  stand a second Session over the same root, and assert nothing is owed.
- a document whose content moved is owed again — credit everything, move one
  document's content, and assert that document alone comes back owed.

THE RED OBJECTIVE:

- aiming at a state that owes a form serves the form, not a sentence about
  geography.

THE GREY VERB:

- one verb names every condition holding a state, and the walk refuses with
  the first of them.
- the verb and the walk read ONE blocker list, not two copies.

## The two steps this spec carried as OWED, and how they closed

Both were listed rather than claimed, because writing them badly would have
been worse than not writing them. A case that fails for the wrong reason reads
as coverage and proves nothing.

THE RED OBJECTIVE needed a record standing with a genuinely red state at the
route's objective. A fresh root walks to the desk with nothing red, so there
was nothing to observe. The fixture now seeds an iteration and enters it, which
puts the walk on a state that owes its form, then aims at exactly where it
stands.

THE GREY VERB was blocked on its own NAME, which was a design decision the
iteration had not taken. It is `se_why`. Asserting against a name nobody had
chosen would have failed for the wrong reason, which is the same trap.

## What red looked like

THE CREDIT cases failed because `readBuffer` lived in memory only, so a second
Session over one root owed every document again.

THE RED OBJECTIVE failed because a zero-length route answered "the target is
where the walk already stands" without ever asking whether that state owed
anything. True about position, useless about work: the route is empty because
there is nowhere to GO, never because there is nothing to DO.

THE GREY VERB failed on its FIRST run for a reason worth keeping. The verb was
written gated by state and was refused at `boot/read_contract` — which is
precisely the kind of place somebody asks why they are stuck. A diagnostic
callable only from where nothing is stuck is useless at the one moment it
exists for, so it joined the always-legal set. The test found that, not a
review.
