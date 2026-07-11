---
id: man-ch3-design-input
type: manifest
mode: chapter
order: 30
statement: Design input - context, stakeholders, and every checkable claim on the system.
---
<!-- design: method-ch3-mech  implements: req-chapters-canned.2 :: ch3 mechanized: canned units with pooled views for the context (neighbours table, then the star), use cases and functions, qualities (six scenario fields grouped by facet), constraints, the design input register (ONE faceted table over every input type), and the stakeholder tensions at the chapter bottom; the authored residue is the context prose and the deferred functions unit. -->
## What the system must do
<!-- tailor: shipped text - the chapter's anatomy is the same in every project.
-->
<!-- ai:3 -->
This chapter is the binding input:

<!-- ai:3 -->
- the context and its boundary
- the intended use, and what falls outside it
- the use cases and functions
- the qualities, with their measures
- the constraints
- the design input register
- the stakeholder tensions

<!-- ai:3 -->
Everything below either binds the design or names who it binds for.
---
## Context and scope
<!-- fill [mandatory]
Contents: the working context - the boundary prose, then two subsections:
  "Intended use" (what the system is FOR, one honest paragraph) and "Excluded
  from intended use" (the explicit does-NOT-do list, the scope-creep guard).
  The neighbours themselves are nbr- notes - the table and the star below
  derive from them; never hand-author the interface list into prose.
Motivation: ch0's star orients; this one BINDS. Most specs forget to say what
  the system is for - and what it is NOT for.
Form: boundary prose, then the two subsections as ### headings. Mention
  analysis methods (the 9-window among them) in the prose as links - the full
  methods live in the appendix. Design-relevant ASSUMPTIONS live in the raid
  register - record them there, never inline.
Sources: context views @[[ref-sya-architecting]]; the methods notes.
-->
<!-- ai:3 -->
{{context-and-scope}}
---
![[neighbours.base]]
---
fig: context-star
---
## Use cases and functions
<!-- tailor: shipped machinery - ONE merged section, rendered as
  TWO reader tables: one for the use
  cases (expand = the definition), one for the functions (the need item's `functions:`
  list, verb plus noun, solution-neutral - each row names its need). Never authored
  prose.
Sources: Cockburn use-case fields @[[ref-sya-re]]; functional decomposition @[[ref-pahl-beitz]].
-->
<!-- ai:3 -->
Two tables, live from the graph: the use cases and the solution-neutral functions, each traced to its need. Expand a use case to read its definition; filter either table by need.
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
## The design input register
<!-- tailor: shipped text - the register derives: ONE table over every use
  case, function, constraint, and requirement, with a type facet beside the
  board facets; the need is a facet, never a body column. Initial requirements
  suffice to START concepting, detail requirements gate the RELEASE; the set
  criteria bind: complete, consistent, affordable, bounded. The board doubles
  as the register's filter row (the recorded
  exemption from the pills rule) - click values to filter, several combine.
Sources: four core areas, Hauptmerkmalliste, staging @[[ref-pahl-beitz]];
  row schema @[[ref-methodische-entwicklung]]; attribute discipline
  @[[ref-modellbasierte-pe]]; set criteria @[[ref-iso-29148]].
-->
<!-- ai:3 -->
How the rows interconnect lives in one place: the trace, one page per need, in the overview chapter. The register below is the flat index over every input type:

<!-- ai:3 -->
- A use case is one interaction that serves a need, told from the user's side.
- A function is something the system must do for a need - verb plus noun, solution-neutral.
- A quality is a requirement that states how well, measured by a scenario.
- A constraint is a requirement imposed from outside, bound by a cited norm.

<!-- ai:3 -->
Needs are the user level; requirements are the system level; deeper tiers hang off refines. Statements are EARS-shaped and carry their tolerances; no TBD survives the detail gate. The board below shows the facet coverage - a zero-count hole is the completeness check, live. The board is also the register's filter: click a value to filter the table, several values combine.
---
fig: coverage-board
---
fig: input-register
---
## Stakeholder tensions
<!-- tailor: shipped machinery - the stakeholder table lives in ch0 (one table,
  not two); every requirement's source traces to one of its rows. Conflicts
  are conflicts-with connection notes - the tensions table surfaces them here,
  the full why one click away.
Sources: the four-step pipeline @[[ref-generic-se]].
-->
<!-- ai:3 -->
Where two stakeholders pull against each other, the tension renders below - the reasoning is one click away. Every requirement's source traces to a stakeholder row in the orientation chapter.

![[tensions.base]]

<!-- No "methods that apply here" section:
     mention an applicable method in the PROSE as a link - the full
     methods consolidate in the appendix. -->
<!-- enddesign -->
