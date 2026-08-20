---
form: derive-functions
by: agent
signed_off: 2026-08-20T11:39:45.220Z
reopened: "2026-08-20T11:39:18.684Z — its neutrality section admitted one impurity and missed two, and a typing defect stood under it: reduce-a-milestone declared the same flow as input and output"
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

THE TEST I APPLIED: could a completely different implementation satisfy these? THE FIRST ANSWER WAS "four of the five clear it cleanly" AND IT OVERSTATED BY ONE. An adversarial pass found two more impurities this section had missed while it was congratulating itself on admitting one.

SECOND IMPURITY, NOW ADMITTED. `resolve-a-difficulty-to-a-driver` says "from one standing mapping", which commits to the fixed-table decision — a runtime router or a per-host resolver cannot satisfy it. This section listed that phrase among the NEUTRAL ones, and its own test varied only what the mapping HOLDS, never whether there is one standing mapping at all. The commitment stays, because the requirement it serves makes it explicitly and a function neutral about it could be traced to nothing. But it is an impurity and it is named on the node now.

THIRD IMPURITY, AND IT IS THE SUBTLE ONE. This section claimed the pull was kept out — "publish outward" rather than "put a model name on the pull". The STATEMENT does avoid it. The NODE declares `outputs: flow-instruction`, which this form's own follow-up calls the flow a pull hands back. THE PULL IS WIRED IN THROUGH THE OUTPUT TYPE while the prose says it was kept out, and the disclosure sat two sections away in the same form.

SO THE HONEST TALLY IS THREE IMPURITIES IN FIVE FUNCTIONS: one admitted at first writing, two found by somebody else. THE PATTERN IS WORTH MORE THAN THE COUNT — a neutrality check run by the author of the thing being checked found the impurity it had already decided to accept and missed the two it had not thought about.

AND A TYPING DEFECT STOOD UNDER THIS SECTION with no reading catching it. `reduce-a-milestone-to-one-difficulty` declared `flow-step-difficulty` as both its input and its output, so a milestone maximum travelled typed as a step-level value and the reduction was invisible. `flow-milestone-difficulty` now exists and carries the spread with it. A section claiming the layer was checked for exactly this class did not check the types.

## follow_up

- THE NEUTRALITY IMPURITY IN flow-step-difficulty IS THE ONE THING TO REVISIT AT M4. If the design state adopts the derive-from-a-declared-checker candidate, that flow's statement must change with it, and it is the only artifact in this milestone that would.

- fn-...publish-the-driver-outward TAKES flow-instruction AS ITS OUTPUT, which is the existing flow for what a pull hands back. That is reuse rather than a new channel, and it is the right answer only for as long as the pull is where a receiver looks. se-pty's keystroke channel is the standing alternative and it is not modelled here.

- NO FUNCTION COVERS MAINTAINING THE MAPPING, for the same reason no use case does: the actor has no node. The function layer inherits the hole rather than papering over it with a function nobody performs.

- RE-EARNED AFTER THE PER-COLUMN PROBE. Two nodes changed and the function set did not: flow-step-difficulty and fn-...obtain-a-step-s-difficulty are now keyed to the change size being walked rather than to the row. The other four functions are unaffected, because a reduction, a lookup, a publication and a stamp do not care where the number came from.

- THAT IS THE NEUTRALITY CHECK PAYING OFF RATHER THAN AN ACCIDENT. The impurity this form admitted was that flow-step-difficulty encoded "declared" into the flow layer. The correction landed on exactly that flow and on the one function that reads it, and nothing else in the layer moved.

- RE-EARNED AT M4 AFTER derive-criteria ADDED A REQUIREMENT, and the first attempt at this paragraph was wrong in a way worth keeping. It argued that req-a-machine-decision-repeats needs NO function, because repeatability is a property of the chain rather than a thing any link does. THE ENGINE REFUSED THE FORM: every requirement is covered by a function, and nothing in the corpus refined it.

- THE CHECKER WAS RIGHT AND THE PROSE WAS A RATIONALISATION. Every standing quality axis is satisfied by a function — one-second answers by serve-a-step, every-call-logged by keep-the-record, audit-from-log by the same. There was no reason mine should be the exception except that I had not decided where it belonged.

- IT BELONGS ON TWO. fn-...resolve-a-difficulty-to-a-driver is where repeatability is true or false: the others read, reduce and publish, and this one turns an input into the decision. fn-...publish-the-driver-outward carries the second half — recording what was read, without which an answer that repeats is reproducible only by luck.

- THIS IS THE MECHANICAL-CHECK ARGUMENT LANDING ON ITS AUTHOR, which is worth more than another example of it landing on somebody else. A coverage rule the engine enforces caught a coverage gap I had just written a paragraph excusing.

- RE-SIGNED AFTER AN ADVERSARIAL PASS. Two missed impurities are now named, a fourth flow is minted, and the reduction emits a different flow from the one it consumes.

- ONE REQUIREMENT ARRIVED FROM UPSTREAM AND NEEDED COVERING: req-a-weaker-driver-than-named-owes-a-recorded-reason, from the extension the completeness criterion had skipped. It hangs on fn-...stamp-who-answered-and-where, which is where the record grows a field the server knows about the call.

## anything_else

