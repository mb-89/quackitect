---
form: draft-vision
by: agent
signed_off: 2026-08-19T16:48:26.463Z
authors: agent
files: null
---

# Evidence form / draft-vision

## current_situation

i37 stands at M1 with its size pinned major and the kickoff gate blessed. The machine compiled to 52 steps at matrix hash 45a7d5135bfd.

THE DESIGN ARRIVED SETTLED. Four rounds of owner rulings were recorded before the walk started, and each round removed mechanism the agent had proposed. The brief is project/spec/training-iterations.md.

THE INBOX IS EMPTY. Two work tokens stand in the pool, one of them this iteration's own dependency.

NOTHING IS BUILT YET. No engine code has been written, so there is nothing to typecheck, lint or test.

## big_idea

INHERITED, NOT REWRITTEN. The resident big idea stands: an engineer draws their own process as a state machine, and the engine gives it teeth, so the rigor arrives without the paperwork.

THE DELTA IS ONE SENTENCE ADDED TO IT. Today nobody can say whether the machine is getting better, so every improvement to it is taste. A benchmark run re-walks a real iteration the project already finished, times the walk, and answers whether a weaker model on a newer machine does the work a stronger model used to need.

WHY THAT IS STILL THE SAME IDEA. "Rigor without the paperwork" is a claim about cost. A claim about cost that nobody measures is an opinion. This makes the existing idea checkable rather than proposing a different one.

## to_be_world

INHERITED. The engineer still spends their time on redlines and thumbs while the agent carries the method. Nothing about a working day changes.

WHAT IS ADDED IS A NEW HABIT, and it belongs to the maintainer of the machine rather than to the engineer using it.

The maintainer changes something in the guidance. They start a benchmark run. The system looks at which iterations were walked recently, takes the one least recently walked, and rewinds a throwaway tree to the commit before that iteration started. An agent walks it, filling the same forms, hitting the same gates, on a tree that has never seen the answers.

At the end there is a report. It says iteration 33 took eleven percent fewer lane calls than it did on the previous machine, at the same model and the same effort. The maintainer keeps the change.

TWO MONTHS LATER the same maintainer runs the same iteration with a smaller model. It lands within the spread of the old number. That is the sentence the whole thing exists to make sayable: the machine now carries what the model used to carry.

AND THE RUN LEAVES SOMETHING ELSE BEHIND. Walking an old design again, with the arguments re-litigated by somebody who was not there, turns up ideas nobody had the first time. Those become notes.

## goal_system

THE BIG IDEA: a benchmark that costs nothing to author, because the archive already holds real design inputs.

THE GOALS, in the order this iteration rules them.

1. THE ORIGINAL ANSWERS ARE UNREACHABLE. A run rewinds to the commit before its iteration started, and the lane refuses to resolve any commit that is not an ancestor of that point. This ranks first because it is the only goal whose failure makes every other one worthless. A run that can read what the original decided is measuring search speed.
2. NOTHING IS AUTHORED. The design input is the seeded record that already stands at the rewind commit. Measured on i33: at 5f85977f^ the record carries goal, vision and inputs, and carries no pin.
3. A RUN IS REPEATABLE AND ITS CONDITIONS ARE ON THE REPORT. The iteration, the rewind commit, the model, the effort, the matrix hash, the se version. A number without its conditions is not a result.
4. THE RUN LEAVES A SECOND OUTPUT. Findings about the original decision and about the machine, because re-litigating an old design is where better ideas come from.
5. NOTHING ABOUT THE RUN IS COMMITTED EXCEPT THE REPORT. The working tree is thrown away. The filled template survives.

THE CONFLICTS, NAMED OPENLY. There are four and none of them dissolves.

CONFLICT 1 — HONESTY AGAINST FIDELITY. Goal 3 wants a number that predicts real iterations. An agent told its output is thrown away does not work the way it works on real evidence, so the honest number describes a mode of working that never happens in production. Blinding the agent would fix the fidelity and would require the machine to lie.
RULED by the owner, 2026-08-19: open, not blind. The claim is narrowed to match. A benchmark number describes PROCESS OVERHEAD and never production behaviour, and that limit is written into the report rather than discovered by whoever reads it.

CONFLICT 2 — THE CEILING AGAINST THE AGENT'S ORDINARY WORK. Goal 1 wants history unreachable past the rewind point. An agent legitimately reads history to do its job, and se_git allows show, log and diff for good reasons.
RULED: the ceiling binds only while a run is bound, and it is a ceiling rather than a filter. Nothing is hidden from a normal walk. What is refused is a commit that did not exist yet at the moment the run is pretending to be.

CONFLICT 3 — CYCLING AGAINST REPEATABILITY. Goal 3 wants runs that repeat. The owner ruled that runs cycle through the archive rather than repeating the last one, so no single report is ever reproduced exactly.
RULED: the unit of comparison is the PAIRED DELTA, never a single report. One iteration against itself across machine versions. A cycle is the sample, and the median delta across its pairs is the number. This also makes the growing pool an upside rather than a threat, because a new candidate adds a pair and cannot move a measured one.

CONFLICT 4 — THE COST OF THE MEASUREMENT AGAINST WHAT IT MEASURES. A major iteration is roughly a day of agent work, so a full re-walk is an expensive stopwatch. Stopping at a named gate costs an hour.
RULED by the owner, 2026-08-19: configurable, with the whole walk as the default. The trade is stated rather than hidden. A stop before the design gates keeps the timing and loses goal 4 entirely.

THE PRIORITY ORDER, ruled: 1 over 2 over 3 over 4 over 5.

Goal 1 gates everything, so it wins any tie. Goal 5 ranks last only because breaking it is loud and reversible — a committed artifact can be removed — while breaking goal 1 is silent and poisons every number taken under it.

## moore_pitch

INHERITED AS A PRODUCT PITCH. Quackitect's own five slots are untouched by this iteration, and a measuring instrument does not get its own market.

THE PITCH BELOW IS THE INTERNAL ONE, written because the form asks for five slots and because naming the alternative is the useful half.

FOR the maintainer of a process machine WHO cannot tell whether a change to it helped, THE benchmark run IS A repeatable re-walk of an iteration the project already finished THAT reports what the walk cost in time and calls under named conditions. UNLIKE running the next real iteration and forming an impression, OUR run holds the work fixed so the only thing that moved is the machine.

WHY THE ALTERNATIVE IS THE REAL ONE. Nobody was going to build a competitor. The thing this replaces is judgment by feel, and it is what the project does today.

## follow_up

- The M1 chain continues: define-actual, log-risks, frame-delta, scope-non-goals and pressure-test, then gate-motivation.
- log-risks carries the register additions the kickoff deferred. The git ceiling failing open is the first of them.
- wt-three-separate-lists-decide-which-paths-a-lane-verb-may-see- is this iteration's own dependency and is pulled in rather than parked.
- Owner: nothing is owed at this state. The four rulings that shaped this vision are already recorded on the record.

## anything_else

THE VISION NAMES A LIMIT IT CANNOT REMOVE, and writing it here is cheaper than discovering it at validation.

A BENCHMARK RUN MEASURES THE MACHINE AND NEVER THE ANSWER. The re-walk produces different evidence from the original, and nothing in this design judges which is better. The original walk is a REFERENCE, not a correct answer, because the original may have been wrong.

SO GOAL 4 IS THE ONLY PLACE QUALITY ENTERS, and it enters as a reading done by a person or an agent rather than as a score the engine computes. An iteration that claimed to measure quality automatically would be claiming more than it can hold.

ONE EARLIER CLAIM ON THE BRIEF WAS WRONG AND IS CORRECTED IN PLACE. It said quality cannot be measured at all. That was true of an authored scenario, where there is no reference to read against. It is too strong for a re-walk.
