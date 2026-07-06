---
id: man-ch5-verification-validation
type: manifest
mode: chapter
statement: Verification and validation - thing built right, right thing built.
---
## How we know it works
<!-- fill [mandatory]
Contents: the chapter in one breath - verification pairs with the requirements,
  validation pairs with the needs and success criteria.
Form: two to four sentences. Spell the title out - beginners do not know V&V.
-->
<!-- ai:3 -->
{{lede}}
---
## Strategy
<!-- fill [mandatory]
Contents: what gets verified how - the method per requirement (test, analysis,
  inspection, demonstration) JUSTIFIED; the level per requirement (unit,
  integration, system, acceptance); the model-first rule (verify on models
  early - an analytic reference case is the cheapest experiment).
Motivation: written compliance did not stop a receiver failing in orbit -
  integration-level evidence outweighs paper compliance. Reviews count: an
  inspection-method verification is a review, and the ledger's adjudications
  are that evidence.
Form: prose plus a short mapping list.
Sources: model-first @[[ref-systementwurf-mechatronik]]; the orbit lesson
  @[[ref-se-thinking-learning]].
-->
<!-- ai:3 -->
{{strategy}}
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
<!-- fill [mandatory]
Contents: one line introducing the derived matrix - every requirement against
  its verifying evidence, cumulative across iterations.
Motivation: an empty row is a mechanically visible unverified requirement.
Form: one prose line; the matrix renders derived.
Sources: the empty-row check @[[ref-generic-se]].
-->
<!-- ai:3 -->
{{matrix-lede}}

![[vv-matrix.base]]
---
## Results and discussion
<!-- fill [mandatory]
Contents: rendered BY EXCEPTION - derived counts summarize the green mass;
  failures and deviations render prominently with their discussion.
Motivation: error discussion is mandatory (the lab rule); evidence that can be
  retold as a story is evidence that gets believed.
Form: short prose per failure or deviation, on the test item's body, linked here.
Sources: the lab rule @[[ref-mess-pruef-dok]].
-->
<!-- ai:3 -->
{{results-by-exception}}
---
## Validation
<!-- fill [mandatory]
Contents: the right-thing check - against the ch1 needs and success criteria,
  closing the V. Acceptance state derives from the gates, never restated.
Form: prose tracing each success criterion to its demonstrated outcome.
-->
<!-- ai:3 -->
{{validation}}
---
## Accepted deviations
<!-- fill [mandatory]
Contents: one line introducing the waiver view - a failed check the project
  accepted anyway, each a wvr- decision addressing the failed requirement and
  linking the evidence.
Motivation: a waiver blesses a FAILURE - always a user-adjudicated gate. An
  undecided deviation stays loudly visible above.
Form: one prose line; the view renders derived.
-->
<!-- ai:3 -->
{{waivers-lede}}

![[decisions-waiver.base]]
