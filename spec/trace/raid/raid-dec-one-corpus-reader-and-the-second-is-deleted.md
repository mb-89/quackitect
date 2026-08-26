---
minted_in: i9
id: raid-dec-one-corpus-reader-and-the-second-is-deleted
type: "[[raid]]"
kind: decision
statement: "The second corpus reader is deleted rather than made to agree: the one place that walks trace folders itself calls the canonical loader and filters its result, so a malformed node has one answer by construction."
owner: the driving agent
trigger: any new caller that needs trace nodes, and any change to what a malformed node does
status: decided
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - req-what-the-corpus-is-has-one-answer
  - req-query-is-deterministic
  - probe P4 at i9 M4, 2026-08-19 — one loader, twenty callers, and one live second reader
---

## Rejected options

ONE READER ANSWERING FROM A STAMPED CACHE.
[[opt-one-reader-answering-from-a-stamped-cache]]. Rejected as insufficient
rather than wrong: making one reader fast does nothing about the second reader
that is not it. The two compose, and this decision is the half that was missing.

DEFINE THE AMBIGUOUS CASE RATHER THAN THE READER.
[[opt-define-the-ambiguous-case-rather-than-the-reader]]. Write down what a
malformed node IS and what every reader must do about it. Rejected because
agreement between two implementations has no enforcement, and it has already
been broken once without anybody noticing.

## Consequences

THE FORM PATH TAKES THE WHOLE CORPUS TO USE ONE FOLDER. Measured: 359 ms cold
over 1097 nodes, 11 to 13 ms once a pass holds it. A form that wanted eleven
nodes now depends on all of them being readable.

THAT DEPENDENCY GROWS WITH THE CORPUS, and the corpus has already grown from the
328 nodes the loader's own comment reasons about to 1097.

THE ANSWER FOR A MALFORMED NODE IS STILL UNCHOSEN. This decision makes there be
one place that can give an answer. Which answer, of drop, keep blank, or refuse,
is a separate choice and the requirement deliberately does not name it.

### The prior-art back-check

NO ANCESTOR, AND THAT IS A COMPLETE ANSWER. This is a defect in our own engine
rather than a re-derivation of somebody's design, and the scan for this milestone
covered install and state placement rather than corpus readers.

WHAT THE PROBE FOUND INSTEAD, which is better than an ancestor. The disagreement
is two named lines. `engine/trace.ts` line 515 DROPS a node that will not parse.
`engine/stateform.ts` line 722 KEEPS it with an empty frontmatter mapping. And
`engine/bin/preflight.ts` line 206 asserts every reader does the second, which is
false of the first. A decision resting on three line numbers needs no analogy.
