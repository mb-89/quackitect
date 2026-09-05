---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: cancel tests cannot vanish
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: worker-holly
claimed_by: 547b9365/worker-holly
claimed_at: "2026-09-05T20:25:57Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - ae315b4f35065c9907e38d516d82329e53724d64
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 60b1f95b430bb110a80e1e7b7ea1dc3f99249760
# how it ended. Only an ended token carries one.
disposition: done
# why it was dropped
reason: "The shape is written down under rule 3 of doc/guidance/work-token.md, where a criterion-writer is already looking. It reads the engine's unreached rather than ok alone, because ok stays true when a proposal reaches nothing. Run both ways from the root: exit 0 on a name the tree carries, exit 1 on the same name renamed. Landed on origin/v4 as 6f4b48fdef9bfde31a81ea0162101d4a229fe6ab. The done-when lines already written this way are still quiet, and the note says so under what is left."
---

## detail

A FINDING ON THE VERDICT OF wk-30821724fc. It is not a child of that token, which closes on its verdict.

The first done-when line of wk-30821724fc reads: a cancelled context ends a git call and a probe, decided by go test -C src/engine -run 'ACancelledContextEndsAGitCall|ACancelledContextEndsTheProbe' ./... answers ok.

go test answers ok and exits 0 when no test matches the pattern. Measured on this box at 674ac0e4, a tree that carries neither test: the command answered "ok quackitect/engine 3.551s [no tests to run]", exit 0. So the command is green on a tree where the thing it decides does not exist, and a rename or a delete of either test leaves the criterion answering ok for ever.

This is the class work-token names in Red first: a check that will not go red is the finding. It reaches every done-when line in the tree written as go test -run over a name, not this token alone.

## proposed action

Decide the shape once and write it where done-when lines are written. Either the command counts what ran, as in go test -run ... -v and a grep for two PASS lines, or the engine's test answer names the tests it ran and the criterion reads that. Then say so in the guidance on writing a criterion, so the next one is written that way rather than found by a reviewer.

## done when

- the shape a done-when line uses to name a go test is written down in doc/guidance, decided by reading the file it lands in
- the written shape answers not-ok on a tree where the named test does not exist, decided by running it against a tree with the test renamed

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | One file. A sentence on rule 3, and a section under the discussion of rule 3. 20 insertions, one deletion. | commit 6f4b48fd |
| [x] | every done-when line is decidable, and names the command where one decides it | Line 1 is decided by reading doc/guidance/work-token.md. Line 2 is decided by running the shape twice, and both runs are written down. | the two runs |
| [x] | the basics it stands on exist, or are minted first | Nothing to mint. se test already answers unreached, and jq is on this box. | se test answer |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Rules 3, 7 and 11. It is guidance rather than a check because the ask is how a line is written. | work-token.md |
| [x] | one test was written first and seen red for the reason expected | The change is prose, so the red is the shape's own. Against a name nothing carries: false, exit 1. | the two runs |
| [x] | the same test was seen green after the change, and named | The same shape against a name the tree carries: true, exit 0. The prose also passed the voice check. | the two runs |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | Not in this tree, which is 339 commits behind v4. Landed on v4 as 6f4b48fd. | where it was done |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | Neither, and it is real. | what is left |

## evidence: the two runs

Both from the root, against the engine over this tree.

A name the tree carries: `./RUNME.sh test --on wk-a1a48c7eff --propose TestTheDeltaIsTheTokensOwn | jq -e '.ok and ((.unreached // []) | length == 0)'` answered true, exit 0.

The same name with a letter added, which is what a rename leaves behind: the same command answered false, exit 1.

The engine's plan answer shows why ok alone will not do. For the name nothing carries it read `{"ok":true,"unreached":["..."]}`. ok is true and the test does not exist, so the criterion has to read unreached.

The prose was run through the engine's own voice check before it landed. A deliberate 26-word sentence was refused on the same path, so the check was live for it.

## evidence: what is left

This token asked that the shape be written down, and it is. It did not ask that the lines already written be fixed.

The detail says the class reaches every done-when line written as go test -run over a name. Those lines are still green on trees where their tests do not exist. Rule 7 says a standing rule belongs in a check, so a check over done-when lines would be the durable answer.

Neither is this token's ask, and neither was done here. A person deciding what to mint next should know they are open.

## evidence: where it was done

This clone is 339 commits behind origin/v4, and its own work-token.md is behind v4's. The sentence was added to v4's copy, on a fresh worktree, and pushed as 6f4b48fd.

