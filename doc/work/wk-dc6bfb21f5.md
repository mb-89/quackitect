---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: roots cannot be named
# where the token stands. The process owns these values.
status: open
# what has to be true before this can be taken again
ready_when: src/engine builds its tests again. An untracked arrival_test.go from another lane calls writeWorkableProcess, which nothing defines, so the package test binary will not build and no test here can be watched.
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 468000144b7f531c56500a524ee2d7938849e5e4
---

## detail

FindRoots takes the work root as an argument and derives the method root as `filepath.Dir(filepath.Dir(exe))`. A build run from anywhere but `<method>/.bin` derives every path wrong and files findings against innocent files. Only the flag form carries `--method` and the nine verbs take the guess. Add `--work` and `--method` to every verb through the same door as the other flags, both defaulting to the current behaviour. Find the method root by walking up from the program to the folder carrying the method root marker. projectRoot already walks up to the nearest `.se` that way. When the method root cannot be found, report it and stop instead of filing findings.

## done when

- Every verb takes --work and --method, defaulting to today's behaviour.
- Run outside .bin walks up to the marker. None found: report and stop, no findings.
- Engine tests pass.

## evidence: where this stands

THE CHANGE IS WRITTEN AND THE PROGRAM BUILDS. THE RED IS OWED.

roots.go gains methodRootFrom, walking up for a folder carrying src/processes and answering empty rather than guessing. It also gains argValue, reading a flag off a verb's arguments in both spellings, and MethodFound and TheMethodIsLost. FindRoots takes the method root as its second argument. client.go reads both flags off the verb's arguments and stops when no method is found. main.go passes the flag in and reads its error before using the roots.

go build -C src/engine ./... answered BUILD_EXIT=0. go vet reports one error, arrival_test.go, an untracked file from another lane calling a helper nothing defines, so every other call site compiles.

Owed: rootsmethod_test.go is written and never watched, because the test binary will not build.

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

