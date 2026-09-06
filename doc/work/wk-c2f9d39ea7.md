---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: long token traps hold
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: main
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 953b2f6c8215a592fa90717a3d56a8512be3c15e
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 401e5dc90179125dbafe92b854223a42d011b999
# how it ended. Only an ended token carries one.
disposition: done
# why it was dropped
reason: The release goes through the hold store, so a token whose prose runs past its cap no longer traps its own hold.
---

## detail

A FINDING WHILE RULING ON A QUIET HOLD.

The engine asked me to look at wk-963dbf6898, held by worker-nono-two, silent over nine hours. I ruled them gone and pulled again, as the notice says. The answer was: wk-963dbf6898 would not save, so the hold still stands.

investigate.go clears the holder and calls SaveToken. SaveToken runs proseThatFits before it writes, and wk-963dbf6898 carries two evidence sections over the word cap. So every save of that token is refused, and a hold release is a save.

Measured on this box: evidence step 1 ask runs to 249 words and step 2 do to 219, against a cap of 200. Four pulls in a row answered the same notice, so the queue hands out nothing else while it stands.

A release changes no prose. It should not be judged on prose it did not write.

## done when

- a hold on a token whose prose runs past its cap is released, decided by a test that saves such a token with the holder cleared and reads the holder back empty
- the same token still cannot have its prose grown further, decided by the same test saving a longer section and seeing it refused
- se pull answers work rather than the investigate notice for wk-963dbf6898

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | A walker can hand back a stale hold on any token, so the queue goes on giving out work. | 1 door |
| [x] | what breaks if it is never done, and not only that it stays undone | One long token stops the whole queue. A look must be ruled on before work is handed out, and this look could not be. | 4 pulls |
| [x] | the ask is small enough to review whole, or it is split first | One call swapped for another, in one function. | 1 hunk |
| [x] | every done-when line is decidable, and names the command where one decides it | One test releases a hold on an over-long token, one holds the cap, and se pull decides the third. | 3 of 3 |
| [x] | the basics it stands on exist, or are minted first | recordHold and HeldBy were already the store's own door. | 2 of 2 |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | The release stopped going through the token, and nothing else moved. | work-token.md |
| [x] | one test was written first and seen red for the reason expected | TestAHoldIsReleasedEvenWhenTheProseIsTooLong answered: the hold was not taken back, because it would not save. | 1 red |
| [x] | the same test was seen green after the change, and named | Both pass, with TestALongSectionIsStillRefusedOnASave holding the cap. Every hold, look and investigate test passes, and go vet is clean. | 2 of 2 |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | One hunk in investigate.go and one new test file. | 40129c7e |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | In the change. The refusal now names what would not let go, rather than blaming a save that never had to happen. | 1 line |

