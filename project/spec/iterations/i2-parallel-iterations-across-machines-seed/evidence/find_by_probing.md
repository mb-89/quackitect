---
form: find_by_probing
by: agent
signed_off: 2026-08-11T17:19:07.597Z
authors: agent
files:
---

# Evidence form / find_by_probing

## current_situation

The one probe worth running ran: the claim race against a local bare repo, minutes, throwaway, nothing touched the real origin.

## applies

yes — the lock's whole premise is checkable by running it, and running beats reasoning

## probes

| question | timebox | what_was_faked | verdict |
| --- | --- | --- | --- |
| does a bare git repo serialize two racing pushes of the same new claims file so exactly one lands | five minutes, two used | the network, and github's receive layer - a local bare repo stood in for origin | push A landed as main, push B rejected non-fast-forward with git's own another-repository-pushing hint; first-push-wins holds at the git layer, dated measurement on raid-asm-remote-serializes-claims |

## options

- none — the probe confirmed the standing cells' load-bearing mechanism rather than opening a new one

## dead_ends

- none — the run was green; the recorded evidence is the finding

## follow_up

The chart composes now with the race mechanism measured rather than believed; the origin half of the probe rides the M7 build plan.

## anything_else

