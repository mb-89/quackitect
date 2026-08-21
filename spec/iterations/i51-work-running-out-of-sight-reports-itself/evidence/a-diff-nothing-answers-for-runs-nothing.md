---
form: a-diff-nothing-answers-for-runs-nothing
by: agent
signed_off: 2026-08-21T11:03:00.498Z
authors: agent
files:
---

# Evidence form / a-diff-nothing-answers-for-runs-nothing

## current_situation

Two places fell back to the whole battery and both were inside this one row.

WHERE NOTHING MAPPED, the engine ran everything. Where some parts mapped and some did not, it also ran everything and dropped what did map.

BOTH ARE CHANGED. Nothing mapping now answers `nothing` and names the unanswered parts. Some parts mapping now runs what maps and names the rest beside it.

THE SWEEP STILL RIDES. It is the check that reads documents and it is not the suite, so a documents-only diff still gets it — the caller runs it on the `nothing` answer rather than returning empty-handed.

THE OTHER FALLBACKS ARE UNTOUCHED. A forced flake hunt, no baseline, a standing red, an unreadable tree and the piecemeal flip all still run everything.

## built

TWO FILES CHANGED.

`deliverable/engine/discipline.ts` — `decideScope` loses both battery fallbacks. The unmapped branch and the nothing-maps branch become one `nothing` answer that names the gap, and a new partial branch runs what maps while naming what does not.

`deliverable/engine/tools-run.ts` — the `nothing` answer no longer returns before the sweep. Where the decision says sweep, the sweep runs and its result rides back.

THREE CASES PROVE IT, all in `deliverable/tests/discipline.test.ts`.

- `a documents-only change starts no test file at all` — written red at author-tests, green now.
- `the answer names every changed part that no test covers` — written red at author-tests, green now.
- `an unmapped change runs nothing from the suite and names the gap` — a STANDING case whose claim this row reverses. It read `an unmapped change buys the battery` and asserted scope `battery`; it now asserts `nothing`. Its `why` assertion is unchanged, because naming the gap was always right and only what happens after naming it moved.

MEASURED: 1722 tests, 1717 pass. The four remaining failures are this record's own reds for the handback and the account, which later chunks turn green.

## follow_up

THE NEXT CHUNK IS `the-table-holds-every-kind`, and this one shares no code with it. The scope strand was drawn connected to nothing for exactly that reason.

ONE THING IS WORTH WATCHING AT VERIFICATION. The running engine still holds the old decision in memory, so the scoped run that proved this change was itself scoped by the code it replaced. The next battery after a reload is the first to be scoped by the new rule.

THE MIDDLE PARTITION IS STILL OWED A CASE. Some parts map and some do not, so what maps runs while what does not is named. The branch exists now, so the case can be written — it was blocked before because a decision that always returned the battery could not show a partial answer.

## anything_else

ONE STANDING CASE WAS REWRITTEN RATHER THAN DELETED, and the difference matters.

Deleting it would have removed the only check that an unmapped change is NAMED. That half of its claim survives this record untouched.

WHAT CHANGED IS ONE ASSERTION AND THE NAME. The name is what a reader sees at failure, so a name still saying `buys the battery` would have been a lie sitting in the suite waiting to mislead somebody.

THE COMMENT ABOVE IT SAYS SO IN THE FILE, with the requirement id, so the next reader does not have to reconstruct why a green case changed its mind.
