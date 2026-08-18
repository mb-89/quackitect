---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-dec-a-driven-tree-names-which-copy-drives-it
type: "[[raid]]"
kind: decision
statement: A tree carrying no method records WHICH copy drives it and at what version, never where that copy sits, and a tree with no such record is refused rather than assumed to be a driven project.
owner: the driving agent
status: decided
breaks_how_badly: crippling
how_likely: plausible
impact: "This is the demand that gated three of four candidates out. Without it the second of the two capabilities the owner asked for cannot exist, and with a location instead of an identity it fails by answering wrongly rather than absently."
source_refs:
  - req-the-system-runs-in-a-tree-that-is-not-its-own
  - opt-the-tree-names-what-not-where
  - raid-asm-the-pointer-survives-what-the-builder-does-to-the-tree
  - raid-iss-the-path-jail-has-one-write-target
  - "product/engine-go/i18_red3.go at ref main"
---

## The choice, and it is two things

WHAT RATHER THAN WHERE. The driven tree records an identity and a version. It
records no path, so there is no local path to go stale.

AND ABSENCE IS AN ANSWER. Three states, not two.

- No record: this is not a driven project. Refuse, and name the record that was
  looked for.
- A record that resolves to nothing, on a machine that has never seen the named
  copy: refuse, naming the identity.
- A record that resolves: come up.

## Why the refusal is half the decision

WITHOUT IT THE SYSTEM CAN ONLY GUESS. Under self-location nothing is recorded,
so nothing can be absent, so every folder anybody opens looks like a driven
project. The requirement's fourth facet exists for exactly that.

AND THE CANDIDATE THAT WON DID NOT STATE IT until a demand check said so. It had
the pointer and never said what happens without one, which is surviving a demand
on three facets out of four.

## What the predecessor did, and why it was not copied

v1 SOLVED THIS AND ITS ANSWER WAS DELIBERATELY NOT TAKEN. `i18_red3.go` at ref
main is a passing end-to-end test of the chain: a stub's data home records the
vehicle in `engine-home.txt`, the stub resolves a method file existing only in
the vehicle's overlay, and the machine-global pointer is never captured.

ITS POINTER IS SIX HEX CHARACTERS OF A HASH OVER THE ABSOLUTE PATH. Move the
workspace and the slug changes. Clone it and the pointer does not travel. Move
the VEHICLE and the pointer resolves to a layer-less path, is silently skipped,
and a machine-global pointer answers instead — possibly a different method
entirely.

THAT THIRD CASE IS THE WORST OF THE THREE because it fails with a wrong answer
rather than an absent one. Recording an identity avoids it by construction.

AND v1 DOES NOT IMPLEMENT THE FOURTH FACET AT ALL. Its own selftest asserts that
a pointerless tree resolves to ITSELF, with the comment "no pointer at all: the
old fallback stands". The requirement was written from v1 and idealised it by a
facet and a half; that overstatement is corrected on the requirement node.

## Rejected options

SELF-LOCATION, the executable walking up from where it sits. REJECTED because it
records nothing, so facet 2 fails outright and facet 4 becomes unanswerable.
Three of the four candidates picked it and all three were gated out. It remains
correct for the system running inside its OWN copy, which is a different
question and is kept.

A POINTER OUTSIDE BOTH TREES, in a machine-local data home. REJECTED on the
fragility above rather than on the path jail. It was originally excluded on the
jail, before any scoring, and that exclusion was void: the owner ruled the jail
too strict, and the option was restored to the cell and then weighed on its
merits.

A POINTER COMMITTED IN THE TREE, as a path. REJECTED: absolute breaks on a move
and relative breaks when the two trees stop being neighbours, which its own node
records. It is the right shape and the wrong key.

THE TREE CARRIES ITS OWN LAYER. REJECTED because facet 2 forbids resolving from
the tree's own content by name, and because it would let a driven tree change
how the system behaves.

THE TREE IS NAMED EACH RUN. REJECTED: nothing is recorded anywhere, so the same
guess-or-refuse problem returns.

## Consequences

A FIRST RUN ON AN UNSEEN MACHINE COSTS A LOOKUP, and something must hold the
resolved result. That is work the winner did not otherwise need, and no
criterion measures it.

WHAT A COPY'S IDENTITY IS MUST BE DECIDED AND HAS NOT BEEN. A copy produced
today is a folder with a name, and two people could produce copies with the same
name. Whether identity is a name, a content hash, or something a person assigns
is a real question this iteration has not answered, and this decision now
depends on it.

AND THE PATH JAIL OWES A SECOND CONTAINMENT. Reading v1 shrank that change from
three cases to one: a read-only METHOD root beside the project root covers work
and method with no new write surface, and only a note about the system's own
machinery still needs a second write target.
[[raid-iss-the-path-jail-has-one-write-target]] carries the ruling and stays
open until the code exists.
