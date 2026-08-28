---
form: gate-prototype
bless: blessed by agent
by: agent
signed_off: 2026-08-26T13:42:33.518Z
authors: agent
files: null
---

# Evidence form / gate-prototype

## current_situation

Eight spikes ran, all eight are answered, and the fold-back is signed.

Four hold, one falls, two are unsettled, one holds while firing a trigger nobody was watching.

### What the evidence changed

Two findings move the build.

- The write-time guard cannot be complete. 38 of 178 modules reach a shell, and a shell carries no path a guard can judge.
- The sweep becomes the only complete check. It must reuse a pass that already ran, because a rule that walks the tree itself costs about 100 ms against about 1 ms for a lookup over parsed frontmatter.

### What the evidence corrected

Five things this record had written down and reasoned from were wrong. All five are fixed on their nodes and in the signed forms that carried them.

- The shell reach was 60 of 178. It is 38.
- The one-shape count was 30 of 64. It is 25.
- Engine core was 117 sites across 50 files. It is 123 across 29.
- The network door was 6 modules. It is 2, so the spread is forty to one.
- The pressure test answered its own hostile question about dependency-cruiser with DIFFERENT SUBJECT, which is false against that tool's own reference.

### What stands unanswered

A write-time PARSE of the corpus has not been measured. Whether any of the 38 shell-reaching modules USES that channel for a departure has not been measured. The 50-file engine-core figure has no scope that reproduces it.

## buildable

yes — the design's own thesis survived every spike aimed at it, and the two findings that moved it are constraints on elements already in scope rather than new elements. The kill criterion holds by 8 modules, the write shapes cluster, and a corpus-reading check costs 18 ms against a 1000 ms budget. What is NOT settled is whether building the predicate half is worth it, because dependency-cruiser already ships that half; that is a cost question for the owner, and it is carried as an override rather than resolved here.

## round_0_verify

- evidence vs claims: OPENED, and five claims failed. Four figures and one prior-art answer were wrong. Every one is corrected on its node and amended in the signed form that carried it, with the correction recorded rather than silently applied.
- types: NOTHING TO CHECK. The eight spikes wrote spec markdown and throwaway scripts under `scratchpad/`. No engine source file was written, so the lane's typechecker had no covered file to read.
- lint: NOTHING TO CHECK, for the same reason. The corpus check that DOES bind did bite: four duplicate `probed:` keys in `spec/trace/raid/`, all written by this record's own probe patch, all fixed.
- tests: REFUSED HERE. `se_test` is not legal at a gate under SE-C-110, and the refusal names the pull as its remedy. The check available at this state is the sweep, and it is green at 3118 nodes in 1066 ms after the duplicate-key fix.

## round_1_validate

- exercised against the goal: THE PROTOTYPE GOAL IS SERVED. The riskiest entries were named at rank-unknowns and eight were probed against the real tree, not against a model of it. Four probes changed what the design must do.
- missing: THREE MEASUREMENTS. A write-time PARSE of the corpus. Whether the 38 shell-reaching modules ever use that channel for a departure. A scope that reproduces the 50-file engine-core figure. Each is parked with a ready-when rather than left blank.
- wrong: FIVE CLAIMS, all corrected. Four were figures this record had reasoned from; the fifth was a false answer to its own hostile question about dependency-cruiser.
- out of scope: NOTHING PROMOTED. All eight experiments answer `promote: none`, which is the throwaway law working as written. No spike code enters the build.
- prior art: COMPARED AGAINST THE PRIMARY, and one side of the comparison was wrong. dependency-cruiser's rules reference carries a `from` on every rule, names `not-to-core` as its own example of forbidding core-module dependencies, and lists `fs` under the `core` dependency type. So it DOES express who may reach the filesystem at import level, and it does it well. What it sheds is the author: `depcruise-baseline` generates the violation list mechanically and lowers each entry to ignore, its `comment` sits on the rule rather than the exception and is documented as not used in any rule logic, and it ships a blanket `severity: "ignore"`. Ours sheds the generated baseline and the off-switch, and demands a written reason per departure. That is the whole difference and it is narrower than this record had been claiming.

## goals_served

- Replace the hand-written entry-point list with a sweep over every exported entry point, so the guard stops depending on somebody maintaining a list: SERVED BY DESIGN AND NOW BY MEASUREMENT. `el-door-sweep` stands as a reused element, and this milestone measured what a rule costs it - about 1 ms as a lookup over parsed frontmatter, 15 to 19 ms over content already read, 91 to 125 ms if it walks the tree itself. The build is M7's.
- Name everything exported that no surface can reach, and answer each one with either a door or a deletion: SERVED BY MEASUREMENT. The governed set is 178 engine modules and the four conversations are counted at 81, 29, 17 and 2. The widget guard already answers this question for one capability, and `cand-the-narrow-guard` generalises its shape. The answers per entry are M7's.
- Give the two already-found pieces their door, so a capability the tests prove is a capability somebody can use: SERVED BY THE ELEMENT DECOMPOSITION. `el-door-rule` is the one new element and the other three are reused. Nothing in this milestone touches the two pieces themselves, which is M7's work.
- Establish whether one door per capability actually pays here, by judging the measured sites rather than by counting them again: SERVED BY THIS MILESTONE, and this is the goal M6 exists for. Two experiments answer it. The write shapes cluster into eight, and the read-modify-write pile a door serves best is 37 of 151 sites. The seven-module sample carries on the improve measure and not on the shape measure, so the reach may be set from it and the claim about which object pays may not.
- Build the disk door and its declared exception list, generalising the shape that already governs widget markup: SERVED BY DESIGN, and constrained by this milestone. Three decisions stand, and the departure spike adds a hard constraint - the rule must state its coverage limit, because 38 modules hold a channel it cannot judge. The build is M7's.
- Give reaching outward a central door that earns its keep, with guidance for a search and a place results are kept: LEAST SERVED, and this is a finding rather than a blank. The web conversation is counted at 17 modules and nothing else about it was probed. No spike aimed at the outward door, its guidance or its results store. M7 owns it and enters with a count and nothing more.
- Record a reason for every door proposed and dismissed, so a dismissal is evidence rather than silence: SERVED, AND EXERCISED. Three decision nodes each carry their rejected options. This milestone also measured whether a demanded reason is a considered one, across 113 reasons a refusing verb has actually collected - 104 are considered and the 9 that are not sit in one record.

## bound_breaches

- if-agent-harness-to-entrypoint: NOT EXERCISED, AND NOT MEASURED. No call crossed this interface during the eight spikes, which wrote spec nodes and ran throwaway scripts. Nothing breached its bound because nothing tested it. Recording that as an absence rather than as a green, because an unmeasured bound and a met bound look identical from here.

## round_2_red_team

- STEELMAN, and it is stronger than this record has admitted => THE PREDICATE HALF IS ALREADY BOUGHT. dependency-cruiser expresses who-may-reach directly: `from.pathNot` plus `to.dependencyTypes: [core]` is the disk door, in a config file, in a maintained tool, with reachability, cycles, orphans, licences and folder scope thrown in. Its best advocate would say we are rebuilding a graph engine to get one column it does not have, and that we could get that column by writing our reasons into its `comment` and accepting they are advisory. That argument is good, and until this gate this record answered it with a sentence that was false.
- The counter, and it holds => THE REASON IS THE ENTRY, NOT METADATA ON IT. dependency-cruiser's baseline is GENERATED by `depcruise-baseline`, which lowers every current violation to ignore. Nobody types a line, so nobody can be asked about one. Its `comment` sits on the rule rather than the exception, is documented as not used in any rule logic, and it ships `severity: "ignore"` as a blanket off-switch. A reason that cannot refuse a write is a different product from one that can.
- But the cost side was never argued honestly => CONCEDED, AND CARRIED AS AN OVERRIDE. Minted as `raid-iss-the-predicate-half-of-the-door-rule-already-exists-in-a-tool-nobody-here-runs`. The decision to build stands with the owner, and this gate's job is to put the true premise in front of it rather than to retake the decision.
- The guard you are building cannot see 38 of 178 modules => TRUE, AND THE DESIGN MUST SAY SO. A shell command carries no path. What the attack does NOT establish is that dependency-cruiser does better: it reads imports, so a shell command is invisible to it too. The hole is the category's, not this design's.
- Two of eight spikes came back unsettled, so a quarter of the evidence is missing => PARTLY TRUE, AND BOTH SAY WHY. One has a population of one departure. The other could not reconstruct a human sorting rule and used a marked proxy. Neither is a blank, and neither blocks the build.
- A proxy stood in for a judgment and you scored with it => CONCEDED AND MARKED. The improve-against-lengthen proxy reproduces two of seven modules exactly and misses a third badly. It is used ONLY for a like-for-like comparison across both sides, never to re-derive the original split.
- KILL CRITERION, and it was looked for => THE DESIGN IS THE WRONG CALL IF THE WRITTEN REASON TURNS OUT TO BE WORTHLESS, because that is the only thing the bought route does not give. It was probed twice. Across 113 reasons a refusing verb collected, 104 are considered and the 9 templated ones sit in a single record where the honest answer genuinely was the same nine times. That is not a column of boilerplate. The criterion was looked for and not found.
- A SECOND KILL CRITERION, from the cost side => THE DESIGN IS ALSO THE WRONG CALL IF THE PREDICATE COSTS MORE TO BUILD THAN THE REASON IS WORTH. Nothing here measured that, and nothing here can - it is a judgment about what the owner values. It is why this gate passes with an override rather than cleanly.

## raid_additions

- spec/trace/raid/raid-iss-the-predicate-half-of-the-door-rule-already-exists-in-a-tool-nobody-here-runs.md
- spec/trace/raid/raid-asm-a-rule-author-can-say-which-cost-class-their-rule-is-in.md

## verdict

pass with overrides — the design is buildable and every spike aimed at its thesis left it standing, but two dissents are logged rather than resolved. FIRST DISSENT: the predicate half of the door rule is already shipped by dependency-cruiser, this record answered that question with a false line until now, and whether building it anyway is worth the cost is the owner's call rather than this gate's. SECOND DISSENT: the outward-door goal is served by a count of 17 modules and nothing else, so M7 enters that half of the scope with no probed evidence at all. A third item is a constraint rather than a dissent - the write-time guard cannot see 38 of 178 modules and the design must say so out loud instead of implying completeness.

## follow_up

### Into M7, as constraints on elements already in scope

- `el-door-rule` states its coverage limit. The shell channel is outside what it can judge.
- `el-door-sweep` reuses a pass that already ran, and does not walk the tree itself.
- The door's scope comes from the read-modify-write pile, 37 sites of 151.

### For the owner, and only the owner

- Whether to build the predicate half at all, now that the true premise is on the table. `raid-iss-the-predicate-half-of-the-door-rule-already-exists-in-a-tool-nobody-here-runs` carries both sides.
- Whether the outward door stays in scope on a count alone, or waits for a record that probes it.

### Parked, with a ready-when

- Whether an author refused at write time writes a usable reason. Ready when the tree holds more than one departure.
- Whether a write-time PARSE of the corpus fits its budget. Ready when a check needs frontmatter rather than content.
- Whether any of the 38 shell-reaching modules uses that channel for a departure. Ready when the departure list exists.
- Whether a rule author can name their rule's cost class. Ready when the next sweep rule is written; the probe derives the class and compares it against what the author would have said.
- The 50-file engine-core figure. Ready when somebody can name the scope it measured.

### Outside this record

- The sweep reports green on an empty corpus, and its widget guard flips on the working directory. Captured as `note-c545c46b8e56`.
- `deliverable/engine/tools-run.ts:681` returns `ok: true` hardcoded, so a red sweep can never fail the battery. Recorded at `spec/overhauls/2026-08-20/findings.md:587` and still unfixed.

## anything_else

The most useful thing this milestone did was disagree with itself.

Four figures and one comparison were wrong, and every one had already been reasoned from in a signed form. None was caught by a check. Each was caught by opening the thing the evidence pointed at, which is what round 0 of a gate is for and what a milestone of spikes turns out to be good at.

One spike also went against the design that won. The write budget was cited as a reason to avoid a corpus-reading check, and at 18 ms against 1000 ms it was never the constraint.

The sweep was red while the spikes ran, and it was this record's own doing - four duplicate YAML keys written by its probe patch. Fixed, and green again at 3118 nodes.
