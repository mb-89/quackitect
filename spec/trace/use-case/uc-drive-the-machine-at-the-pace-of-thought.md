---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: uc-drive-the-machine-at-the-pace-of-thought
type: "[[use-case]]"
statement: Drive the machine through a sequence of acts without any single act breaking the rhythm.
actor: stk-engineer-driving-agents
trigger: the person or the agent asks the product to do something it does many times an hour
precondition: the product is running and the work is of ordinary size
guarantee: the common act comes back inside a second, and an act that cannot returns a signal within that second instead
refines:
  - sty-the-call-that-comes-back-inside-a-second
priority: must
---

## Why this is its own use case

THE NEAREST NEIGHBOUR IS ITS SIBLING, AND IT IS THE OPPOSITE HALF.

uc-act-on-a-control-and-know-what-it-did covers whether an act is LEGIBLE. Its
guarantee is that the person can tell what happened. It is satisfied by a
surface that explains a thirty-second wait perfectly.

THIS ONE COVERS WHETHER THE ACT IS FAST. Its guarantee is that the wait does
not happen. The two are not degrees of the same thing: one is about knowing,
the other about not having to.

SO THE PAIR IS THE OWNER'S FRAMING, whole. Fast, or honest about not being. The
sibling had a use case from the first pass and this one did not, which is how
an iteration named for speed came to build only the honesty half.

## Main scenario

1. The actor asks the product to do something it does many times an hour.
2. The product collects the inputs it needs, once.
3. It does the work over those inputs.
4. It answers inside a second.
5. The actor acts again without having decided whether to wait.

## Extensions

- 2a. The same input is needed by several parts of the answer. It is collected
  once and handed down, never fetched per part. One record entry asked for the
  same 328-node corpus sixty-six times, which is this extension going wrong.
- 3a. The work is genuinely large enough that a second is not achievable. Then
  the guarantee falls to the sibling use case: a signal inside the second,
  saying what is running. The fallback is a different guarantee, never a
  weaker version of this one.
- 3b. The work is large because a bound was never placed on it, rather than
  because the work is large. That is this use case failing, not 3a applying.
  The two are told apart by whether the size follows from what was asked.
- 4a. The actor is an AGENT rather than a person. The bound is the same. An
  agent that waits thirty seconds is not inconvenienced, it is idle, and its
  whole session is the sum of these waits.
- 5a. The act is slow only sometimes, and unpredictably. That is worse than
  uniformly slow, because the actor cannot learn which acts to batch and starts
  batching all of them — the tool shaping the work instead of serving it.
- 3c. The act's cost is dominated by a SEARCH THAT FINDS NOTHING. The work is
  not large; the not-finding is. This is 3b rather than 3a, because the size
  does not follow from what was asked — it follows from what is absent.
  Measured: an act that could not draw a route ran past thirty seconds 36 per
  cent of the time, against 2 per cent for every other act.
- 3d. The act is one HOP of a walk rather than a single call. Then the bound is
  per hop and the walk multiplies it, so an act comfortably inside a second can
  still leave a re-entry costing minutes. The guarantee above is necessary and
  not sufficient at this grain.
- 4b. Several acts of the same kind run at once, and the loop that answers is
  shared with the one that draws the surface. Then a slow act is not slow alone:
  it takes the surface down with it, and the actor sees a frozen screen rather
  than a waiting one.
