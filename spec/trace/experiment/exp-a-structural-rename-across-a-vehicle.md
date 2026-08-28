---
unreachable_citations:
  - fn-bring-forth-a-vehicle.md
  - node.md
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: exp-a-structural-rename-across-a-vehicle
type: "[[experiment]]"
statement: Can a plain git merge carry a vehicle's restructuring across an upstream rename, measured as the merge exit code and whether both changes survive in one file?
probes:
  - raid-tripwire-i16-a-structural-migration-cannot-be-written
timebox: 15 lane calls, of which 9 were used
form: script
faked: "The NODES were synthetic rather than copied from the corpus, so file length was chosen rather than sampled. Everything else was real: two git repositories, real commits, a real three-way merge."
fallback: If a structural migration cannot be expressed as a program, the winner falls back to cand-everything-declared, which is one cell behind and errors out rather than producing a wrong result.
verdict: holds
measured: "2026-08-18. A 20-line node with a 2-line upstream edit and a vehicle-added section: MERGE_EXIT=0, one file, both changes present. A 3-line node with a 2-line upstream edit: MERGE_EXIT=1, CONFLICT (modify/delete), both files left in the tree with the vehicle's copy still on the old id."
folds_to: "Settles raid-tripwire-i16-a-structural-migration-cannot-be-written: it does NOT fire. A structural migration can be expressed as a program, so the winner's falsifier is not met and no score moves. What the evidence ADDS is a bound nobody had: the program route's advantage over a plain git merge exists only where a node is short enough that an upstream edit drops similarity below git's rename threshold, and the corpus sits on the safe side of that line. The bound is recorded on the tripwire rather than applied to the scores, because re-weighting an axis with the totals already visible is the poisoning cut-criteria's ordering exists to prevent."
promote: none — the two probe repositories are throwaway by the throwaway law, and the finding is the product. The one thing worth carrying is the bound itself, which belongs on the tripwire rather than in build code.
source_refs:
  - rank-unknowns, the seeded pick
  - raid-dec-an-update-arrives-as-a-program
  - el-update-runner
---

## The question

THE WINNING DESIGN LEADS BY ONE CELL ON ONE AXIS, and that cell says a program
which addresses by IDENTITY beats a mechanism that addresses by LOCATION,
because a vehicle may have restructured the file.

THE EARLIER PROBE COULD NOT TEST IT. Its program arm was a text substitution
checked for its own effect, with no repository and no failure mode available.
The tripwire says so in as many words.

SO THIS ONE USES A REAL STRUCTURAL CHANGE: the rename this iteration actually
performed, `bring-forth-a-copy` to `bring-forth-a-vehicle`, which moved a file
AND changed an identity inside it AND touched every citer.

## Method

TWO THROWAWAY REPOSITORIES, both run 2026-08-18, each three commits.

- BASE: a node file carrying `id: bring-forth-a-copy`.
- THE VEHICLE BRANCH restructures the file without touching the identity.
- THE UPSTREAM BRANCH renames the file and rewrites the identity inside it.
- Then `git merge vehicle` into upstream.

THE ONLY DIFFERENCE BETWEEN THE TWO RUNS IS FILE LENGTH, which is what decides
whether git's rename detection fires.

## Result one: a three-line node, two lines changed

```
CONFLICT (modify/delete): node.md deleted in HEAD and modified in vehicle.
Version vehicle of node.md left in tree.
MERGE_EXIT=1
```

BOTH FILES SURVIVED. `fn-bring-forth-a-vehicle.md` carried upstream's rename
WITHOUT the vehicle's restructuring, and `node.md` carried the vehicle's version
still claiming the OLD identity.

THE CORPUS NOW HOLDS TWO NODES for one thing, under two ids. The conflict is
loud, and the wrong resolution — keeping both — is the one a hurried person
reaches for.

## Result two: a twenty-line node, two lines changed

```
Auto-merging fn-bring-forth-a-vehicle.md
Merge made by the 'ort' strategy.
 1 file changed, 1 insertion(+)
MERGE_EXIT=0
```

ONE FILE. Upstream's new identity, upstream's new statement, and the vehicle's
added section, all in the renamed file. Nobody resolved anything.

## What decides which happens

GIT'S RENAME DETECTION IS A SIMILARITY THRESHOLD, 50 per cent by default. Two
lines out of three is 33 per cent similar and the rename is missed. Two lines
out of twenty is 90 per cent and it is found.

THE CORPUS IS ON THE SAFE SIDE OF THAT LINE. Trace nodes run 40 to 130 lines and
a typical upstream edit is a few lines.

## Verdict

THE TRIPWIRE DOES NOT FIRE. A structural migration CAN be written as a program:
"rename this identity, and the file follows" addresses the node rather than the
path, and neither run's restructuring would have troubled it.

BUT THE PROGRAM'S ADVANTAGE IS MUCH SMALLER THAN IT WAS SCORED. It buys
correctness in one nameable case — a short node that upstream largely rewrites —
and git already answers the case the corpus actually has.

AND THAT IS THE CELL THE WHOLE ITERATION TURNED ON. cand-the-program-route beat
cand-everything-declared 4 to 3 on `req-overlay-survives-update`, and
reverse-sensitivity computed that as the only cell that flips the seat.

## What this experiment does not say

THAT THE PROGRAM ROUTE IS WRONG. It says the axis it wins on is narrower than
the score assumed. Repricing the axis is fold-back's ruling, not this node's.

AND IT SAYS NOTHING ABOUT THE OTHER HALF OF THE ROW — silent fallbacks where the
overlay rules. Only the restructuring half was probed.

## SCOPE NARROWED 2026-08-18, hours after the runs

THE OWNER RULED A VEHICLE IS A PLAIN COPY rather than a clone, with its own
fresh repository and one commit. [[raid-dec-a-vehicle-is-a-copy-with-a-one-way-upstream-link]]
carries the ruling and supersedes the decision this experiment was run against.

BOTH RUNS ASSUMED A SHARED HISTORY. They branched from a common base commit,
which is what a clone gives you and what a copy does not.

SO NEITHER NUMBER APPLIES TO THE DESIGN THAT WILL BE BUILT. A copy and its
engine share no commit, git's three-way merge has no common ancestor to stand
on, and `git merge` cannot run at all — not with conflicts, not badly, not at
all.

## What survives and what does not

THE MEASUREMENTS STAND AND ARE NOT RETRACTED. MERGE_EXIT=0 on a 20-line node and
MERGE_EXIT=1 on a 3-line one are both real, both reproducible, and both describe
what git does across a clone. Anyone who revives the clone shape inherits them.

THE VERDICT ON THE TRIPWIRE ALSO STANDS. A structural migration CAN be expressed
as a what-not-where program. That half never depended on shared history — a
program reads the files as they stand — and the owner's ruling does not touch it.

WHAT DOES NOT SURVIVE IS THE COMPARISON. "Git already answers the case the
corpus has" was true of a clone and is false of a copy. That sentence was carried
into gate-prototype's round_1_validate and into fold-back, and it needs reading
with this scope beside it.

## Which way it cuts, and it is not the way it looks

LOSING THE MERGE STRENGTHENS THE WINNING DESIGN rather than weakening it. With no
common ancestor, a mechanism that says WHAT to change rather than WHERE is the
one that still works. The alternative — a declared patch series — also works and
is fussier about exact line positions.

AND IT KILLS A CANDIDATE. [[cand-nothing-but-a-channel]] exists to keep a
fetchable git connection to the engine, which the ruling forbids by name.

SO THE REOPEN GOT LESS ATTRACTIVE, not more. The candidate that would have gained
most from re-weighting is the one the ruling removes.
