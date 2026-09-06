---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: Find sh beside git
# where the token stands. The process owns these values.
status: open
# tokens that have to close before this can start
depends_on:
  - "[[wk-212909368a]]"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 3b4d634ddb3bcb2d0b5fe480880f6beaaa559393
---

## detail

On this machine se_test answers ok:false with "no sh on this machine, so the battery cannot run". Every se_run command runs in cmd rather than sh. Git is installed: the engine's own tool probe reports git at C:\Program Files\Git\cmd\git.exe, and C:\Program Files\Git\bin\sh.exe exists, confirmed by an if exist through se_run.

The cause is exec.LookPath("sh") in two places: src/engine/tests.go:557 in runBattery, and src/engine/run.go:202 in TheShell. Git for Windows puts git.exe on PATH from its cmd folder and leaves sh.exe in its bin folder, which is not on PATH. So LookPath finds git and misses sh, and the engine concludes the machine has no shell.

Two things follow, and both are silent. The battery cannot run at all, so any token whose delta earns a whole ruling can never show a green se_test. That is a criterion on every standard token. And se_run runs in cmd, so a shell command written as sh fails on syntax. The guidance and every helper script assume sh. se_run still answers exit 0, with output saying 'ls' is not recognized.

WHY THIS IS NOT FIXED ON ITS OWN. Making sh findable makes se_test with a whole ruling actually launch the battery, and the battery stops the engine hosting it. That is wk-212909368a, one build door, which moves the battery outside the engine. Fixing the lookup first turns a harmless refusal into the engine storm that cost the owner an afternoon, so this waits on that.

## proposed action

Give the engine one way to find a POSIX shell, used by both runBattery and TheShell. Look on PATH first. Failing that, resolve git through the probe the engine already runs. Look for sh beside it, in the sibling bin and usr/bin of git's parent. Take the first that exists.

Land it only after wk-212909368a, so the battery it enables runs outside the engine.

## done when

- A test that puts git on PATH with sh off it asserts the engine still finds a shell. It is seen red before the change
- The same test is green after the change, and named
- se_run with the command echo $0 answers a POSIX shell rather than cmd, and the answer is quoted
- Neither src/engine/tests.go nor src/engine/run.go calls LookPath for sh directly: se_find regex LookPath..sh.. over path src/**/*.go returns count 0
- wk-212909368a is closed before this one lands

## evidence: the finding

WRITTEN, NOT RELEASED. Do not close this while wk-212909368a is open.

The code is done and green. posixShell in run.go is now the one lookup, used by TheShell and by shellCommand. It defers to batteryShell, which asks the probe where git is and looks in the sibling bin and usr/bin. No file under src holds LookPath("sh") any more: se_find answers count 0. Names are a list now, sh then bash, so a machine with only bash is not called shell-less.

WHY IT MUST NOT BE RELEASED YET. Today the lookup fails, the battery cannot start, and that failure is harmless. The moment sh is findable, se test with a whole ruling launches the battery, and the battery stops the engine hosting it. That is wk-212909368a, one build door, still open and in another actor's hands. Landing this first turns a harmless refusal into the engine storm that cost the owner an afternoon.

Also note the running engine is a stale build, so none of this takes effect until somebody rebuilds.

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | what is gained by doing it, and not only what it does |  |  |
| [ ] | what breaks if it is never done, and not only that it stays undone |  |  |
| [x] | the ask is small enough to review whole, or it is split first | — | one lookup and its two call sites |
| [x] | every done-when line is decidable, and names the command where one decides it | four by se_test and se_find | the fifth is the dependency and it is still open |
| [x] | the basics it stands on exist, or are minted first | — | batteryShell and the tool probe were already there |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | — | doc/guidance/work-token.md |
| [x] | one test was written first and seen red for the reason expected | TheShell took no Roots and never asked the probe | red, and masked at first by another worker's half-landed Apply signature |
| [x] | the same test was seen green after the change, and named | se_test on this token, six named tests | all ok: the three new ones and the three battery-shell ones, so nothing of that worker's broke |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | — | run.go, one lookup and two call sites, and tests.go, the last literal gone |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | — | nothing further revealed |

