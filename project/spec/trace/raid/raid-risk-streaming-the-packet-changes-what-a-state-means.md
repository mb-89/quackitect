---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: raid-risk-streaming-the-packet-changes-what-a-state-means
type: "[[raid]]"
kind: risk
statement: Delivering the pull's packet in parts could let an agent act on an incomplete one, which would change what entering a state means rather than only how fast it answers.
owner: the driving agent
trigger: the first design of a streamed or paged pull answer, and any change to what the pull ships on arrival
status: open
impact: "The pull's one-call completeness is why an agent can walk without asking questions. If a streamed packet lets the agent begin before the guidance, the form or the legal tools have arrived, the walk starts acting on a partial world. That is not a slow interface, it is a different machine, and the failure would look like an agent making poor choices rather than like a delivery bug."
breaks_how_badly: crippling
how_likely: conceivable
source_refs:
  - note-c8e5a398b943
  - note-7941a76b7f0f
  - req-call-answers-in-one-second
---

## Where it comes from

THE FIRST GOAL CONFLICT RULED AT THIS ITERATION'S draft-vision. The one-second
rule pulls against the rich packet, and the ruling was that completeness wins
on CONTENT while speed wins on DELIVERY.

STREAMING IS THE RESOLUTION THAT KEEPS BOTH HALVES TRUE. This entry is the
price of that resolution, recorded at the moment it was chosen rather than
after it bites.

## Why it is a real risk and not a formality

THE PULL IS THE ONLY VERB THE WALK HAS. Everything an agent knows about where
it stands arrives in one answer: the guidance, the form, the options, the legal
tool list.

AN AGENT THAT RECEIVES THE OPTIONS BEFORE THE GUIDANCE could choose a door
without having read what the state asks. An agent that receives the form before
the legal tools could plan work the state cannot do. Neither is a latency
failure and neither would be reported as one.

## What would make it fire

- A streamed packet where the agent is free to act on the first chunk.
- A paged packet with no marker saying the last page has arrived.
- Any design where "arrived" becomes a judgment the agent makes rather than a
  fact the machine states.

## What holds it off

THE PACKET STAYS ATOMIC AS A UNIT OF MEANING even when it is not atomic as a
unit of transport. Whatever the delivery, the agent acts once, on a complete
world, and the machine says when that world is complete.

A PROGRESS SIGNAL IS NOT A PARTIAL PACKET. Telling the person or the agent that
more is coming is the honesty half of this iteration's goal and does not fire
this risk.
