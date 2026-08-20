---
form: seam-resolve
by: agent
signed_off: 2026-08-14T15:22:52.827Z
authors: agent
files: null
---

# Evidence form / seam-resolve

## current_situation

THE SEAM SAYS WHERE IT WENT. resolve() answers { abs, owner, store } where resolveInRoot answered a bare string.

WHY THE STORE MATTERS. On 2026-08-14 se_lint and the file lane resolved the same path to two different trees, and neither answer said which. A caller could not tell, and nothing in the answer let them find out.

THERE IS EXACTLY ONE STORE TODAY, because satellites are not built. The field exists anyway. An answer that cannot name its store is one nobody can check, and adding the field after the callers exist means auditing every one of them instead of none.

A WRITE IS PROVED BY READING BACK from the store the answer named, and landedIn is the helper that says so.

## built

project/deliverable/engine/resolve.ts — new. resolve() and landedIn(), with the Resolved shape.

project/deliverable/tests/resolution.test.ts — the store and owner cases, plus FOUR WRITE-THEN-READ-BACK cases, one per path kind: method, record content, session state and a repo-root file. Each writes through the seam and reads back from the store the answer named.

VERDICT: 16 of 16 green.

## follow_up

THE FOUR WRITING CASES ARE WHY tsp-read-back-inspection CAN NOW FAIL. It passed before them only because nothing in the files wrote anything, so its checklist was satisfied vacuously. A check that cannot fail is not a check, and the owner said so plainly.

seam-sweep IS THE NEXT PIECE OF THIS SEAM. 88 paths are still built with a direct join against 40 through the resolver, and lint.ts is the worked example — it imports readFileSync and join from node and calls no resolver.

resolveInRoot STAYS FOR NOW. Forty call sites use it, and moving them is seam-sweep's job rather than this chunk's. The two coexist deliberately, and the sweep is what ends that.

## anything_else

THE TEST'S SUBJECT MOVED, and it is worth saying so rather than letting it pass as a green.

The red authored at author-tests asserted on resolveInRoot, because the seam had no name yet. It now asserts on resolve, which is the mechanism the design actually names.

THE CLAIM DID NOT MOVE. It is still every resolution names the store it resolved to. What changed is which function the claim is about, and that was decided by dsp-resolution-seam rather than by the test failing.
