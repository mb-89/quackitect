---
form: chunk-declared-write-target
by: agent
signed_off: 2026-08-18T18:35:53.484Z
authors: agent
files: null
---

# Evidence form / chunk-declared-write-target

## current_situation

THE SECOND WRITE TARGET EXISTS AND BOTH RED CASES ARE GREEN. 1443 of 1444 pass; the single failure is the corpus-wide churn alarm, which is not this chunk's and is noted with its measurement.

### What the chunk had to solve that its statement did not say

THE SOURCE GUARD HAD NO FACT TO STAND ON. The design says the file naming a tree carries an identity and never a path, so the guard cannot compare addresses. Nothing had decided what an identity IS.

IT WAS ALREADY THERE. `brand.json` carries `id`, and this tree's is `quackitect`. So a tree's identity is its brand id, and nothing was invented.

AND A SECOND PLACE HAD TO CHANGE, found by reading rather than by a failing test. `declaredRoots` copied an entry only where its value was a string, so an object declaration was dropped before any resolver saw it. A writable root would have read as no declaration at all.

### The test that demanded a refusal from nothing

MY OWN SOURCE CASE WAS UNSATISFIABLE AS WRITTEN. It declared a target and expected a refusal naming it as the source, in a fixture where nothing recorded what the source was. No correct implementation could have passed it.

IT NOW BUILDS THE SITUATION. The fixture root records that it came from `the-engine`; the target tree says it IS `the-engine`. Neither fact names the other, and the guard has to find the collision.

A FIFTH CASE WAS ADDED for the half that was missing: a writable target carrying a DIFFERENT identity resolves. Without it, a guard that refused every writable target would have passed the source case and read as correct.

## built

### engine/paths.ts

- `DeclaredRoot` is a type now — a path and a writable flag. A bare string still declares a read-only root, so nothing anybody already wrote changes meaning.
- `declaredRoots` keeps object declarations and defaults `writable` to false. Opt-in, never inferred.
- `resolveInRoot` routes a WRITABLE root-ref into `resolveDeclaredRoot` rather than containing a second copy of the containment rule. One rule, proved once.
- `identityIn` reads an `id` out of a brand or upstream file, and REFUSES on an unparseable one rather than answering absent.
- `refuseIfTargetIsSource` compares the identity this tree records as its upstream against the identity the target states. Equal means refused.

### engine/errors.ts and guidance/refusals.md

SE-C-143 IS NEW, and it covers both halves of one rule: the target is the source, or the guard cannot prove it is not. Its rule stands in refusals.md the way every clause's does.

### tests/roots.test.ts

FIVE CASES IN THE WRITE-SIDE BLOCK NOW, all green:

- a write lane refuses an `@` address
- a path cannot climb out of its declared base
- a writable root resolves inside its base, and still refuses a climb out
- a writable root that is the source is refused, saying why
- a writable root that is a different tree resolves

### tests/files.test.ts

THE DIRECT-READ CEILING GOES 105 TO 106, with the reason beside the other five. The identity read is one-shot, and half of it happens in a FOREIGN tree that is not this vault at all, so no note door could serve it in principle.

### dsp-the-producing-acts

RECORDS WHERE BOTH FILES SIT, because this chunk is what settled it.

## follow_up

IMMEDIATELY: the end-to-end test the owner asked for, then chunk-travelling-bound.

### The end-to-end test, and what was found looking for its ancestor

V1 DOES NOT HAVE ONE. Checked at ref main: five Go tests in two files, none of which produces anything. The answer is recorded in full in the log.

THE ASK STANDS ANYWAY and it is the next piece of work. An executable spec beside the existing demonstration: produce a vehicle, produce a project from it, assert the project comes up able to work.

IT IS AUTHORED BEFORE THE PRODUCERS EXIST, which is what test-first means and which makes it red on arrival.

### The chunks still standing

- chunk-travelling-bound, which nothing waits on but chunk-guard-tests.
- chunk-producing-acts, which the end-to-end test will be pointing at.
- chunk-the-two-buttons, then RUNME losing its export.

### Parked with its ready-when

THE CHURN ALARM IS THE ONLY RED LEFT: 867 of 1688 notes would be reformatted against a 50 percent limit. It spans i10 through i16, the method cards and guidance, so it is neither this chunk's nor this iteration's.

IT BLOCKS VERIFICATION, which fires the full battery. Ready when the owner says whether an 867-file reprint may land inside this iteration. The fix is one call and the test directly above it proves the reprint preserves every key and every body.

## anything_else

### On failing closed, which is a choice worth naming

AN UNREADABLE IDENTITY FILE REFUSES rather than answering "no identity".

THE FILE THIS SITS IN ALREADY LEARNED IT ONCE. `declaredRoots` swallowed a parse error in July and reported the owner's declared root as undeclared, then handed back a remedy telling them to declare what was already declared.

IT IS WORSE FOR A GUARD THAN FOR A LOOKUP. A guard that goes quiet looks exactly like a guard that passed, and the thing it guards is the isolation law.

### What this chunk deliberately did not do

IT DID NOT WRITE AN UPSTREAM FILE INTO THIS TREE. The engine was produced from nothing and must never carry one. The producing act writes it into what it produces, and nowhere else.

IT DID NOT TOUCH THE OVERLAY QUESTION. raid-risk-the-overlay-location-is-unchosen is still open and still crippling.
