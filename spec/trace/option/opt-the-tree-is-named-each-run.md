---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-the-tree-is-named-each-run
type: "[[option]]"
statement: nothing is recorded anywhere, and the caller names the tree on every invocation
cluster: the-walk
question: how a tree carrying no method finds the copy that drives it
found_by: prior-art
source: v1's baseFromArgs, product/engine-go/engine.go at ref main — the --base and -C flags, modelled on git -C
---

## Mechanism

THE PROGRAM STORES NOTHING. Each invocation carries an argument naming the
tree to work in, and without one the program falls back to walking up from the
current directory.

v1 SHIPPED BOTH HALVES. `--base` or `-C` names the tree, and its design note
gives the model: "like git -C". Absent the flag, it walks up from the working
directory looking for a committed marker file.

WHAT IT BUYS. There is nothing to lose, nothing to repair, and nothing to
migrate. A tree moved, copied or cloned behaves identically because no state
about it existed. It is the only option on this cell that survives all three
moves by construction rather than by care.

AND IT NEEDS NO WRITE AT ALL, which matters here more than it would elsewhere.
Every other option on this cell has to put a record somewhere, and this
product's path jail makes each of those a question.

WHAT IT COSTS. The knowledge moves to the person. Somebody has to know which
copy drives this tree and say so every time, and a wrong answer is not
detectable — the run simply uses the wrong method and produces plausible
output.

THE UPWARD WALK IS THE HALF THAT REDUCES THE COST, and it is the half worth
keeping separately in view. A marker committed inside the tree means the
person names nothing, and the marker travels with the tree through all three
moves. That is a different option, and it is the one this cell most wants
compared against.
