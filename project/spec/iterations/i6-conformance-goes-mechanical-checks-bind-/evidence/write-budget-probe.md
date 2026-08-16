---
form: write-budget-probe
by: agent
signed_off: 2026-08-16T16:53:39.417Z
authors: agent
files:
---

# Evidence form / write-budget-probe

## current_situation

THE NUMBER IS TAKEN AND THE ASSUMPTION HOLDS. A content-only check leaves roughly two orders of magnitude of headroom inside the write's one-second budget.

THE CHUNK BUILT MORE THAN THE PROBE. Taking the number needed a check to time, and the cheapest one is the parse refusal chunk two names. Both landed together rather than the probe measuring a stub.

FIVE OF NINE WRITE-GUARD CASES NOW PASS. The four that fail are the four chunks not yet built, and every failure is assertion-red.

## built

### The code

- `project/deliverable/engine/guard.ts` — NEW. `guardParses(path, content)` and `isCorpusNode(path)`. It slices the frontmatter block out of the incoming string and hands it to the same `yaml` package four readers already import.
- `project/deliverable/engine/files.ts` — the guard is called at line 347, beside `guardMachineNote` and `guardRawNul`, which is the last point before `writeNode`.
- `project/deliverable/engine/errors.ts` — `CORPUS_UNREADABLE: "SE-C-138"`.
- `project/guidance/refusals.md` — the clause's feed-forward section, because a new clause is not done until its section stands there.

### The measurement

THE BASELINE, from the call log's own `duration_ms` over twelve consecutive writes of 2251 to 3086 bytes: 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 12, 12 ms. Median 5. Budget 1000.

THE GUARDED WRITE is timed by the case itself — `writeguard.test.ts`, "the guard leaves a write inside its one-second budget", wrapping a real lane write in `Date.now()`. It passes.

THE FULL WRITE-UP is at `evidence/write-budget.md` in this record.

### The run

`se_test` over `tests/writeguard.test.ts`, question recorded: does the parse guard refuse an unquoted colon before anything lands, and does the guarded write still answer inside the one-second budget.

9 total, 5 pass, 4 fail.

PASSING: the unquoted colon is refused and nothing lands; the refusal names the file, the line, the value and the fix; the guarded write stays inside the budget; `force` does not clear it; a sound write still lands with its hash.

FAILING: the vocabulary check (chunk 3), the report-versus-refuse seam (chunk 5), the way-forward demand (chunk 8), the whole-repo sweep (chunk 4).

## follow_up

CHUNK THREE IS NEXT — `guard-refuses-a-wrong-word`. Chunk two's demand landed with this one, because the probe needed a real check to time.

WHAT THE RUN HANDED FORWARD, beyond the number.

- EVERY FAILURE IS ASSERTION-RED, carrying `code: 'ERR_ASSERTION'`. None crashed. That is the distinction chunk eleven makes mechanical, observed by hand here.
- ONE FAILURE NAMED ITS CHUNK PRECISELY. `se_lint` refuses a directory with SE-C-046, expecting a prose file, while its own description promises a sweep over everything. Chunk four closes exactly that.

WHAT IS STILL UNMEASURED. A check that READS THE CORPUS. `rules.ts` does, and it is chunk six. This probe narrowed the question rather than closing it, and the fallback is unchanged and unused.

NOTHING IS BLOCKED.

## anything_else

### Why the probe and the parse check landed together

THE CHUNK MACHINE SEPARATES THEM and the work does not. A probe measuring the cost of a check needs a check; timing a stub would have measured the stub.

SO CHUNK TWO'S DEMAND IS SATISFIED HERE, and chunk two will find its cases already green. That is the honest record rather than re-running them for a tick.

THE ORDER STILL HELD, which is what the crowding risk's mitigation actually demands. The measurement came before anything committed to it, and no fix was touched.

### What the guard deliberately does not do

IT GUESSES ONE FIX AND ADMITS THE REST. A colon followed by a space inside an unquoted scalar is the overwhelmingly common cause, and the remedy shows the same value quoted.

WHERE THE CAUSE IS SOMETHING ELSE it says "quote the value, or check the block's delimiters" rather than inventing a confident wrong repair. A remedy that misleads is worse than one that admits its limit.

IT TESTS THE PATH, NOT THE BYTES. A markdown file under `spec/` or `machines/` is a corpus node; anything else is prose or code. Guessing from the content would refuse a document that happens to open with three dashes.

### The line number is the file's, not the block's

THE PARSER COUNTS FROM THE START OF WHAT IT WAS GIVEN, which is the frontmatter block. A reader handed "line 9" opens the file at line 9.

SO THE GUARD ADDS THE BLOCK'S OFFSET BACK. That is a small thing and it is the difference between a location and a location that helps.
