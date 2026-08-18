---
form: chunk-guard-tests
by: agent
signed_off: 2026-08-18T18:26:31.545Z
authors: agent
files: null
---

# Evidence form / chunk-guard-tests

## current_situation

BOTH GUARDS ARE REAL. That is what this chunk asked and the battery answered it.

### What was asked

TWO BEHAVIOURS STAND IN engine/paths.ts AND NOTHING HAD EVER EXERCISED THEM. A write lane refusing an `@` address, and a path refusing to climb out of a declared base. The whole second write target leans on both.

A RED WOULD HAVE BEEN THE LOUDER RESULT. It would mean the containment the design rests on was never there.

### What the run said

MEASURED 2026-08-18, whole battery, 1443 cases: 1440 pass, 3 fail. Neither characterisation case is among the three.

- `resolveInRoot` refuses `@books/note.md` with SE-C-102, saying a declared root is READ-ONLY.
- `resolveDeclaredRoot` refuses `@books/../escaped.md`, comparing the resolved path against the declared base.

### What the same run exposed

THREE TEST-SPECS CARRIED minted_in TWICE, so their frontmatter did not parse. preflight, the sweep and two frontmatter cases all failed on it. Fixed in all three; preflight and the sweep are green and the sweep reads 1465 nodes.

AND THE SOURCE-GUARD CASE WAS PASSING FOR THE WRONG REASON, for the second time in one day. It matched `JSON.stringify(e)` against `/\bsource\b/`, and a Rejection carries a FIELD named `source` naming the module that threw. The check was reading a key name. It now joins only the prose a reader would see, and it fails honestly.

## built

### tests/roots.test.ts

THE TWO CHARACTERISATION CASES stand as written and both pass unchanged.

TWO EDITS LANDED HERE.

- The writable-root case gained the containment half the spec's third step demands: a writable base is still a base, and `@site/../escaped.md` must refuse.
- The source-guard case stopped matching the serialised error. It reads `expected`, the remedy note and the message, and matches `/came from|\bthe source\b|\bits origin\b/i`. The comment in the file records why, so the next author does not rebuild the trap.

### Three test-spec nodes

THE DUPLICATE minted_in IS GONE from all three:

- tsp-a-produced-tree-is-bounded-and-named
- tsp-a-vehicle-is-made-and-then-drives-something-else
- tsp-the-engine-keeps-no-record-of-what-it-produced

NOTHING ELSE WAS TOUCHED. No engine file changed in this chunk, which is the point of a characterisation chunk.

## follow_up

IMMEDIATELY: chunk-travelling-bound and chunk-declared-write-target. Both depend only on this chunk and on nothing else, so either can go first.

### What the two red cases now wait for

BOTH GO GREEN IN chunk-declared-write-target AND NOWHERE ELSE.

- A writable declared root must resolve on a write lane, land inside its base, and still refuse a climb out of it.
- The refusal for a target that is the tree this system came from must NAME that, not merely refuse.

THE SECOND ONE IS A DESIGN INSTRUCTION, not just a test. The refusal text has to say why, because a generic READ-ONLY refusal is what let the false green stand.

### One thing that will block later, parked with its ready-when

THE FORMATTER-CHURN ALARM HAS CROSSED ITS THRESHOLD: 866 of 1687 notes would be reformatted, against a limit of 50 percent. It is corpus-wide, spanning i10 through i16 and the method cards, and it is not this iteration's authorship.

IT BLOCKS VERIFICATION, because that state fires the full battery and a red battery refuses. Ready when the owner says whether an 866-file reprint may land inside this iteration. The whole measurement is in the note.

### Also parked

- WHERE A VEHICLE'S OVERLAY CONTENT LIVES, still open and graded crippling. The producing acts must not settle it by accident.
- THE CONFIRM RUN on the retro's window fix, owed at verification.

## anything_else

### On declaring a writable root, found while reading rather than by testing

`declaredRoots` KEEPS ONLY STRING VALUES. engine/paths.ts line 51 walks the parsed map and copies an entry only where `typeof v === "string"`.

SO AN OBJECT DECLARATION IS DROPPED SILENTLY, before any resolver sees it. A root written as `{"site": {"path": "...", "writable": true}}` reads today as no declaration at all.

THAT IS A SECOND PLACE chunk-declared-write-target HAS TO CHANGE, and it is not in that chunk's statement. Recorded here so it is not discovered at the failing assertion.

THE TESTS DO NOT REACH IT YET. Both red cases call `resolveInRoot`, which refuses every root-ref at its first line, before the declaration is ever read.
