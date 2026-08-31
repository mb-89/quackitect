---
id: wk-c22f29af7b
seq: "-10"
type: work
title: a reviewer names lessons
status: imp_open
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

## finding 1 · round 1 · detail: WHAT THE ENGINE DOES: it refuses. A rejection carries the id of the token the reviewer minted, the engine checks that the id is a token, and a rejection naming none is refused the way one with no finding is refused. That is the whole of the engine's part. / evidence: THREE CHECKS, ALL GREEN. TestARejectionNamesTheLessonsToken drives the refusal on both halves · by reviewer6

**wrong:** THE HALF OF THE REFUSAL THIS TOKEN EXISTS FOR IS GUARDED BY NOTHING, AND THE EVIDENCE SAYS OTHERWISE. It says "TestARejectionNamesTheLessonsToken drives the refusal on both halves." It drives one.

**satisfies:** ASSERT ON THE WORDS, ONE CASE PER REFUSAL. Split the first half of TestARejectionNamesTheLessonsToken into two cases that cannot pass for each other. The empty-id case requires the refusal to carry its own distinguishing phrase -- "names no token", or "so it is a sentence on a note somebody has to remember to act on" -- and not a fragment like "mint" that the neighbouring refusal also contains. The not-a-token case requires the refusal to name the id it was handed, which the other cannot do because there is no id. spec_test.go:149 already does exactly this for the no-lesson refusal, so the shape is in the tree and does not need inventing.

## lesson 1 · round 1 · by reviewer6

**the class:** A GUARD STANDING IN FRONT OF ANOTHER GUARD, WITH A CHECK THAT ONLY ASKS WHETHER IT WAS REFUSED. Two refusals sit one after the other, and the second catches by accident everything the first was written for: the first refuses the empty case with a message saying what to do, the second refuses the malformed case, and an empty value is also malformed. The test asserts the call was refused; it is refused either way. Delete the first guard and the whole suite stays green, so nothing holds the message a person actually reads. And where the test does look at the text it looks for a fragment -- Contains(wrong+satisfies, "mint") -- which the fall-through refusal satisfies with the word "minted", so the one assertion aimed at telling them apart passes on the wrong one. On wk-c22f29af7b that is the refusal the token exists for: with it gone, the reviewer is handed "learned names , which is not a token: no such token: ", a sentence with a hole where the id should be and no instruction in it, and go test ./... says ok.

**instead:** When you add a guard, ask what the caller sees if you delete it, and run the suite with it deleted before you believe the check. A green suite means the guard is not guarded, and either the check has to assert on the thing that changed or the guard is not earning its lines. A refusal's value is its message, so a check on a refusal asserts on the message: the distinguishing phrase, never a fragment a neighbouring refusal also contains, and one case per refusal rather than one case any refusal satisfies. Ask it in one sentence before writing the assertion -- what would I have to break for this to go red, and is that the thing I just wrote.

**minted as:** wk-84a8b68af9

