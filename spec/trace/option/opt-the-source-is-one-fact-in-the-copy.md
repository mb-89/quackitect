---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-the-source-is-one-fact-in-the-copy
type: "[[option]]"
cluster: the-bootstrap
question: how upstream's later work reaches a copy
statement: the copy records where it came from in exactly one committed place, the way it already records its own name in one place
found_by: heuristic
source: the catalogue rule ONE SOURCE OF TRUTH; EVERYTHING ELSE DERIVES, held against cluster-the-bootstrap
---

## Mechanism

THE PRODUCT ALREADY DOES THIS FOR ITS NAME. One file at the root carries it, and
nothing below spells it out, so producing a renamed copy means writing that one
file. The export script's own comment states the rule: the product name is one
fact.

THE SAME RULE, HELD AGAINST THE SAME CLUSTER, ASKS WHERE THE SOURCE IS. Today
it is nowhere. A copy knows what it is called and does not know what it came
from.

SO THE MOVE IS ONE MORE FACT IN ONE MORE PLACE, committed, beside the name. An
update reads it instead of asking.

## What it buys

NOBODY HAS TO KNOW. The person taking an update does not have to remember which
engine this copy descends from, and cannot name the wrong one by accident.

IT TRAVELS. Committed, it survives a move, a copy to another machine, and a
colleague's clone. That is the property the rootward reading found only in
mechanisms that record an identity rather than a path.

AND IT COSTS ALMOST NOTHING TO ADD, because the place already exists. The file
that carries the name can carry the origin.

## What it costs

IT IS A FACT THAT CAN BE WRONG, AND WRONG QUIETLY. A name that is wrong is
visible on every surface. An origin that is wrong is visible only when somebody
takes an update, which may be months later.

AND IT IS A LINK OF A KIND, WHICH WANTS SAYING PLAINLY. The owner has ruled that
a copy may rely on no link back to its source. An ADDRESS is not a dependency —
the copy runs perfectly without ever resolving it — but a reader who sees the
field may believe otherwise, and the distinction has already had to be made once
in this iteration.

SO WHATEVER CARRIES IT MUST SAY WHAT IT IS FOR. A field named as the source of
updates is honest. A field that looks like a parent pointer is not.

## Its rival, and why the chart wants both

[[opt-the-vendored-engine-is-one-more-reference]] SAYS THE OPPOSITE: record
nothing, and let the person name the engine when they pull.

THE TRADE IS THE SAME ONE THE WHOLE POINTER QUESTION KEEPS MAKING. Recording is
convenient and can rot. Naming at the time cannot rot and moves the knowledge to
a person.

THE DIFFERENCE HERE IS THAT ONE SIDE IS NEARLY FREE. The name already has a
home, so recording the origin beside it costs a line rather than a mechanism.
That is not true of the driven-tree pointer, where the whole file would be new,
and it is why the two questions can honestly land on different answers.
