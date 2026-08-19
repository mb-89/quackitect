---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: dsp-the-outside-boundaries-and-their-bounds
type: "[[design-spec]]"
statement: every crossing where the product meets something it does not own is a node carrying its own argued bound, and the matrix knows a neighbour is a legal end
realizes:
  - "el-walk-engine"
  - "if-agent-harness-to-entrypoint"
  - "if-engineer-to-mirror"
  - "if-vscode-to-mirror"
  - "if-test-runner-to-toolchain"
  - "if-bootstrap-to-toolchain"
  - "if-account-to-git"
  - "if-record-store-to-git"
  - "if-record-store-to-origin-remote"
  - "if-account-to-obsidian"
  - "if-walk-engine-to-web"
  - "if-mirror-to-output-tools"
files:
  - "project/deliverable/machines/items/interface.md"
  - "project/deliverable/engine/trace.ts"
  - "project/deliverable/engine/elematrix.ts"
---

## The element this design lands in

IT REALIZED ONLY INTERFACES, and the design-spec register refuses a spec that
names no element — every spec has to say which box its design lives in.

THE ANSWER IS THE WALK ENGINE, and the spec's own `files` already said so
before this edge did. `elematrix.ts` computes the matrix, and the matrix is
checked when an evidence form is submitted. That check runs in the walk engine
and nowhere else.

WHAT THE EDGE DOES NOT CLAIM. The interface NODES are corpus, not code, and
the item template beside them is method. Naming the walk engine says where the
knowledge is USED, which is what a realizes edge has always meant.

## The concern

THE ELEMENTS EXISTED AND THE NEIGHBOURS EXISTED, AND THE EDGES BETWEEN THEM DID
NOT. Forty interface nodes stood and every one was element-to-element. The
outside boundary — where the product meets something it does not own — had
never been drawn.

SO THE ONE-SECOND RULE HAD NO DENOMINATOR. Both pass lines take a share over
the set of interfaces a person or an agent touches, and nobody could enumerate
that set. i12 shipped the rule as guidance; two days later 1834 of 8424 calls
were over it, and nothing in the machine could say which crossings those were.

## The design

ONE NODE PER ELEMENT-TO-NEIGHBOUR CROSSING THAT CARRIES TRAFFIC. Thirteen, and
all eleven neighbours are covered.

EACH CARRIES ITS OWN BOUND, ARGUED RATHER THAN DEFAULTED. Five say one second.
Six say not one second and say why. One says none, because nothing is served
across it. A single flat rule would be unkeepable at six of them and would
quietly stop meaning anything at the rest.

THE SAME NEIGHBOUR MAY APPEAR TWICE, and that is the design earning its keep.
`if-account-to-git` and `if-record-store-to-git` both reach git: commits meet a
second, raising a worktree copies and cannot. One node for both would give a
bound that is wrong for one half and hide which half a breach came from.

A NOT-ONE-SECOND BOUND IS NOT AN EXEMPTION. It moves the demand to the honest
half: the crossing says it is working, inside the second, and never leaves
anybody guessing whether it is alive.

## What holds it up mechanically

- `machines/items/interface.md` carries `bound` in the skeleton, so it is a
  field of the type. Its default is `inherited`, honest for an in-process
  crossing which has no clock of its own and is paid for by the outside call
  that reached it. That default is what keeps the forty standing internal
  interfaces conforming.
- `engine/trace.ts` holds `outsideBoundaryProblems`: an interface with `nbr-`
  at either end may not inherit.
- `engine/elematrix.ts` was widened. The element matrix is element-to-element
  by construction, so it reported all thirteen as naming an end no element
  carries. That was the law being narrow rather than the nodes being wrong.

## The honest limit, stated rather than left to be discovered

THE BOUND LAW DOES NOT BITE YET. `conformance()` runs at form submit over the
nodes a form field references, and no evidence field enumerates interfaces. A
deliberately non-conforming node was written, the engine reloaded, and the full
battery run green with it sitting in the corpus. The probe was then deleted.

WHAT WOULD CLOSE IT is the corpus sweep running conformance, so a shape law
binds whether or not a form happens to mention the node. The blast radius is
unmeasured, so it is presented rather than taken (note-29960c805dc0).

## The element matrix

THE ELEMENT MATRIX, COMPUTED. Nobody types an owed cell.

The crossings fall out of what already stands: a function node carries its
flows as inputs and outputs, an element names the functions it implements,
an interface names its source, destination and carried flows. A flow whose
producing function and consuming function are implemented in different
elements CROSSES a boundary, and each crossing pair owes an interface.

The person's work is the judgment the arithmetic cannot make: naming each
owed cell's contract and choosing its concrete form. Same law as the
pareto front and the Pugh runs — the computable part computed, the
judgment typed (owner design 2026-08-10, the numbered-cell sketch).

NOTHING HERE KNOWS ABOUT THIS REPOSITORY. Elements, functions, flows and
interfaces are the whole vocabulary.

## An outside boundary is not a matrix cell

AN OUTSIDE BOUNDARY IS NOT A MATRIX CELL (i33, 2026-08-17). This matrix
is element-to-element by construction: it computes owed cells from where
a FLOW crosses an element boundary, and a neighbour sits outside the
element set entirely. An interface with `nbr-` at one end is the product
meeting something it does not own, and it is demanded by the boundary
model rather than by a crossing flow.

IT USED TO READ AS A DEFECT, because the law was written when every
interface was internal. The first thirteen outside boundaries all
reported as naming an end no element carries, which is the law being
narrow rather than the nodes being wrong.

BOTH ENDS OUTSIDE IS STILL A DEFECT. Two neighbours talking to each
other is not this product's interface to describe.

## Does this node keep its types promises

DOES THIS NODE KEEP ITS TYPE'S PROMISES.

 A reference resolving to a file that does not answer its own template is
 worse than a dangling one: the gate follows it, finds something, and
 reviews a hole.

 A TODO LEFT IN PLACE COUNTS AS UNANSWERED. The mint writes TODOs on
 purpose, so treating them as filled would let a skeleton pass as work.

 A FIELD THE NODE OMITS TAKES THE TEMPLATE'S DEFAULT (owner ruling
 2026-08-06). Widening a template must not make the whole standing corpus
 non-conforming overnight: the default is what the template asserts is true
 until a node says otherwise, and migration only visits the nodes where it
 is wrong. A field with no honest default carries a TODO instead, and that
 field is introduced together with its migration.
What a node ANSWERS for a field: its own value, or the template's default
 where it carries none. One function, so every reader resolves it alike.

## An outside boundary states its own bound

AN OUTSIDE BOUNDARY STATES ITS OWN BOUND (i33, 2026-08-17).

 `bound` DEFAULTS to `inherited`, and that is honest for an in-process
 crossing between two elements: it has no clock of its own and is paid for
 by the outside call that reached it. Forty standing interfaces are exactly
 that, and widening the template must not make them non-conforming
 overnight.

 IT IS NOT HONEST WHERE THE CROSSING *IS* THE OUTSIDE CALL. There the
 default would quietly cover the one place a person or an agent actually
 waits, which is a demand nothing enforces — the shape i12 already shipped
 once, as guidance, before 1834 of 8424 calls went over it.

 THE TELL IS THE NEIGHBOUR PREFIX, because a neighbour is by definition
 something the product does not own.

## How many times the corpus was asked for

HOW MANY TIMES THE CORPUS WAS ASKED FOR. Every call to loadTrace, hit or
 miss, because the ASK is what req-one-operation-reads-its-input-once is
 about — an operation collects its input once and hands it down.

 IT COUNTS ASKS AND NOT MISSES ON PURPOSE, and a test that got this wrong is
 why the counter exists (i33, 2026-08-17). The green guard counted reads
 through the file DOOR and claimed that caught a per-state corpus load. It
 does not. loadTrace memoizes ABOVE the door: on a stamp hit it returns the
 held nodes having called noteOf zero times, so putting a load back inside a
 per-state loop costs about 210 statSync calls the door never sees and no
 door accesses at all. The count stayed flat and the guard passed.

 SO THE THING THE REQUIREMENT NAMES IS COUNTED DIRECTLY. One operation, one
 ask. Twenty-five asks means twenty-five states each fetching their own.

## The vision has no node of its own yet

THE VISION HAS NO NODE OF ITS OWN YET (owner, 2026-08-05). Until the spec
 and the book exist, the motivation gate's report IS the vision, so the
 centre falls back to it rather than opening empty. An iteration keeps its
 evidence inside its bound worktree, which is why this looks there.

## Does this reduce to something shaped like a trace

Does this reduce to something SHAPED like a trace id.
DOTS ARE LEGAL INSIDE AN ID, and that is how the function tree carries its
 shape (owner ruling 2026-08-07). `fn-a.b` sits under `fn-a`; a node's
 parent is its id with the last segment removed.

 WHAT IT COST TO MISS. The character class had no dot, so every dotted id
 failed this test and was DROPPED by refsIn before anything looked at it.
 Not refused, not reported — dropped. The coverage check then said no
 function covered any requirement, which pointed at the tree rather than at
 the extractor, and the tree was correct.

 A FILTER THAT DISCARDS SILENTLY IS THE WORST SHAPE for this. It cannot be
 distinguished from an author who wrote nothing.

## A sections name

A SECTION'S NAME, WRITTEN OUT (owner ruling 2026-08-07). The short label
 truncates, and truncation is what turned "vendoring" into "ndorin" on the
 arc. There is room for the whole thing, so the whole thing is drawn.

 The type prefix goes and the dashes become spaces, because the arc is read
 by a person rather than matched by a machine.
