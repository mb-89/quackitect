---
form: gate-requirements
bless: blessed by agent
by: agent
signed_off: 2026-08-18T09:42:15.090Z
authors: agent
files: null
---

# Evidence form / gate-requirements

## current_situation

Design input ends here. Eight requirement rows, two functions, one new flow, two use cases, two stories and one value prop stand for the delta, and every assumption they lean on is either probed or unprobed with a reason.

THIS GATE CARRIES NO FIELDS OF ITS OWN, on purpose. Six once stood here and each was already settled mechanically upstream. What is left is the four rounds, and this form is only worth reading for what a check cannot say.

THE OVERRIDE BOTH PREVIOUS GATES CARRIED IS CLOSED. probe-assumptions is the first state since M0 to grant se_test, and the battery ran there: 1450 tests, 135 suites, 0 failures, biome clean over 286 files, the sweep green over 1348 nodes. Two gates said this was owed; it is now paid rather than inherited again.

## round_0_verify

- evidence vs claims: CHECKED. The claim that mattered most to this milestone was that the eight rows trace and function-cover both ways, and the engine refused the submit until they did rather than my asserting it. The claim I made myself and checked myself is the TBD sweep — run across the whole register, not only the eight new rows, and zero
- types: GREEN, and now by a run rather than by construction. The battery executes every engine file
- lint: RUN AND GREEN. biome over 286 files, clean, with --error-on-warnings
- tests: RUN AND GREEN, AND THIS IS THE LINE THAT WAS FALSE TWICE. 1450 tests, 135 suites, 0 failures. The kickoff said the battery was owed. gate-motivation said it again, inherited. probe-assumptions granted se_test and it ran there. The three files that were already green — read-probes 9, identity-collision 5, scale 13 — are inside that 1450 now, and their earlier native run is superseded rather than being carried as evidence
- the sweep: RUN AND GREEN over 1348 nodes in 346 ms. It walked 1304 at boot, so the delta added 44 nodes and cost the sweep nothing measurable
- one probe was RUN rather than reasoned: prose-inspect against a throwaway root carrying a minted option with a deliberate needle. RED, two findings, named by file and line, exit 1

## round_1_validate

- exercised against the goal: the eight rows say what the goal's own sentence says. Five demand things of the crossing, three demand that the pool is read, and the split is deliberate — the reading half is the one this iteration named as its kill criterion
- missing: NOTHING IN THE SET SAYS WHAT AN OPTION NODE'S FRONTMATTER IS. That is correct for M3 and it is the one thing a reader cannot get from the set, so it is written here rather than discovered at M7. Also missing by choice: two use-case extensions have no covering row, both named in write-requirements under `complete`, both standing register entries
- wrong: nothing found wrong in the set. One thing was WRITTEN wrong earlier and corrected before this gate — the first diagnosis of the tactical dial read the bless as a bug in a comparison, and both comparisons are deliberate. The entry was rewritten and names its own wrong version
- out of scope: the merge, the machine-evaluable wake condition, the owned queue, the surface, the routing, the migration. All six are non-goals with a register entry or a reference behind them, and none arrived through the back door at M3
- prior art: MADE AT M1 and not repeated here. What it changed is traceable rather than claimed: the duplicates risk and the fourth goal conflict came from it, and req-a-minted-option-says-what-it-is-and-when-it-comes-back names Linear's self-waking snooze as what it deliberately does NOT demand

## goals_served

- the pool travels: draining a note to backlog mints a committed, rewritten item on trunk: SERVED IN FULL AS DESIGN INPUT. req-draining-to-the-pool-mints-an-option-on-trunk carries it, with a lifecycle whose last line — `(nothing) -> minted: never` — is what says the pool has exactly one door. fn-run-a-governed-walk.mint-an-option serves it and produces flow-standing-option
- the rewrite is the privacy boundary: a raw note never enters version control, and what cannot be stated cleanly is refused rather than guessed: SERVED, AND IT IS THE ONLY FATAL ROW IN THE DELTA. req-a-minted-option-is-authored-never-the-note-s-own-text refuses a statement that appears verbatim in the note and names the text it recognised. Two assumptions stand behind it and BOTH ARE UNPROBED, which is the sharpest thing this gate has to say about itself
- an unattended walk can file into the pool, so a finding survives the box being released: SERVED. req-the-crossing-is-the-same-act-for-a-person-and-an-agent answers the question M1 left open — there is no lighter path and no status distinguishing who filed. Its verify method is inspection, deliberately, because only reading the doors proves a second one does not exist
- engine improvements: SERVED, AND MEASURED THIS MILESTONE. The battery ran for the first time on this clone and is green, which is what makes the three boot fixes evidence rather than assertion. And three standing assumptions about cloud hosts were probed by this session simply being one

## bound_breaches

- if-agent-harness-to-entrypoint: THREE calls over the one-second bound since gate-motivation signed, all of them form submits. A submit runs every check on the state before answering, which is the work rather than the overhead, and the largest was well under the boot walk. MILESTONE FOUR OF i33 OWNS THE CLASS and this gate adds no new cause
- if-test-runner-to-toolchain: the battery took about 90 seconds. That boundary declares a bound deliberately not one second, so it is not a breach — recorded because a reader counting long calls would otherwise find it and wonder
- the count is a floor, not a rate, for the same reason as at both previous gates: this clone's log starts inside this session

## round_2_red_team

- eight rows for one mechanism is a spec heavier than the thing it specifies => the fan-out was counted rather than felt: five rows on one use case is exactly the smell threshold, three facets WERE folded into one row, and the privacy line was deliberately not folded with them because it is the only fatal row and burying it in a content check would hide the demand everything rests on. A reader who disagrees with that fold has one row to argue about, not four
- the fatal row rests on two unprobed assumptions, so the hard line has nothing actually holding it up => TRUE, AND IT IS THE WEAKEST POINT IN THIS MILESTONE. Both are unprobeable today for the same honest reason — the check is not built and the pool has no content. What this gate can do is refuse to let that read as covered, which is why it is in goals_served as well as here, and why the paste probe's own entry argues for running it early rather than at fifty mints
- the whole delta could be one row and a paragraph => steelmanned properly: the mint either happens correctly or it does not, and four of the five mint rows are conditions on one act. THE ANSWER IS THE VERIFY METHODS. Four verify by test and one by inspection, and the method's own split rule is that detail verifying differently is a sibling row. The inspection row cannot be folded into a tested one without losing what it checks
- KILL CRITERION, from gate-motivation, re-asked here: this is the wrong extension if the pool is never READ => STILL NOT LOOKABLE-FOR, and now there are three rows whose failure would be exactly that. req-open-work-is-answered-from-the-repository-not-a-local-store is the one to watch, and its pass line is measured on a clone with an empty local store, which is the only condition where the failure shows
- a second kill criterion the red team adds here: if M7 finds the option node needs a shape the corpus reader cannot load, raid-asm-the-pool-is-a-node-kind-under-project-spec falsifies, the minor column is wrong and M4 has to open => named now so the escalation is visible rather than argued about later. Its probe is one third done: the sweep walks such a node, the reader and the views have not been asked
- this gate has no fields of its own, so it cannot fail on anything mechanical => that is the design, and the honest consequence is that everything above is judgment. The one thing that would have made it fail is a red battery, and the battery is the thing that had not run until this milestone

## raid_additions

- raid-asm-a-verbatim-overlap-check-catches-the-paste-that-matters
- raid-asm-the-corpus-sweep-already-covers-a-minted-option
- raid-asm-the-drain-is-the-only-door-into-the-pool
- raid-asm-a-node-file-per-option-holds-at-the-sizes-this-pool-reaches

## verdict

pass with overrides — the design input is complete, traced both ways and mechanically checked, and the one override left is a real weakness rather than a formality.

ONE OVERRIDE, carrying two register entries.

THE ONLY FATAL ROW IN THE DELTA RESTS ON TWO UNPROBED ASSUMPTIONS. req-a-minted-option-is-authored-never-the-note-s-own-text is what keeps a private sentence off trunk, and both raid-asm-a-verbatim-overlap-check-catches-the-paste-that-matters and raid-asm-the-drain-is-the-only-door-into-the-pool are unprobed. Neither can be probed today and the reason is honest — the check is not built and the pool has no content — but that means the hard line currently has an argument behind it rather than a measurement. The paste probe is owed EARLY, not at fifty mints, and the door probe is owed at M7 the moment a writer exists.

WHAT IS CLOSED THAT WAS OPEN AT BOTH PREVIOUS GATES: the full battery. 1450 tests, 0 failures. It is not carried forward again.

WHY PASS. Everything mechanical is green and checked both ways by the engine rather than by me. The override is not fixable by re-doing M3 — it is fixable by building the thing and probing it, which is M7.

## follow_up

- M7's first act on the mint is the FATAL row's test: a note, a paste, and a refusal naming the overlapping text. It is the earliest the paste assumption can be probed at all
- M7 owes the inspection that probes raid-asm-the-drain-is-the-only-door-into-the-pool the moment a writer of the option kind exists
- the option node's frontmatter shape is decided at M7 and nothing upstream constrains it beyond what the corpus reader already demands
- cloud-runner.md still claims the POSIX branch has never run, and this session falsified that; it is a guidance edit owed to whichever record takes the machine next
- M8 checks the reading half by looking at what the desk actually consults for open work, and finding .se there is the kill criterion firing

## anything_else

