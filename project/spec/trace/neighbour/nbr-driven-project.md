---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: nbr-driven-project
type: "[[neighbour]]"
statement: Somebody else's product, whose work the engine drives while the method and the machinery stay in the engine's own tree.
direction: both
---

## Why this neighbour is new

THE ENGINE HAS ONLY EVER DRIVEN ITSELF. project/product.md declares
`self_hosting: true` and says so in words - only Quackitect works on itself.
Every measurement this system has of its own method is a measurement of it
working on its own source.

THE OWNER NAMED THIS AS ONE OF TWO CAPABILITIES, 2026-08-18: "we need two
things working. First, the idea that the engine creates a vehicle from itself.
Second, that the engine can work on something else than itself."

AND v1 ALREADY HAD THE SHAPE. From i16's own record at line 32, summarising
`product/engine-go/resolver.go` at ref main: a vehicle's method extensions
travel in ITS repository and merge over the vendored layer "for itself and for
every stub it drives".

## What is actually different about it

THE METHOD AND THE WORK STOP BEING THE SAME PLACE. Today one root holds both:
the guidance, the machines and the forms sit beside the spec, the records and
the evidence, and every path the engine resolves is under it.

DRIVING SOMEBODY ELSE'S PRODUCT SPLITS THAT. Where the method comes from and
where the work lives become two answers, and every resolution has to know which
of the two it is asking about.

## Interface

INWARD: the driven project's own state - its spec, its records, its evidence,
its source. The engine reads it to know where the work stands.

OUTWARD: everything the engine writes on the work's behalf. Records, evidence,
signatures, the call log, and whatever the driven product's own build produces.

AND THE OVERLAY REACHES IT. A descendant's method extensions apply to the work
it drives, not only to itself. That is what makes the method somebody's own
rather than ours, and it is why this neighbour belongs beside the overlay
rather than after it.

## What crosses in the other direction, and what must not

THE DRIVEN PROJECT IS NOT A SOURCE OF METHOD. It carries work, and the method
comes from the engine's own tree with the descendant's overlay on top.

AND THE ISOLATION RULE APPLIES HERE TOO, in the same direction it always does:
nothing the engine does while driving somebody else's product may resolve
outside that product's tree and its own.

## What this neighbour is not

NOT A DESCENDANT. [[nbr-descendant]] is a copy of this product. A driven
project is a different product entirely, which never contains the engine.

NOT A USER. The person who owns the driven work is a stakeholder and this is
their repository. No node covers that role today, and map-stakeholders is where
that gets settled.

NOT AN OVERLAY SOURCE. Where the descendant's own overriding content sits is
[[raid-risk-the-overlay-location-is-unchosen]], and it is not here.
