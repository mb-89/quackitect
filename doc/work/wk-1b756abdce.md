---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: a dry queue drops
# where the token stands. The process owns these values.
status: open
---

## detail

FOUND REVIEWING wk-8863048da6, which is not this token's parent because nothing here blocks it.

whatComesNext in src/engine/pull.go now ends:

  if a := next(r, actor, role); a.Token != nil || a.Pull != AnswerWait {
      return a
  }
  return theNotesLeft(r, actor)

A wait answer is discarded whole, and its Notice goes with it. next() is the one place behindNotice is appended, so everything the queue had to say about why it is empty is thrown away at exactly the moment it is empty.

MEASURED ON THIS BOX. Every pull this session carried "Passed over, because origin/v4 has archived them and this clone is behind it: wk-6741a3e30a. Bring doc/work into step with origin/v4, and pull again." It survived only because a token came back with it. Drain the queue, or narrow it to a bucket that is done, and the agent is handed a note instead and never learns the clone is behind.

WHAT IT COSTS. The notice exists to tell an agent the queue looks empty for a reason it can fix. The change routes around it in the one case where it is the answer.

The notes answer is right. It should carry the notice the queue wrote rather than replace it.

## done when

- a wait notice survives into the notes answer, decided by: a Go test over a clone behind its branch with a note on the box, asserting the answer names both the note and the branch it is behind
- the test reddens first against whatComesNext as it stands, which returns theNotesLeft with no notice

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

