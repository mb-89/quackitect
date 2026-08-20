---
form: seam-sweep
by: agent
signed_off: 2026-08-14T15:52:30.821Z
authors: agent
files: null
---

# Evidence form / seam-sweep

## current_situation

THE FIRST VERB IS ON THE SEAM, and the root cause was sharper than the plan expected.

se_lint was not bypassing the resolver. It called the ROOT-PICKER WITH NO PATH. session.laneRoot(rel) already chose the right tree per path kind, and the handler asked for the default instead, so `.se/...` resolved into whatever worktree was bound while the file lane served it from the machine root. Both answers were correct against their own root, and neither said which.

THREE THINGS CLOSE IT, each sufficient on its own.

- rootOf(p) per path, which is the existing mechanism used properly.
- machineRootOf(root), so a caller that knows only its worktree still sends session state and shared method to the machine. This is what makes the sweep adoptable one verb at a time rather than all at once.
- The answer NAMES ITS STORE, so the next disagreement is visible at the call.

THE COUNT TODAY: 40 resolver call sites against 88 paths built with a direct join. One verb moved.

## built

project/deliverable/engine/paths.ts — machineRootOf(), derived from any worktree path.

project/deliverable/engine/resolve.ts — resolve() accepts a single root and derives the machine root from it, so one-root callers resolve correctly.

project/deliverable/engine/tools.ts — se_lint's two branches now call resolveSeam(rootOf(p), p, ...) rather than resolveInRoot(rootOf(), p, ...), and the path branch returns `store` beside `path`. setAnswerSpill is wired at buildServer.

project/deliverable/tests/resolution.test.ts — four cases on machineRootOf and the one-root caller, including the 2026-08-14 defect stated as a test: two lanes asking for one path get one answer.

VERDICT: 24 of 24 in resolution, 71 of 71 across the standing engine.

## follow_up

SE-C-134 CANNOT BE RETIRED ON THIS SWEEP ALONE, and that correction is this chunk's most important output. The clause guards five path-carrying tools and says in its own words that it does not and cannot watch se_run's shell. A seam judges paths; a shell is handed none.

Filed as raid-iss-the-shell-writes-method-with-no-path-to-judge, graded fatal and expected. Found by an adversarial audit and confirmed at the primary by hand.

EIGHTY-SEVEN JOINS REMAIN. The dispatch layer is nearly clean already, so the work is in modules that read the filesystem for themselves. Each is the same shape as se_lint: ask the root-picker with the path, and let the seam name the store.

WHAT THE NEXT VERB SHOULD BE. Whichever one a record's walk touches most, because that is where a wrong tree does the most damage before anybody notices.

## anything_else

WHY THE ANSWER CARRIES `store` EVEN THOUGH IT IS ALWAYS THE SAME TODAY.

Because "it is always the same" is exactly what was believed on 2026-08-13, and it was wrong the next day. The store is the one field that makes a divergence visible in the first second rather than the fiftieth call.

There is one root today because satellites are not built. Adding the field after the callers exist means auditing every one of them; adding it now costs none.

WHAT THIS CHUNK DID NOT DO. It moved one verb. The sweep is named as a chunk rather than a task because the remaining eighty-seven are the same edit repeated, and repeating it is the work rather than the design.
