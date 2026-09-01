---
id: wk-cae83b6e63
seq: 1000017
type: work
title: a reviewer repairs trivia
status: spec_submitted
assignee: main
scope: single-step
traced: true
depends_on:
  - wk-24be1c06ae
rounds: 1
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
  `rg -q func.TestARepairIsRecordedOnTheToken src/engine && go test -C src/engine -count=1 -run TestARepairIsRecordedOnTheToken$ .`
- A repair naming anything outside doc/work is refused, and the refusal names the path and says a reviewer repairs the record and not the work. THE ENGINE HOLDS THE LINE, because a rule a reviewer has to remember is a rule that lasts until the round somebody is tired
  `rg -q func.TestARepairOutsideTheRecordIsRefused src/engine && go test -C src/engine -count=1 -run TestARepairOutsideTheRecordIsRefused$ .`
- That refusal is asserted on what only it can say, and it has a case of its own because it stands beside the refusals for a missing finding, a missing lesson and a lesson naming no token: the case deletes that one refusal with the other three left standing and requires the verdict to come back ACCEPTED rather than merely refused by something else
  `rg -q func.TestOnlyTheRepairRefusalCanSayIt src/engine && go test -C src/engine -count=1 -run TestOnlyTheRepairRefusalCanSayIt$ .`
- A verdict of accept may carry repairs, so a reviewer that found nothing worth a round can still say what it tidied, and an acceptance with repairs is an acceptance rather than a rejection
  `rg -q func.TestAnAcceptanceMayCarryRepairs src/engine && go test -C src/engine -count=1 -run TestAnAcceptanceMayCarryRepairs$ .`
- The method says what may be repaired and what must be a round, in doc/guidance/reviewing.md under a section of its own, and the check reads that section rather than the whole file
  `rg -q func.TestTheReviewMethodSaysWhatMayBeRepaired src/engine && go test -C src/engine -count=1 -run TestTheReviewMethodSaysWhatMayBeRepaired$ .`
- It carries the measurement it came from rather than the claim alone: the round wk-2b78b911b1 lost to a line number, and that 61 tokens have reached a review with 106 rejections across them
  `rg -q func.TestTheRepairRuleCarriesItsMeasurement src/engine && go test -C src/engine -count=1 -run TestTheRepairRuleCarriesItsMeasurement$ .`
- Every test named above was watched failing on its own assertion, with the change absent, before it was watched passing. For the refusal the change taken away is the refusal itself, deleted on its own with the others left standing. The evidence names the test and what it said rather than a line number, because a line moves and the message does not

## finding 1 · round 1 · done when, criterion 1 / runs: rg -q func.ARepairIsRecordedOnTheToken src/engine && go test -C src/engine -count=1 -run TestARepairIsRecordedOnTheToken$ . · by reviewer10

**wrong:** The two halves of criterion 1's command name different symbols, so the guard cannot pass for the test the runner names and the criterion cannot go green by doing the work. It reads rg -q func.ARepairIsRecordedOnTheToken src/engine and then go test with -run TestARepairIsRecordedOnTheToken. The search pattern has no Test in it. I reproduced it rather than reading it: I wrote a file holding nothing but func TestARepairIsRecordedOnTheToken and ran both patterns against it. rg -q func.ARepairIsRecordedOnTheToken exits 1, and rg -q func.TestARepairIsRecordedOnTheToken exits 0. So the worker writes the test the criterion asks for, the guard stays red, and the only ways to close it are to add a second function called ARepairIsRecordedOnTheToken that nothing runs, or to change the command, which a worker may not do. The guard is there for a reason and the reason is why this matters: go test -run on a name that does not exist answers ok and exits zero, which is the red-by-absence case CriteriaThatAlreadyPass in src/engine/spec.go exists to catch, so the search in front of it is the thing making the criterion able to report at all. A guard whose pattern has drifted off the runner's does not fail open here, it fails shut, and either way the two halves are no longer about one thing. Extent, one pass over all seven commands on this list: criterion 1 is the only one missing Test from its search, and criteria 2, 3, 4, 6 and 7 all carry func.Test with the same name in both halves. Criterion 5 is a search with no runner and is a separate finding.

**satisfies:** Write the name once and put the same string in both halves: rg -q func.TestARepairIsRecordedOnTheToken src/engine and then -run TestARepairIsRecordedOnTheToken$. Then check the pair rather than reading it, which is one file: put a file holding only func TestARepairIsRecordedOnTheToken into a scratch directory, run the search half against it alone, and require it to exit zero. A guard that is red with the artefact present is a guard that is not about that artefact. Do that for all seven before this goes out again, because the same pair shape is on every line of this list.

## finding 2 · round 1 · done when, criterion 3: "That refusal is asserted on what only it can say, because it stands beside the refusals for a missing finding, a missing lesson and a lesson naming no token, and a case asking only whether the call was refused passes with any of them deleted" · by reviewer10

**wrong:** Criteria 2 and 3 carry the same command, byte for byte, and their sentences are about different things. I pulled the seven commands off the note and compared them rather than reading down the page: both are rg -q func.TestARepairOutsideTheRecordIsRefused src/engine and then go test on that one name. Criterion 2 says the refusal exists and names the path. Criterion 3 says something else, that the refusal is asserted on what only it can say because it stands beside three other refusals. Whatever makes criterion 2 green makes criterion 3 green, so criterion 3 puts a sentence on the list and no decision in the gate, and the token can close with the property nobody checked. It matters most here because criterion 3's sentence is word for word the trap doc/guidance/behaviour.md describes under The check comes first: a check that asks only whether the call was refused, with two refusals in a row, where deleting the first leaves the suite green. The criterion that exists to forbid that shape is decided by a command that cannot see it. This is not one draft's slip. wk-2fb5bf5bb1, which I rejected an hour ago, carries the identical pair in the identical words, criteria 2 and 3 with one command and the second sentence being the anti-vacuity one, so the extent is two of the drafts minted today and the phrasing travelled between them.

**satisfies:** Give criterion 3 a command of its own naming a second test, so the two sentences are decided separately. The test that decides it is the one behaviour.md describes: delete the outside-the-record refusal on its own, with the missing finding, missing lesson and lesson-names-no-token refusals left standing, and require the verdict to be ACCEPTED rather than merely refused by something else. Assert on what only that refusal can say, which is the path and the sentence about repairing the record and not the work. If one test really covers both, then they are one criterion and the second sentence belongs inside the first. Then take the red the way criterion 8 already asks: cut that one refusal, run the new test, and record the test name and what it said.

## finding 3 · round 1 · done when, criterion 5: "The repair field is in the shape table on wk-24be1c06ae" / runs: rg -q Repair doc/work/wk-24be1c06ae.md · by reviewer10

**wrong:** The sentence names a place inside a file and the command searches the whole file for one word, and the file is another token's unagreed draft. Criterion 5 says the repair field is in the shape table on wk-24be1c06ae, and its command is rg -q Repair doc/work/wk-24be1c06ae.md. The word is absent from that note today, which I confirmed, so the command is red and looks sound. It goes green the moment the word appears anywhere in a note that runs to tens of thousands of characters of detail, findings and lessons, and a reviewer writing a finding about repairs on that token would turn it green without touching the table. Criterion 6 on this same list says the right thing about itself, that the check reads that section rather than the whole file, so the token knows the rule and did not apply it here. There is a second problem in the same line and it is not the same problem. wk-24be1c06ae is a draft in spec review, whose shape table has been rewritten in each of the last three rounds and which I rejected again this session, so this criterion asserts a property of a table that is not agreed, and this token declares no dependency on it. And this is the second draft minted today with the shape: wk-2fb5bf5bb1's criterion 4 is rg -q prevents doc/work/wk-24be1c06ae.md, which I demonstrated goes green with the word in a stray paragraph.

**satisfies:** Anchor the search to the table rather than to the file, and say so in the sentence the way criterion 6 does: read the block that table's heading opens and require the row inside it, so the check fails when the word is present and the row is not. Then decide the cross-token question and write it down: either declare the dependency with depends_on so the ordering is the engine's rather than a reader's, or drop the criterion and say in the detail that the row is wk-24be1c06ae's work, naming it, so the exclusion can be told from an oversight. Then take the red on the case that decides it: put the word somewhere in a copy of the note that is not the table, run the check, and require it to stay red.

## lesson 1 · round 1 · by reviewer10

**the class:** A TWO-PART COMMAND WHOSE GUARD AND WHOSE RUNNER NAME DIFFERENT SYMBOLS. The pattern in this project is sound and it is there for a reason: go test -run on a name nothing defines answers ok and exits zero, so a criterion puts a search for the definition in front of the run and the pair together can report on the work. The two halves are then written out twice, by hand, from the same idea of the name, and one of them drifts. The failure is not the one a reader expects. A drifted guard does not fail open, it fails SHUT: the worker writes exactly the test the criterion names, the search finds nothing, and the criterion is red with the work done. The only ways out are a decoy definition carrying the guard's spelling, which is worse than no guard, or editing the criterion, which a worker may not do, so the drift is discovered at the keyboard by somebody with no authority to fix it. It hides because the command reads as one thing: the two long identifiers differ by four characters in the middle of a line nobody re-reads, and the whole line is red today for the honest reason that nothing is built yet, so no gate can tell the two reds apart. Measured on wk-cae83b6e63: criterion 1 searches for func.ARepairIsRecordedOnTheToken and runs TestARepairIsRecordedOnTheToken, and against a file holding func TestARepairIsRecordedOnTheToken the search exits 1 while the same search with Test in it exits 0.

**instead:** Two halves, and the first is what stops it being made. Write the identifier once and paste it into both halves of the command, so the guard's pattern literally contains the runner's, and then read the finished line asking whether the same string appears twice. A command that names one thing twice is a command you can check by eye in a second; one that names it in two spellings is one nobody can. The second half is the check that catches it, and it costs one file: before submitting, for every command of the shape prove it exists and then run it, put the artefact the runner names into a scratch directory on its own and run the guard against that. A guard that is red with the artefact present is a guard that is not about the artefact, and that is the one thing a draft cannot learn from running the command against the tree, because the tree is red anyway.

**minted as:** wk-775a8ed90f

