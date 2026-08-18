---
form: the-ripple-names-its-root
by: agent
signed_off: 2026-08-16T17:48:41.682Z
authors: agent
files: null
---

# Evidence form / the-ripple-names-its-root

## current_situation

THE REFUSAL NAMED THE FIRST HOP AND CALLED IT THE CAUSE.

A fallen claim usually fell because ITS input fell, and that one because its own did. The fallen-input refusal named the immediate feeder, and picked its repair verb by asking that feeder whether its content still passed.

So the answer was right about the wrong subject. A reader amended a state that was merely waiting, watched nothing change, and asked again.

LIVED IN THIS ITERATION, 2026-08-16: a value outside its vocabulary trapped this walk for ELEVEN calls, four states later. Three amends were aimed at states that were fine. se_why found it in two calls.

THAT GAP WAS THE REAL DEFECT. se_why already walked the chain. It did so by PARSING state names out of one blocker's sentence, and it read only the unsigned-feeder kind — so a walk held by a ripple was told the work was here while the work was three states upstream.

## built

THE RIPPLE NOW WALKS TO ITS ROOT, AND THE NAMES TRAVEL AS DATA.

fallenChain() in engine/machine.ts. From a state, follow fallen claim-bearing feeders upward until one has no fallen input of its own. That is the ROOT — where work has to happen. Everything between it and here is waiting.

- It returns the roots AND the path, root first, so a reader sees how a state four hops away is the reason this one will not go.
- A cycle returns no root and terminates. The caller falls back to naming the first hop, which beats silence.
- Transparent states are looked through, never named. start carries no claim, so pointing a reader at it would point at nothing to fix.

IT LIVES IN machine.ts BECAUSE IT IS GRAPH ARITHMETIC. It began as a private method on Session and moved out, which is also what makes it drivable by a fixture instead of a booted session.

THE BLOCKER CARRIES ITS UPSTREAM AS A LIST. Blocker gained `states?: string[]`. Both the unsigned-feeder and fallen-input blockers set it.

SO THE CHAIN WALK BEHIND se_why READS A FIELD, not a sentence. It stripped a prefix off `got` and split on commas, and it filtered to one blocker kind. It now follows both kinds off `states`.

THE REFUSAL SHOWS THE CHAIN. The fallen-input `got` names the immediate inputs, then THE CHAIN STARTS AT <root>, then the path, then the sentence that fixing anything between changes nothing.

THE VERB IS PICKED FOR THE ROOT, not the first hop. fallenRemedy is asked about the root now.

A THIRD CASE APPEARED WITH IT. The first hop is always a state the walk has been through, so it always had a form to amend. A ROOT NEED NOT HAVE ONE — the honest reason a chain starts somewhere is often that nobody has walked there yet. se_amend on a form that was never submitted patches nothing and reads as a refusal. An unsigned root now gets se_aim {to, go: true}: go there and fill it.

SEVEN CASES in deliverable/tests/ripple-root.test.ts, against hand-built machines: a four-state chain, the path, a root that already stands, nothing fallen, two independent branches, a cycle, and a transparent start.

RUN: 7 of 7 pass.

CHUNK TEN WAS CORRECTED HERE. Running its cases for the first time showed the schema's generic required-args check firing ahead of the handler, answering `depends_on: "<value>"`. That is precisely the failure that row exists to prevent. The key came off both `required` arrays; requiredDependsOn is the single enforcement point. Its evidence is amended and says so. 6 of 6 pass.

## follow_up

THE RED WAS NOT OBSERVED FOR THIS CHUNK. The walk landed in session.ts before the cases were written, so the seven cases were green the first time they ran. That is a deviation from test-first and it is recorded here rather than glossed. The chunks before it were written the right way round.

THREE RUNS WENT THROUGH se_run UNDER no_tool_reason, and each reason is logged. SE-C-112 refuses an agent-initiated battery here; SE-C-131 answers the scoped run with 42 distinct files and orders the battery. Each names the other. Chunks eight and nine deleted that deadlock and the replacement cannot load until idle. The escape answered a real question and found a real defect — chunk ten's remedy — which the deadlock would otherwise have hidden until verification.

A REQUIRED-ARGS SCHEMA ENTRY PRE-EMPTS A VERB'S OWN REFUSAL. That is general, not specific to the seed. Any verb whose refusal needs to teach something must not list that argument as schema-required. Written beside both seed verbs; it belongs in guidance at the retro.

CHUNK THIRTEEN IS NEXT: no-state-demands-what-it-cannot-supply.

## anything_else

