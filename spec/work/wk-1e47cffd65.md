---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: copilot leaves the tree
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: level0
---

## detail

RULED 2026-09-08: Copilot is out. No requirement that a harness other than Claude Code be supported still holds.

Deleting the folders does not do it. spec/config/projections.json carries two entries that write them, so the next projection puts them back: copilot instructions, target .github/copilot-instructions.md; and copilot cage, target .copilot/mcp-config.json from src/cage/copilot-mcp.json.

Six further places name Copilot outside the private tree: AGENTS.md, the comment in src/cage/claude-settings.json, the harness column and its paragraph in src/cage/hooks-the-harness-fires.md, src/cage/hosts.json, and src/cage/diagnose.mjs. Two Go tests assert the projection exists and redden the moment the entries go, which sets the order rather than following it.

Four work tokens name Copilot and are read before anything is deleted: wk-286ed8482b, wk-a6456a604e, wk-c9a5313381, wk-f60b47a1c9.

## approach

One change, in this order: the two projection entries and the two Go tests together, then src/cage/copilot-mcp.json, then the two projected files and .copilot/, then the six prose references. The four tokens are triaged in the same change, each closed with a disposition or left open with a reason.

.github/ holds nothing else. Whether it stays for later CI is the owner's, and this token does not decide it.

## done when

- no file outside .se and _to_delete names copilot: a search from the root that answers nothing
- the projection writes nothing named copilot: `se --project` on a clean tree leaves .github and .copilot absent
- the tree is sound after the removal: `sh util/checks/battery.sh` is green, the cage-cites check included
- each of the four tokens is closed with a disposition or carries a reason for staying open: their frontmatter

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | a second harness stops constraining the cage, the measurement table and the projection set, so Level 0 is designed for one reader | the ruling in the detail |
| [x] | what breaks if it is never done, and not only that it stays undone | every future cage decision keeps paying for a harness nobody drives, and the table keeps a column that can never be filled | src/cage/hooks-the-harness-fires.md names copilot as registered no hooks |
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | the approach fixes the order the two Go tests force | the approach section |
| [x] | every done-when line is decidable, and names the command where one decides it | each line names a search, a command or a field | the done when section |
| [x] | the change is small enough to review whole, or it is split first | one removal across named files, with the token triage inside it | the approach section |
| [x] | the basics it stands on exist, or are minted first | projections.json, the battery and the four tokens all exist | spec/config/projections.json |

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

<!-- read every hunk, run every criterion, and say whether each part improves the product -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | [[reviewing]] was read and applied | — |  |
| [ ] | every hunk of git diff began..ended was read, and any not read is named |  |  |
| [ ] | every criterion's command was run again, and what it said is named |  |  |
| [ ] | every hunk improves the product, or a finding names the one that does not |  |  |
| [ ] | every finding is a trivial token naming this one, and their ids are here |  |  |
