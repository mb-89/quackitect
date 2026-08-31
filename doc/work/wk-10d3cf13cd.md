---
id: wk-10d3cf13cd
seq: "70"
type: work
title: the whole set checked
status: aborted
assignee: main
scope: single-step
traced: true
disposition: dropped
reason: "The lesson is written where a drafter reads it: doc/guidance/specifying.md, section \"The command decides the sentence above it\". It is the shape called A SET COVERED BY ONE MEMBER, and the instance it was found on is already fixed: wk-c6247665a3 now carries one command criterion per commit, thirteen of them. Obsolete as a token."
aborted_from: backlogged
minted_by: reviewer4
---

## detail

A criterion whose words cover a set and whose command covers one member of it. wk-c6247665a3's criterion says 'the eleven between them, each by its own short name, so the reader can see that every one was looked at' and runs rg -q 715c0a8b over the field report. A report naming three of the thirteen satisfies every command criterion on the token.

REPRODUCED in .se/scratchpad/reviewer4/field-report-as-the-criteria-allow.md: a nine-line document naming f4a21c0e, 4bfcaf32 and 715c0a8b and saying outright that it did not read the other ten passes all five patterns, and names 3 of 13.

WHAT TO DO: when a criterion is about a set, the command iterates the set and fails on the first miss. The reviewer who found the wrong hash already wrote the loop: for h in <all thirteen>; do rg -q  <report> || exit 1; done.

THE CHECK: that loop, run against the field report, is red today at 0 of 13.

Found on wk-c6247665a3.

