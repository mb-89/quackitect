---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: command guard reads bash
# where the token stands. The process owns these values.
status: done
# the person's own name for a group. It does not move the work
bucket: tests
# who did the work step, so the verdict is never theirs
author: main
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 286bbb69a3ed4892de0aba5fc8763512e1822de2
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - eee1bdcd3345109f6339a41eee31200bf17abb16
---

## detail

The command guard walks a shell command twice with two ideas of quoting, and its rows were written by the hand that wrote the simulation. An apostrophe inside a double-quoted argument opens a span the second pass believes in and bash does not. So a substitution after it is exempt from the write gate. Bash has a backslash state and no row carries a backslash. Three commands with escaped quotes drove past the exception. Consumes wk-d7f53103f0 and wk-df597db237.

## approach

One walk of the command in a quoting state machine taken from bash's manual, with the states named as the manual names them. Both questions, separators and substitutions, are read off that one walk. The test rows derive from the manual, one pair per state. A generator drives the guard's alphabet through bash itself with a did-a-file-appear oracle. The guard must refuse exactly what reached the filesystem and nothing else.

## done when

- one walk answers both questions and the two-pass code is gone: se test --propose TestOneWalkAnswersEveryQuestion
- every state in bash's manual has a row, the backslash state included: se test --propose TestTheRowsFollowTheManual
- the generator against real bash refuses exactly what reached the filesystem: se test --propose TestTheGuardAgreesWithBash

## evidence: a command bash will not parse

an escaped backtick leaves the next one opening a substitution that never closes. Bash answers a syntax error and runs nothing, and the guard refuses it. The guard cannot be right or wrong there. So the generator asks bash -n first, and passes over what will not parse.

## evidence: criterion 1

TestOneWalkAnswersEveryQuestion reads the shipped source. One function answers the pair of readings, and every assignment that takes the pair is a call of it. A second pass would be a second answerer or a second assignment, and either fails here. Four rows then drive commands whose two readings a second parse would disagree about.

## evidence: criterion 2

TestTheRowsFollowTheManual carries one pair per state the manual's Quoting section names: unquoted, the escape character, single quotes, double quotes, and the backslash inside double quotes. Each pair drives a separator and a substitution. The states are counted at the end, so a state with no row fails rather than passing unread.

## evidence: criterion 3

TestTheGuardAgreesWithBash builds six quoting shapes over seven payloads and drives each through bash in a folder of its own. The payload writes a file, and whether it is there is what bash did. The guard must exempt exactly the commands that wrote nothing.

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | The gate reads a command as bash reads it, so an exception it grants is one bash agrees with. |  |
| [x] | what breaks if it is never done, and not only that it stays undone | A substitution behind an apostrophe is exempt, and the gate reads green while the command writes. It leaked four times. |  |
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | It is, in the approach section, written before this hand took the token up. |  |
| [x] | every done-when line is decidable, and names the command where one decides it | All three name se test proposing a test by name. |  |
| [x] | the change is small enough to review whole, or it is split first | — |  |
| [x] | the basics it stands on exist, or are minted first | — |  |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | — |  |
| [x] | the change follows the approach on the token, or the token says why it departed | It does. The walk was already one. The rows come from the manual's Quoting section, and the generator drives bash with the oracle the approach names. |  |
| [x] | se test --on this token answered ok, and what it ran is named | It ran the three tests the criteria name, and three older ones over the same walk. All six green. |  |
| [x] | the note says what changed and why, for a reader who was not here | In the chapters above. |  |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | The guard refuses a command bash will not parse. That is said in the chapter above rather than called a defect. |  |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | reviewing was read and applied | — |  |
| [ ] | every hunk of git diff began..ended was read, and any not read is named |  |  |
| [ ] | every criterion's command was run again, and what it said is named |  |  |
| [ ] | every hunk improves the product, or a finding names the one that does not |  |  |
| [ ] | every finding is a trivial token naming this one, and their ids are here |  |  |

## evidence: the oracle needs the machine's PATH

the first run of the generator agreed with the guard on every row for the wrong reason. The stub's folder was the whole PATH, so touch was not found and bash wrote nothing whatever the command said. The folder is in front of the machine's own PATH now.

## evidence: the reds

the walk was inverted, so a double-quoted substitution read dead, which is the defect this token names. TestTheGuardAgreesWithBash went red on six rows, each saying the guard exempts it and bash wrote a file. TestTheRowsFollowTheManual went red on the double-quoted substitution. The inversion is backed out.

## evidence: what changed

three tests, in src/engine/theguardreadsbash_test.go. No source moved: the one walk was already there, and this token's remaining work was the tests that hold it.

## evidence: what is missing

the three tests the criteria name. None of TestOneWalkAnswersEveryQuestion, TestTheRowsFollowTheManual or TestTheGuardAgreesWithBash is in the tree. So the walk is right and nothing holds it to bash's manual, and nothing drives it against bash itself.

## evidence: what stands already

the one walk is in the tree. theQuotings in hook.go walks the command once and answers both readings off it. It carries a backslash state, and an escaped double quote keeps the span open. gate.go and hook.go both read it, and no second stripper is left in the shipped source. The old two-pass reading is kept in enginexception_test.go as the thing the walk is measured against.

