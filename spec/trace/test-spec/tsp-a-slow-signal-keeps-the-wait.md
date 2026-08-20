---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: tsp-a-slow-signal-keeps-the-wait
type: "[[test-spec]]"
statement: Showing that an operation is slow leaves a person no less willing to wait than showing nothing would have.
method: demonstration
verifies:
  - req-a-slowness-signal-never-shortens-the-wait
files:
  - none — the procedure is the whole definition, because the pass is what a person does rather than what a program returns
---

## Scope

One slow operation, shown two ways to two groups of people, with a watcher
recording what each group does.

WHY DEMONSTRATION AND NOT TEST. The pass line is a person's willingness to keep
waiting. A program can assert that a signal was emitted, its timing and its
size. Nothing a program can assert says whether the person stayed.

## Approach

OBSERVED, SIDE BY SIDE, WITHOUT INSTRUMENTED CAPTURE. The comparison is the
whole method: a signal is only harmful relative to the silence it replaced, so
one group seeing nothing is not a control to be skipped.

THIS PROCEDURE HAS NOT BEEN RUN AND NOBODY HAS SCHEDULED IT. That is recorded
here rather than left as a blank, and it is why
req-a-slowness-signal-never-shortens-the-wait is graded `should` rather than
`must` — a must whose pass line has never executed would gate M4's candidates
on evidence that does not exist.

## Procedure

1. Pick one operation that reliably passes its bound. Today's log offers
   several: 184 of 730 pulls passed five seconds and 15 passed thirty.
2. Prepare two builds of the same surface. One shows the running signal the
   build produced. The other shows nothing, as the product does now.
3. Put people in front of each, without telling either group what is being
   compared. The watcher records one thing per person: did they wait for the
   operation to finish, or leave.
   PASS: no more people leave with the signal shown than with nothing shown.
4. Ask the ones who left what made them leave. Record the answers verbatim.
   This is not the pass line. It is what tells the owner WHICH property of the
   signal did the damage, and without it a fail says only that something was
   wrong.

## The finding this exists to catch

THE PRIOR-ART SCAN AT gate-motivation ARGUED AGAINST OUR OWN RULING. A 2010
University of Michigan study is reported to have found that the slow-to-fast
progress bar — the most technically honest representation of actual progress —
produced the HIGHEST abandonment, at 21.8 percent. PRIMARY NOT SEEN: that is a
secondary write-up and the study was not read.

SO THE FAILURE THIS PROCEDURE LOOKS FOR IS A SIGNAL THAT IS ACCURATE AND
DISCOURAGING. It is invisible to every mechanical check, because every
mechanical check can only ask whether the telling happened.

raid-risk-an-accurate-progress-signal-can-drive-abandonment holds the same
question and names the owner, because what a person feels while waiting is a
judgment no agent can make for them.
