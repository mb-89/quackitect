---
minted_in: i27
id: raid-iss-the-shell-writes-method-with-no-path-to-judge
type: "[[raid]]"
kind: issue
statement: A shell command writes a method file with no path for any seam to judge, so SE-C-134 cannot be retired on the strength of routing alone.
owner: the maintainer
trigger: any proposal to retire SE-C-134, and the seam-sweep chunk reaching its last verbs
status: open
impact: Retiring the clause after the sweep would remove the only check that fires on the five path-carrying tools while leaving the shell exactly as open as it is today.
breaks_how_badly: fatal
how_likely: expected
source_refs:
  - guidance/refusals.md
  - el-resolution-seam
  - exp-one-seam
  - req-a-wrong-act-never-passes-silently
place: i40-every-write-path-is-guarded-the-pool-s-b
---

Found by an adversarial audit of i27's build, 2026-08-14, and confirmed at the
primary by the author whose claim it contradicts.

## The clause says so itself

`guidance/refusals.md`, lines 247 to 256:

"THIS CLAUSE GUARDS FIVE TOOLS ONLY: se_file_write, se_file_patch,
se_file_replace, se_file_delete, se_file_move. It does not and cannot watch
se_run's shell commands, which is exactly the gap the i8 field report found on
2026-08-12: refused here, the walk reached for se_run with a no_tool_reason
instead of stepping out, and the write landed on trunk anyway."

## Why a resolution seam cannot close it

THE SEAM JUDGES PATHS. A shell is handed no path. `se_run` takes one opaque
command string, and the only thing jailed is the working directory it starts
in.

So every mechanism this milestone built — routing by owner, resolving by kind,
naming the store on the answer — operates on something the shell never
supplies. This is not a gap in the sweep. It is a gap the sweep's shape cannot
reach.

## What it does to the retirement claim

The claim was: SE-C-134 can be retired once seam-sweep lands, because routing
sends a method write to the right store and the delta makes a local change
deliberate.

THAT HOLDS FOR THE FIVE PATH-CARRYING TOOLS AND NOT FOR THE SHELL. Retiring
the clause would remove a partial cover and put nothing in its place for the
half it never covered.

## What would actually close it

Three shapes, none of them a path check.

- WATCH THE TREE RATHER THAN THE CALL. After a shell run, compare the record's
  tree against what a record may hold. A method file that appeared is either
  a declared delta or a stray, and the difference is checkable.
- ROOT THE SHELL IN SOMETHING NARROWER. exp-one-seam measured a child
  inheriting its parent's working directory. A satellite rooted in a thin tree
  has no shared method beneath it to overwrite, because the thin tree holds
  none.
- KEEP A CLAUSE, and narrow it to what a path cannot cover.

THE SECOND IS THE ARCHITECTURE'S OWN ANSWER and costs nothing extra, which is
the one worth trying first. It is also untested: no satellite exists.

## What the audit got wrong beside it

The same audit reported se_prompt_place writing the prompt layer into a bound
record's tree as the same class of defect. It is not. `paths.ts` says the
prompt layer is METHOD that does not live under a method folder and is
PROJECTED into each tree, so every tree needs it and no tree owns it. Writing
it into the tree the lane is working in is the design.

Recorded because a refuted finding beside a confirmed one is what makes the
confirmed one worth trusting.
