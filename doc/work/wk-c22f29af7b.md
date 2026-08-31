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

## evidence: what was built

The engine refuses a rejection that does not name the token the reviewer minted for the lesson, and it does nothing else about lessons.

THE REFUSAL. rejectionIsWhole, src/engine/pull.go:395, is called on both rejection paths, the spec's at :367 and the implementation's at :463. It refuses a rejection naming no token, and it refuses one naming an id that is not a token, because a typed id that reaches nothing is the same hole as no id at all.

WHAT THE REVIEWER DOES. Mints the token with se work, backlogged or open as it judges, writes the class and what to do instead into it, and names the id in the verdict's learned field. The lesson lands on the token beside the round that taught it, and the note carries **minted as:** <id> so a reader of the note follows it without opening the engine.

WHY THE ENGINE DOES NOT MINT IT, which is the owner's ruling and the reason this token exists. A class is a judgment. The same token coming back twice would mint the same lesson twice, and only somebody who has read both rounds can tell a second instance of an old class from a new one. Matching on the words would be a word list fitted to the cases already seen, which is one of the four shapes the method already names. Whether the lesson goes to the backlog or straight into what is open is the same kind of judgment.

THREE CHECKS, ALL GREEN. TestARejectionNamesTheLessonsToken drives the refusal on both halves. TestARejectionWithoutALessonIsRefused drives the older half, that a rejection with no class and no remedy is refused at all. TestCriteriaAndLessonsSurviveTheNote drives the round trip, because the note is re-rendered from the parsed token on every save and a lesson written as prose would be dropped.

AND IT HAS BEEN IN USE ALL SESSION, WHICH IS BETTER EVIDENCE THAN THE TESTS. Every rejection this session carried a minted token id because the engine would not take one without: wk-644aae4ac6 symptom removed defect kept, wk-789ff2ba2e the check ran dry, and the four rounds before them. Two of those lessons are now in doc/guidance/behaviour.md and their tokens are aborted naming the section, which is the whole point of minting them rather than writing a paragraph nobody acts on.

THE METHOD SAYS IT TOO, in doc/guidance/reviewing.md: every rejection carries a lesson, and you mint it.

THIS REPLACES wk-6684401070, which had the engine doing the minting. The owner overruled that and this token carries the decision.

WHAT IS NOT HERE. The engine does not check that the minted token says anything useful, and it cannot: that is the judgment it was told to stay out of. A reviewer minting an empty token to get past the gate is possible and is caught by a person reading the token, not by the engine.

