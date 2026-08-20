---
form: gate-motivation
bless: blessed by agent
by: agent
signed_off: 2026-08-18T09:25:54.488Z
authors: agent
files: null
---

# Evidence form / gate-motivation

## current_situation

M1 is walked. The vision delta is signed with four ruled goal conflicts, all four are on the register as risks, one new value prop is authored, and the scope line separates the mechanism from the migration.

THE GATE'S OWN JOB HERE IS NARROW: is this extension worth having. The resident vision is axiom and stays out of it.

WHAT CHANGED SINCE THE KICKOFF, and it matters to this gate: the prior-art scan the kickoff could not make was made at draft-vision, which grants the web verbs the kickoff does not. It is not decoration — it produced the fourth goal conflict and one of the four risks, and it is what the prior-art round below rests on.

## vision_scope_stated

STATED AND NARROW. The resident vision is untouched: no new big idea, no new to-be world, no new pitch. A product whose identity changed is not a minor, and this one did not change.

WHAT THE DELTA CLAIMS, in one breath: a raw capture is private and machine-local, an option is public and travels, and ONE act crosses between them, which is a rewrite.

WHAT IS EXPLICITLY OUT OF THIS GATE'S REACH: whether the pool is the right SHAPE. That is M3's and M7's business. This gate asks only whether the extension is worth having at all.

## problem_agreed

AGREED, AND IT IS MEASURED RATHER THAN ASSERTED — three times, on three different days.

- 2026-08-16, the i15 cloud run. The walk filed a debt note for the blocker that stopped it. THE NOTE IS GONE. A search of the whole call log for its ref returns nothing, because .se/notes.jsonl is machine-local and never committed. A hand-written field report was the only thing that carried the findings back.
- 2026-08-17, the owner's own ruling on this record: "the cloud agent can put stuff in work tokens", and then "Yes, the work token is i17's options pool." The problem was named by the person who has it.
- 2026-08-18, this session. Three findings captured as notes inside the first ten minutes. Had the box been released before the retro drained them, all three would have gone with it.

AND THE SECOND HALF OF THE PROBLEM IS NOT THE CLOUD AT ALL. 205 parked options stand on the owner's laptop and no other machine can see them. The desk and the retro both weigh a backlog nobody else can read.

## prior_art_positioned

POSITIONED AGAINST PRODUCTS PEOPLE USE, scanned live at draft-vision and landed as ref-triage-and-option-pools-2026.

WHAT THEY DO BETTER, FIRST, because that is the half a comparison exists for.

- BOTH KEEP ONE OBJECT END TO END. Linear's triage ACCEPTS an issue into the team's workflow; GitHub Projects CONVERTS a draft issue into a real one. The item that arrives is the item that ships, so nothing can drift between a capture and a curated copy. Our rewrite introduces exactly that drift, and it is filed as a risk rather than waved off.
- LINEAR DEDUPLICATES. Mark-as-duplicate MERGES into a canonical issue and carries the attachments across. We have no way to say this note is that note.
- LINEAR'S SNOOZE WAKES BY ITSELF, at a chosen time or on new activity. Our re-entry condition is a sentence a person re-reads at a retro. Nothing wakes it.
- BOTH AUTOMATE THE ARRIVAL — triage rules route, label and assign without a person touching every item — and Linear puts a rotating NAMED OWNER on the queue, because an unowned triage queue is the known failure mode. Ours is drained by whoever happens to run the retro.

WHAT OURS SHEDS AND WHY THE TRADE IS RIGHT. Their capture is already inside the shared system, so there is no boundary to cross and nothing to withhold. Ours starts in a machine-local dump written mid-walk by an agent that was not thinking about who would read it. RAW NOTES NEVER ENTER VERSION CONTROL is a hard line, and only an authoring act gets an option across it. Their one-keystroke accept is cheap BECAUSE it does not ask whether the item can be stated — which is why Anderson argues against having a backlog at all.

THE SECOND THING SHED IS THE HOSTED STORE. Ours is files on trunk, so the pool survives a discarded branch and a released box. Linear's pool lives in Linear.

WHAT THE SCAN COULD NOT DO, said rather than implied: se_web_search REFUSED for want of a provider key (SE-C-106), so it was fetch-only and the pages were chosen by hand. That is narrower than the method asks for, and it is recorded in the reference node.

## success_measurable

MEASURABLE, and the four criteria are on vp-the-ledger rather than restated here. Each names a metric and a target.

- findings captured on a released box that survive it — target: all of them
- identity needles found by the corpus sweep in minted options — target: zero
- pool items with no statement or no re-entry condition — target: zero
- sources the desk reads for open work that are NOT the pool — target: zero

THE FOURTH IS THE ONE THAT MATTERS MOST AND IS EASIEST TO FAKE. A pool nobody is offered is a folder. It is named in scope for that reason, and M8 checks it rather than the build claiming it.

THE SECOND IS FREE COVERAGE and must not be given up. prose-inspect already walks project/spec for identity needles, so a minted option is swept the day it exists.

## risks_logged

LOGGED, four from this delta's own ruled conflicts, each with an owner as a ROLE and a live trigger.

- raid-risk-the-rewrite-carries-the-private-sentence-across — crippling, plausible. The easiest rewrite is a copy, and a leak on trunk cannot be undone
- raid-risk-the-option-and-its-note-drift-apart — corrosive, expected. The price paid for the privacy boundary, and it is ACCEPTED rather than mitigated
- raid-risk-an-unattended-agent-fills-trunk-with-unreviewed-prose — corrosive, likely. It scales with unattended work, and the owner ruled today that there will be more of it
- raid-risk-the-pool-accumulates-duplicates-with-no-way-to-merge — annoying, expected. Found by the scan, not by the vision

AND SIX MORE STAND FROM M0, filed at the kickoff and at the bless it refused: three issues about the machine, two assumptions the minor column rests on, and the issue that tactical fills a gate and cannot sign it.

## round_0_verify

- evidence vs claims: CHECKED. Every figure in this gate was re-counted rather than carried: three notes on this clone, 205 on the owner's machine per the seed, eight standing value props of which two were read in full to argue the ninth is new
- types: GREEN by construction rather than by a run. The runtime executes the changed files unflagged on every call, and the lane, the boot scripts and three test files all ran against them. No separate tsc pass — se_test is not legal at a gate
- lint: RUN AND GREEN. biome over 285 files, clean, and it is enforced by the pre-commit hook that blocked this record's opening commit
- tests: THE FULL BATTERY IS STILL NOT RUN, and this is the second gate to say so. Three files ran green — read-probes 9, identity-collision 5, scale 13 — through the native runner, so the lane holds no record of the verdicts. Owed at M7, which is the first state that grants se_test. NOTHING SINCE THE KICKOFF TOUCHED ENGINE CODE except the scale.ts comment, so the exposure has not grown
- the prior-art scan: MADE, which the kickoff recorded as owed. It is the one override from the last gate that is now closed

## round_1_validate

- exercised against the goal: the frame answers the goal's own sentence. The proposition is stated as a property — what is learned outlives the machine — rather than as the mechanism, so it survives the pool being stored some other way
- missing: THE READER HALF HAS NO ARTIFACT YET. Scope names it, the proposition's fourth criterion measures it, and nothing in M1 produced anything for it. That is correct for M1 and it is exactly the half that gets dropped, so it is written here as the thing to look for at M3
- wrong: the first diagnosis of the tactical dial written at M0 was WRONG — it read the bless as a bug in the comparison. Both comparisons are deliberate and the claim between them was false. The register entry was rewritten rather than patched, and the wrong version is named in it
- out of scope: the criteria machinery and the 205 migration, both cut at the kickoff and both still out. Neither was re-litigated here
- prior art: MADE, and it is in prior_art_positioned above rather than repeated. What it changed: the fourth goal conflict and the duplicates risk both come from it and from nowhere else

## goals_served

- the pool travels: draining a note to backlog mints a committed, rewritten item on trunk: SERVED. The proposition is authored, the crossing is ruled at conflict one, and the scope line takes the mint and the reader half together. Nothing is built yet — M1 produces the argument, not the mechanism
- the rewrite is the privacy boundary: a raw note never enters version control, and what cannot be stated cleanly is refused rather than guessed: SERVED, AND SHARPENED. Conflict two ruled that privacy wins on the mechanism and quality wins on the verdict — the rewrite is never skippable, and an option that cannot be stated is filed as an open question rather than guessed at. The risk that a rewrite is really a copy is filed, with a cheap check named for M3
- an unattended walk can file into the pool, so a finding survives the box being released: SERVED. Conflict three ruled that the filing is cheap and the judgment IS the rewrite, performed by the agent. One question was deliberately left for M3 rather than invented here
- engine improvements: SERVED, AND NOT BY THIS MILESTONE'S OWN WORK. The three boot defects landed at M0. What M1 added is the correction to scale.ts and the register entry behind it — and the owner's own words at the bless are the measurement, because they believed tactical was enough and that comment is why

## bound_breaches

- if-agent-harness-to-entrypoint: NINE calls over the one-second bound since this gate's milestone opened, all of them se_pull or its mirror record. The largest are the boot walk at 7187 ms and the document-carrying pulls at 2478, 1866 and 1778 ms; the rest are form submits, which run every check on the state before answering. MILESTONE FOUR OF i33 OWNS THEM and this gate adds no new cause
- the count is a floor, not a rate: this clone's call log starts inside this session, so it says what happened here and nothing about the standing rate

## round_2_red_team

- the honest alternative is to keep doing what happens today, an unattended run writing a report a person reads: it is cheaper, needs no build, and already works — this session's own field report will carry these findings whether or not a pool exists => IT LOSES ON ONE POINT AND THE POINT IS DECISIVE. A report is read once, by whoever is there. A pool item is offered by the desk every time somebody asks what to do next. That is the fourth success criterion, and it is the difference between a record and a working memory
- the rewrite is a human bottleneck dressed as a privacy control => partly true, and it is why the quality half was ruled separately from the privacy half. What must never be skipped is the AUTHORING; what may always be said is that this cannot be stated cleanly yet. The bottleneck is one sentence per option, at the one moment somebody is already looking at it
- two objects will drift, and both competing products avoid that by keeping one => yes, and it is filed as expected damage rather than argued away. It is the price of the hard line, and the hard line is the owner's, stated as not bending
- KILL CRITERION, this is the wrong extension if the pool is never READ => LOOKED FOR, and the honest answer is that it cannot be looked for yet, because nothing is built. WHAT WOULD PROVE IT: M8 finds the desk still reading .se for open work, or reading both. That is a checkable failure and it is written down before the build rather than after
- a second kill criterion, harder: if the rewrite is so cheap that agents mint options nobody wants, the pool becomes the inbox with a longer path => the same judgment gates both, and the measurement already exists — pool items with no re-entry condition, target zero
- the weakest part of this gate is its own prior art => the scan was fetch-only with pages chosen by hand, because the lane's search verb has no provider key on this box. Two products is a comparison; it is not a survey, and the verdict carries it as an override rather than burying it

## raid_additions

- raid-risk-the-rewrite-carries-the-private-sentence-across
- raid-risk-the-option-and-its-note-drift-apart
- raid-risk-an-unattended-agent-fills-trunk-with-unreviewed-prose
- raid-risk-the-pool-accumulates-duplicates-with-no-way-to-merge

## verdict

pass with overrides — the extension is worth having and the problem is measured three times over, but two things this gate owes were made narrower by the box it ran on and one is inherited from the kickoff.

TWO OVERRIDES, each carrying a register entry.

1. THE PRIOR-ART SCAN IS FETCH-ONLY. se_web_search refused for want of a provider key, so the pages were chosen by hand and two products were compared rather than a field surveyed. It is a real comparison and it changed the work; it is not a survey. Carried by raid-iss-the-kickoff-gate-demands-a-live-scan-and-grants-no-web-verb, which now has a second half — the state that DOES grant the verb has no provider behind it.

2. THE FULL BATTERY IS STILL NOT RUN, inherited unchanged from the kickoff and owed at M7. Nothing since has touched engine code except one comment, so the exposure has not grown. Carried by raid-iss-boot-grants-no-tools-while-promising-repair, which is why the three files that did run went through the native runner.

WHAT IS NOT AN OVERRIDE, and is named so it is not read as one: the reader half having no artifact is correct for M1, not a gap in it.

## follow_up

- M3 owes the check the privacy risk names: refuse a statement that appears verbatim in the raw note. It is cheap and it is the only mechanical defence the hard line has
- M3 answers the question M1 left open — whether an agent-filed option carries a different status from a person-filed one
- M7 runs the full battery as its first act, and its verdict says which three files were already green
- M8 checks the fourth success criterion by looking at what the desk reads for open work, and finding .se there is the kill criterion firing
- the provider key for se_web_search is the owner's to configure; until then every state that grants the verb is a state where the scan is fetch-only

## anything_else

