---
minted_in: i5-engine-hygiene-one-version-source-every-
id: tsp-a-recorded-act-carries-its-actor
type: "[[test-spec]]"
statement: A reader draws the acting role from the record, and derives one only where the record has none.
method: test
verifies:
  - req-the-actor-is-recorded-where-the-call-is-served
  - req-acts-carry-role-and-channel
files:
  - project/deliverable/tests/actor-stamp.test.ts
---

## Scope

The call log's record and the feed's rows — the write end and the read end of
one fact.

WHY BOTH ENDS IN ONE FILE. A stamp nothing reads is not accountability, and a
reader with nothing to read cannot stop guessing. They fail as a pair and the
cases sit together.

WHY THIS LEVEL. `feedRows` is a pure function of a log and a timestamp, which
is the lowest level that can catch a wrong actor column.

## Approach

TEST-FIRST. TWO OF THE FOUR CASES ARE RED at authoring time, and the count is
recorded from the run rather than from the plan: the observation on 2026-08-19
found cases 2 and 3 red and cases 1 and 4 green.

CASE 1 WAS EXPECTED RED AND IS GREEN, which is a weakness worth naming rather
than a pleasant surprise. It appends a record carrying an actor and reads it
back, and a JSON line carries any key it is given — so the case passes before
the field exists anywhere in the type. What makes it bite is the TYPECHECK: the
record type has no `actor`, so the case does not compile until the build
declares it. The red for that half is the type gate, not the runner.

CASE 4 IS GREEN ON PURPOSE and it is not padding. It pins the FALLBACK:
records written before the stamp existed must keep reading correctly, so the
prefix rule survives as the answer for exactly those. A fix that deleted it
would rewrite history it cannot know.

## Steps

1. `a record carries the acting role the handler stated` — the stamp survives
   the append.
2. `the feed reads the role from the record, not from the tool name` — a
   lane-named tool served for a person. The prefix rule says agent, the record
   says human, and the record wins.
3. `a mirror-named tool stamped as the server's own is neither person nor
   agent` — the third role, without anybody editing a hand-kept list of names.
4. `a record with no stamp still reads` — GREEN. The fallback, pinned.
