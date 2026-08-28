---
minted_in: i9
id: raid-risk-the-entry-point-goal-is-a-silent-bootstrap-by-another-name
type: "[[raid]]"
kind: risk
statement: Opening a folder and having it silently set itself up is the same shape as a known abuse pattern, and nothing in the goal says where the line between convenience and surprise sits.
owner: the driving agent
trigger: the design milestone, when the launcher's steps are split into one-time and every-time
status: open
impact: A person opens a folder expecting to read it and something installs, starts a server, or writes into their tree. The act carries no intent to set anything up, so whatever happens is a surprise rather than a choice.
breaks_how_badly: abrasive
how_likely: plausible
source_refs:
  - a published security writeup demonstrating the editor's own silent extension bootstrap being used to load extensions without prompting
  - the owner's own retraction of auto-seeding on 2026-08-19, which is this instinct arriving by a different route
---

## What the risk is

THE GOAL SAYS OPENING A PROJECT GETS IT EVERYTHING IT NEEDS. That sentence has
no upper bound written into it.

WHAT COULD SIT UNDER IT: refreshing dependencies, starting a server, placing
configuration into the folder, re-projecting generated files. Each is
defensible on its own and none was asked for by the act of opening a folder.

## Why the scan raised it rather than a review

THE PRIOR-ART SCAN AT M1 FOUND THE EDITOR'S OWN SILENT BOOTSTRAP, which
installs extensions on first launch without prompting. It also found a
published account of that mechanism being used to load extensions quietly.

SO THE SHAPE IS KNOWN TO BE ABUSABLE, and our goal describes the same shape
aimed at ourselves. That is not an accusation. It is the reason the boundary
has to be stated rather than assumed.

## The owner already drew this line once, from the other side

THEY RAISED AUTO-SEEDING AND STRUCK IT MINUTES LATER, ruling that a folder
without the machine-state folder is simply not a project. Their reasoning was
that the person has to seed it deliberately.

THAT IS THIS RISK'S ANSWER APPLIED TO ONE CASE. What is missing is the general
rule the same instinct implies.

## Probe

THE INVENTORY THAT IS ALREADY IN SCOPE IS THE PROBE. Splitting the launcher's
steps into one-time and every-time produces a list, and every every-time step
gets read against one question: would a person opening a folder be surprised
that this happened?

A STEP THAT WOULD SURPRISE THEM either moves behind an explicit act, or it
announces itself. The toast the owner already accepted is the announcing
mechanism, and it exists for the case where something cannot apply live.

## What bounds it already

THE SYSTEM DOES NOTHING IN A FOLDER THAT IS NOT A PROJECT. That is the owner's
ruling and it is the strongest bound available: a folder somebody has never
seeded is untouched, whatever the entry-point goal grows into.
