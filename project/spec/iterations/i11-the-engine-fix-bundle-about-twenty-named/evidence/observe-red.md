---
form: observe-red
by: agent
signed_off: 2026-08-16T11:51:45.760Z
authors: agent
files:
---

# Evidence form / observe-red

## current_situation

SIX OF SIX CHECKS FAIL, run `test-msvqis6r-25`, scoped to the two new files. Nothing is built, so nothing should pass.

THE FIRST RUN WAS 5 FAIL AND 1 PASS, AND THE PASS WAS HOLLOW. `test-msvqhjc0-24`. The case asserted that the refusal's `problems` carried no "owed" line, which is trivially true whenever the call is refused for any OTHER reason — and it was. The check could not have gone red under any behaviour.

IT IS FIXED RATHER THAN EXPLAINED. The case now asserts the call is not refused at all, which today it is. req-first-green-needs-a-red exists for exactly this, and i34 shipped one of these once and had it caught late.

## red_observed

- [x] tsp-autonomy-tiers
- [x] tsp-bound-surface
- [x] tsp-derivation-analysis
- [x] tsp-desk-and-gates
- [x] tsp-first-run
- [x] tsp-panel-walkthrough
- [x] tsp-prose-inspection
- [x] tsp-read-back-inspection
- [x] tsp-record-inspection
- [x] tsp-tour-run
- [x] tsp-two-machines
- [x] tsp-unattended-start

## follow_up

THREE RULINGS ARRIVED AT THIS STATE and are recorded at raid-dec-the-engine-runs-the-red-and-owns-its-own-promotions. All three came from the state demonstrating the defect live, and all three say the same thing: the engine should do it, not the agent.

- THE ENGINE FIRES THE RED at observe-red's submit, the way verification already fires the battery. observe-red does not grant se_test, so the agent reached for the shell. Granting the verb was the obvious fix and the owner rejected it for the better one.
- A PROMOTION IS SCOPED TO ITS OWN RECORD. specify-build refused twice on promotions belonging to i27's shipped drawings, and withdrawing them was work nobody needed.
- A TRUNCATING PIPE IS REFUSED, not annotated afterwards. It fired at this state: a run piped through Select-String returned exit 1 with empty output, and the red had to be re-run to be read.

THE THIRD ONE CARRIES A QUESTION WORTH ANSWERING AT THE BUILD: why it happens so often. The pipe gets reached for when the lane has no verb for the job and the output is expected to be long — which is the same root as the se_test gap above it.

THE BUILD STARTS WITH THE BUCKET, all three pieces in one chunk: the permission, the guard, and the close-side reader that has never existed.

## anything_else

### The non-test checklist: what each check claims

THE GUIDANCE ALLOWS TWO CLAIMS and eleven of the twelve take the second: red is IMPOSSIBLE for a spec covering standing behaviour, and that is accepted. This delta changes what a lane call costs. It does not touch what these specs describe.

- tsp-autonomy-tiers, tsp-derivation-analysis, tsp-prose-inspection, tsp-read-back-inspection, tsp-record-inspection: inspection and analysis over standing behaviour. Nothing in i11's scope moves what they inspect.
- tsp-desk-and-gates, tsp-first-run, tsp-tour-run, tsp-panel-walkthrough, tsp-bound-surface: demonstrations of surfaces this delta does not change in kind. The two mirror buttons ADD a control; they alter no procedure step in any of these.
- tsp-unattended-start: its subject is the launch path, which i34 switched off. Red is impossible because the procedure cannot be run at all.
- tsp-two-machines: minted by i34 and never performed, for the same reason — it needs a second host that does not exist. Its own body says so rather than implying otherwise.

THE TWELFTH CLAIM IS THE ONE WORTH ARGUING WITH. tsp-carry-a-finding is this iteration's own demonstration spec and it is NOT on the engine's list — it carries `verifies: []`, so the checklist does not see it. Its red was walked on paper: step 3 asks the engine to accept an owed item naming an open register entry, and the engine refuses. tsp-the-bucket's second case proves that mechanically, and it is red.

### Where the bucket would have been used, if it existed

THIS CHECKLIST IS EXACTLY THE SHAPE THE BUCKET IS FOR. Twelve boxes, eleven of them claiming "red is impossible, accepted" — which is a disposition, argued once and then ticked.

WITH THE BUCKET BUILT, tsp-carry-a-finding's absence from the list would be an OWED item pointing at an open entry, rather than a paragraph in anything_else that a reader has to find. That is the difference the iteration is building: a disposition somebody can disagree with, in the place they would look.
