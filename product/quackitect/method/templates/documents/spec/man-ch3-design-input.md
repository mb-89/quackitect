---
id: man-ch3-design-input
type: manifest
mode: chapter
order: 30
statement: Design input - context, stakeholders, and every checkable claim on the system.
---
<!-- design: method-ch3-mech  implements: req-ch3-mech :: ch3 mechanized (owner walk 2026-07-06): canned units with pooled views for stakeholders (statement = concern), tensions (conflicts-with connections), use cases (render refs, state-aware), qualities (six scenario fields grouped by facet), constraints, and the register; the authored residue is the context prose and the deferred functions unit. -->
## What the system must do
<!-- tailor: shipped text - the chapter's anatomy is the same in every project.
-->
<!-- ai:3 -->
This chapter is the binding input: the context and its boundary, the stakes, the intended use, the qualities with their measures, the constraints, and the requirements register. Everything below either binds the design or names who it binds for.
---
## Context and scope
<!-- fill [mandatory]
Contents: the working context - the boundary prose, the explicit does-NOT-do
  list, the context's time dimension where it matters (interworking, upgrade
  and replacement strategy). The neighbours themselves are nbr- notes - the
  star and the view below derive from them; never hand-author the interface
  list into prose.
Motivation: ch0's star orients; this one BINDS. The does-not-do list is the
  scope-creep guard. Most specs forget the future row - what this system must
  coexist with and what replaces it.
Form: boundary prose, then the derived star + neighbours view, then the
  does-not-do list. The methods view below carries the analysis tools (the
  9-window among them). Design-relevant ASSUMPTIONS render from the raid
  register - record them there, never inline.
Sources: context views @[[ref-sya-architecting]]; the methods notes.
-->
<!-- ai:3 -->
{{context-and-scope}}
---
fig: context-star
---
![[neighbours.base]]

![[assumptions.base]]
---
## Stakeholders and their concerns
<!-- tailor: shipped machinery - the same notes feed ch0 (who reads the DOCUMENT)
  and this table (who has stakes in the SYSTEM); the statement column is the
  concern. Conflicts are conflicts-with connection notes - the tensions table
  surfaces them here, the full why one click away.
Sources: the four-step pipeline @[[ref-generic-se]].
-->
<!-- ai:3 -->
Every requirement's source traces to a row below; the statement column carries the concern. Where two rows pull against each other, the tension renders beneath the table - the reasoning is one click away.

![[tensions.base]]
---
## Use cases and functions
<!-- tailor: shipped machinery - ONE deterministic per-need board (field c25): a need
  row expands into its functions (the need item's `functions:` list, verb plus noun,
  solution-neutral) and its use cases (the refines edges). Never authored prose.
Sources: Cockburn use-case fields @[[ref-sya-re]]; functional decomposition @[[ref-pahl-beitz]].
-->
<!-- ai:3 -->
One row per need, live from the graph. Expand a need to see its functions and its use cases side by side.
---
fig: ucfn-board
---
## Qualities
<!-- tailor: shipped machinery - the six scenario fields live ON the quality
  requirements; the view renders them grouped by quality facet. The ISO 25010
  tree is the elicitation checklist, in the methods view.
Sources: metric rule @[[ref-systementwurf-mechatronik]]; six-part scenarios
  @[[ref-sya-nfr]]; the elicitation tree @[[ref-iso-25010]].
-->
<!-- ai:3 -->
Every quality below carries its six-part scenario, and the response measure is its pass line - a quality without a measure is a mood.

![[qualities.base]]
---
## Constraints
<!-- tailor: shipped machinery - constraints are kind-constraint requirements,
  each linking its normative reference note (the pin lives there, the
  fundamentals chapter derives the list). Type-gated regulatory sets come from
  the type layer's guidance.
-->
<!-- ai:3 -->
A constraint is externally imposed - a binding norm with a citation, never a choice. Each row links the reference that binds it.

![[constraints.base]]
---
## The requirements register
<!-- tailor: shipped text - the board and register derive; initial requirements
  suffice to START concepting, detail requirements gate the RELEASE; the set
  criteria bind: complete, consistent, affordable, bounded.
Sources: four core areas, Hauptmerkmalliste, staging @[[ref-pahl-beitz]];
  row schema @[[ref-methodische-entwicklung]]; attribute discipline
  @[[ref-modellbasierte-pe]]; set criteria @[[ref-iso-29148]].
-->
<!-- ai:3 -->
Needs are the user level; requirements are the system level; deeper tiers hang off refines. The board below shows the facet coverage - a zero-count hole is the completeness check, live. Statements are EARS-shaped and carry their tolerances; no TBD survives the detail gate.
---
fig: coverage-board
---
![[requirements.base]]
---
## Methods that apply here
<!-- tailor: shipped machinery - method notes route themselves by applies_chapters.
-->
![[methods.base#Methods for design-input]]
<!-- enddesign -->
