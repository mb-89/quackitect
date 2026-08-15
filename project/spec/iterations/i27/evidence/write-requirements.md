---
form: write-requirements
by: agent
signed_off: 2026-08-14T09:39:14.534Z
reopened: "2026-08-14T09:36:01.598Z — The owner stated a demand the register does not carry - an engine change applies instantly inside its own record and reaches no other - and ruled the method-change row's…"
authors: agent
files:
---

# Evidence form / write-requirements

## current_situation

NINE MUST REQUIREMENTS NOW, AND THE NINTH IS ABOUT THE ENGINE ITSELF.

req-an-engine-change-applies-in-its-own-record IS MINTED, on the owner's ruling of 2026-08-14. An engine change made inside a record's walk takes effect on that walk's next call, with no restart and no stepping out, and leaves every other open record answering as it did.

THE REGISTER HAD NOTHING ABOUT THE ENGINE CHANGING UNDER A RUNNING WALK. Method was covered. The running code was not, and this product edits the engine it is running, every day.

req-a-method-change-reaches-every-tree IS RESTATED, and this retires an earlier ruling in favour of a later one. It used to demand the change land "in trunk and in every open worktree in one act". That named a mechanism, and a `must` that names a mechanism refuses a design for not using it.

THE OWNER'S IPO READING REPLACES THE FAN-OUT. An iteration does not fold back. Input is the method the record entered with. Processing is the walk, local changes included. Output lands at close, like every other output. So a method change is LOCAL until it lands, divergence between open records is intended, and landing already resolves it.

THE READING I TOOK, said plainly so it can be checked: instant and local is enough, and reaching every other open tree is NOT required. The 2026-08-06 ruling that demanded the fan is superseded by the 2026-08-14 one.

WHAT CAME BEFORE THIS PASS, unchanged. The solution-freedom rework restated req-parallel-iterations-own-worktrees and req-archive-releases-worktrees as outcomes, superseded req-entry-binds-worktree, minted three rows for the propagation-isolation tension, version control and the person-facing surfaces, and de-contaminated the two register entries that decided a seat.

## register

- project/spec/trace/requirement/req-an-engine-change-applies-in-its-own-record.md
- project/spec/trace/requirement/req-shared-change-reaches-without-unlanded-work-reaching.md
- project/spec/trace/requirement/req-version-control-resolves-like-every-call.md
- project/spec/trace/requirement/req-a-surface-resolves-to-what-it-shows.md
- project/spec/trace/requirement/req-a-wrong-act-never-passes-silently.md
- project/spec/trace/requirement/req-a-write-lands-where-it-is-meant.md
- project/spec/trace/requirement/req-a-read-comes-from-where-it-is-meant.md
- project/spec/trace/requirement/req-a-method-change-reaches-every-tree.md
- project/spec/trace/requirement/req-parallel-iterations-own-worktrees.md
- project/spec/trace/requirement/req-archive-releases-worktrees.md
- project/spec/trace/requirement/req-entry-levels-the-record-tree.md
- project/spec/trace/requirement/req-a-shipped-record-is-never-reclaimed.md
- project/spec/trace/requirement/req-record-status-comes-from-the-record.md
- project/spec/trace/requirement/req-the-answer-never-exceeds-its-bound.md
- project/spec/trace/requirement/req-a-resolution-is-proven-by-read-back.md
- project/spec/trace/requirement/req-a-records-dependency-is-declared.md
- project/spec/trace/requirement/req-reading-credit-survives-a-reload.md
- project/spec/trace/requirement/req-guidance-edit-lands-where-it-compiles.md
- project/spec/trace/requirement/req-trees-never-mix.md
- project/spec/trace/requirement/req-call-answers-in-one-second.md
- project/spec/trace/requirement/req-a-size-may-drop-a-question.md
- project/spec/trace/requirement/req-acts-carry-role-and-channel.md
- project/spec/trace/requirement/req-answer-recorded-with-question.md
- project/spec/trace/requirement/req-archive-read-only.md
- project/spec/trace/requirement/req-autonomy-change-applies-forward.md
- project/spec/trace/requirement/req-begin-says-own-window.md
- project/spec/trace/requirement/req-boot-ends-at-front-desk.md
- project/spec/trace/requirement/req-broken-trace-is-a-defect.md
- project/spec/trace/requirement/req-capture-moves-nothing.md
- project/spec/trace/requirement/req-cell-edit-lands-in-the-note.md
- project/spec/trace/requirement/req-choice-records-case-against-losers.md
- project/spec/trace/requirement/req-clean-sweep-is-dated.md
- project/spec/trace/requirement/req-colors-are-configuration.md
- project/spec/trace/requirement/req-desk-offers-a-tour.md
- project/spec/trace/requirement/req-desk-takes-plain-words.md
- project/spec/trace/requirement/req-drain-one-home-with-payload.md
- project/spec/trace/requirement/req-engine-folder-is-sealed.md
- project/spec/trace/requirement/req-every-artifact-is-readable-text.md
- project/spec/trace/requirement/req-expressions-evaluate-per-reference.md
- project/spec/trace/requirement/req-first-green-needs-a-red.md
- project/spec/trace/requirement/req-fresh-machine-runs.md
- project/spec/trace/requirement/req-help-demand-ranked.md
- project/spec/trace/requirement/req-mirror-stays-on-the-machine.md
- project/spec/trace/requirement/req-no-agent-act-destroys-work.md
- project/spec/trace/requirement/req-reachable-capability-is-traced.md

## set_criteria

- complete: Every one of the 36 use cases still has a covering requirement and zero are uncovered. The new row refines uc-change-the-method-mid-walk and uc-take-a-step, both of which already existed, so the coverage count is unchanged. WHAT HAS NO REQUIREMENT, named because the question asks: the measured split of past step-outs into accidents and deliberate method edits, which is a measurement the business case rests on rather than a demand on the system.
- consistent: No two requirements conflict, and the two rows moved in this pass were checked against each other and against their neighbours. The engine row and the method row are the SAME SHAPE and NOT the same demand - method is content the engine reads, the engine is the running code, and reading new content on the next call is ordinary where running new code without stopping is not. ONE EARLIER RULING IS RETIRED RATHER THAN CONTRADICTED: the 2026-08-06 fan-out is superseded by the 2026-08-14 IPO reading, and the restated row records both dates so a reader can see which won. The two near-collisions found earlier still stand resolved: req-guidance-edit-lands-where-it-compiles is the method case of the general write row, and req-trees-never-mix forbids mixing rather than addressing. ONE PRE-EXISTING INCONSISTENCY STANDS: req-reachable-capability-is-traced and its own test spec set different bars.
- affordable: Nine requirements, and the new one is the most expensive on the page. Running changed code without stopping the walk is real machinery rather than a predicate - a supervised process per record, a module hot-swap, or something else - and the design has to choose. THE RESTATEMENT MOVES COST THE OTHER WAY: dropping the fan-out removes the one sequence this milestone had priced as a real build, because a change that stays local needs no fan at all. Net, the pass adds cost rather than removing it, and the addition is the owner's stated demand.
- bounded: Every requirement answers to a dated observation, a measurement or an owner ruling. The new row answers to the ruling of 2026-08-14 and to the measured eight step-outs of 2026-08-13. Nothing is gold-plated. The new row deliberately names NO mechanism, and it says so in its own body, because naming one is what put the row it replaces into this state.
- comprehensible: Each statement says what must be true rather than how. The engine row reads plainly: change it where you are, it works on the next call, nobody else notices. The words that needed defining - meant, tree, method, engine - are used the same way throughout, and the new row opens by separating method from engine so the two are not read as one.
- no_tbd: Zero, and the sweep was re-run rather than asserted. A search for TBD, TBC, TBR and question marks over the whole requirement folder returned no matches after the mint and the two patches.
- behaviour_modelled: Three earned a model, six did not, and one model is now retired. The claim requirement keeps its STATE MODEL, four states with one terminal transition. The status requirement keeps its LIFECYCLE, because which transitions a peer can observe is why it exists. THE FAN-OUT SEQUENCE IS RETIRED with the fan-out itself - one write to N trees with partial failure was the whole risk, and there is no longer a fan. The new engine row wants NO model: it is one invariant checked with two records open, and a model would be one box.

## follow_up

NO DRAWN CANDIDATE ANSWERS THE NEW ROW, and that is this state's largest finding. All four candidate records were searched for the engine changing under a running walk. cand-speaking-root names "reconcile at entry and at RELOAD", and a reload is the restart the owner ruled out. cand-fixed-root and cand-judged-path say nothing about it at all. cand-os-rooted runs one process per record, which is the closest shape on the board, and its record never claims the engine can change under a walk - a process restart still ends what was in flight in that record.

SO THE CANDIDATE SET IS INCOMPLETE, not merely unscored. This is a `must` graded fatal, and a demand no candidate answers cannot be fixed by rescoring. The chart wants a new row - how a change to the engine takes effect - and the set wants at least one line that answers it.

THAT REACHES BACK TO enumerate-space AND run-candidates, both of which fell with this reopen and will be walked again in order.

WHAT M4 INHERITS: NINE must requirements gating the candidates, up from eight.

THE GATE MUST COME BACK AS A FRONT, NEVER A WINNER. The previous pass produced a front of one, which is a winner however it is labelled, and the state's own statement forbids that. The collapse is expected to reverse here, because the new row cuts against the candidate that dominated.

STILL OWED, unchanged. The cross-coupling analysis over the whole register by hand. The measured split of past step-outs. Two use cases named unread at the inputs gate: landing work on trunk, and the interaction-capability quality.

## anything_else

WHY THIS ROW WAS MISSING, which is the finding rather than the fix.

THE REGISTER TREATED THE ENGINE AS THE THING THAT SERVES, never as a thing that changes. Every row about change is about method, guidance, spec or a record. Nothing said the engine's own code changes while it is serving, and it changes here daily.

THE MILESTONE HAD ALREADY FELT THE GAP WITHOUT NAMING IT. raid-asm-engine-serves-from-the-bound-tree asks whether a running engine can serve content from a store it does not live in. That is the same seam from the other side, and it is recorded as unprobeable from this repository. An assumption stood where a requirement belonged.

WHAT THIS REOPEN PROVES, and it is worth more than the fix.

The previous pass of this state signed a register that had just been audited for solution-freedom by the owner, and it still missed a fatal must. Not because the audit was careless - it swept 205 statements and found 27 - but because a sweep can only judge the rows that EXIST. Nothing sweeps for the row nobody wrote.

THE OWNER FOUND IT BY SAYING WHAT IRRITATES THEM. Eight step-outs were measured on 2026-08-13 and recorded as a cost. It took a person saying "I do not want to reload to apply engine changes" for the cost to become a demand.

AND THE EARLIER PASS OF THIS STATE ALREADY SAID SO IN ITS OWN WORDS: until the freshness check exists, an iteration's honesty depends on whether somebody happens to read the right neighbour. Here it depended on whether somebody happened to say the right sentence.
