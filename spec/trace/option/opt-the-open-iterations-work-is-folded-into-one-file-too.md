---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: opt-the-open-iterations-work-is-folded-into-one-file-too
type: "[[option]]"
statement: hold the open iteration's work in one file as well, so the fold is the only shape the system ever has rather than something that happens at close
cluster: the-work
found_by: probe
source: "measured 2026-08-26, scratchpad/probe-many-files.mjs: at 400 files, one open iteration's worth, git add took 516 ms as separate files and 28 ms as one JSONL"
---

## Mechanism

ONE FILE, ALWAYS. A work token is a line in the iteration's own file from the
moment it is minted. Nothing is folded later, because nothing was ever
unfolded.

THE SYSTEM READS AND WRITES LINES. Minting appends. Settling rewrites one line.
The count per slot is a scan rather than a directory listing.

## What it buys

STAGING STOPS BEING SLOW AT THE SIZE THIS SYSTEM RUNS AT DAILY. Measured at 400
files, which is one open iteration:

- `git add` 28 ms against 516 ms, eighteen times faster
- `git commit` 49 ms against 89 ms
- `git grep` 25 ms against 29 ms

THE ARCHIVE QUESTION STOPS BEING SEPARATE. There is no second shape to convert
to, so no conversion step, no reference rewriting, and no moment where both
shapes exist.

## What it costs, and this is the owner's own objection

A PERSON CANNOT EDIT ONE PIECE OF WORK. The whole reason for choosing a file
per work token was that somebody can open it, change it and move it with the
tools they already have. A line inside a JSONL file is not that.

THE OWNER RULED ON IT DIRECTLY, 2026-08-26: the problem with folding while the
iteration is open is that the person cannot then edit the files, so this should
not be the default.

IT ALSO ARGUES WITH THE ROUND'S STANDING DEMAND that every artifact be readable
text a person can open. A JSONL line is text. It is not readable in the sense
that demand means.

## Why it is on the chart anyway

BECAUSE THE MEASUREMENT IS REAL and the design milestone should see what the
editable file actually costs. Eighteen times on the write path is the price of
that editability, and it should be paid knowingly rather than by default.

IT SETS THE FLOOR FOR ANY HYBRID. A design that keeps files but batches the
staging is arguing with this option's number rather than with its shape.

## What would make it right

A TOKEN EDITOR THAT IS THE ONLY WAY ANYBODY EDITS A TOKEN. If nobody ever opens
the raw file, the file shape stops mattering and this option's cost falls away.
That is a real design, and it is a different round.
