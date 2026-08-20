---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: tsp-an-amend-leaves-the-tree-standing
type: "[[test-spec]]"
statement: An amendment leaves every claim below it standing and a reopen drops them, verified by test over a whole signed chain rather than over one state.
method: test
verifies:
  - req-an-amend-leaves-the-tree-standing
files:
  - tests/drift.test.ts
  - tests/claimops.test.ts
---

## Scope

Which of the two acts on a standing claim disturbs what stands below it. An
amendment corrects wording and must disturb nothing. A reopen says the work is
wrong and must take the chain with it.

ALSO IN SCOPE: the edge between them where the machine can see it. A field
another form READS is not amendable, because changing it changes what those
other forms must answer.

## Approach

THE FIXTURE IS A WHOLE CHAIN, AND THAT IS THE WHOLE POINT. Every claim-bearing
state in a pinned column is signed at one time, so a gate downstream genuinely
stands on feeders upstream.

WHY ONE STATE IS NOT ENOUGH, said plainly because it is what went wrong. The
amend tests that already stood signed exactly ONE state and asserted that the
amended claim was still green afterwards. That assertion never broke. What
broke was everything below it, and a one-state fixture cannot tell "leaves the
tree standing" from "has no tree".

BOTH DIRECTIONS ARE ASSERTED, so the spec cannot be satisfied by a green that
never moves at all. Checking only that an amendment drops nothing would pass
just as well against a walk where nothing is ever grey.

THE GATE CARRIES A BLESS IN THE FIXTURE. A gate is not done for the route until
it has one, where the paint is content with a signature alone.

## Steps

Every case in the referenced files is one step; the case name states its claim.

- An amend on a feeder leaves the claims below it standing. The feeder's
  `amended:` moves and its `signed_off:` does not, and the gate downstream is
  still green afterwards.
- A RE-SIGNED feeder drops them. A new `signed_off:` on the same feeder is
  ground that moved, the gate below goes grey, and its thumbs-up falls with it.
- A REOPENED feeder drops them too, and this is the half that has to work for
  the first one to be safe. The mark is newer than the signature, the reopened
  claim goes grey, and everything standing ON it goes with it. It comes back on
  a fresh signature rather than on the mark being swept away.
- An amend on an already-stale claim does not clear it. Only a fresh signature
  does, because a correction answers nothing about the new ground.
- A field another form reads is refused, and the refusal hands back se_reopen.
  The kickoff's goals list feeds every gate below it through `$goals`.
- The rest of that same form stays amendable, so a typo in a gate is still
  cheap to fix.

## What this does not cover, named rather than left blank

THE REOPEN CONE WAS THE GAP HERE UNTIL 2026-08-17, and it is worth recording
how it closed. A fresh-eyes tester named it as the one thing it could not
check: the suite covered the reopened state going grey and nothing covered
what stood on it. The i33 walk had exercised it by hand about twenty times,
which is evidence rather than a test. It is now a case.

WHETHER THE WALKER JUDGED THE ACT CORRECTLY. The machine catches one case
mechanically: a field it knows another form reads. Everything else rests on the
person or agent choosing amend for a correction and reopen for a changed
question, and no test can read intent.

THE BULK CASE IS NOT COVERED EITHER. Where a chain is legitimately stale, each
state is re-signed one at a time. Whether that should instead be one act is an
open question for the retro (note-fc18d2775583), and nothing here asserts
against a mechanism that does not exist.
