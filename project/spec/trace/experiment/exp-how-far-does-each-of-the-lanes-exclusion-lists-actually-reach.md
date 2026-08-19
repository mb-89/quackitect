---
minted_in: i37-training-iterations-a-disposable-iterati
id: exp-how-far-does-each-of-the-lanes-exclusion-lists-actually-reach
type: "[[experiment]]"
statement: "Which lane verbs honour which exclusion list, so the conditional concealment a benchmark run needs has one rule to attach to rather than three?"
probes:
  - raid-iss-the-reading-verb-consults-no-exclusion-list-at-all
  - raid-ar-the-benchmark-history-is-unreadable-while-a-run-is-bound
timebox: "minutes — one probe per verb per list"
form: script
faked: "nothing. Every row is a real lane call against this tree."
fallback: "pre-agreed before the run: if one list already binds every verb, the concealment attaches to it and the standing work token is not this iteration's dependency."
folds_to: "req-the-benchmark-history-is-unreadable-while-a-run-is-bound — it waits on a work token this iteration does not own"
promote: "none — a blocker rather than a mechanism"
verdict: falls
source_refs:
  - el-benchmark-guard
  - req-the-benchmark-history-is-unreadable-while-a-run-is-bound
  - if-benchmark-binding-to-guard
---

## The run

RUN 2026-08-19, one lane call per cell.

### There are FOUR lists, not three

| list | where | entries |
| --- | --- | --- |
| `paths.ts` `EXCLUDED_DIRS` | list, glob | `.git`, `node_modules`, `.se`, `.venv`, `__pycache__` |
| `search.ts` own globs | search | `.se`, `node_modules` |
| `produce.ts` `EXCLUDE_DIRS` | packaging and producing only | 11 entries, including `.worktrees`, `.claude`, `.github`, `dist`, `.obsidian`, `.vscode`, `scratchpad` |
| — | **read** | **none** |

### Measured, per verb

| target | read | list | glob | search |
| --- | --- | --- | --- | --- |
| `.se/reading.md` | **REACHES**, returns the hash | hidden | 0 | 0 |
| `project/.obsidian` | reaches | **7 entries** | **12** | **9214 matches** |
| `project/.github` | reaches | **1 entry** | **1** | **670 matches** |

### And a fourth shape nobody had named

A DIRECTORY EXCLUDED FROM A PARENT WALK IS STILL LISTABLE WHEN NAMED. Listing
the root hides `.se`, `.git` and `node_modules`. Listing `project/.obsidian`
directly returns its seven entries.

So the exclusion governs the WALK rather than the TARGET.

## The verdict

IT FALLS. No single list binds every verb, and the reading verb consults none
of them.

## What that costs this iteration

THE CONCEALMENT HAS NOTHING TO ATTACH TO. `req-the-benchmark-history-is-unreadable-while-a-run-is-bound`
needs `project/spec/benchmarks` invisible to read, list, glob and search alike,
for the length of a binding and no longer.

Written against today's lane that is FOUR separate changes in three files, and
one of them — read — has no exclusion concept at all to extend.

## What it settles for the design

THE STANDING WORK TOKEN IS A HARD DEPENDENCY, not a neighbour.
`wt-three-separate-lists-decide-which-paths-a-lane-verb-may-see-` has to land
before the concealment can be built, and this experiment says the token
understates the problem: there are four lists, and the fourth is empty.

## What it does not settle

Whether a single predicate is the right shape. This measured what the lists
do; it did not design their replacement.
