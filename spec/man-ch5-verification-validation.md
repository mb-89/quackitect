---
id: man-ch5-verification-validation
type: manifest
mode: chapter
order: 50
statement: Verification and validation - thing built right, right thing built.
---
## How we know it works
<!-- tailor: shipped text - the V&V split is the same in every project.
-->
<!-- ai:3 -->
Verification checks the thing was built right - every requirement against its evidence. Validation checks the right thing was built - the outcome against the needs and the success criteria. Both derive from the ledger below; the book can never claim more than the [gate](term:gate) states.
---
## The verdict first
<!-- tailor: shipped machinery - the exceptions view opens the chapter (bs20 ruling,
  2026-07-08, the no-green-ocean law): the verified mass as one derived count, every
  unverified requirement rendered prominently by name. With zero exceptions the block
  is one green sentence. The full matrix follows further down for the deep reader.
Sources: the empty-row check @[[ref-generic-se]]; the lab rule @[[ref-mess-pruef-dok]].
-->
<!-- ai:3 -->
The count below says how much is verified. Anything unverified renders here by name, before everything else - a hole never hides on page nine of a green table.
---
fig: vv-exceptions
---
## Strategy
<!-- tailor: shipped text - the method and level per test are FIELDS on the test
  items, rendered in the matrix below; a method or level choice that needs a why
  gets a rationale note. Tailor only if this project adds a strategy dimension.
Sources: model-first @[[ref-systementwurf-mechatronik]]; the orbit lesson
  @[[ref-se-thinking-learning]].
-->
<!-- ai:3 -->
Each test declares its method (test, analysis, inspection, demonstration) and its level (unit, integration, system, acceptance) - the matrix renders both. Verify on models early: an analytic reference case is the cheapest experiment. Integration-level evidence outweighs paper compliance - written compliance did not stop a receiver failing in orbit.
---
## The verification matrix
<!-- tailor: shipped text - the matrix derives; an empty row IS the finding, and it
  ALSO renders in the verdict-first block above (bs20 ruling: the exceptions lead,
  the full matrix serves the deep reader - paged by need, rows collapsed to names,
  expandable).
Sources: the empty-row check @[[ref-generic-se]].
-->
<!-- ai:3 -->
Every requirement below stands against its verifying evidence, cumulative across iterations. An empty row is a mechanically visible unverified requirement - the matrix cannot hide one, and the verdict block above renders every such row by name. A [bless](term:bless) turns a row verified; a changed input turns it [suspect](term:suspect).

![[vv-matrix.base]]
---
## Validation
<!-- fill [mandatory]
Contents: the right-thing check - against the ch1 needs and the criteria table
  below, closing the V. Acceptance state derives from the gates, never restated.
Form: prose tracing each criterion row to its demonstrated outcome; the table
  renders derived.
-->
<!-- ai:3 -->
Validation closes the V: the outcome stands against the needs of chapter 1 and the criteria below. Each criterion traces to a demonstrated behavior:

<!-- ai:3 -->
- The board is live. Every status and report call recomputes from the [ledger](term:ledger). No snapshot exists to go stale.
- The book stands alone. One file, no external requests. It reads without the repository, the [engine](term:engine), or an AI.
- Capture costs one command. A note lands in the inbox from the console and the agent channel alike.
- Killer checks are adjudicated by a person. The engine stamps the actor by channel, and the self-certification metric stays visible.
- Tests are born red. The failing run is recorded before the implementation exists. A fabricated red is refused.

<!-- ai:3 -->
Acceptance state derives from the gates. The validation [milestone](term:milestone) carries the adjudication; this chapter never restates it.

![[criteria.base]]
---
## Accepted deviations
<!-- tailor: shipped text - the waiver view derives; a waiver is ALWAYS a
  user-adjudicated gate.
-->
<!-- ai:3 -->
A row below is a failed check the project accepted anyway - a wvr- decision addressing the failed requirement and linking the evidence. An undecided deviation never lands here; it stays loudly visible above.

![[decisions-waiver.base]]
---
## Methods that apply here
<!-- tailor: shipped machinery - method notes route themselves by applies_chapters.
-->
![[methods.base#Methods for verification-validation]]

<!-- Verification records skipped: the unit is gated [type: manufactured_good,
     cyber_physical] and this deliverable is software - the run log is already
     machinery; the ch6 tailoring row records the skip. -->
