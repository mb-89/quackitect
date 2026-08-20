---
id: i52-the-route-can-go-back-a-walk-can-reach-a
status: seeded
opened: 2026-08-20T19:34:58.130Z
goal: "The route can go back: a walk can reach a state behind it, so correcting signed work stops meaning escaping the machine."
vision: "THE PROBLEM. Routing draws forward edges only. Everything already passed is unreachable, whatever the walk now needs from it.\n\nWHAT THAT COSTS TODAY.\n\n- A signed claim sent back for rework cannot be returned to once it sits behind the walk. The driver leaves through the escape hatch to reach it, which pushes people toward correcting a claim quietly instead of through the machine.\n- \"Keep walking\" is worthless advice when every state permitting the verb you need lies behind you. One session had to remove a single file to undo something it had just created, and no destination ahead allowed it.\n- Route recovery cannot tell a walk that is progressing from one traversing the same signed states again.\n\nWHAT DONE LOOKS LIKE.\n\n- A route can be drawn to a state the walk has already passed, and the machine says plainly what re-entering costs.\n- Recovery detects repeated traversal through unchanged signed states and aims at the first state whose claim is not yet met.\n- The escape hatch stops being the way to reach ordinary work. It goes back to meaning what it says: mechanically stuck.\n\nWHY THESE THREE ARE ONE PIECE. All three are the same missing capability seen from three places. Fixing any one alone leaves the other two, because they share the edge-drawing that only ever points onward."
inputs:
  - "wt-a-signed-claim-sent-back-for-rework-cannot-be-returned-to-on"
  - "wt-being-told-to-keep-walking-is-worthless-advice-when-every-pl"
  - "wt-route-recovery-should-detect-repeated-traversal-through-unch"
depends_on: []
---

# i52-the-route-can-go-back-a-walk-can-reach-a

## Goal

The route can go back: a walk can reach a state behind it, so correcting signed work stops meaning escaping the machine.

## Rough vision

THE PROBLEM. Routing draws forward edges only. Everything already passed is unreachable, whatever the walk now needs from it.

WHAT THAT COSTS TODAY.

- A signed claim sent back for rework cannot be returned to once it sits behind the walk. The driver leaves through the escape hatch to reach it, which pushes people toward correcting a claim quietly instead of through the machine.
- "Keep walking" is worthless advice when every state permitting the verb you need lies behind you. One session had to remove a single file to undo something it had just created, and no destination ahead allowed it.
- Route recovery cannot tell a walk that is progressing from one traversing the same signed states again.

WHAT DONE LOOKS LIKE.

- A route can be drawn to a state the walk has already passed, and the machine says plainly what re-entering costs.
- Recovery detects repeated traversal through unchanged signed states and aims at the first state whose claim is not yet met.
- The escape hatch stops being the way to reach ordinary work. It goes back to meaning what it says: mechanically stuck.

WHY THESE THREE ARE ONE PIECE. All three are the same missing capability seen from three places. Fixing any one alone leaves the other two, because they share the edge-drawing that only ever points onward.

## Inputs

- wt-a-signed-claim-sent-back-for-rework-cannot-be-returned-to-on
- wt-being-told-to-keep-walking-is-worthless-advice-when-every-pl
- wt-route-recovery-should-detect-repeated-traversal-through-unch
