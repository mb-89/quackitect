---
id: wk-cae83b6e63
seq: 1000017
type: work
title: a reviewer repairs trivia
status: spec_submitted
assignee: main
scope: single-step
traced: true
minted_by: person
---

## detail

THE OWNER'S WORDS: small stuff like this should not force a new round. We need a no nitpick rule. If it is not breaking anything, if it does not touch the functionality, then just fix it and tell the agent what you fixed. I do not see why this warrants a review round. MEASURED, AND IT IS WHY THIS EXISTS. wk-2b78b911b1 was rejected for a round because a recorded observation cited drain_test.go:201 where the assertion is at 241. The line number changes no behaviour, breaks nothing, and would have taken one edit. That round is one of the 106 rejections behind a review failure rate of 174 per cent over 61 tokens. THE SHAPE THAT MAY WORK, and it wants agreeing before it is built. A reviewer that finds something which changes no behaviour and can be repaired in one edit repairs it, records the repair on the token, and does not open a round for it. A round is for something that would ship wrong. WHERE THE LINE SITS IS THE HARD PART, because one reviewer's trivial is another's silent defect, and a reviewer that starts editing the work it is judging stops being a second pair of eyes. THE NARROW VERSION, WHICH IS WHAT I WOULD BUILD. A reviewer may repair only what it can prove changes nothing that runs: a stale line number in a recorded observation, a citation that has moved, a count in prose that recounts differently, a wording slip. Never a criterion, never a command, never code, never a detail's claim. Every repair is written on the token in its own section so the owner can see what the reviewer changed rather than only what it refused. AND THE ENGINE CAN HOLD THE LINE. A repair section is a field, so the engine can refuse a repair that touches a criterion, and a rule the engine refuses is a rule that holds where a rule a reviewer remembers is not. WHAT IS UNCERTAIN. Whether a repaired token still counts as a pass for the failure rate, and I think it should, because the round it saved is the point. And whether a reviewer that repairs three things on one token should be made to say so louder than one that repairs none.

THE OWNER AGREED THE SHAPE AND ASKED FOR IT NOW RATHER THAN IN THE BACKLOG.
Their words: I feel like nitpicks should just be fixed, do not put it in the
backlog, put that in a thing you are doing right now, I think the shape you
described is correct. And on the cost: reviewers that fix stuff is bad
separation of concerns, but it is better than him telling you what to do, and
then you coming around, and then he finding new stuff.

WHAT A REPAIR IS. A change the reviewer makes to the note it is judging, which
it can show changes nothing that runs. It is recorded on the token in its own
section, with what it changed and why that changes nothing, and it does not open
a round.

WHAT MAY BE REPAIRED. A stale line number in a recorded observation. A citation
that has moved. A count in prose that recounts differently. A wording slip. All
four are claims about the record rather than instructions to a worker.

WHAT MAY NOT, AND THE ENGINE HOLDS THIS RATHER THAN THE REVIEWER REMEMBERING IT.
A criterion, a command, a detail's claim, and any file under src or util. Those
are the work, and a reviewer that edits the work stops being a second pair of
eyes. A repair naming a path outside doc/work is refused, which is a rule a
program can apply and a rule a tired reviewer cannot forget.

THE FIRST THING THE RULE WILL BE USED ON is already standing.
TestEveryRedSaidResolves, written this session on wk-2b78b911b1, requires every
recorded observation to name a line where an assertion stands, so an edit above
that line turns it red with nothing wrong. Taking the line out of the check and
making it find the assertion by its words is the repair, and wk-42adef4818
carries it.

MEASURED, AND IT IS WHY THIS EXISTS. wk-2b78b911b1 lost a round to a recorded
observation citing drain_test.go:201 where the assertion is at 241. That number
changed no behaviour and would have taken one edit. It is one of 106 rejections
across 61 reviewed tokens, a review failure rate of 174 per cent.

## done when

- A verdict carries repairs, each one saying what it changed, where, and why that changes nothing that runs, and the engine writes each to the note in its own section so a reader sees what the reviewer changed and not only what it refused
  `rg -q func.ARepairIsRecordedOnTheToken src/engine && go test -C src/engine -count=1 -run TestARepairIsRecordedOnTheToken$ .`
- A repair naming anything outside doc/work is refused, and the refusal names the path and says a reviewer repairs the record and not the work. THE ENGINE HOLDS THE LINE, because a rule a reviewer has to remember is a rule that lasts until the round somebody is tired
  `rg -q func.TestARepairOutsideTheRecordIsRefused src/engine && go test -C src/engine -count=1 -run TestARepairOutsideTheRecordIsRefused$ .`
- That refusal is asserted on what only it can say, because it stands beside the refusals for a missing finding, a missing lesson and a lesson naming no token, and a case asking only whether the call was refused passes with any of them deleted
  `rg -q func.TestARepairOutsideTheRecordIsRefused src/engine && go test -C src/engine -count=1 -run TestARepairOutsideTheRecordIsRefused$ .`
- A verdict of accept may carry repairs, so a reviewer that found nothing worth a round can still say what it tidied, and an acceptance with repairs is an acceptance rather than a rejection
  `rg -q func.TestAnAcceptanceMayCarryRepairs src/engine && go test -C src/engine -count=1 -run TestAnAcceptanceMayCarryRepairs$ .`
- The repair field is in the shape table on wk-24be1c06ae, so the reflective walk over the record answers for it rather than going red on a field nobody classified
  `rg -q Repair doc/work/wk-24be1c06ae.md`
- The method says what may be repaired and what must be a round, in doc/guidance/reviewing.md under a section of its own, and the check reads that section rather than the whole file
  `rg -q func.TestTheReviewMethodSaysWhatMayBeRepaired src/engine && go test -C src/engine -count=1 -run TestTheReviewMethodSaysWhatMayBeRepaired$ .`
- It carries the measurement it came from rather than the claim alone: the round wk-2b78b911b1 lost to a line number, and that 61 tokens have reached a review with 106 rejections across them
  `rg -q func.TestTheRepairRuleCarriesItsMeasurement src/engine && go test -C src/engine -count=1 -run TestTheRepairRuleCarriesItsMeasurement$ .`
- Every test named above was watched failing on its own assertion, with the change absent, before it was watched passing. For the refusal the change taken away is the refusal itself, deleted on its own with the others left standing. The evidence names the test and what it said rather than a line number, because a line moves and the message does not

