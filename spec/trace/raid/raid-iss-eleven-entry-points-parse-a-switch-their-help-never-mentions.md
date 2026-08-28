---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: raid-iss-eleven-entry-points-parse-a-switch-their-help-never-mentions
type: "[[raid]]"
kind: issue
statement: Eleven entry points break the rule that every switch a file parses appears in its help, and nothing said so because the guard read a hand-written list of six while the tree held twenty-nine.
owner: the maintainer
status: open
impact: A switch nobody can discover is a switch nobody has, which is the exact defect the help guard was built for. Four of the eleven do not exit 0 on --help at all, so a person asking for help gets a failure instead.
breaks_how_badly: abrasive
how_likely: expected
source_refs:
  - deliverable/tests/help.test.ts - the guard, now counting from the tree
  - "[[req-the-reachability-guard-enumerates-exports-from-the-source]]"
weighs_with: none
weighs_against: none
---

## How they were found

The help guard held a hand-written list of six names. The tree holds twenty-nine entry points.

Replacing the list with an enumeration of the tree, filtered to the files that actually parse a switch, turned up eleven breaks on the first run.

NONE OF THEM IS NEW. Every one has been there as long as the file has, and the guard could not see it because the guard was reading a list.

## The eleven

Four do not exit 0 when asked for help.

- `deliverable/engine/bin/battery.ts`
- `deliverable/engine/bin/grades-complete.ts`
- `deliverable/engine/bin/prose-inspect.ts`
- `deliverable/engine/bin/sweep.ts`

Seven parse a switch their help never mentions.

- `deliverable/engine/bin/brand.ts` — `--help`
- `deliverable/engine/bin/flow-closure.ts` — `--root`
- `deliverable/engine/bin/format-vault.ts` — `--check`
- `deliverable/engine/bin/outward-search.ts` — `--root`
- `deliverable/engine/bin/package.ts` — `--help`
- `deliverable/engine/bin/record-inspect.ts` — `--root`
- `deliverable/engine/bin/red-observed.ts` — `--root`

`deliverable/engine/bin/se-hook-start.ts` parses `--compacted` and does not mention it, which makes eleven in the list above by count of files rather than of findings.

## What was done about it, and what was not

THE GUARD SHIPS AT WARN FOR THE FILES IT NEWLY REACHES. The six that already blocked keep blocking, which is a ratchet floor rather than a scope.

The warnings are COUNTED and the count may fall and never rise. A warn nobody counts is a warn nobody fixes, and that silting is already registered as a risk against every list of exceptions this project keeps.

WHAT WAS NOT DONE is the eleven fixes. They sit in eleven files this record does not otherwise touch, and widening a record into them on the strength of a guard it built the same afternoon is the scope creep the method exists to stop.

## Why the fix is small and the finding is not

Seven of the eleven are one line of help text each.

The finding is that a guard reading a list checked whatever somebody remembered to add to it, for as long as the list existed. That is the same shape as the two working pieces of code that sat behind no door at all, which is what opened this record.
