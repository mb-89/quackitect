---
form: pipe-refused
by: agent
signed_off: 2026-08-16T13:05:21.788Z
authors: agent
files:
---

# Evidence form / pipe-refused

## current_situation

ALL THREE RULINGS FROM raid-dec-the-engine-runs-the-red-and-owns-its-own-promotions NOW STAND. The engine fires observe-red's checks, the promotions sweep is scoped to the record, and a truncating pipe is stopped rather than annotated.

WHAT THE REFUSAL DOES NOT COVER. A shape the pattern does not name — an `awk` slice, a PowerShell `[0..9]` index — still passes. The list is the shapes that have actually been seen, and it is named as that rather than as completeness.

ELEVEN OF TWELVE CHUNKS ARE BUILT. Only `audit-the-twenty` remains, and it waits on nothing that is not done.

## built

A TRUNCATING SHAPE REFUSES BEFORE THE SPAWN, and the refusal names the verb that was wanted.

### Why a refusal and not the warning that was there

THE LANE ALREADY WARNED, AND THE WARNING DID NOT WORK. `output_shaped` rode the RESULT, after the damage: "what it dropped exists nowhere — not on the result, not in the log".

IT FAILED TWICE, and the second time was in this iteration. An agent piped a test run through `Select-String` at observe-red, got exit 1 with empty stdout, and had to re-run the red to read it at all — while building the fix for exactly that.

THE OWNER: "This truncation pipe hazard thing, maybe you can fix this. I wonder why this happens so often."

### Why it happens so often, which is the part worth answering

THE PIPE IS REACHED FOR WHEN THE OUTPUT IS EXPECTED TO BE LONG. So a bare refusal would leave the caller with the same problem and no pipe. Every long thing the lane produces has a verb that answers it structured or by reference, and the remedy names the right one.

- A test run wants `se_test` — structured counts, only the failures' detail.
- A search wants `se_file_search` — it windows with `limit` and SAYS `truncated`, a cut the reader can see.
- A file wants `se_file_read` — it pages by line and refuses an oversize read rather than cutting it silently.
- Anything else: run it whole. The lane captures the FULL output under the call's ref and `se_log_query {ref}` pages it back.

### The detection had a hole, and it was the hole that bit

THE OLD SHAPE TEST DID NOT INCLUDE `Select-String`. It caught `Select-Object -First`, `head`, `tail`, `cut -c` and `Measure-Object` — and missed the one that actually destroyed output on 2026-08-16.

A FILTER AFTER A PIPE IS THE SAME TRUNCATION. `| Select-String fail` keeps the matching lines and throws the TAP summary away, and the summary is where the counts live. `select-string`, `sls`, `findstr`, `grep` and `rg` now count as shapes WHEN THEY FOLLOW A PIPE.

BEFORE A PIPE THEY ARE A DIFFERENT OFFENCE — reaching for the shell's searcher instead of the lane's — and SE-C-129 already covers that. The two rules do not overlap.

### The clause

SE-C-137, with its section in `project/guidance/refusals.md` — the pairing rule says a clause is not done until the rule stands there ahead of the refusal.

`no_tool_reason` RUNS IT ANYWAY AND LOGS WHY, the same door every other lane rule has. A refusal with no escape would just move the problem.

`annotateRun` lost its shaped branch, because nothing reaches it any more.

### Green

46 of 46 across `discipline.test.ts` and `refusals.test.ts` — run `test-msvthel1-4`.

THE CASE DRIVES ALL FOUR REMEDIES on four real commands, and then proves the escape still runs. It caught the Select-String hole on its first run: the case was written from the command that actually failed, and the implementation did not refuse it.

## follow_up

NOTHING BLOCKS.

ONE THING FOR `audit-the-twenty`, and it is the same shape as the last chunk's note. This refusal exists because a WARNING failed twice. The lane carries other warnings that ride the result — the lane-verdict ladder's first free run, the green-streak nudge, the toll's warning. Each is worth asking the same question of: has it ever changed anybody's behaviour, and if not, should it have teeth or be deleted?

NEXT: `audit-the-twenty` — the fourteen unchecked defects from the 2026-08-12 seed, read against the system i34 left, each struck with its evidence or recorded.

## anything_else

