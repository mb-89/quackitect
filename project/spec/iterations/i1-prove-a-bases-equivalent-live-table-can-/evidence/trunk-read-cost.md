---
form: trunk-read-cost
by: agent
signed_off: 2026-08-10T19:31:01.469Z
authors: agent
files:
---

# Evidence form / trunk-read-cost

## current_situation

The seeded spike against raid-dec-thin-tree's read bet. The measurement ran on the reference machine over twenty real method files, three shapes: spawn-per-read, one long-lived batch reader, plain disk.

## built

The experiment node [[exp-trunk-read-cost]] — verdict holds, in the batch-reader shape only. Measured 2026-08-10: spawn-per-read 47 to 54 ms per file; one long-lived git cat-file batch process 2.0 ms per file (20 files, 41 ms); plain disk 0.5 ms. The finding is landed in [[raid-dec-thin-tree]]'s body, dated. The fallback stays unneeded.

## follow_up

fold-back answers the two fold keys on the experiment node; the engine's future trunk reader is built as a long-lived batch process, never a spawn per read.

## anything_else

