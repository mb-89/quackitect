---
form: declare-winner
by: agent
signed_off: 2026-08-26T12:50:35.836Z
authors: agent
files: null
---

# Evidence form / declare-winner

## current_situation

The winner is computed and stable across both Pugh runs. No rival overtakes on any graft.

Two predecessor decisions were read at ref v2 during this milestone, and both change what the declaration should say.

One of them corrects a claim the M4 gate made.

## winner


## comments

### The winner

cand-the-narrow-guard. One module holds the rule; a write-time caller and a whole-tree sweep both read it, and neither holds a copy.

It generalises the shape standing at deliverable/engine/widgets.ts, which is 186 lines with six exports and three callers.

### The declaration carries one graft

A DEPARTURE CITES A DECISION NODE rather than carrying a sentence. That is opt-a-departure-cites-a-decision-node-rather-than-carrying-prose, which was minted at M4 and never composed as a candidate.

WHY IT IS GRAFTED RATHER THAN RACED. A sentence can be copied down a column and nothing notices. A citation either resolves or it does not.

WHERE IT COMES FROM. adr-grandfathers-historical at ref v2, whose rationale line is load-bearing: an exemption without a citation fails test-grandfathers-decided.

### The correction the M4 gate needs

THE M4 GATE CALLED THAT MECHANISM ALREADY BUILT. It is not, in this tree.

Measured: a search for its four names returns 13 hits. All 13 are inside this record's own spec folder. None is in engine code and none is in a test.

SO IT IS PRIOR ART, NOT AN INCUMBENT. It shipped once at v2 and did not survive into the working tree. Choosing it is reviving something, never choosing against working code.

THAT MAKES THE DECISION EASIER, not harder. The gate's worry was that M5 might choose against work already built. There is no such work.

### The other predecessor bounds the scope

adr-io-lane-default rules that engine-mediated file access is the DEFAULT and not the only route, in three tiers.

IT REJECTED UNIVERSAL MEDIATION EXPLICITLY, with the total door on the table, adjudicated by the owner. The recorded reason is edit latency and harness ergonomics: a manifest per edit taxes every step for a corruption class the single-edit route never caused.

IT CARRIES A REVERSAL TRIGGER. If a single-edit corruption incident lands and the corrupting class spreads beyond shell round-trips, universal mediation returns as the recorded fallback.

WHAT THAT MEANS FOR THIS DECLARATION. The winner is a rule about who may REACH a capability. It is not universal mediation and it must not grow into it, because that was already decided against by the owner.

### The kill criterion has evidence against it now

raid-asm-an-author-refused-at-write-time-states-a-usable-reason is the named kill criterion, and its sample was one.

MEASURED IN THE ONE MECHANISM THAT WOULD PRODUCE THE EVIDENCE. deliverable/engine/widgets.ts lines 159 to 171 hand a refused author a ready-made patch whose reason slot is the literal placeholder text. Nothing checks that the placeholder was replaced.

SO THE EXISTING MECHANISM INVITES A NON-ANSWER. That is direct evidence against the assumption the winner leans on, and it is an argument FOR the graft rather than against the winner: a citation cannot be a placeholder, because a placeholder does not resolve.

## follow_up

- The M4 gate's round_2_red_team says adr-grandfathers-historical is already built. That sentence is wrong for the working tree and the gate is signed. It wants an amend at the gate, not a reopen, because the correction strengthens the conclusion rather than moving it.

- The widget remedy's pre-filled placeholder is an issue nothing carries yet. deliverable/engine/widgets.ts line 166 writes the reason slot as literal placeholder text and nothing checks it was replaced. It belongs in the register, and the design milestone should treat it as a defect in the shape being generalised.

- opt-freeze-the-standing-violations-and-let-the-count-only-fall should be struck. adr-grandfathers-historical retires a forward-only-baseline file by name, so drawing it again re-proposes something already decided against.

- The reversal trigger in adr-io-lane-default is the tripwire this record should inherit rather than invent. It names the condition under which the total door comes back, and no candidate on this chart is the total door.

## anything_else

### Why the declaration is weaker than the arithmetic looks

THE FRONT HAD ONE MEMBER AND UTOPIA EQUALLED NADIR. Both Pugh runs were arithmetically bound to agree before they were computed, because a candidate at least equal on every axis cannot be reordered by a datum swap.

THE STABILITY IS REAL AND IT IS NOT INFORMATION. It reports that domination is transitive.

raid-iss-the-candidate-set-produced-a-front-of-one-sitting-at-utopia stands open and is only partly answered. It asked for a fourth candidate. What it got is a graft, which is weaker than a rival and is not nothing.

### What a reader should take from this milestone

THE WINNER IS A CHECK, NOT A GUARANTEE. It sits at rank 3 of the four ranked failure modes: refused with a remedy. Nothing on this chart reached rank 1 with anything enforcing it.

THE HONEST COMPARISON, other side first. Go's internal package convention beats every candidate here at rank 1, because the compiler refuses and no configuration can be forgotten. What it sheds is the departure: there is no way to say this one is allowed and here is why. This record buys the departure and pays for it with a rank.

### Two hands walked this milestone

A fresh walker was spawned at spawn-for-architecture so the decision would not be made by the hand that composed the candidates. The guide then kept walking, and the two collided: converge-pugh was signed by the guide while the walker held it as an open item, and the walker's composed fill landed one state downstream.

THE COLLISION IS THE GUIDE'S FAULT and it is recorded rather than tidied away. What the walker contributed and the guide did not have: the ref-v2 reading of both predecessor decisions, the measurement that the grandfathers mechanism is absent from the tree, and the placeholder finding in the widget remedy.

EVERY CORRECTION IN THIS DECLARATION CAME FROM THAT HAND. The separation paid for itself even though the coordination did not.
