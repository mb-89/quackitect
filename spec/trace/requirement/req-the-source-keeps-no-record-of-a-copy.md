---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: req-the-source-keeps-no-record-of-a-copy
type: "[[requirement]]"
statement: When the system produces a copy of itself, it shall record nothing about that copy and shall provide no means by which the copy can later be reached.
kind: constraint
verify_method: inspection
breaks_if_removed: A builder's private guidance stops being private the moment somebody adds a registry, and the reason this role vendors rather than contributes disappears.
breaks_how_badly: crippling
refines:
  - uc-vendor-and-overlay
source_refs:
  - uc-vendor-and-overlay step 1
  - stk-engineer-driving-agents
  - nbr-descendant
  - vp-the-engine
priority: should
weighs_against:
  - req-the-product-name-is-one-fact > — a registry breaks the promise that made this role vendor rather than contribute; a scattered name costs conflicts on every update, which is expensive rather than disqualifying
---

## Detail

THE MIRROR OF THE ISOLATION RULE, and it is a different concern verified a
different way. req-nothing-a-copy-does-reaches-its-source is about what the
COPY may do. This is about what the SOURCE may keep.

| facet | what binds |
| --- | --- |
| no registry | The system shall write no list, index or manifest of copies it has produced. |
| no callback | A copy shall contain no address, token or endpoint through which it reports to the source. |
| no telemetry | A copy shall send nothing anywhere as a consequence of running. |
| the count | The number of files in the source naming a copy shall be zero. |

## Why it is a requirement rather than a happy fact

TODAY IT IS TRUE BY ACCIDENT. Nothing records copies because nothing has ever
produced one that was worth recording. "We could not find you if we tried" is
only true while nothing ever tries, and the first person to want a support
channel will try.

THE AUDIENCE ASKED FOR IT before this iteration rediscovered it.
[[stk-engineer-driving-agents]]'s concerns state it in both directions: what the engine
writes must never land inside their tree, and what they write must never land
inside the engine's.

AND THE COMMERCIAL REASON IS ON [[vp-the-engine]]. The product goes open source
while company-specific guidance stays inside the company. A registry of who
holds a copy is the first step toward that guidance having somewhere to leak
to.

## What it does not forbid

A PERSON SAYING SO. A builder may tell the source they exist, ask for help, or
send a proposal. The requirement is about what the SYSTEM does without being
asked.
