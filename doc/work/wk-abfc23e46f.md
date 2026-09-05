---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: every .se file owned
# where the token stands. The process owns these values.
status: closed
author: worker-gale
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - e63a4c7fb0a93f37b13acfdb1c634235e7d7361d
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 501cd9cb1edc02d2ba0e94a4419740514e01bb88
# how it ended. Only an ended token carries one.
disposition: done
# why it was dropped
reason: util/checks/private-files-have-writers.mjs walks every entry under .se and refuses one no source under src names. Seen red on tickets.json, which is now deleted, and green after. battery.sh names the new check so it actually runs.
---

## detail

tickets.json is still under .se and ticket.go is deleted, so nothing reads or writes it. Every other file there has an owner in the tree. Consumes wk-3a61b3d173.

## done when

- a check walks the files the engine keeps under .se and refuses one no source writes: node util/checks/private-files-have-writers.mjs .

## evidence: step 1. ask

<!-- restored by worker-gale after the submit wiped it. The engine's submit writes the payload's evidence map over the tables it just read off this file, and a se_pull carrying none writes nil. The text below is the text that was on the file when the gate read it and let the token close. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | — |  |
| [x] | every done-when line is decidable, and names the command where one decides it | There is one done-when line and it names its command. The engine runs the node checks itself, as util/checks/private-files-have-writers, and it decided this work in both directions: red on the tree as it was, green on the tree as it is. | se test --on wk-abfc23e46f --propose util/checks/private-files-have-writers |
| [x] | the basics it stands on exist, or are minted first | — |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | — |  |
| [x] | one test was written first and seen red for the reason expected | Red first. The chapter evidence: the first check could not fail carries it. | se test --on wk-abfc23e46f --propose util/checks/private-files-have-writers |
| [x] | the same test was seen green after the change, and named | .se/tickets.json was deleted, which is the whole change to the tree's state, and the same check then passed with exit zero. util/checks/checks-live-in-the-method was run with it and passes, so the new check is named by the battery rather than sitting there unrun. | se test --on wk-abfc23e46f --propose util/checks/private-files-have-writers |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | — |  |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | The chapter evidence: the cleanup and what was left carries it. | se test --on wk-abfc23e46f --propose util/checks/scripts-are-lf |

## evidence: the first check could not fail

The check was written before anything was deleted, and the first version of it could not fail. It read src and util, and its own comment names tickets.json as the leftover it hunts, so the sweep found the name in the sweep and called the orphan owned. It answered green on a tree that plainly held the defect, which is the finding rule 12 asks for. It now reads src alone, because .se is written by the engine and the engine is src, and the reason is written in the file. Run against the tree as it was, it answered: FAIL tickets.json has a writer in the tree, no source under src names tickets.json. One failure out of 32 entries, with the other 31 ok, including the two SQLite sidecars index.db-shm and index.db-wal passing on the allowance that names them.

## evidence: the cleanup and what was left

In the change: util/checks/battery.sh now names private-files-have-writers, because a check the battery never runs is the checking half that ships missing. checks-live-in-the-method caught that and is green now. Not in the change, and not mine: util/checks/scripts-are-lf answers red on RUNME.sh, which carries a carriage return at byte 86. RUNME.sh was already modified in the working tree when this token was taken up, and nothing here touched it. So it belongs to whoever is editing it. One thing left as it was found: this check declares nothing about what it reads. So the engine lists it as undeclared and runs it only in the whole battery. Every one of the tree's 26 checks is undeclared the same way, so that is the tree's standing state rather than something this change introduced.

