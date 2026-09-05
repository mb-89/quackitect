---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: battery links before mcp
# where the token stands. The process owns these values.
status: open
claimed_by: 547b9365/worker-oak
claimed_at: "2026-09-05T21:39:28Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - c43a82edbaeb9c1ad88cc091fd31fd1889557322
---

## detail

The battery's build function runs .bin/se.exe --link before it builds src/mcp into .bin/se-mcp.exe. LinkEveryProgram links every program the manifest names, so the link runs while se-mcp.exe is not there yet, and nothing links it afterwards. On Linux the tool lane is then .bin/se-mcp.exe with no .bin/se-mcp beside it.

util/checks/mcp-tools.mjs opens .bin/se-mcp on anything but Windows. Measured on a Linux box at 180c0d86: every battery run answers "FAIL the tool lane is not built at .bin/se-mcp", and the check never drives the lane. A door that is never driven drifts in silence, which is the class that check exists to catch.

## proposed action

Move the link after the mcp build in util/checks/battery.sh, or link once more after it, so both names exist when the check runs.

## done when

- on Linux, after sh util/checks/battery.sh builds, ls .bin/se-mcp answers a file, decided by node util/checks/mcp-tools.mjs . answering something other than the not-built failure
- a check or a test decides that the link runs after every build the battery makes, so the order cannot drift back

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the ask is small enough to review whole, or it is split first | — |  |
| [ ] | every done-when line is decidable, and names the command where one decides it |  |  |
| [ ] | the basics it stands on exist, or are minted first | — |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the guidance this token names was read and applied | — |  |
| [ ] | one test was written first and seen red for the reason expected |  |  |
| [ ] | the same test was seen green after the change, and named |  |  |
| [ ] | the change is git diff began..ended, the two hashes the engine wrote on this token | — |  |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | — |  |

