---
form: fix-findings
judgment: passed at 2026-08-26T16:41:32.729Z with deliverable/engine/bin/battery.ts@dcc3f61899f0
by: agent
signed_off: 2026-08-26T16:39:58.945Z
authors: agent
files:
---

# Evidence form / fix-findings

## current_situation

Verification failed with 13 findings and the walk took the fallback into here, which is the drawn path for a red battery.

### The finding that mattered most was not on the list

THE OWNER READ THE FAILED CLAIM AND SAID WE ARE NOT DONE. Both claims were addressed to a risk saying every state must mint what it owes and that machinery is undesigned.

THAT WAS ME NAMING A DEFECT AND WALKING PAST IT. The requirement exists. The crossing exists as `if-work-store-to-walk-engine`. The design spec claims to realize it. Nothing crossed it, and I recorded the failure rather than building the thing.

### Where it got lost, precisely

`specify-build` CHECKS THAT EVERY INTERFACE HAS A DESIGN SPEC. It refused me once, naming three crossings with no spec, and I cleared the refusal by adding three lines to a `realizes:` list.

NOTHING CHECKS THAT A CROSSING HAS A BUILD STEP. The chunk plan is a separate field and nothing compares it against the crossings. Seven chunks were planned and none of them was "call the store from the walk".

SO BOTH CHECKS PASSED AND THE MODEL SHIPPED INERT through trace-design, whose files all existed, and would have shipped through the gate if a corpus inspection had not happened to count something that would be zero.

THE MECHANICAL FIX IS RECORDED for the retro: the owed list is DRAWN from the specs, and the chunk plan answers it row by row.

## follow_up

The battery is the confirm run, and it is one pass over every fix rather than thirteen passes.

### What the retro owes

THE SPECIFY-BUILD GAP, with its mechanism written down. A drawn checklist of every element and crossing the design specs claim, answered by the chunk that builds each.

THE VERIFICATION MECHANISM. A failing non-test claim can only be recorded by pointing at an open register entry, and writing one needs a verb verification does not grant. Here a fitting entry happened to exist. On a run where none does, the walk stands at a state that can neither pass nor say why.

FOUR OWNER OBSERVATIONS recorded this session and unaddressed here: a kickoff goal owes a reason and a consequence, M9 should be fully mechanical, the probe cap is paid by every cloud agent, and a state's pills may not be able to change without a whole-page redraw.

### What is left in the code

THE PER-NODE ACCESS COUNT IS ONLY TWO THIRDS EXPLAINED. A removed read-pass accounts for 446 of the 653 rise; the remaining 207 is unexplained and the guard's comment says so rather than hiding it.

THE DEMONSTRATION STILL NEEDS A PERSON. Whether somebody can steer by dragging is a thing a person judges, and no test replaces that.

## anything_else

EVERY FINDING, AND WHAT WAS DONE TO IT.

### The one that was not on the list

THE CROSSING IS BUILT. `deliverable/engine/workmint.ts` derives what a position owes from the three sources the requirement names: the reading the state demands, the marked steps of its method, and the evidence it must produce.

THE PULL IS ITS ONE CALLER, because the pull is the verb that knows where the walk stands and no walk makes progress around it.

THE STATE'S OWN READING NAMES ITS METHOD CARD, so nothing has to be told which document carries the marks.

RE-ENTRY MATCHES RATHER THAN DUPLICATES, so the hook is safe to call again and a restart loses nothing. Five cases hold it.

### Breaks a stated law

1. THE ITEM PATTERN TOOK TWO DIGITS, NOT NINE. `2026)` is a year, not a list marker. The one line it minted from is unmarked.
2. THE STAMP SEEDS ITS TAKEN SET from the identities already on the card, so a part inserted above one with the same title gets its own.
3. A MINT SKIPS A KEY IT HAS ALREADY SEEN in the same list, so one file is never written twice and the report never claims two.
4. NARROWING AND GROUPING ARE BUILT. The card carries a narrowing box that filters on every field a row holds, and a checkbox per row: picked rows travel together to a destination, and the move route takes a list.

### Medium

5. SETTLED WORK IS NOT LISTED. The card lists outstanding work, which is what the count beside it counts.
6. EVERY ROW SHOWS ITS STATUS, so a done row is not identical to an open one.
7. THE CARD REDRAWS ITSELF rather than the page. It fetches its own widget and replaces its own body, then restores the folds and the narrowing. The old claim called `navigateTo`, which sets `location.href` — as destructive as the reload it replaced. The test now refuses all three of `location.reload`, `location.href` and `navigateTo(`.
8. THE FRAGMENT TITLES ARE NAMED. 25 were cut at a break the item already made — a sentence end, a colon, a semicolon or a dash — and 2 were written by hand. None was cut at a place I chose.
9. THE WORD-COLLISION COUNT was wrong twice and is recorded rather than restated: 7 was measured over code only, 12 is the tester's count, and the earlier 41 counted markdown too.

### Rough edges

10. THE REVEAL IS SLOT-AWARE. Only a bucket that could take what is carried appears, rather than every empty one.
11. THE OFFER TAKES WHAT THE CALLER ALREADY READ. `owedFrom` ends the N+1, which is passing the input down rather than caching it.
13. A REWORDING MOVES THE POINTER WITH THE STATEMENT, so `source_ref` no longer names an anchor that is gone.

### The read-once guard

ITS BASELINE WAS TAKEN INSIDE AN AUTOMATIC READ-PASS, and that pass was removed by a product law. Measured: 898 without one, 452 with one, against a recorded 245.

SO THE REMOVAL ACCOUNTS FOR TWO THIRDS OF THE GAP and the remaining third is unexplained. The comment says exactly that rather than hiding it.

THE CEILING NOW HAS BOTH TERMS. The cost is linear at 298 + 3 per node, exact at five filler counts; the old ceiling had no constant term and sat under the honest cost below 298 fillers.

AND THE MESSAGE NO LONGER NAMES A DEFECT IT HAS NOT OBSERVED. The old one said the corpus was being swept per state, which the assertion above it disproves on every run.
