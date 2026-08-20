---
minted_in: i9
id: req-the-editor-is-the-only-entry-point
type: "[[requirement]]"
statement: When a person opens the editor on a folder that is a project of this system, the system shall bring up the lane, the panel and the desk with no command from the person.
kind: functional
verify_method: demonstration
breaks_if_removed: The person runs a script every time they want to work, and the entry document's promise that the launcher runs once stays the untrue sentence it has been since i1.
breaks_how_badly: abrasive
refines:
  - uc-install-quackitect
source_refs:
  - uc-install-quackitect steps 8 and 9
  - uc-install-quackitect extension 9a
  - "sty-ramp-up slide 8: one script, one time, one folder, no configuration"
  - "i9 draft-vision: opening a project gets it everything it needs"
priority: must
---

## Detail

Every start after the first is these acts, and the person performs none of
them:

| act | done when |
| --- | --- |
| the extension activates on the folder | the folder is recognised as a project without the person naming it |
| the engine starts | the lane answers |
| the panel draws | the machine stands on it, with the dials above the drawing |
| the agent boots | it holds what it owes and waits at the desk |

WHAT THE PERSON DID WAS OPEN A FOLDER. That is the whole interaction, and no
step above is offered to them as a choice.

## The one thing that may interrupt

AN UPDATE THAT CANNOT REACH A RUNNING WINDOW SAYS SO. It asks for a restart
rather than going quiet or forcing a reload, which is the owner's accepted
answer of 2026-08-19 and the reason live reload is a non-goal of this
iteration.

A MESSAGE IS NOT A FAILURE OF THIS ROW. This row demands that nothing be
REQUIRED of the person to get working. A restart offered, with the reason
named, leaves that intact.

## Why this is separate from the launcher row

DIFFERENT TRIGGER, DIFFERENT FREQUENCY, DIFFERENT ARTIFACT.
[[req-one-script-installs]] fires once on a machine and installs things that
belong to the computer. This row fires on every start and installs nothing.

THEY ALSO FAIL DIFFERENTLY. The launcher failing leaves a person with no
product at all. This row failing leaves a person with a product they must
start by hand, which is exactly the state the entry document has been
describing incorrectly for eight iterations.

## Behaviour

    (nothing)      -> installed:  the launcher runs, once on this machine
    installed      -> open:       the person opens the editor on the folder
    open           -> answering:  the extension starts the engine
    answering      -> waiting:    the agent boots and stops at the desk
    waiting        -> open:       the window closes and is opened again

THE LAST TRANSITION IS THE ONE THAT PAYS. Closing and reopening returns to
`open` and never to `installed`, which is what makes the launcher a one-time
act rather than a recurring one.

THE PARTICIPANT TEST PASSES. The extension and the runtime are created by
[[req-one-script-installs]]. The engine is created by the extension. Nothing
in the model appears from nowhere.
