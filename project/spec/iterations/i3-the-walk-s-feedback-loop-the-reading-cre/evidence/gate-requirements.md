---
form: gate-requirements
bless: blessed by agent
by: agent
signed_off: 2026-08-13T10:47:32.106Z
authors: agent
files:
---

# Evidence form / gate-requirements

## current_situation

Design input ends here. Seven requirements stand in the resident register, all seven land on standing functions, and no new function or flow was needed.

No new element is implied, so the architecture holds and this stays a minor.

What this gate saw for the first time is the four rows written after the requirements state originally signed. They have had no earlier review.

## round_0_verify

- evidence vs claims: seven requirement rows stand, each naming a file, a note or a live observation in source_refs. Coverage is not claimed anywhere in prose — the register declares covers: use-case and derive-functions declares covers: requirement, and both refused until they were actually satisfied. One fabricated reference was caught by that check during this walk.
- types: clean. The typechecker refused four times today, each correctly, most recently on a test importing a function name that does not exist.
- lint: clean. 7 pre-existing infos, none introduced by this iteration.
- tests: 1140 of 1140, 119 suites, preflight green. Every one of the seven requirements has an executable check except the placeholder entry refusal, which is pinned by inspection and says so in its own test file.

## round_1_validate

- exercised against the goal: yes. All seven rows trace to a defect met in use rather than imagined at authoring time.
- missing: the placeholder entry refusal has no walking test. It is asserted to SHIP, not to FIRE.
- wrong: one reference was wrong and the coverage check caught it — I named a function hold-the-record that does not exist. Corrected to keep-the-record before the state closed.
- out of scope: the patch column, the mirror's rendering of a reopened step, the method-write refusal, and the editors' scope toggle. All four were raised today and all four left, deliberately.
- prior art: not compared, and the reason is honest. This is an internal harness and nobody here has run a comparable product. The mechanisms borrowed — content-keyed caching, token markings, per-column compilation — are ordinary and are cited as such rather than claimed as novel.

## round_2_red_team

- FOUR OF SEVEN REQUIREMENTS WERE WRITTEN AFTER THIS ITERATION'S REQUIREMENTS STATE FIRST SIGNED => real, and it is the sharpest finding of this gate. The delta grew while the iteration ran: the size read, the reopen frontier, the placeholder guard and the field trim all landed afterwards. The machine could not see it, because nothing measures scope against a signed upstream claim. It was found by reading the register against what had been built, by hand. That is a method hole, not an iteration mistake.
- so the requirements were written AFTER the code in four cases => true, and it inverts this milestone's whole order. The mitigation is weak and I will not dress it up: each row was written from a defect report that predates its fix, so the requirement records a demand that genuinely existed first. But the ROW was authored afterwards, and a row authored after its code tends to describe that code rather than the need.
- a gate reviewing rows the same agent wrote, at autonomy 1 => true by the owner's standing ruling. The mitigation is that every claim here cites something a reader can follow.
- the set criteria were argued once, at the first signing, and the register has grown by four since => real. The set questions were re-answered on the resubmission, but by the same hand in the same session. Nobody independent has looked at whether seven rows are consistent with each other.
- no new function was needed, which is convenient for a minor => checked rather than assumed. Every one of the seven maps onto a standing function's stated purpose, and the mapping is wired into the function nodes where the coverage check reads it. If it had been wishful, the check would still have passed — that is a limit of the check, not evidence the mapping is wrong.

## raid_additions

- [[raid-iss-scope-grew-past-a-signed-state]]

## verdict

pass — the seven rows are verifiable, traced both ways by mechanical check, and each records a demand that existed before its fix.

The reservation is recorded rather than waved. Four of the seven were authored after their code, because the delta grew past a state that had already signed and nothing in the machine noticed. That is a method hole and it is now an issue in the register with a trigger.

## follow_up

One thing rides forward, and it is not about this iteration.

A SIGNED UPSTREAM STATE DOES NOT REOPEN WHEN SCOPE GROWS BELOW IT. The rigor matrix moving reopens steps, because the demand is measured. Scope growing measures nothing, so write-requirements sat green while four mechanisms were built past it.

Recorded as [[raid-iss-scope-grew-past-a-signed-state]]. It wants a retro, not a patch.

## anything_else

