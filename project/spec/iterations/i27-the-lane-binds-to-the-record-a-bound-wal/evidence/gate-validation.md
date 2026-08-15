---
form: gate-validation
bless: blessed by agent
by: agent
signed_off: 2026-08-14T19:40:54.146Z
authors: agent
files:
---

# Evidence form / gate-validation

## current_situation

The build stands and the battery is green: 1301 of 1301, 135 suites, 0 fail (job test-mstckpwf-31). Lint and preflight green in the same run.

WHAT THE ITERATION SET OUT TO DO IS DONE. A bound walk writes shared method from where it stands, and the write lands at the machine root rather than in the record's tree. SE-C-134 is retired, replaced by a resolution rather than dropped.

THREE DEFECTS IN THIS ITERATION'S OWN WORK WERE FOUND BY THE GUARDS, not by a reader, and all three were fixed inside this gate:

- The dead-code sweep caught three engine files no design spec claimed.
- The read ceiling caught a new direct file read.
- The drift budget caught a filesystem hit added to the packet's hot path.

TWO REGISTER ENTRIES WERE WRONG AND NOW ARE NOT. The autonomy issue claimed the tier word was present everywhere the number appears; two answers carried a bare number and now carry the word. The cheap-alternative issue said the comparison was never made; it was made at declare-winner, and the entry is closed with the citation.

WHAT IS NOT DONE is the separation itself. Core, satellite and channel stand with three transports over one architecture, and no production path spawns a satellite.

## meets_need

- vp-autonomy-range: served. The last two answers sending a bare autonomy number now carry the tier word beside it, which is what req-autonomy-is-categorical demands. The number itself stays on purpose: raid-risk-autonomy-rework-breaks-walking rules cut over first and remove after, never both in one commit.
- vp-qualities: served, and observed on this iteration's own code. Three defects were caught by the guards rather than by a reader. A prop about holding under stress is best evidenced when the stress is your own work.
- vp-rigor-without-toil: served, and this is the prop i27 moves most. Retiring SE-C-134 removed an escape-edit-return loop that cost a step out of the work every time. sty-improve-the-machine-mid-walk now records both costs, the loop on 2026-08-11 and the single call on 2026-08-14.
- vp-systematic-engineering: untouched, with one weakness named. The order is enforced as before. raid-dec-a-must-outranks-a-score records that the must-check has never been built, so every gate ran it by hand in prose - and this gate is another instance.
- vp-the-engine: served in part. Core, satellite and channel stand, with the transport a setting rather than a fork in the product. The many-agents-and-machines-at-once half is not exercised, because nothing spawns a satellite outside tests.
- vp-the-ledger: served. Every decision this session rode the decision graph, and two register entries were corrected against what the record actually says rather than left standing.
- vp-vendoring: untouched, honestly. Nothing in i27 changes import or overlay. meth-emit-back still states that emitting back to imported modules is not built and not specified.

## musts_demonstrated

- sty-ask-the-lane-what-it-can-do: demonstrated. Every slide carries a tests/sehelp.test.ts case, reconfirmed live by the full battery under job test-msrcohsf-11.
- sty-hand-over-and-walk-away: demonstrated. reports/rpt-hand-over-and-walk-away.md - two handovers in one day, both resumed from the repository alone.
- sty-ramp-up: OWED. reports/rpt-ramp-up.md says the fresh-machine run wants a real first-timer, and its population claims stand at zero observations. Untouched by i27, and it needs a person at a clean machine.
- sty-review-a-gate: demonstrated. reports/rpt-review-a-gate.md, plus the recheck of the same gate after the M8 reshape, which showed a bless does not outlive its evidence.
- sty-start-a-new-product: OWED per reports/rpt-start-a-new-product.md. The general form is uc-begin-a-product, graded must. Untouched by i27.
- sty-the-agent-proves-it-read: demonstrated, and again during this gate. The compaction hook said the reading was gone and the loop re-served it (req-compaction-reowes-the-reading).
- sty-walk-it-by-hand: OWED to the owner per reports/rpt-walk-it-by-hand.md - minutes at the panel with the dial at blocked. Untouched by i27, and no agent can perform it.
- sty-work-on-two-machines: demonstrated 2026-08-12 with two clones of one bare origin, each minting its own machine id with nothing typed. The two-concurrently-shipped-iterations claim is owed with the slide before it.

## market_tier


## round_0_verify

- evidence vs claims: three misses, all in this iteration's own work, all found by the guards and fixed before this line. The packet reported the STORED run mode as though it were the running one, which lied exactly when --mode was used. The packet gained a filesystem hit per call, blowing the drift budget at 1107 ms over 200 nodes. A new direct read site broke the read ceiling at 104 against 103. Separately, verification refused to stand until three unclaimed engine files were claimed by a design spec, and gate-implementation completed only once it did.
- types: clean. npx tsc --noEmit in project/deliverable returned exit 0 in 3.9 seconds.
- lint: clean. biome check --error-on-warnings over 240 files in the same battery run, no fixes applied, ten infos and no errors.
- tests: green. 1301 of 1301, 135 suites, 0 fail, job test-mstckpwf-31. Four earlier runs this session were red and each red was understood and fixed rather than re-run. method-guard.test.ts is the SE-C-134 retirement's own proof: it asserts the clause is absent from CLAUSES and that a bound method write is not refused with it.

## round_1_validate

- exercised against the goal: met. A bound walk writes shared method from where it stands and the write lands at the machine root. Demonstrated live on 2026-08-14 and recorded at decisions.jsonl d3, the method write landed from inside the record. The --mode flag was exercised by running the launcher's own help and reading the block it renders.
- missing: the separation itself. Nothing spawns a satellite outside tests, so isolation is asserted rather than observed. Also missing is any measurement: the flag exists so the owner can compare transports, and inline is called the baseline the other two are measured against, with no measurement taken. Three of eight must-stories are missing their demonstrations, unchanged by i27.
- wrong: two register entries were wrong and are corrected. raid-iss-the-autonomy-number-still-rides-every-answer claimed the tier word was present everywhere the number appears; two answers carried a bare number, which req-autonomy-is-categorical forbids outright. raid-iss-cheaper-alternative-never-compared claimed the comparison was never made; it was made at declare-winner and the entry is now closed with the citation.
- out of scope: the VS Code widget for the run mode. The owner's settled instruction was the launch argument and that is complete. The route, the feed line and the /api/levels data are built, and nothing draws them. A panel choice does not post on change today, so declaring the row would draw a control that does nothing.
- prior art: COMPARED, at the primary source. Vitest's pool option, https://vitest.dev/config/pool.md read 2026-08-14. WHAT THEY DO BETTER, first: four pools against our three, including VM-sandboxed variants we have no equivalent for; a default chosen from named field failures rather than a design argument, since they report Prisma, bcrypt and canvas segfaulting under threads; per-project configuration rather than a flag alone; and per-pool costs documented down to memory leaks and error-constructor identity. WHAT OURS SHEDS: their pools change BEHAVIOUR, because process.chdir works in forks and not in threads, so a suite passing in one pool can fail in another. Ours is built so only cost moves, since every crossing marshals, inline included. That is a design claim and not a measurement, and it is now raid-asm-the-three-transports-behave-identically. NOT COMPARED, and why: nginx's validate-before-retire shaped the REPLACE step and is named in supervisor.ts as an influence, but no comparison was made and none is claimed.

## round_2_red_team

- STEELMAN, and the strongest one: i27 shipped an architecture whose central property has never been exercised. Both roles run fused in one process, no production path spawns a satellite, and isolation is therefore asserted rather than observed. => ACCEPTED AND NOT REFUTED. boundaries.test.ts drives a real child process and a real worker thread against a real repository, which tests the boundary and not the walk. Registered as raid-asm-the-three-transports-behave-identically, with a probe that runs one walk three times and diffs the answers.
- STEELMAN: the flag exists so the owner can measure which transport is faster, and nothing has been measured. => ACCEPTED. satellite-start.md says so against itself: the probe did not level a tree, reconcile a delta or open a channel, so the real start is that number PLUS that work.
- KILL-CRITERION: a spawned satellite that cannot serve a real walk, or a crossing that loses something the fused path keeps. => NOT FIRED, AND NOT FULLY PROBED. It was looked for in the boundary tests and in the marshalling rule that makes inline no laxer than the others. The probe that would settle it is a walk, and that is the next record's.
- SECOND KILL-CRITERION: the process default being materially slower than inline for the real workload, which would make the default wrong. => UNPROBED, and the same gap as above.
- The winner's seat is held by one point, and two named moves would hand it to the rival. => ACCEPTED, from the record's own declaration rather than from this review. Building raid-dec-thin-tree, which is DECIDED and UNBUILT, is one of them. That is a live property of the architecture choice, not a defect in this iteration's build.
- This gate's own must-check is prose rather than a build. => ACCEPTED. raid-dec-a-must-outranks-a-score states the check has never been built and every gate runs it by hand. Naming it here is the only honest handling available today.
- Three of eight must-stories are owed their demonstrations, and this gate passes anyway. => ACCEPTED, and it is why the verdict carries overrides rather than reading clean. All three need a person at a fresh machine or at the panel, so no agent can discharge them and no amount of building closes them.

## raid_additions

- raid-asm-the-three-transports-behave-identically

## verdict

pass with overrides — the goal is met and demonstrated, the battery is green at 1301 of 1301, and three of this iteration's own defects were caught by its own guards and fixed before this line rather than after it. TWO OVERRIDES RIDE WITH IT, both logged with their dissent. First, three of eight must-stories carry no demonstration: rpt-ramp-up, rpt-start-a-new-product and rpt-walk-it-by-hand. They were owed before i27, i27 did not touch them, and each needs a person at a fresh machine or at the panel, so no build closes them. Second, the architecture's central property is unexercised: nothing spawns a satellite outside tests, so isolation is asserted rather than observed, and the transport flag's own purpose - measurement - has produced no measurement. Both are registered with probes rather than waved through. The pass endorses this iteration's build; it does not endorse the permanence of the architecture choice, which the declaration itself says holds its seat by one point.

## follow_up

- Probe raid-asm-the-three-transports-behave-identically. Run one walk three times, once per mode, and diff the answers call for call. Until then the mode is a dial by design rather than by observation.
- Spawn a satellite from a real walk. That is what turns core-and-satellite from a shape into a property, and it is the next record's work.
- Draw the run-mode control. POST /mode stores the choice and /api/levels serves the three modes with their help. Nothing draws it, and a panel choice does not post on change today.
- Build the must-check. raid-dec-a-must-outranks-a-score says it was never built, and every gate including this one ran it in prose.
- The three owed demonstrations need a person: rpt-ramp-up, rpt-start-a-new-product and rpt-walk-it-by-hand.

## anything_else

ON THE AUTONOMY RED.

The owner named it live and asked why it was not fixed. It was half fixed, and the missing half was worse than reported.

Two answers sent a BARE number with no tier word at all, which req-autonomy-is-categorical forbids outright. The register entry claimed the opposite in its own text. Both are corrected.

The number's REMOVAL is still owed and is deliberately not here, because raid-risk-autonomy-rework-breaks-walking rules that the cut-over and the removal never share a commit. The cut-over is now complete.

ON WHAT THIS GATE READ.

Every must-story was opened and read rather than counted. Five carry references on file and three say plainly that they are owed. An earlier instinct in this session was to call more of them owed than are, and reading them showed that instinct wrong for the second time today.
