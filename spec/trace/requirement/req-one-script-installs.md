---
minted_in: i1
id: req-one-script-installs
type: "[[requirement]]"
statement: When the one setup script at the product root runs, the script shall perform the whole install per the Detail table with zero further commands from the person, and shall not be needed again on that machine.
kind: functional
verify_method: demonstration
breaks_if_removed: Install becomes a manual multi-step ritual and the newcomer never reaches the desk.
breaks_how_badly: crippling
refines:
  - uc-install-quackitect
source_refs:
  - uc-install-quackitect step 3
  - uc-install-quackitect extension 1a
  - uc-install-quackitect extension 3c
  - "sty-ramp-up slide 3: the script's job shrinks to what only a script can do"
  - ".se/req-mine-v1.md: lifecycle and distribution (one-click install-and-demo)"
  - ".se/req-mine-v2.md: distribution (v2-098)"
priority: must
---

## Detail

The whole install is these three acts, in order:

| act | done when |
| --- | --- |
| install the runtime | the pinned runtime answers, at or above the version the project declares |
| install the editor extension | the extension stands at the version the launcher shipped |
| open the editor on this folder | the editor holds this folder, and nothing asked the person which folder to hold |

ONCE COUNTS MACHINES, NOT PROJECTS. Both installed things belong to the
computer rather than to any one folder. A person who already runs one project
here obtains a second folder and simply opens it, and this row is satisfied
without the script running at all.

RUNNING IT A SECOND TIME IS SAFE AND CHANGES NOTHING that already stands. It
reports what it found rather than reinstalling, so the person who is unsure
whether they ran it can just run it.

## What this row stopped demanding at i9

STARTING THE ENGINE WAS THE THIRD ACT AND IS NOT ANY MORE. It moved to the act
of opening the folder, where the extension brings it up. The demand did not
weaken — [[req-the-editor-is-the-only-entry-point]] carries it, and carries it
for EVERY start rather than only the first.

WHY THE SPLIT IS THE POINT. A script that starts the engine makes the person
run a script whenever they want the engine. Leaving the launcher only what a
script alone can do is what makes "run it once" a true sentence rather than an
aspiration, and it had been an untrue sentence in the entry document since i1.

THE OPEN-THE-WORKSPACE ACT WAS REWORDED FOR THE SAME REASON. It used to say
the editor holds the product folder, which was written when the product folder
and the folder the editor opened were two different places.

## Behaviour

No model wanted. Three acts in a fixed order, each with its own done-when, and
nothing exists before the first act that the table does not name.
