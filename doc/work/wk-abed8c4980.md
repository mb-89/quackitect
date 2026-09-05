---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: restore wiped evidence kest
# where the token stands. The process owns these values.
status: open
claimed_by: 547b9365/worker-linden
claimed_at: "2026-09-05T21:08:29Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - fa50394612e2834edbfbac555f6c13e0d6a1f522
---

## detail

Submitting through the resident engine destroys the evidence tables on the token being submitted. src/engine/pull.go submit does t.Submission = p.Evidence: the gate reads the tables off the file to decide the move, then the payload's map replaces them. A se_pull carrying no evidence carries nil, so the file is written back with every table gone and the frontmatter perfectly current. Fixed in source by another worker, but the resident binary is stale, so the wipe is live.

Three tokens closed by worker-kest tonight went through that path: wk-ab9b2b6b1e, wk-5d6e638e96 and wk-f9233114b0. Their answered checklists have to go back, verbatim, not rewritten from memory. The text is recoverable from each token's ended snapshot. The answers as submitted were echoed back by the engine on the pull before the closing one.

This token restores those three files only. It changes no engine source: the fix for the wipe itself is not here.

## done when

- each of the three token files carries its step 1 and step 2 evidence sections again. The ticks and sentences are the same ones that were submitted. se find --regex '^## evidence' --path .se/work/*
- no tick is added that was not submitted, and the two honestly unticked lines on wk-ab9b2b6b1e and wk-5d6e638e96 stay unticked

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
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

