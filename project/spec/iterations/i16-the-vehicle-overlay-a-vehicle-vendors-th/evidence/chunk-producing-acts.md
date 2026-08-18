---
form: chunk-producing-acts
by: agent
signed_off: 2026-08-18T18:57:42.314Z
authors: agent
files:
---

# Evidence form / chunk-producing-acts

## current_situation

BOTH PRODUCING ACTS WORK END TO END, and the end-to-end test the owner asked for is green. 1461 of 1462 pass; the one failure is the corpus-wide churn alarm.

### What the acts do

THE ENGINE MAKES A VEHICLE. A copy of the whole tree under a new name, in a repository of its own with one commit and no remote, carrying an upstream file that names an identity and never an address.

THE VEHICLE MAKES A PROJECT. A tree carrying none of the method, and one record saying which copy drives it, by identity and version rather than by path.

AND A TREE WITH NO RECORD IS NOT A DRIVEN PROJECT. It says so and names the record it looked for, rather than guessing.

### Two questions this chunk had to answer that its statement did not name

WHAT A COPY'S IDENTITY IS. raid-dec-a-driven-tree-names-which-copy-drives-it said in as many words that it "must be decided and has not been", and el-project-producer said the element could not be built until it was. It is decided here, because the producing act is the only thing in the system that ever mints one.

IT IS TWELVE HEX CHARACTERS, MINTED, NEVER DERIVED. A name cannot serve: two people can produce copies called Atlas, and a driven tree recording `atlas` would resolve to whichever the machine found first. That fails with a WRONG answer rather than an absent one, which is the worst of the three states the record exists to separate. Recorded as raid-dec-an-identity-is-minted-and-never-derived-from-a-name.

AND THE ELEMENT SAID "DELETE TWO FOLDERS" WHERE THE SHIPPED EXPORT DROPS THE WHOLE SPEC. The engine's spec is its expeditions, its iterations AND its trace, and the trace describes the engine's own design as much as the other two describe its work. The script has been dropping all of it in the field. The element is corrected rather than the behaviour.

### What the engine caught that a reader would not have

THREE COVERAGE CHECKS FIRED ON THE NEW VERBS. The verb count moved from 34 to 36, and both verbs were reported as named in no trace node and in no use case. That is the check working exactly as its comment says it should, and all three are now satisfied rather than silenced.

## built

### engine/produce.ts, new

- `produceVehicle` copies the tree, refuses if a `.git` survived, recreates an empty `project/spec`, writes the brand fact, renders a fresh README from the shared template, writes the upstream file, and makes one commit.
- `produceProject` writes the driven record and one commit, and mints the driving tree's own identity first if it predates the idea.
- `drivenBy` answers the three states a tree can be in, and refuses a malformed record rather than letting it read as "not a driven project".
- Both run inside `withActBound`, so every write is contained by what they produce.

### The two guards the shipped export learned by failing

BOTH TRAVEL, deliberately.

- ALL THREE ARGUMENTS ARE REQUIRED with no fallback to this product's own name, because a forgotten argument would ship it to somebody else under ours.
- `.git` IS EXCLUDED AS A FILE AS WELL AS A DIRECTORY, because a worktree checkout carries it as a file and missing that once made an export re-use the live repository.

### engine/tools.ts

BOTH ACTS ARE LANE VERBS NOW — `se_produce_vehicle` and `se_produce_project`. That is what makes them logged, refusable before they half-produce, and bounded. A script outside the lane can be none of those.

### engine/errors.ts and guidance/refusals.md

SE-C-142, the producing act stopping before it writes anything. Four things fire it, and a malformed driven record is the fifth.

### tests/produce.test.ts, new — eleven cases

THE OWNER'S END-TO-END TEST, hermetic, on the model of v1's own:

- three refusals that leave nothing behind
- a complete tree, named once, with a minted identity and a repository of its own
- the engine's records left at home and an empty place ready
- an upstream file naming an identity with no path in it
- the engine unchanged by having produced
- a project made BY the vehicle, carrying no method and one record naming it
- the three states of a driven tree, told apart
- both verbs reachable through the lane

### The trace

raid-dec-an-identity-is-minted-and-never-derived-from-a-name is new. Both use cases now name the verb that performs their first step, and both elements say how they are reached.

## follow_up

IMMEDIATELY: chunk-the-two-buttons, then RUNME losing its export.

### What the buttons need that does not exist yet

THE EXTENSION REACHES THE ENGINE OVER HTTP, through a small `api()` helper. The producing acts are lane verbs, so they are reachable over the MCP-on-HTTP endpoint the mirror already serves — the same dispatch as stdio, which is what lets a harness in the editor attach to the one walk.

WHICH OF THE TWO ROUTES THE BUTTONS TAKE IS THE FIRST DECISION of that chunk, and it is not settled here.

### The gap this chunk names rather than hides

RESOLVING AN IDENTITY TO A TREE IS NOT BUILT. Something on the machine has to hold which copies it has seen, and no such register exists. A driven record is readable and comparable but not resolvable, and `drivenBy` says so in a `why` field rather than guessing.

THAT WAS ALREADY A NAMED CONSEQUENCE of raid-dec-a-driven-tree-names-which-copy-drives-it: "a first run on an unseen machine costs a lookup, and something must hold the resolved result. That is work the winner did not otherwise need, and no criterion measures it."

READY WHEN somebody decides where that register lives, which is the same open question as where a vehicle's overlay content lives.

### Still parked

THE CHURN ALARM, 870 of 1691 against a 50 percent limit. It blocks verification and wants the owner's word.

## anything_else

### Why the identity decision was taken rather than asked

RULE 5 PREFERS SOLVING TO RECORDING. The gap was named in two nodes, both saying the work could not proceed without it, and the producing act is the only place an identity is ever created.

THE ANSWER IS REVERSIBLE AT ONE FIELD. A minted opaque value and a person-assigned one are both opaque, so every comparison in the system stays the same if the owner would rather people named their own.

WHAT WOULD CHANGE THE DECISION is somebody wanting to say which vehicle is which by looking. That is a real argument for assigned identities and it costs a question at production time, which nothing yet needs asked.

### One write a producing act makes outside what it produces

A TREE THAT PREDATES THE IDEA MINTS ITS OWN IDENTITY the first time it drives something. The engine needs that, because it was produced from nothing.

IT HAPPENS BEFORE THE BOUND OPENS and it is one field in the tree's own brand fact. req-an-act-writes-only-the-tree-it-produced allows exactly that: "the tree the act was launched from shall be unchanged, except for whatever a normal run of the system would record."

IT IS NAMED HERE because it is the one place the isolation story has an exception, and an exception nobody wrote down is how a guarantee quietly stops being one.
