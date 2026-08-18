---
minted_in: i27
id: raid-risk-a-write-lands-in-the-wrong-tree-silently
type: "[[raid]]"
kind: issue
statement: A wrong resolution reports success, so a read or a write reaches the wrong store and nothing says so.
owner: the driving agent
trigger: at the first write of each path KIND after any resolution rule changes - method, record content, session state and repository-root files each resolve by a different rule
status: open
impact: The work appears to land. It is found at a merge, or never. Two branches then hold two answers to one question, which is the failure this iteration exists to end, reappearing from the other side.
breaks_how_badly: fatal
how_likely: expected
source_refs:
  - note-81c6cc77171e
  - se_run diagnostic 2026-08-13 - a root-level check read the worktree and answered wrongly
---

A REFUSAL IS LOUD AND A MISROUTE IS SILENT. Every guard in this system
refuses and names its remedy. This change has no refusal: the path
resolves, the bytes land, the tool answers ok.

IT HAS ALREADY HAPPENED TWICE TODAY, in miniature, and both were caught
by luck rather than by a check.

A diagnostic asking whether the stop hook was wired read the BOUND
worktree's copy, found no session log, and reported the hook silently
allowing every stop. The hook was fine. The reading was taken in the
wrong tree, and it looked exactly like a real finding.

A write of the host's settings file was expected to land in the worktree
and landed at the repo root instead, because the path sits outside the
folder the record owns. That was the wanted outcome, reached by a rule
nobody had checked.

## Mitigation

FOUR PATH KINDS, FOUR RULES, AND EACH ONE TESTED SEPARATELY. Method
fans out to every tree. A record's own content belongs to one tree.
Session state lives at the root and belongs to the machine. Repo-root
files belong to the root and to no record. The bug lives at the seams
between them, so a test per kind is the mitigation rather than a test
per tool.

AND THE PROOF IS A READ-BACK, never the write's own verdict. A write
that reports success has proved that SOMETHING was written. Only a read
from the tree the caller meant proves it landed there.

## It has happened, twice, on 2026-08-14

Moved from risk to issue at fold-back. The entry was written as something that
might happen. [[exp-one-seam]] recorded it happening, so it is present tense.

THE ID KEEPS ITS raid-risk PREFIX because ids are stable
([[raid-dec-stable-ids]]). The kind is the truth; the id is an address.

### The two instances

- se_lint answered ENOENT against the record's worktree while se_file_read
  served the same path from the machine root.
- A child shell reported its working directory as the worktree, and
  `.se/HANDOVER.md` reads at 148 lines through the file lane while answering
  PathNotFound in that shell.

One path string, two trees, and nothing on either answer saying which.

### What the probe also settled

The platform refuses nothing. `..\..\..\..\Users` resolved cleanly to a
folder outside the project. So the refuse act on [[el-resolution-seam]] is
required rather than a nicety.

The bypass surface is counted: 40 resolver call sites against 88 paths built
with a direct join. The dispatch layer is nearly clean at 7 against 1, and the
leaks are modules that read the filesystem for themselves.

## Re-measured 2026-08-18 at evaluate-architecture

THE FIGURE ON THIS NODE DISAGREES WITH THE ONE ON
[[raid-iss-the-path-jail-has-one-write-target]]. This entry says 40 resolver
call sites against 88 direct joins. That entry says 44 against 116 across 49
files. Neither records the pattern or the folder scope behind its number.

A FRESH COUNT SETTLES THE DIRECTION WITHOUT SETTLING THE HISTORY. Scope
`project/deliverable/engine`, whole tree including `bin/`.

- 28 resolver call sites, from 31 hits for
  `\b(resolveInRoot|resolveForRead|resolveDeclaredRoot)\(` across 10 files, less
  the three definitions in `engine/paths.ts`.
- 277 bare joins, from `(^|[^\w.])join\(` across 69 files. The pattern excludes
  `path.join(` and array `.join(`.

SO THE BYPASS SURFACE IS ABOUT TEN TIMES THE GUARDED ONE, not twice it. The
mitigation this node describes is narrower against the real surface than the
recorded figure suggested.

WHAT IS STILL UNKNOWN. How many of the 277 are writes rather than reads, and
how many address a tree at all rather than building a constant. The count is an
UPPER BOUND on the bypass surface, not a defect count, and reading it as a
defect count would overstate the risk in the other direction.

THE TWO OLD FIGURES ARE LEFT WHERE THEY STAND. Overwriting them would destroy
the evidence that the register carried two answers, which is itself the finding.
