---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: archive list keeps tags
# where the token stands. The process owns these values.
status: open
---

## detail

A finding on wk-808abd40a4, archive without a ref.

The change makes the list the archive and gives writeArchiveRows in src/engine/archive.go a fold: a row that names a tag and no blob is given the blob its tag holds. The fold only runs when a box that has the tags writes the list, and nobody has run it.

doc/work/archive.jsonl as origin/v4 carries it today holds 69 rows, and every one of them names tag and nothing else. Measured with jq over the file: 69 rows, 0 with a blob, 69 with a tag. origin holds 123 tags under refs/tags/archive/ and this box holds 69 of them, so the ones on the branch still read here and in any clone that took the tags.

They do not read in a clone made with --no-tags or a filter, which is the failure the token was written about, and the list that travels is the one thing that was supposed to stop depending on a ref.

git rev-parse refs/tags/archive/wk-0086ed9e9b:wk-0086ed9e9b.md answers 024ca2283f4a5de05223cf66ebd7154d5fa6be2e, so the fold has everything it needs.

## done when

- se archive --sweep is run on a box holding the archive tags and the folded list is committed, so every row in doc/work/archive.jsonl names a blob or an on_branch
- a check under util/checks refuses a row in doc/work/archive.jsonl that names only a tag

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

