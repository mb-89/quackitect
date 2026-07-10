---
id: man-ch3-design-input
type: manifest
mode: chapter
order: 30
statement: Design input - context, stakeholders, and every checkable claim on the system.
---
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
  does-not-do list. Mention analysis methods (the 9-window among them) in the
  prose as links - the full methods live in the appendix.
  Design-relevant ASSUMPTIONS render from the raid register - record them
  there, never inline.
Sources: context views @[[ref-sya-architecting]]; the methods notes.
-->
<!-- ai:3 -->
The boundary encloses two things. The project workspace, whose `spec/` folder holds all truth. And the global [engine](term:engine) binary, which reads and checks that folder. Everything else is outside. Each external interface is one neighbour note; the star and the table below derive from them.
---
fig: context-star
---
![[neighbours.base]]

<!-- ai:3 -->
The system does not:

<!-- ai:3 -->
- adjudicate. People decide. The engine records.
- replace git. History and merging stay with git.
- run a server or a database. It is files and one binary.
- judge prose truth. It checks structure, hashes, and recorded states.
- call the network at runtime. The one exception is the pinned Vale pull, loud when absent.

<!-- ai:3 -->
The context moves with time, and the system plans for it. The engine ratchets forward from each project's vendored source. A workspace never pins its own engine copy. Recorded state migrates forward through audited [determinizers](term:determinizer), never silently. The rendered book regenerates from the current state. A stale committed copy is a lint finding.

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
The stakeholder table lives in the [orientation chapter](man-ch0-orientation.md); every requirement's source traces to one of its rows (c29: one table, not two). Where two stakeholders pull against each other, the tension renders below - the reasoning is one click away.

![[tensions.base]]
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
[req-responsive-status](req-responsive-status.md) depth:2
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
  criteria bind: complete, consistent, affordable, bounded. The board doubles
  as the register's filter row (the recorded
  exemption from the pills rule) - click values to filter, several combine.
Sources: four core areas, Hauptmerkmalliste, staging @[[ref-pahl-beitz]];
  row schema @[[ref-methodische-entwicklung]]; attribute discipline
  @[[ref-modellbasierte-pe]]; set criteria @[[ref-iso-29148]].
-->
<!-- ai:3 -->
Needs are the user level; requirements are the system level; deeper tiers hang off refines. The board below shows the facet coverage - a zero-count hole is the completeness check, live. The board is also the register's filter: click a value to filter the table, several values combine. Statements are [EARS](meth-ears)-shaped and carry their tolerances; no TBD survives the detail gate.
---
fig: coverage-board
---
![[requirements.base]]

<!-- No "methods that apply here" section:
     mention an applicable method in the PROSE as a link - the full
     methods consolidate in the appendix. -->
