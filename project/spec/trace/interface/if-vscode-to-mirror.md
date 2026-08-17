---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: if-vscode-to-mirror
type: "[[interface]]"
statement: The editor hosts the panel, and what it hands in decides what the panel can draw.
source: nbr-vscode
destination: el-mirror
carries:
  - flow-surface
  - flow-choice
form: extension webview
bound: 1 second
source_refs:
  - "i33 model-the-boundaries: the outside edges the element matrix never drew"
  - "raid-asm-every-host-hands-in-every-value-the-panel-can-draw, falsified 2026-08-17"
---

## What crosses

- the panel, rendered into a webview the editor owns
- an act on a control, back through the host

## Why this edge is its own, and not part of if-engineer-to-mirror

THE HOST IS BETWEEN THEM, and it is the thing that fails. A host that builds
its own panel values and omits one makes the control render as OFF, which is
indistinguishable from a refused click.

THAT WAS ASSUMED AND IS NOW KNOWN FALSE. raid-asm-every-host-hands-in-every-
value-the-panel-can-draw was minted as an assumption, probed, and turned into
an issue: the extension builds its own values with three keys where the panel
can draw more.

SO THE INTERFACE IS THE FINDING. Drawing the person and the editor as one edge
is exactly what hid a defect that lives between them, and it had three recorded
sightings before anybody wrote the edge down.

## Not measurable by an agent, 2026-08-17

THE HOST SITS BETWEEN THE TWO ENDS, and an agent cannot drive it. The panel
renders inside a webview the editor owns; reaching it means a person opening
the window.

SO THIS EDGE'S BOUND HAS NEVER BEEN OBSERVED, only reasoned. That is worse
here than elsewhere, because this is the edge where the falsified assumption
lived: a host that hands in fewer values than the panel can draw makes a
control render as OFF, which is indistinguishable from a refused click.

A MEASUREMENT NOBODY CAN TAKE IS A DEBT, not a gap in this node.

## The bound

ONE SECOND on the draw, and the same honesty demand on the act. A host that
cannot supply a value must make the panel say it does not know, rather than let
it draw a confident zero.
