---
form: observe-red
by: agent
signed_off: 2026-08-13T14:33:16.500Z
authors: agent
files:
---

# Evidence form / observe-red

## current_situation

Two checks run and both fail before any code lands. That is what this state exists to prove. The run is job test-msra35w9-8, 2 of 2 failing.

THE FIRST RED. "the reading credit survives a reload" expected an empty credit list after a second Session over one root. It got all three boot documents back: boot.md, front-desk.md and refusals.md. The credit died with the process, which is the defect the requirement removes.

THE SECOND RED. "a document whose content moved is owed again" expected exactly the changed document. It got all three. So today the reload cannot tell a moved document from an unmoved one, because it has forgotten both.

The second message is the more useful of the two. It shows the SHAPE the fix must produce, not merely that today is wrong.

THE FIRST DRAFT OF BOTH WAS WRONG, AND THIS STATE CAUGHT IT. They asserted that route_reads falls to zero after a read, and both then failed at that precondition rather than at their claim. The way ahead RECOMPUTES what it demands, so the owed list was never a credit ledger. The oracle moved to the read's own credited answer, which reading.test.ts already pins.

A case that fails for the wrong reason reads as coverage and proves nothing. Catching that here is worth more than the reds themselves.

THE SEVEN NON-TEST SPECS ARE CHECKED AS RED-IMPOSSIBLE, which the guidance names as a legal claim. Each covers standing behaviour older than this delta and none is in its scope.

- tsp-derivation-analysis covers standing analysis this delta does not touch.
- tsp-desk-and-gates covers the desk and the gates, which i3's scope never reaches.
- tsp-first-run covers the first run, unchanged here.
- tsp-panel-walkthrough covers a surface, and i3 changes no surface.
- tsp-prose-inspection covers prose, and the three new requirements passed se_lint clean.
- tsp-record-inspection covers records, untouched here.
- tsp-tour-run covers the tour, outside this delta.

## red_observed

- [x] tsp-autonomy-tiers
- [x] tsp-derivation-analysis
- [x] tsp-desk-and-gates
- [x] tsp-first-run
- [x] tsp-panel-walkthrough
- [x] tsp-prose-inspection
- [x] tsp-record-inspection
- [x] tsp-tour-run

## follow_up

- build the credit so both cases go green, keyed to document content rather than to a path
- keep the second case honest through the build, since a credit that survived everything would pass the first and fail the second
- the two owed steps stay owed, and tsp-walk-feedback-loop names them

## anything_else

ONE SPEC WAS ADDED AFTER THIS STATE SIGNED, and its red is real rather than red-impossible.

tsp-autonomy-tiers arrived when trunk was synced into the record, late in the walk. It belongs to the previous iteration's tier cut-over.

Its red was observed before anything was built, by the tester, on 2026-08-13:

- Line 2 failed. Five machine canvases still carried numeric autonomy weights, and four files still said "slider". Both named with files and lines.
- Line 3 failed. render.ts drew the posted autonomy value with no tier word beside it.
- Lines 1 and 4 passed, line 4 by its own written exemption.

That red is what put the cut-over into this iteration's scope. It was not planned work here.

THE OTHER SEVEN STAY RED-IMPOSSIBLE, unchanged. Each covers standing behaviour older than this delta and none is in its scope.
