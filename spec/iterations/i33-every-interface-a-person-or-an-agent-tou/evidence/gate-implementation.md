---
form: gate-implementation
bless: blessed by human
amended: "2026-08-17T17:21:23.586Z by agent — The tester's remaining findings and the one thing it could not check belong in the handover rather than in a summary. The unchecked item is the sharpest: nothing asserts that a reopen propagates to the cone it feeds, which is the other half of the rule this iteration corrected."
by: agent
signed_off: 2026-08-17T17:10:24.466Z
authors: agent
files: null
---

# Evidence form / gate-implementation

## current_situation

THE DELIVERY GATE, and the first time this iteration has reached it.

WHAT STANDS BELOW IT: twenty states green, every one re-signed today against the kickoff's five goals. Eight requirements, three use cases, three stories, six test-specs, three design specs, thirteen modelled boundaries and eleven build chunks. The battery fired mechanically at verification's submit.

WHAT THIS GATE IS FOR, given the machine already proves five things upstream: the build was planned, the reds were observed, the designs are realized, the sweep ran both ways, and verification is green. What is left is judgment.

THE EVIDENCE IS STAMPED AND THE THUMB IS NOT MINE. This gate is tactical weight and the bless is the owner's. What is signed here is that the rounds were answered honestly, not that the work is accepted.

THE SECOND TESTER ROUND REPORTED AFTER THIS GATE STAMPED, and it found six severe things. Three were mine from the same day.

WHAT IT FOUND AND WHAT WAS DONE, because a finding named and walked past is the failure this iteration is about.

- THE GREEN GUARD COULD NOT CATCH WHAT IT CLAIMED. It counted reads through the file door; loadTrace memoizes ABOVE the door, so a per-state corpus load costs statSync calls the door never sees and the count stayed flat. FIXED: the corpus now meters its own asks, and the guard asserts ONE ask per operation, which is the thing the requirement actually names.
- A FALSIFIED PROBE WAS STILL RECORDED AS HOLDING in three places, including this form's own probe-assumptions, re-signed AFTER the falsification and saying in as many words that nothing was falsified. FIXED in the node's machine-readable field and in the form, with its fallout listed.
- TWO GATES CITED THAT PROBE for eliminations it never made. FIXED in both.
- THE KICKOFF STILL CARRIED the false "nothing since has touched engine code" that was corrected in the other two gates. FIXED. A defect repaired twice and left standing once reads, from inside, exactly like a defect repaired.
- THIS GATE'S RISK ROUND OMITTED THE MOST SEVERE STANDING ENTRY and miscounted the register as six where ten carry this mint. FIXED, and the entry is now named as a carry rather than folded into a clean acceptance.
- THE GUARD'S NARROWNESS WAS UNASSERTED: deleting the field clause would have left the suite green. FIXED with a case that amends a same-named field on a state no form reads it from.

WHAT REMAINS UNFIXED is in follow_up rather than here, and none of it is severe.

THE STAMP SURVIVED ALL OF IT because every repair was a CORRECTION rather than a changed question, which is exactly the amend case the owner ruled on today. Before that ruling each of these ten edits would have greyed the whole chain below it.

## quality_ok

- [x] Dependencies stay layered
- [x] Every new element carries one stated responsibility
- [x] The linter and the complexity ceiling are clean, with no new suppression
- [x] Every new behavior carries its check, and the battery is green at rest
- [x] Nothing speculative shipped
- [x] What changed is findable
- [x] Every quick-and-dirty taken stands as a visible raid debt entry

## debt_taken

- raid-debt-ten-checks-wait-on-a-person-or-a-second-machine

## risks_acceptable

acceptable — AS A NAMED CARRY RATHER THAN AS A JUDGMENT THAT THE RISK IS SMALL, and this field said plain acceptable over a register it had miscounted. TEN ENTRIES CARRY THIS ITERATION'S MINT, not six, and the one this list omitted is the most severe of them: raid-asm-every-host-hands-in-every-value-the-panel-can-draw, kind ISSUE, breaks_how_badly CRIPPLING, how_likely EXPECTED, status OPEN. A second host draws three of the nine values the panel can render, so an armed engine draws a plain rung and the running signal never appears — the exact failure set this delta was written from, live on a surface this delta did not fix. A REVIEWER MAY REASONABLY REFUSE THIS GATE ON THAT ENTRY ALONE. THE REST FOLLOW AND NONE IS A SURPRISE. Three were minted before any code: raid-asm-the-boundaries-are-few-enough-to-model-one-node-each with the tripwire that escalates the column, raid-risk-streaming-the-packet-changes-what-a-state-means, and raid-risk-an-honest-slow-interface-becomes-noise-nobody-reads. One was minted BY a gate's own scan arguing against a ruling made two states earlier, raid-risk-an-accurate-progress-signal-can-drive-abandonment, and it is the owner's because what a person feels while waiting is a judgment no check makes. One is present tense rather than a risk at all, raid-iss-the-log-serves-a-cut-response-while-the-guidance-promises-otherwise, and it bit twice inside this iteration's own retro. One was minted today and it is the sharpest, raid-iss-the-call-log-query-omits-matching-records-and-says-it-did-not — every latency total in this record is a FLOOR because of it, and the gate's own breach row says so rather than quoting a number that reads exact. NOTHING WAS REGRADED to make this gate easier.

## round_0_verify

- evidence vs claims: HELD IN PART, AND A FRESH-EYES TESTER BROKE THE REST. Six severe findings came back after this gate stamped, three of them defects introduced the same day, including a guard of mine that could not detect the regression its own comment named. All six are repaired and named in current_situation. WHAT THIS SAYS ABOUT THE ROUND: the mechanical checks below did their job and the JUDGMENT above them did not, which is the split worth carrying to the retro. Three refusals are still evidence the checks are live rather than decorative. derive-functions refused because a form claimed a requirement landed on a function while no function node said so. trace-design refused with a dead-code finding naming two runners written this iteration that no design spec claimed. identify-assumptions had a candidate probed away rather than minted, because its probe was one search long and came back zero
- types: RUN AND GREEN inside the battery. Engine source changed today in session.ts under goal five, so this is not inherited
- lint: biome clean over 274 files, no fixes applied, no suppression added. A complexity ceiling was hit once while building the goals source lookup and it was REFACTORED OUT rather than suppressed — two lookup tables extracted, which is why the number is 25 rather than 26
- tests: 1401 tests, 134 suites, 0 failures, plus preflight and a corpus sweep over 1224 nodes. The count was 1385 this morning; the sixteen new cases are this iteration's own
- the claims table: FOURTEEN OWED AND NONE CHECKED, which is the honest count. Every one needs something this walk cannot produce, and each points at a standing register entry rather than at a blank

## round_1_validate

- exercised against the goal: PARTLY, and the split is the honest answer. The goal is that every interface a person or an agent touches answers inside a second or says plainly it will not. The MODELLING half is built: thirteen boundaries exist as nodes where none did, each with an argued bound, and a gate now has to read the breaches. The FIXING half moved twice — the duplicate green pass in the render, and the signature read folded into a pass that already happens — and no aggregate re-measurement was taken after them
- missing: the aggregate reading. Nothing in this record demonstrates that the whole system is faster than it was this morning, and the instrument that would show it is itself broken: se_log_query drops matching records without saying so, which is why every count here is stated as a floor
- wrong: three things I believed were falsified by checks or rulings rather than by argument. That a host might omit a panel value, and that the control bar refreshes unconditionally — both killed with line numbers at probe-assumptions. And that an amendment should re-grey the chain below it, which the owner overturned twice and which had already cost an afternoon of repairs on a chain nothing was wrong with
- out of scope: the goal-five engine work landed OUTSIDE the chunk plan, on rulings given mid-walk. It is named at specify-build rather than folded in, and whether that is acceptable is a real question for the retro rather than something to settle here
- prior art: scanned live at the two gates below, on latency budgets and on requirement-set quality. WHAT THEY DO BETTER, first: SLO frameworks enforce in CI and fail a build, carry error budgets with a stated policy rather than a flat threshold, and target percentiles instead of one number; requirement tools score each row in the authoring surface against the whole INCOSE guide. WHAT OURS SHEDS: ours REFUSES where theirs scores, and a refusal costs a round trip where a score gets skimmed. NOT COMPARED AT THIS GATE, and it is the one worth naming: nobody compared our delivery gate against how those tools gate a release, because the comparison needs a release process we do not have

## goals_served

- model the outside boundaries: BUILT. Thirteen interface nodes exist where none did — if-agent-harness-to-entrypoint, if-engineer-to-mirror, if-vscode-to-mirror, if-test-runner-to-toolchain, if-bootstrap-to-toolchain, if-account-to-git, if-record-store-to-git, if-record-store-to-origin-remote, if-account-to-obsidian, if-walk-engine-to-web, if-mirror-to-output-tools, if-satellite-supervisor-to-cloud-host, if-satellite-supervisor-to-peer-machine. dsp-the-outside-boundaries-and-their-bounds realizes all thirteen, and specify-build refused until it existed, once per boundary
- bind the one-second demand to them: BUILT AND MEASURED. Each boundary carries an argued bound, and nine were timed directly rather than argued from the log: git at 42 to 56 ms, the vault at 16 ms, ls-remote at 665 ms, node at 33 ms and npm at 470 ms, the battery at about 58 s across eight runs, and the web fetch spanning 284 to 4,769 ms. ONE BOUND WAS WRONG AND THE MEASUREMENT CAUGHT IT: if-record-store-to-origin-remote was corrected to one second after ls-remote came back at 665 ms
- instrument every interface: BUILT AS A DEMAND, NOT AS A READING. req-a-breached-bound-is-put-in-front-of-a-reviewer was written when this gate's own goals field found the goal had nothing, and the bound_breaches round now stands on every gate in the column. TWO INTERFACES CANNOT BE INSTRUMENTED BY AN AGENT AT ALL and are in the debt entry: if-engineer-to-mirror deadlocks the server when called from a lane command, and if-vscode-to-mirror needs the editor driven
- fix what the numbers name: PARTLY, and this is the thinnest of the five. Two fixes landed against the lane door — the duplicate green pass in the render, and the signature read folded into the pass that already happens. The phase split ran and answered: machine.sets holds 79 to 82 percent of the drawing cost. NO AGGREGATE RE-READING WAS TAKEN after the fixes, and the instrument that would take one is itself an open issue
- engine improvements: BUILT, THREE OF THEM, with artifacts rather than intentions. The green guard now counts reads through the file door instead of reading a clock, 245 measured against a ceiling of 800, because a guard that answered differently under machine load had stopped discriminating. An amendment no longer re-greys the chain below it — req-an-amend-leaves-the-tree-standing, tsp-an-amend-leaves-the-tree-standing, and a test that signs a whole chain rather than one state. And a field another form READS became unamendable, so changing the kickoff's goals list is a reopen and the refusal hands back se_reopen

## bound_breaches

- if-agent-harness-to-entrypoint: AT LEAST 181 calls over its one-second bound today, and TODAY'S RE-SIGN PASS ADDED MORE that are not in that figure. THE NUMBER IS A FLOOR, not a count: se_log_query drops records matching its filter and reports `older: 0` while doing it (raid-iss-the-call-log-query-omits-matching-records-and-says-it-did-not), so every total taken from it under-reports. THE DISPOSITION, per class rather than per call. Twenty are HONEST rather than breaches: if-test-runner-to-toolchain declares a bound deliberately not one second and a battery is a minute by design. Six are the per-hop route recompute, which is the detour that stops a moved ground being followed off a cliff — correctness bought with latency, and the trade is accepted here. TWO FIXES LANDED against the rest. THE REMAINDER IS MILESTONE FOUR'S and it is not closed: no aggregate re-reading was taken after the fixes, and the instrument that would take one is the open issue above. NAMED RATHER THAN BURIED: twelve of the thirteen boundaries have no calls attributed to them, so this row can only speak for the lane door until a logged call says which crossing it made. That attribution is the next iteration's work

## round_2_red_team

- STEELMANNED OPPOSING CASE: an iteration whose one-line goal is that calls come back inside a second is asking to pass a DELIVERY gate without a single call being demonstrably faster than it was that morning. Its best advocate would say the modelling is real work and the fixing is the point, that a denominator nobody has divided by is an instrument rather than a result, and that shipping the instrument and calling the goal served is exactly the move i12 made when it fixed instances and the rule still did not hold => THIS IS THE STRONGEST THING SAID AGAINST THIS GATE AND IT IS PARTLY RIGHT. What separates it from i12 is that i12 had no list and this one does: thirteen boundaries where there were none, nine timed directly, one bound corrected by its own measurement. What it does NOT answer is the aggregate, and that is why the verdict carries an override rather than reading clean
- THE GOALS_SERVED FIELD WAS WRITTEN BY THE SAME HAND THAT DID THE WORK, so it can mark its own homework => TRUE, AND THE TESTER PROVED IT ON THIS VERY LINE. This bullet claimed "every id in that field resolves", defending a property goal four does not have: that line names no artifact id at all. The ids that ARE named do all resolve, checked against the corpus. But the defence was broader than the thing defended, which is the same move it was written to guard against. The two gates below also answered goal one from the plan — both said no boundary node existed, three hours after thirteen were authored — and both are corrected
- THREE OF THE SIX TEST-SPECS ARE GREEN FROM BIRTH, so half the verification proves nothing about the build => conceded and named at observe-red rather than found here. The newest could not have been test-first: the owner gave the rule mid-walk and nothing knew it before. What survives is that its FIXTURE is the finding — it signs a whole chain where every amend test before it signed one state, and a one-state fixture cannot tell leaves-the-tree-standing from has-no-tree
- THE ENGINE WORK UNDER GOAL FIVE BYPASSED THE CHUNK MACHINE ENTIRELY, so the build plan this gate is meant to judge did not govern a third of what shipped => true, named at specify-build rather than folded in. A ruling given mid-walk has to land somewhere and the alternative is refusing the owner until the next kickoff. It is a real process question and it belongs to the retro rather than to a verdict here
- EVERY LATENCY NUMBER IN THIS RECORD IS A FLOOR, so the gate is judging a milestone against figures nobody can bound from above => true and stated in the breach row itself rather than discovered by a reader. The instrument that produces them drops matching records and reports zero older ones while doing it. That is why milestone four's disposition says NOT CLOSED rather than quoting an improvement
- KILL CRITERION, named and looked for => this gate is wrong if the thirteen boundaries turn out to be a picture nobody can measure against, because then the denominator is decoration and milestone one bought nothing. LOOKED FOR AND PARTLY FOUND: twelve of the thirteen have no calls attributed to them today, so only one can be read. What stops that killing the gate is that the attribution gap is a MISSING JOIN rather than a wrong model — the crossings exist and nothing records which one a call made. What would kill it is a boundary that cannot be attributed even in principle, and none of the thirteen is that

## raid_additions

- none

## verdict

pass with overrides — STAMPED BY THE AGENT, UNBLESSED. This gate is tactical weight and the thumb is the owner's. THE OVERRIDE, stated as dissent rather than folded into a clean pass: goal four is thin. Two fixes landed and no aggregate reading was taken after them, so nothing in this record demonstrates the system is faster than it was this morning, and the instrument that would show it is itself an open issue. WHAT EARNS THE PASS ANYWAY: the iteration's own scope puts the milestones in a forced order and says milestone one supplies the denominator the others need. That denominator now exists — thirteen boundaries where there were none, nine of them timed directly, one bound corrected by its own measurement. A gate has to read the breaches. WHAT SHOULD PRESS BACK: a reviewer may reasonably rule that an iteration named for speed cannot pass a DELIVERY gate without one call being demonstrably faster, and that reading is defensible on the goal's own words

## follow_up

WHAT THE NEXT ITERATION INHERITS, named so it is not rediscovered.

- THE ATTRIBUTION GAP. Twelve of the thirteen boundaries have no calls attributed to them. Until a logged call says which crossing it made, the breach row can only speak for the lane door, and every per-interface number stays unavailable.
- THE BROKEN INSTRUMENT. se_log_query omits matching records and reports zero older ones while doing it. Every latency total in this record is a floor because of it, and milestone four cannot be judged properly until it is fixed.
- THE ONE-ACT CHAIN REFRESH. se_amend carries a `chain` argument that is accepted and does nothing, and after today's ruling the act it wants is a bulk RE-SIGN rather than a bulk amend. Whether it is wanted at all is note-fc18d2775583's question for the retro: this iteration re-signed twenty states one at a time, found six real defects doing it, and the owner's objection to the cost is on the record.
- TWO BOUNDARIES AN AGENT CANNOT TIME, both in the debt entry, both needing a person at this machine.

WHAT THE TESTER LEFT UNFIXED, none of it severe, all of it named rather than left to be rediscovered:

- THE INTERFACE COUNT IS OFF BY ONE in four forms. Four say the trace held forty interface nodes before this delta; the folder holds 52 with 13 minted here, so 39 pre-existed. Either one was deleted during i33 or the figure was always wrong, and telling those apart needs a comparison against a committed ref that nobody has run.
- OBSERVE-RED'S DEMONSTRATION TICK IS A DEDUCED RED, not a watched one. Its own text reasons that the procedure fails at step two rather than recording somebody watching it fail. The checklist has no way to say which it is.
- IDENTIFY-ASSUMPTIONS MIXES CATEGORIES in its count of six, which includes two risks and one issue.
- THE ROOT README NAMES TWO TOOLS THAT NEVER EXISTED, se_next and se_submit, in a status block still describing the system at M2. It predates this iteration.
- FOUR BREACH ROWS CARRY A NINE-ITEM COMMA CHAIN inside one long paragraph, which voice.md calls an unrendered list.

AND ONE THING THE TESTER COULD NOT CHECK, which is the sharpest gap it names: whether a REOPEN propagates to the claims a reopened state feeds. The suite covers the reopened state itself, not its cone. That is the other half of the rule this iteration just corrected, and nothing asserts it.

WHAT THE OWNER HOLDS, and it is two things rather than one:

- raid-risk-an-accurate-progress-signal-can-drive-abandonment. What a person feels while waiting is a judgment no check makes, and it wants a design review with them at the screen.
- THE POLICY QUESTION on staleness. Collect it as debt and re-sign in one act before verification, carry it to the next iteration as visible debt, or build the bulk re-sign now. Three options, none chosen here.

## anything_else

