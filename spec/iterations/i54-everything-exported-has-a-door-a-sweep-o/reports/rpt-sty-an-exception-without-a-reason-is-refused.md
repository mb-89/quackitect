---
kind: report
story: sty-an-exception-without-a-reason-is-refused
spec: tsp-the-door-rule-refuses-and-reports
performed: 2026-08-26
performed_by: agent
---

# Demonstration — an exception without a reason is refused

## What was demonstrated

A write that adds a departure carrying no reason is refused, and the refusal
names the file, the line and the repair.

## Why this one is performed rather than asserted

The story is about what a person MEETS when they try to bypass a rule. So the
demonstration is the attempt and the answer that comes back, including whether
the remedy it hands over actually applies.

## The attempt

A patch appending one bare path to the departure list:

    - deliverable/engine/bases.ts

## What came back

    clause: SE-C-150
    expected: every departure to carry the reason it stands on, after the path
              and a dash
    got: deliverable/machines/doors.md:51 names deliverable/engine/bases.ts —
         1 departure(s) under keeping-a-record-on-disk state no reason
    remedy: se_file_patch, replacing `- deliverable/engine/bases.ts\n` with the
            same line carrying a reason
    note: the reason is what a reviewer reads to decide whether the departure
          still holds, so a bare path buys nothing and is refused rather than
          ignored

FOUR THINGS ARE NAMED. The clause, what was expected, the file and line, and an
executable remedy. Nothing was written.

## The defect this demonstration found

THE REMEDY DID NOT APPLY. Sent back verbatim, it was refused:

    clause: SE-C-105
    expected: old_string to occur in deliverable/machines/doors.md
    got: 0 occurrences (op 1/1) — nothing was written

THE CAUSE IS THE REFUSAL DOING ITS JOB, AND THAT IS NOT AN EXCUSE. It refuses the write, so the offending
line never reaches disk, so a patch anchored to that line matches nothing. The
remedy was aimed at a file state the refusal itself had prevented.

THAT MATTERS BECAUSE THE WHOLE REFUSAL CONTRACT RESTS ON IT. `guidance/refusals.md`
promises that following the remedy recovers in one turn. Here it could not, in
the commonest case there is: an author adding a departure and forgetting the
reason.

## What was changed

THE GUARD NOW AIMS THE OP AT WHERE THE LINE ACTUALLY IS, and the rule module
answers that question.

- ON DISK — an author dropped the reason from a line already declared — the line
  is replaced in place, anchored to the whole line including its newline.
- NOT ON DISK — the refused write is what carried it — the line is inserted
  below the section's marker instead, which is the write the author was making.

`unreasonedOnDisk` in `deliverable/engine/doors.ts` answers both from one read.
The guard still opens no file of its own.

BOTH SHAPES OF THE CLAUSE GOT THE FIX. A bullet the parser cannot read at all
had the same hole, and now takes the same choice.

## What holds it

Three cases in `deliverable/tests/doors.test.ts`, each asserting that the remedy
anchors on text the file actually carries:

- a bare line the refused write carried
- a bare line already standing on disk
- an unreadable bullet the refused write carried

TWO OF THE THREE FAIL AGAINST THE OLD CODE. The third pins the branch that did
NOT change, so a later edit cannot quietly collapse the two branches into one.
Saying all three failed would overstate what the cases prove, and a reviewer
caught that claim in the first draft of this report.

## What the demonstration does not show

WHETHER THE REASONS COLLECTED ARE GOOD. The rule demands a reason, never a good
one. Judging quality is a reviewer's job, and
`raid-asm-an-author-refused-at-write-time-states-a-usable-reason` carries the
sweep that would falsify it.

THE AMBIGUITY A SECOND DOOR WOULD BRING. The marker text is shared by every
door's section, so with two doors the marker anchor names two places. One door
exists today. The sibling refusal already ships the same anchor, so this is a
property of the pair rather than something introduced here.
