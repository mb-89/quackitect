---
form: build-steps
by: agent
signed_off: 2026-08-28T11:09:54.634Z
authors: agent
files:
---

# Evidence form / build-steps

## current_situation

The module is built, the checks are green, and two of the five lints are armed with boot still green.

The build found two of its own classifiers wrong before they were armed. Measuring them against the real corpus rather than their fixtures is what caught it.

Three classes are not yet empty, so their lints are not yet wired. That order is the first risk's mitigation, not a shortfall being hidden.

## follow_up

Repair the three remaining classes at fix-findings, then arm their lints in the same order: empty the class, then wire it.

The counts to work against are 35 stale citations, 131 dangling references and 11 unreferenced work tokens, all measured today over 1,529 trace nodes.

The reference count is the one that most needs opening before it is trusted. The plan predicted about 46 path-shaped ones, and 131 is the figure for every reference key including the three this iteration added.

## anything_else

WHAT WAS BUILT. `deliverable/engine/corpus-sweeps.ts` with four classifiers, each pure over text, plus three reference keys added to the swept list in guard.ts and the list exported.

WHAT IS ARMED, with boot green afterwards. The duplicate-heading check and the dead-verb check, both wired into the corpus sweep. The sweep reads 2,581 nodes in 977 milliseconds and exits 0.

WHAT WAS REPAIRED. Twenty-four requirement nodes carrying a doubled Detail heading, in one atomic call. Two more corpus nodes where a heading repeated with content between the copies. Two nodes teaching the retired git verbs, rewritten to the one-tree landing.

TWO CLASSIFIERS WERE WRONG AND THE MEASUREMENT CAUGHT THEM. The citation check resolved against a fixed set of prefixes and called 169 live files gone; it now matches any file in the tree whose path ends with the citation, and reports 35. The verb check read tools.ts as the surface and called 292 live verbs dead; only 16 verbs are declared there in that shape, so it now reads every verb name the engine mentions, and reports 7.

BOTH FIXES CAME WITH THE CASE THAT WOULD HAVE CAUGHT THEM. A citation written at a shallower depth, and a verb declared outside tools.ts. The suite went from 9 cases to 11.

ONE SCOPE DECISION, and the crippling risk is what forced it. Armed over every file under spec, the heading check turned the sweep red on one closed record's evidence and one prep document. The requirement says NODE, so the check now runs on frontmatter that declares a type. A form instance is not a node.

A COUNT IN AN EARLIER FORM IS WRONG BY ONE. author-tests and observe-red say ten cases; the file had nine at that moment. It has eleven now.
