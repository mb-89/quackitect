---
id: wk-dcb697c1b1
seq: "65"
type: work
title: "learned: literals are derived"
status: aborted
assignee: main
scope: single-step
traced: true
disposition: dropped
reason: "The lesson is written where a drafter reads it: doc/guidance/specifying.md, section \"The command decides the sentence above it\". It is the shape called A LITERAL NOBODY DERIVED. Obsolete as a token."
aborted_from: backlogged
minted_by: reviewer5
---

## detail

CLASS: a criterion greps for a literal that encodes a claim about the tree, and
the literal was never derived by running the command that would establish it.
The check then passes exactly when the deliverable states something false,
because rg proves the string is present and nothing about whether the claim is
true.

FOUND ON wk-c6247665a3. Its third criterion reads "And the oldest of them, so
the range is not guessed at" with `rg -q 1151665a .se/scratchpad/field-report.md`.
The oldest of the thirteen is 4bfcaf32: `git rev-list $(git merge-base HEAD
origin/v4)..origin/v4 | tail -1` answers 4bfcaf32, and its parent 460c56b8 is
the merge base, so nothing in the set is older. 1151665a is the tenth of the
thirteen, and `git rev-list --count 1151665a..f4a21c0e` answers 9, not 13. A
worker who obeys the criterion writes a false range into the field report and
the criterion still goes green.

WHAT TO DO INSTEAD: every literal a criterion asserts - a commit id, a count, a
path, a line number - is produced by running the command that derives it before
the criterion is written, and that command goes in the criterion so the reader
can rerun it. Where the literal can be derived at check time, derive it in the
check instead of pasting it: `rg -q "$(git rev-list $(git merge-base HEAD
origin/v4)..origin/v4 | tail -1 | cut -c1-8)" FILE` goes red when the fact
moves, and a hard-coded id cannot.

THE CHECK, seen red today: `rg -q "$(git rev-list $(git merge-base HEAD
origin/v4)..origin/v4 | tail -1 | cut -c1-8)" doc/work/wk-c6247665a3.md` exits
non-zero now and exits zero once the criterion names 4bfcaf32.

NOT the same class as wk-967b04b877 "criteria about live data", which is about
a one-time assertion written as a standing rule. This one is about a literal
nobody derived.

