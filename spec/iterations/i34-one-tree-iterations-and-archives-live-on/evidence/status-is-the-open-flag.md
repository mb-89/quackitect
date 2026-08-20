---
form: status-is-the-open-flag
by: agent
signed_off: 2026-08-16T08:04:37.163Z
authors: agent
files: null
---

# Evidence form / status-is-the-open-flag

## current_situation

The open flag now comes from the record's own status, at every site.

THE SIX SITES the requirement named, and what each one asked before: itList asked whether a worktree directory existed, itFind refused a record it read as not open on the same basis, generateIterations and generateIterationArchive filtered on it, expList did the same for expeditions, and survey read the status AND the directory.

FIVE OF THE SIX COLLAPSED INTO ONE. itList is the only reader of "is this open" for iterations, and every other site takes its answer, so fixing it fixed them all.

## built

engine/iterations.ts, engine/survey.ts.

`RECORD_FINISHED` IS EXPORTED FROM iterations.ts — the set {shipped, closed}. It was `const FINISHED` inside survey.ts, private, which is why two readers could disagree.

`itList` APPLIES IT. Each record's status is read from its record.md and `open` is `!RECORD_FINISHED.has(status)`. No filesystem question remains.

survey.ts DROPPED ITS OWN COPY and its own filter. There is nothing left for it to filter, because the list it receives is already right.

expList IS UNTOUCHED and that is deliberate. It lists EXPEDITIONS, which still carry branches and worktrees; i34's scope is iterations and the archive. The site is named on the requirement so the next reader knows it was seen rather than missed.

MEASURED: run test-msviovga-26, 21 of 21. The check the requirement asked for — a record stamped shipped leaves the container whatever stands on disk — was red at observe-red and is green.

## follow_up

- THE PROOF IT WAS BROKEN IS NOW A TEST. i28 stood in the container's list and not in the survey's on 2026-08-16, with `status: shipped` and its worktree still there. onetree.test.ts drives exactly that case: stamp a record shipped, leave every directory in place, and assert the container drops it.
- ONE SITE IS DELIBERATELY LEFT: expList, for expeditions. It is out of i34's scope and it is named rather than silently skipped.
- NEXT IS delete-the-seam.

## anything_else

THE FALSE GREEN THIS CHECK ONCE GAVE is worth keeping, because it nearly hid the whole thing.

At observe-red the shipped-record test PASSED on its first run, and the pass was worthless. It asserted the container's offer did not include `iterations/i1-open-iteration-number-1`. The offer never carries that string: `generateIterations` keys every node by `itShortId`, so the options read `iterations/i1`.

THE ASSERTION COULD NOT HAVE FAILED UNDER ANY BEHAVIOUR. Had it been left, it would have gone green after this build for the same wrong reason, and the build would have been declared correct on evidence that never tested it.

WHAT CAUGHT IT was observe-red's own discipline: two of three reds arrived, the third did not, and a green nobody expected had to be explained.
