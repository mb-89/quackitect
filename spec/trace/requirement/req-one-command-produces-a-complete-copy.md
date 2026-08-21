---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: req-one-command-produces-a-complete-copy
type: "[[requirement]]"
statement: When somebody asks for a copy of the system under a new name, the system shall produce one complete independent repository that runs on a machine holding nothing of the source.
kind: functional
verify_method: demonstration
breaks_if_removed: Nobody can obtain the system except by cloning the source, which means every builder needs access to a repository that carries our own company guidance.
breaks_how_badly: crippling
refines:
  - uc-vendor-and-overlay
source_refs:
  - uc-vendor-and-overlay step 1
  - uc-vendor-and-overlay step 2
  - uc-vendor-and-overlay ext 2a
  - sty-vendor-it-into-my-product
  - vp-the-engine
priority: must
---

## Detail

THIS ROW EXISTS BECAUSE STEP 1 HAD NOTHING. The set was swept for coverage and
uc-vendor-and-overlay step 1 - producing the copy at all - was covered by no
requirement. `req-second-product-reuses-install` was read as covering it and
does not: that row refines `uc-begin-a-product` and is about not re-installing
an editor extension.

| facet | what binds |
| --- | --- |
| complete | The produced tree shall contain everything needed to run, with zero resources resolved from outside it. |
| independent | It shall be its own repository, with its own history, and no dependency declared on the source. |
| named | Its name shall be written once, in the brand fact at its root, per [[req-the-product-name-is-one-fact]]. |
| one act | It shall be produced by a single act, with no manual assembly step afterwards. |
| the count | Its dependencies on the source's working copy shall be zero, which is [[vp-the-engine]]'s own first success criterion. |

## What already exists, and what it lacks

`RUNME.ps1 --export <folder> <name> <abbr>` at lines 57-155 produces a real
independent repository today: it copies the tree, writes the brand fact and
commits once. It satisfies every facet above.

WHAT IT LACKS IS NOT IN THIS ROW. It keeps no relationship to the source, so
nothing can ever be taken from it afterwards. That is a fork, and it is
[[req-overlay-survives-update]]'s subject rather than this one's.

SO THIS ROW IS CLOSE TO MET ALREADY, and saying so is the point. The iteration
that minted it is not mostly about producing a copy; it is about what happens
after the copy exists.

## Why demonstration rather than test

THE PASS IS A MACHINE WITH NOTHING OF THE SOURCE ON IT. That is observed end
to end rather than measured under instrumentation, and a test running inside
the source's own tree cannot establish it.
