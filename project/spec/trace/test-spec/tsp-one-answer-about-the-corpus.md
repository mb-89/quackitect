---
minted_in: i9-se-and-the-corpus-move-the-machine-state
id: tsp-one-answer-about-the-corpus
type: "[[test-spec]]"
statement: Every reader of the corpus gives the same answer about the same node, including when the answer is a failure.
method: test
verifies:
  - req-what-the-corpus-is-has-one-answer
files:
  - tests/frontmatter.test.ts
  - tests/preflight.test.ts
---

## Scope

THE FAILURE CASE IS THE WHOLE ROW. Readers agree on a good node because they
share a parsing library, and that was already probed. They disagree on a
malformed one, where one hands back nothing and another lets the failure
escape.

OUT OF SCOPE: speed. How fast the corpus is read is a different demand with a
different measure, carried by a standing assumption about the checks staying
affordable as the corpus grows.

ALSO OUT: what counts as a node. That is a definition settled by the node kinds
rather than a behaviour.

## Approach

LEVEL: component. Each reader is called directly with the same input, because
the claim is about two functions agreeing rather than about a walk.

METHOD: this is a cross-check in the Right-BICEP sense, and it is the reason
this spec exists as one collection rather than as a case bolted onto each
reader. The design is: one malformed input, every reader, compare answers
pairwise.

THE INPUT SET IS DERIVED BY EQUIVALENCE CLASS over the ways a node can be
malformed, and the classes come from what the named files already catch: an
unterminated fence, frontmatter that is not valid YAML, and no frontmatter at
all. A fourth class is added because it is the one that bit: a node that parses
but whose shape is wrong.

DEPTH: graded corrosive, and it has already happened once with both functions
and both line numbers on the record. That buys the pairwise comparison rather
than a single reader's own test.

## Steps

WHAT THE NAMED FILES ALREADY CARRY, read before this spec claimed them.
Frontmatter that does not parse refuses rather than being rewritten. An
unterminated fence is not frontmatter. A note with no frontmatter is all body.
The preflight catches an unterminated block, YAML that does not parse, and a
trace note with no frontmatter at all.

THOSE ARE EACH ONE READER'S BEHAVIOUR. Not one of them compares two readers,
which is what the row demands.

WHAT IS OWED.

- THE READERS ARE ENUMERATED, NOT LISTED. Discover every corpus reader from the
  engine rather than naming them in the test, so a reader added later joins the
  comparison instead of escaping it.
- ONE MALFORMED NODE, EVERY READER, ONE ANSWER. For each malformed class, call
  every reader and assert the outcomes are the same kind: all threw, or all
  returned the same value.
- THE FAILURE ITSELF IS COMPARED. A reader returning undefined where another
  throws fails this row, which is the requirement's own sentence and the exact
  defect that was probed.
- THE MALFORMED FILE IS NAMED. Whichever way the readers agree, assert the
  failing path appears in what comes back. Neither of the two original messages
  named it, and that is why the walk stopped somewhere nobody could find.
- A GOOD NODE STILL AGREES. Cheap, and it is the control: without it a run
  where every reader is broken the same way looks like a pass.

THE ORACLE IS THE PAIRWISE COMPARISON, never one reader's expected value.
Pinning an expected value would make this spec a test of one reader and let the
other drift, which is how the defect arrived.
