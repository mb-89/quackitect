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
status: open
claimed_by: 547b9365/worker-birch
claimed_at: "2026-09-05T15:36:27Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 4e5a2e490ca74ea234fe18a972af0d28f7efe28a
  - 20dc2a7678886f0db07abe81b716a0654b2ab777
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - b5eb55b53e0ad3456f04590189a9d1d6e1af8f8f
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
| [ ] | the approach is on the token before any work, as an interface or a shape a reader can disagree with |  |  |
| [ ] | every done-when line is decidable, and names the command where one decides it |  |  |
| [ ] | the change is small enough to review whole, or it is split first | — |  |
| [ ] | the basics it stands on exist, or are minted first | — |  |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the guidance this token names was read and applied | — |  |
| [ ] | the change follows the approach on the token, or the token says why it departed |  |  |
| [ ] | se test --on this token answered ok, and what it ran is named |  |  |
| [ ] | the note says what changed and why, for a reader who was not here |  |  |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | — |  |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | [[reviewing]] was read and applied | — |  |
| [ ] | every hunk of git diff began..ended was read, and any not read is named |  |  |
| [ ] | every criterion's command was run again, and what it said is named |  |  |
| [ ] | every hunk improves the product, or a finding names the one that does not |  |  |
| [ ] | every finding is a trivial token naming this one, and their ids are here |  |  |

