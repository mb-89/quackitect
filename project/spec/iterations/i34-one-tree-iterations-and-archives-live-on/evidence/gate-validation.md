---
form: gate-validation
amended: "2026-08-16T10:22:50.904Z by agent — the story was orphaned by this iteration and tsp-two-machines now carries it; the field said switched off without saying what demonstrates it"
bless: blessed by agent
by: agent
signed_off: 2026-08-16T10:20:58.606Z
authors: agent
files:
---

# Evidence form / gate-validation

## current_situation

i34 is built, verified four times over and swept. The battery stands at 1299 of 1299 with biome and preflight green, and the implementation gate is blessed.

THIS GATE IS SCOPED TO THE DELTA. i34 adds no capability and no new must story, so the question is narrow: what did removing a mechanism do to each promise, and did it take anything a story depends on.

IT TOOK ONE. Working on two machines is switched off, deliberately, by the owner's own ruling.

## meets_need

- vp-autonomy-range: Untouched, and honestly so. i34 changed where files live, not what the dial governs. No autonomy behaviour moved.
- vp-qualities: Untouched in mechanism, with one near miss worth naming. i34 nearly deleted req-trees-never-mix, a fatal quality row protecting the overlay boundary, on a conflation of two meanings of "tree". It was caught in verification and restored. Nothing shipped damaged; the promise held because a verifier read the row rather than its id.
- vp-rigor-without-toil: SERVED AND STILL FAILING, and the second half is measured rather than guessed. Served, because the resolution seam cost calls in every session and is gone — an edit can no longer land in a tree nobody is looking at. Failing, because the owner measured this very session and found the building was roughly a fifth of the time. Four notes carry it to the retro: note-b79353db45e9, note-30476b7ab834, note-5c0a12ee47e5 and note-8fcdb8ed9261. Claiming this prop is served without that sentence would be the sycophancy the guard exists to stop.
- vp-systematic-engineering: Untouched by the delta, and exercised by it. The trace laws caught three real defects this iteration that no test could see — a register naming deleted rows, two requirements orphaned of a function, one orphaned of a test-spec. The promise was not changed; it was used.
- vp-the-engine: Directly served and one measure lost. Served: a whole seam and its chooser are deleted rather than fixed, after two or three previous attempts to fix it recurred. Lost: the acts-from-clone-to-first-claimed-iteration measure stops being meaningful because nothing is claimed. That is recorded on raid-dec-one-tree-beats-a-record-travelling-between-machines, and whoever revives the capability owes a new measure.
- vp-the-ledger: Served. The decision that took the isolation loss now carries what it cost, which it did not until a verifier asked. An open risk was re-pointed and put back with the round trip on its face. The ledger did its job here as a record of reasoning, not only of outcomes.
- vp-vendoring: Untouched, and this is the prop the near miss threatened. The overlay is still layered, req-overlay-resolution, req-overlay-survives-update and req-overlay-drift-reported all stand, and the write-side boundary row is restored to guard them.

## musts_demonstrated

- sty-ask-the-lane-what-it-can-do: Not demonstrated this iteration, and not touched by it. Its resident report stands as it was.
- sty-hand-over-and-walk-away: Not demonstrated formally, and exercised for real. The handover was rewritten twice this session against an actual compaction, and the walk resumed from the repository each time. That is use, not a demonstration report, and it is not claimed as one.
- sty-ramp-up: Not demonstrated, not touched. Its entry documents WERE swept — project/product.md taught i34's result as an intent and now states what runs.
- sty-review-a-gate: Not demonstrated as a report, and performed twice today. Both gates carry an override with its dissent rather than a clean pass.
- sty-start-a-new-product: Not demonstrated, not touched.
- sty-the-agent-proves-it-read: Not demonstrated, not touched. The reading proofs ran throughout the walk, including after a compaction.
- sty-walk-it-by-hand: Not demonstrated, not touched by the delta — and improved by it. A bare pull at either container now offers its doors instead of entering one, which is exactly this story's failure mode.
- sty-work-on-two-machines: ORPHANED BY THIS ITERATION, THEN GIVEN A SPEC BACK, and the sequence is the finding. i34 deleted tsp-claim-lane with the claim ledger, and it was the only demonstration naming this story — so a live must story had nothing demonstrating it, and nothing warned at the deletion. The coverage law caught it at this gate, three states later. tsp-two-machines now carries it and defines the procedure on two real clones. It says plainly what it CANNOT show: two machines given the same iteration would both walk it silently, because refusing that was the ledger's job and the ledger is gone by the owner's recorded decision. THE PROCEDURE IS NOT YET PERFORMED and the spec says so rather than implying otherwise — i28's own validation gate already passed with an override recording that no rented host had ever run it.

## market_tier


## round_0_verify

- evidence vs claims: Opened what the evidence points at. Four verification rounds by one verifier that never built the code and was never respawned. Every round found real defects with the battery green. The sweep this state depends on was run mechanically over the deleted vocabulary, not from memory, and it found six documents still teaching the superseded way.
- types: Clean. `preflight green`, exit 0.
- lint: Clean. biome over 245 files, no fixes applied.
- tests: 1299 of 1299, 0 fail, run `test-msvnad5q-23`.

## round_1_validate

- exercised against the goal: The goal was one tree with the seam deleted rather than fixed. It is deleted — nine symbols, verified absent by a mechanical sweep run twice by someone who did not write the code. Both containers were driven, not asserted: each has a case that failed first and passes now.
- missing: Nothing the iteration promised. One thing it never promised and now cannot do: work on two machines. Named above and recorded on the decision that took it.
- wrong: Three things, all caught by verification and all fixed. Two requirements retired on a misreading of their ids rather than their statements. One container fixed while its sibling kept the identical defect.
- out of scope: The expeditions container fix, taken because the harm was identical and the container was in scope. Recorded rather than smuggled.
- prior art: TRUNK-BASED DEVELOPMENT is the practice i34 moves to, and it is what mainstream large repositories use. What it does better than ours: proven at scale, with tooling built for it. What ours sheds: the record FOLDER is the unit rather than the branch, so a record's work reads without checking anything out. GIT WORKTREES are what i34 removes, and they do one thing better than we now do — real filesystem isolation between concurrent work. We shed that deliberately. THE COMPARISON IS REASONED FROM DOCUMENTED PRACTICE AND NOT MEASURED. No benchmark was run against either, and saying more than that would be fabrication.

## round_2_red_team

- STEELMAN: this gate should FAIL, because a must story was switched off => The strongest case: sty-work-on-two-machines is a must, and an iteration that removes a must story's capability has not validated. What defeats it is that the removal is the OWNER'S decision, recorded before the work with its rejected alternatives, and that the capability never once ran end to end — i28's own gate passed with an override saying exactly that. Switching off something that never worked is not the same as breaking something that did. It is an override, and it is logged as one.
- KILL-CRITERION: somebody actually needs a second machine before travel is rebuilt => That would make this the wrong call. What makes it survivable is that the decision node says how to come back: claims.ts worked on refs through a temporary index and never touched a working tree, so travel can be restored without restoring worktrees. The conflict was with SEVERAL TREES ON ONE MACHINE, never with one-tree-per-machine.
- The value props were argued by the person who did the work => True, and it is the weakest part of this form. The verifier checked the CODE and the corpus, not these arguments. vp-rigor-without-toil is the one where that matters, and the owner has already contradicted my reading of it from outside the machine — which is worth more than a self-assessment and is why it is quoted above rather than smoothed.
- The sweep ticked nine boxes and could not check the ninth => Honest and stated in the sweep itself. The grain is the VOCABULARY: it finds every document that NAMES the old thing, never one that describes the old behaviour in different words. The boxes claim what was checked, not more.
- Two gates in one day, both "pass with overrides" => Worth asking whether the phrase is becoming a formality. It is not the same override. The implementation gate's is a broken isolation requirement; this one's is a switched-off story. Both name a specific loss with its decision node, and either would read as a clean pass if the losses had been left implicit — which is what the earlier reasoning did before a verifier asked.

## raid_additions

- none

## verdict

pass with overrides — one must story is switched off by the owner's own recorded decision, and a capability loss is an override however well documented

THE OVERRIDE. sty-work-on-two-machines can no longer be performed. The claim ledger, itAdopt and the seed's push are gone, so a second machine cannot claim a record or be refused one.

THE DISSENT, RECORDED RATHER THAN ARGUED AWAY. It is a must story. An iteration that removes a must story's capability has a case to answer, and "the owner decided it" is the answer to WHY rather than to WHETHER.

WHAT MAKES IT PASSABLE. The decision predates the work and carries its rejected alternatives. The capability never ran end to end — i28's own validation gate passed with an override saying the mechanism existed and no rented host had ever run it. And the way back is written down: the ledger worked on refs through a temporary index and never touched a working tree, so travel can return without worktrees.

EVERY OTHER PROP IS SERVED OR HONESTLY UNTOUCHED, with one prop served and still failing on its own terms. vp-rigor-without-toil is not claimed clean: the owner measured this session from outside the machine and found the building was about a fifth of the time. Four notes carry that to the retro. A gate that recorded this prop as served without that sentence would be doing the opposite of its job.

WHY NOT A CLEAN PASS. A must story lost its capability. Calling that a pass would hide a loss behind a decision, which is the same failure this iteration already made once with req-shared-change-reaches-without-unlanded-work-reaching — a fatal row retired as though it measured nothing.

WHY NOT A FAIL. Nothing the iteration promised is missing, nothing shipped damaged, and every defect four verification rounds surfaced is fixed or recorded with its dissent.

## follow_up

THE RETRO HAS FOUR NOTES WAITING AND THEY ARE THE REAL OUTPUT OF THIS SESSION.

- note-b79353db45e9 — the testing counts and the polling waste.
- note-30476b7ab834 — the rework, traced to deletions done without their sweep.
- note-5c0a12ee47e5 — a correction: nothing demanded the batteries I ran, and the machine already said the engine owns them.
- note-8fcdb8ed9261 — test as a lane, from earlier.

TWO MACHINE DEFECTS STAND, both found by walking into them. Fresh-eyes findings have no route to fix-findings, and a state that owes work has no route BACKWARD — every recovery is an escape and a re-entry.

ONE CONTESTED ITEM IS THE ADJUDICATOR'S. req-a-method-change-reaches-every-tree was restored over the verifier's reading that its deletion was defensible. Both cases are written into the node.

THE PARALLEL-WORK QUESTION IS OPEN. i34 traded filesystem isolation for one tree, and 22 iterations stand open. Nothing collides today because one is walked at a time, which is a habit rather than a mechanism.

## anything_else

