---
form: draft-vision
amended: 2026-08-26T13:06:14.506Z by agent — well adhered was a one-sided reading of 20 importers, and the probe measured 81 on the other side
by: agent
signed_off: 2026-08-26T11:08:38.303Z
authors: agent
files: null
---

# Evidence form / draft-vision

## current_situation

THE ENGINE HAS NO DOOR OF ITS OWN. 79 of its modules import `node:fs` directly.

MEASURED ON 2026-08-26, over 180 source files. 93 of them reach disk or the network directly, at 398 disk sites and 52 network sites. Engine core alone carries 117 writes and 272 reads across 50 files.

SEVEN MODULES CARRY 64 OF THE 117 WRITES. They are `session.ts`, `iterations.ts`, `run.ts`, `sessionclaims.ts`, `benchmark.ts`, `produce.ts` and `sessionforms.ts`.

ALL 64 HAVE NOW BEEN READ AND SORTED, on 2026-08-26, by this state's walker. 42 are writes a door would improve. 22 are writes a door would only lengthen. The result is written into `spec/trace/raid/raid-asm-a-door-in-front-of-the-engine-s-own-disk-access-pays-for-itself.md`.

THE WIN IS NARROWER THAN THE COUNT SUGGESTED. 23 of the 64 sites are one act: a read-modify-write of a claim, record or form file. 7 more are the `mkdirSync` that precedes one. None of the thirty replaces its file atomically, and none checks a hash before overwriting. A signature lives in some of those files.

`run.ts` IS THE CLEAN COUNTER-EXAMPLE, 0 of 10. Every write is an append to a log it owns, through three module-local helpers at lines 438, 442 and 1403 that already jail them under `.se/jobs`.

THE CONTAINMENT CHECK IS WRITTEN FIVE TIMES OUTSIDE THE JAIL THAT OWNS IT. `paths.ts` holds it, with 20 importers. `benchmark.ts`, `produce.ts`, `tables.ts`, `bases.ts` and `machines/compile.ts` each wrote their own. The two guarding a recursive delete disagree: `ownTree` at `benchmark.ts` line 195 checks `isAbsolute`, and `travels` at `produce.ts` line 77 does not.

THERE IS NO WARM MODEL AND SIX PRIVATE CACHES. `vault.ts`, `trace.ts`, `vocabulary.ts`, `rigor-matrix.ts`, `machines/compile.ts` and `iterations-draw.ts` each keep their own.

THE PATTERN IS ALREADY BUILT HERE ONCE, FOR WIDGETS. One rule, one registry, one declared hatch carrying a reason per line, two callers and no second copy. It lives at `deliverable/machines/widget-exemptions.md` and in the SE-C-146 section of `guidance/refusals.md`. Nothing generalises it.

## big_idea

Every codebase has rules like "all file access goes through this one place". A year later, forty places do it directly. Each shortcut was reasonable on the day it was taken, and nobody chose the result.

THE ONE-DOOR RULE MAKES THE RULE MECHANICAL. Each capability gets exactly one door. Code cannot reach past it. Going around is possible, but only by filing an exception that carries a written reason.

THE REASONS BECOME THE MAP. Instead of forty silent shortcuts, you get a list of forty sentences saying why. Read the list and you know where the design is bending, and whether it should.

## to_be_world

A MAINTAINER ADDS A FEATURE that has to save a file.

They write `fs.writeFileSync(...)` out of habit. The typechecker refuses before they have finished the line. The message names the door and the one call that does this job.

They use the door. It costs them one import and no thought. The file is replaced atomically, the path is checked against the jail, and the failure message is the same one every other caller gets, because there is only one of them.

A WEEK LATER THE SAME MAINTAINER HITS A CASE THE DOOR CANNOT SERVE. A long-running process needs a raw append-only stream, and the door has no shape for it.

They do not improvise. They add three lines to the exemption registry: the file, the door being bypassed, and the reason in a sentence. The refusal lifts for that one place. The build goes green.

THE REGISTRY IS SHORT AND EVERY LINE IS SOMEBODY'S SENTENCE. It is not generated. No tool wrote a line of it, so no line is there because a tool found it broken on a Tuesday.

AT THE NEXT REVIEW, the reviewer reads the registry instead of the codebase. Six entries. Four of them say the same thing about streaming appends.

THAT IS THE DESIGN TELLING THEM SOMETHING. Four sentences agreeing is a missing shape on the door, not four exceptions. They widen the door and delete four entries.

THE OWNER, LOOKING AT THE PROJECT FROM OUTSIDE, asks one question: what are we currently allowing ourselves to do that we said we would not? The answer is a file they can read in a minute.

## goal_system

The goals, most important first.

1. A DECLARED EXCEPTION BEATS AN IMPROVISED ONE. The point is not that nobody goes around the door. It is that going around leaves a sentence behind.

2. THE REASON IS THE PRODUCT. An exemption entry without a reason is not an entry. This is the one thing the prior art does not do: of six systems read at their own documentation, exactly one can force a reason, and it does so as an opt-in third-party plugin.

3. THE DOOR MUST IMPROVE WHAT PASSES THROUGH IT. A door that only forwards is a tax. Disk gets atomic replacement, a jail check and one error path. The internet gets caching and a place results are kept.

4. THE RULE MUST BE CHEAP TO OBEY. Go's internal packages are the standard here: no configuration, no linter to remember, the rule is the directory name. Where obeying is cheaper than not, the registry stays short by itself.

5. ADHERENCE IS BROAD, NOT TOTAL. The owner's own words on 2026-08-26 were one door per capability, adhered to broadly, and any door may be dismissed where it does not make sense.

### The conflicts, named

CONFLICT ONE: COVERAGE AGAINST COST. Goal 1 wants every reach through a door. Goal 3 wants each door to earn its place. These pull apart, and the probe run in this state settled which wins.

COST WINS, ON EVIDENCE. All 64 disk writes in the seven heaviest modules were read. 22 of them gain nothing from a door, and all ten of `run.ts` are in that group. A door in front of an append to a log the module owns is pure lengthening.

SO THE DOOR IS SCOPED BY WHAT IT IMPROVES, NOT BY WHAT IT COULD REACH. The 42 that do gain are dominated by one shape: 23 read-modify-writes of a claim, record or form file, with no atomic replacement and no hash check anywhere among them.

THE OBJECT TO BUILD IS THEREFORE A CLAIM WRITER AND A GUARDED DESTRUCTIVE WRITE, not a general disk facade. That is narrower than the assumption that opened this iteration, and it is what the measurement supports.

CONFLICT TWO: A SHORT REGISTRY AGAINST AN HONEST ONE. A registry nobody can add to stays short by hiding the truth, and people improvise instead.

HONESTY WINS. Filing an exception must be easy enough that improvising is the harder path. A long registry is a finding, not a failure.

CONFLICT THREE: ONE DOOR AGAINST THE DOOR THAT ALREADY WORKS. `paths.ts` has 20 importers, and five modules still wrote their own containment check anyway. THE WORD "ADHERED" WAS WRONG HERE and is removed: measured 2026-08-26, 81 modules reach the filesystem directly against 20 that import the resolver, with 15 in both sets.

THE EXISTING SEAM WINS AND GETS WIDENED. Five hand-written copies of one predicate, two of which disagree about absolute paths while guarding a recursive delete, is an argument for finishing `paths.ts` rather than for building something beside it.

## moore_pitch

FOR maintainers of a codebase whose architectural rules are eroding faster than anyone can see,

WHO need to know where the design is being bypassed and why, without reading every file,

THE ONE-DOOR RULE IS a boundary check with a reasoned exemption registry

THAT refuses direct access to a capability, and turns each bypass into one sentence in a file a person can read in a minute.

UNLIKE dependency-cruiser baselines, ArchUnit's frozen violation stores, Rust's bare `#[allow]` and Bazel's visibility lists, which all accept an exception in silence,

OUR PRODUCT will not accept one at all without a written reason, and keeps the reasons where the next person looks first.

## follow_up

1. DESIGN THE CLAIM WRITER FIRST, not a general disk facade. The probe puts 23 of 64 sites on one shape: read-modify-write of a claim, record or form file, with no atomic replacement and no hash check. That is the object with the evidence behind it.

2. FINISH `paths.ts` RATHER THAN BUILDING BESIDE IT. Export the containment predicate it already uses four times, and delete the five hand-written copies in `benchmark.ts`, `produce.ts`, `tables.ts`, `bases.ts` and `machines/compile.ts`.

3. RESOLVE THE DISAGREEMENT BETWEEN `ownTree` AND `travels` AS PART OF THAT. One checks `isAbsolute` and the other does not, and both guard a recursive delete with `force: true`.

4. DISMISS THE DOOR IN FRONT OF `run.ts`, WITH THE REASON RECORDED. 10 of 10 of its writes are appends to logs it owns, already jailed by three module-local helpers. This is the dismissal the owner invited on 2026-08-26.

5. STEAL THE EXPIRY. Rust's `#[expect]` and ESLint's unused-directive report both find an exemption that has stopped being needed. The widget precedent has no equivalent, and a registry without expiry silts up. This is the clearest borrowing available.

6. DECIDE WHETHER A RATCHET IS NEEDED. 79 engine modules import `node:fs` directly. ArchUnit's freeze exists because that number is normally too large to fix at once.

7. THE INTERNET DOOR AND THE WARM MODEL ARE UNPROBED. The disk door now has a measurement behind it and those two do not. Neither should be sized from the disk result.

## anything_else

THE ONLINE RESEARCH THE OWNER ASKED FOR IS DONE, and it is written up in full at `spec/iterations/i54-everything-exported-has-a-door-a-sweep-o/evidence/prior-art-one-door.md`.

IT WAS BLOCKED AT EVERY EARLIER STATE UNDER SE-C-110 AND IS LEGAL HERE. Six systems were read at their own documentation rather than at articles about them: dependency-cruiser, ArchUnit, ESLint with `eslint-plugin-boundaries`, Rust lint levels, Go internal packages and Bazel visibility.

THE HEADLINE: one of the six can force a reason on an exception, and it is an opt-in third-party plugin. Every other exception mechanism in the set accepts silence.

THREE THINGS THEY DO BETTER THAN WHAT WE PROPOSE, stated first per the sycophancy guard.

- EXPIRY. Rust's `#[expect]` reports itself when it stops being needed. ESLint's `reportUnusedDisableDirectives` defaults to warning. Ours has nothing like this.
- RATCHET. ArchUnit's `FreezingArchRule` gets a large codebase onto a rule gradually and shrinks the stored set as violations are fixed.
- GROUPING. Bazel's `package_group` names an exception once for many callers. A flat per-site registry repeats itself.

FOUR THINGS THE OWNER NAMED WERE NOT COMPARED, and the reason is recorded rather than the gap being filled. Ports and adapters and the anti-corruption layer are shapes, not systems people run, so neither has an exception mechanism to compare. Capability-based security was not reached at a primary source in this pass. "Architecture fitness functions" names a practice rather than a tool with a hatch.

A COMPARISON NEEDS EVIDENCE ON BOTH SIDES, and on those four we have one side only.

### One reservation, noted and not acted on

THE VISION IS WRITTEN ABOUT THE ONE-DOOR PRINCIPLE, as instructed. The falsifier pass now says the disk half of it is narrower than the principle claims: a claim writer and a guarded destructive write, not a facade over 117 sites.

THE PRINCIPLE STILL STANDS FOR THE OTHER TWO DOORS. Neither the internet door nor the warm model has been probed, and neither should inherit the disk result in either direction.
