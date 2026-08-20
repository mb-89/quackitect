---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: dsp-the-three-coordinates-on-a-call
type: "[[design-spec]]"
statement: how a call record grows the model that answered, the state the walk stood in and the part its caller played — declared where the server cannot see, marked where it cannot be checked
realizes:
  - el-account
files:
  - project/deliverable/engine/calllog.ts
  - project/deliverable/engine/tools.ts
  - project/deliverable/engine/query.ts
---

## Three coordinates, and they ship together

THE RECORD GROWS ALL THREE IN ONE EDIT OR IT GROWS NONE.
`req-every-call-records-the-state-it-was-made-in` carries that as a rule, and
the reason is that shipping one alone looks like progress and moves nothing.
"This model answered 190 calls" and "190 calls happened somewhere" are the same
non-answer from two directions, and "an agent made all of them" is a third.

## Which of the three the server can see

ONE OF THREE. The STATE is known where the call is served — the same place the
acting role is already stamped, and for the same stated reason: the code that
knows writes it, and nothing downstream infers it.

THE MODEL IS NOT. `engine/mcp.ts` carries a `clientInfo` with a name and a
version and no model, so the only party who knows what answered is the party
being measured.

THE PART PLAYED IS NOT EITHER, AND FOR A SHARPER REASON.
`engine/tools.ts` stamps `actor: "agent"` on every lane call it serves, so a
guide working the lane is indistinguishable from the walker. And where the
walker RELAYS a guide's work rather than the guide filing it, there is no call of
the guide's for the server to stamp at all.

## The state is a field, not an argument

IT MUST BE A FIELD ON THE RECORD. The state rides inside a narration record's
arguments today and grouping cannot reach it, which is why the retro's per-step
cost column has stood documented as impossible since 2026-08-17.

HOW ITS ABSENCE IS ESTABLISHED, because this iteration got it wrong once: read
the record's own declaration. Grouping by a missing key returns a single bucket,
and so does grouping by any word at all — `group_by: "banana"` returns the
same. The absence is real; a grouping is not what establishes it.

## The role vocabulary is closed and it is not two values

`req-acts-carry-role-and-channel` has demanded a fixed role vocabulary since
i1, and its Detail fixed it at `(owner, agent)`. That list was wrong twice
over: the shipped code carries three — `human | agent | ui` — and no value in
either list can tell two agents apart.

CLOSED IS THE PROPERTY WORTH KEEPING. Two was never the property. The vocabulary
must be able to express the hand that holds the walk and a hand it delegated to
as DIFFERENT parts, or the log cannot answer the question the whole arrangement
is judged by.

A VALUE OUTSIDE THE VOCABULARY IS REFUSED. An open vocabulary makes every count
a guess about what the words meant that day.

## The part comes from the work's author

NOT FROM WHOEVER MADE THE CALL. Both arrangements the owner ruled legal are
covered by that one sentence.

- THE GUIDE WORKS THE LANE ITSELF. It is the author and the caller, and the
  record carries its part.
- THE WALKER RELAYS THE GUIDE'S WORK. The walker is the caller and the guide is
  the author, and the record carries the GUIDE'S part.

THE THIRD ARRANGEMENT IS THE FAILURE. A walker filing a guide's judgment under
its own name erases exactly what the coordinate is being added to hold, and
`raid-risk-a-relayed-judgment-is-filed-under-the-hand-that-relayed-it` stands
at `expected` because the relay is the cheaper path and nothing makes it
declare itself.

## The two claimed values carry a mark

A FIELD THAT READS LIKE AN OBSERVATION AND IS A CLAIM IS WORSE THAN AN EMPTY
FIELD, because nobody knows to doubt it. The model and the part are both
self-reported, so both are marked as such.

WHAT WOULD TAKE THE MARK OFF: the value arriving from whatever performed the
spawn, which knows what it started and is not the party being measured. That
party is the walking agent and it is inside our walk — so the mark comes off
when the spawn reports, not when a different party is built.

## The model does not stand in for the part

`project/guidance/method/subagents.md` § Which model, under an owner grant of
2026-07-11: mechanical work rides a lower tier, JUDGMENT WORK INHERITS THE
SESSION MODEL.

SO A GUIDE CAN CARRY THE WALKER'S OWN MODEL NAME, and grouping the log by model
returns one bucket where two hands worked. That is why the part is a third
coordinate rather than a detail of the first.

## The prefix rule stays as the fallback and for nothing else

THE READER STOPS GUESSING. The feed drew the acting role from a tool's NAME
prefix, which was wrong for 52 records in one measured window and is wrong by
construction for every server-side tool added since.

HISTORY CANNOT BE RESTAMPED. Records written before a field existed keep the
fallback, and a fix that dropped it would rewrite what it cannot know.
