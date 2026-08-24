---
form: decompose-structure
by: agent
signed_off: 2026-08-23T18:17:53.095Z
reopened: "2026-08-23T18:14:01.707Z — no interface carries the view model out of the resolver, and the guard element implements a function it does not perform"
amended: "2026-08-23T18:02:37.120Z by agent — the follow-up said one interface was owed; the element matrix computed seven"
authors: agent
files:
---

# Evidence form / decompose-structure

## current_situation

THE ELEMENT SET ALREADY STANDS, twenty-seven elements from earlier rounds, so this state decomposes the delta rather than the product.

THE DECISION INTRODUCES TWO MECHANISMS and each becomes one element. The surface element that already existed is superseded in what it does rather than replaced.

THIS IS THE SECOND PASS. A cold review found the first one materially wrong and the repairs are named in the follow-up rather than smoothed away.

## elements

- el-view-resolver
- el-widget-guard
- el-mirror

## allocation

| element | group | implements |
| --- | --- | --- |
| el-view-resolver | the-account | fn-run-a-governed-walk.show-where-it-stands |
| el-widget-guard | the-walk | fn-run-a-governed-walk.guard-a-write |
| el-mirror | the-account | fn-run-a-governed-walk.show-where-it-stands, fn-run-a-governed-walk.teach-the-newcomer, fn-run-a-governed-walk.work-the-register |

THE SHOW-WHERE-IT-STANDS FUNCTION IS IMPLEMENTED TWICE ON PURPOSE, and the spread is the information. el-view-resolver decides what is shown; el-mirror draws it. Many-to-many is legal and this is what it looks like when a responsibility genuinely splits.

el-widget-guard SITS IN the-walk, matching the cluster of the function it implements. It was first placed in the-account, which put it in a different cluster from its own function, and a cold review caught that.

NO OTHER ELEMENT'S ALLOCATION MOVES.

## follow_up

ELEVEN INTERFACES STAND WHERE SEVEN DID, and the four added are the ones the first pass missed.

- if-view-resolver-to-mirror, carrying the new flow-view-model. THE FIRST PASS MINTED NOTHING OUTBOUND AT ALL. Every crossing ran into the resolver, so the element that computes the view had no way to deliver it. The owed-crossing check passed because it computes from flows, and no flow for the view model existed until now.
- if-mirror-to-view-resolver, carrying flow-intent and flow-filter. The return half, without which no act reaches the engine. flow-filter was dropped in the first pass, while the resolver claimed to satisfy the filter requirement.
- if-method-compiler-to-view-resolver and if-engine-delta-to-view-resolver. Both fed the surface directly, which left the machine drawing derived exactly where the decision says nothing may be derived. Their mirror-bound originals are marked superseded rather than deleted.

THE REPAINT NOW HAS A PATH. An act crosses on if-mirror-to-view-resolver, the engine resolves the new view, and it returns on if-view-resolver-to-mirror. One round trip, which is what the requirement asks.

el-widget-guard NO LONGER CONTRADICTS ITSELF. It claimed to implement a pre-write check while describing a lint pass. It now answers at the write where it can and moves to the sweep where it cannot, which is this system's own rule rather than a special case.

WHAT THE REVIEW COST AND WHY IT WAS WORTH IT: the first decomposition would have passed its own mechanical checks with the decisive interface missing. Nothing in the machine could have caught that, because the check computes owed crossings from flows and the missing flow was mine to mint.

## anything_else

