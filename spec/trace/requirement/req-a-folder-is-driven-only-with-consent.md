---
minted_in: i9
id: req-a-folder-is-driven-only-with-consent
type: "[[requirement]]"
statement: If the folder that is open carries no machine state, then the system shall say so and do nothing else to it, and if it does carry machine state the system shall come up without asking anybody anything.
kind: quality
characteristic: security
verify_method: test
breaks_if_removed: Opening any folder at all starts a caged agent against it, so a person who opens a directory to look at something finds the system has made it into a project.
breaks_how_badly: corrosive
refines:
  - uc-install-quackitect
source_refs:
  - uc-install-quackitect extension 5b
  - "owner ruling 2026-08-19: if it finds the machine-state folder it can work on it, if it does not it does not work on it, and that is it"
  - "owner ruling 2026-08-19, earlier the same day: seeding is not automatic, and a folder that was never seeded simply does not work"
  - "i9 draft-vision: convenience inside a project, consent at its edge"
priority: must
---

## Scenario

- Source: a person opening a folder in the editor.
- Stimulus: the folder is opened.
- Artifact: the folder, and whether it carries machine state.
- Environment: the folder may have been created here, cloned, copied or
  unpacked. The system does not ask which and does not need to.
- Response: one of exactly two things happens, decided by the folder alone.
- Response measure: a test opens a folder with no machine state and asserts
  that no byte was written into it and that the panel said plainly what it
  found.

## Detail

| what was found | what happens |
| --- | --- |
| machine state | it comes up fully, asking nothing |
| no machine state | it says this folder is not a project of this system, and does nothing else. It never seeds one. |

THE PRESENCE OF THE FOLDER IS THE WHOLE TEST. There is nothing else to look
up, nobody to ask, and no record to keep anywhere.

SEEDING IS THE CONSENT, AND IT IS A DELIBERATE ACT. A person asks for a
project and gets one. Everything afterwards honours that act, and nothing
before it presumes one.

## What this row deliberately does NOT demand

IT DOES NOT ASK THE PERSON ANYTHING. Not on a first open, not on a clone, not
ever. A prompt here would be ceremony charged to somebody who already made the
decision that matters.

IT KEEPS NO RECORD OUTSIDE THE FOLDER. Nothing needs to be remembered about
which folders are permitted, because the folder answers for itself every time.

## An earlier version of this row asked, and it was overruled

THE M2 GATE ADDED A CLONE CASE. Its reasoning was that a cloned folder arrives
carrying the marks of somebody else's seeding, so treating those marks as
consent lets the tree answer a question about itself. Three widely used systems
were cited, each of which keeps a trust decision outside the tree.

THE OWNER STRUCK IT ON 2026-08-19, in their own words: if it finds the
machine-state folder it can work on it, and if it does not it does not work on
it, and that is it.

WHAT THE ARGUMENT MISSED, and it is worth writing down rather than just
deleting. Those three systems guard against a tree that can RUN something —
hooks, tasks, scripts that execute on arrival. The machine-state folder is not
that. It carries a call log, notes and session state, and coming up against it
starts a caged agent that does nothing until a person types a sentence. The
threat model that justifies a trust prompt elsewhere does not transfer here.

SO THE COST OF ASKING WAS REAL AND THE BENEFIT WAS BORROWED. Every person who
clones this project onto a second machine would have paid a prompt, to guard
against something that cannot happen.

## Behaviour

    open -> refused:   the folder carries no machine state, and is told so
    open -> answering: the folder carries machine state

TWO TRANSITIONS AND NO THIRD. That is the model, and its shortness is the
point — an earlier version had five and one of them asked a question.
