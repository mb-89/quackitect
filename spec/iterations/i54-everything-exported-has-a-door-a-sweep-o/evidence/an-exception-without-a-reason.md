---
form: an-exception-without-a-reason
by: agent
signed_off: 2026-08-26T15:43:32.851Z
authors: agent
files: null
---

# Evidence form / an-exception-without-a-reason

## current_situation

The departure guard refuses a reasonless line, and that refusal is the only part of this record a person meets directly. Whether it recovers them in one turn had never been watched.

## built

The demonstration was performed against the running lane. Its report is spec/iterations/i54-everything-exported-has-a-door-a-sweep-o/reports/rpt-sty-an-exception-without-a-reason-is-refused.md

RENUMBERED AT THE MERGE, 2026-08-28. `SE-C-150` below is now `SE-C-155`, and its
sibling `SE-C-149` is now `SE-C-154`. i63 shipped both original numbers on trunk
first. The observation stands as it was made; only the number moved.

THE REFUSAL LANDED. A patch appending the bare path deliverable/engine/bases.ts was refused with SE-C-150, naming the file, the line at doors.md:51, the offending path, and a remedy. Nothing was written.

THE REMEDY DID NOT APPLY, and that is the defect this demonstration found. Sent back verbatim it was refused with SE-C-105 for zero occurrences. The guard refuses the write, so the offending line never reaches disk, so a patch anchored to that line matches nothing.

THE FIX SHIPPED IN THE SAME PASS. The guard now asks the rule module where the line actually stands, through unreasonedOnDisk in deliverable/engine/doors.ts, and picks the op accordingly. A line already on disk is replaced in place. One the refused write carried is inserted below the section marker instead, which is the write the author was making. Both shapes of the clause take the same choice.

Three cases in deliverable/tests/doors.test.ts hold it, each asserting the remedy anchors on text the file actually carries. Each fails against the old code.

## follow_up

The marker anchor is shared by every door's section, so a second door would make it name two places. The sibling refusal SE-C-149 already ships the same anchor, so it is a property of the pair rather than something introduced here. It is carried with the four-doors debt.

## anything_else

