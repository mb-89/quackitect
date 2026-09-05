---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: notes become tracked tokens
# where the token stands. The process owns these values.
status: open
claimed_by: aeaf7bd9/fable-cloud
claimed_at: "2026-09-05T13:07:50Z"
# true when this goes out before everything else workable
urgent: true
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 3b1c1f1f1723f560e6839659e877976250178461
  - 2346e38d83314e5910c653118fd44bdf7754e3b4
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - ff2d2e17a6e4b38784a687790b4a5c6d61cdf9ce
---

## detail

A note is private and a cloud box is temporary, so every note written here dies with the box. The owner asked for a rule that empties them into git before that happens.

THE OWNER'S WORDS. Every note you write is not tracked and will not survive, so make sure you do not lose any notes. When that variable is on and there are twenty notes or more, the engine gives you these notes. You judge them and either make work tokens out of them, or drop them if they are useless. And where you cannot decide one, make your best attempt, make a tracked token, and flag it needs_human, so it still goes into git and you cannot work on it.

The condition is the cloud box, which the engine knows from its own environment, and the count is twenty.

The judgement is the agent's, and there are three answers. Useless, and it is dropped. Clear, and it is a tracked token. Undecidable, and it is a tracked token carrying the best attempt, marked needs_human.

The engine hands the notes over rather than converting them, because which of the three an note is is a reading nothing but an agent can do.

## proposed action

On a cloud box, hold the agent at twenty notes the way the staffing guard holds it, hand it every note, and let it through when each one is a tracked token or is gone.

## done when

- on a cloud box with twenty notes, a work call is refused and the refusal carries every note id and title
- the same tree with nineteen notes refuses nothing
- a desk with twenty notes refuses nothing, proved by the same test with the variable unset
- a note that became a tracked token no longer counts, so clearing them lets the agent through
- a Go test in src/engine drives all four

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

