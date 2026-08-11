---
id: raid-lane-works-on-posix
type: "[[raid]]"
kind: assumption
statement: The lane's path handling behaves the same on macOS and Linux as it does on Windows.
owner: the driving agent
trigger: the first run on macOS or Linux, and any new path-splitting code in the lane
status: deferred
defer_until: the first session on a POSIX machine — the check is the full battery there
breaks_how_badly: crippling
how_likely: plausible
probe: unprobed. The check is a full battery run on macOS or Linux, and no such machine is reachable from here. Reading the code for separator handling would find the places somebody remembered, which is exa
probed: 2026-08-07
impact: A separator difference makes a write land in the wrong tree silently — which is the exact failure class the method fan-out was built to end.
breaks_how_badly: crippling
how_likely: plausible
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
