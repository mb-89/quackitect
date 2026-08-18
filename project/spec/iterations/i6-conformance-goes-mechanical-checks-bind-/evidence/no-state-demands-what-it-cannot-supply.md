---
form: no-state-demands-what-it-cannot-supply
by: agent
signed_off: 2026-08-16T18:00:02.106Z
authors: agent
files: null
---

# Evidence form / no-state-demands-what-it-cannot-supply

## current_situation

A STATE DECLARES TWO THINGS THAT HAVE TO AGREE, AND NOTHING CHECKED THAT THEY DID.

One is legal_tools: what may be called while standing there. The other is its evidence form: what must be produced before it completes.

WHERE THEY DISAGREE, THE WALK HAS NO LEGAL MOVE. The form asks for something, every verb that could make it is refused, and the only ways out are an escape or the shell. Both are failures, and both are invisible to the engine because they happen outside it.

LIVED TWICE. observe-red's whole job is watching new checks fail, and it could not call the test verb; the agent reached for the shell. And every gate asks raid_additions — name the register entries this review added — while nine of ten gates granted no verb that can mint one.

## built

THE COMPILE NOW REFUSES A STATE THAT DEMANDS WHAT IT CANNOT SUPPLY.

NEW: engine/machines/supply.ts.

- supplyGaps(root, machine) returns one gap per state/field pair, each naming the demand in the words of its own declaration and the verbs that would close it.
- assertCanSupply throws with all of them at once.

WHAT COUNTS AS A DEMAND, read from declarations and never from prose.

- A field whose form template declares resolves: artifact (the named trace nodes must exist) or resolves: file (the named paths must exist on disk).
- A field typed files or run_ref.

A state saying "run the tests" in a guidance sentence is not a declaration. Guessing at sentences is how a check of this shape starts refusing correct machines.

WHAT IS DELIBERATELY NOT A DEMAND.

- A derived field. The engine computes it and refuses a hand-written value. verification grants no test verb on purpose, because its battery is fired by its own exit script.
- An optional field. Nothing is owed.
- legal_tools: all. That is the whole lane, carried as a literal word.

WIRED AT BOTH COMPILE PATHS: compileColumn in rigor-matrix.ts, and compileMachine in machines/compile.ts. RigorMatrix gained a root field so the column compile can resolve a template without a second root being threaded through every caller.

MEASURED BEFORE IT WAS ALLOWED TO REFUSE. engine/bin/supply-gaps.ts reports rather than throws, and it ran first — because a check that refuses has to be measured before it is armed. If it bites a correct machine, finding that out at boot is finding it out too late.

THE FIRST RUN FOUND 29 state/field pairs across patch, minor, major and product. Every one the same shape: a gate asked to name the register entries its own review added, with no verb that can mint one. gate-kickoff already had the write verbs and was correctly never flagged — which is what showed the rule was discriminating rather than blanket.

THE NINE GATES WERE GRANTED se_file_write AND se_file_patch. The owner's ruling on raid_additions is explicit that the entry is recorded AT the gate: "Waiting for the state that owns the register is how an entry is lost." A gate that cannot write cannot obey it. Re-measured: 0 gaps everywhere.

NINE CASES in deliverable/tests/supply-gap.test.ts. Six pin arms that must NOT fire — that is where a check like this goes wrong. The last compiles every live column and asserts no gaps; it is the case that would have caught the 29.

RUN: 9 of 9 pass.

MINTED: req-no-state-demands-what-it-cannot-supply, refining uc-take-a-step, and tsp-supply-gap.

## follow_up

THE RULE IS NARROWER THAN THE CHUNK'S SENTENCE. It reads two declarations — a template's resolves, and the files/run_ref field types. It cannot see a demand stated only in guidance prose, and it must not: a check that reads sentences refuses correct machines.

NO LIVE FIELD IS TYPED files OR run_ref. Both arms are covered by fixtures only. The typing work sits half-done in project/spec/evidence-typing-prefill.md, and those arms go from theory to bite the day it lands.

A GATE CAN NOW WRITE. That is a real widening of what a gate may do, made because the method's own ruling demands it. If the owner wants a gate narrower, the honest fix is a verb that mints a register entry and nothing else — not taking the demand away, which would lose entries.

FOUR RUNS WENT THROUGH se_run UNDER no_tool_reason across chunks twelve and thirteen, each reason logged. The se_test deadlock is what forces it, and chunks eight and nine already deleted that deadlock; the replacement cannot load until idle.

CHUNK FOURTEEN IS NEXT: the-cloud-start-reads-trunk.

## anything_else

