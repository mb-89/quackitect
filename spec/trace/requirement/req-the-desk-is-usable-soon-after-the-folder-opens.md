---
minted_in: i9
id: req-the-desk-is-usable-soon-after-the-folder-opens
type: "[[requirement]]"
statement: When a person opens the editor on a project, the desk shall be ready to take a sentence within 5 seconds, and anything not ready by then shall say so rather than appear absent.
kind: quality
characteristic: performance-efficiency
verify_method: test
breaks_if_removed: The entry-point goal is satisfiable by a product that comes up eventually. A person who opens a folder and sees nothing has no way to tell starting from broken, and the honest response to that is to run the launcher again.
breaks_how_badly: abrasive
refines:
  - uc-install-quackitect
source_refs:
  - req-the-editor-is-the-only-entry-point
  - raid-asm-the-editor-fires-something-when-a-folder-is-opened
  - "the probe of 2026-08-19: the extension declares onStartupFinished, which is the activation event defined as running after everything else"
  - the owner's report of 2026-08-19, that a control taking over a second is unusable and produces a second press
priority: should
weighs_against:
  - req-surface-answers-in-one-second >
  - req-only-a-file-with-its-own-door-is-withheld >
weighs_with: req-boot-ends-at-front-desk — both measure how long a person waits before they can type a sentence, from two ends of the same wait
---

## Scenario

- Source: a person opening the editor on a folder that is a project.
- Stimulus: the window opens.
- Artifact: the path from the window appearing to the desk taking a sentence.
- Environment: an ordinary working machine, with the product already installed
  and the folder already consented to. Not a cold install, and not a machine
  under load from something else.
- Response: the desk is ready to take a sentence.
- Response measure: within 5 seconds. Anything still starting at that point
  says it is starting, so the person is never looking at an empty surface with
  no explanation.

## Why this row exists, and why it is not the button row

THE ENTRY-POINT GOAL HAD NO CLOCK. [[req-the-editor-is-the-only-entry-point]]
says everything comes up with no command from the person. A product that came
up in four minutes would satisfy it exactly.

THAT GAP WAS FOUND AT THE M3 GATE, adjudicating the quality sweep. Performance
efficiency had been answered as untouched by this delta, and that answer was
wrong once opening the folder became the only way in.

THE PROBE MADE IT CONCRETE RATHER THAN THEORETICAL. The extension activates on
the editor's own after-everything-else event, which is the latest of the
mechanisms available. Nobody chose it against a bound, because no bound
existed.

## Five seconds, and why not a quarter of one

THE OWNER'S QUARTER-SECOND RULE IS ABOUT A CONTROL ANSWERING A PRESS, and it
is a different demand with a different reason. A press with no reaction gets
pressed again, so the reaction is bounded and the work behind it is not.

STARTING A PRODUCT IS NOT A PRESS. The person has just opened a window and
expects it to fill in. Five seconds is chosen as the point past which somebody
concludes nothing is happening, and it is a chosen bar rather than a measured
one.

THE SECOND HALF IS THE HALF THAT MATTERS MOST, and it costs almost nothing. A
surface that says it is starting cannot be mistaken for one that is broken. It
is the same honesty rule the agent-facing boundary already carries: whatever
this edge does when it cannot be fast has to be a fact in the answer rather
than a rendering.

## What this row does NOT say

IT NAMES NO ACTIVATION MECHANISM. Which event brings the extension up is the
design milestone's call, and the probe has already narrowed the field.

IT DOES NOT BOUND THE WHOLE BOOT. The agent reading what it owes may take
longer, and that is fine, because the desk taking a sentence is the thing the
person is waiting for.

## Behaviour

No model wanted. One condition and one response, with a measure on each half.
