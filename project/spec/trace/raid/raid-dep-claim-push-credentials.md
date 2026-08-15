---
minted_in: i2
id: raid-dep-claim-push-credentials
type: "[[raid]]"
kind: dependency
statement: The engine's claim push needs git credentials for origin on every participating machine - credentials the engine does not manage.
owner: the owner
trigger: the first claim push from a machine whose git has no credential helper configured for origin
status: open
impact: A machine without push credentials can see seeds but never claim - it reads as a broken lock when it is a missing login.
breaks_how_badly: abrasive
how_likely: plausible
---

Pushing to github.com/mb-89/quackitect needs an authenticated git on
each machine. That setup is the owner's, outside the engine - the
engine's job is to REFUSE with a plain remedy naming the missing
credential rather than reporting a failed claim.

## Retro sweep 2026-08-13

Partially probed by the second-machine run, on the wrong side of the
trigger. This peer's git already had working push credentials —
`git ls-remote origin`, a fetch of all 19 `it/*` branches, and a push
all succeeded with nothing configured. That confirms the credentialed
path, which was never in doubt. The trigger ("a machine whose git has NO
credential helper") did not fire, so the thing this entry actually
watches — whether the engine refuses with a plain remedy instead of a
bare failed-claim error — is still unprobed. One more qualification: the
push that succeeded was made by the uncaged bootstrap role via raw git,
not through se_git or a claim push, so even the credentialed path was not
exercised through the engine's own claim mechanism. Status stays open.
See the i8 field-report §3.
