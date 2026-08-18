---
form: derive-functions
by: agent
signed_off: 2026-08-18T15:01:36.825Z
reopened: "2026-08-18T15:00:12.593Z — the winner's central act had no function and no flow, and the owner ruled the copy-versus-vehicle naming, so the function structure is short two functions, four flows and a rename"
authors: agent
files:
---

# Evidence form / derive-functions

## current_situation

RE-OPENED 2026-08-18 FROM decompose-structure, and the change is larger than a rename.

### What was found

THE WINNING ARCHITECTURE'S CENTRAL ACT HAD NO FUNCTION. All 33 functions and all 59 flows were checked by a reader with a clean context. Nothing represented an update arriving at a vehicle: not a function that receives a program, runs it, or produces anything from it, and no flow for the program, the diff or the inventory.

AND THE CORPUS NAMED THE ACT WHILE HIDING IT. `flow-copy` carried the sentence "A copy taking an update pulls flow-method-sources from where it came from, by its own act" — naming an act and handing its mechanism to a crossing so nothing had to model it.

THREE USE-CASE STEPS SAT BEHIND THE HOLE. uc-vendor-and-overlay steps 6, 7 and 8, none of them reachable from any function.

### What the owner ruled

IT IS A VEHICLE AND WE ARE THE ENGINE. Their words: "It's not a copy. It's a vehicle." `bring-forth-a-copy` and `flow-copy` carried the wrong word, and the pair engine-and-vehicle names a relationship where source-and-copy names an act of duplication.

### What changed here

TWO FUNCTIONS ADDED: `take-an-update` and `report-what-the-vehicle-changed`. Three flows added: the program that arrives, the inventory of what the vehicle made its own, and the change an update left unstaged. One function and one flow renamed, with every citer patched rather than left dangling.

THE ORIGINAL JUDGMENT OF THIS STATE STILL HOLDS. Producing a vehicle and producing a driven project are two functions, and the test that separated them is what comes out. Nothing in this pass touched that.

## functions

- fn-run-a-governed-walk.bring-forth-a-vehicle
- fn-run-a-governed-walk.bring-forth-a-project
- fn-run-a-governed-walk.take-an-update
- fn-run-a-governed-walk.report-what-the-vehicle-changed
- fn-run-a-governed-walk.resolve-a-path
- fn-run-a-governed-walk.hold-the-method

## flows

- flow-vehicle
- flow-driven-tree
- flow-scaffolded-product
- flow-repository
- flow-intent
- flow-dispatched-call
- flow-worktree
- flow-resolved-target
- flow-method-sources
- flow-overlay
- flow-compiled-machine
- flow-divergence-report
- flow-update-program
- flow-vehicle-inventory
- flow-applied-change

## neutrality

THE TEST IS ONE QUESTION, asked of every function here: could two honestly different designs both do this?

### take-an-update — NEW, and the neutrality check is the reason it should have existed sooner

STATEMENT: apply upstream's later work to a vehicle's own content, and leave what it did readable before it is kept.

THREE HONESTLY DIFFERENT DESIGNS, and this iteration scored all three against each other.

- A three-way merge against a common ancestor.
- A declared patch series re-applied to a refreshed base.
- A transformation program run against whatever the vehicle now holds.

THE STATEMENT NAMES NONE OF THEM. It says apply, and leave what it did readable.

AND THAT IS THE DAMNING PART RATHER THAN THE REASSURING ONE. A statement this neutral could have been written before any candidate existed, and its absence is why M4 scored a mechanism that no function claimed. The winner won on this act by one cell while the act itself was unrepresented.

### report-what-the-vehicle-changed — NEW, three designs that differ in what the report can SAY

STATEMENT: state every path where a vehicle's content differs from the version it was built from, as what this vehicle made its own rather than as a fault.

- DERIVED FROM A COMPARISON each time, which can never be false and can never say why.
- A DECLARED LIST the owner maintains, which carries reasons and can silently stop being true.
- A DIRECTORY LISTING, where the vehicle's own content sits in its own folder and asking what changed is asking what is in it.

NOTHING IN THE FIELD DOES BOTH HALVES, which the prior-art sweep established over roughly a hundred products. That gap is what the requirement is actually asking somebody to close, and naming the function is what makes the gap visible rather than lost in a scoring cell.

THE FRAMING IS A CONTROL RATHER THAN PROSE. What did you make your own, never how far have you wandered. The second reads as damage, and a vehicle's owner changing things is the value proposition rather than a defect.

### Why these are two functions and not one

THE INVENTORY IS AN INPUT TO THE UPDATE, not a by-product of it. `req-overlay-drift-reported` clause three says the report is what makes an update DECIDABLE: it is the only thing that can say which of the vehicle's own changes an arriving update touches.

FOLDING THEM WOULD MAKE THE REPORT LOOK LIKE OUTPUT and lose that dependency. A vehicle can also ask what it changed without taking anything, which is step 8 of the use case standing on its own.

### bring-forth-a-vehicle — renamed, and the four designs are unchanged

A RENAME CHANGES NO DESIGN. Its node argues four candidates and the argument holds word for word; only the noun moved.

### bring-forth-a-project — unchanged, and its fourth candidate is still the interesting one

FOUR DESIGNS DIFFERING ON WHERE THE POINTER LIVES, one of which questions whether a pointer is needed at all. M4 chose the identity-recording one and the demand check gated three candidates out on exactly this row, so the spread was real rather than a formality.

### resolve-a-path and hold-the-method — unchanged

NEITHER MOVED. `hold-the-method` is worth one sentence though: it holds all four overlay and vendoring requirements and it is a READ-AND-COMPOSE function. Two of those requirements now also have a function that WRITES, which is the distinction this pass restored.

### The three tells, run over both new statements

- A NOUN THAT IS A PRODUCT: none. Program, content, path, version are shapes.
- A VERB THAT IS AN IMPLEMENTATION: none. Apply, leave, state. The rejected drafts said "migrate" and "diff", and both name one of the three designs.
- A FUNCTION THAT ONLY MAKES SENSE GIVEN ONE DESIGN: asked properly of both. Under the merge design, take-an-update still reads intact. Under the directory-listing design, report-what-the-vehicle-changed still reads intact.

## follow_up

IMMEDIATELY: identify-assumptions and probe-assumptions re-sign rather than change, then gate-requirements and the whole M4 and M5 chain, which fell with this state and whose content stands.

### What the re-walk should confirm rather than assume

THE CRITERIA POOL. Both new functions serve requirements that were already criteria, so the pool should not move. `req-overlay-survives-update` and `req-overlay-drift-reported` are both scored axes already.

AND THE SCORES SHOULD NOT MOVE EITHER. A function existing does not change what a candidate does; it changes whether the structure can say so. The candidates were scored on their picks and the picks are untouched.

IF EITHER MOVES, THAT IS A FINDING rather than a nuisance, and it means the scoring was leaning on something the structure did not carry.

### What decompose-structure now inherits

FOUR UNIMPLEMENTED FUNCTIONS RATHER THAN TWO. The two this iteration minted for producing, plus the two minted here. All four are in the same cluster and all four are the vendoring line.

AND ONE ELEMENT IS ALREADY WRITTEN. `el-vehicle-producer` implements `bring-forth-a-vehicle`, and `el-project-producer` implements `bring-forth-a-project` with the one cross-cluster interface finally drawn.

### Two things this pass found and did not fix

`flow-divergence-report` HAS AN EMPTY `source_refs`. Minted at i1, deriving from nothing, and its loose statement is why the drift requirement and the compile function talked past each other for three iterations.

AND THE REQUIREMENT IDS STILL SAY COPY. `req-one-command-produces-a-complete-copy` and `req-nothing-a-copy-does-reaches-its-source` carry the word the owner ruled against. They are M3's and older than this iteration; note-761dbf2a236c carries the remaining sweep.

## anything_else

THE FOLD THAT WAS NEARLY MADE, and why it was not.

ONE FUNCTION CALLED SOMETHING LIKE "bring forth a tree" would have carried both acts. They are reached the same way, bounded by the same rule, and both end with a window opening somewhere new.

THE TEST THAT SEPARATED THEM IS WHAT COMES OUT. `bring-forth-a-copy` outputs `flow-copy` — everything the system needs, able to run alone. `bring-forth-a-project` outputs `flow-driven-tree` — a place for work carrying none of the system's method.

A FUNCTION IS SOMETHING THE SYSTEM DOES FOR A REQUIREMENT, and these do different things for different requirements. Folding them would have made the shared BOUND look like a shared PURPOSE, which is how a structure quietly loses a distinction the design depends on.

AND THE FOLD WOULD HAVE COST SOMETHING SPECIFIC. The pointer is the whole of the second function and means nothing for the first. Inside a merged node it would have read as an optional facet, and M4 would have inherited a candidate space where not writing it looked like a variant rather than a design.

### What the two share, recorded so the structure says it

BOTH SATISFY req-an-act-writes-only-the-tree-it-produced. That is the shared bound, and a requirement served by two functions is not a duplicate where the two serve different acts of it.

AND bring-forth-a-project SHARES flow-scaffolded-product WITH stand-up-a-product, which is worth naming. A project can arrive two ways — installed on a bare machine, or produced by a copy that will drive it — and the structure now records that rather than implying one route.
