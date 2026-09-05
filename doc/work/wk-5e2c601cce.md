---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: two engines one tree
# where the token stands. The process owns these values.
status: done
# who did the work step, so the verdict is never theirs
author: worker-birch
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 4e5a2e490ca74ea234fe18a972af0d28f7efe28a
  - 20dc2a7678886f0db07abe81b716a0654b2ab777
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - b5eb55b53e0ad3456f04590189a9d1d6e1af8f8f
  - d6c5f21566ff38837d1a49426b0ea54d4d45af50
---

## detail

After a container restart on a cloud box, two engines came up over one tree a second apart, and the lane's calls flip between them: se_status answers, se_run answers "the engine over /home/user/quackitect answers no questions yet. Start it again", the next se_run answers, and the one after does not.

Measured on 2026-09-05 at 11:21 on cf8e1d4e. `ps` shows pid 1444, `.bin/se --work <tree> --method <tree>`, started 11:21:02 by the SessionStart hook's wake, and pid 1487, `.bin/se --work <tree>`, started 11:21:03 by the lane's se_start. .se/engine.json names pid 1444 and its beat moves. .se/log/session.jsonl carries session 20260905-112103, which is pid 1487's, and .se/engine.out shows the lane attached to pid 1487. So the marker says one engine and the record says another, and each door reaches whichever answered its start. Nothing refused the second start: whatever lock an engine takes on its tree did not hold across a second start one second later.

## proposed action

One engine per tree, held by a lock the second start meets: the starter takes an exclusive lock on a file under .se before it binds anything, a start that finds the lock held attaches to the engine that holds it and answers "already up", and the wake and se_start both go through that one door. A test starts two engines over one temporary tree within the same second and asserts one process, one engine.json pid, one session in the log.

## done when

- two starts over one tree within a second leave one engine, decided by: go test -C src/engine -run 'ASecondStartAttachesToTheFirst' ./... answers ok
- engine.json's pid and the log's session name the same process after two starts, decided by: the same test
- sh util/checks/battery.sh reports no new failure against the run before the change

## evidence: 1 two starts leave one engine

TestASecondStartAttachesToTheFirst: ok, 0.58s. It starts two engines over one temporary tree at once, waits for one to exit, and refuses the run if both stay up. The one that leaves must say already up. HoldTheTree in src/engine/onetree.go is the door: the kernel's lock on .se/engine.lock, taken before anything binds, dropped by the kernel however the process dies.

## evidence: 2 engine.json and the log name the same process

The same test, and this half was missing. It asserted engine.json's pid against the surviving process and said nothing about the session, which is the half the measured split showed: engine.json named pid 1444 while the record carried pid 1487's session. It now also reads the session out of the current record and asserts it against engine.json's, and refuses an empty one so the check cannot pass on a record nobody wrote. Green with both halves.

## evidence: 3 the battery reports no new failure

The battery at 15:38 answered 4 failed in 135s, against 6 at 15:05 and 6 at 14:50. Gone since: a-refusal-names-a-legal-move and checks-live-in-the-method, because another hand added that check, and tests-name-no-token, because another hand fixed notesgohome_test.go. Unchanged: go test engine on three posixshell and quoted tests, se lint on a hold under a harness name, render-check on the editor. New: gofmt names src/engine/stateofplay.go, which was clean at 15:22, is another hand's file and was never opened by this change.

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | The proposed action names the lock, the attach and the test. A reader can disagree with a lock file. | proposed action |
| [x] | every done-when line is decidable, and names the command where one decides it | Lines 1 and 2 name a go test, line 3 names the battery. All three were run again here. | done when |
| [x] | the change is small enough to review whole, or it is split first | onetree.go, the treelock package it stands on, the call sites at start and handover, and one test. | — |
| [x] | the basics it stands on exist, or are minted first | treelock takes and drops the kernel's lock, and Running already carries the pid and the session the test reads. | treelock |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Both halves were driven. The test asserted the pid and not the session, the half the split showed. | work-token |
| [x] | the change follows the approach on the token, or the token says why it departed | The lock is taken before anything binds, a second start says already up and leaves, and a swap hands the tree over. | onetree.go |
| [x] | se test --on this token answered ok, and what it ran is named | --on answers `bad object 20dc2a7678`, because the token travelled. TestASecondStartAttachesToTheFirst ran by name: ok. The battery answered 4 failed against 6. | wk-89847112fe |
| [x] | the note says what changed and why, for a reader who was not here | onetree.go says why engine.json was too late to be the door. | onetree.go |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | The missing half is in it. gofmt names another hand's file. | onetree_test.go |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | [[reviewing]] was read and applied | — |  |
| [ ] | every hunk of git diff began..ended was read, and any not read is named |  |  |
| [ ] | every criterion's command was run again, and what it said is named |  |  |
| [ ] | every hunk improves the product, or a finding names the one that does not |  |  |
| [ ] | every finding is a trivial token naming this one, and their ids are here |  |  |

## evidence: the other door

SweepClosed and the two save sites are wk-5c63e06cfc's, not this one's. Nothing here touches them.

