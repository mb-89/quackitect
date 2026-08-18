---
form: gate-requirements
bless: blessed by agent
by: agent
signed_off: 2026-08-17T16:55:38.807Z
reopened: 2026-08-17T16:54:50.652Z — probe-assumptions re-signed above it, and the register gained an eighth row since this gate last ruled. This is the end of design input, so the gate reads the register as it now stands rather than as it stood.
amended: 2026-08-17T17:16:06.778Z by agent — Three corrections of false statements, all found by a fresh-eyes tester. The wrong-line cited probe-assumptions for two eliminations that state never made and that were later falsified. The requirement count read five in three places after the eighth row landed, so the red-team round argued about a set that no longer existed. And goals_served said no boundary node existed three hours after thirteen were authored.
authors: agent
files: null
---

# Evidence form / gate-requirements

## current_situation

Design input ends here. EIGHT requirements, three use cases, three stories, one extended value prop and three extended functions stand for this delta, and every mechanical check behind them has already run. THE FIGURE IS EIGHT EVERYWHERE IN THIS FORM NOW: it read five in three places after the eighth row landed, which a fresh-eyes tester caught, and a red-team round arguing about "five rows" was arguing about a set that no longer existed.

THE SIXTH AND SEVENTH ROWS AND THE THIRD STORY CAME FROM THIS GATE'S OWN goals_served FIELD (2026-08-17). It asked what the milestone produced for each of the kickoff's five goals and goal three, instrument every interface, had nothing. The kickoff's red team had already written down that a milestone three with no state reading the instrument means this iteration repeated i12. Design input was one submit from closing without it.

THE EIGHTH ROW CAME FROM AN OWNER RULING given later the same day, and it overturned engine behaviour built earlier in this very iteration. An amendment does not re-grey the claims below it; a reopen does. req-an-amend-leaves-the-tree-standing carries it.

THIS GATE CARRIES NO FIELDS OF ITS OWN, deliberately. Six once stood here and each was settled elsewhere by a check that can say no. Re-asking them would train the reader to skim the fields that CAN fail.

SO WHAT IS LEFT IS THE FOUR ROUNDS, and the useful work in them was the scan, which found something against us.

## round_0_verify

- evidence vs claims: every mechanical check behind this gate ran and refused at least once, which is the evidence they are live rather than decorative. The requirement lint refused `would` in three statements. probe-assumptions refused twice until the assumption NODES carried their probe and probed fields. derive-functions refused today until a function node actually named the eighth requirement, rather than the form merely saying it did. Nothing was waved through
- types: RUN AND GREEN. This line previously read "not run and not affected, no engine source was touched", which stopped being true when goal five landed. Engine source changed today in session.ts, and it type-checks inside the battery below
- lint: se_lint is not legal at this gate, and the lints that matter ran anyway. The frontmatter guard refuses a parse break before anything lands. The requirement template's own rule set refused three statements at submit. biome ran clean over 274 files inside today's battery
- tests: RE-RUN TODAY AND GREEN — 1401 tests, 134 suites, 0 failures, plus preflight and a corpus sweep over 1224 nodes. This line previously read "not re-run, nothing since has touched engine code" against a figure of 1385 from 2026-08-16. That reasoning failed the moment the amend rule was rebuilt, and a gate inheriting a test result across a change to the thing under test is the exact shape this iteration exists to catch
- coverage, both ways: not claimed here because it is not claimable here. write-requirements declares covers use-case and derive-functions declares covers requirement, and each refuses its own submit while either side has an orphan. Both submitted, the second only after the corpus carried the edge
- the TBD sweep: ran at write-requirements across the whole requirement register and returned zero, rather than being asserted

## round_1_validate

- exercised against the goal: the eight rows carry both halves of the owner's framing. Three make an act's outcome legible, two make a slow thing honest, two bind the cost of answering, and one keeps the walk convergent so the rest can be reached at all
- missing: the denominator, still. Every pass line takes a share over the set of modelled interfaces, and that set does not exist until milestone one builds it. Named at the motivation gate and unchanged rather than forgotten
- wrong: three things I believed were found wrong, and THIS LINE WAS ITSELF ONE OF THEM. It previously said a host omitting a panel value and a permanently stale bar were "both killed with line numbers at probe-assumptions". probe-assumptions did not kill them; it asserted them, and a fresh-eyes tester later falsified both with line numbers of its own. A citation pointing at a document that says the opposite is worse than no citation. And that an amendment should re-grey the chain below it, which the owner overturned twice and which had already cost an afternoon of repairs on a chain nothing was wrong with
- out of scope: nothing crept in. Every row traces to a use-case step except the eighth, which traces to an owner ruling and to goal five, and that odd parentage is named at write-requirements rather than hidden
- prior art: SCANNED LIVE at this gate, on requirement-set quality rather than on latency. Named products people actually use — Jama Connect Advisor, Innoslate's AI Quality Checker, and QRA's QVscribe. WHAT THEY DO BETTER, first: they SCORE each requirement in the authoring tool with real-time feedback, they check passive voice, superfluous infinitives and immeasurable quantification, and they align to the whole INCOSE guide rather than to a handful of its rules. WHAT OURS SHEDS AND WHY THE TRADE HOLDS: ours REFUSES where theirs SCORES. A score is advisory and gets skimmed; a refusal is binding, and it cost a round trip today by catching `would` three times in statements written carefully. Ours also closes trace coverage BOTH WAYS mechanically at the submit, which nothing in the scan's results claims. WHAT THE SCAN CHANGED: it exposed that we cite the INCOSE guide and implement a subset, and nobody has compared the two lists. Minted as raid-asm-our-requirement-lint-catches-the-rules-that-matter

## round_2_red_team

- STEELMANNED OPPOSING CASE: eight rows and three use cases is a thin design input for a whole iteration, and a reviewer should suspect the delta was sized to fit the blessed minor rather than sized honestly => the count is small because the SCOPE is small by construction, and the non-goals name what was excluded and where each went; the tripwire for the opposite failure is minted as raid-asm-the-boundaries-are-few-enough-to-model-one-node-each, which escalates the column visibly if milestone one turns out to be a corpus
- three of the eight rows come from ONE incident this morning, so the set is an overfit to a single bug report => two of the three have three independent recorded sightings between them in engine/mirror.ts, all dated before today; the other two come from a measured baseline of 1834 breaches rather than from any incident
- the pass lines still cannot be computed, so blessing the register blesses promises => true, stated at the previous gate, and the sequencing answers it since milestone one supplies the denominator before milestone four claims anything against it
- the lint that gives us confidence has an unmeasured net => conceded and minted this round; what survives is that a narrow net with teeth beats a wide net without them, and that argument does not need the row settled
- KILL CRITERION for this gate, named and looked for => design input is wrong here if any requirement names a mechanism, because M4 enumerates candidates from the functions and a frozen mechanism collapses that space before anyone compares; looked for row by row at derive-functions and NOT found, with the closest call recorded there — the slowness-signal row survives only because it states an outcome and puts the percentage in Detail as the known way to fail it

## raid_additions

- raid-asm-our-requirement-lint-catches-the-rules-that-matter

## verdict

pass — the rows are verifiable and traced with both coverage directions closed mechanically, the probes ran and killed three of my own beliefs with line numbers or an owner ruling rather than with argument, the live scan found a real gap in our own tooling and it is minted rather than smoothed over, this gate's own verify round caught two of its previous answers having gone false, and the one thing that could make this gate wrong was looked for row by row and not found

## follow_up

DESIGN INPUT IS CLOSED. Everything after this is solution space, and the register and function structure stand blessed.

WHAT M4 INHERITS:

- Eight requirements, three graded must and gating every candidate, two graded should and becoming scored criteria, and three added as the walk found what the register was missing.
- One wording strain recorded at derive-functions: the refusal row binds an agent as well as a person, and show-where-it-stands is worded for a person. If the agent half wants its own function it shows up at M4 as a second element wanting the same requirement.
- Eight standing register entries for this delta, of which one is scheduled for M6 and two are the owner's.

THE ONE THING STILL WAITING ON A PERSON: req-a-slowness-signal-never-shortens-the-wait is verified by demonstration with people watched side by side, and nobody has scheduled that.

## anything_else

## goals_served

- model the outside boundaries: THIRTEEN BOUNDARY NODES EXIST and this line said none did, three hours after they were authored. They were built at the model-the-boundaries chunk, signed 13:43, and they are if-agent-harness-to-entrypoint, if-engineer-to-mirror, if-vscode-to-mirror, if-test-runner-to-toolchain, if-bootstrap-to-toolchain, if-account-to-git, if-record-store-to-git, if-record-store-to-origin-remote, if-account-to-obsidian, if-walk-engine-to-web, if-mirror-to-output-tools, if-satellite-supervisor-to-cloud-host and if-satellite-supervisor-to-peer-machine. raid-asm-the-boundaries-are-few-enough-to-model-one-node-each still carries the count probe that decides whether the column escalates
- bind the one-second demand to them: req-one-operation-reads-its-input-once, new here, plus the standing req-call-answers-in-one-second and req-surface-answers-in-one-second, which uc-drive-the-machine-at-the-pace-of-thought now connects to this delta rather than leaving them inherited and unserved
- instrument every interface: req-a-breached-bound-is-put-in-front-of-a-reviewer, WRITTEN AT THIS GATE because this field found the goal had nothing. The kickoff's red team had already recorded that a milestone three with no state reading the instrument means the iteration repeated i12; the register would have closed design input without it
- fix what the numbers name: the phase-split probe ran and answered — machine.sets holds 79 to 82 percent of the drawing cost, measured twice. A second reading was added today from the other end: one green computation makes 245 reads through the file door over a 200-node corpus, so the derivation reads its input once and the repetition is the render asking once per state. render.ts's duplicate green pass was removed, and req-one-operation-reads-its-input-once turns that one fix into a standing demand so the next one cannot be reintroduced quietly
- engine improvements: the kickoff's goals list and this goals_served field itself; the time half of the ripple, so a RE-SIGNED feeder greys what stands on it; the bless falling with the green; the router naming its doors instead of dead-ending; and the green guard now counting reads through the file door rather than reading a clock, measured at 245 against a ceiling of 800. ONE ENTRY ON THIS LIST WAS WITHDRAWN RATHER THAN KEPT: an amend counting as freshly as a signature stood here as an achievement and was the opposite of what the owner had asked for. It is reversed, written down as req-an-amend-leaves-the-tree-standing, and guarded by a test that signs a whole chain rather than one state

## bound_breaches

- if-agent-harness-to-entrypoint: AT LEAST 181 calls over its one-second bound today. THE NUMBER IS A FLOOR: se_log_query drops records matching its filter and reports `older: 0` while doing it (raid-iss-the-call-log-query-omits-matching-records-and-says-it-did-not). As counted, and MILESTONE FOUR OWNS THEM. mirror_slow 82, se_pull 63, se_test_verdict 20, se_aim 6, mirror_profile 4, se_run 2, se_file_search 2, se_git 1, se_seed_iteration 1. TWENTY ARE HONEST RATHER THAN BREACHES: if-test-runner-to-toolchain declares a bound deliberately not one second. Six more are the per-hop route recompute, which is correctness rather than waste. Two fixes landed today against the rest. NAMED RATHER THAN BURIED: twelve of the thirteen boundaries have no calls attributed to them, so this row can only name the lane door until a logged call says which crossing it made — and that attribution is the next iteration's, not this one's.
