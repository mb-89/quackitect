---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: raid-lane-works-on-posix
type: "[[raid]]"
kind: assumption
statement: The lane's path handling behaves the same on macOS and Linux as it does on Windows.
owner: the driving agent
trigger: the first run on macOS or Linux, and any new path-splitting code in the lane
status: open
breaks_how_badly: crippling
how_likely: plausible
probe: "holds on Linux — the first POSIX run (2026-08-13, a headless container). The full battery ran clean: 1104/1117, and none of the 13 failures touch path separators, worktrees or the method fan-out (2 in drawnsub, several in threshold, a missing-browser screenshot suite, one self-test assertion). 48 lane-tool calls (se_file_read, se_file_search, se_file_list, se_git, se_note, se_aim, se_update, se_pull) also ran clean against a Linux root, per the i8 field-report. Still unprobed: se_run, se_web_fetch and se_test were not exercised by a caged agent this run, and macOS remains untried."
probed: 2026-08-13
impact: A separator difference makes a write land in the wrong tree silently — which is the exact failure class the method fan-out was built to end.
source_refs:
  - engine/paths.ts
  - engine/files.ts
---

Every line of this has been exercised on one platform. The lane normalises
backslashes in several places, and that is evidence somebody was thinking
about it rather than evidence it works.

NOT ESTABLISHED: the suite has never run on macOS or Linux. Not once.

NOT CONTROLLED: the separator belongs to the operating system.

THE SHARPEST EDGE is `mirrorFor` in files.ts, which decides whether a write
belongs to a session by testing `from.startsWith(root + sep)`. That comparison
is the guard stopping one root's files being copied into another root's trees,
and it is a string test over platform separators.

## Probe

Run the battery on macOS or Linux. The whole thing, not a subset — the path
code is spread through the file lane rather than gathered in one place.

Watch the worktree cases and the method fan-out case in particular. Those are
the ones that compare roots.

Running it is the only honest check. Reading the code for separator handling
finds the places somebody remembered to handle, which is exactly the set that
is already correct.

## Retro sweep 2026-08-13

The deferred trigger fired: this is the first session on a POSIX machine.
Status moves from deferred to open — the check ran and held, but the
second half of the original trigger ("any new path-splitting code in the
lane") means this stays a live watch, not a closed item. See the i8
field-report §1.3 and §3, and note-b870f087a822 for the full-battery
result.
