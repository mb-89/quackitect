---
form: write-requirements
by: agent
signed_off: 2026-08-18T11:06:40.724Z
reopened: 2026-08-18T11:06:00.029Z — The affordance added four use-case extensions and a rewritten step, two of which had no row. req-the-system-runs-in-a-tree-that-is-not-its-own and req-an-act-writes-only-the-tree-it-produced are minted for them.
authors: agent
files: null
---

# Evidence form / write-requirements

## current_situation

The walk stands at write-requirements, reopened because the affordance added two use-case extensions and a rewritten step with no rows behind them.

ELEVEN ROWS NOW STAND. Nine from this morning, and two minted here.

- req-the-system-runs-in-a-tree-that-is-not-its-own — the load-bearing third of the owner's ask, and the only thing in this iteration with no mechanism today.
- req-an-act-writes-only-the-tree-it-produced — the bound on the two acts that create a whole tree at a path somebody named.

NEITHER IS A BUTTON, and that is the point. The surface is where the capabilities become reachable; these two rows are what makes reaching them safe and possible.

AND ONE OF THEM DESCRIBES RATHER THAN INVENTS. v1's own passing test carries every facet of the first row, including a hazard somebody hit in the field. note-b966f8fd311e holds it.

## register

- req-the-system-runs-in-a-tree-that-is-not-its-own
- req-an-act-writes-only-the-tree-it-produced
- req-nothing-a-copy-does-reaches-its-source
- req-the-source-keeps-no-record-of-a-copy
- req-where-each-artifact-lands-when-driving
- req-one-command-produces-a-complete-copy
- req-the-product-name-is-one-fact
- req-overlay-resolution
- req-overlay-drift-reported
- req-overlay-survives-update
- req-setup-serves-shipped-method

## set_criteria

- complete: SWEPT AGAIN against both use cases after the affordance added four extensions and rewrote one step. THE TWO NEW ROWS CLOSE THE TWO NEW HOLES: uc-drive-a-foreign-product step 2 and extension 2y now have req-the-system-runs-in-a-tree-that-is-not-its-own, and uc-vendor-and-overlay extension 1y has req-an-act-writes-only-the-tree-it-produced. THE OTHER TWO NEW EXTENSIONS — 1z on each use case, the act offered where the builder already is — are covered by req-one-command-produces-a-complete-copy's fourth facet, ONE ACT with no manual assembly afterwards, which binds whatever the surface turns out to be. WHAT REMAINS UNCOVERED IS UNCHANGED AND NAMED: uc-vendor-and-overlay step 7, deciding a collision, which cannot get a row before M4 picks a mechanism because a named mechanism is design frozen as obligation; and extension 6a, the builder who never updates, which describes the system doing nothing.
- consistent: NO TWO ROWS CONFLICT, and the pair most at risk of it was checked directly. req-an-act-writes-only-the-tree-it-produced permits a write into a tree that did not exist a moment ago, while req-nothing-a-copy-does-reaches-its-source forbids writes outside the copy's own tree. THEY COMPOSE RATHER THAN COLLIDE because they govern different moments: one is the act that CREATES, the other is the copy that RUNS. draw-context states the same seam as two intended uses rather than one. AND ONE TERM IS NOW USED IN TWO PLACES AND MEANS ONE THING: a TREE is a directory somebody named or the system runs from, never a folder inside one.
- affordable: ELEVEN ROWS ACROSS THREE VERIFY METHODS — seven by test, three by demonstration, one by inspection. THE DEMONSTRATION COUNT ROSE BY ONE and that is the affordability question of this state. Three rows now need a machine or a folder this tree is not: producing a copy, coming up with no overlay, and coming up in a tree that is not the system's own. WHAT MAKES IT AFFORDABLE ANYWAY: v1's i18_red3.go does all three IN ONE hermetic test, using a temporary directory and a subprocessed binary rather than a second machine. That is a port rather than an invention, and it is why this set is buildable against a deadline.
- bounded: EVERY ROW TRACES TO A SCOPE ITEM, and the two new ones to item three. NOTHING GOLD-PLATED: the affordance could have produced a row per button and produced none, because a button is a surface and a requirement is a demand on the system. WHAT WAS DELIBERATELY NOT WRITTEN: a row saying the act opens a window. That the act ends with the builder inside the result is a use-case behaviour; a requirement forbidding the act from disturbing the window it came from is the part that binds, and that is the row that exists.
- comprehensible: THE SET NOW READS AS SEVEN SENTENCES a non-specialist can say back — you can get a complete copy of the whole thing; the act that makes it writes there and nowhere else; the copy cannot touch what it came from; what you write over it wins; you can point it at your own product and the work lands there; it comes up even in a tree that carries none of its method; and it works before you have written anything. THE TWO NEW ONES ARE THE MOST CONCRETE IN THE SET, because both describe something somebody can watch happen.
- no_tbd: RUN over the two new rows and re-run over the nine standing ones, for TBD, TBC, TBR and `???`. ZERO FOUND. And the stronger property holds: both new rows carry a COUNT with a target — paths written outside the produced tree, target zero; and a tree with no recorded pointer is not a driven project, which is a yes-or-no rather than a judgment.
- behaviour_modelled: THE LOOK RAN AGAIN AND ONE CANDIDATE APPEARED THAT WAS NOT THERE BEFORE. req-the-system-runs-in-a-tree-that-is-not-its-own is a SEQUENCE in the method card's own terms: a copy creates a tree, records a pointer, and later something starts in that tree and follows the pointer back. Two parties exchanging something in a fixed order is exactly the first shape the card names. IT IS NOT DRAWN, AND THE REASON IS BETTER THAN LAST TIME: v1 already ran the sequence, and its test IS the model with the transitions executable rather than pictured. Drawing a diagram of a sequence that exists as a passing test would be a second notation that can drift from the first. WHERE A MODEL WOULD STILL BE NOISE: the act-writes-only-its-own-tree row is one condition and one response over five facets; the isolation row the same; the no-record row is an absence; the one-fact name is a static attribute. AND THE COLLISION LIFECYCLE IS STILL THE ONE THAT WOULD EARN A MODEL and still has no row to hang it on, which is unchanged and goes to record-adrs with the mechanism.

## follow_up

IMMEDIATELY: derive-functions, which owes a home for both new rows.

- req-the-system-runs-in-a-tree-that-is-not-its-own belongs with `resolve-a-path`, whose whole statement is deciding which tree a path names. It already carries req-where-each-artifact-lands-when-driving and flow-driven-tree.
- req-an-act-writes-only-the-tree-it-produced belongs with `bring-forth-a-copy`, which is the function that makes a tree. AND IT MAY WANT A SECOND HOME, because starting a project also produces one and that is not the same act.

THAT LAST POINT IS A REAL QUESTION FOR THAT STATE rather than a note: whether producing a copy of the system and producing a project to drive are one function or two. They share a bound and differ in what they produce.

THEN identify-assumptions and probe-assumptions re-sign. Neither is affected by the affordance — the four assumptions are about vendoring, platforms, people and the overlay's home, and none moved.

AND derive-criteria NEEDS REDOING. Both new rows are `must`, so neither joins the criterion pool, which means the pool has NOT grown and the standing order still holds. That is worth checking rather than assuming when that state reopens.

WHAT M4 INHERITS FROM HERE. The MUST rows gate every candidate and now there are five: producing a copy, nothing reaching the source, where each artifact lands, coming up in a foreign tree, and the act writing only its own tree. A candidate that cannot answer all five fails rather than scores badly.

## anything_else

THE FAN-OUT LOOK, RUN AGAIN because the pool grew.

uc-vendor-and-overlay IS NOW REFINED BY EIGHT ROWS and uc-drive-a-foreign-product by two. Both are past or near the five-row smell threshold, so the look ran and it produced ONE fold and ONE deliberate split.

### The split that was tempting and stayed split

req-an-act-writes-only-the-tree-it-produced AND req-nothing-a-copy-does-reaches-its-source. Both are about writes landing where they should, both verify by test, and an earlier draft had them as one row with a sixth facet.

THEY STAYED SPLIT BECAUSE THEY GOVERN DIFFERENT MOMENTS. One binds the act that CREATES a tree, at the single moment the system legitimately writes somewhere new. The other binds every write a RUNNING copy makes, forever. A design can satisfy either and fail the other, which is the test.

AND FOLDING THEM WOULD HAVE HIDDEN THE PARTIAL-TREE FACET. Refusing before creating anything is meaningless for a running copy and load-bearing for a creating act, so it would have read as noise inside the bigger row.

### The fold that did happen

THE TWO SURFACE EXTENSIONS — 1z on each use case — produced no row of their own. Their content is that the act is reachable where the builder already is and asks what the command asks. That is req-one-command-produces-a-complete-copy's fourth facet, ONE ACT with no manual assembly afterwards, and writing a second row would have said the surface is a different demand from the act.

A BUTTON IS A SURFACE AND A REQUIREMENT IS A DEMAND ON THE SYSTEM. The affordance added scope and two rows, and neither row mentions a button.

### What the look would have produced without the heuristic

FOUR ROWS INSTEAD OF TWO: one per new extension. Two of them would have said what an existing row already says, and the trace graph under uc-vendor-and-overlay would have gone from eight rows to ten in a pass that added one capability.
