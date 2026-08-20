---
form: draw-context
by: agent
signed_off: 2026-08-19T17:03:50.444Z
authors: agent
files:
---

# Evidence form / draw-context

## current_situation

i37 stands at draw-context, the first step of M2. M1 is complete and gate-motivation is blessed.

Five register entries are open, two of them graded fatal. vp-rigor-without-toil carries one new success criterion.

The context folder already holds 14 neighbours. This step asks whether the delta moves the boundary.

## boundary

THE BOUNDARY DOES NOT MOVE, and that is the finding rather than a shortcut.

WHAT IS INSIDE. The lane, the walk, the records, the corpus, the call log, and now the benchmark subsystem: the rewind, the ceiling, the chooser, the report template and the conditional concealment. Every one of those is Quackitect talking to itself.

WHY A BENCHMARK ADDS NOTHING OUTSIDE. The thing being re-walked is a folder in this repository. The history it rewinds to is this repository's own git. The agent walking it arrives through the same harness every walk arrives through. The report lands in this repository's own spec.

THE ONE THING THAT LOOKS EXTERNAL AND IS NOT. An archived iteration's past state feels like a foreign system, because the walk is pretending the present does not exist. It is the same tree at an earlier commit, reached through the same neighbour, and treating it as external would invent a boundary to explain a time offset.

WHAT IS OUTSIDE AND IS TOUCHED HARDER THAN BEFORE. Three existing neighbours carry more weight after this delta than before it, and each is listed below with what changes.

THE CLAIM THIS SECTION MAKES, so a later reader can falsify it: this iteration integrates with nothing the context does not already name.

## neighbours

- [[nbr-git]]
- [[nbr-agent-harness]]
- [[nbr-engineer]]

## intended_use

A MAINTAINER OF THE MACHINE WANTS TO KNOW WHETHER A CHANGE THEY MADE HELPED.

They start a benchmark run. They may name an archived iteration, or ask for one of a size, or say nothing and take whichever iteration was benchmarked least recently.

The system finds the commit before that iteration started, stands a throwaway tree there, and hands an agent the seeded record that already sits at that commit. The agent walks the machine from there, filling the same forms and meeting the same gates as the original walk did.

While the run is bound, nothing newer than the rewind commit resolves through the lane, so the answers the original produced are out of reach.

At the end the run fills a report. The report is the only thing committed, and it stamps the iteration, the rewind commit, the model, the effort, the matrix hash and the se version beside its numbers.

THE MAINTAINER READS ONE PAIR AT A TIME. The same iteration on two machine versions, at the same model and effort. The delta between them is the answer.

AND THEY READ THE SECOND OUTPUT. Whatever the re-walk found about the original decision, or about the machine, that nobody noticed the first time.

## excluded_use

WHAT IT DOES NOT DO.

- IT DOES NOT SAY WHETHER A DESIGN DECISION WAS GOOD. The original walk is a reference, never a correct answer. Any quality comparison is a reading by a person or an agent, and the engine computes none of it.
- IT DOES NOT PREDICT WHAT A REAL ITERATION COSTS. The agent knows the output is discarded, so the number understates. It is a floor, not an estimate, and it is comparable only against another benchmark.
- IT DOES NOT COMPARE TWO DIFFERENT ITERATIONS. Iterations differ enormously in size. Only a pair of runs on the SAME iteration means anything.
- IT DOES NOT COMPARE ACROSS HARNESSES. It stamps the harness so a later comparison is possible. Measuring what each host gives the lane is i36.
- IT DOES NOT REPLAY. Recorded results are never fed back. The agent is re-invoked every time, which is the whole cost being measured. Replay is i31.
- IT DOES NOT RANK STATES BY DRAG. It supplies the repeatable workload that makes such a ranking mean something. The ranking is i32.
- IT DOES NOT SCORE A MODEL. A benchmark run holds the work fixed to measure the MACHINE. Reading a low number as a verdict on the model inverts the instrument.
- IT DOES NOT BENCHMARK AT PATCH, PRODUCT OR SPECIFICATION. The archive holds no instance at those columns, and the owner ruled they are not gaps.
- IT DOES NOT REOPEN THE ITERATION IT RE-WALKS. i33 is shipped and stays shipped. A run touches no real record, renumbers nothing, and appears in no survey.

## follow_up

- map-stakeholders is next and is tailored at this column, so it argues the delta against the resident stakeholder set rather than re-deriving it.
- The boundary claim above is falsifiable and should be checked once the mechanism exists: if a benchmark run reaches anything the context does not name, this section is wrong.
- nbr-git carries the most new weight. The ceiling is a constraint ON that neighbour's interface, and write-requirements in M3 is where it gets a testable statement.

## anything_else

NO NEIGHBOUR WAS MINTED HERE, AND THE TEMPTATION TO MINT ONE IS WORTH RECORDING.

The obvious candidate was something like "the archived iteration" or "the past tree". It reads like a neighbour because the walk treats it as foreign.

IT IS NOT ONE. A neighbour is a thing outside the boundary with an interface crossing it. The past tree is this repository at an earlier commit, reached through nbr-git, using the same verbs. Minting a node for it would put a time offset in the context diagram and teach every later reader that the system integrates with its own history.

THE SAME LOGIC RULED OUT A NEIGHBOUR FOR THE BENCHMARK REPORT. It is a corpus node in this repository's own spec, like every other standing artifact.
