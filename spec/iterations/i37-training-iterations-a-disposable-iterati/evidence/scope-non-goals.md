---
form: scope-non-goals
by: agent
signed_off: 2026-08-19T16:56:22.198Z
authors: agent
files: null
---

# Evidence form / scope-non-goals

## current_situation

i37 stands at scope-non-goals, the fifth step of M1. Four steps are signed and five register entries are open.

frame-delta authored one new success criterion on vp-rigor-without-toil and named the gap: every improvement to this machine is judged by feel.

This step draws the line around what closes that gap in this iteration.

## scope

WHAT THIS ITERATION TAKES ON, in five pieces.

ONE — THE REWIND. A command that takes an archived iteration, finds the commit before it started, and stands a throwaway tree there. The two ends are read from commit messages: `iteration <id>: started` marks the near end and its parent is the rewind point.

TWO — THE CEILING. While a run is bound, no commit that is not an ancestor of the rewind point resolves. It binds `se_git` and it binds a `ref:` read through the file lane. It fails closed: a commit that cannot be proven an ancestor does not resolve.

THREE — THE CHOICE AND THE CYCLE. A run is named by iteration id, or drawn by size. A draw records its seed. With neither, the run takes the iteration least recently benchmarked, read from the reports folder.

FOUR — THE REPORT. One new item template, `benchmark-run`, at `project/spec/benchmarks` with the `bench-` prefix. The id carries the iteration. The filled report is the only thing committed, and it stamps its conditions.

FIVE — THE CONDITIONAL CONCEALMENT. The benchmarks folder is invisible while a run is bound and visible everywhere else. This is the piece with a dependency: three lists decide what a lane verb may see and the reading verb consults none of them.

AND THE STOP POINT RIDES ON PIECE ONE. A run walks the whole machine by default, or stops at a named gate when told to.

## non_goals

- REPLAY WITHOUT RE-INVOKING THE AGENT. That is i31 and stays i31. Feeding recorded results back and re-invoking an agent are two modes, and i31's own record says conflating them will cause pain.
- RANKING STATES BY DRAG. That is i32. This iteration supplies the repeatable workload i32 needs; it does not do i32's analysis.
- CAPTURING THE AGENT'S THINKING. Also i32. The call log already carries duration and outcome per call, and that is all this iteration reads.
- AN AUTHORED SCENARIO POOL. Struck by the owner. The archive holds real design inputs and the cost of writing fake ones is what killed an earlier attempt at this.
- A SANDBOX PACKAGE WITH FAKE TESTS. Struck with the pool. A re-walked iteration writes real tests against the real tree.
- A PATH MASK OVER AN ITERATION FOLDER. Struck on measurement: 282 files under `project/spec/trace` mention i15 or i34.
- NAMED SYNTHETIC FIXTURES. Struck. A benchmark is named after the iteration it re-walks.
- BENCHMARKS AT PATCH, PRODUCT OR SPECIFICATION. The archive holds none, and the owner ruled these are not gaps.
- SCORING THE RE-WALK'S ANSWER. The original is a reference, never a correct answer. Quality is read by a person or an agent, never computed by the engine.
- A SECOND LEDGER. The reports folder is the scheduler's only state.
- FIXING THE THREE-LIST EXCLUSION DRIFT WHOLESALE. This iteration needs one conditional concealment and builds that. Reconciling every list is `wt-three-separate-lists-decide-which-paths-a-lane-verb-may-see-` and belongs to whoever takes that token.
- CONFIGURING A WEB SEARCH PROVIDER. `wt-outward-scanning-states-cannot-reach-a-search-engine-on-this` needs owner configuration, not build work.
- COMPARING ACROSS HARNESSES. i36 measures what each host gives the lane. This iteration only STAMPS the harness on a report so a later comparison is possible.

## follow_up

- pressure-test is next and is tailored at this column. It attacks the framing rather than re-deriving it.
- The five scope pieces become requirements at write-requirements in M3, and the ceiling is the one that most needs a testable statement.
- Piece five is the only one carrying a dependency. If the token is not taken by the time M7 arrives, this iteration builds the narrow version — one conditional rule for one folder — and says so rather than widening.

## anything_else

ONE NON-GOAL IS DOING MORE WORK THAN THE REST AND DESERVES NAMING.

Not scoring the re-walk's answer is what keeps this iteration finishable. The moment a benchmark claims to judge whether the new walk decided better than the old one, it needs a rubric, a scorer and an argument about what a correct design decision is.

THE HONEST VERSION IS SMALLER AND TRUE. The original is a reference. A person or an agent reads the two side by side and says what they see. That reading is the second output, and it is prose rather than a number.
