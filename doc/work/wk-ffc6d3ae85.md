---
id: wk-ffc6d3ae85
seq: 1000226
type: work
title: the spent ticket refusal
status: spec_open
assignee: main
scope: single-step
traced: true
minted_by: rev-31
---

## detail

After `se work --on <id>`, one product write is allowed and the second is refused with the no-token refusal, which ends by telling the actor to mint one. At that moment the actor holds the token in imp_in_work. The menu lists only ImpOpen and SpecOpen tokens, so the id it must name is missing. Make the refusal distinguish the two states. With a hand and a spent ticket it names the id, says `se work --on wk-xxxx --by main` again, and lists what the actor holds in work. With no hand at all it says what it says today. Check: a fixture arms a ticket, spends it on one product write, and requires the second refusal to carry the id in hand.
