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
status: done
# who did the work step, so the verdict is never theirs
author: worker-linden
claimed_by: 547b9365/worker-linden
claimed_at: "2026-09-05T21:12:40Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 461d9ebec3590357b66451a89aa762c805851da6
  - c7c86835e96cc001637e44e729584bb9862aabd1
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 37de5ac7a6e2cf784c6aca0c261575fa86e5a0e8
  - 32b987f47f3d54586f2898ec8eb1823b17402dc3
---

## detail

A claim is written on the token as claimed_by and claimed_at, and no view shows it. claimed_by appears nowhere in src/engine/view.go or in the viewer, so the work editor has no claim column and nothing to filter on.

So a person cannot see what this box has taken, or what another box has taken, except by running se claim --list at a prompt.

That matters the moment a second box works this tree. The claim is the only thing standing between two boxes and the same token, and it is the one field the surface does not draw.

The view already answers its columns, their names, their widths and which cell opens something. So this is a column the view can already carry, not a new mechanism.

## proposed action

Give the view a claim column, and let the heading-line filter narrow on it.

## done when

- se query --view work names claimed_by among its columns
- the panel draws a claim column, and the panel check drives it
- a token claimed by another box is drawn as claimed by that box, not as blank
- the filter narrows rows on the claim, proved by the check that drives the panel

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | Written before the first line changed: one property off ClaimedNow, one column in the view, and what drives each. | approach |
| [x] | every done-when line is decidable, and names the command where one decides it | Four lines, four runs. The query verb for the column, the Go test for the row, and drive-editor for the heading and the filter. | 4 runs |
| [x] | the change is small enough to review whole, or it is split first | Four files: the row, the view, one test, and two drives in the editor's check. | 4 files |
| [x] | the basics it stands on exist, or are minted first | ClaimedNow, the store of other boxes' claims and the property inventory all exist, so nothing was minted. | ClaimedNow |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | work-token read. Rule 12 is why each drive was watched red for its own reason. | rule 12 |
| [x] | the change follows the approach on the token, or the token says why it departed | It does: one property, one column, no decision under src/extension. | query.go |
| [x] | se test --on this token answered ok, and what it ran is named | Not run here: the change is in a worktree over origin/v4. There the engine suite answers the seven failures it answers without it, and drive-editor and drive-panel answer 0 failed. | 7 known |
| [x] | the note says what changed and why, for a reader who was not here | It says what draws now, where the value comes from, and what drives it. | note |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | Nothing was revealed. The adapter needed no change, which is what its own rule holds it to. | none |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | [[reviewing]] was read and applied | — |  |
| [ ] | every hunk of git diff began..ended was read, and any not read is named |  |  |
| [ ] | every criterion's command was run again, and what it said is named |  |  |
| [ ] | every hunk improves the product, or a finding names the one that does not |  |  |
| [ ] | every finding is a trivial token naming this one, and their ids are here |  |  |

## approach

The row gains one property, `claimed_by`, in src/engine/query.go, where a token becomes a row. Its value is the standing claim, `ClaimedNow`, so a claim another box wrote draws as that box's and a lapsed one draws as nothing. Who claims what is already the engine's answer, and nothing new is worked out here.

util/views/work.base puts `claimed_by` in the left view's order with a width. The work editor then draws the column, and its filter and sort popovers offer the property with every other column.

Nothing under src/extension decides anything about it. The adapter takes its columns from the engine's answer, which is the rule adapter-decides-no-column already holds it to.

Three things are driven. A Go test renders three tokens as rows: one claimed here, one claimed by another box, one claimed by nobody. drive-editor asserts the headings carry the claim and that a filter condition on it is sent. The query verb over this tree names the column.

## note

A claim is written on the token, and no view drew it. A person could see what this box had taken, or what another box had, only at a prompt.

The row carries `claimed_by` now, from the standing claim rather than from the field. A claim another box published draws as that box's, and a lapsed one draws as nothing. work.base puts the column in the left view with a width. The editor's filter offers the property with every other one, because the inventory is read off the rows rather than off the columns.

Nothing under src/extension decides anything about it.

A Go test renders three tokens: claimed here, claimed elsewhere, claimed by nobody. drive-editor drives the heading and a filter condition on the claim, and each was watched red for its own reason.

## approach

claimed_by joins the columns the view already answers, beside title, status, process and holder. The view file says whether it is drawn, so a person who does not want it can take it out.

The panel draws it the way it draws the others, from what the view answers rather than from a list of its own.

A claim from another box is drawn as that box. Blank means unclaimed, and those are two different facts that must not look the same.

The filter narrows on it through whatever reads the filter, which is wk-aae03d4767 and is not decided here.

