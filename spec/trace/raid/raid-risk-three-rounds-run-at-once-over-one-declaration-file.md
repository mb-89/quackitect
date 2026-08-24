---
minted_in: i60-the-walk-gets-fast-and-it-is-measurable-
id: raid-risk-three-rounds-run-at-once-over-one-declaration-file
type: "[[raid]]"
kind: risk
statement: "Three rounds run at the same time on three hands, and one file is reachable by two of them, so a landing can silently drop the other's work."
owner: the owner, who assigns the hands
trigger: the second of the two siblings preparing to land anything that touches the file where tools are declared
status: open
impact: "A dropped description reads as an oversight rather than a merge fault, so nobody looks for the rest of what went with it."
breaks_how_badly: abrasive
how_likely: plausible
---

## Why it stands

THE SPLIT WAS MADE BY MODULE on purpose, so that three hands could work at once
without meeting. It very nearly holds: this round shares nothing with either
sibling.

ONE FILE IS THE EXCEPTION. One sibling rewrites the descriptions declared there.
The other may register a verb in the same file.

## Why it is a risk rather than a certainty

THEY ARE DIFFERENT REGIONS OF THE FILE. Descriptions and registrations do not
sit on the same lines, so an ordinary merge should carry both.

WHAT MAKES IT A RISK ANYWAY. The file is large and one of the two rewrites most
of its prose. A hand that opened it before the other landed, and writes back
what it holds, replaces the other's work without any conflict being reported.

## The mitigation, and it is already written down

THE RULE IS RECORDED IN ALL THREE RECORDS: whoever lands second re-reads the
file and applies onto what the first left, rather than writing back a copy
taken earlier.

WHY THAT IS ENOUGH FOR NOW. It is the same discipline the lane already enforces
for any write, where a stale hash refuses. The exposure is the case where a
hand works outside that discipline.

## What would raise it

A THIRD ROUND REACHING THE SAME FILE. Two is manageable with a rule. Three is
where a rule stops being enough and something mechanical is owed.
