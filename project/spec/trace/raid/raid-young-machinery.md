---
id: raid-young-machinery
type: "[[raid]]"
kind: risk
statement: The engine is corrected while it runs, so its defects are found on the day they matter rather than before.
owner: the driving agent
trigger: when the defect-per-session rate stops falling
status: open
breaks_how_badly: crippling
how_likely: expected
impact: A defect found mid-walk costs the walk. Two were found this week that destroyed recorded evidence, and both were repaired only because somebody happened to look.
source_refs:
  - the suspect cascade that stripped nine signatures
  - the half-synced worktree that could not compile
---

Everything here is new and most of it has been walked once. The engine is
its own first user, which finds defects fast and finds them late.

THE EVIDENCE IS RECENT AND CONCRETE. A stored suspect mark destroyed nine
signatures across one iteration before anyone noticed the colour was wrong.
A partial method sync left a worktree that could not typecheck. Neither was
caught by a test; both were caught by a person looking at a screen.

The trigger is a RATE rather than a count, because a young system finds many
defects and that is healthy. What is not healthy is the rate flattening while
the walking continues.
