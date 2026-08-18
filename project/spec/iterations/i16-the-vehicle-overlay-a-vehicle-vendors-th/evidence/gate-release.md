---
form: gate-release
bless: blessed by agent
by: agent
signed_off: 2026-08-18T21:21:51.052Z
authors: agent
files:
---

# Evidence form / gate-release

## current_situation

THE PACKAGE STANDS AND ITS ENTRYPOINT ANSWERS. `dist/quackitect-5.0.0.zip`, assembled by script in 16.4 seconds, expanded, inspected, and STARTED: `se-mcp.ts --help` ran from inside the artifact at exit 0 in 686 ms, printing this iteration's own text rather than a stale copy.

FIRST MAJOR BUMP IN THIS LINE, 4.5.0 to 5.0.0. `RUNME.ps1 --export` was a documented way in and it is removed, so a caller who depended on it breaks. That is the semver test and it agrees with the column the kickoff blessed.

WHAT THE BLESS SHIPS. Two capabilities the owner asked for: the engine makes an independent named copy of itself, and that copy makes a project it drives. Both are lane verbs, both are buttons, and both refuse before half-producing.

WHAT IT SHIPS ALONGSIDE, unhidden. The overlay does not exist. The update runner does not exist. Not one of the twenty-one must stories has a demonstration report anywhere in the corpus.

THE OWNER AUTHORISED THE WHOLE CLOSE in advance, 2026-08-18, leaving for the night: "end this iteration completely by yourself... Bless everything. Get that iteration done."

## market_block


## round_0_verify

- evidence vs claims: OPENED AT THIS MILESTONE RATHER THAN INHERITED. The package was expanded and its contents read one by one: the cage at `.claude/settings.json`, the Copilot layer under `project/.github`, the manifest reading 5.0.0, RUNME.ps1 at 25,284 bytes against 30,267 at 4.3.0 with the export block gone, and AGENTS.md and CLAUDE.md both 40,961 bytes. Then the entrypoint was RUN from inside the artifact, which no previous release did.
- types: green. The typechecker runs inside the battery and passes.
- lint: green. 289 files checked, no fixes applied, no suppression added.
- tests: 1471 of 1471 across 141 suites, zero failures. Fired by verification's own exit script AFTER the version bump and the two new demonstration specs landed, and the walk advanced past it, which only happens when that script passes. Four runs at this milestone tonight, green every time.

## round_1_validate

- exercised against the goal: YES, and now against the SHIPPED ARTIFACT rather than the working tree. The packaged entrypoint resolves, loads and answers. The owner's own end-to-end test makes a vehicle, makes a project from it, and checks the project.
- missing: THE OVERLAY, ENTIRELY, and the update runner. Both are blessed goals of this kickoff and neither has a mechanism. Also missing: an install FROM the package, which is the check this row's own method card asks for and which no release in this line has ever done.
- wrong: ONE THING FOUND WRONG AT THIS MILESTONE. A house ruling says a package proves itself with a VERSION FLAG. `se-mcp.ts` has `--help` and no `--version`, so the proof the method names cannot be run. It was found by trying to run it: the call started the server instead and timed out.
- out of scope: THE OWNER CUT THE UPDATE MECHANISM EXPLICITLY, in their own words. The overlay was not cut and simply was not built. finalize-docs and ship-review remain outside the matrix by the owner's 2026-08-11 ruling, and both wait on things that still do not exist.
- prior art: NOT COMPARED AT THIS GATE, and that is a finding rather than a blank. Packaging a versioned artifact by script is ordinary practice and no comparison was made to any tool that does it. This is the fourth release in a row to record the same gap in the same words, which is itself the signal: a gap that repeats verbatim across four gates is not being worked, it is being logged.

## goals_served

- A DESCENDANT IS A COMPLETE INDEPENDENT COPY. It comes up on a machine with nothing of the parent's beside it, and everything in it is its owner's to change in place, including the parts the parent wrote. (vp-vendoring, amended 2026-08-18. Its requirement is OWED at write-requirements — req-engine-folder-is-sealed said the opposite and is removed there on the owner's ruling.): SHIPPED IN MECHANISM, NOT IN DEMONSTRATION. Eleven cases prove the tree is complete, named once, in a repository of its own. The packaged artifact carries the cage that makes a fresh clone work at all, which verification caught being dropped. The "machine with nothing of the parent's beside it" half has still never been run.
- NOTHING A DESCENDANT DOES CAN REACH ITS PARENT. No write, no link, no mount, no install step that writes to the source. The rule names the DIRECTION OF WRITES rather than any mechanism. (raid-dec-an-import-is-read-only-and-a-vendored-copy-is-yours, minted from v2's law with its witness: a symlink and a routine cleanup deleted a repository on 2026-07-25.): SHIPPED PARTLY. Every path an agent names through a lane verb is covered, with a negative control. The engine's own 116 bare joins across 49 files are not, and the symlink and platform facets have no check at all. tsp-a-vehicle-cannot-reach-what-it-came-from now exists to demand the run that would settle it.
- THE OVERLAY WINS BY IDENTITY. Where a descendant carries a card for an identity the engine also ships, the descendant's card is served at every point that identity resolves, and an un-overridden resource is inherited. (req-overlay-resolution): NOTHING SHIPS FOR THIS. No mechanism exists and no milestone in this iteration owned it. It is the first override below and it is unchanged from the validation gate.
- IT WORKS WITH NO OVERLAY AT ALL. With none present, the product comes up on the engine's shipped method and zero builder-authored configuration files. (req-setup-serves-shipped-method): SHIPPED AND UNCHANGED. The package carries the whole method and needs no configuration. Its entrypoint answered from inside the artifact with zero files edited by hand, which is the closest thing to a proof this row has ever had.
- AN UPDATE REACHES A DESCENDANT WITHOUT TAKING ITS CHANGES AWAY. What no longer resolves is REPORTED rather than silently defaulted. HOW is the open design question of this iteration and it is not answered here. (req-overlay-survives-update, req-overlay-drift-reported, raid-risk-ownership-and-receiving-pull-against-each-other): SHIPPED HALF. The reporting exists in engine/update.ts with three cases. The runner does not, and its own header says writing one for an unspecified format would be fabrication. The owner deprioritised it.
- ONE COMMAND MAKES A DESCENDANT. The export produces a complete named copy with an empty overlay ready to write into, and no second install of anything. (req-second-product-reuses-install): SHIPPED, AND IT IS WHY THIS IS A MAJOR. The one command is now one lane verb and one button, and the old flag is removed rather than deprecated. Removing a documented way in is the breaking change the version number reports.

## bound_breaches

- if-agent-harness-to-entrypoint: BREACHED FOUR TIMES AT THIS MILESTONE, and measured each time. Leaving verification fires the battery as a SYNCHRONOUS exit script, and every crossing timed the calling se_aim out at the tool boundary. The walk had moved in each case, so the caller was told the operation failed while it had partly landed. The battery measured 63 to 65 seconds wall across the runs that were started deliberately. DISPOSITION UNCHANGED, and it is the owner's own ruling from today: it should run in the background. note-8b3ef63d1a36 carries it, paired with note-2e4cc0830192's poll verb as one design. It is engine machinery outside this iteration's scope. THIS IS THE THIRD GATE IN ONE ITERATION TO RECORD IT, which is the argument for the next record taking it rather than a fourth gate noting it.

## round_2_red_team

- STEELMAN FIRST, the strongest case against shipping 5.0.0 at all: a major version announces that the product changed shape, and what changed shape is the ability to make copies of something whose central promise — overlay without forking — still has no mechanism. Shipping a major on the half that is easy, while the half that makes it worth having is absent, spends the version number on the wrong thing. => THE COUNTER IS THE SEMVER TEST AND NOTHING ELSE. Major means a caller breaks, and one does: `RUNME.ps1 --export` is removed. The number reports a broken interface rather than an achievement, and reading it as a claim about importance is the mistake the steelman makes. The overlay's absence is recorded three times over in this form and is not softened by the version.
- THE KILL-CRITERION: this is the wrong call if the artifact cannot actually be used by somebody who receives it. => LOOKED FOR IT AND GOT CLOSER THAN ANY RELEASE BEFORE, without closing it. The entrypoint RUNS from inside the package, which proves it resolves and loads. What is still untried is the install, and the copy needs a network install because node_modules is excluded. So the answer is: further than four previous releases got, and still not the thing the row asks for.
- THE METHOD'S OWN PACKAGE PROOF CANNOT BE RUN. A house ruling says a package proves itself with a version flag; there is no version flag. => IT WAS FOUND BY TRYING IT RATHER THAN BY READING ABOUT IT, which is the only reason it was found at all. A ruling naming an affordance that does not exist is the same defect class as a gate citing a report file that does not exist, and this iteration found both on the same night.
- FOUR GATES IN THIS ITERATION HAVE NOW RECORDED THE SAME BOUND BREACH, and it is still not fixed. => THE DISPOSITION IS HONEST AND THE REPETITION IS THE PROBLEM. Recording a breach four times with the same disposition is how something becomes permanent while looking managed. Named here so the next record has the count rather than the note.
- THIS BLESS IS THE AGENT'S HAND, on the last gate of the iteration, against vp-the-ledger's target of zero agent-blessed milestone gates. => THREE OF THIS ITERATION'S GATES NOW CARRY AN AGENT'S STAMP. The owner's words authorise it and the metric counts stamps. A gate that ships a release is the one where that distinction matters most, and it is recorded rather than absorbed.

## raid_additions

- raid-debt-a-parallel-fan-is-serialised-to-get-past-the-walker
- raid-debt-i16-ships-with-its-demonstrations-unperformed

## verdict

pass with overrides — the same three the validation gate named, none of them closed since, and the package now standing on top of them.

WHAT SHIPS CLEANLY. A versioned artifact that assembles by script, carries what it should, and whose entrypoint runs from inside it. 1471 of 1471. A consistency sweep that corrected nine stale passages across the describing surfaces. Two capabilities the owner asked for, built and guarded.

FIRST OVERRIDE: THE OVERLAY DOES NOT EXIST, and it is the promise vp-vendoring is named for. The kickoff blessed it as a goal and no milestone owned it. The scope was cut by the owner mid-iteration and the goals were never trimmed to match, so the kickoff drifted off the owner rather than the walk drifting off the kickoff. That belongs in the retro.

SECOND OVERRIDE: NOT ONE OF THE TWENTY-ONE MUST STORIES HAS A DEMONSTRATION REPORT. Zero, in the whole history of the product, and six story decks plus one earlier gate cite report files that never existed. This iteration filled its four decks with what actually stands and minted the two missing demonstration specs, which is the most that could be done without a person at the machine.

THIRD OVERRIDE: THIS BLESS IS THE AGENT'S HAND, against a value proposition whose target for that is zero.

WHY IT SHIPS. The owner asked for a running engine they can build tools with, and that is what the artifact is. Every gap is recorded with its measurement and its repayment, nothing is hidden behind a green claim, and the version number tells the truth about what broke.

## follow_up

IMMEDIATELY: shipped, then idle. Then the git close the owner authorised — fetch from remote, merge everything in, and push.

### What the next session should take first

- THE MISSING DEMONSTRATION REPORTS. Zero of twenty-one, and citations to files that never existed. It is a corpus-wide evidence failure and it is larger than anything i16 built.
- THE BATTERY BLOCKING THE PULL. Four gates in one iteration recorded it. note-8b3ef63d1a36, paired with note-2e4cc0830192's poll verb.
- `--version` ON THE ENTRYPOINT. One flag, and the house's own package proof becomes runnable.

### What is newly owed

- raid-debt-a-parallel-fan-is-serialised-to-get-past-the-walker — carries its two-part fix and the missing test.
- raid-debt-i16-ships-with-its-demonstrations-unperformed — four demonstrations, one sitting, one produced vehicle, four reports to mint.
- tsp-a-vehicle-cannot-reach-what-it-came-from and tsp-a-copy-is-owned-and-still-takes-what-we-learn — both minted here, both unperformed.

## anything_else

### The one thing to read before anything else tomorrow

THE METHOD ASKED FOR TWO THINGS THAT DO NOT EXIST, and both were found on the same night by trying them rather than by reading about them.

- A ruling says a package proves itself with a VERSION FLAG. There is no version flag.
- The validation convention says every demonstration run mints a report. Not one report has ever been written, and several documents cite the paths anyway.

THEY ARE THE SAME DEFECT. A method that names an affordance nobody checked reads exactly like a method that works, right up until somebody follows the instruction.

### What the parallel agents were worth, measured

FIVE SUBAGENTS ACROSS THIS ITERATION'S CLOSE. Three swept the describing surfaces and returned nine stale passages with file and line, of which I had found two by hand. Two compiled the per-item evidence for the validation gate, and one of them found the missing reports.

EVERY ONE OF THOSE FINDINGS WAS INVISIBLE TO ME AND OBVIOUS TO A READER WITHOUT MY CONTEXT. That is the same result the tester produced at verification, in a different shape, and it is now the third time in one iteration that fresh eyes beat re-reading.

### What the close cost, so the retro has the number

THE WALK STOOD DEAD ONCE, at the demonstrations' end, with every legal move closed. Recovering took an escape to the front desk, a drawing change, a reload, and roughly thirty sweeps of twenty seconds each across the whole close — because every drift sends the walk back to the record's start and re-walks everything already signed.

FOUR OF THOSE SWEEPS TIMED OUT at the tool boundary on the synchronous battery. The poll verb and the background battery would both cut this, and they are the same design.
