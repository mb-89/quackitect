---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: doc mirrors spec
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: archive
---

## detail

`doc` and `spec` hold the same tree. `ls doc/work spec/work | wc -l` answers how far the copy goes, and `diff -rq doc/work spec/work` answers whether the two have drifted.

Commit 5962121 made doc into spec and left doc standing.

Two copies of every rule is what voice rule 11 calls a defect, and the copies drift. `doc/guidance/voice.md` line 26 links `doc/guidance/stakeholders` where the spec copy links `spec/guidance/stakeholders`, so a reader following either reaches nothing by a different route.

Every count over the tree also doubles. A search for a sentence answers twice, and a check counting files counts each one twice.

`.gitignore` names `!doc/work/archive.jsonl`, so the archive rule points at the old tree too.

## done when

- `doc` is gone from the tree, decided by `ls doc` answering nothing
- no file names a path under `doc/`, decided by `se find --regex 'doc/(work|guidance|rationale|spec)'` answering nothing outside a commit message
- the archive still travels, decided by reading `.gitignore` for the rule that carries it
- the battery reports no new failure, decided by `util/checks/battery.sh`

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

