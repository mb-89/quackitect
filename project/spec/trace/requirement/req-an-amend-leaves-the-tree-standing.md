---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: req-an-amend-leaves-the-tree-standing
type: "[[requirement]]"
statement: When a standing claim is corrected by an amend, the engine shall leave every claim downstream of it standing, and only a reopen shall drop them.
kind: functional
verify_method: test
breaks_if_removed: Every correction anywhere greys every claim below it. A one-sentence fix in a kickoff sends the whole chain back to be re-freshened by hand, and each of those amends greys everything below it in turn, so the walk stops converging on itself.
breaks_how_badly: corrosive
refines:
  - uc-take-a-step
source_refs:
  - "owner ruling 2026-08-17: an amendment does not re-grey, a reopen re-greys"
  - "owner ruling 2026-08-17: a change that alters what a gate DOES is a reopen, not an amendment"
  - "engine/session.ts claimTime, and the ripple's time half in recordDone"
priority: must
---

## Detail

- An AMEND leaves the signature and leaves the tree. It corrects a claim that
  still stands: a wrong figure, a stale sentence, a typo.
- A REOPEN drops the claim, its form, and everything downstream. It says the
  work is wrong.
- The claim's time is its SIGNATURE. An amend does not move it, so nothing
  below reads as stale.
- A re-sign after a reopen DOES move it, and everything below is stale until
  it answers again. That is the ripple, and it is the reopen's alone.

## Where the line falls

THE TWO ACTS ARE TOLD APART BY WHAT THEY CHANGE, not by how many characters
move.

- Does the claim still say the same thing? Amend.
- Does anything below now have a different question to answer? Reopen.

THE SECOND TEST IS THE ONE THAT MATTERS, and it is the one that was missed.
Rewriting a kickoff's goals list changes what every gate below must measure
its work against. That is a reopen however small the edit looks.

## Behaviour

Three steps on one chain, kickoff before requirements before build, all three
signed.

    amend kickoff, fixing a wrong figure in its situation
      -> kickoff keeps its signature
      -> requirements still stands
      -> build still stands

    reopen kickoff, because its goals list is now a different question
      -> kickoff goes grey and owes its form
      -> requirements falls with it
      -> build falls with it

The transition that must NOT exist is the first case dropping requirements or
build.

## Why this is a requirement and not a preference

IT DECIDES WHETHER THE WALK CONVERGES. A correction that greys the chain below
it makes each repair create more repairs, and the walk never reaches the work.

MEASURED IN i33, 2026-08-17. One kickoff amend sent ten signed states back.
Each hand-amend that cleared one greyed everything under it again. Three
passes over the same chain cleared nothing, and the actual work of the
iteration did not move for an afternoon.
