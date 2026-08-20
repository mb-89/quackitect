---
template: item-test-spec
artifact: node
id_prefix: tsp-
folder: spec/trace/test-spec
applies_rigor:
  - systematic
applies_type:
  - default
checks:
  - field: statement
    ban_words:
      - appropriate
      - adequate
      - sufficient
      - robust
      - reasonable
      - thoroughly
      - properly
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
    hint: a weasel word cannot decide a pass
  - field: method
    one_of:
      - test
      - analysis
      - inspection
      - demonstration
    hint: the VCRM four — and it must match the verify_method of every requirement this spec verifies
  - field: method
    equals: test
    require_section: Steps
    hint: a test spec says what its steps are — for software, every case in the referenced files is one step
  - field: method
    equals: demonstration
    require_section: Procedure
    hint: a demonstration is observed working — the procedure says what is done and what is watched for
  - field: method
    equals: inspection
    require_section: Checklist
    hint: an inspection examines static attributes — the checklist names each one with its pass criterion
  - field: method
    equals: analysis
    require_section: Model
    hint: an analysis predicts by model or calculation — name the model, its inputs and the acceptance line
---

# test-spec — one verification collection, defined before the build

Lives in `spec/trace/test-spec/`. A STANDING ARTIFACT: it outlives
the iteration that authored it, like a requirement.

ONE SPEC, ONE VERIFICATION CONCERN. A spec groups the checks that answer
for a coherent set of requirements — a feature family, a law family, a
quality. It is the TEST-FIRST artifact: written when the requirements are,
before the build, saying HOW they will be verified.

THE SPEC CARRIES THE TRACE EDGE. `verifies:` names the requirement ids —
the child names its parents, like every other node. The trace graph draws
requirement ← test-spec in the test slice. Nothing is written on the
requirement.

THE METHOD MUST MATCH. A spec's `method` must equal the `verify_method` of
every requirement it verifies. The engine checks this mechanically. A
requirement needing two methods gets two specs.

THE FILES ARE REALIZATION, NOT TRACE. `files:` names what realizes the
spec — for a software test spec, the test files. The engine's sweep checks
the seam mechanically and OUTSIDE the graph:

- a test-method spec references at least one existing file
- every test file is referenced by at least one spec (warn-first)

For software, EVERY CASE IN A REFERENCED FILE IS ONE STEP of this spec.
The case name states its claim; nothing is copied into the note. A
non-software realization points `files:` at its protocol or record
documents instead — the shape holds.

THE REPORT IS GENERATED, NEVER AUTHORED. The test report derives from this
spec crossed with the recorded run verdicts. Do not write results here.

How to design the checks is [[meth-test-design]] — strategy, tactics and
design; risk decides depth ([[meth-risk-based-testing]]).

## The template

```skeleton
---
# The engine writes id and the type link. id is tsp- plus a slug.
#
# WHAT THIS SPEC VERIFIES, one sentence — the collection's claim, arguable.
statement: TODO — the <concern> holds, verified by <method> over <scope>
#
# The VCRM four. It must MATCH the verify_method of every requirement below.
#   test          — measured under controlled conditions
#   analysis      — model or calculation, where testing cannot go
#   inspection    — a static attribute, examined directly
#   demonstration — observed working, without instrumented capture
method: TODO — test | analysis | inspection | demonstration
#
# METHOD demonstration only: the sty- ids this procedure demonstrates end
# to end. Every MUST story is named by this key on some demonstration
# spec — that is the edge the M8 law checks. Omit for the other methods.
# demonstrates:
#   - <the sty- id>
#
# THE TRACE EDGE: the req- ids this spec answers for. At least one.
verifies:
  - TODO — a req- id
#
# THE REALIZATION: what carries the checks. For a software test spec, the
# test files, root-relative from the deliverable (tests/<name>.test.ts).
# For other methods or realizations: the protocol or record document, or
# none — <why the body's section is the whole definition>.
files:
  - TODO — tests/<file>.test.ts, a document path, or none — <why>
---

## Scope

<!-- What this collection covers, and the boundary — what is deliberately
out, and where that lives instead. -->

## Approach

<!-- The strategy applied: which design methods derive the checks
(equivalence classes, boundaries, state graph, all-pairs, scenario…), at
which level (component | integration | system | acceptance), how deep and
WHY — risk decides depth. -->

<!-- METHOD test — keep a `## Steps` section: what the steps are. For
software: every case in the referenced files is one step, and the case
name states its claim. Call out only the load-bearing cases; copy nothing.
Name any manual steps the files cannot carry. -->

<!-- METHOD demonstration — keep a `## Procedure` section: the steps
performed, and per step what is OBSERVED as the pass. -->

<!-- METHOD inspection — keep a `## Checklist` section: each attribute
examined, one line, each with its pass criterion. -->

<!-- METHOD analysis — keep a `## Model` section: the model or
calculation, its inputs and assumptions, and the acceptance line. -->
```
