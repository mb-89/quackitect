---
minted_in: i37-training-iterations-a-disposable-iterati
id: uc-measure-a-machine-change-against-a-finished-iteration
type: "[[use-case]]"
statement: "Measure a machine change against a finished iteration."
actor: stk-engineer-driving-agents
trigger: a change to the process machine that the engineer wants to judge
precondition: at least one iteration is shipped and carries a pinned change size
guarantee: a committed report states what the walk cost under named conditions, and where a prior run on the same iteration exists, the pair can be read as a delta
refines:
  - sty-know-whether-a-machine-change-helped
priority: must
---

## Main scenario

1. The engineer asks for a benchmark run, naming an archived iteration, naming a size, or naming nothing.
2. The system resolves which iteration to walk and states its choice.
3. The system finds the commit before that iteration started and stands a throwaway tree there.
4. The system binds the run and hands an agent the seeded record that already stands at that commit.
5. The agent walks the machine from that state until the run's stop point.
6. The system fills a benchmark report with the numbers and the conditions of the run.
7. The engineer reads the report against an earlier report on the same iteration and takes the delta.

## Extensions

1a. The engineer names nothing. The system takes the iteration benchmarked least recently, reading the reports folder, and says which one it took and why.

1b. The engineer names a size. The system draws an archived iteration pinned at that size, records the seed of the draw, and states both.

5a. The subject is the OLDEST shipped iteration, so no older neighbour exists to prove the tree with. The run proceeds and RECORDS that it had no control — a weaker result, not an equal one.

5b. An older neighbour exists and its files are NOT in the stood tree. The run refuses: an empty fetch and a correct rewind both answer "not there" to everything, so a tree that cannot show what the rewind was never meant to remove has proved nothing.

6a. The model or the reasoning effort is unset. The refusal happens AT BIND and names which, because a run that walks a whole iteration and is only then refused at report time has thrown the work away.

7a. The walk dies part way. The report still exists, and `ended_at` is where it actually stopped — a run that died is the interesting one.

7b. The call log predates the position stamp, so no record says which state it was in. Cost per state REFUSES rather than returning one bucket holding the whole walk under a plausible label.

## What this use case does not promise

IT CANNOT TELL A GOOD DECISION FROM A BAD ONE. A re-walked iteration has no live subject to decide about, so what is measured is process overhead under observation — never production behaviour, and never quality.

A SINGLE RUN IS NOT A RESULT. Agents vary between identical runs by more than the effect being measured, so the unit is a median over at least three with the spread beside it, compared only within one set of conditions.

THE VERB IS `se_benchmark`. `se_benchmark {iteration?, stop_at?}` opens a run and `se_benchmark {stop: true, ended_at}` closes one. It is one verb because a run has one lifetime.


1c. The engineer names a stop point. The run walks to that gate instead of to the end, and the report says so, because a run stopped early cannot be compared with one that was not.

2a. No archived iteration matches. The system refuses and names what the archive holds, rather than substituting a near miss.

5a. The walk cannot continue and no remedy gets past it. The run ends where it stands and the report records the state it stopped in, because a failed run is a measurement of the machine too.

7a. No earlier report exists for this iteration. The report stands alone as a baseline and claims no delta.
