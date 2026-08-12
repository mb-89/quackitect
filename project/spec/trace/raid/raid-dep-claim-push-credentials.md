---
minted_in: i2-parallel-iterations-across-machines-seed
id: raid-dep-claim-push-credentials
type: "[[raid]]"
kind: dependency
statement: The engine's claim push needs git credentials for origin on every participating machine - credentials the engine does not manage.
owner: the owner
trigger: the first claim push from a machine whose git has no credential helper configured for origin
status: open
impact: A machine without push credentials can see seeds but never claim - it reads as a broken lock when it is a missing login.
breaks_how_badly: abrasive
how_likely: likely
---

Pushing to github.com/mb-89/quackitect needs an authenticated git on
each machine. That setup is the owner's, outside the engine - the
engine's job is to REFUSE with a plain remedy naming the missing
credential rather than reporting a failed claim.
