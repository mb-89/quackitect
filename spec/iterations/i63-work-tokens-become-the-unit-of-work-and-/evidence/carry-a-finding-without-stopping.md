---
form: carry-a-finding-without-stopping
by: agent
signed_off: 2026-08-27T20:58:29.758Z
authors: agent
files:
---

# Evidence form / carry-a-finding-without-stopping

## current_situation

The demonstration for this story is performed and its report stands.

The story asks that a real defect which breaks nothing gets recorded and the walk keeps going. That is exactly what this iteration's own walk did, three times, tonight.

## built

reports/rpt-carry-a-finding-without-stopping.md, in this record. The demonstration was performed on this iteration's own walk against the shipped engine and the shipped lane, not by a script written to show it working. WHAT WAS OBSERVED: three real defects that broke nothing were recorded and the walk continued past each one. Three doors reach a gate's thumb where there should be one, note-c71d78487f20. The sweep's per-hop cost fills a twenty-second budget and the named fix is already built, note-13326ca46434. A hard wall-clock assertion flakes inside the battery that saturates the box, note-bedbeb45e2e7. THE THIRD IS THE ONE THAT PROVES THE DEMAND rather than the mechanism: a green tree read as red under load, and the story's whole point is that a harmless finding is recorded and does not stop the work. WHAT WAS NOT OBSERVED: the drain. All three are recorded and carried, and none has reached a durable home, because the retro has not run.

## follow_up

- The three findings are recorded and carried, and none is drained yet. The retro drains them.
- note-bedbeb45e2e7 is the one that most wants a decision, because a wall-clock assertion inside a saturating suite will keep turning green trees red.

## anything_else

