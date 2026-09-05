---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: the sweep fails soft
# where the token stands. The process owns these values.
status: open
claimed_by: aeaf7bd9/main
claimed_at: "2026-09-05T15:41:02Z"
# tokens that have to close before this can start
depends_on:
  - "[[wk-808abd40a4]]"
  - "[[wk-162f92b1a2]]"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 00cfd63f22937050d582adfb4e62e34c1d33db2b
---

## detail

Tidying up is spread across places and some of it can only run on a desk. A cloud box cannot delete a ref, cannot push a tag, and cannot remove the branches a probe left behind. Today that means a cloud box leaves things and nobody knows what is owed. It also means a desk waits for a retro to tidy what it could have tidied at once. se archive --sweep exists and archives every token that has already closed. It is the right shape and the wrong scope: it is one job, and there are several, and it does not say what it could not do.

## proposed action

One verb, se tidy, with three parts. Every part runs whatever the one before it managed.

    // TidyPart is one job, and what it managed.
    type TidyPart struct {
        Name  string `json:"name"`          // archive, claims or refs
        Did   int    `json:"did"`           // things it put right
        Could bool   `json:"could"`         // whether this box can do it
        Why   string `json:"why,omitempty"` // why it did no more
    }

    // Tidy runs every part and never answers an error.
    func Tidy(r Roots) []TidyPart

archive folds closed tokens into git. SweepClosed does that today.
claims drops lapsed claims, from the frontmatter and the ref.
refs deletes branches and snapshots a box left behind.

A part this box cannot run sets Could false and says why.
A cloud box cannot delete a ref, so refs names the 403.
No part sets an exit code, so nothing blocks a caller.
runRetro calls it and carries the parts.

## done when

- se tidy answers three parts named archive, claims and refs, each with did, could and why
- a part that cannot run leaves the rest running and the exit code zero, decided by TestATidyPartThatCannotRunDoesNotStopTheRest against a refusing git stub
- se tidy run twice answers did zero on every part the second time, decided by TestASecondTidyChangesNothing
- se retro answers a tidy field carrying the same three parts, decided by TestARetroTidiesOnStart
- sh util/checks/battery.sh reports no new failure against the run before the change

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | TidyPart and Tidy are written out in the proposed action. A reader can argue with the three part names, with Could as a bool, and with Tidy never answering an error. | 1 type, 1 func |
| [x] | every done-when line is decidable, and names the command where one decides it | Rewritten. Lines one to four name se tidy, se retro or a test. Line five names the battery. | 5 of 5 |
| [x] | the change is small enough to review whole, or it is split first | One new file, one verb, one call from runRetro. The archive part is SweepClosed moved behind it. | 1 verb |
| [x] | the basics it stands on exist, or are minted first | Both tokens this depends on are closed. SweepClosed and lapsed already exist and answer what two parts need. | 2 of 2 closed |

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

