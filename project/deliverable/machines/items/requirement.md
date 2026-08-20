---
template: item-requirement
artifact: node
id_prefix: req-
folder: project/spec/trace/requirement
applies_rigor:
  - systematic
applies_type:
  - default
checks:
  - field: statement
    ears: true
    hint: "one of the five shapes with shall — or ears: exempt — <reason citing a decision>"
  - field: statement
    ban_words:
      - should
      - would
      - could
      - may
      - might
      - appropriate
      - adequate
      - sufficient
      - quickly
      - easy
      - user-friendly
      - robust
      - flexible
      - seamless
      - efficient
      - optimal
      - reasonable
      - gracefully
    hint: a weasel word checks nothing
  - field: statement
    ban_phrases:
      - as possible
      - where possible
      - as required
      - as appropriate
      - if necessary
      - including but not limited to
      - and so on
      - etc.
    hint: an escape or open-ended clause makes verification impossible
  - field: kind
    one_of:
      - functional
      - quality
      - constraint
      - interface
  - field: breaks_how_badly
    one_of:
      - fatal
      - crippling
      - corrosive
      - abrasive
      - cosmetic
    hint: how badly it breaks, not how much you want it — the test is in meth-damage-scale
  - field: characteristic
    one_of:
      - functional-suitability
      - performance-efficiency
      - compatibility
      - interaction-capability
      - reliability
      - security
      - maintainability
      - flexibility
      - safety
    hint: the nine of ISO/IEC 25010:2023 — absent on a functional row, carried by a quality
  - field: kind
    equals: quality
    require_section: Scenario
    hint: a quality carries its six-part scenario, and the response measure is its pass line
  - field: measure
    ban_words:
      - fast
      - quick
      - easy
      - simple
      - robust
      - seamless
      - efficient
      - optimal
    hint: a quality without a number is a mood
  - field: verify_method
    one_of:
      - test
      - analysis
      - inspection
      - demonstration
  - field: breaks_if_removed
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
    hint: unfillable means deletion candidate, never a keeper with a TODO
  - field: priority
    one_of:
      - must
      - should
      - could
  - field: statement
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
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

THE STATEMENT LEADS, THE DETAIL BINDS. The statement is the one EARS-shaped
headline. Structured detail — tables, lists, limit sets — goes in a
`## Detail` section and binds as part of the demand: agent-grade
requirements need that precision, and a table beats thirty sibling rows.
Free prose stays a defect. A rationale is a LINK in `source_refs`, never a
paragraph, so a changed rationale never forces re-review of the demand.

A BEHAVIOUR MODEL IS ONE OPTION FOR A ROW, never a duty (owner ruling
2026-08-13, corrected the same day). An ordered exchange, a thing with
states, a lifecycle — a one-condition row cannot say any of those, and a set
of them can hide a hole. Use it where it says what prose cannot; say in one
line where it does not. A model on every row is slop. Text form for now.

IT DERIVES FROM USE CASES. `refines` names the uc- ids whose steps and
extensions demand it. The engine checks both directions: a requirement
refining no use case is an orphan, and a use case no requirement covers is a
hole. A step no requirement covers shows in the coverage matrix at the gate.

WHAT, NEVER HOW. A requirement that names a mechanism has frozen a design
choice as an obligation. Name the outcome; the design belongs to M4 and
after.

How to write one is [[meth-requirement-authoring]]. The statement shapes are
[[meth-ears]]; quality scenarios are [[meth-quality-scenarios]].

THE SPEC CARRIES THE EDGE (owner ruling 2026-08-11, superseding the
2026-08-10 `verified_by` shape). A [[test-spec]] node names this row in
its `verifies:` list, and its `method` must equal this row's
`verify_method`. Nothing about verification is written ON the
requirement; the author-tests law enforces coverage both ways at its own
state. `verified_by` is no longer written.

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
# HOW BADLY it breaks, on the damage scale. One word, and it is a claim
# about CONSEQUENCE, never about how much anybody wants it.
#   fatal      — the product stops being the thing it claims to be
#   crippling  — one named use case can no longer complete
#   corrosive  — it still works, and people route around it every time
#   abrasive   — noticed and complained about; nobody changes what they do
#   cosmetic   — nobody would notice. This row is a deletion candidate.
# The test for each is in project/deliverable/machines/methods/meth-damage-scale.md.
breaks_how_badly: TODO — fatal | crippling | corrosive | abrasive | cosmetic
#
# The uc- ids this derives from. A cross-cutting quality names every use
# case whose pass it protects — the must stories' cases at minimum.
refines:
  - TODO — the uc- id this derives from
#
# Where else it comes from: a stk- id | a norm clause | a recorded decision
# | field evidence. A constraint's binding norm goes here. Write `none`
# where the use case is the whole story.
source_refs:
  - TODO — the source beyond the use case, or none
#
# MoSCoW, the house scale: must | should | could. At M4 the must rows GATE
# every candidate pass/fail; the should and could rows become the scored
# criteria. A won't-have is a non-goal, never a register row.
priority: could
#
# THE TWO M4 KEYS. Both are written at derive-criteria, through its editors,
# and both are as editable here as anywhere. The criteria table is derived
# from them, so there is no criteria list to keep in step.
#
# The pool member this shares an axis with, and why, on one line. Two rows
# measuring the same thing are ONE criterion; scoring both counts that thing
# twice. `none` where this is an axis of its own.
weighs_with: <!-- a pool id, then why the two measure the same thing. Or none. -->
#
# The pairwise judgments the weight is computed from. One line per pair: a
# pool id, then > where this row matters more, or = where they match. The
# reciprocal is implied and checked. Silence is not equality.
weighs_against: <!-- one line per pair — a pool id, then > or = -->
---

<!-- QUALITY KIND ONLY — add a `## Scenario` section carrying the six-part
scenario per the quality-scenarios method: source, then stimulus, then
artifact, then environment, then response, then the response MEASURE with
its tolerance. The measure is the pass line: no measure, no requirement.
The conformance check demands the section on every quality-kind row. Strike
this comment for other kinds. -->

<!-- OPTIONAL `## Detail` — the structured precision an agent builds from:
tables, lists, limit sets. It BINDS as part of the demand. One concern per
node still holds: detail that verifies differently is a sibling row. -->

<!-- OPTIONAL `## Behaviour` — one WAY to write a row, never a duty. It suits
an ordered exchange, a thing with states, or a lifecycle. The test: does the
model say something the statement and the Detail cannot? A missing transition
or a participant nobody creates, yes. One condition and one response, no —
that is slop. It BINDS like Detail. Write it as TEXT for now; PlantUML lands
later and the text converts without loss.

    (nothing)  -> unclaimed: the seed pushes the stub
    unclaimed  -> claimed:   a machine enters

Draw the FIRST line — what brings the thing into being. A participant that
appears from nowhere is the gap. See [[meth-requirement-authoring]]. -->

<!-- A genuinely non-EARS statement records its exemption in frontmatter as
`ears: exempt — <reason citing a recorded decision>`. A bare exemption is a
defect the gate counts. -->
```
