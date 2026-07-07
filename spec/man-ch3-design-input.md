---
id: man-ch3-design-input
type: manifest
mode: chapter
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
Contents: the working context - the boundary, every external interface, the
  neighbor systems; the explicit does-NOT-do list; the context's time dimension
  where it matters (interworking, upgrade and replacement strategy).
Motivation: ch0's star orients; this one BINDS. The does-not-do list is the
  scope-creep guard. Most specs forget the future row - what this system must
  coexist with and what replaces it.
Form: prose plus the interface list. The methods view below carries the analysis
  tools (the 9-window among them). Design-relevant ASSUMPTIONS render from the
  raid register - record them there, never inline.
Sources: context views @[[ref-sya-architecting]]; the methods notes.
-->
<!-- ai:3 -->
The boundary encloses two things. The project workspace, whose `spec/` folder holds all truth. And the global [engine](term:engine) binary, which reads and checks that folder. Everything else is outside.

<!-- ai:3 -->
The external interfaces, one per neighbor:

<!-- ai:3 -->
- The console. The [adjudicator](term:adjudicator) types commands there and blesses [gates](term:gate).
- The agent channel. An AI harness drives the same commands. An attested session key gates every [ledger](term:ledger)-advancing call.
- Git. It versions the workspace and carries collaboration. The engine works without it.
- Obsidian. An optional authoring preview over the same notes and queries. The engine owns the rendered truth.
- Vale. An optional prose register, version-pinned, pulled on demand. Its findings stay advisory.
- The reader's browser. It opens the rendered book, one self-contained file. It makes no further requests.

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
Every requirement's source traces to a row below; the statement column carries the concern. Where two rows pull against each other, the tension renders beneath the table - the reasoning is one click away.

![[stakeholder-matrix.base]]

![[tensions.base]]
---
## Use cases
<!-- tailor: shipped machinery - the view renders every use case state-aware at
  depth 2 (statement, gate state, rationale one disclosure away).
Sources: Cockburn use-case fields @[[ref-sya-re]].
-->
<!-- ai:3 -->
One section per use case, live from the graph - actors and trigger on the item, the success scenario in its body.

![[usecases.base]]
---
## Functions
<!-- fill [judgment]
Contents: the functional structure - verb plus noun, solution-neutral.
Motivation: physical types decompose by function before form (Pahl/Beitz).
Form: a tree or list. SKIP where the use cases already carry the functional
  story - record the skip in the tailoring row.
Sources: functional decomposition @[[ref-pahl-beitz]].
-->
<!-- ai:3 -->
The functional structure, one verb plus one noun per function, solution-neutral:

<!-- ai:3 -->
- Capture input
  - capture a note
  - mint an item
  - record a connection
- Advance the walk
  - pick the next check
  - record an adjudication
  - reopen a changed check
- Guard honesty
  - hash every input
  - attest a session
  - observe a test failing
- Derive output
  - render the book
  - emit the entry files
  - evaluate a query
  - compute coverage
- Sustain itself
  - rebuild the engine
  - migrate a workspace
  - test itself
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
