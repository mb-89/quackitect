---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: raid-dec-the-door-rule-governs-who-may-reach-and-never-what-the-reach-does
type: "[[raid]]"
kind: decision
statement: The door rule says which modules may reach a capability and nothing about how a reach is performed, so it never grows into mediating every call - a shape the owner already rejected with the total door on the table.
owner: the maintainer
trigger: the reversal trigger in the predecessor decision fires, or a proposal arrives to route calls through the door rather than to name who may make them
status: decided
impact: If this proves wrong, the rule grows a second job it was never scoped for, and it re-opens a decision the owner already took against a total door on stated grounds.
breaks_how_badly: crippling
how_likely: conceivable
source_refs:
  - "[[cand-the-narrow-guard]]"
  - "[[opt-one-rule-per-conversation-rather-than-one-rule-for-every-reach]]"
  - ref v2, product/spec/ledger/se/adr-io-lane-default.md — engine-mediated access is the default and not the only route, and universal mediation is the recorded rejected option
  - evidence/declare-winner.md — the neighbours walk found four conversations, not seven
  - evidence/draw-context.md — what a door DOES once it holds the call is a named non-goal
---

## What was decided

THE RULE HAS ONE SUBJECT: which modules may reach a capability.

IT HAS NO OPINION on how the reach is performed, what it returns, whether it is
cached, batched, retried or logged. Those are a second capability and this
record names them a non-goal.

## Why this needs saying out loud

A RULE ABOUT WHO MAY REACH LOOKS ONE STEP AWAY from a rule that every reach goes
through one function. The step is small and it is the wrong step.

THE OWNER ALREADY TOOK IT AND RULED AGAINST IT.
`adr-io-lane-default`, readable at ref `v2`, rules that engine-mediated access
is the DEFAULT and not the only route, in three tiers. Its recorded rejected
option is universal mediation with the alternative retired, and the recorded
reason is edit latency and harness ergonomics: a manifest per edit taxes every
step for a failure class the single-edit route never caused.

SO A TOTAL DOOR IS NOT AN UNEXPLORED IDEA. It was on the table, it was
adjudicated, and it lost on stated grounds.

## The four conversations this rule covers

The neighbours walk found four, not the seven neighbours the context drawing
names.

| conversation | side |
| --- | --- |
| store and retrieve bytes at an address | secondary |
| record and retrieve versions of the tree | secondary |
| ask the outside world a question | secondary |
| serve one lane call | primary |

THE VERSION CONVERSATION WAS NOT NAMED BY ANYBODY before the walk, and the
subprocess door that was suggested does not appear as a conversation of its own.

## Rejected options

### Universal mediation — every reach goes through the door

WHY IT LOST HERE. It is already the recorded rejected option of a predecessor
decision adjudicated by the owner, and nothing this record measured contradicts
that reasoning.

RE-DECIDING IT WOULD NEED NEW EVIDENCE, and the predecessor names exactly what
that evidence looks like: a single-edit corruption incident, with the corrupting
class spreading beyond shell round-trips.

### One rule per door, with different shapes per conversation

Four conversations could each get a rule fitted to it — a strict one for
versions, a loose one for the web.

WHY IT LOST. It was drawn as
[[opt-one-rule-per-conversation-rather-than-one-rule-for-every-reach]] and it
buys four mechanisms where one predicate and two lists would do. The per-door
caller counts differ by more than an order of magnitude, which is an argument
about the day-one departure list rather than about the rule's shape.

### Let the door improve the reach — caching, batching, a warm model

Suggested at the record's opening.

WHY IT LOST. It is a second capability with its own demands and its own
failure modes, and folding it in would mean this record's rule cannot be judged
on its own terms.

## Consequences

- THE REVERSAL TRIGGER IS INHERITED, NOT INVENTED. The predecessor names the
  condition under which the total door returns, and this decision adopts it
  rather than writing a new one.
- NO CANDIDATE ON THIS CHART IS THE TOTAL DOOR, so nothing built from this
  record breaches the predecessor.
- A LATER RECORD MAY STILL BUILD THE SECOND CAPABILITY. It would be a different
  record with its own demands, and it must not arrive as a widening of this
  rule.
- THE PER-DOOR COUNTS ARE ON RECORD for whoever sets the day-one departure
  lists: 81 modules reach the disk, 29 a subprocess, 17 the web, 6 the network,
  measured 2026-08-26 across 178 engine files.
