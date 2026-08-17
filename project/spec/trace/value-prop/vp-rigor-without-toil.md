---
minted_in: i1
id: vp-rigor-without-toil
type: "[[value-prop]]"
statement: As an engineer, I need the rigor without the paperwork.
audience: stk-engineer-driving-agents
outcome: the agent carries the method, and my time goes to redlines and thumbs
priority: must
---

## Success criteria

- The person's time goes to judging rather than to producing process artifacts.
  Metric: the share of a session's person-minutes spent on redlines and adjudications rather than on writing artifacts. Target: the majority.
- An idea becomes a durable note without leaving the step in hand.
  Metric: acts from idea to durable note. Target: one.
- An agent finds the lane tool or guidance page it needs without already knowing its name, and a capability gap it hits leaves a trace instead of vanishing.
  Metric: se_run calls as a share of all lane calls (guidance/method/retro.md step 8 counted 3249/28612 on 2026-08-07). Target: falling, retro over retro.
- WAITING IS TOIL TOO. The machine answers fast enough that the person is judging rather than watching it think.
  Metric: the share of surface requests answered inside a second. Target: all of them.
  Metric: an answer a host has to move to disk before the agent can read it. Target: none.
  Added by i12. The existing one-second guard covers lane CALLS only, so a render could pass a second with nothing failing.
- A BROKEN RULE COSTS ONE REFUSAL, NOT A HUNT. The break is named where it is made, while the author is still there and the fix is one move.
  Metric: lane calls spent recovering from a break a write-time check could have refused. Target: zero.
  Metric: corpus-shape rules enforced by a check rather than by prose, as a share of all of them. Target: rising, retro over retro.
  Added by i6. MEASURED LIVE 2026-08-16, at this iteration's own log-risks: one unquoted colon in a frontmatter value was accepted at the write, threw the next pull, and cost four calls to find and fix. The same corpus's submit-time check refused five failures at once, named every field, and cost one call to satisfy.
- A SLOW INTERFACE SAYS SO, and a person is never left guessing whether it is working. Silence is not an acceptable answer from anything a person or an agent touches.
  Metric: modelled interfaces that breach the one-second rule without telling the person they are working. Target: zero.
  Metric: a control that declines a person's input and reports nothing about why. Target: zero.
  Added by i33. THE OWNER'S FRAMING, 2026-08-15: "everything that is over one second needs to be non-intrusive... Either that fast, or very transparent about how slow it is." i12 added the speed half and not this one, so an interface could miss the rule silently and fail nothing.
  MEASURED LIVE 2026-08-17: the stop-at control declined a press and said nothing, and the owner reported it as a broken button. engine/mirror.ts lines 756 to 762 record two earlier victims of the identical silence, the emergency rung and the shutdown row, which is the third sighting of one failure shape.
  AND THE DENOMINATOR ARRIVES WITH IT. i12's criterion above asks for a SHARE of surface requests, and until interfaces are modelled as nodes there is no list to take that share over. Milestone one of i33 supplies it, so both criteria become checkable rather than only this one being new.

## Unlike

Requirements-management suites, which hold the input-quality corner for human authors and expect the human to do the writing. The difference is that the method is carried by the agent, and the person is left the one job a person is better at.

## Notes (not load-bearing)

This is the proposition most at risk of sounding like a convenience. It is not: the reason rigor gets abandoned in practice is the toil, so removing the toil is what makes the rigor survivable at all.
