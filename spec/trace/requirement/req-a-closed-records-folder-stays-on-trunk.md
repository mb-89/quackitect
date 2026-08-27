---
minted_in: i34-one-tree-iterations-and-archives-live-on
id: req-a-closed-records-folder-stays-on-trunk
type: "[[requirement]]"
statement: A closed record's content shall stay readable to a person and to the system, wherever that record is held.
kind: functional
verify_method: test
breaks_if_removed: Nothing then guarantees a closed record can be read at all. A design that takes the folder off the working tree could make the archive unreachable, and nobody would find out until somebody went looking.
breaks_how_badly: crippling
refines:
  - uc-close-a-record
  - uc-browse-the-archive
source_refs:
  - i34-one-tree-iterations-and-archives-live-on
  - note-a6d2f0781686
  - raid-iss-the-archive-ruling-reverses-a-blessed-must-requirement
  - "owner ruling 2026-08-26: an archived iteration is deleted from disc and read through version control"
priority: must
---

## Detail

THE DEMAND IS READABILITY, NEVER A PLACE. A closed record has to be openable by
a person and searchable by the system. Where it physically sits is a design
choice, and this row does not make it.

## Rewritten 2026-08-26 — it used to name the place

WHAT IT SAID BEFORE: "When a record closes, the engine shall leave that record's
folder on trunk and shall not remove it from the working tree."

WHY IT SAID THAT. i34 removed the retrieval path that read a closed record out
of version control, and pinning the folder to the working tree was how it made
sure nothing rebuilt one. Its own words: "Closed records stay searchable,
because they stay on disk. That was the reason for keeping the archive there."

THE REASON WAS MEASURED AND DID NOT HOLD. At 20,000 files, `git grep` over HEAD
objects took 114 ms against 161 ms over the working tree. Reading out of version
control is FASTER at that size. The lane's own `se_file_search`, `se_file_read`
and `se_file_glob` already take a `ref` and dispatch to git, so the capability
exists and needs no building.

THE COST i34 ACCEPTED HAS ARRIVED. It wrote the cost on this node: closed
records stay in the working tree forever, so the tree grows with every
iteration. It measured the spec tree at 2,138,305 bytes across 796 files.
Measured 2026-08-26: 15,395,926 bytes across 3,233 files. Seven times the bytes,
four times the files, in ten days of iterations.

WHY THE REPLACEMENT DOES NOT NAME A MECHANISM EITHER. Reversing the old rule
would freeze the design milestone's choice as an obligation, which is the
failure this corpus names repeatedly. The outcome i34 cared about is stated;
which of the candidates delivers it is M5's to decide.

WHAT THE STORAGE CHOICE NOW RESTS ON, rather than on this row:

- `opt-a-closed-iteration-leaves-trunk-as-one-file-read-back-from-version-control`
- `cand-files-while-open-one-file-in-version-control-once-closed`
- `raid-dec-the-volume-is-bounded-by-one-open-iteration`

I34'S OWN GOAL IS UNTOUCHED BY THIS. Its goal line reads "One tree: iterations
and archives live on disk on trunk, worktrees and record branches are gone." The
worktree system is what it existed to remove, and it stays removed. Its archive
ruling was permissive in the same record: "We CAN keep the archive on disk too."

## What is verified

THAT A CLOSED RECORD CAN BE READ. The test opens one and reads it, without
knowing or caring whether it sits in the working tree or in version control.

THAT SEARCH REACHES IT. A search for a string inside a closed record finds it.
