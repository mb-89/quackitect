---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: raid-risk-seventy-nine-modules-cannot-reach-a-door-in-one-step-and-nothing-ratchets
type: "[[raid]]"
kind: risk
statement: A rule that refuses direct disk access has 79 engine modules to refuse on the day it is switched on, and with no way to accept today's callers while refusing new ones the rule is switched off instead.
owner: the driving agent
trigger: the first design state that specifies how the disk rule is enforced, and the first build in which the rule turns a previously green tree red
status: open
impact: The rule arrives as one large red wall. The two ways out of a wall are to fix 79 modules before anything ships, or to weaken the rule to a warning nobody acts on. The first stalls the iteration and the second is the rule not existing. Either way the exemption registry never gets used, because the thing it records exceptions to was never turned on.
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - i54-everything-exported-has-a-door-a-sweep-o
  - raid-asm-a-door-in-front-of-the-engine-s-own-disk-access-pays-for-itself
weighs_with: none
weighs_against: none
---

## The number

79 ENGINE MODULES IMPORT `node:fs` DIRECTLY, measured in the seeded survey of
2026-08-26. Engine core carries 117 writes and 272 reads across 50 files.

THE EXEMPTION REGISTRY IS THE WRONG TOOL FOR THIS. A registry records the
exceptions somebody chose. Seventy-nine entries written on one afternoon are
not choices, and a registry that opens with 79 lines has already become the
generated baseline this iteration set out to avoid.

## The prior art that solved it

ARCHUNIT'S `FreezingArchRule` EXISTS FOR THIS EXACT SHAPE. It accepts today's
violations, refuses tomorrow's, and shrinks the stored set as violations are
fixed. That is a ratchet rather than an exemption.

THE STORED FORMAT CARRIES NO REASON, and that is the point. A frozen violation
is not claiming to be justified. It is claiming to be old. Those are different
statements and they deserve different files.

Primary at `example-junit5/src/test/resources/frozen/stored.rules` in
`TNG/ArchUnit-Examples`.

BAZEL SOLVES A NEIGHBOURING PROBLEM THE SAME WAY. Its documentation says you
can "use visibility when deprecating a public API to allow current users while
denying new ones". Primary at `bazel.build/concepts/visibility`.

## What this asks the design to decide

WHETHER THE FROZEN SET AND THE EXEMPTION REGISTRY ARE TWO FILES OR ONE.

Keeping them apart preserves the thing that makes the registry worth reading.
Every line in it is somebody's sentence, and no line is there because a tool
found it on a Tuesday.

Merging them is cheaper to build and destroys that property on the first day.

## Why this is a risk and not an issue

NOTHING HAS BEEN SWITCHED ON YET. The rule does not exist, so it has not failed.
The trigger is the state that specifies enforcement, and this entry exists so
that state has to answer the question rather than discover it.
