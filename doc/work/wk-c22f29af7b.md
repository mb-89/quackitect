---
id: wk-c22f29af7b
seq: "-10"
type: work
title: a reviewer names lessons
status: imp_submitted
assignee: main
scope: single-step
traced: true
disposition: done
parent: wk-bc3c5ba905
rounds: "1"
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

## evidence: finding 1 · round 1 · one case per refusal, and both doors driven

CLOSED, and the evidence was wrong in both readings of both halves.

WHAT I CLAIMED AND WHAT WAS TRUE. I wrote that the check drives the refusal on both halves. It drove one door and, inside that door, it could not tell its two cases apart: the empty-id case matched on the word mint, which the neighbouring refusal also carries, so either case would have passed for the other and neither was guarded.

EACH REFUSAL IS NOW ASSERTED ON WHAT ONLY IT CAN SAY. The empty-id case requires "names no token". The not-a-token case requires the refusal to name the id it was handed, wk-nothing, which the other cannot do because there is no id. That is the shape spec_test.go:149 already used for the no-lesson refusal, so it did not need inventing.

AND THE SPEC DOOR IS DRIVEN. rejectionIsWhole guards two, src/engine/pull.go:367 for a draft and :463 for an implementation, and only the second was watched. TestASpecRejectionNamesTheLessonsTokenToo drives the first: both refusals by their own words, and then a whole rejection sending the draft back to spec_open with the lesson and its token on it.

WATCHED RED, THREE DEFECTS PUT BACK ONE AT A TIME:

  the learned check taken out of rejectionIsWhole      RED
    lesson_test.go:42:  the refusal does not say the lesson names no token
    lesson_test.go:116: the refusal does not say the lesson names no token
  the not-a-token check taken out                      RED
    lesson_test.go:50:  a rejection naming a token nobody minted was accepted: wait
    lesson_test.go:122: a spec rejection naming a token nobody minted was accepted: wait
  the spec door left unguarded                         RED
    lesson_test.go:113: a spec rejection that minted nothing was accepted: wait
  restored                                             GREEN

THE FIRST INJECTION IS WHAT THE OLD ASSERTION COULD NOT SEE. With the empty-id refusal gone, the next one answers "learned names , which is not a token", which still contains the word mint in its satisfies line. The old check went green on that. The new one names the sentence that is missing.

THE THIRD IS THE DOOR NOBODY WATCHED, and only the new test reds on it, which is the point of adding it.

A rule enforced in one place and checked in the other is a rule that lasts until somebody edits the one nobody watches. The whole battery afterwards: all ok, fourteen lines.

## finding 1 · round 1 · detail: WHAT THE ENGINE DOES: it refuses. A rejection carries the id of the token the reviewer minted, the engine checks that the id is a token, and a rejection naming none is refused the way one with no finding is refused. That is the whole of the engine's part. / evidence: THREE CHECKS, ALL GREEN. TestARejectionNamesTheLessonsToken drives the refusal on both halves · by reviewer6

**wrong:** THE HALF OF THE REFUSAL THIS TOKEN EXISTS FOR IS GUARDED BY NOTHING, AND THE EVIDENCE SAYS OTHERWISE. It says "TestARejectionNamesTheLessonsToken drives the refusal on both halves." It drives one.

**satisfies:** ASSERT ON THE WORDS, ONE CASE PER REFUSAL. Split the first half of TestARejectionNamesTheLessonsToken into two cases that cannot pass for each other. The empty-id case requires the refusal to carry its own distinguishing phrase -- "names no token", or "so it is a sentence on a note somebody has to remember to act on" -- and not a fragment like "mint" that the neighbouring refusal also contains. The not-a-token case requires the refusal to name the id it was handed, which the other cannot do because there is no id. spec_test.go:149 already does exactly this for the no-lesson refusal, so the shape is in the tree and does not need inventing.

## lesson 1 · round 1 · by reviewer6

**the class:** A GUARD STANDING IN FRONT OF ANOTHER GUARD, WITH A CHECK THAT ONLY ASKS WHETHER IT WAS REFUSED. Two refusals sit one after the other, and the second catches by accident everything the first was written for: the first refuses the empty case with a message saying what to do, the second refuses the malformed case, and an empty value is also malformed. The test asserts the call was refused; it is refused either way. Delete the first guard and the whole suite stays green, so nothing holds the message a person actually reads. And where the test does look at the text it looks for a fragment -- Contains(wrong+satisfies, "mint") -- which the fall-through refusal satisfies with the word "minted", so the one assertion aimed at telling them apart passes on the wrong one. On wk-c22f29af7b that is the refusal the token exists for: with it gone, the reviewer is handed "learned names , which is not a token: no such token: ", a sentence with a hole where the id should be and no instruction in it, and go test ./... says ok.

**instead:** When you add a guard, ask what the caller sees if you delete it, and run the suite with it deleted before you believe the check. A green suite means the guard is not guarded, and either the check has to assert on the thing that changed or the guard is not earning its lines. A refusal's value is its message, so a check on a refusal asserts on the message: the distinguishing phrase, never a fragment a neighbouring refusal also contains, and one case per refusal rather than one case any refusal satisfies. Ask it in one sentence before writing the assertion -- what would I have to break for this to go red, and is that the thing I just wrote.

**minted as:** wk-84a8b68af9

