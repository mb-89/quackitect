---
minted_in: i51-work-running-out-of-sight-reports-itself
id: opt-a-standing-is-one-closed-word
type: "[[option]]"
statement: a step's standing is one value from a closed set of three, so a reader cannot express passed-and-also-deciding and cannot forget the third case, rather than a boolean with a flag beside it
cluster: cluster-the-standing
found_by: heuristic
source: "the heuristics \"make the illegal unrepresentable, not merely checked\" and \"the default should be the safe thing\", from meth-heuristics-catalog"
---

## Mechanism

ONE FIELD, THREE WORDS, NOTHING ELSE. A step is passed, not passed, or
deciding.

THE ALTERNATIVE IS THE OBVIOUS ONE AND IT IS WRONG. Keep the existing boolean
and add a flag saying a check is running. That is four states on paper, two of
which are nonsense: passed-and-deciding, and not-passed-and-deciding-and-
already-failed.

A closed set of three cannot express either.

## Why both heuristics point the same way

MAKE THE ILLEGAL UNREPRESENTABLE. A boolean plus a flag needs a rule saying
which combinations are legal, and a rule needs a check, and a check can be
skipped. A three-word set needs no rule at all.

THE DEFAULT SHOULD BE THE SAFE THING. A reader that does not know the third
word must not silently see a passed. With a boolean plus a flag, a reader that
ignores the flag reads passed, which opens a gate on evidence that does not
exist. With one closed word, the same reader sees a word it does not
recognise.

THE FAILURE MOVES FROM SILENT TO LOUD, and that is the whole argument.

## What it buys against the register

`raid-risk-a-hop-that-finishes-later-makes-green-ambiguous` is graded crippling
because three readers each inherit a third case. This does not remove the
third case; it makes forgetting it visible at the first reader that tries.

## What it costs

EVERY EXISTING READER OF A BOOLEAN CHANGES. There is no way to add a third
value to a two-value type without touching what reads it, and pretending
otherwise is what the flag design is for.

That cost is the reason this iteration is sized `major`, and this option pays
it deliberately rather than deferring it into a rule nobody enforces.

## What it does not decide

It does not say what each reader should DO with the third word. A gate might
refuse, a route drawer might treat it as not-yet, and a panel might paint it
differently. This option only makes each of them state an answer.
