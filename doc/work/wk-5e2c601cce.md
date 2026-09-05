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
author: fable-cloud
claimed_by: aeaf7bd9/reviewer-webern
claimed_at: "2026-09-05T14:54:48Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 4e5a2e490ca74ea234fe18a972af0d28f7efe28a
  - 20dc2a7678886f0db07abe81b716a0654b2ab777
  - b8b29f6f4e1932f55c9aba2b72bc86debd315e05
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - b5eb55b53e0ad3456f04590189a9d1d6e1af8f8f
  - 94391a05788a92900661b0de6af2ccde809edc4f
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

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | the proposed action is the approach: a kernel lock under .se, taken before anything is bound |  |
| [x] | every done-when line is decidable, and names the command where one decides it | two by TestASecondStartAttachesToTheFirst, the third by the battery |  |
| [x] | the change is small enough to review whole, or it is split first | one file of 72 lines, two platform files of 25 and 31, and the start and the swap calling them |  |
| [x] | the basics it stands on exist, or are minted first | the flock and LockFileEx calls are the platform's own, and nothing else was needed |  |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | the test was written first and watched red on two engines over one tree |  |
| [x] | the change follows the approach on the token, or the token says why it departed | it follows it, and adds one thing the approach did not name: a swap lets go of the tree before starting its successor |  |
| [x] | se test --on this token answered ok, and what it ran is named | ok on TestASecondStartAttachesToTheFirst, 0.60s, against a fresh engine |  |
| [x] | the note says what changed and why, for a reader who was not here | the commit dad9ddbf carries it, and it also names what it put back on the branch |  |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | it revealed that a swap must release the lock first, and that is in the change |  |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | [[reviewing]] was read and applied | Read whole, then two passes. |  |
| [x] | every hunk of git diff began..ended was read, and any not read is named | The change is dad9ddbf, read whole: onetree.go, treelock unix and windows, main.go 514, swap.go 330, onetree_test.go, go.mod. Not read: internal/yaml and version, another hand's move in that commit. |  |
| [x] | every criterion's command was run again, and what it said is named | On a clean HEAD copy under cgo.env, one and two answered ok in 2.3s. Three: batteries 140259 and 120558 both say 4 failed, none naming the lock. |  |
| [x] | every hunk improves the product, or a finding names the one that does not | Pass. The kernel now holds the tree, which a marker file could not. swap.go 333 lets go before the start and can lose the engine, wk-dd3561b254. Also seen: the test never reads the log, already wk-ac0442ba84. |  |
| [x] | every finding is a trivial token naming this one, and their ids are here | wk-dd3561b254, naming this one. |  |

