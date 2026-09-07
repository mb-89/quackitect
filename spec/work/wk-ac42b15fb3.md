---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: the editor shows claims
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: surface
# what has to be true before this is worth reading again
ready_when: "ready when se test can tell this token's change from the tree around it. Measured in September 2026. The plan for this token answered that nothing in the record says what it wrote, so the delta is the whole diff. That diff is two hundred and eighty-six files from other hands, and the Go package among them does not build in this clone. The step asks for se test on this token to answer ok, and here it cannot."
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 461d9ebec3590357b66451a89aa762c805851da6
  - b76eb2e23751a30cdb5c2c9697806b5dca125a7e
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 37de5ac7a6e2cf784c6aca0c261575fa86e5a0e8
  - 56abcd3b89d3536204d6f8e2d2f5ddbb5d453b55
---

## detail

A claim is written on the token as claimed_by and claimed_at, and no view shows it. claimed_by appears nowhere in src/engine/view.go or in the viewer, so the work editor has no claim column and nothing to filter on.

So a person cannot see what this box has taken, or what another box has taken, except by running se claim --list at a prompt.

That matters the moment a second box works this tree. The claim is the only thing standing between two boxes and the same token, and it is the one field the surface does not draw.

The view already answers its columns, their names, their widths and which cell opens something. So this is a column the view can already carry, not a new mechanism.

## proposed action

Give the view a claim column, and let the heading-line filter narrow on it.

## approach

claimed_by joins the columns the view already answers, beside title, status, process and holder. The view file says whether it is drawn, so a person who does not want it can take it out.

The panel draws it the way it draws the others, from what the view answers rather than from a list of its own.

A claim from another box is drawn as that box. Blank means unclaimed, and those are two different facts that must not look the same.

SO THE CELL IS NOT THE TOKEN'S OWN FIELD. A claim made elsewhere reaches this box through git and sits in the sync's store, with nothing on the note. The row in src/engine/query.go asks ClaimedNow, the way it already asks Blocked, or every far claim draws blank.

The filter narrows on it through whatever reads the filter, which is wk-aae03d4767 and is not decided here.

## done when

- se query --view work names claimed_by among its columns
- the panel draws a claim column, and the panel check drives it
- a token claimed by another box is drawn as claimed by that box, not as blank
- the filter narrows rows on the claim, proved by the check that drives the panel

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | what is gained by doing it, and not only what it does |  |  |
| [ ] | what breaks if it is never done, and not only that it stays undone |  |  |
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

