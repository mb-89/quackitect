---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: opt-the-path-resolver-takes-the-second-job-of-judging-the-reach
type: "[[option]]"
statement: The component that already resolves every path takes the second job of judging who was allowed to reach it, so no new door is added to the tree.
cluster: cluster-the-door-regime
found_by: transform
source: SIT Task Unification, applied to the incumbent — give an existing component a second job
---

## Mechanism

`deliverable/engine/paths.ts` already sits on the path of every resolution and
already has 20 importers. It is the one seam in this tree that is genuinely
well adhered to.

It resolves a path today. It would resolve a path AND answer whether the caller
was entitled to it.

IT LOOKED LIKE THE CHEAPEST STRUCTURAL OPTION ON THE CHART, and a probe on
2026-08-26 falsified that. The figure is on the record here rather than left
in the evidence form, because the option cannot be scored without it.

THE RESOLVER SITS ON 15 OF 81. Eighty-one engine modules import node:fs
directly. Twenty import the resolver. Fifteen appear in both lists, so 66
modules reach the filesystem without the resolver having anything to say.

AND THE FIFTEEN DO NOT PASS THROUGH IT EITHER. Importing both means the module
asks the resolver for an ADDRESS and then reaches for the bytes itself. The
resolver hands out addresses; it has never mediated a reach.

SO THE ADOPTION THIS OPTION WAS GOING TO INHERIT IS 18 PER CENT OF THE REACH,
and the record's own context drawing called it the one well-adhered seam
without anybody having counted.

WHAT IT ALSO FIXES ON THE WAY PAST. The containment predicate is written five
times outside that module, and the two copies guarding recursive deletes
disagree about whether an absolute path is checked. Giving the resolver the
judging job is the same edit that deletes those five copies.

WHAT IT COSTS. A module that does two things, which is what the small-interface
heuristic warns about. Resolution and authorisation fail differently and a
caller wanting one now depends on the other.

AND IT ONLY REACHES ONE CONVERSATION. Paths are the byte door. The version
door, the outward door and the harness door pass nothing through this module,
so this option answers a quarter of the problem and looks like it answers all
of it.

THAT NARROWNESS IS THE THING TO WATCH. It is cheap because it is partial, and
the chart must not score it as if it were whole.

WHAT SURVIVES THE PROBE. Deleting the five duplicated containment predicates is
still right and still cheap, and it needs no door at all. What does not survive
is the claim that giving the resolver a second job reaches most of the disk.
