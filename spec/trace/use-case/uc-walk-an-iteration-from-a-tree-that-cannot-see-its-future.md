---
minted_in: i37-training-iterations-a-disposable-iterati
id: uc-walk-an-iteration-from-a-tree-that-cannot-see-its-future
type: "[[use-case]]"
statement: Walk an iteration from a tree that cannot see its own future.
actor: stk-agent
trigger: the agent is bound to a benchmark run
precondition: a throwaway tree stands at the commit before the walked iteration started
guarantee: every commit newer than that point is unreachable through the lane for the length of the run, and the tree is discarded when the run ends
refines:
  - sty-walk-a-past-tree-without-reaching-its-future
priority: must
---

## Main scenario

1. The system tells the agent it is walking a benchmark, and which iteration.
2. The agent reads the seeded record standing at the rewind commit and takes it as its design input.
3. The agent works the machine normally, reading the corpus and asking git what changed.
4. The lane serves anything at or before the rewind commit and refuses anything after it.
5. The agent writes its own tests, watches them fail, and makes them pass against the tree as it stood.
6. The run reaches its stop point and the agent's output is discarded.
7. The report keeps the numbers and the conditions.

## Extensions

3a. The agent asks for a commit newer than the rewind point. The lane refuses and names the ceiling, so the refusal reads as a boundary rather than as a missing file.

4a. The ceiling cannot prove a commit is an ancestor of the rewind point. It refuses. Failing closed is the only safe direction, because a ceiling that goes quiet looks exactly like a ceiling that passed.

4b. The agent reaches for git through the shell instead of the lane. The discipline lane warns once and refuses afterwards, and the reason is filed either way.

5a. The tests the agent writes differ from the ones the original wrote. Nothing corrects this. The re-walk produces its own answer and the original is a reference, never a correct answer.

6a. The agent asks the benchmarks folder what earlier runs measured. It is concealed for the length of the run, so no number anchors the walk that is producing the next one.
