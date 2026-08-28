---
minted_in: i9
type: "[[raid]]"
id: raid-asm-first-time-readers-can-be-found-and-are-the-people-the-row-means
kind: assumption
statement: People who have never seen this product are assumed to be findable in enough number to measure against, and to behave like the newcomer the discoverability row is written about.
owner: the driving agent
trigger: before the discoverability row is verified, and again whenever its numbers are quoted as though they had been observed
status: open
probed: 2026-08-19
probe: asked and answered on 2026-08-19, and the answer goes against the assumption rather than for it. About four people have seen this product, and the owner is keeping it near that number deliberately - wider word of it would cost them time with people who would discuss it rather than use it. Two things follow. The population is roughly four, which cannot carry a two-in-three measure. And every one of those four has ALREADY SEEN IT, which is precisely what disqualifies a first-time reader, so the usable population is nearer zero than four. The row's measure is therefore not verifiable as written, and that is a standing choice rather than an oversight. Its numbers stay marked as a chosen bar everywhere they appear.
impact: One requirement's pass line cannot be read at all without them. Quoting its numbers without having watched anybody would turn a chosen bar into a fabricated measurement, which is the exact failure the authoring method names.
breaks_how_badly: abrasive
how_likely: expected
source_refs:
  - req-the-folder-shows-what-to-run
  - reports/rpt-ramp-up.md, whose population claims have stood at zero observations since i1
  - meth-requirement-authoring, on population measures for a hard-to-measure quality
---

## What is being assumed

THAT THEY CAN BE FOUND. The measure needs enough people for two-in-three to
mean anything, and every one of them can be used exactly once. A person who has
seen the folder is no longer a first-time reader, so the population is
consumed by measuring it.

THAT THEY ARE THE RIGHT PEOPLE. The row is about an engineer meeting the
product cold. Somebody recruited because they were nearby may be more patient,
more curious, or more willing to read a readme than the person the row means.

## Why it is an assumption and not a fact

NOBODY HAS EVER BEEN WATCHED. The ramp-up report has said so since i1, and this
iteration did not change that.

THE NUMBERS IN THE ROW ARE A CHOSEN BAR WITH THEIR REASONING WRITTEN DOWN. That
is honest, and it is also the whole exposure: a target and an observation read
identically once they are a number in a document.

## Why it is graded abrasive, and expected

ABRASIVE BECAUSE ONLY ONE ROW DEPENDS ON IT. Nothing else in the iteration
needs a person watched, and every other row is verified by a machine.

EXPECTED BECAUSE IT HAS ALREADY HAPPENED, seven iterations running. The debt
was named at i1 and has never been paid, so assuming it will be paid this time
without anybody scheduling it is the reading with the worse record.

## Probe

ASK THE OWNER FOR THREE NAMES. That is the whole probe, and it either produces
people or produces the honest answer that this row cannot be verified yet.

WHERE IT PRODUCES NOBODY, the row is not dropped. The measure is marked
unobserved wherever it appears, so nothing downstream can quote it as though
somebody had been watched.

## What must not happen

THE NUMBERS MUST NOT QUIETLY BECOME FACTS. A target that survives two documents
starts reading like a finding, and the third reader has no way to tell. Every
place the measure appears says which it is.

## Answered 2026-08-19, and the answer is a constraint rather than a result

THE OWNER WAS ASKED AND REPLIED PLAINLY. About four people have seen this
product, maybe four rather than three, and they intend to keep it there for as
long as they can.

THEIR REASON IS ORGANISATIONAL AND IT IS A GOOD ONE. Word of it reaching wider
would buy meetings with people whose interest is in discussing it rather than
using it. Low profile is a deliberate choice, not an accident of timing.

WHAT THAT DOES TO THIS ENTRY. Both halves fail, and they fail together.

- FINDABLE IN ENOUGH NUMBER: no. Four is not a population a fraction can be
  read off.
- STILL FIRST-TIME: no, and this is the sharper half. Every one of the four has
  seen it, and a person who has seen the folder is not a first-time reader. The
  population that could be measured is nearer zero.

## What should happen to the row that depends on it

ITS MEASURE SHOULD BE RECONSIDERED RATHER THAN CARRIED. A two-in-three
population measure is the right shape for a product with users and the wrong
shape for one with four people who all already know it.

WHAT WOULD ACTUALLY WORK at this scale is a single watched attempt, reported as
what one person did rather than as a fraction. One person failing to find the
launcher is a real finding. One person succeeding is not proof, and should be
recorded as not proof.

THE KIND OF THIS ENTRY IS ARGUABLY NOW WRONG. A falsified assumption becomes an
issue by the method's own rule, and this one has been falsified by an answer.
IT IS DELIBERATELY LEFT AS AN ASSUMPTION, because changing the kind drops it
out of a table a signed state already covers, and that walk-back costs more
than the classification is worth. Named here so the next register pass can make
the change when it is cheap.
