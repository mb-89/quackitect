---
kind: guidance
---

# Reviewing

The method a reviewer works to when the owner spawns reviewers again.

## Motivation

The owner switched the review system off on 2026-09-02, and the engine
spawns no reviewer until the owner turns them back on. Workers walk their
own checklist in `behaviour.md`, and the owner will measure that before
reviewers return. This file keeps the method a returning reviewer works to.

A review answers one question: would blessing this as it stands damage the
product? Damage is the wrong thing built, a defect reaching the tree, a gate
that stops guarding, or a reader misled about what stands. Find damage and
reject with findings and a lesson. Find none and the work goes through.

Rounds are the review's cost, never its output. A finding count is not a
score, and a clean acceptance of sound work is a review that produced
everything it owed.

## Actionables

- Ask the leading question first: would blessing this as it stands damage
  the product? Damage decides the verdict and nothing else does.
- Verify: open what the evidence points at and rerun every measurement the
  decision rests on. A description of the work is not the work.
- Validate: read the token's detail whole and find the clause no section of
  the evidence answers. That clause is where the work drifted.
- Serve: name the artefacts the work produced for the token's reason, or
  name who still owes them. Nothing, and nothing to come, fails.
- Red-team: write the input the submission's own check would pass over, then
  look for that family. Cite the clause, not a feeling.
- A finding that names no damage is a nitpick. Fix it yourself, in the note
  or the work, and open no round for it.
- Every finding names the clause it fails, what is wrong, and what would
  satisfy it. Say how far the defect reaches.
- Every finding names a check that fails now and catches the class. The
  worker writes it and watches it go red before the fix.
- Mint a lesson token with `se work` on every rejection. It says how to
  catch the class and what would have stopped it.
- Accept with open points. Record each in the note or in a lesson token
  beside the acceptance.
- What an earlier round settled stays settled. Read every finding on the
  note and ask only whether the named change moved one.
- A third consecutive rejection is the review failing, not the work. Before
  sending one, name what the review itself missed.
- On either acceptance, record in `rewatched` one criterion you watched go
  red after the work landed.
- Put the deepest scrutiny where many things depend on one thing. Do not
  red-team a one-line change.
- Pull one token, judge it, answer, and pull again. Never rule on three
  together.

## Discussion

### Where this stands

The project introduced reviewers before the token template and the worker's
checklist existed, so each round judged something new. The record held 204
review rounds over 67 tokens, and the worst token took 11 rounds. The owner
switched reviewers off on 2026-09-02 and will measure the worker-only
checklist before they return. The engine still refuses a reviewer judging
its own submission, a rejection with no finding or lesson, and a draft over
the criteria ceiling. wk-24be1c06ae was too big and paid for it in rounds.
This file descends from v3's `meth-review-rounds` and `meth-gate-review`.

### Numbers and nitpicks

A number that moved is not damage. A stale count changes nothing about the
implementation, so ask whether the decision resting on it still stands. On
2026-09-01 the record showed one numbers finding raised on three tokens.
It was correct every time, and none of the three rejections changed a line.
Verify reruns every measurement because three early rejections turned on
numbers that did not survive recounting. Overcaution reads as diligence and
costs as much as carelessness.

### Rounds

A reviewer told to check six things checks six things, so a round two
reviewer reads the token and not the last round's findings. One token
repeated a finding under a new name in rounds six and seven. A third
consecutive rejection means the reviewers did not name everything at first,
did not repair what they could, or moved the bar.

### Lessons

Which class a finding belongs to is a judgment, so the reviewer mints the
lesson and puts its id in `learned`. Name a class already written down
rather than mint it twice. A lesson says how the class would be caught next
time and what practice would have stopped it. The engine refuses a lesson
carrying only the first half. The commonest class was a criterion saying
every about a set the drafter described instead of asked. wk-2b78b911b1 lost
one round to it, and that round changed no behaviour. A class found with no
damage under it is a lesson token beside the acceptance.

### Rewatched

The gate agrees a criterion on the strength of its recorded observation.
The worker's observation proves the check can fail. The reviewer's, taken
after the work landed, proves the check still guards the behaviour. In one
sitting two recorded observations did not survive being followed. One cited
a line that never carried the assertion, and one a line another test guarded.

    rewatched: {"<the criterion>": "without <what you took away>, it said <what it said>"}

### Prior art

Fagan, IBM, 1976: a formal inspection separates roles, gives each reader a
defined view, and produces a defect list. This method takes from it the
separation of finding a defect from fixing it. Perspective-based reading,
Basili and others, 1990s: a reader with a defined procedure and viewpoint
finds more defects than one told to read carefully. That is why the four
rounds are four. Attention falls off during a review, and that is an
industry estimate, not a measure.
