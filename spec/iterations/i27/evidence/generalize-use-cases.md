---
form: generalize-use-cases
by: agent
signed_off: 2026-08-13T19:19:46.768Z
authors: agent
files: null
---

# Evidence form / generalize-use-cases

## current_situation

write-stories is signed. The use cases are RESIDENT and this iteration generalizes nothing new, so the field carries the whole standing set of 36.

WHY ALL 36 RATHER THAN THE RELEVANT ONES. Coverage runs story by story over every resident story, not over the ones this change touches. An inherit iteration therefore lists the set to say the set still stands.

TWO ARE ALTERED BY THIS CHANGE, and they are the two that name its problems directly. uc-change-the-method-mid-walk IS problem (b). uc-claim-an-iteration is where problem (a) bites - its claim keeps two agents off one record, and nothing in it keeps two records off one tree.

## use_cases

- project/spec/trace/use-case/uc-adjudicate-a-gate.md
- project/spec/trace/use-case/uc-answer-a-question-with-tests.md
- project/spec/trace/use-case/uc-be-handed-the-method.md
- project/spec/trace/use-case/uc-begin-a-product.md
- project/spec/trace/use-case/uc-browse-the-archive.md
- project/spec/trace/use-case/uc-capture-a-stray.md
- project/spec/trace/use-case/uc-change-the-method-mid-walk.md
- project/spec/trace/use-case/uc-claim-an-iteration.md
- project/spec/trace/use-case/uc-close-a-record.md
- project/spec/trace/use-case/uc-diverge-before-deciding.md
- project/spec/trace/use-case/uc-drain-the-inbox.md
- project/spec/trace/use-case/uc-find-the-right-lane-tool.md
- project/spec/trace/use-case/uc-get-work-routed.md
- project/spec/trace/use-case/uc-install-quackitect.md
- project/spec/trace/use-case/uc-land-work-on-trunk.md
- project/spec/trace/use-case/uc-learn-the-machinery.md
- project/spec/trace/use-case/uc-let-the-system-catch-up.md
- project/spec/trace/use-case/uc-open-an-iteration.md
- project/spec/trace/use-case/uc-quality-compatibility.md
- project/spec/trace/use-case/uc-quality-flexibility.md
- project/spec/trace/use-case/uc-quality-functional-suitability.md
- project/spec/trace/use-case/uc-quality-interaction-capability.md
- project/spec/trace/use-case/uc-quality-maintainability.md
- project/spec/trace/use-case/uc-quality-performance-efficiency.md
- project/spec/trace/use-case/uc-quality-reliability.md
- project/spec/trace/use-case/uc-quality-safety.md
- project/spec/trace/use-case/uc-quality-security.md
- project/spec/trace/use-case/uc-research-and-record-an-answer.md
- project/spec/trace/use-case/uc-resume-after-an-absence.md
- project/spec/trace/use-case/uc-set-the-autonomy.md
- project/spec/trace/use-case/uc-shape-the-view.md
- project/spec/trace/use-case/uc-take-a-step.md
- project/spec/trace/use-case/uc-trace-a-decision-to-its-origin.md
- project/spec/trace/use-case/uc-vendor-and-overlay.md
- project/spec/trace/use-case/uc-view-notes-as-a-table.md
- project/spec/trace/use-case/uc-watch-the-walk-live.md

## follow_up

gate-inputs joins on this state alone, so it activates as soon as this signs.

WHAT THE GATE INHERITS. A context redrawn as a pointer with one sharpened relationship. Four roles with re-checked dispositions. Eight covering stories, two of them altered. Thirty-six use cases, two of them altered.

THE TWO ALTERED USE CASES ARE THE PACKET'S SPINE, and requirements should source to them rather than to prose.

- uc-change-the-method-mid-walk IS problem (b). Its steps go through the walk-out; the fan-out replaces them.
- uc-claim-an-iteration IS problem (a) at the point it bites.

FOUR MORE ARE LIKELY TOUCHED AND UNREAD, named so nobody assumes otherwise: uc-browse-the-archive and uc-close-a-record, because the archive starts reading through git and a finished record's worktree is deleted; uc-land-work-on-trunk, because the commit unit becomes the state; uc-open-an-iteration, because entry now levels the tree it binds.

TWO QUALITY USE CASES ARE DIRECTLY RELEVANT AND UNREAD. Interaction-capability, because responsiveness lives there and the bless broke the one-second rule today. Reliability, because a silent misroute is a reliability failure rather than a functional one.

write-requirements owes the sweep over all eight, and sources every new row to a use case rather than to a paragraph.

## anything_else

A STRUCTURAL OBSERVATION THAT WILL RECUR AT EVERY INHERIT ITERATION.

This field now lists 36 use cases. This milestone examined two.

The listing is honest - the coverage claim it makes is true, and the check that demanded it is right, because letting an iteration list only what it touched would let a story quietly lose its cover.

BUT THE EVIDENCE READS AS THIRTY-SIX PIECES OF WORK AND IS TWO. A reader counting references gets the wrong picture, and only the prose says which two matter. Prose is where distinctions go to be lost.

THE SHAPE OF A FIX, not built and not filed as a defect: an inherit state marks which references it RE-READ, separately from which it lists for coverage. The check keeps demanding full coverage; the record gains a way to say what was actually looked at.

Worth a retro's attention rather than a change here.
