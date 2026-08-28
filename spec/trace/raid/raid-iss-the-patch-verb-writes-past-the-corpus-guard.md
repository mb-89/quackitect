---
minted_in: i44-the-corpus-resolves-duplicate-headings-a
id: raid-iss-the-patch-verb-writes-past-the-corpus-guard
type: "[[raid]]"
kind: issue
statement: The guard that refuses a write leaving a corpus node unparseable runs on one write verb only, so a patch or a replace lands the same break without a word.
owner: the maintainer of the machine
trigger: it has already happened; the next look is whichever iteration takes the engine
status: open
impact: The product's own promise is that a corpus break is heard at the write with the line named. Two of the three writing verbs do not keep it, and the break then surfaces calls later at a reader that cannot name the file.
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - sty-the-write-refuses-the-break
  - raid-asm-a-break-made-outside-the-lane-is-caught-by-the-sweep
weighs_with: none
weighs_against: none
---

## What was found, and how

MEASURED 2026-08-28 BY DOING IT. A patch added a sentence to an unquoted YAML
value. The sentence contained a colon followed by a space, which YAML reads as
a nested mapping.

THE PATCH REPORTED SUCCESS. It came back applied, with a new hash and two
replacements.

THE NEXT PULL THREW, naming a line and a column in a block rather than a file.
That is the same failure the standing story describes, and the same one the
guard clause was written to end.

## Where it is in the code

`deliverable/engine/guard.ts` exports `guardParses`, and the whole engine calls
it in exactly one place: `deliverable/engine/files.ts` line 420, inside
`fileWrite`.

Two other functions write corpus nodes without it.

| verb | where it writes | passes the guard |
| --- | --- | --- |
| se_file_write | files.ts line 423 | yes, line 420 |
| se_file_patch | files-patch.ts line 284 | no |
| se_file_replace | files.ts line 606 | no |

## Why this is worse than it looks

THE LANE'S OWN CARD TELLS AUTHORS TO PREFER THE PATCH VERB. It says to use
se_file_patch for every edit to source, and never to read a file whole and
write it back.

SO THE ADVISED PATH IS THE UNGUARDED ONE. The verb an author is told to reach
for is the one that does not check, and the verb that checks is the one the
card warns against.

## What would close it

`guardParses` called on the patched content in `filePatch` and on the replaced
content in `fileReplace`, before either writes. The guard already returns the
breaks the corpus carried before the edit, so both call sites can keep the
existing report-what-was-already-broken behaviour.
