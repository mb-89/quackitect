---
template: item-requirement
artifact: node
id_prefix: req-
folder: project/spec/trace/requirement
applies_rigor: [systematic]
applies_type: [default]
checks:
  - field: statement
    ears: true
    hint: "one of the five shapes with shall — or ears: exempt — <reason citing a decision>"
  - field: statement
    ban_words: [should, would, could, may, might, appropriate, adequate, sufficient, quickly, easy, user-friendly, robust, flexible, seamless, efficient, optimal, reasonable, gracefully]
    hint: a weasel word checks nothing
  - field: statement
    ban_phrases: ["as possible", "where possible", "as required", "as appropriate", "if necessary", "including but not limited to", "and so on", "etc."]
    hint: an escape or open-ended clause makes verification impossible
  - field: kind
    one_of: [functional, quality, constraint, interface]
  - field: verify_method
    one_of: [test, analysis, inspection, demonstration]
  - field: weight
    one_of: [key, important, unimportant]
  - field: statement
    ban_markers: [TBD, TBC, TBR, "???"]
    hint: no TBD survives the milestone
  - field: kind
    equals: quality
    require_section: Scenario
    hint: a quality carries its six-part scenario, and the response measure is the pass line
---

# requirement — one binding, verifiable demand on the system

Lives in `project/spec/trace/requirement/`. A STANDING ARTIFACT: it outlives
the iteration that authored it, lands on trunk when that record closes, and a
later record may change it — a rewording is a patch, a changed demand is a
minor that returns the gate.

THE STATEMENT IS THE SPEC. Everything the row demands lives in the statement
line — the EARS shape and every value with its unit and tolerance. The node
carries no prose beyond it. A rationale is a LINK in `source_refs`, never a
paragraph, so a changed rationale never forces re-review of the demand.

IT DERIVES FROM USE CASES. `refines` names the uc- ids whose steps and
extensions demand it. The engine checks both directions: a requirement
refining no use case is an orphan, and a use case no requirement covers is a
hole. A step no requirement covers shows in the coverage matrix at the gate.

WHAT, NEVER HOW. A requirement that names a mechanism has frozen a design
choice as an obligation. Name the outcome; the design belongs to M4 and
after.

How to write one is [[meth-requirement-authoring]]. The statement shapes are
[[meth-ears]]; quality scenarios are [[meth-quality-scenarios]].

## The template

A new requirement is seeded from this fence. Replace every comment with the
real content.

```skeleton
---
# The engine writes id and the type link. id is req- plus a slug, unique
# across the whole trace corpus.
#
# The demand in ONE EARS shape, with shall. ONE claim only — a second claim
# is a second requirement. Every value carries its unit and its tolerance.
statement: TODO — <in one EARS shape> the <system> shall <response, measured>
#
# Which kind of demand this is.
#   functional — what the system does. A measured one STAYS functional.
#   quality    — how well it does it, carried by the scenario below.
#   constraint — imposed from outside. source_refs names the binding norm.
#   interface  — a boundary both sides must honor. Name both sides.
kind: TODO — functional | quality | constraint | interface
#
# How this will be verified, named NOW. Naming it IS the verifiability
# check — unnameable means rewrite or drop.
#   test          — measured under controlled conditions
#   analysis      — model or calculation, where testing cannot go
#   inspection    — a static attribute, examined directly
#   demonstration — observed working, without instrumented capture
verify_method: TODO — test | analysis | inspection | demonstration
#
# What concretely breaks without this row, in one line. Unfillable means
# this row is a deletion candidate, never a keeper with a TODO.
breaks_if_removed: TODO — what fails when this row is struck
#
# The uc- ids this derives from. A cross-cutting quality names every use
# case whose pass it protects — the killer set at minimum.
refines:
  - TODO — the uc- id this derives from
#
# Where else it comes from: a stk- id | a norm clause | a recorded decision
# | field evidence. A constraint's binding norm goes here. Write `none`
# where the use case is the whole story.
source_refs:
  - TODO — the source beyond the use case, or none
#
# How much it matters: key | important | unimportant. Only the key rows
# become M4 criteria and owe a scoring definition there.
weight: unimportant
---

<!-- QUALITY KIND ONLY — add a `## Scenario` section carrying the six-part
scenario per the quality-scenarios method: source, then stimulus, then
artifact, then environment, then response, then the response MEASURE with
its tolerance. The measure is the pass line: no measure, no requirement.
The conformance check demands the section on every quality-kind row. Strike
this comment for other kinds. -->

<!-- A genuinely non-EARS statement records its exemption in frontmatter as
`ears: exempt — <reason citing a recorded decision>`. A bare exemption is a
defect the gate counts. -->
```
