---
form: gate-release
bless: blessed by agent
by: agent
signed_off: 2026-08-19T19:06:40.312Z
authors: agent
files:
---

# Evidence form / gate-release

## current_situation

The archive stands, it was unpacked and checked, and building it found a defect that only building it could find.

`dist/quackitect-4.6.0.zip` — 592 files, 8.2 MB, version 4.6.0. Before the fix it staged 30227 files and 238.9 MB.

THE DEFECT IS COMMITTED ON ITS OWN, as 3bb8299d, touching only `engine/bin/package.ts`. Other clones can cherry-pick it without taking anything else from this iteration, and the commit body says so.

EVERY UPSTREAM CLAIM STANDS. 1456 tests green, typechecker and linter clean, three gates signed, the sweep signed. One gap ships as owner-accepted debt.

## market_block


## round_0_verify

- evidence vs claims: CHECKED against the unpacked archive rather than the repository. Six load-bearing paths present, `.worktrees` absent, `project/spec` holding 0 entries, packaged version 4.6.0.
- types: GREEN. `npx tsc -p . --noEmit` exits 0.
- lint: GREEN. `npx biome check --error-on-warnings .` exits 0 over 312 files, no suppressions in the engine tree.
- tests: GREEN. 1456 tests, 140 suites, no failures, run twice through verification.

## round_1_validate

- exercised against the goal: PARTLY. The archive was unpacked and inspected. `se-arrive.ts` was NOT run against it, so this proves a receiver gets the right files, not that the arrival fires. i35 did the stronger check and this run did not.
- missing: THE BEHAVIOURAL BOOT, above. Also the two unwired modules, which ship computing answers nothing asks for.
- wrong: THE PACKAGE STEP ITSELF. It is a per-platform script shelling out to PowerShell or to a `zip` binary, with no lane verb, and a cancelled run leaves an orphan holding its own output.
- out of scope: THE WEB VERBS, still open on the earlier debt entry.
- prior art: UNCHANGED FROM THE IMPLEMENTATION GATE, where the harness registry was argued against terminfo and browser feature detection with each citation's status stated. Packaging added no new mechanism to compare.

## goals_served

- Measure what every supported host actually provides.: SERVED, and it is in the shipped archive as `engine/harness.ts` with its provenance fields.
- Close the five measured harness breaks in the prepared brief.: SERVED IN PART. Six chunks shipped. The stopping-layer break is computed but unreported, which is the debt.
- Make the lane report which harness it is talking to.: SERVED. Every record carries its client and harness, or is left unstamped.
- Make future boots quicker by removing the test-metadata recovery step from the manual boot path.: SERVED.
- Make oversized pull results recoverable through the lane instead of host files.: SERVED, and used throughout this session to read this walk's own answers.

## bound_breaches

- if-agent-harness-to-entrypoint: BREACHED, and worse at this state than at any other. Four crossings at the implementation gate ran long, all spawning verbs. Packaging added several more: the assembly job ran 118 seconds, and earlier attempts ran past 180. DISPOSITION: no fix here. `raid-iss-the-one-second-bound-counts-calls-that-spawn-external-work` holds the open question of whether the bound governs spawning verbs at all. What packaging DID surface is separate and worse: a cancelled call leaves its child running, so the lane loses the very thing it is supposed to own. That is emitted back to the method.

## round_2_red_team

- THE STRONGEST CASE AGAINST SHIPPING => Two `must` requirements are unmet and the archive was never booted. Shipping teaches that `must` is negotiable and that `checked by using it` can mean `checked by reading it`. Both charges are fair. What answers them is that neither is hidden: the gap is a dated register entry with a repayment plan, and the weaker check is written into the package form's own `works` field rather than glossed as a yes.
- THE KILL CRITERION => It would be wrong if the archive does not boot. That is untested here and is the first item of follow_up. Nothing else in this iteration depends on it, and the fix would be a package change rather than a product change.
- THE PACKAGING FIX COULD BE MASKING SOMETHING => Excluding a directory to make a build fast is what a lazy fix looks like. It is not one: `project/spec` was already excluded so records stay home, and every worktree carried its own copy of those records straight past that rule. The exclusion restores an intent that was already stated. Measured, not asserted: 238.9 MB to 8.2 MB, and 0 entries under `project/spec` in the unpacked archive.
- WHAT WOULD HAVE CAUGHT IT EARLIER => A size assertion, not another name in a set. Two releases running have shipped a defect caused by an exclude-by-name list — i35 filtered out the file that fires the arrival, i36 nearly shipped every past iteration's worktree. The list is the wrong shape and that is emitted back to the method.
- THE ORPHANED-CHILD BUG IS THE REAL SCAR => Four cancelled calls each left a node process holding the output zip, and every retry died with EPERM until it was killed by process id. The lane starts the child and does not own it. That is a lane defect, not a packaging one, and it will bite any long command.

## raid_additions

- raid-debt-two-must-requirements-compute-a-result-that-reaches-no-surface
- raid-iss-the-one-second-bound-counts-calls-that-spawn-external-work

## verdict

pass with overrides — THE PACKAGE STANDS. `dist/quackitect-4.6.0.zip`, 592 files, 8.2 MB, version 4.6.0, unpacked and checked, carrying the arrival wire that i35 shipped broken. The defect this state found is fixed and committed on its own as 3bb8299d so other clones can take just it. THE OVERRIDES, both carried from the validation gate and neither new here. Two `must` requirements compute an answer that reaches no surface, held as `raid-debt-two-must-requirements-compute-a-result-that-reaches-no-surface`. And the archive was checked by reading rather than by booting, which is weaker than i35's standard and is written into the package form and into follow_up. THE DISSENT: on those two requirements alone the honest ruling is fail, and the unrun arrival boot means `works: yes` is narrower than this row intends. THE OVERRIDE IS THE OWNER'S, given on 2026-08-19 with the gap described in front of them. The bless ships it.

## follow_up

THE ARRIVAL BOOT IS OWED BEFORE ANYONE RECEIVES THIS. The package state checked the archive's contents, not its behaviour. i35 drove `se-arrive.ts` end to end in an unpacked copy and that is the stronger check. READY WHEN the next session opens.

THE DEBT ENTRY IS THE FIRST WORK AFTER THE RETRO. `raid-debt-two-must-requirements-compute-a-result-that-reaches-no-surface` carries four repayment items and one contradiction to settle at the requirement first.

THE RETRO IS NEXT AND IT IS OWED SEVENTEEN NOTES. Three matter most: the machine cannot see an unwired module, a long command must never block the lane, and packaging wants to be an engine verb rather than a per-platform script.

## anything_else

