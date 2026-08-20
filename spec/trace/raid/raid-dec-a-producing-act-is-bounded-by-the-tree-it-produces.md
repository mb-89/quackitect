---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-dec-a-producing-act-is-bounded-by-the-tree-it-produces
type: "[[raid]]"
kind: decision
statement: The write bound travels with the act rather than sitting at a fixed root, so producing a tree is bounded by the tree being produced and an ordinary walk is bounded by the tree being walked.
owner: the driving agent
status: decided
breaks_how_badly: fatal
how_likely: plausible
impact: This is what makes the isolation guarantee a property of the act rather than a rule somebody has to remember. Wrong, a producing act has no bound at all, which is the state the design is in today.
source_refs:
  - req-nothing-a-copy-does-reaches-its-source
  - req-an-act-writes-only-the-tree-it-produced
  - req-where-each-artifact-lands-when-driving
  - opt-the-bound-travels-with-the-act
  - raid-dec-an-import-is-read-only-and-a-vendored-copy-is-yours
---

## The choice

THE BOUND IS PER ACT, NOT PER SESSION. Each act names one tree and writes only
inside it. Producing a copy is bounded by the copy. Walking a driven product is
bounded by that product. A note about the system's own machinery is bounded by
the system's own tree.

AND NO ACT CAN NAME THE SOURCE. That is the law, and it is unchanged:
[[raid-dec-an-import-is-read-only-and-a-vendored-copy-is-yours]] says the rule
names the DIRECTION of writes rather than any mechanism.

## Why the alternative fails and it is not obvious

ONE WRITE TARGET CANNOT SERVE DRIVING. Three things move while driving and they
belong to two trees: the work goes to the driven tree, the method is READ from
ours, and a note about our OWN machinery goes to our tree while the walk
continues in somebody else's.

RE-POINTING A SINGLE ROOT HANDLES TWO AND BREAKS THE THIRD. Point the jail at
the driven tree and every work artifact lands correctly; the machinery note is
then outside it and refused.

AND DEFERRING THAT NOTE FAILS BOTH WAYS. Queue it in the driven tree and the
system's business is in somebody else's repository, which the requirement names
as the whole failure. Queue it in memory and it dies with the session, because a
walk on a foreign product need never come home.

THE OWNER RULED ON THIS 2026-08-18, after the constraint had excluded an option
before any scoring. One write target is an IMPLEMENTATION of the law and it is
stricter than the law: it forbids writing to the source, correctly, and also to
a driven tree, which is not the source and which nothing was protecting.

## Rejected options

PRODUCING HAPPENS OUTSIDE THE LANE. REJECTED, and it is what ships today: a
person runs a script and the write jail never sees the act at all. Its own node
states the cost — "the script's own guards are not the jail's. They are
hand-written checks in one script, reimplemented in whatever produces the next
kind of tree."

AND IT CANNOT SERVE THE SURFACE THE OWNER ASKED FOR. A create-vehicle button is
a lane act by definition, and this option's own text says it fails that ask
directly.

## Consequences

THE ISOLATION GUARANTEE GETS STRONGER RATHER THAN WEAKER, which is the part that
reads backwards at first. A producing act currently has no bound; this gives it
one, checkable at the same single resolver.

THE JAIL NEEDS A SECOND CONTAINMENT AND THAT CODE DOES NOT EXIST. The engine
already writes outside the resolver by design — a bare join appears 116 times
across 49 files against 44 resolver calls — so what the jail actually constrains
is paths an AGENT names through a lane verb. Formalising the second target is
M6's, and the check that a declared target can never be the source is owed WITH
the change rather than after it.

AND THE DRIVING CASE IS STILL UNANSWERED BY EVERY CANDIDATE. No question on the
chart asks where work, method and machinery land while driving; the chart asks
only what bounds a PRODUCING act. All four lines are silent on it, so it gates
nobody out and leaves every one of them unfinished in the same place.
