---
form: gate-prototype
bless: blessed by agent
by: agent
signed_off: 2026-08-18T16:12:46.890Z
authors: agent
files:
---

# Evidence form / gate-prototype

## current_situation

M6 CLOSES HERE, and it is the milestone that made the work smaller.

TWO SPIKES RAN AND BOTH ANSWERED. Neither reopened anything, and fold-back says why in its own words: the evidence bounded an advantage rather than invalidating a score.

### What the spikes came back with

DRIVING A FOREIGN PROJECT IS ONE BRANCH. The declaration mechanism, the containment guard and the read-only rule all already sit in engine/paths.ts, and the last of those is a single `if` at line 93. What was thought to be a redesign is a flag, a route and one new guard.

A STRUCTURAL MIGRATION CAN BE A PROGRAM, so the tripwire that would have falsified the winning route does not fire. And a plain git merge already carries the case the corpus actually has, measured at MERGE_EXIT=0 on a realistic node.

### Two things blocked the milestone mechanically, and both were the same shape

grades-complete REFUSED M6 WITH 23 PROBLEMS. Register entries graded `certain`, `likely` and `annoying` where the scales offer expected, plausible, conceivable and fatal through cosmetic. The scales changed and the register was never swept against them.

AND AN AGENT QUOTED A RETIRED MECHANISM AT THE OWNER AS CURRENT. i34 decided one tree per machine and retired the worktree-and-trunk pair; the design input was never swept, so the concept survived four iterations and came back out of an agent's mouth.

BOTH ARE note-a5b270dd8a0f ARRIVING, twice in one day. It asks for a state that checks which standing requirements a change makes obsolete.

### What the owner said while this ran

THAT THE UPDATE MECHANISM IS NOT THE POINT, and getting a vehicle running so they can write tools with it is. The spikes then measured the update mechanism as cheaper than M4 priced it, which is the same conclusion arriving from the other direction.

## buildable

yes — both spikes returned answers, and the one that mattered most came back smaller than anybody expected.

WHAT MAKES IT BUILDABLE, concretely.

- DRIVING A FOREIGN PROJECT IS ONE BRANCH in engine/paths.ts. The declaration mechanism exists, the containment guard exists at lines 75 to 83, and read-only is a single `if` at line 93. A declared root gains a writable flag and resolveInRoot routes a writable root-ref into the resolver that already guards it.
- THE WINNING UPDATE MECHANISM IS EXPRESSIBLE. A real structural rename — a file moved and an identity changed inside it — was written as a what-not-where program without trouble, and the tripwire that would have falsified the whole route does not fire.
- AND GIT ALREADY CARRIES THE COMMON CASE, measured at MERGE_EXIT=0 on a realistic node. That makes the format smaller than M4 assumed rather than larger.
- THE STRUCTURE IS COMPLETE. Interface debt 0, unimplemented functions 0, idle elements 0, all computed from the nodes.

WHAT KEEPS IT FROM BEING AN UNQUALIFIED YES is one guard that does not exist and two that are untested. All three are named in the overrides, and all three are cheap.

BUILDABLE DOES NOT MEAN DECIDED. The owner has down-weighted the axis this iteration turned on, and that is a live question this gate does not close.

## round_0_verify

- evidence vs claims: TWO SPIKES, BOTH SIGNED, and every load-bearing claim is a read or a run from this session. engine/paths.ts lines 50 to 135 for the resolver. tests/roots.test.ts whole, for what the guard is actually tested for. Two throwaway git repositories with their merge exits, recorded on exp-a-structural-rename-across-a-vehicle. AND ONE CLAIM WAS CHECKED RATHER THAN CITED after it went wrong: an agent quoted a bound worktree at the owner as current, and the check found i34 had retired it.
- types: NOT RUN AND IT WOULD ANSWER NOTHING. No TypeScript changed at M6. The engine was read at four points and written at none.
- lint: NOT RUN, and se_lint is not among this state's legal tools. Everything written across M4, M5 and M6 is unlinted rather than clean, and that is the honest statement.
- tests: ONE SCOPED RUN ASKED AND HANDED OFF as job test-msyun0bj-2, whose verdict records itself. The battery belongs to verification. WHAT THE PROBES RAN INSTEAD was git in two throwaway repositories, twice, at 1.4 seconds each.
- and one mechanical gate had to be cleared before M6 could open at all: grades-complete exited 1 with 23 problems, every one a register entry graded in a vocabulary the scales no longer offer.

## round_1_validate

- exercised against the goal: BOTH SPIKES WERE EXERCISED AGAINST WHAT THE OWNER SAID THEY WANT. Driving a foreign project is the half they named for tomorrow, and it came back as one branch. The update mechanism is the half they said matters least, and it came back as smaller than scored.
- missing: THE GUARD THAT A DECLARED WRITE TARGET IS NEVER THE ENGINE'S OWN TREE. It does not exist, because nothing has ever been declarable as a write target. gate-architecture named it as override six and this spike confirms it is absent rather than unlocated.
- also missing: TWO TEST CASES for guards that already work. tests/roots.test.ts covers routing and wiring and asserts neither the read-only refusal nor the climb-out refusal.
- wrong: ONE ANSWER GIVEN TO THE OWNER WAS WRONG, and it is corrected on the record. A risk was quoted describing a bound worktree and trunk as the mechanism at issue. i34 retired that pair, and the entry is i27's. The evidence rule says an assertion about the system is checkable, so check it, and it was cited instead.
- out of scope: THE WORKTREE CLEANUP, which the owner agreed is a separate job. THE REOPEN of converge-pugh, which waits on their word. THE PROGRAM FORMAT, which is M7's.
- prior art: GIT IS THE COMPARISON AND IT WAS RUN RATHER THAN CITED. Two merges, two exit codes, one threshold identified. WHAT GIT DOES BETTER: it already exists, it is loud when it fails, and it handled the realistic case with nobody involved. WHAT THE PROGRAM ROUTE DOES BETTER: it addresses identity rather than location, so it survives a restructuring that drops similarity below git's rename threshold. WHAT WAS NOT COMPARED: any other vendoring tool's update path, because the question was git specifically and the owner asked it that way.

## goals_served

- A DESCENDANT IS A COMPLETE INDEPENDENT COPY. It comes up on a machine with nothing of the parent's beside it, and everything in it is its owner's to change in place, including the parts the parent wrote. (vp-vendoring, amended 2026-08-18. Its requirement is OWED at write-requirements — req-engine-folder-is-sealed said the opposite and is removed there on the owner's ruling.): SERVED AND UNTOUCHED BY M6. No spike bore on it.
- NOTHING A DESCENDANT DOES CAN REACH ITS PARENT. No write, no link, no mount, no install step that writes to the source. The rule names the DIRECTION OF WRITES rather than any mechanism. (raid-dec-an-import-is-read-only-and-a-vendored-copy-is-yours, minted from v2's law with its witness: a symlink and a routine cleanup deleted a repository on 2026-07-25.): SERVED, AND M6 FOUND THE ONE PLACE IT IS NOT YET ENFORCED. Once a write target becomes declarable, nothing stops somebody declaring the engine's own tree. That check is owed with the change.
- THE OVERLAY WINS BY IDENTITY. Where a descendant carries a card for an identity the engine also ships, the descendant's card is served at every point that identity resolves, and an un-overridden resource is inherited. (req-overlay-resolution): SERVED AS A DESIGN, unchanged by M6. The engine still holds zero lines of method-overlay machinery, which is correct at this milestone.
- IT WORKS WITH NO OVERLAY AT ALL. With none present, the product comes up on the engine's shipped method and zero builder-authored configuration files. (req-setup-serves-shipped-method): SERVED, and no spike touched it.
- AN UPDATE REACHES A DESCENDANT WITHOUT TAKING ITS CHANGES AWAY. What no longer resolves is REPORTED rather than silently defaulted. HOW is the open design question of this iteration and it is not answered here. (req-overlay-survives-update, req-overlay-drift-reported, raid-risk-ownership-and-receiving-pull-against-each-other): SERVED AND MEASURED FOR THE FIRST TIME. A plain git merge carries a vehicle's restructuring across an upstream rename at MERGE_EXIT=0 on a realistic node, and fails only below git's similarity threshold. The design's advantage is real and narrow, and the second measure — silent fallbacks — is still unprobed.
- ONE COMMAND MAKES A DESCENDANT. The export produces a complete named copy with an empty overlay ready to write into, and no second install of anything. (req-second-product-reuses-install): NOTHING YET — M7 OWNS IT. What M6 hands it is that the producing act needs no new path machinery, because the declaration mechanism it would use already exists.

## bound_breaches

- if-agent-harness-to-entrypoint: BREACHED, unchanged in shape and now with a second measured cause. The submit path is as recorded at the last two gates: multi-kilobyte form submits, 93 breaches in the day, worst 20.5 seconds. M6 ADDS NOTHING TO IT and did produce two calls of its own worth naming: the git probes at 1.4 seconds each, which is git doing real work in throwaway repositories and is not governed by the one-second rule. THE DISPOSITION IS UNCHANGED: the latency is the cost of writing evidence, M7 owns the write path, and the silence around a breach is now a register entry with a named hinge rather than an unfiled observation.

## round_2_red_team

- STEELMAN, the strongest case that this gate should FAIL: the owner said outright that the agent is concentrating on the wrong thing, and then the spikes confirmed it — the update mechanism the whole iteration optimised for is one git command away, and a milestone that spends its spike budget proving its own choice was over-engineered has not earned a pass => THE FACTS ARE RIGHT AND THE VERDICT IS WRONG. A spike that finds the design cheaper than assumed is a spike working. The gate asks whether the design is buildable, and it is more buildable than before, not less.
- KILL-CRITERION 1, the design cannot be built as evidenced => CHECKED AT THE CODE AND NOT FOUND. Every mechanism the winner needs either exists or is one branch from existing. The only genuinely absent piece is a guard, and a guard is cheaper than the thing it guards.
- KILL-CRITERION 2, a spike's answer invalidates the winner and nothing reopened => THE ANSWER BOUNDS RATHER THAN INVALIDATES. No score moves, both anchors hold, and re-weighting the axis with the totals visible is the poisoning cut-criteria's ordering exists to prevent. The owner's steer WOULD move it, and that is recorded as theirs rather than acted on.
- THE GUARD THE WHOLE CHANGE LEANS ON HAS NEVER BEEN EXERCISED => CONFIRMED AND IT IS THE SHARPEST FINDING HERE. tests/roots.test.ts has four cases and covers neither the read-only refusal nor the climb-out refusal. Both behaviours are implemented and neither is proved.
- THE REGISTER WAS OFF ITS OWN SCALES AND NOBODY KNEW => CONFIRMED, 23 entries, and it BLOCKED M6 mechanically. Words like certain, likely and annoying where the scales offer expected, plausible, conceivable and fatal through cosmetic. The scales changed and the register was never swept against them.
- AND THAT IS THE SECOND INSTANCE OF ONE SHAPE IN ONE DAY => CONFIRMED. i34 retired worktrees and the design input was never swept, so an agent quoted the retired concept back at the owner as current. note-a5b270dd8a0f asked for a state that checks what a change makes obsolete, and it has now been earned twice.
- THE AGENT IS BLESSING A GATE OVER ITS OWN SPIKES => TRUE AND UNMITIGATED HERE. The two clean-context readers were used at evaluate-architecture, not at M6. Both spikes were run and judged by the same hand that seeded them.
- ONE SPIKE LEFT NO EXPERIMENT NODE => TRUE AND DELIBERATE. The path-jail spike read rather than ran, so `built` is none and its finding lives in its own signed evidence. A reader looking only at the experiment folder will not find the more useful of the two answers.

## raid_additions

- none
- Both of this milestone's findings are notes rather than register entries, because both are about the corpus's upkeep rather than about the system's design.
- note-7432b8a852f6 carries the retired worktree concept, counted at 261 references in the trace corpus and 123 in the engine.
- note-beac84587cd9 carries the owner's steer and what it reprices.
- The register entry the spikes settled already existed: raid-tripwire-i16-a-structural-migration-cannot-be-written now carries its probe result and its bound.
- And raid-asm-a-vehicle-owner-reads-the-update-diff, minted at gate-architecture, is the assumption this milestone's evidence makes LESS load-bearing rather than more, because git's conflict is loud where a wrong migration is silent.

## verdict

pass with overrides — the design is buildable, both spikes answered, and five dissents are logged with it.

WHAT THE PASS RESTS ON. Two questions were asked of the world rather than of the corpus, and both came back. Driving a foreign project is one branch in a file that already contains its own guard. A structural migration is expressible as a program, and git already carries the case the corpus actually has. The structure the build will sit in has zero interface debt, zero unimplemented functions and zero idle elements.

THE MILESTONE'S BEST RESULT IS THAT THE WORK GOT SMALLER. M4 priced the update mechanism as the expensive half of this iteration. M6 measured it and found the expensive half mostly already built, by git, and the remaining part bounded to one nameable case.

### The five overrides, logged rather than waved

ONE. THE OWNER HAS DOWN-WEIGHTED THE AXIS THIS ITERATION TURNED ON. Their words: the update mechanism does not need to be mechanical, and getting a vehicle running is what matters. cand-the-program-route leads by exactly one cell on that axis. THE DISSENT: a winner chosen on an axis the owner does not value is a winner chosen on the wrong question. WHY IT PASSES: re-weighting with the totals visible is the one edit the method forbids by name, and the owner asked to get on rather than to re-decide. The reopen is one word away and note-beac84587cd9 holds it.

TWO. A GUARD THE CHANGE NEEDS DOES NOT EXIST. Once a write target is declarable, nothing stops the engine's own tree being declared, which is the fatal rule this iteration is built on. THE DISSENT: the change cannot ship without it. WHY IT PASSES: it is named, it is cheap, and gate-architecture already ordered it to arrive WITH the change rather than after.

THREE. THE TWO GUARDS THE CHANGE LEANS ON ARE UNTESTED. tests/roots.test.ts covers routing and wiring, not the read-only refusal and not the climb-out refusal. THE DISSENT: leaning on an unexercised guard is how a change becomes a hole. WHY IT PASSES: both cases describe behaviour that already exists, so both should pass on the unchanged engine, and writing them first is the recorded instruction.

FOUR. THE RETIRED WORKTREE CONCEPT RUNS THROUGH THE CORPUS AND THE ENGINE. 261 references in the trace corpus, 123 in the engine, thirteen in design input. THE DISSENT: an agent read it back to the owner as current, which is what a stale corpus does to whoever reads it next. WHY IT PASSES: the owner ruled it obsolete and agreed the cleanup is a separate job.

FIVE. THE AGENT RAN, JUDGED AND BLESSED ITS OWN SPIKES. THE DISSENT: the clean-context readers used at evaluate-architecture were not used here, and both spikes were seeded, run and ruled by one hand. WHY IT PASSES: both answers are reproducible from the record — two file reads and two merge exit codes anybody can re-run — which is a weaker guarantee than a second reader and a real one.

### What this gate does not claim

THAT THE WINNER IS RIGHT. It claims the winner is buildable. Whether it is the right winner is a question the owner has opened and this gate has deliberately not closed.

AND THAT THE REGISTER IS SOUND. 23 entries were off their own scales and nobody knew until a mechanical check refused. What else has drifted is unmeasured.

## follow_up

IMMEDIATELY: author-tests, which is M7's first state and needs meth-test-design read before it opens.

### What M7 builds, in the order the owner's priority implies

THE OWNER NAMED THE ORDER THEMSELVES: get a vehicle running so tools can be written with it. That puts the producers first and the update mechanism last, which is the reverse of how M4 priced them.

- THE TWO GUARD TESTS FIRST, because they cost almost nothing and everything else leans on them. resolveInRoot refuses a read-only root-ref; resolveDeclaredRoot refuses a path climbing out of its base. Both describe behaviour that already exists, so both should pass on the unchanged engine, and a red means the guard was never real.
- THEN THE SECOND WRITE TARGET: a permission on the declaration, one routing branch, and the guard that a declared target is never the engine's own tree.
- THEN THE PRODUCERS. el-vehicle-producer is a clone, a delete of two folders, one file written and one commit. el-project-producer writes the record the resolution seam reads.
- THE UPDATE MECHANISM LAST, and smaller than planned. Git carries the common case; the program format handles identity renames and can lean on git for the rest.

### One decision waits on the owner and does not block M7

WHETHER TO REPRICE THE AXIS THIS ITERATION TURNED ON. cand-the-program-route leads by one cell on req-overlay-survives-update, and the owner has said that axis matters less than it was scored. Acting on it means reopening converge-pugh and everything below.

IT DOES NOT BLOCK, because the first three items above are identical under either winner. The producers and the jail are not what the candidates disagreed about.

### Parked, each with what makes it ready

- THE RETIRED WORKTREE SWEEP, note-7432b8a852f6. 261 references in the trace corpus, 123 in the engine, thirteen in design input. Its own iteration, on the owner's word.
- THE SILENT-FALLBACK HALF of req-overlay-survives-update, unprobed. Ready when the overlay resolution exists to probe.
- THE COLLISION uc-vendor-and-overlay EXTENSION 3a LEGALISES — a vehicle's in-place edit meeting an update's instruction on the same line. Ready with the update mechanism.
- WHAT A VEHICLE'S IDENTITY IS. Two elements depend on it and no register entry holds it. A vehicle today is a folder with a name.
- THE SCOPED RUN handed off as job test-msyun0bj-2, whose verdict records itself.
- THE CONFIRM RUN on the retro's window fix, owed at verification since this morning.

## anything_else

