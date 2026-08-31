---
id: wk-bc3c5ba905
seq: "-6"
type: work
title: a token carries done
status: open
assignee: main
scope: multi-step
traced: true
subs:
  - wk-2d34b2e7f7
minted_by: person
---

## detail

A token carries a problem and a definition of done before anybody works on it,
and a reviewer agrees the draft before the work starts.

WHAT KEEPS GOING WRONG: the reviewer tells the agent it did not do the work.
That is a fault in the token rather than in the review. Nothing said what done
meant, so nothing could be checked before the submission, and the review became
the first place anybody looked.

THE SHAPE OF A TOKEN:
- the problem, in the words it was asked in
- the acceptance criteria, one line each, each one a thing that can be judged
- for every criterion that can be a command, the command. It passes when it
  exits zero.

TWO STATES GO IN FRONT OF OPEN:
  spec             the agent is drafting the problem and the criteria
  spec_in_review   a reviewer is judging the draft
Then open, in_work, submitted, in_review, closed, unchanged.

WHO DRAFTS: everything a person mints, and everything an agent mints that is
not a sub-token. A sub-token is a breakdown of work whose spec is already
agreed, so it goes straight to open.

WHAT THE ENGINE ENFORCES:
- a token in spec cannot be pulled as work
- a spec with no criteria cannot go to review
- a submission runs every command criterion first, and one that exits non-zero
  is refused before a reviewer sees it
- a criterion that is not a command is answered in the evidence, by name

THE AGENT RUNS THE CRITERIA BEFORE SUBMITTING. Asking the reviewer to find out
is what this replaces.

THE THIRTEEN TOKENS THAT ALREADY EXIST have no spec and go through unchanged.
The rule applies to everything minted after it lands.

PRIOR ART TO READ AND CITE: acceptance criteria as executable specification,
Fit and FitNesse, Gojko Adzic on specification by example, the three amigos
agreeing a specification before the work, and behaviour-driven development,
which names this failure. Say what each one contributes and mark an estimate as
an estimate.

EVERY REJECTION CARRIES A LESSON, NOT ONLY A FINDING.

A finding teaches one token. A lesson names the class and teaches everything
after it. Five rounds on one token happened because each round fixed the
instance and left the class standing.

So a rejection names: the clause, what is wrong, what would satisfy it, and
what class of mistake it is with how to avoid it.

WHERE THE LESSON GOES. Small enough to do inside the work being rejected, it
goes into that token. Bigger than that, it is minted as its own backlogged
token and the rejection names the id.

THE ENGINE REFUSES A REJECTION WITHOUT ONE, the same way it already refuses a
rejection with no finding.

