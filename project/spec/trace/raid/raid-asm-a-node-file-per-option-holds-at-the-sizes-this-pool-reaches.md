---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: raid-asm-a-node-file-per-option-holds-at-the-sizes-this-pool-reaches
type: "[[raid]]"
kind: assumption
statement: One file per option is a workable store at the scale a single product's pool reaches, so nothing more than the corpus is needed.
owner: the driving agent
trigger: the migration, or the first time a pool answer has to be windowed
status: open
impact: It is the storage half of the minor column. If it fails the pool needs an index or a database, M4 has to open, and the change size this iteration was blessed at was wrong.
breaks_how_badly: crippling
how_likely: conceivable
probe: "HOLDS AT THE SIZE THIS ENTRY NAMES, AND THE CROSSING POINT IS NOW A NUMBER. Answering the pool costs about 300 microseconds a token and stays linear. At 205 tokens that is 62 ms. At 1000 it is 300 ms. At 5000 it is 1.9 seconds, which is past the one-second call bound, so the store crosses that bound somewhere near 3000. THE MIGRATION'S OWN BEFORE-AND-AFTER IS STILL OWED and still answers the neighbour with the same run. What is settled here is the half this entry asked about: whether a list of options is answerable when each one is a file."
probed: 2026-08-19
source_refs:
  - raid-asm-the-pool-is-a-node-kind-under-project-spec
  - raid-asm-a-migrated-pool-does-not-drown-the-corpus
  - req-a-windowed-pool-answer-says-that-it-was-windowed
weighs_with: none
weighs_against: none
---

## Probe

OWED, AND THE NUMBERS THAT EXIST POINT THE RIGHT WAY without settling it. The
sweep reads 1304 nodes in about 600 ms on this box. 205 more is a sixth, and
linear in node count.

THE PROBE IS THE MIGRATION'S OWN TIMING, and it is the neighbouring
assumption's probe too - deliberately, because one measurement answers both and
running it twice would be ceremony.

WHAT SEPARATES THE TWO ENTRIES: the neighbour asks whether the CORPUS survives
the pool. This one asks whether the POOL survives being a corpus - whether a
list of options is answerable at all when each one is a file to open. That is
why req-a-windowed-pool-answer-says-that-it-was-windowed exists, and why it is
graded should today and becomes a must the day the migration runs.

WHY conceivable. Two hundred files is nothing. This becomes plausible only at a
scale no single product's option pool has reached here, and the trigger names
the moment it would show.

## What the measurement found, 2026-08-19

THE OLD PROBE LINE SAID THIS WAS NOT PROBEABLE FROM THIS MACHINE, and gave as
its reason that the clone held three notes. That reason is stale. The clone now
holds 1019 notes and the pool holds 24 minted tokens.

WHAT WAS MEASURED. The work a pool answer does, which is opening every file and
taking its frontmatter keys. Once against the real pool, then against synthetic
pools built from a real token so the file size is the real file size.

| tokens | one answer | per token |
| --- | --- | --- |
| 24 (real) | 0.9 ms | 38 us |
| 205 | 61.9 ms | 302 us |
| 1000 | 299.6 ms | 300 us |
| 5000 | 1945.3 ms | 389 us |
| 20000 | 7391.0 ms | 370 us |

IT IS LINEAR AND THE CONSTANT IS ABOUT 300 MICROSECONDS. Nothing degrades; the
cost is just the file opens.

## What that settles and what it does not

AT THE SIZE THIS ENTRY NAMES IT IS NOT CLOSE. Two hundred and five tokens
answer in 62 ms, and the entry's own "two hundred files is nothing" was right.

THE CROSSING POINT IS NEAR THREE THOUSAND. That is where one pool answer passes
the one-second call bound, and it is the first number anybody has for it.

SO `req-a-windowed-pool-answer-says-that-it-was-windowed` HAS A TRIGGER RATHER
THAN A FEELING. It is graded should today and becomes a must when the pool
approaches three thousand, which at the rate the inbox drains is a long way off.

WHAT IS STILL OWED, unchanged. The migration's own before-and-after on the
sweep, the conformance pass and one reference view. That measurement answers
the neighbouring entry too, and running it twice would be ceremony.

WHAT THIS MEASUREMENT IS NOT. It reads the pool folder alone. It says nothing
about what 205 more nodes do to a whole-corpus sweep, which is the neighbour's
question and a different one.
