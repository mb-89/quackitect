---
form: gate-kickoff
bless: blessed by agent
by: agent
signed_off: 2026-08-19T10:54:09.708Z
authors: agent
files: null
---

# Evidence form / gate-kickoff

## current_situation

i5 is bound and started. It was seeded 2026-08-11 and its vision grew from the note pool on 2026-08-13, so the list is six days older than the tree it describes.

THE BUNDLE IS OLDER THAN THE SYSTEM IT DESCRIBES. i34 retired the claim ledger and the worktrees, i16 and i17 shipped and merged since. Three of the thirteen items were checked at this gate and two of them are already settled.

The walk runs unattended on a cloud clone. Autonomy stands at strategic and stop-at at blockers only, both moved by the owner this session.

## retro_drained

- the onboard-retro: Ran and signed. The inbox stood at zero, so the retro row was skipped by its own rule and the form recorded the checks that were still worth running.
- the notes inbox: Nothing to drain. se_survey reports 0 pending notes and 0 work tokens, and .se/notes.jsonl does not exist on this container.
- the field-feedback question: Asked in chat this session and recorded in the form. What came back was the owner's instruction to run i5 unattended. No field report about the product itself.
- the previous records' emit_back: Checked against the tree rather than read. Two of i17's lines are landed, three are not, and i16's version-flag line is not.

## goals

- ONE VERSION SOURCE, end to end: the engine reads its version from the manifest, and the entrypoint can be asked for it without starting a server.
- EVERY REFUSAL CLAUSE IS ANCHORED to its section in the guidance, with a test that refuses an unanchored one.
- THE BATTERY'S HEAVIEST TEST FILE stops dominating the wall clock.
- THE PAINT RULES ARE PINNED by tests: green means submitted, the thumb means blessed, and a law-proven green is told apart from an opinion.
- THE STANDING SMALL DEFECTS from the 2026-08-13 pool are each either fixed or struck with the evidence that they no longer stand.

## pulled_in

- THE VERSION FLAG on the entrypoint, from i16's emit_back and the owner's package ruling (note-1023a7f62f6d). VERIFIED ABSENT at this gate: engine/bin/se-mcp.ts has --help and no --version.
- THE REFUSAL ANCHORS, from note-bacff107e302 and the owner ruling of 2026-08-06. Partly standing already: errors.ts computes the guidance pointer and every rejection carries it. What frame-delta checks is whether every clause has its section and whether the test enforces it.
- THE refs.test.ts SPLIT, from note-e0dcdfe20aee. i33 and i16 both named it and both routed it here by name.
- THE PAINT-RULE PIN, from note-b4544437d0c9.
- THE SEVEN POOL ITEMS of 2026-08-13, each already diagnosed: the leave check reporting in the submit's words, the palette's silent fallback, the empty-source field that says nothing, the feed's guessed actor, the write ratchet, the signing that does not commit, and the log garbage collector.
- THE THREE UNLANDED emit_back LINES from i17, as candidates rather than as scope: the SE-C-040 placeholder remedy, the grace warning that does not ride `banner`, and the checklist template's exact-line help. All three are engine hygiene by any reading, and decompose-structure rules on them.

## left_out

- THE DUPLICATE-KEY SWEEP ON se_git_sync (note-6491ca1887b0). The verb does not exist: i34 retired se_git_land and se_git_sync with the claim ledger and the worktrees. The item is struck, not deferred.
- THE VERSION SOURCE ITSELF. Already landed. engine/version.ts reads ../package.json and answers "unknown" rather than throwing, and no live engine file carries a 3.0.0-bootstrap stamp. Only a comment in tests/files.test.ts and the historical record mention it.
- THE WHOLE-BATTERY GUARD'S OPEN DESIGN QUESTIONS (note-c545177dff77, note-7a5a9beb2fc3). Gates-only enforcement stands. The se_run hole and the poll cadence are design rulings the owner owes, and folding an open design question into a defect bundle is what makes bundles slow.
- THE INBOX-ON-A-FRESH-CLONE FIX. Recorded as an assumption instead, raid-asm-a-fresh-clone-s-empty-inbox-means-no-local-state. The fix touches the survey or where the inbox lives, and neither is inside this goal.
- ANY WIDENING of the trace or the corpus. This iteration touches the engine and its tests only.

## change_size

minor — many small defects across existing clusters, no new capability, and no function that fits no existing cluster

THE ESCALATE TELL IS ABSENT, and that is the test the method names. A version flag serves the existing entrypoint. A test split serves the existing battery. The paint pins serve the existing checker. None of them needs a cluster that does not exist.

THE COMPARISON THAT SIZES IT: i11 was a minor and carried about twenty defects plus a speed-up set. This is thirteen items, two of which are already settled, so it is smaller in count and no wider in reach.

NO STRIKES. Every cell of the minor column applies. The consistency sweep is the tempting one to strike on the grounds that a defect bundle teaches nothing new, and i34 disproved that: its sweep found six documents still teaching the superseded way.

WHAT WOULD RAISE IT TO MAJOR: if the refs.test.ts split turns out to need the test harness itself changed rather than the file divided. That is checked at decompose-structure, not assumed here.

## round_0_verify

- evidence vs claims: The bundle's own list was distrusted rather than taken, and three items were opened. TWO ARE ALREADY SETTLED — the version source is landed in engine/version.ts, and se_git_sync no longer exists. ONE STANDS AS WRITTEN — se-mcp.ts carries no --version flag. A list where 2 of the first 3 checks come back settled is a list the whole of which needs the same treatment.
- types: Not run at this gate, and not owed. Nothing has been changed in this record yet, so the tree stands exactly as i16 and i17 merged it.
- lint: Not run at this gate, same reason.
- tests: Not run at this gate, same reason. THE BATTERY IS THE ENGINE'S AND FIRES AT VERIFICATION — no state before it may call one, so a green claim here would have to come from the last run's record rather than from a run of my own. There is no such record on this clone: .se/test-last-run.json does not exist, because the container is new.
- the reading: Complete. Four documents credited at boot, the retro method, and the templates this form uses.

## round_1_validate

- exercised against the goal: The goal is engine hygiene, and the scope is chosen by opening the code rather than by trusting the note. Three items opened, two struck or reduced, one confirmed. That is the shape the goal asks for.
- missing: The audit of the remaining ten items. It belongs to frame-delta, which is where the machine puts it, and this gate says so rather than pretending the list is current.
- wrong: Nothing is built, so nothing can be wrong yet. The gate's own hazard is sizing a bundle whose contents are stale, and that hazard is measured rather than assumed away: it already bit 2 of 3.
- out of scope: The se_git_sync sweep, the version source, the whole-battery design rulings, and the fresh-clone inbox signal. Each named above with where it went.
- prior art: NOT COMPARED, and here is why. This iteration builds nothing a person outside the project would recognise as a feature — a version flag, a test split, and four test pins. There is no system people actually use to compare a version flag against. Writing a comparison here would be the citation-shaped filler the field exists to refuse. THE ONE PLACE PRIOR ART WOULD BITE is the test split, and the question there is about this battery's own timings rather than about anybody else's practice.

## bound_breaches

- if-agent-harness-to-entrypoint: BREACHED TWICE in this session, against its 1-second bound. Measured from the mirror's own slow-request records: one POST to the lane took 3,223 ms at 10:41:11Z and one took 9,733 ms at 10:44:14Z. 2 of 67 lane crossings, and both were boot-time pulls carrying a whole guidance document plus a built form. NOT FIXED HERE, and it is not this iteration's item: i12 owns the one-second rule and i11 already landed the payload trim. What this record owes is to not make it worse, which the milestone gates check.
- the mirror's own pages: 3 GET / requests ran between 1,150 ms and 1,703 ms on this container's cold start. The mirror is not a modelled interface with a bound, so this is context rather than a breach, and it is written down so the three numbers are not read as silence.
- every other modelled interface: Not exercised. This gate has never signed before, so there is no since-last-signature window, and nothing in this record has touched git, the vault, the test runner or the web.

## round_2_red_team

- STEELMAN: this bundle should be closed unopened, because most of it is already done => The strongest version of the case is exactly what this gate measured: 2 of the first 3 items checked came back settled. If that ratio holds across the remaining ten, i5 is a bookkeeping exercise wearing an iteration's clothes. What defeats it is that the three items with the clearest owner rulings behind them — the version flag, the paint pins, the test split — are all confirmed open, and two other records deferred the test split here BY NAME rather than doing it themselves.
- KILL-CRITERION: frame-delta finds that eight or more of the thirteen items are already landed or obsolete => Then the vehicle is wrong and the honest move is to shrink the record to what remains and say so in the frame-delta evidence, never to pad it back to a day's work. It is not hypothetical: it already happened for 2 of the 3 items opened here.
- The scope was chosen by the agent that will build it, with nobody watching => True, and it is the weakest part of this gate. There is no outside evidence in this form at all: the owner's only input this session was the instruction to run, and the field-feedback question came back with nothing about the product. Every judgment below the goal line is one agent's.
- A version flag that only proves the entrypoint loads is a weak proof, so building it is theatre => Half true, and the owner already ruled on the trade: the flag does not start a server, so a startup-only defect passes it. That is accepted knowingly. What defeats the objection is that today there is NO proof at all, and the alternative to a weak check is not a strong one, it is nothing.
- Splitting refs.test.ts may not shorten the battery at all => A real hazard, and it is already on the record: i16's own retro measured refs.test.ts at 139,017 ms, 14.1 percent of the battery, and concluded that halving it "would not shorten the wait by one second" because another file sets the critical path. So the goal above is written as "stops dominating the wall clock", and decompose-structure must open that measurement before the split is designed. If it holds, the split is bookkeeping and gets struck.
- The gate blessed itself => Yes, and it is logged as the agent's thumb rather than the owner's. The owner set the dial to strategic and stop-at to blockers only this session, in their own words, which is what makes it legal. It is not what makes it right, and the size proposal stays a proposal the owner may overturn at any later gate.

## raid_additions

- raid-asm-a-fresh-clone-s-empty-inbox-means-no-local-state

## verdict

pass — the scope is measured rather than taken from the note, the two items that no longer stand are struck with their evidence, and the one thing that could invalidate the vehicle is named with the state that checks it

WHY A PASS AND NOT A HOLD. Nothing is built yet, so nothing is being waved through. Two of the three checked items were removed from scope rather than carried, which is the opposite of padding.

WHAT THE ADJUDICATOR SHOULD PUSH ON. Whether a bundle that lost 2 of its first 3 items is still a day of work. The case for keeping it whole is that the remaining ten are each diagnosed and share one surface, the engine and its tests. The case against is that the list is six days older than the tree, and nobody has opened the other ten yet.

THE SIZE IS A PROPOSAL. minor, on the method's own escalate test, and against i11 which was a minor at twenty items.

## follow_up

FRAME-DELTA CARRIES THE AUDIT. Each of the remaining ten items is opened against the tree as i16 and i17 left it, and any already fixed is struck with its evidence rather than silently dropped. The version source and se_git_sync are the worked examples: one landed, one retired.

DECOMPOSE-STRUCTURE CARRIES TWO QUESTIONS. Whether the refs.test.ts split shortens the battery at all, given i16's measurement that another file sets the critical path. And whether i17's three unlanded emit_back lines join this scope or stay out.

THE MEASUREMENT THIS RECORD LACKS. No test timings exist on this container, so the split cannot be designed from the last run. The first battery this record fires is at verification, which is after the split would be built. Decompose-structure must say how it will decide without that number.

PARKED, ready when a retro next runs on a cloud clone: raid-asm-a-fresh-clone-s-empty-inbox-means-no-local-state.

## anything_else

THE THREE ITEMS OPENED AT THIS GATE, with what was read, so the next state does not repeat the work.

- The version source: engine/version.ts reads ../package.json through import.meta.url and falls back to "unknown". A search for 3.0.0-bootstrap over the whole tree returns 14 hits and none is live engine code.
- se_git_sync: absent from engine/tools.ts. i34's own evidence says both git-lane verbs were dead in public before it removed them.
- The version flag: engine/bin/se-mcp.ts contains no --version. i16's package evidence found it the hard way, by asking for it and starting a server instead.

THE ONE THING THIS GATE COULD NOT DO. It could not run the battery, the linter or the type check, because none of them is legal outside its own state and nothing has changed yet. Every green claimed above is inherited from the merge, not observed here.
