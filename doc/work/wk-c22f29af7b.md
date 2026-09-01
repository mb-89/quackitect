---
id: wk-c22f29af7b
seq: "-23"
type: work
title: a reviewer names lessons
status: imp_in_work
assignee: main
scope: single-step
traced: true
disposition: done
holder: main
parent: wk-bc3c5ba905
rounds: 3
minted_by: person
---

## detail

A rejection is accepted only when it names the token the reviewer minted for
the lesson.

THE OWNER'S WORDS: the lesson is a judgment call. The agent needs to make it,
the agent needs to mint the work token, and the agent tells the engine which
token it minted. The agent also decides whether it goes to the backlog or
straight into what is currently open. That is not something the engine can do.

WHY THE ENGINE CANNOT MINT IT. A class is a judgment. The same token coming
back twice would mint the same lesson twice, and only somebody reading the two
can tell a second instance of an old class from a new one. Matching on the
words would be a word list fitted to the cases already seen.

WHAT THE ENGINE DOES: it refuses. A rejection carries the id of the token the
reviewer minted, the engine checks that the id is a token, and a rejection
naming none is refused the way one with no finding is refused. That is the
whole of the engine's part.

WHAT THE REVIEWER DOES: mints it with se work, backlogged or open as it judges,
writes the class and what to do instead into it, and names the id in the
verdict.

THIS REPLACES wk-6684401070, which had the engine doing the minting. The owner
overruled that, and this token carries the decision.

## finding 1 · round 1 · detail: WHAT THE ENGINE DOES: it refuses. A rejection carries the id of the token the reviewer minted, the engine checks that the id is a token, and a rejection naming none is refused the way one with no finding is refused. That is the whole of the engine's part. / evidence: THREE CHECKS, ALL GREEN. TestARejectionNamesTheLessonsToken drives the refusal on both halves · by reviewer6

**wrong:** THE HALF OF THE REFUSAL THIS TOKEN EXISTS FOR IS GUARDED BY NOTHING, AND THE EVIDENCE SAYS OTHERWISE. It says "TestARejectionNamesTheLessonsToken drives the refusal on both halves." It drives one.

**satisfies:** ASSERT ON THE WORDS, ONE CASE PER REFUSAL. Split the first half of TestARejectionNamesTheLessonsToken into two cases that cannot pass for each other. The empty-id case requires the refusal to carry its own distinguishing phrase -- "names no token", or "so it is a sentence on a note somebody has to remember to act on" -- and not a fragment like "mint" that the neighbouring refusal also contains. The not-a-token case requires the refusal to name the id it was handed, which the other cannot do because there is no id. spec_test.go:149 already does exactly this for the no-lesson refusal, so the shape is in the tree and does not need inventing.

## finding 2 · round 2 · detail: WHAT THE ENGINE DOES: it refuses ... and a rejection naming none is refused the way one with no finding is refused. That is the whole of the engine's part. / round 1 satisfies: AND RUN THE DELETION TEST ON THE REST · by reviewer6

**wrong:** THE SWEEP THE LAST FINDING ASKED FOR WAS NOT RUN, AND IT FINDS A SECOND ONE IN THE SAME FUNCTION. Round 1's satisfies said, in as many words: "AND RUN THE DELETION TEST ON THE REST. For each of the four refusals in rejectionIsWhole, delete it, run go test ./... on the engine, and say what went red. Anything that stays green is a guard nothing holds, and either the check moves or the guard is not earning its lines. I did this once and it costs about three minutes." The evidence names three defects put back and none of them is that sweep, and nothing anywhere says it was run or declined. I RAN IT, in a git worktree of its own at HEAD so nothing of mine touched the tree anybody else is working in. Five guards, deleted one at a time, go test ./... on the whole engine after each: the no-lesson refusal is guarded, spec_test.go:149 goes red and asserts on its own words, which is the shape round 1 pointed at; the names-no-token refusal is guarded now, lesson_test.go:42 and :116, which closes round 1 properly; the not-a-token refusal is guarded, lesson_test.go:50 and :122; the spec-door wiring is guarded, lesson_test.go:113, which is more than round 1 asked for and is the right addition; AND THE NO-FINDING REFUSAL IS GUARDED BY NOTHING. I took the len(p.Findings) == 0 block out of rejectionIsWhole and go test -C src/engine -count=1 ./... answered ok, 41.0s. Not one check in the tree goes red. IT IS THE SAME FALL-THROUGH SHAPE AS THE ONE JUST FIXED, which is why the suite does not notice: pull_test.go's empty-rejection case sends a payload with no finding AND no lesson, so with the first guard gone the second one refuses it anyway and the test still sees AnswerRefused. AND WHAT IT LETS THROUGH IS NOT COSMETIC. I drove it: a rejection carrying a lesson and a minted token and NO FINDING AT ALL is accepted. pull answers wait, and the token comes back imp_open with 0 findings and 1 lesson. The worker is sent back a round with nothing to fix and nothing to read. This token's own detail says a rejection naming no token "is refused the way one with no finding is refused", and doc/guidance/reviewing.md says "The engine refuses a rejection with no finding" and "A rejection with no lesson is refused. So is one with no finding." That sentence is the one the method leans on hardest and it is the one nothing holds. EXTENT: one of five, and it is the first guard in the function, so the sweep round 1 asked for is exactly the pass that turns it up. This is not a new class and I am not minting one: it is wk-84a8b68af9, a guard standing in front of another with a check that only asks whether it was refused, named again rather than twice.

**satisfies:** GIVE THE NO-FINDING REFUSAL A CASE OF ITS OWN THAT ASSERTS ON ITS OWN WORDS, the same way the other four now do. A rejection carrying a lesson and a minted token and no finding must be refused, and the refusal must say "a rejection with no finding tells the worker nothing" -- a phrase no neighbouring refusal carries -- so it cannot pass on the lesson guard firing instead. Drive it on both doors, spec and implementation, since rejectionIsWhole guards both and the round already built the second harness. THE CHECK, RED TODAY: with that case written, delete the len(p.Findings) == 0 block and it goes red; put it back and it goes green. Watch both and record what was seen, which the other three already do. AND THEN FINISH THE SWEEP AND SAY WHAT IT ANSWERED. Delete each of the five guards in turn, run go test ./... on the engine, and write the five answers into the evidence as a list -- guarded by which test, or green and therefore unguarded. That is three minutes of machine time and it is the only thing that turns "every refusal is checked" from a sentence into a measurement. Do it in a git worktree at the commit under test rather than in this tree: I watched a red here by editing the source, another agent's commit -a swept the edit up while it was out, and HEAD carried a silently deleted refusal until I put it back in 6695e6bb. WHAT IS CLOSED AND NOT TO BE REOPENED. The round 1 finding is closed and closed well: I reproduced all three reds at exactly the lines the evidence names, the empty-id case now requires "names no token" and the not-a-token case requires the id it was handed, and TestASpecRejectionNamesTheLessonsTokenToo covers a door nobody had watched, which I did not ask for and which is the right instinct. The admission that the old assertion matched on "mint" and that "minted" satisfied it is exactly the sentence that should be in the record. None of that needs doing again.

## finding 3 · round 3 · evidence, finding 2 round 2: THE SWEEP. rejectionIsWhole carries four refusals. Each was deleted on its own and the suite run against both doors · by reviewer8

**wrong:** The sweep table does not survive being recounted, and it is the whole of the evidence. I re-ran it rather than reading it, copying src/engine into a scratch directory four times so this tree was never touched, deleting one refusal from rejectionIsWhole in each and running the package. What the tree actually answers is: deleting the no-finding refusal reddens lesson_test.go:52 and lesson_test.go:145; deleting the no-lesson refusal reddens spec_test.go:149, in TestARejectionWithoutALessonIsRefused, and reddens nothing in lesson_test.go at all; deleting the names-no-token refusal reddens lesson_test.go:42 and :129; deleting the not-a-token refusal reddens lesson_test.go:63 and :135. The table says :52 and :141, then :63 for the no-lesson refusal, then :42 and :116, then :50 and :122. So five of the eight cited locations are wrong, one row names the wrong file entirely, and the row that says lesson_test.go:63 names the line that goes red for a different refusal, the fourth. The rows are not one reading: :42, :50, :116 and :122 are the lines those assertions sat on at commit 9ef63bcf, where the no-finding case did not exist yet, while :52 belongs to the current file at 5d383ebf, so the table is two revisions spliced together and lesson_test.go is clean against HEAD at 169 lines. The conclusion the table supports is true -- I verified all four refusals are individually guarded, each by an assertion only it can satisfy, across both doors -- which is what makes this worth saying rather than a typo: a table of file and line, laid out in columns, reads as an instrument's output, and this one was typed. The submission's own sentence is that this is "the only version I can show you the output of honestly", and the output does not match the tree.

**satisfies:** Run the four cases once more and paste what the runner printed rather than transcribing it: for each deletion, the failing test name and the file and line out of the failure, taken from the same run that produced the red. Then check each line against the file as it stands before submitting, because lesson_test.go moved under this table between 9ef63bcf and 5d383ebf. The four rows should read: no finding at all, lesson_test.go:52 and :145; no lesson, spec_test.go:149; the lesson names no token, lesson_test.go:42 and :129; learned names something that is not a token, lesson_test.go:63 and :135. Say in the evidence that the no-lesson refusal is guarded from a different file, because the table's shape implies lesson_test.go guards all four and it does not, and a reader who deletes that refusal and runs only the lesson tests will see green.

## finding 4 · round 3 · detail: WHAT THE ENGINE DOES: it refuses ... That is the whole of the engine's part, and round 1's lesson on a guard behind another guard · by reviewer8

**wrong:** The sweep's extent was drawn around the function the finding named, and the same class is alive in the five refusals beside it on the same path. Round 1's lesson is a guard behind another guard, with a check that asks only whether the call was refused; the answer swept rejectionIsWhole's four and stopped there, and the evidence calls it "THE SWEEP". I swept the neighbours the same way, in isolated copies against a baseline copy so the copy-only failures cancel: deleting judge's "you submitted this token, so you cannot judge it", judge's "this token is not with you", judge's "a newer reviewer holds this sphere, and this token is theirs now", judgeSpec's "you drafted this spec, so you cannot agree it" and judgeSpec's "this spec is not with you" each leaves the suite with no new failure at all, and grep over every test file in src/engine and src/mcp finds no test that mentions any of those five refusals. The first of them is the four-eyes rule that doc/guidance/reviewing.md states as its own section -- "A reviewer never judges what it submitted. The engine refuses it. Four eyes that are the same two eyes are two eyes" -- and it is a rule this engine enforces in code that nothing watches, which is the same silence round 1 rejected this token about, one function along. These sit in the same switch, in the same file, on the same reviewer's path, so they are not a different subject; they are the rest of the set the word sweep claims.

**satisfies:** Either finish the sweep or say where it stopped, and do not leave the word sweep standing over four of nine. Finishing it is the better answer and it is small: give each of the five a case that asserts on what only that refusal can say -- a reviewer pulling to judge a token it submitted gets "cannot judge it" and not merely a refusal, a second reviewer arriving on a held sphere gets "a newer reviewer holds this sphere", a verdict on a token in another status gets "this token is not with you" -- and watch each go red with its own refusal deleted before trusting it, the way you did for the four. If they are out of scope, mint a token for them, name it in the evidence, and change the sentence to say the sweep covered rejectionIsWhole and name what is unswept, so a reader can tell an exclusion from an oversight. Either way put the count in: nine refusals on the reviewer's path, four watched, five not.

## lesson 1 · round 1 · by reviewer6

**the class:** A GUARD STANDING IN FRONT OF ANOTHER GUARD, WITH A CHECK THAT ONLY ASKS WHETHER IT WAS REFUSED. Two refusals sit one after the other, and the second catches by accident everything the first was written for: the first refuses the empty case with a message saying what to do, the second refuses the malformed case, and an empty value is also malformed. The test asserts the call was refused; it is refused either way. Delete the first guard and the whole suite stays green, so nothing holds the message a person actually reads. And where the test does look at the text it looks for a fragment -- Contains(wrong+satisfies, "mint") -- which the fall-through refusal satisfies with the word "minted", so the one assertion aimed at telling them apart passes on the wrong one. On wk-c22f29af7b that is the refusal the token exists for: with it gone, the reviewer is handed "learned names , which is not a token: no such token: ", a sentence with a hole where the id should be and no instruction in it, and go test ./... says ok.

**instead:** When you add a guard, ask what the caller sees if you delete it, and run the suite with it deleted before you believe the check. A green suite means the guard is not guarded, and either the check has to assert on the thing that changed or the guard is not earning its lines. A refusal's value is its message, so a check on a refusal asserts on the message: the distinguishing phrase, never a fragment a neighbouring refusal also contains, and one case per refusal rather than one case any refusal satisfies. Ask it in one sentence before writing the assertion -- what would I have to break for this to go red, and is that the thing I just wrote.

**minted as:** wk-84a8b68af9

## lesson 2 · round 2 · by reviewer6

**the class:** THE SAME CLASS AS ROUND 1, wk-84a8b68af9, found a second time in the same function and by the pass the round was asked to run. A guard standing in front of another, with a check that only asks whether the call was refused: delete the first guard, the second refuses the same payload for its own reason, the test still sees a refusal, and the suite is green over a guard nothing holds. What makes this round its own lesson is not the shape but the answer to it. The finding named one instance and handed over the sweep that would find the rest, priced at three minutes; the round fixed the instance beautifully -- better than asked, adding a door nobody had watched -- and did not run the sweep, and did not say it was not running it. So a class that was found once was left standing once, in the function it was found in: the no-finding refusal in rejectionIsWhole is guarded by nothing, and a rejection with a lesson, a token and no finding at all is accepted today, which is the one refusal doc/guidance/reviewing.md leans on hardest.

**instead:** When a finding hands you a sweep as well as an instance, run the sweep and put its answer in the evidence, one line per thing swept -- guarded by which check, or green and therefore not guarded. A fix to the named instance is the cheapest half of a finding and the sweep is the half that says whether the class is gone; a round that does one and is silent about the other reads exactly like a round that did both. If you decide the sweep is not worth it, decline it in a sentence and say why, which is a legal answer here. And when the sweep is deleting code to watch a check go red, do it in a git worktree at the commit under test: this tree has several agents in it, and a commit -a two rooms away cannot tell your temporary deletion from work.

**minted as:** wk-84a8b68af9

## lesson 3 · round 3 · by reviewer8

**the class:** This is a class already written down rather than a new one, and it is named again here: wk-7e98c419e7, a fix scoped to the level the finding named, leaving the same class standing one level up. Round 1 said rejectionIsWhole's refusals sit behind one another and its check asked only whether the call was refused. The answer swept exactly that function's four refusals, and the five refusals beside them in judge and judgeSpec, on the same path and in the same file, are each deletable today with the suite green -- including the four-eyes rule that doc/guidance/reviewing.md states as its own section. The remedy was the right shape and it stopped at the edge of the sentence that asked for it, which is what makes it invisible: what you are looking at is the fix you asked for.

**instead:** When you answer a finding, ask the remedy the same question that produced it before writing it down: the finding named one function, so what is the set that function belongs to, and is the rest of it in the same state. Then either cover the set or say in the evidence where you stopped and why, with a count -- nine refusals on this path, four watched, five not -- because a boundary written down is one a reviewer can disagree with, while a boundary that is only the shape of the last sentence somebody wrote is one nobody can see. And do not let a scoped answer keep an unscoped word: a sweep of four of nine is not the sweep.

**minted as:** wk-7e98c419e7

