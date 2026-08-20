---
form: promotions-are-own-record
by: agent
signed_off: 2026-08-16T13:02:00.399Z
authors: agent
files: null
---

# Evidence form / promotions-are-own-record

## current_situation

TWO OF THE THREE RULINGS FROM raid-dec-the-engine-runs-the-red-AND-OWNS-ITS-OWN-PROMOTIONS NOW STAND. The engine fires observe-red's checks, and the promotions sweep is scoped to the record.

THE TWO WITHDRAWALS i11 ALREADY MADE STAND TOO, as the decision says they should. Both promotions really are dead, and reverting them would cost more than it saves. What changes is that no future record is asked about them.

ONE REMAINS: `pipe-refused`, the truncating shell shape.

## built

THE PROMOTIONS SWEEP ASKS ABOUT THIS RECORD'S OWN, and nothing else.

### What the owner ruled

specify-build REFUSED i11 TWICE over promotions naming chunks of drawings that shipped with i27. The agent withdrew both, which was work nobody needed on experiments nobody was going to build.

THE RULING, in the owner's words: "A promotion does not need to survive its iteration. A promotion doesn't even have to be accessible as far as I'm concerned. We should only look at promotions from within our own iteration."

### What was already there, and the one hole

MOST OF THE SCOPING EXISTED. Two ways to know the owner — the record's fold-back, and the experiment's own `minted_in` — and an experiment stamped for ANOTHER record was already skipped.

THE HOLE WAS THE BLANK. The rule read "AN EXPERIMENT WITH NO OWNER IS IN SCOPE", justified as "absence cannot prove it belongs to somebody else, and the safe direction is to ask rather than to skip". That asking is exactly what the owner struck.

NOTHING IS LOST BY SKIPPING IT. The engine writes `minted_in` at the write, so an experiment this record minted always carries it. An unstamped one cannot be ours.

THE TWO READERS NOW AGREE. `$promotions` has always required `minted_in === owner`; the assignment law treated a blank as ours. They disagreed about exactly one case, and it was the case that refused.

### The second half, found while building the first

THE OWNER MUST BE KNOWN BEFORE ANYTHING CAN BE CALLED SOMEBODY ELSE'S.

`recordDirFor` returns undefined when it cannot resolve which record it is looking at — which is what happens in every unit fixture, because a temp root's basename names no record. The old code did `shortRecordId(only ?? basename(recordRoot))`, so an unresolvable record produced a confident owner string that matched nothing.

WITH THE STRICT RULE THAT WOULD HAVE TURNED THE LAW OFF SILENTLY — every promotion skipped, everywhere, with the suite green. That is the third time this function has been broken by reading absence as an answer, and the two earlier ones are recorded in its own comment.

SO `owner` IS NOW `undefined` WHEN UNRESOLVABLE, and the skip requires a known owner. No record named means no "ours" to compare against, so everything is asked about — which is the honest answer rather than a safe-looking silence.

### Green

40 of 40 across `requirement-checks`, `promotions-stay-home` and `trace-coverage` — run `test-msvtae1i-20`.

THE CASE DRIVES BOTH DIRECTIONS, on the same fixture. Unnamed, an unowned promotion is still asked about. Named `itx`, it is somebody else's business and the sweep is silent.

## follow_up

NOTHING BLOCKS.

ONE THING FOR `audit-the-twenty`. This function has now been broken three times by the same mistake in three different places — reading an absent value as an answer. The blank `minted_in`, the absent fold-back, and the unresolvable record are all the same shape. It is worth one pass asking whether any other law in stateform.ts treats absence as evidence.

NEXT: `pipe-refused`, then `audit-the-twenty` closes the build.

## anything_else

