---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: tsp-a-call-record-carries-who-where-and-which-hand
type: "[[test-spec]]"
statement: A finished walk can be grouped by the model that answered, the state it stood in and the part its caller played, and a step walked below its named strength carries a reason or a mark saying none was given.
method: test
verifies:
  - req-every-call-records-the-model-that-answered-it
  - req-every-call-records-the-state-it-was-made-in
  - req-every-call-records-the-part-its-caller-played
  - req-a-weaker-driver-than-named-owes-a-recorded-reason
files:
  - tests/call-attribution.test.ts
---

## Scope

THE FOUR ROWS ARE ONE CONCERN AND THE RECORD ITSELF SAYS SO.
`req-every-call-records-the-state-it-was-made-in` carries it as a rule: every
coordinate or none, because shipping one alone looks like progress and moves
nothing. They are grouped here for the same reason.

THE FOURTH ROW IS THE READER OF THE OTHER THREE. A stated reason is only
checkable against a named strength and an actual one, so it belongs with them
rather than in a spec of its own.

OUT OF SCOPE: whether the self-reported values are TRUE. Two of the three
coordinates can only come from the caller, and the requirements demand that the
record MARK them as claimed rather than that it verify them. A test asserts the
mark is there; nothing can assert the claim is honest.

## Approach

LEVEL: unit against the call log's declared record, then integration over a short
walk. The absence being fixed was established by reading the record's own
declaration rather than by grouping — grouping by a missing key returns one
bucket, and so does grouping by any word at all, which is what
`uc-attribute-a-finished-walk` extension 2a records as the wrong measurement.

SO THE PRESENCE CASES ASSERT ON THE DECLARATION AND ON A WRITTEN RECORD, never
on a grouping alone.

DEPTH: all four graded crippling. The part-played row gets the most cases because
it has a failure mode the other two do not — a relay, where the work's author
never touched the lane.

## Steps

EVERY CASE IN THE REFERENCED FILE IS ONE STEP. What is owed:

- THE THREE COORDINATES ARE FIELDS. Assert a written record carries the model,
  the state and the part as fields of its own, not inside an argument.
- GROUPING SEPARATES. Write calls differing only in state, then only in model,
  then only in part, and assert each grouping returns the expected buckets.
- A NEGATIVE CONTROL. Assert grouping by a key nothing carries returns one
  bucket, so the passing cases above are known to be measuring something.
- THE SELF-REPORTED VALUES CARRY THE MARK. Assert the model and the part are
  marked as claimed wherever the lane cannot obtain them independently.
- THE PART COMES FROM THE WORK'S AUTHOR. File work on behalf of a delegate and
  assert the record carries the delegate's part, not the filer's. This is the
  relay case and it is the one that loses attribution outright.
- THE VOCABULARY IS CLOSED AND SEPARATES TWO HANDS. Assert a value outside the
  vocabulary is refused, and assert the vocabulary can express a walker and a
  hand it delegated to as different parts. A vocabulary in which both are the
  same value fails the requirement while looking complete.
- A WEAKER WALK CARRIES A REASON. Walk a step below its named strength with a
  stated reason and assert the record carries it.
- AND AN ABSENT REASON IS MARKED RATHER THAN REFUSED. Walk the same step with no
  reason and assert the record carries the mark saying none was given. A refusal
  here would be a different requirement.
