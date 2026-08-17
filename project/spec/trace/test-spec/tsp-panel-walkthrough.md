---
minted_in: i1
id: tsp-panel-walkthrough
type: "[[test-spec]]"
statement: The panel shows the machine and its claims, a returning person orients from it alone, and the walk survives a host swap, verified by demonstration in the editor.
method: "demonstration"
demonstrates:
  - "sty-hand-over-and-walk-away"
verifies:
  - "req-panel-shows-the-machine"
  - "req-selected-node-shows-its-claim"
  - "req-resume-needs-no-person"
  - "req-walk-survives-host-swap"
files:
  - "none — the procedure below is the definition; the observed sessions are the evidence"
---

## Scope

What a person SEES and comes back to: the panel beside the editor, the
trace node's claim on click, two open iterations side by side, the
return after an absence, and the host swap.

## Approach

System level, in the real editor, across real sessions. The resume and
host-swap claims ride real returns rather than staged ones — every
morning after an overnight run demonstrates the first, and each host
change demonstrates the second.

## Procedure

- Open the workspace after setup. Observe: the panel beside the editing
  area, the machine drawn.
- Click a trace node. Observe: statement and type shown, zero further
  navigation.
- Stand two dependency-free iterations open. Observe: both offered at the
  container's selection state, and neither entered until one is chosen.
  (Until i34 this step read "each in its own worktree", which is no longer
  observable — there are no worktrees.)
- Return after an absence. Observe: the panel says where everything
  stands; zero questions to another person.
- Reopen the project under a different supported host. Observe: the walk
  serves from the same recorded position; zero repair steps.

## Why it is owed, said correctly (i33, 2026-08-17)

IT NEEDS A PERSON AT THE PANEL, and nothing more. An agent cannot drive the
editor's webview, so the layout observations here are a person's.

THE REASON i33 FIRST GAVE WAS WRONG. It said this spec needs "a second host
that does not exist". i33's own verification says a second host DOES exist and
that a probe was signed which never opened it. The last step is owed because
nobody has looked, not because there is nothing to look at.

THAT DISTINCTION IS THE WHOLE POINT. "Blocked by a missing resource" retires a
check quietly and forever. "Nobody has looked" is an hour of somebody's time,
and it is carried as such in
raid-debt-ten-checks-wait-on-a-person-or-a-second-machine.
