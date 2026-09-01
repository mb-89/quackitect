---
id: wk-bcc17c6ba8
seq: 1000037
type: work
title: the light goes red
status: spec_open
assignee: human
scope: single-step
traced: true
minted_by: cowork
---

## detail

YOURS, because it needs the editor open and a person looking at it.

WHAT TO DO. Open the folder in the editor and let the engine start. The button goes green. Then kill the engine from a terminal, leave the editor alone, and watch the button. It should go red within a few beats, on its own, with nothing pressed. Then start the engine again from the terminal and watch the button go back to green, again with nothing pressed.

That is the whole test. It takes a minute.

WHY IT IS WORTH THE MINUTE. The decision behind the light is already proved. src/extension/liveness.ts holds it as a function, and util/checks/liveness.mjs asserts the cases that matter: an engine that stopped answering is bad, nothing running is bad rather than idle, and an engine that came back turns the light good again. That last one was a real defect once, where the light could go red and never come back.

What no check can reach is whether the timer calls that function and whether the button repaints. Everything between a correct decision and a person seeing it is the editor shell, and there is no test host for it. So a person looks.

IF IT FAILS, say which half: the light never went red, or it went red and never came back. They are different faults, and the second one is the one that was fixed before.

This was UC-6, from the open list that has been removed.

