---
minted_in: i34-one-tree-iterations-and-archives-live-on
id: req-every-record-path-resolves-in-one-tree
type: "[[requirement]]"
statement: The lane shall resolve every record path against exactly one working tree, and no call shall select between trees.
kind: functional
verify_method: inspection
breaks_if_removed: The same relative path names different files depending on what is bound, so a read and a write disagree about which copy is real.
breaks_how_badly: crippling
refines:
  - uc-take-a-step
  - uc-open-an-iteration
source_refs:
  - raid-dec-one-tree-beats-a-record-travelling-between-machines
  - i34-one-tree-iterations-and-archives-live-on
priority: must
---

## Detail

THE CHECK IS THE ABSENCE OF A CHOOSER, which is why the method is inspection
rather than test. A test can show one path resolving correctly; only reading
the code shows that nothing anywhere is picking a tree.

WHAT MUST NOT EXIST when this stands:

- `Roots.bound`, and the `roots.bound ?? roots.machine` branch in `storeFor`.
- `machineRootOf`, whose whole job is stripping `.worktrees/<id>` off a path.
- `fansOut` and `methodFilesIn`, which exist because several trees hold copies
  of one method file.
- `setMethodMirror` and `fanOutMethod`.

WHAT STAYS: `recordOwnerOf` and `pathKind`. They answer WHICH RECORD owns a
path and keep `.se` machine-local. Neither picks a tree.

THE MEASUREMENT BEHIND IT, taken 2026-08-16: a filesystem check run while
bound to i4 reported `.worktrees/i34-...` absent, because it resolved inside
i4's tree. The answer named no root, so the wrong answer was indistinguishable
from a right one.
