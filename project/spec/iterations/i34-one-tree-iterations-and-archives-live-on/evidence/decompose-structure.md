---
form: decompose-structure
amended: 2026-08-16T07:18:32.154Z by agent — both claim-ledger interfaces are now deleted, and the form still claimed neither element was removed here — which is what left if-claim-ledger-to-record-store…
by: agent
signed_off: 2026-08-16T06:31:56.557Z
authors: agent
files: null
---

# Evidence form / decompose-structure

## current_situation

i34 stands at decompose-structure, walked back to because it was never filled — the third state this iteration found that way, after write-stories and generalize-use-cases.

AT MINOR ONE EDIT IS LEGAL: new functions allocate into existing elements. i34 adds no function, so the structure does not move. What it does is REMOVE, and two standing elements are directly hit.

THE ESCALATION TRIGGER DOES NOT FIRE. It fires on wanting a NEW element or interface. i34 wants neither.

## elements

- el-account
- el-bootstrap
- el-core
- el-engine-delta
- el-front-desk
- el-holding-pen
- el-method-compiler
- el-mirror
- el-record-store
- el-resolution-seam
- el-satellite-supervisor
- el-satellite
- el-test-runner
- el-walk-engine

## allocation

THE MATRIX IS NOT WRITTEN HERE, per the template: it is drawn from `implements` on the element nodes, from the flow crossings, and from the interface nodes, on every look. What this section carries is the ARGUED SPREAD.

i34 CHANGES NO ALLOCATION AND REMOVES ONE ELEMENT. It adds no function, so no function needs a new implementer.

AMENDED 2026-08-16. This section first argued that el-claim-ledger kept its place while losing its implementation, and that `share-the-pool` would stand as a function nothing implements. The owner ruled otherwise: the claim system goes everywhere it ripples. So el-claim-ledger, `fn-run-a-governed-walk.share-the-pool` and `if-claim-ledger-to-satellite-supervisor` are all deleted, and the element set is fourteen rather than fifteen.

THE HOLE IS THEREFORE CLOSED RATHER THAN DECLARED, which is the better outcome and not the one this state reached on its own. A function nothing implements is a finding; a function that no longer exists is not.

ONE SPREAD IS STILL WORTH ARGUING. `resolve-a-path` is implemented by el-resolution-seam and stays that way. Its work collapses to a constant — one store, so the decision has one answer — but the function is still performed and still named. An element whose inside empties has not stopped implementing. Retiring it would claim the product stopped resolving paths, which is false.

THE FOUR NEW REQUIREMENTS REACH THE STRUCTURE TRANSITIVELY: served by a function, implemented by an element. None is named directly in an element's `satisfies`, because none is a structural quality or an imposed constraint.

## follow_up

- ONE ELEMENT IS HIT AND IT IS DELETED. el-claim-ledger's black box was holding a lock between machines, and after i34 nothing holds one. The element described a capability the product no longer has. raid-dec-the-machine-locking-specification-is-retired-whole carries the ruling.
- BOTH ITS INTERFACES WENT WITH IT. if-claim-ledger-to-satellite-supervisor and if-claim-ledger-to-record-store are deleted. An interface whose source element does not exist is a dangling end, and the corpus check catches it — which is how the second one was found, three states downstream.
- el-resolution-seam SURVIVES AND COLLAPSES TO ALMOST NOTHING. A path still resolves; there is one store to resolve it against, so the element's black box stays true and its inside empties.
- THE FOUR NEW REQUIREMENTS REACH THE STRUCTURE TRANSITIVELY, which is the path the method prefers. Each is served by a function, and each of those functions is implemented by a standing element. Nothing is named directly in an element's `satisfies`, because nothing about them is structural.
- NEXT IS specify-build, then observe-red — where the four checks must go red before anything is built.

## anything_else

WHY el-resolution-seam IS NOT RETIRED ALONGSIDE el-claim-ledger, since i34 deletes most of its code.

AN ELEMENT IS A BLACK BOX, described by what it does rather than by how much code it takes. "Decide which store answers a path, and say so" stays true when there is one store: the decision is trivial and the answer is still named. Retiring it would claim the product stopped resolving paths, which is false.

el-claim-ledger IS DIFFERENT. Its black box is holding a lock between machines, and after i34 nothing holds one. The element describes a capability the product no longer has, which is the test the register's own rule applies.

WHAT THIS STATE GOT WRONG THE FIRST TIME, kept because it cost three states to find. The form said "an iteration may create a node and never remove one", and left both elements standing. That is not a rule anywhere; it was invented here. Removing a feature and leaving its nodes in the corpus does not preserve history — it leaves dangling ends that the check refuses, at a state far downstream from where the reason lives.

THE STATE ALSO COULD NOT HAVE DONE IT. decompose-structure owned the elements and interfaces and had no delete verb; only the three build rows did. That is fixed: M5_30B now carries se_file_delete, on the principle that a state authoring a class of trace node must be able to retire one.
