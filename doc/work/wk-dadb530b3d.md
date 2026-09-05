---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: shell lookup picks wsl
# where the token stands. The process owns these values.
status: open
---

## detail

Every se run on this box fails, and it is the shell lookup, not the command.

src/engine/tests.go:573 batteryShell asks exec.LookPath for "sh" then "bash" and returns the first hit, before it looks beside git. Windows 10 ships C:\Windows\System32\bash.exe, the WSL launcher, on PATH whether WSL is installed or not. So LookPath("bash") succeeds, run.go:180 runs it as name -c script, and WSL answers instead of a shell: exit 1, "This application requires the Windows Subsystem for Linux Optional Component", in UTF-16, which is why the output arrives NUL-separated. Git's own sh sits unused at Git\bin\sh.exe, which shellsBesideGit already knows how to find; the loop never reaches it.

MEASURED. util/checks/mcp-tools passed every tool but the four se_run cases, each on this message. Reviewing wk-3747494a3c could run no git diff, no go build and no criterion command, so a reviewer on this box cannot read a diff at all.

run.go:170 already says a command that silently does nothing is worse than one refused, and tests.go:565 records the last time this lookup answered wrongly. Same class, one machine on: a name that resolves is not a shell that runs.

Prove the candidate before trusting it, rather than adding WSL to a list of names to avoid: run it once with a trivial script and take the next candidate when it does not answer.

## done when

- batteryShell does not answer a candidate that will not run a trivial script, and falls through to the next: go test -C src/engine -run TestTheShell
- a candidate is proven before it is answered, watched red first against a stub shell that exits non-zero on every script
- se run answers a command on this box: echo 'echo ran' | se run --on <id> says ran and exit 0

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | what is gained by doing it, and not only what it does |  |  |
| [ ] | what breaks if it is never done, and not only that it stays undone |  |  |
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

