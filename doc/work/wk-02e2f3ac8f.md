---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: battery verdict line disagrees
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: worker-chopin
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 97f19fe6e2bd3e3827df24010cd64a7aae819ce1
  - 4882453564e8c5dda4d1a6c65bd7d8347b417b28
  - 19811e50c333f161e242f2ae9df4df268057c0c8
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - f4d7a1292ca1deee8d8fc68037b1085aabbf1d16
  - 93c6d10de34a4dd5544d21c41f3192fa3bb57a80
  - c0988a451928bc98c941e4154a0f7dd35e4eea8d
# how it ended. Only an ended token carries one.
disposition: done
---

## detail

From the verdict on wk-212909368a. src/engine/battery.go:140 batteryPassed answers true only when the battery's last line starts with "0 failed". util/checks/battery.sh:405-409 prints "all ok, ${took}s wall clock" when nothing failed, and "$bad failed, ${took}s wall clock" only when something did. So the real script never prints the line the reader is looking for on a green run, and RecordFinishedBattery (battery.go:131) writes every passing battery into the record as not ok. Nobody caught it because both the fixture (battery_test.go:79) and the table in TestTheBatterysVerdictIsItsLastLine (battery_test.go:109-113) feed strings the passing script does not produce. Fix it in one place: either have battery.sh print "0 failed" on success, or have batteryPassed accept the script's own green line. The check that catches the class is a case in TestTheBatterysVerdictIsItsLastLine whose input is the literal line battery.sh prints when bad is 0.

## done when

- a green run of util/checks/battery.sh is recorded ok: go test -C src/engine -run TestTheBatterysVerdictIsItsLastLine
- the green case in that test uses the exact line util/checks/battery.sh prints when bad is 0
- go test -C src/engine -run TestTheBatteryRunsOutsideTheEngine stays green

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | one verdict line in the script, one sweep in the test | reviewed whole |
| [x] | every done-when line is decidable, and names the command where one decides it | all three name go test -C src/engine -run, and all three ran through se test | green, see step 2 |
| [x] | the basics it stands on exist, or are minted first | batteryPassed, battery.sh and TestTheBatterysVerdictIsItsLastLine were all already there | — |

The battery itself stays owed. Every se_run on this box answers with the WSL launcher, which wk-e51c579664 is fixing.

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | testing 8, a sweep guards the set and refuses until it finds a member | — |
| [x] | one test was written first and seen red for the reason expected | battery.sh printed "all ok, 3s wall clock" and batteryPassed called it a failure | red |
| [x] | the same test was seen green after the change, and named | TestTheBatterysVerdictIsItsLastLine, and TestTheBatteryRunsOutsideTheEngine with it | green |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | util/checks/battery.sh:405-409 and src/engine/battery_test.go | — |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | the green branch went with it, so one verdict line is left | — |

battery.sh now prints "$bad failed, ${took}s wall clock" whatever the outcome, so nought reads as green and batteryPassed is untouched. The new case sweeps the verdict lines battery.sh can print, read from the script. A second spelling goes red.

