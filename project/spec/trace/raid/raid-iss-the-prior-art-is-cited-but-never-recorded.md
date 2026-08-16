---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: raid-iss-the-prior-art-is-cited-but-never-recorded
type: "[[raid]]"
kind: issue
statement: This iteration's prior art is named in three places and recorded in none — the reference glossary holds no entry for fitness functions, ArchUnit, or Ford, Parsons and Kua.
owner: the driving agent
trigger: at probe-assumptions, which is the one remaining state on this walk that can reach the web
status: open
impact: Every downstream claim about what ArchUnit does, or what our shape sheds against it, rests on one sentence in a note from 2026-07-28 with no URL and no version. That is the shape of evidence with the evidence removed, and the owner ruled against exactly it on 2026-08-06.
breaks_how_badly: crippling
how_likely: certain
source_refs:
  - note-d7a26094f592
  - project/spec/references/
  - i6 record vision — "Prior art already researched"
---

## What is claimed, and where

THREE PLACES CITE THE SAME PRIOR ART.

- The i6 record vision: "Fitness functions per the parked design
  (note-d7a26094f592): architectural conformance as checks that run
  every time - ArchUnit's shape, bound to el- elements and dsp- specs.
  Prior art already researched: Ford, Parsons and Kua; the Thoughtworks
  article."
- `note-d7a26094f592` itself, dated 2026-07-28: "PRIOR ART, already
  researched: Ford, Parsons and Kua on evolutionary architecture; the
  Thoughtworks fitness-function article; ArchUnit as the concrete form
  (architecture conformance written as ordinary unit tests)."
- The kickoff gate's round 1, which said the comparison was owed and
  named where.

## What is recorded

NOTHING. `project/spec/references/` holds 25 reference nodes carrying
title, url, kind, version, accessed and tags. Searched for `fitness`,
`ArchUnit`, `Ford`, `Parsons`, `Kua`, `conformance` and `architecture`:
20 hits, none of them an entry for any of the three.

The nearest neighbours are `ref-boehm-cost-of-change` and
`ref-sya-program`, which are about something else.

## Why it matters here specifically

THE ARCHITECTURE IS BORROWED FROM IT. "ArchUnit's shape" is the design,
and the design decides where checks live and how they bind.

ONE CHARACTERISATION IS DOING ALL THE WORK: "architecture conformance
written as ordinary unit tests". If that is right, it is also the source
of this iteration's central departure — a unit test has a second to
spare and a write does not. The whole delta hangs on a parenthesis in a
note.

NOBODY HERE HAS RUN IT. That is not a criticism of the choice; it is a
statement of what the evidence is.

## What closes it

A REFERENCE NODE for each of the three, carrying url, version and
accessed, per the glossary's existing shape.

AND ONE COMPARISON THAT NAMES BOTH SIDES: what ArchUnit's shape does
better than running at the write, and what running at the write sheds.
"They run in a test suite and we run in a verb" is the axis; the
evidence for the first half has to come from a primary source rather
than from us.

## Where it closes

AT `probe-assumptions`, M3. It is the only remaining state on this walk
whose `legal_tools` include `se_web_search` — checked against all 52
rigor-matrix rows, which grant it at four states, three of which are
behind us or struck at minor.

THAT IS NOT AN ACCIDENT WORTH LIVING WITH. A milestone that positions
against prior art and a milestone that can reach prior art should be the
same milestone. Noted for the retro rather than fixed here.

## Half answered at probe-assumptions, 2026-08-16 — still OPEN

ONE OF THE THREE IS NOW RECORDED. `ref-archunit` stands in the glossary
with its url, its accessed date and what its own pages claim.

THE COMPARISON IS NOW MAKEABLE ON ONE AXIS, and it is the axis this
iteration turns on.

- ARCHUNIT ANALYSES COMPILED BYTECODE, in a test suite, and a failing
  rule fails the build.
- OURS CHECKS THE CONTENT BEING WRITTEN, before it lands.

WHAT THEIRS DOES BETTER, stated first as the guard demands. It needs no
new runner and no new report surface — it rides the test framework every
Java team already has. And bytecode cannot lie about what the code does,
where text can.

WHAT OURS SHEDS. The compile step and the wait for it.

THE BORROWED CHARACTERISATION SURVIVED CONTACT. note-d7a26094f592 from
2026-07-28 called it "architecture conformance written as ordinary unit
tests". Its own pages agree.

## What is still owed

TWO OF THE THREE SOURCES ARE STILL UNRECORDED — Ford, Parsons and Kua on
evolutionary architecture, and the Thoughtworks fitness-function
article.

AND NOBODY HERE HAS STILL RUN ARCHUNIT. Everything recorded is what its
documentation claims. That is evidence a feature is CLAIMED and nothing
more, and no judgment about quality rests on it.

## One thing the probe found on the way

`se_web_search` REFUSED with SE-C-106 — no SE_BRAVE_API_KEY in the
server's environment. The lane's own search verb cannot search.

The research was done through the natively-allowed WebSearch instead,
which the contract permits in as many words and which reaches the feed
through a hook.

SO THE ROUTING HELD, but the lane verb that four rigor-matrix rows list
as legal is inert until a key is configured. That is the owner's to set,
and it is why this entry is part-closed rather than closed.