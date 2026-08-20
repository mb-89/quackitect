---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-dec-an-identity-is-minted-and-never-derived-from-a-name
type: "[[raid]]"
kind: decision
statement: A tree's identity is twelve hex characters minted once by the act that produces it, kept in the brand fact beside the name, and every comparison between trees is made on it rather than on the name.
owner: the driving agent
status: decided
breaks_how_badly: crippling
how_likely: plausible
impact: Wrong, a driven tree naming its vehicle resolves to whichever copy the machine finds first. That fails with a WRONG answer rather than an absent one, which is the worst of the three states the driven record exists to separate.
source_refs:
  - raid-dec-a-driven-tree-names-which-copy-drives-it
  - el-project-producer
  - el-vehicle-producer
  - req-the-product-name-is-one-fact
  - product/engine-go/i18_red3.go at ref main
---

## The question this answers, which was left open on purpose

[[raid-dec-a-driven-tree-names-which-copy-drives-it]] SAYS IT IN ITS OWN WORDS:
"What a copy's identity is must be decided and has not been. A copy produced
today is a folder with a name, and two people could produce copies with the same
name."

[[el-project-producer]] SAYS THE SAME THING HARDER: "most of the cost is the
identity rather than the tree... and this element cannot be built until that is
settled."

SO IT WAS SETTLED WHERE IT IS MINTED, at the producing act, because that is the
only place in the system that ever creates one.

## The choice

TWELVE HEX CHARACTERS, MINTED ONCE, AT PRODUCTION. It goes in the brand fact
beside the name, the id and the abbreviation.

- A VEHICLE gets one when it is produced.
- A DRIVEN TREE'S RECORD names the driving tree's id AND its identity.
- A TREE THAT PREDATES THE IDEA mints its own the first time it drives
  something, which the engine itself needs because it was never produced.

THE NAME STAYS EXACTLY WHAT IT WAS. [[req-the-product-name-is-one-fact]] is
untouched — the name is still one fact in one file, and the identity simply sits
beside it in the same file rather than adding a second place to look.

## Why a name cannot be the identity

TWO PEOPLE CAN PRODUCE COPIES CALLED ATLAS. Both get the id `atlas`, because the
id is a slug of the name by construction.

A DRIVEN TREE RECORDING `atlas` THEN NAMES BOTH OF THEM. Whichever the machine
finds first answers, and it may be the wrong one carrying different method.

THAT IS THE WORST OF THE THREE STATES. A tree that cannot resolve its vehicle is
recoverable — the system says so and names what it looked for. A tree that
resolves to the WRONG vehicle comes up cheerfully and behaves differently from
what its owner expects, with nothing anywhere saying why.

AND IT IS THE SAME FAILURE THE PREDECESSOR HAD, arriving by a different route.
v1's pointer is six hex characters of a hash over the ABSOLUTE PATH, so moving
the vehicle resolves to a layer-less path, is silently skipped, and a
machine-global pointer answers instead. Recorded on
[[raid-dec-a-driven-tree-names-which-copy-drives-it]]. A minted identity avoids
both by construction, because it is derived from nothing that can change.

## Rejected options

THE NAME, or its slug. REJECTED on the collision above.

A HASH OF THE TREE'S CONTENT. REJECTED: it changes on every commit, so a driven
tree's record would go stale the first time its vehicle was edited. An identity
has to survive the thing it identifies changing.

A HASH OF THE PATH, which is what v1 does. REJECTED: it changes when either tree
moves, and it fails toward a wrong answer rather than an absent one.

SOMETHING A PERSON ASSIGNS. REJECTED for now, not on its merits. It is a better
answer for a world where people trade vehicles and want to say which is which,
and it costs a question at production time that nothing yet needs asked. The
minted value can be replaced by an assigned one later without changing any
comparison, because both are opaque.

## Consequences

AN IDENTITY IS NOT READABLE, and that is a real cost. `blue-heron` tells a
person something and `7f3a9c21b4d0` tells them nothing, so every message about a
tree has to carry the name as well as the identity to be usable.

THE ENGINE MUTATES ITSELF ONCE, the first time it drives a project, to mint its
own. That is the only write a producing act makes outside what it produces. It
is the tree recording its own name, which is what a normal run records anyway,
and [[req-an-act-writes-only-the-tree-it-produced]] allows exactly that.

AND RESOLVING AN IDENTITY TO A TREE IS NOT BUILT. Something on the machine has
to hold which copies it has seen, and no such register exists. Until it does, a
driven tree's record is readable and comparable but not resolvable, and the
answer says so rather than guessing. That gap was already named as a consequence
of the decision this one completes.
