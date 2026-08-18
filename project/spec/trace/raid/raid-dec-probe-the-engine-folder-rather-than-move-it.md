---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-dec-probe-the-engine-folder-rather-than-move-it
type: "[[raid]]"
kind: decision
statement: The engine folder is found by PROBING a short list of locations, so one engine serves a vehicle and this self-hosting repository without either changing its layout.
owner: the owner
trigger: the folder rework, whenever it is scheduled, or any design that would hardcode the engine's path
status: superseded
breaks_how_badly: corrosive
how_likely: expected
impact: Without it, the overlay depends on a repository-wide folder rework, and the owner has ruled that rework must not block this iteration. With it, the rework becomes an independent choice that can land later on its own merits.
source_refs:
  - product/engine-go/resolver.go at ref main — EngineDir, read 2026-08-18
  - req-nothing-a-copy-does-reaches-its-source
  - raid-risk-the-overlay-location-is-unchosen
---

## The problem this answers

TWO SHAPES HAVE TO RUN ONE ENGINE. This repository IS the engine and holds no
vendored copy of itself. A vehicle merely holds the engine in a folder. A
resolver that assumes either shape breaks the other.

THE OWNER'S PREFERENCE AND CONSTRAINT BOTH BEAR ON IT, stated 2026-08-18: they
would rather the wrapper repository root went away, they accept keeping it if it
cannot go, and the rework must not block the overlay.

## v1's answer, read rather than recalled

`EngineDir()` in product/engine-go/resolver.go at ref main probes two locations
in order — `tools/vendor/quackitect` for a vehicle, falling back to
`product/quackitect` for the dogfood repository — and returns the first that
carries a `method` directory.

ITS OWN COMMENT STATES THE POINT: "gather, guides, and the report resolve engine
resources without a hardcoded dogfood path."

## Why this is a decision rather than an assumption

WHAT IS DECIDED is the SHAPE of the answer: probing, not a fixed path and not a
layout migration. That much is ruled here and binds every design below.

WHAT IS NOT DECIDED is the list of locations, which belongs with
raid-risk-the-overlay-location-is-unchosen and is settled at M4 and M5.

AND ONE THING IS STILL OWED AS AN ASSUMPTION, to be opened at
identify-assumptions: that probing genuinely serves both shapes in THIS product,
which has a different tree from v1's. v1 is evidence, not proof.

## Rejected options

A FIXED PATH TO THE ENGINE. REJECTED because it can only ever be right for one
of the two shapes. Whichever is chosen, the other needs a special case, and the
special case is what v1's comment says it built EngineDir to avoid.

MIGRATE THIS REPOSITORY'S LAYOUT so it looks like a vehicle, with the engine
vendored into itself. REJECTED for this iteration on the owner's ruling of
2026-08-18 that the folder rework may land later and must not block the
overlay. It is not rejected as an idea — the owner has said they would prefer
the wrapper root gone — only as a prerequisite.

A CONFIG KEY NAMING THE ENGINE'S LOCATION, read at startup. REJECTED as the
first move because it makes a fresh clone need configuration before it can
find its own engine, which fights req-setup-serves-shipped-method's zero
builder-authored configuration files. It stays available as a LATER override
if probing turns out to be ambiguous somewhere.

## Consequences

THE FOLDER REWORK BECOMES INDEPENDENT. It can be scheduled, argued and landed
on its own merits, and this iteration does not wait for it. That is what makes
the owner's preference and their deadline both satisfiable.

NOTHING MAY HARDCODE THE ENGINE'S PATH. Every resolution of an engine resource
goes through whatever this probe becomes, and a literal path in a later design
is refused by pointing here.

THE PROBE LIST ITSELF IS STILL OWED, and this entry deliberately does not fix
it. Which locations, in which order, is settled with the overlay's own location
at M4 and M5 — raid-risk-the-overlay-location-is-unchosen holds that question.

AND ONE ASSUMPTION IS CREATED BY THIS DECISION, to be opened at
identify-assumptions: that probing genuinely serves both shapes in a tree that
is not v1's.

## SUPERSEDED 2026-08-18 — the question it answered does not exist

THIS DECISION SOLVED A PROBLEM THE CORRECTED MODEL DOES NOT HAVE. It answered
"how does one engine serve both a vehicle that HOLDS it and a repository that
IS it", by probing a short ordered list of locations rather than fixing a path.

THERE IS NO VEHICLE THAT MERELY HOLDS THE ENGINE. The owner ruled on 2026-08-18
that a vehicle is a complete independent copy — it does not contain a vendored
engine folder beside its own product, it IS the whole thing, under its own
name. So a descendant has no engine to locate; it is the engine.

WHAT SURVIVES THE SUPERSESSION, and it is the part worth carrying:

- v1's `EngineDir()` at ref main is still the evidence that probing beats a
  fixed path wherever a locate question genuinely arises.
- THE FOLDER REWORK IS STILL INDEPENDENT of this iteration, which is what the
  owner wanted. It is independent for a simpler reason than this entry gave:
  a descendant carries whatever layout the parent had, so the layout question
  is the parent's alone and can be answered any time.

WHAT DOES NOT SURVIVE: the claim that this decision is what MAKES the folder
rework independent. It is independent on its own.
