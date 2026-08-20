---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: req-a-value-outside-its-vocabulary-refuses
type: "[[requirement]]"
statement: When a write carries a frontmatter value outside the vocabulary its key declares, the engine shall refuse it before anything lands, naming the key, the value it got and the whole allowed list.
kind: functional
verify_method: test
breaks_if_removed: A node that parses perfectly carries a word nothing accepts. Every check reading that key silently drops the node, and the break surfaces states later naming a file that is fine.
breaks_how_badly: fatal
refines:
  - uc-keep-the-corpus-sound-at-the-write
source_refs:
  - req-a-write-that-breaks-the-corpus-refuses
  - i6 gate-requirements evidence — the eleven-call trap
  - raid-iss-a-write-can-leave-the-corpus-unparseable
  - "owner ruling 2026-08-16: the trapped-walk fix belongs in this iteration's implementation"
priority: must
---

## Detail

THIS ROW IS THE ONE `req-a-write-that-breaks-the-corpus-refuses` SENDS
AWAY. Its own Scope section says a node that parses and says something
wrong is a different row. This is that row.

THE DIFFERENCE IS WHERE THE ERROR LIVES. A parse failure is in the
SYNTAX and any reader hits it. A vocabulary failure is in the VALUE, the
document loads perfectly, and only the check that knows the key's list
can see it.

## The failure that produced this row, measured

OBSERVED 2026-08-16 on this iteration's own walk.

A raid node was written with `status: part-closed`. The allowed list is
open, probed, mitigated, accepted, deferred, closed, decided,
superseded. `part-closed` is not on it.

THE WRITE WAS ACCEPTED and returned a hash. Four states later the walk
could not leave `probe-assumptions`, and the refusal named
`identify-assumptions` — a state that was entirely fine.

ELEVEN CALLS TO RECOVER. Three of them ran a remedy that could not work,
because it named the FIRST fallen input rather than the root. Two calls
of `se_why`, walking the chain, ended it.

ONE REFUSAL AT THE WRITE would have cost nothing. The list is
enumerable, the value was wrong the moment it was typed, and the check
that eventually caught it printed all eight allowed words in its own
message.

## What the refusal must carry

THREE THINGS, and the third is what makes it a remedy.

- THE KEY. Which field carries the bad value.
- THE VALUE IT GOT, quoted back.
- THE WHOLE ALLOWED LIST. Not a count and not the nearest match — a
  reader picking from eight words needs the eight words.

## Why it is graded fatal

THE CORPUS READS AS SOUND AND IS NOT. A parse failure announces itself
loudly at the first reader. This one is silent: every check reading the
key sees a value it does not recognise and drops the node from whatever
it was computing.

SO THE DAMAGE IS A WRONG ANSWER RATHER THAN AN ERROR, and a wrong answer
that looks like a right one is the worse of the two.

## Scope

ONLY KEYS THAT DECLARE A VOCABULARY. A free-text field has no list and
this row says nothing about it.

THE LIST COMES FROM THE SAME PLACE THE LATER CHECK READS IT. If the
write guard and the downstream check disagree about the vocabulary, the
guard is a false assurance — the same shape as
`raid-asm-one-parser-decides-what-parses`, one level up from syntax.

## Behaviour

NO MODEL WANTED. One membership test on one value.
