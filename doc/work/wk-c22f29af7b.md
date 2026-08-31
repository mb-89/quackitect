---
id: wk-c22f29af7b
seq: "53"
type: work
title: a reviewer names lessons
status: open
assignee: main
scope: single-step
traced: true
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

