---
id: man-ch4-design-output
type: manifest
mode: chapter
statement: Design output - the architecture derived, then the design deep down.
---
## What we built, and how we chose it
<!-- fill [mandatory]
Contents: the chapter in one breath - part A derives the architecture, part B
  carries the detailed design and its specs.
Form: two to four sentences. The sorting rule for everything here: a decision is
  ARCHITECTURAL if it has system-wide impact or affects an important quality -
  otherwise it is detailed design (Bass).
Sources: architecture vs design table @[[ref-sya-architecting]].
-->
<!-- ai:3 -->
{{lede}}
---
## Drivers and strategy
<!-- fill [mandatory]
Contents: the architecturally significant requirements (the high-weight and
  quality rows); the driver groups (business, cost and time, solution levers);
  the approach style (top-down, middle-out, bottom-up) with one line of why.
Motivation: strategy answers drivers - each strategic choice names the goal or
  quality it serves and links the decision that fixed it.
Form: short prose plus the derived ASR view below.
Sources: drivers, approach styles @[[ref-sya-architecting]].
-->
<!-- ai:3 -->
{{drivers-and-strategy}}

![[asr.base]]
---
## The solution space
<!-- fill [mandatory]
Contents: one line per decision axis - what it decides, which candidates ran.
Motivation: the derivation is VISIBLE: candidates are items, the matrix renders
  them against the criteria, the deciding records own the verdicts. This view
  replaces hand-written Pugh tables - in the book AND the milestone evidence.
Form: short prose, then the derived matrix. Anti-bias discipline lives in the
  decision records: weights fixed BEFORE options are scored; a question mark is
  a legal verdict meaning information gap. Methods: morphological analysis,
  design-space exploration, set-based design - in the methods view.
Sources: anti-bias @[[ref-methodische-entwicklung]]; FRAME @[[ref-sya-tactics]].
-->
<!-- ai:3 -->
{{solution-space}}

fig: candidates-matrix
---
## Partitioning and interfaces
<!-- fill [mandatory]
Contents: the element tree; the interfaces; a short prose unit on the
  partitioning forces that won (volatility separation, reuse, discipline
  boundaries).
Motivation: partitioning defines the system's cost. Deep why goes to ch7.
Form: fig block-tree plus prose. Element descriptions follow per block: name,
  responsibility, behavior and states, interfaces, realization concept (make,
  reuse, or buy - early supplier involvement flagged), allocated requirements.
  Software blocks DERIVE from the design markers in code; physical artifacts get
  design notes wrapping the artifact.
Sources: partitioning forces, block description @[[ref-sya-architecting]].
-->
<!-- ai:3 -->
{{partitioning}}

fig: block-tree
---
## Budgets
<!-- fill [type: manufactured_good, cyber_physical]
Contents: the requirement-to-metric-to-budget chain - each system budget with
  its AGREED summation rule recorded.
Motivation: suppliers game rss summation to hide overruns - the rule is part of
  the budget or the budget is theater.
Form: one table per budget; the rule named beside it.
Sources: budgets, summation rules @[[ref-systementwurf-mechatronik]].
-->
<!-- ai:3 -->
{{budgets}}
---
## Decisions
<!-- fill [mandatory]
Contents: one line introducing the architecture decisions view.
Motivation: without decisions there is no architecture - and every decision
  names the requirement it addresses.
Form: one prose line; the view renders derived. Waivers render in verification
  and validation; project decisions in the project chapter.
Sources: every decision names the requirement it addresses @[[ref-sya-architecting]].
-->
<!-- ai:3 -->
{{decisions-lede}}

![[decisions-architecture.base]]
---
## Design rules
<!-- fill [judgment]
Contents: the binding rules detailed design must honor - interface rules,
  patterns to use, guidelines.
Motivation: governance is what makes drift detectable later. Normative layer.
Form: a short list. Skip with a recorded reason where one team holds everything.
Sources: governance @[[ref-sya-architecting]].
-->
<!-- ai:3 -->
{{design-rules}}

<!-- Trace coverage (requirement x implementing design, empty row = hole) renders
     from the graph - quack lint computes it; no authored unit. -->
