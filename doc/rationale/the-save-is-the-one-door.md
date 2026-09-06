---
kind: [[rationale]]
title: the save is the one door
explains:
  - src/engine/store.go
---

## decided

Every change to a token goes through SaveToken, and everything a change entails happens there.
The status is settled, the record line is written, the hold is recorded, the index is told, and the close archives.
No caller remembers any of it.

## why

Each of those was once a thing a door did beside its save.
The agent did not remember to write the record line and could not be made to, and a door that ended a token forgot to archive it.
Whoever moves a token moves it through the save, so the save was the one place that saw them all.
A rule that lives there is a rule every caller has, and a rule in a caller is one the next caller does not have.

The same held for what the save reads.
It loads the token as it was, so it can say which move it is making, minted or from one state to another.
So the record line, the settled status, the hold, the index and the archive became five things the save does and no caller thinks about.

## costs

The save is long, and everything it does is paid on every write, including a repair that changes one word.
A failure after the file is written is a consequence left over, not a save that went wrong, and NotArchived says so.

## revisit when

- a change can be observed after the fact, so the save need not be the one place that acts on it
- a door needs a save with none of the consequences, and the exception is written down
