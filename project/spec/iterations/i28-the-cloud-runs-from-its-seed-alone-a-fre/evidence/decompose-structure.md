---
form: decompose-structure
amended: "2026-08-15T18:34:46.273Z by agent — the owner reversed the expiring claim, so the renewer element and its interface no longer exist and the allocation loses one spread"
by: agent
signed_off: 2026-08-15T18:14:02.214Z
authors: agent
files:
---

# Evidence form / decompose-structure

## current_situation

The design becomes structure. One element is new, two are revised, nine stand unchanged.

THIS IS A BROWNFIELD DECOMPOSITION. Ten elements existed before this iteration, and the design touches three of them.

THE ELEMENT SET SHRANK AFTER THE OWNER'S RULING of 2026-08-15. A second new element existed to renew a claim on a timer, and there is no timer.

## elements

- [[el-account]]
- [[el-bootstrap]]
- [[el-claim-ledger]]
- [[el-entrypoint]]
- [[el-front-desk]]
- [[el-holding-pen]]
- [[el-method-compiler]]
- [[el-mirror]]
- [[el-record-store]]
- [[el-test-runner]]
- [[el-walk-engine]]

## allocation

### Where one function is implemented in several places, and why

ONE FUNCTION IS SPREAD, and the spread is argued here. A spread that is not argued reads as duplication.

### stand-up-a-product, in two elements

[[el-bootstrap]] AND [[el-entrypoint]] both implement it.

- Bootstrap converges a machine toward the template and reports drift. It answers whether a product exists and runs.
- The entrypoint goes three steps further, into fetch, adopt and launch. It answers whether an AGENT is working on a NAMED iteration.

THE FUNCTION COVERS BOTH BY ITS OWN WORDS: take a computer with nothing on it to a product that is running, whether it stops at its own front desk or walks straight into work. The two halves of that sentence are the two elements.

SPLITTING THEM MATTERS because their failure modes differ. A half-installed machine looks finished. A machine that installed cleanly and adopted nothing is idle and silent.

### No boundary owes a contract

INTERFACE DEBT IS ZERO. No flow crosses an element boundary without a contract carrying it.

### What the first two drafts got wrong, kept because it is the useful part

THE FIRST ALLOCATION OWED TEN CROSSINGS. The engine computed them and named every pair; I had argued four in prose and matched none of them.

THE CAUSE WAS ALLOCATION, NOT INTERFACES. Two elements had been given functions broader than what they do, and each dragged its element into every flow those functions touch. Narrowing them left one crossing.

THE SECOND DRAFT LOST THAT CROSSING TOO, and for a different reason. It joined a renewal clock to the record store, and the owner then ruled on 2026-08-15 that a claim has no timer at all. With no clock there is no element to renew anything, and no boundary for it to cross.

THE LESSON SURVIVES BOTH DRAFTS. A wrong allocation is invisible in prose and obvious the moment the boundaries are computed from it.

### The holes, named rather than left to be found

NO ELEMENT IMPLEMENTS NOTHING. The one new element names the single function it realizes.

NO FUNCTION THIS ITERATION TOUCHED IS UNIMPLEMENTED. The five it revised are carried by the elements above.

## follow_up

- evaluate-architecture is next, and it walks the quality scenarios against this structure
- NO INTERFACE IS OWED. Interface debt reads zero.
- ONE ELEMENT IS WRITTEN SO EITHER ANSWER FITS. [[el-entrypoint]] does not assume a declared image, because that decision is owed and was not made at M5.
- ONE HOLE IS REOPENED BY THE REVERSAL. Nothing releases a claim when a machine dies, so [[raid-a-crashed-walk-leaves-a-folder-that-means-nothing]] is unanswered again.
- A STALE CONTROL LINE IS PARKED FOR THE SWEEP. `fn-run-a-governed-walk.share-the-pool` names a person as the only thing that releases a claim, which the owner's ruling has now made true again.
- nothing else is parked from this state

## anything_else

### The one new element

[[el-entrypoint]] DRIVES SEVEN STEPS from a repository address to a walking agent. It is separate from [[el-bootstrap]] because bootstrap stands a PRODUCT up, and this goes three steps further.

### The two revisions, stated as supersessions

[[el-claim-ledger]] now says plainly what ends a claim: a person, and nothing else. An idle machine keeps its iteration however long it sits. It also owns the worktree's lifetime, which the record store used to.

[[el-record-store]] no longer binds a worktree. Its job narrowed to what records exist, and that answer now comes from git branches rather than from folders on disk, through exactly one reader.

### The element that was minted and then removed

A RENEWAL CLOCK WAS AN ELEMENT FOR ABOUT AN HOUR. It renewed a claim while a walk ran and let the claim end when renewal stopped.

THE OWNER RULED IT OUT: a machine keeps its item even after hours of silence, unless somebody overrides it by hand.

SO THE ELEMENT IS GONE RATHER THAN DISABLED. There is no clock anywhere in this structure, and the design is smaller for it.

### What this decomposition does NOT settle

WHETHER A WALK NEEDS A WORKTREE AT ALL. [[cand-no-folders-at-all]] tied the winner at deficit zero. If a later iteration removes trees entirely, the ledger's ownership of tree lifetime becomes vacuous rather than wrong.

HOW THE RUNTIME ARRIVES. The entrypoint's verify and install steps exist because no image decision was made.

WHAT FREES AN ITERATION FROM A DEAD MACHINE. The reversal reopens it, and nothing in this structure answers it.
