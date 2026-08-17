---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: dsp-the-outside-boundaries-and-their-bounds
type: "[[design-spec]]"
statement: every crossing where the product meets something it does not own is a node carrying its own argued bound, and the matrix knows a neighbour is a legal end
realizes:
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
  - "if-satellite-supervisor-to-cloud-host"
  - "if-satellite-supervisor-to-peer-machine"
files:
  - "project/deliverable/machines/items/interface.md"
  - "project/deliverable/engine/trace.ts"
  - "project/deliverable/engine/elematrix.ts"
---

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
