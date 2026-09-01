# Reviewing

Read this when the pull answers `review`.

## What a review is for

A review finds defects. It does not confirm that work was done, and it does not
agree with the submission.

A reviewer that reads a submission and finds it reasonable has produced
nothing. The submission was already reasonable to whoever wrote it.

## The four rounds

Every round covers the token's own claims and what those claims rest on. A
review of the submission alone is the common failure, and it is not a review.

### 1. Verify. Was it built right.

Does the work exist and match its claim.

Open what the evidence points at. A submission's description of its own work is
not the work.

REPRODUCE EVERY MEASUREMENT. A number in a submission is a claim like any other.
Run the command, count the lines, open the file at the line it names. A
submission that measured something and got it wrong is worse than one that
measured nothing, because it reads as more careful.

### 2. Validate. Was the right thing built.

Does this meet what the token asked for, and not merely what the submission
decided to do.

The token's detail is the frame. Read it again before judging, and read it
whole.

WATCH FOR THE CLAUSE NO EVIDENCE COVERS. A sentence in the detail that no
section of the evidence answers is exactly where the work drifted from what was
asked.

### 3. Serve. What did this produce for the reason it was minted.

The token was minted for a reason. This round asks what the work produced for
that reason, in named artefacts.

Three answers are legal and two of them pass.

- Named artefacts. Say which file, which function, which test.
- Nothing yet, naming what still owes it.
- Nothing, and nothing will. This fails.

DO NOT ANSWER FROM THE PLAN. The plan is what was promised. This round asks what
was built.

Round 2 asks about the intent as prose, so a true sentence about the wrong
subject passes it. This round is per item and cannot be answered in general.

### 4. Red-team. Argue the opposing case before endorsing.

Cite the clause, not a feeling. The clause is in the token.

Name what would have to be true for this to be the wrong call, then look for it.

Frame an open question so it can be shown false rather than agreed with.

CONSTRUCT THE CASE THE WORK WOULD MISS. Write the input, the file or the
sentence that the submission's own check would pass over, then look for that
family. A reviewer that only reads cannot be complete.

## Every finding names three things

A finding says which clause it fails, what is wrong, and what would satisfy it.
The engine refuses a rejection with no finding.

WHAT WOULD SATISFY IT IS THE HALF THAT GETS SKIPPED. Without it the worker
guesses at the remedy and comes back with the wrong one, and the round was
spent.

A FINDING IS A SAMPLE OF THE DEFECT, NEVER ITS EXTENT. The submission named the
files it happened to touch. Search for the defect in its own words and say how
far it reaches, in one pass, before writing the finding.

## A finding names a check that fails now

Every finding names a check that fails today and catches the class rather than
the instance. The reviewer says what that check is. The check is seen to fail
before the fix lands, and the same check passing afterwards is what closes it.

A CHECK THAT CANNOT FAIL FOR THE DEFECT IT NAMES IS NOT EVIDENCE. This queue
produced three of them in a week. One tested for a class name nothing writes,
so it passed with the defect on screen. One asserted a fact the fixture wrote by
hand, so restoring the defect left it green. One counted a word list fitted to
the sentences already deleted, so it could only ever report zero.

SO THE CHECK IS RUN AGAINST THE DEFECT BEFORE IT IS TRUSTED. Put the defect
back, watch the check go red, take the defect out, watch it go green. A check
nobody has seen fail is a check nobody has tested.

THE CHECK GOES WHERE THE DEFECT IS. A rule enforced in one language and checked
in another cannot see the thing it guards.

Ported from v3's meth-review-rounds:93-95, which reads: every finding from every
round above becomes a work token and a red check, the reviewer writes the check,
it must be red before anything is fixed, and it catches the class rather than
the instance. What v4 changes is who writes it: the worker writes the check,
because the worker is the one the engine lets write to source.

## Every rejection carries a lesson, and the engine mints it

A finding teaches one token. A lesson names the CLASS of mistake and what to do
instead, and it teaches everything after it.

A rejection with no lesson is refused. So is one with no finding.

YOU MINT THE LESSON'S TOKEN AND YOU NAME IT. Mint it with `se work`, write the
class and what to do instead into it, and put its id in `learned` on the
verdict. A rejection naming no token is refused, and so is one naming an id
that is not a token.

THE ENGINE CANNOT MINT IT FOR YOU, and that is why this is yours. Which class a
finding belongs to is a judgment. Whether a second round is a new class or the
one already written down is a judgment. And so is whether it goes to the
backlog or straight into what is open, which is the next thing you decide:
backlogged if somebody will pick it up later, open if it is small enough to do
inside the work that taught it.

A CLASS ALREADY WRITTEN DOWN IS NAMED AGAIN rather than minted twice. Look for
it before you mint, and name the one that exists.

## An acceptance says what you watched go red

A criterion carrying `**red without**` and `**red said**` is claiming somebody
watched it fail. The gate takes that claim: a criterion that passes is agreed on
the strength of the words recorded on it, and the engine no longer runs it red
for itself.

SO THE WHOLE WEIGHT OF THE GATE SITS ON A STRING, and you are the only reader of
it.

TWO OBSERVATIONS, AND THEY ARE DIFFERENT. The worker's is taken before the work,
with the fix absent, and it proves the check can fail. Yours is taken after the
work landed, by putting the defect back or by building the tree without the fix,
and it proves the check is still the one that guards the behaviour.

AT LEAST ONE, ON AN ACCEPTANCE. Accepting a token that carries a command
criterion with nothing re-watched is refused. Not every criterion, because a
cost nobody pays is a rule that gets turned off. One is the difference between
having looked and not.

    rewatched: {"<the criterion>": "without <what you took away>, it said <what it said>"}

IT LANDS IN THE NOTE, beside the evidence, because a sentence in a session that
ends is not a record.

AND NAME WHAT IT SAID, NOT WHERE IT WAS. A line number is a claim about
something nobody controls: it moves the moment anybody adds a function above it.
Name the test and the message.

MEASURED, WHICH IS WHY THIS EXISTS. In one sitting of reviewing, two recorded
observations did not survive being followed: one cited a line that had never
carried the assertion it quoted, and one cited a line guarded by a different
test entirely. Both were caught because a person happened to re-run them, and
nothing asked either reviewer to.

## Scale to the work

Deepest scrutiny goes to the riskiest part first. Risk rises where many things
depend on one thing, where a decision was reversed before, and where a person
has to judge rather than a program.

Do not red-team a one-line change.

## A checklist changes what is found, not only how much

A reviewer told to check six things checks six things. That is the failure mode
a demand list from a previous round creates: the next round verifies the list,
chases one thread, and the class of defect behind the list goes unswept.

So a round two reviewer reads the token, not the last round's findings.

This is this project's own observation rather than a result from outside it.

## One token at a time

The engine hands out one and hands out nothing new until that one is ruled on.
Pull, judge, answer, pull again.

A reviewer that reads three and rules on them together makes the person wait for
the third to hear about the first, and the first was something they could have
acted on.

## A reviewer never judges what it submitted

The engine refuses it. Four eyes that are the same two eyes are two eyes.

## Prior art

These are the findings this method rests on. Each one is stated with what is
known about it, and an estimate is marked as an estimate.

**Fagan inspection.** Michael Fagan, IBM, 1976. A formal inspection separates
roles, gives each reader a defined view, and holds a meeting whose only output
is a defect list. Its central claim is that inspection finds defects earlier and
cheaper than testing does, because a defect found at the design stage costs a
fraction of the same defect found after release. The part this method takes is
the separation of finding a defect from fixing it. An inspection that starts
proposing solutions stops finding defects.

**Reading techniques beat unaided reading.** The research line here is
perspective-based reading, Basili and others in the 1990s, and defect-based
reading before it. The result reproduced across several experiments is that a
reader given a defined procedure and a defined viewpoint finds more defects than
a reader told to read carefully. That is why the four rounds exist as four
rounds rather than as a single instruction to review the work.

**Most defects are found early in a review, and attention falls off.** The
practical guidance drawn from this in industry is to review small pieces and to
stop when attention drops rather than to press on. This is an estimate about
review length rather than a measured figure of this project.

## Where this came from

Ported from v3's `meth-review-rounds` and `meth-gate-review`, which were
themselves ported from v1's milestone-review guide. What is dropped is
everything that belonged to v3's gates and milestones, because v4 reviews a
token. What is added is the reproduce-every-measurement rule, which v4 needed
first: three of the first rejections in this project were submissions whose
numbers did not survive being recounted.
