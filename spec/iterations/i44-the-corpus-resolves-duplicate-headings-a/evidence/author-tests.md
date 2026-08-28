---
form: author-tests
by: agent
signed_off: 2026-08-28T10:59:07.786Z
authors: agent
files: null
---

# Evidence form / author-tests

## current_situation

Five requirements need executable checks, all with verify_method test, so they take one spec.

The checks are written first and they are red. The typecheck names both reasons: `../engine/corpus-sweeps.ts` does not exist, and `REFERENCE_KEYS` is declared in guard.ts but not exported.

That red is the point. It is what the build has to turn green, and it proves the cases would notice.

## checks

- tsp-the-corpus-sweeps

## follow_up

Build the five sweeps until the ten cases go green.

The reference-key work is narrower than it looks: guard.ts already sweeps ten keys, so the requirement is widening the list and running it corpus-wide rather than writing a checker.

The repairs follow the arming, class by class, in the order the first risk fixed.

## anything_else

TEN CASES FOR FIVE ROWS, and the extra five are the negative halves. A sweep that reports everything passes a positive-only suite and is worth nothing, so every class carries at least one case that must stay silent.

ONE CASE PINS A DELIBERATE GAP. A citation carrying a line number is checked on the file and not on the line, because a line number moves on every edit above it.

WHAT WAS FOUND BEFORE WRITING A LINE OF CHECKER: `danglingReferences` already exists in guard.ts and already sweeps ten keys. The requirement is a widening, not a new mechanism, and the spec says so rather than claiming new ground.
