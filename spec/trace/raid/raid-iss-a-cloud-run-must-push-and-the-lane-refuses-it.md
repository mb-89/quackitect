---
minted_in: i5-engine-hygiene-one-version-source-every-
id: raid-iss-a-cloud-run-must-push-and-the-lane-refuses-it
type: "[[raid]]"
kind: issue
statement: The guidance now requires a cloud run to push before it finishes, and SE-C-003 refuses every push without exception. The one act that decides whether the work survives is the one act outside the lane.
owner: the owner
trigger: every cloud run, from the next one on
status: open
impact: A cloud run's push is unlogged, unrefusable and unguarded. Nothing checks the branch and nothing stops a force. The call log is what the method calls the only witness on an unattended box, and it holds no record of the act that delivered the work.
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - raid-debt-the-merge-is-committed-and-cannot-be-pushed
  - raid-iss-an-ephemeral-box-loses-the-whole-record-of-a-session
  - req-no-agent-act-destroys-work
  - if-account-to-git
  - uc-land-work-on-trunk
  - i5-engine-hygiene-one-version-source-every-
weighs_with: none
weighs_against: none
place: i42-the-served-word-matches-the-machine-guid
---

## What was observed

THE OWNER STRUCK THE RULE, 2026-08-19, in the field-feedback step of i5's
retro: "This CloudRunner thing, this is obviously wrong. A cloud iteration
needs to push back. This is part of it."

`cloud-runner.md` WAS CHANGED IN THAT RETRO. It now says a cloud run pushes
what it committed before it reports, and that the lane still refuses.

`refusals.md` SE-C-003 WAS NOT CHANGED, and says: "Every push refuses here,
without exception."

SO THE TWO HALVES OF THE STANDARD DISAGREE ON PURPOSE. The guidance is right
and the engine is wrong, and this entry exists so the gap is scheduled rather
than tolerated.

## Why the old rule was right everywhere else

ON A MACHINE SOMEBODY OWNS, an unpushed commit waits on their disk until they
are ready. Reserving the push for the person costs nothing and buys a review.

ON A BOX THAT IS RECLAIMED there is no disk to wait on. A commit that was never
pushed did not happen, so a rule that defers the push to a person who is not
present destroys the work it was written to protect.

MEASURED: this is the fourth record to hit it.
`raid-debt-the-merge-is-committed-and-cannot-be-pushed` stood open from i16
until this retro, and it closed only because the owner said the sentence out
loud a second time.

## What repair consists of

- SE-C-003 grows a condition rather than an exception in prose: a run that
  knows it is on an ephemeral host may push, to the branch it was given, and
  nothing else changes.
- The push then goes through `se_git`, so it is logged like every other act
  and the branch can be checked before it runs.
- SE-C-002 is untouched. No force and no history rewrite, on any host.
- WHAT MUST NOT BE BUILT is a general push. The reason this one is safe is that
  the alternative is losing the work, and that reason does not travel to a
  laptop.

UNTIL IT IS BUILT the push runs through the host's own git, and a run that does
it says so when it reports.
