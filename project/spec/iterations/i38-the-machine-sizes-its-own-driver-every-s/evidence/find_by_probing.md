---
form: find_by_probing
amended: "2026-08-20T14:10:09.186Z by agent — two claims about the engine that the record itself corrected in the nodes this form fed, and left standing here"
by: agent
signed_off: 2026-08-20T12:20:35.369Z
authors: agent
files:
---

# Evidence form / find_by_probing

## current_situation

Twenty-four options stand from six finders. This is the seventh and the only one that runs rather than reasons, so it was pointed at the four questions the other six left as assertions.

THREE OF THE FOUR TEST AN OPTION ALREADY ON THE CHART rather than searching for a new one. meth-spike-tracer allows both — the output is an option node or a recorded dead end — and with twenty-four candidates standing, killing one is worth more than adding a twenty-fifth.

EVERY PROBE RAN THROUGH se_run AND IS THEREFORE IN THE CALL LOG. That is deliberate and it is new for this record: every other count in this iteration was computed outside the lane and is correct but unverifiable. These four are the first measurements whose act is attributable, which is the thing this iteration is trying to make possible.

## applies

yes

## probes

| question | timebox | what_was_faked | verdict |
| --- | --- | --- | --- |
| Does what the rigor matrix already carries separate the 53 states into more than one difficulty class at a given change size, or does it collapse? | 20 min, run in 34 ms | the formula — field count only, with no weight for the method a cell names and no weight for how hard the judgement is | THE DECLARED WORD COLLAPSES EXACTLY WHERE THIS RECORD OPERATES. At major, 49 of 53 rows read `full`; at product, 51 of 53. At patch and minor it discriminates — 13 tailored, 34 none, 6 full at patch. The field count is the opposite: at major it spreads across seven classes (10 rows ask 0 fields, 19 ask 1, 12 ask 2, and on to 6), and major and product have identical distributions. So a declared word is redundant at patch and minor and carries no information at major, and the field count is informative precisely where the word is not. |
| Does anything durable record which states have been reopened and how often, so a row's difficulty could be fed by its own history — and does that history discriminate? | 20 min, two runs | nothing was stubbed; the whole population was read | THE HISTORY IS DURABLE, IN THE TREE, AND SHARPLY DISCRIMINATING. 640 evidence forms on disk across all records; 140 carry a `reopened` value; 197 distinct state names have been walked, 146 of them never reopened. Among states walked five or more times the extremes are clean: pressure-test 4/6, derive-criteria 4/6, reverse-sensitivity 3/5, evaluate-set 3/5 at the top, and all six finder states at 0/6 at the bottom. The ranking is judgement-heavy states above enumeration states, which is the ordering the option predicted. |
| If a state were walked twice, could the two results be compared mechanically, or is agreement undefinable? | 20 min | THE PAIRS ARE THE WRONG PAIRS, and this is the probe's whole limitation. It compares a form against its own repair, not two independent walks, so it bounds the comparison problem and says nothing about whether the rung changes the answer. | COMPARISON IS COMPUTABLE AND USEFULLY SPREAD. 17 of i38's 27 forms have two or more commits; similarity between first and last signed body runs from 0.39 to 0.99 with a median of 0.81. A second result fell out unasked: every one of the seventeen grew — 21 lines to 29, 29 to 54, 180 to 182 — and not one shrank. A hostile pass only ever adds. |
| Is there already a mechanism that reads a per-column value off the matrix row and hands it to the walker, or would the difficulty be new machinery? | 30 min, four runs | the reading is static — no test was written that puts a value through cellsOf and reads it off a compiled state, so the path is established by code inspection rather than by execution | THE CHANNEL EXISTS AND HALF OF IT IS ALREADY IN USE. cellsOf at engine/rigor-matrix.ts:417 builds a RigorMatrixCell per row per column from `fm[col]` and `fm[col + "_note"]`; compileColumn at :609 pulls the cell for the pinned column and folds its prose into the compiled state at :612. The cell's VALUE is read as an in-or-out question and never as data: at :593 to decide whether the row is in the compiled machine, and at :526 in assertFloor to catch a floor row struck out of the column. CORRECTED at gate-candidates, which said ONCE and cited only the first. So a complexity value is a third cell key on a path that already runs — and it lands on the pinned machine, which is what the fatal live-read requirement forbids for a reason that does not apply. |

## options

- opt-the-complexity-rides-the-cell-the-compiled-state-already-carries

## dead_ends

- The declared rigor word as a source of difficulty: dead at the change size this record was blessed at. 49 of 53 rows read `full` at major, so the word cannot rank them, and any candidate reading it would be reading a constant.
- Two independent walks of one state as evidence that the rung matters: not run and not killed. The timebox bought a comparison method and the pairs available were repairs rather than independent walks, so the question stands unanswered and opt-walk-a-sampled-step-twice-on-two-rungs-and-compare goes to evaluate-set untested.
- The difficulty as new machinery: dead. It was never proposed outright, but every option on the chart assumed a lookup had to be built, and probe 4 found the path already compiled.

## follow_up

THE FOUR PROBES MOVED THREE STANDING OPTIONS AND ONE STANDING REQUIREMENT, which is more than the one new option they produced.

opt-the-difficulty-is-computed-from-the-row-s-own-field-count arrived from a transform operator as a reasoned guess and leaves measured: it is informative at major, where the alternative it competes with is a constant. That is the strongest single result here.

opt-a-row-s-difficulty-tracks-its-own-reopen-history arrived with a stated fear — that a row never reopened because nobody checked would read as easy — and the probe confirmed both the mechanism and the fear in one run. The six finder states sitting at 0 of 6 include the two signed in this session, and nothing has ever run a hostile pass over a finder. The signal is real and it is partly a record of where somebody chose to look.

req-the-complexity-value-is-read-live-and-never-pinned is over-stated, and probe 4 is what showed it. Its harm is demand movement; the demand SHAPE is four keys and a COMPLEXITY value reaches none of them. CORRECTED at gate-candidates: this said a cell value reaches none of them, and one already does — engine/iterations.ts:294 builds each demand with cell.applies as its first field and :356 reopens a record when that value's rank rises. The conclusion survives because demandsFor builds from three named things and ignores a fourth cell key; the reason given for it was false. The live-read half has no stated harm at all and it rules out the cheapest candidate on the chart. Logged as raid-iss-the-live-read-rule-forbids-more-than-its-own-reason-needs for gate-design to rule on — a finder that amends the requirement it is searching under has stopped searching.

AND ONE RESULT BELONGS TO THE RECORD RATHER THAN TO THE DESIGN. Seventeen forms repaired, seventeen grew, none shrank. The same ratchet that raid-risk-a-hand-declared-rung-drifts-upward-and-nothing-ever-says-so predicts for declared rungs is already observable in this iteration's own evidence, measured on its own commits.

## anything_else

