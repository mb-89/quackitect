---
kind: [[guidance]]
scope: ["whoever gives the verdict on a standard token"]
out_of_scope:
  - "the change itself, which is [[writing-software]]"
  - "the tests it runs, which is [[testing]]"
  - "a review before the change lands, which nothing here does"
depends_on:
  - "[[voice]]"
  - "[[behaviour]]"
  - "[[work-token]]"
  - "[[testing]]"
---

# Motivation

A standard token lands its change and then gets one verdict, from a second agent, and the verdict blocks nothing.
The process is [[src/processes/standard.process.yaml]], and this file is how its verdict step is done.
The bar is improvement: every part of a change earns its place by making the product better.
A part that neither helps nor hurts is how a tree fills with code nobody needs.

The verdict is one round.
There is no second, because rounds were the cost of the last reviewers and never their output.
The record held two hundred rounds over sixty-seven tokens, and one token at eleven.
A finding is work, minted as a trivial token, and the reviewer may take it and fix it.

# Actionables

1. Ask one question of every hunk: does this improve the product? A hunk that does not is a finding. *
2. Pass when the change holds its criteria and leaves the tree better. Not when it is perfect. *
3. Read every hunk of `git diff began..ended`. Name any you did not read. An empty span is not a change with none. *
4. Verify, do not read: run each criterion's command yourself. A description of the work is not the work. *
5. Find the clause of the token no hunk answers. That is where the work drifted.
6. Write every candidate finding first. Keep only those naming a line, the damage or dead weight, and the check that catches the class. *
7. At most five findings, worst first. The rest is one line: also seen. *
8. Nothing found is a complete answer. A verdict is not scored by what it found. *
9. Every finding kept is a trivial token naming this one. Mint it, and take it yourself if you hold the context. *
10. A number that moved is not damage. Ask whether the decision resting on it still stands. *
11. The approach was decided when the token was written. Disagree with it in a note, never in a finding. *
12. Style, naming and formatting belong to the checks. Raise them only where the checks cannot see.
13. Give one verdict and stop. Pull the next standard token, and go when there is none. *
14. You are never the author. The engine refuses you a token your lane worked, and you decline one it missed. *

# Discussion

## 1. Improvement, not harmlessness

The last reviewers asked whether a change would damage the product, and a change that did nothing passed.
The owner moved the bar: the question is whether each part improves the product, because a tree fills with harmless code that helps nobody.
A hunk that cannot say what it improves is a finding, and the finding says so in those words.

## 2. The standard

Google's reviewers approve a change once it improves the overall health of the system, even when it is not perfect.
Over eighty percent of their changes need at most one iteration.
That is the standard here.
A verdict that withholds a pass for what it would have done differently is a second author, not a reviewer.

## 3. Every hunk

A reviewer that reads the note and skims the diff has reviewed the note.
Every hunk is read, and a hunk skipped is named in the verdict.
So a reader knows what was not looked at rather than assuming it was.

A span can be empty while the change is real.
Measured in September 2026 on a token whose last span carried only the ended marker.
Its four criteria were all about src/engine/enginefresh.go, and a hundred and twenty-five lines had entered the tree on a take-up snapshot.
A reviewer who took that span at its word would have found nothing, because the span held nothing.
So the worker names the commit that carries the change, and the reviewer reads that instead.

## 4. Verify

Every criterion names a command, and the reviewer runs it.
Two recorded observations in one sitting did not survive being followed.
One cited a line that never carried the assertion, and one a line another test guarded.
The engine's test answer says what ran and whether it passed.
The reviewer reads it and runs what the criteria name beyond it.

## 6. Two passes

A reviewer built as one careful prompt raised two or three false findings in every eight.
Built as two passes, everything first and a filter second, it raised almost none.
So the candidate list is written in full and then cut.
A finding survives only with all of these:

- a line it points at
- the damage or the dead weight it names
- the check that would catch the class next time

What does not survive is dropped, or fixed on the spot without a word, because a nitpick costs a reader more than it saves.

## 7. Five

An agent pushed to find everything found a fifth more, and its signal fell by more than half.
A review nobody trusts is a review nobody reads.
Five findings, worst first, is what a reader acts on.
Everything past five is one line naming what else was seen, so nothing is hidden and nothing is padded.

## 8. Nothing found

A reviewer that has to find something finds something.
The verdict is not scored by findings, and a clean pass of sound work is the review having produced everything it owed.

## 9. A finding is work

A finding that stays on the verdict is read once and forgotten.
Minted as a trivial token that names the standard token it came from, it is work in the queue.
The reviewer who holds the context is the cheapest hand to do it.
It is never a child of the standard token, because a child would hold the parent open, and nothing here blocks.

## 10. Numbers

One numbers finding was raised on three tokens in one day, correct every time, and none of the three changed a line.
A count that moved changes nothing unless a decision rested on it, so the reviewer asks about the decision and leaves the count alone.

## 11. The approach is settled

The approach was written before the work and a reader could disagree with it then.
A reviewer that disagrees now writes a note token, which the backlog decides, and reviews the change against the approach it was written to.

## 13. One verdict

There is no round two.
The token closes on the verdict, the findings are in the queue, and the reviewer pulls the next standard token.
When none is left the reviewer's work is done and it stops.
The engine asks for another when the next standard token wants one.

## 14. Never the author

An evaluator recognises its own output and favours it, and the preference grows with the recognition.
The engine writes down who did the work step, and which lane did it: the box, and the session on it.
Both are refused the verdict, because a name is not what tells two evaluators apart.
A session that spawns a reviewer of its own is one evaluator under two names.
Two sessions are two evaluators, on one box or on two, so a verdict has somewhere to go.
A reviewer handed its own work by mistake declines it and says so.
