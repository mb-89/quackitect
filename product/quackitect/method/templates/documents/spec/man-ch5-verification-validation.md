---
id: man-ch5-verification-validation
type: manifest
mode: chapter
statement: Verification and validation - thing built right, right thing built.
---
<!-- design: method-chapter-canning  implements: req-chapter-canning :: ch5-ch8 generic ledes ship canned (owner walk 2026-07-06): the V&V split, the strategy fields, the matrix and waiver intros, the ch6 ledger prose, the ch7 annex lede, the ch8 quarantine and about-text; the authored residue is exactly the approach paragraph, the guides, the validation tracing, and the type-gated units. -->
## How we know it works
<!-- tailor: shipped text - the V&V split is the same in every project.
-->
<!-- ai:3 -->
Verification checks the thing was built right - every requirement against its evidence. Validation checks the right thing was built - the outcome against the needs and the success criteria. Both derive from the ledger below; the book can never claim more than the gate states.
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
## The verification matrix
<!-- tailor: shipped text - the matrix derives; an empty row IS the finding.
Sources: the empty-row check @[[ref-generic-se]].
-->
<!-- ai:3 -->
Every requirement below stands against its verifying evidence, cumulative across iterations. An empty row is a mechanically visible unverified requirement - the matrix cannot hide one.

![[vv-matrix.base]]
---
## Results and discussion
<!-- tailor: shipped machinery - the ledger renders results BY EXCEPTION: the
  green mass as a count, failures and accepted deviations prominently. The
  discussion prose per failure lives on the failing test item's body.
Sources: the lab rule @[[ref-mess-pruef-dok]].
-->
<!-- ai:3 -->
The count below summarizes what passed. Everything else renders by name - a failure without its discussion is not a result.
---
fig: results-exception
---
## Validation
<!-- fill [mandatory]
Contents: the right-thing check - against the ch1 needs and the criteria table
  below, closing the V. Acceptance state derives from the gates, never restated.
Form: prose tracing each criterion row to its demonstrated outcome; the table
  renders derived.
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
---
## Methods that apply here
<!-- tailor: shipped machinery - method notes route themselves by applies_chapters.
-->
![[methods.base#Methods for verification-validation]]
<!-- enddesign -->
