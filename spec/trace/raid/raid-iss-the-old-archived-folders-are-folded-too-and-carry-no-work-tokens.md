---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-iss-the-old-archived-folders-are-folded-too-and-carry-no-work-tokens
type: "[[raid]]"
status: closed
kind: issue
statement: Every already-archived record folds as well, and none of them holds a work token, so the format must survive a field that was never written.
grade: corrosive
against:
  - req-archive-shows-it-as-it-closed
source_refs:
  - "owner ruling 2026-08-26: the aim is that no old iteration keeps a folder, so fold them too"
  - raid-dec-work-is-a-file-while-open-and-one-folded-file-once-closed
  - el-record-store
---

## CLOSED AS WORK, NOT AS A FINDING — 2026-08-26

THE OWNER NAMED THIS ONE by name: it gets fixed during the implementation, so it
is not long living and does not belong here.

NOTHING BELOW IS WITHDRAWN. The 68 records still fold and still carry no work
tokens. It becomes a work token when work tokens exist.

## What was ruled

NO OLD ITERATION KEEPS A FOLDER. Putting the old records into version control
means folding them the same way, so the archive ends with one shape rather than
two.

THIS REVERSES AN EARLIER RULING THE SAME DAY, which said the old archives would
not be touched. The newer one stands, and the reversal is recorded rather than
quietly overwritten.

## Why it is easier than it sounds

ONE SHAPE BEATS TWO. A reader that handles folded files only is simpler than one
handling both, and the two-shape world was going to be permanent.

NOTHING IS LOST. History is never rewritten, so every old folder stays reachable
at the commit that held it, exactly as a newly folded one does.

## Why it is not free

THE OLD RECORDS HOLD NO WORK TOKENS. Work tokens are what this iteration
invents, so 68 archived records were walked without them. Their folded files
carry evidence forms, machines and the route, and nothing else.

SO THE FORMAT MUST SURVIVE AN ABSENT FIELD rather than assume it. A reader that
expects work in every folded record fails on every record older than this one,
which is all of them.

THAT IS THE WHOLE OF THE DIFFICULTY. It is a format question, not a migration
question, and it is cheaper to answer while the format is still being chosen.

## What closes it

THE MIGRATION RUNS ONCE, at whatever step writes the fold. 68 records, each read
from its folder and written as one file, with the commit recorded.

THE MEASURE IS A COUNT: archived records still holding a folder, 68 today and 0
when it closes.

## The trigger

AT THE BUILD, and specifically at the step that chooses the folded format. A
format chosen against this iteration's records alone will not read the other 68.
