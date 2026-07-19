---
id: man-verification-validation
type: manifest
mode: chapter
order: 50
statement: V&V - verification and validation: thing built right, right thing built.
---
<!-- design: method-chapter-canning  implements: req-chapters-canned.4 :: ch5 through ch8 generic ledes ship canned: the V&V split, the strategy fields, the matrix and waiver intros, and the ch6 ledger prose. The annex lede and the ch8 quarantine and about-text ship canned too. The authored residue is exactly the approach paragraph, the guides, the validation tracing, and the type-gated units. How we know it works. -->
## How we know it works
<!-- tailor: shipped text - the V&V split is the same in every project.
-->
<!-- ai:3 -->
Verification checks the thing was built right - every requirement against its evidence. Validation checks the right thing was built - the outcome against the needs and the success criteria. Both derive from the ledger below; the book can never claim more than the gate states.
---
## The verdict first
<!-- tailor: shipped machinery - the exceptions view opens the chapter (the
  no-green-ocean law): the verified mass as one derived count, every
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
Each test declares two fields, and the matrix renders both:

<!-- ai:3 -->
- its method: test, analysis, inspection, or demonstration
- its level: unit, integration, system, or acceptance

<!-- ai:3 -->
Verify on models early: an analytic reference case is the cheapest experiment. Integration-level evidence outweighs paper compliance - written compliance did not stop a receiver failing in orbit.
---
## Verification records
<!-- fill [type: manufactured_good, cyber_physical]
Contents: one line introducing the records - physical tests wrap their measured
  runs in rec- notes (setup with sketch, equipment with serials, values, ambient
  conditions, disturbances); the result contract is value plus-minus uncertainty
  against an acceptance rule fixed BEFORE the run.
Motivation: a result without its uncertainty is not a result. Software's
  analogue - the run log - is already machinery.
Form: one prose line; the records link from the matrix.
Sources: the six-part record, the result contract @[[ref-mess-pruef-dok]].
-->
<!-- ai:3 -->
{{records-lede}}
---
## Verification
<!-- tailor: shipped text - the matrix derives; an empty row IS the finding, and it
  ALSO renders in the verdict-first block above (the exceptions lead,
  the full matrix serves the deep reader - paged by need, rows collapsed to names,
  expandable).
Sources: the empty-row check @[[ref-generic-se]].
-->
<!-- ai:3 -->
Every requirement below stands against its verifying evidence, cumulative across iterations. An empty row is a mechanically visible unverified requirement - the matrix cannot hide one, and the verdict block above renders every such row by name.

![[vv-matrix.base]]
---
## Validation
<!-- fill [mandatory]
Contents: the right-thing check - against the motivation chapter's needs and the
  criteria table below, closing the V. Acceptance state derives from the gates,
  never restated.
Form: ONE short paragraph saying what the table IS
  (no per-criterion "traces to a demonstrated behavior" prose - a hand-restated
  demonstration is derivable content); the table renders derived.
-->
<!-- ai:3 -->
{{validation}}

![[criteria.base]]
---
## Accepted deviations
<!-- tailor: shipped text - the waiver view derives; a waiver is ALWAYS a
  user-adjudicated gate.
-->
<!-- ai:3 -->
A row below is a failed check the project accepted anyway - a wvr- decision addressing the failed requirement and linking the evidence. An undecided deviation never lands here; it stays loudly visible above.

![[decisions-waiver.base]]

<!-- No "methods that apply here" section:
     mention an applicable method in the PROSE as a link - the full
     methods consolidate in the appendix. -->
<!-- enddesign -->
