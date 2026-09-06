---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: work view keeps edit
# where the token stands. The process owns these values.
status: open
---

## detail

Finding from the verdict on wk-0086ed9e9b (adapter decides no column).

util/checks/render-check.mjs line 213, "an editable cell", /class="edits"[^>]*data-was=/, goes red on the tree as it stands (se test proposing render-check, 2026-09-05 11:33: FAIL editor: an editable cell, 1 failed). It was green before the change.

Why: the work view, util/views/work.base, orders title, status, process and holder. title opens the note, and refusedByHand in src/engine/field.go now rules status (moved by a pull), process (chosen at minting) and holder (not on the token) as not an edit, so Table.Locked covers every column left and the editor draws no editable cell in the work view. Before the change the editor offered process for editing and the engine refused the edit, so the check passed on a cell that was never really an edit.

The token edited render-check.mjs (the locked-cell line) and its step 2 named four tests, none of them render-check. Criterion 6, the battery reporting no new failure, was not met: the note says the battery is owed.

Two ways to make it true, and one is a decision: either the work view shows a property a person may type (bucket, needs_human, or reason, which refusedByHand lets through), so the page carries an edit again, or the check stops asking the work view for an editable cell and asks a pane answer of its own that leaves a column unlocked, the way adapter-decides-no-column.mjs already does. The first also gives the editor something to edit, which today it has not.

## proposed action

Decide whether the work view should carry an editable column (bucket or needs_human in util/views/work.base order), or point render-check's "an editable cell" at a pane answer that leaves one column unlocked. Then run render-check and the battery.

## done when

- node util/checks/render-check.mjs . answers 0 failed, including editor: an editable cell
- sh util/checks/battery.sh reports no failure that the run before wk-0086ed9e9b did not

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

