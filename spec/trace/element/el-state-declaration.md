---
unreachable_refs:
  - cand-nothing-can-be-forgotten
minted_in: i9
id: el-state-declaration
type: "[[element]]"
statement: Holds the single answer to what the machine-state folder is, and generates the four consumers that would otherwise each keep their own copy — the host's activation pattern, the lane's read exclusion, the producing acts' exclusion and the editor's hide rule.
kind: new
realization: make
group: the-walk
implements:
  - fn-run-a-governed-walk.resolve-a-path
satisfies:
  - req-the-machine-state-sits-in-the-folder-that-is-open
  - req-only-a-file-with-its-own-door-is-withheld
source_refs:
  - cand-nothing-can-be-forgotten
  - raid-dec-the-machine-state-sits-inside-the-opened-folder-and-one-declaration-names-it
---

One declaration, four generated consumers, and a check that each is current.
Drift between copies becomes impossible rather than unlikely, which matters
because the drift is silent in the direction that ships private state to a
stranger.

It carries two facts and not one. WHAT the folder is called, and WHICH files
inside it have a structured door. The second is what lets the same declaration
hide three files from the lane while showing the rest to a person.

Boundary: the interfaces the element matrix mints for its flows.

Realization: the declaration file, one generator per consumer, and a staleness
check that fails where a person will see it.

## What the host spike added, 2026-08-19

THE STALENESS CHECK IS NOW LOAD-BEARING FOR THE ROOT, not only for the
exclusion. That is new, and it arrived from a spike rather than from design.

WHY. The editor cannot state which folder it handed over, so the system decides
its own root by running the same content test the host ran and refusing on any
carrier count but one. Both tests are generated from this declaration.

SO A DRIFT BETWEEN TWO GENERATED CONSUMERS NOW BREAKS THE ROOT CHECK, silently.
Before the spike, a drift meant a copy carried a file it should not, which is
loud on install. Now it can also mean the system binds to the wrong folder, or
refuses to bind at all, and neither says why.

WHAT THAT CHANGES FOR THE BUILD. The check that each generated consumer matches
this declaration was already owed. It stops being tidy and becomes the guard
under a FATAL requirement.

THE TWO TESTS MUST BE THE SAME TEST, not merely agree today. The host's check is
a file-exists against a joined path. The system's must be too, and not a search,
because a search applies the person's own exclusion settings and can disagree.
