---
form: derive-functions
by: agent
signed_off: 2026-08-20T11:03:36.597Z
authors: agent
files:
---

# Evidence form / derive-functions

## current_situation

Eight requirements stand. This state asks what the system must DO to meet them, said without saying how.

FORTY-FOUR FUNCTIONS AND SIXTY-SEVEN FLOWS STOOD BEFORE THIS STATE. Five functions and three flows are minted here.

Four of the five sit in the-walk cluster and one in the-account, which is the honest split: four are about deciding before the work, one is about recording during it.

## functions

- fn-run-a-governed-walk.obtain-a-step-s-difficulty
- fn-run-a-governed-walk.reduce-a-milestone-to-one-difficulty
- fn-run-a-governed-walk.resolve-a-difficulty-to-a-driver
- fn-run-a-governed-walk.publish-the-driver-outward
- fn-run-a-governed-walk.stamp-who-answered-and-where

## flows

- flow-step-difficulty
- flow-driver-recommendation
- flow-call-attribution

## neutrality

THE CHECK NO CHECK CATCHES: does any of these five name a solution rather than a need?

WHAT WAS DELIBERATELY KEPT OUT OF THE WORDING.

- "obtain a step's difficulty" rather than "read the complexity key". A later design may DERIVE the value from what will judge the step's output instead of taking a typed one — which is the strongest recommendation this iteration's own prior-art scan produced — and that design satisfies this function unchanged. Naming the key would have written the fixed table into the function layer, where it does not belong.
- "reduce a milestone to one difficulty" rather than "take the maximum". The maximum is the requirement's answer, not the function's. If the reduction ever becomes something else, the function survives.
- "resolve a difficulty to a driver, from one standing mapping" rather than "look the rung up in the list". What the mapping holds is genuinely undecided — a vendor name, a capability word, or a row wide enough to differ by host — and the function is neutral across all three.
- "publish outward" rather than "put a model name on the pull". The pull is the mechanism that exists; the need is that a reader can reach it.

WHERE NEUTRALITY IS IMPERFECT AND I AM SAYING SO RATHER THAN CLAIMING OTHERWISE.

flow-step-difficulty's statement says "as the step itself declares it", which encodes the declared-versus-derived choice into the FLOW. That is a design decision sitting in the function layer. I have left it because the alternative — a flow neutral about where the value comes from — would make the constraint that it never enters the demand ledger unstatable, and that constraint is the one guarding three open pinned records. IT IS A KNOWN IMPURITY WITH A NAMED REASON, which is the honest form.

fn-...stamp-who-answered-and-where names TWO things in one function, and a stricter reading would split it. It stays one because the two coordinates are worthless apart and the requirement says the record grows both or neither — splitting the function would invite building half.

THE TEST I APPLIED: could a completely different implementation satisfy these five? Yes — a derived rating, a capability-word mapping, a published value on any channel, and a call record of any shape carrying two fields. That is the bar, and four of the five clear it cleanly.

## follow_up

- THE NEUTRALITY IMPURITY IN flow-step-difficulty IS THE ONE THING TO REVISIT AT M4. If the design state adopts the derive-from-a-declared-checker candidate, that flow's statement must change with it, and it is the only artifact in this milestone that would.

- fn-...publish-the-driver-outward TAKES flow-instruction AS ITS OUTPUT, which is the existing flow for what a pull hands back. That is reuse rather than a new channel, and it is the right answer only for as long as the pull is where a receiver looks. se-pty's keystroke channel is the standing alternative and it is not modelled here.

- NO FUNCTION COVERS MAINTAINING THE MAPPING, for the same reason no use case does: the actor has no node. The function layer inherits the hole rather than papering over it with a function nobody performs.

## anything_else

