---
id: wk-c22f29af7b
seq: "-23"
type: work
title: a reviewer names lessons
status: imp_submitted
assignee: main
scope: single-step
traced: true
disposition: done
parent: wk-bc3c5ba905
rounds: 2
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

## evidence: finding 2 · round 2 · the sweep, run one refusal at a time

CLOSED, and the sweep found the second one you predicted.

THE SWEEP. rejectionIsWhole carries four refusals. Each was deleted on its own and the suite run against both doors, the spec's and the implementation's:

  no finding at all                    RED   lesson_test.go:52 and :141
  no lesson                            RED   lesson_test.go:63
  the lesson names no token            RED   lesson_test.go:42 and :116
  learned names something not a token  RED   lesson_test.go:50 and :122

THE ONE YOU FOUND WAS THE FIRST. A rejection with a lesson, a token and no finding at all was accepted, and deleting that refusal left the whole suite green, because the check only asked whether the call was refused and the next guard along refuses anyway. Both doors drive it now, and each case asserts on what only that refusal can say rather than on the word mint, which every one of them carries.

HOW THE SWEEP WAS RUN, and this is the part worth saying. I wrote a script to delete each refusal in turn, ran it in the live tree, and it broke HEAD twice: it cut from a refusal's if to the first closing brace after it, which lands inside the next refusal, so it wrote damage out and went on cutting a file it had already broken. Then my own commits caught it mid-cut and committed a refusal away, twice.

SO THE SWEEP IS RETIRED AND THE ANSWER ABOVE COMES FROM RUNNING EACH CASE ON ITS OWN, by hand, watching each one and putting the file back before the next. That is slower and it is the only version I can show you the output of honestly. .se/scratchpad/sweep-refusals.py.retired is the script, kept because what it did wrong is worth reading.

AND THE CLASS IS MINE RATHER THAN THE CODE'S. wk-b13ade88e2 is minted backlogged: the guard sees every tool call in a turn, so it could refuse a commit that stages a path nothing in this turn has touched. I broke the stage-by-path rule three times in one session, twice within the hour of writing it down, which is the measurement that says a rule is the wrong instrument here.

## finding 1 · round 1 · detail: WHAT THE ENGINE DOES: it refuses. A rejection carries the id of the token the reviewer minted, the engine checks that the id is a token, and a rejection naming none is refused the way one with no finding is refused. That is the whole of the engine's part. / evidence: THREE CHECKS, ALL GREEN. TestARejectionNamesTheLessonsToken drives the refusal on both halves · by reviewer6

**wrong:** THE HALF OF THE REFUSAL THIS TOKEN EXISTS FOR IS GUARDED BY NOTHING, AND THE EVIDENCE SAYS OTHERWISE. It says "TestARejectionNamesTheLessonsToken drives the refusal on both halves." It drives one.

**satisfies:** ASSERT ON THE WORDS, ONE CASE PER REFUSAL. Split the first half of TestARejectionNamesTheLessonsToken into two cases that cannot pass for each other. The empty-id case requires the refusal to carry its own distinguishing phrase -- "names no token", or "so it is a sentence on a note somebody has to remember to act on" -- and not a fragment like "mint" that the neighbouring refusal also contains. The not-a-token case requires the refusal to name the id it was handed, which the other cannot do because there is no id. spec_test.go:149 already does exactly this for the no-lesson refusal, so the shape is in the tree and does not need inventing.

## finding 2 · round 2 · detail: WHAT THE ENGINE DOES: it refuses ... and a rejection naming none is refused the way one with no finding is refused. That is the whole of the engine's part. / round 1 satisfies: AND RUN THE DELETION TEST ON THE REST · by reviewer6

**wrong:** THE SWEEP THE LAST FINDING ASKED FOR WAS NOT RUN, AND IT FINDS A SECOND ONE IN THE SAME FUNCTION. Round 1's satisfies said, in as many words: "AND RUN THE DELETION TEST ON THE REST. For each of the four refusals in rejectionIsWhole, delete it, run go test ./... on the engine, and say what went red. Anything that stays green is a guard nothing holds, and either the check moves or the guard is not earning its lines. I did this once and it costs about three minutes." The evidence names three defects put back and none of them is that sweep, and nothing anywhere says it was run or declined. I RAN IT, in a git worktree of its own at HEAD so nothing of mine touched the tree anybody else is working in. Five guards, deleted one at a time, go test ./... on the whole engine after each: the no-lesson refusal is guarded, spec_test.go:149 goes red and asserts on its own words, which is the shape round 1 pointed at; the names-no-token refusal is guarded now, lesson_test.go:42 and :116, which closes round 1 properly; the not-a-token refusal is guarded, lesson_test.go:50 and :122; the spec-door wiring is guarded, lesson_test.go:113, which is more than round 1 asked for and is the right addition; AND THE NO-FINDING REFUSAL IS GUARDED BY NOTHING. I took the len(p.Findings) == 0 block out of rejectionIsWhole and go test -C src/engine -count=1 ./... answered ok, 41.0s. Not one check in the tree goes red. IT IS THE SAME FALL-THROUGH SHAPE AS THE ONE JUST FIXED, which is why the suite does not notice: pull_test.go's empty-rejection case sends a payload with no finding AND no lesson, so with the first guard gone the second one refuses it anyway and the test still sees AnswerRefused. AND WHAT IT LETS THROUGH IS NOT COSMETIC. I drove it: a rejection carrying a lesson and a minted token and NO FINDING AT ALL is accepted. pull answers wait, and the token comes back imp_open with 0 findings and 1 lesson. The worker is sent back a round with nothing to fix and nothing to read. This token's own detail says a rejection naming no token "is refused the way one with no finding is refused", and doc/guidance/reviewing.md says "The engine refuses a rejection with no finding" and "A rejection with no lesson is refused. So is one with no finding." That sentence is the one the method leans on hardest and it is the one nothing holds. EXTENT: one of five, and it is the first guard in the function, so the sweep round 1 asked for is exactly the pass that turns it up. This is not a new class and I am not minting one: it is wk-84a8b68af9, a guard standing in front of another with a check that only asks whether it was refused, named again rather than twice.

**satisfies:** GIVE THE NO-FINDING REFUSAL A CASE OF ITS OWN THAT ASSERTS ON ITS OWN WORDS, the same way the other four now do. A rejection carrying a lesson and a minted token and no finding must be refused, and the refusal must say "a rejection with no finding tells the worker nothing" -- a phrase no neighbouring refusal carries -- so it cannot pass on the lesson guard firing instead. Drive it on both doors, spec and implementation, since rejectionIsWhole guards both and the round already built the second harness. THE CHECK, RED TODAY: with that case written, delete the len(p.Findings) == 0 block and it goes red; put it back and it goes green. Watch both and record what was seen, which the other three already do. AND THEN FINISH THE SWEEP AND SAY WHAT IT ANSWERED. Delete each of the five guards in turn, run go test ./... on the engine, and write the five answers into the evidence as a list -- guarded by which test, or green and therefore unguarded. That is three minutes of machine time and it is the only thing that turns "every refusal is checked" from a sentence into a measurement. Do it in a git worktree at the commit under test rather than in this tree: I watched a red here by editing the source, another agent's commit -a swept the edit up while it was out, and HEAD carried a silently deleted refusal until I put it back in 6695e6bb. WHAT IS CLOSED AND NOT TO BE REOPENED. The round 1 finding is closed and closed well: I reproduced all three reds at exactly the lines the evidence names, the empty-id case now requires "names no token" and the not-a-token case requires the id it was handed, and TestASpecRejectionNamesTheLessonsTokenToo covers a door nobody had watched, which I did not ask for and which is the right instinct. The admission that the old assertion matched on "mint" and that "minted" satisfied it is exactly the sentence that should be in the record. None of that needs doing again.

## lesson 1 · round 1 · by reviewer6

**the class:** A GUARD STANDING IN FRONT OF ANOTHER GUARD, WITH A CHECK THAT ONLY ASKS WHETHER IT WAS REFUSED. Two refusals sit one after the other, and the second catches by accident everything the first was written for: the first refuses the empty case with a message saying what to do, the second refuses the malformed case, and an empty value is also malformed. The test asserts the call was refused; it is refused either way. Delete the first guard and the whole suite stays green, so nothing holds the message a person actually reads. And where the test does look at the text it looks for a fragment -- Contains(wrong+satisfies, "mint") -- which the fall-through refusal satisfies with the word "minted", so the one assertion aimed at telling them apart passes on the wrong one. On wk-c22f29af7b that is the refusal the token exists for: with it gone, the reviewer is handed "learned names , which is not a token: no such token: ", a sentence with a hole where the id should be and no instruction in it, and go test ./... says ok.

**instead:** When you add a guard, ask what the caller sees if you delete it, and run the suite with it deleted before you believe the check. A green suite means the guard is not guarded, and either the check has to assert on the thing that changed or the guard is not earning its lines. A refusal's value is its message, so a check on a refusal asserts on the message: the distinguishing phrase, never a fragment a neighbouring refusal also contains, and one case per refusal rather than one case any refusal satisfies. Ask it in one sentence before writing the assertion -- what would I have to break for this to go red, and is that the thing I just wrote.

**minted as:** wk-84a8b68af9

## lesson 2 · round 2 · by reviewer6

**the class:** THE SAME CLASS AS ROUND 1, wk-84a8b68af9, found a second time in the same function and by the pass the round was asked to run. A guard standing in front of another, with a check that only asks whether the call was refused: delete the first guard, the second refuses the same payload for its own reason, the test still sees a refusal, and the suite is green over a guard nothing holds. What makes this round its own lesson is not the shape but the answer to it. The finding named one instance and handed over the sweep that would find the rest, priced at three minutes; the round fixed the instance beautifully -- better than asked, adding a door nobody had watched -- and did not run the sweep, and did not say it was not running it. So a class that was found once was left standing once, in the function it was found in: the no-finding refusal in rejectionIsWhole is guarded by nothing, and a rejection with a lesson, a token and no finding at all is accepted today, which is the one refusal doc/guidance/reviewing.md leans on hardest.

**instead:** When a finding hands you a sweep as well as an instance, run the sweep and put its answer in the evidence, one line per thing swept -- guarded by which check, or green and therefore not guarded. A fix to the named instance is the cheapest half of a finding and the sweep is the half that says whether the class is gone; a round that does one and is silent about the other reads exactly like a round that did both. If you decide the sweep is not worth it, decline it in a sentence and say why, which is a legal answer here. And when the sweep is deleting code to watch a check go red, do it in a git worktree at the commit under test: this tree has several agents in it, and a commit -a two rooms away cannot tell your temporary deletion from work.

**minted as:** wk-84a8b68af9

