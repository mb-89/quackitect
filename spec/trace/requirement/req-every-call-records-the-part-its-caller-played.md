---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: req-every-call-records-the-part-its-caller-played
type: "[[requirement]]"
statement: When the lane records a call, the record shall carry the part its caller played from a closed vocabulary that tells the hand holding the walk apart from a hand it delegated to, and shall carry that part on relayed work as the delegate's rather than the relayer's.
kind: functional
verify_method: test
breaks_if_removed: A walk driven by two hands leaves a log that says it was driven by one, so nobody can tell whether asking a strong hand for the hard steps paid for itself. That is the arrangement this whole line of work exists to make cheap, and it would ship unmeasurable.
breaks_how_badly: crippling
refines:
  - uc-attribute-a-finished-walk
source_refs:
  - uc-attribute-a-finished-walk step 4
  - uc-attribute-a-finished-walk ext 4a
  - uc-attribute-a-finished-walk ext 4b
  - uc-attribute-a-finished-walk ext 4c
  - nbr-the-driver-that-performs-the-spawn
  - deliverable/engine/calllog.ts:22
  - "guidance/method/subagents.md: Which model"
priority: must
weighs_against:
  - req-acts-carry-role-and-channel > — that one demands a part be stamped at all and this one says the vocabulary must be able to express the parts that actually exist; its Detail fixes the vocabulary at two values and is the thing this row corrects
---

## Detail

THE VOCABULARY STAYS CLOSED AND STOPS BEING TWO VALUES.
`req-acts-carry-role-and-channel` already demands a fixed role vocabulary, and
its Detail fixes it at `(owner, agent)`. The shipped code carries three —
`engine/calllog.ts:22` declares `actor` as `human | agent | ui` — and none of
the three can tell two agents apart. Closed is the property worth keeping. Two
was never the property.

RELAYED WORK IS THE HARD CASE AND IT IS PART OF THE DEMAND. A guide may work
the lane itself, and then there is a call to stamp. A guide may instead hand its
answer back and let the walker file it, and then there is no call of its own at
all. The second case is the common one and it is the one that loses the
attribution outright.

SO THE PART IS DECLARED BY THE CALLER, NOT INFERRED AT THE SERVER. The
dispatcher cannot see it: it serves both hands through one path and stamps both
`agent`. This is the same position the model coordinate is in, and it takes the
same mark — self-reported until it arrives from whatever performed the spawn,
which knows what it started and is not the party being measured.

AND THE MODEL IS NOT A PROXY FOR THE PART.
`guidance/method/subagents.md` § Which model, under an owner grant of
2026-07-11, says judgment work INHERITS the session model. A guide can therefore
carry the walker's own model name, and grouping the log by model returns one
bucket where two hands worked.

THE THIRD COORDINATE SHIPS WITH THE OTHER TWO.
`req-every-call-records-the-state-it-was-made-in` says the record grows its
missing fields in one edit or grows none of them. This row joins that set rather
than queueing behind it.

## Scenario

- source: a walking agent, or a delegate it asked for a step
- stimulus: a call reaches the lane, or a delegate's work is filed by the walker on its behalf
- artifact: the call record
- environment: every walk, attended and unattended
- response: the record carries the part the work's author played, from the closed vocabulary
- response measure: recorded calls carrying a part = every call; calls whose part is `agent` or absent = 0; delegated work filed under the relayer's part = 0
