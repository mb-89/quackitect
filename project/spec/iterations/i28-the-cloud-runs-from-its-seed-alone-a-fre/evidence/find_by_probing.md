---
form: find_by_probing
by: agent
signed_off: 2026-08-15T16:52:56.197Z
authors: agent
files:
---

# Evidence form / find_by_probing

## current_situation

M4's divergence, the last finder. Every other finder reasoned about options; this one ran one.

THE QUESTION WAS WRITTEN BEFORE THE PROBE: how long does materialising a worktree from a branch actually cost? Materialise-on-entry is the design's central move and nobody had measured it, so the whole option rested on an assumption that it was cheap enough to do at the moment somebody is waiting.

## applies

yes

## probes

| question | timebox | what_was_faked | verdict |
| --- | --- | --- | --- |
| how long does materialising a worktree from a branch cost, and how long does releasing it cost | one command, one run | THREE STUBS, and each could hide a false positive. The branch was already fetched locally, so no network is in the number. The host is Windows on NTFS, and the target is a Linux container. And the tree was written to the system temp directory rather than to the worktrees folder, so it is one filesystem's write speed rather than the real path's | MATERIALISE 593 ms for 1326 files, RELEASE 171 ms, both exiting clean and the directory gone afterwards. Materialise-on-entry is viable and sits inside the one-second budget without needing the non-blocking treatment |

## options

- [[opt-worktree-holds-only-the-record]]
- [[opt-no-worktrees-at-all-every-record-walks-on-trunk]]

## dead_ends

- none of the probes failed, and that is worth naming rather than celebrating: one probe was run, against the cheapest question in the set, so a clean result is weak evidence about the design as a whole
- the crashed-walk probe was NOT run here, because killing a bound walk kills this session's own engine; it needs a throwaway clone with its own engine and is scheduled at M6
- the fresh-clone probe was NOT run, because it needs a machine this one cannot make, which is the standing cloud-validation debt

## follow_up

- MATERIALISE-ON-ENTRY IS MEASURED AND VIABLE at 593 ms, so the option stops resting on an assumption
- THE 1326-FILE NUMBER IS THE THIN-TREE OPTION'S ARGUMENT, made concrete. A worktree carries the whole product, and a record's own folder is a few dozen files, so opt-worktree-holds-only-the-record is a large saving rather than a tidy one
- THE NUMBER IS A FLOOR RATHER THAN THE ANSWER. Three stubs are named on the probe row, and the one that matters most is the platform: this is NTFS on Windows and the target is a Linux container
- build_chart is next and it is the join all seven finders were feeding
- nothing is parked from this state

## anything_else

### What the probe changed

BEFORE IT, MATERIALISE-ON-ENTRY WAS AN ASSUMPTION. The design says the folder is created at the moment of entry, and every discussion of it assumed that was cheap. Nobody had run it.

AFTER IT, THE MOVE IS PRICED. 593 ms to create, 171 ms to release. Entry is a deliberate act somebody triggers, and 593 ms is inside the budget even without the non-blocking treatment that a longer operation would owe.

THE SECOND NUMBER WAS NOT THE QUESTION AND IS WORTH MORE. 1326 files. A worktree carries the entire product, and what a record needs is its own folder. That is the thin-tree option's whole case, and it now has a ratio behind it rather than an intuition.

### Why one probe rather than three

THE OTHER TWO QUESTIONS IN THIS ITERATION CANNOT BE PROBED FROM HERE, and both are recorded rather than skipped.

- Killing a bound walk to see what it leaves would kill this session's engine. It needs a throwaway clone with its own engine, which is a spike rather than a probe.
- A fresh-machine run needs a machine this one cannot make, which is the standing debt the owner holds.

A CLEAN RESULT FROM ONE CHEAP PROBE IS WEAK EVIDENCE about the design as a whole, and the dead-ends field says so rather than letting a green row imply more than it earned.
