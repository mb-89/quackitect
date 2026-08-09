---
kind: method
statement: "Probing an assumption: check the real channel, record what came back, and change the entry's kind when it turns out false."
---

## Situation

Guidance for M3 probe-assumptions. This is the one card the step draws from.
Finding them is [[meth-assumption-hunting]]; the node is [[raid]].

## PROBE ALL OF THEM, NOT THE ONES YOU JUST WROTE

This state's input is the RAID FOLDER, not the form above it. Every standing
assumption is probed, whenever it was recorded.

That split is the whole reason this is its own state. With one state doing
both jobs, the natural reading of "probe assumptions" is "probe the ones I
just identified", and an assumption written in i1 is never looked at again —
which is exactly when it is most likely to have gone stale, because the world
moved and nobody checked.

## WHAT A PROBE IS

ONE PROBE SETTLES WHAT A DATASHEET CLAIMS. Check the real channel: what the
harness actually loads, what the API actually returns, what the command
actually exits with, what the platform actually does.

- A DOCUMENT IS NOT A PROBE. A README saying a thing works is the claim, not
  the check.
- AN ARGUMENT IS NOT A PROBE. Reasoning that it must hold is how the
  assumption got made.
- THE CHEAPEST REAL CHECK WINS. A probe is minutes, not a spike.
  - If it needs a spike, that is M6's work and the entry says so.

## THE FOUR OUTCOMES

| outcome | what it means | what happens to the entry |
| --- | --- | --- |
| holds | the check ran and the assumption survived | status probed, `probed` date stamped |
| false | the check ran and the assumption did not survive | kind becomes ISSUE — it has already happened |
| unprobed | no cheap check exists yet | status stays open, and the reason is recorded |
| scheduled | the check needs a spike | status stays open, and M6 carries it |

NAMING A GAP DOES NOT CLOSE IT. "Unprobed" is a legal outcome and it needs its
reason. What is not legal is listing an unprobed assumption and calling the
state done without saying why no check exists.

## WHEN ONE TURNS OUT FALSE

It becomes an ISSUE, not a risk. It has already happened. Keep the id, change
the kind, and say in the body what broke and what now rests on nothing.

THEN FOLLOW IT UPWARD. Everything whose `source_refs` named that entry is now
resting on something known false. Name those items in the state's follow-up.
That is the whole payoff of the register being addressable — a table row could
not be pointed at, so nothing could be traced back from it.

## A PROBE RESULT DECAYS

An assumption probed green in i1 is not thereby green in i7. Stamp the
`probed` date on every probe. Nothing enforces a re-probe interval today; the
date is recorded from the first probe so that rule can land later without a
migration.

## Sources

- Assumption-based planning (RAND, Dewar): signposts, and shaping actions when
  a load-bearing assumption fails.
