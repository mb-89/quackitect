---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: shell lookup finds wsl
# where the token stands. The process owns these values.
status: open
---

## detail

From the verdict on wk-212909368a. src/engine/tests.go:577-581 batteryShell asks exec.LookPath for "sh" then "bash" before it looks beside git. On this Windows box sh is not on PATH and bash is: C:\Windows\System32\bash.exe, the WSL launcher stub. It is not a shell, and every command handed to it answers exit 1 with "This application requires the Windows Subsystem for Linux Optional Component". Measured during this verdict: every se_run call died that way, including echo hello, so the shell door is shut on this machine while a real sh sits in C:\Program Files\Git\usr\bin. run.go:220 posixShell delegates here, so se run is dead, and battery.go:51 startBattery hands the same stub the battery script, so se test with a whole ruling would record a battery that produced only the WSL message. The stub must be rejected: either look beside git before PATH, or drop a candidate whose resolved path is the System32 WSL launcher, or require the candidate to answer a trivial command before it is returned.

## done when

- se run answers a plain command on a Windows box with no WSL installed
- a check feeds batteryShell a PATH whose only bash is the System32 WSL stub and asserts the answer is the git shell, not the stub
- go test -C src/engine -run TestTheBattery is green

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

