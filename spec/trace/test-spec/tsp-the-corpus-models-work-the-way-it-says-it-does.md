---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: tsp-the-corpus-models-work-the-way-it-says-it-does
type: "[[test-spec]]"
statement: The corpus and the code carry work in exactly one shape, with one word for it, one item per step, one address per item, and the times on its face.
method: inspection
verifies:
  - req-a-method-step-becomes-exactly-one-work-token
  - req-every-piece-of-work-is-one-addressable-item
  - req-settled-work-is-the-evidence-inside-a-record
  - req-every-place-work-is-modelled-is-named-in-one-list
  - req-one-word-names-one-thing-and-the-walks-marker-is-not-a-token
  - req-work-records-when-it-opened-and-when-it-closed
files:
  - none — every attribute below is examined directly in the tree, and the checklist is the whole definition
---

## Scope

WHAT IT COVERS: static attributes. Each of these rows is true or false by
LOOKING at the corpus and the code, without running anything.

WHY INSPECTION RATHER THAN TEST. A test would have to construct a tree that
violates the rule and assert a refusal, which tests the guard. These rows are
about the tree we actually have, so the cheapest method that catches them
failing is examining it.

WHAT IS OUT: behaviour. Whether minting produces one item per step at RUN time
is tested; whether the corpus says it does is inspected here.

## Checklist

Each attribute, with its pass criterion.

- ONE ITEM PER MARKED STEP. Every marked part of every card maps to exactly one
  item in the model. PASS: zero marked parts mapping to none, and zero mapping
  to more than one.
- EVERY ITEM HAS ONE ADDRESS. Each piece of work is reachable by a single
  identifier that nothing else shares. PASS: zero duplicate identifiers across
  the whole set, and zero items with none.
- SETTLED WORK IS THE EVIDENCE. Inside a record, a done item IS the evidence,
  with no second act of writing it. PASS: zero places where a settled item is
  copied into a separate evidence artifact.
- ONE LIST NAMES EVERY PLACE WORK IS MODELLED. PASS: the list exists, and every
  place the sweep finds appears on it. A place found and not listed is a fail.
- ONE WORD NAMES ONE THING. The word chosen for a piece of work is not also used
  for the walk's own marker. PASS: zero uses of the item word for the marker, in
  code, in guidance and in the corpus.
- EVERY ITEM RECORDS WHEN IT OPENED AND WHEN IT CLOSED. PASS: both fields
  present on every item that has closed, and the opened field present on every
  item at all.

## Approach

DEPTH FOLLOWS THE GRADE. Three of the six are must rows graded crippling and get
a mechanical sweep whose count is the pass line. The three `should` rows graded
corrosive get the same sweep, because the sweep is one pass over the same tree
and separating them would buy nothing.

EVERY PASS CRITERION IS A COUNT. None of these is a judgment call, which is why
they can be inspected rather than argued.
