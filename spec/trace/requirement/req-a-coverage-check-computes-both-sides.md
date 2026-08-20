---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: req-a-coverage-check-computes-both-sides
type: "[[requirement]]"
statement: Where both sides of a coverage question stand in the corpus, the engine shall compute both and shall not ask the agent to supply either as a listing.
kind: functional
verify_method: test
breaks_if_removed: A total comparison becomes a sample the agent chose. The check goes green on a listing nobody examined, which is the paperwork failure this iteration exists to remove, running inside the machine that is meant to remove it.
breaks_how_badly: fatal
refines:
  - uc-bind-a-rule-to-what-it-governs
source_refs:
  - note-4c9a8806b8da
  - i6 write-stories evidence — the first live instance
  - i6 generalize-use-cases evidence — the second live instance
  - uc-bind-a-rule-to-what-it-governs extension 5b
priority: must
---

## Detail

MEASURED TWICE INSIDE THIS ITERATION'S OWN M2, twenty minutes apart.

## What the check does today

A field declares `covers: <type>`. The engine refuses while any node of
that type is not covered by something in the listed set.

THE COVERED SIDE IS READ FROM DISK. At write-stories the refusal named
five propositions by id. At generalize-use-cases it named twenty-two
stories by id. Neither list came from the agent.

THE COVERING SIDE IS READ FROM THE AGENT'S MESSAGE. Whatever is typed is
the candidate set.

## What that cost, measured

AT write-stories: one grep, five names added, check green. Nothing
examined.

AT generalize-use-cases: one grep, twenty-two names added, check green.
Nothing examined. Twenty-seven of the twenty-nine use cases listed had
not been read.

## The sharper half

`sty-what-a-quality-is` is refined by NINE use cases, one per ISO
quality. `sty-next-iteration` by two. `sty-work-the-register-as-a-table`
by two.

ONE OF EACH WAS PICKED, arbitrarily, and the check was satisfied. A
deliberate choice and a first grep hit are the same bytes, because the
listing is where the judgment was supposed to live and typing a name is
free.

## Why it is fixable rather than inherent

BOTH SETS ARE ON DISK. Stories are files, use cases are files, and every
`refines` edge is in frontmatter. The engine already reads one side that
way.

## What the field becomes

NOT "which nodes exist", which the corpus answers.

BUT "which nodes did THIS delta touch", which only the author knows.

THE COVERAGE VERDICT THEN COMES FROM THE GRAPH and the field carries
judgment. Today the field carries both, and the judgment is what gets
squeezed out.

## Scope of "both sides stand in the corpus"

THIS ROW DOES NOT COVER a coverage question one of whose sides is not
recorded anywhere. Where a side genuinely only exists in the author's
head, a listing is the only mechanism there is, and asking for it is
honest.

THE TEST IS MECHANICAL: can the engine enumerate it from files? Then it
must.

## Behaviour

NO MODEL WANTED. It is a rule about where a check reads its inputs.
