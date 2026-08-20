---
form: derive-functions
by: agent
signed_off: 2026-08-20T19:10:15.254Z
reopened: "2026-08-20T19:10:07.906Z — write-requirements was re-signed: a tenth requirement stands, req-every-call-records-the-part-its-caller-played, and req-acts-carry-role-and-channel's role vocabulary is corrected. Re-read against that."
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

### Re-earned 2026-08-20, after write-requirements was re-signed

THREE MUSTS WERE RESTATED TO NAME OUTCOMES INSTEAD OF MECHANISMS, and this layer had copied the mechanisms down. Four nodes moved.

- `obtain-a-step-s-difficulty` ended "from the step's own declaration rather than from a judgment made at the time". Now: for every step that applies, refusing loudly where it cannot be obtained.
- `reduce-a-milestone-to-one-difficulty` said "the single difficulty that milestone needs". Now: never weaker than any of them, and the spread kept.
- `resolve-a-difficulty-to-a-driver` said "from one standing mapping". Now: the same way on every supported host.
- `flow-step-difficulty` said "as the step itself declares it". Now it says how hard the work is, and nothing about where the number came from.

TWO OF THE THREE ADMITTED IMPURITIES BELOW ARE GONE AS A RESULT, and neither was repaired by argument. Each was a mechanism this layer had inherited from a requirement, and it left when the requirement let go of it.

THAT IS THE FINDING WORTH KEEPING. An impurity in the function layer is usually a copy of one upstream. The neutrality check here could name it and could not remove it, because the trace would break; only the requirement moving freed it.

### What was deliberately kept out of the wording

- "obtain a step's difficulty" rather than "read the complexity key". A later design may DERIVE the value from what will judge the step's output instead of taking a typed one — the strongest recommendation this iteration's prior-art scan produced — and that design satisfies this function unchanged.
- "reduce to one difficulty" rather than "take the maximum". The maximum is one way to be no weaker than any step; driving everything at the top rung is another. Both satisfy the restated must, so the function names neither.
- "resolve a difficulty to a driver" rather than "look the rung up in the list". What the mapping holds, and whether there is a standing mapping at all, is now genuinely undecided.
- "publish outward" rather than "put a model name on the pull". The pull is the mechanism that exists; the need is that a reader can reach it.

### Where neutrality is still imperfect

`fn-...stamp-who-answered-and-where` names TWO things in one function, and a stricter reading would split it. It stays one because the two coordinates are worthless apart and the requirement says the record grows both or neither. Splitting the function would invite building half.

`flow-instruction` on `publish-the-driver-outward` is this form's own follow-up's "the flow a pull hands back". The statement avoids the pull; the OUTPUT TYPE wires it in. That impurity is unchanged by the restatement, because no must was hiding under it — it is this layer's own.

SO THE HONEST TALLY IS NOW TWO IMPURITIES IN FIVE FUNCTIONS, down from three, and the one that left with the requirements is not to this section's credit.

### The history this section keeps, because the pattern outlives the count

THE FIRST ANSWER WAS "four of the five clear it cleanly" AND IT OVERSTATED BY ONE. An adversarial pass found two more impurities this section had missed while it was congratulating itself on admitting one. A neutrality check run by the author of the thing being checked found the impurity it had already decided to accept and missed the two it had not thought about.

AND A TYPING DEFECT STOOD UNDER THIS SECTION with no reading catching it. `reduce-a-milestone-to-one-difficulty` declared `flow-step-difficulty` as both its input and its output, so a milestone maximum travelled typed as a step-level value and the reduction was invisible. `flow-milestone-difficulty` now exists and carries the spread with it. A section claiming the layer was checked for exactly this class did not check the types.

### Rechecked again 2026-08-20, after the live-read must was restated

WHAT MOVED: `req-the-complexity-value-is-read-live-and-never-pinned` dropped "shall be read from the matrix at the moment it is needed". What it demands now is that a step's complexity stay out of every record's demand ledger.

NO NODE IN THIS LAYER MOVED WITH IT, and the reason is that the clause which left had already been stripped from here an hour earlier. `obtain-a-step-s-difficulty` lost "from the step's own declaration" when its other requirement was restated, and `flow-step-difficulty` lost "as the step itself declares it" at the same time. Neither ever carried the timing clause.

ONE SENTENCE ON THE FLOW IS NOW EXACTLY THE DEMAND RATHER THAN AN ECHO OF IT. `flow-step-difficulty` says "IT NEVER ENTERS A RECORD'S DEMANDS. It is a hint about who should drive, not a claim anything rests on." That was written as rationale beside a requirement demanding more. It is now the whole requirement, word for word in substance.

THE TALLY OF TWO IMPURITIES IS UNCHANGED. Neither of the two — the double duty on `stamp-who-answered-and-where`, and `flow-instruction` wiring the pull in through an output type — has a requirement under it.

### And once more, after the sizing must was corrected

`req-a-milestone-takes-the-maximum-complexity-over-its-rows` was restated a second time. Its first restatement said the ENGINE walks no step by a weak driver, which claims an act `req-the-machine-names-a-driver-and-starts-nothing` forbids the lane from having.

THIS LAYER HAD COPIED THAT DOWN TOO, within the hour. `reduce-a-milestone-to-one-difficulty` said the steps are "driven at" the reduced difficulty. It now says "sized together" and "published for them".

THAT IS F32'S PATTERN A SECOND TIME AND IT IS WORTH THE REPEAT. The function layer copies whatever the requirement layer says, including a fresh error made one state earlier. The copy took under an hour and needed no argument in either direction.

WHAT IT ARGUES FOR: checking the function layer AFTER every requirement change, not only after the ones that look like repairs. This one looked like a repair and carried a new defect.

### The layer above this one had the same defect and was repaired last

`uc-let-the-machine-name-the-driver` carried the seed mechanism in its own steps. THIS STATE ARGUES NEUTRALITY HARD AND SAYS WHY — a function naming a technology collapses M4 space to one point before anybody compared anything — and nothing in the method puts that question to a use case, which sits above both.

SO THIS LAYER WAS CHECKED FOR EXACTLY THE DEFECT ITS SOURCE CARRIED, and passed, because it had faithfully copied a source nobody was checking. The test that would have caught it upstream is the one written into this state guidance: could two honestly different designs both do this?

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

