---
id: man-ch3-design-input
type: manifest
mode: chapter
statement: Design input - context, stakeholders, and every checkable claim on the system.
---
## What the system must do
<!-- fill [mandatory]
Contents: the chapter in one breath - the binding input: context, stakes,
  use, qualities, constraints, the register.
Form: two to four sentences.
-->
<!-- ai:3 -->
{{lede}}
---
## Context and scope
<!-- fill [mandatory]
Contents: the working context - the boundary, every external interface, the
  neighbor systems; the explicit does-NOT-do list; the context's time dimension
  where it matters (interworking, upgrade and replacement strategy).
Motivation: ch0's star orients; this one BINDS. The does-not-do list is the
  scope-creep guard. Most specs forget the future row - what this system must
  coexist with and what replaces it.
Form: prose plus the interface list. The methods view below carries the analysis
  tools (the 9-window among them). Design-relevant ASSUMPTIONS render from the
  raid register - record them there, never inline.
Sources: sya architecting digest (context views); the methods notes.
-->
<!-- ai:3 -->
{{context-and-scope}}

```base
filters:
  and:
    - 'type == "raid"'
    - 'kind == "assumption"'
views:
  - type: table
    name: Design-relevant assumptions
    order: [file.name, statement, status]
```
---
## Stakeholders and their concerns
<!-- fill [mandatory]
Contents: one concern line per stakeholder note; conflicts named.
Motivation: every requirement's source traces to a row here. Boundary against
  ch0: readers of the DOCUMENT there, stakes in the SYSTEM here - same notes,
  different question.
Form: short prose per stakeholder, or the derived table plus exceptions. The
  pipeline (identify and prioritize, elicit, dedupe and surface conflicts,
  weight) lives in the methods view.
Sources: generic-se digest (the four-step pipeline).
-->
<!-- ai:3 -->
{{stakeholder-concerns}}
---
## Use cases
<!-- fill [mandatory]
Contents: ref units at depth 2 - one per use case, actors and trigger in the
  item, success scenario in its body.
Form: replace the slot with ref units, one per line, depth:2.
-->
<!-- ai:3 -->
{{usecase-refs}}
---
## Functions
<!-- fill [judgment]
Contents: the functional structure - verb plus noun, solution-neutral.
Motivation: physical types decompose by function before form (Pahl/Beitz).
Form: a tree or list. SKIP where the use cases already carry the functional
  story - record the skip in the tailoring row.
Sources: pahl-beitz digest (functional decomposition).
-->
<!-- ai:3 -->
{{functions}}
---
## Qualities
<!-- fill [mandatory]
Contents: one six-part scenario per quality - source of stimulus, stimulus,
  artifact, environment, response, response MEASURE.
Motivation: every quality names the experiment and metric that will verify it
  (the golden rule). A quality without a measure is a mood.
Form: one scenario block per quality, kind quality rows in the register carry
  the facets. The ISO 25010 tree is the elicitation checklist - in the methods
  view, not here.
Sources: systementwurf-mechatronik digest (metric rule); sya NFR digest
  (six-part scenarios).
-->
<!-- ai:3 -->
{{qualities}}
---
## Constraints
<!-- fill [judgment]
Contents: the binding standards and non-negotiables - each a kind constraint
  requirement LINKING its normative reference note.
Motivation: a binding norm is a constraint with a citation; the reference note
  carries the pin (version), the fundamentals chapter derives the list.
Form: short prose plus the constraint rows. Type-gated regulatory sets (the
  medical, machinery, radio lists) come from the type layer's guidance.
-->
<!-- ai:3 -->
{{constraints}}
---
## The requirements register
<!-- fill [mandatory]
Contents: one line introducing the register and the coverage board.
Motivation: needs are the user level; requirements are the system level; deeper
  tiers hang off refines. Initial requirements suffice to START concepting;
  detail requirements gate the RELEASE - and no TBD survives the detail gate.
  The set criteria bind too: complete, consistent, affordable, bounded.
Form: one prose line; the board and register render derived. Statements are
  EARS-shaped, values carry tolerances IN the statement. Facet tagging (phase,
  discipline, quality) is expected work - the zero-count holes on the board are
  the completeness check (the Hauptmerkmalliste, live).
Sources: pahl-beitz digest (four core areas, Hauptmerkmalliste, staging);
  methodische-entwicklung digest (row schema); modellbasierte-pe digest
  (attribute discipline); ISO 29148 set criteria.
-->
<!-- ai:3 -->
{{register-lede}}

fig: coverage-board
---
```base
filters:
  and:
    - 'type == "requirement"'
views:
  - type: table
    name: Requirements register
    order: [file.name, statement, kind, must_wish, weight, source, verify]
    sort:
      - property: weight
        direction: DESC
    groupBy: kind
```
